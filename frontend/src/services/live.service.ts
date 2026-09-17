import { mockLiveState, liveStream } from '@/mocks';
import { DEMO_MODE } from '@/constants';
import type { LiveMonitoringState } from '@/types';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let streamStarted = false;
function ensureStream() {
  if (DEMO_MODE.enabled && !streamStarted) {
    liveStream.start();
    streamStarted = true;
  }
}

export async function getLiveState(
  signal?: AbortSignal
): Promise<LiveMonitoringState> {
  await delay(150);
  if (DEMO_MODE.enabled) {
    ensureStream();
    return liveStream.getCurrent() || mockLiveState;
  }
  return mockLiveState;
}
