'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AssetImg from '../assetHelper';
import ToolFrame from '../island/ToolFrame.jsx';

// ─── Static reference data — 21 skeleton sets + 14 standalones ───────────────
// Verified against Nookipedia /nh/fossils/all + /nh/fossils/individuals.
// 73 individual fossils total.

// Generated from /nh/fossils/all + /nh/fossils/individuals (Nookipedia API).
// 21 skeleton sets · 59 set-piece fossils · 14 standalones = 73 individual fossils.
const SKELETON_SETS = [
  { name: 'Ankylosaurus', room: 2, parts: ['ankylo skull', 'ankylo tail', 'ankylo torso'] },
  { name: 'Archelon', room: 2, parts: ['archelon skull', 'archelon tail'] },
  { name: 'Brachiosaurus', room: 2, parts: ['brachio chest', 'brachio pelvis', 'brachio skull', 'brachio tail'] },
  { name: 'Deinonychus', room: 2, parts: ['deinony tail', 'deinony torso'] },
  { name: 'Dimetrodon', room: 2, parts: ['dimetrodon skull', 'dimetrodon torso'] },
  { name: 'Diplodocus', room: 2, parts: ['diplo chest', 'diplo neck', 'diplo pelvis', 'diplo skull', 'diplo tail', 'diplo tail tip'] },
  { name: 'Iguanodon', room: 2, parts: ['iguanodon skull', 'iguanodon tail', 'iguanodon torso'] },
  { name: 'Mammoth', room: 3, parts: ['mammoth skull', 'mammoth torso'] },
  { name: 'Megacerops', room: 3, parts: ['megacero skull', 'megacero tail', 'megacero torso'] },
  { name: 'Megaloceros', room: 3, parts: ['left megalo side', 'right megalo side'] },
  { name: 'Ophthalmosaurus', room: 2, parts: ['ophthalmo skull', 'ophthalmo torso'] },
  { name: 'Pachycephalosaurus', room: 2, parts: ['pachy skull', 'pachy tail'] },
  { name: 'Parasaurolophus', room: 2, parts: ['parasaur skull', 'parasaur tail', 'parasaur torso'] },
  { name: 'Plesiosaurus', room: 2, parts: ['plesio skull', 'plesio tail', 'plesio torso'] },
  { name: 'Pteranodon', room: 2, parts: ['left ptera wing', 'ptera body', 'right ptera wing'] },
  { name: 'Quetzalcoatlus', room: 2, parts: ['left quetzal wing', 'quetzal torso', 'right quetzal wing'] },
  { name: 'Sabertooth Tiger', room: 3, parts: ['sabertooth skull', 'sabertooth tail'] },
  { name: 'Spinosaurus', room: 2, parts: ['spino skull', 'spino tail', 'spino torso'] },
  { name: 'Stegosaurus', room: 2, parts: ['stego skull', 'stego tail', 'stego torso'] },
  { name: 'T. Rex', room: 2, parts: ['T. rex skull', 'T. rex tail', 'T. rex torso'] },
  { name: 'Triceratops', room: 2, parts: ['tricera skull', 'tricera tail', 'tricera torso'] },
];

const STANDALONES = [
  'acanthostega', 'amber', 'ammonite', 'anomalocaris', 'archaeopteryx',
  'australopith', 'coprolite', 'dinosaur track', 'dunkleosteus',
  'eusthenopteron', 'juramaia', 'myllokunmingia', 'shark-tooth pattern',
  'trilobite',
];

const STORAGE_KEY = 'fossil-tracker';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyState() {
  return { found: {}, donated: {} }; // keyed by individual fossil name
}

function statusOf(name, state) {
  if (state.donated[name]) return 'donated';
  if (state.found[name]) return 'found';
  return 'missing';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FossilTracker() {
  const [state, setState] = useState(emptyState());
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | missing | found | donated
  const [activeTab, setActiveTab] = useState('skeletons'); // skeletons | standalones
  const [drawerName, setDrawerName] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState(null);
  const [hoveredTab, setHoveredTab] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r) {
          const parsed = JSON.parse(r.value);
          setState({ ...emptyState(), ...parsed,
            found: { ...(parsed.found || {}) },
            donated: { ...(parsed.donated || {}) } });
        }
      } catch (e) { /* defaults */ }
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setState(next);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(next));
      setSaveMsg('✓ Saved');
      setTimeout(() => setSaveMsg(''), 1500);
    } catch (e) {
      setSaveMsg('✗ Save failed');
      setTimeout(() => setSaveMsg(''), 2000);
    }
  }, []);

  const cycleStatus = (name) => {
    // missing → found → donated → missing
    const s = statusOf(name, state);
    const next = { found: { ...state.found }, donated: { ...state.donated } };
    if (s === 'missing') next.found[name] = true;
    else if (s === 'found') { delete next.found[name]; next.donated[name] = true; }
    else { delete next.donated[name]; }
    persist(next);
  };

  const setStatus = (name, target) => {
    const next = { found: { ...state.found }, donated: { ...state.donated } };
    delete next.found[name];
    delete next.donated[name];
    if (target === 'found') next.found[name] = true;
    if (target === 'donated') next.donated[name] = true;
    persist(next);
  };

  // Drawer
  const openDrawer = useCallback(async (name) => {
    setDrawerName(name);
    setDrawerData(null);
    setDrawerError(null);
    setDrawerLoading(true);
    try {
      const res = await fetch(`/api/nookipedia/nh/fossils/individuals/${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      setDrawerData(await res.json());
    } catch (e) {
      setDrawerError(e.message || 'Failed to load fossil');
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  const closeDrawer = () => {
    setDrawerName(null);
    setDrawerData(null);
    setDrawerError(null);
  };

  // Derived totals
  const totals = useMemo(() => {
    const all = [...SKELETON_SETS.flatMap(s => s.parts), ...STANDALONES];
    const found = all.filter(n => state.found[n]).length;
    const donated = all.filter(n => state.donated[n]).length;
    return { total: all.length, found, donated, missing: all.length - found - donated };
  }, [state]);

  const matchesFilters = useCallback((name) => {
    if (searchTerm && !name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (statusFilter !== 'all' && statusOf(name, state) !== statusFilter) return false;
    return true;
  }, [searchTerm, statusFilter, state]);

  if (loading) {
    return (
      <div style={styles.root}>
        <style>{fontImport}</style>
        <p style={styles.muted}>🦴 Loading fossil data…</p>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <style>{fontImport}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.title}>Fossil Tracker</h1>
            <p style={styles.subtitle}>21 skeletons + 14 standalones · 73 fossils total</p>
          </div>
          {saveMsg && <span style={styles.saveMsg}>{saveMsg}</span>}
        </div>

        {/* Summary */}
        <div style={styles.summaryRow}>
          <SummaryRing label="Donated" value={totals.donated} total={totals.total} color="#5ec850" />
          <SummaryRing label="Found" value={totals.found} total={totals.total} color="#d4b030" />
          <SummaryRing label="Missing" value={totals.missing} total={totals.total} color="#5a7a50" />
        </div>

        {/* Tabs */}
        <div style={styles.tabRow}>
          {[
            { id: 'skeletons', label: 'Skeleton Sets', emoji: '🦖' },
            { id: 'standalones', label: 'Standalones', emoji: '🦴' },
          ].map(t => {
            const isActive = activeTab === t.id;
            const isHovered = hoveredTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                onMouseEnter={() => setHoveredTab(t.id)}
                onMouseLeave={() => setHoveredTab(null)}
                style={{
                  ...styles.tab,
                  background: isActive ? 'rgba(94,200,80,0.15)' : isHovered ? 'rgba(94,200,80,0.08)' : 'transparent',
                  border: `1px solid ${isActive ? '#5ec850' : isHovered ? 'rgba(94,200,80,0.3)' : 'rgba(94,200,80,0.1)'}`,
                  color: isActive ? '#5ec850' : '#c8e6c0',
                }}
              >
                <span style={{ fontSize: 18 }}>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div style={styles.filterRow}>
          <input
            type="text"
            placeholder="Search fossils…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All statuses</option>
            <option value="missing">Missing</option>
            <option value="found">Found (not donated)</option>
            <option value="donated">Donated</option>
          </select>
        </div>
      </div>

      {/* Body */}
      <div style={styles.body}>
        {activeTab === 'skeletons' ? (
          <div style={styles.skeletonGrid}>
            {SKELETON_SETS.map(set => {
              const visibleParts = set.parts.filter(matchesFilters);
              if (visibleParts.length === 0 && (searchTerm || statusFilter !== 'all')) return null;
              const partsToShow = (searchTerm || statusFilter !== 'all') ? visibleParts : set.parts;
              const donated = set.parts.filter(p => state.donated[p]).length;
              const found = set.parts.filter(p => state.found[p]).length;
              const missing = set.parts.length - donated - found;
              const pctDonated = (donated / set.parts.length) * 100;
              const complete = donated === set.parts.length;
              return (
                <div
                  key={set.name}
                  style={{
                    ...styles.skeletonCard,
                    border: complete ? '1px solid #5ec850' : '1px solid rgba(94,200,80,0.1)',
                  }}
                >
                  <div style={styles.skeletonHead}>
                    <div>
                      <h3 style={{ ...styles.skeletonTitle, color: complete ? '#5ec850' : '#c8e6c0' }}>
                        {complete && '✓ '}{set.name}
                      </h3>
                      <div style={styles.skeletonMeta}>
                        Room {set.room} · {donated}/{set.parts.length} donated
                        {found > 0 && <span style={{ color: '#d4b030' }}> · {found} found</span>}
                        {missing > 0 && <span style={{ color: '#5a7a50' }}> · {missing} missing</span>}
                      </div>
                    </div>
                  </div>
                  <div style={styles.progressTrack}>
                    <div style={{ ...styles.progressFill, width: `${pctDonated}%`, background: '#5ec850' }} />
                  </div>
                  <div style={styles.partRow}>
                    {partsToShow.map(part => (
                      <FossilCell
                        key={part}
                        name={part}
                        status={statusOf(part, state)}
                        onCycle={() => cycleStatus(part)}
                        onOpen={() => openDrawer(part)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.standaloneGrid}>
            {STANDALONES.filter(matchesFilters).map(name => (
              <FossilCell
                key={name}
                name={name}
                status={statusOf(name, state)}
                onCycle={() => cycleStatus(name)}
                onOpen={() => openDrawer(name)}
                large
              />
            ))}
            {STANDALONES.filter(matchesFilters).length === 0 && (
              <div style={styles.muted}>No standalones match the current filters.</div>
            )}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {drawerName && (
        <>
          <div style={styles.drawerOverlay} onClick={closeDrawer} />
          <div style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <div>
                <h3 style={styles.drawerTitle}>{drawerName}</h3>
                <span style={styles.drawerStatus}>
                  Status: <strong style={{ color: statusColor(statusOf(drawerName, state)) }}>
                    {statusOf(drawerName, state)}
                  </strong>
                </span>
              </div>
              <button onClick={closeDrawer} style={styles.drawerClose}>✕</button>
            </div>

            <div style={styles.drawerBody}>
              <div style={styles.drawerActions}>
                {[
                  { id: 'missing', label: 'Missing', color: '#5a7a50' },
                  { id: 'found',   label: 'Found',   color: '#d4b030' },
                  { id: 'donated', label: 'Donated', color: '#5ec850' },
                ].map(b => (
                  <button
                    key={b.id}
                    onClick={() => setStatus(drawerName, b.id)}
                    style={{
                      ...styles.statusBtn,
                      background: statusOf(drawerName, state) === b.id
                        ? `${b.color}33`
                        : 'transparent',
                      borderColor: statusOf(drawerName, state) === b.id ? b.color : 'rgba(94,200,80,0.15)',
                      color: statusOf(drawerName, state) === b.id ? b.color : '#c8e6c0',
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {drawerLoading && <p style={styles.muted}>Loading details…</p>}
              {drawerError && (
                <div style={styles.errorBox}>API error: {drawerError}</div>
              )}
              {drawerData && (
                <>
                  <div style={styles.drawerImageWrap}>
                    {drawerData.image_url
                      ? <img src={drawerData.image_url} alt={drawerData.name} style={styles.drawerImage} />
                      : <AssetImg category="fossils" name={drawerName} size={120} fallback="🦴" />}
                  </div>
                  <div style={styles.drawerStatsGrid}>
                    {drawerData.sell != null && (
                      <DrawerStat label="Sells for" value={`${drawerData.sell.toLocaleString()} bells`} color="#d4b030" />
                    )}
                    {drawerData.hha_base != null && (
                      <DrawerStat label="HHA base" value={drawerData.hha_base} color="#4aacf0" />
                    )}
                    {drawerData.fossil_group && (
                      <DrawerStat label="Group" value={drawerData.fossil_group} color="#c8e6c0" />
                    )}
                    {(drawerData.width || drawerData.length) && (
                      <DrawerStat label="Size" value={`${drawerData.width || '?'}×${drawerData.length || '?'}`} color="#5a7a50" />
                    )}
                  </div>
                  {Array.isArray(drawerData.colors) && drawerData.colors.length > 0 && (
                    <div style={styles.drawerSection}>
                      <div style={styles.drawerSectionTitle}>Colors</div>
                      <div style={styles.colorChips}>
                        {drawerData.colors.map(c => (
                          <span key={c} style={styles.colorChip}>{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {drawerData.url && (
                    <a href={drawerData.url} target="_blank" rel="noopener noreferrer" style={styles.wikiLink}>
                      View on Nookipedia ↗
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function FossilCell({ name, status, onCycle, onOpen, large = false }) {
  const [hovered, setHovered] = useState(false);
  const colors = {
    missing: { bg: 'rgba(12,28,14,0.95)', border: 'rgba(94,200,80,0.1)', text: '#c8e6c0' },
    found:   { bg: 'rgba(212,176,48,0.08)', border: 'rgba(212,176,48,0.4)', text: '#d4b030' },
    donated: { bg: 'rgba(94,200,80,0.12)', border: 'rgba(94,200,80,0.5)', text: '#5ec850' },
  };
  const c = colors[status];
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: c.bg,
        border: `1px solid ${hovered ? '#5ec850' : c.border}`,
        borderRadius: 6,
        padding: large ? 12 : 8,
        display: 'flex',
        flexDirection: large ? 'column' : 'row',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        outline: 'none',
        transform: hovered ? 'translateY(-1px) scale(1.01)' : 'none',
        transition: 'background-color 0.3s ease, border-color 0.3s ease, transform 0.2s ease',
        minWidth: large ? 140 : undefined,
      }}
    >
      <button
        onClick={onOpen}
        style={{
          background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
          outline: 'none', display: 'flex', alignItems: 'center', gap: 8, flex: 1, color: 'inherit',
          fontFamily: "'DM Sans', sans-serif",
        }}
        title={`Open ${name} details`}
      >
        <AssetImg category="fossils" name={name} size={large ? 56 : 36} fallback="🦴" />
        <span style={{
          fontSize: large ? 13 : 12,
          color: c.text,
          fontFamily: "'DM Sans', sans-serif",
          textTransform: 'capitalize',
          textAlign: large ? 'center' : 'left',
          fontWeight: 500,
          lineHeight: 1.3,
          flex: 1,
        }}>
          {name}
        </span>
      </button>
      <button
        onClick={onCycle}
        style={{
          minWidth: 28, height: 28, borderRadius: 4,
          background: status === 'donated'
            ? 'rgba(94,200,80,0.25)'
            : status === 'found' ? 'rgba(212,176,48,0.2)' : 'rgba(94,200,80,0.05)',
          border: `1px solid ${
            status === 'donated' ? '#5ec850' : status === 'found' ? '#d4b030' : 'rgba(94,200,80,0.2)'
          }`,
          color: status === 'donated' ? '#5ec850' : status === 'found' ? '#d4b030' : '#5a7a50',
          cursor: 'pointer', outline: 'none',
          fontFamily: "'DM Mono', monospace", fontSize: 13,
          transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
        }}
        title={`Cycle status (currently ${status})`}
      >
        {status === 'donated' ? '✓' : status === 'found' ? '◐' : '○'}
      </button>
    </div>
  );
}

function SummaryRing({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const circumference = 2 * Math.PI * 28;
  const dash = (pct / 100) * circumference;
  return (
    <div style={styles.summaryCard}>
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r="28" fill="none" stroke="rgba(94,200,80,0.1)" strokeWidth="6" />
        <circle
          cx="38" cy="38" r="28" fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 38 38)"
        />
        <text x="38" y="42" textAnchor="middle" fill={color}
          style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 500 }}>
          {pct}%
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ ...styles.summaryLabel, color }}>{label}</span>
        <span style={styles.summaryValue}>{value} / {total}</span>
      </div>
    </div>
  );
}

function DrawerStat({ label, value, color }) {
  return (
    <ToolFrame
      host="isabelle"
      background="/island/tool-backgrounds/museum-journal.webp"
      greeting="Found a fossil? Let's identify it and see if it's one Blathers needs!"
    >
    <div style={styles.statBox}>
      <div style={styles.statBoxLabel}>{label}</div>
      <div style={{ ...styles.statBoxValue, color }}>{value}</div>
    </div>
    </ToolFrame>
  );
}

function statusColor(s) {
  return s === 'donated' ? '#5ec850' : s === 'found' ? '#d4b030' : '#5a7a50';
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
  },
  header: { marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 },
  headerTop: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  title: { fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 32, color: '#5ec850', margin: 0 },
  subtitle: { color: '#5a7a50', fontSize: 14, margin: '4px 0 0 0' },
  saveMsg: { fontFamily: "'DM Mono', monospace", color: '#d4b030', fontSize: 13 },

  summaryRow: { display: 'flex', flexWrap: 'wrap', gap: 14 },
  summaryCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'rgba(12,28,14,0.95)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8, padding: '10px 16px',
  },
  summaryLabel: {
    fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13,
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  summaryValue: { fontFamily: "'DM Mono', monospace", fontSize: 14, color: '#c8e6c0' },

  tabRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  tab: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 16px', borderRadius: 6, fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
    cursor: 'pointer', outline: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
  },

  filterRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  searchInput: {
    flex: 1, minWidth: 200,
    background: 'rgba(12,28,14,0.95)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 6, padding: '8px 12px', color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none',
  },
  select: {
    background: 'rgba(12,28,14,0.95)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 6, padding: '8px 12px', color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none',
  },

  body: { display: 'flex', flexDirection: 'column', gap: 14 },
  skeletonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
    gap: 12,
  },
  skeletonCard: {
    background: 'rgba(12,28,14,0.95)',
    borderRadius: 8, padding: 14,
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  skeletonHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  skeletonTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, margin: 0 },
  skeletonMeta: { color: '#5a7a50', fontSize: 12, fontFamily: "'DM Mono', monospace", marginTop: 2 },
  progressTrack: { height: 4, background: 'rgba(94,200,80,0.08)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, transition: 'width 0.4s ease' },
  partRow: { display: 'flex', flexDirection: 'column', gap: 6 },

  standaloneGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 10,
  },

  muted: { color: '#5a7a50', fontSize: 13, padding: 16, textAlign: 'center' },
  errorBox: {
    background: 'rgba(255,100,100,0.08)', border: '1px solid rgba(255,100,100,0.3)',
    borderRadius: 6, padding: 10, color: '#ff6464', fontSize: 13,
  },

  // Drawer
  drawerOverlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 100,
  },
  drawer: {
    position: 'fixed', top: 0, right: 0, bottom: 0,
    width: 'min(420px, 100vw)',
    background: '#0a1a10',
    borderLeft: '1px solid rgba(94,200,80,0.2)',
    boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
    zIndex: 101,
    display: 'flex', flexDirection: 'column',
  },
  drawerHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: 18, borderBottom: '1px solid rgba(94,200,80,0.1)',
  },
  drawerTitle: {
    fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700,
    color: '#5ec850', margin: 0, textTransform: 'capitalize',
  },
  drawerStatus: { fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#5a7a50' },
  drawerClose: {
    background: 'transparent', border: 'none', color: '#c8e6c0',
    cursor: 'pointer', fontSize: 22, outline: 'none', padding: 4,
  },
  drawerBody: {
    padding: 18, overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  drawerActions: { display: 'flex', gap: 6 },
  statusBtn: {
    flex: 1, padding: '8px 12px', borderRadius: 6,
    border: '1px solid', fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
    fontSize: 13, cursor: 'pointer', outline: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
  },
  drawerImageWrap: {
    background: 'rgba(12,28,14,0.95)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8, padding: 24,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  drawerImage: { maxWidth: '100%', maxHeight: 200, objectFit: 'contain' },
  drawerStatsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8,
  },
  statBox: {
    background: 'rgba(12,28,14,0.5)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 6, padding: 10, display: 'flex', flexDirection: 'column', gap: 4,
  },
  statBoxLabel: {
    fontSize: 11, color: '#5a7a50', textTransform: 'uppercase',
    letterSpacing: '0.05em', fontWeight: 700,
  },
  statBoxValue: { fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 500 },
  drawerSection: { display: 'flex', flexDirection: 'column', gap: 6 },
  drawerSectionTitle: {
    fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12,
    color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  colorChips: { display: 'flex', flexWrap: 'wrap', gap: 4 },
  colorChip: {
    fontFamily: "'DM Mono', monospace", fontSize: 11,
    padding: '3px 8px', borderRadius: 3,
    background: 'rgba(74,172,240,0.08)', color: '#4aacf0',
    border: '1px solid rgba(74,172,240,0.3)',
  },
  wikiLink: {
    color: '#4aacf0', fontFamily: "'DM Sans', sans-serif", fontSize: 13,
    textDecoration: 'none', alignSelf: 'flex-start',
    padding: '6px 0',
  },
};
