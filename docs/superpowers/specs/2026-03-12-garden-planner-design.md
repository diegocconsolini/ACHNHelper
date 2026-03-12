# Garden Planner Rebuild — Design Spec

**Issue:** #26
**Date:** 2026-03-12
**Status:** Approved

---

## Overview

Rebuild the Garden Planner from a basic color-grid editor into a genotype-aware breeding simulator with real ACNH flower mechanics for all 8 species. The planner offers three progressive tiers of simulation: static analysis, day-by-day breeding, and full campaign mode with watering/bad luck tracking.

## Architecture: Modular Split (4 Files)

| File | Responsibility | ~Lines | Dependencies |
|------|---------------|--------|-------------|
| `GardenPlanner.jsx` | Entry point, layout, state, UI rendering | ~450 | imports all below + `../assetHelper` |
| `gardenData.js` | Species, colors, genotypes, breeding paths | ~350 | none (pure data) |
| `gardenGenetics.js` | Mendelian crossover, genotype→color, offspring calc | ~250 | imports `gardenData` |
| `gardenSimulation.js` | Day sim engine, watering, bad luck, cloning, history | ~200 | imports `gardenGenetics` |

All files live in `src/artifacts/`. `GardenPlanner.jsx` is the only file with React code and the only default export. The other three are pure JavaScript modules.

---

## Module 1: `gardenData.js` — Flower Species Database

### Species Data Structure

All 8 species with complete color/genotype mappings, sourced from FlowerCalculator's verified data (originally from `ACNH-Helper-Suite/data/flowers.js`):

```js
export const SPECIES = {
  rose: {
    name: 'Rose',
    geneCount: 4,  // R-Y-W-S (only species with 4 genes)
    colors: [
      { color: 'Red', genes: 'RR-yy-WW-ss', source: 'seed', hasAsset: true },
      { color: 'White', genes: 'rr-yy-WW-ss', source: 'seed', hasAsset: true },
      { color: 'Yellow', genes: 'rr-YY-WW-ss', source: 'seed', hasAsset: true },
      { color: 'Pink', genes: 'RR-yy-WW-Ss', source: 'hybrid', hasAsset: true },
      // ... all colors with verified genotypes
    ],
  },
  tulip: { name: 'Tulip', geneCount: 3, colors: [...] },
  // ... all 8 species
};
```

### Key Data Points

- **Rose**: 4-gene system (R-Y-W-S), 9 colors including Blue and Gold
- **Tulip, Pansy, Cosmos, Lily, Hyacinth, Windflower, Mum**: 3-gene system (R-Y-W)
- **Special cases**:
  - No Pink Pansy (does not exist in game)
  - No Yellow Windflower (does not exist in game)
  - Blue Hyacinth is a seed color, not hybrid
  - Orange Windflower is a seed color, not hybrid
  - Gold Rose requires golden watering can on black roses (special mechanic, not standard breeding)
  - Green Rose has no asset (`hasAsset: false`)

### Breeding Paths

Static breeding path data for the static analysis tier — parent color pairs mapped to offspring with probabilities:

```js
export const BREEDING_PATHS = {
  rose: [
    { parents: ['Red', 'Yellow'], offspring: [
      { color: 'Orange', probability: 0.5 },
      { color: 'Red', probability: 0.25 },
      { color: 'Yellow', probability: 0.25 },
    ]},
    // ... all verified pairs for all 8 species
  ],
};
```

### Seed Genotypes

Lookup table for store-bought flower genotypes:

```js
export const SEED_GENOTYPES = {
  rose: { Red: 'RR-yy-WW-ss', White: 'rr-yy-WW-ss', Yellow: 'rr-YY-WW-ss' },
  tulip: { Red: 'RR-yy-ww', White: 'rr-yy-WW', Yellow: 'rr-YY-ww' },
  // ... all 8 species
};
```

### Color Hex Map

Maps flower colors to CSS hex values for grid dot rendering:

```js
export const COLOR_HEX = {
  Red: '#e74c3c', White: '#ffffff', Yellow: '#f1c40f',
  Pink: '#e91e9f', Orange: '#e67e22', Purple: '#9b59b6',
  Black: '#222222', Blue: '#3498db', Gold: '#ffd700', Green: '#27ae60',
};
```

---

## Module 2: `gardenGenetics.js` — Mendelian Inheritance Engine

Pure functions, no React, no side effects. All functions are exported individually.

### Core Functions

#### `crossGenes(parent1Genes, parent2Genes) → [{ genotype, probability }]`

Takes two genotype strings (e.g., `"RR-yy-Ww-ss"` and `"Rr-Yy-WW-Ss"`), performs Mendelian crossover per gene pair independently.

For each gene pair (e.g., `Rr × Rr`):
- RR × RR → 100% RR
- RR × Rr → 50% RR, 50% Rr
- Rr × Rr → 25% RR, 50% Rr, 25% rr
- etc.

Returns the Cartesian product of all gene pairs with combined probabilities. For 4-gene roses this produces up to 81 unique offspring genotypes (3^4); for 3-gene species up to 27 (3^3). Genotypes with identical phenotypes (colors) are merged and probabilities summed.

#### `genotypeToColor(species, genotype) → string`

Looks up what color a genotype produces for a given species. Uses the SPECIES data from gardenData.js. This is a direct lookup — every valid genotype maps to exactly one color.

#### `getOffspring(species, parent1, parent2) → [{ color, genotype, probability }]`

High-level function: given two flower objects (with species and genotype), computes all possible offspring with probabilities. Calls `crossGenes()` then `genotypeToColor()` for each result. Groups by color and sums probabilities for display.

#### `getSeedGenotype(species, color) → string`

Returns the known genotype for a seed/store-bought flower. Used when placing flowers from the palette.

#### `canClone(grid, row, col) → boolean`

Returns true if the flower at (row, col) has no adjacent (8-directional) flower of the same species. Such flowers will clone themselves instead of breeding.

---

## Module 3: `gardenSimulation.js` — Simulation Engine

### Three Tiers

#### Tier A: Static Analysis (always active, no function here — handled in UI)

The UI calls `gardenGenetics.getOffspring()` directly when a cell is selected. No simulation state needed.

#### Tier B: Day-by-Day Simulation

```js
export function simulateDay(grid, options) → { newGrid, events }
```

**Algorithm:**
1. Scan all occupied cells, find breeding pairs (each flower can pair with one adjacent same-species flower, picked randomly)
2. For each pair, roll reproduction chance:
   - Base: 5%
   - With watering: scaled by `options.wateringVisitors` (0→5%, 1→10%, 2→20%, 3→30%, 4→50%, 5→80%)
3. If roll succeeds, call `crossGenes()` for the pair, randomly select one offspring genotype weighted by probability
4. Place offspring in a random empty adjacent cell (if available)
5. Flowers with no same-species neighbor: roll clone chance (same rate), place copy in adjacent empty cell
6. Return new grid state and an `events` array describing what happened (`{ type: 'breed'|'clone'|'fail', row, col, ... }`)

**Options:**
```js
{
  wateringVisitors: 0-5,      // how many visitors watered
  badLuckCounters: {},         // per-pair counters (campaign mode only)
  useBadLuck: false,           // whether to apply bad luck bonus
}
```

#### Tier C: Campaign Mode

Extends Tier B with persistent tracking:

```js
export function simulateDayCampaign(grid, campaignState) → { newGrid, events, newCampaignState }
```

**Additional campaign state:**
- `day`: incremented each simulation
- `badLuckCounters`: `{ "row1,col1-row2,col2": count }` — +5% cumulative per failed breeding attempt per pair, resets on success
- `wateringLog`: `[{ day, visitors, selfWatered }]` — history of watering actions
- `history`: array of previous grid states for undo (capped at 30 entries)

**Bad luck mechanic:** Each breeding pair that fails to reproduce gains +5% chance on next attempt. A pair at 3 failed days has 5% base + 15% bad luck = 20% reproduction chance. Watering bonus is multiplicative on top of this (e.g., 20% × watering multiplier). Resets to 0 on successful breed. Matches actual game mechanic.

**Breeding paths (Tier A) vs genotype crossover (Tier B/C):** The `BREEDING_PATHS` data is used only for Tier A static analysis — it maps parent colors to offspring colors with precomputed probabilities. Tier B and C ignore `BREEDING_PATHS` entirely and use `crossGenes()` for real Mendelian crossover based on actual genotypes.

### Utility Functions

```js
export function findBreedingPairs(grid) → [{ flower1: {row,col}, flower2: {row,col} }]
export function findEmptyAdjacent(grid, row, col) → [{row,col}]
export function getWateringMultiplier(visitors) → number
```

---

## Module 4: `GardenPlanner.jsx` — UI & Layout

### Layout: Hybrid B+C (Toolbar + Grid + Sliding Panel)

#### Top Toolbar (always visible)
- **Species selector**: 8 buttons — selected species highlighted with green accent
- **Color palette**: Colored dots for the selected species
  - Seed colors: small "S" badge
  - Special colors (Gold Rose): star badge
  - Colors that don't exist for selected species: not shown
- **Tool buttons**: Eraser toggle, Templates dropdown, Grid Size slider (5-20)
- **Simulation tier pills**: `Static` | `Day Sim` | `Campaign` — three toggleable pills

#### Grid Area (center, fills remaining space)
- **Cell rendering**: ~20px colored dots on `#1a3a20` dark green background
- **Selected cell**: green border glow (`#5ec850`)
- **Breeding partners**: when a cell is selected, its valid same-species neighbors get a subtle highlight
- **Empty offspring slots**: faint dotted border on empty cells adjacent to breeding pairs
- **Ghosted flowers**: semi-transparent colored dots for pending simulation results (not yet confirmed)
- **Clone risk badge**: small "C" overlay on isolated flowers (campaign mode)
- **Interactions**:
  - Click empty cell → place selected species+color (assigned seed genotype)
  - Click occupied cell → select it, update bottom bar
  - Double-click occupied cell → select + open panel
  - Right-click → erase cell
  - Drag → paint multiple cells with selected flower

#### Bottom Bar (visible when a cell is selected)
- Flower name + color + source (seed/hybrid)
- `<AssetImg>` sprite at 32px
- Genotype in monospace (`RR-yy-Ww-ss`)
- Quick breeding summary: "2 pairs — best: 50% Orange"
- **"Panel ▶"** button on far right

#### Sliding Panel (~280px, slides from right)
Opened by: double-click cell, "Panel ▶" button, or keyboard shortcut
Closed by: "◀ Close" button, Escape key

**Breed Tab** (default):
- Selected flower details with `<AssetImg>` at 24px
- Genotype display
- Source badge (Seed / Hybrid / Special)
- List of adjacent breeding pairs, each showing:
  - Both parent flowers with sprites
  - Offspring list: color chips with probability percentages
  - `<AssetImg>` sprites at 20px for each offspring color
- Clone risk warning if flower is isolated

**Sim Tab** (active in Day Sim and Campaign tiers):
- "Simulate Day" button (green accent)
- Watering visitors selector: 0-5 toggle buttons
- Self-watered checkbox
- Day counter (campaign mode)
- Bad luck counters per pair (campaign mode, collapsible)
- Pending results: "Accept Day" / "Reroll" / "Undo" buttons
- Simulation events log: "Day 14: Red+Yellow → Orange at (3,4)"

**Save Tab**:
- Named layout slots (text input + "Save" button)
- List of saved layouts: name, grid size, flower count, date
- Load / Delete buttons per save
- Current layout auto-saved on changes

### State Management

All state in a single `useReducer`:

```js
const initialState = {
  // Grid
  grid: createEmptyGrid(9),
  gridSize: 9,
  selectedCell: null,  // { row, col }

  // Palette
  selectedSpecies: 'rose',
  selectedColor: 'Red',
  tool: 'place',  // 'place' | 'erase'

  // UI
  panelOpen: false,
  panelTab: 'breed',  // 'breed' | 'sim' | 'save'

  // Simulation
  simulationTier: 'static',  // 'static' | 'dayByDay' | 'campaign'
  pendingGrid: null,  // grid state after sim, before confirm
  simulationEvents: [],

  // Campaign
  day: 0,
  wateringVisitors: 0,
  selfWatered: true,
  badLuckCounters: {},
  wateringLog: [],
  history: [],

  // Saves
  savedLayouts: [],
};
```

### Grid Cell Data Shape

```js
// null = empty cell
// or:
{
  species: 'rose',
  color: 'Red',
  genotype: 'RR-yy-WW-ss',
  source: 'seed',       // 'seed' | 'bred' | 'cloned'
  dayPlaced: 0,         // which simulation day it appeared
  pending: false,        // true if from unconfirmed simulation
}
```

### Templates

Preset grid configurations (carried over from current GardenPlanner, updated with genotype data):

- **Checkerboard**: Alternating flowers for maximum breeding pair coverage
- **Row Pairs**: Alternating rows of two colors
- **Blue Rose Farm**: 4-step breeding layout using verified blue rose path
- **Hybrid Island**: Isolated pairs for controlled breeding

Templates place flowers with correct seed genotypes.

---

## Storage

**Key:** `garden-planner-v2` (new key, no migration from v1)

```js
{
  savedLayouts: [
    {
      name: "Blue Rose Farm",
      gridSize: 9,
      grid: [[null, { species, color, genotype, source, dayPlaced }, ...], ...],
      day: 0,
      simulationTier: "static",
      created: 1710288000000,
    }
  ],
  currentLayout: { /* same shape as savedLayouts entry + campaign state */ },
  preferences: {
    defaultSpecies: 'rose',
    panelOpen: false,
    simulationTier: 'static',
  }
}
```

---

## Asset Integration

- **Grid cells**: Colored CSS dots (~20px). No sprites on grid (density priority).
- **Bottom bar**: `<AssetImg category="other" name="{color}-{species} plant" size={32} />` for selected flower.
- **Panel breed tab**: `<AssetImg>` at 24px for parent flowers and offspring.
- **Palette toolbar**: `<AssetImg>` at 20px next to color dots for the selected species.
- **Fallback**: If `hasAsset: false` (e.g., Green Rose), show colored dot only.

---

## Data Verification Checklist

- [ ] All 8 species color/genotype data matches FlowerCalculator.jsx exactly
- [ ] No fabricated flower colors or genotypes
- [ ] Seed genotypes match verified data from flowers.js
- [ ] Breeding paths match FlowerCalculator's breedingPaths arrays
- [ ] Special cases handled: no Pink Pansy, no Yellow Windflower, Blue Hyacinth is seed, Gold Rose special mechanic
- [ ] Asset names follow `{color}-{species} plant` pattern and exist in manifest.json
- [ ] Mendelian crossover produces correct probability distributions
- [ ] Watering multipliers match game values (5 visitors = 80%)
- [ ] Bad luck counter increments +5% per failed day per pair

---

## What Gets Deleted

The entire current `GardenPlanner.jsx` (874 lines) is replaced. No code is preserved — the architecture is fundamentally different (genotype-aware vs color-only, modular vs monolith, simulation engine vs static display).

---

## Out of Scope

- Sharing layouts between users (no backend)
- Importing/exporting as image
- Mobile-specific layout optimizations
- Integration with FlowerCalculator (they remain independent artifacts)
- Flower watering animation or visual effects beyond ghosted pending flowers
