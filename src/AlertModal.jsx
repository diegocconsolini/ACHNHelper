// src/AlertModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSettings } from './SettingsContext';
import { MODAL_THEMES, DEFAULT_THEME, MODAL_ANIM_STYLE } from './modalThemes';

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
      <style>{MODAL_ANIM_STYLE}</style>
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
