# Landing Page — Design Spec

**Issue:** #37 — Build landing page with login flow and app showcase
**Date:** 2026-03-15
**Status:** Approved

---

## Routing

- `/` → Landing page (new)
- `/app` → Portal (moved from current `/`)
- Logged-in users visiting `/` see "Go to my tools →" instead of "Sign in"
- Landing page is always accessible, never skipped

## Files

- Create: `src/LandingPage.jsx` — landing page component ('use client')
- Create: `app/app/page.jsx` — portal page (moves current app/page.jsx logic)
- Modify: `app/page.jsx` — renders LandingPage instead of App
- Modify: `app/layout.jsx` — no changes needed (SessionProvider already wraps)

## Hero Section

3D Coverflow carousel:
- Auto-rotating row of real `<AssetImg>` sprites with CSS perspective
- Center item large (80px), items shrink toward edges (50px, 35px)
- Categories rotate: villagers → fish → bugs → flowers → NPCs → music
- Curated sprite names from manifest (real items only)
- CSS `@keyframes` animation, pure CSS transform (no JS animation library)

Content:
- Title: "ACNH Helper Suite" (Playfair Display, #5ec850)
- Tagline: "Your complete island companion" (DM Sans, #c8e6c0)
- Stats bar: "24 tools • 781 recipes • 21,626 sprites" (DM Mono, #d4b030)
- CTA buttons: "Sign in with Google" (filled green) + "Try as Guest" (outlined)
- If logged in: "Go to my tools →" (filled green) replaces both buttons

## Feature Grid

6 category cards in 2x3 grid (3x2 on mobile):

| Category | Emoji | Tools | Sample sprites |
|---|---|---|---|
| Critterpedia | 🐟 | Fish, Bug, Sea Creature Trackers | Bitterling, Monarch Butterfly |
| Museum & Progress | 🏛️ | Museum, Golden Tools, Nook Miles | T. rex Skull, Golden Axe |
| Economy & Planning | 💰 | Turnips, Bells, Nook's, Daily Routine | Turnip, Bell bag |
| Gardening | 🌸 | Flower Calc, Garden Planner, Island Map | Blue Rose, Red-rose plant |
| Special & Art | 🎨 | Gulliver, Art Detector, K.K. Catalogue | Mona Lisa, K.K. Slider |
| Island Life | 🏠 | Villagers, Events, DIY, Celeste, Dreams | Raymond, Isabelle |

Each card clickable → navigates to `/app` with that category.

## Tool Highlights

3 flagship tools with deeper descriptions:

1. **Garden Planner** — "Interactive breeding simulator with real Mendelian genetics. Place flowers, run simulations, discover breeding paths." Sprite: blue-rose plant
2. **DIY Recipe Tracker** — "781 verified recipes across 28 categories. Track what you've learned, find sources." Sprite: ironwood dresser recipe icon
3. **Flower Calculator** — "Datamined genotypes for all 8 species. Predict offspring colors with real probability math." Sprite: flower sprites grid

## Asset Showcase

"Powered by 21,626 datamined game sprites"

Visual mosaic grid showing sprites from multiple categories:
- Row of villager portraits (Raymond, Marshal, Ankha, Marina, Bob)
- Row of fish/bug sprites
- Row of NPC sprites (Isabelle, Tom Nook, K.K. Slider, Celeste, Blathers)
- Fades at edges, center bright

All via `<AssetImg>` — no external images.

## Login Section

"Never lose your island progress"
- Bullet points: Sync across devices, Save your island profile, Track your museum completion
- "Works great without login too — your data stays in your browser"
- CTA: "Sign in with Google" button (Google branded SVG logo)
- Uses `signIn('google', { callbackUrl: '/app' })`

## Footer

- "ACNH Helper Suite v{version}"
- "Open source on GitHub" (link to repo)
- "Game data from Nookipedia" (attribution link)
- "Not affiliated with Nintendo"
- ACNH design system colors, DM Sans font

## Design Rules

- Inline styles only
- ACNH design system (dark green bg, green/gold/blue accents)
- All 3 Google Fonts via @import
- `<AssetImg>` for all game sprites (no emoji substitutes on landing page)
- Mobile responsive (flexbox/grid breakpoints via JS media query or responsive inline styles)
- No fabricated claims or data
