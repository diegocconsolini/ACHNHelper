---
paths: src/**/*.jsx, app/**/*.jsx
---

# ACNH Design System

## Colors
- Background: `#0a1a10`
- Cards: `rgba(12,28,14,0.95)`
- Green accent: `#5ec850`
- Gold accent: `#d4b030`
- Blue accent: `#4aacf0`
- Text primary: `#c8e6c0`
- Text muted: `#5a7a50`
- Borders: `rgba(94,200,80,0.1)`
- Error/destructive: `#ff6464`

## Typography
- Headers: `'Playfair Display', serif` — weights 700, 900
- Body: `'DM Sans', sans-serif` — weights 400, 500, 700
- Data/Monospace: `'DM Mono', monospace` — weights 400, 500

## Google Fonts
Every artifact needs its own `<style>` tag:
```jsx
<style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`}</style>
```

## Required
- All 3 accent colors (green, gold, blue) should appear in each artifact
- All 3 fonts used in each artifact
- Hover states on all interactive cards
- Smooth fade-in animations on tab/section changes
