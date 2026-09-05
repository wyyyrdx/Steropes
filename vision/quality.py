"""Lightweight frame validation and quality diagnostics.

These checks never invent detections. They only decide whether a frame is
safe to run through the detector / tracker / flow, and they attach
diagnostic flags the Agent may use.
"""

from __future__ import annotations

from typing import Any

import numpy as np

from vision.config import VisionConfig
from vision.types import BBox


def validate_frame(frame: Any, config: VisionConfig) -> tuple[bool, str]:
    """Return ``(ok, reason)``. ``reason`` is empty when the frame is usable."""
    if frame is None:
        return False, "missing_frame"
    if not isinstance(frame, np.ndarray):
        return False, "not_array"
    if frame.size == 0:
        return False, "empty"
    if frame.ndim == 2:
        height, width = frame.shape
    elif frame.ndim == 3 and frame.shape[2] in (1, 3, 4):
        height, width = frame.shape[:2]
    else:
        return False, "bad_shape"
    if height < config.min_frame_side or width < config.min_frame_side:
        return False, "too_small"
    if not np.issubdtype(frame.dtype, np.number):
        return False, "bad_dtype"
    if np.issubdtype(frame.dtype, np.floating):
        sample = frame[:: max(1, height // 32), :: max(1, width // 32)]
        if not np.isfinite(sample).all():
            return False, "non_finite"
    return True, ""


def to_bgr_u8(frame: np.ndarray) -> np.ndarray:
    """Convert a validated frame to BGR uint8 for OpenCV routines."""
    import cv2

    image = frame
    if image.ndim == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
    elif image.shape[2] == 1:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
    elif image.shape[2] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_BGRA2BGR)
    if image.dtype == np.uint8:
        return image
    if np.issubdtype(image.dtype, np.floating):
        max_val = float(np.max(image)) if image.size else 0.0
        scale = 255.0 if max_val <= 1.0 + 1e-6 else 1.0
        return np.clip(image * scale, 0, 255).astype(np.uint8)
    return np.clip(image, 0, 255).astype(np.uint8)


def to_gray_u8(frame: np.ndarray) -> np.ndarray:
    import cv2

    bgr = to_bgr_u8(frame)
    return cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)


def assess_quality(
    frame: np.ndarray,
    config: VisionConfig,
    bbox: BBox | None = None,
) -> tuple[str, ...]:
    """Return zero or more diagnostic flags. Does not change detections."""
    import cv2

    flags: list[str] = []
    gray = to_gray_u8(frame)
    sample = cv2.resize(gray, (64, 64), interpolation=cv2.INTER_AREA)
    mean = float(sample.mean())
    std = float(sample.std())
    if mean < config.lighting_dark_mean:
        flags.append("poor_lighting")
    if mean > config.lighting_bright_mean:
        flags.append("overexposed")
    glare_frac = float(np.mean(sample >= config.glare_value_threshold))
    if glare_frac >= config.glare_fraction_threshold:
        flags.append("glare")
    if std < config.low_contrast_std:
        flags.append("low_contrast")
    if bbox is not None:
        height, width = gray.shape[:2]
        margin_x = width * config.edge_margin_frac
        margin_y = height * config.edge_margin_frac
        x1, y1, x2, y2 = bbox.as_xyxy()
        if x1 <= margin_x or y1 <= margin_y or x2 >= width - margin_x or y2 >= height - margin_y:
            flags.append("bad_framing")
        if bbox.area() < (width * height) * 0.002:
            flags.append("tiny_target")
    return tuple(flags)
