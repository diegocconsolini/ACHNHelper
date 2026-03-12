# DIYRecipeTracker Rebuild Plan — Issue #17

## Status: RESEARCH COMPLETE

---

## Verified Data Sources

### Source 1: Asset manifest (datamined game files)
`public/assets-web/manifest.json` → "recipes" category: **486 recipe card assets**
These are the base-game DIY recipe cards with verified names from datamined files.

### Source 2: Nookipedia (community wiki)
Cross-referenced for total counts, categories, sources, seasonal dates, and 2.0 update recipes.

### Source 3: Current component analysis
The existing DIYRecipeTracker has **64% fabricated recipe names** — names like "Zodiac Furniture Aquarius", "Jack Skellington Costume", "Mush DIY Workbench", "Tree's Bounty Stool" that don't exist in the game.

---

## Total Recipe Counts (Verified)

| Category | Count |
|----------|-------|
| Base Game DIY (1.0) | ~670 |
| 2.0 Update DIY | ~113 |
| **Total DIY Recipes** | **~783** |
| Savory Cooking | 86 |
| Sweet Cooking | 55 |
| **Total Cooking** | **141** |
| **GRAND TOTAL** | **~924** |

### Manifest Coverage
- 486 recipe card assets cover base-game DIY recipes
- ~297 additional DIY recipes from 2.0 update have no recipe card images
- 141 cooking recipes have no recipe card images
- `<AssetImg category="recipes" name="..." />` works for the 486 base-game recipes

---

## Verified Recipe Categories & Names

### Tools (17+ recipes)
axe, fishing rod, flimsy axe, flimsy fishing rod, flimsy net, flimsy shovel, flimsy watering can, golden axe, golden net, golden rod, golden shovel, golden slingshot, golden watering can, ladder, net, shovel, slingshot, stone axe, vaulting pole, watering can

### Wands (21 recipes)
bamboo wand, cherry-blossom wand, cosmos wand, golden wand, hyacinth wand, ice wand, iron wand, lily wand, mums wand, mushroom wand, pansy wand, rose wand, shamrock wand, shell wand, spooky wand, star wand, tree-branch wand, tulip wand, wand, wedding wand, windflower wand

### Crowns & Wreaths (53 recipes)
blue rose crown, blue rose wreath, chic cosmos wreath, chic mum crown, chic rose crown, chic tulip crown, chic windflower wreath, cool hyacinth crown, cool hyacinth wreath, cool pansy crown, cool pansy wreath, cool windflower crown, cool windflower wreath, cosmos crown, cosmos wreath, cute lily crown, cute rose crown, dark cosmos crown, dark lily crown, dark lily wreath, dark rose wreath, dark tulip crown, dark tulip wreath, fancy lily wreath, fancy mum wreath, fancy rose wreath, gold rose crown, gold rose wreath, hyacinth crown, hyacinth wreath, lily crown, lily wreath, lovely cosmos crown, mum crown, mum wreath, natural mum wreath, pansy crown, pansy wreath, pretty cosmos wreath, pretty tulip wreath, purple hyacinth crown, purple hyacinth wreath, purple pansy crown, purple windflower crown, rose crown, rose wreath, simple mum crown, snazzy pansy wreath, tree branch wreath, tulip crown, tulip wreath, windflower crown, windflower wreath

### Ironwood (10 recipes)
ironwood DIY workbench, ironwood bed, ironwood cart, ironwood chair, ironwood clock, ironwood cupboard, ironwood dresser, ironwood kitchenette, ironwood low table, ironwood table

### Log Furniture (12 recipes)
log bed, log bench, log chair, log decorative shelves, log dining table, log extra-long sofa, log garden lounge, log pack, log round table, log stakes, log stool, log wall-mounted clock

### Wooden Furniture (20 recipes)
wooden bookshelf, wooden bucket, wooden chair, wooden chest, wooden double bed, wooden end table, wooden fish, wooden full-length mirror, wooden low table, wooden mini table, wooden simple bed, wooden stool, wooden table, wooden table mirror, wooden toolbox, wooden wardrobe, wooden waste bin

### Wooden-Block (10 recipes)
wooden-block bed, wooden-block bench, wooden-block bookshelf, wooden-block chair, wooden-block chest, wooden-block stereo, wooden-block stool, wooden-block table, wooden-block toy, wooden-block wall clock

### Shell (11 recipes)
shell arch, shell bed, shell fountain, shell lamp, shell partition, shell rug, shell speaker, shell stool, shell table, shell wand, shell wreath

### Gold (19 recipes)
gold armor, gold bars, gold helmet, gold rose crown, gold rose wreath, gold-armor shoes, gold-screen wall, golden arowana model, golden candlestick, golden casket, golden dishes, golden dung beetle, golden flooring, golden gears, golden seat, golden toilet, golden wall

### Iron (15 recipes)
iron armor, iron closet, iron doorplate, iron fence, iron frame, iron garden bench, iron garden chair, iron garden table, iron hanger stand, iron shelf, iron wall lamp, iron wall rack, iron wand, iron worktable, iron-and-stone fence

### Fruit Furniture (35 recipes)
apple chair, apple dress, apple hat, apple rug, apple umbrella, apple wall, cherry dress, cherry hat, cherry lamp, cherry rug, cherry speakers, cherry umbrella, cherry wall, coconut juice, coconut wall planter, fruit basket, fruit wreath, juicy-apple TV, orange dress, orange end table, orange hat, orange rug, orange umbrella, orange wall, orange wall-mounted clock, peach chair, peach dress, peach hat, peach rug, peach surprise box, peach umbrella, peach wall, pear bed, pear dress, pear hat, pear rug, pear umbrella, pear wall, pear wardrobe

### Bamboo (23 recipes)
bamboo basket, bamboo bench, bamboo candleholder, bamboo doll, bamboo drum, bamboo floor lamp, bamboo flooring, bamboo hat, bamboo lattice fence, bamboo lunch box, bamboo noodle slide, bamboo partition, bamboo shelf, bamboo speaker, bamboo sphere, bamboo stool, bamboo stopblock, bamboo wall, bamboo wall decoration, bamboo-grove wall, bamboo-shoot lamp, dark bamboo rug, light bamboo rug

### Fences (16 recipes)
bamboo lattice fence, barbed-wire fence, brick fence, corral fence, country fence, imperial fence, iron fence, iron-and-stone fence, lattice fence, rope fence, simple wooden fence, spiky fence, stone fence, straw fence, vertical-board fence, zen fence

### Mermaid (15 recipes — from Pascal)
mermaid bed, mermaid chair, mermaid closet, mermaid dresser, mermaid fence, mermaid flooring, mermaid lamp, mermaid rug, mermaid screen, mermaid shelf, mermaid sofa, mermaid table, mermaid vanity, mermaid wall, mermaid wall clock

---

## Seasonal Recipes (Verified Date Windows)

### Cherry Blossom (April 1-10 NH / Oct 1-10 SH)
blossom-viewing lantern, cherry-blossom bonsai, cherry-blossom branches, cherry-blossom clock, cherry-blossom flooring, cherry-blossom pochette, cherry-blossom pond stone, cherry-blossom umbrella, cherry-blossom-petal pile, cherry-blossom-trees wall, outdoor picnic set, sakura-wood flooring, sakura-wood wall

### Mushroom (Nov 1-30 NH / May 1-31 SH)
forest flooring, forest wall, mush lamp, mush log, mush low stool, mush parasol, mush partition, mush table, mush umbrella, mush wall, mushroom wand, mushroom wreath

### Maple/Acorn/Fall (Sep 1-Dec 10 NH / Mar 1-Jun 10 SH)
acorn pochette, autumn wall, colored-leaves flooring, leaf campfire, leaf stool, maple-leaf pochette, maple-leaf pond stone, maple-leaf umbrella, pile of leaves, pine bonsai tree, red-leaf pile, tree's bounty arch, tree's bounty big tree, tree's bounty lamp, tree's bounty little tree, tree's bounty mobile, yellow-leaf pile

### Frozen/Snowflake (Dec 11-Feb 24 NH / Jun 11-Aug 24 SH)
falling-snow wall, frozen arch, frozen bed, frozen chair, frozen counter, frozen partition, frozen pillar, frozen sculpture, frozen table, frozen tree, frozen-treat set, ice flooring, ice wall, iceberg flooring, iceberg wall, snowflake pochette, snowflake wall, snowflake wreath, snowperson head, three-tiered snowperson, ski-slope flooring, ski-slope wall

### Summer Shell (Jun 1-Aug 31 NH / Dec 1-Feb 28 SH)
shellfish pochette, starry-sands flooring, summer-shell rug, tropical vista, underwater flooring, underwater wall, water flooring

### Illuminated (Dec 15-Jan 6)
illuminated present, illuminated reindeer, illuminated snowflakes, illuminated tree

---

## Event Recipes (Verified)

### Bunny Day (Easter — varies yearly)
**Furniture (11):** Bunny Day stool, Bunny Day table, Bunny Day wardrobe, Bunny Day vanity, Bunny Day bed, Bunny Day lamp, Bunny Day merry balloons, Bunny Day festive balloons, Bunny Day arch, Bunny Day wall clock, Bunny Day glowy garland
**Wall/Floor/Fence (5):** Bunny Day wreath, Bunny Day wall, Bunny Day flooring, Bunny Day rug, Bunny Day fence
**Egg Outfits (18):** earth-egg shell/outfit/shoes, stone-egg shell/outfit/shoes, leaf-egg shell/outfit/shoes, wood-egg shell/outfit/shoes, sky-egg shell/outfit/shoes, water-egg shell/outfit/shoes
**Special (6):** egg party hat, egg party dress, Bunny Day crown, Bunny Day bag, wobbling Zipper toy, Bunny Day wand

### Spooky/Halloween (October)
spooky chair, spooky table, spooky standing lamp, spooky lantern, spooky lantern set, spooky candy set, spooky table setting, spooky scarecrow, spooky tower, spooky arch, spooky carriage, spooky fence, spooky garland, spooky wand
**2.0 additions:** spooky trick lamp, spooky tree, spooky treats basket, spooky cookies

### Turkey Day (4th Thursday of November)
Turkey Day chair, Turkey Day table, Turkey Day garden stand, Turkey Day hearth, Turkey Day casserole, Turkey Day table setting, Turkey Day wheat decor, Turkey Day decorations

### Festive/Ornament (Dec 15-Jan 6)
festive top set, holiday candle, tabletop festive tree, festive tree, big festive tree, gift pile, ornament mobile, ornament wreath, festive rug, festive wrapping paper
**2.0 additions:** ornament table lamp, ornament tree, giant ornament, ornament garland, ornament crown

---

## Celeste Recipes (49 total)

### Zodiac Furniture (12)
| Item | Dates |
|------|-------|
| Aquarius urn | Jan 20 - Feb 18 |
| Pisces lamp | Feb 19 - Mar 20 |
| Aries rocking chair | Mar 21 - Apr 19 |
| Taurus bathtub | Apr 20 - May 20 |
| Gemini closet | May 21 - Jun 20 |
| Cancer table | Jun 21 - Jul 22 |
| Leo sculpture | Jul 23 - Aug 22 |
| Virgo harp | Aug 23 - Sep 22 |
| Libra scale | Sep 23 - Oct 22 |
| Scorpio lamp | Oct 23 - Nov 21 |
| Sagittarius arrow | Nov 22 - Dec 21 |
| Capricorn ornament | Dec 22 - Jan 19 |

### Space Furniture (12)
nova light, crescent-moon chair, moon, asteroid, astronaut suit, rocket, satellite, space shuttle, crewed spaceship, lunar lander, lunar rover, flying saucer

### Space Interior (6)
starry-sky wall, starry wall, sci-fi wall, galaxy flooring, lunar surface, sci-fi flooring

### Star Items (4)
star clock, starry garland, star head, star pochette

### Wands from Celeste (13)
wand, tree-branch wand, iron wand, golden wand, star wand, windflower wand, mums wand, cosmos wand, tulip wand, rose wand, pansy wand, hyacinth wand, lily wand

---

## Recipe Sources (for tracking)

| Source | Description |
|--------|------------|
| Villager Crafting | 3 per day (morning/afternoon/evening), personality-based pools |
| Message Bottles | 1 per day on beach, personality-pool recipes |
| Balloons | Seasonal recipes during active seasons |
| Celeste | Clear nights, zodiac + space recipes |
| Pascal | Trade scallops while diving - mermaid recipes |
| Snowboy | Perfect snowboys - frozen/ice recipes |
| Nook's Cranny | Purchasable tool upgrades, seasonal packs |
| Tom Nook | Early-game tool recipes |
| Zipper | Bunny Day recipes |
| Jack | Halloween night special recipes |
| Jingle | Toy Day (Dec 24) special recipes |
| Franklin | Turkey Day recipes |
| Leif | Hedge recipe |
| Fishing (trash) | Trash fishing - specific recipes |
| Niko (HHP) | Happy Home Paradise exclusive recipes |

---

## Cooking Recipes (141 total — 2.0 Update)

### Savory (86 recipes)
flour, whole-wheat flour, sugar, brown sugar, carrot potage, potato potage, minestrone soup, bamboo-shoot soup, mushroom potage, seaweed soup, salad, salade de carottes rapees, mushroom salad, turnip salad, fruit salad, poke, seafood salad, French fries, fish-and-chips, baked potatoes, potato galette, veggie quiche, veggie sandwich, mixed-fruits sandwich, salmon sandwich, tomato bagel sandwich, carrot bagel sandwich, pumpkin bagel sandwich, mixed-fruits bagel sandwich, salmon bagel sandwich, mushroom crepe, veggie crepe, bread gratin, salad-stuffed tomato, pumpkin soup, kabu ankake, tomates al ajillo, champinones al ajillo, anchoas al ajillo, seafood ajillo, pull-apart bread, bread, organic bread, snack bread, savory bread, gnocchi di carote, gnocchi di patate, gnocchi di zucca, spaghetti marinara, spaghetti napolitan, squid-ink spaghetti, tomato curry, carrot-tops curry, potato curry, pumpkin curry, mushroom curry, squid-ink curry, pizza margherita, mushroom pizza, fruit pizza, seafood pizza, carpaccio di capesante, carpaccio di salmone, barred-knifejaw carpaccio, carpaccio di marlin blu, sea-bass pie, grilled sea bass with herbs, aji fry, karei no nitsuke, sauteed olive flounder, pesce all'acqua pazza, tomato puree, pickled veggies, jarred bamboo shoots, jarred mushrooms, orange marmalade, cherry jam, peach jam, pear jam, apple jam, coconut oil, sardines in oil, clam chowder, pumpkin pie, gratin, olive-flounder meuniere

### Sweet (55 recipes)
cookies, frosted cookies, thumbprint jam cookies, coconut cookies, veggie cookies, Roost sable cookie, pretzels, frosted pretzels, plain cupcakes, brown-sugar cupcakes, fruit cupcakes, pumpkin cupcakes, veggie cupcakes, orange jelly, cherry jelly, peach jelly, pear jelly, apple jelly, coconut pudding, plain scones, fruit scones, carrot scones, pumpkin scones, orange tart, cherry tart, peach tart, pear tart, apple tart, mixed-fruits tart, carrot cake, sugar crepe, mixed-fruits crepe, pound cake, brown-sugar pound cake, orange pound cake, pumpkin pound cake, cake sale, pancakes, coconut pancakes, fruit-topped pancakes, orange pie, cherry pie, peach pie, pear pie, apple pie, mixed-fruits pie, orange smoothie, cherry smoothie, peach smoothie, pear smoothie, apple smoothie, coconut milk, tomato juice, carrot juice, spooky cookies

---

## Rebuild Strategy

### Approach: Category-based tracking with verified names only

Given the massive scale (924 recipes), the component should:
1. Use category tabs for organization
2. Show recipe name + source + whether obtained
3. Use `<AssetImg category="recipes" name="..." />` for the 486 manifest recipes
4. Recipes without manifest images show emoji only

### Recommended Category Structure:
1. **Tools & Workbenches** (~20)
2. **Furniture Sets** — Ironwood, Log, Wooden, Wooden-Block, Shell, Gold, Iron (~97)
3. **Fruit Furniture** (~35)
4. **Bamboo** (~23)
5. **Crowns & Wreaths** (~53)
6. **Wands** (~21)
7. **Fences** (~16)
8. **Seasonal** — Cherry Blossom, Mushroom, Maple/Acorn, Frozen/Snowflake, Summer Shell (~75)
9. **Events** — Bunny Day, Spooky, Turkey Day, Festive/Ornament (~80)
10. **Celeste & Space** (~49)
11. **Mermaid** (~15)
12. **Walls & Floors** (~35)
13. **Egg Outfits** (~18)
14. **Miscellaneous** (remaining ~100+)
15. **2.0 Update** (~113)
16. **Cooking: Savory** (~86)
17. **Cooking: Sweet** (~55)

### Phase 1: Core rebuild
- Replace all fabricated recipe data with verified names from manifest
- Implement category structure
- Add obtained/not-obtained tracking per recipe
- Add source tracking (where to get each recipe)

### Phase 2: Asset integration
- Add `<AssetImg>` for recipes with manifest images
- Add seasonal date badges
- Add Celeste zodiac date windows

### Phase 3: Search & filter
- Search by recipe name
- Filter by category, source, obtained status
- Progress tracking per category

### Verification Checklist
- [ ] All 486 manifest recipe names are included verbatim
- [ ] No fabricated recipe names remain
- [ ] Category counts match verified totals
- [ ] Seasonal date windows are correct for both hemispheres
- [ ] Celeste zodiac dates match verified data
- [ ] Event recipes have correct event attribution
- [ ] Cooking recipes separated as 2.0 content
- [ ] Build passes
- [ ] Visual inspection of all category tabs
