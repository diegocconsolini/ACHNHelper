# Garden Planner Rebuild Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Garden Planner from a basic color-grid into a genotype-aware breeding simulator with real ACNH flower mechanics for all 8 species, three simulation tiers, and a hybrid sliding-panel layout.

**Architecture:** 4-file modular split — `gardenData.js` (pure data), `gardenGenetics.js` (Mendelian inheritance engine), `gardenSimulation.js` (day sim, watering, bad luck), `GardenPlanner.jsx` (React UI with toolbar + grid + sliding panel).

**Tech Stack:** React 19.2, Vite 7.3, inline styles only, `window.storage` API, `<AssetImg>` from `src/assetHelper.jsx`

**Spec:** `docs/superpowers/specs/2026-03-12-garden-planner-design.md`

---

## Chunk 1: Data & Genetics Modules

### Task 1: Create `gardenData.js` — Flower Species Database

**Files:**
- Create: `src/artifacts/gardenData.js`

**Data source:** Copy flower data from `src/artifacts/FlowerCalculator.jsx` lines 29-243, with one structural change: rename the `name` field to `color` in each color entry (FlowerCalculator uses `{ name: 'Red', ... }`, we use `{ color: 'Red', ... }`). This data was previously verified against `ACNH-Helper-Suite/data/flowers.js`, `manifest.json`, and Nookipedia.

- [ ] **Step 1: Create `gardenData.js` with SPECIES data**

Create `src/artifacts/gardenData.js` exporting all 8 species with their colors, genotypes, sources, and asset flags. Data comes from FlowerCalculator.jsx `flowerData` object (lines 29-150), converted to module exports. **Important:** Rename `name` → `color` in each color entry (the genetics engine uses `c.color`, not `c.name`).

```js
// src/artifacts/gardenData.js
// All data sourced from FlowerCalculator.jsx (verified against flowers.js, manifest.json, Nookipedia)

export const SPECIES = {
  rose: {
    name: 'Rose', emoji: '🌹', geneCount: 4,
    seedColors: ['Red', 'White', 'Yellow'],
    colors: [
      { color: 'Red',    genes: 'RR-yy-WW-ss', source: 'seed',    hex: '#d63031', hasAsset: true },
      { color: 'White',  genes: 'rr-yy-WW-Ss', source: 'seed',    hex: '#f8f9fa', hasAsset: true },
      { color: 'Yellow', genes: 'rr-YY-WW-ss', source: 'seed',    hex: '#fdcb6e', hasAsset: true },
      { color: 'Pink',   genes: 'Rr-yy-WW-Ss', source: 'hybrid',  hex: '#fd79a8', hasAsset: true },
      { color: 'Purple', genes: 'rr-yy-ww-Ss', source: 'hybrid',  hex: '#a29bfe', hasAsset: true },
      { color: 'Orange', genes: 'RR-Yy-WW-ss', source: 'hybrid',  hex: '#e17055', hasAsset: true },
      { color: 'Black',  genes: 'RR-yy-ww-ss', source: 'hybrid',  hex: '#2d3436', hasAsset: true },
      { color: 'Blue',   genes: 'RR-YY-ww-ss', source: 'hybrid',  hex: '#4aacf0', hasAsset: true },
      { color: 'Gold',   genes: 'RR-YY-ww-ss', source: 'special', hex: '#d4b030', hasAsset: true,
        note: 'Water Black roses with Golden Watering Can' },
      { color: 'Green',  genes: 'rr-YY-ww-ss', source: 'hybrid',  hex: '#5ec850', hasAsset: false },
    ],
  },
  tulip: {
    name: 'Tulip', emoji: '🌷', geneCount: 3,
    seedColors: ['Red', 'White', 'Yellow'],
    colors: [
      { color: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#e74c3c', hasAsset: true },
      { color: 'White',  genes: 'rr-yy-WW', source: 'seed',   hex: '#ecf0f1', hasAsset: true },
      { color: 'Yellow', genes: 'RR-YY-ww', source: 'seed',   hex: '#f1c40f', hasAsset: true },
      { color: 'Pink',   genes: 'Rr-yy-WW', source: 'hybrid', hex: '#f48fb1', hasAsset: true },
      { color: 'Purple', genes: 'rr-yy-ww', source: 'hybrid', hex: '#9b59b6', hasAsset: true },
      { color: 'Orange', genes: 'RR-Yy-ww', source: 'hybrid', hex: '#e67e22', hasAsset: true },
      { color: 'Black',  genes: 'rr-yy-ww', source: 'hybrid', hex: '#34495e', hasAsset: true },
    ],
  },
  pansy: {
    name: 'Pansy', emoji: '🌸', geneCount: 3,
    seedColors: ['Red', 'White', 'Yellow'],
    // NO PINK PANSY — does not exist in the game
    colors: [
      { color: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#c0392b', hasAsset: true },
      { color: 'White',  genes: 'rr-yy-WW', source: 'seed',   hex: '#f5f6fa', hasAsset: true },
      { color: 'Yellow', genes: 'RR-YY-ww', source: 'seed',   hex: '#f9ca24', hasAsset: true },
      { color: 'Orange', genes: 'RR-Yy-ww', source: 'hybrid', hex: '#ff7f50', hasAsset: true },
      { color: 'Blue',   genes: 'rr-yy-ww', source: 'hybrid', hex: '#0984e3', hasAsset: true },
      { color: 'Purple', genes: 'rr-yy-ww', source: 'hybrid', hex: '#6c5ce7', hasAsset: true },
    ],
  },
  cosmos: {
    name: 'Cosmos', emoji: '🌼', geneCount: 3,
    seedColors: ['Red', 'White', 'Yellow'],
    colors: [
      { color: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#e63946', hasAsset: true },
      { color: 'White',  genes: 'rr-yy-WW', source: 'seed',   hex: '#f0f0f0', hasAsset: true },
      { color: 'Yellow', genes: 'RR-YY-ww', source: 'seed',   hex: '#ffd60a', hasAsset: true },
      { color: 'Pink',   genes: 'Rr-yy-WW', source: 'hybrid', hex: '#ff69b4', hasAsset: true },
      { color: 'Orange', genes: 'RR-Yy-ww', source: 'hybrid', hex: '#f77f00', hasAsset: true },
      { color: 'Black',  genes: 'rr-yy-ww', source: 'hybrid', hex: '#1a1a2e', hasAsset: true },
    ],
  },
  lily: {
    name: 'Lily', emoji: '🌺', geneCount: 3,
    seedColors: ['Red', 'White', 'Yellow'],
    colors: [
      { color: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#dc143c', hasAsset: true },
      { color: 'White',  genes: 'rr-yy-WW', source: 'seed',   hex: '#fffaf0', hasAsset: true },
      { color: 'Yellow', genes: 'RR-YY-ww', source: 'seed',   hex: '#ffeb3b', hasAsset: true },
      { color: 'Pink',   genes: 'Rr-yy-WW', source: 'hybrid', hex: '#ff1493', hasAsset: true },
      { color: 'Orange', genes: 'RR-Yy-ww', source: 'hybrid', hex: '#ff6347', hasAsset: true },
      { color: 'Black',  genes: 'rr-yy-ww', source: 'hybrid', hex: '#1c1c1c', hasAsset: true },
    ],
  },
  hyacinth: {
    name: 'Hyacinth', emoji: '💐', geneCount: 3,
    seedColors: ['Red', 'White', 'Yellow', 'Blue'],
    colors: [
      { color: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#ff0000', hasAsset: true },
      { color: 'White',  genes: 'rr-yy-WW', source: 'seed',   hex: '#ffffff', hasAsset: true },
      { color: 'Yellow', genes: 'RR-YY-ww', source: 'seed',   hex: '#ffff00', hasAsset: true },
      { color: 'Blue',   genes: 'rr-yy-ww', source: 'seed',   hex: '#1e90ff', hasAsset: true },
      { color: 'Pink',   genes: 'Rr-yy-WW', source: 'hybrid', hex: '#ffc0cb', hasAsset: true },
      { color: 'Orange', genes: 'RR-Yy-ww', source: 'hybrid', hex: '#ff8c00', hasAsset: true },
      { color: 'Purple', genes: 'rr-yy-ww', source: 'hybrid', hex: '#800080', hasAsset: true },
    ],
  },
  windflower: {
    name: 'Windflower', emoji: '🪻', geneCount: 3,
    seedColors: ['Red', 'White', 'Orange'],
    // NO YELLOW WINDFLOWER — does not exist in the game
    colors: [
      { color: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#b22222', hasAsset: true },
      { color: 'White',  genes: 'rr-yy-WW', source: 'seed',   hex: '#f5f5f5', hasAsset: true },
      { color: 'Orange', genes: 'RR-Yy-ww', source: 'seed',   hex: '#ff8c00', hasAsset: true },
      { color: 'Pink',   genes: 'Rr-yy-WW', source: 'hybrid', hex: '#dda0dd', hasAsset: true },
      { color: 'Blue',   genes: 'rr-yy-ww', source: 'hybrid', hex: '#4169e1', hasAsset: true },
      { color: 'Purple', genes: 'rr-yy-ww', source: 'hybrid', hex: '#dda0dd', hasAsset: true },
    ],
  },
  mum: {
    name: 'Mum', emoji: '🌻', geneCount: 3,
    seedColors: ['Red', 'White', 'Yellow'],
    colors: [
      { color: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#8b0000', hasAsset: true },
      { color: 'White',  genes: 'rr-yy-WW', source: 'seed',   hex: '#f0f8ff', hasAsset: true },
      { color: 'Yellow', genes: 'RR-YY-ww', source: 'seed',   hex: '#ffd700', hasAsset: true },
      { color: 'Pink',   genes: 'Rr-yy-WW', source: 'hybrid', hex: '#ff69b4', hasAsset: true },
      { color: 'Purple', genes: 'rr-yy-ww', source: 'hybrid', hex: '#ba55d3', hasAsset: true },
      { color: 'Green',  genes: 'rr-YY-ww', source: 'hybrid', hex: '#32cd32', hasAsset: true },
    ],
  },
};
```

Also export `BREEDING_PATHS` (for static analysis tier only), `SEED_GENOTYPES` helper, and `COLOR_HEX` map. The `BREEDING_PATHS` data comes from FlowerCalculator.jsx `breedingPaths` object (lines 178-242), converting the `{ p1, p2, results: [{ color, chance }] }` format to `{ parents: [p1, p2], offspring: [{ color, probability }] }` with chance→probability (75→0.75).

`SEED_GENOTYPES` is derived from `SPECIES` — for each species, maps each seed color to its genotype string:
```js
export const SEED_GENOTYPES = Object.fromEntries(
  Object.entries(SPECIES).map(([key, sp]) => [
    key,
    Object.fromEntries(
      sp.colors.filter(c => c.source === 'seed').map(c => [c.color, c.genes])
    ),
  ])
);
```

`COLOR_HEX` is a flat map derived from SPECIES for quick color→hex lookups (used by grid rendering):
```js
export const COLOR_HEX = {};
Object.values(SPECIES).forEach(sp =>
  sp.colors.forEach(c => { if (!COLOR_HEX[c.color]) COLOR_HEX[c.color] = c.hex; })
);
```

`BREEDING_PATHS` is used for Tier A static analysis only (Tier B/C use real genotype crossover via `crossGenes()`). Copy from FlowerCalculator.jsx `breedingPaths` object (lines 178-242), converting `{ p1, p2, results: [{ color, chance }] }` to `{ parents: [p1, p2], offspring: [{ color, probability }] }` where `chance` (integer 0-100) becomes `probability` (float 0-1, e.g., 75→0.75). Example for Rose:

```js
export const BREEDING_PATHS = {
  rose: [
    { parents: ['Red', 'Red'],    offspring: [{ color: 'Red', probability: 0.75 }, { color: 'Pink', probability: 0.25 }] },
    { parents: ['Red', 'White'],  offspring: [{ color: 'Red', probability: 0.25 }, { color: 'White', probability: 0.25 }, { color: 'Pink', probability: 0.50 }] },
    { parents: ['Red', 'Yellow'], offspring: [{ color: 'Red', probability: 0.25 }, { color: 'Yellow', probability: 0.25 }, { color: 'Orange', probability: 0.50 }] },
    // ... remaining rose pairs from FlowerCalculator lines 183-188
  ],
  tulip: [
    // Copy from FlowerCalculator lines 190-195, same chance→probability conversion
  ],
  // ... all 8 species. Follow the exact same pattern for pansy, cosmos, lily, hyacinth, windflower, mum.
};
```

- [ ] **Step 2: Verify data integrity**

Run: `npm run build`
Expected: Clean build, no import errors. The file is pure JS with only `export` statements, no React.

- [ ] **Step 3: Commit**

```bash
git add src/artifacts/gardenData.js
git commit -m "feat(garden): add gardenData.js with verified flower species data"
```

---

### Task 2: Create `gardenGenetics.js` — Mendelian Inheritance Engine

**Files:**
- Create: `src/artifacts/gardenGenetics.js`

- [ ] **Step 1: Create `gardenGenetics.js` with gene parsing utilities**

```js
// src/artifacts/gardenGenetics.js
import { SPECIES, SEED_GENOTYPES } from './gardenData.js';

/**
 * Parse a genotype string like "RR-yy-Ww-ss" into gene pairs.
 * Returns array of pairs: [['R','R'], ['y','y'], ['W','w'], ['s','s']]
 * Each pair is [allele1, allele2] where uppercase = dominant.
 */
export function parseGenotype(genotypeStr) {
  return genotypeStr.split('-').map(pair => {
    // pair is e.g. "RR", "Rr", "rr", "Ww"
    return [pair[0], pair[1]];
  });
}

/**
 * Serialize gene pairs back to genotype string.
 * Normalizes order: dominant allele first (Rr not rR).
 */
export function serializeGenotype(genePairs) {
  return genePairs.map(([a, b]) => {
    const aUp = a === a.toUpperCase();
    const bUp = b === b.toUpperCase();
    if (aUp && !bUp) return a + b;
    if (!aUp && bUp) return b + a;
    return a + b; // both same case
  }).join('-');
}
```

- [ ] **Step 2: Add `crossGenes` function**

The core Mendelian crossover. For each gene pair position, independently computes the Punnett square outcomes:

```js
/**
 * Cross two genotypes. Returns all possible offspring genotypes with probabilities.
 * Works for both 3-gene and 4-gene species.
 *
 * Example: crossGenes("RR-yy-Ww", "Rr-Yy-WW")
 * Returns: [{ genotype: "RR-Yy-Ww", probability: 0.125 }, ...]
 */
export function crossGenes(parent1Str, parent2Str) {
  const p1 = parseGenotype(parent1Str);
  const p2 = parseGenotype(parent2Str);

  // For each gene pair, compute possible outcomes with probabilities
  const perGene = p1.map((pair1, i) => {
    const pair2 = p2[i];
    const outcomes = {};
    // Punnett square: each allele from parent1 × each allele from parent2
    for (const a1 of pair1) {
      for (const a2 of pair2) {
        const key = serializeGenotype([[a1, a2]]);
        outcomes[key] = (outcomes[key] || 0) + 0.25;
      }
    }
    return Object.entries(outcomes).map(([g, p]) => ({ gene: g, probability: p }));
  });

  // Cartesian product of all gene positions
  let results = [{ genotype: '', probability: 1 }];
  for (const geneOutcomes of perGene) {
    const newResults = [];
    for (const prev of results) {
      for (const outcome of geneOutcomes) {
        newResults.push({
          genotype: prev.genotype ? prev.genotype + '-' + outcome.gene : outcome.gene,
          probability: prev.probability * outcome.probability,
        });
      }
    }
    results = newResults;
  }

  // Merge duplicates (same genotype string)
  const merged = {};
  for (const r of results) {
    merged[r.genotype] = (merged[r.genotype] || 0) + r.probability;
  }

  return Object.entries(merged).map(([genotype, probability]) => ({
    genotype,
    probability: Math.round(probability * 10000) / 10000, // avoid floating point noise
  }));
}
```

- [ ] **Step 3: Add `genotypeToColor` function**

```js
/**
 * Look up what color a genotype produces for a given species.
 * Returns the color string or 'Unknown' if no match.
 */
export function genotypeToColor(speciesKey, genotypeStr) {
  const species = SPECIES[speciesKey];
  if (!species) return 'Unknown';
  const match = species.colors.find(c => c.genes === genotypeStr);
  return match ? match.color : 'Unknown';
}

/**
 * Get the hex color value for a species + genotype combination.
 */
export function genotypeToHex(speciesKey, genotypeStr) {
  const species = SPECIES[speciesKey];
  if (!species) return '#5a7a50';
  const match = species.colors.find(c => c.genes === genotypeStr);
  return match ? match.hex : '#5a7a50';
}
```

- [ ] **Step 4: Add `getOffspring` high-level function**

```js
/**
 * Given two flowers on the grid, compute all possible offspring.
 * Returns array sorted by probability descending.
 * Groups by color (multiple genotypes can produce same color).
 */
export function getOffspring(speciesKey, parent1Genotype, parent2Genotype) {
  const raw = crossGenes(parent1Genotype, parent2Genotype);

  // Map each genotype to its color and group
  const byColor = {};
  for (const { genotype, probability } of raw) {
    const color = genotypeToColor(speciesKey, genotype);
    if (!byColor[color]) {
      byColor[color] = { color, probability: 0, genotypes: [] };
    }
    byColor[color].probability += probability;
    byColor[color].genotypes.push({ genotype, probability });
  }

  return Object.values(byColor)
    .map(c => ({ ...c, probability: Math.round(c.probability * 10000) / 10000 }))
    .sort((a, b) => b.probability - a.probability);
}
```

- [ ] **Step 5: Add utility functions**

```js
/**
 * Get the seed genotype for a store-bought flower.
 */
export function getSeedGenotype(speciesKey, color) {
  return SEED_GENOTYPES[speciesKey]?.[color] || null;
}

/**
 * Check if a flower at (row, col) is isolated (no adjacent same-species neighbor).
 * Returns true = flower WILL clone itself (no breeding partner available).
 * Returns false = flower has at least one breeding partner.
 */
export function canClone(grid, row, col) {
  const cell = grid[row]?.[col];
  if (!cell) return false;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const neighbor = grid[row + dr]?.[col + dc];
      if (neighbor && neighbor.species === cell.species) return false;
    }
  }
  return true; // isolated — will clone
}

/**
 * Find all breeding pairs for a specific cell (used by UI for panel display).
 * Note: The spec mentions a grid-wide `findBreedingPairs(grid)` in gardenSimulation.js —
 * that function is NOT needed because simulateDay() handles pair-finding internally.
 * This per-cell version lives in gardenGenetics.js because it calls getOffspring().
 * Returns array of { neighbor: {row, col}, offspring: [...] }
 */
export function findBreedingPairs(grid, row, col) {
  const cell = grid[row]?.[col];
  if (!cell) return [];

  const pairs = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      const neighbor = grid[nr]?.[nc];
      if (neighbor && neighbor.species === cell.species) {
        pairs.push({
          neighbor: { row: nr, col: nc },
          offspring: getOffspring(cell.species, cell.genotype, neighbor.genotype),
        });
      }
    }
  }
  return pairs;
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 7: Commit**

```bash
git add src/artifacts/gardenGenetics.js
git commit -m "feat(garden): add gardenGenetics.js Mendelian inheritance engine"
```

---

### Task 3: Create `gardenSimulation.js` — Simulation Engine

**Files:**
- Create: `src/artifacts/gardenSimulation.js`

- [ ] **Step 1: Create `gardenSimulation.js` with watering multiplier and utilities**

```js
// src/artifacts/gardenSimulation.js
import { crossGenes, genotypeToColor, canClone } from './gardenGenetics.js';

/**
 * Watering multiplier based on number of visitors who watered.
 * Matches actual ACNH game values.
 */
const WATERING_RATES = {
  0: 0.05,  // 5% base (self-watered)
  1: 0.10,  // 10%
  2: 0.20,  // 20%
  3: 0.30,  // 30%
  4: 0.50,  // 50%
  5: 0.80,  // 80%
};

export function getWateringRate(visitors) {
  return WATERING_RATES[Math.min(visitors, 5)] || 0.05;
}

/**
 * Find all empty cells adjacent to (row, col).
 */
export function findEmptyAdjacent(grid, row, col) {
  const empty = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length && !grid[nr][nc]) {
        empty.push({ row: nr, col: nc });
      }
    }
  }
  return empty;
}
```

- [ ] **Step 2: Add `simulateDay` function (Tier B)**

```js
/**
 * Simulate one breeding day across the entire grid.
 * Returns { newGrid, events } where events describe what happened.
 *
 * Algorithm:
 * 1. Find all occupied cells, shuffle order
 * 2. Each flower tries to pair with a random same-species adjacent neighbor
 * 3. Roll reproduction chance (base + watering)
 * 4. On success: cross genotypes, pick weighted random offspring, place in empty adjacent cell
 * 5. Isolated flowers: roll clone chance, place copy in empty adjacent cell
 */
export function simulateDay(grid, options = {}) {
  const { wateringVisitors = 0, badLuckCounters = {}, useBadLuck = false } = options;
  const baseRate = getWateringRate(wateringVisitors);
  const newGrid = grid.map(row => row.map(cell => cell ? { ...cell } : null));
  const events = [];
  const paired = new Set(); // track cells already paired this day

  // Collect all occupied cells and shuffle
  const occupied = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c]) occupied.push({ row: r, col: c });
    }
  }
  shuffle(occupied);

  for (const { row, col } of occupied) {
    const cellKey = `${row},${col}`;
    if (paired.has(cellKey)) continue;

    const cell = grid[row][col];
    if (!cell) continue;

    // Find same-species neighbors not yet paired
    const neighbors = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        const nKey = `${nr},${nc}`;
        if (!paired.has(nKey) && grid[nr]?.[nc]?.species === cell.species) {
          neighbors.push({ row: nr, col: nc });
        }
      }
    }

    if (neighbors.length > 0) {
      // Pick random partner
      const partner = neighbors[Math.floor(Math.random() * neighbors.length)];
      const partnerCell = grid[partner.row][partner.col];
      const pairKey = [cellKey, `${partner.row},${partner.col}`].sort().join('|');

      paired.add(cellKey);
      paired.add(`${partner.row},${partner.col}`);

      // Calculate reproduction chance
      let chance = baseRate;
      if (useBadLuck && badLuckCounters[pairKey]) {
        chance += badLuckCounters[pairKey] * 0.05;
      }
      chance = Math.min(chance, 1);

      if (Math.random() < chance) {
        // Breed! Cross genotypes and pick random offspring
        const offspringOptions = crossGenes(cell.genotype, partnerCell.genotype);
        const offspring = weightedRandom(offspringOptions);
        const color = genotypeToColor(cell.species, offspring.genotype);

        // Find empty cell to place offspring
        const emptyForParent1 = findEmptyAdjacent(newGrid, row, col);
        const emptyForParent2 = findEmptyAdjacent(newGrid, partner.row, partner.col);
        const allEmpty = [...emptyForParent1, ...emptyForParent2]
          .filter((v, i, a) => a.findIndex(e => e.row === v.row && e.col === v.col) === i);

        if (allEmpty.length > 0) {
          const spot = allEmpty[Math.floor(Math.random() * allEmpty.length)];
          newGrid[spot.row][spot.col] = {
            species: cell.species,
            color,
            genotype: offspring.genotype,
            source: 'bred',
            dayPlaced: options.day || 0,
            pending: true,
          };
          events.push({
            type: 'breed', row: spot.row, col: spot.col,
            parent1: { row, col }, parent2: partner, color,
          });
        }
      } else {
        events.push({ type: 'fail', parent1: { row, col }, parent2: partner });
      }
    } else if (canClone(grid, row, col)) {
      // Isolated flower — attempt clone
      paired.add(cellKey);
      const chance = useBadLuck && badLuckCounters[cellKey]
        ? baseRate + badLuckCounters[cellKey] * 0.05
        : baseRate;

      if (Math.random() < Math.min(chance, 1)) {
        const empty = findEmptyAdjacent(newGrid, row, col);
        if (empty.length > 0) {
          const spot = empty[Math.floor(Math.random() * empty.length)];
          newGrid[spot.row][spot.col] = {
            ...cell,
            source: 'cloned',
            dayPlaced: options.day || 0,
            pending: true,
          };
          events.push({ type: 'clone', row: spot.row, col: spot.col, source: { row, col } });
        }
      }
    }
  }

  return { newGrid, events };
}
```

**Note on spec deviation:** The spec defines a separate `simulateDayCampaign()` function for Tier C. The plan intentionally collapses this into `simulateDay()` with a `useBadLuck` option flag, plus a separate `updateBadLuckCounters()` helper. The reducer in Task 4 handles the campaign-specific state updates (day counter, watering log, history). This avoids duplicating the simulation loop while keeping campaign features available via options.

- [ ] **Step 3: Add `updateBadLuckCounters` for campaign mode (Tier C)**

```js
/**
 * Update bad luck counters based on simulation events.
 * Failed pairs increment. Successful pairs reset to 0.
 */
export function updateBadLuckCounters(counters, events) {
  const newCounters = { ...counters };

  for (const event of events) {
    if (event.type === 'breed') {
      const pairKey = [`${event.parent1.row},${event.parent1.col}`,
        `${event.parent2.row},${event.parent2.col}`].sort().join('|');
      newCounters[pairKey] = 0;
    } else if (event.type === 'fail') {
      const pairKey = [`${event.parent1.row},${event.parent1.col}`,
        `${event.parent2.row},${event.parent2.col}`].sort().join('|');
      newCounters[pairKey] = (newCounters[pairKey] || 0) + 1;
    }
  }

  return newCounters;
}
```

- [ ] **Step 4: Add helper functions**

```js
/** Fisher-Yates shuffle (in-place). */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Pick a random item from a weighted array of { genotype, probability }. */
function weightedRandom(items) {
  const total = items.reduce((sum, i) => sum + i.probability, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.probability;
    if (roll <= 0) return item;
  }
  return items[items.length - 1]; // fallback
}

/**
 * Create an empty grid of given size.
 */
export function createEmptyGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 6: Commit**

```bash
git add src/artifacts/gardenSimulation.js
git commit -m "feat(garden): add gardenSimulation.js with day sim and campaign mode"
```

---

## Chunk 2: UI — GardenPlanner.jsx

### Task 4: Create `GardenPlanner.jsx` — State & Reducer

**Files:**
- Replace: `src/artifacts/GardenPlanner.jsx` (delete existing 874 lines, write new)

- [ ] **Step 1: Write the state reducer and initial state**

Create the new `GardenPlanner.jsx` with imports, state management, and storage persistence. No UI rendering yet — just the state machine.

```jsx
// src/artifacts/GardenPlanner.jsx
import React, { useReducer, useEffect, useCallback, useRef } from 'react';
import { AssetImg } from '../assetHelper';
import { SPECIES, BREEDING_PATHS, COLOR_HEX } from './gardenData.js';
import { getSeedGenotype, findBreedingPairs, canClone, getOffspring } from './gardenGenetics.js';
import { simulateDay, updateBadLuckCounters, createEmptyGrid } from './gardenSimulation.js';

const STORAGE_KEY = 'garden-planner-v2';

function createInitialState() {
  return {
    grid: createEmptyGrid(9),
    gridSize: 9,
    selectedCell: null,
    selectedSpecies: 'rose',
    selectedColor: 'Red',
    tool: 'place',
    panelOpen: false,
    panelTab: 'breed',
    simulationTier: 'static',
    pendingGrid: null,
    simulationEvents: [],
    day: 0,
    wateringVisitors: 0,
    selfWatered: true,
    badLuckCounters: {},
    wateringLog: [],
    history: [],
    savedLayouts: [],
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    case 'SET_GRID_SIZE': {
      const size = Math.max(5, Math.min(20, action.size));
      return { ...state, gridSize: size, grid: createEmptyGrid(size), selectedCell: null,
        pendingGrid: null, day: 0, history: [], badLuckCounters: {} };
    }

    case 'PLACE_FLOWER': {
      const { row, col } = action;
      const genotype = getSeedGenotype(state.selectedSpecies, state.selectedColor);
      if (!genotype) return state;
      const newGrid = state.grid.map(r => [...r]);
      newGrid[row][col] = {
        species: state.selectedSpecies,
        color: state.selectedColor,
        genotype,
        source: 'seed',
        dayPlaced: state.day,
        pending: false,
      };
      return { ...state, grid: newGrid, selectedCell: { row, col } };
    }

    case 'ERASE_CELL': {
      const { row, col } = action;
      const newGrid = state.grid.map(r => [...r]);
      newGrid[row][col] = null;
      const selected = state.selectedCell?.row === row && state.selectedCell?.col === col
        ? null : state.selectedCell;
      return { ...state, grid: newGrid, selectedCell: selected };
    }

    case 'SELECT_CELL':
      return { ...state, selectedCell: action.cell };

    case 'SELECT_SPECIES': {
      const species = SPECIES[action.species];
      const firstSeedColor = species?.seedColors[0] || species?.colors[0]?.color || 'Red';
      return { ...state, selectedSpecies: action.species, selectedColor: firstSeedColor };
    }

    case 'SELECT_COLOR':
      return { ...state, selectedColor: action.color };

    case 'SET_TOOL':
      return { ...state, tool: action.tool };

    case 'TOGGLE_PANEL':
      return { ...state, panelOpen: !state.panelOpen };

    case 'SET_PANEL_TAB':
      return { ...state, panelTab: action.tab, panelOpen: true };

    case 'SET_SIMULATION_TIER':
      return { ...state, simulationTier: action.tier };

    case 'SET_WATERING':
      return { ...state, wateringVisitors: action.visitors };

    case 'SIMULATE_DAY': {
      const { newGrid, events } = simulateDay(state.grid, {
        wateringVisitors: state.wateringVisitors,
        badLuckCounters: state.badLuckCounters,
        useBadLuck: state.simulationTier === 'campaign',
        day: state.day + 1,
      });
      return {
        ...state,
        pendingGrid: newGrid,
        simulationEvents: events,
      };
    }

    case 'ACCEPT_DAY': {
      if (!state.pendingGrid) return state;
      const confirmed = state.pendingGrid.map(row =>
        row.map(cell => cell ? { ...cell, pending: false } : null)
      );
      const newCounters = state.simulationTier === 'campaign'
        ? updateBadLuckCounters(state.badLuckCounters, state.simulationEvents)
        : state.badLuckCounters;
      return {
        ...state,
        history: [...state.history.slice(-29), state.grid], // keep last 30
        grid: confirmed,
        pendingGrid: null,
        simulationEvents: [],
        day: state.day + 1,
        badLuckCounters: newCounters,
        wateringLog: state.simulationTier === 'campaign'
          ? [...state.wateringLog, { day: state.day + 1, visitors: state.wateringVisitors }]
          : state.wateringLog,
      };
    }

    case 'REJECT_DAY':
      return { ...state, pendingGrid: null, simulationEvents: [] };

    case 'REROLL_DAY': {
      // Re-run simulation with same settings (new random seed)
      const { newGrid, events } = simulateDay(state.grid, {
        wateringVisitors: state.wateringVisitors,
        badLuckCounters: state.badLuckCounters,
        useBadLuck: state.simulationTier === 'campaign',
        day: state.day + 1,
      });
      return { ...state, pendingGrid: newGrid, simulationEvents: events };
    }

    case 'UNDO': {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return {
        ...state,
        grid: prev,
        history: state.history.slice(0, -1),
        day: Math.max(0, state.day - 1),
        pendingGrid: null,
        simulationEvents: [],
      };
    }

    case 'CLEAR_GRID':
      return {
        ...state,
        grid: createEmptyGrid(state.gridSize),
        selectedCell: null,
        pendingGrid: null,
        simulationEvents: [],
        day: 0,
        history: [],
        badLuckCounters: {},
        wateringLog: [],
      };

    case 'SAVE_LAYOUT': {
      const entry = {
        name: action.name,
        gridSize: state.gridSize,
        grid: state.grid,
        day: state.day,
        simulationTier: state.simulationTier,
        created: Date.now(),
      };
      return { ...state, savedLayouts: [...state.savedLayouts, entry] };
    }

    case 'LOAD_LAYOUT': {
      const layout = state.savedLayouts[action.index];
      if (!layout) return state;
      return {
        ...state,
        grid: layout.grid,
        gridSize: layout.gridSize,
        day: layout.day || 0,
        simulationTier: layout.simulationTier || 'static',
        selectedCell: null,
        pendingGrid: null,
        history: [],
        badLuckCounters: {},
      };
    }

    case 'DELETE_LAYOUT':
      return {
        ...state,
        savedLayouts: state.savedLayouts.filter((_, i) => i !== action.index),
      };

    case 'APPLY_TEMPLATE': {
      const grid = createEmptyGrid(state.gridSize);
      applyTemplate(grid, action.template, state.gridSize);
      return { ...state, grid, selectedCell: null, pendingGrid: null, day: 0,
        history: [], badLuckCounters: {} };
    }

    default:
      return state;
  }
}
```

- [ ] **Step 2: Add template definitions**

```js
function applyTemplate(grid, template, size) {
  const mid = Math.floor(size / 2);
  switch (template) {
    case 'checkerboard':
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if ((r + c) % 2 === 0) {
            grid[r][c] = {
              species: 'rose', color: 'Red',
              genotype: getSeedGenotype('rose', 'Red'),
              source: 'seed', dayPlaced: 0, pending: false,
            };
          }
        }
      }
      break;
    case 'rows':
      for (let r = 0; r < size; r++) {
        const color = r % 2 === 0 ? 'Red' : 'Yellow';
        for (let c = 0; c < size; c++) {
          grid[r][c] = {
            species: 'rose', color,
            genotype: getSeedGenotype('rose', color),
            source: 'seed', dayPlaced: 0, pending: false,
          };
        }
      }
      break;
    case 'bluerose':
      // Blue rose breeding layout: Red and Yellow seeds in paired rows
      for (let r = 0; r < Math.min(size, 8); r++) {
        for (let c = 0; c < Math.min(size, 8); c++) {
          if (r % 2 === 0 && c % 2 === 0) {
            grid[r][c] = {
              species: 'rose', color: 'Red',
              genotype: getSeedGenotype('rose', 'Red'),
              source: 'seed', dayPlaced: 0, pending: false,
            };
          } else if (r % 2 === 0 && c % 2 === 1) {
            grid[r][c] = {
              species: 'rose', color: 'Yellow',
              genotype: getSeedGenotype('rose', 'Yellow'),
              source: 'seed', dayPlaced: 0, pending: false,
            };
          }
        }
      }
      break;
    case 'pairs':
      // Isolated pairs for controlled breeding
      for (let r = 0; r < size - 1; r += 3) {
        for (let c = 0; c < size - 1; c += 3) {
          grid[r][c] = {
            species: 'rose', color: 'Red',
            genotype: getSeedGenotype('rose', 'Red'),
            source: 'seed', dayPlaced: 0, pending: false,
          };
          grid[r][c + 1] = {
            species: 'rose', color: 'Yellow',
            genotype: getSeedGenotype('rose', 'Yellow'),
            source: 'seed', dayPlaced: 0, pending: false,
          };
        }
      }
      break;
  }
}
```

- [ ] **Step 3: Add storage persistence (load on mount, save on change)**

```jsx
// Inside the default export component:
const GardenPlanner = () => {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);
  const initialized = useRef(false);
  const isDragging = useRef(false); // Used by Task 8 for drag-to-paint

  // Load from storage on mount
  useEffect(() => {
    const load = async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result) {
          const saved = JSON.parse(result.value);
          dispatch({ type: 'LOAD_STATE', payload: saved });
        }
      } catch (e) {
        console.log('Garden planner storage load failed:', e);
      }
      initialized.current = true;
    };
    load();
  }, []);

  // Save to storage on state change (debounced)
  useEffect(() => {
    if (!initialized.current) return;
    const timeout = setTimeout(async () => {
      try {
        const toSave = {
          grid: state.grid,
          gridSize: state.gridSize,
          savedLayouts: state.savedLayouts,
          day: state.day,
          simulationTier: state.simulationTier,
          badLuckCounters: state.badLuckCounters,
          wateringLog: state.wateringLog,
        };
        await window.storage.set(STORAGE_KEY, JSON.stringify(toSave));
      } catch (e) {
        console.log('Garden planner storage save failed:', e);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [state.grid, state.gridSize, state.savedLayouts, state.day,
      state.simulationTier, state.badLuckCounters, state.wateringLog]);

  // ... rendering follows in next steps
};
```

- [ ] **Step 4: Verify build with a minimal render**

Add a temporary minimal render to verify the state machine works:

```jsx
  return (
    <div style={{ padding: 20, color: '#c8e6c0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`}</style>
      <h2>Garden Planner v2 — State loaded</h2>
      <p>Grid: {state.gridSize}x{state.gridSize}, Species: {state.selectedSpecies}, Day: {state.day}</p>
    </div>
  );
};

export default GardenPlanner;
```

Run: `npm run build`
Expected: Clean build. The portal sidebar's "Garden Planner" link should render the placeholder text.

- [ ] **Step 5: Commit**

```bash
git add src/artifacts/GardenPlanner.jsx
git commit -m "feat(garden): rewrite GardenPlanner.jsx with state reducer and storage"
```

---

### Task 5: Add Toolbar UI

**Files:**
- Modify: `src/artifacts/GardenPlanner.jsx`

- [ ] **Step 1: Replace the minimal render with the full layout structure**

Replace the temporary render with the real layout. The toolbar JSX structure:

```jsx
return (
  <div style={styles.root}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

    {/* Toolbar */}
    <div style={styles.toolbar}>
      {/* Species selector */}
      <div style={styles.speciesRow}>
        {Object.entries(SPECIES).map(([key, sp]) => (
          <button key={key} onClick={() => dispatch({ type: 'SELECT_SPECIES', species: key })}
            style={{ ...styles.speciesBtn, ...(state.selectedSpecies === key ? styles.speciesBtnActive : {}) }}>
            <span>{sp.emoji}</span>
            <span style={{ fontSize: 11 }}>{sp.name}</span>
          </button>
        ))}
      </div>
      {/* Color palette + tools row */}
      <div style={styles.paletteRow}>
        {SPECIES[state.selectedSpecies].colors.map(c => (
          <button key={c.color} onClick={() => dispatch({ type: 'SELECT_COLOR', color: c.color })}
            style={{ ...styles.colorDot, background: c.hex,
              boxShadow: state.selectedColor === c.color ? '0 0 0 2px #5ec850' : 'none' }}>
            {c.source === 'seed' && <span style={styles.seedBadge}>S</span>}
            {c.source === 'special' && <span style={styles.specialBadge}>★</span>}
          </button>
        ))}
        <div style={styles.separator} />
        {/* Tool buttons */}
        <button onClick={() => dispatch({ type: 'SET_TOOL', tool: 'place' })}
          style={{ ...styles.toolBtn, ...(state.tool === 'place' ? styles.toolBtnActive : {}) }}>🌱 Place</button>
        <button onClick={() => dispatch({ type: 'SET_TOOL', tool: 'erase' })}
          style={{ ...styles.toolBtn, ...(state.tool === 'erase' ? styles.toolBtnActive : {}) }}>🧹 Erase</button>
        <div style={styles.separator} />
        {/* Grid size slider */}
        <span style={{ fontSize: 11, color: '#5a7a50' }}>{state.gridSize}×{state.gridSize}</span>
        <input type="range" min={5} max={20} value={state.gridSize}
          onChange={e => dispatch({ type: 'SET_GRID_SIZE', size: Number(e.target.value) })} />
        <div style={styles.separator} />
        {/* Simulation tier pills */}
        {['static', 'dayByDay', 'campaign'].map(tier => (
          <button key={tier} onClick={() => dispatch({ type: 'SET_SIMULATION_TIER', tier })}
            style={{ ...styles.tierPill, ...(state.simulationTier === tier ? styles.tierPillActive : {}) }}>
            {tier === 'static' ? 'Static' : tier === 'dayByDay' ? 'Day Sim' : 'Campaign'}
          </button>
        ))}
      </div>
    </div>

    {/* Grid area + panel (Tasks 6-7 will fill these in) */}
    <div style={styles.gridContainer}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#5a7a50' }}>Grid renders here (Task 6)</p>
      </div>
    </div>
  </div>
);
```

Define `styles` object at bottom of file with all inline style objects: `root` (flex column, full height, `#0a1a10` bg), `toolbar` (flex column, gap 6, padding 12, border-bottom), `speciesRow` (flex, gap 4), `speciesBtn` (flex column, align center, bg transparent, border none, color `#5a7a50`, cursor pointer), `speciesBtnActive` (color `#5ec850`), `paletteRow` (flex, align center, gap 6, flex-wrap), `colorDot` (width 24, height 24, border-radius 50%, border none, cursor pointer, position relative), `seedBadge` / `specialBadge` (position absolute, font-size 8, top -4, right -4), `toolBtn` / `toolBtnActive`, `tierPill` / `tierPillActive`, `separator` (width 1, height 20, bg `rgba(94,200,80,0.15)`), `gridContainer` (flex 1, display flex, overflow hidden).

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 3: Verify toolbar interactivity**

Run: `npm run dev`, open in browser, navigate to Garden Planner. Verify:
1. All 8 species buttons render with emoji + name
2. Clicking a species updates the color palette (e.g., Pansy should NOT show Pink)
3. Clicking a color highlights it with green glow
4. Grid size slider changes the displayed size value
5. Simulation tier pills toggle between Static / Day Sim / Campaign

- [ ] **Step 4: Commit**

```bash
git add src/artifacts/GardenPlanner.jsx
git commit -m "feat(garden): add toolbar with species/color palette and controls"
```

---

### Task 6: Add Grid Rendering

**Files:**
- Modify: `src/artifacts/GardenPlanner.jsx`

- [ ] **Step 1: Implement the grid component**

Add the grid rendering section between the toolbar and bottom bar. The grid is a CSS grid of `gridSize × gridSize` cells. Each cell is a clickable div:

- Empty cell: dark green background (`#1a3a20`), lighter on hover
- Occupied cell: colored dot using `COLOR_HEX[cell.color]` or `cell.hex`
- Selected cell: green border glow (`box-shadow: 0 0 0 2px #5ec850`)
- Pending cell (from simulation): `opacity: 0.5`
- Clone risk (campaign mode, isolated): small "C" text overlay

Event handlers:
- `onClick`: if tool is 'place' and cell is empty → dispatch PLACE_FLOWER. If cell is occupied → dispatch SELECT_CELL.
- `onContextMenu`: prevent default, dispatch ERASE_CELL
- `onDoubleClick`: dispatch SELECT_CELL + TOGGLE_PANEL (open)

The display grid should use `state.pendingGrid || state.grid` so pending simulation results are visible.

- [ ] **Step 2: Verify grid renders and interactions work**

Run: `npm run dev`
Test: Click species, click color, click grid cell → flower dot appears. Right-click → erases. Click existing flower → selects (green glow). Grid size slider changes grid.

- [ ] **Step 3: Commit**

```bash
git add src/artifacts/GardenPlanner.jsx
git commit -m "feat(garden): add interactive grid with place/erase/select"
```

---

### Task 7: Add Bottom Bar & Sliding Panel

**Files:**
- Modify: `src/artifacts/GardenPlanner.jsx`

- [ ] **Step 1: Implement the bottom bar**

When `state.selectedCell` is set and the cell is occupied, show the bottom bar:
- `<AssetImg category="other" name="{color}-{species} plant" size={32} />`
- Flower name: "{Color} {Species}" (e.g., "Red Rose")
- Source badge: "Seed" / "Bred" / "Cloned" with appropriate color
- Genotype in monospace: `state.grid[row][col].genotype`
- Quick breeding summary: call `findBreedingPairs(grid, row, col)`, show count and best offspring
- "Panel ▶" / "◀ Panel" toggle button

- [ ] **Step 2: Implement the sliding panel**

The panel uses **flex layout** (not absolute positioning) to avoid z-index/overflow issues with the grid. The grid container is `display: flex`, the grid takes `flex: 1`, and the panel is a sibling div with `width: 280px` when open, `width: 0; overflow: hidden` when closed, with `transition: width 0.3s ease`. This way the grid naturally shrinks when the panel opens.

**Breed tab:**
- Selected cell info (sprite, name, genotype, source)
- Clone risk warning if `canClone(grid, row, col)` is true
- For each breeding pair from `findBreedingPairs()`:
  - Parent display: two sprites with "×" between
  - Offspring list: colored chips with probability percentages
  - Each offspring chip: `<AssetImg>` at 20px + color name + probability

**Sim tab:**
- Visible only when `simulationTier !== 'static'`
- "Simulate Day" button (green accent, calls `dispatch({ type: 'SIMULATE_DAY' })`)
- Watering visitors: 6 small buttons (0-5), selected one highlighted
- If `simulationTier === 'campaign'`: day counter, bad luck info
- When `pendingGrid` exists: "Accept Day" / "Reroll" / "Undo" buttons
- Events log: list of `simulationEvents` (breed/clone/fail)

**Save tab:**
- Text input for layout name + "Save" button
- List of `savedLayouts`: name, grid size, date
- Load / Delete buttons per entry

- [ ] **Step 3: Add keyboard handler for Escape to close panel**

```jsx
useEffect(() => {
  const handleKey = (e) => {
    if (e.key === 'Escape' && state.panelOpen) {
      dispatch({ type: 'TOGGLE_PANEL' });
    }
  };
  window.addEventListener('keydown', handleKey);
  return () => window.removeEventListener('keydown', handleKey);
}, [state.panelOpen]);
```

- [ ] **Step 4: Verify full UI flow**

Run: `npm run dev`
Test the complete flow:
1. Place roses on grid → bottom bar shows info
2. Double-click → panel opens with breeding pairs
3. Switch to Sim tab → simulate day → ghosted flowers appear → accept/reject
4. Switch to Campaign mode → day counter increments → bad luck visible
5. Save tab → save layout → load it back
6. Templates → apply checkerboard → grid fills
7. Escape closes panel

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: Clean build, no errors or warnings.

- [ ] **Step 6: Commit**

```bash
git add src/artifacts/GardenPlanner.jsx
git commit -m "feat(garden): add bottom bar, sliding panel with breed/sim/save tabs"
```

---

## Chunk 3: Polish, Verification & Deploy

### Task 8: Visual Polish & Edge Cases

**Files:**
- Modify: `src/artifacts/GardenPlanner.jsx`

- [ ] **Step 1: Add breeding pair highlights on grid**

When a cell is selected, highlight its same-species neighbors with a subtle colored border (e.g., `rgba(94,200,80,0.3)` glow). Highlight empty cells adjacent to breeding pairs with a faint dotted border to show where offspring could land.

- [ ] **Step 2: Add drag-to-paint**

Track `mouseDown` state. On `onMouseEnter` while mouse is down, place flower in cell (if tool is 'place') or erase (if tool is 'erase'). This allows painting multiple cells in one drag.

- [ ] **Step 3: Handle Gold Rose special case**

In the breed tab, if the selected cell is a Black Rose and `simulationTier !== 'static'`, show a special note: "Water with Golden Watering Can for chance at Gold Rose." Gold Rose cannot be produced through normal Mendelian crossover — it's a special game mechanic.

- [ ] **Step 4: Ensure all 3 accent colors are used**

Verify green (`#5ec850`), gold (`#d4b030`), and blue (`#4aacf0`) all appear:
- Green: active states, breed success, buttons
- Gold: seed badges, special flower indicators, campaign day counter
- Blue: genotype text, simulation tier pills, link-style buttons

- [ ] **Step 5: Commit**

```bash
git add src/artifacts/GardenPlanner.jsx
git commit -m "feat(garden): add breeding highlights, drag paint, gold rose, polish"
```

---

### Task 9: Build Verification & Version Bump

**Files:**
- Modify: `package.json` (version bump)

- [ ] **Step 1: Run production build**

Run: `npm run build`
Expected: Clean build with no errors or warnings.

Verify all modules are bundled:
Run: `ls dist/assets/*.js | wc -l`
Expected: Multiple JS chunks (the 3 garden modules get bundled into the GardenPlanner chunk via code splitting).

- [ ] **Step 2: Run dev server and test all features (human-gated)**

**This step requires manual browser testing.** Run: `npm run dev`
Manual test checklist (a human or browser automation agent must verify):
- All 8 species selectable with correct color palettes
- No Pink Pansy, no Yellow Windflower visible in palette
- Blue Hyacinth and Orange Windflower show as seed colors
- Grid place/erase/select works
- Bottom bar shows correct info with AssetImg sprites
- Panel breed tab shows correct offspring probabilities
- Panel sim tab: simulate day produces ghosted flowers
- Accept/reject/undo work
- Campaign mode: day counter, bad luck counters visible
- Save/load/delete layouts work
- All 4 templates work
- Grid size slider 5-20 works
- Escape closes panel
- Storage persists across page reload

- [ ] **Step 3: Bump version**

First verify current version:
Run: `node -e "console.log(require('./package.json').version)"`
Expected: `1.1.1`

Bump `package.json` version to `1.2.0` (minor: new feature — complete Garden Planner rebuild).

- [ ] **Step 4: Final commit**

```bash
git add src/artifacts/gardenData.js src/artifacts/gardenGenetics.js src/artifacts/gardenSimulation.js src/artifacts/GardenPlanner.jsx package.json
git commit -m "feat(garden): complete Garden Planner rebuild v1.2.0 (Issue #26)

Modular architecture: gardenData.js, gardenGenetics.js, gardenSimulation.js,
GardenPlanner.jsx. Genotype-aware Mendelian breeding for all 8 species,
three simulation tiers (static/day-sim/campaign), hybrid sliding panel UI."
```

---

### Task 10: Deploy

- [ ] **Step 1: Push to main**

```bash
git push origin main
```

Vercel auto-deploys from main. Wait for deployment to complete.

- [ ] **Step 2: Verify deployment (human-gated)**

Check https://acnh-portal.vercel.app — navigate to Garden Planner. A human or browser automation agent must verify:
- Tool loads without errors (check browser console for errors)
- Sprites appear (AssetImg working)
- Sidebar footer shows v1.2.0
- Place a flower, open panel, run a simulation day
