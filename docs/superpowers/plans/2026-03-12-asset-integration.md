# ACNH Asset Integration — Replace All Emoji with Game Sprites

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every emoji placeholder across all 22 artifacts with real ACNH game sprites from the locally downloaded asset library, preserving originals and using optimized copies for the web.

**Architecture:** Original 885MB assets stay in `public/assets/` as the source of truth. A build-time Python script generates optimized web copies in `public/assets-web/` at target sizes per category (32px for list icons, 64px for cards, 128px for detail views). Each artifact imports a shared `useAssets` hook that loads the manifest and provides `<AssetImg>` — a component that renders `<img>` with automatic emoji fallback on error. No external runtime dependencies.

**Tech Stack:** Python 3 + Pillow (resize/optimize), React hooks, Vite static assets (`public/`)

---

## Chunk 1: Asset Pipeline & Shared Infrastructure

### Task 1: Create the asset resize/optimize script

**Files:**
- Create: `scripts/optimize-assets.py`

This script reads from `public/assets/` (originals, untouched) and writes optimized WebP copies to `public/assets-web/`. Originals are never modified.

- [ ] **Step 1: Write the optimize script**

```python
#!/usr/bin/env python3
"""
Resize and optimize ACNH assets for web use.
Reads from public/assets/ (originals preserved).
Writes to public/assets-web/ (optimized WebP copies).

Usage: python3 scripts/optimize-assets.py
"""

import os
import json
from pathlib import Path
from PIL import Image

SRC = Path("public/assets")
DST = Path("public/assets-web")
MANIFEST_SRC = SRC / "manifest.json"
MANIFEST_DST = DST / "manifest.json"

# Target sizes per image type (width=height, square)
SIZE_MAP = {
    "Icon Image": 64,
    "Critterpedia Image": 128,    # wider, keep aspect ratio
    "Furniture Image": 64,
    "Album Image": 128,
    "Image": 64,
    "Photo Image": 96,
    "House Image": 96,
    "Closet Image": 64,
    "Storage Image": 64,
    "Framed Image": 96,
    "Source Notes": None,          # skip these
}
DEFAULT_SIZE = 64

def get_target_size(filename):
    """Determine target size from filename."""
    stem = Path(filename).stem
    if stem in SIZE_MAP:
        return SIZE_MAP[stem]
    return DEFAULT_SIZE

def optimize_image(src_path, dst_path, target_size):
    """Resize and convert a single image to optimized WebP."""
    if target_size is None:
        return False
    try:
        with Image.open(src_path) as img:
            img = img.convert("RGBA")
            # Resize preserving aspect ratio, fit within target_size box
            img.thumbnail((target_size, target_size), Image.LANCZOS)
            dst_path.parent.mkdir(parents=True, exist_ok=True)
            # Save as WebP for smaller size, fall back to PNG if transparency issues
            webp_path = dst_path.with_suffix(".webp")
            img.save(webp_path, "WEBP", quality=85, method=6)
            return True
    except Exception as e:
        print(f"  WARN: {src_path}: {e}")
        return False

def main():
    if not MANIFEST_SRC.exists():
        print(f"ERROR: {MANIFEST_SRC} not found. Run from project root.")
        return

    with open(MANIFEST_SRC) as f:
        manifest = json.load(f)

    # Build new manifest with .webp extensions
    web_manifest = {}
    total = 0
    converted = 0
    skipped = 0

    for category, items in manifest.items():
        web_manifest[category] = {}
        for item_name, files in items.items():
            web_files = []
            for rel_path in files:
                total += 1
                src_path = SRC / rel_path
                target_size = get_target_size(Path(rel_path).name)
                if target_size is None:
                    skipped += 1
                    continue
                dst_rel = Path(rel_path).with_suffix(".webp")
                dst_path = DST / dst_rel
                if optimize_image(src_path, dst_path, target_size):
                    web_files.append(str(dst_rel))
                    converted += 1
            if web_files:
                web_manifest[category][item_name] = web_files

    # Write web manifest
    DST.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_DST, "w") as f:
        json.dump(web_manifest, f, indent=2, ensure_ascii=False)

    print(f"\nDone! {converted}/{total} converted, {skipped} skipped")
    print(f"Web manifest: {MANIFEST_DST}")
    print(f"Web assets size: {sum(f.stat().st_size for f in DST.rglob('*.webp')) / 1024 / 1024:.1f} MB")

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run the optimize script**

Run from the repo root: `python3 scripts/optimize-assets.py`
Expected: Converts ~21k PNGs to optimized WebP in `public/assets-web/`, significantly smaller than 885MB originals.

- [ ] **Step 3: Add assets-web to .gitignore**

Append to `.gitignore`:
```
public/assets-web/
```

- [ ] **Step 4: Verify output**

Run: `ls public/assets-web/ && du -sh public/assets-web/`
Expected: 34 category directories + manifest.json, total size ~50-100MB

- [ ] **Step 5: Commit**

```bash
git add scripts/optimize-assets.py .gitignore
git commit -m "feat: add asset optimization script (PNG→WebP resize pipeline)"
```

---

### Task 2: Create the shared AssetImg component and useAssets hook

**Files:**
- Modify: `src/assetHelper.js` → rewrite as `src/assetHelper.jsx`

Replace the current utility-only module with a React component + hook approach. The `<AssetImg>` component renders a game sprite with automatic emoji fallback.

- [ ] **Step 1: Rewrite assetHelper as assetHelper.jsx**

```jsx
/**
 * Asset Helper — React component and hook for ACNH game sprites.
 *
 * <AssetImg> renders an optimized WebP sprite with emoji fallback.
 * useAssets() loads the manifest and provides lookup functions.
 *
 * Assets are served from /assets-web/ (optimized WebP copies).
 * Originals preserved in /assets/ (not served to browser).
 */
import { useState, useEffect, useCallback, memo } from 'react';

const BASE = '/assets-web';

// Preferred image type priority for auto-selection
const ICON_PRIORITY = [
  'Icon Image',
  'Critterpedia Image',
  'Album Image',
  'Image',
  'Furniture Image',
];

// Maps artifact data categories to asset directory names
export const CATEGORY_MAP = {
  fish: 'fish',
  bugs: 'insects',
  'sea-creatures': 'sea-creatures',
  seaCreatures: 'sea-creatures',
  fossils: 'fossils',
  art: 'art',
  music: 'music',
  recipes: 'recipes',
  tools: 'tools',
  villagers: 'villagers',
  npcs: 'special-npcs',
  reactions: 'reactions',
  housewares: 'housewares',
  wallpaper: 'wallpaper',
  floors: 'floors',
  rugs: 'rugs',
  fencing: 'fencing',
  tops: 'tops',
  bottoms: 'bottoms',
  'dress-up': 'dress-up',
  headwear: 'headwear',
  accessories: 'accessories',
  bags: 'bags',
  shoes: 'shoes',
  socks: 'socks',
  umbrellas: 'umbrellas',
  photos: 'photos',
  posters: 'posters',
  construction: 'construction',
  'wall-mounted': 'wall-mounted',
  'clothing-other': 'clothing-other',
  miscellaneous: 'miscellaneous',
  other: 'other',
  'message-cards': 'message-cards',
};

/**
 * Hook: loads manifest and provides asset lookup.
 * Call once per artifact. Returns { getIcon, loaded }.
 */
let _manifestCache = null;
let _manifestPromise = null;

export function useAssets() {
  const [manifest, setManifest] = useState(_manifestCache);
  const [loaded, setLoaded] = useState(!!_manifestCache);

  useEffect(() => {
    if (_manifestCache) {
      setManifest(_manifestCache);
      setLoaded(true);
      return;
    }
    if (!_manifestPromise) {
      _manifestPromise = fetch(`${BASE}/manifest.json`)
        .then(r => r.json())
        .then(data => { _manifestCache = data; return data; })
        .catch(() => null);
    }
    _manifestPromise.then(data => {
      if (data) { setManifest(data); setLoaded(true); }
    });
  }, []);

  const getIcon = useCallback((category, itemName, preferredType) => {
    if (!manifest) return null;
    const dir = CATEGORY_MAP[category] || category;
    const items = manifest[dir];
    if (!items) return null;

    // Case-insensitive lookup
    const key = Object.keys(items).find(
      k => k.toLowerCase() === itemName.toLowerCase()
    );
    if (!key) return null;

    const files = items[key];
    if (!files || files.length === 0) return null;

    // Try preferred type first
    if (preferredType) {
      const match = files.find(f => f.includes(preferredType));
      if (match) return `${BASE}/${match}`;
    }

    // Try priority order
    for (const pref of ICON_PRIORITY) {
      const match = files.find(f => f.includes(pref));
      if (match) return `${BASE}/${match}`;
    }

    // Fallback: first file
    return `${BASE}/${files[0]}`;
  }, [manifest]);

  return { getIcon, loaded, manifest };
}

/**
 * AssetImg — renders a game sprite with emoji fallback.
 *
 * Props:
 *   category  — asset category key (e.g., 'fish', 'bugs', 'villagers')
 *   name      — item name (e.g., 'Bitterling', 'Raymond')
 *   fallback  — emoji string to show if image unavailable (default: '')
 *   size      — pixel size (default: 32)
 *   style     — additional inline styles
 *   imageType — preferred image type (e.g., 'Album Image', 'Critterpedia Image')
 */
export const AssetImg = memo(function AssetImg({
  category,
  name,
  fallback = '',
  size = 32,
  style = {},
  imageType,
  src: directSrc,
}) {
  const { getIcon, loaded } = useAssets();
  const [failed, setFailed] = useState(false);

  const src = directSrc || (loaded ? getIcon(category, name, imageType) : null);

  if (!src || failed) {
    return (
      <span
        style={{ fontSize: `${size}px`, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: `${size}px`, height: `${size}px`, ...style }}
        role="img"
        aria-label={name || fallback}
      >
        {fallback}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ objectFit: 'contain', ...style }}
    />
  );
});

export default AssetImg;
```

- [ ] **Step 2: Delete the old assetHelper.js**

Run: `rm src/assetHelper.js`

- [ ] **Step 3: Verify build compiles**

Run: `npm run build 2>&1 | tail -5`
Expected: Clean build with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/assetHelper.jsx
git commit -m "feat: add AssetImg component with useAssets hook and emoji fallback"
```

---

## Chunk 2: Integrate into Critterpedia Artifacts (3 tools)

These three artifacts have the most direct item-to-asset mapping (creature name → asset directory).

### Task 3: FishTracker.jsx — replace emoji with sprites

**Files:**
- Modify: `src/artifacts/FishTracker.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. Replace `<span style={{ fontSize: "20px" }}>🐟</span>` with `<AssetImg category="fish" name={fish.name} fallback="🐟" size={32} />`
3. Keep `LOCATION_EMOJI` as-is (these are UI indicators, not game items)
4. Keep title emoji `🎣` as-is (decorative, not an item)

- [ ] **Step 1: Add AssetImg import**
- [ ] **Step 2: Replace fish item emoji with AssetImg**
- [ ] **Step 3: Verify in dev server** — `npm run dev`, open FishTracker, confirm sprites load with emoji fallback
- [ ] **Step 4: Commit**

```bash
git add src/artifacts/FishTracker.jsx
git commit -m "feat(FishTracker): replace fish emoji with game sprites"
```

### Task 4: BugTracker.jsx — replace emoji with sprites

**Files:**
- Modify: `src/artifacts/BugTracker.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. Replace `<span style={styles.emoji}>{BUG_EMOJI}</span>` and `<span style={styles.bugNameEmoji}>{BUG_EMOJI}</span>` with `<AssetImg category="bugs" name={bug.name} fallback="🐛" size={32} />`
3. Keep `LOCATION_EMOJI` as-is (UI indicators)

- [ ] **Step 1: Add AssetImg import**
- [ ] **Step 2: Replace bug item emoji with AssetImg**
- [ ] **Step 3: Verify in dev server**
- [ ] **Step 4: Commit**

```bash
git add src/artifacts/BugTracker.jsx
git commit -m "feat(BugTracker): replace bug emoji with game sprites"
```

### Task 5: SeaCreatureTracker.jsx — replace emoji with sprites

**Files:**
- Modify: `src/artifacts/SeaCreatureTracker.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. Each creature has an `emoji` property in the data array. Replace rendering of `{creature.emoji}` with `<AssetImg category="sea-creatures" name={creature.name} fallback={creature.emoji} size={32} />`
3. Keep size indicators (⚪🔵🔴) as-is
4. Keep 🤿 diving icon as-is (UI element)

- [ ] **Step 1: Add AssetImg import**
- [ ] **Step 2: Replace creature emoji with AssetImg**
- [ ] **Step 3: Verify in dev server**
- [ ] **Step 4: Commit**

```bash
git add src/artifacts/SeaCreatureTracker.jsx
git commit -m "feat(SeaCreatureTracker): replace creature emoji with game sprites"
```

---

## Chunk 3: Museum & Collection Artifacts (4 tools)

### Task 6: MuseumTracker.jsx — replace section emoji with sprites

**Files:**
- Modify: `src/artifacts/MuseumTracker.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. In `renderSection()`, replace the emoji parameter usage with `<AssetImg>` for each item in fish/bugs/sea/fossils/art lists
3. Tab labels (🐟 Fish, 🪲 Bugs, etc.) — replace with small 20px `<AssetImg>` inline with text
4. Keep ✅/☐ checkboxes as-is (UI state indicators)

- [ ] **Step 1: Add AssetImg import and integrate in renderSection**
- [ ] **Step 2: Replace tab label emoji with small AssetImg**
- [ ] **Step 3: Verify in dev server — check all 5 tabs**
- [ ] **Step 4: Commit**

```bash
git add src/artifacts/MuseumTracker.jsx
git commit -m "feat(MuseumTracker): replace collection emoji with game sprites"
```

### Task 7: ArtDetector.jsx — replace art emoji with sprites

**Files:**
- Modify: `src/artifacts/ArtDetector.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. Replace `{art.type === 'painting' ? '🖼️' : '🗿'}` with `<AssetImg category="art" name={art.name} fallback={art.type === 'painting' ? '🖼️' : '🗿'} size={32} />`
3. Keep ✅/⚠️ status badges as-is (UI indicators)

- [ ] **Step 1: Add AssetImg import**
- [ ] **Step 2: Replace art emoji with AssetImg in all 3 modes (Detector, Collection, Redd)**
- [ ] **Step 3: Verify in dev server**
- [ ] **Step 4: Commit**

```bash
git add src/artifacts/ArtDetector.jsx
git commit -m "feat(ArtDetector): replace art emoji with game sprites"
```

### Task 8: KKCatalogue.jsx — replace song emoji with album art

**Files:**
- Modify: `src/artifacts/KKCatalogue.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. Replace `<div style={styles.songEmoji}>🎵</div>` with `<AssetImg category="music" name={song.name} fallback="🎵" size={48} imageType="Album Image" />`
3. In Saturday planner section, replace `🎵 {song.name}` with `<AssetImg>` inline
4. Keep 🔒/🔐 lock icons as-is (UI indicators)

- [ ] **Step 1: Add AssetImg import**
- [ ] **Step 2: Replace song emoji with album art in song cards and planner**
- [ ] **Step 3: Verify in dev server**
- [ ] **Step 4: Commit**

```bash
git add src/artifacts/KKCatalogue.jsx
git commit -m "feat(KKCatalogue): replace song emoji with K.K. album art"
```

### Task 9: GoldenToolTracker.jsx — replace tool emoji with sprites

**Files:**
- Modify: `src/artifacts/GoldenToolTracker.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. Replace tool badge emoji (🎣🦋🪓🏹💧🛠️) with `<AssetImg category="tools" name={toolName} fallback={emoji} size={40} />`
3. Map tool keys to asset names: fishing rod → "golden fishing rod", net → "golden net", axe → "golden axe", slingshot → "golden slingshot", watering can → "golden watering can", shovel → "golden shovel"
4. Keep ✨ sparkles and 🏆 trophy as-is (UI decoration)

- [ ] **Step 1: Add AssetImg import and tool name mapping**
- [ ] **Step 2: Replace tool emoji with AssetImg**
- [ ] **Step 3: Verify in dev server**
- [ ] **Step 4: Commit**

```bash
git add src/artifacts/GoldenToolTracker.jsx
git commit -m "feat(GoldenToolTracker): replace tool emoji with golden tool sprites"
```

---

## Chunk 4: Gardening Artifacts (3 tools)

### Task 10: FlowerCalculator.jsx — replace flower emoji with sprites

**Files:**
- Modify: `src/artifacts/FlowerCalculator.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. The flower species each have an `emoji` field (🌹🌷🌸🌼🌺💐🪻🌻). Find the flower asset in `miscellaneous/` or `other/` by species name
3. Replace flower emoji rendering with `<AssetImg category="other" name={`${color}-${species} plant`} fallback={species.emoji} size={24} />`
4. Keep 🧪💙 section icons as-is (UI)

- [ ] **Step 1: Verify flower assets exist** — `ls public/assets/other/ | grep -i "rose\|tulip\|pansy\|cosmos\|lily\|hyacinth\|windflower\|mum"`
- [ ] **Step 2: Add AssetImg import and flower name mapping**
- [ ] **Step 3: Replace flower emoji with AssetImg**
- [ ] **Step 4: Verify in dev server**
- [ ] **Step 5: Commit**

```bash
git add src/artifacts/FlowerCalculator.jsx
git commit -m "feat(FlowerCalculator): replace flower emoji with plant sprites"
```

### Task 11: GardenPlanner.jsx — replace flower emoji in grid

**Files:**
- Modify: `src/artifacts/GardenPlanner.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. Grid cells currently show flower emoji. Replace with small 20px `<AssetImg>` using same flower mapping as Task 10
3. Keep 💾 save button emoji as-is (UI)

- [ ] **Step 1: Add AssetImg import**
- [ ] **Step 2: Replace grid cell flower emoji with tiny AssetImg**
- [ ] **Step 3: Verify in dev server — test grid rendering performance with many cells**
- [ ] **Step 4: Commit**

```bash
git add src/artifacts/GardenPlanner.jsx
git commit -m "feat(GardenPlanner): replace grid flower emoji with plant sprites"
```

### Task 12: IslandFlowerMap.jsx — replace flower emoji in kanban

**Files:**
- Modify: `src/artifacts/IslandFlowerMap.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. Replace flower emoji in kanban cards and watering checklist with `<AssetImg>`
3. Keep ✓/✕ status indicators and 💧📋📊 section icons as-is (UI)

- [ ] **Step 1: Add AssetImg import**
- [ ] **Step 2: Replace kanban card flower emoji with AssetImg**
- [ ] **Step 3: Verify in dev server**
- [ ] **Step 4: Commit**

```bash
git add src/artifacts/IslandFlowerMap.jsx
git commit -m "feat(IslandFlowerMap): replace flower emoji with plant sprites"
```

---

## Chunk 5: Villager & NPC Artifacts (3 tools)

### Task 13: VillagerGiftGuide.jsx — replace with villager icons

**Files:**
- Modify: `src/artifacts/VillagerGiftGuide.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. In birthday calendar, add villager icon next to name: `<AssetImg category="villagers" name={villager.name} fallback="" size={24} />`
3. Keep personality emoji (😊🌟😴💪😤💅🎩🤙) — these represent personality types, not individual villagers, and there are no direct assets for personality types
4. Keep ⭐ star ratings as-is (UI)

- [ ] **Step 1: Add AssetImg import**
- [ ] **Step 2: Add villager icons next to names in birthday calendar**
- [ ] **Step 3: Verify in dev server**
- [ ] **Step 4: Commit**

```bash
git add src/artifacts/VillagerGiftGuide.jsx
git commit -m "feat(VillagerGiftGuide): add villager icon sprites to birthday calendar"
```

### Task 14: GulliverTracker.jsx — replace NPC emoji

**Files:**
- Modify: `src/artifacts/GulliverTracker.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. Replace title 🐦/🏴‍☠️ with `<AssetImg category="npcs" name="Gulliver" fallback="🐦" size={32} />` and `<AssetImg category="npcs" name="Gullivarrr" fallback="🏴‍☠️" size={32} />`
3. Keep 📋📅🎁 section icons as-is (UI)

- [ ] **Step 1: Verify NPC assets exist** — `ls public/assets/special-npcs/ | grep -i gulliver`
- [ ] **Step 2: Add AssetImg import**
- [ ] **Step 3: Replace Gulliver/Gullivarrr emoji with NPC sprites**
- [ ] **Step 4: Verify in dev server**
- [ ] **Step 5: Commit**

```bash
git add src/artifacts/GulliverTracker.jsx
git commit -m "feat(GulliverTracker): replace NPC emoji with character sprites"
```

### Task 15: SeasonalEventCalendar.jsx — replace NPC emoji

**Files:**
- Modify: `src/artifacts/SeasonalEventCalendar.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. Replace NPC emoji in visitor section (Kicks, Label, Saharah, Leif, Redd, Flick, C.J., Gullivarrr, Wisp, Celeste, K.K. Slider) with `<AssetImg category="npcs" name={npc.name} fallback={npc.emoji} size={28} />`
3. Keep event emoji (🎉🐰👻🦃🎁) — these represent events, not specific items
4. Keep seasonal material emoji (🌸🎋🐚🍂🍁🍄❄️) — decorative

- [ ] **Step 1: Verify NPC assets** — `ls public/assets/special-npcs/`
- [ ] **Step 2: Add AssetImg import and NPC name mapping**
- [ ] **Step 3: Replace NPC emoji with sprites**
- [ ] **Step 4: Verify in dev server**
- [ ] **Step 5: Commit**

```bash
git add src/artifacts/SeasonalEventCalendar.jsx
git commit -m "feat(SeasonalEventCalendar): replace NPC emoji with character sprites"
```

---

## Chunk 6: Economy & Tracking Artifacts (5 tools)

### Task 16: DIYRecipeTracker.jsx — replace category emoji with recipe sprites

**Files:**
- Modify: `src/artifacts/DIYRecipeTracker.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. For each recipe in the list, add an `<AssetImg category="recipes" name={recipe.name} fallback={categoryEmoji} size={24} />` next to the recipe name
3. Keep category tab emoji as-is (they represent broad categories, not individual items)

- [ ] **Step 1: Add AssetImg import**
- [ ] **Step 2: Add recipe sprites to individual recipe items in list view**
- [ ] **Step 3: Verify in dev server**
- [ ] **Step 4: Commit**

```bash
git add src/artifacts/DIYRecipeTracker.jsx
git commit -m "feat(DIYRecipeTracker): add recipe sprites to item list"
```

### Task 17: CelesteMeteorTracker.jsx — replace zodiac/item emoji

**Files:**
- Modify: `src/artifacts/CelesteMeteorTracker.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. Replace zodiac item emoji with `<AssetImg category="miscellaneous" name={item.name} fallback={item.emoji} size={28} />`
3. Keep ✨🌙🌠 decorative icons as-is (UI atmosphere)

- [ ] **Step 1: Verify zodiac/space assets** — `ls public/assets/miscellaneous/ | grep -i "aquarius\|pisces\|aries\|zodiac\|star\|fragment"`
- [ ] **Step 2: Add AssetImg import**
- [ ] **Step 3: Replace item emoji with sprites where assets exist**
- [ ] **Step 4: Verify in dev server**
- [ ] **Step 5: Commit**

```bash
git add src/artifacts/CelesteMeteorTracker.jsx
git commit -m "feat(CelesteMeteorTracker): replace zodiac emoji with item sprites"
```

### Task 18: NookMilesTracker.jsx — replace category emoji

**Files:**
- Modify: `src/artifacts/NookMilesTracker.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. The 16 activity categories each have emoji. Replace with representative asset icons where a clear mapping exists (e.g., Fishing → fishing rod tool asset, Bug Catching → net tool asset)
3. Keep 🎖️ title emoji and 🔄 repeatable badge as-is (UI)

- [ ] **Step 1: Add AssetImg import and category→asset mapping**
- [ ] **Step 2: Replace category emoji where clear asset matches exist**
- [ ] **Step 3: Verify in dev server**
- [ ] **Step 4: Commit**

```bash
git add src/artifacts/NookMilesTracker.jsx
git commit -m "feat(NookMilesTracker): replace category emoji with representative sprites"
```

### Task 19: DailyRoutine.jsx — replace task emoji

**Files:**
- Modify: `src/artifacts/DailyRoutine.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. Each daily task has an `emoji` field. Replace with `<AssetImg>` using tool/item assets:
   - 🪨 Hit rocks → stone asset
   - 🌳 Shake trees → tree asset
   - 💰 Money spot → bell bag asset
   - 🦴 Dig fossils → fossil asset
   - 🎣 Fishing → fishing rod asset
   - etc.
3. Keep 🔥 streak fire and ⭐✓◐○ status indicators as-is (UI)

- [ ] **Step 1: Add AssetImg import and task→asset mapping**
- [ ] **Step 2: Replace task emoji with AssetImg where clear matches exist**
- [ ] **Step 3: Verify in dev server**
- [ ] **Step 4: Commit**

```bash
git add src/artifacts/DailyRoutine.jsx
git commit -m "feat(DailyRoutine): replace task emoji with game sprites"
```

### Task 20: BellCalculator.jsx — replace currency/NPC emoji

**Files:**
- Modify: `src/artifacts/BellCalculator.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. Replace 🐛 Flick and 🐠 CJ references with `<AssetImg category="npcs" name="Flick" />` and `<AssetImg category="npcs" name="C.J." />`
3. Keep 💰🪙💵 currency emoji as-is (no direct bell sprite in assets)
4. Keep 📈🏠 section icons as-is (UI)

- [ ] **Step 1: Add AssetImg import**
- [ ] **Step 2: Replace Flick/CJ NPC emoji with sprites**
- [ ] **Step 3: Verify in dev server**
- [ ] **Step 4: Commit**

```bash
git add src/artifacts/BellCalculator.jsx
git commit -m "feat(BellCalculator): replace NPC emoji with character sprites"
```

---

## Chunk 7: Remaining Artifacts & Cleanup (5 tools)

### Task 21: TurnipTracker.jsx — minimal changes

**Files:**
- Modify: `src/artifacts/TurnipTracker.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. Replace title `📈` with turnip sprite if available: `<AssetImg category="miscellaneous" name="turnip" fallback="📈" size={24} />`
3. Keep 💡📊 UI icons as-is

- [ ] **Step 1: Verify turnip asset** — `ls public/assets/miscellaneous/ | grep -i turnip`
- [ ] **Step 2: Add AssetImg import and replace if asset exists**
- [ ] **Step 3: Commit**

### Task 22: NooksCrannyLog.jsx — minimal changes

**Files:**
- Modify: `src/artifacts/NooksCrannyLog.jsx`

**Changes:**
1. Import `{ AssetImg }` from `'../assetHelper'`
2. Replace 🏪 shop emoji in title with Nook's Cranny building sprite if available
3. Keep 📅📊📋 UI icons as-is

- [ ] **Step 1: Check for shop asset and add if available**
- [ ] **Step 2: Commit**

### Task 23: FiveStarChecker.jsx — minimal changes

**Files:**
- Modify: `src/artifacts/FiveStarChecker.jsx`

**Changes:**
1. This artifact is mostly UI indicators (⭐☆✓🏗️🌿). Very few game-item emoji.
2. Only replace if clear asset matches exist (e.g., 🏪 → shop sprite)
3. Keep star ratings ⭐☆ as-is (UI)

- [ ] **Step 1: Evaluate and make minimal replacements**
- [ ] **Step 2: Commit**

### Task 24: DreamAddressBook.jsx — minimal changes

**Files:**
- Modify: `src/artifacts/DreamAddressBook.jsx`

**Changes:**
1. This artifact is mostly user-input driven (custom island entries). Very few game-item emoji.
2. Keep all UI icons (📖⭐📊📋🗑💾🌙) as-is — they're functional, not representing game items
3. No AssetImg needed for this artifact.

- [ ] **Step 1: Review and confirm no changes needed**

### Task 25: Update CLAUDE.md and commit everything

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add asset documentation section to CLAUDE.md**

Add after the "Known Patterns & Gotchas" section:
```markdown
## Assets

### Directory Structure
- `public/assets/` — Original PNGs (885MB, 21,655 files, 34 categories). Source of truth. Not committed to git.
- `public/assets-web/` — Optimized WebP copies (resized per category). Generated by `scripts/optimize-assets.py`. Not committed to git.
- `public/assets/manifest.json` — Maps every category → item → file paths.

### Downloading Assets
Assets come from [Norviah/acnh-images](https://github.com/Norviah/acnh-images) (MIT license).
```bash
cd /path/to/cloned/acnh-images
# Copy images dir to acnh-portal/public/assets/
```

### Generating Optimized Web Assets
```bash
python3 scripts/optimize-assets.py
```

### Using Assets in Artifacts
```jsx
import { AssetImg } from '../assetHelper';

// In JSX:
<AssetImg category="fish" name="Bitterling" fallback="🐟" size={32} />
<AssetImg category="villagers" name="Raymond" fallback="" size={48} />
<AssetImg category="art" name="academic painting" fallback="🖼️" size={40} />
```

The `<AssetImg>` component:
- Loads the manifest once (cached globally)
- Does case-insensitive name lookup
- Falls back to emoji on load error
- Uses `loading="lazy"` for performance

### Asset Naming
- Fish/bugs/sea creatures: lowercase dirs (e.g., `bitterling`, `common butterfly`)
- Villagers: title case dirs (e.g., `Bob`, `Raymond`)
- Art: lowercase dirs (e.g., `academic painting`)
- Music: title case dirs (e.g., `Agent K.K.`)
```

- [ ] **Step 2: Update issue #13 status**

Run: `gh issue close 13 --repo diegocconsolini/ACHNHelper --comment "All emoji replaced with game sprites across 22 artifacts. Assets organized, optimized, and documented."`

- [ ] **Step 3: Final build check**

Run: `npm run build 2>&1 | tail -5`
Expected: Clean build, no errors.

- [ ] **Step 4: Final commit**

```bash
git add CLAUDE.md
git commit -m "docs: add asset system documentation to CLAUDE.md"
```
