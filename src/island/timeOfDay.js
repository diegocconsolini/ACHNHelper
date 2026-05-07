import { tokens } from '../design/tokens.js';

const palettes = {
  dawn:   { name: 'dawn',   top: '#f4a261', bottom: '#e9c46a', sun: '#f1d9a0' },
  day:    { name: 'day',    top: tokens.color.skyDay, bottom: '#cfe8f0', sun: '#fff5cc' },
  sunset: { name: 'sunset', top: '#d97a4a', bottom: tokens.color.skySunset, sun: '#ff8c52' },
  night:  { name: 'night',  top: tokens.color.skyNight, bottom: '#2a3a5a', sun: '#e8e8ff' },
};

export function skyPalette(hour) {
  const h = Number.isFinite(hour) ? Math.floor(hour) : 0;
  if (h >= 5 && h < 8) return palettes.dawn;
  if (h >= 8 && h < 17) return palettes.day;
  if (h >= 17 && h < 20) return palettes.sunset;
  return palettes.night;
}
