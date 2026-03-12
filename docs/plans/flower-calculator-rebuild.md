# FlowerCalculator Rebuild Plan — Issue #18

## Status: RESEARCH COMPLETE

---

## Verified Data Sources

### Source 1: flowers.js (verified data file)
All genotypes below come from `ACNH-Helper-Suite/data/flowers.js`.

### Source 2: Asset manifest (datamined game files)
58 flower plant assets in `public/assets-web/manifest.json` → "other" category.

### Source 3: Nookipedia (community wiki)
Cross-referenced for color existence, seed availability, and special mechanics.

---

## Verified Flower Data per Species

### 1. Rose (4-gene system: R-Y-W-S)
**Seed colors:** Red, White, Yellow
**All colors (10):** Red, White, Yellow, Pink, Purple, Orange, Black, Blue, Gold, Green

| Color | Genes | Source | Asset |
|-------|-------|--------|-------|
| Red | RR-yy-WW-ss | seed | red-rose plant ✅ |
| White | rr-yy-WW-Ss | seed | white-rose plant ✅ |
| Yellow | rr-YY-WW-ss | seed | yellow-rose plant ✅ |
| Pink | Rr-yy-WW-Ss | hybrid | pink-rose plant ✅ |
| Purple | rr-yy-ww-Ss | hybrid | purple-rose plant ✅ |
| Orange | RR-Yy-WW-ss | hybrid | orange-rose plant ✅ |
| Black | RR-yy-ww-ss | hybrid | black-rose plant ✅ |
| Blue | RR-YY-ww-ss | hybrid | blue-rose plant ✅ |
| Gold | RR-YY-ww-ss | hybrid (golden watering can on black) | gold-rose plant ✅ |
| Green | rr-YY-ww-ss | hybrid | — (no asset) |

**Note:** Green rose has no manifest asset but IS in flowers.js. Keep in data but no AssetImg.

### 2. Tulip (3-gene system: R-Y-W)
**Seed colors:** Red, White, Yellow
**All colors (7):** Red, White, Yellow, Pink, Purple, Orange, Black

| Color | Genes | Source | Asset |
|-------|-------|--------|-------|
| Red | RR-yy-ww | seed | red-tulip plant ✅ |
| White | rr-yy-WW | seed | white-tulip plant ✅ |
| Yellow | RR-YY-ww | seed | yellow-tulip plant ✅ |
| Pink | Rr-yy-WW | hybrid | pink-tulip plant ✅ |
| Purple | rr-yy-ww | hybrid | purple-tulip plant ✅ |
| Orange | RR-Yy-ww | hybrid | orange-tulip plant ✅ |
| Black | rr-yy-ww | hybrid | black-tulip plant ✅ |

### 3. Pansy (3-gene system: R-Y-W)
**Seed colors:** Red, White, Yellow
**All colors (6):** Red, White, Yellow, Orange, Blue, Purple
**⚠️ NO PINK PANSY — current component has fabricated Pink pansy. REMOVE IT.**

| Color | Genes | Source | Asset |
|-------|-------|--------|-------|
| Red | RR-yy-ww | seed | red-pansy plant ✅ |
| White | rr-yy-WW | seed | white-pansy plant ✅ |
| Yellow | RR-YY-ww | seed | yellow-pansy plant ✅ |
| Orange | RR-Yy-ww | hybrid | orange-pansy plant ✅ |
| Blue | rr-yy-ww | hybrid | blue-pansy plant ✅ |
| Purple | rr-yy-ww | hybrid | purple-pansy plant ✅ |

**Note:** flowers.js lists Pink pansy — THIS IS WRONG in the data file too. Remove from component.

### 4. Cosmos (3-gene system: R-Y-W)
**Seed colors:** Red, White, Yellow
**All colors (6):** Red, White, Yellow, Pink, Orange, Black

| Color | Genes | Source | Asset |
|-------|-------|--------|-------|
| Red | RR-yy-ww | seed | red-cosmos plant ✅ |
| White | rr-yy-WW | seed | white-cosmos plant ✅ |
| Yellow | RR-YY-ww | seed | yellow-cosmos plant ✅ |
| Pink | Rr-yy-WW | hybrid | pink-cosmos plant ✅ |
| Orange | RR-Yy-ww | hybrid | orange-cosmos plant ✅ |
| Black | rr-yy-ww | hybrid | black-cosmos plant ✅ |

### 5. Lily (3-gene system: R-Y-W)
**Seed colors:** Red, White, Yellow
**All colors (6):** Red, White, Yellow, Pink, Orange, Black

| Color | Genes | Source | Asset |
|-------|-------|--------|-------|
| Red | RR-yy-ww | seed | red-lily plant ✅ |
| White | rr-yy-WW | seed | white-lily plant ✅ |
| Yellow | RR-YY-ww | seed | yellow-lily plant ✅ |
| Pink | Rr-yy-WW | hybrid | pink-lily plant ✅ |
| Orange | RR-Yy-ww | hybrid | orange-lily plant ✅ |
| Black | rr-yy-ww | hybrid | black-lily plant ✅ |

### 6. Hyacinth (3-gene system: R-Y-W)
**Seed colors:** Red, White, Yellow (Nookipedia confirms yellow-hyacinth bags exist)
**All colors (7):** Red, White, Yellow, Blue, Pink, Orange, Purple

**⚠️ flowers.js has issues:**
- Lists seed colors as `["Red", "White", "Blue"]` — should include Yellow
- Lists "Light Blue" — manifest says just "blue"
- Missing Orange hyacinth entirely

| Color | Genes | Source | Asset |
|-------|-------|--------|-------|
| Red | RR-yy-ww | seed | red-hyacinth plant ✅ |
| White | rr-yy-WW | seed | white-hyacinth plant ✅ |
| Yellow | (need genes) | seed | yellow-hyacinth plant ✅ |
| Blue | rr-yy-ww | seed/hybrid | blue-hyacinth plant ✅ |
| Pink | Rr-yy-WW | hybrid | pink-hyacinth plant ✅ |
| Orange | (need genes) | hybrid | orange-hyacinth plant ✅ |
| Purple | rr-yy-ww | hybrid | purple-hyacinth plant ✅ |

**Action needed:** Research Yellow and Orange hyacinth genotypes from datamined sources.

### 7. Windflower (3-gene system: R-Y-W)
**Seed colors:** Red, White, Orange
**All colors (6):** Red, White, Orange, Pink, Blue, Purple
**⚠️ NO YELLOW WINDFLOWER — current component has fabricated Yellow. REMOVE IT.**

| Color | Genes | Source | Asset |
|-------|-------|--------|-------|
| Red | RR-yy-ww | seed | red-windflower plant ✅ |
| White | rr-yy-WW | seed | white-windflower plant ✅ |
| Orange | RR-Yy-ww | seed | orange-windflower plant ✅ |
| Pink | Rr-yy-WW | hybrid | pink-windflower plant ✅ |
| Blue | rr-yy-ww | hybrid | blue-windflower plant ✅ |
| Purple | rr-yy-ww | hybrid | purple-windflower plant ✅ |

### 8. Mum (3-gene system: R-Y-W)
**Seed colors:** Red, White, Yellow
**All colors (6):** Red, White, Yellow, Pink, Purple, Green

| Color | Genes | Source | Asset |
|-------|-------|--------|-------|
| Red | RR-yy-ww | seed | red-mum plant ✅ |
| White | rr-yy-WW | seed | white-mum plant ✅ |
| Yellow | RR-YY-ww | seed | yellow-mum plant ✅ |
| Pink | Rr-yy-WW | hybrid | pink-mum plant ✅ |
| Purple | rr-yy-ww | hybrid | purple-mum plant ✅ |
| Green | rr-YY-ww | hybrid | green-mum plant ✅ |

---

## Blue Rose Path (from flowers.js)

1. **Breed Seed Red + Seed Yellow → Orange hybrids** (special genes)
2. **Breed Orange hybrids together → Hybrid Red** (rare)
3. **Breed Hybrid Red + Hybrid Red → Hybrid Red++**
4. **Breed Hybrid Red++ → Blue Rose** (~1.56% chance per bloom)
Estimated time: 4-6 weeks

---

## Gold Rose Mechanic

Gold roses are NOT standard hybrids. They require:
1. Breed black roses (RR-yy-ww-ss)
2. Water black roses with a **Golden Watering Can**
3. Black roses will then have a chance to produce gold offspring

The component must show this as a special mechanic, not a breeding pair.

---

## Changes Required

### Data fixes:
1. Replace ALL genotype data with verified values from flowers.js
2. Remove Pink Pansy (fabricated)
3. Remove Yellow Windflower (fabricated)
4. Fix Hyacinth: add Yellow as seed, add Orange as hybrid, fix seed list
5. Fix Gold Rose: show as special mechanic, not standard breeding
6. Fix Orange Windflower: mark as seed, not hybrid
7. Replace all breeding paths with verified data from flowers.js

### flowers.js data file fixes needed (separate issue):
1. Pansy: remove Pink entry (doesn't exist)
2. Hyacinth: fix seed colors to ["Red", "White", "Yellow"], add Orange and Yellow colors
3. Windflower: Orange should be source: "seed"

### UI changes:
1. Update color grids per species to show correct colors only
2. AssetImg pattern: `<AssetImg category="other" name={`${color}-${species} plant`} />`
3. Add Gold Rose special section with watering can mechanic
4. Keep Blue Rose path display

### Verification checklist:
- [ ] Every color per species matches manifest assets
- [ ] No fabricated colors (no pink pansy, no yellow windflower)
- [ ] All genotypes from flowers.js (not invented)
- [ ] Gold rose shows watering can mechanic
- [ ] Blue rose path matches flowers.js steps
- [ ] Breeding outcomes match flowers.js
- [ ] Build passes
- [ ] Visual inspection of all 8 species tabs
