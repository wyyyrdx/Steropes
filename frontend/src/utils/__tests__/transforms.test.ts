import { describe, it, expect } from 'vitest';
import { 
  parseTierBreakdown, 
  computeTierPercentages, 
  computeLocalResolutionRate, 
  computeEstimatedSavings,
  deriveBackendStatus 
} from '../transforms';

describe('transforms', () => {
  it('parseTierBreakdown parses valid strings and falls back defensively', () => {
    expect(parseTierBreakdown({ "1": 85, "2": 41, "3": 16 })).toEqual({ tier1: 85, tier2: 41, tier3: 16 });
    expect(parseTierBreakdown({ "1": 85 })).toEqual({ tier1: 85, tier2: 0, tier3: 0 });
    expect(parseTierBreakdown()).toEqual({ tier1: 0, tier2: 0, tier3: 0 });
  });

  it('computeTierPercentages works against mockStats values', () => {
    const percentages = computeTierPercentages({ "1": 85, "2": 41, "3": 16 });
    expect(percentages.tier1).toBeCloseTo((85/142)*100);
    expect(percentages.tier2).toBeCloseTo((41/142)*100);
    expect(percentages.tier3).toBeCloseTo((16/142)*100);
  });

  it('computeLocalResolutionRate computes correctly', () => {
    const rate = computeLocalResolutionRate({ "1": 85, "2": 41, "3": 16 });
    expect(rate).toBeCloseTo(88.7, 1);
  });

  it('computeEstimatedSavings computes correctly', () => {
    expect(computeEstimatedSavings(126)).toBeCloseTo(0.252);
  });

  it('deriveBackendStatus computes correctly', () => {
    expect(deriveBackendStatus(null, null)).toBe('unknown');
    expect(deriveBackendStatus(new Date(), null)).toBe('online');
    
    const now = new Date();
    const past = new Date(now.getTime() - 10000);
    
    expect(deriveBackendStatus(past, now)).toBe('warning');
    expect(deriveBackendStatus(now, past)).toBe('online');
  });
});
