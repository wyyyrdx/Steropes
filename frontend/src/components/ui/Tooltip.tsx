import React, { useState } from 'react';
import './Tooltip.css';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'bottom';
  className?: string;
}

export default function Tooltip({ content, children, side = 'top', className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);

  return (
    <div 
      className={`tooltip-wrapper ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {isVisible && (
        <div className={`tooltip-content tooltip-side-${side}`} role="tooltip">
          {content}
        </div>
      )}
    </div>
  );
}
