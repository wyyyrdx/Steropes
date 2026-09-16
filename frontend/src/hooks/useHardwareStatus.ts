import { useCallback } from 'react';
import { usePolling } from './usePolling';
import { getHardwareStatus } from '@/services';
import { POLLING_INTERVALS } from '@/constants';
import type { HardwareStatus } from '@/types';

export function useHardwareStatus(): {
  status: HardwareStatus | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
} {
  const fetcher = useCallback(
    (signal: AbortSignal) => getHardwareStatus(signal),
    []
  );

  const { data, isLoading, error, lastUpdated } = usePolling(
    fetcher,
    POLLING_INTERVALS.hardwareMock
  );

  return {
    status: data,
    isLoading,
    error,
    lastUpdated
  };
}
