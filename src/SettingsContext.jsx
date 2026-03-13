// src/SettingsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_THEME, THEME_KEYS } from './modalThemes';

const SettingsContext = createContext();

const STORAGE_KEY = 'acnh-modal-theme';

export function SettingsProvider({ children }) {
  const [modalTheme, setModalThemeState] = useState(DEFAULT_THEME);

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
