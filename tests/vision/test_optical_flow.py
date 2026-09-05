"""Optical-flow motion signal (not confidence)."""

from __future__ import annotations

import numpy as np

from tests.vision.helpers import make_frame, shift_frame
from vision.config import VisionConfig
from vision.optical_flow import OpticalFlowEstimator
from vision.pipeline import Tier1Pipeline
from vision.types import Detection


def test_first_frame_optical_flow_is_zero() -> None:
    pipeline = Tier1Pipeline(detector=_empty())
    result = pipeline.process(make_frame())
    assert result.optical_flow == 0.0
    assert result.optical_flow_detail.valid is False
    assert result.optical_flow_detail.reason == "first_frame"


def test_reset_makes_next_frame_first_again() -> None:
    estimator = OpticalFlowEstimator(VisionConfig())
    frame = make_frame()
    first = estimator.update(frame)
    second = estimator.update(shift_frame(frame, 4, 0))
    estimator.reset()
    after_reset = estimator.update(frame)
    assert first.valid is False
    assert after_reset.valid is False
    assert after_reset.reason == "first_frame"
    assert 0.0 <= second.motion_intensity <= 1.0


def test_shifted_texture_has_higher_intensity_than_static() -> None:
    config = VisionConfig()
    static = OpticalFlowEstimator(config)
    moving = OpticalFlowEstimator(config)
    frame = make_frame(height=160, width=200, seed=3)
    static.update(frame)
    moving.update(frame)
    static_flow = static.update(frame.copy())
    moving_flow = moving.update(shift_frame(frame, 12, 0))
    assert static_flow.valid
    assert moving_flow.valid
    assert moving_flow.mean_magnitude > static_flow.mean_magnitude
    assert moving_flow.motion_intensity >= static_flow.motion_intensity
    assert 0.0 <= moving_flow.motion_intensity <= 1.0


def test_blank_frame_insufficient_features() -> None:
    estimator = OpticalFlowEstimator(VisionConfig(flow_min_points=6))
    blank = np.full((80, 80, 3), 10, dtype=np.uint8)
    estimator.update(blank)
    second = estimator.update(blank)
    assert second.valid is False
    assert second.motion_intensity == 0.0
    assert second.reason in {"insufficient_features", "insufficient_tracked_points", "first_frame"}


def test_optical_flow_is_not_treated_as_confidence() -> None:
    """Documented contract: intensity can be high while detection confidence is 0."""
    pipeline = Tier1Pipeline(detector=_empty())
    frame = make_frame(seed=4)
    pipeline.process(frame)
    result = pipeline.process(shift_frame(frame, 10, 3))
    assert result.detection_confidence == 0.0
    assert result.optical_flow_detail.mean_magnitude >= 0.0
    # A motion value is allowed even when there is no detection.
    assert 0.0 <= result.optical_flow <= 1.0


def _empty():
    class _Null:
        def detect(self, frame: object) -> Detection:
            return Detection.empty()

    return _Null()
