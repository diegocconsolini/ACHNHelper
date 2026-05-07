import { describe, it, expect } from 'vitest';
import { skyPalette } from '../../src/island/timeOfDay.js';

describe('skyPalette', () => {
  it('returns day palette at 12:00', () => {
    const p = skyPalette(12);
    expect(p.name).toBe('day');
    expect(p.top).toMatch(/^#[0-9a-f]{6}$/i);
    expect(p.bottom).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('returns dawn palette at 6:00', () => {
    expect(skyPalette(6).name).toBe('dawn');
  });

  it('returns sunset palette at 18:00', () => {
    expect(skyPalette(18).name).toBe('sunset');
  });

  it('returns night palette at 23:00', () => {
    expect(skyPalette(23).name).toBe('night');
  });

  it('returns night palette at 2:00', () => {
    expect(skyPalette(2).name).toBe('night');
  });

  it('clamps invalid hours', () => {
    expect(skyPalette(-1).name).toBe('night');
    expect(skyPalette(99).name).toBe('night');
  });
});
