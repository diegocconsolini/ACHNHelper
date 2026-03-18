'use client';

// src/artifacts/Settings.jsx
import React, { useState } from 'react';
import { useSettings } from '../SettingsContext';
import { MODAL_THEMES, THEME_KEYS } from '../modalThemes';
import ConfirmModal from '../ConfirmModal';

export default function Settings() {
  const { modalTheme, setModalTheme } = useSettings();
  const [previewTheme, setPreviewTheme] = useState(null);

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
      color: '#d4b030',
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
      outline: 'none',

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
      color: '#4aacf0',
      cursor: 'pointer',
      outline: 'none',

    },
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

      <div style={S.section}>
        <div style={S.sectionTitle}>More Settings</div>
        <div style={S.futureSection}>
          More customization options coming soon — profile, hemisphere preference, and more.
        </div>
      </div>

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
