import React, { useState } from 'react';
import { useLiveMonitoring } from '@/hooks';
import { SectionHeader } from '@/components/ui';
import LiveStreamWidget from '@/features/dashboard/LiveStreamWidget';
import CurrentDetectionCard from '@/features/dashboard/CurrentDetectionCard';
import ConfidenceGaugeLive from '@/features/dashboard/ConfidenceGaugeLive';
import CascadeStatusFlow from '@/features/dashboard/CascadeStatusFlow';
import CostSavingsGrid from '@/features/dashboard/CostSavingsGrid';
import HardwareStatusGrid from '@/features/dashboard/HardwareStatusGrid';
import DecisionsTimeline from '@/features/dashboard/DecisionsTimeline';
import FrameDetailsModal from '@/features/frames/FrameDetailsModal';
import './pages.css';
import './DashboardPage.css';

export default function DashboardPage() {
  const { state: liveState } = useLiveMonitoring();
  const currentFrame = liveState?.currentFrame ?? null;
  const currentTier = liveState?.currentTier ?? null;
  const currentAction = liveState?.currentAction ?? null;
  const confidence = liveState?.currentConfidence ?? null;

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Live operational view of the cascade system
        </p>
      </div>
      <div className="page-content dashboard-content">
        
        <div className="dashboard-grid">
          {/* Left Column: Live Monitoring */}
          <section className="dashboard-col-left" aria-label="Live Monitoring">
            <SectionHeader title="Live Monitoring" />
            
            <div className="dashboard-live-stack">
              <LiveStreamWidget />
              
              <div className="dashboard-live-details">
                <CurrentDetectionCard frame={currentFrame} />
                <ConfidenceGaugeLive confidence={confidence} />
              </div>

              <CascadeStatusFlow 
                currentTier={currentTier}
                currentAction={currentAction}
                timestamp={currentFrame?.timestamp}
              />
            </div>
          </section>

          {/* Right Column: Cost Savings & more */}
          <section className="dashboard-col-right" aria-label="Dashboard Metrics and Hardware">
            <div className="dashboard-right-stack">
              <div>
                <SectionHeader title="Cost Savings" />
                <CostSavingsGrid />
              </div>
              
              <div>
                <SectionHeader title="Hardware Status" />
                <HardwareStatusGrid />
              </div>

              <div>
                <SectionHeader title="Recent Decisions" />
                <DecisionsTimeline onSelect={(e) => setSelectedRequestId(e.request_id)} />
              </div>
            </div>
          </section>
        </div>

        <FrameDetailsModal 
          isOpen={selectedRequestId !== null}
          onClose={() => setSelectedRequestId(null)}
          requestId={selectedRequestId}
        />
      </div>
    </div>
  );
}
