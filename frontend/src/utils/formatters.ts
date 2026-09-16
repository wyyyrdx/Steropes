import { TIER_CONFIG } from '@/constants';
import type { TierNumber } from '@/types';

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  const hours = d.getUTCHours().toString().padStart(2, '0');
  const minutes = d.getUTCMinutes().toString().padStart(2, '0');
  return `${month} ${day}, ${year} · ${hours}:${minutes} UTC`;
}

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 30) {
    return 'just now';
  } else if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatConfidence(value: number): string {
  return value.toFixed(2);
}

export function formatTier(tier: TierNumber): string {
  return `Tier ${tier}`;
}

export function formatTierFull(tier: TierNumber): string {
  return TIER_CONFIG[tier]?.label ?? `Tier ${tier}`;
}

export function formatDuration(ms: number): string {
  if (ms < 30_000) return 'just now';
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s ago`;
  const m = Math.floor(ms / 60_000);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(ms / 3600_000)}h ago`;
}

export function formatCostUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
