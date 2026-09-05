"""Synthetic frames and scripted detectors for camera-free unit tests."""

from __future__ import annotations

import numpy as np

from vision.types import BBox, Detection


def make_frame(height: int = 120, width: int = 160, seed: int = 0, value: int | None = None) -> np.ndarray:
    """Textured BGR frame so optical-flow feature detectors have corners."""
    if value is not None:
        return np.full((height, width, 3), int(value), dtype=np.uint8)
    rng = np.random.default_rng(seed)
    noise = rng.integers(0, 255, size=(height, width), dtype=np.uint8)
    yy, xx = np.mgrid[0:height, 0:width]
    checker = ((xx // 8 + yy // 8) % 2) * 180
    gray = np.clip(checker.astype(np.int16) + (noise.astype(np.int16) // 5), 0, 255).astype(np.uint8)
    return np.stack([gray, gray, gray], axis=-1)


def shift_frame(frame: np.ndarray, dx: int, dy: int) -> np.ndarray:
    return np.roll(np.roll(frame, dy, axis=0), dx, axis=1)


class ConstantDetector:
    def __init__(self, detection: Detection) -> None:
        self.detection = detection

    def detect(self, frame: object) -> Detection:
        return self.detection


class ScriptedDetector:
    def __init__(self, script: list[Detection]) -> None:
        self.script = list(script)
        self.index = 0

    def detect(self, frame: object) -> Detection:
        if not self.script:
            return Detection.empty()
        item = self.script[min(self.index, len(self.script) - 1)]
        self.index += 1
        return item


def box(x: float = 40, y: float = 30, w: float = 20, h: float = 16) -> BBox:
    created = BBox.create(x, y, w, h)
    assert created is not None
    return created


def det(
    cls: str = "bird",
    x: float = 40,
    y: float = 30,
    w: float = 20,
    h: float = 16,
    conf: float = 0.87,
) -> Detection:
    return Detection.create(cls, box(x, y, w, h), conf)
