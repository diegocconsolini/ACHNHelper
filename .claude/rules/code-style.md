---
paths: src/**/*.jsx, src/**/*.js, app/**/*.jsx, app/**/*.js
---

# Code Style Rules

## Inline Styles Only
- No CSS files, no Tailwind, no styled-components
- All styling via JavaScript objects: `style={{ color: '#5ec850' }}`
- No duplicate `style` props — use spread: `style={{ ...styles.base, ...styles.active }}`

## Hover/Interactive Styles
- Use `border` shorthand in hover styles (NOT `borderColor` alone)
- Use specific `transition` properties: `transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease'`
- NEVER use `transition: 'all'`
- Add `outline: 'none'` to ALL `<button>` and `<select>` elements
- Use React state for hover (NOT `e.currentTarget.style.*` DOM manipulation)

## Component Rules
- `'use client'` directive on ALL `.jsx` files with React hooks
- Pure data modules (`.js`) do NOT need `'use client'`
- One default export per artifact
- No props on root artifact component
- Static data arrays at MODULE scope (not inside component function)

## Storage
- Use `window.storage` API (NOT localStorage directly)
- Pattern: `await window.storage.set('key', JSON.stringify(value))`
- Pattern: `const result = await window.storage.get('key'); const data = result ? JSON.parse(result.value) : default`

## No Width Constraints
- NEVER add `maxWidth` or `margin: '0 auto'` to artifact root containers
- Artifacts fill the full available width of the portal content area
