// gardenGenetics.js — Mendelian Inheritance Engine for ACNH Garden Planner
// Pure JS module, no React, no side effects.

import { SPECIES, SEED_GENOTYPES } from './gardenData.js';

// ─── PARSE / SERIALIZE ────────────────────────────────────────────────────────

/**
 * parseGenotype("RR-yy-Ww-ss") → [['R','R'], ['y','y'], ['W','w'], ['s','s']]
 */
export function parseGenotype(genotypeStr) {
  return genotypeStr.split('-').map(pair => [pair[0], pair[1]]);
}

/**
 * serializeGenotype([['R','R'], ['y','y'], ['W','w'], ['s','s']]) → "RR-yy-Ww-ss"
 * Normalizes each pair so the uppercase (dominant) allele comes first.
 */
export function serializeGenotype(genePairs) {
  return genePairs
    .map(([a, b]) => {
      // Dominant allele is uppercase; if one is uppercase and one lowercase, uppercase goes first.
      // Compare: uppercase letter sorts before lowercase in char code? No — 'A' < 'a'.
      // Simple rule: if a is lowercase and b is uppercase, swap.
      if (a === a.toLowerCase() && b === b.toUpperCase()) {
        return b + a;
      }
      return a + b;
    })
    .join('-');
}

// ─── PUNNETT SQUARE (SINGLE GENE) ─────────────────────────────────────────────

/**
 * For one gene position, compute Punnett square outcomes.
 * pairA = ['R','r'], pairB = ['R','r']
 * Returns [{ pair: ['R','R'], prob: 0.25 }, ...]
 * Pairs are already normalized (dominant first).
 */
function punnettSingleGene(pairA, pairB) {
  const outcomes = {};
  for (const a of pairA) {
    for (const b of pairB) {
      // Normalize: uppercase first
      const normalized = (a === a.toLowerCase() && b === b.toUpperCase())
        ? b + a
        : a + b;
      outcomes[normalized] = (outcomes[normalized] || 0) + 0.25;
    }
  }
  return Object.entries(outcomes).map(([key, prob]) => ({ pair: [key[0], key[1]], prob }));
}

// ─── CROSS GENES ──────────────────────────────────────────────────────────────

/**
 * crossGenes("Rr-yy-WW", "Rr-Yy-ww")
 * → [{ genotype: "RR-yy-Ww", probability: 0.125 }, ...]
 * Handles 3-gene and 4-gene systems transparently.
 * Merges duplicates, rounds to 4 decimal places.
 */
export function crossGenes(parent1Str, parent2Str) {
  const p1Pairs = parseGenotype(parent1Str);
  const p2Pairs = parseGenotype(parent2Str);

  // Compute per-position Punnett outcomes
  const positionOutcomes = p1Pairs.map((pair1, i) => punnettSingleGene(pair1, p2Pairs[i]));

  // Cartesian product across all positions
  let combinations = [{ pairs: [], prob: 1 }];

  for (const posOutcomes of positionOutcomes) {
    const next = [];
    for (const current of combinations) {
      for (const { pair, prob } of posOutcomes) {
        next.push({
          pairs: [...current.pairs, pair],
          prob: current.prob * prob,
        });
      }
    }
    combinations = next;
  }

  // Serialize and merge duplicates
  const merged = {};
  for (const { pairs, prob } of combinations) {
    const key = serializeGenotype(pairs);
    merged[key] = (merged[key] || 0) + prob;
  }

  // Round and return
  return Object.entries(merged).map(([genotype, probability]) => ({
    genotype,
    probability: Math.round(probability * 10000) / 10000,
  }));
}

// ─── COLOR LOOKUPS ────────────────────────────────────────────────────────────

/**
 * genotypeToColor('rose', 'RR-yy-WW-ss') → 'Red'
 * Returns 'Unknown' if no match.
 */
export function genotypeToColor(speciesKey, genotypeStr) {
  const species = SPECIES[speciesKey];
  if (!species) return 'Unknown';
  const entry = species.colors.find(c => c.genes === genotypeStr);
  return entry ? entry.color : 'Unknown';
}

/**
 * genotypeToHex('rose', 'RR-yy-WW-ss') → '#d63031'
 * Returns '#5a7a50' (muted green) if no match.
 */
export function genotypeToHex(speciesKey, genotypeStr) {
  const species = SPECIES[speciesKey];
  if (!species) return '#5a7a50';
  const entry = species.colors.find(c => c.genes === genotypeStr);
  return entry ? entry.hex : '#5a7a50';
}

// ─── GET OFFSPRING ────────────────────────────────────────────────────────────

/**
 * getOffspring('rose', 'RR-yy-WW-ss', 'rr-yy-WW-Ss')
 * → [{ color: 'Pink', probability: 0.5, genotypes: ['Rr-yy-WW-ss', 'Rr-yy-WW-Ss'] }, ...]
 * Groups by color, sums probabilities, sorts descending.
 */
export function getOffspring(speciesKey, parent1Genotype, parent2Genotype) {
  const crossed = crossGenes(parent1Genotype, parent2Genotype);

  const byColor = {};
  for (const { genotype, probability } of crossed) {
    const color = genotypeToColor(speciesKey, genotype);
    if (!byColor[color]) {
      byColor[color] = { color, probability: 0, genotypes: [] };
    }
    byColor[color].probability = Math.round((byColor[color].probability + probability) * 10000) / 10000;
    byColor[color].genotypes.push(genotype);
  }

  return Object.values(byColor).sort((a, b) => b.probability - a.probability);
}

// ─── SEED GENOTYPE ────────────────────────────────────────────────────────────

/**
 * getSeedGenotype('rose', 'Red') → 'RR-yy-WW-ss'
 * Returns null if not a seed color.
 */
export function getSeedGenotype(speciesKey, color) {
  const speciesSeedMap = SEED_GENOTYPES[speciesKey];
  if (!speciesSeedMap) return null;
  return speciesSeedMap[color] ?? null;
}

// ─── GRID HELPERS ─────────────────────────────────────────────────────────────

// 8-directional neighbor offsets
const NEIGHBOR_OFFSETS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0,  -1],          [0,  1],
  [1,  -1], [1,  0], [1,  1],
];

/**
 * canClone(grid, row, col) → boolean
 * Returns true if the flower at [row, col] has NO adjacent same-species neighbor.
 * An isolated flower will clone itself rather than breed.
 */
export function canClone(grid, row, col) {
  const cell = grid[row]?.[col];
  if (!cell) return false;

  for (const [dr, dc] of NEIGHBOR_OFFSETS) {
    const neighbor = grid[row + dr]?.[col + dc];
    if (neighbor && neighbor.species === cell.species) {
      return false;
    }
  }
  return true;
}

/**
 * findBreedingPairs(grid, row, col) → [{ neighbor: { row, col }, offspring: [...] }]
 * Scans 8 adjacent cells for same-species flowers.
 * For each match, calls getOffspring() with both genotypes.
 * Returns array of all pairs with their offspring possibilities.
 */
export function findBreedingPairs(grid, row, col) {
  const cell = grid[row]?.[col];
  if (!cell) return [];

  const pairs = [];

  for (const [dr, dc] of NEIGHBOR_OFFSETS) {
    const nRow = row + dr;
    const nCol = col + dc;
    const neighbor = grid[nRow]?.[nCol];

    if (neighbor && neighbor.species === cell.species && cell.genotype && neighbor.genotype) {
      const offspring = getOffspring(cell.species, cell.genotype, neighbor.genotype);
      pairs.push({
        neighbor: { row: nRow, col: nCol },
        offspring,
      });
    }
  }

  return pairs;
}
