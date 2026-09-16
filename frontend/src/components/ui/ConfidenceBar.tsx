import React from 'react';
import { ProgressBar } from '@/components/ui';
import './ConfidenceBar.css';

interface ConfidenceBarProps {
  label: string;
  value: number;
  showValue?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function ConfidenceBar({ label, value, showValue = true, size = 'md', className = '' }: ConfidenceBarProps) {
  let color = 'var(--color-tier-3)';
  if (value >= 0.7) {
    color = 'var(--color-tier-1)';
  } else if (value >= 0.4) {
    color = 'var(--color-tier-2)';
  }

  return (
    <div role="group" aria-label={label} className={`confidence-bar-wrapper confidence-bar-${size} ${className}`}>
      <div className="confidence-bar-header">
        <span className="confidence-bar-label">{label}</span>
        {showValue && <span className="confidence-bar-value">{value.toFixed(2)}</span>}
      </div>
      <ProgressBar 
        value={value} 
        color={color} 
        height={size === 'sm' ? 4 : 8} 
        animated 
      />
    </div>
  );
}
