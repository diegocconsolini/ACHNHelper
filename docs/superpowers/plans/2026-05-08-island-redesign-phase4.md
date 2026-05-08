# Phase 4 — Tool Wave 1: High-Personality Tools (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans

**Goal:** Reframe 5 high-personality tools as in-world activities with hosted greetings, themed backgrounds, and easter-egg tooltips. Existing data tables, table columns, and interactive logic stay 100% intact — only the chrome around the data changes.

**Why these 5:** Each has a canonical NPC, a vivid setting, and is something a player thinks of in-world (not as a "dashboard"). Dashboard / Bell Calculator / Turnip Tracker / Museum Tracker / Wishlist between them establish the per-tool framing pattern that Phases 5-6 will repeat for the other 27 tools.

**Spec reference:** `docs/superpowers/specs/2026-05-07-island-redesign-design.md` (Phase 4 section)
**Roadmap reference:** `docs/superpowers/plans/2026-05-07-island-redesign-roadmap.md` (Phase 4 section)
**Phase 3 plan:** `docs/superpowers/plans/2026-05-07-island-redesign-phase3.md` (built the primitives this phase consumes)

**Architecture:**
- New primitive `ToolFrame` wraps any artifact in a host greeting at the top + themed background + footer tray + standard empty/loading/error slots driven by the host. No data flows through `ToolFrame` — it's pure chrome.
- New primitive `HostFloatingTip` is an absolutely-positioned tooltip with a character voice line. Each tool gets 1-2.
- Asset pipeline = same as Phase 3 (Midjourney v7 → user downloads → `cwebp -q 82 -alpha_q 95`). Batch 2 is smaller: ~10 generations across 5 tool backgrounds + Daisy Mae portrait + Tommy/Timmy portrait.
- Each tool refactor is a single PR-sized leaf: import `ToolFrame`, wrap the existing JSX root, set host + background, add 1-2 tips, remove duplicate header rendering if any. No data changes, no column changes, no logic changes.

**What this approach DOES NOT achieve:** A bespoke per-tool layout (Tom Nook's ledger does NOT become parchment-with-handwriting numbers in this phase — that's Phase 7 polish). What lands is the host's presence + the location's vibe. The intricate redesigns ("the Bell Calculator looks like a real ledger book") graduate to Phase 7 if-and-when basic framing reads well.

---

## Workflow split

Same pattern as Phase 3:

**Half A — Asset generation (manual, with my browser assistance)**
~10 Midjourney generations: 2 new character portraits (Daisy Mae, Tommy + Timmy) and 5 tool-background scenes. User downloads, I run `cwebp` and place files.

**Half B — Code integration (Claude executes)**
Build `ToolFrame` + `HostFloatingTip`, then wrap each of the 5 target tools.

---

# Half A — Asset generation

## Tool & style anchor

Same as Phase 3: Midjourney v7, watercolor + hand-drawn line work, soft pastels, ACNH style.

## Step A1 — 2 new character portraits

| Slot | File | Prompt body |
|------|------|-------------|
| Daisy Mae | `daisy-mae-cart.webp` | `Daisy Mae the boar girl from Animal Crossing, sitting beside a wicker basket of fresh white turnips, wearing her green-checkered apron and pink dress, full body portrait, three-quarter view, sunday morning sunlight, watercolor illustration, hand-drawn line work, soft pastel palette, ACNH style, transparent background, Studio Ghibli warmth, no text, no logo, no UI, no shadow under feet --ar 1:1 --v 7` |
| Tommy + Timmy | `tommy-timmy-counter.webp` | `Tommy and Timmy the two small tanuki twins from Animal Crossing, standing side by side behind a small wooden counter, both holding tiny order pads and pencils, blue Nooks Cranny aprons, three-quarter view, watercolor illustration, hand-drawn line work, soft pastel palette, ACNH style, transparent background, Studio Ghibli warmth, no text, no logo, no UI --ar 1:1 --v 7` |

## Step A2 — 5 tool-background scenes

These compose behind the data tables as a soft watercolor wash. Each goes to `public/island/tool-backgrounds/<tool>.webp`. Saved at q70 (lower quality acceptable — they're decorative blurs at 8-15% opacity).

| Tool | File | Prompt body |
|------|------|-------------|
| Dashboard | `dashboard-bulletin.webp` | `Wooden bulletin board outside Resident Services tent in Animal Crossing, rough planks, hand-drawn paper notices pinned to it, leafy plants in the foreground, daytime, watercolor wash background, no text, no logos --ar 16:9 --v 7` |
| Bell Calculator | `bell-ledger.webp` | `Open leather-bound ledger book on a wooden desk, parchment pages, brass coins scattered around, magnifying glass, ACNH watercolor style, soft warm lamp light, hand-drawn line work, no text, no numbers, no UI --ar 16:9 --v 7` |
| Turnip Tracker | `turnip-cart-and-stall.webp` | `Two scenes side by side merged into one watercolor: on the left Daisy Mae's wicker turnip cart with white turnips stacked in baskets, on the right Nooks Cranny store front with a chalkboard easel, ACNH style, hand-drawn line work, soft pastels, daytime, no text, no numbers, no UI --ar 16:9 --v 7` |
| Museum Tracker | `museum-journal.webp` | `Open journal on a wooden museum desk, fossil sketches and pressed leaves on the pages, brass magnifying glass, gentle library lamp glow, watercolor wash background, ACNH style, hand-drawn line work, no readable text, no UI --ar 16:9 --v 7` |
| Wishlist | `wishlist-orderpad.webp` | `Small wooden counter at Nooks Cranny with a paper order pad and a pencil resting on it, faint shelves of unidentifiable goods in soft focus behind, ACNH style, watercolor wash, hand-drawn line work, no readable text, no UI --ar 16:9 --v 7` |

**Acceptance per background:** muted, low-contrast, no element competes with the foreground data table. If a scene comes back too saturated or detailed, re-roll once with `soft watercolor wash, low contrast` added. If second roll also fails, drop the background and ship with a flat token-paper color — graceful degradation.

## Step A3 — Drop assets

```bash
cd /Users/diegocavalariconsolini/ClaudeCode/ACNH/acnh-portal
mkdir -p public/island/tool-backgrounds

# Character portraits (high alpha quality):
cwebp -q 82 -alpha_q 95 ~/Downloads/<file>.png -o public/island/characters/<file>.webp

# Tool backgrounds (lower q is fine since they're decorative washes):
cwebp -q 70 ~/Downloads/<file>.png -o public/island/tool-backgrounds/<file>.webp
```

Total weight target: backgrounds ~80 KB each (5 × 80 = 400 KB), portraits ~70 KB each (2 × 70 = 140 KB). Phase 4 batch ~540 KB. Cumulative redesign weight after Phase 4: ~2 MB — at the Phase 7 ceiling, so Phase 5-7 will need lazy-loading or further compression.

**Stop here in Half A.** Tell me: "all 7 Phase 4 assets placed." Then I execute Half B.

---

# Half B — Code integration

## Files

**Created (new):**
- `src/island/ToolFrame.jsx` — wraps a tool with host greeting + themed background + footer tray
- `src/characters/HostFloatingTip.jsx` — character-voiced tooltip with hover/focus
- `src/characters/HostFloatingTip.test.jsx` — render + show/hide tests
- `tests/island/ToolFrame.test.jsx` — render + slot tests
- Update `src/characters/index.js` — register Daisy Mae and Timmy/Tommy as supplementary hosts

**Modified (5 tool wrappers, no data changes):**
- `src/artifacts/Dashboard.jsx` — wrap with `<ToolFrame host="isabelle" location="resident-services">` + greeting copy
- `src/artifacts/BellCalculator.jsx` — `host="tom-nook" location="nooks-cranny"`
- `src/artifacts/TurnipTracker.jsx` — `host="daisy-mae" location="turnip-cart"` (Sundays) / `host="tom-nook"` (other days) — see B5
- `src/artifacts/MuseumTracker.jsx` — `host="blathers" location="museum-journal"`
- `src/artifacts/Wishlist.jsx` — `host="tommy-timmy" location="nooks-cranny-counter"`
- `package.json` — version 5.2.0 → 5.3.0

**Untouched:** All artifact data, columns, calculation logic, sync, search.

---

## Task B1: Register Daisy Mae + Tommy/Timmy in the registry

**Files:**
- Modify: `src/characters/index.js`
- Modify: `tests/characters/registry.test.js` — bump expected count from 5 to 7

Add entries:

```js
'daisy-mae': {
  id: 'daisy-mae',
  name: 'Daisy Mae',
  role: 'Sunday turnip merchant',
  voice: 'cheerful southern drawl, calls turnips "stalks"',
  portraits: { cart: '/island/characters/daisy-mae-cart.webp' },
  defaultMood: 'cart',
},
'tommy-timmy': {
  id: 'tommy-timmy',
  name: 'Timmy & Tommy',
  role: "Nook's Cranny clerks",
  voice: 'enthusiastic, finish each other’s sentences',
  portraits: { counter: '/island/characters/tommy-timmy-counter.webp' },
  defaultMood: 'counter',
},
```

Update test:

```js
it('has the 7 Phase 3+4 hosts', () => {
  expect(Object.keys(characters).sort()).toEqual(
    ['blathers', 'celeste', 'daisy-mae', 'isabelle', 'kk-slider', 'tom-nook', 'tommy-timmy']
  );
});
```

The asset-existence test already iterates dynamically — no edit needed beyond having the 2 new files on disk (Half A).

Verify: `npm test -- tests/characters/registry.test.js` → 4 pass.

Commit: `feat(characters): register Daisy Mae and Timmy & Tommy (#PHASE_4_REGISTRY)`

## Task B2: HostFloatingTip component

**Files:**
- Create: `src/characters/HostFloatingTip.jsx`
- Create: `tests/characters/HostFloatingTip.test.jsx`

```jsx
'use client';

import { useState } from 'react';
import { tokens } from '../design/tokens.js';
import { getCharacter, getPortrait } from './index.js';

export default function HostFloatingTip({
  character,
  mood,
  trigger,    // text or node that anchors the tip
  message,    // the character-voiced line
}) {
  const [open, setOpen] = useState(false);
  const c = getCharacter(character);
  const portrait = getPortrait(character, mood);

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label={`${c.name} has a tip about ${trigger}`}
        style={{
          background: 'none',
          border: `1px dashed ${tokens.color.wood}`,
          borderRadius: tokens.radius.sm,
          color: tokens.color.ink,
          fontFamily: tokens.font.handwriting,
          fontSize: 14,
          padding: '2px 8px',
          cursor: 'help',
          outline: 'none',
        }}
      >
        {trigger}
      </button>
      {open && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            marginTop: 6,
            padding: 10,
            background: tokens.color.paper,
            border: `2px solid ${tokens.color.wood}`,
            borderRadius: tokens.radius.md,
            boxShadow: tokens.shadow.sign,
            minWidth: 220,
            maxWidth: 320,
          }}
        >
          <img
            src={portrait}
            alt={c.name}
            style={{ width: 40, height: 'auto', flexShrink: 0 }}
          />
          <div
            style={{
              fontFamily: tokens.font.handwriting,
              fontSize: 14,
              color: tokens.color.ink,
              lineHeight: 1.4,
            }}
          >
            {message}
          </div>
        </div>
      )}
    </span>
  );
}
```

Tests:
- Renders the trigger text.
- Shows the message on hover/focus.
- Hides the message on blur.

Verify: `npm test -- tests/characters/HostFloatingTip.test.jsx` → 3 pass.

Commit: `feat(characters): HostFloatingTip — character-voiced tooltip (#PHASE_4_TIP)`

## Task B3: ToolFrame primitive

**Files:**
- Create: `src/island/ToolFrame.jsx`
- Create: `tests/island/ToolFrame.test.jsx`

```jsx
'use client';

import Greeting from '../characters/Greeting.jsx';
import { tokens } from '../design/tokens.js';

export default function ToolFrame({
  host,                 // character id
  hostMood,             // optional override
  background,           // path under public/, e.g. '/island/tool-backgrounds/bell-ledger.webp'
  greeting,             // node — usually a text line in the host's voice
  children,             // the existing tool's JSX
  footer,               // optional tray content (actions, secondary tip)
}) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100%',
        padding: tokens.space[4],
      }}
    >
      {background && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `url(${background}) center/cover no-repeat`,
            opacity: 0.12,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {greeting && (
          <Greeting character={host} mood={hostMood}>
            {greeting}
          </Greeting>
        )}
        <div style={{ marginTop: tokens.space[3] }}>{children}</div>
        {footer && (
          <div
            style={{
              marginTop: tokens.space[5],
              padding: tokens.space[3],
              background: tokens.color.paper,
              border: `2px solid ${tokens.color.wood}`,
              borderRadius: tokens.radius.md,
              boxShadow: tokens.shadow.paper,
              fontFamily: tokens.font.handwriting,
              color: tokens.color.ink,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
```

Tests:
- Renders children.
- Renders greeting text when provided.
- Renders footer when provided.
- No greeting when prop omitted.

Commit: `feat(island): ToolFrame — host + background + footer wrapper (#PHASE_4_TOOLFRAME)`

## Task B4: Wrap Dashboard

**File:** `src/artifacts/Dashboard.jsx`

Add the import:
```js
import ToolFrame from '../island/ToolFrame.jsx';
```

Find the component's outer `<div>` return root. Wrap it with:
```jsx
<ToolFrame
  host="isabelle"
  background="/island/tool-backgrounds/dashboard-bulletin.webp"
  greeting="Good morning, mayor! Here's everything happening on the island today. Don't forget to water the flowers!"
>
  {/* existing root content */}
</ToolFrame>
```

If the artifact already renders its own `<h1>` "Available Now" header, leave it — `Greeting` is a banner, not a header replacement. The wooden plaque header from Phase 3 already shows the tool name; the artifact's internal header can stay or be removed in Phase 7 polish.

Smoke check: `npm run build` clean, `npm test` 58+ pass.

Commit: `feat(dashboard): Isabelle hosts the morning announcements (#PHASE_4_DASHBOARD)`

## Task B5: Wrap BellCalculator

`src/artifacts/BellCalculator.jsx`:
```jsx
<ToolFrame
  host="tom-nook"
  background="/island/tool-backgrounds/bell-ledger.webp"
  greeting="Yes, yes! Let's tally up your bells. Loans, expenses, savings — I'll keep the books honest."
>
  {/* existing JSX */}
</ToolFrame>
```

Add 1 floating tip near the loan input or savings total:
```jsx
<HostFloatingTip
  character="tom-nook"
  trigger="Why pay off the loan?"
  message="Hm-hm! Each loan you settle, I'll expand your home. Don't rush, though — there's no interest. I am very generous."
/>
```

Commit: `feat(bell): Tom Nook keeps your ledger (#PHASE_4_BELL)`

## Task B6: Wrap TurnipTracker

`src/artifacts/TurnipTracker.jsx`:
- If today is Sunday (in the user's hemisphere/timezone), greet with Daisy Mae:
  ```jsx
  const isSunday = new Date().getDay() === 0;
  const host = isSunday ? 'daisy-mae' : 'tom-nook';
  const greeting = isSunday
    ? "Hey there! Bunch of fresh stalks for sale today, sugar. Buy 'em up before I leave at noon!"
    : "The price board says today's offer. Yes, yes — Sundays are for buying turnips, weekdays for selling.";
  ```
- One floating tip:
  ```jsx
  <HostFloatingTip
    character="tom-nook"
    trigger="When should I sell?"
    message="Yes, yes — patterns repeat! Watch the morning and afternoon prices for four days. Spikes peak high. Don't sell in a rush."
  />
  ```

Commit: `feat(turnip): Daisy Mae on Sundays, Nook on weekdays (#PHASE_4_TURNIP)`

## Task B7: Wrap MuseumTracker

`src/artifacts/MuseumTracker.jsx`:
```jsx
<ToolFrame
  host="blathers"
  background="/island/tool-backgrounds/museum-journal.webp"
  greeting="Hoo! A new specimen, you say? I shall accept everything... except the bugs. The bugs, please leave them in a box."
>
  {/* existing JSX */}
</ToolFrame>
```

Tip on the Bug section header:
```jsx
<HostFloatingTip
  character="blathers"
  trigger="Why so few bugs accepted?"
  message="A confession: bugs unsettle me dreadfully. But for the museum's sake, I shall accept them. From a distance."
/>
```

Commit: `feat(museum): Blathers' notebook (#PHASE_4_MUSEUM)`

## Task B8: Wrap Wishlist

`src/artifacts/Wishlist.jsx`:
```jsx
<ToolFrame
  host="tommy-timmy"
  background="/island/tool-backgrounds/wishlist-orderpad.webp"
  greeting="Welcome to Nook's Cranny! What can we — write down for you? — yes! What can we write down for you today?"
>
  {/* existing JSX */}
</ToolFrame>
```

A second tip near the "remove from wishlist" or empty state isn't strictly needed for Phase 4 — single tip is fine.

Commit: `feat(wishlist): Tommy & Timmy take your order (#PHASE_4_WISHLIST)`

## Task B9: Version bump + close

```bash
# package.json: 5.2.0 → 5.3.0
npm install --package-lock-only
git add package.json package-lock.json
git commit -m "chore(version): bump to 5.3.0 for Phase 4 — 5 tools reframed"
```

Smoke-check live:
- [ ] Dashboard greets you with Isabelle, bulletin-board wash behind the data
- [ ] Bell Calculator opens with Tom Nook + ledger background, loan tooltip works
- [ ] Turnip Tracker shows Daisy Mae on Sundays, Tom Nook other days
- [ ] Museum Tracker shows Blathers + journal background, bug-section tooltip
- [ ] Wishlist shows Timmy & Tommy + counter background
- [ ] Existing tool data and columns unchanged
- [ ] All 58 prior + ~10 new tests pass
- [ ] No regressions in non-Phase-4 tools

Close issue #133.

---

## Done criteria (full plan)

- 7 new WebP assets shipped (2 portraits + 5 backgrounds), <600 KB total
- `src/characters/index.js` registers 7 hosts (was 5)
- `src/island/ToolFrame.jsx` + `src/characters/HostFloatingTip.jsx` + tests
- 5 tool wrappers landed, no data changes
- Version 5.3.0 on production
- Live site: each of the 5 reframed tools has a hosted greeting and themed background; floating tips work

## Risk register

| Risk | Mitigation |
|------|------------|
| ToolFrame's background overlay clashes with dark-mode tool internals | Backgrounds set at opacity 0.12 — barely visible; if a tool's data table has dark backgrounds the wash blends underneath without competing. If still bad, lower to 0.06 or omit per-tool |
| Daisy Mae's prompt produces a generic boar instead of the canonical Daisy Mae | First generation is style-locked; if 4 variations all fail, fall back to using Tom Nook on Sundays too with a different greeting |
| Tommy + Timmy single-portrait fails (Midjourney struggles with twins) | Acceptable fallback: ship one tanuki kid in a Nook's Cranny apron, label as "Timmy" only, postpone "Tommy" to Phase 5 with a separate generation |
| Tools have their own internal h1 that competes with the new Greeting + the plaque header from Phase 3 | Internal h1s stay untouched in Phase 4. Phase 7 polish removes redundant headers |
| ToolFrame breaks artifact CSS by introducing flex/relative positioning | ToolFrame uses `position: relative; min-height: 100%` which respects the artifact's own layout. If a tool relies on `position: fixed` from its parent, override locally |
| Sunday detection in TurnipTracker uses local time but artifact data is timezone-aware | Acceptable approximation: if user is in southern hemisphere with shifted hours, they may briefly see "wrong" host on Sunday-evening US time. Phase 7 can hook into the existing hemisphere setting |
| Adding 5 ToolFrames + 5 backgrounds bloats the JS bundle | ToolFrame is ~3 KB gzip. Backgrounds are static assets, lazy-loaded by the browser only when each tool mounts. Bundle impact <5 KB |
| Some artifacts' root JSX is inside conditionals (e.g. login wall) — wrapping the wrong scope | Each tool's wrap is scoped to its **return** at the function root level. Conditional flow above (`if (!session) return <SignInWall>`) stays unwrapped — guests should still see the host greeting |

## Open questions for the user

None pre-execution. The 5-tool roster is fixed in the spec. Daisy Mae's voice line is suggested but freely editable post-merge.
