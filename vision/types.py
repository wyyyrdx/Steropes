"""Structured Tier 1 CV types shared by the pipeline, Agent, and events helper."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from vision.numeric import clamp01, finite_float, is_finite_number


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass(frozen=True, slots=True)
class BBox:
    """Axis-aligned box in pixel coordinates: top-left + size."""

    x: float
    y: float
    width: float
    height: float

    @staticmethod
    def create(x: object, y: object, width: object, height: object) -> BBox | None:
        if not all(is_finite_number(v) for v in (x, y, width, height)):
            return None
        w = float(width)  # type: ignore[arg-type]
        h = float(height)  # type: ignore[arg-type]
        if w <= 0.0 or h <= 0.0:
            return None
        return BBox(float(x), float(y), w, h)  # type: ignore[arg-type]

    @staticmethod
    def from_xyxy(x1: object, y1: object, x2: object, y2: object) -> BBox | None:
        if not all(is_finite_number(v) for v in (x1, y1, x2, y2)):
            return None
        left = min(float(x1), float(x2))  # type: ignore[arg-type]
        top = min(float(y1), float(y2))  # type: ignore[arg-type]
        right = max(float(x1), float(x2))  # type: ignore[arg-type]
        bottom = max(float(y1), float(y2))  # type: ignore[arg-type]
        return BBox.create(left, top, right - left, bottom - top)

    def as_xywh(self) -> tuple[float, float, float, float]:
        return (self.x, self.y, self.width, self.height)

    def as_xyxy(self) -> tuple[float, float, float, float]:
        return (self.x, self.y, self.x + self.width, self.y + self.height)

    def as_list(self) -> list[float]:
        return [self.x, self.y, self.width, self.height]

    def centroid(self) -> tuple[float, float]:
        return (self.x + self.width * 0.5, self.y + self.height * 0.5)

    def area(self) -> float:
        return self.width * self.height

    def iou(self, other: BBox) -> float:
        ax1, ay1, ax2, ay2 = self.as_xyxy()
        bx1, by1, bx2, by2 = other.as_xyxy()
        ix1 = max(ax1, bx1)
        iy1 = max(ay1, by1)
        ix2 = min(ax2, bx2)
        iy2 = min(ay2, by2)
        iw = ix2 - ix1
        ih = iy2 - iy1
        if iw <= 0.0 or ih <= 0.0:
            return 0.0
        inter = iw * ih
        union = self.area() + other.area() - inter
        if union <= 0.0:
            return 0.0
        return clamp01(inter / union)


@dataclass(frozen=True, slots=True)
class Detection:
    """Single-target detector output. Empty means a safe no-detection."""

    target_class: str | None
    bbox: BBox | None
    detection_confidence: float

    @staticmethod
    def create(
        target_class: str | None,
        bbox: BBox | None,
        detection_confidence: object,
    ) -> Detection:
        if bbox is None or target_class is None or target_class == "":
            return Detection.empty()
        return Detection(target_class, bbox, clamp01(detection_confidence))

    @staticmethod
    def empty() -> Detection:
        return Detection(None, None, 0.0)

    @property
    def has_target(self) -> bool:
        return self.bbox is not None and self.target_class is not None


@dataclass(frozen=True, slots=True)
class OpticalFlowSignal:
    """Internal optical-flow measurement.

    ``motion_intensity`` is a normalized motion magnitude in ``[0, 1]``.
    It is **not** a confidence score.
    """

    mean_magnitude: float
    feature_count: int
    valid: bool
    motion_intensity: float
    reason: str = ""

    @staticmethod
    def invalid(reason: str, feature_count: int = 0) -> OpticalFlowSignal:
        return OpticalFlowSignal(
            mean_magnitude=0.0,
            feature_count=max(0, int(feature_count)),
            valid=False,
            motion_intensity=0.0,
            reason=reason,
        )

    @staticmethod
    def measured(mean_magnitude: object, feature_count: int, intensity: object) -> OpticalFlowSignal:
        return OpticalFlowSignal(
            mean_magnitude=max(0.0, finite_float(mean_magnitude)),
            feature_count=max(0, int(feature_count)),
            valid=True,
            motion_intensity=clamp01(intensity),
            reason="",
        )


@dataclass(frozen=True, slots=True)
class CVResult:
    """Structured Tier 1 result consumed by the Agent and event helper.

    Required fields:
      target_class, bbox, detection_confidence, tracking_consistency,
      optical_flow, timestamp

    ``optical_flow`` is normalized motion intensity, not confidence.
    """

    target_class: str | None
    bbox: BBox | None
    detection_confidence: float
    tracking_consistency: float
    optical_flow: float
    timestamp: datetime
    optical_flow_detail: OpticalFlowSignal
    frame_valid: bool = True
    quality_flags: tuple[str, ...] = ()
    extra: dict[str, Any] = field(default_factory=dict)

    @staticmethod
    def invalid(
        *,
        timestamp: datetime | None = None,
        reason: str = "invalid_frame",
        flow: OpticalFlowSignal | None = None,
    ) -> CVResult:
        stamp = timestamp or utc_now()
        detail = flow or OpticalFlowSignal.invalid(reason)
        return CVResult(
            target_class=None,
            bbox=None,
            detection_confidence=0.0,
            tracking_consistency=0.0,
            optical_flow=0.0,
            timestamp=stamp,
            optical_flow_detail=detail,
            frame_valid=False,
            quality_flags=(reason,),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "target_class": self.target_class,
            "bbox": None if self.bbox is None else self.bbox.as_list(),
            "detection_confidence": self.detection_confidence,
            "tracking_consistency": self.tracking_consistency,
            "optical_flow": self.optical_flow,
            "timestamp": self.timestamp.isoformat(),
            "optical_flow_detail": {
                "mean_magnitude": self.optical_flow_detail.mean_magnitude,
                "feature_count": self.optical_flow_detail.feature_count,
                "valid": self.optical_flow_detail.valid,
                "motion_intensity": self.optical_flow_detail.motion_intensity,
                "reason": self.optical_flow_detail.reason,
            },
            "frame_valid": self.frame_valid,
            "quality_flags": list(self.quality_flags),
        }
