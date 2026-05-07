import { describe, it, expect } from 'vitest';
import { BUILDINGS } from '../../src/island/buildings.js';

describe('BUILDINGS', () => {
  it('has exactly 6 buildings', () => {
    expect(BUILDINGS).toHaveLength(6);
  });

  it('each building has required fields', () => {
    for (const b of BUILDINGS) {
      expect(b.id).toBeTruthy();
      expect(b.label).toBeTruthy();
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(b.route).toBe('/app');
      expect(b.sprite.category).toBeTruthy();
      expect(b.sprite.name).toBeTruthy();
    }
  });

  it('all building ids are unique', () => {
    const ids = BUILDINGS.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
