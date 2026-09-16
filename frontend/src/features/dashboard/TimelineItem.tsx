import React from 'react';
import { CloudOff, CloudLightning } from 'lucide-react';
import type { DecisionEvent } from '@/types';
import { TierBadge, ActionBadge } from '@/components/ui';
import { formatRelativeTime } from '@/utils';
import './TimelineItem.css';

interface TimelineItemProps {
  event: DecisionEvent;
  onClick: () => void;
}

export default function TimelineItem({ event, onClick }: TimelineItemProps) {
  const { 
    tier_resolved, 
    action_taken, 
    timestamp, 
    confidence_breakdown, 
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
    : 'No confidence data';

  const ariaLabel = `Tier ${tier_resolved} event, resolved with ${action_taken}, ${formatRelativeTime(timestamp, new Date())}, ${cloud_cost_avoided ? 'cloud call avoided' : 'cloud called'}`;

  return (
    <div 
      className="timeline-item" 
      role="button" 
      tabIndex={0} 
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
    >
      <div className="timeline-item-badges">
        <TierBadge tier={tier_resolved} size="sm" />
        <ActionBadge action={action_taken} size="sm" />
      </div>
      
      <div className="timeline-item-content">
        <div className="timeline-item-time" title={timestamp}>
          {formatRelativeTime(timestamp, new Date())}
        </div>
        <div className="timeline-item-confidence">
          {confidenceText}
        </div>
      </div>
      
      <div className="timeline-item-cloud">
        {cloud_cost_avoided ? (
          <div className="cloud-avoided" aria-label="Cloud call avoided">
            <CloudOff size={16} />
            <span>Avoided</span>
          </div>
        ) : (
          <div className="cloud-called" aria-label="Cloud called">
            <CloudLightning size={16} />
          </div>
        )}
      </div>
    </div>
  );
}
