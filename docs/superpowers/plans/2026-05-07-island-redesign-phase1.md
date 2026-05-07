# Island Redesign — Phase 1: Design System Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the design-token foundation and 4 base components (`Button`, `Dialog`, `Card`, `PaperPanel`) that all subsequent phases depend on, plus a dev-only `/design` showcase route for visual review.

**Architecture:** Token-driven design system. A single `src/design/tokens.js` exports color/font/spacing/radius/shadow values. Components in `src/design/components/` consume tokens, never hard-code values. Components are inline-style React (matching project convention — no CSS files, no Tailwind). Each component is one file, one default export, fully self-contained. The `/design` route is gated behind `process.env.NODE_ENV === 'development'` and is not linked from the public app.

**Tech Stack:** React 19.2, Next.js 16 App Router, inline styles only, Vitest 4, no new dependencies (Patrick Hand font via existing `@import` pattern).

**Spec reference:** `docs/superpowers/specs/2026-05-07-island-redesign-design.md`

---

## File structure

**Created:**
- `src/design/tokens.js` — design tokens (color, font, radius, shadow, spacing)
- `src/design/components/Button.jsx` — primary/secondary/ghost button variants
- `src/design/components/Dialog.jsx` — speech-bubble modal dialog (replaces ConfirmModal/AlertModal call sites in Phase 3)
- `src/design/components/Card.jsx` — paper-textured panel with optional header/footer slots
- `src/design/components/PaperPanel.jsx` — generic paper-textured container (lower-level than Card)
- `src/design/textures/paper-light.svg` — subtle paper grain SVG
- `src/design/textures/paper-dark.svg` — darker paper variant
- `src/design/textures/wood-grain.svg` — wood texture for buttons/signs
- `app/design/page.jsx` — dev-only showcase route
- `tests/design/tokens.test.js` — token shape + structure tests
- `tests/design/Button.test.jsx` — button render + interaction tests
- `tests/design/Dialog.test.jsx` — dialog render + close behavior tests

**Modified:**
- `package.json` — no version bump in this phase

**Not touched in Phase 1:** No existing app components, no migration of `ConfirmModal`/`AlertModal` (those happen in Phase 3), no changes to `App.jsx`, `LandingPage.jsx`, or any artifact.

---

## Task 1: Design tokens module

**Files:**
- Create: `src/design/tokens.js`
- Test: `tests/design/tokens.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/design/tokens.test.js
import { describe, it, expect } from 'vitest';
import { tokens } from '../../src/design/tokens.js';

describe('design tokens', () => {
  it('exports all required color groups', () => {
    expect(tokens.color).toBeDefined();
    expect(tokens.color.skyDay).toMatch(/^#[0-9a-f]{6}$/i);
    expect(tokens.color.grass).toMatch(/^#[0-9a-f]{6}$/i);
    expect(tokens.color.paper).toMatch(/^#[0-9a-f]{6}$/i);
    expect(tokens.color.ink).toMatch(/^#[0-9a-f]{6}$/i);
    expect(tokens.color.accentLeaf).toBe('#5ec850');
    expect(tokens.color.accentBell).toBe('#d4b030');
    expect(tokens.color.accentSky).toBe('#4aacf0');
  });

  it('exports font stacks with fallbacks', () => {
    expect(tokens.font.display).toContain('serif');
    expect(tokens.font.body).toContain('sans-serif');
    expect(tokens.font.handwriting).toContain('cursive');
    expect(tokens.font.mono).toContain('monospace');
  });

  it('exports radius scale', () => {
    expect(tokens.radius.sm).toBe(6);
    expect(tokens.radius.md).toBe(12);
    expect(tokens.radius.lg).toBe(24);
    expect(tokens.radius.pill).toBe(999);
  });

  it('exports shadow recipes', () => {
    expect(tokens.shadow.paper).toContain('rgba');
    expect(tokens.shadow.sign).toContain('rgba');
  });

  it('exports spacing scale', () => {
    expect(tokens.space[0]).toBe(0);
    expect(tokens.space[4]).toBe(16);
    expect(tokens.space[8]).toBe(32);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/design/tokens.test.js`
Expected: FAIL — `Cannot find module '../../src/design/tokens.js'`

- [ ] **Step 3: Implement tokens module**

```js
// src/design/tokens.js
export const tokens = {
  color: {
    skyDay:    '#86c5da',
    skySunset: '#f4a261',
    skyNight:  '#1a2845',
    water:     '#5b9bd5',
    grass:     '#7fb069',
    grassDark: '#5a8050',
    sand:      '#f1d9a0',
    path:      '#c9a875',
    wood:      '#a87850',
    woodDark:  '#704830',
    paper:     '#fef6e4',
    paperDark: '#f0e6c8',
    ink:       '#3a2a1a',
    inkSoft:   '#5a4a3a',
    accentLeaf:  '#5ec850',
    accentBell:  '#d4b030',
    accentSky:   '#4aacf0',
    accentBerry: '#e85a5a',
  },
  font: {
    display:     "'Fink Heavy', 'Playfair Display', serif",
    body:        "'Humming', 'DM Sans', sans-serif",
    handwriting: "'Patrick Hand', cursive",
    mono:        "'DM Mono', monospace",
  },
  radius: { sm: 6, md: 12, lg: 24, pill: 999 },
  shadow: {
    paper: '0 2px 8px rgba(58, 42, 26, 0.12), 0 1px 2px rgba(58, 42, 26, 0.08)',
    sign:  '4px 6px 12px rgba(58, 42, 26, 0.25)',
    inset: 'inset 0 1px 2px rgba(58, 42, 26, 0.15)',
  },
  space: [0, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64],
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/design/tokens.test.js`
Expected: PASS — 5 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/design/tokens.js tests/design/tokens.test.js
git commit -m "feat(design): design tokens module (#<phase1-tokens-issue>)"
```

---

## Task 2: Paper texture SVGs

**Files:**
- Create: `src/design/textures/paper-light.svg`
- Create: `src/design/textures/paper-dark.svg`
- Create: `src/design/textures/wood-grain.svg`

- [ ] **Step 1: Create paper-light SVG**

```svg
<!-- src/design/textures/paper-light.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <filter id="paper">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3"/>
      <feColorMatrix values="0 0 0 0 0.98  0 0 0 0 0.93  0 0 0 0 0.78  0 0 0 0.18 0"/>
    </filter>
  </defs>
  <rect width="200" height="200" fill="#fef6e4"/>
  <rect width="200" height="200" filter="url(#paper)"/>
</svg>
```

- [ ] **Step 2: Create paper-dark SVG**

```svg
<!-- src/design/textures/paper-dark.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <filter id="paperdark">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/>
      <feColorMatrix values="0 0 0 0 0.94  0 0 0 0 0.90  0 0 0 0 0.78  0 0 0 0.22 0"/>
    </filter>
  </defs>
  <rect width="200" height="200" fill="#f0e6c8"/>
  <rect width="200" height="200" filter="url(#paperdark)"/>
</svg>
```

- [ ] **Step 3: Create wood-grain SVG**

```svg
<!-- src/design/textures/wood-grain.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80">
  <defs>
    <filter id="wood">
      <feTurbulence type="turbulence" baseFrequency="0.04 0.5" numOctaves="3" seed="5"/>
      <feColorMatrix values="0 0 0 0 0.66  0 0 0 0 0.47  0 0 0 0 0.31  0 0 0 0.35 0"/>
    </filter>
  </defs>
  <rect width="200" height="80" fill="#a87850"/>
  <rect width="200" height="80" filter="url(#wood)"/>
</svg>
```

- [ ] **Step 4: Verify SVGs render in a browser**

Open each file directly in a browser via `file://`. Each should show a textured rectangle (not transparent, not a single solid color).

- [ ] **Step 5: Commit**

```bash
git add src/design/textures/
git commit -m "feat(design): paper + wood texture SVGs (#<phase1-textures-issue>)"
```

---

## Task 3: Button component

**Files:**
- Create: `src/design/components/Button.jsx`
- Test: `tests/design/Button.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// tests/design/Button.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../src/design/components/Button.jsx';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Press</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies variant prop to data-attr for testing', () => {
    render(<Button variant="secondary">X</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'secondary');
  });

  it('defaults variant to primary', () => {
    render(<Button>X</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'primary');
  });
});
```

- [ ] **Step 2: Verify the project has React Testing Library**

Run: `cat package.json | grep -E "testing-library|jsdom"`
Expected: see `@testing-library/react`. If missing, run:

```bash
npm install -D @testing-library/react @testing-library/jest-dom jsdom
```

Then add to `vitest.config.js`:
```js
test: { environment: 'jsdom' }
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- tests/design/Button.test.jsx`
Expected: FAIL — `Cannot find module '../../src/design/components/Button.jsx'`

- [ ] **Step 4: Implement Button**

```jsx
// src/design/components/Button.jsx
'use client';

import { useState } from 'react';
import { tokens } from '../tokens.js';

const variants = {
  primary: {
    background: tokens.color.accentLeaf,
    color: tokens.color.paper,
    border: `2px solid ${tokens.color.grassDark}`,
  },
  secondary: {
    background: tokens.color.paper,
    color: tokens.color.ink,
    border: `2px solid ${tokens.color.wood}`,
  },
  ghost: {
    background: 'transparent',
    color: tokens.color.ink,
    border: '2px solid transparent',
  },
};

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  type = 'button',
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const v = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-variant={variant}
      style={{
        ...v,
        padding: '10px 20px',
        borderRadius: tokens.radius.pill,
        fontFamily: tokens.font.body,
        fontSize: 15,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        outline: 'none',
        boxShadow: hover && !disabled ? tokens.shadow.paper : 'none',
        transform: hover && !disabled ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- tests/design/Button.test.jsx`
Expected: PASS — 5 tests passing.

- [ ] **Step 6: Commit**

```bash
git add src/design/components/Button.jsx tests/design/Button.test.jsx
git commit -m "feat(design): Button component (#<phase1-button-issue>)"
```

---

## Task 4: PaperPanel component

**Files:**
- Create: `src/design/components/PaperPanel.jsx`

- [ ] **Step 1: Implement PaperPanel**

```jsx
// src/design/components/PaperPanel.jsx
'use client';

import { tokens } from '../tokens.js';

export default function PaperPanel({
  children,
  variant = 'light',  // 'light' | 'dark'
  padding = 16,
  style,
  ...rest
}) {
  const bg = variant === 'dark' ? tokens.color.paperDark : tokens.color.paper;
  const texture = variant === 'dark'
    ? '/design/textures/paper-dark.svg'
    : '/design/textures/paper-light.svg';

  return (
    <div
      style={{
        backgroundColor: bg,
        backgroundImage: `url(${texture})`,
        backgroundSize: '200px 200px',
        borderRadius: tokens.radius.md,
        padding,
        boxShadow: tokens.shadow.paper,
        color: tokens.color.ink,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Move texture SVGs into public for Next.js to serve**

The texture URLs reference `/design/textures/...` which must resolve from `public/`. Move:

```bash
mkdir -p public/design/textures
git mv src/design/textures/paper-light.svg public/design/textures/paper-light.svg
git mv src/design/textures/paper-dark.svg public/design/textures/paper-dark.svg
git mv src/design/textures/wood-grain.svg public/design/textures/wood-grain.svg
```

- [ ] **Step 3: Verify with `npm run build`**

Run: `npm run build`
Expected: build succeeds, no errors about missing modules.

- [ ] **Step 4: Commit**

```bash
git add src/design/components/PaperPanel.jsx public/design/textures/
git commit -m "feat(design): PaperPanel + move textures to public (#<phase1-paperpanel-issue>)"
```

---

## Task 5: Card component

**Files:**
- Create: `src/design/components/Card.jsx`

- [ ] **Step 1: Implement Card**

```jsx
// src/design/components/Card.jsx
'use client';

import { tokens } from '../tokens.js';
import PaperPanel from './PaperPanel.jsx';

export default function Card({
  children,
  header,
  footer,
  variant = 'light',
  padding = 16,
  style,
  ...rest
}) {
  return (
    <PaperPanel variant={variant} padding={0} style={{ overflow: 'hidden', ...style }} {...rest}>
      {header && (
        <div
          style={{
            padding: `${padding}px ${padding}px 8px`,
            fontFamily: tokens.font.display,
            fontSize: 18,
            fontWeight: 700,
            color: tokens.color.ink,
            borderBottom: `1px dashed ${tokens.color.wood}`,
          }}
        >
          {header}
        </div>
      )}
      <div style={{ padding }}>{children}</div>
      {footer && (
        <div
          style={{
            padding: `8px ${padding}px ${padding}px`,
            fontFamily: tokens.font.body,
            fontSize: 13,
            color: tokens.color.inkSoft,
            borderTop: `1px dashed ${tokens.color.wood}`,
          }}
        >
          {footer}
        </div>
      )}
    </PaperPanel>
  );
}
```

- [ ] **Step 2: Verify import + build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/design/components/Card.jsx
git commit -m "feat(design): Card component (#<phase1-card-issue>)"
```

---

## Task 6: Dialog component

**Files:**
- Create: `src/design/components/Dialog.jsx`
- Test: `tests/design/Dialog.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// tests/design/Dialog.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dialog from '../../src/design/components/Dialog.jsx';

describe('Dialog', () => {
  it('renders children when open', () => {
    render(<Dialog open onClose={() => {}}>Hello</Dialog>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Dialog open={false} onClose={() => {}}>Hello</Dialog>);
    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose}>X</Dialog>);
    fireEvent.click(screen.getByTestId('dialog-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when dialog body is clicked', () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose}>X</Dialog>);
    fireEvent.click(screen.getByTestId('dialog-body'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders title when provided', () => {
    render(<Dialog open onClose={() => {}} title="Are you sure?">Body</Dialog>);
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/design/Dialog.test.jsx`
Expected: FAIL.

- [ ] **Step 3: Implement Dialog**

```jsx
// src/design/components/Dialog.jsx
'use client';

import { useEffect } from 'react';
import { tokens } from '../tokens.js';
import PaperPanel from './PaperPanel.jsx';

export default function Dialog({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      data-testid="dialog-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(58, 42, 26, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        data-testid="dialog-body"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 440 }}
      >
        <PaperPanel variant="light" padding={20}>
          {title && (
            <h3
              style={{
                margin: '0 0 12px',
                fontFamily: tokens.font.display,
                fontSize: 22,
                color: tokens.color.ink,
              }}
            >
              {title}
            </h3>
          )}
          <div style={{ fontFamily: tokens.font.body, fontSize: 15, color: tokens.color.inkSoft }}>
            {children}
          </div>
          {footer && (
            <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {footer}
            </div>
          )}
        </PaperPanel>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/design/Dialog.test.jsx`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/design/components/Dialog.jsx tests/design/Dialog.test.jsx
git commit -m "feat(design): Dialog component (#<phase1-dialog-issue>)"
```

---

## Task 7: Dev-only `/design` showcase route

**Files:**
- Create: `app/design/page.jsx`

- [ ] **Step 1: Implement showcase page**

```jsx
// app/design/page.jsx
'use client';

import { useState } from 'react';
import { tokens } from '@/src/design/tokens.js';
import Button from '@/src/design/components/Button.jsx';
import PaperPanel from '@/src/design/components/PaperPanel.jsx';
import Card from '@/src/design/components/Card.jsx';
import Dialog from '@/src/design/components/Dialog.jsx';

export default function DesignShowcase() {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (process.env.NODE_ENV === 'production') {
    return (
      <div style={{ padding: 40, fontFamily: 'system-ui' }}>
        <p>This page is only available in development.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 40,
        background: tokens.color.grass,
        fontFamily: tokens.font.body,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
      `}</style>

      <h1 style={{ fontFamily: tokens.font.display, fontSize: 42, color: tokens.color.ink, marginBottom: 24 }}>
        Island Design System
      </h1>

      <Card header="Buttons" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Card>

      <Card header="Color tokens" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {Object.entries(tokens.color).map(([name, value]) => (
            <div key={name} style={{ background: value, padding: 16, borderRadius: tokens.radius.sm, color: name.includes('paper') || name === 'sand' ? tokens.color.ink : '#fff', fontFamily: tokens.font.mono, fontSize: 11 }}>
              {name}<br/>{value}
            </div>
          ))}
        </div>
      </Card>

      <Card header="PaperPanel variants" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <PaperPanel variant="light" padding={20} style={{ flex: 1 }}>Light paper</PaperPanel>
          <PaperPanel variant="dark" padding={20} style={{ flex: 1 }}>Dark paper</PaperPanel>
        </div>
      </Card>

      <Card header="Dialog">
        <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Hello, islander!"
          footer={<>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => setDialogOpen(false)}>OK</Button>
          </>}
        >
          This is the new dialog component. It replaces ConfirmModal and AlertModal in Phase 3.
        </Dialog>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verify route renders**

Run: `npm run dev`
Open: `http://localhost:3000/design`
Expected: see the showcase page with all components rendering. Click "Open dialog" — dialog opens, escape or overlay click closes it.

- [ ] **Step 3: Verify production build hides the page**

Run: `npm run build && NODE_ENV=production npm run start`
Open: `http://localhost:3000/design`
Expected: see "only available in development" placeholder.

- [ ] **Step 4: Commit**

```bash
git add app/design/page.jsx
git commit -m "feat(design): /design showcase route (dev-only) (#<phase1-showcase-issue>)"
```

---

## Task 8: Verify, version bump, and tag

**Files:**
- Modify: `package.json` — version 5.0.1 → 5.0.2

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: all tests pass (existing 18 + new tests from Tasks 1, 3, 6 = ~30 tests).

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: no errors. Fix any new lint issues in design system files.

- [ ] **Step 4: Bump version**

Edit `package.json`: `"version": "5.0.1"` → `"version": "5.0.2"`

- [ ] **Step 5: Commit and push**

```bash
git add package.json package-lock.json
git commit -m "chore(version): bump to 5.0.2 for Phase 1 design system foundation"
git push origin main
```

- [ ] **Step 6: Verify deploy**

Visit https://acnh-portal.vercel.app — sidebar should show `v5.0.2 — 40 tools`. Visit https://acnh-portal.vercel.app/design (production guard should show "only available in development").

---

## Spec coverage check (self-review)

Run after writing the plan:
- [x] **Goals 2 (design system rooted in ACNH UI vocabulary)** → Tasks 1-7 build the tokens + 4 components
- [x] **Architecture: `src/design/tokens.js`** → Task 1
- [x] **Architecture: 4 base components** → Tasks 3, 4, 5, 6
- [x] **Architecture: texture SVGs** → Task 2
- [x] **Phase 1 ships when: demo page renders, all components have hover/focus/disabled states, tokens documented** → Task 7 + Task 3 hover/disabled tests + Task 1 token tests
- [x] **Risk: theme system conflict** → deferred to Phase 3 explicitly (non-goal in Phase 1)

No gaps.

---

## Done criteria for Phase 1

- All tasks above checked.
- `npm test`, `npm run build`, `npm run lint` all green.
- `/design` route renders all 4 components in dev; production-guarded.
- Version is 5.0.2 on https://acnh-portal.vercel.app
- No file outside `src/design/`, `tests/design/`, `public/design/`, `app/design/`, `package.json` is touched (no migration of existing components yet).
