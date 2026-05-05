import { describe, it, expect } from 'vitest';
import { DIY_CATEGORIES, TOTAL_RECIPES } from '../src/artifacts/diyRecipeData.js';

describe('diyRecipeData', () => {
  it('TOTAL_RECIPES matches the sum of category recipe arrays', () => {
    const sum = Object.values(DIY_CATEGORIES).reduce((a, c) => a + c.recipes.length, 0);
    expect(TOTAL_RECIPES).toBe(sum);
  });

  it('reaches the documented 781-recipe total (post-3.0 sync)', () => {
    expect(TOTAL_RECIPES).toBeGreaterThanOrEqual(781);
  });

  it('every recipe appears in exactly one category', () => {
    const seen = new Map();
    for (const [cat, payload] of Object.entries(DIY_CATEGORIES)) {
      for (const r of payload.recipes) {
        if (seen.has(r)) {
          throw new Error(`Recipe "${r}" appears in both "${seen.get(r)}" and "${cat}"`);
        }
        seen.set(r, cat);
      }
    }
    expect(seen.size).toBe(TOTAL_RECIPES);
  });

  it('every category has an emoji and a non-empty recipes array', () => {
    for (const [cat, payload] of Object.entries(DIY_CATEGORIES)) {
      expect(payload.emoji, `${cat} missing emoji`).toBeTypeOf('string');
      expect(payload.recipes, `${cat} missing recipes`).toBeInstanceOf(Array);
      expect(payload.recipes.length, `${cat} has 0 recipes`).toBeGreaterThan(0);
    }
  });

  it('all recipe names are non-empty strings', () => {
    for (const payload of Object.values(DIY_CATEGORIES)) {
      for (const r of payload.recipes) {
        expect(r).toBeTypeOf('string');
        expect(r.length).toBeGreaterThan(0);
      }
    }
  });
});
