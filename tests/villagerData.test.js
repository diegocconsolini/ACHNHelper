import { describe, it, expect } from 'vitest';
import { VILLAGERS } from '../src/artifacts/villagerData.js';

const VALID_PERSONALITIES = new Set([
  'Lazy', 'Jock', 'Cranky', 'Smug',
  'Normal', 'Peppy', 'Snooty', 'Big sister',
]);

describe('villagerData', () => {
  it('has 417 villagers (verified count)', () => {
    expect(VILLAGERS.length).toBe(417);
  });

  it('every record has the required fields', () => {
    for (const v of VILLAGERS) {
      expect(v.name).toBeTypeOf('string');
      expect(v.name.length).toBeGreaterThan(0);
      expect(v.species).toBeTypeOf('string');
      expect(v.personality).toBeTypeOf('string');
      expect(v.birthday).toMatch(/^\d{2}-\d{2}$/);
    }
  });

  it('only uses the 8 documented ACNH personalities', () => {
    const found = new Set(VILLAGERS.map((v) => v.personality));
    for (const p of found) expect(VALID_PERSONALITIES.has(p)).toBe(true);
  });

  it('villager names are unique', () => {
    const names = VILLAGERS.map((v) => v.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('birthdays are valid month-day pairs', () => {
    for (const v of VILLAGERS) {
      const [m, d] = v.birthday.split('-').map(Number);
      expect(m).toBeGreaterThanOrEqual(1);
      expect(m).toBeLessThanOrEqual(12);
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(31);
    }
  });
});
