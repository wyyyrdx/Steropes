import React from 'react';
import { RefreshCcw } from 'lucide-react';
import type { ActionTaken } from '@/types';
import { TierBadge, ActionBadge } from '@/components/ui';
import './CascadeStatusFlow.css';

interface CascadeStatusFlowProps {
  currentTier: 1 | 2 | 3 | null;
  currentAction: ActionTaken | null;
  resolved?: boolean;
  timestamp?: string | null;
}

export default function CascadeStatusFlow({
  currentTier,
  currentAction,
  resolved = true,
  timestamp
}: CascadeStatusFlowProps) {
  
  const getTierState = (tier: 1 | 2 | 3) => {
    if (currentTier === tier && !resolved) return 'ACTIVE';
    if (currentTier !== null && currentTier >= tier) return 'COMPLETED';
    return 'FUTURE';
  };

  const renderNode = (tier: 1 | 2 | 3, label: string) => {
    const state = getTierState(tier);
    const nodeKey = `${tier}-${timestamp || 'static'}`;
    
    return (
      <div 
        key={nodeKey}
        className={`cascade-node cascade-node-${state.toLowerCase()}`}
        aria-label={`Tier ${tier} — ${state.toLowerCase()}`}
      >
        <div className={`cascade-node-indicator cascade-indicator-tier-${tier}`}>
          {state === 'COMPLETED' && <span className="cascade-node-check">✓</span>}
          {tier === 2 && currentTier === 2 && (
            <div className="cascade-animation-tier2" key={nodeKey}>
              <RefreshCcw size={14} className="reposition-icon" />
              <span className="reposition-label">+20° / -5°</span>
            </div>
          )}
        </div>
        <div className="cascade-node-badge">
          <TierBadge tier={tier} />
        </div>
      </div>
    );
  };

  const renderSegment = (tier: 1 | 2) => {
    const isActive = currentTier !== null && currentTier > tier;
    return (
      <div className={`cascade-segment ${isActive ? `cascade-segment-tier-${tier}` : ''}`} />
    );
  };

  return (
    <div className="cascade-flow-container" role="status" aria-live="polite">
      <div className="cascade-flow-track">
        {renderNode(1, 'Edge')}
        {renderSegment(1)}
        {renderNode(2, 'Local')}
        {renderSegment(2)}
        {renderNode(3, 'Cloud')}
      </div>
      
      {currentAction && (
        <div className="cascade-action-container">
          <ActionBadge action={currentAction} size="md" />
        </div>
      )}
    </div>
  );
}
