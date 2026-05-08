# Phase 6 — Tool Wave 3: Long Tail + Community (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans

**Goal:** Wrap the remaining 28 unwrapped artifacts with `ToolFrame`. After Phase 6, all 32 tools (40 if you count multi-mode) ship with hosted greetings + themed backgrounds. The high-personality bespoke cases get dedicated hosts/backgrounds; the long-tail tools share an "Isabelle introduces this tool" treatment with no extra Midjourney generations needed.

**Spec reference:** `docs/superpowers/specs/2026-05-07-island-redesign-design.md` (Phase 6 section)
**Roadmap reference:** `docs/superpowers/plans/2026-05-07-island-redesign-roadmap.md` (Phase 6 section)
**Phase 5 plan:** `docs/superpowers/plans/2026-05-08-island-redesign-phase5.md`

**Why bespoke vs shared treatment matters:** With ~28 tools, generating a new portrait + background per tool would mean ~50 more Midjourney generations and another ~5 MB on cumulative weight. We're already at 4.2 MB, well over the Phase 7 ceiling. So Phase 6 splits:

- **Bespoke hosts (5 tools)** — KKCatalogue, SeasonalEventCalendar, VillagerGiftGuide, DreamAddressBook, CommunityHub. These are named in the spec and have iconic NPCs. New portraits + backgrounds.
- **Existing-host reuse (5 tools)** — CelesteMeteorTracker (uses celeste), NooksCrannyLog (tom-nook), HotelTracker (isabelle), VillagerCompatibility (isabelle), TradingBoard (isabelle). No new assets.
- **Shared Isabelle long-tail (18 tools)** — generic "Isabelle hosts" using `isabelle-thinking.webp` already on disk. No new assets at all. Greeting line + a single shared background image (`island-misc.webp`) ties them together.

**Architecture:** Same `ToolFrame` wrapper pattern as Phases 4-5. The shared-Isabelle tools all receive the same `host="isabelle"` + `background="/island/tool-backgrounds/island-misc.webp"` props but with per-tool greeting text.

---

## Workflow split

**Half A — Asset generation (~9 generations)**
- 2 new character portraits: Pelly (post office), Luna (dream realm)
- 6 new tool backgrounds: KK plaza, Celeste-stars, Pelly-mailroom, Luna-bed, Resident-services-bulletin, island-misc-shared

**Half B — Code integration**

---

# Half A — Asset generation

## Step A1 — 2 new character portraits

| Slot | File | Prompt body |
|------|------|-------------|
| Pelly | `pelly-postoffice.webp` | `Pelly the cheerful pelican from Animal Crossing, standing behind a post office counter holding a stack of letters, wearing her red post office uniform, full body portrait, three-quarter view, morning light, watercolor illustration, hand-drawn line work, soft pastel palette, ACNH style, isolated on solid white background, Studio Ghibli warmth, no text, no logo, no UI --ar 1:1 --v 7` |
| Luna | `luna-dream.webp` | `Luna the dream tapir from Animal Crossing, sitting on a fluffy white dream cloud surrounded by pastel stars, wearing her purple dream-themed robe, full body portrait, three-quarter view, soft moonlight, watercolor illustration, hand-drawn line work, soft pastel palette, ACNH style, isolated on solid white background, Studio Ghibli warmth, no text, no logo, no UI --ar 1:1 --v 7` |

## Step A2 — 6 tool background scenes

| Tool | File | Prompt body |
|------|------|-------------|
| KK Catalogue | `kk-plaza.webp` | `Outdoor village plaza at sunset with a small wooden stage, an acoustic guitar resting on a stool, paper lanterns, ACNH watercolor style, soft watercolor wash low contrast, hand-drawn line work, no text, no UI --ar 16:9 --v 7` |
| Seasonal Events | `events-stargazing.webp` | `Hilltop at night with a telescope and picnic blanket, a few falling stars in the soft purple sky, ACNH watercolor style, hand-drawn line work, soft watercolor wash low contrast, no text, no UI --ar 16:9 --v 7` |
| Villager Gift Guide | `pelly-mailroom.webp` | `Tiny island post office interior with mailboxes, parcels stacked on a counter, a few wrapped gifts and a quill pen, morning sunlight through a window, ACNH watercolor style, soft watercolor wash low contrast, hand-drawn line work, no readable text, no UI --ar 16:9 --v 7` |
| Dream Address Book | `luna-dreambed.webp` | `Soft cloud-like bed in a starry purple dream realm, dream pillow, swirling night-sky pattern in the background, ACNH watercolor style, hand-drawn line work, soft watercolor wash low contrast, no text, no UI --ar 16:9 --v 7` |
| Community Hub | `bulletin-community.webp` | `Outdoor community bulletin board outside Resident Services tent, hand-drawn paper notices and friendship pledges pinned to it, daytime, leafy plants in foreground, ACNH watercolor style, soft watercolor wash low contrast, hand-drawn line work, no readable text, no UI --ar 16:9 --v 7` |
| Long-tail shared | `island-misc.webp` | `Soft watercolor wash of an Animal Crossing island corner — a wooden bench, a few flower beds, a leafy tree, gentle afternoon light, ACNH style, hand-drawn line work, very low contrast, neutral atmosphere, no text, no UI --ar 16:9 --v 7` |

Total: 8 generations. Cumulative weight after Phase 6: ~5 MB. Phase 7 lazy-loading is now critical.

**Stop here in Half A.** Tell me: "all 8 Phase 6 assets placed."

---

# Half B — Code integration

## Files

**Modified:**
- `src/characters/index.js` — register Pelly, Luna (2 new hosts → 13 total)
- `tests/characters/registry.test.js` — bump expected count
- 28 artifact files

**Untouched:** All artifact data, columns, calculations.

## Task B1: Register Pelly + Luna

```js
pelly: {
  id: 'pelly',
  name: 'Pelly',
  role: 'Post office clerk',
  voice: 'eternally cheerful, melodic',
  portraits: { postoffice: '/island/characters/pelly-postoffice.webp' },
  defaultMood: 'postoffice',
},
luna: {
  id: 'luna',
  name: 'Luna',
  role: 'Dream realm tapir',
  voice: 'soft, dreamy, sing-song',
  portraits: { dream: '/island/characters/luna-dream.webp' },
  defaultMood: 'dream',
},
```

Bump test from 11 to 13 hosts.

## Task B2-B6: 5 bespoke wrappings

| Leaf | File | Host | Background | Greeting |
|------|------|------|------------|----------|
| B2 | `KKCatalogue.jsx` | `kk-slider` | `/island/tool-backgrounds/kk-plaza.webp` | "Heyyyy. Got a request? I'll play it tonight on the plaza. Here's everything I've ever recorded." |
| B3 | `SeasonalEventCalendar.jsx` | `celeste` | `/island/tool-backgrounds/events-stargazing.webp` | "The constellations are out tonight! Let me show you what's happening on the island this season." |
| B4 | `VillagerGiftGuide.jsx` | `pelly` | `/island/tool-backgrounds/pelly-mailroom.webp` | "A gift for a villager? How lovely! Pick something they'll really love. I'll deliver it for you!" |
| B5 | `DreamAddressBook.jsx` | `luna` | `/island/tool-backgrounds/luna-dreambed.webp` | "Visit other islands… in your dreams… Just give me an address and I'll send you there." |
| B6 | `CommunityHub.jsx` | `isabelle` | `/island/tool-backgrounds/bulletin-community.webp` | "Let's connect with other islanders! Share your friend code, dream address, or just say hi!" |

## Task B7-B11: 5 existing-host reuses

| Leaf | File | Host | Background | Greeting |
|------|------|------|------------|----------|
| B7 | `CelesteMeteorTracker.jsx` | `celeste` | `/island/tool-backgrounds/events-stargazing.webp` | "Did you wish on a star tonight? I have so many recipes for you when you do!" |
| B8 | `NooksCrannyLog.jsx` | `tom-nook` | `/island/tool-backgrounds/bell-ledger.webp` | "Yes yes! Today's stock at the shop. Don't miss the daily specials!" |
| B9 | `HotelTracker.jsx` | `isabelle` | `/island/tool-backgrounds/island-misc.webp` | "Track your guests at Paradise Planning! Make every cabin feel like home." |
| B10 | `VillagerCompatibility.jsx` | `isabelle` | `/island/tool-backgrounds/island-misc.webp` | "Curious which villagers get along? Let's find out who'd make great neighbors." |
| B11 | `TradingBoard.jsx` | `isabelle` | `/island/tool-backgrounds/bulletin-community.webp` | "Looking to trade? Post your offers here for the community to see!" |

## Task B12: 18 shared-Isabelle long-tail wraps

Single PR for all 18, since they're identical-pattern wrappers. Each wraps with:

```jsx
<ToolFrame
  host="isabelle"
  hostMood="thinking"
  background="/island/tool-backgrounds/island-misc.webp"
  greeting="<per-tool one-liner>"
>
```

| File | Greeting |
|------|----------|
| `ArtDetector.jsx` | "Redd's got new art at the boat. Real or fake? Let's check them all carefully!" |
| `CatalogTracker.jsx` | "Tracking your catalog progress! Keep collecting until you've got every last item." |
| `FiveStarChecker.jsx` | "Aiming for a 5-star island? Here's exactly what you need to do!" |
| `FossilTracker.jsx` | "Found a fossil? Let's identify it and see if it's one Blathers needs!" |
| `GoldenToolTracker.jsx` | "Working toward the legendary golden tools? Check off each requirement here!" |
| `GulliverTracker.jsx` | "Gulliver washed up on the beach again? Let's get him home and earn that reward!" |
| `GyroidTracker.jsx` | "Track your gyroids by sound family — make them all sing together!" |
| `HHACalculator.jsx` | "Estimate your Happy Home Academy score! Better feng shui = bigger paycheck." |
| `IslandCard.jsx` | "Your official island business card! Show it off to friends from other islands." |
| `IslandFlowerMap.jsx` | "Plan flower breeding ops across your island. Track every Kanban column!" |
| `IslandTuneCreator.jsx` | "Compose a tune for the island PA system! Up to 16 notes — make it catchy!" |
| `LabelFashionHelper.jsx` | "Label's got a new theme today. Build outfits to win her approval!" |
| `MaterialCalculator.jsx` | "Plan a big DIY project? I'll break down every material you need." |
| `NookMilesTracker.jsx` | "Cash in those Nook Miles for rewards! Here's every achievement at a glance." |
| `Notifications.jsx` | "Recent activity from your island and the community. Stay in the loop!" |
| `PhotoPosterTracker.jsx` | "Track villager photos and posters! 966 total — collect them all!" |
| `StalkMarket.jsx` | "Live community turnip prices! Find a buyer paying top bell." |
| `UserProfile.jsx` | "Your profile and settings. Make the suite feel like yours!" |

That's 18 + 5 + 5 = 28 wrappers, matching the unwrapped artifact count.

## Task B13: Version bump + close

```bash
# package.json: 5.4.0 → 5.5.0
npm install --package-lock-only
git add package.json package-lock.json
git commit -m "chore(version): bump to 5.5.0 for Phase 6 — all 32 tools reframed"
```

Smoke-check: every tool greets with the right host, no regressions, build clean, tests pass.

Close issue #135.

---

## Done criteria

- 8 new WebP assets shipped (~1 MB)
- 13 hosts registered (was 11)
- All 32 artifacts wrapped with `ToolFrame`
- Version 5.5.0 on production

## Risk register

| Risk | Mitigation |
|------|------------|
| Asset weight ~5 MB hurts mobile LCP | Phase 7 lazy-loading mandatory |
| Pelly/Luna prompts produce off-canon characters | Style anchor pinned, accept simplest framing if 4 generations fail |
| `island-misc.webp` shared background feels generic across 18 tools | Acceptable. Phase 7 can swap subtle per-category variants if budget allows |
| Single 18-tool commit becomes hard to review | Acceptable since pattern is identical and changes are mechanical (5 lines per file) |
| Some artifacts have early returns (sign-in walls) that wrap incorrectly | Each wrapper is scoped to the main `return ()` of the function, not the early returns |

## Open questions

None pre-execution.
