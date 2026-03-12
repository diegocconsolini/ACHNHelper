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
│   ├── App.jsx             ← Portal shell with sidebar navigation (327 LOC)
│   ├── main.jsx            ← Entry point (imports polyfill first)
│   ├── storage-polyfill.js ← Maps window.storage → localStorage for browsers
│   └── artifacts/          ← 22 standalone JSX components (13,547 LOC total)
├── index.html              ← SPA shell with emoji favicon
├── vite.config.js          ← Minimal config (React plugin only)
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

1. **Single-file JSX** — Each artifact is one `.jsx` file with a default export
2. **No props** — Components take zero props; all data is internal or from storage
3. **Inline styles ONLY** — No CSS files, no Tailwind, no styled-components
4. **No duplicate `style` props** — Use spread: `style={{ ...styles.base, color: 'red' }}`
5. **`window.storage` API** — NOT localStorage/sessionStorage (those break in Claude artifacts)
   ```js
   await window.storage.set('key', JSON.stringify(value))
   const result = await window.storage.get('key')
   const data = result ? JSON.parse(result.value) : defaultValue
   ```
6. **Google Fonts via `@import`** in a `<style>` tag inside each component
7. **Emoji only** — No external images, no SVG files, no icon libraries
8. **Hardcoded game data** — All data inlined as JS arrays/objects, no API calls
9. **900px target width** — Components render cleanly in 900px panels

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
- Emoji as primary visual elements throughout
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

## Data Files

All data files live in `ACNH-Helper-Suite/data/` and are **not imported by the portal** — each artifact has its data inlined. The data files serve as the verified source of truth.

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

## Deployment (Vercel)

The app is configured for Vercel deployment:
- `vercel` CLI is in devDependencies
- Framework: Vite (auto-detected)
- Build command: `vite build`
- Output directory: `dist`
- Install command: `npm install`

To deploy:
```bash
cd acnh-portal
npx vercel --prod
# OR connect the GitHub repo and push to main
```

## Known Patterns & Gotchas

1. **No duplicate style props** — JSX only allows one `style` prop per element. If combining base styles with dynamic ones, always use spread: `style={{ ...styles.base, backgroundColor: dynamicColor }}`

2. **storage-polyfill.js must load first** — `main.jsx` imports it before React. This ensures `window.storage` exists when artifacts call it.

3. **Artifacts are copied in two places** — `ACNH-Helper-Suite/artifacts/` has numbered backups (01-fish-tracker.jsx), `acnh-portal/src/artifacts/` has PascalCase names (FishTracker.jsx). The portal uses PascalCase.

4. **Game data accuracy** — All data was web-verified against Nookipedia, Nintendo Life, and Game8. Don't invent data — research it first.

5. **All 3 Google Fonts required in each artifact** — Every artifact needs its own `<style>` tag with the `@import` for all 3 fonts since they're standalone components.

6. **All 3 accent colors should be used** — Green (#5ec850), Gold (#d4b030), and Blue (#4aacf0) should all appear in each artifact for visual consistency.

## Status

**Build:** 22/22 artifacts complete, clean Vite build (52 modules)
**Portal:** All 22 tools wired and accessible via sidebar
**Data:** 9/9 data files verified
**Deployment:** Ready for Vercel (not yet deployed)
