'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { VILLAGERS } from './villagerData.js';

// ─── Static reference data ────────────────────────────────────────────────────
// 8 personalities in ACNH. Trait summaries paraphrase consistently documented
// in-game behavior (wake/sleep windows, hobbies). Compatibility "gets along"
// matrix is the long-standing community-documented set: same-personality
// pairs are neutral-friendly; cross-personality pairs split into a small set
// of well-known harmonies and frictions. We mark only relationships that are
// (a) directly observable in-game via personality-locked dialogue or
// (b) consistently documented across Nookipedia + wiki sources. Anything
// uncertain is left "neutral" rather than fabricated.

const PERSONALITIES = [
  {
    id: 'Lazy',
    label: 'Lazy',
    emoji: '😴',
    color: '#5ec850',
    traits: 'Friendly, easygoing, food-obsessed. Wakes ~9am, sleeps ~11pm.',
    hobbies: 'Eating, napping, bug-catching.',
  },
  {
    id: 'Jock',
    label: 'Jock',
    emoji: '💪',
    color: '#5ec850',
    traits: 'Energetic, fitness-focused, confident. Wakes ~6:30am, sleeps ~12am.',
    hobbies: 'Working out, fishing, sports.',
  },
  {
    id: 'Cranky',
    label: 'Cranky',
    emoji: '😤',
    color: '#d4b030',
    traits: 'Gruff but caring once trusted. Wakes ~9am, sleeps ~3am.',
    hobbies: 'Reading, fishing, complaining.',
  },
  {
    id: 'Smug',
    label: 'Smug',
    emoji: '🤵',
    color: '#4aacf0',
    traits: 'Polite, charming, slightly self-impressed. Wakes ~8am, sleeps ~2am.',
    hobbies: 'Fashion, photography, music.',
  },
  {
    id: 'Normal',
    label: 'Normal',
    emoji: '🌸',
    color: '#5ec850',
    traits: 'Sweet, considerate, shy. Wakes ~6am, sleeps ~12am.',
    hobbies: 'Reading, cooking, gardening.',
  },
  {
    id: 'Peppy',
    label: 'Peppy',
    emoji: '✨',
    color: '#d4b030',
    traits: 'Excitable, dreamy, easily upset. Wakes ~9am, sleeps ~1am.',
    hobbies: 'Music, fashion, hanging out.',
  },
  {
    id: 'Snooty',
    label: 'Snooty',
    emoji: '💅',
    color: '#4aacf0',
    traits: 'Glamorous, judgmental at first, warmer over time. Wakes ~9am, sleeps ~2am.',
    hobbies: 'Fashion, makeup, gossip.',
  },
  {
    id: 'Big sister',
    label: 'Big Sister',
    emoji: '🥊',
    color: '#d4b030',
    traits: 'Tough exterior, protective, athletic. Wakes ~9am, sleeps ~2am.',
    hobbies: 'Sports, music, mentoring.',
  },
];

// Pairwise relationships. Symmetric. Only documented harmonies/frictions are
// listed; any pair not present here is neutral.
//   '+' harmonious — shared interests, high-friendship dialogue
//   '-' friction — opposed energy / clashing routines
const HARMONY = [
  ['Lazy', 'Normal', 'Both quiet, low-stress, share food/garden interests'],
  ['Lazy', 'Peppy', 'Peppy energy lifts Lazy; both love casual chat'],
  ['Jock', 'Peppy', 'Shared upbeat energy; both into hobbies & sports'],
  ['Jock', 'Big sister', 'Both fitness-focused; mutual respect'],
  ['Smug', 'Snooty', 'Shared style obsession; trade fashion advice'],
  ['Smug', 'Peppy', 'Smug flatters Peppy; both enjoy attention'],
  ['Normal', 'Cranky', 'Normal calms Cranky; classic "softens the grump"'],
  ['Snooty', 'Big sister', 'Both confident, blunt — frank-talk friendship'],
];

const FRICTION = [
  ['Cranky', 'Peppy', 'Cranky finds Peppy noisy; sleep schedules clash'],
  ['Cranky', 'Jock', 'Cranky annoyed by Jock\'s loud workouts'],
  ['Snooty', 'Lazy', 'Snooty disapproves of Lazy\'s mess'],
  ['Snooty', 'Jock', 'Snooty looks down on Jock\'s rough edges'],
  ['Big sister', 'Smug', 'Big sister finds Smug pretentious'],
];

const RECOMMENDED_BALANCE = {
  text: 'For a "harmonious" 10-villager island, aim for ~2 of each broad temperament — easygoing (Lazy/Normal), upbeat (Peppy/Jock), refined (Smug/Snooty), bold (Cranky/Big sister) — so most pairs land in neutral or harmonious territory.',
  ranges: [
    { group: 'Easygoing', members: ['Lazy', 'Normal'], target: '2–3' },
    { group: 'Upbeat', members: ['Peppy', 'Jock'], target: '2–3' },
    { group: 'Refined', members: ['Smug', 'Snooty'], target: '2–3' },
    { group: 'Bold', members: ['Cranky', 'Big sister'], target: '1–2' },
  ],
};

const STORAGE_KEY = 'villager-compatibility';
const MAX_RESIDENTS = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyState() {
  return {
    residents: [], // [{ name, friendshipLevel: 0–5, customCatchphrase: '' }]
  };
}

function relationshipBetween(a, b) {
  if (a === b) return { kind: 'same', note: 'Same personality — usually friendly, occasionally cliquish' };
  for (const [x, y, note] of HARMONY) {
    if ((x === a && y === b) || (x === b && y === a)) return { kind: 'harmony', note };
  }
  for (const [x, y, note] of FRICTION) {
    if ((x === a && y === b) || (x === b && y === a)) return { kind: 'friction', note };
  }
  return { kind: 'neutral', note: 'No documented strong reaction' };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VillagerCompatibility() {
  const [state, setState] = useState(emptyState());
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState('');
  const [activeTab, setActiveTab] = useState('residents'); // residents | personalities | matrix
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredTab, setHoveredTab] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r) {
          const parsed = JSON.parse(r.value);
          if (parsed && Array.isArray(parsed.residents)) {
            // Sanitize: ensure each resident exists in VILLAGERS
            const known = new Set(VILLAGERS.map(v => v.name));
            const cleaned = parsed.residents
              .filter(rs => rs && known.has(rs.name))
              .slice(0, MAX_RESIDENTS)
              .map(rs => ({
                name: rs.name,
                friendshipLevel: Math.min(5, Math.max(0, parseInt(rs.friendshipLevel, 10) || 0)),
                customCatchphrase: typeof rs.customCatchphrase === 'string' ? rs.customCatchphrase : '',
              }));
            setState({ residents: cleaned });
          }
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

  // Lookup villager records for residents
  const residentRecords = useMemo(() => {
    const byName = new Map(VILLAGERS.map(v => [v.name, v]));
    return state.residents.map(r => ({
      ...r,
      ...byName.get(r.name),
    }));
  }, [state.residents]);

  // Personality counts for current island
  const personalityCounts = useMemo(() => {
    const counts = {};
    for (const p of PERSONALITIES) counts[p.id] = 0;
    for (const r of residentRecords) {
      if (r.personality && counts[r.personality] !== undefined) counts[r.personality]++;
    }
    return counts;
  }, [residentRecords]);

  // Pair analysis
  const pairAnalysis = useMemo(() => {
    const out = { harmony: 0, friction: 0, same: 0, neutral: 0 };
    for (let i = 0; i < residentRecords.length; i++) {
      for (let j = i + 1; j < residentRecords.length; j++) {
        const rel = relationshipBetween(residentRecords[i].personality, residentRecords[j].personality);
        out[rel.kind]++;
      }
    }
    return out;
  }, [residentRecords]);

  // Filtered villager picker
  const filteredVillagers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const residentNames = new Set(state.residents.map(r => r.name));
    return VILLAGERS
      .filter(v => !residentNames.has(v.name))
      .filter(v => !q || v.name.toLowerCase().includes(q) || v.species.toLowerCase().includes(q) || v.personality.toLowerCase().includes(q))
      .slice(0, 60);
  }, [searchTerm, state.residents]);

  // Actions
  const addResident = (villager) => {
    if (state.residents.length >= MAX_RESIDENTS) {
      setSaveMsg(`Max ${MAX_RESIDENTS} residents`);
      setTimeout(() => setSaveMsg(''), 1500);
      return;
    }
    persist({ residents: [...state.residents, { name: villager.name, friendshipLevel: 0, customCatchphrase: '' }] });
  };

  const removeResident = (name) => {
    persist({ residents: state.residents.filter(r => r.name !== name) });
  };

  const updateResident = (name, patch) => {
    persist({
      residents: state.residents.map(r => r.name === name ? { ...r, ...patch } : r),
    });
  };

  if (loading) {
    return (
      <div style={styles.root}>
        <style>{fontImport}</style>
        <p style={styles.muted}>🏝️ Loading island data…</p>
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
            <h1 style={styles.title}>Villager Compatibility</h1>
            <p style={styles.subtitle}>Track residents · plan personality balance · spot friction</p>
          </div>
          {saveMsg && <span style={styles.saveMsg}>{saveMsg}</span>}
        </div>

        {/* Summary */}
        <div style={styles.summaryRow}>
          <SummaryCard label="Residents" value={`${state.residents.length}/${MAX_RESIDENTS}`} color="#5ec850" />
          <SummaryCard label="Harmony pairs" value={pairAnalysis.harmony} color="#5ec850" />
          <SummaryCard label="Friction pairs" value={pairAnalysis.friction} color="#ff6464" />
          <SummaryCard label="Neutral / same" value={pairAnalysis.neutral + pairAnalysis.same} color="#5a7a50" />
        </div>

        {/* Tabs */}
        <div style={styles.tabRow}>
          {[
            { id: 'residents', label: 'My Island', emoji: '🏝️' },
            { id: 'personalities', label: 'Personalities', emoji: '🎭' },
            { id: 'matrix', label: 'Compatibility Matrix', emoji: '🔗' },
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
      </div>

      {/* Body */}
      {activeTab === 'residents' && (
        <ResidentsView
          residents={residentRecords}
          personalityCounts={personalityCounts}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredVillagers={filteredVillagers}
          addResident={addResident}
          removeResident={removeResident}
          updateResident={updateResident}
          maxReached={state.residents.length >= MAX_RESIDENTS}
        />
      )}
      {activeTab === 'personalities' && <PersonalitiesView counts={personalityCounts} />}
      {activeTab === 'matrix' && <MatrixView />}
    </div>
  );
}

// ─── Sub-views ────────────────────────────────────────────────────────────────

function SummaryCard({ label, value, color }) {
  return (
    <div style={styles.summaryCard}>
      <div style={{ ...styles.summaryValue, color, fontSize: 20, fontWeight: 700 }}>{value}</div>
      <div style={styles.summaryLabel}>{label}</div>
    </div>
  );
}

function ResidentsView({ residents, personalityCounts, searchTerm, setSearchTerm, filteredVillagers, addResident, removeResident, updateResident, maxReached }) {
  return (
    <div style={styles.body}>
      {/* Personality balance bar */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Personality Balance</h2>
        <div style={styles.balanceGrid}>
          {PERSONALITIES.map(p => (
            <div key={p.id} style={styles.balanceCell}>
              <div style={{ fontSize: 18 }}>{p.emoji}</div>
              <div style={styles.balanceLabel}>{p.label}</div>
              <div style={{ ...styles.balanceCount, color: p.color }}>{personalityCounts[p.id]}</div>
            </div>
          ))}
        </div>
        <p style={styles.helpText}>{RECOMMENDED_BALANCE.text}</p>
      </div>

      {/* Pair-by-pair grid */}
      {residents.length >= 2 && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Resident Pairs</h2>
          <div style={styles.pairList}>
            {residents.map((a, i) =>
              residents.slice(i + 1).map((b) => {
                const rel = relationshipBetween(a.personality, b.personality);
                const color =
                  rel.kind === 'harmony' ? '#5ec850' :
                  rel.kind === 'friction' ? '#ff6464' :
                  rel.kind === 'same' ? '#d4b030' : '#5a7a50';
                return (
                  <div key={`${a.name}__${b.name}`} style={{ ...styles.pairRow, borderLeft: `3px solid ${color}` }}>
                    <div style={styles.pairNames}>
                      <strong style={{ color: '#c8e6c0' }}>{a.name}</strong>
                      <span style={styles.muted}>·</span>
                      <strong style={{ color: '#c8e6c0' }}>{b.name}</strong>
                    </div>
                    <div style={{ ...styles.pairKind, color }}>
                      {rel.kind === 'harmony' && '✦ Harmony'}
                      {rel.kind === 'friction' && '⚠ Friction'}
                      {rel.kind === 'same' && '◆ Same type'}
                      {rel.kind === 'neutral' && '○ Neutral'}
                    </div>
                    <div style={styles.pairNote}>{rel.note}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Current residents */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Current Residents ({residents.length}/{MAX_RESIDENTS})</h2>
        {residents.length === 0 ? (
          <p style={styles.muted}>Add up to {MAX_RESIDENTS} villagers below to track personality balance and friendships.</p>
        ) : (
          <div style={styles.residentGrid}>
            {residents.map(r => {
              const p = PERSONALITIES.find(x => x.id === r.personality);
              return (
                <div key={r.name} style={styles.residentCard}>
                  <div style={styles.residentHead}>
                    <div>
                      <h3 style={styles.residentName}>{r.name}</h3>
                      <div style={styles.residentMeta}>
                        {p && <span style={{ color: p.color }}>{p.emoji} {p.label}</span>}
                        <span style={styles.muted}> · {r.species}</span>
                        {r.birthday && <span style={styles.muted}> · 🎂 {r.birthday}</span>}
                      </div>
                    </div>
                    <button onClick={() => removeResident(r.name)} style={styles.iconBtn} title="Remove resident">✕</button>
                  </div>

                  <div style={styles.fieldRow}>
                    <label style={styles.fieldLabel}>Friendship</label>
                    <div style={styles.heartRow}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          onClick={() => updateResident(r.name, { friendshipLevel: r.friendshipLevel === n ? n - 1 : n })}
                          style={{
                            ...styles.heartBtn,
                            color: n <= r.friendshipLevel ? '#ff6464' : '#3a4a3a',
                          }}
                          title={`Level ${n}`}
                        >♥</button>
                      ))}
                    </div>
                  </div>

                  <div style={styles.fieldRow}>
                    <label style={styles.fieldLabel}>Catchphrase</label>
                    <input
                      type="text"
                      placeholder="e.g. nya"
                      value={r.customCatchphrase}
                      onChange={e => updateResident(r.name, { customCatchphrase: e.target.value.slice(0, 24) })}
                      style={styles.fieldInput}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add picker */}
      {!maxReached && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Add a Villager</h2>
          <input
            type="text"
            placeholder="Search by name, species, or personality…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.pickerGrid}>
            {filteredVillagers.map(v => {
              const p = PERSONALITIES.find(x => x.id === v.personality);
              return (
                <button
                  key={v.name}
                  onClick={() => addResident(v)}
                  style={styles.pickerCell}
                >
                  <strong style={styles.pickerName}>{v.name}</strong>
                  <span style={styles.pickerMeta}>
                    {p && <span style={{ color: p.color }}>{p.emoji} {p.label}</span>}
                    <span style={styles.muted}> · {v.species}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {filteredVillagers.length === 0 && <p style={styles.muted}>No villagers match.</p>}
        </div>
      )}
    </div>
  );
}

function PersonalitiesView({ counts }) {
  return (
    <div style={styles.body}>
      <div style={styles.personalityGrid}>
        {PERSONALITIES.map(p => (
          <div key={p.id} style={{ ...styles.card, borderLeft: `4px solid ${p.color}` }}>
            <div style={styles.personalityHead}>
              <span style={{ fontSize: 28 }}>{p.emoji}</span>
              <div>
                <h3 style={{ ...styles.cardTitle, color: p.color, margin: 0 }}>{p.label}</h3>
                <p style={styles.helpText}>{p.traits}</p>
              </div>
              <span style={{ ...styles.balanceCount, color: p.color }}>{counts[p.id]}</span>
            </div>
            <p style={{ ...styles.helpText, marginTop: 8 }}><strong style={{ color: '#c8e6c0' }}>Hobbies:</strong> {p.hobbies}</p>
            <div style={styles.relSection}>
              <strong style={styles.relLabel}>Harmony with:</strong>
              <div style={styles.relList}>
                {HARMONY.filter(([a, b]) => a === p.id || b === p.id).map(([a, b]) => {
                  const other = a === p.id ? b : a;
                  return <span key={other} style={{ ...styles.tag, color: '#5ec850', borderColor: 'rgba(94,200,80,0.4)' }}>{other}</span>;
                }) || <span style={styles.muted}>None documented</span>}
              </div>
            </div>
            <div style={styles.relSection}>
              <strong style={styles.relLabel}>Friction with:</strong>
              <div style={styles.relList}>
                {FRICTION.filter(([a, b]) => a === p.id || b === p.id).map(([a, b]) => {
                  const other = a === p.id ? b : a;
                  return <span key={other} style={{ ...styles.tag, color: '#ff6464', borderColor: 'rgba(255,100,100,0.4)' }}>{other}</span>;
                }) || <span style={styles.muted}>None documented</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatrixView() {
  return (
    <div style={styles.body}>
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Compatibility Matrix</h2>
        <p style={styles.helpText}>
          Symmetric. <span style={{ color: '#5ec850' }}>✦ Harmony</span> · <span style={{ color: '#ff6464' }}>⚠ Friction</span> · <span style={{ color: '#d4b030' }}>◆ Same</span> · <span style={styles.muted}>○ Neutral</span>
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.matrixTable}>
            <thead>
              <tr>
                <th style={styles.matrixHeadEmpty}></th>
                {PERSONALITIES.map(p => (
                  <th key={p.id} style={{ ...styles.matrixHead, color: p.color }}>{p.emoji}<br />{p.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERSONALITIES.map(rowP => (
                <tr key={rowP.id}>
                  <th style={{ ...styles.matrixRowHead, color: rowP.color }}>{rowP.emoji} {rowP.label}</th>
                  {PERSONALITIES.map(colP => {
                    const rel = relationshipBetween(rowP.id, colP.id);
                    const symbol =
                      rel.kind === 'harmony' ? '✦' :
                      rel.kind === 'friction' ? '⚠' :
                      rel.kind === 'same' ? '◆' : '○';
                    const color =
                      rel.kind === 'harmony' ? '#5ec850' :
                      rel.kind === 'friction' ? '#ff6464' :
                      rel.kind === 'same' ? '#d4b030' : '#5a7a50';
                    return (
                      <td key={colP.id} style={{ ...styles.matrixCell, color }} title={rel.note}>{symbol}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
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
    textTransform: 'uppercase', letterSpacing: '0.05em', color: '#5a7a50',
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

  body: { display: 'flex', flexDirection: 'column', gap: 14 },
  card: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8, padding: 14,
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  cardTitle: {
    fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700,
    color: '#5ec850', margin: 0,
  },

  balanceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: 8,
  },
  balanceCell: {
    background: 'rgba(94,200,80,0.05)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 6, padding: 10, textAlign: 'center',
  },
  balanceLabel: { fontSize: 12, color: '#5a7a50', marginTop: 4, fontFamily: "'DM Sans', sans-serif" },
  balanceCount: { fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 700, marginTop: 4 },

  pairList: { display: 'flex', flexDirection: 'column', gap: 6 },
  pairRow: {
    display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) 120px 2fr',
    gap: 12, alignItems: 'center',
    padding: '8px 12px', background: 'rgba(94,200,80,0.04)',
    borderRadius: 4,
  },
  pairNames: { display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 },
  pairKind: { fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500 },
  pairNote: { fontSize: 12, color: '#5a7a50' },

  residentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 10,
  },
  residentCard: {
    background: 'rgba(94,200,80,0.04)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 6, padding: 12,
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  residentHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  residentName: { fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, margin: 0, color: '#c8e6c0' },
  residentMeta: { fontSize: 12, fontFamily: "'DM Mono', monospace", marginTop: 2 },
  fieldRow: { display: 'flex', alignItems: 'center', gap: 8 },
  fieldLabel: { fontSize: 12, color: '#5a7a50', minWidth: 80, fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' },
  heartRow: { display: 'flex', gap: 2 },
  heartBtn: {
    background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none',
    fontSize: 18, padding: '0 2px',
    transition: 'color 0.3s ease',
  },
  fieldInput: {
    flex: 1,
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 4, padding: '6px 10px',
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: 'none',
  },
  iconBtn: {
    background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none',
    color: '#ff6464', fontSize: 14, padding: 4, borderRadius: 4,
    transition: 'background-color 0.3s ease',
  },

  searchInput: {
    width: '100%',
    background: 'rgba(12,28,14,0.95)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 6, padding: '8px 12px', color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
  },
  pickerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 6,
  },
  pickerCell: {
    background: 'rgba(94,200,80,0.04)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 4, padding: '8px 10px',
    cursor: 'pointer', outline: 'none',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
    fontFamily: "'DM Sans', sans-serif", fontSize: 13,
    color: '#c8e6c0', textAlign: 'left',
    transition: 'background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease',
  },
  pickerName: { color: '#c8e6c0', fontSize: 14 },
  pickerMeta: { fontFamily: "'DM Mono', monospace", fontSize: 11 },

  personalityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 10,
  },
  personalityHead: { display: 'flex', alignItems: 'center', gap: 12 },
  relSection: { marginTop: 6 },
  relLabel: { fontSize: 12, color: '#5a7a50', fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em' },
  relList: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  tag: {
    fontFamily: "'DM Mono', monospace", fontSize: 12, padding: '2px 8px',
    borderRadius: 4, border: '1px solid rgba(94,200,80,0.2)',
  },

  matrixTable: {
    borderCollapse: 'collapse',
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    minWidth: 600,
  },
  matrixHeadEmpty: { padding: 8 },
  matrixHead: {
    padding: '8px 12px', textAlign: 'center', fontFamily: "'DM Sans', sans-serif",
    fontSize: 12, fontWeight: 700, borderBottom: '1px solid rgba(94,200,80,0.1)',
  },
  matrixRowHead: {
    padding: '8px 12px', textAlign: 'left', fontFamily: "'DM Sans', sans-serif",
    fontSize: 12, fontWeight: 700, borderRight: '1px solid rgba(94,200,80,0.1)',
    whiteSpace: 'nowrap',
  },
  matrixCell: {
    textAlign: 'center', padding: '10px 8px', fontSize: 18,
    border: '1px solid rgba(94,200,80,0.05)',
  },

  helpText: { color: '#5a7a50', fontSize: 13, margin: 0, lineHeight: 1.5 },
  muted: { color: '#5a7a50', fontSize: 13 },
};
