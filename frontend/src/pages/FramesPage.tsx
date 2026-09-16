import React, { useState } from 'react';
import type { EventFilters } from '@/types';
import { useEventHistory } from '@/hooks';
import { SectionHeader } from '@/components/ui';
import FramesFilterBar from '@/features/frames/FramesFilterBar';
import FramesGallery from '@/features/frames/FramesGallery';
import FrameDetailsModal from '@/features/frames/FrameDetailsModal';
import './pages.css';

export default function FramesPage() {
  const [filters, setFilters] = useState<EventFilters>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
    tier: null,
    action: null,
  });
  
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  
  const { data, isLoading } = useEventHistory(filters);
  const events = data?.events ?? [];

  const handleReset = () => {
    setFilters({
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date(),
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
        
        <FramesGallery 
          events={events}
          isLoading={isLoading}
          onSelect={(e) => setSelectedRequestId(e.request_id)}
          onReset={handleReset}
        />
        
        <FrameDetailsModal 
          isOpen={selectedRequestId !== null}
          onClose={() => setSelectedRequestId(null)}
          requestId={selectedRequestId}
        />
      </div>
    </div>
  );
}
