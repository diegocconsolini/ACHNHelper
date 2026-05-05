// PWA manifest — installable as a standalone app on iOS/Android/desktop.
// Icons are inline SVG data URIs so we don't need separate image files;
// browsers render them at the requested sizes for the home-screen badge.

const ICON_SVG = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%230a1a10'/><text x='50' y='72' font-size='64' text-anchor='middle'>🏝️</text></svg>";

export default function manifest() {
  return {
    name: 'ACNH Helper Suite',
    short_name: 'ACNH Helper',
    description: '40 interactive tools for Animal Crossing: New Horizons',
    start_url: '/app',
    display: 'standalone',
    background_color: '#0a1a10',
    theme_color: '#0a1a10',
    orientation: 'any',
    icons: [
      { src: ICON_SVG, sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
      { src: ICON_SVG, sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
    ],
    categories: ['games', 'utilities'],
  };
}
