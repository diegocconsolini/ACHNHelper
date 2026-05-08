'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ToolFrame from '../island/ToolFrame.jsx';

// ─── Themes ───────────────────────────────────────────────────────────────────

const THEMES = {
  forest: {
    name: 'Forest',
    bg1: '#0a1a10', bg2: '#1a2e22',
    accent: '#5ec850', accentSoft: 'rgba(94,200,80,0.4)',
    text: '#c8e6c0', muted: '#5a7a50',
    titleColor: '#5ec850',
  },
  sunrise: {
    name: 'Sunrise',
    bg1: '#3a1d0a', bg2: '#5a2f12',
    accent: '#d4b030', accentSoft: 'rgba(212,176,48,0.5)',
    text: '#fff5d6', muted: '#a08850',
    titleColor: '#ffd76a',
  },
  ocean: {
    name: 'Ocean',
    bg1: '#0a1a2a', bg2: '#143150',
    accent: '#4aacf0', accentSoft: 'rgba(74,172,240,0.4)',
    text: '#d6ecff', muted: '#5a7c98',
    titleColor: '#4aacf0',
  },
  cherry: {
    name: 'Cherry',
    bg1: '#2a0a1a', bg2: '#4a1430',
    accent: '#ff86b4', accentSoft: 'rgba(255,134,180,0.4)',
    text: '#ffd6e6', muted: '#a8607c',
    titleColor: '#ffb0d0',
  },
};

// Storage keys for progress reads — pulls in only what users actually fill.
// All optional; missing keys produce no row. None of these values are
// fabricated — they come from whatever the user has stored locally.
const PROGRESS_SOURCES = [
  {
    label: 'Museum',
    key: 'museum-tracker',
    parse: v => {
      const all = ['fish', 'bugs', 'sea', 'fossils', 'art'];
      const totals = { fish: 80, bugs: 80, sea: 40, fossils: 73, art: 43 };
      let donated = 0, total = 0;
      for (const sec of all) {
        const obj = v?.[sec];
        if (obj && typeof obj === 'object') {
          donated += Object.keys(obj).filter(k => obj[k] === true || obj[k] === 'donated').length;
        }
        total += totals[sec];
      }
      return total ? `${donated}/${total}` : null;
    },
  },
  {
    label: 'Fish',
    key: 'fish-tracker',
    parse: v => v && typeof v === 'object'
      ? `${Object.values(v).filter(x => x === true || x === 'caught' || x === 'donated').length}/80`
      : null,
  },
  {
    label: 'Bugs',
    key: 'bug-tracker',
    parse: v => v && typeof v === 'object'
      ? `${Object.values(v).filter(x => x === true || x === 'caught' || x === 'donated').length}/80`
      : null,
  },
  {
    label: 'Sea',
    key: 'sea-creature-tracker',
    parse: v => v && typeof v === 'object'
      ? `${Object.values(v).filter(x => x === true || x === 'caught' || x === 'donated').length}/40`
      : null,
  },
  {
    label: 'Fossils',
    key: 'fossil-tracker',
    parse: v => {
      if (!v) return null;
      const donated = v.donated ? Object.keys(v.donated).filter(k => v.donated[k]).length : 0;
      return `${donated}/73`;
    },
  },
  {
    label: 'Art',
    key: 'art-detector',
    parse: v => v && typeof v === 'object'
      ? `${Object.values(v).filter(x => x === true || x === 'donated').length}/43`
      : null,
  },
  {
    label: 'DIY',
    key: 'acnh-diy-tracker',
    parse: v => v && typeof v === 'object'
      ? `${Object.values(v).filter(x => x === true || x === 'learned').length}`
      : null,
  },
  {
    label: 'K.K. Songs',
    key: 'kk-catalogue',
    parse: v => v && typeof v === 'object'
      ? `${Object.values(v).filter(x => x === true || x === 'owned').length}/107`
      : null,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}

async function readStorage(key) {
  try {
    const r = await window.storage.get(key);
    return r ? safeParse(r.value) : null;
  } catch { return null; }
}

// Canvas card renderer. Handles all drawing in one function so we don't
// depend on html2canvas or similar.
function drawCard(canvas, { theme, profile, progress, residents }) {
  const W = 1200, H = 630; // OG-ratio friendly
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, theme.bg1);
  bg.addColorStop(1, theme.bg2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Decorative top border
  ctx.fillStyle = theme.accent;
  ctx.fillRect(0, 0, W, 6);

  // Card frame
  ctx.strokeStyle = theme.accentSoft;
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  // Title
  ctx.fillStyle = theme.titleColor;
  ctx.font = '900 56px "Playfair Display", Georgia, serif';
  ctx.textBaseline = 'top';
  ctx.fillText(profile.island_name || 'My Island', 80, 80);

  // Subtitle row
  ctx.fillStyle = theme.muted;
  ctx.font = '500 22px "DM Sans", sans-serif';
  const subBits = [];
  if (profile.hemisphere) subBits.push(`${profile.hemisphere === 'north' ? '🌐 Northern' : '🌐 Southern'} Hemisphere`);
  if (profile.native_fruit) subBits.push(`🍎 Native ${profile.native_fruit}`);
  if (profile.native_flower) subBits.push(`🌸 ${profile.native_flower}`);
  ctx.fillText(subBits.join(' · '), 80, 156);

  // Friend code / dream address row
  ctx.fillStyle = theme.text;
  ctx.font = '500 18px "DM Mono", monospace';
  let infoY = 200;
  if (profile.friend_code) {
    ctx.fillText(`Friend code: ${profile.friend_code}`, 80, infoY);
    infoY += 28;
  }
  if (profile.dream_address) {
    ctx.fillText(`Dream address: ${profile.dream_address}`, 80, infoY);
    infoY += 28;
  }
  if (profile.island_rating) {
    ctx.fillStyle = theme.accent;
    ctx.fillText(`★ ${profile.island_rating} rating`, 80, infoY);
    infoY += 28;
  }

  // Divider
  ctx.strokeStyle = theme.accentSoft;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, infoY + 16);
  ctx.lineTo(W - 80, infoY + 16);
  ctx.stroke();

  // Progress section title
  let bodyY = infoY + 50;
  ctx.fillStyle = theme.accent;
  ctx.font = '700 24px "Playfair Display", Georgia, serif';
  ctx.fillText('Collection Progress', 80, bodyY);
  bodyY += 40;

  // Progress chips — 4 per row
  if (progress.length > 0) {
    const chipW = 240, chipH = 60, gap = 14;
    progress.forEach((p, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const x = 80 + col * (chipW + gap);
      const y = bodyY + row * (chipH + gap);
      // chip background
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(x, y, chipW, chipH);
      ctx.strokeStyle = theme.accentSoft;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, chipW, chipH);
      // label
      ctx.fillStyle = theme.muted;
      ctx.font = '500 14px "DM Sans", sans-serif';
      ctx.fillText(p.label.toUpperCase(), x + 14, y + 10);
      // value
      ctx.fillStyle = theme.text;
      ctx.font = '700 22px "DM Mono", monospace';
      ctx.fillText(p.value, x + 14, y + 30);
    });
    const rows = Math.ceil(progress.length / 4);
    bodyY += rows * (chipH + gap) + 8;
  } else {
    ctx.fillStyle = theme.muted;
    ctx.font = '400 16px "DM Sans", sans-serif';
    ctx.fillText('No collection data tracked yet.', 80, bodyY);
    bodyY += 40;
  }

  // Residents
  if (residents && residents.length > 0) {
    ctx.fillStyle = theme.accent;
    ctx.font = '700 22px "Playfair Display", Georgia, serif';
    ctx.fillText('Villagers', 80, bodyY);
    bodyY += 36;
    ctx.fillStyle = theme.text;
    ctx.font = '500 16px "DM Sans", sans-serif';
    const text = residents.slice(0, 10).join('   ·   ');
    // Word-wrap into max 2 lines
    const lines = wrapText(ctx, text, W - 160);
    lines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, 80, bodyY + i * 26);
    });
  }

  // Footer
  ctx.fillStyle = theme.muted;
  ctx.font = '500 14px "DM Mono", monospace';
  ctx.fillText('acnh-portal.vercel.app', 80, H - 70);
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function IslandCard() {
  const [profile, setProfile] = useState({});
  const [progress, setProgress] = useState([]);
  const [residents, setResidents] = useState([]);
  const [theme, setTheme] = useState('forest');
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(null); // null until checked
  const [saveMsg, setSaveMsg] = useState('');
  const canvasRef = useRef(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    // Profile from API (or fallback to manual fields)
    let prof = {};
    try {
      const r = await fetch('/api/profile');
      if (r.ok) {
        prof = await r.json();
        setAuthed(true);
      } else if (r.status === 401) {
        setAuthed(false);
      }
    } catch { setAuthed(false); }
    setProfile(prof || {});

    // Progress
    const out = [];
    for (const src of PROGRESS_SOURCES) {
      const v = await readStorage(src.key);
      const formatted = src.parse(v);
      if (formatted) out.push({ label: src.label, value: formatted });
    }
    setProgress(out);

    // Residents from villager-compatibility
    const compat = await readStorage('villager-compatibility');
    if (compat && Array.isArray(compat.residents)) {
      setResidents(compat.residents.map(r => r.name));
    } else {
      setResidents([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Re-render canvas when data/theme change
  useEffect(() => {
    if (loading || !canvasRef.current) return;
    drawCard(canvasRef.current, {
      theme: THEMES[theme],
      profile,
      progress,
      residents,
    });
  }, [loading, theme, profile, progress, residents]);

  const downloadPng = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `${(profile.island_name || 'island').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-card.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    setSaveMsg('✓ Downloaded');
    setTimeout(() => setSaveMsg(''), 1500);
  };

  const updateProfileField = async (field, value) => {
    setProfile(p => ({ ...p, [field]: value }));
  };

  const saveProfile = async () => {
    try {
      const r = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          island_name: profile.island_name || '',
          hemisphere: profile.hemisphere || '',
          native_fruit: profile.native_fruit || '',
          native_flower: profile.native_flower || '',
          friend_code: profile.friend_code || '',
          dream_address: profile.dream_address || '',
          island_rating: profile.island_rating || '',
        }),
      });
      if (r.ok) {
        setSaveMsg('✓ Profile saved');
      } else if (r.status === 401) {
        setSaveMsg('Sign in to save profile');
      } else {
        setSaveMsg('✗ Save failed');
      }
      setTimeout(() => setSaveMsg(''), 1800);
    } catch (e) {
      setSaveMsg('✗ Save failed');
      setTimeout(() => setSaveMsg(''), 1800);
    }
  };

  return (
    <ToolFrame
      host="isabelle"
      background="/island/tool-backgrounds/island-misc.webp"
      greeting="Your official island business card! Show it off to friends from other islands."
    >
    <div style={styles.root}>
      <style>{fontImport}</style>

      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.title}>Island Card</h1>
            <p style={styles.subtitle}>Generate a shareable island profile · pulls from your tracked progress</p>
          </div>
          {saveMsg && <span style={styles.saveMsg}>{saveMsg}</span>}
        </div>
      </div>

      {/* Theme picker */}
      <div style={styles.themeRow}>
        <span style={styles.fieldLabel}>Theme:</span>
        {Object.entries(THEMES).map(([id, t]) => (
          <button
            key={id}
            onClick={() => setTheme(id)}
            style={{
              ...styles.themeBtn,
              background: t.bg2,
              border: `2px solid ${theme === id ? t.accent : 'transparent'}`,
              color: t.text,
            }}
          >
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: t.accent, marginRight: 6 }}></span>
            {t.name}
          </button>
        ))}
      </div>

      {/* Card preview */}
      <div style={styles.previewWrap}>
        <canvas
          ref={canvasRef}
          style={styles.canvas}
        />
      </div>

      {/* Actions */}
      <div style={styles.actionsRow}>
        <button onClick={downloadPng} style={styles.primaryBtn}>⬇ Download PNG</button>
        <button onClick={refresh} style={styles.secondaryBtn}>↻ Refresh data</button>
        {authed && <button onClick={saveProfile} style={styles.secondaryBtn}>💾 Save profile</button>}
      </div>

      {/* Profile editor */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Profile fields</h2>
        {authed === false && (
          <p style={styles.note}>Sign in to load and persist your profile. Without a session, fields below only update the preview locally.</p>
        )}
        <div style={styles.fieldGrid}>
          <Field label="Island name" value={profile.island_name || ''} onChange={v => updateProfileField('island_name', v)} placeholder="e.g. Yew Island" />
          <Field label="Hemisphere" value={profile.hemisphere || ''} onChange={v => updateProfileField('hemisphere', v)} placeholder="north / south" />
          <Field label="Native fruit" value={profile.native_fruit || ''} onChange={v => updateProfileField('native_fruit', v)} placeholder="apple, cherry, …" />
          <Field label="Native flower" value={profile.native_flower || ''} onChange={v => updateProfileField('native_flower', v)} placeholder="rose, lily, …" />
          <Field label="Friend code" value={profile.friend_code || ''} onChange={v => updateProfileField('friend_code', v)} placeholder="SW-0000-0000-0000" />
          <Field label="Dream address" value={profile.dream_address || ''} onChange={v => updateProfileField('dream_address', v)} placeholder="DA-0000-0000-0000" />
          <Field label="Island rating" value={profile.island_rating || ''} onChange={v => updateProfileField('island_rating', v)} placeholder="3-star, 5-star, …" />
        </div>
      </div>

      <p style={styles.helpText}>
        The card pulls collection progress from your tracked tools (Museum, Fish, Bugs, Sea, Fossils, Art, DIY, K.K. Songs) and resident names from Villager Compatibility. Tools you haven't used yet are silently skipped.
      </p>
    </div>
    </ToolFrame>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label style={styles.fieldRow}>
      <span style={styles.fieldLabel}>{label}</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.fieldInput}
      />
    </label>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`;

const styles = {
  root: {
    background: '#0a1a10',
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif",
    minHeight: '100%',
    padding: 20,
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  header: { display: 'flex', flexDirection: 'column', gap: 6 },
  headerTop: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  title: { fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 32, color: '#5ec850', margin: 0 },
  subtitle: { color: '#5a7a50', fontSize: 14, margin: '4px 0 0 0' },
  saveMsg: { fontFamily: "'DM Mono', monospace", color: '#d4b030', fontSize: 13 },

  themeRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  themeBtn: {
    cursor: 'pointer', outline: 'none',
    padding: '6px 12px', borderRadius: 6,
    fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
    transition: 'border-color 0.3s ease, transform 0.3s ease',
  },

  previewWrap: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8, padding: 12,
    display: 'flex', justifyContent: 'center',
  },
  canvas: {
    width: '100%',
    maxWidth: 1200,
    height: 'auto',
    borderRadius: 4,
    background: '#000',
  },

  actionsRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  primaryBtn: {
    background: '#5ec850', color: '#0a1a10',
    border: '1px solid #5ec850', borderRadius: 6,
    padding: '8px 18px', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14,
    cursor: 'pointer', outline: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease',
  },
  secondaryBtn: {
    background: 'transparent', color: '#c8e6c0',
    border: '1px solid rgba(94,200,80,0.3)', borderRadius: 6,
    padding: '8px 18px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 14,
    cursor: 'pointer', outline: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
  },

  card: {
    background: 'rgba(12,28,14,0.95)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8, padding: 14,
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  cardTitle: {
    fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700,
    color: '#5ec850', margin: 0,
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 10,
  },
  fieldRow: { display: 'flex', flexDirection: 'column', gap: 4 },
  fieldLabel: { fontSize: 12, color: '#5a7a50', fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' },
  fieldInput: {
    background: 'rgba(12,28,14,0.95)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 4, padding: '8px 10px', color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none',
  },
  note: {
    color: '#d4b030', fontSize: 13, margin: 0,
    background: 'rgba(212,176,48,0.08)', border: '1px solid rgba(212,176,48,0.2)',
    borderRadius: 6, padding: 10,
  },
  helpText: { color: '#5a7a50', fontSize: 12, margin: 0, lineHeight: 1.5 },
};
