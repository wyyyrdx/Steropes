import { USE_MOCK } from '@/constants';
import { mockEvents } from '@/mocks';
import { fetchLatestEvents, fetchEvents, fetchEventById } from '@/api';
import type { DecisionEvent, EventFilters, EventListResponse } from '@/types';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getLatestEvents(
  limit: number,
  signal?: AbortSignal
): Promise<EventListResponse> {
  if (USE_MOCK.events) {
    await delay(200);
    return {
      events: mockEvents.slice(0, limit),
      count: Math.min(limit, mockEvents.length)
    };
  }
  return fetchLatestEvents(limit, signal);
}

export async function getEvents(
  filters: EventFilters,
  signal?: AbortSignal
): Promise<EventListResponse> {
  if (USE_MOCK.events) {
    await delay(200);
    let events = [...mockEvents];
    
    if (filters.tier !== undefined) {
      events = events.filter(e => e.tier === filters.tier);
    }
    if (filters.from && filters.to) {
      events = events.filter(e => {
        const dateStr = e.timestamp.split('T')[0];
        return dateStr >= filters.from! && dateStr <= filters.to!;
      });
    }
    if (filters.action) {
      events = events.filter(e => e.action_taken === filters.action);
    }
    
    return {
      events,
      count: events.length
    };
  }
  
  // Real API requires from and to
  const today = new Date().toISOString().split('T')[0];
  const from = filters.from || today;
  const to = filters.to || today;
  
  const response = await fetchEvents({ from, to, tier: filters.tier }, signal);
  
  // Client-side action filtering
  if (filters.action) {
    const filtered = response.events.filter(e => e.action_taken === filters.action);
    return {
      events: filtered,
      count: filtered.length // or response.count if backend count is preferred, but filtering changes it
    };
  }
  
  return response;
}

export async function getEventById(
  requestId: string,
  signal?: AbortSignal
): Promise<DecisionEvent | null> {
  if (USE_MOCK.events) {
    await delay(200);
    const event = mockEvents.find(e => e.request_id === requestId);
    return event || null;
  }
  
  const response = await fetchEventById(requestId, signal);
  return response.events[0] ?? null;
}
