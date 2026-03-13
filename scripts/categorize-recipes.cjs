/**
 * categorize-recipes.cjs
 * Extracts all 640 recipe names from manifest.json and categorizes them
 * into DIY categories. Run with: node scripts/categorize-recipes.cjs
 */

const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'public', 'assets-web', 'manifest.json'), 'utf8')
);

const allRecipes = Object.keys(manifest.recipes).sort();
console.log(`Total recipes in manifest: ${allRecipes.length}\n`);

// Track which recipes have been categorized
const categorized = new Set();
const categories = {};

function addCategory(name, recipes) {
  // Filter to only include recipes that exist in manifest AND haven't been categorized yet
  const valid = recipes.filter(r => {
    if (!allRecipes.includes(r)) {
      console.warn(`  WARNING: "${r}" not found in manifest for category "${name}"`);
      return false;
    }
    if (categorized.has(r)) {
      console.warn(`  WARNING: "${r}" already categorized, skipping for "${name}"`);
      return false;
    }
    return true;
  });
  valid.forEach(r => categorized.add(r));
  categories[name] = valid.sort();
}

// Helper: get all manifest recipes matching a predicate, not yet categorized
function match(predicate) {
  return allRecipes.filter(r => !categorized.has(r) && predicate(r));
}

// ── 1. Tools (exact names) ──
addCategory('Tools', [
  'axe', 'fishing rod', 'flimsy axe', 'flimsy fishing rod', 'flimsy net',
  'flimsy shovel', 'flimsy watering can', 'golden axe', 'golden net',
  'golden rod', 'golden shovel', 'golden slingshot', 'golden watering can',
  'ladder', 'net', 'shovel', 'slingshot', 'stone axe', 'vaulting pole',
  'watering can'
]);

// ── 2. Bunny Day ──
addCategory('Bunny Day', match(r =>
  r.toLowerCase().includes('bunny day') ||
  r.match(/-egg\b/) ||
  r.startsWith('egg party') ||
  r === 'wobbling Zipper toy'
));

// ── 3. Turkey Day ──
addCategory('Turkey Day', match(r => r.startsWith('Turkey Day') || r.startsWith('turkey day')));

// ── 4. Spooky (excluding "spooky cookies" which is NOT in manifest) ──
addCategory('Spooky', match(r => r.startsWith('spooky')));

// ── 5. Cherry Blossom ──
addCategory('Cherry Blossom', match(r =>
  r.includes('cherry-blossom') ||
  r.includes('sakura') ||
  r === 'blossom-viewing lantern' ||
  r === 'outdoor picnic set'
));

// ── 6. Mermaid ──
addCategory('Mermaid', match(r => r.startsWith('mermaid')));

// ── 7. Ironwood ──
addCategory('Ironwood', match(r => r.startsWith('ironwood')));

// ── 8. Frozen & Snowflake ──
addCategory('Frozen & Snowflake', match(r =>
  r.startsWith('frozen') ||
  r.startsWith('ice ') ||
  r.startsWith('iceberg') ||
  r.startsWith('snowflake') ||
  r.startsWith('snowperson') ||
  r === 'three-tiered snowperson' ||
  r.startsWith('falling-snow') ||
  r.startsWith('ski-slope')
));

// ── 9. Festive & Illuminated ──
addCategory('Festive & Illuminated', match(r =>
  r.startsWith('festive') ||
  r.startsWith('illuminated') ||
  r.startsWith('tabletop festive') ||
  r.startsWith('big festive') ||
  r === 'gift pile' ||
  r === 'holiday candle' ||
  r === 'ornament mobile' ||
  r === 'ornament wreath' ||
  r === 'sleigh' ||
  r === 'Jingle wall'
));

// ── 10. Mushroom ──
addCategory('Mushroom', match(r =>
  r.startsWith('mush ') ||
  r.startsWith('mush-') ||
  r.startsWith('mushroom') ||
  r === 'forest flooring' ||
  r === 'forest wall'
));

// ── 11. Bamboo ──
addCategory('Bamboo', match(r =>
  r.startsWith('bamboo') ||
  r === 'bamboo-grove wall' ||
  r === 'bamboo-shoot lamp' ||
  r === 'dark bamboo rug' ||
  r === 'light bamboo rug'
));

// ── 12. Shell (not "shellfish pochette") ──
addCategory('Shell', match(r => r.startsWith('shell ') && r !== 'shellfish pochette'));

// ── 13. Summer Shell ──
addCategory('Summer Shell', match(r =>
  ['shellfish pochette', 'starry-sands flooring', 'summer-shell rug',
   'tropical vista', 'underwater flooring', 'underwater wall', 'water flooring'].includes(r)
));

// ── 14. Ironwood already done above

// ── 15. Log ──
addCategory('Log', match(r => r.startsWith('log ')));

// ── 16. Wooden-Block ──
addCategory('Wooden-Block', match(r => r.startsWith('wooden-block')));

// ── 17. Wooden (excluding wooden-block, wooden-mosaic, wooden-knot, wooden-plank) ──
addCategory('Wooden', match(r =>
  (r.startsWith('wooden ') || r.startsWith('wooden-')) &&
  !r.startsWith('wooden-block') &&
  !r.startsWith('wooden-mosaic') &&
  !r.startsWith('wooden-knot') &&
  !r.startsWith('wooden-plank')
));

// ── 18. Fruit (excluding cherry-blossom) ──
addCategory('Fruit', match(r =>
  (r.startsWith('apple') || r.startsWith('cherry') || r.startsWith('orange') ||
   r.startsWith('peach') || r.startsWith('pear') || r.startsWith('coconut') ||
   r.startsWith('fruit')) &&
  !r.includes('cherry-blossom')
));

// ── 19. Iron (excluding ironwood) ──
addCategory('Iron', match(r =>
  (r.startsWith('iron ') || r.startsWith('iron-')) &&
  !r.startsWith('ironwood')
));

// ── 20. Gold & Golden (excluding golden tools already categorized) ──
addCategory('Gold & Golden', match(r =>
  r.startsWith('gold') || r.startsWith('golden')
));

// ── 21. Wands ──
addCategory('Wands', match(r => r.endsWith(' wand') || r === 'wand'));

// ── 22. Celeste ──
const celesteExact = [
  'Aquarius urn', 'Aries rocking chair', 'Cancer table', 'Capricorn ornament',
  'Gemini closet', 'Leo sculpture', 'Libra scale', 'Pisces lamp',
  'Sagittarius arrow', 'Scorpio lamp', 'Taurus bathtub', 'Virgo harp',
  'asteroid', 'astronaut suit', 'crescent-moon chair', 'crewed spaceship',
  'flying saucer', 'galaxy flooring', 'lunar lander', 'lunar rover',
  'lunar surface', 'moon', 'nova light', 'rocket', 'satellite',
  'sci-fi flooring', 'sci-fi wall', 'space shuttle', 'star clock',
  'star head', 'star pochette', 'starry garland', 'starry wall', 'starry-sky wall'
];
addCategory('Celeste', celesteExact.filter(r => !categorized.has(r) && allRecipes.includes(r)));

// ── 23. Crowns & Wreaths ──
addCategory('Crowns & Wreaths', match(r =>
  r.includes('crown') || r.includes('wreath')
));

// ── 24. Fences ──
addCategory('Fences', match(r => r.includes('fence')));

// ── 25. Maple & Acorn ──
const mapleAcornExact = [
  'acorn pochette', 'autumn wall', 'colored-leaves flooring', 'leaf campfire',
  'leaf stool', 'maple-leaf pochette', 'maple-leaf pond stone', 'maple-leaf umbrella',
  'pile of leaves', 'pine bonsai tree', 'red-leaf pile', "tree's bounty arch",
  "tree's bounty big tree", "tree's bounty lamp", "tree's bounty little tree",
  "tree's bounty mobile", 'yellow-leaf pile', 'bonsai shelf'
];
addCategory('Maple & Acorn', mapleAcornExact.filter(r => !categorized.has(r) && allRecipes.includes(r)));

// ── 26. Walls, Floors & Rugs ──
addCategory('Walls, Floors & Rugs', match(r =>
  r.includes('wall') || r.includes('flooring') || r.includes('floor') || r.includes('rug')
));

// ── 27. Miscellaneous & Other ──
const uncategorized = allRecipes.filter(r => !categorized.has(r));
addCategory('Miscellaneous & Other', uncategorized);

// ── Print results ──
let total = 0;
for (const [cat, recipes] of Object.entries(categories)) {
  console.log(`\n=== ${cat} (${recipes.length}) ===`);
  recipes.forEach(r => console.log(`  ${r}`));
  total += recipes.length;
}

console.log(`\n${'='.repeat(50)}`);
console.log(`Total categorized: ${total}`);
console.log(`Expected: ${allRecipes.length}`);
console.log(`Match: ${total === allRecipes.length ? 'YES ✓' : 'NO ✗'}`);

// Check for duplicates
const allCategorizedRecipes = Object.values(categories).flat();
const dupeCheck = new Set();
const dupes = [];
for (const r of allCategorizedRecipes) {
  if (dupeCheck.has(r)) dupes.push(r);
  dupeCheck.add(r);
}
if (dupes.length > 0) {
  console.log(`\nDUPLICATES FOUND: ${dupes.join(', ')}`);
} else {
  console.log('No duplicates found.');
}

// Output as JSON for easy consumption
fs.writeFileSync(
  path.join(__dirname, 'recipe-categories.json'),
  JSON.stringify(categories, null, 2)
);
console.log('\nWrote recipe-categories.json');
