import { useState, useEffect, useRef, useCallback } from 'react';
import { getEvents } from '@/services';
import type { DecisionEvent, EventFilters } from '@/types';

export function useEventHistory(filters: EventFilters): {
  events: DecisionEvent[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [events, setEvents] = useState<DecisionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  
  const filtersKey = JSON.stringify(filters);

  const executeFetch = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    try {
      const data = await getEvents(filters, controller.signal);
      if (!controller.signal.aborted) {
        setEvents(data.events);
        setError(null);
      }
    } catch (err: any) {
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : String(err));
        setEvents([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [filtersKey]);

  useEffect(() => {
    executeFetch();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [executeFetch]);

  return { events, isLoading, error, refetch: executeFetch };
}
