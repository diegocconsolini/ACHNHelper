// gardenData.js — Flower Species Database for ACNH Garden Planner
// Data sourced from FlowerCalculator.jsx (originally from ACNH-Helper-Suite/data/flowers.js)
// All genotypes verified against datamined sources:
//   - Satogu/Aeon flower genotype tables (aiterusawato.github.io/satogu/acnh/flowers/)
//   - Joey's ACNH Flower Guide (joeyparrish.github.io/acnh-flowers/)
//   - Paleh's ACNH Advanced Flower Genetics document
//
// Genotype notation: RR=homozygous dominant(2), Rr=heterozygous(1), rr=recessive(0)
// Roses use 4 genes (R-Y-W-S), all others use 3 genes (R-Y-W)
// Each color entry shows ONE representative genotype (many colors have multiple valid genotypes)

// ─── SPECIES ─────────────────────────────────────────────────────────────────
// All 8 flower species with colors, genotypes, sources, hex values, asset flags.
// Key: lowercase species name
// Special cases:
//   - Rose: 4-gene system (geneCount: 4), all others are 3-gene
//   - No Pink Pansy — does not exist in game
//   - No Yellow Windflower — does not exist in game
//   - No Green Rose — does not exist in game
//   - Blue Hyacinth is source: 'hybrid' (bred from White × White)
//   - Orange Windflower is source: 'seed', not hybrid
//   - Gold Rose: source: 'special', requires golden watering can on black rose

export const SPECIES = {
  rose: {
    name: 'Rose',
    emoji: '🌹',
    geneCount: 4,
    seedColors: ['Red', 'White', 'Yellow'],
    colors: [
      { color: 'Red',    genes: 'RR-yy-ww-Ss', source: 'seed',    hex: '#d63031', hasAsset: true },
      { color: 'White',  genes: 'rr-yy-Ww-ss', source: 'seed',    hex: '#f8f9fa', hasAsset: true },
      { color: 'Yellow', genes: 'rr-YY-ww-ss', source: 'seed',    hex: '#fdcb6e', hasAsset: true },
      { color: 'Pink',   genes: 'Rr-yy-ww-Ss', source: 'hybrid',  hex: '#fd79a8', hasAsset: true },
      { color: 'Purple', genes: 'rr-yy-WW-ss', source: 'hybrid',  hex: '#a29bfe', hasAsset: true },
      { color: 'Orange', genes: 'Rr-Yy-ww-ss', source: 'hybrid',  hex: '#e17055', hasAsset: true },
      { color: 'Black',  genes: 'RR-yy-ww-ss', source: 'hybrid',  hex: '#2d3436', hasAsset: true },
      { color: 'Blue',   genes: 'RR-YY-WW-ss', source: 'hybrid',  hex: '#4aacf0', hasAsset: true },
      { color: 'Gold',   genes: 'RR-YY-WW-ss', source: 'special', hex: '#d4b030', hasAsset: true,
        note: 'Water Black roses with Golden Watering Can' },
    ],
  },
  tulip: {
    name: 'Tulip',
    emoji: '🌷',
    geneCount: 3,
    seedColors: ['Red', 'White', 'Yellow'],
    colors: [
      { color: 'Red',    genes: 'RR-yy-Ww', source: 'seed',   hex: '#e74c3c', hasAsset: true },
      { color: 'White',  genes: 'rr-yy-Ww', source: 'seed',   hex: '#ecf0f1', hasAsset: true },
      { color: 'Yellow', genes: 'rr-YY-ww', source: 'seed',   hex: '#f1c40f', hasAsset: true },
      { color: 'Pink',   genes: 'Rr-yy-Ww', source: 'hybrid', hex: '#f48fb1', hasAsset: true },
      { color: 'Purple', genes: 'RR-YY-ww', source: 'hybrid', hex: '#9b59b6', hasAsset: true },
      { color: 'Orange', genes: 'Rr-Yy-ww', source: 'hybrid', hex: '#e67e22', hasAsset: true },
      { color: 'Black',  genes: 'RR-yy-ww', source: 'hybrid', hex: '#34495e', hasAsset: true },
    ],
  },
  pansy: {
    name: 'Pansy',
    emoji: '🌸',
    geneCount: 3,
    // NO PINK PANSY — does not exist in the game
    seedColors: ['Red', 'White', 'Yellow'],
    colors: [
      { color: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#c0392b', hasAsset: true },
      { color: 'White',  genes: 'rr-yy-Ww', source: 'seed',   hex: '#f5f6fa', hasAsset: true },
      { color: 'Yellow', genes: 'rr-YY-ww', source: 'seed',   hex: '#f9ca24', hasAsset: true },
      { color: 'Orange', genes: 'Rr-Yy-ww', source: 'hybrid', hex: '#ff7f50', hasAsset: true },
      { color: 'Blue',   genes: 'rr-yy-WW', source: 'hybrid', hex: '#0984e3', hasAsset: true },
      { color: 'Purple', genes: 'RR-yy-WW', source: 'hybrid', hex: '#6c5ce7', hasAsset: true },
    ],
  },
  cosmos: {
    name: 'Cosmos',
    emoji: '🌼',
    geneCount: 3,
    seedColors: ['Red', 'White', 'Yellow'],
    colors: [
      { color: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#e63946', hasAsset: true },
      { color: 'White',  genes: 'rr-yy-Ww', source: 'seed',   hex: '#f0f0f0', hasAsset: true },
      { color: 'Yellow', genes: 'rr-YY-Ww', source: 'seed',   hex: '#ffd60a', hasAsset: true },
      { color: 'Pink',   genes: 'Rr-yy-ww', source: 'hybrid', hex: '#ff69b4', hasAsset: true },
      { color: 'Orange', genes: 'Rr-Yy-ww', source: 'hybrid', hex: '#f77f00', hasAsset: true },
      { color: 'Black',  genes: 'RR-YY-ww', source: 'hybrid', hex: '#1a1a2e', hasAsset: true },
    ],
  },
  lily: {
    name: 'Lily',
    emoji: '🌺',
    geneCount: 3,
    seedColors: ['Red', 'White', 'Yellow'],
    colors: [
      { color: 'Red',    genes: 'RR-yy-Ww', source: 'seed',   hex: '#dc143c', hasAsset: true },
      { color: 'White',  genes: 'rr-yy-WW', source: 'seed',   hex: '#fffaf0', hasAsset: true },
      { color: 'Yellow', genes: 'rr-YY-ww', source: 'seed',   hex: '#ffeb3b', hasAsset: true },
      { color: 'Pink',   genes: 'Rr-yy-Ww', source: 'hybrid', hex: '#ff1493', hasAsset: true },
      { color: 'Orange', genes: 'Rr-Yy-ww', source: 'hybrid', hex: '#ff6347', hasAsset: true },
      { color: 'Black',  genes: 'RR-yy-ww', source: 'hybrid', hex: '#1c1c1c', hasAsset: true },
    ],
  },
  hyacinth: {
    name: 'Hyacinth',
    emoji: '💐',
    geneCount: 3,
    // Seed colors: Red, White, Yellow — Blue is bred from White × White
    seedColors: ['Red', 'White', 'Yellow'],
    colors: [
      { color: 'Red',    genes: 'RR-yy-Ww', source: 'seed',   hex: '#ff0000', hasAsset: true },
      { color: 'White',  genes: 'rr-yy-Ww', source: 'seed',   hex: '#ffffff', hasAsset: true },
      { color: 'Yellow', genes: 'rr-YY-ww', source: 'seed',   hex: '#ffff00', hasAsset: true },
      { color: 'Blue',   genes: 'rr-yy-WW', source: 'hybrid', hex: '#1e90ff', hasAsset: true },
      { color: 'Pink',   genes: 'Rr-yy-Ww', source: 'hybrid', hex: '#ffc0cb', hasAsset: true },
      { color: 'Orange', genes: 'Rr-Yy-ww', source: 'hybrid', hex: '#ff8c00', hasAsset: true },
      { color: 'Purple', genes: 'RR-YY-ww', source: 'hybrid', hex: '#800080', hasAsset: true },
    ],
  },
  windflower: {
    name: 'Windflower',
    emoji: '🪻',
    geneCount: 3,
    // Seed colors: Red, White, Orange — NO YELLOW WINDFLOWER
    seedColors: ['Red', 'White', 'Orange'],
    colors: [
      { color: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#b22222', hasAsset: true },
      { color: 'White',  genes: 'rr-yy-Ww', source: 'seed',   hex: '#f5f5f5', hasAsset: true },
      // Orange is a SEED color for Windflower (not hybrid)
      { color: 'Orange', genes: 'rr-YY-ww', source: 'seed',   hex: '#ff8c00', hasAsset: true },
      { color: 'Pink',   genes: 'Rr-Yy-ww', source: 'hybrid', hex: '#dda0dd', hasAsset: true },
      { color: 'Blue',   genes: 'rr-yy-WW', source: 'hybrid', hex: '#4169e1', hasAsset: true },
      { color: 'Purple', genes: 'RR-yy-WW', source: 'hybrid', hex: '#dda0dd', hasAsset: true },
    ],
  },
  mum: {
    name: 'Mum',
    emoji: '🌻',
    geneCount: 3,
    seedColors: ['Red', 'White', 'Yellow'],
    colors: [
      { color: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#8b0000', hasAsset: true },
      { color: 'White',  genes: 'rr-yy-Ww', source: 'seed',   hex: '#f0f8ff', hasAsset: true },
      { color: 'Yellow', genes: 'rr-YY-ww', source: 'seed',   hex: '#ffd700', hasAsset: true },
      { color: 'Pink',   genes: 'Rr-yy-ww', source: 'hybrid', hex: '#ff69b4', hasAsset: true },
      { color: 'Purple', genes: 'rr-yy-WW', source: 'hybrid', hex: '#ba55d3', hasAsset: true },
      { color: 'Green',  genes: 'RR-YY-ww', source: 'hybrid', hex: '#32cd32', hasAsset: true },
    ],
  },
};

// ─── BREEDING_PATHS ───────────────────────────────────────────────────────────
// Parent color pairs → offspring with probabilities.
// Key: lowercase species name
// probability is a float 0–1 (converted from integer chance 0–100 in FlowerCalculator.jsx)
// Note: Pansy has NO Pink path — Pink pansy does not exist in game
// Note: Windflower uses Orange (seed) as a parent — no Yellow windflower

export const BREEDING_PATHS = {
  rose: [
    { parents: ['Red', 'Red'],       offspring: [{ color: 'Red', probability: 0.75 }, { color: 'Pink', probability: 0.25 }] },
    { parents: ['Red', 'White'],     offspring: [{ color: 'Red', probability: 0.25 }, { color: 'White', probability: 0.25 }, { color: 'Pink', probability: 0.50 }] },
    { parents: ['Red', 'Yellow'],    offspring: [{ color: 'Red', probability: 0.25 }, { color: 'Yellow', probability: 0.25 }, { color: 'Orange', probability: 0.50 }] },
    { parents: ['Yellow', 'Yellow'], offspring: [{ color: 'Yellow', probability: 1.00 }] },
    { parents: ['White', 'White'],   offspring: [{ color: 'White', probability: 1.00 }] },
    { parents: ['Orange', 'Orange'], offspring: [{ color: 'Red', probability: 0.25 }, { color: 'Yellow', probability: 0.25 }, { color: 'Orange', probability: 0.50 }] },
    { parents: ['Purple', 'Purple'], offspring: [{ color: 'Purple', probability: 1.00 }] },
    { parents: ['Pink', 'Pink'],     offspring: [{ color: 'Red', probability: 0.25 }, { color: 'Pink', probability: 0.50 }, { color: 'White', probability: 0.25 }] },
  ],
  tulip: [
    { parents: ['Red', 'Red'],       offspring: [{ color: 'Red', probability: 0.75 }, { color: 'Pink', probability: 0.25 }] },
    { parents: ['Red', 'Yellow'],    offspring: [{ color: 'Red', probability: 0.25 }, { color: 'Yellow', probability: 0.25 }, { color: 'Orange', probability: 0.50 }] },
    { parents: ['White', 'White'],   offspring: [{ color: 'White', probability: 1.00 }] },
    { parents: ['Purple', 'Purple'], offspring: [{ color: 'Purple', probability: 1.00 }] },
    { parents: ['Orange', 'Orange'], offspring: [{ color: 'Orange', probability: 0.50 }, { color: 'Red', probability: 0.25 }, { color: 'Yellow', probability: 0.25 }] },
  ],
  // Pansy: NO Pink — Pink pansy does not exist in game
  pansy: [
    { parents: ['White', 'White'],   offspring: [{ color: 'White', probability: 1.00 }] },
    { parents: ['Yellow', 'Yellow'], offspring: [{ color: 'Yellow', probability: 1.00 }] },
    { parents: ['Red', 'Yellow'],    offspring: [{ color: 'Red', probability: 0.25 }, { color: 'Yellow', probability: 0.25 }, { color: 'Orange', probability: 0.50 }] },
    { parents: ['Purple', 'Purple'], offspring: [{ color: 'Purple', probability: 1.00 }] },
    { parents: ['Blue', 'Blue'],     offspring: [{ color: 'Blue', probability: 1.00 }] },
  ],
  cosmos: [
    { parents: ['Red', 'Red'],       offspring: [{ color: 'Red', probability: 0.75 }, { color: 'Pink', probability: 0.25 }] },
    { parents: ['Red', 'Yellow'],    offspring: [{ color: 'Red', probability: 0.25 }, { color: 'Yellow', probability: 0.25 }, { color: 'Orange', probability: 0.50 }] },
    { parents: ['White', 'Red'],     offspring: [{ color: 'Red', probability: 0.25 }, { color: 'White', probability: 0.25 }, { color: 'Pink', probability: 0.50 }] },
    { parents: ['Orange', 'Orange'], offspring: [{ color: 'Red', probability: 0.25 }, { color: 'Yellow', probability: 0.25 }, { color: 'Orange', probability: 0.50 }] },
    { parents: ['Black', 'Black'],   offspring: [{ color: 'Black', probability: 1.00 }] },
  ],
  lily: [
    { parents: ['Red', 'Red'],       offspring: [{ color: 'Red', probability: 0.75 }, { color: 'Pink', probability: 0.25 }] },
    { parents: ['White', 'White'],   offspring: [{ color: 'White', probability: 1.00 }] },
    { parents: ['Yellow', 'Yellow'], offspring: [{ color: 'Yellow', probability: 1.00 }] },
    { parents: ['Red', 'Yellow'],    offspring: [{ color: 'Red', probability: 0.25 }, { color: 'Yellow', probability: 0.25 }, { color: 'Orange', probability: 0.50 }] },
    { parents: ['Black', 'Black'],   offspring: [{ color: 'Black', probability: 1.00 }] },
  ],
  hyacinth: [
    { parents: ['Red', 'Red'],       offspring: [{ color: 'Red', probability: 0.75 }, { color: 'Pink', probability: 0.25 }] },
    { parents: ['White', 'White'],   offspring: [{ color: 'White', probability: 1.00 }] },
    { parents: ['Blue', 'Blue'],     offspring: [{ color: 'Blue', probability: 1.00 }] },
    { parents: ['Red', 'Blue'],      offspring: [{ color: 'Red', probability: 0.25 }, { color: 'Blue', probability: 0.25 }, { color: 'Purple', probability: 0.50 }] },
    { parents: ['Purple', 'Purple'], offspring: [{ color: 'Purple', probability: 1.00 }] },
    { parents: ['Red', 'Yellow'],    offspring: [{ color: 'Red', probability: 0.25 }, { color: 'Yellow', probability: 0.25 }, { color: 'Orange', probability: 0.50 }] },
  ],
  // Windflower: Orange is a seed color — NO Yellow windflower
  windflower: [
    { parents: ['Red', 'Red'],       offspring: [{ color: 'Red', probability: 0.75 }, { color: 'Pink', probability: 0.25 }] },
    { parents: ['White', 'White'],   offspring: [{ color: 'White', probability: 1.00 }] },
    { parents: ['Orange', 'Orange'], offspring: [{ color: 'Orange', probability: 0.75 }, { color: 'Red', probability: 0.25 }] },
    { parents: ['Red', 'White'],     offspring: [{ color: 'Red', probability: 0.25 }, { color: 'White', probability: 0.25 }, { color: 'Pink', probability: 0.50 }] },
    { parents: ['Purple', 'Purple'], offspring: [{ color: 'Purple', probability: 1.00 }] },
    { parents: ['Blue', 'Blue'],     offspring: [{ color: 'Blue', probability: 1.00 }] },
  ],
  mum: [
    { parents: ['Red', 'Red'],       offspring: [{ color: 'Red', probability: 0.75 }, { color: 'Pink', probability: 0.25 }] },
    { parents: ['White', 'White'],   offspring: [{ color: 'White', probability: 1.00 }] },
    { parents: ['Yellow', 'Yellow'], offspring: [{ color: 'Yellow', probability: 1.00 }] },
    { parents: ['Red', 'Yellow'],    offspring: [{ color: 'Red', probability: 0.25 }, { color: 'Yellow', probability: 0.25 }, { color: 'Purple', probability: 0.50 }] },
    { parents: ['Purple', 'Purple'], offspring: [{ color: 'Purple', probability: 1.00 }] },
    { parents: ['Green', 'Green'],   offspring: [{ color: 'Green', probability: 1.00 }] },
  ],
};

// ─── SEED_GENOTYPES ───────────────────────────────────────────────────────────
// Derived from SPECIES: species → seed color → genotype string
// Only includes colors with source === 'seed'

export const SEED_GENOTYPES = Object.fromEntries(
  Object.entries(SPECIES).map(([key, sp]) => [
    key,
    Object.fromEntries(
      sp.colors.filter(c => c.source === 'seed').map(c => [c.color, c.genes])
    ),
  ])
);

// ─── COLOR_HEX ────────────────────────────────────────────────────────────────
// Flat lookup: color name → hex value
// First occurrence wins when a color name appears in multiple species

export const COLOR_HEX = {};
Object.values(SPECIES).forEach(sp =>
  sp.colors.forEach(c => { if (!COLOR_HEX[c.color]) COLOR_HEX[c.color] = c.hex; })
);

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
  genotype: 'RR-YY-WW-ss'
};
