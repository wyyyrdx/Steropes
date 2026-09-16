import { apiFetch } from './client';
import type { EventListResponse, SingleEventResponse } from '@/types';

export async function fetchLatestEvents(
  limit: number,
  signal?: AbortSignal
): Promise<EventListResponse> {
  return apiFetch(`/events/latest?limit=${limit}`, { signal });
}

export async function fetchEvents(
  params: { from: string; to: string; tier?: 1 | 2 | 3 },
  signal?: AbortSignal
): Promise<EventListResponse> {
  const query = new URLSearchParams();
  query.append('from', params.from);
  query.append('to', params.to);
  if (params.tier !== undefined) {
    query.append('tier', String(params.tier));
  }
  return apiFetch(`/events?${query.toString()}`, { signal });
}

export async function fetchEventById(
  requestId: string,
  signal?: AbortSignal
): Promise<SingleEventResponse> {
  return apiFetch(`/events/${encodeURIComponent(requestId)}`, { signal });
}
