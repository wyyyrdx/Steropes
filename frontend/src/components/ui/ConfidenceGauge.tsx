import React from 'react';
import type { ConfidenceBreakdown } from '@/types';
import ConfidenceBar from './ConfidenceBar';
import './ConfidenceGauge.css';

interface ConfidenceGaugeProps {
  breakdown: ConfidenceBreakdown;
  className?: string;
}

export default function ConfidenceGauge({ breakdown, className = '' }: ConfidenceGaugeProps) {
  return (
    <div className={`confidence-gauge ${className}`}>
      <ConfidenceBar label="Detection Confidence" value={breakdown.detection_confidence} />
      <ConfidenceBar label="Tracking Consistency" value={breakdown.tracking_consistency} />
      <ConfidenceBar label="Motion Intensity" value={breakdown.optical_flow} />
    </div>
  );
}
