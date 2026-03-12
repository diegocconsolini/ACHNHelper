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
// Note: 'Image' is a catch-all substring — must be LAST
const ICON_PRIORITY = [
  'Icon Image',
  'Critterpedia Image',
  'Album Image',
  'Furniture Image',
  'Inventory Image',
  'Photo Image',
  'Framed Image',
  'Image',
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
 *   src       — direct src URL (bypasses manifest lookup)
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
