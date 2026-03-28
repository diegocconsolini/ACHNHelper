# CLAUDE.md — ACNH Helper Suite

## Project Overview

This is the **ACNH Helper Suite**, a production-ready web application containing **32 interactive tools** for Animal Crossing: New Horizons players. Built as a **Next.js 16 App Router** application with a sidebar portal that lazy-loads each tool. Includes Google OAuth authentication, Supabase PostgreSQL database, Nookipedia API integration, community features, and an admin panel.

**Live portal:** https://acnh-portal.vercel.app
**Current version:** `5.0.0`

## Repository Structure

```
acnh-portal/
├── app/
│   ├── layout.jsx              ← Root layout (HTML shell, SessionProvider)
│   ├── page.jsx                ← Landing page
│   ├── app/page.jsx            ← Portal entry (dynamic import, ssr: false)
│   └── api/
│       ├── auth/[...nextauth]/ ← Auth.js route handler
│       ├── nookipedia/[...path]/ ← Nookipedia API proxy (1hr cache)
│       ├── profile/            ← GET/PUT user profile
│       ├── sync/[artifactKey]/ ← GET/PUT per-artifact data sync
│       ├── user/               ← GET user info, DELETE account, GET export
│       ├── community/          ← Community hub routes (publish, favorite, report, block, upload)
│       └── admin/              ← Admin panel routes (users, reports, stats, audit)
├── auth.ts                     ← Auth.js 5 config (Google OAuth, JWT)
├── src/
│   ├── App.jsx                 ← Portal shell with sidebar navigation ('use client')
│   ├── LandingPage.jsx         ← Public landing page with 3D coverflow hero
│   ├── SessionWrapper.jsx      ← Client-side SessionProvider wrapper
│   ├── storage-polyfill.js     ← Maps window.storage → localStorage (SSR-guarded)
│   ├── assetHelper.jsx         ← Shared <AssetImg> component and useAssets() hook
│   ├── SettingsContext.jsx     ← Modal theme settings provider (per-user via database)
│   ├── ConfirmModal.jsx        ← ACNH-themed confirm dialog (3 themes)
│   ├── AlertModal.jsx          ← ACNH-themed alert dialog
│   ├── modalThemes.js          ← 3 modal theme definitions
│   └── artifacts/              ← 32 tool components + 5 data modules
│       ├── Dashboard.jsx               ← Available Now + Leaving/Coming critters
│       ├── FishTracker.jsx             ← 80 fish with detail drawer
│       ├── BugTracker.jsx              ← 80 bugs with detail drawer
│       ├── SeaCreatureTracker.jsx      ← 40 sea creatures
│       ├── FlowerCalculator.jsx        ← 8 species with verified genetics
│       ├── GardenPlanner.jsx           ← Interactive breeding simulator
│       ├── IslandFlowerMap.jsx         ← Kanban breeding ops tracker
│       ├── TurnipTracker.jsx           ← SVG price graph + pattern predictor
│       ├── BellCalculator.jsx          ← Income/expense tracker
│       ├── NooksCrannyLog.jsx          ← Daily shop item logging
│       ├── Wishlist.jsx                ← Cross-tool wishlist
│       ├── MaterialCalculator.jsx      ← Recursive recipe material breakdown
│       ├── MuseumTracker.jsx           ← 316 items, 5 sections, progress rings
│       ├── GoldenToolTracker.jsx       ← 6 golden tools
│       ├── NookMilesTracker.jsx        ← 99 verified achievements
│       ├── GyroidTracker.jsx           ← 36 gyroids with sound filters
│       ├── PhotoPosterTracker.jsx      ← 966 villager photos + posters
│       ├── FiveStarChecker.jsx         ← Island rating checklist
│       ├── DailyRoutine.jsx            ← Daily task checklist with streaks
│       ├── VillagerGiftGuide.jsx       ← 417 villagers + Gift Finder tab
│       ├── GulliverTracker.jsx         ← Gulliver/Gullivarrr rewards
│       ├── ArtDetector.jsx             ← 43 art pieces, forgery detector
│       ├── KKCatalogue.jsx             ← 107 K.K. songs with detail drawer
│       ├── SeasonalEventCalendar.jsx   ← Events by month, hemisphere toggle
│       ├── DIYRecipeTracker.jsx        ← 781 recipes, detail drawer
│       ├── CelesteMeteorTracker.jsx    ← 47 Celeste recipes, meteor log
│       ├── DreamAddressBook.jsx        ← Dream island visit logger
│       ├── LabelFashionHelper.jsx      ← 11 Label themes, outfit builder
│       ├── HHACalculator.jsx           ← HHA score calculator
│       ├── CatalogTracker.jsx          ← 3,600+ furniture/clothing catalog
│       ├── CommunityHub.jsx            ← Friend code / dream address sharing
│       ├── UserProfile.jsx             ← Profile + theme settings (login required)
│       ├── gardenData.js               ← Verified flower genetics
│       ├── gardenGenetics.js           ← Breeding logic
│       ├── gardenSimulation.js         ← Breeding simulation engine
│       ├── diyRecipeData.js            ← 781 verified DIY recipes
│       └── villagerData.js             ← 417 verified villagers
├── lib/
│   └── supabase.js             ← Server-side Supabase client (service role key)
├── supabase/
│   └── migrations/             ← SQL migration files
├── public/
│   ├── assets-web/             ← Optimized WebP sprites (87MB, committed)
│   │   └── manifest.json       ← Category → item → file path mapping
│   └── assets/                 ← Original PNGs (885MB, NOT committed)
├── next.config.mjs             ← Next.js config
├── vercel.json                 ← Vercel framework config
├── package.json                ← React 19.2, Next.js 16, Auth.js 5, Supabase
└── .env.example                ← Template for required env vars
```

## Tech Stack

- **Next.js 16.1.6** — App Router, API routes, server components
- **React 19.2.0** — Functional components with hooks only
- **Auth.js 5** (next-auth@beta) — Google OAuth, JWT sessions
- **Supabase** — PostgreSQL database (profiles, community, artifact sync)
- **Nookipedia API** — Real-time game data (fish, bugs, recipes, villagers, etc.)
- **No CSS framework** — All styling is inline JavaScript objects
- **No component library** — Everything custom-built
- **Storage:** `window.storage` API (polyfilled to localStorage)

## Nookipedia API

### Proxy Route
All API calls go through our server-side proxy to keep the API key secret:
```
Client → /api/nookipedia/nh/fish/Coelacanth → proxy adds API key → api.nookipedia.com
```

- **Proxy:** `app/api/nookipedia/[...path]/route.js`
- **Cache:** 1 hour in-memory, max 500 entries
- **Full reference:** `docs/nookipedia-api-reference.md`
- **Key endpoints:** `/nh/fish`, `/nh/bugs`, `/nh/sea`, `/nh/art`, `/nh/recipes`, `/nh/furniture`, `/nh/clothing`, `/nh/interior`, `/nh/gyroids`, `/nh/photos`, `/nh/events`, `/villagers`

### Using in artifacts
```jsx
// Fetch on-demand (e.g., in detail drawer)
useEffect(() => {
  if (selectedItem) {
    fetch(`/api/nookipedia/nh/fish/${encodeURIComponent(selectedItem.name)}`)
      .then(res => res.json())
      .then(setDetails);
  }
}, [selectedItem]);
```

## Authentication (Auth.js 5)

- Auth.js 5 in `auth.ts`, Google OAuth only
- JWT sessions (stateless), `trustHost: true` for Vercel
- `SessionProvider` via `src/SessionWrapper.jsx` → `app/layout.jsx`
- **Guest mode always works** — all tools function without login

## Supabase Database

- **Provider:** Supabase via Vercel Marketplace
- **Server client:** `lib/supabase.js` (service role key, NEVER expose to client)
- **Migrations:** `supabase db push --db-url "$POSTGRES_URL_NON_POOLING"`
- **Never use `pg` library** — SSL issues. Use Supabase JS client or CLI.

### Tables
- `profiles` — island info, hemisphere, friend code, dream address, modal_theme
- `artifact_data` — per-user per-artifact JSONB sync
- `shared_profiles` — community directory listings
- `favorites` — user favorites for community
- `friend_requests` — mutual friend connections
- `reports` — content moderation reports
- `blocked_users` — user blocks

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/nookipedia/[...path]` | No | Nookipedia API proxy (1hr cache) |
| GET/PUT | `/api/profile` | Required | User profile CRUD |
| GET/PUT | `/api/sync/:artifactKey` | Required | Per-artifact data sync |
| GET/DELETE | `/api/user` | Required | User info / account deletion |
| GET | `/api/user/export` | Required | GDPR data export |
| GET/POST/DELETE | `/api/community/*` | Varies | Community features |
| GET/POST/PUT | `/api/admin/*` | Admin | Admin panel |

## Critical Rules for All Artifacts

1. **`'use client'` directive required** on all `.jsx` files
2. **Inline styles ONLY** — no CSS files, no Tailwind
3. **`window.storage` API** — not localStorage directly
4. **Google Fonts via `@import`** in `<style>` tag per artifact
5. **`<AssetImg>` for sprites** — prefer real assets over emoji
6. **No fabricated game data** — verified sources only
7. **No `maxWidth` on containers** — artifacts fill available width
8. **`outline: 'none'`** on all clickable elements
9. **Specific `transition` properties** — never `transition: 'all'`
10. **Static data at module scope** — not inside component functions

## Design System

### Colors
- Background: `#0a1a10` | Cards: `rgba(12,28,14,0.95)`
- Green: `#5ec850` | Gold: `#d4b030` | Blue: `#4aacf0`
- Text: `#c8e6c0` | Muted: `#5a7a50` | Borders: `rgba(94,200,80,0.1)`

### Typography
- Headers: `'Playfair Display', serif` (700, 900)
- Body: `'DM Sans', sans-serif` (400, 500, 700)
- Mono: `'DM Mono', monospace` (400, 500)

### UI Patterns
- Side drawer for detail views (slides from right, 420px desktop)
- Hover: border glow + `translateY(-2px) scale(1.02)`
- ACNH-themed modals (3 selectable themes per user)
- Progress rings for collection tracking

## Common Development Commands

```bash
npm run dev                    # Dev server (localhost:3000)
npm run build                  # Production build
npm run start                  # Start production
supabase db push --db-url "$POSTGRES_URL_NON_POOLING"  # Run migrations
vercel env pull .env.local     # Pull env vars
```

## Environment Variables

```
AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
POSTGRES_URL, POSTGRES_URL_NON_POOLING
NOOKIPEDIA_API_KEY
ADMIN_EMAILS
```

## Deployment

Push to `main` → Vercel auto-deploys. Framework: Next.js (auto-detected via `vercel.json`).

## Status

**Version:** 5.0.0
**Tools:** 32 (30 player tools + CommunityHub + UserProfile)
**Build:** Clean Next.js build
**Auth:** Google OAuth (guest mode preserved)
**Database:** Supabase PostgreSQL (7 tables)
**API:** Nookipedia proxy with 1hr cache
**Data:** All verified against Nookipedia API + datamined sources
**Assets:** 21,626 optimized WebP sprites (87MB)
**Deployment:** Vercel (https://acnh-portal.vercel.app)
