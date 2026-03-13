# DIY Recipe Tracker Rebuild — Design Spec

**Issue:** #17 — CATASTROPHIC: Rebuild DIYRecipeTracker with verified recipe data
**Date:** 2026-03-13
**Status:** Approved

---

## Problem

The DIYRecipeTracker contains 64% fabricated recipe names (172/269 originally audited). Cooking recipes include non-existent items (Foie Gras, Gazpacho, Paella). Tool names are wrong (Iron Axe → Axe, Fish Rod → Fishing rod). Entire categories (Turkey Day, Toy Day, Summer Shell) use incorrect prefixes or fabricated entries. The file is 1,206 lines with all data inlined.

## Solution

Rebuild all recipe data from verified sources (Nookipedia, Game8, manifest.json). Extract data into a separate module. Keep the existing UI structure (3 tabs) and storage format.

---

## Section 1: Data Architecture

### File Structure

```
src/artifacts/
├── DIYRecipeTracker.jsx      ← UI + state (~500 lines)
└── diyRecipeData.js          ← All verified recipe data (~700+ lines)
```

### diyRecipeData.js Exports

```js
// Primary data — keyed-object format (matches existing UI iteration via Object.entries())
export const DIY_CATEGORIES = {
  'Tools': { emoji: '🔨', recipes: ['Flimsy axe', 'Stone axe', ...] },
  'Ironwood': { emoji: '🪵', recipes: ['Ironwood bed', 'Ironwood cart', ...] },
  // ... 26 categories total for DIY, then 2 cooking categories appended
  'Cooking - Savory': { emoji: '🍲', recipes: [...], isCooking: true },
  'Cooking - Sweet': { emoji: '🍰', recipes: [...], isCooking: true },
};
export const SOURCES = [ ... ];           // 14 recipe sources
export const SEASONAL_SECTIONS = [ ... ]; // 10 seasonal windows

// Constants
export const STORAGE_KEY = 'acnh-diy-tracker';
```

**Data structure:** `DIY_CATEGORIES` is a **keyed object** (not an array). The existing UI uses `Object.entries(DIY_CATEGORIES)` for iteration and `DIY_CATEGORIES[categoryName]` for direct access. Cooking categories are included in the same object with an `isCooking: true` flag so that the UI can apply emoji fallbacks for sprites.

**UI impact of cooking categories:** The UI code's `getFilteredCategories()` and progress ring already iterate `Object.entries(DIY_CATEGORIES)`, so cooking categories are rendered automatically with no structural UI changes. The only small UI addition: when `isCooking` is true, show a category emoji instead of `<AssetImg>` for individual recipe items (since cooking recipes have no manifest sprites yet).

### DIY_CATEGORIES (26 crafting + 2 cooking = 28 total)

Exact counts verified against `manifest.json` (640 recipes) and Nookipedia:

| # | Category | Count | Verification Source |
|---|---|---|---|
| 1 | Tools | 20 | Nookipedia + Game8 |
| 2 | Bamboo | 22 | manifest.json (bamboo* prefix) |
| 3 | Spring Bamboo | 12 | Nookipedia /DIY_recipes/Spring |
| 4 | Cherry Blossom | 14 | Nookipedia /DIY_recipes/Spring + manifest |
| 5 | Shell | 11 | manifest.json (shell* prefix) |
| 6 | Summer Shell | 9 | Nookipedia /DIY_recipes/Summer |
| 7 | Ironwood | 10 | manifest.json (ironwood* prefix) |
| 8 | Log | 12 | manifest.json (log* prefix) |
| 9 | Wooden | 17 | manifest.json (wooden* excl. block/mosaic/knot/plank) |
| 10 | Wooden-Block | 10 | manifest.json (wooden-block* prefix) |
| 11 | Fruit | 38 | manifest.json (apple/cherry/orange/peach/pear/coconut/fruit*) |
| 12 | Iron | 15 | manifest.json (iron*/iron-* excl. ironwood) |
| 13 | Gold & Golden | 25 | manifest.json (gold*/golden*) |
| 14 | Celeste | 49 | Nookipedia /DIY_recipes/Celeste (zodiac+star+wands) |
| 15 | Crowns & Wreaths | 53 | Game8 wall-mounted page (all crown/wreath recipes) |
| 16 | Mermaid | 15 | Nookipedia /DIY_recipes/Pascal |
| 17 | Mushroom | 10 | manifest.json (mush*/mushroom*) |
| 18 | Maple & Acorn | 22 | Nookipedia /DIY_recipes/Fall |
| 19 | Frozen & Snowflake | 26 | Nookipedia /DIY_recipes/Winter |
| 20 | Festive & Illuminated | 14 | manifest.json verified |
| 21 | Bunny Day | 40 | manifest.json (bunny*/egg*) + Nookipedia |
| 22 | Spooky | 14 | manifest.json (spooky* prefix) |
| 23 | Turkey Day | 8 | manifest.json (turkey day* prefix) |
| 24 | Fences | 20 | manifest.json (*fence*) |
| 25 | Walls, Floors & Rugs | 98 | Game8 wallpaper/floor/rug page |
| 26 | Miscellaneous & Other | remainder | Recipes not fitting above categories |
| 27 | Cooking - Savory | ~85 | Game8 food recipes + Nookipedia |
| 28 | Cooking - Sweet | ~56 | Game8 food recipes + Nookipedia |

Note: Categories 1-26 must have every recipe name present in `manifest.json` recipes. The "Miscellaneous & Other" category is a catch-all for real manifest recipes not fitting the named series. Categories 27-28 (cooking) have no manifest entries and use the `isCooking: true` flag.

**Maple & Acorn sub-seasons note:** Acorn/pine cone recipes are available Sep 1–Dec 10 NH, but maple leaf recipes (maple-leaf pochette, maple-leaf pond stone, etc.) are only available Nov 16–Nov 25 NH. The seasonal guide tab should note this distinction.

### SOURCES (~14 recipe acquisition methods)

Each source:
```js
{
  emoji: '🏠',
  name: 'Villager Crafting',
  description: 'Visit villagers while they are crafting at home...',
  tips: 'Up to 3 unique recipes per day...',
  daily: true,
  limit: '3 per day'
}
```

Sources (verified against Nookipedia):
1. Tom Nook (tutorial tool recipes)
2. Villager Crafting (3/day from villager homes)
3. Message in a Bottle (1/day on beaches)
4. Balloon Presents (seasonal recipes from balloons)
5. Nook's Cranny (daily rotating recipe cards)
6. Nook Miles Exchange (fence recipes + others)
7. Celeste (zodiac, star, wand recipes on clear nights)
8. Pascal (mermaid recipes from scallop trades)
9. Snowboy (frozen/ice recipes from perfect snowboys)
10. Seasonal Events (Zipper/Jack/Franklin/Jingle)
11. Fishing (cooking recipes from catching specific fish)
12. Be a Chef! DIY Recipes+ (2,000 Nook Miles, 7 cooking recipes)
13. Basic Cooking Recipes (4,980 Bells at Nook's Cranny, 8 recipes)
14. Leif / Daisy Mae / Niko (2.0 update sources)

### SEASONAL_SECTIONS (~10 seasonal windows)

Each section:
```js
{
  name: 'Cherry Blossom',
  emoji: '🌸',
  nh: { start: 'Apr 1', end: 'Apr 10' },
  sh: { start: 'Oct 1', end: 'Oct 10' },
  recipes: ['Cherry-blossom bonsai', 'Cherry-blossom branches', ...],
  recipeCount: 14
}
```

Verified date ranges (from Nookipedia):

| Season | NH Dates | SH Dates | Count |
|---|---|---|---|
| Cherry Blossom | Apr 1–10 | Oct 1–10 | 14 |
| Spring Bamboo | Feb 25–May 31 | Aug 25–Nov 30 | 12 |
| Summer Shell | Jun 1–Aug 31 | Dec 1–Feb 28 | 9 |
| Mushroom | Nov 1–30 | May 1–31 | 10 |
| Maple & Acorn (acorns/pine cones) | Sep 1–Dec 10 | Mar 1–Jun 10 | 10 |
| Maple Leaves (sub-window) | Nov 16–25 | May 16–25 | 10 |
| Frozen & Snowflake | Dec 11–Feb 24 | Jun 11–Aug 24 | 26 |
| Bunny Day | Easter week (varies) | Easter week (varies) | 40 |
| Spooky / Halloween | Oct 1–31 | Apr 1–30 | 14 |
| Turkey Day | 4th Thu Nov | 4th Thu Nov | 8 |
| Festive / Toy Day | Dec 15–Jan 6 | Dec 15–Jan 6 | 14 |

Note: Spring Bamboo is a NEW seasonal entry not present in the current implementation. Maple Leaves is split from Maple & Acorn to accurately reflect the narrower availability window.

---

## Section 2: UI Structure

### No architectural changes to the UI.

The existing 3-tab layout is kept:

**Tab 1: "By Category"**
- Expandable category cards with progress bars
- Each recipe: `<AssetImg>` sprite (or emoji fallback for cooking) + checkbox
- DIY recipes: `<AssetImg category="recipes" name={recipe} />`
- Cooking recipes: emoji fallback (🍳 savory, 🍰 sweet) until Nookipedia images are downloaded, then `<AssetImg category="cooking" name={recipe} />`
- Cooking categories appear under a "🍳 Cooking" section header, visually separated from crafting DIY
- Search bar filters across all categories

**Tab 2: "By Source"**
- Vertical list of ~14 source cards (up from 11)
- Each card: emoji, name, description, tips, daily/limit metadata
- All descriptions verified against Nookipedia
- New sources added: Fishing, Be a Chef!, Basic Cooking Recipes, Leif/Daisy Mae/Niko

**Tab 3: "Seasonal Guide"**
- Hemisphere toggle (Northern/Southern)
- Seasonal window cards with verified NH/SH date ranges
- Recipe pill list for each season
- Verified recipe counts

### Storage Compatibility

- Storage key: `acnh-diy-tracker` (unchanged)
- Storage format: `{ learned: ['recipe name', ...] }` (unchanged)
- Existing user progress is preserved
- Recipes that were renamed (e.g. fabricated → real name) will naturally show as unlearned; this is acceptable since the old names were wrong
- **Orphan cleanup:** On load, filter the `learned` set to only include names present in `DIY_CATEGORIES`. This removes old fabricated names from storage, keeping it clean.

### UI Notes

- The refactored `DIYRecipeTracker.jsx` must retain the Google Fonts `<style>` tag with `@import` for all 3 fonts (Playfair Display, DM Sans, DM Mono) per CLAUDE.md rule 7
- All 3 accent colors (green, gold, blue) must remain in the UI per design system

---

## Section 3: Data Verification Strategy

### Phase 1: Build verified data file

1. Extract all 640 recipe names from `manifest.json`
2. Categorize each recipe using Nookipedia/Game8 verified category data
3. For cooking recipes (not in manifest): compile from Game8 food recipes page + Nookipedia item pages
4. Write `diyRecipeData.js` with all verified data

### Phase 2: Verification script

Write `scripts/verify-diy-recipes.js` (not shipped to production):
- Load `manifest.json` recipes
- Load `diyRecipeData.js` DIY_CATEGORIES
- Cross-check every DIY recipe name against manifest
- Report: matched, unmatched, and missing
- Exit with error code if any DIY recipe is not in manifest
- Cooking recipes are exempt from manifest check (they don't have sprites there)

### Phase 3: Cooking images (blocked on Nookipedia API key)

Once API key arrives:
1. Write `scripts/download-cooking-images.js`
2. Use Nookipedia API `/nh/recipes` endpoint to get image URLs
3. Download to `public/assets-web/cooking/` (new directory)
4. Update `manifest.json` with cooking category entries
5. Update `assetHelper.jsx` CATEGORY_MAP: `cooking` → `cooking/`
6. Remove emoji fallbacks from DIYRecipeTracker

### Interim handling (before API key)

- Cooking recipes included in data with verified names
- Emoji fallback (🍳/🍰) shown instead of sprites
- No code changes needed once images arrive — `<AssetImg>` picks them up automatically via manifest

---

## Section 4: What Changes

### New files
- `src/artifacts/diyRecipeData.js` — all verified recipe data
- `scripts/verify-diy-recipes.js` — build-time verification script

### Modified files
- `src/artifacts/DIYRecipeTracker.jsx` — refactored to import from data module, data removed from file

### No changes to
- `src/App.jsx` — same lazy import, same menu entry
- `src/assetHelper.jsx` — no changes until cooking images arrive
- `public/assets-web/manifest.json` — no changes until cooking images arrive

### Version bump
- `package.json`: bump to `1.4.0` (significant data rebuild)
