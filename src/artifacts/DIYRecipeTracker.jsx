import React, { useState, useEffect } from 'react';
import { AssetImg } from '../assetHelper';

const DIYRecipeTracker = () => {
  const [activeTab, setActiveTab] = useState('category');
  const [learnedRecipes, setLearnedRecipes] = useState(new Set());
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [hemisphere, setHemisphere] = useState('northern');
  const [stats, setStats] = useState({ total: 922, learned: 0, percent: 0 });

  // ACNH DIY Recipe Categories with sample recipes
  const DIY_CATEGORIES = {
    'Tools': {
      count: 17,
      emoji: '🔨',
      recipes: ['Wooden Axe', 'Stone Axe', 'Iron Axe', 'Golden Axe', 'Wooden Shovel', 'Iron Shovel', 'Golden Shovel', 'Fish Rod', 'Fishing Rod', 'Net', 'Golden Net', 'Slingshot', 'Golden Slingshot', 'Watering Can', 'Golden Watering Can', 'Bug Net', 'Ladder']
    },
    'Housewares': {
      count: 195,
      emoji: '🏠',
      recipes: ['Wooden Simple Bed', 'Log Bed', 'Iron Bed', 'Cot', 'Bunk Bed', 'Sleigh', 'Rattan Bed', 'Imperial Bed', 'Wooden Chest', 'Log Stool', 'Wooden Chair', 'Wooden Table', 'Dining Table', 'Desk', 'Bookshelf', 'Shelving Unit', 'Cabinet', 'Dresser', 'Wardrobe', 'Sofa', 'Armchair', 'Office Chair', 'Stool', 'Bench', 'Rack', 'Stand', 'Pedestal', 'Plant', 'Planter']
    },
    'Miscellaneous': {
      count: 125,
      emoji: '✨',
      recipes: ['Scarecrow', 'Straw Coat', 'Straw Hat', 'Bamboo Basket', 'Bamboo Noodle Slide', 'Bamboo Lunch Box', 'Bamboo Wand', 'Pan Flute', 'Wooden Flute', 'Ocarina', 'Panpipes', 'Light Stick', 'Glowing Moss Jar', 'Moon', 'Star', 'Crescent Chair', 'Zodiac Furniture', 'Star Fragment', 'Dung Bomb', 'Birdcage', 'Birdhouse', 'Bell Tent', 'Teepee']
    },
    'Wall-Mounted': {
      count: 52,
      emoji: '🖼️',
      recipes: ['Clock', 'Wooden Clock', 'Brass Clock', 'Cuckoo Clock', 'Dinosaur Skull', 'Dippy Skull', 'Fossil Door Plate', 'Leaf Campfire Cookie', 'Wooden Bookshelf', 'Wall Shelf', 'Wall-Mounted Shelf', 'Wooden Wall Shelf', 'Shelving Unit', 'Wall-Mounted Candle', 'Wall-Mounted TV', 'Wall-Mounted Monitor', 'Mounted Black Bass', 'Fish Doorplate', 'Peach Rug']
    },
    'Wallpaper/Flooring/Rugs': {
      count: 48,
      emoji: '🎨',
      recipes: ['Wooden Flooring', 'Bamboo Flooring', 'Hardwood Flooring', 'Parquet Flooring', 'Dark Parquet Flooring', 'Stone Flooring', 'Brick Flooring', 'Dirt Flooring', 'Tatami Mat', 'Straw Mat', 'Wooden Rug', 'Bamboo Rug', 'Natural Rug', 'Grass Rug', 'Straw Rug', 'Wooden Wallpaper']
    },
    'Equipment': {
      count: 32,
      emoji: '🎽',
      recipes: ['Straw Coat', 'Straw Hat', 'Wooden Bucket Hat', 'Sailor Hat', 'Bamboo Hat', 'Leaf Mask', 'Wooden Full-Face Mask', 'Samurai Armor', 'Rei Cape', 'Tropical Wrap', 'Snorkel Mask', 'Safari Hat', 'Mushroom Mum Cushion', 'Festive Sweater', 'Winter Sweater']
    },
    'Seasonal - Cherry Blossom': {
      count: 14,
      emoji: '🌸',
      recipes: ['Cherry Blossom Pond Stone', 'Cherry Blossom Clock', 'Cherry Blossom Bonsai', 'Cherry Blossom Branches', 'Cherry Blossom Umbrella', 'Outdoor Picnic Set', 'Sakura Wood Flooring', 'Sakura Wood Wall', 'Cherry Blossom Wand', 'Cherry Blossom Petal Pile', 'Blossom Viewing Lantern', 'Sakura Leaf Pile', 'Jingle Bells']
    },
    'Seasonal - Young Spring Bamboo': {
      count: 6,
      emoji: '🎋',
      recipes: ['Bamboo Noodle Slide', 'Bamboo Lunch Box', 'Bamboo Wand', 'Bamboo Flooring', 'Bamboo Wall', 'Steamer-Basket Set']
    },
    'Seasonal - Summer Shell': {
      count: 6,
      emoji: '🐚',
      recipes: ['Shell Bed', 'Shell Fountain', 'Shell Table', 'Shell Stool', 'Shell Arch', 'Shell Partition']
    },
    'Seasonal - Acorn/Pine Cone': {
      count: 9,
      emoji: '🍂',
      recipes: ["Tree's Bounty Big Tree", "Tree's Bounty Arch", "Tree's Bounty Lamp", "Tree's Bounty Shelf", "Tree's Bounty Mobile", "Tree's Bounty Little Tree", "Tree's Bounty Rug", "Tree's Bounty Stool", "Tree's Bounty Wall"]
    },
    'Seasonal - Mushroom': {
      count: 12,
      emoji: '🍄',
      recipes: ['Mush Low Stool', 'Mush Stool', 'Mush Table', 'Mush Closet', 'Mush Bed', 'Mush Wall Lamp', 'Mush Lamp', 'Mush Parasol', 'Mush Umbrella', 'Mush Wreath', 'Mush Partition', 'Mush DIY Workbench']
    },
    'Seasonal - Maple Leaf': {
      count: 9,
      emoji: '🍁',
      recipes: ['Maple Leaf Pile', 'Maple Leaf Pond Stone', 'Maple Leaf Arch', 'Maple Leaf Umbrella', 'Maple Leaf Rug', 'Leaf Campfire Cookie', 'Leaf Stool', 'Leaf Pile', 'Autumn Fence']
    },
    'Seasonal - Snowflake': {
      count: 17,
      emoji: '❄️',
      recipes: ['Frozen Bed', 'Frozen Chair', 'Frozen Desk', 'Frozen Partition', 'Frozen Counter', 'Frozen Table', 'Frozen Sofa', 'Frozen Arch', 'Frozen Sculpture', 'Frozen Treat Set', 'Frozen Flooring', 'Frozen Wall', 'Iced Decorative Shelves', 'Ice Flooring', 'Ice Wall', 'Snowflake Wreath', 'Snowflake Wall']
    },
    'Seasonal - Ornament': {
      count: 8,
      emoji: '🎄',
      recipes: ['Jingle Bell', 'Festive Candle', 'Festive Tree', 'Festive Wreath', 'Festive Tacky Sweater', 'Festive Stocking', 'Ornament Wreath', 'Toy Day Stocking']
    },
    'Celeste': {
      count: 46,
      emoji: '⭐',
      recipes: ['Zodiac Furniture Aquarius', 'Zodiac Furniture Pisces', 'Zodiac Furniture Aries', 'Zodiac Furniture Taurus', 'Zodiac Furniture Gemini', 'Zodiac Furniture Cancer', 'Zodiac Furniture Leo', 'Zodiac Furniture Virgo', 'Zodiac Furniture Libra', 'Zodiac Furniture Scorpio', 'Zodiac Furniture Sagittarius', 'Zodiac Furniture Capricorn', 'Moon', 'Crescent Chair Moon', 'Moon Rug', 'Star Wand', 'Moon Wand', 'Zodiac Wand Aquarius', 'Zodiac Wand Pisces', 'Zodiac Wand Aries', 'Space Shuttle', 'Flying Saucer', 'Lunar Module', 'Asteroid', 'Satellite']
    },
    'Bunny Day': {
      count: 17,
      emoji: '🐰',
      recipes: ['Bunny Day Bed', 'Bunny Day Chair', 'Bunny Day Closet', 'Bunny Day Table', 'Bunny Day Lamp', 'Bunny Day Arch', 'Bunny Day Flooring', 'Bunny Day Wall', 'Bunny Day Wreath', 'Bunny Day Basket', 'Bunny Day Stool', 'Bunny Day Wardrobe', 'Bunny Day Fenestration', 'Bunny Day Vanity', 'Bunny Day Glowing Eggs', 'Bunny Day Crown', 'Bunny Day Wand']
    },
    'Spooky/Halloween': {
      count: 17,
      emoji: '👻',
      recipes: ['Spooky Bed', 'Spooky Chair', 'Spooky Sofa', 'Spooky Table', 'Spooky Dresser', 'Spooky Lantern', 'Spooky Scarecrow', 'Spooky Carriage', 'Spooky Arch', 'Spooky Flooring', 'Spooky Wall', 'Spooky Candy Set', 'Spooky Wand', 'Jack Skellington Costume', 'Jack Jack-In-Box', 'Jack Skeleton Skeleton', 'Jack Spooky Head']
    },
    'Turkey Day': {
      count: 8,
      emoji: '🦃',
      recipes: ['Harvest Bed', 'Harvest Chair', 'Harvest Sofa', 'Harvest Table', 'Harvest Lamp', 'Harvest Wreath', 'Harvest Basket', 'Harvest Decoration']
    },
    'Toy Day': {
      count: 3,
      emoji: '🎁',
      recipes: ['Jingle-Bell Sweater', 'Jingle-Bell Stockings', 'Jingle-Bell Table']
    },
    'Cooking - Savory': {
      count: 72,
      emoji: '🍲',
      recipes: ['Apple Pie', 'Baked Potatoes', 'Baked Vegetable Quiche', 'Beef Tomato Soup', 'Bread', 'Brownies', 'Butter', 'Carrot Cake', 'Cheese Curry Rice', 'Cherry Pie', 'Chestnut Cookies', 'Chocolate Cookies', 'Churros', 'Coconut Cookies', 'Coconut Juice', 'Cozy Soup', 'Crab Cakes', 'Crab Soup', 'Cream Soup', 'Creamy Tomato Soup', 'Cupcakes', 'Curry Rice', 'Doughnut', 'Foie Gras', 'French Toast', 'Fries', 'Fruit Cupcakes', 'Gazpacho', 'Jam', 'Kebabs', 'Meatball Soup', 'Miso Soup', 'Mixed Beans Soup', 'Mixed Fruits Cookies', 'Mixed Juice', 'Mixed Rice', 'Mushroom Pasta', 'Napolitan', 'Noodle Soup', 'Oil', 'Omelet', 'Onion Soup', 'Orange Cookies', 'Orange Juice', 'Oysters', 'Paella', 'Peach Pie', 'Pear Pie', 'Peppermint Candy', 'Phyllo Nuts Pie', 'Pork Cutlet', 'Pumpkin Pie', 'Salade Cookies', 'Salad', 'Salt', 'Sashimi', 'Sauteed Mushrooms', 'Seaweed Soup', 'Seafood Pasta', 'Seafood Rice Bowls', 'Seafood Salad', 'Seasoned Butterfish', 'Seaweed Soup', 'Shrimp Burger Combo', 'Snow Cones', 'Spaghetti', 'Spring Rolls', 'Sushi', 'Tart', 'Tea', 'Tempura', 'Tomato Juice', 'Tomato Soup', 'Tortilla', 'Tropical Smoothie', 'Turkey Sandwich']
    },
    'Cooking - Sweet': {
      count: 69,
      emoji: '🍰',
      recipes: ['Apple Cookies', 'Baked Apples', 'Baked Potatoes', 'Banana Cookies', 'Banana Split', 'Blueberry Jam Cookies', 'Blueberries Smoothies', 'Bread', 'Butter', 'Candied Nut', 'Caramel Popcorn', 'Carrot Cake', 'Cherry Pie', 'Chestnut Cookies', 'Chocolate Chip Cookies', 'Chocolate Cookies', 'Chocolate Heart Cookies', 'Chocolates', 'Churros', 'Cinnamon Rolls', 'Citrus Tart', 'Coconut Cookies', 'Coconut Juice', 'Cookie Crumbles', 'Cookies', 'Copra Juice', 'Custard', 'Doughnut', 'Exotic Fruit Cookies', 'Fancy Cookies', 'Fruit Cupcakes', 'Fruit Sandwich', 'Fudge', 'Gingerbread House', 'Gingerbread Wall', 'Gingerbread Roof', 'Gingerbread Flooring', 'Gingerbread Door Plate', 'Graham Biscuits', 'Granola', 'Green Tea Cookies', 'Guacamole', 'Hamburger', 'Hash Brown', 'Herbal Cookies', 'Honey Toast', 'Honey Cookies', 'Jelly Bean', 'Jelly', 'Juice', 'Lemon Cookies', 'Lime Sherbet', 'Maple Cookies', 'Maple Leaf Cookies', 'Marmalade', 'Marshmallow Cookies', 'Milk', 'Mint Candy', 'Mixed Fruit Cookies', 'Mixed Juice', 'Mixed Smoothies', 'Mocha Cookies', 'Mochi', 'Molasses Cookies', 'Mushroom Cookies', 'Oatmeal Cookies', 'Orange Cookies', 'Orange Juice', 'Orange Tart']
    }
  };

  // Recipe sources
  const SOURCES = [
    {
      name: 'Villager Crafting',
      emoji: '🏠',
      description: 'Visit villagers at their homes when they\'re crafting. Up to 3 unique recipes per day from different personality types.',
      tips: 'Each villager personality gives recipes from their pool. Visit during daytime.',
      daily: true,
      limit: '3 unique'
    },
    {
      name: 'Message in a Bottle',
      emoji: '🍾',
      description: 'Check beaches for bottles with DIY recipes. One guaranteed per day.',
      tips: 'Always spawn near the north and south beach corners. Check daily!',
      daily: true,
      limit: '1 guaranteed'
    },
    {
      name: 'Balloon Presents',
      emoji: '🎈',
      description: 'Pop balloons floating over your island. Recipes vary by season and balloon color.',
      tips: 'Red balloons: tools & regular items. Yellow: regular items. Blue: regular items. Green (seasonal): seasonal recipes.',
      daily: false,
      limit: 'Variable'
    },
    {
      name: 'Nook\'s Cranny',
      emoji: '🏪',
      description: 'Purchase DIY recipes from the shop. Rotates daily.',
      tips: 'Always stock some recipes. Stock changes daily.',
      daily: true,
      limit: 'Variable'
    },
    {
      name: 'Nook Miles Exchange',
      emoji: '🏷️',
      description: 'Redeem Nook Miles for seasonal recipes and special DIY cards.',
      tips: 'Save your miles! Prices vary from 200-500 miles per recipe.',
      daily: false,
      limit: 'Variable'
    },
    {
      name: 'Celeste',
      emoji: '⭐',
      description: 'Visit Celeste on clear nights (no rain/snow) for zodiac, moon, and wand recipes.',
      tips: 'One recipe per visit. Zodiac recipes change monthly.',
      daily: false,
      limit: '1 per visit'
    },
    {
      name: 'Seasonal Events',
      emoji: '🎊',
      description: 'Special NPCs bring event-specific recipes: Zipper (Bunny Day), Jack (Halloween), Jingle (Toy Day), Franklin (Turkey Day).',
      tips: 'Events happen on specific dates each year.',
      daily: false,
      limit: 'Event specific'
    },
    {
      name: 'Pascal',
      emoji: '🐚',
      description: 'Give a scallop to Pascal for mermaid DIY recipes. Once per day.',
      tips: 'Appears on beach if you give him a scallop. Mermaid recipes only.',
      daily: true,
      limit: '1 per day'
    },
    {
      name: 'Snowboy',
      emoji: '⛄',
      description: 'Build perfect snowboys during winter (Dec-Feb) for frozen DIY recipes.',
      tips: 'Build a perfect snowboy for a recipe. Different recipe each day.',
      daily: true,
      limit: '1 per day'
    }
  ];

  // Seasonal timeline data
  const SEASONAL_TIMELINE = [
    { month: 'January', hemisphere: 'both', events: ['Snowflake recipes (Dec 11 - Feb 24)', 'Toy Day recipes (Dec 1 - Dec 25)'], window: 'Dec 11 - Feb 24' },
    { month: 'February', hemisphere: 'both', events: ['Snowflake recipes end (Feb 24)', 'Valentine recipes (Feb 1 - Feb 14)'] },
    { month: 'March', hemisphere: 'northern', events: ['Cherry Blossom recipes (Feb 25 - Apr 10)', 'Young Spring Bamboo (Mar 1 - May 31)'], window: 'Feb 25 - Apr 10' },
    { month: 'April', hemisphere: 'northern', events: ['Cherry Blossom recipes', 'Young Spring Bamboo recipes'] },
    { month: 'May', hemisphere: 'northern', events: ['Young Spring Bamboo continues', 'Summer Shell recipes start (May 22 - Sep 8)', 'Fishing Tourney (May 1 - May 31)'], window: 'May 22 - Sep 8' },
    { month: 'June', hemisphere: 'northern', events: ['Summer Shell recipes', 'Rattan recipes available'] },
    { month: 'July', hemisphere: 'northern', events: ['Summer Shell recipes continue', 'Bug-off event (Jul 1 - Jul 31)'] },
    { month: 'August', hemisphere: 'northern', events: ['Summer Shell recipes end (Sep 8)', 'Backyard Campfire cookout recipes'] },
    { month: 'September', hemisphere: 'northern', events: ['Acorn/Pine Cone recipes (Sep 1 - Dec 11)', 'Fall recipes begin'], window: 'Sep 1 - Dec 11' },
    { month: 'October', hemisphere: 'northern', events: ['Acorn/Pine Cone recipes', 'Spooky recipes (Oct 1 - Oct 31)', 'Fishing Tourney'], window: 'Oct 1 - Oct 31' },
    { month: 'November', hemisphere: 'northern', events: ['Acorn/Pine Cone recipes', 'Mushroom recipes (Nov 1 - Nov 30)', 'Turkey Day (Nov 1 - Nov 30)', 'Maple Leaf recipes (Oct 1 - Nov 30)'], window: 'Oct 1 - Nov 30' },
    { month: 'December', hemisphere: 'northern', events: ['Snowflake recipes (Dec 11 - Feb 24)', 'Toy Day recipes (Dec 1 - Dec 25)', 'Maple Leaf recipes end'], window: 'Dec 11 - Feb 24' }
  ];

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get('diyTracker');
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

  // Calculate stats whenever learned recipes change
  useEffect(() => {
    const percent = Math.round((learnedRecipes.size / stats.total) * 100);
    setStats(prev => ({
      ...prev,
      learned: learnedRecipes.size,
      percent
    }));
    // Persist to storage
    (async () => {
      try {
        await window.storage.set('diyTracker', JSON.stringify({ learned: Array.from(learnedRecipes) }));
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

  // Filter recipes based on search
  const getFilteredCategories = () => {
    if (!searchTerm) return DIY_CATEGORIES;
    const filtered = {};
    Object.entries(DIY_CATEGORIES).forEach(([cat, data]) => {
      const matchedRecipes = data.recipes.filter(r =>
        r.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchedRecipes.length > 0 || cat.toLowerCase().includes(searchTerm.toLowerCase())) {
        filtered[cat] = { ...data, recipes: matchedRecipes.length > 0 ? matchedRecipes : data.recipes };
      }
    });
    return filtered;
  };

  // Get category stats
  const getCategoryProgress = (category) => {
    const recipes = DIY_CATEGORIES[category].recipes;
    const learned = recipes.filter(r => learnedRecipes.has(r)).length;
    return { learned, total: recipes.length };
  };

  // Overall progress ring
  const progressPercent = stats.percent;
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
      color: '#5ec850',
      margin: 0
    },
    tabs: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      borderBottom: '1px solid rgba(94, 200, 80, 0.2)'
    },
    tabButton: {
      padding: '12px 20px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#5ec850',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      transition: 'all 0.3s ease'
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
      alignItems: 'center'
    },
    progressRing: {
      flex: '0 0 120px'
    },
    progressText: {
      textAlign: 'center',
      fontFamily: "'DM Mono', monospace",
      fontSize: '24px',
      fontWeight: 700,
      color: '#5ec850',
      margin: '0'
    },
    progressSubtext: {
      textAlign: 'center',
      fontSize: '12px',
      color: '#5ec850',
      margin: '4px 0 0 0'
    },
    statsContent: {
      flex: 1
    },
    statItem: {
      marginBottom: '8px',
      fontSize: '14px'
    },
    statLabel: {
      color: '#5ec850',
      fontWeight: 500
    },
    statValue: {
      color: '#5ec850',
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
      fontSize: '14px'
    },
    categoryCard: {
      marginBottom: '12px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '8px',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    },
    categoryHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      cursor: 'pointer',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      transition: 'background-color 0.3s ease'
    },
    categoryHeaderHover: {
      backgroundColor: 'rgba(94, 200, 80, 0.1)'
    },
    categoryTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flex: 1,
      margin: 0,
      fontSize: '16px',
      fontWeight: 600,
      color: '#5ec850'
    },
    categoryCount: {
      fontSize: '13px',
      color: '#5ec850',
      fontFamily: "'DM Mono', monospace"
    },
    progressBar: {
      width: '100px',
      height: '6px',
      backgroundColor: 'rgba(94, 200, 80, 0.1)',
      borderRadius: '3px',
      overflow: 'hidden',
      marginRight: '12px'
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#5ec850',
      transition: 'width 0.3s ease'
    },
    expandIcon: {
      fontSize: '16px',
      color: '#5ec850',
      transition: 'transform 0.3s ease'
    },
    categoryContent: {
      padding: '16px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderTop: '1px solid rgba(94, 200, 80, 0.1)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '8px'
    },
    recipeItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px',
      backgroundColor: 'rgba(12, 28, 14, 0.6)',
      border: '1px solid rgba(94, 200, 80, 0.15)',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '13px'
    },
    recipeItemHover: {
      backgroundColor: 'rgba(94, 200, 80, 0.15)',
      borderColor: 'rgba(94, 200, 80, 0.4)'
    },
    checkbox: {
      width: '16px',
      height: '16px',
      cursor: 'pointer',
      accentColor: '#5ec850'
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
    sourceEmoji: {
      fontSize: '20px'
    },
    sourceDesc: {
      fontSize: '13px',
      color: '#5a7a50',
      marginBottom: '8px',
      lineHeight: 1.5
    },
    sourceTips: {
      fontSize: '12px',
      color: '#4aacf0',
      padding: '8px',
      backgroundColor: 'rgba(156, 204, 101, 0.1)',
      borderRadius: '4px',
      marginBottom: '8px',
      borderLeft: '3px solid #9ccc65'
    },
    sourceMeta: {
      display: 'flex',
      gap: '16px',
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
    seasonHighlight: {
      color: '#d4b030',
      fontWeight: 700
    },
    seasonMonth: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#d4b030',
      marginBottom: '8px'
    },
    seasonEvent: {
      fontSize: '13px',
      color: '#5a7a50',
      marginBottom: '4px',
      paddingLeft: '12px',
      borderLeft: '2px solid rgba(94, 200, 80, 0.3)'
    },
    hemisphereToggle: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px'
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
      color: '#5ec850',
      fontSize: '14px'
    }
  };

  const filteredCategories = getFilteredCategories();

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input:focus { outline: none; border-color: #5ec850 !important; }
      `}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>🎀 DIY Recipe Tracker</h1>
        <p style={styles.subtitle}>Track your ACNH DIY recipe collection</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'category', label: 'By Category' },
          { id: 'source', label: 'By Source' },
          { id: 'seasonal', label: 'Seasonal Guide' }
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
          <div style={styles.progressRing}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(94, 200, 80, 0.1)" strokeWidth="4" />
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke="#5ec850"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <p style={styles.progressText}>{progressPercent}%</p>
            <p style={styles.progressSubtext}>{stats.learned} / {stats.total}</p>
          </div>
          <div style={styles.statsContent}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total Learned: </span>
              <span style={styles.statValue}>{stats.learned}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Remaining: </span>
              <span style={styles.statValue}>{stats.total - stats.learned}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Categories: </span>
              <span style={styles.statValue}>{Object.keys(DIY_CATEGORIES).length}</span>
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
              const progressPercent = (learned / total) * 100;

              return (
                <div key={category} style={styles.categoryCard}>
                  <div
                    style={styles.categoryHeader}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(94, 200, 80, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(12, 28, 14, 0.95)'}
                    onClick={() => toggleCategory(category)}
                  >
                    <h3 style={styles.categoryTitle}>
                      <span>{data.emoji}</span>
                      <span>{category}</span>
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={styles.progressBar}>
                        <div
                          style={{ ...styles.progressBarFill, width: `${progressPercent}%` }}
                        />
                      </div>
                      <div style={styles.categoryCount}>
                        {learned}/{total}
                      </div>
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
                      {data.recipes.map(recipe => (
                        <div
                          key={recipe}
                          style={styles.recipeItem}
                          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.recipeItemHover)}
                          onMouseLeave={(e) => Object.assign(e.currentTarget.style, { backgroundColor: 'rgba(12, 28, 14, 0.6)', borderColor: 'rgba(94, 200, 80, 0.15)' })}
                        >
                          <input
                            type="checkbox"
                            checked={learnedRecipes.has(recipe)}
                            onChange={() => toggleRecipeLearned(recipe)}
                            style={styles.checkbox}
                          />
                          <AssetImg category="recipes" name={recipe} size={24} />
                          <span style={{ textDecoration: learnedRecipes.has(recipe) ? 'line-through' : 'none' }}>
                            {recipe}
                          </span>
                        </div>
                      ))}
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
                <span style={styles.sourceEmoji}>{source.emoji}</span>
                {source.name}
              </h3>
              <p style={styles.sourceDesc}>{source.description}</p>
              <div style={styles.sourceTips}>
                💡 {source.tips}
              </div>
              <div style={styles.sourceMeta}>
                <div style={styles.sourceMetaItem}>
                  <span style={styles.sourceLabel}>Daily: </span>
                  {source.daily ? '✓ Yes' : '✗ No'}
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

          <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'rgba(94, 200, 80, 0.1)', borderRadius: '8px', borderLeft: '3px solid #5ec850' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#5a7a50' }}>
              📅 Seasonal recipes change monthly. Balloons are your best source for limited-time DIYs!
            </p>
          </div>

          {SEASONAL_TIMELINE.map((season, idx) => (
            <div key={idx} style={styles.seasonCard}>
              <div style={styles.seasonMonth}>{season.month}</div>
              {season.events.map((event, i) => (
                <div key={i} style={styles.seasonEvent}>
                  {event}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DIYRecipeTracker;
