"""Steropes Tier 1 computer vision (OpenCV ``cv2.dnn``).

Public surface for the Agent and tests. This package does not implement
Agent policy, hardware motion, backend HTTP, MQTT, or Bedrock calls.
"""

from vision.config import VisionConfig
from vision.detector import DetectionBackend, NullDetectionBackend, OnnxDnnBackend, create_detector
from vision.events import to_confidence_breakdown, to_event_contribution
from vision.pipeline import Tier1Pipeline
from vision.types import BBox, CVResult, Detection, OpticalFlowSignal

__version__ = "0.1.0"

__all__ = [
    "BBox",
    "CVResult",
    "Detection",
    "DetectionBackend",
    "NullDetectionBackend",
    "OnnxDnnBackend",
    "OpticalFlowSignal",
    "Tier1Pipeline",
    "VisionConfig",
    "create_detector",
    "to_confidence_breakdown",
    "to_event_contribution",
]
