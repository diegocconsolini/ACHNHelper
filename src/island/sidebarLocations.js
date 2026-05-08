// Maps the 6 painted areas of public/island/sidebar-map.webp to MENU
// category names from src/App.jsx. menuCategories is a list because some
// painted areas absorb multiple flat-list categories.
//
// Coordinates are percentages of the sidebar-map image. They were measured
// against u2566145224_Top-down_..._119b11c0..._1.png after upscale.
export const sidebarLocations = [
  {
    id: 'critterpedia',
    label: 'The Dock',
    sublabel: 'Fish, bugs, sea creatures',
    menuCategories: ['🐟 Critterpedia'],
    host: 'isabelle',
    xPct: 50,
    yPct: 6,
    wPct: 70,
    hPct: 8,
  },
  {
    id: 'museum',
    label: 'The Museum',
    sublabel: "Blathers' notebook",
    menuCategories: ['🏛️ Museum & Progress'],
    host: 'blathers',
    xPct: 38,
    yPct: 18,
    wPct: 42,
    hPct: 10,
  },
  {
    id: 'economy',
    label: "Nook's Cranny",
    sublabel: 'Bells, turnips, store',
    menuCategories: ['💰 Economy & Planning'],
    host: 'tom-nook',
    xPct: 64,
    yPct: 30,
    wPct: 42,
    hPct: 10,
  },
  {
    id: 'gardening',
    label: 'The Garden',
    sublabel: 'Flowers + breeding',
    menuCategories: ['🌸 Gardening'],
    host: 'isabelle',
    xPct: 56,
    yPct: 50,
    wPct: 50,
    hPct: 10,
  },
  {
    id: 'art',
    label: 'Able Sisters',
    sublabel: 'Art, K.K., catalog',
    menuCategories: ['🎨 Special & Art', '📦 Catalog'],
    host: 'celeste',
    xPct: 36,
    yPct: 64,
    wPct: 50,
    hPct: 10,
  },
  {
    id: 'island-life',
    label: 'Resident Services',
    sublabel: 'Dashboard, villagers, events',
    menuCategories: ['📊 Dashboard', '🏠 Island Life', '⚙️ Settings'],
    host: 'isabelle',
    xPct: 50,
    yPct: 84,
    wPct: 60,
    hPct: 12,
  },
];

export function locationForCategory(category) {
  return sidebarLocations.find((l) => l.menuCategories.includes(category));
}

export function locationForToolId(menu, toolId) {
  for (const group of menu) {
    if (group.items.some((i) => i.id === toolId)) {
      return locationForCategory(group.category);
    }
  }
  return null;
}

export function itemsForLocation(menu, locationId) {
  const loc = sidebarLocations.find((l) => l.id === locationId);
  if (!loc) return [];
  const items = [];
  for (const group of menu) {
    if (loc.menuCategories.includes(group.category)) {
      items.push(...group.items);
    }
  }
  return items;
}
