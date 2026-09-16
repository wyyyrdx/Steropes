import { apiFetch } from './client';
import type { StatsResponse } from '@/types';

export async function fetchStats(
  params?: { from?: string; to?: string },
  signal?: AbortSignal
): Promise<StatsResponse> {
  let url = '/stats';
  if (params && (params.from || params.to)) {
    const query = new URLSearchParams();
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    url += `?${query.toString()}`;
  }
  return apiFetch(url, { signal });
}
