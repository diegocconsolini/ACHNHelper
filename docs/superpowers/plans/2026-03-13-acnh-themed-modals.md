# ACNH-Themed Modal System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all 8 `window.confirm`/`window.alert` calls with ACNH-themed modals, providing 3 visual themes selectable from a new Settings page.

**Architecture:** 5 new files (`modalThemes.js`, `ConfirmModal.jsx`, `AlertModal.jsx`, `SettingsContext.jsx`, `Settings.jsx`) + modifications to 5 existing files (`App.jsx` + 4 artifacts). Modals read theme from React context backed by `window.storage`.

**Tech Stack:** React 19.2, Vite 7.3, inline styles only, `window.storage` API, `<AssetImg>` from `src/assetHelper.jsx`

**Spec:** `docs/superpowers/specs/2026-03-13-acnh-themed-modals-design.md`

---

## Chunk 1: Foundation (Theme Data + Context + Modal Components)

### Task 1: Create `modalThemes.js` — Theme Definitions

**Files:**
- Create: `src/modalThemes.js`

- [ ] **Step 1: Create `modalThemes.js` with all 3 theme objects**

```js
// src/modalThemes.js
// Pure data — no React, no side effects

export const MODAL_THEMES = {
  speechBubble: {
    name: 'ACNH Speech Bubble',
    backdrop: { background: 'rgba(0,0,0,0.5)' },
    container: {
      background: '#f5efe0',
      border: '3px solid #8b7355',
      borderRadius: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      padding: '20px 24px',
      textAlign: 'center',
      maxWidth: '360px',
      width: '90%',
      position: 'relative',
    },
    // Speech tail: rendered as a rotated div below container
    hasTail: true,
    tail: {
      width: '14px',
      height: '14px',
      background: '#f5efe0',
      border: '3px solid #8b7355',
      borderTop: 'none',
      borderLeft: 'none',
      transform: 'rotate(45deg)',
      position: 'absolute',
      bottom: '-9px',
      left: '50%',
      marginLeft: '-7px',
    },
    // Covers the container border where the tail meets
    tailCover: {
      position: 'absolute',
      bottom: '0',
      left: '50%',
      marginLeft: '-10px',
      width: '20px',
      height: '5px',
      background: '#f5efe0',
    },
    accentBar: null,
    icon: '🍃',
    title: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      color: '#3d3428',
      fontSize: '16px',
      marginBottom: '6px',
    },
    message: {
      fontFamily: "'DM Sans', sans-serif",
      color: '#6b5e4a',
      fontSize: '13px',
      lineHeight: '1.5',
      marginBottom: '18px',
    },
    cancelBtn: {
      background: '#e8dcc8',
      border: '2px solid #8b7355',
      borderRadius: '24px',
      padding: '8px 24px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      color: '#5a4d3a',
      cursor: 'pointer',
    },
    confirmBtn: {
      background: '#5ec850',
      border: '2px solid #4aa840',
      borderRadius: '24px',
      padding: '8px 24px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
    },
    destructiveBtn: {
      background: '#e74c3c',
      border: '2px solid #c0392b',
      borderRadius: '24px',
      padding: '8px 24px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
    },
    alertBtn: {
      background: '#5ec850',
      border: '2px solid #4aa840',
      borderRadius: '24px',
      padding: '8px 24px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
    },
  },

  darkPortal: {
    name: 'Dark Portal',
    backdrop: { background: 'rgba(0,0,0,0.6)' },
    container: {
      background: 'rgba(12,28,14,0.98)',
      border: '1px solid rgba(94,200,80,0.25)',
      borderRadius: '14px',
      boxShadow: '0 0 30px rgba(94,200,80,0.08), 0 8px 32px rgba(0,0,0,0.5)',
      padding: '20px 24px',
      textAlign: 'center',
      maxWidth: '360px',
      width: '90%',
      position: 'relative',
    },
    hasTail: false,
    tail: null,
    tailCover: null,
    accentBar: null,
    icon: '🍃',
    title: {
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 600,
      color: '#c8e6c0',
      fontSize: '16px',
      marginBottom: '6px',
    },
    message: {
      fontFamily: "'DM Sans', sans-serif",
      color: '#5a7a50',
      fontSize: '13px',
      lineHeight: '1.5',
      marginBottom: '18px',
    },
    cancelBtn: {
      background: 'rgba(94,200,80,0.08)',
      border: '1px solid rgba(94,200,80,0.2)',
      borderRadius: '8px',
      padding: '8px 24px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      color: '#5a7a50',
      cursor: 'pointer',
    },
    confirmBtn: {
      background: '#5ec850',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 24px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
    },
    destructiveBtn: {
      background: '#e74c3c',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 24px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
    },
    alertBtn: {
      background: '#5ec850',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 24px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
    },
  },

  hybrid: {
    name: 'Hybrid',
    backdrop: { background: 'rgba(0,0,0,0.55)' },
    container: {
      background: 'linear-gradient(135deg, rgba(12,28,14,0.98), rgba(20,40,22,0.98))',
      border: '2px solid rgba(94,200,80,0.3)',
      borderRadius: '18px',
      boxShadow: '0 0 40px rgba(94,200,80,0.1), 0 8px 32px rgba(0,0,0,0.5)',
      padding: '22px 24px',
      textAlign: 'center',
      maxWidth: '360px',
      width: '90%',
      position: 'relative',
    },
    hasTail: false,
    tail: null,
    tailCover: null,
    accentBar: {
      position: 'absolute',
      top: '-1px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '60px',
      height: '3px',
      background: 'linear-gradient(90deg, transparent, #5ec850, transparent)',
      borderRadius: '2px',
    },
    icon: '🍃',
    title: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      color: '#c8e6c0',
      fontSize: '16px',
      marginBottom: '6px',
    },
    message: {
      fontFamily: "'DM Sans', sans-serif",
      color: '#7a9a70',
      fontSize: '13px',
      lineHeight: '1.5',
      marginBottom: '18px',
    },
    cancelBtn: {
      background: 'rgba(94,200,80,0.06)',
      border: '1px solid rgba(94,200,80,0.2)',
      borderRadius: '24px',
      padding: '8px 24px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      color: '#7a9a70',
      cursor: 'pointer',
    },
    confirmBtn: {
      background: 'linear-gradient(135deg, #5ec850, #4aa840)',
      border: 'none',
      borderRadius: '24px',
      padding: '8px 24px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(94,200,80,0.3)',
    },
    destructiveBtn: {
      background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
      border: 'none',
      borderRadius: '24px',
      padding: '8px 24px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(231,76,60,0.3)',
    },
    alertBtn: {
      background: 'linear-gradient(135deg, #5ec850, #4aa840)',
      border: 'none',
      borderRadius: '24px',
      padding: '8px 24px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(94,200,80,0.3)',
    },
  },
};

export const THEME_KEYS = Object.keys(MODAL_THEMES);
export const DEFAULT_THEME = 'hybrid';
```

- [ ] **Step 2: Commit**

```bash
git add src/modalThemes.js
git commit -m "feat(modals): add 3 ACNH-themed modal theme definitions"
```

---

### Task 2: Create `SettingsContext.jsx` — User Preferences Context

**Files:**
- Create: `src/SettingsContext.jsx`

- [ ] **Step 1: Create `SettingsContext.jsx`**

```jsx
// src/SettingsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_THEME, THEME_KEYS } from './modalThemes';

const SettingsContext = createContext();

const STORAGE_KEY = 'acnh-modal-theme';

export function SettingsProvider({ children }) {
  const [modalTheme, setModalThemeState] = useState(DEFAULT_THEME);

  // Load persisted theme on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result && THEME_KEYS.includes(result.value)) {
          setModalThemeState(result.value);
        }
      } catch { /* use default */ }
    })();
  }, []);

  const setModalTheme = async (themeKey) => {
    if (!THEME_KEYS.includes(themeKey)) return;
    setModalThemeState(themeKey);
    try {
      await window.storage.set(STORAGE_KEY, themeKey);
    } catch { /* best effort */ }
  };

  return (
    <SettingsContext.Provider value={{ modalTheme, setModalTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/SettingsContext.jsx
git commit -m "feat(modals): add SettingsContext for modal theme persistence"
```

---

### Task 3: Create `ConfirmModal.jsx` — Confirm Dialog Component

**Files:**
- Create: `src/ConfirmModal.jsx`

- [ ] **Step 1: Create `ConfirmModal.jsx`**

This component:
- Reads theme from context (or uses `themeOverride` prop)
- Injects CSS `@keyframes` via `<style>` tag for fade-in/fade-out + scale animations
- Uses `isClosing` state + `setTimeout(150)` for exit animation before unmount
- Backdrop + modal card with `zIndex: 10000` / `10001`
- Escape key dismisses, backdrop click dismisses
- Auto-focuses confirm button on open

```jsx
// src/ConfirmModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSettings } from './SettingsContext';
import { MODAL_THEMES, DEFAULT_THEME } from './modalThemes';

const ANIM_STYLE = `
@keyframes modalFadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
@keyframes modalFadeOut { from { opacity:1; transform:scale(1); } to { opacity:0; transform:scale(0.95); } }
@keyframes backdropFadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes backdropFadeOut { from { opacity:1; } to { opacity:0; } }
`;

export default function ConfirmModal({
  open,
  title = 'Confirm',
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
  themeOverride,
}) {
  const { modalTheme } = useSettings();
  const themeKey = themeOverride || modalTheme || DEFAULT_THEME;
  const theme = MODAL_THEMES[themeKey] || MODAL_THEMES[DEFAULT_THEME];

  const [visible, setVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const confirmRef = useRef(null);

  // Open/close lifecycle
  useEffect(() => {
    if (open) {
      setVisible(true);
      setIsClosing(false);
    } else if (visible) {
      setIsClosing(true);
      const timer = setTimeout(() => { setVisible(false); setIsClosing(false); }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Auto-focus confirm button
  useEffect(() => {
    if (visible && !isClosing && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [visible, isClosing]);

  // Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onCancel?.();
  }, [onCancel]);

  useEffect(() => {
    if (visible && !isClosing) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [visible, isClosing, handleKeyDown]);

  if (!visible) return null;

  const animName = isClosing ? 'modalFadeOut' : 'modalFadeIn';
  const backdropAnim = isClosing ? 'backdropFadeOut' : 'backdropFadeIn';
  const animDuration = isClosing ? '150ms' : '200ms';
  const animEasing = isClosing ? 'ease-in' : 'ease-out';

  return (
    <>
      <style>{ANIM_STYLE}</style>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          ...theme.backdrop,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: `${backdropAnim} ${animDuration} ${animEasing} forwards`,
        }}
      >
        {/* Modal card — stop click propagation */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            ...theme.container,
            animation: `${animName} ${animDuration} ${animEasing} forwards`,
            zIndex: 10001,
          }}
        >
          {/* Accent bar (hybrid theme) */}
          {theme.accentBar && <div style={theme.accentBar} />}

          {/* Icon */}
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>{theme.icon}</div>

          {/* Title */}
          <div style={theme.title}>{title}</div>

          {/* Message */}
          <div style={theme.message}>{message}</div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={onCancel} style={theme.cancelBtn}>{cancelLabel}</button>
            <button
              ref={confirmRef}
              onClick={onConfirm}
              style={destructive ? theme.destructiveBtn : theme.confirmBtn}
            >
              {confirmLabel}
            </button>
          </div>

          {/* Speech tail (speechBubble theme) */}
          {theme.hasTail && (
            <>
              <div style={theme.tailCover} />
              <div style={theme.tail} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ConfirmModal.jsx
git commit -m "feat(modals): add ConfirmModal component with theme support"
```

---

### Task 4: Create `AlertModal.jsx` — Alert Dialog Component

**Files:**
- Create: `src/AlertModal.jsx`

- [ ] **Step 1: Create `AlertModal.jsx`**

Same animation/theme system as ConfirmModal but with single OK button.

```jsx
// src/AlertModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSettings } from './SettingsContext';
import { MODAL_THEMES, DEFAULT_THEME } from './modalThemes';

const ANIM_STYLE = `
@keyframes modalFadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
@keyframes modalFadeOut { from { opacity:1; transform:scale(1); } to { opacity:0; transform:scale(0.95); } }
@keyframes backdropFadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes backdropFadeOut { from { opacity:1; } to { opacity:0; } }
`;

export default function AlertModal({
  open,
  title = 'Notice',
  message,
  buttonLabel = 'OK',
  onClose,
  themeOverride,
}) {
  const { modalTheme } = useSettings();
  const themeKey = themeOverride || modalTheme || DEFAULT_THEME;
  const theme = MODAL_THEMES[themeKey] || MODAL_THEMES[DEFAULT_THEME];

  const [visible, setVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setIsClosing(false);
    } else if (visible) {
      setIsClosing(true);
      const timer = setTimeout(() => { setVisible(false); setIsClosing(false); }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (visible && !isClosing && btnRef.current) {
      btnRef.current.focus();
    }
  }, [visible, isClosing]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (visible && !isClosing) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [visible, isClosing, handleKeyDown]);

  if (!visible) return null;

  const animName = isClosing ? 'modalFadeOut' : 'modalFadeIn';
  const backdropAnim = isClosing ? 'backdropFadeOut' : 'backdropFadeIn';
  const animDuration = isClosing ? '150ms' : '200ms';
  const animEasing = isClosing ? 'ease-in' : 'ease-out';

  return (
    <>
      <style>{ANIM_STYLE}</style>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          ...theme.backdrop,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: `${backdropAnim} ${animDuration} ${animEasing} forwards`,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            ...theme.container,
            animation: `${animName} ${animDuration} ${animEasing} forwards`,
            zIndex: 10001,
          }}
        >
          {theme.accentBar && <div style={theme.accentBar} />}
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>{theme.icon}</div>
          <div style={theme.title}>{title}</div>
          <div style={theme.message}>{message}</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button ref={btnRef} onClick={onClose} style={theme.alertBtn}>{buttonLabel}</button>
          </div>
          {theme.hasTail && (
            <>
              <div style={theme.tailCover} />
              <div style={theme.tail} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/AlertModal.jsx
git commit -m "feat(modals): add AlertModal component with theme support"
```

---

## Chunk 2: Settings Page + App.jsx Integration

### Task 5: Create `Settings.jsx` — Settings Page with Theme Selector

**Files:**
- Create: `src/artifacts/Settings.jsx`

- [ ] **Step 1: Create `Settings.jsx`**

Settings page artifact with:
- Google Fonts `<style>` tag (all 3 fonts)
- "Dialog Theme" section with 3 clickable theme cards
- Each card: mini preview (scaled modal mockup), theme name, active checkmark
- "Preview" button per card opens a sample ConfirmModal with `themeOverride`
- All 3 accent colors: green (active border), gold (section accent), blue (info text)

```jsx
// src/artifacts/Settings.jsx
import React, { useState } from 'react';
import { useSettings } from '../SettingsContext';
import { MODAL_THEMES, THEME_KEYS } from '../modalThemes';
import ConfirmModal from '../ConfirmModal';

export default function Settings() {
  const { modalTheme, setModalTheme } = useSettings();
  const [previewTheme, setPreviewTheme] = useState(null);

  // Inline styles
  const S = {
    root: {
      minHeight: '100%',
      padding: '24px',
      fontFamily: "'DM Sans', sans-serif",
      color: '#c8e6c0',
      background: '#0a1a10',
    },
    header: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '26px',
      fontWeight: 900,
      marginBottom: '4px',
    },
    subtitle: {
      color: '#5a7a50',
      fontSize: '14px',
      marginBottom: '28px',
    },
    section: {
      marginBottom: '32px',
    },
    sectionTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '18px',
      fontWeight: 700,
      marginBottom: '4px',
      color: '#d4b030', // gold accent
    },
    sectionSub: {
      color: '#5a7a50',
      fontSize: '13px',
      marginBottom: '16px',
    },
    cardsRow: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
    },
    card: (isActive) => ({
      flex: '1 1 220px',
      maxWidth: '280px',
      background: 'rgba(12,28,14,0.95)',
      border: isActive ? '2px solid #5ec850' : '2px solid rgba(94,200,80,0.1)',
      borderRadius: '12px',
      padding: '16px',
      cursor: 'pointer',
      transition: 'border-color 0.2s',
      position: 'relative',
    }),
    cardName: {
      fontWeight: 600,
      fontSize: '14px',
      marginTop: '12px',
      marginBottom: '8px',
    },
    checkBadge: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      background: '#5ec850',
      color: '#0a1a10',
      borderRadius: '50%',
      width: '22px',
      height: '22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '13px',
      fontWeight: 700,
    },
    previewBtn: {
      background: 'rgba(74,172,240,0.1)',
      border: '1px solid rgba(74,172,240,0.3)',
      borderRadius: '6px',
      padding: '4px 12px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '12px',
      color: '#4aacf0', // blue accent
      cursor: 'pointer',
    },
    // Mini modal preview styles (scaled down)
    mini: {
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '8px',
      padding: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100px',
    },
    futureSection: {
      padding: '20px',
      background: 'rgba(12,28,14,0.5)',
      border: '1px dashed rgba(94,200,80,0.1)',
      borderRadius: '10px',
      color: '#3a5a40',
      fontSize: '13px',
      textAlign: 'center',
    },
  };

  // Mini preview: a small-scale representation of each modal's look
  const renderMiniPreview = (themeKey) => {
    const t = MODAL_THEMES[themeKey];
    return (
      <div style={S.mini}>
        <div style={{
          ...t.container,
          maxWidth: '180px',
          padding: '10px 12px',
          transform: 'scale(0.85)',
          transformOrigin: 'center',
        }}>
          {t.accentBar && <div style={{ ...t.accentBar, width: '30px', height: '2px' }} />}
          <div style={{ fontSize: '16px', marginBottom: '4px' }}>{t.icon}</div>
          <div style={{ ...t.title, fontSize: '11px', marginBottom: '3px' }}>Clear garden?</div>
          <div style={{ ...t.message, fontSize: '9px', marginBottom: '8px' }}>Remove all flowers?</div>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
            <span style={{ ...t.cancelBtn, padding: '2px 8px', fontSize: '9px', borderRadius: t.cancelBtn.borderRadius }}>Cancel</span>
            <span style={{ ...t.destructiveBtn, padding: '2px 8px', fontSize: '9px', borderRadius: t.destructiveBtn.borderRadius }}>Clear</span>
          </div>
          {t.hasTail && (
            <div style={{ ...t.tail, width: '8px', height: '8px', bottom: '-5px', marginLeft: '-4px' }} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={S.root}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      <div style={S.header}>Settings</div>
      <div style={S.subtitle}>Customize your ACNH Helper Suite experience</div>

      {/* Dialog Theme Section */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Dialog Theme</div>
        <div style={S.sectionSub}>Choose how confirmation and alert dialogs look</div>

        <div style={S.cardsRow}>
          {THEME_KEYS.map(key => {
            const t = MODAL_THEMES[key];
            const isActive = modalTheme === key;
            return (
              <div
                key={key}
                style={S.card(isActive)}
                onClick={() => setModalTheme(key)}
              >
                {isActive && <div style={S.checkBadge}>✓</div>}
                {renderMiniPreview(key)}
                <div style={S.cardName}>{t.name}</div>
                <button
                  style={S.previewBtn}
                  onClick={(e) => { e.stopPropagation(); setPreviewTheme(key); }}
                >
                  Preview
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Future sections placeholder */}
      <div style={S.section}>
        <div style={S.sectionTitle}>More Settings</div>
        <div style={S.futureSection}>
          More customization options coming soon — profile, hemisphere preference, and more.
        </div>
      </div>

      {/* Preview modal */}
      <ConfirmModal
        open={previewTheme !== null}
        themeOverride={previewTheme}
        title="Preview Dialog"
        message="This is a preview of the selected dialog theme. Click Cancel or Confirm to close."
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={() => setPreviewTheme(null)}
        onCancel={() => setPreviewTheme(null)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/artifacts/Settings.jsx
git commit -m "feat(modals): add Settings page with theme selector and live preview"
```

---

### Task 6: Wire Settings into App.jsx

**Files:**
- Modify: `src/App.jsx`

Changes:
1. Add lazy import for Settings (line 25, after DreamAddressBook import)
2. Add Settings category to MENU (after Island Life, line 78)
3. Add Settings to COMPONENTS (line 104)
4. Wrap entire App return in SettingsProvider (line 195)
5. Update footer tool count: "22 tools" → "23 tools" (line 245)

- [ ] **Step 1: Add lazy import**

At `src/App.jsx:25` (after the DreamAddressBook import), add:
```js
const Settings = lazy(() => import('./artifacts/Settings.jsx'));
```

- [ ] **Step 2: Add MENU entry**

After the Island Life category closing `}` at line 78, add:
```js
  {
    category: '⚙️ Settings',
    items: [
      { id: 'settings', label: 'Settings', emoji: '⚙️', component: 'Settings' },
    ],
  },
```

- [ ] **Step 3: Add to COMPONENTS**

At `src/App.jsx:104` (after `DreamAddressBook,`), add:
```js
  Settings,
```

- [ ] **Step 4: Add SettingsProvider import**

At the top of `src/App.jsx`, add:
```js
import { SettingsProvider } from './SettingsContext';
```

- [ ] **Step 5: Wrap App return in SettingsProvider**

Change the `return` in the `App` function (line 195) from:
```jsx
  return (
    <div style={styles.root}>
```
to:
```jsx
  return (
    <SettingsProvider>
    <div style={styles.root}>
```

And at the very end of the App return (before the final `);`), add the closing `</SettingsProvider>` tag after `</div>`.

- [ ] **Step 6: Update footer tool count**

At line 245, change:
```
v{__APP_VERSION__} — 22 tools
```
to:
```
v{__APP_VERSION__} — 23 tools
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: Clean build with no errors.

- [ ] **Step 8: Commit**

```bash
git add src/App.jsx
git commit -m "feat(modals): wire Settings page and SettingsProvider into App"
```

---

## Chunk 3: Migrate 4 Artifacts

### Task 7: Migrate GardenPlanner.jsx (1 confirm)

**Files:**
- Modify: `src/artifacts/GardenPlanner.jsx`

- [ ] **Step 1: Add import and state**

Add import at top of file:
```js
import ConfirmModal from '../ConfirmModal';
```

Inside the `GardenPlanner` component, add state (near other state declarations):
```js
const [showClearConfirm, setShowClearConfirm] = useState(false);
```

- [ ] **Step 2: Replace the `window.confirm` call**

At line 796, replace:
```jsx
<button onClick={() => { if (window.confirm('Clear garden?')) dispatch({ type: 'CLEAR_GRID' }); }} style={S.actionBtn('red')}>
  Clear
</button>
```
with:
```jsx
<button onClick={() => setShowClearConfirm(true)} style={S.actionBtn('red')}>
  Clear
</button>
```

- [ ] **Step 3: Add ConfirmModal JSX**

Add at the end of the component's return, just before the closing `</div>` of the root element:
```jsx
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

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 5: Commit**

```bash
git add src/artifacts/GardenPlanner.jsx
git commit -m "feat(modals): replace window.confirm in GardenPlanner with ConfirmModal"
```

---

### Task 8: Migrate DreamAddressBook.jsx (1 confirm + 4 alerts)

**Files:**
- Modify: `src/artifacts/DreamAddressBook.jsx`

- [ ] **Step 1: Add imports and state**

Add imports at top:
```js
import ConfirmModal from '../ConfirmModal';
import AlertModal from '../AlertModal';
```

Inside the main component, add state:
```js
const [deleteTarget, setDeleteTarget] = useState(null);
const [alertMsg, setAlertMsg] = useState(null);
```

- [ ] **Step 2: Replace the `window.confirm` in `deleteEntry`**

At line 59-63, replace:
```js
const deleteEntry = (id) => {
  if (window.confirm('Delete this dream address entry?')) {
    saveData(entries.filter(e => e.id !== id));
  }
};
```
with:
```js
const deleteEntry = (id) => {
  setDeleteTarget(id);
};

const confirmDelete = () => {
  if (deleteTarget !== null) {
    saveData(entries.filter(e => e.id !== deleteTarget));
    setDeleteTarget(null);
  }
};
```

- [ ] **Step 3: Replace the 4 `alert()` calls in `handleSubmit`**

At lines 600-616, replace the 4 alert calls in `handleSubmit` with `setAlertMsg(...)`:
```js
const handleSubmit = () => {
  if (!formData.islandName.trim()) {
    setAlertMsg('Please enter island name');
    return;
  }
  if (!validateDreamAddress(formData.dreamAddress)) {
    setAlertMsg('Dream Address must be in format: DA-XXXX-XXXX-XXXX');
    return;
  }
  if (!formData.ownerName.trim()) {
    setAlertMsg('Please enter owner name');
    return;
  }
  if (formData.tags.length === 0) {
    setAlertMsg('Please select at least one theme');
    return;
  }
  onSubmit(formData);
  setFormData({ islandName: '', dreamAddress: '', ownerName: '', rating: 3, tags: [], notes: '' });
};
```

**Note:** `handleSubmit` is inside a sub-component (`AddEntryForm`). The `alertMsg` state and `AlertModal` must be accessible from there. The simplest approach: lift `alertMsg`/`setAlertMsg` to the parent component and pass `setAlertMsg` as a prop to `AddEntryForm`, or declare the `AlertModal` at the parent level. Check the component structure and choose the approach that requires fewer changes. If `handleSubmit` is in the parent component, keep `alertMsg` there. If it's in a child, pass `setAlertMsg` down.

- [ ] **Step 4: Add ConfirmModal and AlertModal JSX**

At the end of the root component's return:
```jsx
<ConfirmModal
  open={deleteTarget !== null}
  title="Delete dream address?"
  message="This entry will be permanently removed."
  confirmLabel="Delete"
  destructive
  onConfirm={confirmDelete}
  onCancel={() => setDeleteTarget(null)}
/>
<AlertModal
  open={alertMsg !== null}
  title="Missing Info"
  message={alertMsg || ''}
  onClose={() => setAlertMsg(null)}
/>
```

- [ ] **Step 5: Verify no `alert(` or `window.confirm` remain**

Run: `grep -n 'alert\|window\.confirm' src/artifacts/DreamAddressBook.jsx`
Expected: No matches (or only the word "alert" in unrelated contexts like variable names).

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 7: Commit**

```bash
git add src/artifacts/DreamAddressBook.jsx
git commit -m "feat(modals): replace confirm/alert in DreamAddressBook with themed modals"
```

---

### Task 9: Migrate NooksCrannyLog.jsx (1 alert) and TurnipTracker.jsx (1 alert)

**Files:**
- Modify: `src/artifacts/NooksCrannyLog.jsx`
- Modify: `src/artifacts/TurnipTracker.jsx`

- [ ] **Step 1: Migrate NooksCrannyLog.jsx**

Add import:
```js
import AlertModal from '../AlertModal';
```

Add state inside the component:
```js
const [showAlert, setShowAlert] = useState(false);
```

Replace line 39:
```js
alert('Please enter a hot item');
```
with:
```js
setShowAlert(true);
```

Add AlertModal JSX at end of return:
```jsx
<AlertModal
  open={showAlert}
  title="Missing Info"
  message="Please enter a hot item."
  onClose={() => setShowAlert(false)}
/>
```

- [ ] **Step 2: Migrate TurnipTracker.jsx**

Add import:
```js
import AlertModal from '../AlertModal';
```

Add state inside the component:
```js
const [showAlert, setShowAlert] = useState(false);
```

Replace line 118:
```js
alert('Please enter a buy price and at least one daily price.');
```
with:
```js
setShowAlert(true);
```

Add AlertModal JSX at end of return:
```jsx
<AlertModal
  open={showAlert}
  title="Missing Info"
  message="Please enter a buy price and at least one daily price."
  onClose={() => setShowAlert(false)}
/>
```

- [ ] **Step 3: Verify no `alert(` calls remain in either file**

Run: `grep -n 'alert(' src/artifacts/NooksCrannyLog.jsx src/artifacts/TurnipTracker.jsx`
Expected: No matches.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 5: Commit**

```bash
git add src/artifacts/NooksCrannyLog.jsx src/artifacts/TurnipTracker.jsx
git commit -m "feat(modals): replace alert() in NooksCrannyLog and TurnipTracker with AlertModal"
```

---

## Chunk 4: Verification & Deploy

### Task 10: Final Verification

**Files:**
- Modify: `package.json` (version bump)

- [ ] **Step 1: Verify zero dialog calls remain**

Run: `grep -rn 'window\.confirm\|window\.alert\|[^.]alert(' src/artifacts/ src/App.jsx`
Expected: No matches (zero remaining browser dialogs).

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build with no errors or warnings. Should show `Settings` chunk in output.

- [ ] **Step 3: Bump version**

Verify current version:
Run: `node -e "console.log(require('./package.json').version)"`
Expected: `1.2.0`

Bump `package.json` `"version"` from `"1.2.0"` to `"1.3.0"` (minor: new Settings page + modal system).

- [ ] **Step 4: Final commit**

```bash
git add package.json
git commit -m "feat(modals): complete ACNH-themed modal system v1.3.0 (Issue #27)

- 3 selectable themes: Speech Bubble, Dark Portal, Hybrid
- Settings page with theme selector and live preview
- Replaced all 8 window.confirm/alert calls across 4 artifacts
- SettingsContext for persistent user preferences"
```

### Task 11: Deploy

- [ ] **Step 1: Push to main**

```bash
git push origin main
```

Vercel auto-deploys from main. Verify at https://acnh-portal.vercel.app after deploy completes.
