# DIY Recipe Tracker Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all fabricated recipe data in DIYRecipeTracker with verified data from manifest.json and Nookipedia, extract data into a separate module, and add a verification script.

**Architecture:** Extract all recipe data (categories, sources, seasonal) from the 1,206-line single file into `diyRecipeData.js`. Refactor `DIYRecipeTracker.jsx` to import from it. Add cooking categories with `isCooking` flag for emoji fallback. Add orphan cleanup on storage load.

**Tech Stack:** React 19.2, Vite 7.3, inline styles, `window.storage` API, Node.js verification script

---

## Chunk 1: Data Module + Verification Script

### Task 1: Extract all 640 manifest recipes and build categorized data file

**Files:**
- Read: `public/assets-web/manifest.json` (extract recipe names)
- Create: `src/artifacts/diyRecipeData.js`

**Context for implementer:**
- The manifest at `public/assets-web/manifest.json` has a `recipes` key containing 640 recipe names as keys
- Each recipe name must go into exactly ONE category — no duplicates
- Recipe names must match manifest EXACTLY (case-sensitive) for `<AssetImg>` to work
- The existing file at `src/artifacts/DIYRecipeTracker.jsx` lines 13-342 has the current (partially fabricated) data structure — use it as a starting point but verify every name against the manifest
- Categories use keyed-object format: `{ 'Tools': { emoji: '🔨', recipes: [...] } }`
- See spec at `docs/superpowers/specs/2026-03-13-diy-recipe-tracker-rebuild-design.md` Section 1 for full category list and categorization rules

- [ ] **Step 1: Write a Node.js script to extract and group manifest recipes**

Create `scripts/categorize-recipes.cjs` (must be `.cjs` since package.json has `"type": "module"`):

```js
// Load manifest, extract all 640 recipe names
// Group them by prefix/keyword matching into categories
// Output the grouped results to console for manual verification
// Categories: Tools, Bamboo, Cherry Blossom, Shell, Summer Shell,
// Ironwood, Log, Wooden, Wooden-Block, Fruit, Iron, Gold & Golden,
// Celeste (zodiac+star+space items), Crowns & Wreaths, Wands,
// Mermaid, Mushroom, Maple & Acorn, Frozen & Snowflake,
// Festive & Illuminated, Bunny Day, Spooky, Turkey Day,
// Fences, Walls/Floors/Rugs, Miscellaneous & Other
// NOTE: Wands is a 27th DIY category (not in original spec which merged them
// into Celeste, but separation is cleaner since there are 21 wand recipes)
```

The script should:
1. Load `manifest.json` and get all recipe keys
2. Apply categorization rules in priority order (thematic series first, generic last)
3. Track which recipes are "uncategorized" (these go to Miscellaneous)
4. Print each category with its recipes and count
5. Print total categorized vs manifest total (must equal 640)
6. Flag any duplicates (recipe appearing in multiple categories)

Run: `node scripts/categorize-recipes.cjs`

- [ ] **Step 2: Verify categorization output against Nookipedia**

Review the script output. Cross-check:
- Celeste recipes against Nookipedia (zodiac items + star/space items ONLY — wands go in the separate Wands category)
- Seasonal recipes (Cherry Blossom, Mushroom, etc.) against Nookipedia seasonal pages
- Crowns & Wreaths should contain ALL crown/wreath recipes EXCEPT those in event categories (e.g., Bunny Day wreath stays in Bunny Day)
- Tools should match Nookipedia's tool list exactly
- The "Miscellaneous & Other" catch-all should contain general recipes like `barbell`, `bonfire`, `birdhouse`, etc.

Use web search to verify any ambiguous categorizations.

- [ ] **Step 3: Build the verified diyRecipeData.js**

Create `src/artifacts/diyRecipeData.js` with these exports:

```js
export const DIY_CATEGORIES = { ... };    // 29 categories (27 DIY + 2 cooking)
export const SOURCES = [ ... ];           // 14 sources
export const SEASONAL_SECTIONS = [ ... ]; // 11 seasonal windows
export const STORAGE_KEY = 'acnh-diy-tracker';
export const TOTAL_RECIPES = Object.values(DIY_CATEGORIES).reduce(
  (sum, cat) => sum + cat.recipes.length, 0
);
```

**DIY_CATEGORIES format** (keyed object):
```js
export const DIY_CATEGORIES = {
  'Tools': {
    emoji: '🔨',
    recipes: [
      'axe', 'fishing rod', 'flimsy axe', ...  // from manifest, alphabetically sorted
    ]
  },
  // ... 26 more DIY categories (including Wands as separate from Celeste) ...
  'Cooking - Savory': {
    emoji: '🍲',
    isCooking: true,
    recipes: [
      'aji fry', 'anchoas al ajillo', ...  // from Nookipedia/Game8, alphabetically sorted
    ]
  },
  'Cooking - Sweet': {
    emoji: '🍰',
    isCooking: true,
    recipes: [
      'apple jelly', 'apple pie', ...  // from Nookipedia/Game8, alphabetically sorted
    ]
  }
};
```

**IMPORTANT data rules:**
- DIY recipe names: use EXACT case from manifest.json (most are lowercase, some have capitals like "Bunny Day arch", "Turkey Day casserole", "Aquarius urn")
- Cooking recipe names: use lowercase as verified from Nookipedia/Game8
- All recipes within each category sorted alphabetically
- Cooking recipes verified against Game8 food recipes list: https://game8.co/games/Animal-Crossing-New-Horizons/archives/324924
- The existing file has good cooking data at lines 287-341 — verify each name against Game8/Nookipedia before keeping

**SOURCES array** — 14 items, each with: `{ emoji, name, description, tips, daily, limit }`. See spec lines 109-123 for the list. The existing file has 9 sources at lines 349-422 that are mostly correct — keep those and add 5 new ones:
- Nook Miles Exchange (fence recipes, 1000 Miles each)
- Fishing (cooking recipes from specific catches)
- Be a Chef! DIY Recipes+ (2,000 Nook Miles, unlocks cooking)
- Basic Cooking Recipes (4,980 Bells at Nook's Cranny)
- Leif / Daisy Mae / Niko (2.0 update vine/moss/golden recipes)

**SEASONAL_SECTIONS array** — 11 items. See spec lines 141-153 for the date table. The existing file has 9 sections at lines 425-549 — keep those and add:
- Spring Bamboo (Feb 25–May 31 NH / Aug 25–Nov 30 SH) — this is a NEW seasonal entry. The recipe list is a SUBSET of the Bamboo DIY category (only recipes requiring young spring bamboo, not all bamboo recipes).
- Maple Leaves sub-window (Nov 16–25 NH / May 16–25 SH) — narrower window than Maple & Acorn; only maple-leaf material recipes

Each seasonal section format:
```js
{
  name: 'Cherry Blossom',
  emoji: '🌸',
  nh: 'Apr 1 – Apr 10',
  sh: 'Oct 1 – Oct 10',
  source: 'Balloons',
  recipes: ['blossom-viewing lantern', ...]  // from manifest, matching category data
  // Note: spec shows a `recipeCount` field but it's omitted here — derivable from recipes.length
}
```

- [ ] **Step 4: Commit data module**

```bash
git add src/artifacts/diyRecipeData.js
git commit -m "feat(#17): add verified DIY recipe data module — 640 DIY + cooking recipes"
```

---

### Task 2: Write verification script

**Files:**
- Create: `scripts/verify-diy-recipes.cjs`

- [ ] **Step 1: Write the verification script**

Create `scripts/verify-diy-recipes.cjs`:

```js
// 1. Load manifest.json recipes (640 keys)
// 2. Dynamically import diyRecipeData.js and extract all non-cooking recipe names
// 3. Cross-check: every DIY recipe in data must exist in manifest
// 4. Cross-check: every manifest recipe must appear in exactly one category
// 5. Check for duplicates across categories
// 6. Cooking recipes (isCooking: true) are EXEMPT from manifest check
// 7. Cross-check SEASONAL_SECTIONS: every recipe in seasonal lists must exist in at least one DIY_CATEGORIES entry
// 8. Print summary: matched, missing from data, missing from manifest, duplicates, seasonal mismatches
// 9. Exit code 0 if clean, 1 if any issues
```

Note: Since `diyRecipeData.js` uses ES module exports and this is a `.cjs` script, use dynamic `import()`:
```js
async function main() {
  const { DIY_CATEGORIES } = await import('../src/artifacts/diyRecipeData.js');
  // ... verification logic
}
main();
```

- [ ] **Step 2: Run the verification script**

Run: `node scripts/verify-diy-recipes.cjs`
Expected: All 640 manifest recipes accounted for, zero duplicates, zero missing.

If there are mismatches, fix `diyRecipeData.js` and re-run until clean.

- [ ] **Step 3: Commit verification script**

```bash
git add scripts/verify-diy-recipes.cjs
git commit -m "feat(#17): add DIY recipe verification script — confirms 640/640 manifest match"
```

---

## Chunk 2: Refactor DIYRecipeTracker.jsx

### Task 3: Refactor DIYRecipeTracker.jsx to use data module

**Files:**
- Modify: `src/artifacts/DIYRecipeTracker.jsx` (lines 1-1206 → ~500 lines)
- Read: `src/artifacts/diyRecipeData.js` (import from here)

- [ ] **Step 1: Replace data with imports**

At the top of `DIYRecipeTracker.jsx`, change:
```js
// OLD (line 1-2):
import React, { useState, useEffect } from 'react';
import { AssetImg } from '../assetHelper';

// NEW:
import React, { useState, useEffect } from 'react';
import { AssetImg } from '../assetHelper';
import { DIY_CATEGORIES, SOURCES, SEASONAL_SECTIONS, STORAGE_KEY, TOTAL_RECIPES } from './diyRecipeData';
```

Then delete the entire inline data block:
- Delete lines 13-342 (the `const DIY_CATEGORIES = { ... }` object)
- **Delete lines 344-346** (the `const TOTAL_RECIPES = ...` computation — now imported from data module)
- Delete lines 349-422 (the `const SOURCES = [ ... ]` array)
- Delete lines 425-549 (the `const SEASONAL_SECTIONS = [ ... ]` array)

**IMPORTANT:** `TOTAL_RECIPES` is now exported from `diyRecipeData.js` and imported above. Do NOT keep the inline computation — delete it along with the data.

The `getFilteredCategories()` helper (around line ~605) references `DIY_CATEGORIES` directly. After extraction, it will reference the imported module-scope constant, which works identically. No changes needed to this function.

- [ ] **Step 2: Add orphan cleanup to storage load**

Modify the `useEffect` that loads from storage (currently lines 552-565). After parsing the stored data, filter out orphaned recipe names:

```js
useEffect(() => {
  const loadData = async () => {
    try {
      const result = await window.storage.get(STORAGE_KEY);
      if (result) {
        const data = JSON.parse(result.value);
        // Build set of all valid recipe names for orphan cleanup
        const allRecipes = new Set(
          Object.values(DIY_CATEGORIES).flatMap(cat => cat.recipes)
        );
        const cleaned = (data.learned || []).filter(name => allRecipes.has(name));
        setLearnedRecipes(new Set(cleaned));
      }
    } catch (err) {
      console.error('Failed to load DIY tracker data:', err);
    }
  };
  loadData();
}, []);
```

Also update the save `useEffect` (currently lines 568-579) to use `STORAGE_KEY` instead of the hardcoded string `'acnh-diy-tracker'`.

- [ ] **Step 3: Add cooking emoji fallback in recipe rendering**

In the "By Category" tab rendering (around line 1070-1100 in the current file), where each recipe item is rendered with `<AssetImg>`:

Find the recipe item rendering that looks like:
```jsx
<AssetImg category="recipes" name={recipe} size={22} />
```

Add a conditional for cooking categories:
```jsx
{data.isCooking ? (
  <span style={{ fontSize: '18px', marginRight: '6px' }}>{data.emoji}</span>
) : (
  <AssetImg category="recipes" name={recipe} size={22} />
)}
```

This requires passing `data` (the category object) into the recipe rendering context. The current code uses `Object.entries(getFilteredCategories())` which gives `[categoryName, data]` — so `data.isCooking` is available.

**Dependency:** This conditional relies on `isCooking: true` being present on cooking categories in `diyRecipeData.js` (set in Task 1, Step 3). Verify the flag exists before implementing.

- [ ] **Step 4: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Clean build with no errors. Module count may change slightly.

- [ ] **Step 5: Commit refactored component**

```bash
git add src/artifacts/DIYRecipeTracker.jsx
git commit -m "refactor(#17): extract data to module, add orphan cleanup + cooking fallback"
```

---

### Task 4: Run verification, build check, and version bump

**Files:**
- Modify: `package.json` (version bump)
- Run: `scripts/verify-diy-recipes.cjs`

- [ ] **Step 1: Run verification script**

Run: `node scripts/verify-diy-recipes.cjs`
Expected: All 640 manifest recipes accounted for, zero issues.

- [ ] **Step 2: Run production build**

Run: `npm run build 2>&1 | tail -10`
Expected: Clean build, no warnings about missing imports.

- [ ] **Step 3: Bump version to 1.4.0**

In `package.json`, change `"version"` from `"1.3.0"` to `"1.4.0"`.

- [ ] **Step 4: Final commit**

```bash
git add package.json
git commit -m "chore(#17): bump version to 1.4.0 for DIY recipe data rebuild"
```

---

## Chunk 3: Deploy and Cleanup

### Task 5: Push and deploy

- [ ] **Step 1: Push to main**

```bash
git push origin main
```

Vercel auto-deploys on push to main.

- [ ] **Step 2: Clean up helper scripts**

Delete the categorization helper script (it was a one-time tool):
```bash
git rm scripts/categorize-recipes.cjs
git commit -m "chore: remove one-time categorization script"
git push origin main
```

Keep `scripts/verify-diy-recipes.cjs` — it can be re-run anytime to validate data integrity.

- [ ] **Step 3: Close issue #17**

```bash
gh issue close 17 --comment "Completed in v1.4.0. All recipe data rebuilt from verified sources (manifest.json + Nookipedia). 640 DIY recipes across 26 categories + ~141 cooking recipes. Verification script confirms 100% manifest coverage."
```

---

## Task Dependency Graph

```
Task 1 (data module) → Task 2 (verification) → Task 3 (refactor JSX) → Task 4 (build + version) → Task 5 (deploy)
```

All tasks are sequential — each depends on the previous.

## Notes for Implementer

1. **ZERO TOLERANCE for fabricated data.** Every recipe name must come from manifest.json (for DIY) or Nookipedia/Game8 (for cooking). If you can't verify a name, remove it.
2. **Case sensitivity matters.** `<AssetImg>` does case-insensitive lookup, but the manifest has specific casing (e.g., "Bunny Day arch" not "bunny day arch"). Use manifest casing for DIY recipes.
3. **Wands category:** Split wands into their own "Wands" category (27th DIY category). Celeste keeps ONLY zodiac items + star/space furniture. This deviates from the original spec which merged wands into Celeste, but is cleaner since there are 21 wand recipes.
4. **Fences overlap:** Some fences appear in other categories too (e.g., "bamboo lattice fence" in both Bamboo and Fences). Put themed fences in Fences only — each recipe in exactly ONE category.
5. **The `scripts/` directory** uses `.cjs` extension because `package.json` has `"type": "module"`.
6. **Cooking recipe names** — many are real Italian/Japanese dish names from the 2.0 update. Names like "carpaccio di capesante", "kabu ankake", "pesce all'acqua pazza" are REAL in-game names. Verify but don't assume they're fabricated.
7. **Spooky cookies conflict:** "spooky cookies" currently appears in BOTH "Cooking - Sweet" and the "Spooky" category/seasonal section. It is a cooking recipe (2.0 update). Keep it in "Cooking - Sweet" only. Remove from Spooky category and seasonal section.
8. **Category count note:** The spec says 26 DIY + 2 cooking = 28. This plan adds Wands as a separate category making it 27 DIY + 2 cooking = 29. The spec's provisional counts are superseded by the implementer's manifest extraction.
