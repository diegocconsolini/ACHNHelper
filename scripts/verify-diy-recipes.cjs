/**
 * verify-diy-recipes.cjs — Cross-checks diyRecipeData.js against manifest.json
 *
 * Checks:
 *  1. Every non-cooking DIY recipe in data exists in manifest
 *  2. Every manifest recipe appears in exactly one DIY category
 *  3. No duplicates across ALL categories (including cooking)
 *  4. Every seasonal recipe exists in at least one DIY_CATEGORIES entry
 *
 * Exit code 0 if clean, 1 if any issues.
 */

const path = require('path');

async function main() {
  // 1. Load manifest recipes
  const manifest = require(path.join(__dirname, '..', 'public', 'assets-web', 'manifest.json'));
  const manifestRecipes = new Set(Object.keys(manifest.recipes || {}));

  // 2. Dynamic import of ES module
  const dataPath = 'file://' + path.resolve(__dirname, '..', 'src', 'artifacts', 'diyRecipeData.js');
  const { DIY_CATEGORIES, SEASONAL_SECTIONS } = await import(dataPath);

  // 3. Extract all recipe names by type
  const diyRecipes = new Set();       // non-cooking only
  const allRecipes = new Map();       // recipe -> category (all, for dupe check)
  const duplicates = [];

  for (const [catName, cat] of Object.entries(DIY_CATEGORIES)) {
    for (const recipe of cat.recipes) {
      // Check for duplicates across ALL categories
      if (allRecipes.has(recipe)) {
        duplicates.push({ recipe, categories: [allRecipes.get(recipe), catName] });
      } else {
        allRecipes.set(recipe, catName);
      }

      // Track non-cooking recipes separately
      if (!cat.isCooking) {
        diyRecipes.add(recipe);
      }
    }
  }

  // 4. Cross-check: DIY recipes in data but missing from manifest
  const missingFromManifest = [];
  for (const recipe of diyRecipes) {
    if (!manifestRecipes.has(recipe)) {
      missingFromManifest.push(recipe);
    }
  }

  // 5. Cross-check: manifest recipes missing from data
  const missingFromData = [];
  for (const recipe of manifestRecipes) {
    if (!diyRecipes.has(recipe)) {
      missingFromData.push(recipe);
    }
  }

  // 6. Cross-check SEASONAL_SECTIONS: every seasonal recipe must exist in DIY_CATEGORIES
  const seasonalMismatches = [];
  for (const section of SEASONAL_SECTIONS) {
    for (const recipe of section.recipes) {
      if (!allRecipes.has(recipe)) {
        seasonalMismatches.push({ recipe, section: section.name });
      }
    }
  }

  // 7. Print summary
  const totalDIY = diyRecipes.size;
  const totalCooking = allRecipes.size - diyRecipes.size;
  const matched = totalDIY - missingFromManifest.length;

  console.log('═══════════════════════════════════════════════════');
  console.log('  DIY Recipe Verification Report');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Manifest recipes:      ${manifestRecipes.size}`);
  console.log(`  DIY recipes (data):    ${totalDIY}`);
  console.log(`  Cooking recipes (data): ${totalCooking}`);
  console.log(`  Total in data:         ${allRecipes.size}`);
  console.log('───────────────────────────────────────────────────');
  console.log(`  Matched (DIY↔manifest): ${matched}/${manifestRecipes.size}`);
  console.log('───────────────────────────────────────────────────');

  let hasIssues = false;

  if (missingFromManifest.length > 0) {
    hasIssues = true;
    console.log(`\n  ✗ ${missingFromManifest.length} DIY recipe(s) NOT in manifest:`);
    missingFromManifest.forEach(r => console.log(`    - "${r}"`));
  } else {
    console.log('\n  ✓ All DIY recipes exist in manifest');
  }

  if (missingFromData.length > 0) {
    hasIssues = true;
    console.log(`\n  ✗ ${missingFromData.length} manifest recipe(s) NOT in any DIY category:`);
    missingFromData.forEach(r => console.log(`    - "${r}"`));
  } else {
    console.log('  ✓ All manifest recipes accounted for in DIY categories');
  }

  if (duplicates.length > 0) {
    hasIssues = true;
    console.log(`\n  ✗ ${duplicates.length} duplicate(s) found:`);
    duplicates.forEach(d => console.log(`    - "${d.recipe}" in [${d.categories.join(', ')}]`));
  } else {
    console.log('  ✓ No duplicates across categories');
  }

  if (seasonalMismatches.length > 0) {
    hasIssues = true;
    console.log(`\n  ✗ ${seasonalMismatches.length} seasonal recipe(s) not in any DIY_CATEGORIES entry:`);
    seasonalMismatches.forEach(m => console.log(`    - "${m.recipe}" (in seasonal section "${m.section}")`));
  } else {
    console.log('  ✓ All seasonal recipes exist in DIY_CATEGORIES');
  }

  console.log('\n═══════════════════════════════════════════════════');
  if (hasIssues) {
    console.log('  RESULT: ISSUES FOUND — see above');
    console.log('═══════════════════════════════════════════════════');
    process.exit(1);
  } else {
    console.log('  RESULT: ALL CLEAN ✓');
    console.log('═══════════════════════════════════════════════════');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
