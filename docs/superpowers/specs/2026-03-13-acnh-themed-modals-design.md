# ACNH-Themed Modal System — Design Spec

**Issue:** #27
**Goal:** Replace all `window.confirm()` and `window.alert()` calls with ACNH-themed modals. Provide 3 visual themes with user customization via a new Settings page.

---

## 1. Scope

8 dialog calls across 4 artifacts:

| File | Type | Message |
|------|------|---------|
| `GardenPlanner.jsx:796` | `confirm` | "Clear garden?" |
| `DreamAddressBook.jsx:60` | `confirm` | "Delete this dream address entry?" |
| `DreamAddressBook.jsx:602` | `alert` | "Please enter island name" |
| `DreamAddressBook.jsx:606` | `alert` | "Dream Address must be in format: DA-XXXX-XXXX-XXXX" |
| `DreamAddressBook.jsx:610` | `alert` | "Please enter owner name" |
| `DreamAddressBook.jsx:614` | `alert` | "Please select at least one theme" |
| `NooksCrannyLog.jsx:39` | `alert` | "Please enter a hot item" |
| `TurnipTracker.jsx:118` | `alert` | "Please enter a buy price and at least one daily price." |

---

## 2. New Files

| File | Purpose | Approx Lines |
|------|---------|-------------|
| `src/ConfirmModal.jsx` | Shared confirm modal (Cancel + Confirm buttons) | ~120 |
| `src/AlertModal.jsx` | Shared alert modal (single OK button) | ~90 |
| `src/modalThemes.js` | 3 theme definitions (data only, no React) | ~150 |
| `src/SettingsContext.jsx` | React context for user preferences | ~40 |
| `src/artifacts/Settings.jsx` | Settings page with theme selector + live preview | ~250 |

**Modified files:**
- `src/App.jsx` — Add SettingsProvider wrapper, Settings lazy import, new sidebar category
- `src/artifacts/GardenPlanner.jsx` — Replace 1 `window.confirm`
- `src/artifacts/DreamAddressBook.jsx` — Replace 1 `window.confirm` + 4 `window.alert`
- `src/artifacts/NooksCrannyLog.jsx` — Replace 1 `window.alert`
- `src/artifacts/TurnipTracker.jsx` — Replace 1 `window.alert`

---

## 3. Architecture

### SettingsContext

```
App.jsx
  └─ <SettingsProvider>          ← loads prefs from window.storage
       └─ <Suspense>
            └─ <ActiveArtifact>
                 └─ <ConfirmModal>  ← reads modalTheme from context
                 └─ <AlertModal>    ← reads modalTheme from context
```

`SettingsContext.jsx` exports:
- `SettingsProvider` — wraps App, loads `acnh-modal-theme` from `window.storage` on mount (default: `'hybrid'`)
- `useSettings()` — hook returning `{ modalTheme, setModalTheme }`
- `setModalTheme(themeKey)` — updates state + persists to `window.storage`
- Storage key: `acnh-modal-theme`, values: `'speechBubble'` | `'darkPortal'` | `'hybrid'`

### ConfirmModal

Props:
- `open` (boolean) — whether modal is visible
- `title` (string, optional) — header text (defaults to "Confirm")
- `message` (string) — body text
- `confirmLabel` (string, optional) — confirm button text (defaults to "OK")
- `cancelLabel` (string, optional) — cancel button text (defaults to "Cancel")
- `destructive` (boolean, optional) — if true, confirm button uses red/warning style
- `onConfirm` (function) — called on confirm
- `onCancel` (function) — called on cancel or backdrop click
- `themeOverride` (string, optional) — if set, uses this theme key instead of context. Used by Settings preview.

Renders nothing when `open` is false. When open:
1. Reads `modalTheme` from `useSettings()` (or uses `themeOverride` if provided)
2. Looks up theme from `modalThemes.js`
3. Renders backdrop overlay (`zIndex: 10000`) + themed modal card (`zIndex: 10001`)
4. Traps focus (confirm button auto-focused)
5. Escape key triggers `onCancel`

### AlertModal

Props:
- `open` (boolean)
- `title` (string, optional) — defaults to "Notice"
- `message` (string)
- `buttonLabel` (string, optional) — defaults to "OK"
- `onClose` (function) — called on button click, backdrop click, or Escape
- `themeOverride` (string, optional) — same as ConfirmModal

Same theme system as ConfirmModal but with single button.

### Usage Pattern in Artifacts

```jsx
import ConfirmModal from '../ConfirmModal';

// In component:
const [showClearConfirm, setShowClearConfirm] = useState(false);

// Trigger:
<button onClick={() => setShowClearConfirm(true)}>Clear</button>

// Modal:
<ConfirmModal
  open={showClearConfirm}
  title="Clear garden?"
  message="This will remove all flowers from your garden layout."
  confirmLabel="Clear"
  destructive
  onConfirm={() => { dispatch({ type: 'CLEAR_GRID' }); setShowClearConfirm(false); }}
  onCancel={() => setShowClearConfirm(false)}
/>
```

---

## 4. Theme Definitions

`modalThemes.js` exports `MODAL_THEMES` — an object with 3 keys, each containing style objects for all modal parts.

### Theme A: `speechBubble` — ACNH Speech Bubble

| Element | Style |
|---------|-------|
| Backdrop | `rgba(0,0,0,0.5)` |
| Container | `background: #f5efe0`, `border: 3px solid #8b7355`, `border-radius: 20px` |
| Speech tail | Rendered as a small rotated `<div>` (45deg, 12px) positioned below the container with matching background and border. Not a pseudo-element — a real DOM element to stay within inline-styles constraint. |
| Title | `'Playfair Display', serif`, `color: #3d3428`, `font-weight: 700` |
| Message | `'DM Sans', sans-serif`, `color: #6b5e4a`, `font-size: 13px` |
| Icon | `🍃` leaf emoji |
| Cancel button | `background: #e8dcc8`, `border: 2px solid #8b7355`, `border-radius: 24px`, `color: #5a4d3a` |
| Confirm button | `background: #5ec850`, `border: 2px solid #4aa840`, `border-radius: 24px`, `color: white` |
| Destructive confirm | `background: #e74c3c`, `border: 2px solid #c0392b` |
| Alert OK button | `background: #5ec850`, `border: 2px solid #4aa840`, `border-radius: 24px`, `color: white` |
| Box shadow | `0 8px 32px rgba(0,0,0,0.4)` |

### Theme B: `darkPortal` — Dark Portal Theme

| Element | Style |
|---------|-------|
| Backdrop | `rgba(0,0,0,0.6)` |
| Container | `background: rgba(12,28,14,0.98)`, `border: 1px solid rgba(94,200,80,0.25)`, `border-radius: 14px` |
| Title | `'DM Sans', sans-serif`, `color: #c8e6c0`, `font-weight: 600` |
| Message | `'DM Sans', sans-serif`, `color: #5a7a50`, `font-size: 13px` |
| Icon | `🍃` leaf emoji |
| Cancel button | `background: rgba(94,200,80,0.08)`, `border: 1px solid rgba(94,200,80,0.2)`, `border-radius: 8px`, `color: #5a7a50` |
| Confirm button | `background: #5ec850`, `border: none`, `border-radius: 8px`, `color: white` |
| Destructive confirm | `background: #e74c3c` |
| Alert OK button | `background: #5ec850`, `border: none`, `border-radius: 8px`, `color: white` |
| Box shadow | `0 0 30px rgba(94,200,80,0.08), 0 8px 32px rgba(0,0,0,0.5)` |

### Theme C: `hybrid` — Hybrid (DEFAULT)

| Element | Style |
|---------|-------|
| Backdrop | `rgba(0,0,0,0.55)` |
| Container | `background: linear-gradient(135deg, rgba(12,28,14,0.98), rgba(20,40,22,0.98))`, `border: 2px solid rgba(94,200,80,0.3)`, `border-radius: 18px` |
| Accent bar | `position: absolute`, top center, `width: 60px`, `height: 3px`, `background: linear-gradient(90deg, transparent, #5ec850, transparent)` |
| Title | `'Playfair Display', serif`, `color: #c8e6c0`, `font-weight: 700` |
| Message | `'DM Sans', sans-serif`, `color: #7a9a70`, `font-size: 13px` |
| Icon | `🍃` leaf emoji |
| Cancel button | `background: rgba(94,200,80,0.06)`, `border: 1px solid rgba(94,200,80,0.2)`, `border-radius: 24px`, `color: #7a9a70` |
| Confirm button | `background: linear-gradient(135deg, #5ec850, #4aa840)`, `border: none`, `border-radius: 24px`, `color: white`, `box-shadow: 0 2px 8px rgba(94,200,80,0.3)` |
| Destructive confirm | `background: linear-gradient(135deg, #e74c3c, #c0392b)`, `box-shadow: 0 2px 8px rgba(231,76,60,0.3)` |
| Alert OK button | Same as confirm |
| Box shadow | `0 0 40px rgba(94,200,80,0.1), 0 8px 32px rgba(0,0,0,0.5)` |

### Animation (all themes)

- **Open:** Backdrop fades in 200ms. Modal fades in + scales from `transform: scale(0.95)` to `scale(1)`, 200ms `ease-out`.
- **Close:** Reverse, 150ms `ease-in`. Implemented via an internal `isClosing` state: when `open` transitions from `true` to `false`, the component sets `isClosing = true`, applies the exit animation class, and uses a `setTimeout(150)` to unmount after the animation completes.
- **Implementation:** CSS `@keyframes` injected via a single `<style>` tag inside the modal component (shared between both modals). The `<style>` tag defines `@keyframes modalFadeIn`, `@keyframes modalFadeOut`, `@keyframes backdropFadeIn`, `@keyframes backdropFadeOut`.

---

## 5. Settings Page

**`src/artifacts/Settings.jsx`** — New artifact, added to App.jsx.

### Sidebar Entry

New category in `MENU`. The actual item schema must match the existing MENU format in App.jsx (fields: `id`, `label`, `emoji`, `component`):
```js
{ category: '⚙️ Settings', items: [{ id: 'settings', label: 'Settings', emoji: '⚙️', component: 'Settings' }] }
```

### Layout

- Standard artifact layout: root div with dark background
- Google Fonts `<style>` tag (all 3 fonts)
- **Section: Modal Theme**
  - Section header: "Dialog Theme" with subtitle "Choose how confirmation and alert dialogs look"
  - 3 theme cards in a row (responsive: stack on narrow viewports)
  - Each card contains:
    - Mini preview: a scaled-down (~60%) rendering of what the modal looks like
    - Theme name below the preview
    - Active theme has green border (`#5ec850`) and checkmark badge
  - Clicking a card: switches theme via `setModalTheme()`, immediate visual feedback
  - "Preview" button on each card: opens a sample ConfirmModal with `themeOverride={themeKey}` so the user sees it in that specific theme regardless of current selection
- **Future sections** (placeholder, not implemented now): reserved for Issue #28 preferences

### Storage

- Key: `acnh-modal-theme`
- Values: `'speechBubble'` | `'darkPortal'` | `'hybrid'`
- Default: `'hybrid'`

---

## 6. App.jsx Changes

1. Add lazy import: `const Settings = lazy(() => import('./artifacts/Settings.jsx'));`
2. Add to `COMPONENTS`: `Settings`
3. Add to `MENU`: new `'⚙️ Settings'` category at the end
4. Wrap the **entire App return** in `<SettingsProvider>` (not just the content area — the sidebar may reference settings in the future):
   ```jsx
   import { SettingsProvider } from './SettingsContext';
   // In render — outermost wrapper:
   <SettingsProvider>
     {/* sidebar + main content area */}
   </SettingsProvider>
   ```
5. Update sidebar footer tool count from "22 tools" to "23 tools"

---

## 7. Migration Details

### GardenPlanner.jsx (1 confirm)

**Before:**
```jsx
<button onClick={() => { if (window.confirm('Clear garden?')) dispatch({ type: 'CLEAR_GRID' }); }}>
```

**After:**
```jsx
const [showClearConfirm, setShowClearConfirm] = useState(false);
// ...
<button onClick={() => setShowClearConfirm(true)}>
// ...
<ConfirmModal
  open={showClearConfirm}
  title="Clear garden?"
  message="This will remove all flowers from your garden layout."
  confirmLabel="Clear"
  destructive
  onConfirm={() => { dispatch({ type: 'CLEAR_GRID' }); setShowClearConfirm(false); }}
  onCancel={() => setShowClearConfirm(false)}
/>
```

### DreamAddressBook.jsx (1 confirm + 4 alerts)

**Confirm — delete entry:**
```jsx
const [deleteTarget, setDeleteTarget] = useState(null);
// trigger: setDeleteTarget(entryId)
<ConfirmModal
  open={deleteTarget !== null}
  title="Delete dream address?"
  message="This entry will be permanently removed."
  confirmLabel="Delete"
  destructive
  onConfirm={() => { deleteEntry(deleteTarget); setDeleteTarget(null); }}
  onCancel={() => setDeleteTarget(null)}
/>
```

**Alerts — form validation (4 calls):**
```jsx
const [alertMsg, setAlertMsg] = useState(null);
// trigger: setAlertMsg('Please enter island name')
<AlertModal
  open={alertMsg !== null}
  title="Missing Info"
  message={alertMsg}
  onClose={() => setAlertMsg(null)}
/>
```

All 4 validation alerts can share a single `AlertModal` instance with dynamic message.

### NooksCrannyLog.jsx (1 alert)

```jsx
const [showAlert, setShowAlert] = useState(false);
// trigger: setShowAlert(true)
<AlertModal
  open={showAlert}
  title="Missing Info"
  message="Please enter a hot item."
  onClose={() => setShowAlert(false)}
/>
```

### TurnipTracker.jsx (1 alert)

```jsx
const [showAlert, setShowAlert] = useState(false);
// trigger: setShowAlert(true)
<AlertModal
  open={showAlert}
  title="Missing Info"
  message="Please enter a buy price and at least one daily price."
  onClose={() => setShowAlert(false)}
/>
```

---

## 8. Verification Checklist

- [ ] All 8 `window.confirm`/`window.alert` calls removed (zero remaining in `src/`)
- [ ] ConfirmModal renders correctly in all 3 themes
- [ ] AlertModal renders correctly in all 3 themes
- [ ] Escape key dismisses both modal types
- [ ] Backdrop click dismisses both modal types
- [ ] Animation plays on open and close
- [ ] Settings page shows 3 theme cards with live preview
- [ ] Theme selection persists across page reload via `window.storage`
- [ ] Default theme is `hybrid` on fresh load
- [ ] Settings appears in sidebar under "⚙️ Settings"
- [ ] Build passes with no errors or warnings
- [ ] All 3 accent colors used in Settings page (green, gold, blue)
- [ ] Google Fonts imported in Settings.jsx
- [ ] Version bumped in `package.json` (minor bump to 1.3.0)
- [ ] Sidebar footer updated: "23 tools"
- [ ] Modal z-index (10000+) renders above all other UI elements
