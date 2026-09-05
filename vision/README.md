# Steropes Tier 1 Computer Vision

Local OpenCV detection pipeline for the Steropes cascade. This package
produces **three separate signals** for the Agent. It does **not** decide
Tier 1 vs Tier 2 vs Tier 3, move hardware, call Bedrock, or POST `/events`.

```
Frame
  → Tier 1 CV (this package)
  → detection_confidence, tracking_consistency, optical_flow
  → Agent decides CONTINUE / REPOSITION / ESCALATE
  → if REPOSITION: hardware moves the camera
  → pipeline.reset()
  → Tier 1 CV again on the new frame sequence
```

This document describes software behavior that is covered by unit tests
with **synthetic frames and mocked detectors**. It does **not** claim
real-time performance, detection accuracy on field video, Raspberry Pi /
Jetson validation, or AWS integration.

## Install

```text
pip install -r requirements-vision.txt
```

Intended stack (from the repository README): **OpenCV 5** via `cv2.dnn`.
The code uses only the shared `cv2.dnn` / imgproc APIs. Unit tests do not
require a camera or an ONNX weight file.

## Pipeline

`vision.Tier1Pipeline.process(frame) -> CVResult`

| Field | Meaning |
| --- | --- |
| `target_class` | Detector class name, or `None` if no detection |
| `bbox` | Pixel `[x, y, width, height]`, or `None` |
| `detection_confidence` | Detector score in `[0, 1]`, or `0.0` if no detection |
| `tracking_consistency` | Temporal stability in `[0, 1]` |
| `optical_flow` | Normalized **motion intensity** in `[0, 1]` — **not confidence** |
| `timestamp` | UTC ISO-8601 |

Optional diagnostics (not required by the Agent contract):

- `optical_flow_detail` — mean magnitude, feature count, validity, reason
- `frame_valid` / `quality_flags` — lighting, glare, framing, corrupt frames

Invalid or disconnected frames return a safe empty result (`0.0` signals,
`frame_valid=False`). Values are never NaN.

## Detection confidence

Source: the detector backend's own score for the single highest-confidence
box that survives configured NMS.

- Missing model / unreadable ONNX / unknown output layout → no-detection,
  `detection_confidence = 0.0`. Nothing is fabricated.
- No box after NMS → `0.0`.
- Scores outside `[0, 1]` or non-finite values are clamped / replaced with
  `0.0`. That is sanitization, not a made-up detection.

The default backend is `OnnxDnnBackend` (`cv2.dnn.readNetFromONNX`) when
`VisionConfig.model_path` points at an existing file. Otherwise
`NullDetectionBackend` is used.

### Swapping the team's ONNX model

Do **not** hard-code a YOLO version into the pipeline. To plug in the
final weights:

1. Set `model_path` (or `STEROPES_VISION_MODEL_PATH`).
2. Set blob size / scale / mean in `VisionConfig` to match the model.
3. Set `parser_name` to `nx6`, `ssd`, or `auto`, **or** implement
   `vision.parsers.OutputParser` and pass it to `OnnxDnnBackend`.

`auto` only accepts last-dimension `6` (`[x1,y1,x2,y2,score,class]`) or
`7` (classic SSD). Raw YOLO tensors such as `(1, 84, 8400)` are **unknown
layouts** and return no-detection until a dedicated parser is provided.

Tracker, optical flow, `CVResult`, and the event helper stay unchanged.

## Tracking consistency

`tracking_consistency` is a `[0, 1]` stability score over a sliding window
(`track_window`, default 8). It is **not** a detector score.

| Term | What it measures |
| --- | --- |
| Persistence | Fraction of window frames with the same class |
| IoU continuity | Mean IoU of consecutive same-class boxes |
| Motion stability | `1` minus normalized centroid jump (frame-diagonal units) |
| Continuity | `1` minus detect/miss (or class-change) flicker |

Weighted sum (weights in `VisionConfig`). Fewer than `track_min_frames`
observations → `0.0` (no claim of stability yet). Disappearance,
intermittent detections, class flips, and large jumps pull the score
toward `0`. A persistent, overlapping box of one class approaches `1`.

## Optical flow

Sparse Lucas–Kanade (`goodFeaturesToTrack` + `calcOpticalFlowPyrLK`).

- `optical_flow_detail.mean_magnitude` — mean pixel displacement of
  successfully tracked corners.
- `optical_flow` / `motion_intensity` =
  `clip(mean_magnitude / flow_magnitude_ref, 0, 1)`.

**Interpretation:** how much the scene/camera moved, scaled so that a mean
displacement of `flow_magnitude_ref` pixels (default 20) maps to `1.0`.
**This is a motion signal, not a confidence.** Do not treat a high value
as “the detector is sure” or a low value as “the detector is unsure.”

Safe zeros (`valid=False`, intensity `0.0`):

- first frame after start or `reset()`
- not enough corners
- too few points tracked
- non-finite displacements

## How the Agent should read the three signals

Keep them **separate**. This package does not fuse them.

| Signal | High value means | Low value means |
| --- | --- | --- |
| `detection_confidence` | The local detector scored this box highly | Weak or no detection |
| `tracking_consistency` | The same target has been stable across frames | Flicker, jumps, dropouts, or too little history |
| `optical_flow` | Large measured image motion | Little motion, first frame, or invalid flow |

The Agent owns the policy that maps these signals to Tier 1 / reposition /
Tier 3.

## Tier 2 reset / re-run

Physical camera motion is owned by the hardware stack. After a reposition:

```python
pipeline.reset()   # clears tracker history and previous flow frame
result = pipeline.process(new_frame)
```

`reset()` does not move hardware and does not invent a new detection. The
next `process()` call is a first-frame for tracking and optical flow
(`tracking_consistency = 0.0`, `optical_flow = 0.0` until history rebuilds).

## Backend `/events` compatibility

`vision.events.to_confidence_breakdown(result)` returns:

```json
{
  "detection_confidence": 0.0,
  "tracking_consistency": 0.0,
  "optical_flow": 0.0
}
```

`to_event_contribution(result)` also includes `timestamp`. It does **not**
set `request_id`, `tier_resolved`, `action_taken`, or `cloud_cost_avoided`,
and it does **not** POST. Do not send an event for every frame.

## Configuration

All thresholds live in `vision.config.VisionConfig` (constructor, JSON, or
environment). Examples:

- `STEROPES_VISION_MODEL_PATH`
- `STEROPES_VISION_LABELS_PATH`
- `STEROPES_VISION_CLASS_NAMES`
- `STEROPES_VISION_PARSER`
- `STEROPES_VISION_DNN_BACKEND` / `STEROPES_VISION_DNN_TARGET`

Default DNN runtime is OpenCV / CPU, suitable as a starting point for
Raspberry Pi 5 and Jetson Orin Nano. CUDA / OpenCL can be selected later
without changing the result schema.

## Tests

```text
pytest tests/vision
```

Tests use synthetic numpy frames and scripted detectors. They do not open
a camera and do not require `vision/models/*.onnx`.

## Still required before field claims

- Team ONNX weights plus a matching `OutputParser` if the layout is not
  nx6/SSD
- Physical camera capture
- Hardware repositioning
- Agent policy, MQTT / IoT, Bedrock, and `/events` wiring
- On-device timing and accuracy evaluation
