'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { AssetImg } from '../assetHelper';
import { useSettings } from '../SettingsContext';
import { MODAL_THEMES, THEME_KEYS } from '../modalThemes';
import ConfirmModal from '../ConfirmModal';

const FLOWERS = [
  'cosmos', 'hyacinths', 'lilies', 'mums',
  'pansies', 'roses', 'tulips', 'windflowers',
];

const FRUITS = ['apple', 'cherry', 'orange', 'peach', 'pear'];

const FLOWER_COLORS = {
  cosmos: 'red', hyacinths: 'red', lilies: 'red', mums: 'red',
  pansies: 'red', roses: 'red', tulips: 'red', windflowers: 'red',
};

const FLOWER_SINGULAR = {
  cosmos: 'cosmos', hyacinths: 'hyacinth', lilies: 'lily', mums: 'mum',
  pansies: 'pansy', roses: 'rose', tulips: 'tulip', windflowers: 'windflower',
};

function formatFriendCode(value) {
  const digits = value.replace(/[^0-9]/g, '').slice(0, 12);
  const parts = [];
  if (digits.length > 0) parts.push(digits.slice(0, 4));
  if (digits.length > 4) parts.push(digits.slice(4, 8));
  if (digits.length > 8) parts.push(digits.slice(8, 12));
  return parts.length > 0 ? 'SW-' + parts.join('-') : '';
}

function formatDreamAddress(value) {
  const digits = value.replace(/[^0-9]/g, '').slice(0, 12);
  const parts = [];
  if (digits.length > 0) parts.push(digits.slice(0, 4));
  if (digits.length > 4) parts.push(digits.slice(4, 8));
  if (digits.length > 8) parts.push(digits.slice(8, 12));
  return parts.length > 0 ? 'DA-' + parts.join('-') : '';
}

export default function UserProfile() {
  const { data: session, status } = useSession();
  const { modalTheme, setModalTheme } = useSettings();
  const [previewTheme, setPreviewTheme] = useState(null);
  const [profile, setProfile] = useState({
    island_name: '',
    hemisphere: '',
    native_flower: '',
    native_fruit: '',
    friend_code: '',
    dream_address: '',
    island_rating: null,
  });
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
  const saveTimer = useRef(null);
  const abortRef = useRef(null);

  // Load profile on mount
  useEffect(() => {
    if (status !== 'authenticated') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        if (!cancelled && data && Object.keys(data).length > 0) {
          setProfile(prev => ({ ...prev, ...data }));
        }
      } catch {
        // No profile yet — that's fine
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [status]);

  // Debounced save
  const saveProfile = useCallback((updates) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (abortRef.current) abortRef.current.abort();

    setSaveStatus('saving');
    saveTimer.current = setTimeout(async () => {
      try {
        const controller = new AbortController();
        abortRef.current = controller;
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Save failed');
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setSaveStatus('error');
          setTimeout(() => setSaveStatus('idle'), 3000);
        }
      }
    }, 800);
  }, []);

  const updateField = useCallback((field, value) => {
    setProfile(prev => {
      const next = { ...prev, [field]: value };
      saveProfile(next);
      return next;
    });
  }, [saveProfile]);

  if (status === 'loading') {
    return (
      <div style={styles.container}>
        <style>{fontImport}</style>
        <div style={styles.centerMsg}>
          <span style={{ fontSize: 48 }}>🍃</span>
          <p style={{ color: '#5ec850', marginTop: 12 }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div style={styles.container}>
        <style>{fontImport}</style>
        <div style={styles.centerMsg}>
          <span style={{ fontSize: 56 }}>🔒</span>
          <h2 style={styles.title}>Sign In Required</h2>
          <p style={styles.subtitle}>Sign in to access your profile and sync your data across devices.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{fontImport}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              style={styles.avatar}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div style={styles.avatarFallback}>
              {(session.user?.name || '?')[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 style={styles.title}>{session.user?.name || 'Player'}</h1>
            <p style={styles.email}>{session.user?.email}</p>
          </div>
        </div>
        <div style={styles.saveIndicator}>
          {saveStatus === 'saving' && <span style={{ color: '#d4b030' }}>Saving...</span>}
          {saveStatus === 'saved' && <span style={{ color: '#5ec850' }}>Saved</span>}
          {saveStatus === 'error' && <span style={{ color: '#e05050' }}>Save failed</span>}
        </div>
      </div>

      {loading ? (
        <div style={styles.centerMsg}>
          <span style={{ fontSize: 36 }}>🍃</span>
          <p style={{ color: '#5a7a50', marginTop: 8 }}>Loading profile...</p>
        </div>
      ) : (
        <div style={styles.formGrid}>
          {/* Island Name */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Island Name</label>
            <input
              type="text"
              maxLength={10}
              value={profile.island_name || ''}
              onChange={e => updateField('island_name', e.target.value)}
              placeholder="Your island name"
              style={styles.input}
            />
            <span style={styles.hint}>Max 10 characters</span>
          </div>

          {/* Hemisphere */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Hemisphere</label>
            <div style={styles.radioRow}>
              {['north', 'south'].map(h => (
                <button
                  key={h}
                  onClick={() => updateField('hemisphere', h)}
                  style={{
                    ...styles.radioBtn,
                    ...(profile.hemisphere === h ? styles.radioBtnActive : {}),
                  }}
                >
                  {h === 'north' ? '🌸 North' : '❄️ South'}
                </button>
              ))}
            </div>
          </div>

          {/* Native Fruit */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Native Fruit</label>
            <div style={styles.optionGrid}>
              {FRUITS.map(fruit => (
                <button
                  key={fruit}
                  onClick={() => updateField('native_fruit', fruit)}
                  style={{
                    ...styles.optionBtn,
                    ...(profile.native_fruit === fruit ? styles.optionBtnActive : {}),
                  }}
                >
                  <AssetImg category="other" name={fruit} size={28} />
                  <span style={styles.optionLabel}>{fruit}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Native Flower */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Native Flower</label>
            <div style={styles.optionGrid}>
              {FLOWERS.map(flower => (
                <button
                  key={flower}
                  onClick={() => updateField('native_flower', flower)}
                  style={{
                    ...styles.optionBtn,
                    ...(profile.native_flower === flower ? styles.optionBtnActive : {}),
                  }}
                >
                  <AssetImg
                    category="other"
                    name={`${FLOWER_COLORS[flower]}-${FLOWER_SINGULAR[flower]} plant`}
                    size={28}
                  />
                  <span style={styles.optionLabel}>{flower}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Friend Code */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Friend Code</label>
            <input
              type="text"
              value={profile.friend_code || ''}
              onChange={e => updateField('friend_code', formatFriendCode(e.target.value))}
              placeholder="SW-XXXX-XXXX-XXXX"
              style={styles.input}
            />
          </div>

          {/* Dream Address */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Dream Address</label>
            <input
              type="text"
              value={profile.dream_address || ''}
              onChange={e => updateField('dream_address', formatDreamAddress(e.target.value))}
              placeholder="DA-XXXX-XXXX-XXXX"
              style={styles.input}
            />
          </div>

          {/* Island Rating */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Island Rating</label>
            <div style={styles.starRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => updateField('island_rating', n)}
                  style={styles.starBtn}
                  title={`${n} star${n !== 1 ? 's' : ''}`}
                >
                  <span style={{
                    fontSize: 28,
                    filter: n <= (profile.island_rating || 0)
                      ? 'none'
                      : 'grayscale(1) opacity(0.3)',
                    transition: 'filter 0.2s ease',
                  }}>
                    ⭐
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Theme */}
      <div style={styles.themeSection}>
        <h3 style={styles.themeSectionTitle}>Modal Theme</h3>
        <p style={styles.themeSectionSub}>Choose how confirmation and alert dialogs look</p>
        <div style={styles.themeCardsRow}>
          {THEME_KEYS.map(key => {
            const t = MODAL_THEMES[key];
            const isActive = modalTheme === key;
            return (
              <div
                key={key}
                style={{
                  ...styles.themeCard,
                  border: isActive ? '2px solid #5ec850' : '2px solid rgba(94,200,80,0.1)',
                }}
                onClick={() => setModalTheme(key)}
              >
                {isActive && <div style={styles.themeCheckBadge}>&#10003;</div>}
                <div style={styles.themeMini}>
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
                <div style={styles.themeCardName}>{t.name}</div>
                <button
                  style={styles.themePreviewBtn}
                  onClick={(e) => { e.stopPropagation(); setPreviewTheme(key); }}
                >
                  Preview
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Management */}
      <div style={styles.dataSection}>
        <h3 style={styles.dataSectionTitle}>Data Management</h3>
        <div style={styles.dataActions}>
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/user/export');
                if (!res.ok) throw new Error('Export failed');
                const data = await res.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `acnh-data-export-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
              } catch {
                alert('Failed to export data. Please try again.');
              }
            }}
            style={styles.exportBtn}
          >
            Export My Data
          </button>
          <p style={styles.dataHint}>
            Download all your profile and tracking data as a JSON file.
          </p>
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

const fontImport = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
`;

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a1a10',
    fontFamily: "'DM Sans', sans-serif",
    color: '#c8e6c0',
    padding: '32px 40px',
    maxWidth: 720,
    margin: '0 auto',
  },
  centerMsg: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    textAlign: 'center',
    gap: 8,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 36,
    paddingBottom: 24,
    borderBottom: '1px solid rgba(94,200,80,0.15)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    border: '3px solid rgba(94,200,80,0.3)',
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    border: '3px solid rgba(94,200,80,0.3)',
    background: 'rgba(94,200,80,0.15)',
    color: '#5ec850',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    fontWeight: 700,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 24,
    fontWeight: 700,
    color: '#5ec850',
    margin: 0,
  },
  subtitle: {
    fontSize: 15,
    color: '#5a7a50',
    maxWidth: 400,
    lineHeight: 1.6,
  },
  email: {
    fontSize: 13,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
    marginTop: 2,
  },
  saveIndicator: {
    fontSize: 13,
    fontFamily: "'DM Mono', monospace",
    fontWeight: 500,
    minWidth: 80,
    textAlign: 'right',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 28,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: '#5a7a50',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: "'DM Mono', monospace",
  },
  input: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.2)',
    borderRadius: 8,
    padding: '10px 14px',
    color: '#c8e6c0',
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  hint: {
    fontSize: 11,
    color: '#3a5a40',
    fontFamily: "'DM Mono', monospace",
  },
  radioRow: {
    display: 'flex',
    gap: 8,
  },
  radioBtn: {
    flex: 1,
    padding: '10px 14px',
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.15)',
    borderRadius: 8,
    color: '#5a7a50',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
  },
  radioBtnActive: {
    background: 'rgba(94,200,80,0.12)',
    border: '1px solid rgba(94,200,80,0.4)',
    color: '#5ec850',
  },
  optionGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.12)',
    borderRadius: 8,
    color: '#5a7a50',
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
    textTransform: 'capitalize',
  },
  optionBtnActive: {
    background: 'rgba(94,200,80,0.12)',
    border: '1px solid rgba(94,200,80,0.4)',
    color: '#5ec850',
  },
  optionLabel: {
    textTransform: 'capitalize',
  },
  starRow: {
    display: 'flex',
    gap: 4,
  },
  starBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    padding: 2,
    lineHeight: 1,
  },
  themeSection: {
    marginTop: 48,
    paddingTop: 24,
    borderTop: '1px solid rgba(94,200,80,0.1)',
  },
  themeSectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
    fontWeight: 700,
    color: '#d4b030',
    marginBottom: 4,
  },
  themeSectionSub: {
    color: '#5a7a50',
    fontSize: 13,
    marginBottom: 16,
  },
  themeCardsRow: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
  },
  themeCard: {
    flex: '1 1 220px',
    maxWidth: 280,
    background: 'rgba(12,28,14,0.95)',
    borderRadius: 12,
    padding: 16,
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s',
    position: 'relative',
  },
  themeCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    background: '#5ec850',
    color: '#0a1a10',
    borderRadius: '50%',
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
  },
  themeMini: {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  themeCardName: {
    fontWeight: 600,
    fontSize: 14,
    marginTop: 12,
    marginBottom: 8,
  },
  themePreviewBtn: {
    background: 'rgba(74,172,240,0.1)',
    border: '1px solid rgba(74,172,240,0.3)',
    borderRadius: 6,
    padding: '4px 12px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    color: '#4aacf0',
    cursor: 'pointer',
    outline: 'none',
  },
  dataSection: {
    marginTop: 48,
    paddingTop: 24,
    borderTop: '1px solid rgba(94,200,80,0.1)',
  },
  dataSectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
    fontWeight: 700,
    color: '#4aacf0',
    marginBottom: 16,
  },
  dataActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  exportBtn: {
    padding: '10px 20px',
    background: 'rgba(74,172,240,0.1)',
    border: '1px solid rgba(74,172,240,0.3)',
    borderRadius: 8,
    color: '#4aacf0',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
  },
  dataHint: {
    fontSize: 13,
    color: '#5a7a50',
    lineHeight: 1.4,
  },
};
