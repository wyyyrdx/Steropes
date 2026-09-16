import React from 'react';
import { TIER_CONFIG } from '@/constants';
import type { TierNumber } from '@/types';
import './TierBadge.css';

interface TierBadgeProps {
  tier: TierNumber;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

export default function TierBadge({
  tier,
  size = 'md',
  showIcon = true,
  showLabel = true,
  className = ''
}: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  if (!config) return null;

  const Icon = config.icon;
  const label = showLabel ? config.label : config.shortLabel;

  return (
    <div 
      className={`tier-badge tier-badge-${size} tier-badge-tier-${tier} ${className}`}
      style={{
        backgroundColor: `var(${config.bgVar})`,
        color: `var(${config.colorVar})`,
        borderColor: `var(${config.colorVar})`
      }}
    >
      {showIcon && <Icon className="tier-badge-icon" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
      <span className="tier-badge-label">{label}</span>
    </div>
  );
}
