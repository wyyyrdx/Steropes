import React, { useState } from 'react';
import type { EventFilters } from '@/types';
import { useEventHistory } from '@/hooks';
import { SectionHeader, ErrorState } from '@/components/ui';
import FramesFilterBar from '@/features/frames/FramesFilterBar';
import FramesGallery from '@/features/frames/FramesGallery';
import FrameDetailsModal from '@/features/frames/FrameDetailsModal';
import './pages.css';

export default function FramesPage() {
  const today = new Date().toISOString().split('T')[0];
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [filters, setFilters] = useState<EventFilters>({
    from: lastWeek,
    to: today,
    tier: null,
    action: null,
  });
  
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  
  const { events, isLoading, error, refetch } = useEventHistory(filters);

  const handleReset = () => {
    setFilters({
      from: lastWeek,
      to: today,
      tier: null,
      action: null,
    });
  };

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Frames History</h1>
        <p className="page-description">
          All recorded decision events
        </p>
      </div>
      
      <div className="page-content">
        <FramesFilterBar 
          filters={filters}
          onChange={setFilters}
          onReset={handleReset}
          resultCount={events.length}
        />

        {/* Error with no events → full ErrorState with retry */}
        {error && events.length === 0 && !isLoading && (
          <ErrorState
            message={error}
            onRetry={refetch}
          />
        )}

        {/* Error but stale events still available → amber warning banner */}
        {error && events.length > 0 && (
          <ErrorState
            message={`Data may be stale — ${error}`}
            severity="warning"
            onRetry={refetch}
          />
        )}

        {/* Only render gallery when there's no blocking error */}
        {!(error && events.length === 0 && !isLoading) && (
          <FramesGallery 
            events={events}
            isLoading={isLoading}
            onSelect={(e) => setSelectedRequestId(e.request_id)}
            onReset={handleReset}
          />
        )}
        
        <FrameDetailsModal 
          isOpen={selectedRequestId !== null}
          onClose={() => setSelectedRequestId(null)}
          requestId={selectedRequestId}
        />
      </div>
    </div>
  );
}
