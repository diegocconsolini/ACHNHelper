# Island Redesign — Phases 3-7 Roadmap (Rewritten)

**Status:** Active. Rewritten 2026-05-07 after Phase 2 v2 shipped and the original spec was found insufficient against the user's brief.

**Spec reference:** `docs/superpowers/specs/2026-05-07-island-redesign-design.md` (rewritten)
**Phase 1 plan:** `docs/superpowers/plans/2026-05-07-island-redesign-phase1.md` (still valid)
**Phase 2 v2 plan:** `docs/superpowers/plans/2026-05-07-island-redesign-phase2-v2.md` (shipped)

---

## What changed in this rewrite

The original roadmap planned phases 3-7 as "redress chrome + tokens, tool interiors keep structure." After Phase 2 v2 shipped, looking at the live site made it obvious that scope didn't deliver "the entire application as a real Animal Crossing island experience." This rewrite gives each phase real illustration density and character work, not just token swaps.

**Estimate revision:** 8-12 weeks total calendar time across phases 3-7 (was 5-7 weeks).

---

## Phase 3 — Persistent character system + sidebar map (8-10 days)

The keystone phase. Everything downstream depends on Phase 3 landing well.

**Asset generation (Midjourney, batch 1):**
- Isabelle portrait — welcome mood (waving, smiling, transparent background)
- Isabelle portrait — thinking mood (hand on chin, thought bubble)
- Tom Nook portrait — counting bells (one secondary host)
- Blathers portrait — reading a journal (one secondary host)
- K.K. Slider portrait — strumming guitar (404 + music tools)
- Celeste portrait — looking at stars (events tools)
- Sidebar island map — top-down hand-drawn map showing 6 location-categories
- Speech bubble texture (paper background, hand-drawn outline, transparent inside)
- Wooden plaque texture (header background)
- Hand-drawn leaf bullet (nav active marker)

~10 generations.

**Code:**
- `src/characters/index.js` — character registry
- `src/characters/Greeting.jsx` — host portrait + speech bubble component
- `src/characters/EmptyState.jsx` — character + thought bubble for empty data
- `src/characters/LoadingState.jsx` — animated character idle
- `src/island/SidebarMap.jsx` — hand-drawn map sidebar (replaces flat list)
- `src/island/MapLocation.jsx` — clickable location with sub-tool flyout
- `src/design/components/SpeechDialog.jsx` — speech-bubble dialog (replaces ConfirmModal/AlertModal)
- `app/not-found.jsx` — 404 page with K.K. Slider
- `src/App.jsx` — sidebar swap, header swap, modal migration

**Done when:**
- Sidebar is a hand-drawn island map, not a list
- Clicking a location reveals sub-tools as wooden signs
- All ConfirmModal/AlertModal call sites use SpeechDialog
- Header is a wooden plaque with the active tool's host portrait
- 404 typo'd URL shows K.K. Slider on stage
- Visual identity is coherent landing → portal

---

## Phase 4 — Tool wave 1: high-personality tools (10-14 days)

5 tools fully reframed as in-world activities. Not retokenized data tables.

**Tools + hosts:**
- Dashboard → Isabelle's morning announcements board
- Bell Calculator → Tom Nook's ledger (parchment background, handwriting numbers)
- Turnip Tracker → Daisy Mae's cart Sundays, Nook's price board weekdays
- Museum Tracker → Blathers' notebook (journal-page transitions)
- Wishlist → Tommy & Timmy's order pad

**Asset generation (Midjourney, batch 2):**
- Tom Nook ledger illustration (background + parchment)
- Daisy Mae sprite (Sunday morning)
- Blathers journal background (open book, ink illustrations)
- Tommy + Timmy at the counter
- Plus character portraits not yet covered

~10 generations.

**Code:**
- `src/island/ToolFrame.jsx` — wraps a tool in host + theme background + footer tray
- `src/characters/HostFloatingTip.jsx` — easter-egg-style tooltip with character voice
- 5 tool refactors (each tool keeps data + columns, gains ToolFrame wrapper + host integrations)

**Done when:**
- All 5 tools have a host greeting on entry
- Empty/loading/error states show the host
- Each has at least one in-character easter-egg tooltip
- Existing 18 Vitest tests still pass; data accuracy unchanged

---

## Phase 5 — Tool wave 2: data-heavy tools (8-12 days)

7 tools, same pattern as Phase 4 but with lighter character integration since each tool gets less individual love.

**Tools + hosts:**
- Fish Tracker → C.J. dockside
- Bug Tracker → Flick at the campsite
- Sea Creature Tracker → diving on the beach
- Flower Calculator → Leif's garden shop
- Garden Planner → the island garden plot (no specific NPC, ambient)
- DIY Recipe Tracker → Cyrus at the workbench
- Daily Routine → Isabelle's checklist clipboard

**Asset generation (batch 3):** ~12 generations (host portraits + 1 background per tool).

**Done when:** all 7 tools framed, host greetings working, no regression.

---

## Phase 6 — Tool wave 3: long tail + community (8-10 days)

The remaining ~18 tools. The pattern compresses: shared "Isabelle introduces this tool" greeting for the smallest tools (Nook Miles, 5-Star Checker, Material Calculator). Bespoke hosts only for the high-personality cases.

**Bespoke hosts:**
- KK Catalogue → K.K. Slider on the plaza
- Seasonal Events → Celeste under stars
- Villager Gift Guide → Pelly at the post office (mailbox)
- Dream Address Book → Luna's dream bed
- Community Hub → bulletin board outside Resident Services

**Shared Isabelle treatment** for: Nook Miles, 5-Star Checker, Material Calculator, HHA Calculator, Catalog Tracker, Hotel Tracker, Island Tune Creator, Villager Compatibility, Photo Poster Tracker, Gulliver Tracker, Art Detector, Celeste Meteor Tracker.

~8 generations + reuse of earlier portraits.

---

## Phase 7 — Personality density + polish (6-8 days)

The "PostHog easter eggs" phase. Where the metaphor stops being a skin and becomes a personality.

**Easter eggs (write voice for):**
- Tom Nook loan reminder tooltip on the Bell Calculator
- Mr. Resetti appearing if user refreshes 5x in 30 seconds
- Bunny Day decorations across the app on April dates
- Halloween orange tinting on Oct 30-31
- Hidden K.K. Slider gig poster somewhere
- "Recycle bin" labeled trash for the wishlist remove action
- Dodo Code field on a "Visit a friend's island" easter-egg page that politely refuses fake codes
- Celeste appearing during a real meteor shower (cron-driven)

**Animations:**
- Leaves drifting in the background
- Sky tinting based on user's local time of day (porting Phase 2's deferred time-of-day to backgrounds)
- Idle character animations (Isabelle's wave, K.K. Slider's strum)

**Sound (optional, toggleable):**
- ACNH-style click on major button hover (off by default; toggle in user settings)

**A11y comprehensive audit:**
- Focus rings on all redesigned components
- ARIA labels on all character portraits
- Reduced-motion preference respected (kills animations)
- Color contrast WCAG AA across all new chrome

**Performance pass:**
- All illustration assets total <2 MB
- Lazy-load offscreen illustrations
- Lighthouse pass with no regressions vs current site

---

## How phase plans get written

**Phase 3 plan written immediately** since it's the keystone — every other phase depends on the character system.

**Phases 4-7 plans written when their predecessor merges.** Each phase's character work informs the next phase's plan, so detail-now risks rewriting.

---

## Issue tree update

The existing GitHub issues (#132 Phase 3, #133-#136 Phases 4-7) need rewriting since their scope no longer matches.

When Phase 3 detailed plan lands:
- Reopen #132 with new scope
- Open new leaf issues under it (likely 8-10 leaves: 6 character portraits + sidebar map + chrome assets + code refactors + 404 + modal migration)

When Phase 4-7 plans land:
- Rewrite each phase epic body
- Close the original phase-4-7 stub leaves (no longer match)
- Open fresh leaves under each phase

The master epic (#129) already references the phases by number — its checklist still works since phase numbering is preserved.
