import React from 'react';
import { Camera } from 'lucide-react';
import { StatusBadge } from '@/components/ui';
import { useLiveMonitoring } from '@/hooks';
import { DEMO_MODE } from '@/constants';
import { generateFrameSvg } from '@/utils';
import './LiveStreamWidget.css';

export default function LiveStreamWidget() {
  const { state } = useLiveMonitoring();
  const currentFrame = state?.currentFrame;

  if (DEMO_MODE.enabled && currentFrame?.timestamp) {
    return (
      <div className="live-stream-widget" aria-label="Live camera feed preview">
        <img 
          src={generateFrameSvg(currentFrame.frameId, currentFrame.targetClass || "Unknown")} 
          alt="Live camera feed"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className="live-stream-status-pill">
          <StatusBadge status="online" />
          <span className="live-stream-status-label">CAM-01 — LIVE</span>
        </div>
        <div className="live-stream-scanline"></div>
      </div>
    );
  }

  return (
    <div className="live-stream-widget" aria-label="Live camera feed preview">
      <div className="live-stream-status-pill">
        <StatusBadge status="standby" />
        <span className="live-stream-status-label">CAM-01 — CONNECTING</span>
      </div>
      <div className="live-stream-overlay">
        <Camera className="live-stream-icon" size={48} />
        <span className="live-stream-text">Live Feed — Hardware Integration Pending</span>
      </div>
      <div className="live-stream-scanline"></div>
    </div>
  );
}
