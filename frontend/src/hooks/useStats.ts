import { useCallback } from 'react';
import { usePolling } from './usePolling';
import { getStats } from '@/services';
import { POLLING_INTERVALS } from '@/constants';
import type { StatsResponse } from '@/types';

export function useStats(
  params?: { from?: string; to?: string },
  options?: { polling?: boolean }
): {
  stats: StatsResponse | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => void;
} {
  const isPolling = options?.polling ?? true;
  
  const fetcher = useCallback(
    (signal: AbortSignal) => getStats(params, signal),
    [params?.from, params?.to]
  );

  const { data, isLoading, error, lastUpdated, refetch } = usePolling(
    fetcher,
    POLLING_INTERVALS.stats,
    { enabled: isPolling }
  );

  return {
    stats: data,
    isLoading,
    error,
    lastUpdated,
    refetch
  };
}
