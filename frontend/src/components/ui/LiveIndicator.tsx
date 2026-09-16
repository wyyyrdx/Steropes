import React from 'react';
import { Tooltip } from '@/components/ui';
import { formatRelativeTime } from '@/utils';
import './LiveIndicator.css';

interface LiveIndicatorProps {
  state: 'live' | 'stale' | 'paused' | 'offline';
  lastUpdated?: Date | null;
  className?: string;
}

export default function LiveIndicator({ state, lastUpdated, className = '' }: LiveIndicatorProps) {
  const content = (
    <div className={`live-indicator indicator-${state} ${className}`} role="status" aria-live="polite">
      <span className="live-indicator-dot" />
      <span className="live-indicator-label">{state.toUpperCase()}</span>
    </div>
  );

  if (lastUpdated) {
    const timeStr = formatRelativeTime(lastUpdated.toISOString(), new Date());
    return (
      <Tooltip content={`Last updated: ${timeStr}`}>
        {content}
      </Tooltip>
    );
  }

  return content;
}
