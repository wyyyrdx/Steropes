import React from 'react';
import { BarChart3 } from 'lucide-react';
import { LoadingSkeleton, EmptyState } from '@/components/ui';
import './ChartCard.css';

interface ChartCardProps {
  title: string;
  subTitle?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  action?: React.ReactNode;
  height?: number;
  children: React.ReactNode;
  className?: string;
}

export default function ChartCard({
  title,
  subTitle,
  isLoading = false,
  isEmpty = false,
  emptyMessage = 'No data for this period',
  action,
  height = 300,
  children,
  className = ''
}: ChartCardProps) {
  return (
    <section aria-label={title} className={`chart-card ${className}`}>
      <div className="chart-card-header">
        <div className="chart-card-titles">
          <h4 className="chart-card-title">{title}</h4>
          {subTitle && <span className="chart-card-subtitle">{subTitle}</span>}
        </div>
        {action && <div className="chart-card-action">{action}</div>}
      </div>

      <div className="chart-card-body" style={{ height }}>
        {isLoading && (
          <LoadingSkeleton variant="card" height="100%" />
        )}
        {!isLoading && isEmpty && (
          <EmptyState icon={BarChart3} title={title} description={emptyMessage} />
        )}
        {!isLoading && !isEmpty && (
          <div className="chart-card-content">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
