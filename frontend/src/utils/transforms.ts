import type { DecisionEvent, TierBreakdown } from '@/types';

export const MOCK_BEDROCK_COST_PER_CALL = 0.002; // Illustrative placeholder (Section 6.1.3)

export function parseTierBreakdown(raw?: TierBreakdown | Partial<Record<string, number>>): { tier1: number; tier2: number; tier3: number } {
  return {
    tier1: Number(raw?.["1"]) || 0,
    tier2: Number(raw?.["2"]) || 0,
    tier3: Number(raw?.["3"]) || 0,
  };
}

export function computeTierPercentages(raw: TierBreakdown | Partial<Record<string, number>>): { tier1: number; tier2: number; tier3: number } {
  const { tier1, tier2, tier3 } = parseTierBreakdown(raw);
  const total = tier1 + tier2 + tier3;
  if (total === 0) return { tier1: 0, tier2: 0, tier3: 0 };
  return {
    tier1: (tier1 / total) * 100,
    tier2: (tier2 / total) * 100,
    tier3: (tier3 / total) * 100,
  };
}

export function computeLocalResolutionRate(raw: TierBreakdown | Partial<Record<string, number>>): number {
  const { tier1, tier2, tier3 } = parseTierBreakdown(raw);
  const total = tier1 + tier2 + tier3;
  if (total === 0) return 0;
  return ((tier1 + tier2) / total) * 100;
}

export function computeEstimatedSavings(cloudCallsAvoided: number): number | null {
  return cloudCallsAvoided * MOCK_BEDROCK_COST_PER_CALL;
}

export function deriveBackendStatus(lastSuccessAt: Date | null, lastFailureAt: Date | null): 'online' | 'offline' | 'warning' | 'unknown' {
  if (!lastSuccessAt && !lastFailureAt) return 'unknown';
  if (lastSuccessAt && !lastFailureAt) return 'online';
  if (!lastSuccessAt && lastFailureAt) return 'warning';
  if (lastFailureAt && lastSuccessAt) {
    if (lastFailureAt.getTime() > lastSuccessAt.getTime()) {
      return 'warning';
    }
    return 'online';
  }
  return 'unknown';
}

export function normalizeEvent(raw: DecisionEvent): DecisionEvent {
  const normalized = { ...raw };
  if (normalized.timestamp.endsWith('+00:00')) {
    normalized.timestamp = normalized.timestamp.replace('+00:00', 'Z');
  }
  return normalized;
}
