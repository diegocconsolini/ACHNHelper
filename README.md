# ACNH Helper Suite

A comprehensive web companion app for **Animal Crossing: New Horizons** players. 22 interactive tools covering every aspect of island life — from critter tracking and museum completion to flower genetics, turnip trading, and villager gifting.

Built with React 19 + Vite. Dark botanical UI theme. All game data verified against community wikis.

## Features

**Critterpedia** — Track all 80 fish, 80 bugs, and 40 sea creatures. Filter by hemisphere, time of day, location, and rarity. Mark caught and donated. Highlights what's available right now.

**Museum & Progress** — Unified museum dashboard covering 316 collectibles across 5 wings. Track golden tool unlock progress for all 6 tools. Log Nook Miles achievements across 117 milestones.

**Economy & Planning** — Log weekly turnip prices with pattern prediction (decreasing, small spike, large spike, fluctuating). Calculate bell earnings per hour across activities. Track Nook's Cranny hot items. Check island star rating requirements. Manage daily tasks with streak tracking.

**Gardening** — Breed flowers using real genetics data for all 8 species. Plan garden layouts on an interactive grid (up to 20x20). Track active breeding operations with a Kanban board. Includes the full Blue Rose genetics pathway.

**Special Characters & Art** — Detect art forgeries with detailed fake tells for 43 pieces. Track Gulliver and Gullivarrr visits with their 50 unique rewards. Browse and filter all 98 K.K. Slider songs including the 3 hidden tracks.

**Island Life** — Find optimal gifts for each of the 8 villager personality types. View seasonal events with hemisphere-appropriate calendars. Track progress on ~922 DIY recipes. Log Celeste visits and meteor showers with fragment yield calculations. Save dream island visits with theme tags and ratings.

## Quick Start

```bash
# Install dependencies
cd acnh-portal
npm install

# Start development server
npm run dev
# → Opens at http://localhost:5173

# Build for production
npm run build
# → Output in dist/
```

## Deploy to Vercel

### Option A: Vercel CLI
```bash
cd acnh-portal
npx vercel --prod
```

### Option B: GitHub Integration
1. Push the `acnh-portal/` directory to a GitHub repository
2. Import the project on [vercel.com/new](https://vercel.com/new)
3. Set the root directory to `acnh-portal` if using a monorepo
4. Framework preset will auto-detect as Vite
5. Deploy

**Build settings (if needed):**

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

## Project Structure

```
acnh-portal/
├── src/
│   ├── App.jsx                    # Portal shell + sidebar navigation
│   ├── main.jsx                   # Entry point
│   ├── storage-polyfill.js        # window.storage → localStorage bridge
│   └── artifacts/                 # 22 standalone tool components
│       ├── FishTracker.jsx
│       ├── BugTracker.jsx
│       ├── SeaCreatureTracker.jsx
│       ├── FlowerCalculator.jsx
│       ├── GardenPlanner.jsx
│       ├── IslandFlowerMap.jsx
│       ├── TurnipTracker.jsx
│       ├── BellCalculator.jsx
│       ├── NooksCrannyLog.jsx
│       ├── MuseumTracker.jsx
│       ├── GoldenToolTracker.jsx
│       ├── NookMilesTracker.jsx
│       ├── FiveStarChecker.jsx
│       ├── DailyRoutine.jsx
│       ├── VillagerGiftGuide.jsx
│       ├── GulliverTracker.jsx
│       ├── ArtDetector.jsx
│       ├── KKCatalogue.jsx
│       ├── SeasonalEventCalendar.jsx
│       ├── DIYRecipeTracker.jsx
│       ├── CelesteMeteorTracker.jsx
│       └── DreamAddressBook.jsx
├── index.html
├── vite.config.js
├── package.json
├── CLAUDE.md                      # AI assistant context file
└── ARCHITECTURE.md                # System design documentation
```

## Tech Stack

- **React 19.2** — Functional components, hooks, lazy loading with Suspense
- **Vite 7.3** — Build tool with HMR
- **Inline CSS** — No external stylesheets or CSS frameworks
- **Google Fonts** — Playfair Display, DM Sans, DM Mono
- **localStorage** — Persisted via `window.storage` polyfill

## Design System

The app uses a dark botanical theme inspired by the game's island aesthetic:

| Token | Value | Usage |
|---|---|---|
| Background | `#0a1a10` | Page and sidebar background |
| Card | `rgba(12,28,14,0.95)` | Card surfaces |
| Green | `#5ec850` | Primary accent, active states |
| Gold | `#d4b030` | Secondary accent, highlights |
| Blue | `#4aacf0` | Tertiary accent, links |
| Text | `#c8e6c0` | Primary text |
| Muted | `#5a7a50` | Secondary text, labels |

**Typography:** Playfair Display (headers), DM Sans (body), DM Mono (data/monospace)

## Game Data

All game data is hardcoded and verified against [Nookipedia](https://nookipedia.com), [Game8](https://game8.co/games/Animal-Crossing-New-Horizons), and [Nintendo Life](https://www.nintendolife.com).

| Dataset | Count |
|---|---|
| Fish | 80 |
| Bugs | 80 |
| Sea Creatures | 40 |
| Fossils | 73 pieces (21 multi-part sets + 14 standalone) |
| Art | 43 pieces (30 paintings + 13 statues, with fake tells) |
| Villagers | 406+ (base + 2.0 + Sanrio) |
| K.K. Songs | 98 (including 3 hidden) |
| Flowers | 8 species (full genetics/breeding data) |
| Nook Miles | 117 achievements with tiers |
| DIY Recipes | ~922 across 20 categories |
| Celeste Recipes | 47 (zodiac + star/wand) |

## All 22 Tools

| # | Tool | Category | Description |
|---|---|---|---|
| 01 | Fish Tracker | Critterpedia | 80 fish, hemisphere/time filters, caught/donated tracking |
| 02 | Bug Tracker | Critterpedia | 80 bugs, location grouping, special conditions |
| 03 | Sea Creature Tracker | Critterpedia | 40 sea creatures, speed bars, Pascal badges |
| 04 | Flower Calculator | Gardening | 8-species breeding calculator with real genetics |
| 05 | Garden Planner | Gardening | Interactive grid planner, templates, pair detection |
| 06 | Island Flower Map | Gardening | Kanban breeding tracker, watering log |
| 07 | Turnip Tracker | Economy | Weekly prices, pattern prediction, profit calc |
| 08 | Bell Calculator | Economy | Income/expense tracker, savings goals |
| 09 | Nook's Cranny Log | Economy | Daily shop items, hot item tracking |
| 10 | Museum Tracker | Museum | 316 items, 5 wings, progress rings, CSV export |
| 11 | Golden Tool Tracker | Museum | 6 tools, progress counters, unlock requirements |
| 12 | Nook Miles Tracker | Museum | 117 achievements, tier tracking |
| 13 | Five-Star Checker | Economy | Island rating checklist across 6 categories |
| 14 | Daily Routine | Economy | Task checklist, streak tracking, auto-reset |
| 15 | Villager Gift Guide | Island Life | 8 personality types, gift scoring, birthdays |
| 16 | Gulliver Tracker | Special & Art | Dual mode (Gulliver/Gullivarrr), 50 rewards |
| 17 | Art Detector | Special & Art | Forgery detector, 43 pieces, Redd mode |
| 18 | K.K. Catalogue | Special & Art | 98 songs, genre/mood filters, wall planner |
| 19 | Event Calendar | Island Life | Monthly events, hemisphere toggle, NPC schedules |
| 20 | DIY Recipe Tracker | Island Life | ~922 recipes, 20 categories, source tracking |
| 21 | Celeste & Meteor Tracker | Island Life | Zodiac items, meteor log, fragment calculator |
| 22 | Dream Address Book | Island Life | Dream visit logger, theme tags, ratings |

## Contributing

Each artifact is a self-contained React component. To add a new tool:

1. Create a new `.jsx` file in `src/artifacts/`
2. Follow the design system (dark theme, inline styles, emoji icons, all 3 fonts, all 3 accent colors)
3. Use `window.storage` for any persistent data (not localStorage directly)
4. Add a lazy import + menu entry + COMPONENTS entry in `App.jsx`
5. Run `npm run build` to verify clean compilation

See `CLAUDE.md` for detailed technical rules and `ARCHITECTURE.md` for system design.

## License

This project is for personal/educational use. Animal Crossing: New Horizons is a trademark of Nintendo.
