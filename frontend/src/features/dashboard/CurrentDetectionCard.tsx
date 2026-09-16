import React from 'react';
import type { LiveFrameData } from '@/types';
import { formatRelativeTime } from '@/utils';
import { SectionHeader } from '@/components/ui';
import './CurrentDetectionCard.css';

interface CurrentDetectionCardProps {
  frame: LiveFrameData | null;
}

export default function CurrentDetectionCard({ frame }: CurrentDetectionCardProps) {
  return (
    <div className="current-detection-card">
      <SectionHeader title="Current Detection" className="detection-header" />
      <div className="detection-content">
        {!frame ? (
          <p className="detection-empty">No detection in current frame</p>
        ) : (
          <div className="detection-data">
            <h3 className="detection-target">{frame.targetClass} Detected</h3>
            <p className="detection-meta">
              Frame #{frame.frameId} • {formatRelativeTime(frame.timestamp, new Date())}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
