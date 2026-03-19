'use client';

// src/SettingsContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { DEFAULT_THEME, THEME_KEYS } from './modalThemes';

const SettingsContext = createContext();

const STORAGE_KEY = 'acnh-modal-theme';

export function SettingsProvider({ children }) {
  const { data: session, status } = useSession();
  const [modalTheme, setModalThemeState] = useState(DEFAULT_THEME);

  // On mount: load from localStorage immediately (avoids flash)
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

  // When user is authenticated, fetch theme from profile API (overrides localStorage)
  useEffect(() => {
    if (status !== 'authenticated') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.modal_theme && THEME_KEYS.includes(data.modal_theme)) {
          setModalThemeState(data.modal_theme);
          // Update localStorage cache
          try { await window.storage.set(STORAGE_KEY, data.modal_theme); } catch { /* best effort */ }
        }
      } catch { /* use whatever we have */ }
    })();
    return () => { cancelled = true; };
  }, [status]);

  const setModalTheme = useCallback(async (themeKey) => {
    if (!THEME_KEYS.includes(themeKey)) return;
    // Update React state immediately
    setModalThemeState(themeKey);
    // Update localStorage cache
    try { await window.storage.set(STORAGE_KEY, themeKey); } catch { /* best effort */ }
    // If logged in, persist to database
    if (status === 'authenticated') {
      try {
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ modal_theme: themeKey }),
        });
      } catch { /* best effort — localStorage is the fallback */ }
    }
  }, [status]);

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
