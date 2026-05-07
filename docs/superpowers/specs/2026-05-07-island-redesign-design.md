# Island Redesign — Design Spec

**Date:** 2026-05-07
**Status:** Draft for user review
**Author:** Claude (brainstorm session)

## Background

The current acnh-portal visual design feels "dated and AI-like" per user feedback. It uses a generic dark-mode SaaS aesthetic (`#0a1a10` slate background, hairline borders, mono-font numerals, emoji-list sidebar) that's indistinguishable from any 2022-era developer tool. The user pointed at posthog.com as a reference: a site that pairs dense functional content with a strong illustrated metaphor (hedgehog village + desktop OS) and recognizable hand-crafted personality.

The goal: make acnh-portal feel like a real Animal Crossing island experience, while preserving the dense, functional dashboards that actual island players want.

## Goals

1. Replace the generic dark-mode landing page with a top-down island scene that signals "this is an Animal Crossing site" within 2 seconds.
2. Establish a coherent design system rooted in ACNH's actual in-game UI vocabulary (paper textures, signposts, speech-bubble dialogs, NookPhone-style buttons).
3. Redress the portal shell — sidebar, headers, modals, dialogs, buttons, drawers — to use that design system.
4. Update shared building blocks across all 40 tools so the visual language is consistent everywhere, without reimagining individual tool data interiors.

## Non-goals

- Do **not** turn each tool into a literal in-game artifact (no "Fish Tracker as tackle box," no "Bell Calculator as Tom Nook's ledger"). Form-over-function risk too high; out of scope.
- Do **not** wrap the entire app inside a NookPhone frame. Density loss too severe; out of scope.
- Do **not** introduce NPC hosts (Isabelle as sidebar, Tom Nook for shop tools). Cute but heavy maintenance and adds metaphor layers we already cut.
- Do **not** change tool data structures, table layouts, or any functional behavior. Visual language only.

## Design decisions (validated with user)

### Metaphor structure: two layers

- **Layer 1 — Landing page = island scene.** Top-down isometric island. Buildings (Resident Services, Museum, Nook's Cranny, Able Sisters, Garden, Beach, Campsite) are clickable. Each routes to the relevant section of the portal. Signposts, paths, water, sky.
- **Layer 2 — Portal interior = redressed shell.** Existing sidebar + tool layout structure, redressed in ACNH game-UI design language. No metaphor layered on top — it's a tool, but every pixel reads ACNH.

### Art sourcing: equal mix per component

- **Hand-built SVG** for: island scene (hills, paths, water, buildings), signposts, decorative UI shapes (speech bubbles, dialog boxes, buttons), backgrounds.
- **Existing Nintendo sprites** (the 21,626 in `public/assets-web/`) for: critters in the scene, items in cards, decorative accents.
- **AI-generated** for: texture fills (sand, grass, water surface), atmospheric backgrounds (sky gradients with painted clouds), specific scene elements that SVG can't reach but where a single texture file is enough.

The choice is per-component, not per-phase.

### Transition: phase-by-phase to main, no flags

Each phase ships straight to main when ready. No feature flags, no theme toggle, no `redesign/island` branch. Matches the rest of the project's tempo (auto-commit hook, frequent direct commits). Acceptable that intermediate states look half-redressed.

### Tool redress depth: chrome + shared components

- All shared components (buttons, modals, dialogs, drawers, section headers, hover states, loading states, empty states) get redesigned.
- Tool data interiors (tables, grids, drawers) keep their structure but inherit new fonts/colors/spacing/borders from the design system.
- No tool gets a bespoke metaphor.

## Architecture

### New files

```
src/
├── design/
│   ├── tokens.js              # Design tokens: colors, type, spacing, shadows, radii
│   ├── components/
│   │   ├── Button.jsx         # Island-styled button (replaces inline button styles)
│   │   ├── Dialog.jsx         # Speech-bubble dialog (replaces ConfirmModal/AlertModal)
│   │   ├── Card.jsx           # Paper-textured card
│   │   ├── Signpost.jsx       # Section header as wooden signpost
│   │   ├── Drawer.jsx         # Side drawer with paper texture
│   │   ├── Pill.jsx           # Pill-shaped status / tag
│   │   ├── ProgressRing.jsx   # Wooden-rim progress ring
│   │   └── PaperPanel.jsx     # Generic paper-textured panel
│   └── textures/
│       ├── paper-light.svg
│       ├── paper-dark.svg
│       ├── grass.svg
│       └── ...
├── island/
│   ├── IslandScene.jsx        # Main landing-page island (SVG)
│   ├── Building.jsx           # Clickable building component
│   ├── BuildingTooltip.jsx    # Hover label / preview
│   └── data.js                # Building → route mapping
└── LandingPage.jsx            # REWRITTEN to use IslandScene
```

### Files modified

- `src/App.jsx` — sidebar gets new chrome (signposts as section headers, paper-panel sidebar background), but routing/lazy loading unchanged.
- `src/ConfirmModal.jsx`, `src/AlertModal.jsx` — replaced by `design/components/Dialog.jsx`.
- All 40 artifact files in `src/artifacts/` — touched to swap inline styles for design-system tokens. No structural changes.
- `src/SettingsContext.jsx` — modal theme system (current 3-theme picker) extends to support the new theme.

### Design tokens (preview)

```js
// src/design/tokens.js
export const tokens = {
  color: {
    // Sky / water
    skyDay:    '#86c5da',
    skySunset: '#f4a261',
    water:     '#5b9bd5',
    // Land
    grass:     '#7fb069',
    grassDark: '#5a8050',
    sand:      '#f1d9a0',
    path:      '#c9a875',
    // Wood / paper / sign
    wood:      '#a87850',
    woodDark:  '#704830',
    paper:     '#fef6e4',
    paperDark: '#f0e6c8',
    ink:       '#3a2a1a',
    // Accents (carry forward from current)
    accentLeaf:    '#5ec850',
    accentBell:    '#d4b030',
    accentSky:     '#4aacf0',
    accentBerry:   '#e85a5a',
  },
  font: {
    display:   "'Fink Heavy', 'Playfair Display', serif", // ACNH's logo font, falls back gracefully
    body:      "'Humming', 'DM Sans', sans-serif",        // ACNH's UI font
    handwriting: "'Patrick Hand', cursive",               // Letter / signpost text
    mono:      "'DM Mono', monospace",
  },
  radius: { sm: 6, md: 12, lg: 24, pill: 999 },
  shadow: {
    paper: '0 2px 8px rgba(58, 42, 26, 0.12), 0 1px 2px rgba(58, 42, 26, 0.08)',
    sign:  '4px 6px 12px rgba(58, 42, 26, 0.25)',
  },
};
```

> **Font note:** ACNH's actual fonts (Fink Heavy, Humming Std) are Nintendo property. We fall back to free Google Font equivalents (Playfair Display for display, DM Sans for body, Patrick Hand for handwriting). Fink/Humming are listed as primary for users who happen to have them; the fallbacks are what most users will see.

## Phasing

Each phase is independently shippable. Phases proceed in order — Phase 1 ships before Phase 2 starts.

### Phase 1 — Design system foundation (3-5 days)
- `src/design/tokens.js` — all design tokens in one file
- 3-4 base components: `Button`, `Dialog`, `Card`, `PaperPanel`
- Texture SVGs (paper, grass, wood)
- Storybook-style demo page at `/design` (gated, dev-only) so we can review components in isolation
- **Ships when:** demo page renders, all components have hover/focus/disabled states, tokens documented

### Phase 2 — Landing page island (5-7 days)
- `src/island/IslandScene.jsx` — top-down SVG island
- 7-8 clickable buildings mapped to portal sections
- Time-of-day variation (light/sunset/night based on user's local time, matches ACNH game behavior)
- Existing coverflow → replaced
- Existing landing CTAs (Sign in, Try as Guest) → repositioned as wooden signs
- **Ships when:** posted to main, replaces current landing fully

### Phase 3 — Portal shell (4-6 days)
- `src/App.jsx` sidebar redress: paper background, signpost section headers, leaf-bullet items
- Top header: paper texture, signpost-style version label
- All `ConfirmModal` / `AlertModal` calls migrate to `Dialog`
- Drawer styling for tool detail views
- **Ships when:** the entire portal shell uses design-system components, no remaining inline `style={{...}}` for chrome elements

### Phase 4 — Tool wave 1: Critterpedia + Museum (3-4 days)
Tools: FishTracker, BugTracker, SeaCreatureTracker, MuseumTracker, GoldenToolTracker, NookMilesTracker, GyroidTracker, FossilTracker, PhotoPosterTracker
- Each tool's inline styles swapped for design-system tokens
- Section headers → `<Signpost>`
- Inline buttons → `<Button>`
- Detail drawers → `<Drawer>` with paper texture

### Phase 5 — Tool wave 2: Economy + Gardening + Special (3-4 days)
Tools: TurnipTracker, BellCalculator, NooksCrannyLog, MaterialCalculator, FlowerCalculator, GardenPlanner, IslandFlowerMap, GulliverTracker, ArtDetector, KKCatalogue, FiveStarChecker

### Phase 6 — Tool wave 3: Island Life + Profile + Community (3-4 days)
Tools: Dashboard, DailyRoutine, VillagerGiftGuide, SeasonalEventCalendar, DIYRecipeTracker, CelesteMeteorTracker, DreamAddressBook, LabelFashionHelper, HHACalculator, CatalogTracker, CommunityHub, UserProfile, plus the new 3.0 tools (HotelTracker, IslandTuneCreator, VillagerCompatibility)

### Phase 7 — Polish + cleanup (2-3 days)
- Animation polish: leaf-falling background, time-of-day gradient transitions
- Empty/loading/error states across all tools
- Accessibility audit (focus rings, ARIA, contrast)
- Delete unused old chrome code
- Update screenshots in README

**Total estimate:** 23-33 working days (~5-7 weeks calendar time at typical pace).

## Risk register

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| SVG island scene looks amateur compared to PostHog reference | High | Phase 1 design system review checkpoint; OK to extend Phase 2 by a week if needed |
| Half-redressed site looks worse than current during transition | Medium | Phase ordering: ship landing first (best wow), then shell (most visible), then tools by section. Each phase removes more "old" |
| 40 tools × inline-style swap is tedious and error-prone | Medium | Codemod / search-replace where safe; Phase 4-6 are time-boxed; tests catch regressions |
| Theme system (3 modal themes) conflicts with new design system | Low | Phase 3 explicitly migrates ConfirmModal/AlertModal — modal theme system either extends or is deprecated; decide in Phase 1 |
| User loses trust in pace if Phase 1 takes longer than 5 days | Low | Day-3 checkpoint with screenshots; reset expectations if the design system isn't clicking |

## Open questions for user review

1. **Fonts.** Spec lists Fink Heavy + Humming as primary with Patrick Hand / Playfair / DM Sans as fallbacks. Want to pick alternative free fonts upfront (e.g., Schoolbell, Nunito) or accept the listed fallbacks?
2. **Building set on landing.** Spec lists 7-8 buildings (Resident Services, Museum, Nook's Cranny, Able Sisters, Garden, Beach, Campsite). Should the building list match the existing 6 sidebar sections instead, or use the in-game canonical building set?
3. **Modal theme system.** Currently users can pick 3 modal themes (per-user preference). Does this stay (theme variants of new Dialog) or get deprecated (single new look replaces it)?
4. **Phase 1 demo page.** Spec proposes a dev-only `/design` page for reviewing components. Acceptable, or skip it?

## Success criteria

- A first-time visitor seeing the landing page should know it's an Animal Crossing site without reading any text.
- The portal interior, after redress, should feel coherent with the landing page — same colors, same fonts, same component vocabulary.
- A returning user should not lose any functionality. All 40 tools keep working identically.
- npm audit, npm test, npm run build all pass after every phase.
- Each phase ships to main independently; no merge-day disasters.

## Implementation plan

This spec is the input to writing-plans. After user approval, the next step is to invoke writing-plans to produce a detailed implementation plan covering Phase 1 in full and the structure of Phases 2-7. Issues will be opened on GitHub once writing-plans produces the work breakdown.
