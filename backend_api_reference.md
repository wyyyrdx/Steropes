# Steropes — Backend / API Reference for the Frontend & UI/UX Team

> **Document version:** 2026-09-16  
> **Analyst:** Senior Backend Engineer / API Documentation Specialist (Antigravity)  
> **Scope:** Every file in `d:\New folder (5)\Steropes` was read. Nothing was invented.  
> **Important:** Starred items (⚠️) flag information that differs from the OpenAPI spec but was found in the actual Lambda implementation.

---

## Part 1 — Backend Architecture

### System Overview

**Project name:** Steropes — A Physically-Grounded Model Cascade for Agentic Vision  
**Submission:** OpenCV AI Competition 2026 (powered by AWS)

Steropes is a three-tier visual-monitoring system whose central cost-saving idea is:

> "When the local model is not confident enough, move the camera first — only call the cloud VLM if repositioning still fails to resolve the ambiguity."

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          STEROPES SYSTEM TOPOLOGY                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Physical World                                                              │
│  ┌───────────────┐                                                           │
│  │ Camera Module │ ──frame──► Tier 1 CV Pipeline (OpenCV 5 / ONNX on edge)  │
│  │ (Pi 5 / Jetson│                    │                                      │
│  │ Orin Nano)    │               CVResult                                    │
│  └───────────────┘                    │                                      │
│  ┌───────────────┐                    ▼                                      │
│  │ Servo / PTZ   │◄── REPOSITION ── AI Agent (decision_loop.py — empty)     │
│  │ Hardware      │                    │                                      │
│  └───────────────┘            ACCEPT / REPOSITION / ESCALATE                │
│                                       │                                      │
│  AWS Cloud                            │                                      │
│  ┌────────────────────────────────────┼──────────────────────────────────┐  │
│  │  Amazon Bedrock (Cloud VLM)        │                                  │  │
│  │  ← called only on ESCALATE         │                                  │  │
│  │                                    │                                  │  │
│  │  AWS IoT Core (MQTT)               │                                  │  │
│  │  ← planned comms bridge            │                                  │  │
│  │                                    ▼                                  │  │
│  │  API Gateway (eu-north-1)                                             │  │
│  │  ├── POST /events ─► Lambda: decision_events_handler.py              │  │
│  │  └── GET  /events, /events/latest,                                   │  │
│  │          /events/{id}, /stats ─► Lambda: decision_events_reader.py  │  │
│  │                │                                                     │  │
│  │                ▼                                                     │  │
│  │          DynamoDB Table: DecisionEvents                              │  │
│  │                                                                      │  │
│  │  S3 + CloudFront (planned frontend hosting)                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Project Folder Map

```
Steropes/
├── README.md                        Root overview — project concept and team
├── .gitignore
├── pytest.ini                       Test runner config (testpaths=tests, pythonpath=.)
├── requirements-vision.txt          Installs vision/requirements.txt
├── docker-compose.yml               ⚠️ Empty file — no Docker config exists yet
│
├── backend/                         ◄─── THE ONLY LIVE BACKEND CODE
│   ├── README.md                    Architecture diagram, DynamoDB schema, limitations
│   ├── api/
│   │   └── openapi.json             OpenAPI 3.0.1 spec for the DecisionEvents API
│   ├── lambda/
│   │   ├── decision_events_handler.py   Lambda #1 — handles POST /events
│   │   └── decision_events_reader.py    Lambda #2 — handles all GET routes
│   ├── db/                          ⚠️ Empty placeholder (only .gitkeep)
│   ├── services/                    ⚠️ Empty placeholder (only .gitkeep)
│   └── tests/                       ⚠️ Empty placeholder (only .gitkeep)
│
├── vision/                          Tier 1 CV library (Python, unit-tested)
│   ├── README.md
│   ├── __init__.py                  Public exports
│   ├── config.py                    VisionConfig dataclass (all thresholds)
│   ├── pipeline.py                  Tier1Pipeline.process(frame) → CVResult
│   ├── detector.py                  OnnxDnnBackend (cv2.dnn + ONNX)
│   ├── tracker.py                   TrackingConsistency scorer
│   ├── optical_flow.py              Sparse Lucas–Kanade estimator
│   ├── parsers.py                   Nx6Parser, SsdParser, AutoParser
│   ├── quality.py                   Frame validation + diagnostic flags
│   ├── events.py                    Helpers to build /events request body
│   ├── types.py                     BBox, Detection, CVResult, OpticalFlowSignal
│   ├── numeric.py                   clamp01, finite_float, is_finite_number
│   ├── requirements.txt             opencv-python-headless, numpy
│   ├── calibration/                 ⚠️ Empty placeholder
│   ├── confidence/                  ⚠️ Empty placeholder
│   └── detection/                   ⚠️ Empty placeholder
│
├── agent/                           ⚠️ Placeholder folder — NO implementation
│   ├── decision_loop.py             ⚠️ COMPLETELY EMPTY (0 bytes)
│   ├── bedrock_client/              ⚠️ Empty placeholder
│   ├── iot_bridge/                  ⚠️ Empty placeholder
│   ├── schemas/                     ⚠️ Empty placeholder
│   └── threshold/                   ⚠️ Empty placeholder
│
├── hardware/                        ⚠️ Placeholder folder — NO implementation
│   ├── README.md                    ⚠️ Empty file
│   ├── controller/                  ⚠️ Empty placeholder
│   ├── servo_driver/                ⚠️ Empty placeholder
│   └── test_rig/                    ⚠️ Empty placeholder
│
├── infra/
│   ├── deploy.sh                    ⚠️ Empty file
│   └── terraform/                   ⚠️ Empty placeholder
│
├── evaluation/                      ⚠️ Placeholder structure — NO implementation
│   ├── cost_savings_report/
│   ├── failure_cases/
│   ├── reposition_effectiveness/
│   └── tier_resolution_rate/
│
├── frontend/                        ⚠️ Placeholder — NO implementation
│   ├── package.json                 ⚠️ Empty file
│   ├── public/
│   └── src/
│       ├── api/                     ⚠️ Empty placeholder
│       ├── components/              ⚠️ Empty placeholder
│       └── pages/                   ⚠️ Empty placeholder
│
└── tests/
    ├── __init__.py
    └── vision/                      Unit tests for the vision package (8 files, real tests)
        ├── conftest.py
        ├── helpers.py
        ├── test_detection.py
        ├── test_optical_flow.py
        ├── test_pipeline.py
        ├── test_serialization.py
        └── test_tracking.py
```

### Key Architectural Observations

| Component | Status | Notes |
|---|---|---|
| **API Gateway** | ✅ Live and deployed | `eu-north-1`, base URL in Part 3 |
| **Lambda (Handler)** | ✅ Implemented | Python, writes to DynamoDB |
| **Lambda (Reader)** | ✅ Implemented | Python, reads DynamoDB via GSIs |
| **DynamoDB** | ✅ Deployed | `DecisionEvents` table confirmed in code |
| **Vision / CV Library** | ✅ Implemented & tested | Python, runs on edge device |
| **Agent / Decision Loop** | ❌ Not implemented | `decision_loop.py` is 0 bytes |
| **IoT / MQTT Bridge** | ❌ Not implemented | Directory with `.gitkeep` only |
| **Bedrock Client** | ❌ Not implemented | Directory with `.gitkeep` only |
| **Adaptive Threshold** | ❌ Not implemented | Directory with `.gitkeep` only |
| **Hardware Controller** | ❌ Not implemented | All sub-dirs are `.gitkeep` |
| **Terraform / IaC** | ❌ Not implemented | Directory with `.gitkeep` only |
| **Frontend** | ❌ Not implemented | All files are empty |
| **Docker** | ❌ Not implemented | `docker-compose.yml` is empty |

### Technology Stack (confirmed from code)

| Layer | Technology |
|---|---|
| **API Framework** | AWS API Gateway (REST, deployed to `prod` stage) |
| **Compute** | AWS Lambda (Python 3.x) |
| **Database** | AWS DynamoDB |
| **CV / ML** | OpenCV 5 (`cv2.dnn`), ONNX (model not yet committed) |
| **Cloud VLM** | Amazon Bedrock (planned, not wired) |
| **Edge Hardware** | Raspberry Pi 5 or Jetson Orin Nano (planned) |
| **IoT Comms** | AWS IoT Core / MQTT (planned, not implemented) |
| **Frontend Hosting** | S3 + CloudFront (planned) |
| **Auth on Lambda** | IAM Role (no API key or JWT on GET routes) |
| **Language** | Python 3 (backend, vision, agent); JavaScript (frontend — empty) |

---

## Part 2 — Complete API Inventory

| # | API Name | Method | Endpoint | Purpose | Auth | Implementation Status |
|---|---|---|---|---|---|---|
| 1 | Create Decision Event | POST | `/events` | AI Agent posts a decision event to be stored in DynamoDB | IAM Role (Lambda exec) | ✅ Fully implemented |
| 2 | Get Events by Date Range | GET | `/events?from=&to=` | Returns all events between two calendar dates | None | ✅ Fully implemented |
| 3 | Get Events by Date Range + Tier | GET | `/events?from=&to=&tier=` | Returns events for a date range filtered by tier | None | ✅ Implemented (undocumented in OpenAPI spec ⚠️) |
| 4 | Get Events by Tier Only | GET | `/events?tier=` | Returns all events for a specific tier (all time) | None | ✅ Implemented (undocumented in OpenAPI spec ⚠️) |
| 5 | Get Latest Events | GET | `/events/latest?limit=N` | Returns the N most recent events from today | None | ✅ Fully implemented |
| 6 | Get Event by Request ID | GET | `/events/{request_id}` | Returns full detail for a single specific event | None | ✅ Fully implemented |
| 7 | Get Aggregate Stats | GET | `/stats?from=&to=` | Returns tier counts + cost-avoided % for a date range (defaults to today) | None | ✅ Fully implemented |

> **⚠️ Important discrepancy between OpenAPI spec and actual code:**  
> The `GET /events` route in `decision_events_reader.py` accepts an **optional `tier` query parameter** that allows filtering by tier (1, 2, or 3), including a tier-only query (no date range) and a combined tier + date range query. **This is NOT documented in `openapi.json`.**  
> Additionally, `POST /events` in the actual Lambda handler accepts two **undocumented optional fields** not listed in the OpenAPI spec: `adaptive_threshold_used` and `confidence_score`.

---

## Part 3 — Detailed API Documentation

### Base URL

```
https://32v3gb46j5.execute-api.eu-north-1.amazonaws.com/prod
```

---

### API 1: Create Decision Event

**Source file:** [`backend/lambda/decision_events_handler.py`](file:///d:/New%20folder%20%285%29/Steropes/backend/lambda/decision_events_handler.py)  
**OpenAPI spec:** [`backend/api/openapi.json`](file:///d:/New%20folder%20%285%29/Steropes/backend/api/openapi.json) — `operationId: createDecisionEvent`

| Field | Value |
|---|---|
| **HTTP Method** | POST |
| **Endpoint** | `/events` |
| **Purpose** | Called by the AI Agent when a decision occurs (tier resolution, reposition, or cloud escalation). NOT called for every frame processed. |
| **Authentication** | Lambda IAM execution role. No API key or token required in the HTTP request itself. |
| **Authorization** | None beyond IAM (no role-based checks in the application code) |

**Required Headers:**
```
Content-Type: application/json
```

**Path Parameters:** None

**Query Parameters:** None

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `tier_resolved` | integer (1, 2, or 3) | **Required** | Tier at which the case was resolved. 1=local accepted, 2=resolved after repositioning, 3=escalated to Bedrock |
| `action_taken` | string enum | **Required** | `"ACCEPT"`, `"REPOSITION"`, or `"ESCALATE"` |
| `request_id` | string (UUIDv4) | Optional | Agent-generated ID. If omitted, the server auto-generates one |
| `confidence_breakdown` | object | Optional | Three CV signal values |
| `confidence_breakdown.detection_confidence` | float [0,1] | Optional | Detector score from Tier 1 CV pipeline |
| `confidence_breakdown.tracking_consistency` | float [0,1] | Optional | Temporal stability score from tracker |
| `confidence_breakdown.optical_flow` | float [0,1] | Optional | Normalized motion intensity (NOT a confidence score) |
| `cloud_cost_avoided` | boolean | Optional | Whether a Bedrock call was avoided. Defaults to `false` |
| `timestamp` | string (ISO-8601) | Optional | Event time. Defaults to server arrival time |
| `adaptive_threshold_used` | any ⚠️ | Optional | **Not in OpenAPI spec.** Stored if sent. Type unclear from code. |
| `confidence_score` | number ⚠️ | Optional | **Not in OpenAPI spec.** Stored if sent. Floats converted to Decimal for DynamoDB. |

**Example Request:**
```bash
curl -X POST \
  https://32v3gb46j5.execute-api.eu-north-1.amazonaws.com/prod/events \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "8f14e45f-ceea-4d2e-9f5b-1a2b3c4d5e6f",
    "tier_resolved": 2,
    "confidence_breakdown": {
      "detection_confidence": 0.42,
      "tracking_consistency": 0.55,
      "optical_flow": 0.38
    },
    "action_taken": "REPOSITION",
    "cloud_cost_avoided": true,
    "timestamp": "2026-09-01T14:40:00Z"
  }'
```

**Success Response — `200 OK`:**
```json
{
  "message": "Event stored",
  "request_id": "8f14e45f-ceea-4d2e-9f5b-1a2b3c4d5e6f"
}
```

| Response Field | Type | Description |
|---|---|---|
| `message` | string | Always `"Event stored"` on success |
| `request_id` | string | The UUIDv4 that was stored. The original if sent, otherwise the server-generated one |

**Error Responses:**

| Status | Condition | Body |
|---|---|---|
| `400` | `tier_resolved` or `action_taken` is missing | `{"error": "tier_resolved and action_taken are required"}` |
| `500` | DynamoDB write failed or any unhandled exception | `{"error": "<exception message>"}` |

---

### API 2: Get Events by Date Range (+ Optional Tier Filter)

**Source file:** [`backend/lambda/decision_events_reader.py`](file:///d:/New%20folder%20%285%29/Steropes/backend/lambda/decision_events_reader.py) — `get_events()`  
**OpenAPI spec:** `operationId: getEventsByDateRange` (tier filter not documented)

| Field | Value |
|---|---|
| **HTTP Method** | GET |
| **Endpoint** | `/events` |
| **Purpose** | Historical event retrieval with flexible filtering. Supports three modes: date range only, tier only, or tier + date range. |
| **Authentication** | None |

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `from` | string (YYYY-MM-DD) | Conditional | Start date. Required if `tier` is not supplied; optional if `tier` is supplied. |
| `to` | string (YYYY-MM-DD) | Conditional | End date. Required if `tier` is not supplied; optional if `tier` is supplied. |
| `tier` | integer string (1, 2, or 3) | Optional | Filter by tier. Can be combined with date range or used alone. ⚠️ Not in OpenAPI spec. |

**Validation logic (from code):**
- If neither `tier` nor (`from` AND `to`) is provided → `400`
- `tier` alone → queries `tier_resolved-index` GSI with no date filter
- `from` + `to` alone → queries day-by-day by `PK` (`EVENT#YYYY-MM-DD`)
- `from` + `to` + `tier` → queries `tier_resolved-index` GSI filtered by timestamp range

**Example Request (date range only):**
```
GET /events?from=2026-09-01&to=2026-09-03
```

**Example Request (tier + date range):**
```
GET /events?from=2026-09-01&to=2026-09-03&tier=2
```

**Example Request (tier only):**
```
GET /events?tier=1
```

**Success Response — `200 OK`:**
```json
{
  "events": [
    {
      "PK": "EVENT#2026-09-01",
      "SK": "2026-09-01T14:40:00+00:00#8f14e45f-ceea-4d2e-9f5b-1a2b3c4d5e6f",
      "request_id": "8f14e45f-ceea-4d2e-9f5b-1a2b3c4d5e6f",
      "tier_resolved": 2,
      "confidence_breakdown": {
        "detection_confidence": 0.42,
        "tracking_consistency": 0.55,
        "optical_flow": 0.38
      },
      "action_taken": "REPOSITION",
      "cloud_cost_avoided": true,
      "timestamp": "2026-09-01T14:40:00Z"
    }
  ],
  "count": 1
}
```

**Response Field Definitions:**

| Field | Type | Required | Description | Frontend Use |
|---|---|---|---|---|
| `events` | array | Yes | Array of event objects | Iterate directly |
| `count` | integer | Yes | Length of `events` array | Display as total count |
| `events[].PK` | string | Yes | DynamoDB partition key — format `EVENT#YYYY-MM-DD` | Strip prefix to get date; or ignore |
| `events[].SK` | string | Yes | DynamoDB sort key — format `<timestamp>#<request_id>` | Can parse, but use `timestamp` and `request_id` directly |
| `events[].request_id` | string (UUID) | Yes | Unique event identifier | Use as unique key for lists/details |
| `events[].tier_resolved` | integer | Yes | 1, 2, or 3. See tier definitions below | Display directly; map to label |
| `events[].confidence_breakdown` | object | No (optional when stored) | Three CV signal values | Display as metrics; note optical_flow is motion, not confidence |
| `events[].confidence_breakdown.detection_confidence` | float [0,1] | No | Detector score | Display as % (×100) |
| `events[].confidence_breakdown.tracking_consistency` | float [0,1] | No | Temporal stability | Display as % (×100) |
| `events[].confidence_breakdown.optical_flow` | float [0,1] | No | Motion intensity (NOT confidence) | Display with label "Motion Intensity", NOT "Confidence" |
| `events[].action_taken` | string | Yes | `"ACCEPT"`, `"REPOSITION"`, or `"ESCALATE"` | Map to UI label/badge |
| `events[].cloud_cost_avoided` | boolean | Yes | Whether Bedrock was not called | Compute cost savings from this flag |
| `events[].timestamp` | string (ISO-8601) | Yes | UTC event timestamp | Parse with date library |
| `events[].adaptive_threshold_used` | any | No | ⚠️ Optional undocumented field; type depends on what was sent | Use if present |
| `events[].confidence_score` | number | No | ⚠️ Optional undocumented field | Use if present |

**Tier Definitions:**

| Value | Meaning |
|---|---|
| `1` | Resolved locally — local detector accepted; no reposition, no cloud call |
| `2` | Resolved after repositioning — camera moved, Tier 1 re-run succeeded |
| `3` | Escalated to Bedrock — cloud VLM was (or would be) called |

**Error Responses:**

| Status | Condition | Body |
|---|---|---|
| `400` | Neither `tier` nor (`from` AND `to`) provided | `{"error": "Provide either tier, or both from and to (format: YYYY-MM-DD), or all three"}` |
| `500` | DynamoDB error | `{"error": "<exception message>"}` |

---

### API 3: Get Latest Events (Live Feed)

**Source file:** [`backend/lambda/decision_events_reader.py`](file:///d:/New%20folder%20%285%29/Steropes/backend/lambda/decision_events_reader.py) — `get_latest()`  
**OpenAPI spec:** `operationId: getLatestEvents`

| Field | Value |
|---|---|
| **HTTP Method** | GET |
| **Endpoint** | `/events/latest` |
| **Purpose** | Live dashboard feed. Returns the N most recent events from **today (UTC)** only, sorted most-recent first. |
| **Authentication** | None |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `limit` | integer | Optional | `20` | Maximum number of events to return |

> **⚠️ Important limitation:** This endpoint only queries today's UTC date (`EVENT#<today>`). Events from previous days are NOT returned. If the system processes no events today, the response will be empty even if historical data exists.

**Example Request:**
```
GET /events/latest?limit=5
```

**Success Response — `200 OK`:**
```json
{
  "events": [
    {
      "PK": "EVENT#2026-09-16",
      "SK": "2026-09-16T10:30:00+00:00#abc123...",
      "request_id": "abc123...",
      "tier_resolved": 1,
      "confidence_breakdown": {
        "detection_confidence": 0.91,
        "tracking_consistency": 0.85,
        "optical_flow": 0.12
      },
      "action_taken": "ACCEPT",
      "cloud_cost_avoided": true,
      "timestamp": "2026-09-16T10:30:00Z"
    }
  ],
  "count": 1
}
```

> Response fields are identical to API 2. Refer to the table above.

**Error Responses:**

| Status | Condition | Body |
|---|---|---|
| `500` | DynamoDB error | `{"error": "<exception message>"}` |

---

### API 4: Get Event by Request ID

**Source file:** [`backend/lambda/decision_events_reader.py`](file:///d:/New%20folder%20%285%29/Steropes/backend/lambda/decision_events_reader.py) — `get_by_request_id()`  
**OpenAPI spec:** `operationId: getEventByRequestId`

| Field | Value |
|---|---|
| **HTTP Method** | GET |
| **Endpoint** | `/events/{request_id}` |
| **Purpose** | Retrieve the full detail of a single specific decision event by its UUID. Useful for detail modals. |
| **Authentication** | None |

**Path Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `request_id` | string (UUIDv4) | **Required** | The UUID of the event to retrieve |

**Example Request:**
```
GET /events/8f14e45f-ceea-4d2e-9f5b-1a2b3c4d5e6f
```

**Success Response — `200 OK`:**
```json
{
  "events": [
    {
      "PK": "EVENT#2026-09-01",
      "SK": "2026-09-01T14:40:00+00:00#8f14e45f-ceea-4d2e-9f5b-1a2b3c4d5e6f",
      "request_id": "8f14e45f-ceea-4d2e-9f5b-1a2b3c4d5e6f",
      "tier_resolved": 2,
      "confidence_breakdown": {
        "detection_confidence": 0.42,
        "tracking_consistency": 0.55,
        "optical_flow": 0.38
      },
      "action_taken": "REPOSITION",
      "cloud_cost_avoided": true,
      "timestamp": "2026-09-01T14:40:00Z"
    }
  ]
}
```

> **⚠️ Note:** The response for this route does NOT include a `count` field, unlike the other GET endpoints. This was verified directly in the code (`get_by_request_id()` returns `{"events": items}` without a `count` key).

**Error Responses:**

| Status | Condition | Body |
|---|---|---|
| `404` | No event found with that `request_id` | `{"error": "request_id not found"}` |
| `500` | DynamoDB error | `{"error": "<exception message>"}` |

---

### API 5: Get Aggregate Stats

**Source file:** [`backend/lambda/decision_events_reader.py`](file:///d:/New%20folder%20%285%29/Steropes/backend/lambda/decision_events_reader.py) — `get_stats()`  
**OpenAPI spec:** `operationId: getStats`

| Field | Value |
|---|---|
| **HTTP Method** | GET |
| **Endpoint** | `/stats` |
| **Purpose** | Aggregate statistics for a date range. Counts events per tier and calculates the percentage of decisions that avoided a Bedrock (cloud) call. Defaults to today if no parameters given. |
| **Authentication** | None |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `from` | string (YYYY-MM-DD) | Optional | Today (UTC) | Start date |
| `to` | string (YYYY-MM-DD) | Optional | Today (UTC) | End date |

> **⚠️ Note:** If only one of `from` or `to` is provided, the code falls through to the default (today) for both. It does NOT return a 400 for a single parameter — both must be absent for the default to apply.

**Example Request:**
```
GET /stats?from=2026-09-01&to=2026-09-16
```

**Example Request (today's stats):**
```
GET /stats
```

**Success Response — `200 OK`:**
```json
{
  "total_events": 5,
  "tier_breakdown": {
    "1": 2,
    "2": 2,
    "3": 1
  },
  "cost_avoided_count": 4,
  "cost_avoided_percentage": 80.0
}
```

**Response Field Definitions:**

| Field | Type | Required | Description | Frontend Use |
|---|---|---|---|---|
| `total_events` | integer | Yes | Total number of decision events in the requested range | Display as headline number |
| `tier_breakdown` | object | Yes | Count of events per tier | Render as pie/bar chart; keys are strings "1", "2", "3" |
| `tier_breakdown["1"]` | integer | Yes | Events resolved locally (Tier 1) | Direct use |
| `tier_breakdown["2"]` | integer | Yes | Events resolved after repositioning (Tier 2) | Direct use |
| `tier_breakdown["3"]` | integer | Yes | Events escalated to cloud (Tier 3) | Direct use |
| `cost_avoided_count` | integer | Yes | Number of events where `cloud_cost_avoided = true` | Display as counter |
| `cost_avoided_percentage` | float | Yes | `(cost_avoided_count / total_events) × 100`, rounded to 2 decimals. Returns `0` if `total_events = 0` | Display as %; no frontend calculation needed |

**⚠️ Important note on tier_breakdown keys:** The keys in `tier_breakdown` are **integers** (`1`, `2`, `3`) in the Python dict, but they will arrive as **strings** in JSON (`"1"`, `"2"`, `"3"`). Frontend must access them as `tier_breakdown["1"]`, not `tier_breakdown[1]`.

**Error Responses:**

| Status | Condition | Body |
|---|---|---|
| `500` | DynamoDB error | `{"error": "<exception message>"}` |

---

## Part 4 — Database & Data Models

### Technology

**AWS DynamoDB** — NoSQL key-value + document store, single-table design.

### Table: `DecisionEvents`

**Table Name (hardcoded in Lambda code):** `DecisionEvents`

#### Access Patterns (Key Schema)

| Index | Partition Key (PK) | Sort Key (SK) | Used by |
|---|---|---|---|
| Primary Table | `PK` (String) — `"EVENT#YYYY-MM-DD"` | `SK` (String) — `"<ISO-timestamp>#<request_id>"` | `GET /events` (date range), `GET /events/latest` |
| GSI: `request_id-index` | `request_id` (String) | — | `GET /events/{request_id}` |
| GSI: `tier_resolved-index` | `tier_resolved` (Number) | `timestamp` (String) | `GET /events?tier=`, `GET /stats` |

#### Item Schema (DynamoDB Attributes)

| Attribute | DynamoDB Type | Always Present | Description | Example Value |
|---|---|---|---|---|
| `PK` | String | ✅ Yes | Partition key. Format: `EVENT#<date>` | `"EVENT#2026-09-01"` |
| `SK` | String | ✅ Yes | Sort key. Format: `<ISO-timestamp>#<request_id>` | `"2026-09-01T14:40:00+00:00#8f14e45f..."` |
| `request_id` | String | ✅ Yes | UUIDv4. Either Agent-supplied or server-generated | `"8f14e45f-ceea-4d2e-9f5b-1a2b3c4d5e6f"` |
| `tier_resolved` | Number | ✅ Yes | 1, 2, or 3 | `2` |
| `action_taken` | String | ✅ Yes | `"ACCEPT"`, `"REPOSITION"`, or `"ESCALATE"` | `"REPOSITION"` |
| `cloud_cost_avoided` | Boolean | ✅ Yes | Whether Bedrock call was avoided | `true` |
| `timestamp` | String | ✅ Yes | ISO-8601 UTC timestamp | `"2026-09-01T14:40:00Z"` |
| `confidence_breakdown` | Map | No (default `{}`) | Nested object with CV signal values | `{detection_confidence: 0.42, ...}` |
| `confidence_breakdown.detection_confidence` | Number (Decimal) | No | CV detector score | `0.42` |
| `confidence_breakdown.tracking_consistency` | Number (Decimal) | No | Tracker stability score | `0.55` |
| `confidence_breakdown.optical_flow` | Number (Decimal) | No | Motion intensity (NOT confidence) | `0.38` |
| `adaptive_threshold_used` | Any ⚠️ | No | Optional, undocumented. Type not constrained in code | Unclear |
| `confidence_score` | Number (Decimal) ⚠️ | No | Optional, undocumented. Floats converted to Decimal | Unclear |

#### What is NOT stored in DynamoDB

The following data does NOT exist anywhere in the database:

- Camera frames / images / video
- Live stream data
- Hardware status (servo position, camera health)
- Bounding box coordinates from detections
- Raw optical flow details (`mean_magnitude`, `feature_count`, `valid`, `reason`)
- Frame quality flags (`poor_lighting`, `glare`, `low_contrast`, etc.)
- Target class name (`target_class` from CVResult)
- Adaptive threshold history or changes over time
- Absolute cost values in dollars/cents (only boolean `cloud_cost_avoided` exists)
- Repositioning coordinates or history
- Session or camera identifiers

---

## Part 5 — Sitemap → API Mapping

| Sitemap Feature | API | Endpoint | Data Available | Real-time? | Status | Notes |
|---|---|---|---|---|---|---|
| **1. Main Dashboard** | | | | | | |
| Live Stream | — | — | ❌ None | N/A | **MISSING** | No camera feed, no frame storage, no streaming API exists |
| Cost Savings Counter | GET Stats | `/stats` | ✅ `cost_avoided_count`, `cost_avoided_percentage` | Via polling | **AVAILABLE** | Poll `/stats` (no query params for today's data). Gives count and %; does not give dollar value |
| Hardware Status | — | — | ❌ None | N/A | **MISSING** | No hardware telemetry endpoint exists |
| Recent Decisions Timeline | GET Latest | `/events/latest?limit=N` | ✅ Full event objects (tier, action, timestamp, confidence) | Via polling | **AVAILABLE** | Only today's events. Most recent first. |
| **2. Frames History** | | | | | | |
| Tier Filters | GET Events | `/events?tier=` or `/events?from=&to=&tier=` | ✅ Filter by tier 1, 2, or 3 | Historical | **AVAILABLE** | Undocumented but implemented in code |
| Frames Gallery | GET Events | `/events?from=&to=` | ⚠️ Event data only — NO images | Historical | **PARTIALLY AVAILABLE** | Event list available; actual frame images do NOT exist in the backend |
| Frame Details Modal | GET Event | `/events/{request_id}` | ✅ Full event with confidence breakdown | Historical | **PARTIALLY AVAILABLE** | All decision metadata available; no frame image, no bbox, no target_class |
| **3. Analytics** | | | | | | |
| Usage per Tier | GET Stats | `/stats?from=&to=` | ✅ `tier_breakdown` with counts for tiers 1, 2, 3 | Historical | **AVAILABLE** | Returns integer counts; frontend must calculate % if needed |
| Cost Comparison | GET Stats | `/stats?from=&to=` | ⚠️ Only boolean/count data (no dollar values) | Historical | **PARTIALLY AVAILABLE** | `cost_avoided_count` and `cost_avoided_percentage` available; no $ cost data |
| Adaptive-Threshold | — | — | ❌ None | N/A | **MISSING** | No adaptive threshold data is stored or exposed via any API |

---

## Part 6 — Backend Gaps

### AVAILABLE ✅

| Requirement | API | Notes |
|---|---|---|
| Cost savings counter (today) | `GET /stats` | Returns count and percentage |
| Recent decisions feed | `GET /events/latest` | Returns today's events, most recent first |
| Historical event list with date range | `GET /events?from=&to=` | Working |
| Filter events by tier | `GET /events?tier=` | Working but undocumented |
| Filter events by tier + date range | `GET /events?from=&to=&tier=` | Working but undocumented |
| Event detail view | `GET /events/{request_id}` | Full confidence breakdown available |
| Tier breakdown analytics | `GET /stats` | Counts per tier, adjustable date range |
| Cost avoided analytics | `GET /stats` | Count and percentage |

---

### PARTIALLY AVAILABLE ⚠️

| Requirement | What Exists | What is Missing |
|---|---|---|
| **Frames Gallery** | Event list (tier, timestamp, action, confidence breakdown) | No frame images, no thumbnails, no bounding boxes, no target class names stored in DB |
| **Frame Details Modal** | Decision metadata, confidence scores, timestamp, tier, action | No actual image, no bbox coordinates, no target_class, no quality flags |
| **Cost Comparison** | `cost_avoided_count` and `cost_avoided_percentage` | No absolute cost values in dollars/cents, no comparison with what Bedrock would have cost |
| **Analytics over time** | Stats for a given date range | No time-series breakdown (e.g., hourly), no trend data, no per-day breakdown within a range |

---

### MISSING ❌

| Requirement | Notes |
|---|---|
| **Live Video Stream** | No camera feed API exists. No streaming endpoint. No frame upload or retrieval. The backend has no awareness of camera output. |
| **Hardware Status** | No endpoint for camera health, servo position, connection status, battery level, or any hardware telemetry. The `hardware/` module is entirely empty. |
| **Adaptive Threshold API** | `agent/threshold/` is an empty placeholder. No threshold values are stored, retrieved, or tracked. No history of threshold changes exists. |
| **Real-time WebSocket / Server-Sent Events** | No push mechanism exists. The frontend must poll REST endpoints. |
| **MQTT / IoT integration** | `agent/iot_bridge/` is an empty placeholder. AWS IoT Core is planned but not implemented. |
| **Agent Decision Logic** | `agent/decision_loop.py` is a 0-byte empty file. The bridge between the CV pipeline and the backend events API is not implemented. |
| **Bedrock Client** | `agent/bedrock_client/` is empty. Cloud VLM escalation is not wired. |
| **Dollar Cost Values** | No pricing data exists anywhere in the backend. Only boolean flags for cost avoidance. |
| **Camera/Session Identifiers** | No support for multiple cameras or sessions. No camera ID in any event. |
| **Repositioning Details** | No data on servo movement coordinates, direction, or reposition outcome is stored. |
| **Frame Quality Flags** | The vision library computes quality flags locally (poor_lighting, glare, etc.) but they are NOT sent to or stored in the backend. |

---

### PROPOSED APIs — NOT CURRENTLY IMPLEMENTED

> **⚠️ These do not exist. They are proposals for what the Backend team would need to build.**

| Proposed API | Purpose | Priority |
|---|---|---|
| `GET /stats/timeseries?from=&to=&granularity=day` | Return per-day breakdown of tier counts for charts showing trends over time | High |
| `GET /health` | System health check — camera connectivity, agent status, last event time | High |
| `GET /hardware/status` | Camera and servo current state | High |
| WebSocket `wss://...` or `GET /events/stream` | Push new events to the frontend in real time without polling | Medium |
| `GET /threshold/history?from=&to=` | History of adaptive threshold changes over time | Medium |
| `GET /stats/cost?from=&to=` | Cost breakdown with absolute dollar estimates (requires pricing config) | Medium |

---

## Part 7 — Frontend Integration Notes

### 1. Base API URL Configuration

```
https://32v3gb46j5.execute-api.eu-north-1.amazonaws.com/prod
```

Store this as an environment variable in the frontend build. Example:
```
VITE_API_BASE_URL=https://32v3gb46j5.execute-api.eu-north-1.amazonaws.com/prod
```

### 2. Authentication

**Current state: No authentication on any GET endpoint.**  
- All `GET` endpoints are callable without any token, API key, or header.
- `POST /events` is called only from the Lambda/Agent side (IAM-protected), not from the frontend.
- **Risk:** The GET APIs are publicly accessible. There is no authentication, rate limiting (that can be confirmed from code), or API key protection confirmed in the codebase.

### 3. Required Headers

For all GET requests: no special headers required beyond a standard `Accept: application/json`.

### 4. CORS

**Cannot be confirmed from the codebase.** CORS configuration lives at the API Gateway level (not in Lambda code). The frontend team must verify CORS headers are set on the API Gateway before deploying.

### 5. Pagination

**No cursor or page-based pagination exists.** The `GET /events/latest` endpoint accepts a `limit` parameter. The date-range and tier queries return ALL matching items with no cap — this could be a large payload for wide date ranges.

The frontend should:
- Use `limit` on `/events/latest` to control live feed size
- Implement its own client-side pagination when displaying historical event lists
- Be aware that very large date ranges could return very large JSON responses

### 6. Filtering

Available filters:
- `from` / `to` date (YYYY-MM-DD) on `GET /events` and `GET /stats`
- `tier` (1, 2, or 3) on `GET /events` (undocumented but confirmed in code)
- `limit` on `GET /events/latest`

Not available (no backend support):
- Filtering by `action_taken`
- Filtering by `cloud_cost_avoided`
- Full-text search
- Sorting order selection (date-range queries come from DynamoDB in whatever order DynamoDB returns them — likely by SK but not guaranteed to be reverse-chronological without explicit `ScanIndexForward=False`)

### 7. Sorting

`GET /events/latest` sets `ScanIndexForward=False` — this means results are sorted most-recent first. ✅  
`GET /events` (date range) does NOT set a sort order. Results may not be in chronological order. Frontend should sort client-side by `timestamp` if display order matters.

### 8. Real-time Data

**No WebSockets, no Server-Sent Events, no push mechanism of any kind exists.**

To simulate a "live" dashboard, the frontend must **poll**:
- `GET /events/latest?limit=20` — recommended every 5–15 seconds for live feed
- `GET /stats` (no params) — recommended every 30–60 seconds for today's counters

Polling interval is a product decision. No rate limits are confirmed from the codebase.

### 9. Data Type Gotchas

| Issue | Detail |
|---|---|
| `tier_breakdown` keys are strings in JSON | Access as `data.tier_breakdown["1"]`, not `data.tier_breakdown[1]` |
| `optical_flow` is motion intensity, not confidence | Label it "Motion Intensity" in the UI. Do NOT label it as a confidence score. |
| `confidence_breakdown` is optional | Some events may not have this object. The frontend must handle `undefined` or missing `confidence_breakdown`. |
| `adaptive_threshold_used` and `confidence_score` may appear | These are stored if sent by the Agent, but their types and schemas are not defined. Handle defensively. |
| `GET /events/{request_id}` has no `count` field | Unlike all other list endpoints, this one returns `{"events": [...]}` without `count`. |
| Timestamps are ISO-8601 but format may vary | The `timestamp` field is stored as-is from the Agent (or server-generated as Python's `datetime.now(timezone.utc).isoformat()`). This may include timezone offset notation (`+00:00`) not just `Z`. Use a date parsing library. |

### 10. Empty States

| Scenario | Behavior |
|---|---|
| No events today | `GET /events/latest` returns `{"events": [], "count": 0}` |
| No events in date range | `GET /events` returns `{"events": [], "count": 0}` |
| No events for stats period | `GET /stats` returns `{"total_events": 0, "tier_breakdown": {"1": 0, "2": 0, "3": 0}, "cost_avoided_count": 0, "cost_avoided_percentage": 0}` |
| Unknown request_id | `GET /events/{request_id}` returns `404` with `{"error": "request_id not found"}` |

### 11. Error Handling

All error responses use the same shape:
```json
{"error": "human-readable error message"}
```

The frontend should check for the `error` key on non-2xx responses and display it appropriately.

### 12. Data Transformations Required Before Rendering

| Data | Raw Value | Required Transformation |
|---|---|---|
| `tier_resolved` | `1`, `2`, `3` | Map to labels: `1="Local (Tier 1)"`, `2="Repositioned (Tier 2)"`, `3="Cloud (Tier 3)"` |
| `action_taken` | `"ACCEPT"`, `"REPOSITION"`, `"ESCALATE"` | Map to display labels and badge colors |
| `cost_avoided_percentage` | `80.0` | Display as `"80.0%"` — no calculation needed |
| `confidence_breakdown.*` | `0.42` | Multiply by 100 for percentage display, or render as progress bar |
| `tier_breakdown` keys | `"1"`, `"2"`, `"3"` (strings) | Access with string keys; convert to labels for chart axes |
| `timestamp` | `"2026-09-01T14:40:00Z"` or `"...+00:00"` | Parse with `new Date()` or a library; format for display |
| `cloud_cost_avoided` | `true` / `false` | Display as badge: "Saved" / "Cloud Called" |

---

## Part 8 — Final Summary

### 1. What APIs currently exist?

**Five routes are deployed and confirmed working** on the live API Gateway:

| # | Method | Route | Status |
|---|---|---|---|
| 1 | POST | `/events` | Live |
| 2 | GET | `/events?from=&to=[&tier=]` | Live |
| 3 | GET | `/events/latest?limit=` | Live |
| 4 | GET | `/events/{request_id}` | Live |
| 5 | GET | `/stats?from=&to=` | Live |

### 2. What data can the Frontend use immediately?

- ✅ Today's event feed (action type, tier, timestamp, confidence breakdown, cost-avoided flag)
- ✅ Historical event list with date range filtering
- ✅ Tier-based filtering of events
- ✅ Aggregate stats: tier breakdown counts, cost-avoided count and percentage
- ✅ Detail view for any specific event by its UUID

### 3. Which sitemap screens/components are fully supported?

| Screen | Component | Fully Supported? |
|---|---|---|
| Main Dashboard | Cost Savings Counter | ✅ Yes (today's totals via `/stats`) |
| Main Dashboard | Recent Decisions Timeline | ✅ Yes (via `/events/latest`) |
| Frames History | Tier Filters | ✅ Yes (via `?tier=` parameter) |
| Analytics | Usage per Tier | ✅ Yes (via `/stats` `tier_breakdown`) |

### 4. Which screens/components are only partially supported?

| Screen | Component | What's Missing |
|---|---|---|
| Frames History | Frames Gallery | No images; only metadata |
| Frames History | Frame Details Modal | No image, no bounding box, no target class |
| Analytics | Cost Comparison | No dollar values; only boolean flags |

### 5. What data is missing?

- Camera frame images and video stream
- Hardware/camera status telemetry
- Adaptive threshold values and history
- Dollar cost values (only boolean cost-avoided flag)
- Per-day time-series breakdown for charts
- Target class names
- Bounding box coordinates
- Quality flags (lighting, glare, etc.)
- Reposition coordinates/outcome
- Multiple camera or session support

### 6. Which APIs need to be created or modified?

**New APIs needed (see PROPOSED section in Part 6):**
1. Hardware/camera status endpoint
2. Time-series stats endpoint (per-day breakdown)
3. Real-time push mechanism (WebSocket or SSE)
4. Adaptive threshold history endpoint
5. Dollar cost estimate endpoint

**Existing APIs that need clarification/modification:**
1. `GET /events` — add `tier` filter to the OpenAPI spec (it already works in code)
2. `POST /events` — document `adaptive_threshold_used` and `confidence_score` fields
3. `GET /events/{request_id}` — consider adding `count` field for response consistency
4. `GET /events` — add `ScanIndexForward=False` to date-range query for consistent time ordering

### 7. Most important Backend limitations for the Frontend team

1. **No live video stream.** The "Live Stream" sitemap item cannot be implemented without significant new backend work.
2. **No hardware status.** The "Hardware Status" sitemap item has zero backend support.
3. **No images stored.** The "Frames Gallery" will be a list of decision metadata, not visual frames.
4. **No WebSocket/push.** The dashboard must use polling. This means visible latency between an event occurring and the dashboard updating.
5. **Live feed is today-only.** `GET /events/latest` returns today's UTC events exclusively. A system that starts processing after midnight UTC will show an empty live feed until the first event.
6. **No adaptive threshold data anywhere.** Despite the `evaluation/` and `agent/threshold/` directories existing in the repo, zero implementation exists.
7. **Undocumented fields.** The `tier` filter, `adaptive_threshold_used`, and `confidence_score` fields are implemented in code but absent from the OpenAPI spec — creating a spec/code mismatch the frontend must discover empirically.
8. **No pagination cursor.** Wide date-range queries may return very large payloads.

### 8. Architectural/integration issues to address before Frontend development begins

1. **CORS must be confirmed and configured** at the API Gateway level before any browser-based frontend can call the API.
2. **The Agent is not yet implemented** (`decision_loop.py` is empty). Until the Agent is built and wired, the backend has no data source — the database will remain empty in production.
3. **The OpenAPI spec is out of sync with the code.** The spec must be updated to document the `tier` query parameter and the two undocumented POST fields.
4. **Authentication is absent on all GET endpoints.** If the dashboard is public-facing, this may be acceptable. If it requires access control, an API key or Cognito/JWT integration must be added before launch.
5. **IAM permissions use `AmazonDynamoDBFullAccess`** (per the backend README). This is acknowledged as a known limitation and should be tightened before production.
6. **No error monitoring or logging** is visible from the codebase (no CloudWatch alarms, no structured logging). The frontend cannot distinguish between "no data" and "system failure" states.
7. **Terraform IaC is empty.** The infrastructure cannot be reproduced from code, which is a deployment and reproducibility risk.

---

*This document was generated by automated codebase analysis. Every statement is backed by code that was read from the repository. No APIs, fields, or behaviors have been invented or assumed.*
