export const characters = {
  isabelle: {
    id: 'isabelle',
    name: 'Isabelle',
    role: 'Resident Services',
    voice: 'cheerful, encouraging, occasionally sleepy',
    portraits: {
      welcome:  '/island/characters/isabelle-welcome.webp',
      thinking: '/island/characters/isabelle-thinking.webp',
    },
    defaultMood: 'welcome',
  },
  'tom-nook': {
    id: 'tom-nook',
    name: 'Tom Nook',
    role: "Nook's Cranny shopkeeper",
    voice: 'shrewd, paternal, fond of phrases like "yes yes"',
    portraits: { counting: '/island/characters/tom-nook-counting.webp' },
    defaultMood: 'counting',
  },
  blathers: {
    id: 'blathers',
    name: 'Blathers',
    role: 'Museum curator',
    voice: 'verbose, scholarly, terrified of bugs',
    portraits: { reading: '/island/characters/blathers-reading.webp' },
    defaultMood: 'reading',
  },
  'kk-slider': {
    id: 'kk-slider',
    name: 'K.K. Slider',
    role: 'Travelling musician',
    voice: 'mellow, philosophical, says "hit it"',
    portraits: { strumming: '/island/characters/kk-slider-strumming.webp' },
    defaultMood: 'strumming',
  },
  celeste: {
    id: 'celeste',
    name: 'Celeste',
    role: "Astronomer (Blathers' sister)",
    voice: 'whimsical, dreamy, gushes about constellations',
    portraits: { stargazing: '/island/characters/celeste-stargazing.webp' },
    defaultMood: 'stargazing',
  },
  'daisy-mae': {
    id: 'daisy-mae',
    name: 'Daisy Mae',
    role: 'Sunday turnip merchant',
    voice: 'cheerful southern drawl, calls turnips "stalks"',
    portraits: { cart: '/island/characters/daisy-mae-cart.webp' },
    defaultMood: 'cart',
  },
  'tommy-timmy': {
    id: 'tommy-timmy',
    name: 'Timmy & Tommy',
    role: "Nook's Cranny clerks",
    voice: 'enthusiastic, finish each other’s sentences',
    portraits: { counter: '/island/characters/tommy-timmy-counter.webp' },
    defaultMood: 'counter',
  },
  cj: {
    id: 'cj',
    name: 'C.J.',
    role: 'Travelling fisherman',
    voice: 'pumped-up, calls every fish "MAJESTIC"',
    portraits: { fisherman: '/island/characters/cj-fisherman.webp' },
    defaultMood: 'fisherman',
  },
  flick: {
    id: 'flick',
    name: 'Flick',
    role: 'Travelling bug-hunter and sculptor',
    voice: 'theatrical, considers every bug an art piece',
    portraits: { camp: '/island/characters/flick-camp.webp' },
    defaultMood: 'camp',
  },
  leif: {
    id: 'leif',
    name: 'Leif',
    role: 'Sloth gardener',
    voice: 'mellow, slow, fond of puns',
    portraits: { garden: '/island/characters/leif-garden.webp' },
    defaultMood: 'garden',
  },
  cyrus: {
    id: 'cyrus',
    name: 'Cyrus',
    role: 'Workbench customizer',
    voice: 'gruff but warm, tradesman pride',
    portraits: { workbench: '/island/characters/cyrus-workbench.webp' },
    defaultMood: 'workbench',
  },
};

export function getCharacter(id) {
  const c = characters[id];
  if (!c) throw new Error(`Unknown character: ${id}`);
  return c;
}

export function getPortrait(id, mood) {
  const c = getCharacter(id);
  const m = mood || c.defaultMood;
  const url = c.portraits[m];
  if (!url) throw new Error(`Character ${id} has no mood "${m}"`);
  return url;
}
