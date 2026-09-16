import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatRelativeTime } from '@/utils';
import './StaleDataBanner.css';

interface StaleDataBannerProps {
  lastUpdated: Date | null;
  thresholdSeconds?: number;
  onRefresh?: () => void;
  className?: string;
}

export default function StaleDataBanner({
  lastUpdated,
  thresholdSeconds = 30,
  onRefresh,
  className = ''
}: StaleDataBannerProps) {
  const isStale = lastUpdated === null || ((Date.now() - lastUpdated.getTime()) / 1000) > thresholdSeconds;

  if (!isStale) {
    return null;
  }

  const timeStr = lastUpdated ? formatRelativeTime(lastUpdated.toISOString(), new Date()) : 'never';

  return (
    <div className={`stale-banner ${className}`} role="status" aria-live="polite">
      <div className="stale-banner-content">
        <AlertTriangle className="stale-banner-icon" size={18} />
        <span className="stale-banner-text">
          Data may be outdated — last updated {timeStr}
        </span>
      </div>
      {onRefresh && (
        <Button variant="ghost" size="sm" onClick={onRefresh} icon={RefreshCw}>
          Refresh
        </Button>
      )}
    </div>
  );
}
