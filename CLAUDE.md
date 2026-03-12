# CLAUDE.md — ACNH Helper Suite

## Project Overview

This is the **ACNH Helper Suite**, a production-ready web application containing 22 interactive tools for Animal Crossing: New Horizons players. It's built as a Vite + React single-page app with a sidebar portal that lazy-loads each tool.

**Live portal:** `acnh-portal/` directory — run `npm run dev` or `npm run build`
**Master spec:** `ACNH-Helper-Suite/INSTRUCTIONS.md`
**Progress log:** `ACNH-Helper-Suite/docs/progress.md`

## Repository Structure

```
acnh-portal/               ← Production Vite+React app (THIS IS THE DEPLOYABLE APP)
├── src/
│   ├── App.jsx             ← Portal shell with sidebar navigation
│   ├── main.jsx            ← Entry point (imports polyfill first)
│   ├── storage-polyfill.js ← Maps window.storage → localStorage for browsers
│   ├── assetHelper.jsx     ← Shared <AssetImg> component and useAssets() hook
│   └── artifacts/          ← 22 tools: JSX entry points + supporting JS modules
│       ├── FishTracker.jsx         ← Simple artifact (single file)
│       ├── GardenPlanner.jsx       ← Complex artifact (imports from modules below)
│       ├── gardenGenetics.js       ← Module: breeding logic, genotype math
│       ├── gardenData.js           ← Module: verified flower/species data
│       └── ...                     ← Pattern: ArtifactName.jsx + artifactModule.js
├── public/
│   ├── assets-web/         ← Optimized WebP sprites (87MB, committed to git)
│   │   └── manifest.json   ← Category → item → file path mapping
│   └── assets/             ← Original PNGs (885MB, NOT committed)
├── index.html              ← SPA shell with emoji favicon
├── vite.config.js          ← React plugin + build-time version injection
├── package.json            ← React 19.2, Vite 7.3, Vercel CLI
└── dist/                   ← Production build output

ACNH-Helper-Suite/          ← Spec, data files, and artifact backups
├── INSTRUCTIONS.md         ← Master technical specification
├── artifacts/              ← Backup copies of all 22 JSX files (numbered format)
├── data/                   ← 9 verified game data files (2,787 LOC)
│   ├── fish.js             ← 80 fish
│   ├── bugs.js             ← 80 bugs
│   ├── sea-creatures.js    ← 40 sea creatures
│   ├── fossils.js          ← 73 fossil pieces
│   ├── art.js              ← 43 art pieces with fake tells
│   ├── villagers.js        ← 406+ villagers with personality/birthday
│   ├── kk-songs.js         ← 98 K.K. songs
│   ├── flowers.js          ← 8 species with genetics/breeding data
│   └── nook-miles.js       ← 117 Nook Miles achievements
└── docs/
    ├── progress.md         ← Build completion tracker (22/22 done)
    └── plan.md             ← Original batch execution plan
```

## Tech Stack

- **React 19.2.0** — Functional components with hooks only
- **Vite 7.3.1** — Build tool and dev server
- **No CSS framework** — All styling is inline JavaScript objects
- **No component library** — Everything is custom-built
- **No routing library** — Portal uses state-based navigation
- **No state management** — Each artifact is fully self-contained
- **Storage:** `window.storage` API (polyfilled to localStorage in browser)

## Critical Rules for All Artifacts

These rules MUST be followed when modifying or creating artifacts:

1. **One default export per artifact** — Each artifact in `src/artifacts/` has a single default-exported React component. This is the entry point that `App.jsx` lazy-loads.
2. **Extract logic into modules** — Complex artifacts should split data, utilities, and sub-logic into separate `.js` files under `src/artifacts/` (e.g., `gardenGenetics.js`, `gardenData.js`). The main `.jsx` file imports these. Keep files focused and under ~500 lines where practical.
3. **No props on the root component** — The default export takes zero props; all data is internal or from storage. Internal sub-components CAN take props.
4. **Inline styles ONLY** — No CSS files, no Tailwind, no styled-components
5. **No duplicate `style` props** — Use spread: `style={{ ...styles.base, color: 'red' }}`
6. **`window.storage` API** — NOT localStorage/sessionStorage (those break in Claude artifacts)
   ```js
   await window.storage.set('key', JSON.stringify(value))
   const result = await window.storage.get('key')
   const data = result ? JSON.parse(result.value) : defaultValue
   ```
7. **Google Fonts via `@import`** in a `<style>` tag inside the root component
8. **Use `<AssetImg>` for game sprites** — Prefer real game assets from `public/assets-web/` over emoji. Use emoji only as fallback when no asset exists.
9. **No fabricated game data** — All data from verified sources, no API calls
10. **Responsive layout** — Components should work well in the portal's main content area

## ZERO TOLERANCE: No Fabricated Data

**NEVER fabricate, invent, guess, or hallucinate any game data.** This is the #1 most critical rule in this project. Every item name, price, date, recipe, villager, stat, and description MUST come from verified real sources.

### Mandatory Rules

1. **ALL game data must be verified** — Every single data point (item names, prices, availability, materials, unlock conditions, etc.) must be sourced from verified references. NEVER invent or guess.
2. **Preferred approach: ALWAYS look for real data first** — Before writing any data, search for it in:
   - `ACNH-Helper-Suite/data/` (9 verified data files — the primary source of truth)
   - The asset manifest at `public/assets-web/manifest.json` (21,655 real item names from datamined game files)
   - Nookipedia (nookipedia.com) — the authoritative ACNH community wiki
   - Nintendo Life, Game8 guides
3. **If real data cannot be found, DO NOT make it up** — Remove the feature or ask the user. An empty section is better than fabricated data.
4. **Cross-reference item names against the asset manifest** — If a name doesn't exist in `manifest.json`, it's probably wrong.
5. **Fabricated data must be replaced or removed** — If you discover fabricated data in any artifact, the priority is: (a) find the real data and replace it, (b) if real data can't be found, remove the fabricated entries entirely.

### Data Verification Hierarchy
1. `ACNH-Helper-Suite/data/*.js` — Verified local data files (highest priority)
2. `public/assets-web/manifest.json` — Datamined game file names
3. Nookipedia API/wiki — Community-verified data
4. Nintendo Life / Game8 — Secondary references

### What Counts as Fabrication
- Inventing item names that don't exist in the game (e.g., "Zodiac Furniture Aquarius", "Jack Skellington Costume")
- Guessing prices, materials, or availability dates
- Using generic names instead of actual in-game names (e.g., "Desk" instead of "wooden end table")
- Inventing recipe categories or counts without verification

## Communication Rules

- **Never ask questions inline** — If you need to ask the user something, use the `AskUserQuestion` tool. Do not embed questions in your response text.

## Design System

### Colors
- Background: `#0a1a10`
- Cards: `rgba(12,28,14,0.95)`
- Green accent: `#5ec850`
- Gold accent: `#d4b030`
- Blue accent: `#4aacf0`
- Text primary: `#c8e6c0`
- Text muted: `#5a7a50`
- Borders: `rgba(94,200,80,0.1)`

### Typography
- Headers: `'Playfair Display', serif` — weights 700, 900
- Body: `'DM Sans', sans-serif` — weights 400, 500, 700
- Data/Monospace: `'DM Mono', monospace` — weights 400, 500

### UI Patterns
- Hover states on all interactive cards
- Smooth fade-in animations on tab/section changes
- `<AssetImg>` game sprites as primary visuals, emoji as fallback
- Cards with slight border glow on active states

## Portal Architecture (App.jsx)

The portal uses a flat component map with lazy loading:

```jsx
// 22 lazy imports at top of file
const FishTracker = lazy(() => import('./artifacts/FishTracker.jsx'));
// ... 21 more

// Menu structure: 6 categories, 22 items
const MENU = [
  { category: '🐟 Critterpedia', items: [...] },
  { category: '🏛️ Museum & Progress', items: [...] },
  { category: '💰 Economy & Planning', items: [...] },
  { category: '🌸 Gardening', items: [...] },
  { category: '🎨 Special & Art', items: [...] },
  { category: '🏠 Island Life', items: [...] },
];

// Component lookup map
const COMPONENTS = { FishTracker, BugTracker, ... };
```

Adding a new tool requires:
1. Create the `.jsx` file in `src/artifacts/`
2. Add a lazy import at the top of `App.jsx`
3. Add an entry to the appropriate `MENU` category
4. Add the component to `COMPONENTS` object

## The 22 Tools

| # | File in Portal | Category | What It Does |
|---|---|---|---|
| 01 | FishTracker.jsx | Critterpedia | 80 fish with hemisphere/time/location filters, caught/donated tracking |
| 02 | BugTracker.jsx | Critterpedia | 80 bugs with location grouping, special conditions, Flick mode |
| 03 | SeaCreatureTracker.jsx | Critterpedia | 40 sea creatures with speed bars, Pascal badges |
| 04 | FlowerCalculator.jsx | Gardening | 8 species breeding calculator with real genetics data, Blue Rose path |
| 05 | GardenPlanner.jsx | Gardening | Interactive grid planner (up to 20x20), templates, breeding pair detection |
| 06 | IslandFlowerMap.jsx | Gardening | Kanban breeding ops tracker, watering log, priority cards |
| 07 | TurnipTracker.jsx | Economy | Weekly price logging, pattern prediction, profit calculator |
| 08 | BellCalculator.jsx | Economy | Income/expense tracker, savings goals, loan payoff |
| 09 | NooksCrannyLog.jsx | Economy | Daily shop item logging, hot item tracking, wishlist |
| 10 | MuseumTracker.jsx | Museum | 316 items across 5 sections, progress rings, CSV export |
| 11 | GoldenToolTracker.jsx | Museum | 6 golden tools with progress counters, unlock requirements |
| 12 | NookMilesTracker.jsx | Museum | 117 achievements with tier tracking, miles calculator |
| 13 | FiveStarChecker.jsx | Economy | Island rating checklist (furniture, fencing, flowers, trees, weeds) |
| 14 | DailyRoutine.jsx | Economy | Daily task checklist with streak tracking, auto-reset at midnight |
| 15 | VillagerGiftGuide.jsx | Island Life | 8 personality types, gift preferences, birthday calendar, friendship points |
| 16 | GulliverTracker.jsx | Special & Art | Gulliver/Gullivarrr dual mode, 50 rewards, rusted parts tracker |
| 17 | ArtDetector.jsx | Special & Art | 43 art pieces, forgery detector with fake tells, Redd mode |
| 18 | KKCatalogue.jsx | Special & Art | 98 K.K. songs, genre/mood filters, 3 hidden songs, wall planner |
| 19 | SeasonalEventCalendar.jsx | Island Life | Real events by month, hemisphere toggle, NPC schedules |
| 20 | DIYRecipeTracker.jsx | Island Life | ~922 recipes across 20 categories, source tracking |
| 21 | CelesteMeteorTracker.jsx | Island Life | 12 zodiac items, 47 Celeste recipes, meteor shower log |
| 22 | DreamAddressBook.jsx | Island Life | Dream island visit logger, DA-format validation, theme tags |

## Modular Architecture

Artifacts follow a **modular pattern** — complex tools split into multiple files for maintainability:

### File Organization
```
src/artifacts/
├── SimpleTracker.jsx          ← Small artifact: single file, data inlined
├── GardenPlanner.jsx          ← Complex artifact: entry point (UI + state)
├── gardenGenetics.js          ← Pure logic module (breeding math, Mendelian inheritance)
├── gardenData.js              ← Data module (verified flower species, genotypes)
├── gardenComponents.jsx       ← UI sub-components (grid cell, palette, etc.)
└── gardenConstants.js         ← Shared constants (colors, grid sizes, etc.)
```

### Rules
- **Entry point**: One `.jsx` file per artifact with a `default export` — this is what `App.jsx` lazy-loads
- **Module naming**: Use camelCase prefixed with the artifact name (e.g., `gardenGenetics.js`, `gardenData.js`)
- **Keep files under ~500 lines** — if a file is growing large, extract a module
- **Simple artifacts stay single-file** — don't split a 200-line tracker into 5 files for no reason
- **Shared utilities go in `src/`** — e.g., `assetHelper.jsx` is shared across all artifacts
- **Data modules export plain JS** — arrays/objects, no React, no side effects

### When to Split
Split when an artifact has:
- Large hardcoded data arrays (>100 items) → extract to `*Data.js`
- Complex business logic (genetics, calculations) → extract to `*Logic.js` or `*Utils.js`
- Reusable sub-components → extract to `*Components.jsx`
- Multiple feature tabs with distinct logic → each tab can be its own module

### When NOT to Split
- Artifact is under 300 lines total
- Data is a small lookup table (<50 entries)
- Logic is a few helper functions tightly coupled to the UI

## Data Files

All data files live in `ACNH-Helper-Suite/data/` and serve as the **verified source of truth**. Artifacts can either inline their data or import from extracted data modules — both are acceptable.

| File | Records | Key Fields |
|---|---|---|
| fish.js | 80 | name, location, shadowSize, sellPrice, hemisphereMonths, hours, rarity |
| bugs.js | 80 | name, location, sellPrice, hemisphereMonths, hours, rarity, conditions |
| sea-creatures.js | 40 | name, shadowSize, movementSpeed, sellPrice, hemisphereMonths |
| fossils.js | 73 | name, genus, partType, sellPrice (21 multi-part sets + 14 standalone) |
| art.js | 43 | name, type, isFakeable, fakeTells (16 always-real, 27 with fakes) |
| villagers.js | 406+ | name, species, personality, birthday, giftPreferences |
| kk-songs.js | 98 | name, genre, mood, hidden (3 hidden songs) |
| flowers.js | 8 species | genetics, breeding tables, offspring probabilities |
| nook-miles.js | 117 | name, category, tiers with milestones and miles rewards |

## Common Development Commands

```bash
# Development
cd acnh-portal
npm run dev          # Start Vite dev server (HMR on http://localhost:5173)
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
npm run lint         # ESLint check

# Verify build works
npm run build 2>&1 | tail -5   # Should show "✓ built in ~800ms"
```

## Versioning

The app uses **semantic versioning** displayed in the sidebar footer. The version is read from `package.json` at build time via Vite's `define` config.

### How it works:
- `package.json` → `"version": "X.Y.Z"`
- `vite.config.js` → injects `__APP_VERSION__` global at build time
- `App.jsx` → sidebar footer displays `v{__APP_VERSION__}`

### Version bumping rules (MUST follow on every deploy):
- **Patch** (1.1.0 → 1.1.1): Bug fixes, data corrections, typo fixes
- **Minor** (1.1.0 → 1.2.0): New features, new tools, significant UI changes
- **Major** (1.0.0 → 2.0.0): Breaking changes, major redesigns

### Before every commit that will be deployed:
1. Bump the `"version"` field in `package.json` according to the rules above
2. The sidebar footer will automatically show the new version after build
3. Never skip the version bump — every deployed change must have a new version

## Deployment (Vercel)

The app is deployed via Vercel's GitHub integration — **pushing to `main` triggers auto-deploy**.

- Framework: Vite (auto-detected)
- Build command: `vite build`
- Output directory: `dist`
- Install command: `npm install`
- Assets: `public/assets-web/` (87MB optimized WebP) is committed to git and served statically

### Deploy process:
```bash
# 1. Bump version in package.json
# 2. Commit changes
# 3. Push to main — Vercel auto-deploys
git push origin main
```

## Known Patterns & Gotchas

1. **No duplicate style props** — JSX only allows one `style` prop per element. If combining base styles with dynamic ones, always use spread: `style={{ ...styles.base, backgroundColor: dynamicColor }}`

2. **storage-polyfill.js must load first** — `main.jsx` imports it before React. This ensures `window.storage` exists when artifacts call it.

3. **Artifacts are copied in two places** — `ACNH-Helper-Suite/artifacts/` has numbered backups (01-fish-tracker.jsx), `acnh-portal/src/artifacts/` has PascalCase names (FishTracker.jsx). The portal uses PascalCase.

4. **Game data accuracy** — All data was web-verified against Nookipedia, Nintendo Life, and Game8. Don't invent data — research it first.

5. **All 3 Google Fonts required in each artifact** — Every artifact needs its own `<style>` tag with the `@import` for all 3 fonts since they're standalone components.

6. **All 3 accent colors should be used** — Green (#5ec850), Gold (#d4b030), and Blue (#4aacf0) should all appear in each artifact for visual consistency.

## Assets

### Directory Structure
- `public/assets/` — Original PNGs (885MB, 21,655 files, 34 categories). Source of truth. **Not committed to git.**
- `public/assets-web/` — Optimized WebP copies (87MB, resized per category). **Committed to git** and served by Vercel.
- `public/assets-web/manifest.json` — Maps every category → item → file paths.
- `src/assetHelper.jsx` — Shared `<AssetImg>` component and `useAssets()` hook.

### Downloading Assets
Assets come from [Norviah/acnh-images](https://github.com/Norviah/acnh-images) (MIT license).
Clone to a sibling directory, then copy images into `public/assets/`:
```bash
git clone https://github.com/Norviah/acnh-images.git ../acnh-images
cp -R ../acnh-images/images/* public/assets/
```

### Generating Optimized Web Assets
```bash
python3 scripts/optimize-assets.py
```
Requires Pillow: `pip3 install Pillow`

### Using Assets in Artifacts
```jsx
import { AssetImg } from '../assetHelper';

// In JSX — NO fallback emoji, just the sprite:
<AssetImg category="fish" name="Bitterling" size={32} />
<AssetImg category="villagers" name="Raymond" size={48} />
<AssetImg category="art" name="academic painting" size={40} />
<AssetImg category="music" name="K.K. Bubblegum" size={48} imageType="Album Image" />
```

The `<AssetImg>` component:
- Loads the manifest once (cached globally across all artifacts)
- Does case-insensitive name lookup
- Renders nothing if image unavailable (no emoji fallback)
- Uses `loading="lazy"` for performance

### Asset Naming
- Fish/bugs/sea creatures: lowercase dirs (e.g., `bitterling`, `common butterfly`)
- Villagers: title case dirs (e.g., `Bob`, `Raymond`)
- Art: lowercase dirs (e.g., `academic painting`)
- Music: title case dirs (e.g., `Agent K.K.`)
- Flowers: pattern `{color}-{species} plant` in `other/` (e.g., `red-rose plant`)

### Category Mapping (`CATEGORY_MAP` in assetHelper.jsx)
| Artifact Category | Asset Directory |
|---|---|
| fish | `fish/` |
| bugs | `insects/` |
| sea-creatures | `sea-creatures/` |
| fossils | `fossils/` |
| art | `art/` |
| music | `music/` |
| villagers | `villagers/` |
| npcs | `special-npcs/` |
| tools | `tools/` |
| recipes | `recipes/` |

## Status

**Build:** 22/22 artifacts complete, clean Vite build (53 modules)
**Portal:** All 22 tools wired and accessible via sidebar
**Data:** 9/9 data files verified
**Assets:** 21,655 PNGs → 21,626 optimized WebPs (885MB → 87MB)
**Deployment:** Deployed on Vercel (https://acnh-portal.vercel.app)
