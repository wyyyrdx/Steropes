import React from 'react';
import { Camera } from 'lucide-react';
import { StatusBadge } from '@/components/ui';
import './LiveStreamWidget.css';

export default function LiveStreamWidget() {
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
