import React from 'react';
import { ACTION_CONFIG } from '@/constants';
import type { ActionTaken } from '@/types';
import './ActionBadge.css';

interface ActionBadgeProps {
  action: ActionTaken;
  size?: 'sm' | 'md';
  className?: string;
}

export default function ActionBadge({ action, size = 'md', className = '' }: ActionBadgeProps) {
  const config = ACTION_CONFIG[action];
  if (!config) return null;

  return (
    <span
      className={`action-badge action-badge-${size} ${className}`}
      style={{
        color: `var(${config.colorVar})`,
        borderColor: `var(${config.colorVar})`
      }}
    >
      {config.label}
    </span>
  );
}
