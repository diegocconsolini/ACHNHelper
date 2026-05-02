/**
 * diyRecipeData.js — Verified DIY recipe data for ACNH
 *
 * 781 recipe names (640 DIY + 141 cooking) extracted from public/assets-web/manifest.json (exact case).
 * Cooking recipe names verified against Nookipedia (nookipedia.com/wiki/DIY_recipes/Savory
 * and nookipedia.com/wiki/DIY_recipes/Sweet).
 *
 * Each recipe appears in exactly ONE category — no duplicates.
 * Categories are ordered by matching priority: earlier categories claim recipes first.
 */

// ─── DIY Categories (27) + Cooking Categories (2) ────────────────────────────

export const DIY_CATEGORIES = {
  // ── 1. Tools (20) ──
  'Tools': {
    emoji: '\u{1F528}',
    recipes: [
      'axe', 'fishing rod', 'flimsy axe', 'flimsy fishing rod', 'flimsy net',
      'flimsy shovel', 'flimsy watering can', 'golden axe', 'golden net',
      'golden rod', 'golden shovel', 'golden slingshot', 'golden watering can',
      'ladder', 'net', 'shovel', 'slingshot', 'stone axe', 'vaulting pole',
      'watering can'
    ]
  },

  // ── 2. Bunny Day (40) ──
  'Bunny Day': {
    emoji: '\u{1F430}',
    recipes: [
      'Bunny Day arch', 'Bunny Day bag', 'Bunny Day bed', 'Bunny Day crown',
      'Bunny Day fence', 'Bunny Day festive balloons', 'Bunny Day flooring',
      'Bunny Day glowy garland', 'Bunny Day lamp', 'Bunny Day merry balloons',
      'Bunny Day rug', 'Bunny Day stool', 'Bunny Day table', 'Bunny Day vanity',
      'Bunny Day wall', 'Bunny Day wall clock', 'Bunny Day wand',
      'Bunny Day wardrobe', 'Bunny Day wreath',
      'earth-egg outfit', 'earth-egg shell', 'earth-egg shoes',
      'egg party dress', 'egg party hat',
      'leaf-egg outfit', 'leaf-egg shell', 'leaf-egg shoes',
      'sky-egg outfit', 'sky-egg shell', 'sky-egg shoes',
      'stone-egg outfit', 'stone-egg shell', 'stone-egg shoes',
      'water-egg outfit', 'water-egg shell', 'water-egg shoes',
      'wobbling Zipper toy',
      'wood-egg outfit', 'wood-egg shell', 'wood-egg shoes'
    ]
  },

  // ── 3. Turkey Day (8) ──
  'Turkey Day': {
    emoji: '\u{1F983}',
    recipes: [
      'Turkey Day casserole', 'Turkey Day chair', 'Turkey Day decorations',
      'Turkey Day garden stand', 'Turkey Day hearth', 'Turkey Day table',
      'Turkey Day table setting', 'Turkey Day wheat decor'
    ]
  },

  // ── 4. Spooky (14) — "spooky cookies" is NOT in manifest; goes to Cooking ──
  'Spooky': {
    emoji: '\u{1F47B}',
    recipes: [
      'spooky arch', 'spooky candy set', 'spooky carriage', 'spooky chair',
      'spooky fence', 'spooky garland', 'spooky lantern', 'spooky lantern set',
      'spooky scarecrow', 'spooky standing lamp', 'spooky table', 'spooky table setting',
      'spooky tower', 'spooky treats basket', 'spooky tree', 'spooky trick lamp',
      'spooky wand'
    ]
  },

  // ── 5. Cherry Blossom (15) ──
  'Cherry Blossom': {
    emoji: '\u{1F338}',
    recipes: [
      'blossom-viewing lantern', 'cherry-blossom bonsai', 'cherry-blossom branches', 'cherry-blossom clock',
      'cherry-blossom flooring', 'cherry-blossom pochette', 'cherry-blossom pond stone', 'cherry-blossom rug',
      'cherry-blossom umbrella', 'cherry-blossom wand', 'cherry-blossom-petal pile', 'cherry-blossom-trees wall',
      'outdoor picnic set', 'sakura-wood flooring', 'sakura-wood wall'
    ]
  },

  // ── 6. Mermaid (15) ──
  'Mermaid': {
    emoji: '\u{1F9DC}',
    recipes: [
      'mermaid bed', 'mermaid chair', 'mermaid closet', 'mermaid dresser',
      'mermaid fence', 'mermaid flooring', 'mermaid lamp', 'mermaid rug',
      'mermaid screen', 'mermaid shelf', 'mermaid sofa', 'mermaid table',
      'mermaid vanity', 'mermaid wall', 'mermaid wall clock'
    ]
  },

  // ── 7. Ironwood (10) ──
  'Ironwood': {
    emoji: '\u{1FAB5}',
    recipes: [
      'ironwood bed', 'ironwood cart', 'ironwood chair',
      'ironwood clock', 'ironwood cupboard', 'ironwood DIY workbench', 'ironwood dresser',
      'ironwood kitchenette', 'ironwood low table', 'ironwood table'
    ]
  },

  // ── 8. Frozen & Snowflake (26) ──
  'Frozen & Snowflake': {
    emoji: '\u2744\uFE0F',
    recipes: [
      'falling-snow wall', 'frozen arch', 'frozen bed', 'frozen chair',
      'frozen counter', 'frozen fence', 'frozen floor tiles', 'frozen mini snowperson',
      'frozen partition', 'frozen pillar', 'frozen sculpture', 'frozen table',
      'frozen tree', 'frozen-treat set', 'ice flooring', 'ice wall',
      'ice wand', 'iceberg flooring', 'iceberg wall', 'ski-slope flooring',
      'ski-slope wall', 'snowflake pochette', 'snowflake wall', 'snowflake wreath',
      'snowperson head', 'three-tiered snowperson'
    ]
  },

  // ── 9. Festive & Illuminated (21) ──
  'Festive & Illuminated': {
    emoji: '\u{1F384}',
    recipes: [
      'big festive tree', 'festive rug', 'festive top set', 'festive tree',
      'festive wrapping paper', 'giant ornament', 'gift pile', 'holiday candle',
      'illuminated present', 'illuminated reindeer', 'illuminated snowflakes', 'illuminated tree',
      'Jingle wall', 'ornament crown', 'ornament garland', 'ornament mobile',
      'ornament table lamp', 'ornament tree', 'ornament wreath', 'sleigh',
      'tabletop festive tree'
    ]
  },

  // ── 10. Mushroom (12) ──
  'Mushroom': {
    emoji: '\u{1F344}',
    recipes: [
      'forest flooring', 'forest wall', 'mush lamp', 'mush log',
      'mush low stool', 'mush parasol', 'mush partition', 'mush table',
      'mush umbrella', 'mush wall', 'mushroom wand', 'mushroom wreath'
    ]
  },

  // ── 11. Bamboo (30) ──
  'Bamboo': {
    emoji: '\u{1F38B}',
    recipes: [
      'bamboo basket', 'bamboo bench', 'bamboo candleholder', 'bamboo doll',
      'bamboo drum', 'bamboo floor lamp', 'bamboo flooring', 'bamboo hat',
      'bamboo lattice fence', 'bamboo lunch box', 'bamboo noodle slide', 'bamboo partition',
      'bamboo shelf', 'bamboo speaker', 'bamboo sphere', 'bamboo stool',
      'bamboo stopblock', 'bamboo wall', 'bamboo wall decoration', 'bamboo wand',
      'bamboo-grove wall', 'bamboo-shoot lamp', 'bamboo-slats fence', 'dark bamboo bath mat',
      'dark bamboo rug', 'green bamboo fence', 'green bamboo mat', 'light bamboo bath mat',
      'light bamboo rug', 'yellow bamboo mat'
    ]
  },

  // ── 12. Shell (11) — excludes "shellfish pochette" (Summer Shell) ──
  'Shell': {
    emoji: '\u{1F41A}',
    recipes: [
      'shell arch', 'shell bed', 'shell fountain', 'shell lamp',
      'shell music box', 'shell partition', 'shell rug', 'shell speaker',
      'shell stool', 'shell table', 'shell wand', 'shell wreath'
    ]
  },

  // ── 13. Summer Shell (7) ──
  'Summer Shell': {
    emoji: '\u{1F30A}',
    recipes: [
      'shellfish pochette', 'starry-sands flooring', 'summer-shell rug',
      'tropical vista', 'underwater flooring', 'underwater wall', 'water flooring'
    ]
  },

  // ── 14. Log (12) ──
  'Log': {
    emoji: '\u{1F332}',
    recipes: [
      'log bed', 'log bench', 'log chair', 'log decorative shelves',
      'log dining table', 'log extra-long sofa', 'log garden lounge',
      'log pack', 'log round table', 'log stakes', 'log stool',
      'log wall-mounted clock'
    ]
  },

  // ── 15. Wooden-Block (10) ──
  'Wooden-Block': {
    emoji: '\u{1F9F1}',
    recipes: [
      'wooden-block bed', 'wooden-block bench', 'wooden-block bookshelf',
      'wooden-block chair', 'wooden-block chest', 'wooden-block stereo',
      'wooden-block stool', 'wooden-block table', 'wooden-block toy',
      'wooden-block wall clock'
    ]
  },

  // ── 16. Wooden (17) ──
  'Wooden': {
    emoji: '\u{1FA91}',
    recipes: [
      'wooden bookshelf', 'wooden bucket', 'wooden chair', 'wooden chest',
      'wooden double bed', 'wooden end table', 'wooden fish',
      'wooden full-length mirror', 'wooden low table', 'wooden mini table',
      'wooden simple bed', 'wooden stool', 'wooden table', 'wooden table mirror',
      'wooden toolbox', 'wooden wardrobe', 'wooden waste bin'
    ]
  },

  // ── 17. Fruit (38) ──
  'Fruit': {
    emoji: '\u{1F34E}',
    recipes: [
      'apple chair', 'apple dress', 'apple hat', 'apple rug', 'apple umbrella',
      'apple wall', 'cherry dress', 'cherry hat', 'cherry lamp', 'cherry rug',
      'cherry speakers', 'cherry umbrella', 'cherry wall',
      'coconut juice', 'coconut wall planter', 'fruit basket', 'fruit wreath',
      'orange dress', 'orange end table', 'orange hat', 'orange rug',
      'orange umbrella', 'orange wall', 'orange wall-mounted clock',
      'peach chair', 'peach dress', 'peach hat', 'peach rug',
      'peach surprise box', 'peach umbrella', 'peach wall',
      'pear bed', 'pear dress', 'pear hat', 'pear rug',
      'pear umbrella', 'pear wall', 'pear wardrobe'
    ]
  },

  // ── 18. Iron (15) — excludes ironwood (already categorized) ──
  'Iron': {
    emoji: '\u2699\uFE0F',
    recipes: [
      'iron armor', 'iron closet', 'iron doorplate', 'iron fence', 'iron frame',
      'iron garden bench', 'iron garden chair', 'iron garden table',
      'iron hanger stand', 'iron shelf', 'iron wall lamp', 'iron wall rack',
      'iron wand', 'iron worktable', 'iron-and-stone fence'
    ]
  },

  // ── 19. Gold & Golden (18) — excludes golden tools (already in Tools) ──
  'Gold & Golden': {
    emoji: '\u2728',
    recipes: [
      'gold armor', 'gold bars', 'gold helmet', 'gold rose crown',
      'gold rose wreath', 'gold-armor shoes', 'gold-nugget mining car', 'gold-screen wall',
      'golden altar', 'golden arowana model', 'golden bathtub', 'golden candlestick',
      'golden casket', 'golden decorative plate', 'golden dharma', 'golden dishes',
      'golden dung beetle', 'golden flooring', 'golden garden bunny', 'golden gear apparatus',
      'golden gear tower', 'golden gears', 'golden ladder set-up kit', 'golden meter and pipes',
      'golden piggy bank', 'golden plate armor', 'golden samurai suit', 'golden seat',
      'golden toilet', 'golden urn', 'golden vase', 'golden wall',
      'golden wand', 'golden wristwatch', 'mini golden dharma'
    ]
  },

  // ── 20. Wands (13) — remaining wands not claimed by earlier categories ──
  'Wands': {
    emoji: '\u{1FA84}',
    recipes: [
      'cosmos wand', 'hyacinth wand', 'lily wand', 'mums wand', 'pansy wand',
      'rose wand', 'shamrock wand', 'star wand', 'tree-branch wand',
      'tulip wand', 'wand', 'wedding wand', 'windflower wand'
    ]
  },

  // ── 21. Celeste (34) — zodiac + space/star items, NOT wands ──
  'Celeste': {
    emoji: '\u2B50',
    recipes: [
      'Aquarius urn', 'Aries rocking chair', 'asteroid', 'astronaut suit',
      'Cancer table', 'Capricorn ornament', 'crescent-moon chair', 'crewed spaceship',
      'flying saucer', 'galaxy flooring', 'Gemini closet', 'Leo sculpture',
      'Libra scale', 'lunar lander', 'lunar rover', 'lunar surface',
      'moon', 'nova light', 'Pisces lamp', 'rocket',
      'Sagittarius arrow', 'satellite', 'sci-fi flooring', 'sci-fi wall',
      'Scorpio lamp', 'space shuttle', 'star clock', 'star head',
      'star pochette', 'starry garland', 'starry wall', 'starry-skies rug',
      'starry-sky wall', 'Taurus bathtub', 'Virgo harp', 'yellow star rug'
    ]
  },

  // ── 22. Crowns & Wreaths (51) — remaining crowns/wreaths not claimed earlier ──
  'Crowns & Wreaths': {
    emoji: '\u{1F451}',
    recipes: [
      'blue rose crown', 'blue rose wreath',
      'chic cosmos wreath', 'chic mum crown', 'chic rose crown',
      'chic tulip crown', 'chic windflower wreath',
      'cool hyacinth crown', 'cool hyacinth wreath',
      'cool pansy crown', 'cool pansy wreath',
      'cool windflower crown', 'cool windflower wreath',
      'cosmos crown', 'cosmos wreath',
      'cute lily crown', 'cute rose crown',
      'dark cosmos crown', 'dark lily crown', 'dark lily wreath',
      'dark rose wreath', 'dark tulip crown', 'dark tulip wreath',
      'fancy lily wreath', 'fancy mum wreath', 'fancy rose wreath',
      'hyacinth crown', 'hyacinth wreath',
      'lily crown', 'lily wreath',
      'lovely cosmos crown',
      'mum crown', 'mum wreath',
      'natural mum wreath',
      'pansy crown', 'pansy wreath',
      'pretty cosmos wreath', 'pretty tulip wreath',
      'purple hyacinth crown', 'purple hyacinth wreath',
      'purple pansy crown', 'purple windflower crown',
      'rose crown', 'rose wreath',
      'simple mum crown', 'snazzy pansy wreath',
      'tree branch wreath',
      'tulip crown', 'tulip wreath',
      'windflower crown', 'windflower wreath'
    ]
  },

  // ── 23. Fences (14) — remaining fences not claimed by earlier categories ──
  'Fences': {
    emoji: '\u{1F33F}',
    recipes: [
      'barbed-wire fence', 'block fence', 'brick fence', 'corral fence',
      'corrugated iron fence', 'country fence', 'imperial fence', 'large lattice fence',
      'lattice fence', 'log fence', 'log-wall fence', 'park fence',
      'rope fence', 'simple wooden fence', 'spiky fence', 'stone fence',
      'straw fence', 'vertical-board fence', 'wedding fence', 'zen fence'
    ]
  },

  // ── 24. Maple & Acorn (18) ──
  'Maple & Acorn': {
    emoji: '\u{1F341}',
    recipes: [
      'acorn pochette', 'autumn wall', 'bonsai shelf', 'colored-leaves flooring',
      'leaf campfire', 'leaf stool',
      'maple-leaf pochette', 'maple-leaf pond stone', 'maple-leaf umbrella',
      'pile of leaves', 'pine bonsai tree', 'red-leaf pile',
      "tree's bounty arch", "tree's bounty big tree", "tree's bounty lamp",
      "tree's bounty little tree", "tree's bounty mobile",
      'yellow-leaf pile'
    ]
  },

  // ── 25. Walls, Floors & Rugs (25) — remaining wall/floor/rug items ──
  'Walls, Floors & Rugs': {
    emoji: '\u{1F3E0}',
    recipes: [
      'acorn rug', 'basement flooring', 'brown herringbone wall', 'cabin wall',
      'chocolate herringbone wall', 'classic-library wall', 'dark wooden-mosaic wall', 'garbage-heap flooring',
      'garbage-heap wall', 'honeycomb flooring', 'honeycomb wall', 'jungle flooring',
      'jungle wall', 'manga-library wall', 'maple-leaf rug', 'modern wood wall',
      'money flooring', 'rustic-stone wall', 'sandy-beach flooring', 'stacked-wood wall',
      'steel flooring', 'steel-frame wall', 'stone wall', 'tree-stump rug',
      'wild-wood wall', 'wooden-knot wall', 'wooden-mosaic wall', 'woodland wall'
    ]
  },

  // ── 26. Miscellaneous & Other (199) — incl. 38 3.0 additions ──
  'Miscellaneous & Other': {
    emoji: '\u{1F4E6}',
    recipes: [
      'acoustic guitar', 'angled signpost', 'armor shoes', 'aroma pot',
      'backyard lawn', 'barbell', 'barrel', 'basket pack',
      "beekeeper's hive", 'birdbath', 'birdcage', 'birdhouse',
      'bone doorplate', 'bonfire', 'boomerang',
      'brick oven', 'brick well', 'bridge construction kit', 'butter churn',
      'campfire', 'campsite construction kit',
      'cardboard bed', 'cardboard chair', 'cardboard sofa', 'cardboard table',
      'clackercart', 'classic pitcher', 'clothesline',
      'cosmos shower', 'crest doorplate', 'cutting board',
      'decoy duck', 'deer decoration', 'deer scare',
      'destinations signpost', 'DIY workbench', 'document stack', 'doghouse', 'drinking fountain',
      'firewood', 'fish bait', 'flat garden rock', 'floral swag', 'flower stand',
      'fossil doorplate', 'fountain', 'frying pan',
      'garden bench', 'garden rock', 'garden wagon', 'giant teddy bear', 'gong',
      'grass skirt', 'grass standee', 'green grass skirt', 'green-leaf pile',
      'hanging terrarium', 'hay bed', 'hearth', 'hedge', 'hedge standee',
      'hyacinth lamp', 'infused-water dispenser',
      'jail bars', 'juicy-apple TV',
      'kettle bathtub', 'kettlebell', 'key holder',
      'King Tut mask', "knight's helmet", 'knitted-grass backpack',
      'large cardboard boxes', 'leaf', 'leaf mask', 'leaf umbrella',
      'lily record player', 'lucky gold cat',
      'magazine rack', 'manhole cover', 'matryoshka', 'medicine',
      'medium cardboard boxes', 'mini DIY workbench', 'modeling clay',
      'mossy garden rock', 'mountain standee', 'mum cushion', 'music stand',
      'natural garden chair', 'natural garden table', 'natural square table',
      'ocarina', 'oil-barrel bathtub', 'old-fashioned washtub', 'outdoor bath',
      'palm-tree lamp', 'pan flute', 'pansy table',
      'paw-print doorplate', 'pile of zen cushions', 'pitfall seed',
      'plain sink', 'plain wooden shop sign', 'pond stone', 'pot', 'potted ivy',
      'raccoon figurine', 'rainbow feather',
      'recycled boots', 'recycled-can thumb piano', 'ringtoss',
      'robot hero', 'rocking chair', 'rocking horse', 'rose bed',
      'sauna heater', 'scarecrow', 'scattered papers',
      'signpost', 'silo', 'simple DIY workbench', 'simple well',
      'small cardboard boxes', 'stack of books', 'stacked magazines', 'stall',
      'standard umbrella stand', 'steamer-basket set',
      'stone arch', 'stone lion-dog', 'stone stool', 'stone table', 'stone tablet',
      'straw umbrella hat', 'street piano', 'succulent plant', 'swinging bench',
      'tall garden rock', 'tall lantern', 'tea table', 'terrarium', 'tiki torch',
      'timber doorplate', 'tiny library', 'tire stack', 'tire toy',
      'traditional balancing toy', 'traditional straw coat', 'trash bags',
      'tree standee', 'trophy case', 'tulip surprise box',
      'ukulele', 'unglazed dish set',
      'water pump', 'wave breaker', 'western-style stone',
      'wild log bench', 'windflower fan', 'wooden-plank sign', 'zen-style stone',
      // ── 3.0 additions ──
      'box-shaped seat', 'carp on a cutting board', 'cave', 'decayed tree',
      'dharma', 'donation box', 'festival-lantern set', 'forbidden altar', 'foxtail',
      'full-body glowing-moss suit', 'gear apparatus', 'gear tower',
      'glow-in-the-dark stickers', 'imperial pot', 'iron ladder set-up kit',
      'medium wooden partition', 'nice branch', 'open wooden shelves',
      'pile of cardboard boxes', 'pile of cash', 'plate armor', 'project table',
      'senmaizuke barrel', 'skateboard wall rack', 'small wooden partition',
      'stacked bottle crates', 'stacked fish containers', 'stacked senmaizuke barrels',
      'stacked shopping baskets', 'stonework kitchen', 'suspicious cauldron',
      'tension-pole rack', 'veggie basket', 'wooden box', 'wooden field sign',
      'wooden ladder set-up kit', 'wooden music box', 'wooden storage shed'
    ]
  },

  // ── 27. Glowing Moss (3.0) (18) — message bottles, cave-themed ──
  'Glowing Moss': {
    emoji: '\u{1F31F}',
    recipes: [
      'glowing-moss balloon', 'glowing-moss boulder', 'glowing-moss cave wall',
      'glowing-moss dress', 'glowing-moss flooring', 'glowing-moss forest wall',
      'glowing-moss headband', 'glowing-moss hood', 'glowing-moss jar',
      'glowing-moss pointed cap', 'glowing-moss pond', 'glowing-moss rug',
      'glowing-moss ruins wall', 'glowing-moss statue', 'glowing-moss stool',
      'glowing-moss wreath', 'glowing-moss-jar shelves', 'hanging glowing moss',
      'round glowing-moss rug'
    ]
  },

  // ── 28. Vine (3.0) (10) — jungle/cave-themed message bottle items ──
  'Vine': {
    emoji: '\u{1F33F}',
    recipes: [
      'giant vine', 'round vine rug', 'vine bench', 'vine crown',
      'vine garland', 'vine hanging chair', 'vine ladder set-up kit',
      'vine lamp', 'vine outfit', 'woven-vine pochette', 'woven-vines hat'
    ]
  },

  // ── 29. Ruined (3.0) (4) — message bottle archaeological items ──
  'Ruined': {
    emoji: '\u{1F3DB}️',
    recipes: [
      'ruined arch', 'ruined broken pillar', 'ruined decorated pillar', 'ruined seat'
    ]
  },

  // ── 30. Rope Net (3.0) (2) — message bottle ──
  'Rope Net': {
    emoji: '\u{1F578}️',
    recipes: [
      'rope-net flooring', 'rope-net wall'
    ]
  },

  // ── 31. Niko Pillars (3.0) (7) — Resort Hotel pillars from Niko ──
  'Niko Pillars': {
    emoji: '\u{1F3DB}️',
    recipes: [
      'brick pillar', 'concrete pillar', 'golden pillar', 'marble pillar',
      'simple pillar', 'steel pillar', 'wooden pillar', 'partition wall'
    ]
  },

  // ── 32. Niko Island Counters (3.0) (14) — Resort Hotel facility counters ──
  'Niko Island Counters': {
    emoji: '\u{1F3E8}',
    recipes: [
      'low brick island counter', 'low concrete island counter',
      'low golden island counter', 'low marble island counter',
      'low simple island counter', 'low steel island counter',
      'low wooden island counter',
      'tall brick island counter', 'tall concrete island counter',
      'tall golden island counter', 'tall marble island counter',
      'tall simple island counter', 'tall steel island counter',
      'tall wooden island counter'
    ]
  },

  // ── 33. Cooking - Savory (86) — verified against Nookipedia ──
  'Cooking - Savory': {
    emoji: '\u{1F372}',
    isCooking: true,
    recipes: [
      'aji fry', 'anchoas al ajillo', 'apple jam',
      'baked potatoes', 'bamboo-shoot soup', 'barred-knifejaw carpaccio',
      'bread', 'bread gratin', 'brown sugar',
      'carpaccio di capesante', 'carpaccio di marlin blu', 'carpaccio di salmone',
      'carrot bagel sandwich', 'carrot potage', 'carrot-tops curry',
      'champi\u00f1ones al ajillo', 'cherry jam', 'clam chowder', 'coconut oil',
      'fish-and-chips', 'flour', 'French fries', 'fruit pizza', 'fruit salad',
      'gnocchi di carote', 'gnocchi di patate', 'gnocchi di zucca',
      'gratin', 'grilled sea bass with herbs',
      'jarred bamboo shoots', 'jarred mushrooms',
      'kabu ankake', 'karei no nitsuke',
      'minestrone soup', 'mixed-fruits bagel sandwich', 'mixed-fruits sandwich',
      'mushroom crepe', 'mushroom curry', 'mushroom pizza', 'mushroom potage',
      'mushroom salad',
      'olive-flounder meuni\u00e8re', 'orange marmalade', 'organic bread',
      'peach jam', 'pear jam', "pesce all'acqua pazza",
      'pickled veggies', 'pizza margherita', 'poke', 'potato curry',
      'potato galette', 'potato potage', 'pull-apart bread',
      'pumpkin bagel sandwich', 'pumpkin curry', 'pumpkin pie', 'pumpkin soup',
      'salad', 'salad-stuffed tomato', 'salade de carottes r\u00e2p\u00e9es',
      'salmon bagel sandwich', 'salmon sandwich', 'sardines in oil',
      'saut\u00e9ed olive flounder', 'savory bread',
      'sea-bass pie', 'seafood ajillo', 'seafood pizza', 'seafood salad',
      'seaweed soup', 'snack bread',
      'spaghetti marinara', 'spaghetti napolitan', 'squid-ink curry',
      'squid-ink spaghetti', 'sugar',
      'tomates al ajillo', 'tomato bagel sandwich', 'tomato curry', 'tomato puree',
      'turnip salad',
      'veggie crepe', 'veggie quiche', 'veggie sandwich',
      'whole-wheat flour'
    ]
  },

  // ── 34. Cooking - Sweet (55) — verified against Nookipedia; spooky cookies here, NOT in Spooky ──
  'Cooking - Sweet': {
    emoji: '\u{1F370}',
    isCooking: true,
    recipes: [
      'apple jelly', 'apple pie', 'apple smoothie', 'apple tart',
      'brown-sugar cupcakes', 'brown-sugar pound cake',
      'cake sal\u00e9', 'carrot cake', 'carrot juice', 'carrot scones',
      'cherry jelly', 'cherry pie', 'cherry smoothie', 'cherry tart',
      'coconut cookies', 'coconut milk', 'coconut pancakes', 'coconut pudding',
      'cookies',
      'frosted cookies', 'frosted pretzels',
      'fruit cupcakes', 'fruit scones', 'fruit-topped pancakes',
      'mixed-fruits crepe', 'mixed-fruits pie', 'mixed-fruits tart',
      'orange jelly', 'orange pie', 'orange pound cake', 'orange smoothie',
      'orange tart',
      'pancakes', 'peach jelly', 'peach pie', 'peach smoothie', 'peach tart',
      'pear jelly', 'pear pie', 'pear smoothie', 'pear tart',
      'plain cupcakes', 'plain scones', 'pound cake', 'pretzels',
      'pumpkin cupcakes', 'pumpkin pound cake', 'pumpkin scones',
      'Roost sabl\u00e9 cookie',
      'spooky cookies', 'sugar crepe',
      'thumbprint jam cookies', 'tomato juice',
      'veggie cookies', 'veggie cupcakes'
    ]
  }
};

// ─── Recipe Sources (14) ─────────────────────────────────────────────────────

export const SOURCES = [
  {
    name: 'Villager Crafting',
    emoji: '\u{1F3E0}',
    description: 'Visit villagers at their homes when they\'re crafting. Up to 3 unique recipes per day from different personality types.',
    tips: 'Each villager personality gives recipes from their pool. Visit during morning and afternoon.',
    daily: true,
    limit: '3 per day'
  },
  {
    name: 'Message in a Bottle',
    emoji: '\u{1F37E}',
    description: 'Check beaches for bottles with DIY recipes. One guaranteed per day.',
    tips: 'Always spawn near beach corners. Check daily!',
    daily: true,
    limit: '1 per day'
  },
  {
    name: 'Balloon Presents',
    emoji: '\u{1F388}',
    description: 'Pop balloons floating over your island. Recipes vary by season and balloon color.',
    tips: 'Green balloons during seasonal windows often contain seasonal DIY recipes.',
    daily: false,
    limit: 'Variable'
  },
  {
    name: "Nook's Cranny",
    emoji: '\u{1F3EA}',
    description: 'Purchase DIY recipes from the shop. Stock rotates daily.',
    tips: 'Check daily \u2014 the recipe card in the rotating stock changes every day.',
    daily: true,
    limit: 'Variable'
  },
  {
    name: 'Celeste',
    emoji: '\u2B50',
    description: 'Visit Celeste on clear nights (no rain/snow) for zodiac, space, and wand recipes.',
    tips: 'One recipe per visit. Zodiac recipes change monthly based on the current star sign.',
    daily: false,
    limit: '1 per visit'
  },
  {
    name: 'Pascal',
    emoji: '\u{1F41A}',
    description: 'Give a scallop to Pascal while diving for mermaid DIY recipes.',
    tips: 'Appears on the beach when you bring him a scallop. Mermaid recipes only.',
    daily: true,
    limit: '1 per day'
  },
  {
    name: 'Snowboy',
    emoji: '\u26C4',
    description: 'Build perfect snowboys during winter (Dec\u2013Feb NH / Jun\u2013Aug SH) for frozen/ice DIY recipes.',
    tips: 'Only a perfect snowboy gives a recipe card. Each snowboy gives a different recipe.',
    daily: true,
    limit: '1 per day'
  },
  {
    name: 'Seasonal Events',
    emoji: '\u{1F38A}',
    description: 'Special NPCs bring event-specific recipes: Zipper (Bunny Day), Jack (Halloween), Franklin (Turkey Day).',
    tips: 'Franklin gives Turkey Day recipes for completing his dishes on the holiday.',
    daily: false,
    limit: 'Event specific'
  },
  {
    name: 'Tom Nook',
    emoji: '\u{1F99D}',
    description: 'Tom Nook gives early-game tool recipes as part of the island tutorial.',
    tips: 'These are given automatically on your first days on the island.',
    daily: false,
    limit: 'One-time'
  },
  {
    name: 'Nook Miles Exchange',
    emoji: '\u{1F3AB}',
    description: 'Redeem Nook Miles at the Nook Stop for fence recipes and other DIYs. Fence recipes rotate daily (2 per day, 1000 Miles each).',
    tips: 'Check the Nook Stop daily for new fence recipes. Some recipes like the Pretty Good Tools set cost 3000 Miles.',
    daily: true,
    limit: '2 fence recipes per day'
  },
  {
    name: 'Fishing',
    emoji: '\u{1F3A3}',
    description: 'Catching certain fish teaches cooking recipes (added in ver. 2.0). Sea bass, olive flounder, squid, and more unlock food DIYs.',
    tips: 'Each fish type that gives a recipe will teach it the first time you catch it after learning to cook.',
    daily: false,
    limit: 'One-time per fish type'
  },
  {
    name: 'Be a Chef! DIY Recipes+',
    emoji: '\u{1F4D6}',
    description: 'Purchase from Nook Stop for 2000 Nook Miles. Unlocks 7 cooking recipes including a smoothie based on your native fruit.',
    tips: 'Required to unlock the cooking feature. Buy this first before collecting other cooking recipes.',
    daily: false,
    limit: 'One-time purchase'
  },
  {
    name: 'Basic Cooking Recipes',
    emoji: '\u{1F4D7}',
    description: 'Purchase from Nook\'s Cranny for 4980 Bells. Contains 8 basic cooking recipes.',
    tips: 'Available after upgrading Nook\'s Cranny. Includes flour, sugar, and other staple recipes.',
    daily: false,
    limit: 'One-time purchase'
  },
  {
    name: 'Leif / Daisy Mae / Niko',
    emoji: '\u{1F331}',
    description: 'Ver. 2.0/3.0 sources. Niko (Happy Home Paradise) teaches vine, moss, and golden DIY recipes. Ver. 3.0 adds DIY Donation Box requests at the Resort Hotel.',
    tips: 'Niko gives recipes after completing facility builds in Happy Home Paradise. Leif occasionally offers hedge fence recipe.',
    daily: false,
    limit: 'Progress-based'
  }
];

// ─── Seasonal Sections (11) ─────────────────────────────────────────────────

export const SEASONAL_SECTIONS = [
  {
    name: 'Cherry Blossom',
    emoji: '\u{1F338}',
    nh: 'Apr 1 \u2013 Apr 10',
    sh: 'Oct 1 \u2013 Oct 10',
    source: 'Balloons',
    recipes: [
      'blossom-viewing lantern', 'cherry-blossom bonsai', 'cherry-blossom branches',
      'cherry-blossom clock', 'cherry-blossom flooring', 'cherry-blossom pochette',
      'cherry-blossom pond stone', 'cherry-blossom umbrella', 'cherry-blossom wand',
      'cherry-blossom-petal pile', 'cherry-blossom-trees wall',
      'outdoor picnic set', 'sakura-wood flooring', 'sakura-wood wall'
    ]
  },
  {
    name: 'Spring Bamboo',
    emoji: '\u{1F38D}',
    nh: 'Feb 25 \u2013 May 31',
    sh: 'Aug 25 \u2013 Nov 30',
    source: 'Balloons',
    recipes: [
      'bamboo doll', 'bamboo noodle slide', 'bamboo-grove wall',
      'bamboo-shoot lamp', 'basket pack', 'green-leaf pile',
      'light bamboo rug', 'steamer-basket set'
    ]
  },
  {
    name: 'Mushroom',
    emoji: '\u{1F344}',
    nh: 'Nov 1 \u2013 Nov 30',
    sh: 'May 1 \u2013 May 31',
    source: 'Balloons',
    recipes: [
      'forest flooring', 'forest wall', 'mush lamp', 'mush log',
      'mush low stool', 'mush parasol', 'mush partition', 'mush table',
      'mush umbrella', 'mush wall', 'mushroom wand', 'mushroom wreath'
    ]
  },
  {
    name: 'Maple Leaves',
    emoji: '\u{1F342}',
    nh: 'Nov 16 \u2013 Nov 25',
    sh: 'May 16 \u2013 May 25',
    source: 'Balloons',
    recipes: [
      'autumn wall', 'colored-leaves flooring', 'leaf campfire', 'leaf stool',
      'maple-leaf pochette', 'maple-leaf pond stone', 'maple-leaf umbrella',
      'pile of leaves', 'red-leaf pile', 'yellow-leaf pile'
    ]
  },
  {
    name: 'Maple & Acorn',
    emoji: '\u{1F341}',
    nh: 'Sep 1 \u2013 Dec 10',
    sh: 'Mar 1 \u2013 Jun 10',
    source: 'Balloons',
    recipes: [
      'acorn pochette', 'autumn wall', 'colored-leaves flooring',
      'leaf campfire', 'leaf stool', 'maple-leaf pochette',
      'maple-leaf pond stone', 'maple-leaf umbrella', 'pile of leaves',
      'pine bonsai tree', 'red-leaf pile', "tree's bounty arch",
      "tree's bounty big tree", "tree's bounty lamp",
      "tree's bounty little tree", "tree's bounty mobile", 'yellow-leaf pile'
    ]
  },
  {
    name: 'Frozen & Snowflake',
    emoji: '\u2744\uFE0F',
    nh: 'Dec 11 \u2013 Feb 24',
    sh: 'Jun 11 \u2013 Aug 24',
    source: 'Balloons + Snowboy',
    // Note: ice wand is Celeste recipe, not seasonal balloon
    recipes: [
      'falling-snow wall', 'frozen arch', 'frozen bed', 'frozen chair',
      'frozen counter', 'frozen partition', 'frozen pillar',
      'frozen sculpture', 'frozen table', 'frozen tree', 'frozen-treat set',
      'ice flooring', 'ice wall', 'iceberg flooring', 'iceberg wall',
      'snowflake pochette', 'snowflake wall', 'snowflake wreath',
      'snowperson head', 'three-tiered snowperson',
      'ski-slope flooring', 'ski-slope wall'
    ]
  },
  {
    name: 'Summer Shell',
    emoji: '\u{1F30A}',
    nh: 'Jun 1 \u2013 Aug 31',
    sh: 'Dec 1 \u2013 Feb 28',
    source: 'Balloons',
    recipes: [
      'shellfish pochette', 'starry-sands flooring', 'summer-shell rug',
      'tropical vista', 'underwater flooring', 'underwater wall', 'water flooring'
    ]
  },
  {
    name: 'Bunny Day',
    emoji: '\u{1F430}',
    nh: 'Easter week (varies yearly)',
    sh: 'Easter week (varies yearly)',
    source: 'Zipper T. Bunny + crafting',
    recipes: [
      'Bunny Day arch', 'Bunny Day bag', 'Bunny Day bed', 'Bunny Day crown',
      'Bunny Day fence', 'Bunny Day festive balloons', 'Bunny Day flooring',
      'Bunny Day glowy garland', 'Bunny Day lamp', 'Bunny Day merry balloons',
      'Bunny Day rug', 'Bunny Day stool', 'Bunny Day table', 'Bunny Day vanity',
      'Bunny Day wall', 'Bunny Day wall clock', 'Bunny Day wand',
      'Bunny Day wardrobe', 'Bunny Day wreath', 'wobbling Zipper toy',
      'egg party hat', 'egg party dress'
    ]
  },
  {
    name: 'Spooky / Halloween',
    emoji: '\u{1F47B}',
    nh: 'Oct 1 \u2013 Oct 31',
    sh: 'Apr 1 \u2013 Apr 30',
    source: 'Balloons + Jack',
    recipes: [
      'spooky arch', 'spooky candy set', 'spooky carriage', 'spooky chair',
      'spooky fence', 'spooky garland', 'spooky lantern', 'spooky lantern set',
      'spooky scarecrow', 'spooky standing lamp', 'spooky table',
      'spooky table setting', 'spooky tower', 'spooky wand'
    ]
  },
  {
    name: 'Turkey Day',
    emoji: '\u{1F983}',
    nh: '4th Thursday of November',
    sh: '4th Thursday of November',
    source: 'Franklin',
    recipes: [
      'Turkey Day casserole', 'Turkey Day chair', 'Turkey Day decorations',
      'Turkey Day garden stand', 'Turkey Day hearth', 'Turkey Day table',
      'Turkey Day table setting', 'Turkey Day wheat decor'
    ]
  },
  {
    name: 'Festive / Ornament',
    emoji: '\u{1F384}',
    nh: 'Dec 15 \u2013 Jan 6',
    sh: 'Dec 15 \u2013 Jan 6',
    source: 'Balloons',
    recipes: [
      'big festive tree', 'festive rug', 'festive top set', 'festive tree',
      'festive wrapping paper', 'gift pile', 'holiday candle',
      'illuminated present', 'illuminated reindeer', 'illuminated snowflakes',
      'illuminated tree', 'ornament mobile', 'ornament wreath', 'tabletop festive tree'
    ]
  }
];

// ─── Shared Constants ────────────────────────────────────────────────────────

export const STORAGE_KEY = 'acnh-diy-tracker';

export const TOTAL_RECIPES = Object.values(DIY_CATEGORIES).reduce(
  (sum, cat) => sum + cat.recipes.length, 0
);
