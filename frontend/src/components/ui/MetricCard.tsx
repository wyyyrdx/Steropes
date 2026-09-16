import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { MockBadge, LoadingSkeleton, Tooltip } from '@/components/ui';
import './MetricCard.css';

interface MetricCardProps {
  icon?: LucideIcon;
  value: string | number;
  label: string;
  subLabel?: string;
  accent?: 'default' | 'green' | 'amber' | 'red' | 'indigo';
  isLoading?: boolean;
  isMock?: boolean;
  tooltip?: string;
  className?: string;
}

export default function MetricCard({
  icon: Icon,
  value,
  label,
  subLabel,
  accent = 'default',
  isLoading = false,
  isMock = false,
  tooltip,
  className = ''
}: MetricCardProps) {
  if (isLoading) {
    return <LoadingSkeleton variant="card" className={`metric-card-skeleton ${className}`} />;
  }

  const labelNode = tooltip ? (
    <Tooltip content={tooltip}>
      <span className="metric-card-label tooltip-trigger">{label}</span>
    </Tooltip>
  ) : (
    <span className="metric-card-label">{label}</span>
  );

  const isLongValue = String(value).length > 6;

  return (
    <article aria-label={label} className={`metric-card accent-${accent} ${className}`}>
      <div className="metric-card-header">
        {Icon ? <Icon className="metric-card-icon" size={20} /> : <div />}
        {isMock && <MockBadge />}
      </div>
      
      <div className="metric-card-content">
        <div className={`metric-card-value ${isLongValue ? 'value-long' : 'value-short'}`}>
          {value}
        </div>
        <div className="metric-card-label-row">
          {labelNode}
        </div>
        {subLabel && <div className="metric-card-sublabel">{subLabel}</div>}
      </div>
    </article>
  );
}
