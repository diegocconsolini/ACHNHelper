# Phase 2 v2 — AI-Illustrated Hero Island Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans

**Goal:** Replace the coverflow landing hero with a single AI-illustrated isometric Animal Crossing island scene, retouched in Photoshop to remove AI tells, with invisible clickable hotspots over each building.

**Why this approach:** The earlier "SVG primitives" approach (reverted at `28453266`) produced a kid-drawing-quality diagram. PostHog quality requires actual illustration. Hand-commissioning costs $1.5k+ and 4-6 weeks. AI-generated + heavy retouch reaches ~80% of PostHog quality in days.

**What this approach DOES NOT achieve:** True hand-drawn warmth. AI-illustrated art has subtle "tells" — slightly off perspectives, repetitive textures, occasional anatomical weirdness on characters. Heavy Photoshop touch-up reduces but doesn't eliminate these. Visible to discerning eyes; acceptable for the user given budget/time.

**Architecture:**
- A single PNG (and a WebP fallback) lives at `public/island/hero.png` (~2400×1500, 200-400 KB compressed). Generated externally, retouched, committed.
- React `HeroIsland` component renders the image responsive (max-width 1200, aspect-ratio preserved).
- Invisible `<button>` hotspots overlay the image at percentage coordinates (one per clickable building).
- Hover state shows a paper-styled tooltip with the building label.
- No SVG generation, no time-of-day variation in v2 — illustration is fixed time of day.

**Tech Stack:** Next.js Image component (with `unoptimized: true` from existing config), React 19.2, Phase 1 design tokens, inline styles.

---

## Workflow split

This plan has two halves:

**Half A — Asset generation (manual, outside Claude session)**
You (or a designer) generate the illustration using AI tools, retouch it, export final PNGs.

**Half B — Code integration (Claude executes)**
Once `public/island/hero.png` and `hero.webp` exist, I wire up the React component, hotspots, and ship.

---

# Half A — Asset generation

This whole half is a checklist for you to follow outside this session. None of it is something I can run.

## Tools needed

- **Midjourney v7** (recommended — best for illustrative isometric work) OR **Adobe Firefly v3** (commercially safer license terms) OR **DALL-E 3** (cheapest if you have ChatGPT Plus). Pick one based on what you have access to.
- **Photoshop / Affinity Photo / Photopea (free web)** — for retouching the AI base.
- A reference image saved somewhere accessible (Posthog screenshot, real ACNH screenshot).

## Step A1 — Generate base illustration

Run this prompt (or close variations) on the AI tool:

```
Isometric top-down 3/4 view of an Animal Crossing New Horizons island
village, hand-painted children's storybook illustration style, warm
late-afternoon lighting with long soft shadows, watercolor texture,
slightly oversaturated pastel palette.

The island is a rounded shape surrounded by sandy beach and gentle
ocean waves. Featured buildings: a cozy town hall with a green-leaf
roof and a flag in the center; a museum with grey stone walls and a
glass dome on the left; a small wooden general store with an orange
awning on the upper right; a clothing boutique with a pink awning;
a campsite with a yellow tent. Wooden fences, flower beds with bright
red, blue, and yellow flowers, scattered fruit trees with round leafy
crowns, a meandering stone path connecting the buildings, a small
wooden bridge over a river, hammocks between trees, picnic blankets
on grass. Cute anthropomorphic animal villagers walking around — a
cat watering flowers, a dog sitting on a bench, a bird carrying
groceries.

Soft watercolor brush strokes visible. Hand-drawn line work. No text,
no UI, no logos. Aspect ratio 16:10. Cottagecore aesthetic.
```

**Generation tips:**
- Run 4-6 variations. Pick the one with: best perspective consistency, fewest extra fingers/limbs on characters, cleanest building edges, most inviting overall vibe.
- Negative prompt: `text, watermark, logo, ui, hud, modern car, electronics, dark, gloomy`.
- If first batch is bad, iterate the prompt: emphasize "Studio Ghibli" or "Hayao Miyazaki" for warmth, or "Beatrix Potter" for storybook feel.
- Generate at the **largest** resolution your tool supports (Midjourney v7: 2K upscale; Firefly: max enhance).

## Step A2 — Photoshop touch-up checklist

Open the chosen variation. Run through this checklist in order:

- [ ] **Crop** to exactly 16:10 ratio (e.g., 2400×1500). Trim any awkward edge content.
- [ ] **Liquify the worst distortions.** AI loves to: bend straight roof lines, give characters extra limbs, melt fence posts. Use Liquify (Filter > Liquify) to push these back into shape. Don't over-do it — preserve the painted feel.
- [ ] **Patch character anatomy.** Spot-fix any villager with: wrong number of fingers, fused eyes, melted ears. Use Spot Healing Brush + Clone Stamp.
- [ ] **Unify lighting direction.** AI often has shadows pointing different ways for different objects. Pick one direction (e.g., light from upper-left → shadows lower-right) and patch any object with conflicting shadows by darkening/lightening with a soft brush at 20% opacity on a Multiply/Screen layer.
- [ ] **Boost saturation in key spots.** Use a Hue/Saturation adjustment layer with a brushed mask. Pop the flower colors, the green grass, the building roofs. Leave the sky and beach gentler.
- [ ] **Add subtle paper grain.** Filter > Filter Gallery > Texturizer > Sandstone, or overlay a paper-texture image at 8-15% opacity in Soft Light blend mode. Makes the whole thing feel less digital.
- [ ] **Sharpen.** Final pass: Filter > Sharpen > Smart Sharpen, Amount 60-80%, Radius 1.0px. Tightens up the edges that AI tends to leave fuzzy.
- [ ] **Save** as `.psd` (working file) and export `hero-2x.png` at 2400×1500 (this is what we'll commit at high-res).

## Step A3 — Identify hotspot coordinates

Open `hero-2x.png` in any image editor with a coordinate readout (Photoshop, Preview "Tools > Show Inspector," or just open in browser DevTools and use the inspector).

For each clickable building, note **percentage** coordinates of its center:

```
Building              | x%   | y%
----------------------|------|-----
Resident Services     | 50   | 55
Museum                | 22   | 38
Nook's Cranny         | 78   | 42
Garden plot           | 32   | 75
Able Sisters          | 50   | 78
Campsite              | 72   | 75
```

(These are placeholders — replace with actual values from YOUR generated image.)

Save these as a `hotspots.json` next to the PNG so the React component reads them.

## Step A4 — Export final assets

Three files needed in `public/island/`:

```
public/island/
├── hero.png         ← 2400×1500, lossless or near-lossless (~400-800 KB)
├── hero.webp        ← same dimensions, WebP at quality 82 (~150-300 KB) — primary served format
└── hotspots.json    ← coordinates from Step A3
```

Generate WebP from PNG with: `cwebp -q 82 hero.png -o hero.webp` (or use squoosh.app in browser).

`hotspots.json` format:

```json
{
  "imageWidth": 2400,
  "imageHeight": 1500,
  "buildings": [
    { "id": "resident-services", "label": "Resident Services", "xPct": 50, "yPct": 55, "wPct": 18, "hPct": 22, "route": "/app" },
    { "id": "museum",            "label": "Museum",            "xPct": 22, "yPct": 38, "wPct": 16, "hPct": 25, "route": "/app" },
    { "id": "nooks-cranny",      "label": "Nook's Cranny",     "xPct": 78, "yPct": 42, "wPct": 14, "hPct": 18, "route": "/app" },
    { "id": "garden",            "label": "Garden plot",       "xPct": 32, "yPct": 75, "wPct": 16, "hPct": 16, "route": "/app" },
    { "id": "able-sisters",      "label": "Able Sisters",      "xPct": 50, "yPct": 78, "wPct": 14, "hPct": 16, "route": "/app" },
    { "id": "campsite",          "label": "Campsite",          "xPct": 72, "yPct": 75, "wPct": 18, "hPct": 18, "route": "/app" }
  ]
}
```

`xPct/yPct` is the center of the hotspot. `wPct/hPct` is the box size, both as percentage of the image.

## Step A5 — Drop assets into the repo

```bash
cd /path/to/acnh-portal
mkdir -p public/island
cp ~/Downloads/hero.png public/island/hero.png
cp ~/Downloads/hero.webp public/island/hero.webp
cp ~/Downloads/hotspots.json public/island/hotspots.json
git add public/island/
git commit -m "feat(island): add AI-illustrated hero asset (Phase 2 v2 art)"
git push origin main
```

**Stop here in Half A.** Tell me in the Claude conversation: "asset is in `public/island/`, ready to wire up." Then I execute Half B.

---

# Half B — Code integration

(This half I execute. Half A must be done first.)

## Files

**Created:**
- `src/island/HeroIsland.jsx` — image + hotspot overlay component
- `src/island/hotspotsData.js` — imports JSON
- `tests/island/hotspotsData.test.js` — shape validation

**Modified:**
- `src/LandingPage.jsx` — replace coverflow hero with `<HeroIsland>`
- `package.json` — version 5.0.2 → 5.1.0

## Task B1: Hotspots data module + test

**Files:**
- Create: `src/island/hotspotsData.js`
- Create: `tests/island/hotspotsData.test.js`

```js
// src/island/hotspotsData.js
import data from '../../public/island/hotspots.json';
export const hotspots = data;
```

```js
// tests/island/hotspotsData.test.js
import { describe, it, expect } from 'vitest';
import { hotspots } from '../../src/island/hotspotsData.js';

describe('hotspots data', () => {
  it('has 6 buildings', () => {
    expect(hotspots.buildings).toHaveLength(6);
  });

  it('every hotspot has required fields with valid ranges', () => {
    for (const b of hotspots.buildings) {
      expect(b.id).toBeTruthy();
      expect(b.label).toBeTruthy();
      expect(b.xPct).toBeGreaterThanOrEqual(0);
      expect(b.xPct).toBeLessThanOrEqual(100);
      expect(b.yPct).toBeGreaterThanOrEqual(0);
      expect(b.yPct).toBeLessThanOrEqual(100);
      expect(b.wPct).toBeGreaterThan(0);
      expect(b.hPct).toBeGreaterThan(0);
      expect(b.route).toBeTruthy();
    }
  });

  it('all building ids are unique', () => {
    const ids = hotspots.buildings.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

Verify: `npm test -- tests/island/hotspotsData.test.js` → 3 pass.

Commit: `feat(island): hotspots data module (#PHASE_2_V2_HOTSPOTS_DATA)`

## Task B2: HeroIsland component

**Files:**
- Create: `src/island/HeroIsland.jsx`

```jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokens } from '../design/tokens.js';
import { hotspots } from './hotspotsData.js';

export default function HeroIsland() {
  const router = useRouter();
  const [hovered, setHovered] = useState(null);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 1400,
        margin: '0 auto',
        aspectRatio: `${hotspots.imageWidth} / ${hotspots.imageHeight}`,
      }}
    >
      <picture>
        <source srcSet="/island/hero.webp" type="image/webp" />
        <img
          src="/island/hero.png"
          alt="Animal Crossing island map with clickable buildings"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'contain',
            borderRadius: 16,
            boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
          }}
        />
      </picture>

      {hotspots.buildings.map((b) => {
        const isHovered = hovered === b.id;
        return (
          <button
            key={b.id}
            onClick={() => router.push(b.route)}
            onMouseEnter={() => setHovered(b.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(b.id)}
            onBlur={() => setHovered(null)}
            aria-label={`Go to ${b.label}`}
            style={{
              position: 'absolute',
              left: `${b.xPct - b.wPct / 2}%`,
              top: `${b.yPct - b.hPct / 2}%`,
              width: `${b.wPct}%`,
              height: `${b.hPct}%`,
              background: isHovered
                ? 'rgba(255, 255, 255, 0.18)'
                : 'transparent',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              outline: 'none',
              transition: 'background 0.2s ease, transform 0.2s ease',
              transform: isHovered ? 'scale(1.04)' : 'scale(1)',
            }}
          />
        );
      })}

      {hovered && (() => {
        const b = hotspots.buildings.find((x) => x.id === hovered);
        if (!b) return null;
        return (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: `${b.xPct}%`,
              top: `${Math.max(0, b.yPct - b.hPct / 2 - 4)}%`,
              transform: 'translate(-50%, -100%)',
              background: tokens.color.paper,
              color: tokens.color.ink,
              fontFamily: tokens.font.handwriting,
              fontSize: 'clamp(14px, 1.4vw, 18px)',
              padding: '6px 14px',
              borderRadius: tokens.radius.pill,
              border: `1.5px solid ${tokens.color.woodDark}`,
              boxShadow: tokens.shadow.paper,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {b.label}
          </div>
        );
      })()}
    </div>
  );
}
```

Verify build: `npm run build` clean.

Commit: `feat(island): HeroIsland component with image + hotspots (#PHASE_2_V2_HERO)`

## Task B3: Replace coverflow on LandingPage

Modify `src/LandingPage.jsx`:

1. Add import: `import HeroIsland from './island/HeroIsland.jsx';`
2. Replace the entire hero `<section>` (current lines ~183-258, the coverflow + stats + CTAs block) with:

```jsx
<section style={styles.heroNew}>
  <div style={styles.heroHeader}>
    <h1 style={styles.heroTitleNew}>ACNH Helper Suite</h1>
    <p style={styles.heroSubtitleNew}>Your complete island companion</p>
  </div>
  <div style={styles.heroIslandWrap}>
    <HeroIsland />
  </div>
  <div style={styles.heroBottom}>
    <div style={styles.statsBar}>
      <span style={styles.stat}>40 tools</span>
      <span style={styles.statDot}>&bull;</span>
      <span style={styles.stat}>781 recipes</span>
      <span style={styles.statDot}>&bull;</span>
      <span style={styles.stat}>21,626 sprites</span>
    </div>
    <div style={styles.ctaRow}>
      {status === 'authenticated' ? (
        <button onClick={handleGoToTools} style={styles.ctaPrimary}>Go to my tools &rarr;</button>
      ) : (
        <>
          <button onClick={handleSignIn} style={styles.ctaPrimary}>Sign in with Google</button>
          <button onClick={handleGuest} style={styles.ctaSecondary}>Try as Guest</button>
        </>
      )}
    </div>
  </div>
</section>
```

3. Remove the now-unused `COVERFLOW_ITEMS` array (top of file) and `coverflowIndex` state + auto-rotate effect.

4. Add new style entries (`heroNew`, `heroHeader`, `heroTitleNew`, `heroSubtitleNew`, `heroIslandWrap`, `heroBottom`). Update font import to include `Patrick Hand`.

5. `npm test` → 33 + 3 new = 36 pass.

6. `npm run build` → clean.

Commit: `feat(island): replace coverflow hero with HeroIsland (#PHASE_2_V2_REPLACE_HERO)`

## Task B4: Version bump + push

```bash
# package.json: 5.0.2 → 5.1.0
npm install --package-lock-only
git add package.json package-lock.json
git commit -m "chore(version): bump to 5.1.0 for Phase 2 v2 island landing"
git push origin main
```

Verify deploy: visit https://acnh-portal.vercel.app — landing should show the AI-illustrated island, no coverflow, hover tooltips work, click navigates to /app.

---

## Done criteria (full plan)

- `public/island/hero.png`, `hero.webp`, `hotspots.json` committed.
- `src/island/HeroIsland.jsx`, `src/island/hotspotsData.js` committed.
- `src/LandingPage.jsx` no longer references coverflow.
- 36 tests pass.
- Production landing shows the illustration; clicking any building navigates to `/app`.
- Image loads under 600 KB on first paint (WebP served when supported).

## Risk register

| Risk | Mitigation |
|------|------------|
| AI generation takes more than 1 prompt iteration to land a usable base | Half A budget assumes 4-6 generations; if exhausted, fall back to commission |
| Photoshop touch-up reveals AI is irretrievably weird | Try a different generator (Firefly if used Midjourney, or vice versa); if 2 generators fail, commission instead |
| Hotspot percentage coordinates drift on different aspect ratios | Page aspect-ratio locked via `aspect-ratio` CSS, so percentages stay consistent. Only fails if image is replaced with different dimensions — rebuild `hotspots.json` if so |
| Image is too large (>1MB) hurting perf | WebP target <300KB at q82; if PNG-only fallback >800KB, lower PNG quality or accept WebP-only with PNG omitted |
| Vercel image optimization disabled (existing config: `unoptimized: true`) means we serve full size | Already accounted — using `<picture>`/`<source>` for WebP fallback to compensate |
| Mobile rendering: hotspots too small to tap | Hotspot sizes are percentage-based, scale with container. Test at 375px viewport. If under 44px tappable area, expand `wPct`/`hPct` per-building |

## Open questions for the user

None pre-execution. The prompt + retouch flow are documented for you to follow at your pace. When the asset is committed, I take over.
