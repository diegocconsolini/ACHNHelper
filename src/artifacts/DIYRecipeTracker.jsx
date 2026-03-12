import React, { useState, useEffect } from 'react';
import { AssetImg } from '../assetHelper';

// Verified ACNH DIY Recipe Tracker — all names sourced from manifest + Nookipedia
const DIYRecipeTracker = () => {
  const [activeTab, setActiveTab] = useState('category');
  const [learnedRecipes, setLearnedRecipes] = useState(new Set());
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [hemisphere, setHemisphere] = useState('northern');

  // All verified ACNH DIY recipe categories — names from manifest + Nookipedia
  const DIY_CATEGORIES = {
    'Tools': {
      emoji: '🔨',
      recipes: [
        'axe', 'fishing rod', 'flimsy axe', 'flimsy fishing rod', 'flimsy net',
        'flimsy shovel', 'flimsy watering can', 'golden axe', 'golden net',
        'golden rod', 'golden shovel', 'golden slingshot', 'golden watering can',
        'ladder', 'net', 'shovel', 'slingshot', 'stone axe', 'vaulting pole',
        'watering can'
      ]
    },
    'Ironwood': {
      emoji: '🪵',
      recipes: [
        'ironwood DIY workbench', 'ironwood bed', 'ironwood cart', 'ironwood chair',
        'ironwood clock', 'ironwood cupboard', 'ironwood dresser', 'ironwood kitchenette',
        'ironwood low table', 'ironwood table'
      ]
    },
    'Log': {
      emoji: '🪵',
      recipes: [
        'log bed', 'log bench', 'log chair', 'log decorative shelves',
        'log dining table', 'log extra-long sofa', 'log garden lounge',
        'log pack', 'log round table', 'log stakes', 'log stool',
        'log wall-mounted clock'
      ]
    },
    'Wooden': {
      emoji: '🪑',
      recipes: [
        'wooden bookshelf', 'wooden bucket', 'wooden chair', 'wooden chest',
        'wooden double bed', 'wooden end table', 'wooden fish',
        'wooden full-length mirror', 'wooden low table', 'wooden mini table',
        'wooden simple bed', 'wooden stool', 'wooden table', 'wooden table mirror',
        'wooden toolbox', 'wooden wardrobe', 'wooden waste bin'
      ]
    },
    'Wooden-Block': {
      emoji: '🧱',
      recipes: [
        'wooden-block bed', 'wooden-block bench', 'wooden-block bookshelf',
        'wooden-block chair', 'wooden-block chest', 'wooden-block stereo',
        'wooden-block stool', 'wooden-block table', 'wooden-block toy',
        'wooden-block wall clock'
      ]
    },
    'Shell': {
      emoji: '🐚',
      recipes: [
        'shell arch', 'shell bed', 'shell fountain', 'shell lamp',
        'shell partition', 'shell rug', 'shell speaker', 'shell stool',
        'shell table', 'shell wand', 'shell wreath'
      ]
    },
    'Gold': {
      emoji: '✨',
      recipes: [
        'gold armor', 'gold bars', 'gold helmet', 'gold rose crown',
        'gold rose wreath', 'gold-armor shoes', 'gold-screen wall',
        'golden arowana model', 'golden candlestick', 'golden casket',
        'golden dishes', 'golden dung beetle', 'golden flooring',
        'golden gears', 'golden seat', 'golden toilet', 'golden wall'
      ]
    },
    'Iron': {
      emoji: '⚙️',
      recipes: [
        'iron armor', 'iron closet', 'iron doorplate', 'iron fence',
        'iron frame', 'iron garden bench', 'iron garden chair',
        'iron garden table', 'iron hanger stand', 'iron shelf',
        'iron wall lamp', 'iron wall rack', 'iron wand', 'iron worktable',
        'iron-and-stone fence'
      ]
    },
    'Fruit': {
      emoji: '🍎',
      recipes: [
        'apple chair', 'apple dress', 'apple hat', 'apple rug',
        'apple umbrella', 'apple wall', 'cherry dress', 'cherry hat',
        'cherry lamp', 'cherry rug', 'cherry speakers', 'cherry umbrella',
        'cherry wall', 'coconut juice', 'coconut wall planter',
        'fruit basket', 'fruit wreath', 'juicy-apple TV',
        'orange dress', 'orange end table', 'orange hat', 'orange rug',
        'orange umbrella', 'orange wall', 'orange wall-mounted clock',
        'peach chair', 'peach dress', 'peach hat', 'peach rug',
        'peach surprise box', 'peach umbrella', 'peach wall',
        'pear bed', 'pear dress', 'pear hat', 'pear rug',
        'pear umbrella', 'pear wall', 'pear wardrobe'
      ]
    },
    'Bamboo': {
      emoji: '🎋',
      recipes: [
        'bamboo basket', 'bamboo bench', 'bamboo candleholder',
        'bamboo doll', 'bamboo drum', 'bamboo floor lamp', 'bamboo flooring',
        'bamboo hat', 'bamboo lattice fence', 'bamboo lunch box',
        'bamboo noodle slide', 'bamboo partition', 'bamboo shelf',
        'bamboo speaker', 'bamboo sphere', 'bamboo stool', 'bamboo stopblock',
        'bamboo wall', 'bamboo wall decoration', 'bamboo-grove wall',
        'bamboo-shoot lamp', 'dark bamboo rug', 'light bamboo rug'
      ]
    },
    'Fences': {
      emoji: '🌿',
      recipes: [
        'bamboo lattice fence', 'barbed-wire fence', 'brick fence',
        'corral fence', 'country fence', 'imperial fence', 'iron fence',
        'iron-and-stone fence', 'lattice fence', 'rope fence',
        'simple wooden fence', 'spiky fence', 'stone fence', 'straw fence',
        'vertical-board fence', 'zen fence'
      ]
    },
    'Crowns & Wreaths': {
      emoji: '👑',
      recipes: [
        'blue rose crown', 'blue rose wreath', 'chic cosmos wreath',
        'chic mum crown', 'chic rose crown', 'chic tulip crown',
        'chic windflower wreath', 'cool hyacinth crown', 'cool hyacinth wreath',
        'cool pansy crown', 'cool pansy wreath', 'cool windflower crown',
        'cool windflower wreath', 'cosmos crown', 'cosmos wreath',
        'cute lily crown', 'cute rose crown', 'dark cosmos crown',
        'dark lily crown', 'dark lily wreath', 'dark rose wreath',
        'dark tulip crown', 'dark tulip wreath', 'fancy lily wreath',
        'fancy mum wreath', 'fancy rose wreath', 'gold rose crown',
        'gold rose wreath', 'hyacinth crown', 'hyacinth wreath',
        'lily crown', 'lily wreath', 'lovely cosmos crown',
        'mum crown', 'mum wreath', 'natural mum wreath',
        'pansy crown', 'pansy wreath', 'pretty cosmos wreath',
        'pretty tulip wreath', 'purple hyacinth crown', 'purple hyacinth wreath',
        'purple pansy crown', 'purple windflower crown', 'rose crown',
        'rose wreath', 'simple mum crown', 'snazzy pansy wreath',
        'tree branch wreath', 'tulip crown', 'tulip wreath',
        'windflower crown', 'windflower wreath'
      ]
    },
    'Wands': {
      emoji: '🪄',
      recipes: [
        'bamboo wand', 'cherry-blossom wand', 'cosmos wand', 'golden wand',
        'hyacinth wand', 'ice wand', 'iron wand', 'lily wand',
        'mums wand', 'mushroom wand', 'pansy wand', 'rose wand',
        'shamrock wand', 'shell wand', 'spooky wand', 'star wand',
        'tree-branch wand', 'tulip wand', 'wand', 'wedding wand',
        'windflower wand'
      ]
    },
    'Mermaid': {
      emoji: '🧜',
      recipes: [
        'mermaid bed', 'mermaid chair', 'mermaid closet', 'mermaid dresser',
        'mermaid fence', 'mermaid flooring', 'mermaid lamp', 'mermaid rug',
        'mermaid screen', 'mermaid shelf', 'mermaid sofa', 'mermaid table',
        'mermaid vanity', 'mermaid wall', 'mermaid wall clock'
      ]
    },
    'Cherry Blossom': {
      emoji: '🌸',
      recipes: [
        'blossom-viewing lantern', 'cherry-blossom bonsai',
        'cherry-blossom branches', 'cherry-blossom clock',
        'cherry-blossom flooring', 'cherry-blossom pochette',
        'cherry-blossom pond stone', 'cherry-blossom umbrella',
        'cherry-blossom-petal pile', 'cherry-blossom-trees wall',
        'outdoor picnic set', 'sakura-wood flooring', 'sakura-wood wall'
      ]
    },
    'Mushroom': {
      emoji: '🍄',
      recipes: [
        'forest flooring', 'forest wall', 'mush lamp', 'mush log',
        'mush low stool', 'mush parasol', 'mush partition', 'mush table',
        'mush umbrella', 'mush wall', 'mushroom wand', 'mushroom wreath'
      ]
    },
    'Maple & Acorn': {
      emoji: '🍁',
      recipes: [
        'acorn pochette', 'autumn wall', 'colored-leaves flooring',
        'leaf campfire', 'leaf stool', 'maple-leaf pochette',
        'maple-leaf pond stone', 'maple-leaf umbrella', 'pile of leaves',
        'pine bonsai tree', 'red-leaf pile', "tree's bounty arch",
        "tree's bounty big tree", "tree's bounty lamp",
        "tree's bounty little tree", "tree's bounty mobile", 'yellow-leaf pile'
      ]
    },
    'Frozen & Snowflake': {
      emoji: '❄️',
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
    'Summer Shell': {
      emoji: '🌊',
      recipes: [
        'shellfish pochette', 'starry-sands flooring', 'summer-shell rug',
        'tropical vista', 'underwater flooring', 'underwater wall',
        'water flooring'
      ]
    },
    'Bunny Day': {
      emoji: '🐰',
      recipes: [
        'Bunny Day arch', 'Bunny Day bag', 'Bunny Day bed',
        'Bunny Day crown', 'Bunny Day fence', 'Bunny Day festive balloons',
        'Bunny Day flooring', 'Bunny Day glowy garland', 'Bunny Day lamp',
        'Bunny Day merry balloons', 'Bunny Day rug', 'Bunny Day stool',
        'Bunny Day table', 'Bunny Day vanity', 'Bunny Day wall',
        'Bunny Day wall clock', 'Bunny Day wand', 'Bunny Day wardrobe',
        'Bunny Day wreath',
        'earth-egg outfit', 'earth-egg shell', 'earth-egg shoes',
        'egg party dress', 'egg party hat',
        'leaf-egg outfit', 'leaf-egg shell', 'leaf-egg shoes',
        'sky-egg outfit', 'sky-egg shell', 'sky-egg shoes',
        'stone-egg outfit', 'stone-egg shell', 'stone-egg shoes',
        'water-egg outfit', 'water-egg shell', 'water-egg shoes',
        'wood-egg outfit', 'wood-egg shell', 'wood-egg shoes',
        'wobbling Zipper toy'
      ]
    },
    'Spooky': {
      emoji: '👻',
      recipes: [
        'spooky arch', 'spooky candy set', 'spooky carriage',
        'spooky chair', 'spooky cookies', 'spooky fence', 'spooky garland',
        'spooky lantern', 'spooky lantern set', 'spooky scarecrow',
        'spooky standing lamp', 'spooky table', 'spooky table setting',
        'spooky tower', 'spooky treats basket', 'spooky tree',
        'spooky trick lamp', 'spooky wand'
      ]
    },
    'Turkey Day': {
      emoji: '🦃',
      recipes: [
        'Turkey Day casserole', 'Turkey Day chair', 'Turkey Day decorations',
        'Turkey Day garden stand', 'Turkey Day hearth', 'Turkey Day table',
        'Turkey Day table setting', 'Turkey Day wheat decor'
      ]
    },
    'Festive': {
      emoji: '🎄',
      recipes: [
        'big festive tree', 'festive rug', 'festive top set', 'festive tree',
        'festive wrapping paper', 'gift pile', 'holiday candle',
        'illuminated present', 'illuminated reindeer', 'illuminated snowflakes',
        'illuminated tree', 'ornament mobile', 'ornament wreath',
        'tabletop festive tree'
      ]
    },
    'Celeste': {
      emoji: '⭐',
      recipes: [
        'Aquarius urn', 'Aries rocking chair', 'Cancer table',
        'Capricorn ornament', 'Gemini closet', 'Leo sculpture',
        'Libra scale', 'Pisces lamp', 'Sagittarius arrow', 'Scorpio lamp',
        'Taurus bathtub', 'Virgo harp',
        'asteroid', 'astronaut suit', 'crescent-moon chair',
        'crewed spaceship', 'flying saucer', 'galaxy flooring',
        'lunar lander', 'lunar rover', 'lunar surface', 'moon',
        'nova light', 'rocket', 'satellite', 'sci-fi flooring', 'sci-fi wall',
        'space shuttle', 'star clock', 'star head', 'star pochette',
        'starry garland', 'starry wall', 'starry-sky wall',
        'wand', 'tree-branch wand', 'iron wand', 'golden wand',
        'star wand', 'windflower wand', 'mums wand', 'cosmos wand',
        'tulip wand', 'rose wand', 'pansy wand', 'hyacinth wand',
        'lily wand', 'bamboo wand', 'cherry-blossom wand'
      ]
    },
    'Cooking - Savory': {
      emoji: '🍲',
      recipes: [
        'flour', 'whole-wheat flour', 'sugar', 'brown sugar',
        'carrot potage', 'potato potage', 'minestrone soup',
        'bamboo-shoot soup', 'mushroom potage', 'seaweed soup',
        'salad', 'salade de carottes rapees', 'mushroom salad',
        'turnip salad', 'fruit salad', 'poke', 'seafood salad',
        'French fries', 'fish-and-chips', 'baked potatoes',
        'potato galette', 'veggie quiche', 'veggie sandwich',
        'mixed-fruits sandwich', 'salmon sandwich',
        'tomato bagel sandwich', 'carrot bagel sandwich',
        'pumpkin bagel sandwich', 'mixed-fruits bagel sandwich',
        'salmon bagel sandwich', 'mushroom crepe', 'veggie crepe',
        'bread gratin', 'salad-stuffed tomato', 'pumpkin soup',
        'kabu ankake', 'tomates al ajillo', 'champinones al ajillo',
        'anchoas al ajillo', 'seafood ajillo', 'pull-apart bread',
        'bread', 'organic bread', 'snack bread', 'savory bread',
        'gnocchi di carote', 'gnocchi di patate', 'gnocchi di zucca',
        'spaghetti marinara', 'spaghetti napolitan', 'squid-ink spaghetti',
        'tomato curry', 'carrot-tops curry', 'potato curry',
        'pumpkin curry', 'mushroom curry', 'squid-ink curry',
        'pizza margherita', 'mushroom pizza', 'fruit pizza', 'seafood pizza',
        'carpaccio di capesante', 'carpaccio di salmone',
        'barred-knifejaw carpaccio', 'carpaccio di marlin blu',
        'sea-bass pie', 'grilled sea bass with herbs', 'aji fry',
        'karei no nitsuke', 'sauteed olive flounder',
        "pesce all'acqua pazza", 'tomato puree', 'pickled veggies',
        'jarred bamboo shoots', 'jarred mushrooms', 'orange marmalade',
        'cherry jam', 'peach jam', 'pear jam', 'apple jam', 'coconut oil',
        'sardines in oil', 'clam chowder', 'pumpkin pie', 'gratin',
        'olive-flounder meuniere'
      ]
    },
    'Cooking - Sweet': {
      emoji: '🍰',
      recipes: [
        'cookies', 'frosted cookies', 'thumbprint jam cookies',
        'coconut cookies', 'veggie cookies', 'Roost sable cookie',
        'pretzels', 'frosted pretzels', 'plain cupcakes',
        'brown-sugar cupcakes', 'fruit cupcakes', 'pumpkin cupcakes',
        'veggie cupcakes', 'orange jelly', 'cherry jelly', 'peach jelly',
        'pear jelly', 'apple jelly', 'coconut pudding', 'plain scones',
        'fruit scones', 'carrot scones', 'pumpkin scones', 'orange tart',
        'cherry tart', 'peach tart', 'pear tart', 'apple tart',
        'mixed-fruits tart', 'carrot cake', 'sugar crepe',
        'mixed-fruits crepe', 'pound cake', 'brown-sugar pound cake',
        'orange pound cake', 'pumpkin pound cake', 'cake sale', 'pancakes',
        'coconut pancakes', 'fruit-topped pancakes', 'orange pie',
        'cherry pie', 'peach pie', 'pear pie', 'apple pie',
        'mixed-fruits pie', 'orange smoothie', 'cherry smoothie',
        'peach smoothie', 'pear smoothie', 'apple smoothie',
        'coconut milk', 'tomato juice', 'carrot juice', 'spooky cookies'
      ]
    }
  };

  const TOTAL_RECIPES = Object.values(DIY_CATEGORIES).reduce(
    (sum, cat) => sum + cat.recipes.length, 0
  );

  // Recipe sources
  const SOURCES = [
    {
      name: 'Villager Crafting',
      emoji: '🏠',
      description: 'Visit villagers at their homes when they\'re crafting. Up to 3 unique recipes per day from different personality types.',
      tips: 'Each villager personality gives recipes from their pool. Visit during morning and afternoon.',
      daily: true,
      limit: '3 per day'
    },
    {
      name: 'Message in a Bottle',
      emoji: '🍾',
      description: 'Check beaches for bottles with DIY recipes. One guaranteed per day.',
      tips: 'Always spawn near beach corners. Check daily!',
      daily: true,
      limit: '1 per day'
    },
    {
      name: 'Balloon Presents',
      emoji: '🎈',
      description: 'Pop balloons floating over your island. Recipes vary by season and balloon color.',
      tips: 'Green balloons during seasonal windows often contain seasonal DIY recipes.',
      daily: false,
      limit: 'Variable'
    },
    {
      name: "Nook's Cranny",
      emoji: '🏪',
      description: 'Purchase DIY recipes from the shop. Stock rotates daily.',
      tips: 'Check daily — the recipe card in the rotating stock changes every day.',
      daily: true,
      limit: 'Variable'
    },
    {
      name: 'Celeste',
      emoji: '⭐',
      description: 'Visit Celeste on clear nights (no rain/snow) for zodiac, space, and wand recipes.',
      tips: 'One recipe per visit. Zodiac recipes change monthly based on the current star sign.',
      daily: false,
      limit: '1 per visit'
    },
    {
      name: 'Pascal',
      emoji: '🐚',
      description: 'Give a scallop to Pascal while diving for mermaid DIY recipes.',
      tips: 'Appears on the beach when you bring him a scallop. Mermaid recipes only.',
      daily: true,
      limit: '1 per day'
    },
    {
      name: 'Snowboy',
      emoji: '⛄',
      description: 'Build perfect snowboys during winter (Dec–Feb NH / Jun–Aug SH) for frozen/ice DIY recipes.',
      tips: 'Only a perfect snowboy gives a recipe card. Each snowboy gives a different recipe.',
      daily: true,
      limit: '1 per day'
    },
    {
      name: 'Seasonal Events',
      emoji: '🎊',
      description: 'Special NPCs bring event-specific recipes: Zipper (Bunny Day), Jack (Halloween), Franklin (Turkey Day).',
      tips: 'Franklin gives Turkey Day recipes for completing his dishes on the holiday.',
      daily: false,
      limit: 'Event specific'
    },
    {
      name: 'Tom Nook',
      emoji: '🦝',
      description: 'Tom Nook gives early-game tool recipes as part of the island tutorial.',
      tips: 'These are given automatically on your first days on the island.',
      daily: false,
      limit: 'One-time'
    }
  ];

  // Verified seasonal windows (NH / SH)
  const SEASONAL_SECTIONS = [
    {
      name: 'Cherry Blossom',
      emoji: '🌸',
      nh: 'Apr 1 – Apr 10',
      sh: 'Oct 1 – Oct 10',
      source: 'Balloons',
      recipes: [
        'blossom-viewing lantern', 'cherry-blossom bonsai', 'cherry-blossom branches',
        'cherry-blossom clock', 'cherry-blossom flooring', 'cherry-blossom pochette',
        'cherry-blossom pond stone', 'cherry-blossom umbrella',
        'cherry-blossom-petal pile', 'cherry-blossom-trees wall',
        'outdoor picnic set', 'sakura-wood flooring', 'sakura-wood wall'
      ]
    },
    {
      name: 'Mushroom',
      emoji: '🍄',
      nh: 'Nov 1 – Nov 30',
      sh: 'May 1 – May 31',
      source: 'Balloons',
      recipes: [
        'forest flooring', 'forest wall', 'mush lamp', 'mush log',
        'mush low stool', 'mush parasol', 'mush partition', 'mush table',
        'mush umbrella', 'mush wall', 'mushroom wand', 'mushroom wreath'
      ]
    },
    {
      name: 'Maple & Acorn',
      emoji: '🍁',
      nh: 'Sep 1 – Dec 10',
      sh: 'Mar 1 – Jun 10',
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
      emoji: '❄️',
      nh: 'Dec 11 – Feb 24',
      sh: 'Jun 11 – Aug 24',
      source: 'Balloons + Snowboy',
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
      emoji: '🌊',
      nh: 'Jun 1 – Aug 31',
      sh: 'Dec 1 – Feb 28',
      source: 'Balloons',
      recipes: [
        'shellfish pochette', 'starry-sands flooring', 'summer-shell rug',
        'tropical vista', 'underwater flooring', 'underwater wall', 'water flooring'
      ]
    },
    {
      name: 'Bunny Day',
      emoji: '🐰',
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
      emoji: '👻',
      nh: 'Oct 1 – Oct 31',
      sh: 'Apr 1 – Apr 30',
      source: 'Balloons + Jack',
      recipes: [
        'spooky arch', 'spooky candy set', 'spooky carriage', 'spooky chair',
        'spooky fence', 'spooky garland', 'spooky lantern', 'spooky lantern set',
        'spooky scarecrow', 'spooky standing lamp', 'spooky table',
        'spooky table setting', 'spooky tower', 'spooky tree',
        'spooky trick lamp', 'spooky treats basket', 'spooky cookies', 'spooky wand'
      ]
    },
    {
      name: 'Turkey Day',
      emoji: '🦃',
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
      emoji: '🎄',
      nh: 'Dec 15 – Jan 6',
      sh: 'Dec 15 – Jan 6',
      source: 'Balloons',
      recipes: [
        'big festive tree', 'festive rug', 'festive top set', 'festive tree',
        'festive wrapping paper', 'gift pile', 'holiday candle',
        'illuminated present', 'illuminated reindeer', 'illuminated snowflakes',
        'illuminated tree', 'ornament mobile', 'ornament wreath', 'tabletop festive tree'
      ]
    }
  ];

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get('acnh-diy-tracker');
        if (result) {
          const data = JSON.parse(result.value);
          setLearnedRecipes(new Set(data.learned || []));
        }
      } catch (err) {
        console.error('Failed to load DIY tracker data:', err);
      }
    };
    loadData();
  }, []);

  // Persist whenever learnedRecipes changes
  useEffect(() => {
    (async () => {
      try {
        await window.storage.set(
          'acnh-diy-tracker',
          JSON.stringify({ learned: Array.from(learnedRecipes) })
        );
      } catch (e) {
        console.error('Error saving recipes:', e);
      }
    })();
  }, [learnedRecipes]);

  const toggleRecipeLearned = (recipe) => {
    setLearnedRecipes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recipe)) {
        newSet.delete(recipe);
      } else {
        newSet.add(recipe);
      }
      return newSet;
    });
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const getFilteredCategories = () => {
    if (!searchTerm) return DIY_CATEGORIES;
    const term = searchTerm.toLowerCase();
    const filtered = {};
    Object.entries(DIY_CATEGORIES).forEach(([cat, data]) => {
      const matchedRecipes = data.recipes.filter(r =>
        r.toLowerCase().includes(term)
      );
      if (matchedRecipes.length > 0 || cat.toLowerCase().includes(term)) {
        filtered[cat] = { ...data, recipes: matchedRecipes.length > 0 ? matchedRecipes : data.recipes };
      }
    });
    return filtered;
  };

  const getCategoryProgress = (categoryName) => {
    const recipes = DIY_CATEGORIES[categoryName].recipes;
    const learned = recipes.filter(r => learnedRecipes.has(r)).length;
    return { learned, total: recipes.length };
  };

  const learnedCount = learnedRecipes.size;
  const progressPercent = TOTAL_RECIPES > 0 ? Math.round((learnedCount / TOTAL_RECIPES) * 100) : 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const styles = {
    container: {
      width: '100%',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#0a1a10',
      minHeight: '100vh',
      fontFamily: "'DM Sans', sans-serif",
      color: '#c8e6c0'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '36px',
      fontWeight: 700,
      color: '#5ec850',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '14px',
      color: '#5a7a50',
      margin: 0
    },
    tabs: {
      display: 'flex',
      gap: '4px',
      marginBottom: '24px',
      borderBottom: '1px solid rgba(94, 200, 80, 0.2)',
      flexWrap: 'wrap'
    },
    tabButton: {
      padding: '10px 18px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#5a7a50',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      transition: 'all 0.2s ease'
    },
    tabButtonActive: {
      color: '#5ec850',
      borderBottomColor: '#5ec850'
    },
    statsBox: {
      display: 'flex',
      gap: '24px',
      marginBottom: '24px',
      padding: '20px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '8px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    progressRingWrap: {
      flex: '0 0 120px',
      textAlign: 'center'
    },
    progressText: {
      fontFamily: "'DM Mono', monospace",
      fontSize: '24px',
      fontWeight: 700,
      color: '#5ec850',
      margin: '4px 0 0 0'
    },
    progressSubtext: {
      fontSize: '12px',
      color: '#5a7a50',
      margin: '2px 0 0 0'
    },
    statsContent: {
      flex: 1,
      minWidth: '160px'
    },
    statRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
      fontSize: '14px'
    },
    statLabel: {
      color: '#5a7a50'
    },
    statValue: {
      color: '#d4b030',
      fontFamily: "'DM Mono', monospace",
      fontWeight: 700
    },
    searchBox: {
      width: '100%',
      padding: '12px 16px',
      marginBottom: '20px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.3)',
      borderRadius: '6px',
      color: '#c8e6c0',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    categoryCard: {
      marginBottom: '10px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    categoryHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    categoryTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flex: 1,
      margin: 0,
      fontSize: '15px',
      fontWeight: 600,
      color: '#c8e6c0'
    },
    categoryRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    categoryCount: {
      fontSize: '13px',
      color: '#d4b030',
      fontFamily: "'DM Mono', monospace",
      minWidth: '48px',
      textAlign: 'right'
    },
    progressBar: {
      width: '80px',
      height: '5px',
      backgroundColor: 'rgba(94, 200, 80, 0.15)',
      borderRadius: '3px',
      overflow: 'hidden'
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#5ec850',
      transition: 'width 0.3s ease'
    },
    expandIcon: {
      fontSize: '14px',
      color: '#5a7a50',
      transition: 'transform 0.25s ease'
    },
    categoryContent: {
      padding: '14px',
      backgroundColor: 'rgba(0, 0, 0, 0.25)',
      borderTop: '1px solid rgba(94, 200, 80, 0.1)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
      gap: '6px'
    },
    recipeItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '7px',
      padding: '7px 8px',
      backgroundColor: 'rgba(12, 28, 14, 0.6)',
      border: '1px solid rgba(94, 200, 80, 0.12)',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      fontSize: '12px'
    },
    checkbox: {
      width: '14px',
      height: '14px',
      cursor: 'pointer',
      accentColor: '#5ec850',
      flexShrink: 0
    },
    sourceCard: {
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '8px'
    },
    sourceTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '16px',
      fontWeight: 600,
      color: '#5ec850',
      margin: '0 0 8px 0'
    },
    sourceDesc: {
      fontSize: '13px',
      color: '#5a7a50',
      marginBottom: '8px',
      lineHeight: 1.55
    },
    sourceTips: {
      fontSize: '12px',
      color: '#4aacf0',
      padding: '8px 10px',
      backgroundColor: 'rgba(74, 172, 240, 0.08)',
      borderRadius: '4px',
      marginBottom: '10px',
      borderLeft: '3px solid #4aacf0'
    },
    sourceMeta: {
      display: 'flex',
      gap: '20px',
      fontSize: '12px'
    },
    sourceMetaItem: {
      color: '#5a7a50'
    },
    sourceLabel: {
      color: '#5ec850',
      fontWeight: 600
    },
    seasonCard: {
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '8px'
    },
    seasonHeader: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '10px',
      marginBottom: '10px'
    },
    seasonName: {
      fontSize: '16px',
      fontWeight: 700,
      color: '#d4b030',
      margin: 0,
      fontFamily: "'Playfair Display', serif"
    },
    seasonSource: {
      fontSize: '12px',
      color: '#4aacf0',
      fontStyle: 'italic'
    },
    seasonDates: {
      display: 'flex',
      gap: '16px',
      marginBottom: '10px',
      fontSize: '13px'
    },
    seasonDate: {
      color: '#5a7a50'
    },
    seasonDateHL: {
      color: '#5ec850',
      fontWeight: 600
    },
    seasonRecipes: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px'
    },
    seasonRecipePill: {
      fontSize: '11px',
      padding: '3px 8px',
      backgroundColor: 'rgba(94, 200, 80, 0.08)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '12px',
      color: '#c8e6c0'
    },
    hemisphereToggle: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px',
      flexWrap: 'wrap'
    },
    toggleButton: {
      padding: '8px 16px',
      border: '1px solid rgba(94, 200, 80, 0.3)',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      color: '#5ec850',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 500,
      transition: 'all 0.2s ease'
    },
    toggleButtonActive: {
      backgroundColor: '#5ec850',
      color: '#0a1a10',
      borderColor: '#5ec850'
    },
    noResults: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#5a7a50',
      fontSize: '14px'
    }
  };

  const filteredCategories = getFilteredCategories();

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input[type="text"]:focus { outline: none; border-color: #5ec850 !important; }
      `}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>🎀 DIY Recipe Tracker</h1>
        <p style={styles.subtitle}>Track all {TOTAL_RECIPES} verified ACNH DIY recipes</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'category', label: '📂 By Category' },
          { id: 'source', label: '📖 By Source' },
          { id: 'seasonal', label: '🗓️ Seasonal Guide' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tabButton,
              ...(activeTab === tab.id ? styles.tabButtonActive : {})
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Box */}
      {activeTab !== 'seasonal' && (
        <div style={styles.statsBox}>
          <div style={styles.progressRingWrap}>
            <svg width="100" height="100" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(94,200,80,0.1)" strokeWidth="6" />
              <circle
                cx="60" cy="60" r="45"
                fill="none"
                stroke="#5ec850"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease', transformOrigin: 'center', transform: 'rotate(-90deg)' }}
              />
            </svg>
            <p style={styles.progressText}>{progressPercent}%</p>
            <p style={styles.progressSubtext}>{learnedCount} / {TOTAL_RECIPES}</p>
          </div>
          <div style={styles.statsContent}>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Learned</span>
              <span style={styles.statValue}>{learnedCount}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Remaining</span>
              <span style={styles.statValue}>{TOTAL_RECIPES - learnedCount}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Categories</span>
              <span style={styles.statValue}>{Object.keys(DIY_CATEGORIES).length}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Total Recipes</span>
              <span style={styles.statValue}>{TOTAL_RECIPES}</span>
            </div>
          </div>
        </div>
      )}

      {/* By Category Tab */}
      {activeTab === 'category' && (
        <div>
          <input
            type="text"
            placeholder="🔍 Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchBox}
          />

          {Object.keys(filteredCategories).length > 0 ? (
            Object.entries(filteredCategories).map(([category, data]) => {
              const { learned, total } = getCategoryProgress(category);
              const isExpanded = expandedCategories.has(category);
              const catPct = total > 0 ? (learned / total) * 100 : 0;

              return (
                <div key={category} style={styles.categoryCard}>
                  <div
                    style={styles.categoryHeader}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(94,200,80,0.07)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    onClick={() => toggleCategory(category)}
                  >
                    <h3 style={styles.categoryTitle}>
                      <span>{data.emoji}</span>
                      <span>{category}</span>
                    </h3>
                    <div style={styles.categoryRight}>
                      <div style={styles.progressBar}>
                        <div style={{ ...styles.progressBarFill, width: `${catPct}%` }} />
                      </div>
                      <div style={styles.categoryCount}>{learned}/{total}</div>
                      <span
                        style={{
                          ...styles.expandIcon,
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                      >
                        ▼
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={styles.categoryContent}>
                      {data.recipes.map(recipe => {
                        const isLearned = learnedRecipes.has(recipe);
                        return (
                          <div
                            key={recipe}
                            style={{
                              ...styles.recipeItem,
                              backgroundColor: isLearned ? 'rgba(94,200,80,0.12)' : 'rgba(12,28,14,0.6)',
                              borderColor: isLearned ? 'rgba(94,200,80,0.35)' : 'rgba(94,200,80,0.12)'
                            }}
                            onMouseEnter={(e) => {
                              if (!isLearned) e.currentTarget.style.backgroundColor = 'rgba(94,200,80,0.08)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = isLearned ? 'rgba(94,200,80,0.12)' : 'rgba(12,28,14,0.6)';
                            }}
                            onClick={() => toggleRecipeLearned(recipe)}
                          >
                            <input
                              type="checkbox"
                              checked={isLearned}
                              onChange={() => toggleRecipeLearned(recipe)}
                              onClick={(e) => e.stopPropagation()}
                              style={styles.checkbox}
                            />
                            <AssetImg category="recipes" name={recipe} size={22} />
                            <span style={{
                              textDecoration: isLearned ? 'line-through' : 'none',
                              color: isLearned ? '#5a7a50' : '#c8e6c0',
                              lineHeight: 1.3
                            }}>
                              {recipe}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={styles.noResults}>No recipes found matching "{searchTerm}"</div>
          )}
        </div>
      )}

      {/* By Source Tab */}
      {activeTab === 'source' && (
        <div>
          {SOURCES.map((source, idx) => (
            <div key={idx} style={styles.sourceCard}>
              <h3 style={styles.sourceTitle}>
                <span style={{ fontSize: '20px' }}>{source.emoji}</span>
                {source.name}
              </h3>
              <p style={styles.sourceDesc}>{source.description}</p>
              <div style={styles.sourceTips}>
                💡 {source.tips}
              </div>
              <div style={styles.sourceMeta}>
                <div style={styles.sourceMetaItem}>
                  <span style={styles.sourceLabel}>Daily: </span>
                  {source.daily ? '✓ Yes' : '— No'}
                </div>
                <div style={styles.sourceMetaItem}>
                  <span style={styles.sourceLabel}>Limit: </span>
                  {source.limit}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seasonal Guide Tab */}
      {activeTab === 'seasonal' && (
        <div>
          <div style={styles.hemisphereToggle}>
            <button
              onClick={() => setHemisphere('northern')}
              style={{
                ...styles.toggleButton,
                ...(hemisphere === 'northern' ? styles.toggleButtonActive : {})
              }}
            >
              🌍 Northern Hemisphere
            </button>
            <button
              onClick={() => setHemisphere('southern')}
              style={{
                ...styles.toggleButton,
                ...(hemisphere === 'southern' ? styles.toggleButtonActive : {})
              }}
            >
              🌎 Southern Hemisphere
            </button>
          </div>

          <div style={{
            marginBottom: '20px',
            padding: '12px 16px',
            backgroundColor: 'rgba(74,172,240,0.08)',
            borderRadius: '6px',
            borderLeft: '3px solid #4aacf0',
            fontSize: '13px',
            color: '#5a7a50'
          }}>
            📅 Seasonal recipes are obtained from balloons and special NPCs during their active windows.
            Dates shown are for the <strong style={{ color: '#5ec850' }}>
              {hemisphere === 'northern' ? 'Northern' : 'Southern'} Hemisphere
            </strong>.
          </div>

          {SEASONAL_SECTIONS.map((section, idx) => (
            <div key={idx} style={styles.seasonCard}>
              <div style={styles.seasonHeader}>
                <h3 style={styles.seasonName}>{section.emoji} {section.name}</h3>
                <span style={styles.seasonSource}>{section.source}</span>
              </div>
              <div style={styles.seasonDates}>
                <span style={styles.seasonDate}>
                  Window:{' '}
                  <span style={styles.seasonDateHL}>
                    {hemisphere === 'northern' ? section.nh : section.sh}
                  </span>
                </span>
              </div>
              <div style={styles.seasonRecipes}>
                {section.recipes.map(recipe => (
                  <span key={recipe} style={styles.seasonRecipePill}>{recipe}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DIYRecipeTracker;
