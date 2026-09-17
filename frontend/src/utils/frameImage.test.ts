import { describe, it, expect } from 'vitest';
import { generateFrameSvg } from './frameImage';

describe('generateFrameSvg', () => {
  it('returns a data URL containing SVG encoded string', () => {
    const seed = 'test-seed-123';
    const label = 'Person';
    
    const url = generateFrameSvg(seed, label);
    
    expect(url.startsWith('data:image/svg+xml;utf8,')).toBe(true);
    
    const decoded = decodeURIComponent(url.replace('data:image/svg+xml;utf8,', ''));
    expect(decoded).toContain('<svg');
    expect(decoded).toContain(seed);
    expect(decoded).toContain(label.toUpperCase());
  });
});
