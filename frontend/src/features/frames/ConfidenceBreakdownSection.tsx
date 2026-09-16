import React from 'react';
import type { ConfidenceBreakdown } from '@/types';
import { ConfidenceGauge } from '@/components/ui';
import './ConfidenceBreakdownSection.css';

interface ConfidenceBreakdownSectionProps {
  breakdown?: ConfidenceBreakdown;
}

export default function ConfidenceBreakdownSection({ breakdown }: ConfidenceBreakdownSectionProps) {
  if (!breakdown) {
    return (
      <div className="confidence-empty">
        Confidence data not available for this event.
      </div>
    );
  }

  return (
    <div className="confidence-breakdown-section">
      <h3 className="section-title">Confidence Breakdown</h3>
      <ConfidenceGauge breakdown={breakdown} />
    </div>
  );
}
