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
