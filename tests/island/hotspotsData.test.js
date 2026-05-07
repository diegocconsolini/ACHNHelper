import { describe, it, expect } from 'vitest';
import { hotspots } from '../../src/island/hotspotsData.js';

describe('hotspots data', () => {
  it('has 5 buildings', () => {
    expect(hotspots.buildings).toHaveLength(5);
  });

  it('every hotspot has required fields with valid ranges', () => {
    for (const b of hotspots.buildings) {
      expect(b.id).toBeTruthy();
      expect(b.label).toBeTruthy();
      expect(b.xPct).toBeGreaterThanOrEqual(0);
      expect(b.xPct).toBeLessThanOrEqual(100);
      expect(b.yPct).toBeGreaterThanOrEqual(0);
      expect(b.yPct).toBeLessThanOrEqual(100);
      expect(b.wPct).toBeGreaterThan(0);
      expect(b.hPct).toBeGreaterThan(0);
      expect(b.route).toBeTruthy();
    }
  });

  it('all building ids are unique', () => {
    const ids = hotspots.buildings.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
