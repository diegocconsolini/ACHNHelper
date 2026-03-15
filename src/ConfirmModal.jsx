'use client';

// src/ConfirmModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSettings } from './SettingsContext';
import { MODAL_THEMES, DEFAULT_THEME, MODAL_ANIM_STYLE } from './modalThemes';

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
    if (visible && !isClosing && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [visible, isClosing]);

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
      <style>{MODAL_ANIM_STYLE}</style>
      <div
        onClick={onCancel}
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
