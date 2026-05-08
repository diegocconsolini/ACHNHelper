# Phase 5 — Tool Wave 2: Data-Heavy Tools (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans

**Goal:** Reframe 7 data-heavy tools with hosted greetings + themed backgrounds. Same wrapper-only pattern as Phase 4 — no data, columns, or interaction logic changes. Each tool gets the canonical NPC for its activity.

**Spec reference:** `docs/superpowers/specs/2026-05-07-island-redesign-design.md` (Phase 5 section)
**Roadmap reference:** `docs/superpowers/plans/2026-05-07-island-redesign-roadmap.md` (Phase 5 section)
**Phase 4 plan:** `docs/superpowers/plans/2026-05-08-island-redesign-phase4.md` (built ToolFrame primitive Phase 5 consumes)

**Why these 7:** Each is a heavily used data tool with a clear canonical NPC (CJ for fishing, Flick for bugs, Leif for flowers, Cyrus for DIY) or a clear ambient setting (Garden Planner = the island plot). Daily Routine logically belongs to Isabelle's morning checklist clipboard. After Phase 5, 12 of 32 tools are reframed.

**Architecture:**
- Same wrapper-only pattern as Phase 4: `<ToolFrame host="..." background="..." greeting="...">` wraps the artifact's existing JSX root.
- Optional 1 `HostFloatingTip` per tool when there's a quotable in-world line.
- Asset pipeline: Midjourney v7 → rembg (portraits only) → cwebp.

**What this approach DOES NOT achieve:** Per-tool layout overhauls (e.g. "Fish Tracker becomes a fishing-rod-side dashboard"). Those graduate to Phase 7 if-and-when basic framing reads well.

---

## Workflow split

**Half A — Asset generation (manual)**
~11 Midjourney generations: 4 character portraits + 7 tool backgrounds.

**Half B — Code integration (Claude executes)**

---

# Half A — Asset generation

## Step A1 — 4 character portraits

| Slot | File | Prompt body |
|------|------|-------------|
| CJ | `cj-fisherman.webp` | `CJ the eccentric fisherman beaver from Animal Crossing, holding a fishing rod with both paws, wearing his blue scarf and grey beanie hat, standing on a wooden dock, full body portrait, three-quarter view, dawn light, watercolor illustration, hand-drawn line work, soft pastel palette, ACNH style, isolated on solid white background, Studio Ghibli warmth, no text, no logo, no UI --ar 1:1 --v 7` |
| Flick | `flick-camp.webp` | `Flick the artistic chameleon from Animal Crossing, holding a butterfly net over one shoulder, wearing his pink beret and green scarf, standing in a sunny meadow, full body portrait, three-quarter view, watercolor illustration, hand-drawn line work, soft pastel palette, ACNH style, isolated on solid white background, Studio Ghibli warmth, no text, no logo, no UI --ar 1:1 --v 7` |
| Leif | `leif-garden.webp` | `Leif the gentle sloth gardener from Animal Crossing, holding a small wooden tray of flower seedlings, wearing his green-leaf apron, full body portrait, three-quarter view, soft afternoon sunlight, watercolor illustration, hand-drawn line work, soft pastel palette, ACNH style, isolated on solid white background, Studio Ghibli warmth, no text, no logo, no UI --ar 1:1 --v 7` |
| Cyrus | `cyrus-workbench.webp` | `Cyrus the alpaca craftsman from Animal Crossing, holding a small carved wooden flower over a workbench, wearing his blue tradesman vest with a tool belt, full body portrait, three-quarter view, warm workshop lighting, watercolor illustration, hand-drawn line work, soft pastel palette, ACNH style, isolated on solid white background, Studio Ghibli warmth, no text, no logo, no UI --ar 1:1 --v 7` |

## Step A2 — 7 tool background scenes

| Tool | File | Prompt body |
|------|------|-------------|
| Fish Tracker | `fish-dock.webp` | `Wooden dock at sunrise with a tackle box and a couple of fishing rods leaning against a post, soft river water lapping, ACNH watercolor style, hand-drawn line work, soft watercolor wash low contrast, no text, no UI --ar 16:9 --v 7` |
| Bug Tracker | `bug-meadow.webp` | `Sunny island meadow at the campsite with butterfly nets resting on a tree stump, fireflies floating in the soft afternoon light, ACNH watercolor style, hand-drawn line work, soft watercolor wash low contrast, no text, no UI --ar 16:9 --v 7` |
| Sea Creature Tracker | `sea-beach.webp` | `Sandy beach with a snorkel mask and flippers resting on a striped towel, gentle ocean waves with foam in the background, ACNH watercolor style, hand-drawn line work, soft watercolor wash low contrast, no text, no UI --ar 16:9 --v 7` |
| Flower Calculator | `flower-shop.webp` | `Leif's outdoor flower shop with rows of small flower pots, watering can, hand-painted wooden signs (no text), gentle dappled sunlight through leafy trees, ACNH watercolor style, soft watercolor wash low contrast, no text, no UI --ar 16:9 --v 7` |
| Garden Planner | `garden-plot.webp` | `Tilled garden plot on an island with stone path borders, a few flower stems sprouting in neat rows, watering can in the corner, ACNH watercolor style, hand-drawn line work, soft watercolor wash low contrast, daytime, no text, no UI --ar 16:9 --v 7` |
| DIY Recipe Tracker | `diy-workbench.webp` | `Cyrus's wooden craftsman workbench covered with carved wooden flowers, a stack of recipe cards, hand tools, warm workshop lamp glow, ACNH watercolor style, soft watercolor wash low contrast, no readable text, no UI --ar 16:9 --v 7` |
| Daily Routine | `daily-clipboard.webp` | `Isabelle's wooden checklist clipboard on a desk in Resident Services tent, a few hand-drawn checkmarks visible, morning sunlight through a window, ACNH watercolor style, soft watercolor wash low contrast, no readable text, no UI --ar 16:9 --v 7` |

## Step A3 — Process

```bash
PY=/Library/Developer/CommandLineTools/usr/bin/python3
DL=/Users/diegocavalariconsolini/ClaudeCode/Downloads/ACNH

# rembg portraits
"$PY" -c "
from rembg import remove
for src,dst in [...]:
  with open(src,'rb') as f: d=f.read()
  with open(dst,'wb') as f: f.write(remove(d))
"

# cwebp portraits
cwebp -q 82 -alpha_q 95 "$DL/cut/<file>.png" -o public/island/characters/<file>.webp

# cwebp backgrounds (no knockout)
cwebp -q 70 "$DL/<file>.png" -o public/island/tool-backgrounds/<file>.webp
```

Total weight target: portraits ~80 KB × 4 = 320 KB; backgrounds ~150 KB × 7 = 1050 KB. Phase 5 batch ~1.4 MB. Cumulative weight after Phase 5: ~4 MB — well over the Phase 7 ceiling, so Phase 7 must implement lazy-loading + Next.js Image optimization to bring it back under control.

**Stop here in Half A.** Tell me: "all 11 Phase 5 assets placed." Then I execute Half B.

---

# Half B — Code integration

## Files

**Modified:**
- `src/characters/index.js` — register CJ, Flick, Leif, Cyrus (4 new hosts → 11 total)
- `tests/characters/registry.test.js` — bump expected count
- `src/artifacts/FishTracker.jsx` — wrap with `host="cj" location="fishing-dock"`
- `src/artifacts/BugTracker.jsx` — `host="flick" location="bug-meadow"`
- `src/artifacts/SeaCreatureTracker.jsx` — `host="isabelle"` (no canonical NPC for sea creatures, use ambient host)
- `src/artifacts/FlowerCalculator.jsx` — `host="leif" location="flower-shop"`
- `src/artifacts/GardenPlanner.jsx` — `host="leif" location="garden-plot"`
- `src/artifacts/DIYRecipeTracker.jsx` — `host="cyrus" location="diy-workbench"`
- `src/artifacts/DailyRoutine.jsx` — `host="isabelle" location="daily-clipboard"`
- `package.json` — version 5.3.0 → 5.4.0

**Untouched:** All artifact data, columns, calculations, sync, search.

## Task B1: Register 4 new hosts

Add entries:

```js
cj: {
  id: 'cj',
  name: 'C.J.',
  role: 'Travelling fisherman',
  voice: 'pumped-up, calls every fish "MAJESTIC"',
  portraits: { fisherman: '/island/characters/cj-fisherman.webp' },
  defaultMood: 'fisherman',
},
flick: {
  id: 'flick',
  name: 'Flick',
  role: 'Travelling bug-hunter and sculptor',
  voice: 'theatrical, considers every bug an art piece',
  portraits: { camp: '/island/characters/flick-camp.webp' },
  defaultMood: 'camp',
},
leif: {
  id: 'leif',
  name: 'Leif',
  role: 'Sloth gardener',
  voice: 'mellow, slow, fond of puns',
  portraits: { garden: '/island/characters/leif-garden.webp' },
  defaultMood: 'garden',
},
cyrus: {
  id: 'cyrus',
  name: 'Cyrus',
  role: 'Workbench customizer',
  voice: 'gruff but warm, tradesman pride',
  portraits: { workbench: '/island/characters/cyrus-workbench.webp' },
  defaultMood: 'workbench',
},
```

Bump test from 7 to 11 hosts.

Commit: `feat(characters): register CJ, Flick, Leif, Cyrus (#PHASE_5_REGISTRY)`

## Task B2-B8: Wrap 7 tools

Each leaf is a single PR-sized commit: import `ToolFrame`, wrap the artifact's main `return ( <div>...</div> )` root, keep all data + columns intact. Optional `HostFloatingTip` for tools with a quotable line.

| Leaf | File | Host | Background | Greeting | Tip |
|------|------|------|------------|----------|-----|
| B2 | `FishTracker.jsx` | `cj` | `/island/tool-backgrounds/fish-dock.webp` | "Heyyy! Caught any MAJESTIC specimens lately? I pay top bell for the rare ones, just so you know!" | None (CJ greeting carries the personality) |
| B3 | `BugTracker.jsx` | `flick` | `/island/tool-backgrounds/bug-meadow.webp` | "Mwah! A new bug, you say? I shall sculpt a model for you. Bring me the rare ones!" | "Why bring 3 of the same bug?" — "I commission models, dahling. Three identical specimens, one bespoke sculpture." |
| B4 | `SeaCreatureTracker.jsx` | `isabelle` | `/island/tool-backgrounds/sea-beach.webp` | "Don't forget your wetsuit! The diving spots are best at low tide. I'll log everything you find!" | None |
| B5 | `FlowerCalculator.jsx` | `leif` | `/island/tool-backgrounds/flower-shop.webp` | "Greetings… I have… seeds for sale. Take your time. I've got plenty." | "Why do my flowers look the same?" — "Slow growers… need slower expectations. Genetics, not luck — but luck never hurt either." |
| B6 | `GardenPlanner.jsx` | `leif` | `/island/tool-backgrounds/garden-plot.webp` | "Plan it well… water it daily… you'll have rare blooms in… a few weeks. No rush." | None |
| B7 | `DIYRecipeTracker.jsx` | `cyrus` | `/island/tool-backgrounds/diy-workbench.webp` | "If you've got the recipe and the materials, I can make it custom. Come back tomorrow when it's ready." | None |
| B8 | `DailyRoutine.jsx` | `isabelle` | `/island/tool-backgrounds/daily-clipboard.webp` | "Good morning, mayor! Here's your daily checklist — let's get the island in shape!" | None |

Each commit body: `feat(<tool>): <NPC> hosts <tool> (#PHASE_5_<tool_upper>)`

## Task B9: Version bump + close

```bash
# package.json: 5.3.0 → 5.4.0
npm install --package-lock-only
git add package.json package-lock.json
git commit -m "chore(version): bump to 5.4.0 for Phase 5 — 7 tools reframed"
```

Smoke-check live:
- [ ] FishTracker greets with C.J.
- [ ] BugTracker greets with Flick + sculpture tip
- [ ] SeaCreatureTracker greets with Isabelle
- [ ] FlowerCalculator + GardenPlanner both greet with Leif
- [ ] DIYRecipeTracker greets with Cyrus
- [ ] DailyRoutine greets with Isabelle
- [ ] No regressions: existing data tables intact
- [ ] All 65 prior + ~3 new tests pass (registry + maybe 1-2 new ones)

Close issue #134.

---

## Done criteria

- 11 new WebP assets shipped (~1.4 MB)
- `src/characters/index.js` registers 11 hosts (was 7)
- 7 tool wrappers landed, no data changes
- Version 5.4.0 on production
- 12 of 32 tools fully reframed (5 from Phase 4 + 7 from Phase 5)

## Risk register

| Risk | Mitigation |
|------|------------|
| 4 new portraits drift from canonical character likeness | Style anchor pinned; if 4 generations all fail for a character, accept simplest framing — e.g. CJ as "any fisherman beaver" rather than re-rolling forever |
| Cumulative asset weight (~4 MB) breaks LCP on slow connections | Phase 7 will implement lazy-loading via `<img loading="lazy">` and Next.js Image (currently disabled with `unoptimized: true`). Phase 5 ships unoptimized; perf graduates in Phase 7 |
| Sea creatures have no canonical NPC — Isabelle feels weak | Acceptable temporary host. If we add a Pascal-the-otter portrait in Phase 6 or 7, swap then |
| Two tools share Leif (FlowerCalculator + GardenPlanner) — feels redundant | Acceptable. Phase 7 can differentiate moods (calculator → "thinking", planner → "planning") if portraits-with-moods-2 land |
| Daily Routine could justify a dedicated portrait | Reuses isabelle-thinking from Phase 3; saves a generation. Isabelle is already the "checklist" character |

## Open questions for the user

None pre-execution.
