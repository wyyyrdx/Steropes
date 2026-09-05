"""Central configuration for the Tier 1 vision pipeline.

All detector, tracker, and optical-flow thresholds live here so they are
not scattered across modules. Override via ``VisionConfig(...)``,
``VisionConfig.from_json()``, or ``VisionConfig.from_env()``.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field, fields
from pathlib import Path
from typing import Any, Mapping


def _env(name: str, default: str | None = None) -> str | None:
    value = os.environ.get(name)
    if value is None or value.strip() == "":
        return default
    return value


def _env_int(name: str, default: int) -> int:
    raw = _env(name)
    if raw is None:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def _env_float(name: str, default: float) -> float:
    raw = _env(name)
    if raw is None:
        return default
    try:
        return float(raw)
    except ValueError:
        return default


@dataclass
class VisionConfig:
    """Runtime settings for local OpenCV detection, tracking, and flow."""

    # --- Detector (cv2.dnn + ONNX) ---
    model_path: Path | None = None
    class_names: tuple[str, ...] = ()
    labels_path: Path | None = None
    # Parser is format-based, not YOLO-version-specific.
    # "auto" inspects the last dimension (6 → nx6, 7 → ssd). Unknown → no-detect.
    parser_name: str = "auto"
    output_index: int = 0
    boxes_normalized: bool = True
    # blobFromImage
    input_width: int = 640
    input_height: int = 640
    blob_scale: float = 1.0 / 255.0
    blob_mean: tuple[float, float, float] = (0.0, 0.0, 0.0)
    blob_swap_rb: bool = True
    blob_crop: bool = False
    # Post-process
    nms_score_threshold: float = 0.25
    nms_iou_threshold: float = 0.45
    max_detections: int = 16
    # Edge DNN execution (CPU-safe defaults for Pi 5 / Jetson)
    dnn_backend: str = "opencv"  # opencv | cuda | openvino | timvx
    dnn_target: str = "cpu"  # cpu | cuda | opencl | npu

    # --- Tracking consistency ---
    track_window: int = 8
    track_min_frames: int = 2
    track_w_persistence: float = 0.30
    track_w_iou: float = 0.30
    track_w_motion: float = 0.25
    track_w_continuity: float = 0.15
    # Centroid jump larger than this fraction of the frame diagonal is unstable.
    jump_distance_frac: float = 0.35

    # --- Optical flow (sparse Lucas–Kanade) ---
    flow_max_corners: int = 80
    flow_quality_level: float = 0.30
    flow_min_distance: int = 8
    flow_block_size: int = 7
    flow_min_points: int = 6
    # Mean pixel displacement that maps to motion_intensity = 1.0.
    # This is a scale reference, not a confidence.
    flow_magnitude_ref: float = 20.0
    lk_win_size: int = 21
    lk_max_level: int = 3
    lk_max_count: int = 20
    lk_epsilon: float = 0.03

    # --- Frame quality (diagnostics only; does not invent detections) ---
    min_frame_side: int = 8
    lighting_dark_mean: float = 25.0
    lighting_bright_mean: float = 240.0
    glare_value_threshold: float = 250.0
    glare_fraction_threshold: float = 0.18
    low_contrast_std: float = 8.0
    edge_margin_frac: float = 0.03

    extra: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.model_path is not None and not isinstance(self.model_path, Path):
            self.model_path = Path(self.model_path)
        if self.labels_path is not None and not isinstance(self.labels_path, Path):
            self.labels_path = Path(self.labels_path)
        if isinstance(self.class_names, list):
            self.class_names = tuple(self.class_names)
        names = list(self.class_names)
        if self.labels_path is not None and self.labels_path.is_file():
            loaded = tuple(
                line.strip()
                for line in self.labels_path.read_text(encoding="utf-8").splitlines()
                if line.strip() and not line.strip().startswith("#")
            )
            if loaded:
                names = list(loaded)
        self.class_names = tuple(names)

    def resolve_class_name(self, class_id: int) -> str:
        if 0 <= class_id < len(self.class_names):
            return self.class_names[class_id]
        return str(class_id)

    @classmethod
    def from_mapping(cls, data: Mapping[str, Any]) -> VisionConfig:
        allowed = {item.name for item in fields(cls)}
        kwargs: dict[str, Any] = {}
        extra: dict[str, Any] = {}
        for key, value in data.items():
            if key in allowed:
                kwargs[key] = value
            else:
                extra[key] = value
        if extra:
            kwargs["extra"] = {**kwargs.get("extra", {}), **extra}
        return cls(**kwargs)

    @classmethod
    def from_json(cls, path: str | Path) -> VisionConfig:
        payload = json.loads(Path(path).read_text(encoding="utf-8"))
        if not isinstance(payload, Mapping):
            raise ValueError("Vision config JSON must be an object")
        return cls.from_mapping(payload)

    @classmethod
    def from_env(cls) -> VisionConfig:
        model = _env("STEROPES_VISION_MODEL_PATH")
        labels = _env("STEROPES_VISION_LABELS_PATH")
        names_raw = _env("STEROPES_VISION_CLASS_NAMES")
        names = tuple(part.strip() for part in names_raw.split(",") if part.strip()) if names_raw else ()
        return cls(
            model_path=Path(model) if model else None,
            labels_path=Path(labels) if labels else None,
            class_names=names,
            parser_name=_env("STEROPES_VISION_PARSER", "auto") or "auto",
            input_width=_env_int("STEROPES_VISION_INPUT_WIDTH", 640),
            input_height=_env_int("STEROPES_VISION_INPUT_HEIGHT", 640),
            nms_score_threshold=_env_float("STEROPES_VISION_NMS_SCORE", 0.25),
            nms_iou_threshold=_env_float("STEROPES_VISION_NMS_IOU", 0.45),
            dnn_backend=_env("STEROPES_VISION_DNN_BACKEND", "opencv") or "opencv",
            dnn_target=_env("STEROPES_VISION_DNN_TARGET", "cpu") or "cpu",
        )
