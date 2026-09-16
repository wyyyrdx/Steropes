import type { AdaptiveThreshold } from '@/types';

export const mockAdaptiveThreshold: AdaptiveThreshold = {
  currentThreshold: 0.65,
  history: [
    { timestamp: "2026-09-10T00:00:00Z", value: 0.70 },
    { timestamp: "2026-09-11T00:00:00Z", value: 0.70 },
    { timestamp: "2026-09-12T00:00:00Z", value: 0.68 },
    { timestamp: "2026-09-13T00:00:00Z", value: 0.66 },
    { timestamp: "2026-09-14T00:00:00Z", value: 0.65 },
    { timestamp: "2026-09-15T00:00:00Z", value: 0.65 },
    { timestamp: "2026-09-16T00:00:00Z", value: 0.65 },
  ],
  escalationPerformance: [
    { range: "0.3–0.4", escalations: 8 },
    { range: "0.4–0.5", escalations: 12 },
    { range: "0.5–0.6", escalations: 4 },
    { range: "0.6–0.7", escalations: 1 },
    { range: "0.7–1.0", escalations: 0 },
  ],
};
