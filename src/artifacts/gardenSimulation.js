// gardenSimulation.js — Day Simulation Engine for ACNH Garden Planner
// Pure JS module, no React, no side effects.

import { crossGenes, genotypeToColor, canClone } from './gardenGenetics.js';

// ─── WATERING RATES ──────────────────────────────────────────────────────────

/**
 * getWateringRate(visitors) → number
 * Returns the base reproduction chance based on number of visiting players.
 * Matches ACNH game values.
 */
export function getWateringRate(visitors) {
  const rates = { 0: 0.05, 1: 0.10, 2: 0.20, 3: 0.30, 4: 0.50, 5: 0.80 };
  const clamped = Math.max(0, Math.min(5, Math.floor(visitors)));
  return rates[clamped] ?? 0.05;
}

// ─── GRID HELPERS ────────────────────────────────────────────────────────────

/**
 * createEmptyGrid(size) → 2D array
 * Returns a size×size array filled with null.
 */
export function createEmptyGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

/**
 * findEmptyAdjacent(grid, row, col) → [{row, col}]
 * Find all empty (null) cells in the 8 directions adjacent to (row, col).
 * Bounds-checked against grid dimensions.
 */
export function findEmptyAdjacent(grid, row, col) {
  const offsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [0,  -1],          [0,  1],
    [1,  -1], [1,  0], [1,  1],
  ];

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const empty = [];

  for (const [dr, dc] of offsets) {
    const r = row + dr;
    const c = col + dc;
    if (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] === null) {
      empty.push({ row: r, col: c });
    }
  }

  return empty;
}

// ─── INTERNAL HELPERS ────────────────────────────────────────────────────────

/**
 * shuffle(arr) — Fisher-Yates in-place shuffle.
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * weightedRandom(items) — Pick one item from [{genotype, probability}] weighted by probability.
 * Returns null if items is empty.
 */
function weightedRandom(items) {
  if (!items || items.length === 0) return null;

  const total = items.reduce((sum, item) => sum + item.probability, 0);
  let rand = Math.random() * total;

  for (const item of items) {
    rand -= item.probability;
    if (rand <= 0) return item;
  }

  // Fallback to last item (handles floating-point edge cases)
  return items[items.length - 1];
}

/**
 * makePairKey(r1, c1, r2, c2) — Sorted pair key for consistent bad luck tracking.
 */
function makePairKey(r1, c1, r2, c2) {
  const a = `${r1},${c1}`;
  const b = `${r2},${c2}`;
  return [a, b].sort().join('|');
}

// ─── SIMULATE DAY ─────────────────────────────────────────────────────────────

/**
 * simulateDay(grid, options) → { newGrid, events }
 *
 * Options: { wateringVisitors, badLuckCounters, useBadLuck, day }
 *
 * Core algorithm:
 * 1. Collect all occupied cells, shuffle randomly (Fisher-Yates)
 * 2. Each flower tries to pair with a random same-species adjacent neighbor
 *    (not already paired this day)
 * 3. Roll reproduction chance: baseRate + (if useBadLuck) counter * 0.05, capped at 1.0
 * 4. On success: crossGenes(), weightedRandom() to pick offspring, place with pending: true
 * 5. Isolated flowers roll clone chance with same rate
 * 6. Return newGrid (deep copy) and events array
 */
export function simulateDay(grid, options = {}) {
  const {
    wateringVisitors = 0,
    badLuckCounters = {},
    useBadLuck = false,
    day = 1,
  } = options;

  // Deep copy grid
  const newGrid = grid.map(row => row.map(cell => (cell ? { ...cell } : null)));

  const events = [];
  const baseRate = getWateringRate(wateringVisitors);

  // Collect all occupied cells
  const occupied = [];
  for (let r = 0; r < newGrid.length; r++) {
    for (let c = 0; c < (newGrid[r]?.length ?? 0); c++) {
      if (newGrid[r][c] !== null) {
        occupied.push({ row: r, col: c });
      }
    }
  }

  // Shuffle for random pairing order
  shuffle(occupied);

  // Track which cells have already been paired this day
  const pairedThisDay = new Set();

  for (const { row, col } of occupied) {
    const cell = newGrid[row][col];
    if (!cell) continue; // cell may have been filled this iteration

    const cellKey = `${row},${col}`;

    // Find same-species neighbors that haven't been paired yet
    const neighborOffsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [0,  -1],          [0,  1],
      [1,  -1], [1,  0], [1,  1],
    ];

    const eligibleNeighbors = [];
    for (const [dr, dc] of neighborOffsets) {
      const nr = row + dr;
      const nc = col + dc;
      const neighbor = newGrid[nr]?.[nc];
      const neighborKey = `${nr},${nc}`;

      if (
        neighbor &&
        neighbor.species === cell.species &&
        !pairedThisDay.has(neighborKey)
      ) {
        eligibleNeighbors.push({ row: nr, col: nc });
      }
    }

    if (pairedThisDay.has(cellKey)) continue;

    if (eligibleNeighbors.length > 0) {
      // Pick a random eligible neighbor
      const partner = eligibleNeighbors[Math.floor(Math.random() * eligibleNeighbors.length)];
      const partnerCell = newGrid[partner.row][partner.col];
      const pairKey = makePairKey(row, col, partner.row, partner.col);

      // Compute reproduction chance
      let chance = baseRate;
      if (useBadLuck && badLuckCounters[pairKey] != null) {
        chance = Math.min(1.0, baseRate + badLuckCounters[pairKey] * 0.05);
      }

      // Mark both as paired
      pairedThisDay.add(cellKey);
      pairedThisDay.add(`${partner.row},${partner.col}`);

      if (Math.random() < chance) {
        // Attempt to find an empty adjacent cell for the offspring
        const emptyNearParent1 = findEmptyAdjacent(newGrid, row, col);
        const emptyNearParent2 = findEmptyAdjacent(newGrid, partner.row, partner.col);
        const allEmpty = [...emptyNearParent1, ...emptyNearParent2];

        // Deduplicate empty cells
        const seen = new Set();
        const uniqueEmpty = allEmpty.filter(({ row: er, col: ec }) => {
          const k = `${er},${ec}`;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });

        if (uniqueEmpty.length > 0 && cell.genotype && partnerCell.genotype) {
          const offspringPool = crossGenes(cell.genotype, partnerCell.genotype);
          const chosen = weightedRandom(offspringPool);

          if (chosen) {
            const targetCell = uniqueEmpty[Math.floor(Math.random() * uniqueEmpty.length)];
            const offspringColor = genotypeToColor(cell.species, chosen.genotype);

            newGrid[targetCell.row][targetCell.col] = {
              species: cell.species,
              color: offspringColor,
              genotype: chosen.genotype,
              source: 'bred',
              dayPlaced: day,
              pending: true,
            };

            events.push({
              type: 'breed',
              row: targetCell.row,
              col: targetCell.col,
              parent1: { row, col },
              parent2: { row: partner.row, col: partner.col },
              color: offspringColor,
              genotype: chosen.genotype,
              pairKey,
            });
          }
        } else {
          // No empty cell available — treat as fail for bad luck tracking
          events.push({
            type: 'fail',
            row,
            col,
            parent1: { row, col },
            parent2: { row: partner.row, col: partner.col },
            pairKey,
          });
        }
      } else {
        // Reproduction roll failed
        events.push({
          type: 'fail',
          row,
          col,
          parent1: { row, col },
          parent2: { row: partner.row, col: partner.col },
          pairKey,
        });
      }
    } else {
      // Isolated flower — try to clone
      const isIsolated = canClone(newGrid, row, col);
      if (isIsolated) {
        const pairKey = makePairKey(row, col, row, col);

        let chance = baseRate;
        if (useBadLuck && badLuckCounters[pairKey] != null) {
          chance = Math.min(1.0, baseRate + badLuckCounters[pairKey] * 0.05);
        }

        if (Math.random() < chance) {
          const emptyAdjacent = findEmptyAdjacent(newGrid, row, col);

          if (emptyAdjacent.length > 0) {
            const targetCell = emptyAdjacent[Math.floor(Math.random() * emptyAdjacent.length)];

            newGrid[targetCell.row][targetCell.col] = {
              species: cell.species,
              color: cell.color,
              genotype: cell.genotype,
              source: 'cloned',
              dayPlaced: day,
              pending: true,
            };

            events.push({
              type: 'clone',
              row: targetCell.row,
              col: targetCell.col,
              parent1: { row, col },
              color: cell.color,
              genotype: cell.genotype,
              pairKey,
            });
          } else {
            events.push({
              type: 'fail',
              row,
              col,
              parent1: { row, col },
              pairKey,
            });
          }
        } else {
          events.push({
            type: 'fail',
            row,
            col,
            parent1: { row, col },
            pairKey,
          });
        }
      }
    }
  }

  return { newGrid, events };
}

// ─── BAD LUCK COUNTERS ───────────────────────────────────────────────────────

/**
 * updateBadLuckCounters(counters, events) → newCounters
 *
 * For 'breed' events: reset pair counter to 0
 * For 'fail' events: increment pair counter by 1
 * Pair key format: sorted "row1,col1|row2,col2"
 */
export function updateBadLuckCounters(counters, events) {
  const newCounters = { ...counters };

  for (const event of events) {
    if (!event.pairKey) continue;

    if (event.type === 'breed' || event.type === 'clone') {
      newCounters[event.pairKey] = 0;
    } else if (event.type === 'fail') {
      newCounters[event.pairKey] = (newCounters[event.pairKey] ?? 0) + 1;
    }
  }

  return newCounters;
}
