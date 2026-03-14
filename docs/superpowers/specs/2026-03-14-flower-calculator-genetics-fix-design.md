# FlowerCalculator Genetics Fix — Design Spec

**Issue:** #18 — Verify and fix FlowerCalculator genetics data
**Date:** 2026-03-14
**Status:** Approved

---

## Problem

The FlowerCalculator has mostly correct data but needs verification against datamined sources. The verified data file (`ACNH-Helper-Suite/data/flowers.js`) has errors: fabricated Pink Pansy, wrong Hyacinth data (missing Yellow seed, missing Orange color, "Light Blue" instead of "Blue"). Component genotypes need cross-checking against the Aeon/Paleh datamined spreadsheet.

## Solution

Fix confirmed errors, verify all genotypes against datamined sources, extract data to a separate module. No UI changes.

---

## Section 1: Data Fixes

### Fix `ACNH-Helper-Suite/data/flowers.js`
1. **Remove Pink Pansy** — does not exist in ACNH. Remove the entry and any breeding paths referencing it.
2. **Fix Hyacinth:**
   - Add Yellow as a seed color (buyable from Leif/Nook's Cranny)
   - Add Orange Hyacinth color entry with correct genotype
   - Rename "Light Blue" → "Blue" (the in-game name is Blue Hyacinth)
   - Fix seed color list: should be Red, White, Yellow (not Red, White, Blue)

### Verify component genotypes
Cross-reference all 55 color genotypes across 8 species against the Aeon/Paleh datamined ACNH flower genetics spreadsheet:
- **Roses** (10 colors, 4-gene RR-YY-WW-ss system)
- **Tulips** (7 colors, 3-gene RR-YY-ss system)
- **Pansies** (6 colors, 3-gene RR-YY-WW system) — no Pink
- **Cosmos** (6 colors, 3-gene RR-YY-ss system)
- **Lilies** (6 colors, 3-gene RR-YY-ss system)
- **Hyacinths** (7 colors, 3-gene RR-YY-WW system) — includes Orange
- **Windflowers** (6 colors, 3-gene RR-OO-WW system) — no Yellow
- **Mums** (6 colors, 3-gene RR-YY-WW system)

Fix any genotypes that don't match the datamined values.

### Verify breeding paths
For each species, verify that the listed breeding combinations (parent1 + parent2 → offspring with probabilities) are correct per Punnett square math with the corrected genotypes.

---

## Section 2: File Structure

### Extract data to `flowerCalculatorData.js`

```
src/artifacts/
├── FlowerCalculator.jsx        ← UI only (~400 lines)
└── flowerCalculatorData.js     ← All verified genetics data (~400 lines)
```

### flowerCalculatorData.js exports

```js
export const FLOWERS = { ... };          // 8 species with colors, genotypes, seed info
export const BREEDING_PATHS = { ... };   // Per-species breeding combinations
export const BLUE_ROSE_PATH = [ ... ];   // 4-step blue rose breeding guide
export const GOLD_ROSE_INFO = { ... };   // Gold rose special mechanic
```

**Data structure** — keyed object matching current format:
```js
export const FLOWERS = {
  rose: {
    name: 'Rose',
    genes: ['R', 'Y', 'W', 'S'],  // 4-gene system
    seedColors: ['Red', 'White', 'Yellow'],
    colors: [
      { name: 'Red', genotype: 'RR-yy-WW-ss', source: 'seed', hasAsset: true },
      // ... all colors with verified genotypes
    ]
  },
  // ... 7 more species
};
```

### FlowerCalculator.jsx changes
- Add import: `import { FLOWERS, BREEDING_PATHS, BLUE_ROSE_PATH, GOLD_ROSE_INFO } from './flowerCalculatorData';`
- Delete inline data definitions
- Keep all UI code, styles, state management, rendering
- No functional changes to the calculator behavior

---

## Section 3: What stays the same

- **Blue Rose path**: 4-step method with 1/64 (1.56%) probability — already verified correct
- **Gold Rose mechanic**: Golden watering can on black roses — already correct
- **UI**: 4 tabs (Calculator, Gallery, Blue Rose, Gold Rose) — unchanged
- **Storage**: same key, same format
- **Asset integration**: `<AssetImg>` with flower names — unchanged
- **Green Rose**: correctly marked as `hasAsset: false`

---

## Section 4: What Changes

### New files
- `src/artifacts/flowerCalculatorData.js` — verified genetics data

### Modified files
- `src/artifacts/FlowerCalculator.jsx` — refactored to import from data module
- `ACNH-Helper-Suite/data/flowers.js` — fix Pink Pansy and Hyacinth errors

### No changes to
- `src/App.jsx` — same lazy import, same menu entry
- `src/assetHelper.jsx` — no changes
- `public/assets-web/manifest.json` — no changes

### Version bump
- `package.json`: bump to `1.5.0` (genetics data verification + module extraction)
