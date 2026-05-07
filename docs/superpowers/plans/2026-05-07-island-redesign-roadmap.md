# Island Redesign — Phases 2-7 Roadmap

**Status:** Roadmap (not detailed implementation plan). Each phase below gets its own detailed plan written when its predecessor ships.

**Spec reference:** `docs/superpowers/specs/2026-05-07-island-redesign-design.md`
**Phase 1 plan:** `docs/superpowers/plans/2026-05-07-island-redesign-phase1.md`

---

## Why a roadmap, not 7 detailed plans

Detail beyond the next phase decays. Component decisions in Phase 1 will inform Phase 2's scene composition. Tool wave 1's experience will refine the wave 2 and 3 plans. Writing 7 detailed plans now means rewriting most of them later. Instead: each phase gets its detailed plan written **when its predecessor lands**, against fresh context.

The roadmap exists so the GitHub issue tree can be fully scaffolded today (epics + leaf-issue stubs) without committing to detail that hasn't been validated.

---

## Phase 2 — Landing page island (5-7 days)

**Goal:** Replace `src/LandingPage.jsx` with a top-down SVG island scene where buildings link to portal sections.

**Sub-issues to open today:**
- Build `IslandScene.jsx` SVG canvas (sky + water + island shape + paths)
- Build `Building.jsx` clickable component with hover label
- Define building → route mapping (matches existing 6 sidebar sections)
- Time-of-day variation (light/sunset/night based on user's local time)
- Replace coverflow on `LandingPage.jsx` with `IslandScene`
- Reposition CTAs (Sign in, Try as Guest) as wooden signs in the scene
- Animation: leaves drifting, water shimmer
- Mobile responsive: scene scales to viewport, buildings stay tappable

**Detailed plan written:** when Phase 1 merges to main.

---

## Phase 3 — Portal shell redress (4-6 days)

**Goal:** Sidebar, header, modals, drawers in `src/App.jsx` use design-system components instead of inline styles.

**Sub-issues to open today:**
- Sidebar background → paper texture
- Sidebar section headers → `Signpost` component (NEW component built in this phase)
- Sidebar nav items → leaf-bullet styling
- Top header → paper-panel styling, signpost version label
- `ConfirmModal.jsx` call sites → `Dialog`
- `AlertModal.jsx` call sites → `Dialog`
- Existing 3-theme modal system: decide keep (theme variants of `Dialog`) or deprecate (single look)
- Detail drawer used by tools → `Drawer` component (NEW)

**New components built in this phase:** `Signpost`, `Drawer`, `Pill`, `ProgressRing`. Added to `src/design/components/`.

**Detailed plan written:** when Phase 2 merges.

---

## Phase 4 — Tool wave 1: Critterpedia + Museum (3-4 days)

**Tools redressed (9):** FishTracker, BugTracker, SeaCreatureTracker, MuseumTracker, GoldenToolTracker, NookMilesTracker, GyroidTracker, FossilTracker, PhotoPosterTracker.

**Per-tool work:**
- Replace inline section headers with `<Signpost>`
- Replace inline buttons with `<Button>`
- Replace detail drawer style with `<Drawer>`
- Inline styles for tables/grids: swap hardcoded colors/fonts/spacing for tokens
- No structural changes; all data flow stays.

**One issue per tool** (9 issues under this epic).

**Detailed plan written:** when Phase 3 merges.

---

## Phase 5 — Tool wave 2: Economy + Gardening + Special (3-4 days)

**Tools redressed (11):** TurnipTracker, BellCalculator, NooksCrannyLog, MaterialCalculator, FlowerCalculator, GardenPlanner, IslandFlowerMap, GulliverTracker, ArtDetector, KKCatalogue, FiveStarChecker.

Same per-tool work as Phase 4. **One issue per tool** (11 issues).

**Detailed plan written:** when Phase 4 merges.

---

## Phase 6 — Tool wave 3: Island Life + Profile + Community (3-4 days)

**Tools redressed (15+):** Dashboard, DailyRoutine, VillagerGiftGuide, SeasonalEventCalendar, DIYRecipeTracker, CelesteMeteorTracker, DreamAddressBook, LabelFashionHelper, HHACalculator, CatalogTracker, CommunityHub, UserProfile, HotelTracker, IslandTuneCreator, VillagerCompatibility.

Same per-tool work. **One issue per tool** (15 issues).

**Detailed plan written:** when Phase 5 merges.

---

## Phase 7 — Polish + cleanup (2-3 days)

**Sub-issues:**
- Animation polish: leaf-falling background on portal, time-of-day gradient transitions
- Empty/loading/error states audited and unified
- Accessibility audit: focus rings, ARIA, contrast (WCAG AA across all redesigned components)
- Delete unused old chrome code (anything in `src/` left unreferenced after waves)
- Update README screenshots
- Lighthouse audit, fix any regressions
- Final spec retrospective in `docs/superpowers/specs/`

**Detailed plan written:** when Phase 6 merges.

---

## Issue tree on GitHub

Will be opened today as part of this planning step:

```
[Master Epic]   Island redesign — full-app visual transformation     (this issue)
├── [Phase 1]   Design system foundation                              (links to Phase 1 plan)
│   ├── leaf:  Design tokens module
│   ├── leaf:  Paper + wood textures
│   ├── leaf:  Button component
│   ├── leaf:  PaperPanel component
│   ├── leaf:  Card component
│   ├── leaf:  Dialog component
│   ├── leaf:  /design showcase route (dev-only)
│   └── leaf:  Phase 1 verify + version bump
├── [Phase 2]   Landing page island                                   (sub-issues stubbed; detail later)
├── [Phase 3]   Portal shell redress                                  (sub-issues stubbed)
├── [Phase 4]   Tool wave 1: Critterpedia + Museum                    (sub-issues stubbed)
├── [Phase 5]   Tool wave 2: Economy + Gardening + Special            (sub-issues stubbed)
├── [Phase 6]   Tool wave 3: Island Life + Profile + Community        (sub-issues stubbed)
└── [Phase 7]   Polish + cleanup                                      (sub-issues stubbed)
```

All issues tagged `redesign` label (created today). Phases 1 also tagged `enhancement`. Master epic gets `redesign` + `enhancement` + a checklist linking to all 7 phase epics. Phase epics get checklists linking to their leaf issues. Leaf issues are atomic — one PR's worth of work each.

**Update protocol:** Whenever a leaf issue is closed, the parent phase epic's checklist gets ticked. When all leaves under a phase are closed, the phase epic closes and the master epic's checklist ticks.
