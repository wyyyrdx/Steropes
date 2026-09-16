import { useState, useEffect, useRef, useCallback } from 'react';
import { usePageVisibility } from './usePageVisibility';

export function usePolling<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  intervalMs: number,
  options?: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
  }
) {
  const isVisible = usePageVisibility();
  const enabled = options?.enabled ?? true;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const failureCount = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const fetchRef = useRef(fetcher);
  fetchRef.current = fetcher;

  const onSuccessRef = useRef(options?.onSuccess);
  onSuccessRef.current = options?.onSuccess;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const executeFetch = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    try {
      const result = await fetchRef.current(controller.signal);
      if (!controller.signal.aborted && isMountedRef.current) {
        setData(result);
        setError(null);
        setLastUpdated(new Date());
        failureCount.current = 0;
        if (onSuccessRef.current) {
          onSuccessRef.current(result);
        }
      }
    } catch (err: any) {
      if (!controller.signal.aborted && isMountedRef.current) {
        setError(err instanceof Error ? err.message : String(err));
        failureCount.current += 1;
      }
    } finally {
      if (!controller.signal.aborted && isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const refetch = useCallback(() => {
    failureCount.current = 0;
    executeFetch();
  }, [executeFetch]);

  useEffect(() => {
    const clearTimers = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };

    clearTimers();

    if (!enabled || !isVisible) {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      setIsLoading(false);
      return;
    }

    let isEffectActive = true;

    const scheduleNext = () => {
      if (!isEffectActive || !isMountedRef.current || !isVisible || !enabled) return;
      
      const delay = failureCount.current >= 3 ? 60000 : intervalMs;
      
      timeoutRef.current = setTimeout(() => {
        if (failureCount.current >= 3) {
          failureCount.current = 0;
        }
        executeFetch().finally(scheduleNext);
      }, delay);
    };

    executeFetch().finally(scheduleNext);

    return () => {
      isEffectActive = false;
      clearTimers();
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [enabled, isVisible, intervalMs, executeFetch]);

  return { data, error, isLoading, lastUpdated, refetch };
}
