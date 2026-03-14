# FlowerCalculator Genetics Fix — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix Hyacinth Blue seed error in gardenData.js, refactor FlowerCalculator to import from gardenData.js instead of duplicating data inline, and verify genotypes against datamined sources.

**Architecture:** FlowerCalculator imports `SPECIES` and `BREEDING_PATHS` from the existing `gardenData.js` module. An adapter at module scope transforms the data format (gardenData uses `color`/float probabilities, component uses `name`/integer percentages). Blue Rose path and Gold Rose info are added as new exports in gardenData.js.

**Tech Stack:** React 19.2, Vite 7.3, inline styles, `window.storage` API

---

## Chunk 1: Data Fixes and Refactoring

### Task 1: Fix Hyacinth Blue seed error in gardenData.js

**Files:**
- Modify: `src/artifacts/gardenData.js`

- [ ] **Step 1: Fix Hyacinth seedColors and Blue source**

In `src/artifacts/gardenData.js`, find the hyacinth section (around line 95-109).

Change `seedColors` from `['Red', 'White', 'Yellow', 'Blue']` to `['Red', 'White', 'Yellow']`.

Change Blue Hyacinth's `source` from `'seed'` to `'hybrid'`.

Remove or update the comment `// Blue is also a seed color per Nookipedia` — this was incorrect. Blue Hyacinth is bred from White × White.

Also update the file header comment at line 12 which says `// - Blue Hyacinth is source: 'seed', not hybrid`. Change it to `// - Blue Hyacinth is source: 'hybrid' (bred from White × White)`.

The hyacinth section should look like:
```js
hyacinth: {
  name: 'Hyacinth',
  emoji: '💐',
  geneCount: 3,
  // Seed colors: Red, White, Yellow — Blue is bred from White × White
  seedColors: ['Red', 'White', 'Yellow'],
  colors: [
    { color: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#ff0000', hasAsset: true },
    { color: 'White',  genes: 'rr-yy-WW', source: 'seed',   hex: '#ffffff', hasAsset: true },
    { color: 'Yellow', genes: 'RR-YY-ww', source: 'seed',   hex: '#ffff00', hasAsset: true },
    { color: 'Blue',   genes: 'rr-yy-ww', source: 'hybrid', hex: '#1e90ff', hasAsset: true },
    { color: 'Pink',   genes: 'Rr-yy-WW', source: 'hybrid', hex: '#ffc0cb', hasAsset: true },
    { color: 'Orange', genes: 'RR-Yy-ww', source: 'hybrid', hex: '#ff8c00', hasAsset: true },
    { color: 'Purple', genes: 'rr-yy-ww', source: 'hybrid', hex: '#800080', hasAsset: true },
  ],
},
```

- [ ] **Step 2: Add BLUE_ROSE_PATH and GOLD_ROSE_INFO exports**

At the end of `gardenData.js` (after the `COLOR_HEX` export), add:

```js
// ─── BLUE_ROSE_PATH ─────────────────────────────────────────────────────────
// 4-step guide for breeding blue roses (1/64 ≈ 1.56% chance)

export const BLUE_ROSE_PATH = [
  {
    title: 'Breed Seed Red + Seed Yellow',
    description: 'Plant seed red and seed yellow roses next to each other. They produce orange roses with special hybrid genes — these are NOT regular orange roses.',
    note: 'Seed Red × Seed Yellow → Special Orange Hybrids'
  },
  {
    title: 'Breed Special Orange Hybrids Together',
    description: 'Take two orange hybrid roses from Step 1 and breed them together. This produces a mix of colors including rare hybrid red roses.',
    note: 'Orange Hybrid × Orange Hybrid → Hybrid Red (rare)'
  },
  {
    title: 'Breed Hybrid Red + Hybrid Red',
    description: 'Breed two hybrid red roses together. This creates another generation of hybrid reds with more refined gene combinations.',
    note: 'Hybrid Red × Hybrid Red → Hybrid Red++'
  },
  {
    title: 'Breed Hybrid Red++ for Blue Rose',
    description: 'Continue breeding hybrid red roses. Blue roses appear at approximately 1/64 chance (~1.56%) per bloom cycle. Keep at it!',
    note: '~1.56% chance per bloom — estimated 4–6 weeks'
  }
];

// ─── GOLD_ROSE_INFO ─────────────────────────────────────────────────────────
// Gold rose requires golden watering can on black roses — NOT standard breeding

export const GOLD_ROSE_INFO = {
  requirement: 'Golden Watering Can',
  method: 'Water Black Roses with Golden Watering Can',
  note: 'Gold roses can only be obtained by watering black roses with a golden watering can. This is NOT a standard breeding mechanic.',
  genotype: 'RR-YY-ww-ss'
};
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Clean build. GardenPlanner should still work since we only added exports and fixed one seed color.

- [ ] **Step 4: Commit**

```bash
git add src/artifacts/gardenData.js
git commit -m "fix(#18): correct Hyacinth Blue seed→hybrid, add blue rose + gold rose exports

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Refactor FlowerCalculator to import from gardenData.js

**Files:**
- Modify: `src/artifacts/FlowerCalculator.jsx` (834 → ~450 lines)
- Read: `src/artifacts/gardenData.js` (import from here)

- [ ] **Step 1: Add imports and build adapter**

At the top of `FlowerCalculator.jsx`, after the existing imports (lines 1-2), add:

```js
import { SPECIES, BREEDING_PATHS, BLUE_ROSE_PATH, GOLD_ROSE_INFO } from './gardenData';

// Adapt gardenData format to component format:
// - gardenData uses: SPECIES[species].colors[].color, probability as float 0-1
// - Component uses: flowerData[Species].colors[].name, chance as int 0-100
// - gardenData keys are lowercase ('rose'), component uses Title Case ('Rose')
const flowerData = Object.fromEntries(
  Object.entries(SPECIES).map(([key, sp]) => [
    sp.name, // 'rose' → 'Rose'
    {
      emoji: sp.emoji,
      genes: sp.geneCount,
      seedColors: sp.seedColors,
      colors: sp.colors.map(c => ({
        name: c.color,       // 'color' → 'name'
        genes: c.genes,
        source: c.source,
        hex: c.hex,
        hasAsset: c.hasAsset,
        ...(c.note ? { note: c.note } : {}),
      })),
    }
  ])
);

const breedingPaths = Object.fromEntries(
  Object.entries(BREEDING_PATHS).map(([key, paths]) => [
    SPECIES[key].name, // 'rose' → 'Rose'
    paths.map(p => ({
      p1: p.parents[0],
      p2: p.parents[1],
      results: p.offspring.map(o => ({
        color: o.color,
        chance: Math.round(o.probability * 100),
      })),
    })),
  ])
);
```

These adapters are computed ONCE at module scope (not inside the component), so there's zero render-time cost.

- [ ] **Step 2: Delete inline data**

Delete these inline data blocks from inside the component function:
- Lines 29-143: `const flowerData = { ... }` (replaced by module-scope adapter above)
- Lines 145-174: `const blueRoseSteps = [...]` (now imported as `BLUE_ROSE_PATH`)
- Lines 178-243: `const breedingPaths = { ... }` (replaced by module-scope adapter above)

**IMPORTANT:** Keep everything else — `calculateOffspring`, `updateBlueRoseProgress`, all useEffect hooks, styles, and JSX rendering.

- [ ] **Step 3: Update Blue Rose and Gold Rose references**

Find references to the old `blueRoseSteps` variable in the JSX rendering and replace with `BLUE_ROSE_PATH`:
- The Blue Rose tab renders `blueRoseSteps.map(...)` — change to `BLUE_ROSE_PATH.map(...)`
- If there are any references to `blueRoseSteps.length`, change to `BLUE_ROSE_PATH.length`

For Gold Rose, the component currently has the info hardcoded in JSX text. If `GOLD_ROSE_INFO` can be used, wire it in. Otherwise, leave the hardcoded text (it's already correct).

- [ ] **Step 4: Fix Hyacinth in component to match gardenData**

The component currently lists Blue Hyacinth with `source: 'seed'` and has Blue in `seedColors`. After the adapter runs, this will automatically be corrected because gardenData.js now has the fixed values. Verify that the Hyacinth section in the adapted `flowerData` shows:
- `seedColors: ['Red', 'White', 'Yellow']` (no Blue)
- Blue Hyacinth: `source: 'hybrid'`

- [ ] **Step 5: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Clean build with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/artifacts/FlowerCalculator.jsx
git commit -m "refactor(#18): import flower data from gardenData.js, remove inline duplication

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Chunk 2: Verification and Deploy

### Task 3: Verify genotypes against datamined sources

- [ ] **Step 1: Web search for Aeon/Paleh datamined flower genetics**

Search for the ACNH flower genetics datamined spreadsheet. Compare:
- All 54 color genotypes across 8 species
- Seed color assignments
- Breeding path outcomes

Key things to verify:
- Rose genotypes (4-gene system is most complex)
- Whether shared genotypes (e.g., Pansy Blue/Purple both `rr-yy-ww`) are correct
- Whether breeding probabilities are correct Punnett square math

- [ ] **Step 2: Fix any incorrect genotypes**

If any genotypes are wrong, fix them in `gardenData.js` (the single source of truth). The FlowerCalculator adapter will pick up changes automatically.

- [ ] **Step 3: Commit any fixes**

```bash
git add src/artifacts/gardenData.js
git commit -m "fix(#18): correct genotypes verified against datamined sources

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Version bump, build, deploy

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Run production build**

Run: `npm run build 2>&1 | tail -5`
Expected: Clean build.

- [ ] **Step 2: Bump version to 1.4.2**

In `package.json`, change `"version"` from `"1.4.1"` to `"1.4.2"`.

- [ ] **Step 3: Commit and push**

```bash
git add package.json
git commit -m "chore(#18): bump version to 1.4.2 for FlowerCalculator genetics fix

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
git push origin main
```

- [ ] **Step 4: Close issue**

```bash
gh issue close 18 --comment "Fixed in v1.4.2. FlowerCalculator now imports verified genetics from gardenData.js (single source of truth). Hyacinth Blue corrected from seed→hybrid. Genotypes verified against datamined sources."
```

---

## Task Dependency Graph

```
Task 1 (fix gardenData) → Task 2 (refactor FlowerCalculator) → Task 3 (verify genotypes) → Task 4 (deploy)
```

All tasks are sequential.

## Notes for Implementer

1. **gardenData.js is the single source of truth** for flower genetics. Both GardenPlanner and FlowerCalculator import from it. Any genotype fix goes in gardenData.js only.
2. **The adapter is at module scope** — computed once, not per-render. This is critical for performance.
3. **Field name mapping:** gardenData `color` → component `name`, gardenData `probability` (float) → component `chance` (int).
4. **Key casing:** gardenData uses lowercase keys (`rose`), component uses Title Case (`Rose`). The adapter maps via `SPECIES[key].name`.
5. **Do NOT modify GardenPlanner** — it already imports from gardenData.js and will automatically pick up the Hyacinth fix.
