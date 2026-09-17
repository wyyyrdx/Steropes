import { USE_MOCK, DEMO_MODE } from '@/constants';
import { mockStats, eventStream } from '@/mocks';
import { fetchStats } from '@/api';
import type { StatsResponse } from '@/types';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let streamStarted = false;
function ensureStream() {
  if (DEMO_MODE.enabled && !streamStarted) {
    eventStream.start();
    streamStarted = true;
  }
}

export async function getStats(
  params?: { from?: string; to?: string },
  signal?: AbortSignal
): Promise<StatsResponse> {
  if (USE_MOCK.stats) {
    await delay(200);
    if (DEMO_MODE.enabled) {
      ensureStream();
      const liveEvents = eventStream.getRecent(DEMO_MODE.maxLiveEvents);
      // We can count the live events dynamically to add to mockStats base
      const liveTiers = { "1": 0, "2": 0, "3": 0 };
      let liveCostAvoided = 0;
      
      liveEvents.forEach(e => {
        liveTiers[e.tier_resolved.toString() as "1"|"2"|"3"]++;
        if (e.cloud_cost_avoided) liveCostAvoided++;
      });
      
      const total_events = mockStats.total_events + liveEvents.length;
      const cost_avoided_count = mockStats.cost_avoided_count + liveCostAvoided;
      const cost_avoided_percentage = total_events > 0 ? (cost_avoided_count / total_events) * 100 : 0;
      
      return {
        ...mockStats,
        total_events,
        tier_breakdown: {
          "1": mockStats.tier_breakdown["1"] + liveTiers["1"],
          "2": mockStats.tier_breakdown["2"] + liveTiers["2"],
          "3": mockStats.tier_breakdown["3"] + liveTiers["3"],
        },
        cost_avoided_count,
        cost_avoided_percentage
      };
    }
    return mockStats;
  }
  return fetchStats(params, signal);
}
