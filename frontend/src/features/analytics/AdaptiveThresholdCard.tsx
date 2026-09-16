import React from 'react';
import type { AdaptiveThreshold } from '@/types';
import { MockBadge } from '@/components/ui';
import './AdaptiveThresholdCard.css';

interface AdaptiveThresholdCardProps {
  threshold: AdaptiveThreshold | null;
}

export default function AdaptiveThresholdCard({ threshold }: AdaptiveThresholdCardProps) {
  const currentVal = threshold?.currentThreshold?.toFixed(2) ?? '0.00';

  return (
    <div className="adaptive-threshold-card">
      <div className="adaptive-threshold-card-content">
        <div className="adaptive-threshold-value">{currentVal}</div>
        <div className="adaptive-threshold-labels">
          <div className="adaptive-threshold-title">Current Threshold</div>
          <div className="adaptive-threshold-subtitle">Events above this threshold resolve at Tier 1</div>
        </div>
      </div>
      <div className="adaptive-threshold-badge" aria-label="Mock data">
        <MockBadge />
      </div>
    </div>
  );
}
