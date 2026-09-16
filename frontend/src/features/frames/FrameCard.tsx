import React from 'react';
import { CloudOff } from 'lucide-react';
import type { DecisionEvent } from '@/types';
import { TierBadge, ActionBadge } from '@/components/ui';
import { formatTimestamp } from '@/utils';
import FrameImagePlaceholder from './FrameImagePlaceholder';
import './FrameCard.css';

interface FrameCardProps {
  event: DecisionEvent;
  onClick: () => void;
}

export default function FrameCard({ event, onClick }: FrameCardProps) {
  const { 
    tier_resolved, 
    action_taken, 
    confidence_breakdown, 
    timestamp, 
    cloud_cost_avoided 
  } = event;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const confidenceText = confidence_breakdown
    ? `Det ${confidence_breakdown.detection_confidence.toFixed(2)} · Track ${confidence_breakdown.tracking_consistency.toFixed(2)} · Motion ${confidence_breakdown.optical_flow.toFixed(2)}`
    : null;

  return (
    <button 
      className="frame-card" 
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`Frame event at ${formatTimestamp(timestamp)}, Tier ${tier_resolved}, ${action_taken}`}
    >
      <div className="frame-card-media">
        <FrameImagePlaceholder />
      </div>
      
      <div className="frame-card-content">
        <div className="frame-card-row">
          <TierBadge tier={tier_resolved} size="sm" />
          <ActionBadge action={action_taken} size="sm" />
        </div>
        
        {confidenceText && (
          <div className="frame-card-row frame-card-mono">
            {confidenceText}
          </div>
        )}
        
        <div className="frame-card-row frame-card-time">
          {formatTimestamp(timestamp)}
        </div>
        
        {cloud_cost_avoided && (
          <div className="frame-card-row frame-card-cloud">
            <CloudOff size={14} />
            <span>Cloud call avoided</span>
          </div>
        )}
      </div>
    </button>
  );
}
