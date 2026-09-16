import { useCallback } from 'react';
import { usePolling } from './usePolling';
import { getLatestEvents } from '@/services';
import { POLLING_INTERVALS } from '@/constants';
import type { DecisionEvent } from '@/types';

export function useEvents(limit = 20): {
  events: DecisionEvent[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => void;
} {
  const fetcher = useCallback(
    (signal: AbortSignal) => getLatestEvents(limit, signal),
    [limit]
  );

  const { data, isLoading, error, lastUpdated, refetch } = usePolling(
    fetcher,
    POLLING_INTERVALS.timeline
  );

  return {
    events: data?.events ?? [],
    isLoading,
    error,
    lastUpdated,
    refetch
  };
}
