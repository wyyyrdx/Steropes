import { mockLiveState } from '@/mocks';
import type { LiveMonitoringState } from '@/types';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getLiveState(
  signal?: AbortSignal
): Promise<LiveMonitoringState> {
  await delay(150);
  return mockLiveState;
}
