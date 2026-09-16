import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatTimestamp, formatRelativeTime, formatPercentage, formatConfidence, formatTierFull } from '../formatters';

describe('formatters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formatTimestamp produces a stable string for a fixed ISO input', () => {
    const iso = "2026-09-16T10:30:00Z";
    expect(formatTimestamp(iso)).toBe("Sep 16, 2026 · 10:30 UTC");
  });

  it('formatRelativeTime returns "just now" for <30s', () => {
    const now = new Date("2026-09-16T10:30:15Z");
    expect(formatRelativeTime("2026-09-16T10:30:00Z", now)).toBe("just now");
  });

  it('formatRelativeTime returns "5 minutes ago" for 5 min delta', () => {
    const now = new Date("2026-09-16T10:35:00Z");
    expect(formatRelativeTime("2026-09-16T10:30:00Z", now)).toBe("5 minutes ago");
  });

  it('formatPercentage formats correctly', () => {
    expect(formatPercentage(88.7)).toBe("88.7%");
  });

  it('formatConfidence formats correctly', () => {
    expect(formatConfidence(0.87)).toBe("0.87");
  });

  it('formatTierFull formats correctly', () => {
    expect(formatTierFull(2)).toBe("Tier 2 — Repositioned");
  });
});
