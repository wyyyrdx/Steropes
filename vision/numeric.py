"""Finite-number helpers. CV signals must never be NaN or non-finite."""

from __future__ import annotations

import math


def is_finite_number(value: object) -> bool:
    try:
        return math.isfinite(float(value))  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return False


def finite_float(value: object, default: float = 0.0) -> float:
    """Return ``float(value)`` when finite, otherwise ``default``."""
    try:
        number = float(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return default
    if math.isnan(number) or math.isinf(number):
        return default
    return number


def clamp01(value: object, default: float = 0.0) -> float:
    """Normalize a value into ``[0, 1]``. Non-finite input becomes ``default``."""
    number = finite_float(value, default=default)
    if number < 0.0:
        return 0.0
    if number > 1.0:
        return 1.0
    return number
