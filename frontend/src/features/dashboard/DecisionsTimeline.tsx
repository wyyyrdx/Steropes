import React from 'react';
import { Radio } from 'lucide-react';
import { useEvents } from '@/hooks';
import { LoadingSkeleton, ErrorState, EmptyState, StaleDataBanner } from '@/components/ui';
import TimelineItem from './TimelineItem';
import './DecisionsTimeline.css';

interface DecisionsTimelineProps {
  onSelect?: (event: DecisionEvent) => void;
}

export default function DecisionsTimeline({ onSelect }: DecisionsTimelineProps = {}) {
  const { data, isLoading, error, lastUpdated, refetch } = useEvents(20);

  const handleItemClick = (event: DecisionEvent) => {
    if (onSelect) {
      onSelect(event);
    } else {
      console.log('Timeline item clicked:', event.request_id);
    }
  };

  const renderContent = () => {
    if (isLoading && !data) {
      return (
        <div className="timeline-loading">
          {Array.from({ length: 5 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="timeline-row" />
          ))}
        </div>
      );
    }

    if (error && !data) {
      return (
        <div className="timeline-error">
          <ErrorState title="Failed to load timeline" message={error} onRetry={refetch} />
        </div>
      );
    }

    if (data && data.events.length === 0) {
      return (
        <div className="timeline-empty">
          <EmptyState 
            icon={Radio} 
            title="No decisions today" 
            description="The system will appear here as it processes frames."
          />
        </div>
      );
    }

    if (data) {
      return (
        <ol className="timeline-list" aria-label="Recent decisions">
          {data.events.map(event => (
            <li key={event.request_id}>
              <TimelineItem 
                event={event} 
                onClick={() => handleItemClick(event)} 
              />
            </li>
          ))}
        </ol>
      );
    }

    return null;
  };

  return (
    <div className="decisions-timeline-container">
      {lastUpdated && (
        <div className="timeline-stale-banner">
          <StaleDataBanner 
            lastUpdated={lastUpdated} 
            thresholdSeconds={30} 
            onRefresh={refetch} 
          />
        </div>
      )}
      <div className="timeline-scroll-area">
        {renderContent()}
      </div>
    </div>
  );
}
