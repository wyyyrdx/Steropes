"""Detection output, confidence range, and no-detection behavior."""

from __future__ import annotations

import numpy as np
import pytest

from tests.vision.helpers import ConstantDetector, det, make_frame
from vision.config import VisionConfig
from vision.detector import NullDetectionBackend, OnnxDnnBackend, create_detector
from vision.parsers import AutoParser, Nx6Parser, NullParser, SsdParser
from vision.pipeline import Tier1Pipeline
from vision.types import BBox, Detection, utc_now


def test_detection_output_fields(utc_stamp) -> None:
    expected = det("fox", 10, 12, 30, 24, 0.91)
    pipeline = Tier1Pipeline(detector=ConstantDetector(expected))
    result = pipeline.process(make_frame(), timestamp=utc_stamp)
    assert result.target_class == "fox"
    assert result.bbox is not None
    assert result.bbox.as_list() == [10.0, 12.0, 30.0, 24.0]
    assert result.detection_confidence == 0.91
    assert result.timestamp == utc_stamp
    assert result.frame_valid is True


def test_detection_confidence_range() -> None:
    pipeline = Tier1Pipeline(detector=ConstantDetector(det(conf=0.42)))
    value = pipeline.process(make_frame()).detection_confidence
    assert 0.0 <= value <= 1.0


def test_detection_confidence_clamps_out_of_range() -> None:
    high = Detection.create("bird", BBox.create(1, 1, 8, 8), 1.7)
    assert high.detection_confidence == 1.0
    pipeline = Tier1Pipeline(detector=ConstantDetector(high))
    assert pipeline.process(make_frame()).detection_confidence == 1.0


def test_detection_confidence_rejects_nan() -> None:
    created = Detection.create("bird", BBox.create(1, 1, 8, 8), float("nan"))
    assert created.detection_confidence == 0.0


def test_no_detection_without_model() -> None:
    detector = create_detector(VisionConfig(model_path=None))
    assert isinstance(detector, NullDetectionBackend)
    result = Tier1Pipeline(detector=detector).process(make_frame())
    assert result.target_class is None
    assert result.bbox is None
    assert result.detection_confidence == 0.0


def test_missing_weights_file_is_no_detection(tmp_path) -> None:
    missing = tmp_path / "not-a-model.onnx"
    backend = OnnxDnnBackend(VisionConfig(model_path=missing))
    assert backend.is_ready is False
    assert backend.detect(make_frame()) == Detection.empty()


def test_null_parser_does_not_fabricate() -> None:
    outputs = np.ones((4, 6), dtype=np.float32)
    parsed = NullParser().parse(outputs, (120, 160, 3), VisionConfig())
    assert parsed == []


def test_nx6_parser_reads_actual_scores() -> None:
    # [x1, y1, x2, y2, score, class] normalized
    outputs = np.array([[0.1, 0.2, 0.4, 0.5, 0.77, 2.0]], dtype=np.float32)
    config = VisionConfig(class_names=("a", "b", "c"), boxes_normalized=True, nms_score_threshold=0.1)
    parsed = Nx6Parser().parse(outputs, (100, 200, 3), config)
    assert len(parsed) == 1
    assert parsed[0].target_class == "c"
    assert parsed[0].detection_confidence == pytest.approx(0.77, abs=1e-5)
    assert parsed[0].bbox is not None


def test_ssd_parser_reads_actual_scores() -> None:
    outputs = np.array([[[[0.0, 1.0, 0.66, 0.1, 0.1, 0.3, 0.4]]]], dtype=np.float32)
    config = VisionConfig(class_names=("bg", "deer"), boxes_normalized=True, nms_score_threshold=0.1)
    parsed = SsdParser().parse(outputs, (100, 100, 3), config)
    assert len(parsed) == 1
    assert parsed[0].target_class == "deer"
    assert parsed[0].detection_confidence == pytest.approx(0.66, abs=1e-5)


def test_auto_parser_unknown_layout_is_no_detection() -> None:
    # Typical raw YOLO-like tensor is not decoded; do not invent boxes.
    outputs = np.zeros((1, 84, 8400), dtype=np.float32)
    parsed = AutoParser().parse(outputs, (640, 640, 3), VisionConfig())
    assert parsed == []


def test_empty_detection_factory() -> None:
    empty = Detection.empty()
    assert empty.has_target is False
    assert empty.detection_confidence == 0.0
    assert utc_now() is not None
