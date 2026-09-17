import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLatestEvents, getEvents, getEventById } from '../events.service';
import { USE_MOCK } from '@/constants';
import { mockEvents } from '@/mocks';

describe('events.service', () => {
  beforeEach(() => {
    USE_MOCK.events = true;
  });

  it('getLatestEvents returns limited mock events', async () => {
    const res = await getLatestEvents(5);
    expect(res.events).toHaveLength(5);
    expect(res.count).toBe(5);
  });

  it('getEvents filters by tier correctly', async () => {
    const res = await getEvents({ tier: 2 });
    expect(res.events.every(e => e.tier_resolved === 2)).toBe(true);
  });

  it('getEvents filters by action correctly', async () => {
    const res = await getEvents({ action: 'ESCALATE' });
    expect(res.events.every(e => e.action_taken === 'ESCALATE')).toBe(true);
  });

  it('getEventById returns correct event or null', async () => {
    const validId = mockEvents[0].request_id;
    const res1 = await getEventById(validId);
    expect(res1).not.toBeNull();
    expect(res1?.request_id).toBe(validId);

    const res2 = await getEventById('unknown_id');
    expect(res2).toBeNull();
  });
});
