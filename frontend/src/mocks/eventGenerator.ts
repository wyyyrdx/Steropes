import type { DecisionEvent } from '@/types';
import { DEMO_MODE } from '@/constants/mock';

export function createEventStream(seedEvents: DecisionEvent[] = []) {
  let intervalId: ReturnType<typeof setInterval> | null = null;
  const subscribers = new Set<(event: DecisionEvent) => void>();
  
  let buffer: DecisionEvent[] = [...seedEvents].slice(0, DEMO_MODE.maxLiveEvents);

  const tick = () => {
    const timestamp = new Date().toISOString();
    const request_id = crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const dateStr = timestamp.split('T')[0];
    
    const r = Math.random();
    let tier_resolved: 1 | 2 | 3 = 1;
    let action_taken: 'ACCEPT' | 'REPOSITION' | 'ESCALATE' = 'ACCEPT';
    
    if (r < 0.6) {
      tier_resolved = 1;
      action_taken = 'ACCEPT';
    } else if (r < 0.9) {
      tier_resolved = 2;
      action_taken = 'REPOSITION';
    } else {
      tier_resolved = 3;
      action_taken = 'ESCALATE';
    }

    const cloud_cost_avoided = (tier_resolved !== 3);
    
    let detection_confidence = 0;
    let tracking_consistency = 0;
    let optical_flow = 0;
    let _ui_movement: DecisionEvent['_ui_movement'] = undefined;

    if (tier_resolved === 1) {
      detection_confidence = 0.75 + Math.random() * 0.20;
      tracking_consistency = 0.70 + Math.random() * 0.20;
      optical_flow = 0.05 + Math.random() * 0.35;
    } else if (tier_resolved === 2) {
      detection_confidence = 0.35 + Math.random() * 0.20;
      tracking_consistency = 0.40 + Math.random() * 0.25;
      optical_flow = 0.20 + Math.random() * 0.40;
      const pan = Math.floor(5 + Math.random() * 25) * (Math.random() > 0.5 ? 1 : -1);
      const tilt = Math.floor(5 + Math.random() * 15) * (Math.random() > 0.5 ? 1 : -1);
      _ui_movement = { pan_delta: pan, tilt_delta: tilt, actual_pan: pan, actual_tilt: tilt, status: 'COMPLETED' };
    } else {
      detection_confidence = 0.15 + Math.random() * 0.20;
      tracking_consistency = 0.20 + Math.random() * 0.25;
      optical_flow = 0.30 + Math.random() * 0.40;
      const pan = Math.floor(5 + Math.random() * 25) * (Math.random() > 0.5 ? 1 : -1);
      const tilt = Math.floor(5 + Math.random() * 15) * (Math.random() > 0.5 ? 1 : -1);
      _ui_movement = { pan_delta: pan, tilt_delta: tilt, actual_pan: pan, actual_tilt: tilt, status: 'COMPLETED' };
    }

    const newEvent: DecisionEvent = {
      PK: `EVENT#${dateStr}`,
      SK: `${timestamp}#${request_id.slice(0,8)}`,
      request_id,
      timestamp,
      tier_resolved,
      action_taken,
      cloud_cost_avoided,
      confidence_breakdown: {
        detection_confidence,
        tracking_consistency,
        optical_flow
      },
      _ui_imageUrl: undefined,
      _ui_movement
    };

    buffer = [newEvent, ...buffer].slice(0, DEMO_MODE.maxLiveEvents);
    
    subscribers.forEach(cb => cb(newEvent));
  };

  return {
    subscribe: (cb: (event: DecisionEvent) => void) => {
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    },
    getRecent: (limit: number) => {
      return buffer.slice(0, limit);
    },
    start: () => {
      if (!intervalId && DEMO_MODE.enabled) {
        intervalId = setInterval(tick, DEMO_MODE.eventsTickMs);
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
