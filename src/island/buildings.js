// Buildings positioned on a 1000x600 SVG canvas (top-down view).
// (x, y) = top-left corner of the building shape; w/h = bounding box.

export const BUILDINGS = [
  {
    id: 'resident-services',
    label: 'Resident Services',
    x: 420, y: 230, w: 180, h: 130,
    color: '#a3d9a5',
    route: '/app',
    sprite: { category: 'npcs', name: 'Isabelle' },
  },
  {
    id: 'museum',
    label: 'Museum',
    x: 130, y: 130, w: 200, h: 160,
    color: '#7a8b9a',
    route: '/app',
    sprite: { category: 'npcs', name: 'Blathers' },
  },
  {
    id: 'nooks-cranny',
    label: "Nook's Cranny",
    x: 720, y: 180, w: 170, h: 130,
    color: '#d97a4a',
    route: '/app',
    sprite: { category: 'npcs', name: 'Tom Nook' },
  },
  {
    id: 'garden',
    label: 'Garden plot',
    x: 200, y: 410, w: 180, h: 110,
    color: '#e85a8a',
    route: '/app',
    sprite: { category: 'other', name: 'blue-rose plant' },
  },
  {
    id: 'able-sisters',
    label: 'Able Sisters',
    x: 460, y: 410, w: 160, h: 120,
    color: '#e85a5a',
    route: '/app',
    sprite: { category: 'npcs', name: 'Mabel' },
  },
  {
    id: 'campsite',
    label: 'Campsite',
    x: 700, y: 410, w: 180, h: 120,
    color: '#d4b030',
    route: '/app',
    sprite: { category: 'villagers', name: 'Raymond' },
  },
];
