# FlowerCalculator Genetics Fix — Design Spec

**Issue:** #18 — Verify and fix FlowerCalculator genetics data
**Date:** 2026-03-14
**Status:** Approved

---

## Problem

The FlowerCalculator (834 lines) has all flower data inlined. A verified data module `src/artifacts/gardenData.js` (238 lines) already exists with corrected data — used by GardenPlanner. The FlowerCalculator should import from `gardenData.js` instead of duplicating data. Some genotypes still need verification against datamined sources.

## Solution

Refactor FlowerCalculator to import from the existing `gardenData.js`. Verify genotypes against the Aeon/Paleh datamined spreadsheet. Adapt field names where needed (gardenData uses `color`, component uses `name`). No new data files. No UI changes.

---

## Section 1: Data Source

### Existing `gardenData.js` (already verified)
Located at `src/artifacts/gardenData.js`, this module already exports:
- `SPECIES` — 8 species with colors, genotypes, hex values, seed info, asset flags
- `BREEDING_PATHS` — per-species parent combinations with offspring probabilities (float 0-1)
- `SEED_GENOTYPES` — derived lookup: species → seed color → genotype
- `COLOR_HEX` — flat lookup: color name → hex value

**Already-applied fixes in gardenData.js:**
- No Pink Pansy (correctly removed)
- No Yellow Windflower (correctly omitted)
- Hyacinth has Yellow seed, Orange color, Blue (not "Light Blue")
- Orange Windflower correctly marked as seed color
- Gold Rose marked as `source: 'special'` with note about golden watering can
- Green Rose marked as `hasAsset: false`

### What gardenData.js does NOT have
- `BLUE_ROSE_PATH` — the 4-step breeding guide (currently only in FlowerCalculator.jsx)
- `GOLD_ROSE_INFO` — gold rose mechanic details (currently only in FlowerCalculator.jsx)

These two should be added to `gardenData.js` as new exports.

---

## Section 2: Refactoring Plan

### FlowerCalculator.jsx changes

1. **Add imports from gardenData.js:**
```js
import { SPECIES, BREEDING_PATHS } from './gardenData';
```

2. **Adapt field names** — gardenData uses `color` field, FlowerCalculator uses `name`:
   - Add a small adapter at the top of the component that maps `SPECIES` to the format the UI expects
   - Or update the rendering code to use `color` instead of `name` (simpler, fewer moving parts)

3. **Move Blue Rose path and Gold Rose info to gardenData.js:**
   - Extract `BLUE_ROSE_PATH` array (4-step method) from FlowerCalculator
   - Extract `GOLD_ROSE_INFO` object from FlowerCalculator
   - Add as exports in gardenData.js
   - Import in FlowerCalculator

4. **Delete inline data** — remove the `FLOWERS`, breeding paths, and related data from FlowerCalculator.jsx

5. **Convert probability format** — gardenData uses float 0-1, FlowerCalculator UI displays as integer 0-100. Apply `Math.round(prob * 100)` at render time.

### gardenData.js additions
- `export const BLUE_ROSE_PATH = [...]` — 4-step breeding guide
- `export const GOLD_ROSE_INFO = {...}` — gold rose mechanic

---

## Section 3: Genotype Verification

### Verify against datamined sources
Use web search to find the Aeon/Paleh ACNH flower genetics spreadsheet. Cross-check:
- All 54 color genotypes (10 rose + 7 tulip + 6 pansy + 6 cosmos + 6 lily + 7 hyacinth + 6 windflower + 6 mum)
- Breeding path outcomes and probabilities
- Seed color assignments

### Known issues to investigate
- Several species share identical genotypes for different colors (e.g., Pansy Blue and Purple both `rr-yy-ww`). This is how ACNH actually works — multiple genotype combinations can produce the same phenotype, and the data file shows simplified "representative" genotypes. Verify this is correct.
- Hyacinth seed colors: gardenData lists Red, White, Yellow, Blue. Per Nookipedia, Blue Hyacinth seeds are NOT sold — Blue is bred from White + White. Investigate and fix if needed.

---

## Section 4: What Changes

### Modified files
- `src/artifacts/FlowerCalculator.jsx` — import from gardenData.js, remove inline data (~834 → ~450 lines)
- `src/artifacts/gardenData.js` — add BLUE_ROSE_PATH and GOLD_ROSE_INFO exports

### No new files
(gardenData.js already exists — no new data module needed)

### No changes to
- `src/App.jsx` — same lazy import, same menu entry
- `src/artifacts/GardenPlanner.jsx` — already imports from gardenData.js, unaffected
- `src/assetHelper.jsx` — no changes

### Version bump
- `package.json`: bump to `1.4.2` (data fix, patch version per project rules)
