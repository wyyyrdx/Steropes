export const USE_MOCK = {
  events:    import.meta.env.VITE_MOCK_EVENTS !== 'false',  // default: true
  stats:     import.meta.env.VITE_MOCK_STATS  !== 'false',  // default: true
  hardware:  true,   // always mock until API exists (Section 12.3)
  live:      true,   // always mock until API exists
  threshold: true,   // always mock until API exists
} as const;

export const DEMO_MODE = {
  enabled: import.meta.env.VITE_DEMO_MODE !== 'false',  // default true
  eventsTickMs:   8_000,
  statsTickMs:    5_000,
  liveTickMs:     3_000,
  maxLiveEvents:  50,
} as const;
