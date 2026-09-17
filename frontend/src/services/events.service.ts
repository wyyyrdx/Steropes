import { USE_MOCK, DEMO_MODE } from '@/constants';
import { mockEvents, eventStream } from '@/mocks';
import { fetchLatestEvents, fetchEvents, fetchEventById } from '@/api';
import type { DecisionEvent, EventFilters, EventListResponse } from '@/types';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let streamStarted = false;
function ensureStream() {
  if (DEMO_MODE.enabled && !streamStarted) {
    eventStream.start();
    streamStarted = true;
  }
}

export async function getLatestEvents(
  limit: number,
  signal?: AbortSignal
): Promise<EventListResponse> {
  if (USE_MOCK.events) {
    await delay(200);
    if (DEMO_MODE.enabled) {
      ensureStream();
      const events = eventStream.getRecent(limit);
      return { events, count: events.length };
    }
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
    
    let allEvents = [...mockEvents];
    if (DEMO_MODE.enabled) {
      ensureStream();
      // Combine live buffer and static seed, remove duplicates by request_id
      const liveEvents = eventStream.getRecent(DEMO_MODE.maxLiveEvents);
      const liveIds = new Set(liveEvents.map(e => e.request_id));
      const filteredMocks = mockEvents.filter(e => !liveIds.has(e.request_id));
      allEvents = [...liveEvents, ...filteredMocks];
    }
    
    let events = [...allEvents];
    
    // Note: The previous code checked `e.tier === filters.tier` which is wrong because the type is `tier_resolved`.
    // I am fixing that bug too based on types/index.ts.
    if (filters.tier != null) {
      events = events.filter(e => e.tier_resolved === filters.tier);
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
    if (DEMO_MODE.enabled) {
      ensureStream();
      const liveEvent = eventStream.getRecent(DEMO_MODE.maxLiveEvents).find(e => e.request_id === requestId);
      if (liveEvent) return liveEvent;
    }
    const event = mockEvents.find(e => e.request_id === requestId);
    return event || null;
  }
  
  const response = await fetchEventById(requestId, signal);
  return response.events[0] ?? null;
}
