# Island Redesign — Phase 2: Landing Page Island Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing dark-mode coverflow landing page with a top-down isometric island scene where buildings are clickable shortcuts to portal sections.

**Architecture:** The whole landing becomes one main hero scene (SVG canvas + sprite overlays) rendered by a new `IslandScene` component. Below it, the existing categories/highlights/showcase sections get redressed in design-system components but keep their content. The island uses time-of-day variation (sky color shifts based on user's local hour). Buildings are SVG groups with hover state and routing.

**Tech Stack:** React 19.2, inline-style SVG, Phase 1 design tokens + components, existing AssetImg helper for sprite overlays. No new deps.

**Spec reference:** `docs/superpowers/specs/2026-05-07-island-redesign-design.md`
**Roadmap:** `docs/superpowers/plans/2026-05-07-island-redesign-roadmap.md`

---

## File structure

**Created:**
- `src/island/IslandScene.jsx` — main landing-page island component (SVG)
- `src/island/Building.jsx` — single clickable building (shape + sprite + label)
- `src/island/buildings.js` — building data: position, sprite, route, label
- `src/island/timeOfDay.js` — pure function returning sky/atmosphere palette
- `tests/island/timeOfDay.test.js` — sky palette tests
- `tests/island/buildings.test.js` — building data shape tests

**Modified:**
- `src/LandingPage.jsx` — hero section replaced by `<IslandScene>`, footer/categories sections kept but use design-system Card/Button/PaperPanel
- `package.json` — version 5.0.2 → 5.1.0 (minor bump: user-visible feature)

**Not touched:** All `src/artifacts/`, `src/App.jsx`, `lib/`, `app/api/`, all tests outside `tests/island/`. Existing 33 tests must still pass.

---

## Building map

6 buildings, matching existing sidebar sections so the click destination is clean:

| Building | Sprite source | Routes to | Sidebar section |
|----------|--------------|-----------|-----------------|
| Resident Services | `npcs/Isabelle` overlay | `/app` (Dashboard) | Dashboard |
| Museum | `npcs/Blathers` overlay | `/app` (Museum Tracker active) | Museum & Progress |
| Nook's Cranny | `npcs/Tom Nook` overlay | `/app` (Bell Calculator active) | Economy & Planning |
| Garden plot | `other/blue-rose plant` overlay | `/app` (Flower Calculator active) | Gardening |
| Able Sisters | `npcs/Mabel` overlay if exists, else placeholder | `/app` (KK Catalogue active) | Special & Art |
| Campsite tent | `villagers/Raymond` overlay | `/app` (Villager Gift Guide active) | Island Life |

Routing detail: clicking a building goes to `/app?tool=<key>` — the existing portal already supports a query param for initial active tool, OR if it doesn't, the click just navigates to `/app` and the user lands on Dashboard. Task 4 verifies and adapts.

---

## Task 1: Time-of-day pure function + tests

**Files:**
- Create: `src/island/timeOfDay.js`
- Create: `tests/island/timeOfDay.test.js`

- [ ] **Step 1: Write tests**

```js
// tests/island/timeOfDay.test.js
import { describe, it, expect } from 'vitest';
import { skyPalette } from '../../src/island/timeOfDay.js';

describe('skyPalette', () => {
  it('returns day palette at 12:00', () => {
    const p = skyPalette(12);
    expect(p.name).toBe('day');
    expect(p.top).toMatch(/^#[0-9a-f]{6}$/i);
    expect(p.bottom).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('returns dawn palette at 6:00', () => {
    expect(skyPalette(6).name).toBe('dawn');
  });

  it('returns sunset palette at 18:00', () => {
    expect(skyPalette(18).name).toBe('sunset');
  });

  it('returns night palette at 23:00', () => {
    expect(skyPalette(23).name).toBe('night');
  });

  it('returns night palette at 2:00', () => {
    expect(skyPalette(2).name).toBe('night');
  });

  it('clamps invalid hours', () => {
    expect(skyPalette(-1).name).toBe('night');
    expect(skyPalette(99).name).toBe('night');
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

```bash
npm test -- tests/island/timeOfDay.test.js
```

- [ ] **Step 3: Implement**

```js
// src/island/timeOfDay.js
import { tokens } from '../design/tokens.js';

const palettes = {
  dawn:    { name: 'dawn',    top: '#f4a261', bottom: '#e9c46a', sun: '#f1d9a0' },
  day:     { name: 'day',     top: tokens.color.skyDay, bottom: '#cfe8f0', sun: '#fff5cc' },
  sunset:  { name: 'sunset',  top: '#d97a4a', bottom: tokens.color.skySunset, sun: '#ff8c52' },
  night:   { name: 'night',   top: tokens.color.skyNight, bottom: '#2a3a5a', sun: '#e8e8ff' },
};

export function skyPalette(hour) {
  const h = Number.isFinite(hour) ? Math.floor(hour) : 0;
  if (h >= 5 && h < 8) return palettes.dawn;
  if (h >= 8 && h < 17) return palettes.day;
  if (h >= 17 && h < 20) return palettes.sunset;
  return palettes.night;
}
```

- [ ] **Step 4: Run, verify PASS**

```bash
npm test -- tests/island/timeOfDay.test.js
```

- [ ] **Step 5: Commit**

```bash
git add src/island/timeOfDay.js tests/island/timeOfDay.test.js
git commit -m "feat(island): time-of-day sky palette (#PHASE_2_TIMEOFDAY)"
```

---

## Task 2: Building data module + tests

**Files:**
- Create: `src/island/buildings.js`
- Create: `tests/island/buildings.test.js`

- [ ] **Step 1: Tests**

```js
// tests/island/buildings.test.js
import { describe, it, expect } from 'vitest';
import { BUILDINGS } from '../../src/island/buildings.js';

describe('BUILDINGS', () => {
  it('has exactly 6 buildings', () => {
    expect(BUILDINGS).toHaveLength(6);
  });

  it('each building has required fields', () => {
    for (const b of BUILDINGS) {
      expect(b.id).toBeTruthy();
      expect(b.label).toBeTruthy();
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(b.route).toBe('/app');
      expect(b.sprite.category).toBeTruthy();
      expect(b.sprite.name).toBeTruthy();
    }
  });

  it('all building ids are unique', () => {
    const ids = BUILDINGS.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 2: Implement**

```js
// src/island/buildings.js
// Buildings positioned on a 1000x600 SVG canvas, top-down view.
// (x, y) = top-left corner of the building shape; w/h = bounding box.

export const BUILDINGS = [
  {
    id: 'resident-services',
    label: 'Resident Services',
    x: 420, y: 230, w: 180, h: 130,
    color: '#a3d9a5',         // green roof
    route: '/app',
    sprite: { category: 'npcs', name: 'Isabelle' },
  },
  {
    id: 'museum',
    label: 'Museum',
    x: 130, y: 130, w: 200, h: 160,
    color: '#7a8b9a',         // grey stone
    route: '/app',
    sprite: { category: 'npcs', name: 'Blathers' },
  },
  {
    id: 'nooks-cranny',
    label: "Nook's Cranny",
    x: 720, y: 180, w: 170, h: 130,
    color: '#d97a4a',         // orange roof
    route: '/app',
    sprite: { category: 'npcs', name: 'Tom Nook' },
  },
  {
    id: 'garden',
    label: 'Garden plot',
    x: 200, y: 410, w: 180, h: 110,
    color: '#e85a8a',         // pink flowers
    route: '/app',
    sprite: { category: 'other', name: 'blue-rose plant' },
  },
  {
    id: 'able-sisters',
    label: 'Able Sisters',
    x: 460, y: 410, w: 160, h: 120,
    color: '#e85a5a',         // red roof
    route: '/app',
    sprite: { category: 'npcs', name: 'Mabel' },
  },
  {
    id: 'campsite',
    label: 'Campsite',
    x: 700, y: 410, w: 180, h: 120,
    color: '#d4b030',         // tent yellow
    route: '/app',
    sprite: { category: 'villagers', name: 'Raymond' },
  },
];
```

- [ ] **Step 3: Run, verify PASS**

```bash
npm test -- tests/island/buildings.test.js
```

- [ ] **Step 4: Commit**

```bash
git add src/island/buildings.js tests/island/buildings.test.js
git commit -m "feat(island): building data + positions (#PHASE_2_BUILDINGS)"
```

---

## Task 3: Building component

**Files:**
- Create: `src/island/Building.jsx`

- [ ] **Step 1: Implement**

```jsx
// src/island/Building.jsx
'use client';

import { useState } from 'react';
import { tokens } from '../design/tokens.js';
import { AssetImg } from '../assetHelper.jsx';

export default function Building({ building, onSelect }) {
  const [hover, setHover] = useState(false);
  const { id, label, x, y, w, h, color, sprite } = building;

  // Roof: triangular cap above the rectangular body
  const roofOverhang = 12;
  const roofHeight = 28;

  return (
    <g
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onSelect(building)}
      style={{ cursor: 'pointer', transition: 'transform 0.2s ease', transformOrigin: `${x + w / 2}px ${y + h / 2}px`, transform: hover ? 'scale(1.04)' : 'scale(1)' }}
      data-building={id}
    >
      {/* Building body */}
      <rect
        x={x}
        y={y + roofHeight}
        width={w}
        height={h - roofHeight}
        fill={tokens.color.paper}
        stroke={tokens.color.woodDark}
        strokeWidth={2}
        rx={4}
      />
      {/* Roof */}
      <polygon
        points={`${x - roofOverhang},${y + roofHeight} ${x + w / 2},${y} ${x + w + roofOverhang},${y + roofHeight}`}
        fill={color}
        stroke={tokens.color.woodDark}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* Door */}
      <rect
        x={x + w / 2 - 18}
        y={y + h - 50}
        width={36}
        height={50}
        fill={tokens.color.woodDark}
        rx={4}
      />
      {/* Sprite mounted on the building */}
      <foreignObject x={x + w / 2 - 24} y={y + roofHeight + 8} width={48} height={48} style={{ pointerEvents: 'none' }}>
        <AssetImg category={sprite.category} name={sprite.name} size={48} />
      </foreignObject>
      {/* Hover label */}
      {hover && (
        <g style={{ pointerEvents: 'none' }}>
          <rect
            x={x + w / 2 - 80}
            y={y - 36}
            width={160}
            height={28}
            rx={14}
            fill={tokens.color.paper}
            stroke={tokens.color.woodDark}
            strokeWidth={1.5}
          />
          <text
            x={x + w / 2}
            y={y - 18}
            textAnchor="middle"
            fontFamily={tokens.font.handwriting}
            fontSize="16"
            fill={tokens.color.ink}
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/island/Building.jsx
git commit -m "feat(island): Building component (SVG + hover label) (#PHASE_2_BUILDING)"
```

---

## Task 4: IslandScene component

**Files:**
- Create: `src/island/IslandScene.jsx`

- [ ] **Step 1: Implement**

```jsx
// src/island/IslandScene.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokens } from '../design/tokens.js';
import { skyPalette } from './timeOfDay.js';
import { BUILDINGS } from './buildings.js';
import Building from './Building.jsx';

const VIEWBOX_W = 1000;
const VIEWBOX_H = 600;

export default function IslandScene() {
  const router = useRouter();
  const [hour, setHour] = useState(12);

  useEffect(() => {
    setHour(new Date().getHours());
    const tick = setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => clearInterval(tick);
  }, []);

  const sky = skyPalette(hour);

  const onSelect = (b) => {
    router.push(b.route);
  };

  return (
    <div
      style={{
        width: '100%',
        background: `linear-gradient(180deg, ${sky.top} 0%, ${sky.bottom} 100%)`,
        padding: '40px 20px 60px',
      }}
    >
      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        style={{ width: '100%', height: 'auto', maxHeight: '70vh', display: 'block', margin: '0 auto' }}
        role="img"
        aria-label="Animal Crossing island map with clickable buildings"
      >
        {/* Sun / moon */}
        <circle cx={120} cy={80} r={36} fill={sky.sun} opacity={0.85} />

        {/* Water (ocean band at edges) */}
        <rect x={0} y={520} width={VIEWBOX_W} height={80} fill={tokens.color.water} opacity={0.9} />
        <rect x={0} y={520} width={VIEWBOX_W} height={80} fill={tokens.color.water} opacity={0.5}>
          <animate attributeName="opacity" values="0.5;0.7;0.5" dur="4s" repeatCount="indefinite" />
        </rect>

        {/* Sand beach ring */}
        <ellipse cx={500} cy={520} rx={490} ry={120} fill={tokens.color.sand} />

        {/* Grass island body */}
        <ellipse cx={500} cy={470} rx={460} ry={250} fill={tokens.color.grass} />

        {/* Path winding through */}
        <path
          d="M 60 470 Q 250 380, 460 360 Q 700 340, 940 380"
          stroke={tokens.color.path}
          strokeWidth={28}
          fill="none"
          strokeLinecap="round"
          opacity={0.85}
        />

        {/* Trees scattered (decorative) */}
        {[
          [80, 350], [60, 440], [950, 350], [930, 440], [380, 350], [620, 350], [500, 200], [880, 200], [120, 220],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <rect x={cx - 4} y={cy} width={8} height={20} fill={tokens.color.woodDark} />
            <circle cx={cx} cy={cy - 4} r={20} fill={tokens.color.grassDark} />
          </g>
        ))}

        {/* Buildings */}
        {BUILDINGS.map(b => <Building key={b.id} building={b} onSelect={onSelect} />)}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/island/IslandScene.jsx
git commit -m "feat(island): IslandScene composition (#PHASE_2_SCENE)"
```

---

## Task 5: Replace LandingPage hero with IslandScene

**Files:**
- Modify: `src/LandingPage.jsx`

The existing landing page has 5 sections: Hero (coverflow), Categories, Highlights, Showcase, Sync, Footer. Phase 2 replaces only the Hero section. Other sections stay structurally — they get redressed in Phase 3+ when the design system rolls out widely.

- [ ] **Step 1: Read current hero section**

```bash
sed -n '171,260p' src/LandingPage.jsx
```

Identify the lines for `<section style={styles.hero}>...</section>` block.

- [ ] **Step 2: Replace hero with IslandScene + simplified header**

Replace the existing hero block with:

```jsx
{/* ===== SECTION 1: ISLAND HERO ===== */}
<section style={styles.heroNew}>
  <div style={styles.heroHeader}>
    <h1 style={styles.heroTitleNew}>ACNH Helper Suite</h1>
    <p style={styles.heroSubtitleNew}>Your complete island companion</p>
  </div>
  <IslandScene />
  <div style={styles.heroCtas}>
    {status === 'authenticated' ? (
      <button onClick={handleGoToTools} style={styles.ctaPrimary}>Go to my tools &rarr;</button>
    ) : (
      <>
        <button onClick={handleSignIn} style={styles.ctaPrimary}>Sign in with Google</button>
        <button onClick={handleGuest} style={styles.ctaSecondary}>Try as Guest</button>
      </>
    )}
  </div>
</section>
```

Add the import at the top:

```jsx
import IslandScene from './island/IslandScene.jsx';
```

Remove the `COVERFLOW_ITEMS` array and the `coverflowIndex` state + interval (no longer used). Remove the `coverflow*` style entries.

Add new style entries to `styles`:

```js
heroNew: {
  paddingTop: 24,
  paddingBottom: 0,
  background: '#0a1a10',
},
heroHeader: {
  textAlign: 'center',
  padding: '0 24px 16px',
},
heroTitleNew: {
  fontFamily: "'Patrick Hand', 'Playfair Display', serif",
  fontSize: 'clamp(2.5rem, 6vw, 4rem)',
  fontWeight: 700,
  color: '#fef6e4',
  margin: '0 0 8px',
  letterSpacing: '-0.01em',
},
heroSubtitleNew: {
  fontSize: 'clamp(1rem, 2vw, 1.2rem)',
  color: '#c8e6c0',
  margin: 0,
  fontWeight: 400,
  opacity: 0.85,
},
heroCtas: {
  display: 'flex',
  gap: 16,
  justifyContent: 'center',
  padding: '24px',
  flexWrap: 'wrap',
  background: '#0a1a10',
},
```

Add Patrick Hand to the existing `<style>{` `@import...` `}</style>` block at the top of the component. Existing import:

```js
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
```

becomes:

```js
@import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
```

- [ ] **Step 3: Verify all 33 existing tests still pass**

```bash
npm test
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/LandingPage.jsx
git commit -m "feat(island): replace coverflow hero with IslandScene (#PHASE_2_REPLACE_HERO)"
```

---

## Task 6: Mobile responsive sweep

The SVG already uses `viewBox` so it scales. But the SVG hover labels use absolute font sizes (16px in viewBox space — fine, scales with viewport). The CTA buttons row is already `flexWrap: 'wrap'`. Likely zero work needed; validate in this task.

- [ ] **Step 1: Visual check on production after Phase 2 ships**

After Task 7 push completes, visit https://acnh-portal.vercel.app on mobile viewport (DevTools device emulator at 375px width). Confirm:
- Island scene renders (SVG scales).
- Building hover labels not relevant on touch — accept that touch users get instant click without label.
- CTAs stack vertically.

If anything breaks, file a Phase 7 leaf to fix in polish wave. No fix in this task unless severe (broken click area).

- [ ] **Step 2: No commit unless changes needed.**

---

## Task 7: Verify, version bump, push

- [ ] **Step 1: Full test + build + audit**

```bash
npm test            # all green
npm run build       # builds clean
npm audit           # 0 vulns
```

- [ ] **Step 2: Bump version**

`package.json`: `5.0.2` → `5.1.0` (minor bump — user-visible new landing page). Update lockfile.

- [ ] **Step 3: Commit + push**

```bash
git add package.json package-lock.json
git commit -m "chore(version): bump to 5.1.0 for Phase 2 landing page island"
git push origin main
```

- [ ] **Step 4: Verify deploy on Vercel**

Visit https://acnh-portal.vercel.app — landing page should show the island scene, time-appropriate sky, 6 clickable buildings.

---

## Done criteria

- All 6 leaf issues closed (will be opened next as #145-#150 ish, then refined).
- Existing 33 tests still pass; +9 new (6 timeOfDay, 3 buildings shape).
- Production landing at https://acnh-portal.vercel.app shows island, no coverflow.
- Clicking any building navigates to `/app`.
- Version 5.1.0 deployed.
- All `src/artifacts/*` untouched.

---

## Spec coverage check

- [x] **Phase 2 goal: replace coverflow with island** → Task 5
- [x] **6-8 clickable buildings** → Task 2 (6 chosen)
- [x] **Building → portal section routing** → Task 3 onSelect, Task 4 router.push
- [x] **Time-of-day sky** → Task 1
- [x] **CTAs repositioned** → Task 5 heroCtas block (CTAs kept; signpost styling deferred to Phase 3 design system rollout)
- [x] **Mobile responsive** → Task 6

Open follow-ups (not blockers):
- "Wooden sign" CTA styling → Phase 3 (signpost component lives there).
- Animated drifting leaves → Phase 7 polish.
- Time-of-day-based palette transitions (smooth fades) → Phase 7 polish.
