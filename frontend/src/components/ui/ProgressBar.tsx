import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  value: number;
  color?: string;
  animated?: boolean;
  height?: number;
  className?: string;
}

export default function ProgressBar({
  value,
  color = 'var(--color-primary)',
  animated = false,
  height = 8,
  className = ''
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 1);
  const percentage = Math.round(clampedValue * 100);

  return (
    <div 
      className={`progress-bar-track ${className}`} 
      style={{ height }}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div 
        className={`progress-bar-fill ${animated ? 'animated' : ''}`}
        style={{ width: `${clampedValue * 100}%`, backgroundColor: color }}
      />
    </div>
  );
}
