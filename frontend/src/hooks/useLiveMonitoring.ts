import { useCallback } from 'react';
import { usePolling } from './usePolling';
import { getLiveState } from '@/services';
import { POLLING_INTERVALS } from '@/constants';
import type { LiveMonitoringState } from '@/types';

export function useLiveMonitoring(): {
  state: LiveMonitoringState | null;
  isLoading: boolean;
  error: string | null;
} {
  const fetcher = useCallback(
    (signal: AbortSignal) => getLiveState(signal),
    []
  );

  const { data, isLoading, error } = usePolling(
    fetcher,
    POLLING_INTERVALS.liveMock
  );

  return {
    state: data,
    isLoading,
    error
  };
}
