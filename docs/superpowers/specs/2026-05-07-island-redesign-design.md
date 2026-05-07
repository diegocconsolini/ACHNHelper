# Island Redesign — Design Spec

**Date:** 2026-05-07 (rewritten)
**Status:** Active
**Author:** Claude (brainstorm + post-Phase-2 retrospective)

## What changed in this rewrite

The first version of this spec scoped the work as "redress chrome + tokens, keep tool interiors as data tables." After Phase 1 + 2 v2 shipped, the user looked at the live result and pointed out the obvious: a watercolor hero on top of an unchanged dashboard is **not** "the entire application as a real Animal Crossing island experience." That was the original brief. The first spec scoped it down for cost reasons and sold the cut as a plan. This version is honest about what the brief actually requires.

## Background

User asked: "I would like the entire application to be an real Animal Crossing Island experience." They referenced posthog.com — a site where:

- Hand-drawn illustration is **everywhere**, not just a hero
- A recurring character (Max the hedgehog) appears across pages, doing different things
- Two metaphors (desktop OS + village) layer continuously across the product
- Personality is dense: easter eggs, jokes, irreverent labels, hand-drawn chrome
- Every page reinforces the metaphor, not just the front door

What we shipped through Phase 2 v2: one watercolor illustration on the landing hero, plus a token system. Real lift, but maybe 5% of the actual ask.

## Goals (revised)

1. **Persistent illustrated identity.** A recurring character (Isabelle as Resident Services receptionist, primary host) appears on the sidebar, in empty states, in transitions, in the 404 page. Hand-drawn signage, plaques, and chrome appear across the entire portal — not just the landing.
2. **Every tool framed as in-world.** Tools are not "dashboards with island colors" — they are activities you do on the island, with a host NPC and an island setting. Examples: Bell Calculator is "Tom Nook's ledger." Museum Tracker is "Blathers' notebook." Garden Planner is the actual Garden plot. The data itself stays accurate and dense; only the framing changes.
3. **Continuous metaphor across phases.** Sidebar is a hand-drawn island map / signpost board, not a flat list. Header is a wooden plaque with the active tool's NPC. Modals are NookPhone alerts. Loading states are characters waiting. Empty states are characters with a thought bubble.
4. **Easter eggs density matching PostHog's tone.** A hidden K.K. Slider on the 404. Tom Nook murmuring about loans in a tooltip. Bunny Day decorations in April. The trash can labeled "Trash."

## Non-goals

- Do not change tool data structures, table accuracy, table columns, or any functional behavior.
- Do not gate UX behind login (guest mode preserved).
- Do not commission $3k of human illustration. We use Midjourney heavily — accept ~80% PostHog quality, not 100%.
- Do not remove existing dense data UI in service of cuteness. The information density that real players want stays.

## The single most important decision

**Isabelle is the recurring host.** She is canonical for "Resident Services" (the welcome NPC in actual ACNH), her sprite already exists in the asset library, and she's been on the project's avatar/sidebar for a while. Phase 3 introduces her as a persistent presence. Phases 4-6 give individual tools secondary hosts (Tom Nook for economy tools, Blathers for museum tools, K.K. Slider for music, Celeste for celestial events, etc.).

Each tool gets one host. Each host appears with a hand-drawn portrait + speech bubble welcoming the user, plus reappears in empty/error/loading states for that tool.

## Architecture

### Recurring character system

```
src/characters/
├── index.js                 # Character registry: id, name, role, portrait, voice
├── Greeting.jsx             # <Greeting character="isabelle" mood="welcome" />
├── EmptyState.jsx           # <EmptyState character="blathers" message="No fish caught yet" />
├── LoadingState.jsx         # Animated character waiting (sprite + idle anim)
└── portraits/               # Generated character portrait PNGs/WebPs
    ├── isabelle-welcome.webp
    ├── isabelle-thinking.webp
    ├── tom-nook-counting.webp
    ├── blathers-reading.webp
    ├── kk-slider-strumming.webp
    ├── celeste-stargazing.webp
    └── ... (one per tool host)
```

### Hand-drawn chrome

```
public/island/chrome/
├── signpost-blank.png       # Wooden signpost — used as section header background
├── plaque-wide.png          # Wooden plaque — used as page header background
├── leaf-bullet.png          # Hand-drawn leaf — sidebar nav bullet
├── speech-bubble-paper.png  # Speech bubble — used by Greeting/EmptyState
├── nookphone-frame.png      # Phone-style frame — used for modals
└── ... (10-12 chrome assets total)
```

All generated as a coherent batch in Midjourney to ensure visual consistency. Hand-drawn line work, watercolor fills, transparent backgrounds where possible.

### Tool framing pattern

Every redressed tool follows this structure:

```jsx
<ToolFrame host="tom-nook" location="nooks-cranny">
  <HostGreeting mood="welcome">
    "Yes yes! Looking to check today's turnip prices?"
  </HostGreeting>

  {/* Existing dense data UI — unchanged */}
  <YourExistingDataTable />

  <HostFloatingTip>
    "Sundays are for buying. Daisy Mae visits at dawn."
  </HostFloatingTip>
</ToolFrame>
```

`ToolFrame` provides:
- Header plaque with location name + host portrait
- Background that ties to the island (a corner of Nook's Cranny visible, e.g.)
- Empty / loading / error states with the host character
- Footer with a wooden tool-tray containing tool actions

### Sidebar redesign

Replace the flat list of emoji + label with a **hand-drawn island map**. The 6 sidebar sections become drawn locations on the map:

- 🐟 Critterpedia → small dock with fishing rod
- 🏛️ Museum & Progress → museum building (re-uses Blathers' museum)
- 💰 Economy & Planning → Nook's Cranny + bell pile
- 🌸 Gardening → garden plot
- 🎨 Special & Art → Able Sisters or beach
- 🏠 Island Life → Resident Services tent + villager

Hovering a location lights it up; clicking expands sub-tools as wooden signs underneath. Active tool gets a glowing pin.

This map is drawn once in Midjourney, then enriched with hover hotspots like the landing.

### Pervasive personality

- **404 page** → "K.K. Slider is composing a song. The page you're looking for hasn't been written yet."
- **Loading** → "Resetti is checking your save data."
- **Modal confirms** → "Tom Nook needs a moment of your time."
- **Empty wishlist** → "Timmy and Tommy haven't suggested anything yet."
- **Sign out modal** → "Heading back to the airport? See you again soon!"
- **Trash icon** → labeled "Recycle Bin" with a leaf-pile drawing

## Phasing (rewritten)

Total estimate: **8-12 weeks calendar time**. Earlier estimate of 5-7 weeks was for the watered-down spec.

### Phase 3 — Persistent character system + sidebar map (8-10 days)

The keystone phase. Everything downstream depends on having a working character system + island-map sidebar.

- Generate **6 character portraits** (Isabelle in 2 moods + 4 secondary NPCs) via Midjourney
- Build `src/characters/` registry + `Greeting`, `EmptyState`, `LoadingState` components
- Generate **island-map sidebar art** via Midjourney (top-down map showing the 6 locations)
- Build `src/island/SidebarMap.jsx` — replaces the current `<nav>` in `App.jsx`
- Migrate `ConfirmModal` → speech-bubble dialog (with character portrait)
- Migrate `AlertModal` → speech-bubble dialog
- Replace global header with wooden plaque + active-host portrait
- 404 page redesign with K.K. Slider

**Done when:** logged-in user lands on a portal with a hand-drawn island map sidebar, an active host greeting them, and themed modals throughout. The visual identity is consistent from landing → portal.

### Phase 4 — Tool wave 1: high-personality tools (10-14 days)

Not retokenizing 9 tools. Reframing 5 high-impact tools as in-world activities:

- **Dashboard** ("Available Now") → Isabelle reading from the morning announcement board. Critter cards become posted notices.
- **Bell Calculator** → Tom Nook's ledger. Numbers in handwriting font, on parchment.
- **Turnip Tracker** → Daisy Mae's cart on Sundays, Nook's price board the rest of the week. Graph as wooden trend chart.
- **Museum Tracker** → Blathers' notebook. Each section opens like a journal page.
- **Wishlist** → Tommy & Timmy's order pad.

Each tool gets:
- 1 hosted-greeting (host portrait + speech bubble at top)
- Themed background tied to the location
- Empty/loading/error states with the host
- 1-2 easter-egg tooltips with character voice

### Phase 5 — Tool wave 2: data-heavy tools (8-12 days)

- Fish Tracker → C.J. dockside
- Bug Tracker → Flick at the campsite
- Sea Creature Tracker → diving area at the beach
- Flower Calculator → Leif at the garden shop
- Garden Planner → island garden plot
- DIY Recipe Tracker → Cyrus' workbench
- Daily Routine → Isabelle's morning checklist

Same per-tool pattern as Phase 4.

### Phase 6 — Tool wave 3: long tail + community (8-10 days)

- KK Catalogue → K.K. Slider on the plaza
- Seasonal Events → Celeste under stars
- Villager Gift Guide → mailbox + villagers' photo wall
- Dream Address Book → Luna's bed
- Community Hub → bulletin board outside Resident Services
- Remaining tools (Nook Miles, 5-Star Checker, etc.) get the simplest framing — host + speech bubble + theme background, no full reframe

### Phase 7 — Personality density + polish (6-8 days)

- Easter eggs across the app (the Tom Nook loan tooltip, the K.K. Slider 404, hidden Mr. Resetti, bunny day variations, etc.)
- Animations: Isabelle's idle wave, leaves drifting on backgrounds, time-of-day sky tinting on illustrations
- Sound: optional ACNH-style "click" on hover for major buttons (toggleable)
- Comprehensive a11y audit across the new chrome
- Performance pass — total illustration weight under 2 MB across all generated assets

## Asset budget

Midjourney generations needed across the project (estimate):

- Phase 3: 8-12 generations (6 character portraits + sidebar map + 4 chrome assets, with iteration)
- Phase 4: 10 generations (5 tools × 2 illustrations each)
- Phase 5: 14 generations (7 tools × 2 illustrations each)
- Phase 6: 8 generations (long tail + community)
- Phase 7: 6 generations (easter eggs + 404 + sign-in)

**Total: 45-50 Midjourney generations**, ~$30-50 in subscription costs over the project (already covered by your existing Standard plan).

## Risk register

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Character portraits drift in style across generations | High | First generation locks the style with explicit prompt elements (`watercolor, hand-drawn line work, ACNH-style, soft pastel palette, transparent background`). Subsequent generations re-use the prompt template. Inconsistent ones get re-generated. |
| Sidebar map can't accommodate 30+ tools | Medium | Map shows 6 location-categories, not individual tools. Click a location → wooden signs slide out for the tools in that category. |
| Pervasive illustration hurts performance | Medium | Total asset budget capped at 2 MB. WebP at q82 default. Lazy-load illustrations not in viewport. |
| Each tool's host is overkill for tiny tools | Low | Long-tail tools (Nook Miles, 5-Star Checker) get shared "Isabelle" host treatment, not bespoke characters. |
| Estimate slippage | High | The 8-12 week range is honest but generous. If a phase blows past estimate, we either narrow scope (tools without bespoke art) or extend timeline. We do not ship broken. |

## What "done" actually means

Done = a first-time visitor goes through the whole flow:

1. Lands on the watercolor island → wow
2. Clicks "Try as Guest" → portal loads with hand-drawn sidebar map and Isabelle greeting them
3. Clicks Bell Calculator → Tom Nook's ledger opens, parchment background, calculator in handwriting, "Yes yes" tooltip
4. Refreshes → 404 from a typo'd URL → K.K. Slider on a stage
5. Signs out → "Tom Nook waves goodbye"

…and at no point in that journey does the user see the old dark-mode SaaS chrome. Coherent illustrated metaphor, end to end.

## What we keep from the original spec

- Phase 1 design tokens — still valid, used as a fallback/baseline
- Phase 2 v2 hero illustration — already shipped, still good
- Phase-by-phase ship-to-main pattern, no flags
- The four "open questions" answered (Patrick Hand fonts, etc.) — carry forward

## Implementation plan

This spec is the input to writing-plans. After acknowledgment, the next step is to invoke writing-plans for Phase 3 (the keystone phase) only — not Phase 4-7. Phase 4-7 plans get written when their predecessor lands, since each phase's character work informs the next's.

Issues will be reopened/rewritten on GitHub once Phase 3 plan exists.
