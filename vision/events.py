"""Helpers for contributing CV signals to a backend ``POST /events`` payload.

This module does **not** send HTTP, MQTT, or AWS IoT messages. The backend
owns ``/events``. The Agent owns ``tier_resolved``, ``action_taken``, and
``cloud_cost_avoided``.

Do not emit an event for every frame. The Agent / edge loop decides when
a resolved decision is worth recording.
"""

from __future__ import annotations

from typing import Any

from vision.numeric import clamp01
from vision.types import CVResult


def to_confidence_breakdown(result: CVResult) -> dict[str, float]:
    """Three separate signals for ``confidence_breakdown``.

    ``optical_flow`` is normalized motion intensity, not a confidence.
    """
    return {
        "detection_confidence": clamp01(result.detection_confidence),
        "tracking_consistency": clamp01(result.tracking_consistency),
        "optical_flow": clamp01(result.optical_flow),
    }


def to_event_contribution(result: CVResult) -> dict[str, Any]:
    """CV-owned subset of an ``/events`` body. No request routing fields."""
    return {
        "confidence_breakdown": to_confidence_breakdown(result),
        "timestamp": result.timestamp.isoformat(),
    }
