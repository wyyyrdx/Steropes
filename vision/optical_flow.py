"""Sparse Lucas–Kanade optical flow.

``motion_intensity`` is a normalized mean feature displacement in ``[0, 1]``.
It describes camera / scene motion. It is **not** a confidence score and
must not be averaged with ``detection_confidence`` or ``tracking_consistency``.

Unsafe / unusable cases return ``valid=False`` and ``motion_intensity=0.0``:
  * first frame (no previous image)
  * missing previous frame after ``reset()``
  * invalid / empty frames (caller should not invoke this)
  * insufficient feature points
  * Lucas–Kanade produced too few tracked points
"""

from __future__ import annotations

from typing import Any

import numpy as np

from vision.config import VisionConfig
from vision.numeric import clamp01, finite_float
from vision.quality import to_gray_u8
from vision.types import OpticalFlowSignal


class OpticalFlowEstimator:
    """Stateful sparse optical-flow estimator. Call ``reset()`` after reposition."""

    def __init__(self, config: VisionConfig) -> None:
        self.config = config
        self._prev_gray: np.ndarray | None = None
        self._prev_points: np.ndarray | None = None

    def reset(self) -> None:
        self._prev_gray = None
        self._prev_points = None

    def update(self, frame: Any) -> OpticalFlowSignal:
        import cv2

        gray = to_gray_u8(frame)
        if self._prev_gray is not None and self._prev_gray.shape != gray.shape:
            self.reset()

        if self._prev_gray is None:
            self._prev_gray = gray
            self._prev_points = self._detect_features(gray)
            count = 0 if self._prev_points is None else int(self._prev_points.shape[0])
            return OpticalFlowSignal.invalid("first_frame", feature_count=count)

        prev_points = self._prev_points
        if prev_points is None or len(prev_points) < self.config.flow_min_points:
            refreshed = self._detect_features(self._prev_gray)
            if refreshed is None or len(refreshed) < self.config.flow_min_points:
                self._prev_gray = gray
                self._prev_points = self._detect_features(gray)
                count = 0 if refreshed is None else int(len(refreshed))
                return OpticalFlowSignal.invalid("insufficient_features", feature_count=count)
            prev_points = refreshed

        next_points, status, _errors = cv2.calcOpticalFlowPyrLK(
            self._prev_gray,
            gray,
            prev_points,
            None,
            winSize=(self.config.lk_win_size, self.config.lk_win_size),
            maxLevel=self.config.lk_max_level,
            criteria=(
                cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT,
                self.config.lk_max_count,
                self.config.lk_epsilon,
            ),
        )
        if next_points is None or status is None:
            self._prev_gray = gray
            self._prev_points = self._detect_features(gray)
            return OpticalFlowSignal.invalid("flow_failed", feature_count=int(len(prev_points)))

        good = status.reshape(-1) == 1
        tracked = int(np.count_nonzero(good))
        if tracked < self.config.flow_min_points:
            self._prev_gray = gray
            self._prev_points = self._detect_features(gray)
            return OpticalFlowSignal.invalid("insufficient_tracked_points", feature_count=tracked)

        prev_good = prev_points.reshape(-1, 2)[good]
        next_good = next_points.reshape(-1, 2)[good]
        deltas = next_good - prev_good
        magnitudes = np.linalg.norm(deltas, axis=1)
        magnitudes = magnitudes[np.isfinite(magnitudes)]
        if magnitudes.size == 0:
            self._prev_gray = gray
            self._prev_points = self._detect_features(gray)
            return OpticalFlowSignal.invalid("non_finite_flow", feature_count=tracked)

        mean_magnitude = finite_float(float(np.mean(magnitudes)))
        ref = max(1e-6, self.config.flow_magnitude_ref)
        intensity = clamp01(mean_magnitude / ref)

        self._prev_gray = gray
        refreshed = self._detect_features(gray)
        self._prev_points = refreshed if refreshed is not None else next_good.reshape(-1, 1, 2)
        return OpticalFlowSignal.measured(mean_magnitude, tracked, intensity)

    def _detect_features(self, gray: np.ndarray) -> np.ndarray | None:
        import cv2

        points = cv2.goodFeaturesToTrack(
            gray,
            maxCorners=self.config.flow_max_corners,
            qualityLevel=self.config.flow_quality_level,
            minDistance=self.config.flow_min_distance,
            blockSize=self.config.flow_block_size,
        )
        return points
