import { describe, it, expect } from 'vitest';
import { tokens } from '../../src/design/tokens.js';

describe('design tokens', () => {
  it('exports all required color groups', () => {
    expect(tokens.color).toBeDefined();
    expect(tokens.color.skyDay).toMatch(/^#[0-9a-f]{6}$/i);
    expect(tokens.color.grass).toMatch(/^#[0-9a-f]{6}$/i);
    expect(tokens.color.paper).toMatch(/^#[0-9a-f]{6}$/i);
    expect(tokens.color.ink).toMatch(/^#[0-9a-f]{6}$/i);
    expect(tokens.color.accentLeaf).toBe('#5ec850');
    expect(tokens.color.accentBell).toBe('#d4b030');
    expect(tokens.color.accentSky).toBe('#4aacf0');
  });

  it('exports font stacks with fallbacks', () => {
    expect(tokens.font.display).toContain('serif');
    expect(tokens.font.body).toContain('sans-serif');
    expect(tokens.font.handwriting).toContain('cursive');
    expect(tokens.font.mono).toContain('monospace');
  });

  it('exports radius scale', () => {
    expect(tokens.radius.sm).toBe(6);
    expect(tokens.radius.md).toBe(12);
    expect(tokens.radius.lg).toBe(24);
    expect(tokens.radius.pill).toBe(999);
  });

  it('exports shadow recipes', () => {
    expect(tokens.shadow.paper).toContain('rgba');
    expect(tokens.shadow.sign).toContain('rgba');
  });

  it('exports spacing scale', () => {
    expect(tokens.space[0]).toBe(0);
    expect(tokens.space[4]).toBe(16);
    expect(tokens.space[8]).toBe(32);
  });
});
