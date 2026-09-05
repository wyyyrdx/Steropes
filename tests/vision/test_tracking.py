"""Stable vs unstable tracking consistency."""

from __future__ import annotations

from tests.vision.helpers import ConstantDetector, ScriptedDetector, det, make_frame
from vision.pipeline import Tier1Pipeline
from vision.types import Detection


def test_stable_tracking_approaches_one() -> None:
    pipeline = Tier1Pipeline(detector=ConstantDetector(det(x=40, y=30, w=22, h=18, conf=0.9)))
    frame = make_frame()
    score = 0.0
    for _ in range(10):
        score = pipeline.process(frame).tracking_consistency
    assert 0.0 <= score <= 1.0
    assert score >= 0.8


def test_unstable_flicker_approaches_zero() -> None:
    script = [det(), Detection.empty(), det(), Detection.empty(), det(), Detection.empty()]
    pipeline = Tier1Pipeline(detector=ScriptedDetector(script))
    frame = make_frame()
    scores = [pipeline.process(frame).tracking_consistency for _ in script]
    assert all(0.0 <= s <= 1.0 for s in scores)
    assert scores[-1] < 0.45


def test_unstable_jump_is_lower_than_stable() -> None:
    stable = Tier1Pipeline(detector=ConstantDetector(det(x=40, y=30)))
    jumping = Tier1Pipeline(
        detector=ScriptedDetector(
            [
                det(x=10, y=10),
                det(x=90, y=80),
                det(x=15, y=12),
                det(x=100, y=70),
                det(x=8, y=9),
                det(x=110, y=75),
            ]
        )
    )
    frame = make_frame()
    stable_score = 0.0
    jump_score = 0.0
    for _ in range(6):
        stable_score = stable.process(frame).tracking_consistency
        jump_score = jumping.process(frame).tracking_consistency
    assert stable_score > jump_score
    assert jump_score < 0.5


def test_first_observations_are_not_claimed_stable() -> None:
    pipeline = Tier1Pipeline(detector=ConstantDetector(det()))
    first = pipeline.process(make_frame()).tracking_consistency
    assert first == 0.0


def test_no_detection_sequence_stays_low() -> None:
    pipeline = Tier1Pipeline(detector=ConstantDetector(Detection.empty()))
    scores = [pipeline.process(make_frame()).tracking_consistency for _ in range(6)]
    assert all(s == 0.0 for s in scores)
