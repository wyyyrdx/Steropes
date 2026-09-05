"""Pluggable ONNX output parsers.

Parsers are format adapters (tensor layout), not model-family decoders.
Unknown layouts return no detections instead of guessing boxes.

To support a new team model, implement ``OutputParser.parse`` and pass it
into ``OnnxDnnBackend`` — do not change the pipeline, tracker, or schema.
"""

from __future__ import annotations

from typing import Any, Protocol

import numpy as np

from vision.config import VisionConfig
from vision.numeric import clamp01, finite_float
from vision.types import BBox, Detection


class OutputParser(Protocol):
    """Convert raw ``cv2.dnn`` outputs into ``Detection`` objects."""

    def parse(
        self,
        network_outputs: Any,
        frame_shape: tuple[int, ...],
        config: VisionConfig,
    ) -> list[Detection]:
        ...


def _as_numpy(outputs: Any, index: int) -> np.ndarray | None:
    if isinstance(outputs, (list, tuple)):
        if not outputs or index >= len(outputs):
            return None
        array = np.asarray(outputs[index])
    else:
        if index != 0:
            return None
        array = np.asarray(outputs)
    if array.size == 0:
        return None
    return array


def _denormalize_xyxy(
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    width: int,
    height: int,
    normalized: bool,
) -> BBox | None:
    if normalized:
        x1 *= width
        x2 *= width
        y1 *= height
        y2 *= height
    return BBox.from_xyxy(x1, y1, x2, y2)


def _apply_nms(detections: list[Detection], config: VisionConfig) -> list[Detection]:
    if len(detections) <= 1:
        return detections[: config.max_detections]
    import cv2

    boxes = [det.bbox.as_xyxy() for det in detections if det.bbox is not None]
    scores = [det.detection_confidence for det in detections]
    if not boxes:
        return []
    # OpenCV NMSBoxes expects [x, y, w, h]
    xywh = [[x1, y1, x2 - x1, y2 - y1] for x1, y1, x2, y2 in boxes]
    indices = cv2.dnn.NMSBoxes(
        xywh,
        scores,
        config.nms_score_threshold,
        config.nms_iou_threshold,
    )
    if indices is None or len(indices) == 0:
        return []
    flat = np.array(indices).reshape(-1).tolist()
    kept = [detections[i] for i in flat if 0 <= i < len(detections)]
    kept.sort(key=lambda item: item.detection_confidence, reverse=True)
    return kept[: config.max_detections]


class NullParser:
    """Used when the output layout is unknown. Never fabricates boxes."""

    def parse(
        self,
        network_outputs: Any,
        frame_shape: tuple[int, ...],
        config: VisionConfig,
    ) -> list[Detection]:
        return []


class Nx6Parser:
    """Rows of ``[x1, y1, x2, y2, score, class_id]``."""

    def parse(
        self,
        network_outputs: Any,
        frame_shape: tuple[int, ...],
        config: VisionConfig,
    ) -> list[Detection]:
        array = _as_numpy(network_outputs, config.output_index)
        if array is None:
            return []
        if array.ndim == 3 and array.shape[0] == 1:
            array = array[0]
        if array.ndim != 2 or array.shape[1] != 6:
            return []
        height, width = frame_shape[:2]
        detections: list[Detection] = []
        for row in array:
            score = finite_float(row[4])
            if score < config.nms_score_threshold:
                continue
            class_id = int(round(finite_float(row[5])))
            box = _denormalize_xyxy(
                finite_float(row[0]),
                finite_float(row[1]),
                finite_float(row[2]),
                finite_float(row[3]),
                width,
                height,
                config.boxes_normalized,
            )
            detections.append(
                Detection.create(config.resolve_class_name(class_id), box, clamp01(score))
            )
        return _apply_nms([d for d in detections if d.has_target], config)


class SsdParser:
    """Classic OpenCV SSD layout ``(1, 1, N, 7)``:

    ``[batch_id, class_id, confidence, x1, y1, x2, y2]`` (typically normalized).
    """

    def parse(
        self,
        network_outputs: Any,
        frame_shape: tuple[int, ...],
        config: VisionConfig,
    ) -> list[Detection]:
        array = _as_numpy(network_outputs, config.output_index)
        if array is None:
            return []
        if array.ndim == 4 and array.shape[-1] == 7:
            array = array.reshape(-1, 7)
        elif array.ndim == 2 and array.shape[1] == 7:
            pass
        else:
            return []
        height, width = frame_shape[:2]
        detections: list[Detection] = []
        for row in array:
            score = finite_float(row[2])
            if score < config.nms_score_threshold:
                continue
            class_id = int(round(finite_float(row[1])))
            box = _denormalize_xyxy(
                finite_float(row[3]),
                finite_float(row[4]),
                finite_float(row[5]),
                finite_float(row[6]),
                width,
                height,
                config.boxes_normalized,
            )
            detections.append(
                Detection.create(config.resolve_class_name(class_id), box, clamp01(score))
            )
        return _apply_nms([d for d in detections if d.has_target], config)


def infer_parser_name(network_outputs: Any, config: VisionConfig) -> str:
    array = _as_numpy(network_outputs, config.output_index)
    if array is None:
        return "none"
    last = int(array.shape[-1]) if array.ndim >= 1 else 0
    if last == 6:
        return "nx6"
    if last == 7:
        return "ssd"
    return "none"


def build_parser(name: str) -> OutputParser:
    key = (name or "auto").strip().lower()
    if key in {"nx6", "detections_nx6", "xyxy"}:
        return Nx6Parser()
    if key in {"ssd", "ssd7", "detections_nx7"}:
        return SsdParser()
    if key in {"none", "null"}:
        return NullParser()
    if key == "auto":
        return AutoParser()
    return NullParser()


class AutoParser:
    """Choose nx6 or ssd from the last dimension. Anything else → no-detect."""

    def parse(
        self,
        network_outputs: Any,
        frame_shape: tuple[int, ...],
        config: VisionConfig,
    ) -> list[Detection]:
        inferred = infer_parser_name(network_outputs, config)
        if inferred == "nx6":
            return Nx6Parser().parse(network_outputs, frame_shape, config)
        if inferred == "ssd":
            return SsdParser().parse(network_outputs, frame_shape, config)
        return []
