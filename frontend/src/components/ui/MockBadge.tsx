import React from 'react';
import './MockBadge.css';

interface MockBadgeProps {
  label?: string;
  className?: string;
}

export default function MockBadge({ label = 'MOCK', className = '' }: MockBadgeProps) {
  return (
    <span className={`mock-badge ${className}`} aria-label="Mock data">
      {label}
    </span>
  );
}
