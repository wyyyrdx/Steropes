# Steropes — Complete Frontend / UI/UX Implementation Plan

> **Document version:** 2026-09-16  
> **Role:** Senior Product Designer, UX/UI Designer, Frontend Architect  
> **Project:** Physically-Grounded Model Cascade — OpenCV AI Competition 2026  
> **Scope:** Figma design → coded UI → backend integration  
> **Ground truth for APIs:** Backend API Reference (analyzed 2026-09-16)

---

## 1. Executive Summary

Steropes is a three-tier visual monitoring system that reduces expensive cloud VLM calls by first trying local detection (Tier 1), then physically repositioning the camera (Tier 2), and only escalating to Amazon Bedrock (Tier 3) when absolutely necessary.

The frontend is a **competition-grade monitoring dashboard** with three pages:

| Page | Purpose |
|---|---|
| **Main Dashboard** | Live operational view — current status, cascade decisions, cost savings |
| **Frames History** | Historical log of every decision event with filters and detail modal |
| **Analytics** | Aggregate metrics — tier distribution, cost avoided, adaptive threshold |

**Current backend status:** 5 REST endpoints are live. No WebSocket, no live video, no hardware status, no adaptive threshold. The entire UI will be built with mock data first and progressively connected to real APIs.

**Competition priority:** The UI must instantly communicate the cascade concept — Tier 1 → Tier 2 → Tier 3 — to a judge who has 60 seconds to evaluate the product.

---

## 2. Product Understanding

### What the product does

Steropes monitors a physical scene using a camera attached to a pan/tilt rig. Instead of immediately calling an expensive cloud VLM when local confidence is low, the system:

1. Tries to resolve the event locally using OpenCV + ONNX (Tier 1)
2. Physically moves the camera to a better angle and retries (Tier 2)
3. Only calls Amazon Bedrock if both local attempts fail (Tier 3)

Every decision is recorded as a `DecisionEvent` and stored in DynamoDB. The frontend visualizes these events in real time (via polling) and historically.

### What the frontend's responsibility is

The frontend is **read-only** for the competition. It consumes events and statistics produced by the backend and presents them clearly. The one write operation (`POST /events`) is performed by the AI Agent, not by the user.

Frontend responsibilities:
- Display the live cascade decision feed
- Show confidence breakdown per event
- Visualize tier distribution
- Communicate cost savings
- Display hardware status (mock initially)
- Present historical events with filters
- Show analytics over time

### How the three-tier cascade should be represented visually

The cascade must be communicated as a **progression**:

```
[ Tier 1 ] ──── confidence OK ────────────────► RESOLVED (green)
    │
    └── confidence too low ──► [ Tier 2 ] ─── confidence OK ──► RESOLVED (amber)
                                    │
                                    └── still low ──► [ Tier 3 ] ──► ESCALATED (red)
```

This flow should be visible on:
- Every event card (which tier it resolved at)
- The live monitoring cascade status widget
- The Frame Details modal
- The analytics tier distribution chart

Use color + icon + label together — never color alone.

### What information is most important for a competition judge

A judge needs to understand in under 60 seconds:

1. **The cascade works** — Tier 1 and Tier 2 are resolving events before cloud
2. **Cloud calls are being saved** — cost_avoided_percentage is prominent
3. **The system is live** — events are flowing in real time
4. **Confidence drives decisions** — the three confidence signals are visible
5. **Physical repositioning is real** — Tier 2 events with pan/tilt data are shown

### Primary user journey through the dashboard

```
Land on Main Dashboard
  └─► See live event feed + current cost savings counter
  └─► Notice most events are Tier 1 or Tier 2 (not escalated)
  └─► Click an event → Frame Details Modal → see confidence breakdown + tier decision
  └─► Navigate to Analytics → see tier distribution pie + cost comparison bar
  └─► Navigate to Frames History → filter by Tier 3 → see what required cloud escalation
```

---

## 3. Frontend Responsibilities

| Responsibility | Detail |
|---|---|
| Visualization | Tier cascade, confidence, cost, hardware, events |
| Data consumption | Poll 5 live REST endpoints; use mock for missing APIs |
| Progressive enhancement | Mock → Real API swap without UI redesign |
| Competition demo | Guide a judge through the cascade value proposition in < 2 minutes |
| Responsiveness | Desktop primary; tablet/mobile acceptable |
| Accessibility | WCAG AA color contrast, keyboard nav, semantic HTML |
| State management | Loading, empty, error, stale-data states for every component |

---

## 4. Information Architecture

### Top-level navigation

```
Steropes Dashboard
├── Main Dashboard        /               (default route)
├── Frames History        /frames
└── Analytics             /analytics
```

No authentication screen. No user settings. No other pages.

### Main Dashboard — IA

```
Main Dashboard
├── Header (global)
│   ├── Logo + Project name
│   ├── Live indicator (pulse dot + "LIVE" / "POLLING")
│   └── Navigation links
├── Live Monitoring Section
│   ├── Live Stream Widget          [MOCK/PENDING — no real stream]
│   ├── Current Detection           [MOCK/PENDING]
│   ├── Confidence Gauge            [MOCK/PENDING]
│   ├── Current Tier Badge          [MOCK/PENDING]
│   └── Cascade Status Flow         [MOCK/PENDING]
├── Cost Savings Section
│   ├── Total Events card           [REAL — /stats]
│   ├── Cloud Calls Avoided card    [REAL — /stats]
│   ├── Cost Avoided % card         [REAL — /stats]
│   └── Estimated Savings card      [MOCK — no dollar value in backend]
├── Hardware Status Section
│   ├── Camera status               [MOCK/PENDING]
│   ├── Pan/Tilt status             [MOCK/PENDING]
│   ├── Edge Device status          [MOCK/PENDING]
│   ├── Agent status                [MOCK/PENDING]
│   ├── Backend status              [REAL — inferred from API availability]
│   └── Cloud status                [MOCK/PENDING]
└── Recent Decisions Timeline
    └── Timeline Items (N most recent events)  [REAL — /events/latest]
        ├── Tier badge
        ├── Action badge
        ├── Timestamp
        ├── Confidence summary
        └── Cost avoided indicator
```

### Frames History — IA

```
Frames History
├── Header (global)
├── Page Title + description
├── Filter Bar
│   ├── Tier Filter (All / 1 / 2 / 3)   [REAL — /events?tier=]
│   ├── Date Range Picker               [REAL — /events?from=&to=]
│   └── Action Filter (Accept/Reposition/Escalate)  [CLIENT-SIDE filter]
├── Results Summary ("Showing N events")
├── Frames Gallery
│   └── Frame Cards (grid)              [REAL metadata / MOCK images]
│       ├── Frame image placeholder     [MOCK/PENDING]
│       ├── Tier badge
│       ├── Action badge
│       ├── Confidence indicator
│       └── Timestamp
└── Frame Details Modal (on click)
    ├── Frame Preview                   [MOCK/PENDING]
    ├── Decision section                [REAL]
    ├── Confidence Breakdown section    [REAL]
    ├── Cost section                    [REAL]
    └── Physical Movement section       [MOCK/PENDING]
```

### Analytics — IA

```
Analytics
├── Header (global)
├── Date Range Picker (controls all charts)  [REAL — /stats, /events]
├── Overview Cards Row
│   ├── Total Events                   [REAL — /stats]
│   ├── Tier 1 Events                  [REAL — /stats tier_breakdown["1"]]
│   ├── Tier 2 Events                  [REAL — /stats tier_breakdown["2"]]
│   ├── Tier 3 Events                  [REAL — /stats tier_breakdown["3"]]
│   └── Cloud Calls Avoided            [REAL — /stats cost_avoided_count]
├── Usage per Tier (Donut Chart)       [REAL — calculated from tier_breakdown]
├── Cost Comparison (Bar Chart)        [PARTIAL — % real, $ values mock]
└── Adaptive Threshold Section
    ├── Current Threshold              [MOCK/PENDING]
    ├── Threshold History (Line Chart) [MOCK/PENDING]
    └── Escalation Performance         [MOCK/PENDING]
```

---

## 5. Sitemap

```
Steropes
│
├── / — Main Dashboard
│   ├── Live Monitoring
│   │   ├── Live Stream
│   │   ├── Current Detection
│   │   ├── Current Confidence
│   │   ├── Current Tier
│   │   └── Cascade Status Flow
│   ├── Cost Savings
│   │   ├── Total Events
│   │   ├── Cloud Calls Avoided
│   │   ├── Cost Avoided %
│   │   └── Estimated Savings
│   ├── Hardware Status
│   │   ├── Camera
│   │   ├── Pan/Tilt
│   │   ├── Edge Device
│   │   ├── Agent
│   │   ├── Backend
│   │   └── Cloud
│   └── Recent Decisions Timeline
│       └── [Event Cards]
│           └── → Frame Details Modal
│
├── /frames — Frames History
│   ├── Filter Bar (Tier / Date / Action)
│   ├── Frames Gallery
│   │   └── [Frame Cards]
│   └── Frame Details Modal
│
└── /analytics — Analytics
    ├── Overview Cards
    ├── Usage per Tier (Donut)
    ├── Cost Comparison (Bar)
    └── Adaptive Threshold
        ├── Current Value
        ├── History (Line)
        └── Escalation Performance (Bar)
```

---

## 6. Page-by-Page Specification

---

### Page 1: Main Dashboard (`/`)

**Purpose:** Real-time operational view of the cascade system  
**Primary user goal:** Understand what the system is doing right now and how well it is saving cloud costs  
**Layout:** Two-column grid on desktop (left: live + cascade; right: cost + hardware + timeline)

---

#### 6.1.1 Global Header

**What:** Fixed top bar present on all pages  
**Contains:**
- Left: Steropes logo (SVG) + "Steropes" wordmark
- Center: Navigation links — Dashboard / Frames History / Analytics
- Right: Live indicator dot (animated pulse green = live polling active; grey = polling paused)

**Behavior:**
- Active nav link is highlighted
- Live indicator shows "LIVE" text next to pulsing dot when polling is active
- On mobile: hamburger menu replaces center nav

---

#### 6.1.2 Live Monitoring Section

**Status: MOCK/PENDING** (no live stream or real-time CV data from backend)

**Purpose:** Show the judge that the system is actively processing frames

**Layout:** Large card occupying left-column top

**Sub-components:**

**A. Live Stream Widget**
- `640×360` px placeholder area
- Dark background with animated scan-line effect (CSS animation) to indicate "live feed"
- Center overlay: camera icon + "Live Feed — Hardware Integration Pending"
- When real stream is available: replace with `<video>` or `<img>` tag fed by stream URL
- Status pill: "CAM-01 — CONNECTING" (mock) in top-left corner of the widget

**B. Current Detection**
- Below stream widget
- Shows: object class name (e.g., "Bird Detected"), bounding box description, target confidence
- Mock: `{ class: "Bird", confidence: 0.87 }`
- Empty state: "No detection in current frame"

**C. Confidence Gauge**
- Three horizontal progress bars labeled:
  - "Detection Confidence" — `detection_confidence`
  - "Tracking Consistency" — `tracking_consistency`
  - "Motion Intensity" — `optical_flow` (renamed for UI)
- Each bar: label + value (e.g., "0.87") + colored fill
  - ≥ 0.7 → green fill
  - 0.4–0.69 → amber fill
  - < 0.4 → red fill
- Source: mock CVResult data initially

**D. Current Tier Badge + Cascade Status Flow**
- Shows which tier is currently active with an animated progress indicator
- Visual flow:
  ```
  [Tier 1 ●] ──── [Tier 2 ○] ──── [Tier 3 ○]
  ```
  - Active tier has filled dot and highlight
  - Completed tiers have checkmark
  - Future tiers are dim
- Below: "Action: ACCEPT" or "REPOSITION" or "ESCALATE" as large action badge
- This widget is the most important for a judge — it must be immediately legible

---

#### 6.1.3 Cost Savings Section

**Status: REAL (count/% available) | MOCK (dollar value)**

**Layout:** 2×2 grid of metric cards

**Card 1: Total Events**
- Icon: activity/pulse icon
- Value: `total_events` from `/stats`
- Label: "Total Decisions Today"
- Sub-label: "Since midnight UTC"
- State: Loading skeleton → real number → "—" if 0

**Card 2: Cloud Calls Avoided**
- Icon: cloud-off icon
- Value: `cost_avoided_count` from `/stats`
- Label: "Bedrock Calls Avoided"
- Color accent: green
- Tooltip: "Events resolved at Tier 1 or Tier 2 without cloud VLM"

**Card 3: Cost Avoided %**
- Icon: percent icon
- Value: `cost_avoided_percentage`% from `/stats`
- Label: "Local Resolution Rate"
- Large display: e.g., "80.0%"
- This is the headline metric — display it largest

**Card 4: Estimated Savings**
- Icon: dollar/coin icon
- Value: MOCK — calculated from `cost_avoided_count × $0.002` (illustrative unit price)
- Label: "Estimated Savings"
- Sub-label: "⚠ Estimate only — based on illustrative Bedrock pricing"
- **Important:** Must display a visible disclaimer that this is estimated, not real backend data
- When real cost API is available, remove disclaimer

**Polling:** All four cards refresh from `GET /stats` (no params = today) every 30 seconds.

---

#### 6.1.4 Hardware Status Section

**Status: MOCK/PENDING** (no hardware API)

**Layout:** 3×2 grid of status chips

Each chip contains:
- Icon (appropriate per device)
- Device name
- Status badge: Online / Offline / Processing / Warning / Unknown

**Devices and mock defaults:**

| Device | Icon | Mock Status |
|---|---|---|
| Camera | camera icon | Online (green) |
| Pan/Tilt | crosshair icon | Standby (blue) |
| Edge Device | cpu icon | Online (green) |
| Agent | robot/cpu icon | Running (green) |
| Backend | server icon | **REAL** — derive from last successful API call |
| Cloud (Bedrock) | cloud icon | Standby (blue) |

**Backend status derivation (real, no API needed):**
- If last `/stats` or `/events` call succeeded → Backend = Online (green)
- If call failed → Backend = Offline (red)
- If call timed out → Backend = Warning (amber)

**When real hardware API is available:** Replace mock status objects with real data; chip structure stays identical.

---

#### 6.1.5 Recent Decisions Timeline

**Status: REAL — `GET /events/latest?limit=20`**

**Layout:** Vertical scrollable timeline list on right column

**Polling:** Every 10 seconds

**Each timeline item contains:**
- Left: Tier badge (Tier 1 / 2 / 3) with tier color
- Center:
  - Action badge (ACCEPT / REPOSITION / ESCALATE)
  - Relative timestamp (e.g., "2 minutes ago") + absolute on hover
  - Confidence summary: "Det: 0.87 | Track: 0.72 | Motion: 0.38"
- Right:
  - Cloud avoided: green checkmark icon or red cloud icon
  - Click → opens Frame Details Modal

**Stale data indicator:** If the last poll was > 30 seconds ago and no new events arrived, show a subtle amber bar at top of timeline: "Data may be outdated — last updated 32s ago"

**Loading state:** 5 skeleton timeline items

**Empty state:** Icon + "No decisions recorded today. The system will appear here as it processes frames."

**Error state:** "Could not load timeline. Retrying in 10s." + manual Retry button

---

### Page 2: Frames History (`/frames`)

**Purpose:** Browse and search historical decision events  
**Primary user goal:** Review what happened, filter by tier or date, inspect individual events

---

#### 6.2.1 Page Header

- Title: "Frames History"
- Sub-title: "All recorded decision events"
- Right side: Results count "Showing N events"

---

#### 6.2.2 Filter Bar

**Tier Filter:**
- Segmented button: `All | Tier 1 | Tier 2 | Tier 3`
- Maps to `GET /events?tier=` or `GET /events?from=&to=` (without tier)
- Default: All

**Date Range Picker:**
- Two date inputs: "From" and "To" (YYYY-MM-DD)
- Default: last 7 days
- On change: triggers new API call
- Minimum: both From and To must be set simultaneously

**Action Filter:**
- Dropdown: `All Actions | ACCEPT | REPOSITION | ESCALATE`
- This filter is applied **client-side** (no backend support for action filter)
- Visible disclaimer: "Filtered from loaded results"

**Apply / Reset buttons**

---

#### 6.2.3 Frames Gallery

**Layout:** Responsive grid (3 columns desktop, 2 tablet, 1 mobile)

**Each Frame Card:**
```
┌─────────────────────────────┐
│  [Frame Image Placeholder]  │  ← 16:9 aspect ratio, dark bg with camera icon
│                             │
│  Tier 2  |  REPOSITION      │  ← Tier badge + Action badge
│  Det: 0.42  Track: 0.55     │  ← Confidence summary
│  Sep 01, 2026  14:40 UTC    │  ← Formatted timestamp
│  ☁ Cloud call avoided       │  ← Cost indicator
└─────────────────────────────┘
```

**Frame image placeholder:**
- Dark `#1a1d2e` background
- Centered icon: image/camera icon with opacity 0.3
- Text below: "Frame image pending"
- When real image is available: replace with `<img src={imageUrl} />` — no card redesign needed

**On click:** Opens Frame Details Modal

**Loading state:** Grid of skeleton cards (same dimensions)

**Empty state:** Large icon + "No events match your filters. Try adjusting the date range or tier selection."

---

#### 6.2.4 Frame Details Modal

**Trigger:** Click on any Frame Card or Timeline Item

**Source:** `GET /events/{request_id}`

**Modal size:** 720px wide, full-height scroll on mobile

**Layout:** Two-column header (image left, decision summary right) + tabbed detail sections below

**Section A — Frame Preview**
- Left: Large image placeholder (same treatment as gallery cards)
- Right: Quick summary — Tier badge, Action badge, Timestamp, Request ID (truncated)

**Section B — Decision**
| Field | Source | Status |
|---|---|---|
| Tier Resolved | `tier_resolved` | REAL |
| Action Taken | `action_taken` | REAL |
| Result | Derived: ACCEPT→"Resolved Locally", REPOSITION→"Resolved After Reposition", ESCALATE→"Escalated to Cloud" | REAL |
| Timestamp | `timestamp` | REAL |
| Request ID | `request_id` | REAL |

**Section C — Confidence Breakdown**
| Field | Source | Status |
|---|---|---|
| Detection Confidence | `confidence_breakdown.detection_confidence` | REAL (if present) |
| Tracking Consistency | `confidence_breakdown.tracking_consistency` | REAL (if present) |
| Motion Intensity | `confidence_breakdown.optical_flow` | REAL (renamed for UI) |

Display as three labeled progress bars (same style as live monitoring gauge).

If `confidence_breakdown` is absent: "Confidence data not available for this event."

**Section D — Cost**
| Field | Source | Status |
|---|---|---|
| Cloud Escalation | Derived from `tier_resolved === 3` | REAL |
| Cloud Call Avoided | `cloud_cost_avoided` | REAL |
| Cost Avoided | Derived from `cloud_cost_avoided` → "Yes — Bedrock not called" or "No" | REAL |

**Section E — Physical Movement**
| Field | Source | Status |
|---|---|---|
| Pan Delta | MOCK — not in current API | MOCK/PENDING |
| Tilt Delta | MOCK — not in current API | MOCK/PENDING |
| Movement Status | MOCK | MOCK/PENDING |

Display mock data with a small "(estimated)" label. When real repositioning data is available, these fields will be populated from the event response.

---

### Page 3: Analytics (`/analytics`)

**Purpose:** Aggregate understanding of system performance over time  
**Primary user goal:** Understand tier distribution, cost savings trend, threshold behavior

---

#### 6.3.1 Date Range Picker (page-level control)

- Presets: Today / Last 7 Days / Last 30 Days / Custom
- Controls all charts on the page simultaneously
- On change: refetch `/stats?from=&to=`

---

#### 6.3.2 Overview Cards

Same layout as Dashboard Cost Savings but shows selected date range data, not just today.

5 cards: Total Events, Tier 1, Tier 2, Tier 3, Cloud Avoided

Tier cards show both count and percentage (calculated from `tier_breakdown / total_events × 100`).

---

#### 6.3.3 Usage per Tier — Donut Chart

**Data:** `tier_breakdown` from `/stats`

**Chart:** Donut (hole at 65%)

**Colors:**
- Tier 1: `#22c55e` (green)
- Tier 2: `#f59e0b` (amber)
- Tier 3: `#ef4444` (red)

**Center label:** "X% Local" (Tier 1 + Tier 2 percentage combined)

**Legend:** Below chart — "Tier 1: N (X%) | Tier 2: N (X%) | Tier 3: N (X%)"

**Key message for judge:** Most events should be green (Tier 1) — the cascade is working.

---

#### 6.3.4 Cost Comparison — Bar Chart

**Data:** Partial REAL + MOCK

**Two grouped bars per category:**
- "Without Cascade" — all events × cost-per-call (mock price)
- "With Cascade" — only Tier 3 events × cost-per-call (mock price)

**X-axis categories:** configurable (by day if range > 1 day, or single bar for today)

**Annotations:** "Estimated savings: $X.XX" (clearly marked as estimate)

**When backend provides real cost data:** replace mock unit price with actual values.

---

#### 6.3.5 Adaptive Threshold Section

**Status: MOCK/PENDING — no backend API**

**Sub-section A: Current Threshold**
- Large number card: "Current Threshold: 0.65"
- Sub-label: "Events above this threshold resolve at Tier 1"
- Source: MOCK

**Sub-section B: Threshold History (Line Chart)**
- X-axis: time
- Y-axis: threshold value [0, 1]
- Line shows threshold changes over time
- Annotation markers where tier escalations happened
- Source: MOCK data with realistic variation

**Sub-section C: Escalation Performance (Bar Chart)**
- X-axis: threshold ranges (0.3–0.4, 0.4–0.5, 0.5–0.6, …)
- Y-axis: number of escalations
- Shows at what confidence levels escalations happen most
- Source: MOCK/derived from real event data once available

---

## 7. Component Architecture

### 7.1 Global Components (used everywhere)

| Component | Props | Reusable |
|---|---|---|
| `AppLayout` | children | Yes — wraps all pages |
| `Header` | activeRoute | Yes |
| `NavLink` | href, label, active | Yes |
| `LiveIndicator` | isLive, lastUpdated | Yes |
| `TierBadge` | tier (1/2/3) | Yes |
| `ActionBadge` | action ("ACCEPT"/"REPOSITION"/"ESCALATE") | Yes |
| `StatusBadge` | status ("online"/"offline"/"warning"/"processing"/"unknown") | Yes |
| `ConfidenceBar` | label, value (0–1), showValue | Yes |
| `ConfidenceGauge` | breakdown: ConfidenceBreakdown | Yes |
| `MetricCard` | icon, value, label, subLabel, accent, isLoading, isMock | Yes |
| `LoadingSkeleton` | width, height, variant ("text"/"card"/"circle") | Yes |
| `EmptyState` | icon, title, description, action? | Yes |
| `ErrorState` | message, onRetry | Yes |
| `Modal` | isOpen, onClose, title, children, size | Yes |
| `DateRangePicker` | from, to, onChange, presets? | Yes |
| `FilterBar` | filters, onChange | Yes |
| `ChartCard` | title, subTitle, children, isLoading, isEmpty | Yes |
| `DataBadge` | label, value, variant | Yes |
| `MockBadge` | — | Yes — small "(mock)" chip for MOCK data |
| `Tooltip` | content, children | Yes |
| `ProgressBar` | value, color, animated | Yes |
| `SectionHeader` | title, description, action? | Yes |
| `Divider` | — | Yes |
| `IconButton` | icon, label, onClick, variant | Yes |
| `Button` | variant, size, disabled, loading, onClick | Yes |

### 7.2 Dashboard Components

| Component | Purpose |
|---|---|
| `LiveStreamWidget` | Camera feed placeholder (or real stream) |
| `CascadeStatusFlow` | Visual Tier 1→2→3 flow with active state |
| `CurrentDetectionCard` | Shows class name + confidence from latest frame |
| `CostSavingsGrid` | 2×2 grid of MetricCards for cost data |
| `HardwareStatusGrid` | 3×2 grid of device status chips |
| `HardwareChip` | Individual device: icon + name + StatusBadge |
| `DecisionsTimeline` | Scrollable list of recent events |
| `TimelineItem` | Single event row in the timeline |
| `StaleDataBanner` | Amber bar when data is potentially outdated |

### 7.3 Frames Components

| Component | Purpose |
|---|---|
| `FramesFilterBar` | Tier + Date + Action filters |
| `TierFilter` | Segmented button for tier selection |
| `ActionFilter` | Dropdown for action type |
| `FramesGallery` | Responsive grid of FrameCard |
| `FrameCard` | Individual frame event card |
| `FrameImagePlaceholder` | Dark placeholder with icon |
| `FrameDetailsModal` | Full modal with all event detail sections |
| `ConfidenceBreakdownSection` | Three bars in modal |
| `DecisionSection` | Tier/Action/Result/Timestamp in modal |
| `CostSection` | Cost data in modal |
| `MovementSection` | Pan/Tilt/Status in modal (mock) |

### 7.4 Analytics Components

| Component | Purpose |
|---|---|
| `AnalyticsDatePicker` | Page-level date range control |
| `OverviewCardsRow` | Row of 5 overview MetricCards |
| `TierDonutChart` | Donut with Tier 1/2/3 breakdown |
| `CostComparisonChart` | Grouped bar chart |
| `AdaptiveThresholdCard` | Current threshold number display |
| `ThresholdHistoryChart` | Line chart of threshold over time |
| `EscalationPerformanceChart` | Bar chart of escalations by confidence range |
| `ChartLegend` | Custom legend with Tier colors |

---

## 8. Design System

### 8.1 Colors

**Palette approach:** Dark-mode-first, technical/monitoring aesthetic. Deep navy base with vivid accent colors for status and tiers. Inspired by real-world monitoring dashboards (Grafana, Datadog).

```css
:root {
  /* ── Backgrounds ── */
  --color-bg-base:      #0d0f1a;   /* page background — deepest navy */
  --color-bg-surface:   #13162b;   /* card background */
  --color-bg-elevated:  #1a1d35;   /* modal, tooltip, dropdown */
  --color-bg-subtle:    #1f2340;   /* hover states, input backgrounds */

  /* ── Borders ── */
  --color-border:       #2a2d4a;   /* default card border */
  --color-border-strong:#3a3d5c;   /* emphasized border */

  /* ── Text ── */
  --color-text-primary: #e8eaf6;   /* main body text */
  --color-text-secondary:#a0a3b8;  /* labels, descriptions */
  --color-text-muted:   #6b6f8a;   /* timestamps, meta */
  --color-text-inverse: #0d0f1a;   /* text on light backgrounds */

  /* ── Brand / Primary ── */
  --color-primary:      #6366f1;   /* indigo — main accent */
  --color-primary-hover:#818cf8;
  --color-primary-subtle:#1e2050;  /* primary bg tint */

  /* ── Tier Colors ── */
  --color-tier-1:       #22c55e;   /* green — local resolved */
  --color-tier-1-bg:    #14532d33;
  --color-tier-2:       #f59e0b;   /* amber — repositioned */
  --color-tier-2-bg:    #78350f33;
  --color-tier-3:       #ef4444;   /* red — cloud escalated */
  --color-tier-3-bg:    #7f1d1d33;

  /* ── Status Colors ── */
  --color-success:      #22c55e;
  --color-success-bg:   #14532d33;
  --color-warning:      #f59e0b;
  --color-warning-bg:   #78350f33;
  --color-error:        #ef4444;
  --color-error-bg:     #7f1d1d33;
  --color-info:         #38bdf8;
  --color-info-bg:      #0c4a6e33;
  --color-neutral:      #6b7280;
  --color-neutral-bg:   #1f273333;

  /* ── Chart Colors (ordered) ── */
  --chart-tier-1:  #22c55e;
  --chart-tier-2:  #f59e0b;
  --chart-tier-3:  #ef4444;
  --chart-avoided: #6366f1;
  --chart-grid:    #2a2d4a;
}
```

**Design decision rationale:**
- Dark base reduces eye strain in 24/7 monitoring contexts
- Indigo primary avoids cliché "AI = blue" while remaining professional
- Tier colors deliberately use traffic-light semantics (green/amber/red) but are also distinguishable by shape/label — not color alone

### 8.2 Typography

**Font:** [Inter](https://fonts.google.com/specimen/Inter) — loaded via Google Fonts  
Fallback: `system-ui, -apple-system, sans-serif`

```css
/* Headings */
--text-h1: 2rem      / 1.2 line-height / 700 weight
--text-h2: 1.5rem    / 1.25            / 700
--text-h3: 1.25rem   / 1.3             / 600
--text-h4: 1rem      / 1.4             / 600

/* Body */
--text-body-lg: 1rem      / 1.6 / 400
--text-body:    0.875rem  / 1.6 / 400
--text-body-sm: 0.8125rem / 1.5 / 400

/* UI */
--text-label:   0.75rem   / 1.4 / 500   /* uppercase tracking: 0.05em */
--text-caption: 0.6875rem / 1.4 / 400
--text-mono:    0.8125rem / 1.5 / 400   /* font: 'JetBrains Mono', monospace — for IDs, values */

/* Metric Display */
--text-metric-xl: 2.5rem  / 1 / 700   /* big cost savings number */
--text-metric-lg: 1.75rem / 1 / 700
```

### 8.3 Spacing Scale

Based on 4px base unit:

```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
```

Card internal padding: `--space-6` (24px)  
Section gaps: `--space-8` (32px)  
Page horizontal padding: `--space-8` desktop, `--space-4` mobile

### 8.4 Border Radius

```
--radius-sm:    4px    /* chips, small badges */
--radius-md:    8px    /* buttons, inputs */
--radius-lg:    12px   /* cards */
--radius-xl:    16px   /* modals, large cards */
--radius-full:  9999px /* pills, status dots */
```

### 8.5 Shadows

```css
--shadow-sm:  0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
--shadow-md:  0 4px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2);
--shadow-lg:  0 10px 15px rgba(0,0,0,0.4), 0 4px 6px rgba(0,0,0,0.2);
--shadow-xl:  0 20px 25px rgba(0,0,0,0.5), 0 10px 10px rgba(0,0,0,0.2);
/* Colored glow for tier accents */
--shadow-tier-1: 0 0 12px rgba(34,197,94,0.2);
--shadow-tier-2: 0 0 12px rgba(245,158,11,0.2);
--shadow-tier-3: 0 0 12px rgba(239,68,68,0.2);
```

### 8.6 Icons

**Library:** [Lucide React](https://lucide.dev/) (MIT license, consistent style, 1200+ icons)

```
npm install lucide-react
```

**Icon usage rules:**
- All icons: 20×20px in body text, 16×16px in compact areas, 24×24px in headers
- Never use icon alone to convey tier — always pair with text label
- SVG inline (not img tags) for accessible coloring

**Key icons used:**
| Use case | Lucide icon |
|---|---|
| Camera | `Camera` |
| Pan/Tilt | `Crosshair` |
| Edge device | `Cpu` |
| Agent | `Bot` |
| Backend | `Server` |
| Cloud | `Cloud` |
| Cost avoided | `CloudOff` |
| Cloud called | `CloudLightning` |
| Tier 1 | `CircleCheck` |
| Tier 2 | `RefreshCcw` |
| Tier 3 | `CloudUpload` |
| Analytics | `BarChart3` |
| History | `History` |
| Dashboard | `LayoutDashboard` |
| Filter | `SlidersHorizontal` |
| Refresh | `RotateCw` |
| Live | `Radio` |
| Detection | `ScanSearch` |
| Confidence | `Gauge` |
| Warning | `AlertTriangle` |
| Settings | — (not in scope) |

### 8.7 Charts

**Library:** [Recharts](https://recharts.org/) (React, well-maintained, good customization)

```
npm install recharts
```

**Chart style system:**

```js
const CHART_DEFAULTS = {
  background: 'transparent',
  gridColor: 'var(--color-chart-grid)',      // #2a2d4a
  axisColor: 'var(--color-text-muted)',      // #6b6f8a
  tooltipBackground: 'var(--color-bg-elevated)',
  tooltipBorder: 'var(--color-border-strong)',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 12,
  animationDuration: 600,
};
```

All charts must have:
- Consistent axis label style
- Consistent tooltip style (dark background, subtle border)
- Accessible colors (never rely on color alone — also use patterns or labels)
- Responsive container that fills chart card width

---

## 9. Mock Data Architecture

### Structure

```
src/
└── mocks/
    ├── index.ts              Re-exports all mock data
    ├── events.ts             Recent events + historical events
    ├── stats.ts              Statistics response
    ├── hardware.ts           Hardware status
    ├── live.ts               Live monitoring state
    ├── frames.ts             Frames gallery (wraps events + adds mock image URL)
    └── analytics.ts          Adaptive threshold + extended analytics
```

### Mock field naming rule

All mock field names must exactly match the backend field names from the API. The only additions allowed are frontend-only display fields (e.g., `imageUrl`, `movementData`) that are clearly prefixed with `_ui_` or documented as frontend-only.

---

### `mocks/events.ts`

```typescript
// Mirrors GET /events/latest and GET /events/{request_id} response shape
export const mockEvents: DecisionEvent[] = [
  {
    PK: "EVENT#2026-09-16",
    SK: "2026-09-16T10:30:00+00:00#evt-001",
    request_id: "8f14e45f-ceea-4d2e-9f5b-1a2b3c4d5e6f",
    tier_resolved: 1,
    confidence_breakdown: {
      detection_confidence: 0.91,
      tracking_consistency: 0.85,
      optical_flow: 0.12,
    },
    action_taken: "ACCEPT",
    cloud_cost_avoided: true,
    timestamp: "2026-09-16T10:30:00Z",
    // Frontend-only mock field:
    _ui_imageUrl: null,  // null = use placeholder; string = real image
    _ui_movement: null,  // null = not a Tier 2 event
  },
  {
    PK: "EVENT#2026-09-16",
    SK: "2026-09-16T10:28:00+00:00#evt-002",
    request_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    tier_resolved: 2,
    confidence_breakdown: {
      detection_confidence: 0.42,
      tracking_consistency: 0.55,
      optical_flow: 0.38,
    },
    action_taken: "REPOSITION",
    cloud_cost_avoided: true,
    timestamp: "2026-09-16T10:28:00Z",
    _ui_imageUrl: null,
    _ui_movement: {
      pan_delta: 20,
      tilt_delta: -5,
      actual_pan: 20,
      actual_tilt: -5,
      status: "COMPLETED",
    },
  },
  {
    PK: "EVENT#2026-09-16",
    SK: "2026-09-16T10:25:00+00:00#evt-003",
    request_id: "f0e1d2c3-b4a5-6789-0123-456789abcdef",
    tier_resolved: 3,
    confidence_breakdown: {
      detection_confidence: 0.28,
      tracking_consistency: 0.31,
      optical_flow: 0.61,
    },
    action_taken: "ESCALATE",
    cloud_cost_avoided: false,
    timestamp: "2026-09-16T10:25:00Z",
    _ui_imageUrl: null,
    _ui_movement: {
      pan_delta: -10,
      tilt_delta: 10,
      actual_pan: -10,
      actual_tilt: 10,
      status: "COMPLETED",
    },
  },
  // ... add 15–17 more events with realistic Tier 1 (60%), Tier 2 (25%), Tier 3 (15%) distribution
];
```

### `mocks/stats.ts`

```typescript
// Mirrors GET /stats response
export const mockStats: StatsResponse = {
  total_events: 142,
  tier_breakdown: {
    "1": 85,   // 59.9%
    "2": 41,   // 28.9%
    "3": 16,   // 11.3%
  },
  cost_avoided_count: 126,
  cost_avoided_percentage: 88.7,
};
```

### `mocks/hardware.ts`

```typescript
// Frontend-only structure — no backend API yet
export const mockHardwareStatus: HardwareStatus = {
  camera: { name: "CAM-01", status: "online", lastSeen: "2026-09-16T10:30:00Z" },
  panTilt: { name: "PTZ-01", status: "standby", lastPosition: { pan: 0, tilt: 0 } },
  edgeDevice: { name: "Pi-5-001", status: "online", cpuUsage: 34, memUsage: 58 },
  agent: { name: "Decision Agent", status: "running", lastDecision: "2026-09-16T10:30:00Z" },
  backend: { name: "AWS Lambda", status: "online" },  // derived from real API
  cloud: { name: "Amazon Bedrock", status: "standby" },
};
```

### `mocks/live.ts`

```typescript
// Frontend-only structure for live monitoring state
export const mockLiveState: LiveMonitoringState = {
  isConnected: true,
  currentFrame: {
    frameId: "frame-20260916-001",
    timestamp: "2026-09-16T10:30:05Z",
    targetClass: "Bird",
    bbox: null,  // no bbox in backend; null = not available
  },
  currentConfidence: {
    detection_confidence: 0.87,
    tracking_consistency: 0.79,
    optical_flow: 0.15,
  },
  currentTier: 1,
  currentAction: "ACCEPT",
  streamUrl: null,  // null = use placeholder; string = real stream URL
};
```

### `mocks/analytics.ts`

```typescript
// Adaptive threshold — entirely mock
export const mockAdaptiveThreshold: AdaptiveThreshold = {
  currentThreshold: 0.65,
  history: [
    { timestamp: "2026-09-10T00:00:00Z", value: 0.70 },
    { timestamp: "2026-09-11T00:00:00Z", value: 0.70 },
    { timestamp: "2026-09-12T00:00:00Z", value: 0.68 },
    { timestamp: "2026-09-13T00:00:00Z", value: 0.66 },
    { timestamp: "2026-09-14T00:00:00Z", value: 0.65 },
    { timestamp: "2026-09-15T00:00:00Z", value: 0.65 },
    { timestamp: "2026-09-16T00:00:00Z", value: 0.65 },
  ],
  escalationPerformance: [
    { range: "0.3–0.4", escalations: 8 },
    { range: "0.4–0.5", escalations: 12 },
    { range: "0.5–0.6", escalations: 4 },
    { range: "0.6–0.7", escalations: 1 },
    { range: "0.7–1.0", escalations: 0 },
  ],
};
```

---

## 10. API Mapping

| UI Feature | API Endpoint | Data Fields Used | Status |
|---|---|---|---|
| Total Events card (Dashboard) | `GET /stats` | `total_events` | **REAL** |
| Cloud Calls Avoided card | `GET /stats` | `cost_avoided_count` | **REAL** |
| Cost Avoided % card | `GET /stats` | `cost_avoided_percentage` | **REAL** |
| Estimated Savings card | `GET /stats` | `cost_avoided_count` (× mock price) | **MOCK** |
| Recent Decisions Timeline | `GET /events/latest?limit=20` | all event fields | **REAL** |
| Timeline — Tier badge | `GET /events/latest` | `tier_resolved` | **REAL** |
| Timeline — Action badge | `GET /events/latest` | `action_taken` | **REAL** |
| Timeline — Confidence | `GET /events/latest` | `confidence_breakdown.*` | **REAL** |
| Timeline — Cost avoided | `GET /events/latest` | `cloud_cost_avoided` | **REAL** |
| Live Stream Widget | TBD | stream URL | **MOCK/PENDING** |
| Current Detection card | TBD | target_class, bbox, confidence | **MOCK/PENDING** |
| Confidence Gauge (live) | TBD | real-time CVResult | **MOCK/PENDING** |
| Current Tier + Cascade Flow | TBD | live decision state | **MOCK/PENDING** |
| Hardware — Camera | TBD | status | **MOCK/PENDING** |
| Hardware — Pan/Tilt | TBD | status, position | **MOCK/PENDING** |
| Hardware — Edge Device | TBD | status, CPU, memory | **MOCK/PENDING** |
| Hardware — Agent | TBD | status, last decision | **MOCK/PENDING** |
| Hardware — Backend | Derived from API call success | last 200 OK | **REAL** |
| Hardware — Cloud | TBD | Bedrock status | **MOCK/PENDING** |
| Frames Gallery — Event data | `GET /events?from=&to=` | all event fields | **REAL** |
| Frames Gallery — Tier filter | `GET /events?tier=` | filtered events | **REAL** |
| Frames Gallery — Date filter | `GET /events?from=&to=` | date range events | **REAL** |
| Frames Gallery — Action filter | Client-side from loaded events | `action_taken` | **REAL (client-side)** |
| Frames Gallery — Images | TBD | image URL / S3 key | **MOCK/PENDING** |
| Frame Details — Decision data | `GET /events/{request_id}` | tier, action, timestamp | **REAL** |
| Frame Details — Confidence | `GET /events/{request_id}` | `confidence_breakdown` | **REAL** |
| Frame Details — Cost | `GET /events/{request_id}` | `cloud_cost_avoided` | **REAL** |
| Frame Details — Image | TBD | image URL | **MOCK/PENDING** |
| Frame Details — Movement | TBD | pan, tilt, status | **MOCK/PENDING** |
| Analytics Overview cards | `GET /stats?from=&to=` | all stats fields | **REAL** |
| Tier Donut Chart | `GET /stats?from=&to=` | `tier_breakdown` | **REAL** |
| Cost Comparison Chart | `GET /stats?from=&to=` | `cost_avoided_*` | **PARTIAL** |
| Cost $ values in chart | TBD | unit cost × count | **MOCK** |
| Adaptive Threshold — Current | TBD | threshold value | **MOCK/PENDING** |
| Adaptive Threshold — History | TBD | time-series array | **MOCK/PENDING** |
| Escalation Performance | TBD | threshold + escalation data | **MOCK/PENDING** |

---

## 11. Data Models / Types

```typescript
// ─────────────────────────────────────────────
// Backend-compatible types (match API field names exactly)
// ─────────────────────────────────────────────

export interface ConfidenceBreakdown {
  detection_confidence: number;   // [0, 1]
  tracking_consistency: number;   // [0, 1]
  optical_flow: number;           // [0, 1] — displayed as "Motion Intensity"
}

export type TierNumber = 1 | 2 | 3;
export type ActionTaken = "ACCEPT" | "REPOSITION" | "ESCALATE";

export interface DecisionEvent {
  PK: string;                              // "EVENT#YYYY-MM-DD"
  SK: string;                              // "<timestamp>#<request_id>"
  request_id: string;                      // UUIDv4
  tier_resolved: TierNumber;
  action_taken: ActionTaken;
  cloud_cost_avoided: boolean;
  timestamp: string;                       // ISO-8601 UTC
  confidence_breakdown?: ConfidenceBreakdown;
  adaptive_threshold_used?: unknown;       // undocumented field; handle defensively
  confidence_score?: number;               // undocumented field; handle defensively
  // Frontend-only fields (not from backend):
  _ui_imageUrl?: string | null;
  _ui_movement?: MovementData | null;
}

export interface TierBreakdown {
  "1": number;
  "2": number;
  "3": number;
}

export interface StatsResponse {
  total_events: number;
  tier_breakdown: TierBreakdown;
  cost_avoided_count: number;
  cost_avoided_percentage: number;
}

export interface EventListResponse {
  events: DecisionEvent[];
  count: number;
}

export interface SingleEventResponse {
  events: DecisionEvent[];
  // Note: no "count" field on this endpoint — confirmed from code analysis
}

// ─────────────────────────────────────────────
// Frontend-only types (no backend equivalent yet)
// ─────────────────────────────────────────────

export type HardwareStatusValue = 
  "online" | "offline" | "standby" | "running" | "warning" | "unknown";

export interface DeviceStatus {
  name: string;
  status: HardwareStatusValue;
  lastSeen?: string;
  metadata?: Record<string, unknown>;
}

export interface HardwareStatus {
  camera: DeviceStatus;
  panTilt: DeviceStatus & { lastPosition?: { pan: number; tilt: number } };
  edgeDevice: DeviceStatus & { cpuUsage?: number; memUsage?: number };
  agent: DeviceStatus & { lastDecision?: string };
  backend: DeviceStatus;
  cloud: DeviceStatus;
}

export interface MovementData {
  pan_delta: number;
  tilt_delta: number;
  actual_pan?: number;
  actual_tilt?: number;
  status: "COMPLETED" | "FAILED" | "IN_PROGRESS" | "PENDING";
}

export interface LiveFrameData {
  frameId: string;
  timestamp: string;
  targetClass: string | null;
  bbox: [number, number, number, number] | null;  // [x, y, w, h]
}

export interface LiveMonitoringState {
  isConnected: boolean;
  currentFrame: LiveFrameData | null;
  currentConfidence: ConfidenceBreakdown | null;
  currentTier: TierNumber | null;
  currentAction: ActionTaken | null;
  streamUrl: string | null;
}

export interface ThresholdPoint {
  timestamp: string;
  value: number;
}

export interface EscalationRange {
  range: string;    // e.g., "0.3–0.4"
  escalations: number;
}

export interface AdaptiveThreshold {
  currentThreshold: number;
  history: ThresholdPoint[];
  escalationPerformance: EscalationRange[];
}

// ─────────────────────────────────────────────
// UI-derived / computed types
// ─────────────────────────────────────────────

export interface CostSummary {
  totalEvents: number;
  cloudCallsAvoided: number;
  costAvoidedPercentage: number;
  estimatedSavingsUSD: number | null;   // null = not calculated (no real price data)
  isSavingsEstimated: boolean;          // always true until real API
}

export interface TierStats {
  tier: TierNumber;
  count: number;
  percentage: number;
  label: string;  // "Tier 1 — Local"
  color: string;  // CSS variable name
}

// ─────────────────────────────────────────────
// API service return types
// ─────────────────────────────────────────────

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  lastUpdated: Date | null;
}

export interface PaginationState {
  hasMore: boolean;
  isLoadingMore: boolean;
}

export interface EventFilters {
  from: string | null;     // YYYY-MM-DD
  to: string | null;       // YYYY-MM-DD
  tier: TierNumber | null;
  action: ActionTaken | null;  // client-side only
}
```

---

## 12. Frontend Architecture

### 12.1 Recommended Framework

**React + Vite + TypeScript**

Reasoning:
- The `frontend/` directory has a `package.json` placeholder and React-compatible structure (`src/api`, `src/components`, `src/pages`)
- Vite provides fast HMR and build
- TypeScript enables type-safe mock→real API transitions

```bash
npm create vite@latest . -- --template react-ts
```

### 12.2 Directory Structure

```
src/
├── api/
│   ├── client.ts           # Base fetch wrapper (handles errors, JSON parsing)
│   ├── events.api.ts       # Real API calls for /events endpoints
│   ├── stats.api.ts        # Real API call for /stats endpoint
│   └── index.ts            # Re-exports
│
├── services/
│   ├── events.service.ts   # Business logic: filter client-side, transform fields
│   ├── stats.service.ts    # Compute derived values (tier %, cost estimate)
│   ├── hardware.service.ts # Returns mock (later: real)
│   └── live.service.ts     # Returns mock (later: real stream)
│
├── mocks/
│   ├── events.ts
│   ├── stats.ts
│   ├── hardware.ts
│   ├── live.ts
│   └── analytics.ts
│
├── hooks/
│   ├── useEvents.ts         # Polls /events/latest, handles loading/error
│   ├── useStats.ts          # Polls /stats, handles loading/error
│   ├── useEventDetail.ts    # Fetches /events/{request_id} on demand
│   ├── useEventHistory.ts   # Fetches /events with filters
│   ├── useHardwareStatus.ts # Polls mock hardware status
│   ├── useLiveMonitoring.ts # Polls mock live state
│   ├── usePolling.ts        # Generic polling hook
│   └── usePageVisibility.ts # Pause polling when tab is hidden
│
├── features/
│   ├── dashboard/
│   │   ├── LiveMonitoring.tsx
│   │   ├── CostSavings.tsx
│   │   ├── HardwareStatus.tsx
│   │   └── DecisionsTimeline.tsx
│   ├── frames/
│   │   ├── FramesFilter.tsx
│   │   ├── FramesGallery.tsx
│   │   └── FrameDetailsModal.tsx
│   └── analytics/
│       ├── OverviewCards.tsx
│       ├── TierChart.tsx
│       ├── CostChart.tsx
│       └── ThresholdSection.tsx
│
├── components/          # See Component Architecture (Section 7)
│   ├── ui/              # Primitive UI components
│   └── shared/          # Composed shared components
│
├── pages/
│   ├── DashboardPage.tsx
│   ├── FramesPage.tsx
│   └── AnalyticsPage.tsx
│
├── types/
│   └── index.ts         # All TypeScript interfaces (see Section 11)
│
├── constants/
│   ├── api.ts           # BASE_URL, polling intervals
│   ├── tiers.ts         # Tier labels, colors, icons
│   └── mock.ts          # Feature flags: USE_MOCK_EVENTS=true/false
│
├── utils/
│   ├── formatters.ts    # formatTimestamp, formatPercentage, formatTier
│   ├── transforms.ts    # decimalToNative for DynamoDB Decimals, etc.
│   └── chartHelpers.ts  # buildTierChartData, buildCostChartData
│
└── styles/
    ├── globals.css      # CSS custom properties (design tokens)
    ├── reset.css        # CSS reset
    └── typography.css   # Font import + base typography rules
```

### 12.3 Data Flow Architecture

```
UI Components (presentational, no API calls)
    ↑
Feature Components (orchestrate hooks, pass data down)
    ↑
Custom Hooks (useEvents, useStats, etc.)
    ↑
Services (business logic, data transformation)
    ↑
API Module (real HTTP calls) ←→ Mock Module (fake data)
    ↑
Constants (BASE_URL, feature flags)
```

**Feature flag for mock/real switching:**

```typescript
// constants/mock.ts
export const USE_MOCK = {
  events:    import.meta.env.VITE_MOCK_EVENTS    !== 'false',  // default: true
  stats:     import.meta.env.VITE_MOCK_STATS     !== 'false',
  hardware:  true,   // always mock until API exists
  live:      true,   // always mock until API exists
  threshold: true,   // always mock until API exists
};
```

To connect a real API: set `VITE_MOCK_EVENTS=false` in `.env.local`. No code changes needed.

### 12.4 API Client

```typescript
// api/client.ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL 
  || 'https://32v3gb46j5.execute-api.eu-north-1.amazonaws.com/prod';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Accept': 'application/json', ...options?.headers },
    signal: options?.signal,
    ...options,
  });
  
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorBody.error || 'Unknown error');
  }
  
  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### 12.5 Polling Hook

```typescript
// hooks/usePolling.ts
export function usePolling<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  intervalMs: number,
  options?: { enabled?: boolean; onSuccess?: (data: T) => void }
): ApiResult<T> {
  const [state, setState] = useState<ApiResult<T>>({
    data: null, error: null, isLoading: true, lastUpdated: null
  });
  const isVisible = usePageVisibility();
  const enabled = options?.enabled !== false && isVisible;
  
  // Fetch immediately + on interval when enabled
  // Abort on unmount or when enabled becomes false
  // ...implementation
  
  return state;
}
```

---

## 13. Loading / Empty / Error States

### Loading States

| Component | Loading Treatment | Implementation |
|---|---|---|
| Dashboard Cost Savings (4 cards) | Skeleton cards (same height) | `<LoadingSkeleton variant="card" />` |
| Recent Decisions Timeline | 5 skeleton timeline rows | `<LoadingSkeleton variant="timeline-row" count={5} />` |
| Hardware Status grid | 6 skeleton chips | |
| Frames Gallery | 9 skeleton frame cards | |
| Frame Details Modal | Skeleton layout matching modal structure | |
| Analytics Overview Cards | 5 skeleton metric cards | |
| Donut Chart | Spinner centered in chart area | |
| Cost Comparison Chart | Skeleton bars | |
| Threshold History Chart | Skeleton line placeholder | |
| Live Stream Widget | Animated CSS scan-line (persistent, not loading) | |

### Empty States

| Scenario | Icon | Title | Description | Action |
|---|---|---|---|---|
| No events today (timeline) | `Radio` | "No decisions today" | "The system will appear here as it processes frames." | — |
| No frames in filter range | `SlidersHorizontal` | "No events match your filters" | "Try adjusting the date range or tier selection." | Reset Filters button |
| No Tier 3 events (filtered) | `CloudOff` | "No cloud escalations found" | "The cascade resolved all events locally or via repositioning." | — |
| No stats for date range | `BarChart3` | "No data for this period" | "Select a different date range." | — |
| No threshold history | `TrendingUp` | "Threshold history pending" | "Adaptive threshold data will appear here when the backend integration is complete." | — |
| No hardware data | `Cpu` | "Hardware telemetry pending" | "Status will update when hardware integration is complete." | — |

### Error States

| Scenario | UI Message | Recovery |
|---|---|---|
| `/events/latest` fails | "Could not load timeline. Last updated Xs ago." | Retry button + auto-retry in 30s |
| `/stats` fails | Error banner on cards: "Stats unavailable" | Retry button |
| `/events` fails (history) | Full-page error within gallery area | Retry button |
| `/events/{request_id}` fails | Modal error state: "Could not load event details." | Close / Retry button |
| Network offline | Global top banner: "No internet connection. Reconnecting…" | Auto-reconnect |
| Timeout (>10s) | Same as API failure | Retry |
| CORS error | Console error; UI shows generic API failure | No user-facing CORS message |
| 404 on request_id | Modal: "Event not found." | Close modal |
| 500 from API | "Server error. The backend team has been notified." | Retry |

**Error display hierarchy:**
1. If component has data from previous successful load: show stale data + amber banner
2. If no previous data: show ErrorState component in the component's space
3. Never show a full page crash for a single component failure

---

## 14. Responsive Design

### Breakpoints

```css
/* Mobile-first */
--bp-sm:  640px
--bp-md:  768px
--bp-lg:  1024px
--bp-xl:  1280px
--bp-2xl: 1536px
```

### Main Dashboard

| Section | Desktop (≥1280px) | Tablet (768–1279px) | Mobile (<768px) |
|---|---|---|---|
| Layout | 2-column (60% left, 40% right) | 1-column stacked | 1-column stacked |
| Live Monitoring | Full width left column | Full width, stream at top | Full width, stream 16:9 |
| Cascade Status | Horizontal flow (Tier 1 → 2 → 3) | Horizontal flow | Vertical flow |
| Cost Savings | 2×2 card grid | 2×2 card grid | 2×1 card grid (scrollable) |
| Hardware Status | 3×2 chip grid | 3×2 chip grid | 2×3 chip grid |
| Timeline | Right column, full height | Below hardware, full width | Full width, limited to 5 items |

### Frames History

| Section | Desktop | Tablet | Mobile |
|---|---|---|---|
| Filter Bar | Single horizontal row | Two rows (tier+date, action below) | Collapsed into filter button / drawer |
| Gallery Grid | 3 columns | 2 columns | 1 column |
| Frame Card | Full card with all details | Full card | Compact card (tier + timestamp + action) |
| Frame Details Modal | 720px centered | 90vw | Full screen drawer from bottom |

### Analytics

| Section | Desktop | Tablet | Mobile |
|---|---|---|---|
| Overview Cards | 5 in a row | 2+2+1 grid | 2 columns |
| Donut Chart | Left 40% of row | Full width | Full width, smaller radius |
| Cost Bar Chart | Right 60% of row | Full width, below donut | Full width, horizontal scroll if needed |
| Threshold Section | 3 components side by side | 2+1 | 1 column |

### Navigation

- Desktop: Horizontal nav bar in header
- Tablet: Horizontal nav bar (icons + abbreviated labels)
- Mobile: Bottom tab bar with 3 icons (Dashboard / History / Analytics)

---

## 15. Real-Time Strategy

### Current approach: Polling

Because no WebSocket or SSE API exists, all "live" data is fetched via HTTP polling.

**Polling intervals:**

| Data | Interval | Rationale |
|---|---|---|
| `GET /events/latest` | 10 seconds | Live feed needs to feel responsive |
| `GET /stats` (dashboard) | 30 seconds | Counter updates don't need sub-second refresh |
| `GET /stats` (analytics) | On demand only (user-triggered by date change) | No reason to auto-refresh historical stats |
| Hardware status (mock) | 15 seconds | Mock cycler for demo purposes |
| Live monitoring state (mock) | 3 seconds | Demo requires visible changes |

**Polling start/stop rules:**

```
START polling when:
  - Component mounts and is visible
  - User returns to the tab (Page Visibility API)
  - User clicks "Resume" after manual pause

STOP polling when:
  - Component unmounts
  - Browser tab is hidden (Page Visibility API)
  - User manually pauses (optional "Pause Live" button)
  - 3+ consecutive errors (back off + notify)
```

**Back-off strategy:**
- 3 consecutive failures → pause polling, show error state, retry after 60s
- On manual retry: reset failure count

**Stale data indicator:**
- If last successful poll was > `interval × 3` ago: show amber banner "Data may be outdated"

### Future WebSocket/SSE migration

The polling architecture is designed for a drop-in replacement:

```typescript
// Current: polling
const { data, error } = usePolling(fetchLatestEvents, 10_000);

// Future: WebSocket — same hook interface, different implementation
const { data, error } = useWebSocket(WS_URL);
```

The UI components receive `data` and `error` — they do not know or care whether it came from polling or a WebSocket. The migration only requires changing the hook implementation, not the UI.

---

## 16. Charts & Analytics

### Chart Decisions

| Feature | Chart Type | Library | Reason |
|---|---|---|---|
| Tier Usage | Donut (Recharts `PieChart`) | Recharts | Shows proportional distribution clearly; center label for headline metric |
| Cost Comparison | Grouped Bar (Recharts `BarChart`) | Recharts | Direct side-by-side comparison of with/without cascade |
| Threshold History | Line (Recharts `LineChart`) | Recharts | Time-series; threshold is a continuous value |
| Escalation Performance | Bar (Recharts `BarChart`) | Recharts | Discrete confidence ranges on X-axis |
| Confidence Gauges | Custom CSS progress bars | CSS | Simple, compact, matches dashboard aesthetic without chart overhead |

### Chart Design Rules

1. No chart should be taller than 300px on desktop (except threshold history: 250px)
2. All charts use the defined color palette — no random colors
3. All charts must have a visible title, legend, and axis labels
4. Tooltips must show exact values on hover
5. No chart should be animated on every data refresh — animate only on mount

### Tier Donut — Key Design Detail

The center of the donut must display:
```
88.7%
Local Resolution
```
(Tier 1 + Tier 2 combined percentage)

This single number is the most important metric in the whole product. Make it large and visible.

---

## 17. UX Interactions

| Interaction | Trigger | Expected Behavior |
|---|---|---|
| Click timeline event | Click on TimelineItem | Open FrameDetailsModal; fetch `/events/{request_id}`; show skeleton while loading |
| Click frame card | Click on FrameCard | Same as above |
| Close modal | Click backdrop or X or Escape key | Close modal; return focus to triggering element |
| Change tier filter | Click Tier 1/2/3 button | Immediate API call with new `?tier=` param; show skeleton in gallery |
| Change date range | Update From/To inputs | Trigger API call on Apply click (not on every keystroke) |
| Change action filter | Select from dropdown | Client-side filter of already-loaded events; instant |
| Reset filters | Click Reset | Clear all filters; re-fetch full event list |
| Hover chart segment | Hover donut/bar | Show tooltip with label + count + percentage |
| Hover timeline item | Hover | Show absolute timestamp tooltip; slight background highlight |
| Hover confidence bar | Hover | Tooltip explaining what the metric means |
| Manual data refresh | Click refresh icon (optional button on timeline) | Re-fetch immediately; reset polling interval |
| Pause/Resume live | Click Live Indicator | Pause all polling; indicator changes to grey "PAUSED"; click again to resume |
| Navigate between pages | Click nav links | Route change; each page initializes its own polling on mount |
| Mobile filter toggle | Click filter icon | Slide-up drawer with filter controls |
| Expand timeline | "Show more" at bottom | Increase limit on next `/events/latest` call |

---

## 18. Accessibility

### Standards

Target: **WCAG 2.1 AA**

### Keyboard Navigation

- All interactive elements must be reachable by Tab
- Modal: focus trapped inside while open; returns to trigger on close
- Filter controls: full keyboard operation
- Charts: keyboard-navigable tooltips via arrow keys (Recharts supports this with `accessibilityLayer` prop)

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

No custom `:focus` removal — only replace with designed focus ring.

### Color Contrast

All text must meet 4.5:1 minimum contrast against its background:
- `--color-text-primary` (#e8eaf6) on `--color-bg-surface` (#13162b): passes
- `--color-text-secondary` (#a0a3b8) on `--color-bg-surface`: passes
- Never use `--color-text-muted` as the sole label for actionable elements

### Tier Communication

Never use color alone. Every tier representation includes:
- Text label ("Tier 1", "Tier 2", "Tier 3")
- Icon (CircleCheck, RefreshCcw, CloudUpload)
- Color accent (supplementary)
- Pattern option in charts (stripe, solid, hatched) as future enhancement

### Semantic HTML

```html
<!-- Page structure -->
<header role="banner">
<nav aria-label="Main navigation">
<main>
<section aria-labelledby="section-heading-id">
<footer role="contentinfo">

<!-- Timeline -->
<ol aria-label="Recent decisions">
  <li>

<!-- Cards -->
<article aria-label="Event [request_id]">

<!-- Status -->
<span role="status" aria-live="polite">  <!-- for live updates -->
```

### ARIA

- `aria-live="polite"` on the timeline for new events
- `aria-label` on all icon-only buttons
- `aria-expanded` on modal trigger
- `aria-modal="true"` on modal element
- `aria-disabled` on filter buttons when loading
- `role="progressbar"` on confidence bars with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

### Chart Accessibility

- Add `<title>` and `<desc>` to SVG charts
- Provide a data table alternative for each chart (visually hidden, visible to screen readers)
- All Recharts components: use `accessibilityLayer` prop

---

## 19. Figma Workflow

### Stage 1 — Requirements Review (do before opening Figma)

**Deliverable:** Annotated copy of the approved sitemap with data source noted per component  
**Done when:** Every component has a label: REAL / MOCK / PENDING, and data field is identified  
**Time estimate:** 2–4 hours

### Stage 2 — Information Architecture Diagram

**Tool:** Figma FigJam or plain Figma frame  
**Deliverable:** IA diagram matching Section 4 of this document  
**Done when:** All 3 pages are mapped; all sections and their data sources are visible  
**Time estimate:** 2–3 hours

### Stage 3 — User Flows

**Deliverable:** Flow diagrams for:
1. Judge primary flow: Dashboard → Timeline event → Modal → Analytics
2. Tier 2 cascade flow
3. Tier 3 escalation flow
4. Frames History filter flow

**Done when:** Every clickable state is connected with arrows  
**Time estimate:** 3–4 hours

### Stage 4 — Wireframes (low-fidelity)

**Start with grayscale boxes — no colors, no real typography**  
**Deliverable:**
- Dashboard wireframe (desktop + mobile)
- Frames History wireframe (desktop + mobile)
- Analytics wireframe (desktop)
- Frame Details Modal wireframe

**Done when:** Layout, spacing, information hierarchy are finalized and reviewed  
**Time estimate:** 6–10 hours  
**Gate:** Do not proceed to design system until wireframes are signed off

### Stage 5 — Design System in Figma

**Create a dedicated "Design System" page in the Figma file**

**Setup order:**
1. Color styles (match CSS custom properties in Section 8.1)
2. Typography styles (match Section 8.2)
3. Spacing grid (8px grid, with 4px sub-grid)
4. Effect styles (shadows from Section 8.5)
5. Component library — see Section 20 for variants

**Done when:** Every token has a Figma style; every component has at least a "Default" variant  
**Time estimate:** 8–12 hours

### Stage 6 — High-Fidelity UI

**Apply design system to wireframes**  
**Build one page at a time: Dashboard → Frames → Analytics**  
**Use Auto Layout everywhere — no manual spacing**

**Done when:** All three pages look production-ready at desktop size  
**Time estimate:** 12–20 hours

### Stage 7 — Responsive Layouts

For each page: duplicate the desktop frame, resize to tablet (768px) and mobile (390px)  
**Done when:** All three breakpoints are designed for all three pages  
**Time estimate:** 6–10 hours

### Stage 8 — Component Variants

Complete all component variants (see Section 20)  
**Done when:** All variants in Section 20 are designed  
**Time estimate:** 6–8 hours

### Stage 9 — Prototype

Connect all frames per the flow in Section 21  
**Done when:** Judge demo flow is fully clickable  
**Time estimate:** 3–5 hours

### Stage 10 — Developer Handoff

- Enable Figma Dev Mode
- All layers named semantically (no "Frame 47")
- Inspect panel shows CSS values matching design tokens
- Export assets (icons, illustrations) at 1× and 2×
- Write a "What to implement" annotation on complex components (charts, modal)

**Done when:** Developer can inspect any component and derive exact CSS without guessing  
**Time estimate:** 4–6 hours

---

## 20. Figma Components & Variants

### TierBadge

| Property | Variants |
|---|---|
| tier | `1 — Local`, `2 — Repositioned`, `3 — Cloud` |
| size | `sm`, `md`, `lg` |

### ActionBadge

| Property | Variants |
|---|---|
| action | `ACCEPT`, `REPOSITION`, `ESCALATE` |

### StatusBadge (hardware)

| Property | Variants |
|---|---|
| status | `Online`, `Offline`, `Running`, `Standby`, `Warning`, `Unknown` |

### ConfidenceBar

| Property | Variants |
|---|---|
| level | `High (≥0.7)`, `Medium (0.4–0.69)`, `Low (<0.4)` |
| size | `sm`, `md` |

### MetricCard

| Property | Variants |
|---|---|
| state | `Default`, `Loading`, `Error`, `Mock` |
| accent | `Default`, `Green`, `Amber`, `Red`, `Indigo` |

### Button

| Property | Variants |
|---|---|
| variant | `Primary`, `Secondary`, `Ghost`, `Danger` |
| size | `sm`, `md`, `lg` |
| state | `Default`, `Hover`, `Active`, `Disabled`, `Loading` |

### TimelineItem

| Property | Variants |
|---|---|
| tier | `Tier 1`, `Tier 2`, `Tier 3` |
| state | `Default`, `Hover`, `Selected` |

### FrameCard

| Property | Variants |
|---|---|
| imageState | `Placeholder`, `Loaded`, `Error` |
| tier | `1`, `2`, `3` |
| state | `Default`, `Hover` |

### LoadingSkeleton

| Property | Variants |
|---|---|
| variant | `Text`, `Card`, `Circle`, `Timeline Row`, `Frame Card` |
| animated | `Pulse`, `None` |

### EmptyState

| Property | Variants |
|---|---|
| icon | (multiple — swap icon) |
| hasAction | `With Button`, `Without Button` |

### ErrorState

| Property | Variants |
|---|---|
| severity | `Warning`, `Error` |
| hasRetry | `Yes`, `No` |

### HardwareChip

| Property | Variants |
|---|---|
| status | `Online`, `Offline`, `Standby`, `Running`, `Warning`, `Unknown` |

### Modal

| Property | Variants |
|---|---|
| size | `sm (480px)`, `md (720px)`, `lg (900px)` |
| state | `Default`, `Loading`, `Error` |

### CascadeStatusFlow

| Property | Variants |
|---|---|
| activeTier | `Tier 1 active`, `Tier 2 active`, `Tier 3 active` |
| resolved | `Yes`, `No (in progress)` |

### LiveIndicator

| Property | Variants |
|---|---|
| state | `Live (pulsing green)`, `Stale (amber)`, `Paused (grey)`, `Offline (red)` |

### MockBadge

| Property | Variants |
|---|---|
| — | Single variant: small "MOCK" chip with amber color |

---

## 21. Prototype Flow

### Primary Flow — Judge Demo (< 2 minutes)

```
[Dashboard]
  └─► See Live Indicator pulsing (LIVE)
  └─► See Cost Savings: "88.7% Local Resolution Rate" (prominent)
  └─► See Hardware Status: Camera Online, Agent Running
  └─► See Timeline: recent events, most are Tier 1 (green)
  └─► Click a Tier 2 event (amber) in Timeline
        └─► [Frame Details Modal]
              └─► See Decision: "Tier 2 — Repositioned"
              └─► See Confidence Breakdown: 
                    - Detection: 0.42 (low → red bar)
                    - Tracking: 0.55 (medium → amber bar)
                    - Motion Intensity: 0.38
              └─► See Physical Movement: Pan +20°, Tilt -5°, Status: COMPLETED
              └─► See Cost: "☁ Cloud Call Avoided — YES"
              └─► Close modal
  └─► Click a Tier 3 event (red) in Timeline
        └─► [Frame Details Modal]
              └─► See Decision: "Tier 3 — Escalated to Cloud"
              └─► See Confidence (all low — three red bars)
              └─► See Cost: "Cloud Call Avoided — NO"
              └─► Close modal
  └─► Navigate to Analytics
        └─► [Analytics Page]
              └─► See Donut: "88.7% Local" in center — dominant green
              └─► See tier counts: Tier 1: 85, Tier 2: 41, Tier 3: 16
              └─► See Cost Comparison bars: huge gap between "without cascade" and "with cascade"
  └─► Navigate to Frames History
        └─► [Frames History Page]
              └─► See full grid of event cards
              └─► Click "Tier 3" filter
              └─► Grid narrows to only 16 escalated events
              └─► Visual message: "Only 11.3% of events reached cloud"
```

### Tier 2 Cascade Flow (focused)

```
[Dashboard — Cascade Status Widget]
  └─► Tier 1 active (green) — local confidence: 0.42 (too low)
  └─► Arrow → Tier 2 activates (amber) — "Repositioning camera…"
  └─► Physical Movement displayed: Pan +20°, Tilt -5°
  └─► Tier 1 runs again — new confidence: 0.83
  └─► RESOLVED at Tier 2 — Cloud saved ✓
```

### Tier 3 Escalation Flow (focused)

```
[Dashboard — Cascade Status Widget]
  └─► Tier 1 — confidence: 0.28 (too low)
  └─► Tier 2 — reposition; confidence: 0.31 (still too low)
  └─► Tier 3 activates (red) — "Escalating to Amazon Bedrock…"
  └─► Cloud VLM responds — Event recorded with cloud_cost_avoided: false
```

---

## 22. Implementation Roadmap

### Phase 1 — Project Setup (Days 1–2)

- [ ] Initialize Vite + React + TypeScript project in `frontend/`
- [ ] Install dependencies: `recharts lucide-react`
- [ ] Configure `vite.config.ts`: path aliases, env vars
- [ ] Create `.env.local` with `VITE_API_BASE_URL`
- [ ] Create `globals.css` with all CSS custom properties (design tokens)
- [ ] Create `typography.css` with Inter font import + type scale
- [ ] Create `reset.css`
- [ ] Set up ESLint + Prettier
- [ ] Create project folder structure as per Section 12.2
- [ ] Create `constants/api.ts`, `constants/tiers.ts`, `constants/mock.ts`
- [ ] Set up React Router: 3 routes (`/`, `/frames`, `/analytics`)

### Phase 2 — Type Definitions + Mock Data (Days 3–4)

- [ ] Create all TypeScript interfaces in `types/index.ts` (Section 11)
- [ ] Create all mock data files in `mocks/` (Section 9)
- [ ] Validate mock data against type definitions (TypeScript compile)
- [ ] Create `utils/formatters.ts` (formatTimestamp, formatTier, formatPercentage)
- [ ] Create `utils/transforms.ts`

### Phase 3 — Global UI Components (Days 5–7)

Build in this order (simplest first):
- [ ] `LoadingSkeleton`
- [ ] `EmptyState`
- [ ] `ErrorState`
- [ ] `Button`
- [ ] `TierBadge`
- [ ] `ActionBadge`
- [ ] `StatusBadge`
- [ ] `MockBadge`
- [ ] `ProgressBar`
- [ ] `ConfidenceBar` + `ConfidenceGauge`
- [ ] `MetricCard`
- [ ] `Tooltip`
- [ ] `Modal`
- [ ] `DateRangePicker`
- [ ] `ChartCard`
- [ ] `LiveIndicator`

### Phase 4 — API Layer + Hooks (Days 8–9)

- [ ] `api/client.ts` with error handling
- [ ] `api/events.api.ts`
- [ ] `api/stats.api.ts`
- [ ] `services/events.service.ts` (USE_MOCK flag routing)
- [ ] `services/stats.service.ts`
- [ ] `hooks/usePolling.ts`
- [ ] `hooks/usePageVisibility.ts`
- [ ] `hooks/useEvents.ts`
- [ ] `hooks/useStats.ts`
- [ ] `hooks/useEventDetail.ts`
- [ ] `hooks/useEventHistory.ts`
- [ ] `hooks/useHardwareStatus.ts` (mock only)
- [ ] `hooks/useLiveMonitoring.ts` (mock only)

### Phase 5 — App Layout + Navigation (Day 10)

- [ ] `AppLayout` component
- [ ] `Header` with logo + nav links + LiveIndicator
- [ ] Mobile navigation (bottom tab bar)
- [ ] Page route components (empty shells): `DashboardPage`, `FramesPage`, `AnalyticsPage`

### Phase 6 — Main Dashboard (Days 11–15)

- [ ] `LiveStreamWidget` (placeholder with CSS animation)
- [ ] `CurrentDetectionCard`
- [ ] `ConfidenceGauge` (live version)
- [ ] `CascadeStatusFlow` widget
- [ ] `CostSavingsGrid` (4 MetricCards) — connected to `useStats`
- [ ] `HardwareChip` + `HardwareStatusGrid` — connected to `useHardwareStatus`
- [ ] `TimelineItem`
- [ ] `DecisionsTimeline` with polling — connected to `useEvents`
- [ ] `StaleDataBanner`
- [ ] Dashboard 2-column layout

### Phase 7 — Frames History (Days 16–20)

- [ ] `TierFilter` segmented button
- [ ] `ActionFilter` dropdown
- [ ] `DateRangePicker` integration
- [ ] `FramesFilterBar` composition
- [ ] `FrameImagePlaceholder`
- [ ] `FrameCard`
- [ ] `FramesGallery` grid
- [ ] `DecisionSection` (modal)
- [ ] `ConfidenceBreakdownSection` (modal)
- [ ] `CostSection` (modal)
- [ ] `MovementSection` (modal, mock)
- [ ] `FrameDetailsModal` composition — connected to `useEventDetail`
- [ ] Frames History page composition

### Phase 8 — Analytics (Days 21–25)

- [ ] `AnalyticsDatePicker`
- [ ] `OverviewCardsRow`
- [ ] `TierDonutChart` with Recharts
- [ ] `CostComparisonChart` with Recharts
- [ ] `AdaptiveThresholdCard`
- [ ] `ThresholdHistoryChart` with Recharts
- [ ] `EscalationPerformanceChart` with Recharts
- [ ] Analytics page composition

### Phase 9 — States & Polish (Days 26–28)

- [ ] Verify all loading states render correctly
- [ ] Verify all empty states
- [ ] Verify all error states
- [ ] Responsive design: test at 390px, 768px, 1280px
- [ ] Accessibility audit: keyboard navigation, contrast, ARIA
- [ ] Add MockBadge to all MOCK data sections
- [ ] Review all mock data for realism

### Phase 10 — Real API Integration (as backend becomes available)

- [ ] Verify CORS headers on API Gateway
- [ ] Connect `GET /events/latest` → Dashboard timeline
- [ ] Connect `GET /stats` → Dashboard cost cards
- [ ] Connect `GET /events?from=&to=` → Frames History
- [ ] Connect `GET /events?tier=` → Tier filter
- [ ] Connect `GET /events/{request_id}` → Frame Details Modal
- [ ] Connect `GET /stats?from=&to=` → Analytics
- [ ] Set `VITE_MOCK_EVENTS=false`, `VITE_MOCK_STATS=false`
- [ ] Test all filter combinations against live API

### Phase 11 — Pending Backend Integration (when APIs become available)

- [ ] Live stream → replace placeholder with real stream
- [ ] Hardware status API → replace mock with real
- [ ] Adaptive threshold API → replace mock with real
- [ ] Frame images → replace placeholder with real images
- [ ] Repositioning data in events → replace mock movement section
- [ ] WebSocket → replace polling in `useEvents` + `useLiveMonitoring`

### Phase 12 — Final QA (Days 29–30)

- [ ] Full user flow test
- [ ] Error simulation (disconnect network, kill API)
- [ ] Performance check (no unnecessary re-renders)
- [ ] Final responsive check on real devices
- [ ] Competition demo run-through

---

## 23. Backend Integration Plan

### `GET /events/latest?limit=N`

- **Used by:** Dashboard Recent Decisions Timeline
- **Called by:** `useEvents` hook, polling every 10s
- **Data transformation:**
  - Parse `timestamp` with `new Date()` — handle both `Z` and `+00:00` suffixes
  - Access `tier_breakdown` keys as strings (`"1"`, `"2"`, `"3"`)
  - If `confidence_breakdown` is absent: show "—" in confidence cells
  - Rename `optical_flow` → "Motion Intensity" in all display labels
- **UI mapping:** Each item → `TimelineItem` component

### `GET /stats?from=&to=`

- **Used by:** Dashboard Cost Savings (no params = today) + Analytics (with params)
- **Called by:** `useStats` hook
- **Data transformation:**
  - `tier_breakdown` keys are strings in JSON; parse with `parseInt(key)`
  - Calculate tier percentages: `(count / total_events) × 100`
  - Estimated savings: `cost_avoided_count × MOCK_BEDROCK_COST_PER_CALL` — flag as estimated
- **Dashboard polling:** Every 30s

### `GET /events?from=&to=[&tier=]`

- **Used by:** Frames History page
- **Called by:** `useEventHistory` hook, on filter change
- **Query building:**
  ```typescript
  const params = new URLSearchParams();
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.tier) params.set('tier', String(filters.tier));
  ```
- **Client-side action filter:** After API response, filter array by `action_taken` if `filters.action` is set
- **No pagination:** Load all matching events; display with client-side virtual scroll if count > 100

### `GET /events/{request_id}`

- **Used by:** Frame Details Modal
- **Called by:** `useEventDetail(request_id)`, triggered by card/timeline click
- **Note:** Response has no `count` field — handle `response.events[0]` as the single event
- **Error handling:** 404 → "Event not found"; 500 → "Could not load event details"

### `POST /events`

- **Not called by the frontend.** This endpoint is exclusively for the AI Agent.
- Frontend team does not need to implement this.

### Future APIs needed

| Feature | Minimum required response |
|---|---|
| Live stream | `{ streamUrl: "wss://..." \| "https://..." }` or direct MJPEG URL |
| Hardware status | `{ camera: {status}, panTilt: {status, position}, edgeDevice: {status, cpu, mem}, agent: {status} }` |
| Frame images | Event response gains `image_url: string` or `image_key: string` (S3 key) |
| Adaptive threshold | `{ current: number, history: [{timestamp, value}], method: string }` |
| Repositioning data | Event response gains `movement: {pan_delta, tilt_delta, actual_pan, actual_tilt, status}` |

---

## 24. Backend Contract Requirements

### Already Available ✅

| Data | API | Frontend use |
|---|---|---|
| Total events (today) | `GET /stats` | Dashboard total events card |
| Cost avoided count | `GET /stats` | Dashboard cloud calls avoided card |
| Cost avoided % | `GET /stats` | Dashboard headline metric |
| Tier breakdown | `GET /stats` | Analytics donut chart |
| Recent events (today) | `GET /events/latest` | Dashboard timeline |
| Historical events (date range) | `GET /events?from=&to=` | Frames History gallery |
| Tier filter | `GET /events?tier=` | Frames History filter |
| Event detail | `GET /events/{request_id}` | Frame Details Modal |
| Confidence breakdown | `DecisionEvent.confidence_breakdown` | All confidence displays |

### Available but Needs Clarification ⚠️

| Issue | Ask |
|---|---|
| `tier_breakdown` keys as strings | Confirm: are keys always `"1"`, `"2"`, `"3"` as strings in JSON? |
| `GET /events` missing `count` on `{request_id}` route | Confirm: should frontend expect `events[0]` as single result? |
| `adaptive_threshold_used` field | What type/shape should the frontend expect? When is it present? |
| `confidence_score` field | What does this represent vs `confidence_breakdown`? When is it present? |
| CORS | Are `Access-Control-Allow-Origin` headers set on the API Gateway? |
| `GET /events` with no from/to AND no tier | Returns 400 — confirm this is expected; frontend must enforce both params |

### Needed Later (Proposed API contracts) 🔜

#### `GET /hardware/status`

```json
{
  "camera": { "name": "CAM-01", "status": "online", "last_seen": "ISO-8601" },
  "pan_tilt": { "name": "PTZ-01", "status": "standby", "pan": 0, "tilt": 0 },
  "edge_device": { "name": "Pi-5-001", "status": "online", "cpu_percent": 34, "mem_percent": 58 },
  "agent": { "name": "Decision Agent", "status": "running", "last_decision": "ISO-8601" },
  "cloud": { "name": "Amazon Bedrock", "status": "standby" }
}
```

#### `GET /threshold/current`

```json
{
  "current_threshold": 0.65,
  "method": "adaptive",
  "last_updated": "ISO-8601"
}
```

#### `GET /threshold/history?from=&to=`

```json
{
  "history": [
    { "timestamp": "ISO-8601", "value": 0.70 },
    { "timestamp": "ISO-8601", "value": 0.68 }
  ]
}
```

#### Enhancement to `DecisionEvent` (no new endpoint, just additional fields)

```json
{
  "...existing fields...",
  "image_url": "https://s3.../frame-abc.jpg",
  "movement": {
    "pan_delta": 20,
    "tilt_delta": -5,
    "actual_pan": 20,
    "actual_tilt": -5,
    "status": "COMPLETED"
  }
}
```

This is the lowest-effort backend enhancement — no new route needed, just store and return two extra fields on existing events.

---

## 25. Testing / QA

### Component Testing

- Tool: **Vitest + React Testing Library**
- Test every component for: renders correctly, loading state, empty state, error state
- Test `TierBadge` renders correct color + label for each tier
- Test `ConfidenceBar` renders correct color for each level

### Hook Testing

- Test `usePolling` starts/stops correctly
- Test `useEvents` returns mock data when `USE_MOCK.events = true`
- Test `useEventHistory` builds correct query params

### Integration Testing

- Test real API calls return expected shape (manual + automated with Vitest)
- Test that `tier_breakdown["1"]` is accessible as a string key

### Visual Testing (manual)

- All three pages at 390px, 768px, 1280px, 1920px
- Dark mode (default) — verify no white flashes

### State Testing

- Simulate API failure → verify error state appears
- Simulate empty response → verify empty state appears
- Simulate slow network → verify skeleton appears and then resolves

### Accessibility Testing

- Run `axe-core` automated scan via `@axe-core/react` in development mode
- Manually test keyboard navigation (Tab, Shift+Tab, Enter, Escape)
- Test with screen reader (NVDA or VoiceOver) on Dashboard page

---

## 26. Competition Demo Preparation

### What to show in 60 seconds

1. **Open Dashboard** — judge sees immediately:
   - "88.7% Local Resolution Rate" (large)
   - Live feed ticking (recent events appearing)
   - Hardware all green

2. **Point to timeline** — explain: "These are real decisions. Green = local. Amber = repositioned. Red = escalated."

3. **Click a Tier 2 event** — show:
   - Confidence breakdown (detection was 0.42, too low)
   - Physical movement: camera moved 20° pan
   - Result: cloud call avoided

4. **Navigate to Analytics** — show:
   - Donut: "88.7% resolved before cloud"
   - Cost bars: dramatic difference

5. **One sentence summary:** "By moving the camera before calling Bedrock, we avoided 88.7% of cloud VLM costs."

### What to have pre-loaded for demo

- Mock data showing realistic distribution: ~60% Tier 1, ~29% Tier 2, ~11% Tier 3
- At least one dramatic Tier 2 event (detection went from 0.42 to 0.83 after reposition)
- Statistics showing > 80% cost avoidance

### Visual design priority for demo

- The "88.7% Local Resolution" number must be the largest visible element on the Dashboard
- The cascade flow (Tier 1 → 2 → 3) visual must be immediately readable in < 5 seconds
- No placeholder "TODO" text visible anywhere during demo — use MockBadge instead

---

## 27. Final Checklist

### Design (Figma)

```
[ ] IA diagram complete
[ ] User flows documented
[ ] Wireframes complete (all 3 pages + modal)
[ ] Design system created (colors, type, spacing, shadows)
[ ] All component variants designed
[ ] High-fidelity desktop UI complete
[ ] Tablet layouts complete
[ ] Mobile layouts complete
[ ] Prototype connected (judge demo flow)
[ ] Developer handoff annotations complete
```

### Foundation (Code)

```
[ ] Vite + React + TypeScript project initialized
[ ] CSS design tokens defined
[ ] TypeScript types defined
[ ] Mock data created for all sections
[ ] Routing configured (3 routes)
[ ] API client created with error handling
[ ] Feature flag system for mock/real switching
```

### Components

```
[ ] LoadingSkeleton (all variants)
[ ] EmptyState
[ ] ErrorState
[ ] Button (all variants)
[ ] TierBadge (all tiers)
[ ] ActionBadge (all actions)
[ ] StatusBadge (all statuses)
[ ] MockBadge
[ ] ConfidenceBar + ConfidenceGauge
[ ] MetricCard (all states)
[ ] Modal
[ ] DateRangePicker
[ ] ChartCard
[ ] LiveIndicator
[ ] StaleDataBanner
```

### Hooks & Services

```
[ ] usePolling (generic)
[ ] usePageVisibility
[ ] useEvents (latest)
[ ] useStats
[ ] useEventDetail
[ ] useEventHistory (with filters)
[ ] useHardwareStatus (mock)
[ ] useLiveMonitoring (mock)
[ ] events.service.ts (mock/real routing)
[ ] stats.service.ts (mock/real routing)
```

### Dashboard Page

```
[ ] LiveStreamWidget (placeholder)
[ ] CurrentDetectionCard (mock)
[ ] ConfidenceGauge — live (mock)
[ ] CascadeStatusFlow widget (mock)
[ ] CostSavingsGrid — 4 cards
[ ] HardwareStatusGrid — 6 chips
[ ] DecisionsTimeline with polling
[ ] Dashboard layout (2-col desktop, 1-col mobile)
```

### Frames History Page

```
[ ] TierFilter (segmented)
[ ] ActionFilter (dropdown)
[ ] DateRangePicker integration
[ ] FramesGallery grid
[ ] FrameCard (with placeholder image)
[ ] FrameDetailsModal
[ ] DecisionSection in modal
[ ] ConfidenceBreakdownSection in modal
[ ] CostSection in modal
[ ] MovementSection in modal (mock)
```

### Analytics Page

```
[ ] AnalyticsDatePicker
[ ] OverviewCardsRow (5 cards)
[ ] TierDonutChart
[ ] CostComparisonChart
[ ] AdaptiveThresholdCard (mock)
[ ] ThresholdHistoryChart (mock)
[ ] EscalationPerformanceChart (mock)
```

### States

```
[ ] All loading states complete
[ ] All empty states complete
[ ] All error states complete
[ ] Stale data banner implemented
[ ] Network offline banner implemented
```

### Responsive

```
[ ] Dashboard: desktop ✓, tablet ✓, mobile ✓
[ ] Frames History: desktop ✓, tablet ✓, mobile ✓
[ ] Analytics: desktop ✓, tablet ✓, mobile ✓
[ ] Modal: desktop ✓, tablet ✓, mobile (bottom drawer) ✓
[ ] Navigation: desktop nav ✓, mobile bottom tabs ✓
```

### Accessibility

```
[ ] Keyboard navigation on all interactive elements
[ ] Focus rings visible
[ ] Color contrast passes WCAG AA
[ ] Tier communication: color + icon + text (never color alone)
[ ] ARIA labels on icon-only buttons
[ ] aria-live on timeline
[ ] Modal focus trap
[ ] Screen reader test passed
```

### API Integration (Phase 10)

```
[ ] CORS confirmed on API Gateway
[ ] GET /events/latest → Dashboard timeline ✓
[ ] GET /stats → Dashboard cost cards ✓
[ ] GET /events?from=&to= → Frames History ✓
[ ] GET /events?tier= → Tier filter ✓
[ ] GET /events/{request_id} → Frame Details Modal ✓
[ ] GET /stats?from=&to= → Analytics ✓
[ ] Mock flags set to false for integrated endpoints
```

### Pending Integration (Phase 11 — when APIs ready)

```
[ ] Live stream API → replace placeholder
[ ] Hardware status API → replace mock
[ ] Frame images → replace placeholder
[ ] Repositioning data in events → replace mock movement section
[ ] Adaptive threshold API → replace mock
[ ] WebSocket/SSE → replace polling (when available)
```

### QA

```
[ ] Full demo flow test (judge scenario)
[ ] API failure states tested
[ ] Empty state tested (clear DB or use empty mock)
[ ] Responsive test at 390px / 768px / 1280px
[ ] axe-core scan: 0 critical violations
[ ] Keyboard navigation test: full flow possible without mouse
[ ] Performance: no unnecessary re-renders on polling tick
[ ] Build succeeds: npm run build → 0 errors
[ ] Competition demo run-through: < 2 minutes, all states correct
```

---

*This document is the master frontend implementation roadmap for the Steropes project. Every design decision, API mapping, type definition, and implementation step is derived from the approved sitemap, the backend API reference (analyzed 2026-09-16), and the project documentation. Nothing in this document is invented beyond what is grounded in those sources.*

*MOCK items will be replaced with real data as the backend team delivers APIs. The UI structure does not need to change — only the data source.*
