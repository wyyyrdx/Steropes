"""Modular local detector backend using OpenCV ``cv2.dnn`` + ONNX.

The pipeline depends only on ``DetectionBackend.detect``. Swap the ONNX
model or parser without rewriting tracking, optical flow, or ``CVResult``.

If weights are missing, unreadable, or the output layout is unknown, the
backend returns a safe no-detection. It never fabricates a target.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Protocol

from vision.config import VisionConfig
from vision.parsers import OutputParser, build_parser
from vision.quality import to_bgr_u8
from vision.types import Detection

logger = logging.getLogger(__name__)

_BACKENDS = {
    "opencv": "DNN_BACKEND_OPENCV",
    "cuda": "DNN_BACKEND_CUDA",
    "openvino": "DNN_BACKEND_INFERENCE_ENGINE",
    "timvx": "DNN_BACKEND_TIMVX",
    "vkcom": "DNN_BACKEND_VKCOM",
}

_TARGETS = {
    "cpu": "DNN_TARGET_CPU",
    "cuda": "DNN_TARGET_CUDA",
    "cuda_fp16": "DNN_TARGET_CUDA_FP16",
    "opencl": "DNN_TARGET_OPENCL",
    "opencl_fp16": "DNN_TARGET_OPENCL_FP16",
    "npu": "DNN_TARGET_NPU",
    "myriad": "DNN_TARGET_MYRIAD",
}


class DetectionBackend(Protocol):
    """Single-target detector. Returns ``Detection.empty()`` when nothing is found."""

    def detect(self, frame: Any) -> Detection:
        ...


class NullDetectionBackend:
    """Used when no model file is available."""

    def detect(self, frame: Any) -> Detection:
        return Detection.empty()


def _apply_dnn_runtime(net: Any, config: VisionConfig) -> None:
    import cv2

    backend_attr = _BACKENDS.get(config.dnn_backend.lower())
    target_attr = _TARGETS.get(config.dnn_target.lower())
    if backend_attr and hasattr(cv2.dnn, backend_attr):
        net.setPreferableBackend(getattr(cv2.dnn, backend_attr))
    if target_attr and hasattr(cv2.dnn, target_attr):
        net.setPreferableTarget(getattr(cv2.dnn, target_attr))


class OnnxDnnBackend:
    """Load an ONNX graph with ``cv2.dnn.readNetFromONNX`` and parse outputs."""

    def __init__(
        self,
        config: VisionConfig,
        parser: OutputParser | None = None,
    ) -> None:
        self.config = config
        self.parser: OutputParser = parser or build_parser(config.parser_name)
        self._net: Any = None
        self._load_error: str | None = None
        path = config.model_path
        if path is None:
            self._load_error = "no_model_path"
            logger.info("No ONNX model_path configured; detector will return no-detection")
            return
        model = Path(path)
        if not model.is_file():
            self._load_error = "model_missing"
            logger.info("ONNX model not found at %s; detector will return no-detection", model)
            return
        try:
            import cv2

            self._net = cv2.dnn.readNetFromONNX(str(model))
            _apply_dnn_runtime(self._net, config)
        except Exception as exc:  # noqa: BLE001 — model load must not crash the pipeline
            self._net = None
            self._load_error = "model_unreadable"
            logger.warning("Failed to load ONNX model %s: %s", model, exc)

    @property
    def is_ready(self) -> bool:
        return self._net is not None

    @property
    def load_error(self) -> str | None:
        return self._load_error

    def detect(self, frame: Any) -> Detection:
        if self._net is None:
            return Detection.empty()
        try:
            import cv2

            image = to_bgr_u8(frame)
            blob = cv2.dnn.blobFromImage(
                image,
                scalefactor=self.config.blob_scale,
                size=(self.config.input_width, self.config.input_height),
                mean=self.config.blob_mean,
                swapRB=self.config.blob_swap_rb,
                crop=self.config.blob_crop,
            )
            self._net.setInput(blob)
            outputs = self._net.forward()
            detections = self.parser.parse(outputs, image.shape, self.config)
        except Exception as exc:  # noqa: BLE001 — never crash the live loop
            logger.warning("Detector forward/parse failed: %s", exc)
            return Detection.empty()
        if not detections:
            return Detection.empty()
        return max(detections, key=lambda item: item.detection_confidence)


def create_detector(
    config: VisionConfig,
    parser: OutputParser | None = None,
) -> DetectionBackend:
    """Factory: ONNX backend when a model path is set, otherwise null."""
    if config.model_path is None:
        return NullDetectionBackend()
    backend = OnnxDnnBackend(config, parser=parser)
    if not backend.is_ready:
        return NullDetectionBackend()
    return backend
