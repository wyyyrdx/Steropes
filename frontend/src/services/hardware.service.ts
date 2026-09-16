import { mockHardwareStatus } from '@/mocks';
import type { HardwareStatus } from '@/types';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getHardwareStatus(
  signal?: AbortSignal
): Promise<HardwareStatus> {
  // USE_MOCK.hardware is hardcoded true in constants, always return mock for now
  await delay(200);
  return mockHardwareStatus;
}
