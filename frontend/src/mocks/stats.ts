import type { StatsResponse } from '@/types';

export const mockStats: StatsResponse = {
  total_events: 142,
  tier_breakdown: { "1": 85, "2": 41, "3": 16 },
  cost_avoided_count: 126,
  cost_avoided_percentage: 88.7,
};
