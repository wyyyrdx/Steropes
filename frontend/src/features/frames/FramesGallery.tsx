import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import type { DecisionEvent } from '@/types';
import { LoadingSkeleton, EmptyState, Button } from '@/components/ui';
import FrameCard from './FrameCard';
import './FramesGallery.css';

interface FramesGalleryProps {
  events: DecisionEvent[];
  isLoading: boolean;
  onSelect: (event: DecisionEvent) => void;
  onReset?: () => void;
}

export default function FramesGallery({ events, isLoading, onSelect, onReset }: FramesGalleryProps) {
  if (isLoading) {
    return (
      <div className="frames-gallery">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{ height: '240px' }}>
            <LoadingSkeleton variant="card" />
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="frames-gallery-empty">
        <EmptyState 
          icon={SlidersHorizontal}
          title="No events match your filters"
          description="Try adjusting the date range or tier selection."
          action={onReset ? <Button onClick={onReset} variant="outline">Reset Filters</Button> : undefined}
        />
      </div>
    );
  }

  return (
    <div className="frames-gallery">
      {events.map(event => (
        <FrameCard 
          key={event.request_id}
          event={event}
          onClick={() => onSelect(event)}
        />
      ))}
    </div>
  );
}
