import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createEventStream } from './eventGenerator';
import { DEMO_MODE } from '@/constants/mock';
import type { DecisionEvent } from '@/types';

vi.mock('@/constants/mock', () => ({
  DEMO_MODE: {
    enabled: true,
    maxLiveEvents: 5,
    eventsTickMs: 10,
    liveTickMs: 10
  }
}));

describe('eventGenerator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('maintains buffer cap and prepends items', () => {
    const seed = [
      { request_id: 'seed-1', timestamp: '2026-09-16T10:00:00Z' } as DecisionEvent
    ];
    
    const stream = createEventStream(seed);
    stream.start();
    
    // Tick enough times to exceed maxLiveEvents
    vi.advanceTimersByTime(100);
    
    const recent = stream.getRecent(10);
    expect(recent.length).toBeLessThanOrEqual(5); // maxLiveEvents is mocked to 5
    
    // Check that seed is pushed out or it is at the end if not exceeded
    // In this case we advanced enough ticks (10) to generate 10 events, capping at 5
    expect(recent[recent.length - 1].request_id).not.toBe('seed-1');
    expect(recent[0].request_id).not.toBe('seed-1');
    
    stream.stop();
  });
});
