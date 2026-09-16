import React from 'react';
import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'card' | 'circle' | 'timeline-row' | 'frame-card';
  count?: number;
  animated?: boolean;
  className?: string;
}

export default function LoadingSkeleton({
  width = '100%',
  height = 16,
  variant = 'text',
  count = 1,
  animated = true,
  className = '',
}: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);
  
  const baseStyle = { width, height };

  const renderVariant = (idx: number) => {
    switch (variant) {
      case 'timeline-row':
        return (
          <div key={idx} className={`skeleton-timeline-row ${animated ? 'animated' : ''} ${className}`}>
            <div className="skeleton-circle" style={{ width: 16, height: 16 }} />
            <div className="skeleton-col">
              <div className="skeleton-text" style={{ width: '80%', height: 16 }} />
              <div className="skeleton-text" style={{ width: '60%', height: 12 }} />
            </div>
          </div>
        );
      case 'frame-card':
        return (
          <div key={idx} className={`skeleton-frame-card ${animated ? 'animated' : ''} ${className}`}>
            <div className="skeleton-image-block" />
            <div className="skeleton-text" style={{ width: '70%', height: 16, marginTop: 'var(--space-2)' }} />
            <div className="skeleton-text" style={{ width: '40%', height: 12, marginTop: 'var(--space-1)' }} />
          </div>
        );
      case 'card':
        return <div key={idx} className={`skeleton-card ${animated ? 'animated' : ''} ${className}`} style={{ width, minHeight: typeof height === 'number' && height < 120 ? 120 : height }} />;
      case 'circle':
        return <div key={idx} className={`skeleton-circle ${animated ? 'animated' : ''} ${className}`} style={{ width, height: width }} />;
      case 'text':
      default:
        return <div key={idx} className={`skeleton-text ${animated ? 'animated' : ''} ${className}`} style={baseStyle} />;
    }
  };

  if (count === 1) return renderVariant(0);

  return (
    <div className="skeleton-stack">
      {skeletons.map((idx) => renderVariant(idx))}
    </div>
  );
}
