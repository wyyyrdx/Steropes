import type { StatsResponse, TierBreakdown, ThresholdPoint, EscalationRange } from '@/types';
import { MOCK_BEDROCK_COST_PER_CALL } from './transforms';

export function buildTierChartData(raw: TierBreakdown) {
  const v1 = Number(raw["1"]) || 0;
  const v2 = Number(raw["2"]) || 0;
  const v3 = Number(raw["3"]) || 0;
  const total = v1 + v2 + v3;
  return [
    { name: 'Tier 1', value: v1, color: 'var(--chart-tier-1)', percent: total ? (v1 / total) * 100 : 0 },
    { name: 'Tier 2', value: v2, color: 'var(--chart-tier-2)', percent: total ? (v2 / total) * 100 : 0 },
    { name: 'Tier 3', value: v3, color: 'var(--chart-tier-3)', percent: total ? (v3 / total) * 100 : 0 },
  ];
}

export function buildCostChartData(
  stats: StatsResponse,
  days: number = 7
): Array<{ category: string; without: number; with: number }> {
  const totalWithout = stats.total_events * MOCK_BEDROCK_COST_PER_CALL;
  const totalWith = (Number(stats.tier_breakdown["3"]) || 0) * MOCK_BEDROCK_COST_PER_CALL;

  if (days <= 1) {
    return [
      {
        category: 'Today',
        without: parseFloat(totalWithout.toFixed(4)),
        with: parseFloat(totalWith.toFixed(4)),
      }
    ];
  }

  // Produce deterministic per-day variation using sin-based multipliers
  const multipliers: number[] = [];
  let multiplierSum = 0;
  for (let i = 0; i < days; i++) {
    const m = Math.sin(i + 1) * 0.15 + 1;
    multipliers.push(m);
    multiplierSum += m;
  }

  // Generate date labels going back from today
  const today = new Date();
  const rows: Array<{ category: string; without: number; with: number }> = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const fraction = multipliers[i] / multiplierSum;
    rows.push({
      category: label,
      without: parseFloat((totalWithout * fraction).toFixed(4)),
      with: parseFloat((totalWith * fraction).toFixed(4)),
    });
  }

  return rows;
}

export function buildThresholdSeries(history: ThresholdPoint[]) {
  return history.map(point => {
    const d = new Date(point.timestamp);
    const label = d.toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    return {
      timestamp: point.timestamp,
      value: point.value,
      label
    };
  });
}

export function buildEscalationBars(ranges: EscalationRange[]) {
  return ranges.map(r => ({
    range: r.range,
    escalations: r.escalations
  }));
}
