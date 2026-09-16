import { USE_MOCK } from '@/constants';
import { mockStats } from '@/mocks';
import { fetchStats } from '@/api';
import type { StatsResponse } from '@/types';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getStats(
  params?: { from?: string; to?: string },
  signal?: AbortSignal
): Promise<StatsResponse> {
  if (USE_MOCK.stats) {
    await delay(200);
    return mockStats;
  }
  return fetchStats(params, signal);
}
