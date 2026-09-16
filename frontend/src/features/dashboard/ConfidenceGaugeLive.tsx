import React from 'react';
import type { ConfidenceBreakdown } from '@/types';
import { ConfidenceGauge } from '@/components/ui';
import './ConfidenceGaugeLive.css';

interface ConfidenceGaugeLiveProps {
  confidence: ConfidenceBreakdown | null;
}

export default function ConfidenceGaugeLive({ confidence }: ConfidenceGaugeLiveProps) {
  if (!confidence) {
    return (
      <div className="confidence-live-empty">
        Waiting for detection confidence data...
      </div>
    );
  }

  return (
    <div className="confidence-live-wrapper">
      <ConfidenceGauge breakdown={confidence} />
    </div>
  );
}
