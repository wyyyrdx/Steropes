import React from 'react';
import type { HardwareStatusValue } from '@/types';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: HardwareStatusValue;
  size?: 'sm' | 'md';
  className?: string;
}

const statusMap: Record<HardwareStatusValue, { color: string, label: string }> = {
  online: { color: 'var(--color-success)', label: 'Online' },
  offline: { color: 'var(--color-error)', label: 'Offline' },
  standby: { color: 'var(--color-info)', label: 'Standby' },
  running: { color: 'var(--color-success)', label: 'Running' },
  warning: { color: 'var(--color-warning)', label: 'Warning' },
  unknown: { color: 'var(--color-neutral)', label: 'Unknown' },
};

export default function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const config = statusMap[status] || statusMap.unknown;

  return (
    <span className={`status-badge status-badge-${size} ${className}`}>
      <span className="status-badge-dot" style={{ backgroundColor: config.color }} />
      <span className="status-badge-label" style={{ color: config.color }}>{config.label}</span>
    </span>
  );
}
