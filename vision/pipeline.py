"""Tier 1 local CV pipeline.

Frame
  → validate
  → detector (class, bbox, detection_confidence)
  → tracking_consistency
  → optical_flow
  → CVResult

The Agent — not this module — chooses Tier 1 / reposition / Tier 3.

After the hardware stack physically repositions the camera, call
``reset()`` before feeding the new frame sequence.
"""

from __future__ import annotations

from datetime import datetime

from vision.config import VisionConfig
from vision.detector import DetectionBackend, create_detector
from vision.numeric import clamp01
from vision.optical_flow import OpticalFlowEstimator
from vision.quality import assess_quality, validate_frame
from vision.tracker import TrackingConsistency
from vision.types import CVResult, Detection, OpticalFlowSignal, utc_now


class Tier1Pipeline:
    """Reusable local-vision pipeline with explicit tracking reset."""

    def __init__(
        self,
        config: VisionConfig | None = None,
        detector: DetectionBackend | None = None,
    ) -> None:
        self.config = config or VisionConfig()
        self.detector = detector if detector is not None else create_detector(self.config)
        self.tracker = TrackingConsistency(self.config)
        self.optical_flow = OpticalFlowEstimator(self.config)

    def reset(self) -> None:
        """Clear tracker and optical-flow history after a Tier 2 reposition."""
        self.tracker.reset()
        self.optical_flow.reset()

    def process(self, frame: object, *, timestamp: datetime | None = None) -> CVResult:
        stamp = timestamp or utc_now()
        ok, reason = validate_frame(frame, self.config)
        if not ok:
            return CVResult.invalid(timestamp=stamp, reason=reason)

        detection = self.detector.detect(frame)
        if not isinstance(detection, Detection):
            detection = Detection.empty()
        detection = Detection.create(
            detection.target_class,
            detection.bbox,
            detection.detection_confidence,
        )

        tracking = self.tracker.update(detection, getattr(frame, "shape", None))
        flow = self.optical_flow.update(frame)
        if not isinstance(flow, OpticalFlowSignal):
            flow = OpticalFlowSignal.invalid("flow_unavailable")

        flags = assess_quality(frame, self.config, detection.bbox)
        return CVResult(
            target_class=detection.target_class,
            bbox=detection.bbox,
            detection_confidence=clamp01(detection.detection_confidence),
            tracking_consistency=clamp01(tracking),
            optical_flow=clamp01(flow.motion_intensity),
            timestamp=stamp,
            optical_flow_detail=flow,
            frame_valid=True,
            quality_flags=flags,
        )
