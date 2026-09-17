import type { LiveMonitoringState } from '@/types';
import { DEMO_MODE } from '@/constants/mock';

const CLASSES = ['Bird', 'Fox', 'Deer', 'Person', 'Vehicle', 'Unknown'];

export function createLiveStream() {
  let intervalId: ReturnType<typeof setInterval> | null = null;
  const subscribers = new Set<(state: LiveMonitoringState) => void>();
  let latestState: LiveMonitoringState | null = null;

  const tick = () => {
    const timestamp = new Date().toISOString();
    const frameId = `frame-${Date.now()}`;
    const detectedClass = CLASSES[Math.floor(Math.random() * CLASSES.length)];
    
    // Roughly 1 in 6 is a low-confidence (Tier 2/3) frame
    const isLowConf = Math.random() < (1 / 6);
    
    let detection_confidence, tracking_consistency, optical_flow;
    let avg = 0;
    
    if (isLowConf) {
      detection_confidence = 0.3 + (Math.random() * 0.4); // 0.3 - 0.7
      tracking_consistency = 0.3 + (Math.random() * 0.4);
      optical_flow = 0.3 + (Math.random() * 0.4);
    } else {
      detection_confidence = 0.75 + (Math.random() * 0.2); // 0.75 - 0.95
      tracking_consistency = 0.70 + (Math.random() * 0.2);
      optical_flow = 0.05 + (Math.random() * 0.3);
    }

    avg = (detection_confidence + tracking_consistency + optical_flow) / 3;

    let tier_resolved: 1 | 2 | 3 = 1;
    let action_taken: 'ACCEPT' | 'REPOSITION' | 'ESCALATE' = 'ACCEPT';
    
    if (avg >= 0.75) {
      tier_resolved = 1;
      action_taken = 'ACCEPT';
    } else if (avg >= 0.50) {
      tier_resolved = 2;
      action_taken = 'REPOSITION';
    } else {
      tier_resolved = 3;
      action_taken = 'ESCALATE';
    }

    const state: LiveMonitoringState = {
      isConnected: true,
      currentFrame: {
        frameId: frameId,
        timestamp,
        targetClass: detectedClass,
        bbox: null
      },
      currentConfidence: {
        detection_confidence,
        tracking_consistency,
        optical_flow
      },
      currentTier: tier_resolved,
      currentAction: action_taken,
      streamUrl: null
    };

    latestState = state;
    subscribers.forEach(cb => cb(state));
  };

  return {
    subscribe: (cb: (state: LiveMonitoringState) => void) => {
      if (latestState) cb(latestState);
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    },
    getCurrent: () => latestState,
    start: () => {
      if (!intervalId && DEMO_MODE.enabled) {
        intervalId = setInterval(tick, DEMO_MODE.liveTickMs);
      }
    },
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  };
}
