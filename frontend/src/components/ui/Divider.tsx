import React from 'react';
import './Divider.css';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export default function Divider({ orientation = 'horizontal', className = '' }: DividerProps) {
  return (
    <div 
      className={`divider divider-${orientation} ${className}`}
      role="separator" 
      aria-orientation={orientation}
    />
  );
}
