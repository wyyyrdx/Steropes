import type { LiveMonitoringState } from '@/types';

export const mockLiveState: LiveMonitoringState = {
  isConnected: true,
  currentFrame: {
    frameId: "frame-20260916-001",
    timestamp: "2026-09-16T10:30:05Z",
    targetClass: "Bird",
    bbox: null,
  },
  currentConfidence: {
    detection_confidence: 0.87,
    tracking_consistency: 0.79,
    optical_flow: 0.15,
  },
  currentTier: 1,
  currentAction: "ACCEPT",
  streamUrl: null,
};
