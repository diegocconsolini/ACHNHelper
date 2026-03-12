# ARCHITECTURE.md — ACNH Helper Suite

## System Overview

The ACNH Helper Suite is a single-page application (SPA) built with React 19 and Vite. It bundles 22 standalone tool components behind a sidebar navigation portal. Each tool is a fully self-contained React component with zero external dependencies beyond React itself.

```
┌──────────────────────────────────────────────────────────┐
│                        index.html                         │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                     main.jsx                         │  │
│  │  1. Import storage-polyfill.js (sets window.storage) │  │
│  │  2. Render <App /> inside React.StrictMode           │  │
│  │                                                      │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │                   App.jsx                       │  │  │
│  │  │  ┌──────────┐  ┌────────────────────────────┐  │  │  │
│  │  │  │ Sidebar  │  │     Main Content Area      │  │  │  │
│  │  │  │          │  │                            │  │  │  │
│  │  │  │ 6 groups │  │  <Suspense>                │  │  │  │
│  │  │  │ 22 items │  │    <ActiveComponent />     │  │  │  │
│  │  │  │          │  │  </Suspense>               │  │  │  │
│  │  │  │          │  │                            │  │  │  │
│  │  │  └──────────┘  └────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Boot Sequence

1. **`index.html`** loads — minimal shell with `<div id="root">` and dark background
2. **`main.jsx`** executes:
   - First: imports `storage-polyfill.js` (side effect: attaches `window.storage`)
   - Then: imports React + App, creates root, renders `<App />` in StrictMode
3. **`App.jsx`** renders:
   - Sidebar with 6 collapsible categories, 22 menu items
   - Active component area wrapped in `<Suspense>` with loading fallback
   - Default view: Fish Tracker (activeId = 'fish')
4. **On menu click**: `setActiveId(id)` triggers lazy import of selected artifact chunk

## Component Architecture

### Portal Shell (App.jsx)

```
App.jsx
├── MENU[]                    ← Static array of 6 category groups with 22 items
├── COMPONENTS{}              ← Object mapping component names to lazy imports
├── App()
│   ├── state: activeId       ← Currently selected tool ID (string)
│   ├── state: sidebarOpen    ← Sidebar collapsed/expanded (boolean)
│   ├── Sidebar
│   │   ├── Logo area         ← "🏝️ ACNH Helper Suite"
│   │   ├── Menu scroll       ← Categories → Items (active item gets green border)
│   │   └── Footer            ← "v1.0 — 22/22 tools"
│   ├── Toggle button         ← Fixed position, bottom-left
│   └── Main content
│       └── Suspense → ActiveComponent or Placeholder
└── styles{}                  ← Inline style definitions object
```

### Artifact Components (22 files)

Every artifact follows the same internal structure:

```
ArtifactName.jsx
├── <style> tag               ← @import Google Fonts (Playfair, DM Sans, DM Mono)
├── State declarations        ← useState for all local + persisted data
├── useEffect                 ← Load persisted data from window.storage on mount
├── useEffect                 ← Save to window.storage on data changes
├── Hardcoded data            ← Game data as const arrays/objects (NOT imported)
├── Helper functions          ← Filtering, calculations, formatting
├── Render
│   ├── Header section        ← Title + emoji + description
│   ├── Filter/search bar     ← Tabs, search input, toggle buttons
│   ├── Content grid/list     ← Cards, rows, or interactive elements
│   └── Stats/summary footer  ← Progress counts, totals, streaks
└── styles object             ← Inline CSS as JavaScript object
```

**Key constraint:** Each artifact is 100% self-contained. It does not import from other artifacts, shared modules, or data files. All game data is inlined within the component.

## Data Flow

```
                    ┌─────────────┐
                    │ User Action │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  useState   │  ← React state (ephemeral)
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │                         │
     ┌────────▼────────┐      ┌────────▼────────┐
     │  Render cycle   │      │ window.storage   │  ← Persisted
     │  (visual update)│      │ .set(key, value) │
     └─────────────────┘      └────────┬─────────┘
                                       │
                              ┌────────▼─────────┐
                              │  localStorage    │  ← Browser storage
                              │  (via polyfill)  │     (survives reload)
                              └──────────────────┘
```

### Storage API

The `window.storage` API is async and returns wrapped values:

```javascript
// Write
await window.storage.set('acnh-fish-caught', JSON.stringify([1, 5, 23, 67]));

// Read
const result = await window.storage.get('acnh-fish-caught');
const caught = result ? JSON.parse(result.value) : [];
//                                        ^^^^^^ note: .value property

// Delete
await window.storage.delete('acnh-fish-caught');

// List all keys
const keys = await window.storage.list();
```

**Storage polyfill** (`storage-polyfill.js`) maps this to browser `localStorage`:

```javascript
window.storage = {
  async get(key) {
    const v = localStorage.getItem(key);
    return v !== null ? { value: v } : null;
  },
  async set(key, value) {
    localStorage.setItem(key, value);
  },
  async delete(key) {
    localStorage.removeItem(key);
  },
  async list() {
    return Object.keys(localStorage);
  }
};
```

**Why not localStorage directly?** The artifacts were originally designed for the Claude artifact environment, which provides `window.storage` but not `localStorage`. The polyfill bridges this for browser deployment.

## Build System

### Vite Configuration

```javascript
// vite.config.js — Minimal setup
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()] })
```

### Bundle Strategy

Vite code-splits each lazy-imported artifact into its own chunk:

```
dist/
├── index.html
└── assets/
    ├── index-[hash].js          ← App shell + React runtime
    ├── index-[hash].css         ← (empty — all styles are inline)
    ├── FishTracker-[hash].js    ← Lazy chunk
    ├── BugTracker-[hash].js     ← Lazy chunk
    ├── ...                      ← 20 more lazy chunks
    └── vendor-[hash].js         ← React vendor chunk
```

Each artifact loads on-demand when the user clicks its menu item. This keeps initial load fast (~50KB gzipped for the shell) and defers the bulk of the 13,547 LOC across 22 components.

### Build Metrics

- **Total modules:** 52 (22 artifacts + React + Vite runtime + polyfill + App)
- **Build time:** ~800ms
- **Total source LOC:** 13,547 (artifacts only) + 327 (App.jsx) + 35 (main + polyfill)

## Navigation System

The portal uses a state-based navigation approach (no React Router):

```javascript
// Menu structure
const MENU = [
  {
    category: '🐟 Critterpedia',
    items: [
      { id: 'fish', label: 'Fish Tracker', emoji: '🐟', component: 'FishTracker' },
      // ...
    ],
  },
  // 5 more categories...
];

// Component registry
const COMPONENTS = {
  FishTracker: lazy(() => import('./artifacts/FishTracker.jsx')),
  // 21 more...
};

// Resolution: menu item → component name → lazy component
const activeItem = MENU.flatMap(g => g.items).find(i => i.id === activeId);
const ActiveComponent = COMPONENTS[activeItem.component];
```

### Adding a New Tool

1. **Create the artifact:**
   ```
   src/artifacts/MyNewTool.jsx
   ```
   Must export default a React component with no required props.

2. **Add lazy import** (top of App.jsx):
   ```javascript
   const MyNewTool = lazy(() => import('./artifacts/MyNewTool.jsx'));
   ```

3. **Add to MENU** (in the appropriate category):
   ```javascript
   { id: 'mytool', label: 'My New Tool', emoji: '🔧', component: 'MyNewTool' }
   ```

4. **Add to COMPONENTS:**
   ```javascript
   const COMPONENTS = { ..., MyNewTool };
   ```

5. **Update version counter** in sidebar footer if needed.

## Styling Architecture

### No CSS Files

The entire application uses inline JavaScript styles. There are zero `.css` files. This was a deliberate constraint to keep artifacts portable between Claude's artifact environment and browser deployment.

### Style Object Pattern

Every component defines a `styles` (or `baseStyles`) object at the bottom:

```javascript
const styles = {
  container: {
    maxWidth: 900,
    margin: '0 auto',
    padding: 24,
    fontFamily: "'DM Sans', sans-serif",
    color: '#c8e6c0',
    background: '#0a1a10',
    minHeight: '100vh',
  },
  card: {
    background: 'rgba(12,28,14,0.95)',
    borderRadius: 12,
    border: '1px solid rgba(94,200,80,0.1)',
    padding: 16,
  },
  // ...
};
```

### Dynamic Styles

When combining base styles with dynamic values, always use the spread operator:

```javascript
// CORRECT
<div style={{ ...styles.card, borderColor: isActive ? '#5ec850' : 'transparent' }}>

// WRONG — duplicate style props cause React warnings and only apply the last one
<div style={styles.card} style={{ borderColor: '#5ec850' }}>
```

### Font Loading

Each artifact loads Google Fonts via a `<style>` tag in its JSX:

```jsx
<style>{`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
`}</style>
```

This is repeated in every artifact because they were designed to work standalone. The portal's App.jsx also loads these fonts, so in the bundled app they're only fetched once by the browser (cached after first load).

## Design Token Reference

### Colors

```javascript
const COLORS = {
  bg:          '#0a1a10',              // Page background
  cardBg:      'rgba(12,28,14,0.95)',  // Card/panel background
  green:       '#5ec850',              // Primary accent
  gold:        '#d4b030',              // Secondary accent
  blue:        '#4aacf0',              // Tertiary accent
  textPrimary: '#c8e6c0',             // Main text
  textMuted:   '#5a7a50',             // Labels, secondary text
  textDark:    '#3a5a40',             // Footer, de-emphasized
  border:      'rgba(94,200,80,0.1)', // Subtle borders
  borderHover: 'rgba(94,200,80,0.3)', // Hover state borders
  activeGlow:  'rgba(94,200,80,0.15)',// Active item background
};
```

### Typography

```javascript
const FONTS = {
  header:  "'Playfair Display', serif",   // Weights: 700, 900
  body:    "'DM Sans', sans-serif",        // Weights: 400, 500, 700
  mono:    "'DM Mono', monospace",         // Weights: 400, 500
};
```

### Spacing

Components generally use 4px/8px/12px/16px/20px/24px spacing increments. Cards use 12-16px padding with 12px border-radius.

## Artifact Inventory

### By Category

**🐟 Critterpedia (3 tools)**

| Portal Name | File | LOC | Key Features |
|---|---|---|---|
| FishTracker | FishTracker.jsx | 600 | 80 fish, hemisphere toggle, "Available Now" glow, CJ pricing |
| BugTracker | BugTracker.jsx | 649 | 80 bugs, location grouping, Flick mode, special conditions |
| SeaCreatureTracker | SeaCreatureTracker.jsx | 596 | 40 creatures, speed bars, Pascal badges |

**🏛️ Museum & Progress (3 tools)**

| Portal Name | File | LOC | Key Features |
|---|---|---|---|
| MuseumTracker | MuseumTracker.jsx | 659 | 316 items, 5 progress rings, CSV export, always-real markers |
| GoldenToolTracker | GoldenToolTracker.jsx | 617 | 6 tools, progress counters, golden glow on completion |
| NookMilesTracker | NookMilesTracker.jsx | 539 | 117 achievements, tier progress, miles calculator |

**💰 Economy & Planning (5 tools)**

| Portal Name | File | LOC | Key Features |
|---|---|---|---|
| TurnipTracker | TurnipTracker.jsx | 381 | Price logging, pattern prediction, profit calculator |
| BellCalculator | BellCalculator.jsx | 441 | Income/expense, bells/hour, savings goals, loan payoff |
| NooksCrannyLog | NooksCrannyLog.jsx | 499 | Daily items, hot item tracking, wishlist |
| FiveStarChecker | FiveStarChecker.jsx | 664 | Rating checklist (furniture, fencing, flowers, trees, weeds) |
| DailyRoutine | DailyRoutine.jsx | 478 | Task checklist, streak tracking, midnight auto-reset |

**🌸 Gardening (3 tools)**

| Portal Name | File | LOC | Key Features |
|---|---|---|---|
| FlowerCalculator | FlowerCalculator.jsx | 614 | 8 species, gene display, offspring probabilities, Blue Rose path |
| GardenPlanner | GardenPlanner.jsx | 863 | Grid planner (20x20), templates, breeding pair detection, save/load |
| IslandFlowerMap | IslandFlowerMap.jsx | 583 | Kanban breeding ops, watering log, priority cards |

**🎨 Special & Art (3 tools)**

| Portal Name | File | LOC | Key Features |
|---|---|---|---|
| GulliverTracker | GulliverTracker.jsx | 573 | Gulliver/Gullivarrr dual mode, 50 rewards, rusted parts (30 for Robot Hero) |
| ArtDetector | ArtDetector.jsx | 680 | 43 art pieces, forgery detector, fake tells, Redd mode |
| KKCatalogue | KKCatalogue.jsx | 865 | 98 songs, genre/mood filters, 3 hidden songs, wall planner |

**🏠 Island Life (5 tools)**

| Portal Name | File | LOC | Key Features |
|---|---|---|---|
| VillagerGiftGuide | VillagerGiftGuide.jsx | 575 | 8 personalities, gift scoring, birthday calendar (60+ villagers) |
| SeasonalEventCalendar | SeasonalEventCalendar.jsx | 485 | Real events by month, hemisphere toggle, NPC schedules |
| DIYRecipeTracker | DIYRecipeTracker.jsx | 803 | ~922 recipes, 20 categories, source tracking, daily limits |
| CelesteMeteorTracker | CelesteMeteorTracker.jsx | 680 | 12 zodiac items, 47 Celeste recipes, fragment yield calculator |
| DreamAddressBook | DreamAddressBook.jsx | 703 | DA-XXXX-XXXX-XXXX validation, 14 theme tags, ratings, stats |

## Deployment Architecture

### Vercel (Recommended)

```
GitHub Push → Vercel Build → CDN Distribution
                │
                ├── Framework: Vite (auto-detected)
                ├── Build command: npm run build
                ├── Output: dist/
                ├── Node version: 18+
                └── No environment variables needed
```

The app is fully static — no server-side rendering, no API routes, no environment variables. It can be deployed to any static hosting provider.

### Vercel Configuration

The project includes `vercel` in devDependencies. For manual deployment:

```bash
cd acnh-portal
npx vercel            # Preview deployment
npx vercel --prod     # Production deployment
```

For GitHub integration, set the root directory to `acnh-portal` if the repo contains the full project structure (with ACNH-Helper-Suite alongside it).

### Alternative Hosting

Since the build output is plain static files, it works on:

- **Netlify:** Drop `dist/` folder or connect repo
- **GitHub Pages:** Deploy `dist/` to `gh-pages` branch
- **Cloudflare Pages:** Connect repo, set build command
- **Any static file server:** `npx serve dist/`

## Storage Keys

Each artifact uses namespaced localStorage keys. Here are the known patterns:

| Artifact | Storage Key Pattern | Data Stored |
|---|---|---|
| FishTracker | `acnh-fish-*` | Caught/donated arrays, hemisphere preference |
| BugTracker | `acnh-bug-*` | Caught/donated arrays |
| SeaCreatureTracker | `acnh-sea-*` | Caught arrays |
| MuseumTracker | `acnh-museum-*` | Donation status for all 316 items |
| GoldenToolTracker | `acnh-golden-*` | Tool progress counters |
| NookMilesTracker | `acnh-miles-*` | Achievement tier progress |
| TurnipTracker | `acnh-turnip-*` | Weekly price arrays |
| BellCalculator | `acnh-bell-*` | Income/expense entries |
| NooksCrannyLog | `acnh-nooks-*` | Daily item logs |
| FiveStarChecker | `acnh-fivestar-*` | Checklist states |
| DailyRoutine | `acnh-daily-*` | Task completion, streak count |
| FlowerCalculator | `acnh-flower-*` | Breeding selections |
| GardenPlanner | `acnh-garden-*` | Grid layouts (saved) |
| IslandFlowerMap | `acnh-flowermap-*` | Breeding ops, watering logs |
| GulliverTracker | `acnh-gulliver-*` | Visit logs, reward checklists |
| ArtDetector | `acnh-art-*` | Collection tracking |
| KKCatalogue | `acnh-kk-*` | Owned songs, room assignments |
| VillagerGiftGuide | `acnh-gift-*` | Friendship levels |
| SeasonalEventCalendar | `acnh-events-*` | Hemisphere, completed events |
| DIYRecipeTracker | `acnh-diy-*` | Learned/crafted recipe IDs |
| CelesteMeteorTracker | `acnh-celeste-*` | Meteor logs, recipe collection |
| DreamAddressBook | `acnh-dream-*` | Dream visit entries |

## Performance Considerations

1. **Code splitting** — Each of the 22 artifacts is a separate Vite chunk. Only the active tool is loaded.
2. **No external API calls** — All data is inlined. No network latency for game data.
3. **Minimal dependencies** — Only React and ReactDOM. No state management library, no router, no CSS-in-JS runtime.
4. **Font caching** — Google Fonts are loaded once and cached by the browser across all artifacts.
5. **localStorage is synchronous** — The async wrapper (`window.storage`) adds negligible overhead since localStorage operations are instant for the data sizes involved (< 1MB per tool).

## Future Enhancement Opportunities

These are potential improvements that haven't been built yet:

1. **Data export/import** — Global backup/restore of all localStorage data (JSON file)
2. **Responsive mobile layout** — Currently optimized for 900px+; mobile sidebar needs work
3. **Search across tools** — Global search bar in sidebar to find items across all 22 tools
4. **Theme customization** — Light mode toggle or custom color themes
5. **PWA support** — Service worker for offline access (game data is already local)
6. **Shared data layer** — Extract inlined data to shared imports to reduce bundle size
7. **TypeScript migration** — Add type safety across all components
8. **Testing** — Unit tests for calculation engines (breeding, turnip prediction, bell calculations)
9. **i18n** — Multi-language support for non-English players
10. **URL routing** — Deep links to specific tools (currently state-based only)
