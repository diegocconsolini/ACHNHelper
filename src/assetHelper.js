/**
 * Asset Helper — resolves game asset paths with emoji fallback.
 *
 * Assets live in public/assets/<category>/<item-name>/<ImageType>.png
 * The manifest at public/assets/manifest.json maps every category → item → files.
 *
 * Usage:
 *   import { getAssetPath, getIconPath, preloadAsset } from './assetHelper';
 *
 *   // Get specific image type
 *   getAssetPath('fish', 'anchovy', 'Icon Image')
 *   // → "/assets/fish/anchovy/Icon Image.png"
 *
 *   // Get best icon (prefers Icon Image > Critterpedia Image > Image > first file)
 *   getIconPath('villagers', 'Raymond')
 *   // → "/assets/villagers/Raymond/Icon Image.png"
 */

const BASE = '/assets';

// Preferred image type priority for icons
const ICON_PRIORITY = [
  'Icon Image',
  'Critterpedia Image',
  'Album Image',
  'Image',
  'Furniture Image',
];

/**
 * Get the asset path for a specific item and image type.
 * @param {string} category - e.g. 'fish', 'villagers', 'art'
 * @param {string} itemName - e.g. 'anchovy', 'Raymond', 'academic painting'
 * @param {string} imageType - e.g. 'Icon Image', 'Critterpedia Image', 'Album Image'
 * @param {string} [variant] - optional variant subfolder e.g. 'Pink', 'Blue'
 * @returns {string} asset URL path
 */
export function getAssetPath(category, itemName, imageType = 'Icon Image', variant) {
  if (variant) {
    return `${BASE}/${category}/${itemName}/${variant}/${imageType}.png`;
  }
  return `${BASE}/${category}/${itemName}/${imageType}.png`;
}

/**
 * Get the best available icon path for an item, checking priority order.
 * Falls back to the first available file in the manifest.
 * @param {string} category
 * @param {string} itemName
 * @param {object} [manifest] - optional loaded manifest for lookup
 * @returns {string} asset URL path
 */
export function getIconPath(category, itemName, manifest) {
  if (manifest && manifest[category] && manifest[category][itemName]) {
    const files = manifest[category][itemName];
    // Try each priority in order
    for (const pref of ICON_PRIORITY) {
      const match = files.find(f => f.includes(`${pref}.png`));
      if (match) return `${BASE}/${match}`;
    }
    // Fallback: first file
    if (files.length > 0) return `${BASE}/${files[0]}`;
  }
  // Without manifest, guess Icon Image
  return getAssetPath(category, itemName, 'Icon Image');
}

/**
 * Asset-aware image component helper.
 * Returns props for an <img> tag with error fallback to emoji.
 * @param {string} src - asset path
 * @param {string} alt - alt text
 * @param {string} fallbackEmoji - emoji to show if image fails
 * @param {object} [style] - optional inline styles
 * @returns {object} props for rendering
 */
export function assetImgProps(src, alt, fallbackEmoji = '❓', style = {}) {
  return {
    src,
    alt,
    style: { objectFit: 'contain', ...style },
    onError: (e) => {
      e.target.style.display = 'none';
      const span = document.createElement('span');
      span.textContent = fallbackEmoji;
      span.style.fontSize = style.width || '32px';
      e.target.parentNode.insertBefore(span, e.target);
    },
  };
}

/**
 * Preload an image to warm the browser cache.
 * @param {string} src - asset path
 * @returns {Promise<void>}
 */
export function preloadAsset(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Category mapping to help artifacts find their assets.
 * Maps artifact data categories to asset directory names.
 */
export const CATEGORY_MAP = {
  // Critterpedia
  fish: 'fish',
  bugs: 'insects',
  'sea-creatures': 'sea-creatures',
  // Museum
  fossils: 'fossils',
  art: 'art',
  // Economy & Items
  music: 'music',
  recipes: 'recipes',
  tools: 'tools',
  // Island Life
  villagers: 'villagers',
  npcs: 'special-npcs',
  reactions: 'reactions',
  // Furniture & Decor
  housewares: 'housewares',
  wallpaper: 'wallpaper',
  floors: 'floors',
  rugs: 'rugs',
  fencing: 'fencing',
  // Clothing
  tops: 'tops',
  bottoms: 'bottoms',
  'dress-up': 'dress-up',
  headwear: 'headwear',
  accessories: 'accessories',
  bags: 'bags',
  shoes: 'shoes',
  socks: 'socks',
  umbrellas: 'umbrellas',
  // Other
  photos: 'photos',
  posters: 'posters',
  construction: 'construction',
  'wall-mounted': 'wall-mounted',
  'clothing-other': 'clothing-other',
  miscellaneous: 'miscellaneous',
  other: 'other',
  'message-cards': 'message-cards',
  'nook-shopping-seasonal': 'nook-shopping-seasonal',
};
