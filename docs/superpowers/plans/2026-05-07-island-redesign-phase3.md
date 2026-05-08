# Phase 3 — Persistent Character System + Sidebar Map (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans

**Goal:** Build the persistent character system (Isabelle as portal-wide host plus 4 secondary NPCs) and replace the flat sidebar with a hand-drawn island map. Migrate global modals to speech-bubble dialogs and ship a redesigned 404. After Phase 3 lands, every later phase plugs into the same primitives.

**Why this is the keystone:** Tools in Phases 4-7 will mount inside a `ToolFrame` that pulls a host portrait, a speech bubble, themed empty/loading states, and a wooden plaque header from the primitives built here. If Phase 3 lands sloppily, every later phase compounds the rot. Get the registry shape, the asset pipeline, and the chrome right now.

**Spec reference:** `docs/superpowers/specs/2026-05-07-island-redesign-design.md`
**Roadmap reference:** `docs/superpowers/plans/2026-05-07-island-redesign-roadmap.md` (Phase 3 section)

**Architecture:**
- Asset pipeline mirrors Phase 2 v2: Midjourney v7 → user downloads → `cwebp -q 82` → committed under `public/island/characters/` and `public/island/chrome/`.
- Character registry is a single static module; every component reads from it.
- Sidebar map is one Midjourney illustration with React-overlaid hover hotspots (same pattern as Phase 2 v2 hero), six location-categories matching `MENU` groups in `src/App.jsx`. Sub-tools fly out as wooden signs.
- `SpeechDialog` is a new design-system component that wraps `Dialog` with a host portrait + speech bubble. `ConfirmModal` and `AlertModal` are not deleted in Phase 3 (artifacts still use them); only `App.jsx` call sites migrate. Their interiors get retired in Phase 4-6 alongside per-tool host work.
- 404 is a Next.js App Router `app/not-found.jsx` (this file does not exist yet — current 404s rely on Next defaults).

**What this approach DOES NOT achieve:** Per-tool framing, `ToolFrame`, easter eggs, animations, time-of-day tinting, sound. All explicitly Phase 4-7. Phase 3 is plumbing + sidebar + modals + 404.

---

## Workflow split

Same shape as Phase 2 v2:

**Half A — Asset generation (manual, outside Claude session)**
You drive Midjourney with claude-in-chrome assistance, download finals, hand me file paths. ~10 generations.

**Half B — Code integration (Claude executes)**
Once `public/island/characters/*.webp` and `public/island/chrome/*.webp` and `public/island/sidebar-map.webp` exist, I wire the registry, components, sidebar, modal migration, and 404.

---

# Half A — Asset generation

This whole half is a checklist for you to follow with my claude-in-chrome assistance. I drive Midjourney; you download the finals from `~/Downloads` and tell me the path. Same handoff as Phase 2 v2.

## Tools

- **Midjourney v7** via web (claude-in-chrome navigates and submits prompts; you select and Upscale the chosen variation; you download manually). **Not v8.1** — v8.1 needs personalization training the user hasn't done.
- **`cwebp`** at `/opt/homebrew/bin/cwebp`, already installed. I run it after you drop the PNG.

## Style anchor (re-use across every prompt to keep characters cohesive)

```
watercolor illustration, hand-drawn line work, soft pastel palette,
Animal Crossing New Horizons character style, transparent background,
Studio Ghibli warmth, no text, no logo, no UI, no shadow under feet
```

This anchor goes at the end of every character prompt. The `transparent background` + `no shadow under feet` lines matter — without them Midjourney pads with a grass square that will not composite cleanly into a speech bubble.

## Step A1 — Generate 6 character portraits

One prompt per character, run 4 variations, pick the cleanest, upscale, download.

| Slot | File name | Prompt body |
|------|-----------|-------------|
| 1 | `isabelle-welcome.webp` | `Isabelle the yellow shih tzu secretary from Animal Crossing, waving with one paw raised, smiling warmly, wearing her green-and-white checkered vest and red bow tie, full body portrait, three-quarter view, golden hour lighting,` + style anchor |
| 2 | `isabelle-thinking.webp` | `Isabelle the yellow shih tzu secretary from Animal Crossing, hand on chin in thoughtful pose, head tilted slightly, wearing her green-and-white checkered vest, full body portrait, three-quarter view,` + style anchor |
| 3 | `tom-nook-counting.webp` | `Tom Nook the brown tanuki shopkeeper from Animal Crossing, counting bells with both paws, leaning slightly forward, wearing his blue and yellow Hawaiian shirt, full body portrait, three-quarter view,` + style anchor |
| 4 | `blathers-reading.webp` | `Blathers the brown owl curator from Animal Crossing, reading an open leather-bound journal, wings holding the book open, wearing his green bowtie and red vest, full body portrait, three-quarter view,` + style anchor |
| 5 | `kk-slider-strumming.webp` | `K.K. Slider the white dog musician from Animal Crossing, sitting cross-legged with an acoustic guitar, mid-strum, eyes closed in concentration, full body portrait, three-quarter view,` + style anchor |
| 6 | `celeste-stargazing.webp` | `Celeste the purple owl astronomer from Animal Crossing, looking upward at stars with a telescope beside her, wearing her star-patterned witch dress, full body portrait, three-quarter view, soft moonlight,` + style anchor |

**Acceptance per portrait:**
- Recognizable as the canon character (no fox-as-Tom-Nook, no human Isabelle).
- Roughly square aspect, character centered, head + full body in frame.
- Background actually transparent (or solid white we'll knock out — see Step A4).
- No conflicting shadows, no extra limbs, no melted face. Re-roll if any of these.

## Step A2 — Generate sidebar island map

One prompt, 4 variations, pick best.

```
Top-down hand-drawn map of an Animal Crossing island village,
watercolor on parchment paper, painted in a children's storybook style.
The island is a tall vertical rectangle (portrait orientation, 3:5 ratio).

Six clearly visible location-areas, separated by stone paths and rivers:
- Top: a small wooden dock with a fishing rod leaning against a post
- Upper-middle-left: a museum building with a glass dome
- Upper-middle-right: Nook's Cranny store with an orange awning and a pile of bells beside it
- Middle: a flower garden plot with red, blue, and yellow flowers
- Lower-middle: Able Sisters clothing shop with a pink awning, near a beach
- Bottom: Resident Services tent with Isabelle's bell standing outside

Wooden signposts beside each area (blank — we'll add labels in code).
Soft warm afternoon lighting. Hand-drawn line work over watercolor wash.
Visible paper grain. No text, no logos, no UI.
```

**Acceptance:**
- Six locations are clearly distinguishable areas with breathing room between.
- Vertical orientation works at sidebar widths down to 240px (no critical detail under 12px).
- No text. If any text bleeds in, re-roll or paint over in Photoshop.

## Step A3 — Generate 4 chrome assets

Smaller batch, same anchor minus character bits.

| Slot | File name | Prompt |
|------|-----------|--------|
| 7 | `signpost-blank.webp` | `Wooden signpost on a grass tuft, weathered planks, ACNH style, transparent background, no text, watercolor illustration, hand-drawn line work, soft pastel palette` |
| 8 | `plaque-wide.webp` | `Long horizontal wooden plaque hanging from two ropes, weathered oak, ACNH style, transparent background, no text, watercolor illustration, hand-drawn line work, 16:5 aspect ratio` |
| 9 | `leaf-bullet.webp` | `Single small green leaf with hand-drawn outline, top-down view, ACNH style, transparent background, watercolor illustration, soft pastel palette` |
| 10 | `speech-bubble-paper.webp` | `Speech bubble shaped like a folded piece of cream parchment paper, hand-drawn outline, slight shadow on edges, ACNH style, transparent background, no text, watercolor illustration, 4:3 aspect ratio` |

**Acceptance:** transparent background actually transparent (or white-on-white that knocks out cleanly).

## Step A4 — Background knockout (if needed)

If any portrait or chrome asset comes back with an opaque white/grey background:
1. Open in Preview or any image editor.
2. Use Background Removal (Preview: Tools → Magic Wand on the white, delete; or Photoshop: Select Subject → invert → delete).
3. Save as PNG with alpha channel preserved.
4. Convert to WebP: `cwebp -q 82 -alpha_q 95 source.png -o output.webp` (the `-alpha_q 95` preserves edge softness).

## Step A5 — Drop assets into the repo

```bash
cd /Users/diegocavalariconsolini/ClaudeCode/ACNH/acnh-portal
mkdir -p public/island/characters public/island/chrome

# After each download:
cwebp -q 82 -alpha_q 95 ~/Downloads/<file>.png -o public/island/characters/<file>.webp
# (or -o public/island/chrome/<file>.webp for chrome assets)

# Sidebar map goes at the top of public/island/:
cwebp -q 82 ~/Downloads/sidebar-map.png -o public/island/sidebar-map.webp
```

I'll do the `cwebp` step for you each time — you just say "downloaded as `~/Downloads/isabelle-welcome.png`."

**Stop here in Half A.** Tell me: "all 11 assets are in `public/island/`, ready to wire up." Then I execute Half B.

**Total file budget:** 11 WebPs combined under 1.0 MB (portraits ~50-90 KB each, sidebar map ~150 KB, chrome ~20-50 KB each). Phase 7 caps total illustration weight at 2 MB across the whole redesign — Phase 3 should consume <50% of that budget.

---

# Half B — Code integration

(Half A must be done first. I execute this half.)

## Files

**Created (new):**
- `src/characters/index.js` — character registry
- `src/characters/Greeting.jsx` — host portrait + speech bubble
- `src/characters/EmptyState.jsx` — character + thought bubble for empty data
- `src/characters/LoadingState.jsx` — animated character idle
- `src/island/SidebarMap.jsx` — hand-drawn map sidebar
- `src/island/MapLocation.jsx` — clickable location with sub-tool flyout
- `src/island/sidebarLocations.js` — location → MENU group binding
- `src/design/components/SpeechDialog.jsx` — speech-bubble dialog
- `app/not-found.jsx` — 404 page with K.K. Slider
- `tests/characters/registry.test.js` — registry shape + asset existence
- `tests/characters/Greeting.test.jsx` — render test
- `tests/island/SidebarMap.test.jsx` — render + hotspot interaction
- `tests/design/SpeechDialog.test.jsx` — render + escape behavior

**Modified:**
- `src/App.jsx` — sidebar swap, header swap, modal call-site migration
- `package.json` — version 5.1.x → 5.2.0

**Untouched in Phase 3 (Phase 4-6 work):**
- `src/ConfirmModal.jsx`, `src/AlertModal.jsx` — kept for artifact consumers (HotelTracker, GardenPlanner, NooksCrannyLog, UserProfile, DreamAddressBook, TurnipTracker). Each gets migrated alongside its tool's host work in Phases 4-6.
- 32 `src/artifacts/*.jsx` files.

---

## Task B1: Character registry + tests

**Files:**
- Create: `src/characters/index.js`
- Create: `tests/characters/registry.test.js`

```js
// src/characters/index.js
export const characters = {
  isabelle: {
    id: 'isabelle',
    name: 'Isabelle',
    role: 'Resident Services',
    voice: 'cheerful, encouraging, occasionally sleepy',
    portraits: {
      welcome:  '/island/characters/isabelle-welcome.webp',
      thinking: '/island/characters/isabelle-thinking.webp',
    },
    defaultMood: 'welcome',
  },
  'tom-nook': {
    id: 'tom-nook',
    name: 'Tom Nook',
    role: "Nook's Cranny shopkeeper",
    voice: 'shrewd, paternal, fond of phrases like "yes yes"',
    portraits: { counting: '/island/characters/tom-nook-counting.webp' },
    defaultMood: 'counting',
  },
  blathers: {
    id: 'blathers',
    name: 'Blathers',
    role: 'Museum curator',
    voice: 'verbose, scholarly, terrified of bugs',
    portraits: { reading: '/island/characters/blathers-reading.webp' },
    defaultMood: 'reading',
  },
  'kk-slider': {
    id: 'kk-slider',
    name: 'K.K. Slider',
    role: 'Travelling musician',
    voice: 'mellow, philosophical, says "hit it"',
    portraits: { strumming: '/island/characters/kk-slider-strumming.webp' },
    defaultMood: 'strumming',
  },
  celeste: {
    id: 'celeste',
    name: 'Celeste',
    role: 'Astronomer (Blathers\' sister)',
    voice: 'whimsical, dreamy, gushes about constellations',
    portraits: { stargazing: '/island/characters/celeste-stargazing.webp' },
    defaultMood: 'stargazing',
  },
};

export function getCharacter(id) {
  const c = characters[id];
  if (!c) throw new Error(`Unknown character: ${id}`);
  return c;
}

export function getPortrait(id, mood) {
  const c = getCharacter(id);
  const m = mood || c.defaultMood;
  const url = c.portraits[m];
  if (!url) throw new Error(`Character ${id} has no mood "${m}"`);
  return url;
}
```

```js
// tests/characters/registry.test.js
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { characters, getCharacter, getPortrait } from '../../src/characters/index.js';

const PUBLIC = path.join(process.cwd(), 'public');

describe('character registry', () => {
  it('has the 5 Phase 3 hosts', () => {
    expect(Object.keys(characters).sort()).toEqual(
      ['blathers', 'celeste', 'isabelle', 'kk-slider', 'tom-nook']
    );
  });

  it('every character has at least one portrait file on disk', () => {
    for (const c of Object.values(characters)) {
      for (const url of Object.values(c.portraits)) {
        const file = path.join(PUBLIC, url.replace(/^\//, ''));
        expect(fs.existsSync(file), `missing portrait: ${file}`).toBe(true);
      }
    }
  });

  it('getPortrait falls back to defaultMood', () => {
    expect(getPortrait('isabelle')).toBe('/island/characters/isabelle-welcome.webp');
    expect(getPortrait('isabelle', 'thinking')).toBe('/island/characters/isabelle-thinking.webp');
  });

  it('getCharacter throws on unknown id', () => {
    expect(() => getCharacter('villager-x')).toThrow(/Unknown character/);
  });
});
```

Verify: `npm test -- tests/characters/registry.test.js` → 4 pass. The `existsSync` check fails fast if Half A files are missing.

Commit: `feat(characters): registry with 5 Phase 3 hosts (#PHASE_3_REGISTRY)`

## Task B2: Greeting / EmptyState / LoadingState components

**Files:**
- Create: `src/characters/Greeting.jsx`
- Create: `src/characters/EmptyState.jsx`
- Create: `src/characters/LoadingState.jsx`
- Create: `tests/characters/Greeting.test.jsx`

`Greeting.jsx` is the workhorse — host portrait on the left, speech bubble using `/island/chrome/speech-bubble-paper.webp` as a CSS `border-image` background, child text inside. Renders on Dashboard mount + at the top of every Phase 4-6 tool.

```jsx
'use client';

import { tokens } from '../design/tokens.js';
import { getCharacter, getPortrait } from './index.js';

export default function Greeting({
  character,
  mood,
  size = 'md',
  children,
}) {
  const c = getCharacter(character);
  const portrait = getPortrait(character, mood);
  const dims = size === 'sm' ? 80 : size === 'lg' ? 200 : 130;

  return (
    <div
      role="region"
      aria-label={`${c.name} says`}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: tokens.space[4],
        padding: tokens.space[3],
      }}
    >
      <img
        src={portrait}
        alt={`${c.name}, ${c.role}`}
        style={{
          width: dims,
          height: 'auto',
          flexShrink: 0,
          imageRendering: 'auto',
        }}
      />
      <div
        style={{
          flex: 1,
          background: `url(/island/chrome/speech-bubble-paper.webp) center/100% 100% no-repeat`,
          padding: '24px 32px',
          minHeight: 80,
          color: tokens.color.ink,
          fontFamily: tokens.font.handwriting,
          fontSize: 'clamp(16px, 1.6vw, 20px)',
          lineHeight: 1.5,
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

`EmptyState.jsx` and `LoadingState.jsx` follow the same pattern with thinking-mood portraits when available:
- `<EmptyState character="isabelle" message="Nothing scheduled today!" />` — uses `thinking` mood, smaller, vertical layout.
- `<LoadingState character="isabelle">` — uses `welcome` mood with a CSS keyframe `@keyframes idle-bob { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }` on the portrait, 2s ease-in-out infinite. Respects `@media (prefers-reduced-motion: reduce)`.

Tests (`tests/characters/Greeting.test.jsx`):
- Renders character name in alt text.
- Renders children in speech bubble.
- Throws on unknown character.

Verify: `npm test` → registry (4) + Greeting (3) = 7 new pass.

Commit: `feat(characters): Greeting/EmptyState/LoadingState components (#PHASE_3_COMPONENTS)`

## Task B3: SpeechDialog component

**Files:**
- Create: `src/design/components/SpeechDialog.jsx`
- Create: `tests/design/SpeechDialog.test.jsx`

Wraps `Dialog` and replaces the title bar with a host portrait + name. Body uses speech-bubble texture. Footer keeps two buttons (confirm/cancel) styled as wooden tags using existing `Button` from Phase 1.

```jsx
'use client';

import Dialog from './Dialog.jsx';
import PaperPanel from './PaperPanel.jsx';
import Button from './Button.jsx';
import { tokens } from '../tokens.js';
import { getCharacter, getPortrait } from '../../characters/index.js';

export default function SpeechDialog({
  open,
  onClose,
  character = 'isabelle',
  mood,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = false,
}) {
  if (!open) return null;
  const c = getCharacter(character);
  const portrait = getPortrait(character, mood);

  return (
    <Dialog open={open} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.space[3], marginBottom: tokens.space[4] }}>
        <img src={portrait} alt={c.name} style={{ width: 72, height: 'auto', flexShrink: 0 }} />
        <div style={{ fontFamily: tokens.font.display, fontSize: 22, color: tokens.color.ink }}>
          {c.name}
        </div>
      </div>
      <div style={{
        background: `url(/island/chrome/speech-bubble-paper.webp) center/100% 100% no-repeat`,
        padding: '20px 28px',
        fontFamily: tokens.font.handwriting,
        fontSize: 18,
        lineHeight: 1.5,
        color: tokens.color.ink,
        marginBottom: tokens.space[4],
      }}>
        {message}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: tokens.space[2] }}>
        {cancelLabel && (
          <Button variant="ghost" onClick={onCancel ?? onClose}>{cancelLabel}</Button>
        )}
        {confirmLabel && (
          <Button variant={destructive ? 'destructive' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        )}
      </div>
    </Dialog>
  );
}
```

Tests:
- Renders message.
- Calls `onConfirm` and `onClose` correctly.
- Escape key closes (inherited from `Dialog`, verify the integration).

Commit: `feat(design): SpeechDialog component (#PHASE_3_SPEECH_DIALOG)`

## Task B4: SidebarMap + MapLocation + sidebarLocations binding

**Files:**
- Create: `src/island/sidebarLocations.js`
- Create: `src/island/MapLocation.jsx`
- Create: `src/island/SidebarMap.jsx`
- Create: `tests/island/SidebarMap.test.jsx`

`sidebarLocations.js` binds the six painted locations on the map illustration to the existing `MENU` group ids in `App.jsx`. Each location has its own xPct/yPct/wPct/hPct hotspot — same shape as Phase 2 v2 hotspots, but inside the sidebar's narrow vertical map.

```js
// src/island/sidebarLocations.js
export const sidebarLocations = [
  { id: 'critterpedia', label: 'Critterpedia',     menuCategory: '🐟 Critterpedia',       xPct: 30, yPct: 12, wPct: 40, hPct: 12, host: 'isabelle' },
  { id: 'museum',       label: 'Museum & Progress', menuCategory: '🏛️ Museum & Progress',  xPct: 30, yPct: 28, wPct: 40, hPct: 12, host: 'blathers' },
  { id: 'economy',      label: 'Economy & Planning',menuCategory: '💰 Economy & Planning', xPct: 70, yPct: 30, wPct: 40, hPct: 14, host: 'tom-nook' },
  { id: 'gardening',    label: 'Gardening',         menuCategory: '🌸 Gardening',           xPct: 50, yPct: 50, wPct: 40, hPct: 12, host: 'isabelle' },
  { id: 'art',          label: 'Special & Art',     menuCategory: '🎨 Special & Art',       xPct: 30, yPct: 70, wPct: 40, hPct: 12, host: 'celeste' },
  { id: 'island-life',  label: 'Island Life',       menuCategory: '🏠 Island Life',         xPct: 60, yPct: 88, wPct: 40, hPct: 12, host: 'isabelle' },
];
```

(Coordinates are placeholders — re-measured against the actual generated `sidebar-map.webp` once it exists, exactly like Phase 2 v2 measured against `hero.png`.)

`MapLocation.jsx` is one absolutely-positioned hotspot. On hover/focus: outlines itself with a paper-tooltip showing `label`, and slides a stack of wooden signposts out to the right (one per sub-tool) using `signpost-blank.webp` as background plus tool emoji + label in handwriting font.

`SidebarMap.jsx` is the picture + .map of `MapLocation`s, plus a footer settings/profile mini-row keeping the existing 3 settings entries (`profile`, `signin`, `notifications`) accessible at the bottom outside the map.

The component receives the existing `MENU` from `App.jsx` as a prop (`menu`), an `activeId` prop, and `onSelect(id)` for tool changes — same callback shape `App.jsx` already uses internally. This keeps `App.jsx`'s state machine identical; only the UI shell changes.

Tests:
- Renders the sidebar-map image.
- Each location renders a hotspot button.
- Clicking a location's sub-tool calls `onSelect` with the right tool id.
- Active tool has an `aria-current="page"` attr.

Commit: `feat(island): SidebarMap + MapLocation hotspot system (#PHASE_3_SIDEBAR_MAP)`

## Task B5: Wire SidebarMap into App.jsx

Modify `src/App.jsx`:

1. Import `SidebarMap` from `./island/SidebarMap.jsx`.
2. Replace the entire `<nav aria-label="Tools" className="acnh-sidebar">` block (currently around lines 448-555) with `<SidebarMap menu={MENU} activeId={activeId} onSelect={(id) => { setActiveId(id); }} />`.
3. Strip now-unused sidebar styles from the `styles` object (`sidebar`, `sidebarHeader`, `sidebarGroup`, `sidebarGroupLabel`, `sidebarItem`, etc.).
4. Replace the old `<header>` plaque (currently the simple top bar) with a wooden plaque `<PaperPanel variant="wood">` that shows the active tool's host portrait (resolved via `sidebarLocations.find(l => l.menuCategory === activeItem.category).host`) plus the tool label.
5. Visual smoke check: build, deploy preview, eyeball.

Commit: `feat(app): swap sidebar to SidebarMap + plaque header (#PHASE_3_APP_SHELL)`

## Task B6: Migrate App.jsx ConfirmModal → SpeechDialog

In `src/App.jsx`:

- Remove `import ConfirmModal from './ConfirmModal'`.
- Add `import SpeechDialog from './design/components/SpeechDialog.jsx'`.
- Replace the sign-out `<ConfirmModal>` element (lines ~630-645) with:

```jsx
<SpeechDialog
  open={showSignOutConfirm}
  onClose={() => setShowSignOutConfirm(false)}
  character="isabelle"
  message="Heading back to the airport? See you again soon!"
  confirmLabel="Sign Out"
  cancelLabel="Stay"
  destructive
  onConfirm={() => {
    setShowSignOutConfirm(false);
    signOut({ callbackUrl: '/' });
  }}
  onCancel={() => setShowSignOutConfirm(false)}
/>
```

(Note: artifact tools' ConfirmModal/AlertModal usage is **not** touched here. They get migrated alongside per-tool host work in Phases 4-6.)

Commit: `feat(app): migrate sign-out to SpeechDialog (#PHASE_3_MODAL_MIGRATION)`

## Task B7: 404 page

**Files:**
- Create: `app/not-found.jsx`

```jsx
import Link from 'next/link';
import Greeting from '../src/characters/Greeting.jsx';
import { tokens } from '../src/design/tokens.js';

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${tokens.color.skySunset}, ${tokens.color.skyDay})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: tokens.space[6],
    }}>
      <div style={{ maxWidth: 720, width: '100%' }}>
        <Greeting character="kk-slider" mood="strumming">
          The page you're looking for hasn't been written yet, dude.
          I'm composing a song about it though. Want to head back?
        </Greeting>
        <div style={{ marginTop: tokens.space[6], textAlign: 'center' }}>
          <Link href="/" style={{
            fontFamily: tokens.font.handwriting,
            fontSize: 20,
            color: tokens.color.ink,
            textDecoration: 'underline',
          }}>
            Take me back to the island
          </Link>
        </div>
      </div>
    </main>
  );
}
```

Verify deploy: visit `https://acnh-portal.vercel.app/this-route-does-not-exist` after Vercel ships → K.K. Slider page renders.

Commit: `feat(app): redesigned 404 with K.K. Slider (#PHASE_3_404)`

## Task B8: Version bump + close phase

```bash
# package.json: 5.1.x → 5.2.0
git add package.json package-lock.json
git commit -m "chore(version): bump to 5.2.0 for Phase 3 character system"
```

Auto-commit hook handles push. Vercel deploys. Smoke-check live:

- [ ] Sidebar is the hand-drawn island map; the flat list is gone.
- [ ] Hovering a location surfaces a paper-tag tooltip; clicking expands sub-tool signposts.
- [ ] Active tool gets the wooden plaque header with its host portrait.
- [ ] Sign-out triggers an Isabelle SpeechDialog ("Heading back to the airport?").
- [ ] Visiting `/typo-url` hits the K.K. Slider 404.
- [ ] All 36 prior tests + Phase 3 new tests pass (target: 36 + ~15 new = ~51).
- [ ] Lighthouse perf within 5 points of 5.1.0 baseline.

Close issue #132. Open the next phase plan-writing follow-up issue.

---

## Done criteria (full plan)

- 11 WebP assets shipped under `public/island/characters/` + `public/island/chrome/` + `public/island/sidebar-map.webp`. Total <1.0 MB.
- `src/characters/` has registry + 3 components + tests.
- `src/island/SidebarMap.jsx` + `MapLocation.jsx` + `sidebarLocations.js` + tests.
- `src/design/components/SpeechDialog.jsx` + tests.
- `app/not-found.jsx` exists.
- `src/App.jsx` no longer renders the flat-list sidebar or the legacy header bar; uses `SpeechDialog` for sign-out.
- Version 5.2.0 on production. https://acnh-portal.vercel.app smoke-checks pass.

## Risk register

| Risk | Mitigation |
|------|------------|
| Midjourney drifts character likeness across 4-6 generation rounds | Style anchor pinned at the end of every prompt; first locked render becomes the visual reference for re-rolls of inconsistent batches |
| Background-knockout produces a visible halo around portraits | `cwebp -alpha_q 95` preserves alpha edge softness; if visible, fall back to PNG for that asset (small budget hit, acceptable) |
| Sidebar map can't fit 6 locations legibly at 240px width | Sidebar minimum width raised to 280px in `App.jsx` styles; if still tight, sub-tool signs slide to the **right** (over content) instead of pushing inline |
| Wooden-plaque header takes vertical space we don't have on mobile | At <768px the header collapses to a thin plaque + portrait avatar (no full row) |
| `SpeechDialog` migration breaks artifact tools that import `ConfirmModal` | Phase 3 only touches `App.jsx`. `src/ConfirmModal.jsx` and `src/AlertModal.jsx` files remain untouched until their consuming tool gets its Phase 4-6 host pass |
| `app/not-found.jsx` hits a Next.js App Router edge case (e.g. requires being a Server Component but `Greeting` is `'use client'`) | `app/not-found.jsx` itself is a Server Component (no `'use client'`); it imports `Greeting` which is a client component — App Router handles this boundary cleanly. If build fails, mark `not-found.jsx` as `'use client'` (acceptable) |
| Total test count drift breaks CI gating | Phase 3 adds ~15 tests; CI gates on green not count, so additions are fine |
| Vercel `unoptimized: true` means full-size WebPs ship to mobile | All Phase 3 assets are <100 KB target; total under 1 MB; mobile bandwidth is not a meaningful concern at this size |
| User regenerates a portrait mid-phase and existing code references stale URL | URLs are constants in `characters/index.js`; if a file is replaced in place, no code change needed. Renames require updating the registry — clearly documented |

## Open questions for the user

None pre-execution. The character roster is fixed in the spec (Isabelle ×2, Tom Nook, Blathers, K.K. Slider, Celeste). Sidebar location-binding follows the existing 6 MENU groups. Any deviation would re-write the spec, not the plan.
