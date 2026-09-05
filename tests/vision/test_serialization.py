"""CVResult serialization and /events contribution (no HTTP)."""

from __future__ import annotations

import json

from tests.vision.helpers import ConstantDetector, det, make_frame
from vision.events import to_confidence_breakdown, to_event_contribution
from vision.pipeline import Tier1Pipeline
from vision.types import CVResult, Detection, OpticalFlowSignal, utc_now


def test_cv_result_json_round_trip(utc_stamp) -> None:
    pipeline = Tier1Pipeline(detector=ConstantDetector(det("owl", 8, 9, 14, 11, 0.64)))
    result = pipeline.process(make_frame(), timestamp=utc_stamp)
    payload = result.to_dict()
    encoded = json.dumps(payload)
    loaded = json.loads(encoded)
    assert loaded["target_class"] == "owl"
    assert loaded["bbox"] == [8.0, 9.0, 14.0, 11.0]
    assert loaded["detection_confidence"] == 0.64
    assert loaded["tracking_consistency"] == 0.0  # first frame
    assert loaded["optical_flow"] == 0.0
    assert loaded["timestamp"] == utc_stamp.isoformat()
    assert "optical_flow_detail" in loaded


def test_no_detection_serializes_nulls() -> None:
    result = Tier1Pipeline(detector=ConstantDetector(Detection.empty())).process(make_frame())
    payload = result.to_dict()
    assert payload["target_class"] is None
    assert payload["bbox"] is None
    assert payload["detection_confidence"] == 0.0
    json.dumps(payload)


def test_confidence_breakdown_matches_event_contract() -> None:
    result = CVResult(
        target_class="hare",
        bbox=det().bbox,
        detection_confidence=0.55,
        tracking_consistency=0.40,
        optical_flow=0.12,
        timestamp=utc_now(),
        optical_flow_detail=OpticalFlowSignal.measured(2.4, 20, 0.12),
    )
    breakdown = to_confidence_breakdown(result)
    assert set(breakdown) == {
        "detection_confidence",
        "tracking_consistency",
        "optical_flow",
    }
    assert breakdown["detection_confidence"] == 0.55
    assert breakdown["tracking_consistency"] == 0.40
    assert breakdown["optical_flow"] == 0.12
    contribution = to_event_contribution(result)
    assert contribution["confidence_breakdown"] == breakdown
    assert "request_id" not in contribution
    assert "tier_resolved" not in contribution
    assert "action_taken" not in contribution
    assert "cloud_cost_avoided" not in contribution


def test_breakdown_values_are_finite_unit_interval() -> None:
    result = CVResult.invalid()
    breakdown = to_confidence_breakdown(result)
    for value in breakdown.values():
        assert isinstance(value, float)
        assert 0.0 <= value <= 1.0
