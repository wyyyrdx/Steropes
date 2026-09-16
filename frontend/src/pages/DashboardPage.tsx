import React from 'react';
import { useLiveMonitoring } from '@/hooks';
import { SectionHeader } from '@/components/ui';
import LiveStreamWidget from '@/features/dashboard/LiveStreamWidget';
import CurrentDetectionCard from '@/features/dashboard/CurrentDetectionCard';
import ConfidenceGaugeLive from '@/features/dashboard/ConfidenceGaugeLive';
import CascadeStatusFlow from '@/features/dashboard/CascadeStatusFlow';
import CostSavingsGrid from '@/features/dashboard/CostSavingsGrid';
import './pages.css';
import './DashboardPage.css';

export default function DashboardPage() {
  const { state: liveState } = useLiveMonitoring();
  const currentFrame = liveState?.current_frame ?? null;
  const currentTier = currentFrame?.tier_resolved ?? null;
  const currentAction = currentFrame?.action_taken ?? null;
  const confidence = currentFrame?.confidence_breakdown ?? null;

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
              />
            </div>
          </section>

          {/* Right Column: Cost Savings & more */}
          <section className="dashboard-col-right" aria-label="Cost Savings">
            <SectionHeader title="Cost Savings" />
            <CostSavingsGrid />
            
            {/* Placeholder for Prompt 12: Hardware Status + Decisions Timeline will go here or below */}
          </section>
        </div>

      </div>
    </div>
  );
}
