"""Invalid frames, quality flags, and Tier 2 reset / re-run."""

from __future__ import annotations

import math

import numpy as np

from tests.vision.helpers import ConstantDetector, det, make_frame
from vision.pipeline import Tier1Pipeline
from vision.types import Detection


def test_invalid_none_frame() -> None:
    result = Tier1Pipeline(detector=ConstantDetector(det())).process(None)
    assert result.frame_valid is False
    assert result.target_class is None
    assert result.detection_confidence == 0.0
    assert result.tracking_consistency == 0.0
    assert result.optical_flow == 0.0
    assert "missing_frame" in result.quality_flags


def test_invalid_empty_array() -> None:
    result = Tier1Pipeline().process(np.zeros((0, 0, 3), dtype=np.uint8))
    assert result.frame_valid is False
    assert result.detection_confidence == 0.0


def test_invalid_wrong_rank() -> None:
    result = Tier1Pipeline().process(np.zeros((10,), dtype=np.uint8))
    assert result.frame_valid is False
    assert "bad_shape" in result.quality_flags


def test_invalid_non_finite_float_frame() -> None:
    frame = np.full((32, 32, 3), 0.4, dtype=np.float32)
    frame[0, 0, 0] = np.nan
    result = Tier1Pipeline().process(frame)
    assert result.frame_valid is False
    assert result.optical_flow == 0.0
    assert not math.isnan(result.detection_confidence)


def test_invalid_frame_does_not_advance_tracking() -> None:
    pipeline = Tier1Pipeline(detector=ConstantDetector(det()))
    good = make_frame()
    pipeline.process(good)
    pipeline.process(good)
    before = pipeline.tracker.history_size
    pipeline.process(None)
    assert pipeline.tracker.history_size == before


def test_poor_lighting_flag_without_fabricated_detection() -> None:
    dark = np.full((80, 80, 3), 5, dtype=np.uint8)
    result = Tier1Pipeline(detector=ConstantDetector(Detection.empty())).process(dark)
    assert result.frame_valid is True
    assert result.target_class is None
    assert result.detection_confidence == 0.0
    assert "poor_lighting" in result.quality_flags


def test_glare_flag() -> None:
    bright = np.full((80, 80, 3), 255, dtype=np.uint8)
    result = Tier1Pipeline(detector=ConstantDetector(Detection.empty())).process(bright)
    assert result.detection_confidence == 0.0
    assert "glare" in result.quality_flags or "overexposed" in result.quality_flags


def test_tracking_reset_clears_consistency() -> None:
    pipeline = Tier1Pipeline(detector=ConstantDetector(det()))
    frame = make_frame()
    for _ in range(8):
        pipeline.process(frame)
    assert pipeline.process(frame).tracking_consistency >= 0.8
    pipeline.reset()
    after = pipeline.process(frame)
    assert after.tracking_consistency == 0.0
    assert after.optical_flow == 0.0
    assert after.optical_flow_detail.reason == "first_frame"


def test_tier2_rerun_compatibility() -> None:
    """Same pipeline instance can run again after reset (simulated reposition)."""
    pipeline = Tier1Pipeline(detector=ConstantDetector(det("deer", conf=0.8)))
    frame = make_frame(seed=1)
    first_pass = [pipeline.process(frame) for _ in range(5)]
    assert first_pass[-1].target_class == "deer"
    assert first_pass[-1].tracking_consistency > first_pass[0].tracking_consistency

    pipeline.reset()  # hardware would have moved; we only re-init CV state

    second_pass = [pipeline.process(frame) for _ in range(5)]
    assert second_pass[0].tracking_consistency == 0.0
    assert second_pass[0].optical_flow == 0.0
    assert second_pass[-1].target_class == "deer"
    assert second_pass[-1].detection_confidence == 0.8
    assert second_pass[-1].tracking_consistency > second_pass[0].tracking_consistency
    assert all(0.0 <= item.optical_flow <= 1.0 for item in first_pass + second_pass)


def test_signals_remain_separate() -> None:
    pipeline = Tier1Pipeline(detector=ConstantDetector(det(conf=0.93)))
    frame = make_frame()
    pipeline.process(frame)
    result = pipeline.process(frame)
    assert result.detection_confidence == 0.93
    assert result.tracking_consistency != result.detection_confidence or result.tracking_consistency == 0.0
    assert hasattr(result, "optical_flow")
    breakdown_keys = {"detection_confidence", "tracking_consistency", "optical_flow"}
    assert breakdown_keys <= set(result.to_dict())
