# CLAUDE.md — ACNH Helper Suite

## Project Overview

This is the **ACNH Helper Suite**, a production-ready web application containing 24 interactive tools for Animal Crossing: New Horizons players. It's built as a **Next.js 16 App Router** application with a sidebar portal that lazy-loads each tool. Includes Google OAuth authentication and Supabase PostgreSQL database for user profiles.

**Live portal:** https://acnh-portal.vercel.app
**Master spec:** `ACNH-Helper-Suite/INSTRUCTIONS.md`
**Current version:** `2.2.0`

## Repository Structure

```
acnh-portal/                    ← Production Next.js app (THIS IS THE DEPLOYABLE APP)
├── app/                        ← Next.js App Router
│   ├── layout.jsx              ← Root layout (HTML shell, SessionProvider)
│   ├── page.jsx                ← Entry point (dynamic import, ssr: false)
│   └── api/
│       ├── auth/[...nextauth]/ ← Auth.js route handler
│       ├── profile/            ← GET/PUT user profile
│       ├── sync/[artifactKey]/ ← GET/PUT per-artifact data sync
│       └── user/               ← GET user info, DELETE account, GET export
├── auth.ts                     ← Auth.js 5 config (Google OAuth, JWT)
├── src/
│   ├── App.jsx                 ← Portal shell with sidebar navigation ('use client')
│   ├── SessionWrapper.jsx      ← Client-side SessionProvider wrapper
│   ├── storage-polyfill.js     ← Maps window.storage → localStorage (SSR-guarded)
│   ├── assetHelper.jsx         ← Shared <AssetImg> component and useAssets() hook
│   ├── SettingsContext.jsx     ← Modal theme settings provider
│   ├── ConfirmModal.jsx        ← ACNH-themed confirm dialog (3 themes)
│   ├── AlertModal.jsx          ← ACNH-themed alert dialog
│   ├── modalThemes.js          ← 3 modal theme definitions
│   └── artifacts/              ← 24 tools + supporting data modules
│       ├── FishTracker.jsx             ← Simple artifact (single file)
│       ├── GardenPlanner.jsx           ← Complex artifact (imports from modules)
│       ├── gardenGenetics.js           ← Module: breeding logic
│       ├── gardenData.js               ← Module: verified flower species data
│       ├── gardenSimulation.js         ← Module: breeding simulation engine
│       ├── diyRecipeData.js            ← Module: 781 verified DIY recipes
│       ├── UserProfile.jsx             ← Profile editor (requires login)
│       ├── Settings.jsx                ← Modal theme selector
│       └── ...                         ← 22 more tool components
├── lib/
│   └── supabase.js             ← Server-side Supabase client (service role key)
├── supabase/
│   └── migrations/             ← SQL migration files (pushed via supabase db push)
├── public/
│   ├── assets-web/             ← Optimized WebP sprites (87MB, committed to git)
│   │   └── manifest.json       ← Category → item → file path mapping
│   └── assets/                 ← Original PNGs (885MB, NOT committed)
├── next.config.mjs             ← Next.js config (version injection, unoptimized images)
├── package.json                ← React 19.2, Next.js 16, Auth.js 5, Supabase
├── .env.local                  ← Local env vars (NOT committed — *.local in .gitignore)
└── .env.example                ← Template for required env vars

ACNH-Helper-Suite/              ← Spec, data files, and artifact backups
├── INSTRUCTIONS.md             ← Master technical specification
├── data/                       ← 9 verified game data files
└── docs/                       ← Progress logs and plans
```

## Tech Stack

- **Next.js 16.1.6** — App Router, server-rendered API routes
- **React 19.2.0** — Functional components with hooks only
- **Auth.js 5** (next-auth@beta) — Google OAuth, JWT sessions
- **Supabase** — PostgreSQL database (profiles, artifact sync)
- **No CSS framework** — All styling is inline JavaScript objects
- **No component library** — Everything is custom-built
- **No routing library** — Portal uses state-based navigation within a single page
- **No state management library** — Each artifact is fully self-contained
- **Storage:** `window.storage` API (polyfilled to localStorage in browser)

## Authentication (Auth.js 5)

### How it works
- Auth.js 5 configured in `auth.ts` at project root
- Google OAuth as the only provider
- JWT session strategy (stateless, no session database)
- `SessionProvider` wraps the app via `src/SessionWrapper.jsx` → `app/layout.jsx`
- Sidebar shows login button (logged out) or avatar + name (logged in)

### Key files
- `auth.ts` — Auth.js config (`providers: [Google]`, JWT callbacks, `trustHost: true`)
- `app/api/auth/[...nextauth]/route.ts` — Route handler (`export { GET, POST } from handlers`)
- `src/SessionWrapper.jsx` — Client wrapper for `<SessionProvider>`

### Using auth in components
```jsx
import { useSession, signIn, signOut } from 'next-auth/react';

const { data: session, status } = useSession();
// status: 'loading' | 'authenticated' | 'unauthenticated'
// session.user: { id, name, email, image }
```

### Using auth in API routes
```js
import { auth } from '@/auth';

export async function GET(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... use session.user.id
}
```

### Environment variables (Auth)
```
AUTH_SECRET=<generated via: npx auth secret>
AUTH_GOOGLE_ID=<from Google Cloud Console>
AUTH_GOOGLE_SECRET=<from Google Cloud Console>
```

### Guest mode
The app MUST remain fully functional without login. All 24 tools work for guest users via `window.storage` (localStorage). Authentication is opt-in.

## Supabase Database

### Connection
- **Provider:** Supabase (PostgreSQL) via Vercel Marketplace integration
- **Server client:** `lib/supabase.js` — uses `SUPABASE_SERVICE_ROLE_KEY` (server-side only, NEVER expose to client)
- **Env vars are auto-synced** from Vercel ↔ Supabase integration

### Creating the server client
```js
import { createServerClient } from '@/lib/supabase';

const supabase = createServerClient();
const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId);
```

### Database schema

**profiles** — user island info
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  island_name TEXT,
  hemisphere TEXT CHECK (hemisphere IN ('north', 'south')),
  friend_code TEXT,
  dream_address TEXT,
  native_flower TEXT,
  native_fruit TEXT CHECK (native_fruit IN ('apple', 'cherry', 'orange', 'peach', 'pear')),
  island_rating INTEGER CHECK (island_rating >= 1 AND island_rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**artifact_data** — per-user artifact state sync (Phase 4)
```sql
CREATE TABLE artifact_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  artifact_key TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, artifact_key)
);
```

### Running migrations
```bash
# Supabase CLI handles SSL automatically — do NOT use raw pg client
supabase db push --db-url "$POSTGRES_URL_NON_POOLING"
```

**IMPORTANT:** Never use the `pg` Node.js library to connect directly to Supabase — it has SSL certificate issues. Always use either:
1. **Supabase JS client** (`@supabase/supabase-js`) for data operations
2. **Supabase CLI** (`supabase db push`) for migrations and DDL

### Environment variables (Supabase)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  (SERVER-SIDE ONLY — never expose to client)
POSTGRES_URL_NON_POOLING=postgres://...  (for migrations only)
```

### Security rules
- `SUPABASE_SERVICE_ROLE_KEY` must NEVER be imported or used in client components
- All database access goes through server-side API routes (`app/api/`)
- API routes verify auth session before any database operation
- Row Level Security is enabled on all tables

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/profile` | Required | Get current user's profile |
| PUT | `/api/profile` | Required | Update profile fields (partial) |
| GET | `/api/sync/:artifactKey` | Required | Get synced artifact data |
| PUT | `/api/sync/:artifactKey` | Required | Save artifact data |
| GET | `/api/user` | Required | Get user info + profile |
| DELETE | `/api/user` | Required | Delete account (GDPR) |
| GET | `/api/user/export` | Required | Export all user data (GDPR) |

## Critical Rules for All Artifacts

These rules MUST be followed when modifying or creating artifacts:

1. **One default export per artifact** — Each artifact in `src/artifacts/` has a single default-exported React component. This is the entry point that `App.jsx` lazy-loads.
2. **`'use client'` directive required** — Every `.jsx` component file must have `'use client';` as its first line. Data-only `.js` modules do NOT need it.
3. **Extract logic into modules** — Complex artifacts should split data, utilities, and sub-logic into separate `.js` files under `src/artifacts/`. Keep files under ~500 lines.
4. **No props on the root component** — The default export takes zero props; all data is internal or from storage. Internal sub-components CAN take props.
5. **Inline styles ONLY** — No CSS files, no Tailwind, no styled-components
6. **No duplicate `style` props** — Use spread: `style={{ ...styles.base, color: 'red' }}`
7. **`window.storage` API** — NOT localStorage/sessionStorage directly
   ```js
   await window.storage.set('key', JSON.stringify(value))
   const result = await window.storage.get('key')
   const data = result ? JSON.parse(result.value) : defaultValue
   ```
8. **Google Fonts via `@import`** in a `<style>` tag inside the root component
9. **Use `<AssetImg>` for game sprites** — Prefer real game assets from `public/assets-web/` over emoji
10. **No fabricated game data** — All data from verified sources, no API calls
11. **Responsive layout** — Components should work well in the portal's main content area

## ZERO TOLERANCE: No Fabricated Data

**NEVER fabricate, invent, guess, or hallucinate any game data.** Every item name, price, date, recipe, villager, stat, and description MUST come from verified real sources.

### Data Verification Hierarchy
1. `ACNH-Helper-Suite/data/*.js` — Verified local data files (highest priority)
2. `public/assets-web/manifest.json` — Datamined game file names
3. Nookipedia API/wiki — Community-verified data
4. Nintendo Life / Game8 — Secondary references

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
- ACNH-themed modals (3 selectable themes via Settings page)

## Portal Architecture (App.jsx)

The portal uses a flat component map with lazy loading:

```jsx
// 24 lazy imports at top of file
const FishTracker = lazy(() => import('./artifacts/FishTracker.jsx'));
// ... 23 more

// Menu structure: 7 categories, 24 items
const MENU = [
  { category: '🐟 Critterpedia', items: [...] },
  { category: '🏛️ Museum & Progress', items: [...] },
  { category: '💰 Economy & Planning', items: [...] },
  { category: '🌸 Gardening', items: [...] },
  { category: '🎨 Special & Art', items: [...] },
  { category: '🏠 Island Life', items: [...] },
  { category: '⚙️ Settings', items: [Settings, UserProfile] },
];

// Component lookup map
const COMPONENTS = { FishTracker, BugTracker, ..., Settings, UserProfile };
```

Adding a new tool requires:
1. Create the `.jsx` file in `src/artifacts/` with `'use client'` directive
2. Add a lazy import at the top of `App.jsx`
3. Add an entry to the appropriate `MENU` category
4. Add the component to `COMPONENTS` object

## The 24 Tools

| # | File | Category | What It Does |
|---|---|---|---|
| 01 | FishTracker.jsx | Critterpedia | 80 fish with hemisphere/time/location filters |
| 02 | BugTracker.jsx | Critterpedia | 80 bugs with location grouping, special conditions |
| 03 | SeaCreatureTracker.jsx | Critterpedia | 40 sea creatures with speed bars |
| 04 | FlowerCalculator.jsx | Gardening | 8 species breeding calculator with verified genetics |
| 05 | GardenPlanner.jsx | Gardening | Interactive grid planner with breeding simulation |
| 06 | IslandFlowerMap.jsx | Gardening | Kanban breeding ops tracker |
| 07 | TurnipTracker.jsx | Economy | Weekly price logging, pattern prediction |
| 08 | BellCalculator.jsx | Economy | Income/expense tracker, savings goals |
| 09 | NooksCrannyLog.jsx | Economy | Daily shop item logging |
| 10 | MuseumTracker.jsx | Museum | 316 items across 5 sections, progress rings |
| 11 | GoldenToolTracker.jsx | Museum | 6 golden tools with progress counters |
| 12 | NookMilesTracker.jsx | Museum | 117 achievements with tier tracking |
| 13 | FiveStarChecker.jsx | Economy | Island rating checklist |
| 14 | DailyRoutine.jsx | Economy | Daily task checklist with streaks |
| 15 | VillagerGiftGuide.jsx | Island Life | Personality types, gift preferences, birthdays |
| 16 | GulliverTracker.jsx | Special & Art | Gulliver/Gullivarrr rewards tracker |
| 17 | ArtDetector.jsx | Special & Art | 43 art pieces, forgery detector |
| 18 | KKCatalogue.jsx | Special & Art | 107 K.K. songs with genre/mood filters |
| 19 | SeasonalEventCalendar.jsx | Island Life | Events by month, hemisphere toggle |
| 20 | DIYRecipeTracker.jsx | Island Life | 781 recipes across 28 categories |
| 21 | CelesteMeteorTracker.jsx | Island Life | 47 Celeste recipes, meteor shower log |
| 22 | DreamAddressBook.jsx | Island Life | Dream island visit logger |
| 23 | Settings.jsx | Settings | Modal theme selector (3 themes) |
| 24 | UserProfile.jsx | Settings | Island info, friend code, avatar (requires login) |

## Common Development Commands

```bash
# Development
cd acnh-portal
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check

# Database migrations
supabase db push --db-url "$POSTGRES_URL_NON_POOLING"

# Pull Vercel env vars locally
vercel env pull .env.local

# Verify build
npm run build 2>&1 | tail -15   # Should show "✓ Compiled successfully"
```

## Versioning

The app uses **semantic versioning** displayed in the sidebar footer.

### How it works:
- `package.json` → `"version": "X.Y.Z"`
- `next.config.mjs` → injects `NEXT_PUBLIC_APP_VERSION` from package.json
- `App.jsx` → sidebar footer displays `v{process.env.NEXT_PUBLIC_APP_VERSION}`

### Version bumping rules (MUST follow on every deploy):
- **Patch** (2.0.0 → 2.0.1): Bug fixes, data corrections, typo fixes
- **Minor** (2.1.0 → 2.2.0): New features, new tools, significant UI changes
- **Major** (2.0.0 → 3.0.0): Breaking changes, major redesigns

## Deployment (Vercel)

The app is deployed via Vercel's GitHub integration — **pushing to `main` triggers auto-deploy**.

- Framework: Next.js (auto-detected)
- Build command: `next build` (auto)
- Install command: `npm install` (auto)
- Assets: `public/assets-web/` (87MB optimized WebP) committed to git
- Environment variables: managed via Vercel dashboard + Supabase integration

### Required Vercel environment variables
```
AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
POSTGRES_URL, POSTGRES_URL_NON_POOLING
```

### Deploy process:
```bash
# 1. Bump version in package.json
# 2. Commit changes
# 3. Push to main — Vercel auto-deploys
git push origin main
```

## Known Patterns & Gotchas

1. **No duplicate style props** — Use spread: `style={{ ...styles.base, backgroundColor: dynamicColor }}`
2. **storage-polyfill.js SSR guard** — Wrapped in `typeof window !== 'undefined'` for Next.js compatibility. Imported in `app/page.jsx` before the App component.
3. **All components need `'use client'`** — Every `.jsx` file with React hooks must have `'use client';` as the first line. Pure data modules (`.js`) do not.
4. **Client-only rendering** — The entire app renders client-side via `dynamic(import, { ssr: false })` in `app/page.jsx`. This avoids all SSR issues with `window`/`localStorage`.
5. **Game data accuracy** — All data verified against Nookipedia, Game8, and datamined sources. Don't invent data.
6. **All 3 Google Fonts required in each artifact** — Every artifact needs its own `<style>` tag with the `@import` for all 3 fonts.
7. **All 3 accent colors should be used** — Green (#5ec850), Gold (#d4b030), and Blue (#4aacf0) in each artifact.
8. **Never use `pg` library directly for Supabase** — SSL certificate issues. Use `@supabase/supabase-js` for data ops, `supabase` CLI for migrations.
9. **Path aliases** — `@/` maps to project root via `tsconfig.json`. Use `@/auth`, `@/lib/supabase` in API routes.
10. **SUPABASE_SERVICE_ROLE_KEY is server-only** — Never import `lib/supabase.js` in client components.

## Assets

### Directory Structure
- `public/assets/` — Original PNGs (885MB, 21,655 files). **Not committed.**
- `public/assets-web/` — Optimized WebP copies (87MB). **Committed to git.**
- `public/assets-web/manifest.json` — Maps category → item → file paths.
- `src/assetHelper.jsx` — Shared `<AssetImg>` component.

### Using Assets in Artifacts
```jsx
import { AssetImg } from '../assetHelper';

<AssetImg category="fish" name="Bitterling" size={32} />
<AssetImg category="villagers" name="Raymond" size={48} />
<AssetImg category="recipes" name="ironwood bed" size={22} />
```

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

**Build:** 24 tools complete, clean Next.js build
**Portal:** All 24 tools + Settings + Profile accessible via sidebar
**Auth:** Google OAuth via Auth.js 5 (guest mode preserved)
**Database:** Supabase PostgreSQL (profiles + artifact_data tables)
**Data:** Verified against Nookipedia, Game8, datamined sources
**Assets:** 21,655 PNGs → 21,626 optimized WebPs (885MB → 87MB)
**Deployment:** Deployed on Vercel (https://acnh-portal.vercel.app)
**Version:** 2.2.0
