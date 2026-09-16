import { useState, useEffect, useRef, useCallback } from 'react';
import { getEventById } from '@/services';
import type { DecisionEvent } from '@/types';

export function useEventDetail(requestId: string | null): {
  event: DecisionEvent | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [event, setEvent] = useState<DecisionEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const executeFetch = useCallback(async () => {
    if (!requestId) {
      setEvent(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    try {
      const data = await getEventById(requestId, controller.signal);
      if (!controller.signal.aborted) {
        if (!data) {
          setError("Event not found");
          setEvent(null);
        } else {
          setEvent(data);
          setError(null);
        }
      }
    } catch (err: any) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : String(err));
        setEvent(null);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [requestId]);

  useEffect(() => {
    executeFetch();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [executeFetch]);

  return { event, isLoading, error, refetch: executeFetch };
}
