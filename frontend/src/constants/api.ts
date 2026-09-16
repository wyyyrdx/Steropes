export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'https://32v3gb46j5.execute-api.eu-north-1.amazonaws.com/prod';

export const POLLING_INTERVALS = {
  timeline: 10_000,      // /events/latest — Section 15
  stats: 30_000,         // /stats on dashboard — Section 15
  liveMock: 3_000,       // mock live monitoring — Section 15
  hardwareMock: 15_000,  // mock hardware status — Section 15
} as const;

export const API_TIMEOUT_MS = 10_000;  // Section 13 — timeout >10s = failure
