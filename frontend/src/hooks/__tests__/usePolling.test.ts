import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePolling } from '../usePolling';
import * as visibilityHook from '../usePageVisibility';

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(visibilityHook, 'usePageVisibility').mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('fetches immediately on mount', async () => {
    const fetcher = vi.fn().mockResolvedValue('data');
    
    const { result } = renderHook(() => usePolling(fetcher, 1000));
    
    expect(result.current.isLoading).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(result.current.data).toBe('data');
    expect(result.current.isLoading).toBe(false);
  });

  it('polls at given interval', async () => {
    const fetcher = vi.fn().mockResolvedValue('data');
    
    renderHook(() => usePolling(fetcher, 1000));
    
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('stops polling when page is hidden', async () => {
    const fetcher = vi.fn().mockResolvedValue('data');
    
    vi.spyOn(visibilityHook, 'usePageVisibility').mockReturnValue(false);
    
    renderHook(() => usePolling(fetcher, 1000));
    
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    
    // 0 calls because it starts hidden
    expect(fetcher).toHaveBeenCalledTimes(0);
  });

  it('backs off after 3 failures', async () => {
    let callCount = 0;
    const fetcher = vi.fn().mockImplementation(() => {
      callCount++;
      return Promise.reject(new Error('fail'));
    });
    
    renderHook(() => usePolling(fetcher, 1000));
    
    // Initial fetch (1st failure)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    
    // Next poll (2nd failure)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000); 
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
    
    // Next poll (3rd failure)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000); 
    });
    
    expect(fetcher).toHaveBeenCalledTimes(3);
    
    // Wait for the next regular interval (should be skipped due to backoff)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000); 
    });
    expect(fetcher).toHaveBeenCalledTimes(3);

    // Wait for the remaining 59s of the backoff
    await act(async () => {
      await vi.advanceTimersByTimeAsync(59000);
    });
    
    expect(fetcher).toHaveBeenCalledTimes(4);
  });

  it('cleans up abort controller on unmount', async () => {
    let capturedSignal: AbortSignal;
    const fetcher = vi.fn().mockImplementation((signal) => {
      capturedSignal = signal;
      return new Promise(() => {}); // never resolves
    });
    
    const { unmount } = renderHook(() => usePolling(fetcher, 1000));
    
    expect(capturedSignal!.aborted).toBe(false);
    
    unmount();
    
    expect(capturedSignal!.aborted).toBe(true);
  });
});
