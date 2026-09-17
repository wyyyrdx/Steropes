import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLiveStream } from './liveGenerator';

vi.mock('@/constants/mock', () => ({
  DEMO_MODE: {
    enabled: true,
    maxLiveEvents: 5,
    eventsTickMs: 10,
    liveTickMs: 10
  }
}));

describe('liveGenerator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('publishes live state to subscribers', () => {
    const stream = createLiveStream();
    const mockCb = vi.fn();
    
    const unsubscribe = stream.subscribe(mockCb);
    stream.start();
    
    vi.advanceTimersByTime(25); // Should tick twice (10ms each)
    
    expect(mockCb).toHaveBeenCalled();
    expect(mockCb.mock.calls.length).toBeGreaterThanOrEqual(2);
    
    stream.stop();
    unsubscribe();
  });

  it('provides the current state immediately on subscribe if available', () => {
    const stream = createLiveStream();
    stream.start();
    vi.advanceTimersByTime(15);
    
    const mockCb = vi.fn();
    const unsubscribe = stream.subscribe(mockCb);
    
    // It should have immediately called with current state
    expect(mockCb).toHaveBeenCalledTimes(1);
    
    stream.stop();
    unsubscribe();
  });
});
