"""Frame-to-frame tracking consistency in ``[0, 1]``.

The score measures temporal stability of the *same* target. It is not a
detection confidence and is not an optical-flow magnitude.

Signals used:
  * persistence — how often the same class is present in the window
  * IoU continuity — overlap of consecutive boxes
  * sudden movement — large centroid jumps lower the score
  * intermittency — detect/miss flicker lowers the score
  * disappearance — a miss after a track lowers persistence / continuity
"""

from __future__ import annotations

import math
from collections import deque
from dataclasses import dataclass

from vision.config import VisionConfig
from vision.numeric import clamp01
from vision.types import BBox, Detection


@dataclass(frozen=True, slots=True)
class TrackObservation:
    detected: bool
    target_class: str | None
    bbox: BBox | None


class TrackingConsistency:
    """Stateful tracker. Call ``reset()`` after a Tier 2 camera reposition."""

    def __init__(self, config: VisionConfig) -> None:
        self.config = config
        self._history: deque[TrackObservation] = deque(maxlen=max(2, config.track_window))
        self._last_score = 0.0

    def reset(self) -> None:
        self._history.clear()
        self._last_score = 0.0

    @property
    def history_size(self) -> int:
        return len(self._history)

    def update(self, detection: Detection, frame_shape: tuple[int, ...] | None = None) -> float:
        observation = TrackObservation(
            detected=detection.has_target,
            target_class=detection.target_class if detection.has_target else None,
            bbox=detection.bbox if detection.has_target else None,
        )
        self._history.append(observation)
        self._last_score = self._score(frame_shape)
        return self._last_score

    def _score(self, frame_shape: tuple[int, ...] | None) -> float:
        history = list(self._history)
        if len(history) < self.config.track_min_frames:
            return 0.0

        reference_class = _reference_class(history)
        if reference_class is None:
            return 0.0
        persistence = _persistence(history, reference_class)
        mean_iou = _mean_consecutive_iou(history)
        motion_stability = _motion_stability(history, frame_shape, self.config.jump_distance_frac)
        continuity = 1.0 - _intermittency(history)

        weights = (
            self.config.track_w_persistence,
            self.config.track_w_iou,
            self.config.track_w_motion,
            self.config.track_w_continuity,
        )
        weight_sum = sum(weights)
        if weight_sum <= 0.0:
            return 0.0
        raw = (
            persistence * weights[0]
            + mean_iou * weights[1]
            + motion_stability * weights[2]
            + continuity * weights[3]
        ) / weight_sum
        return clamp01(raw)


def _reference_class(history: list[TrackObservation]) -> str | None:
    for item in reversed(history):
        if item.detected and item.target_class:
            return item.target_class
    return None


def _persistence(history: list[TrackObservation], reference_class: str | None) -> float:
    if not history:
        return 0.0
    if reference_class is None:
        return 0.0
    matched = sum(1 for item in history if item.detected and item.target_class == reference_class)
    return clamp01(matched / len(history))


def _mean_consecutive_iou(history: list[TrackObservation]) -> float:
    ious: list[float] = []
    for prev, curr in zip(history, history[1:]):
        if (
            prev.detected
            and curr.detected
            and prev.bbox is not None
            and curr.bbox is not None
            and prev.target_class == curr.target_class
        ):
            ious.append(prev.bbox.iou(curr.bbox))
        else:
            ious.append(0.0)
    if not ious:
        return 0.0
    return clamp01(sum(ious) / len(ious))


def _intermittency(history: list[TrackObservation]) -> float:
    if len(history) < 2:
        return 0.0
    flips = 0
    for prev, curr in zip(history, history[1:]):
        if prev.detected != curr.detected:
            flips += 1
        elif prev.detected and curr.detected and prev.target_class != curr.target_class:
            flips += 1
    return clamp01(flips / (len(history) - 1))


def _frame_diagonal(frame_shape: tuple[int, ...] | None, bbox: BBox | None) -> float:
    if frame_shape is not None and len(frame_shape) >= 2:
        height, width = float(frame_shape[0]), float(frame_shape[1])
        return math.hypot(width, height)
    if bbox is not None:
        return math.hypot(bbox.width, bbox.height) * 4.0
    return 1.0


def _motion_stability(
    history: list[TrackObservation],
    frame_shape: tuple[int, ...] | None,
    jump_frac: float,
) -> float:
    distances: list[float] = []
    diagonal = _frame_diagonal(frame_shape, next((item.bbox for item in history if item.bbox), None))
    threshold = max(1e-6, jump_frac * diagonal)
    for prev, curr in zip(history, history[1:]):
        if not (
            prev.detected
            and curr.detected
            and prev.bbox is not None
            and curr.bbox is not None
            and prev.target_class == curr.target_class
        ):
            distances.append(1.0)
            continue
        px, py = prev.bbox.centroid()
        cx, cy = curr.bbox.centroid()
        distances.append(min(1.0, math.hypot(cx - px, cy - py) / threshold))
    if not distances:
        return 0.0
    mean_jump = sum(distances) / len(distances)
    return clamp01(1.0 - mean_jump)
