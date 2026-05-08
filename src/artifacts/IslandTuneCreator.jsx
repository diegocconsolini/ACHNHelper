'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ToolFrame from '../island/ToolFrame.jsx';

// ─── Constants ────────────────────────────────────────────────────────────────
// Town tunes in ACNH are 16 steps. Each step is one of:
//   - one of 7 pitches (G A B C D E F — Sol La Ti Do Re Mi Fa, ascending),
//   - "?" random pitch,
//   - "-" hold/rest.
// We keep the rest semantics simple (silence) so playback is deterministic.

const STEP_COUNT = 16;
const NOTE_ROWS = ['G', 'A', 'B', 'C', 'D', 'E', 'F']; // displayed top→bottom
const SPECIAL_ROWS = ['?', '-']; // random, rest
const ALL_ROWS = [...NOTE_ROWS, ...SPECIAL_ROWS];

// MIDI numbers for one octave starting at G4 (so the tune sits in a comfortable
// range). Values: G4=67, A4=69, B4=71, C5=72, D5=74, E5=76, F5=77.
const NOTE_FREQ = {
  G: midiToFreq(67),
  A: midiToFreq(69),
  B: midiToFreq(71),
  C: midiToFreq(72),
  D: midiToFreq(74),
  E: midiToFreq(76),
  F: midiToFreq(77),
};

function midiToFreq(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

const STORAGE_KEY = 'island-tune-creator';
const SHARE_PREFIX = 'ACNH-TUNE-V1:';

const DEFAULT_BPM = 100;
const MIN_BPM = 60;
const MAX_BPM = 160;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptySteps() {
  return Array(STEP_COUNT).fill('-');
}

function makeId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function newTune(name = 'Untitled tune') {
  return {
    id: makeId(),
    name,
    steps: emptySteps(),
    updatedAt: new Date().toISOString(),
  };
}

function emptyState() {
  const t = newTune('My first tune');
  return { tunes: [t], activeId: t.id };
}

function isValidStepChar(c) {
  return ALL_ROWS.includes(c);
}

function encodeShare(steps) {
  return SHARE_PREFIX + steps.join('');
}

function decodeShare(s) {
  const trimmed = (s || '').trim();
  if (!trimmed.startsWith(SHARE_PREFIX)) return null;
  const body = trimmed.slice(SHARE_PREFIX.length);
  if (body.length !== STEP_COUNT) return null;
  const out = [];
  for (const c of body) {
    if (!isValidStepChar(c)) return null;
    out.push(c);
  }
  return out;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function IslandTuneCreator() {
  const [state, setState] = useState(emptyState());
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState('');
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [loop, setLoop] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playStep, setPlayStep] = useState(-1);
  const [shareInput, setShareInput] = useState('');
  const [shareError, setShareError] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [hoveredCell, setHoveredCell] = useState(null);
  const [hoveredTune, setHoveredTune] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const audioCtxRef = useRef(null);
  const playTimeoutsRef = useRef([]);
  const playStateRef = useRef({ playing: false });

  // Load
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r) {
          const parsed = JSON.parse(r.value);
          if (parsed && Array.isArray(parsed.tunes) && parsed.tunes.length > 0) {
            // Sanitize: ensure steps are 16 chars from ALL_ROWS
            const cleaned = parsed.tunes
              .map(t => ({
                id: t.id || makeId(),
                name: typeof t.name === 'string' ? t.name : 'Untitled tune',
                steps: Array.isArray(t.steps) && t.steps.length === STEP_COUNT
                  ? t.steps.map(c => isValidStepChar(c) ? c : '-')
                  : emptySteps(),
                updatedAt: t.updatedAt || new Date().toISOString(),
              }));
            const activeId = cleaned.find(t => t.id === parsed.activeId)?.id || cleaned[0].id;
            setState({ tunes: cleaned, activeId });
          }
        }
      } catch (e) { /* fall through to defaults */ }
      setLoading(false);
    })();
    return () => stopPlayback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const activeTune = useMemo(
    () => state.tunes.find(t => t.id === state.activeId) || state.tunes[0],
    [state]
  );

  // ─── Tune list operations ───────────────────────────────────────────────────

  const selectTune = (id) => {
    if (id === state.activeId) return;
    stopPlayback();
    persist({ ...state, activeId: id });
  };

  const createTune = () => {
    stopPlayback();
    const t = newTune(`Tune ${state.tunes.length + 1}`);
    persist({ tunes: [...state.tunes, t], activeId: t.id });
  };

  const duplicateTune = (id) => {
    const src = state.tunes.find(t => t.id === id);
    if (!src) return;
    const dup = {
      id: makeId(),
      name: `${src.name} (copy)`,
      steps: [...src.steps],
      updatedAt: new Date().toISOString(),
    };
    persist({ tunes: [...state.tunes, dup], activeId: dup.id });
  };

  const deleteTune = (id) => {
    if (state.tunes.length <= 1) {
      setSaveMsg('Need at least one tune');
      setTimeout(() => setSaveMsg(''), 1500);
      return;
    }
    stopPlayback();
    const next = state.tunes.filter(t => t.id !== id);
    const activeId = state.activeId === id ? next[0].id : state.activeId;
    persist({ tunes: next, activeId });
  };

  const startRename = (id) => {
    const t = state.tunes.find(x => x.id === id);
    if (!t) return;
    setRenamingId(id);
    setRenameValue(t.name);
  };

  const commitRename = () => {
    if (!renamingId) return;
    const v = renameValue.trim() || 'Untitled tune';
    const next = {
      ...state,
      tunes: state.tunes.map(t =>
        t.id === renamingId
          ? { ...t, name: v, updatedAt: new Date().toISOString() }
          : t
      ),
    };
    setRenamingId(null);
    setRenameValue('');
    persist(next);
  };

  // ─── Step editing ───────────────────────────────────────────────────────────

  const setStep = (stepIdx, rowChar) => {
    if (!activeTune) return;
    const newSteps = [...activeTune.steps];
    // Toggle: clicking the active value clears to rest.
    newSteps[stepIdx] = newSteps[stepIdx] === rowChar ? '-' : rowChar;
    const next = {
      ...state,
      tunes: state.tunes.map(t =>
        t.id === activeTune.id
          ? { ...t, steps: newSteps, updatedAt: new Date().toISOString() }
          : t
      ),
    };
    persist(next);
  };

  const clearTune = () => {
    if (!activeTune) return;
    stopPlayback();
    const next = {
      ...state,
      tunes: state.tunes.map(t =>
        t.id === activeTune.id
          ? { ...t, steps: emptySteps(), updatedAt: new Date().toISOString() }
          : t
      ),
    };
    persist(next);
  };

  // ─── Share string ───────────────────────────────────────────────────────────

  const copyShare = async () => {
    if (!activeTune) return;
    const s = encodeShare(activeTune.steps);
    try {
      await navigator.clipboard.writeText(s);
      setSaveMsg('✓ Copied share string');
      setTimeout(() => setSaveMsg(''), 1500);
    } catch (e) {
      setSaveMsg('✗ Copy failed — select & copy manually');
      setTimeout(() => setSaveMsg(''), 2500);
    }
  };

  const importShare = () => {
    setShareError('');
    const decoded = decodeShare(shareInput);
    if (!decoded) {
      setShareError('Invalid share string. Expected ACNH-TUNE-V1:<16 chars> using G A B C D E F ? -');
      return;
    }
    if (!activeTune) return;
    const next = {
      ...state,
      tunes: state.tunes.map(t =>
        t.id === activeTune.id
          ? { ...t, steps: decoded, updatedAt: new Date().toISOString() }
          : t
      ),
    };
    setShareInput('');
    persist(next);
  };

  // ─── Playback ───────────────────────────────────────────────────────────────

  const ensureAudio = () => {
    if (!audioCtxRef.current) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      audioCtxRef.current = new Ctor();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playNote = (ctx, freq, when, durSec) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, when);
    // Short attack + decay envelope so notes don't click and feel chiptune-y.
    const peak = 0.18;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(peak, when + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.05, durSec * 0.85));
    osc.connect(gain).connect(ctx.destination);
    osc.start(when);
    osc.stop(when + durSec);
  };

  const stopPlayback = useCallback(() => {
    playStateRef.current.playing = false;
    for (const id of playTimeoutsRef.current) clearTimeout(id);
    playTimeoutsRef.current = [];
    setPlaying(false);
    setPlayStep(-1);
  }, []);

  const playTuneSteps = (steps) => {
    const ctx = ensureAudio();
    if (!ctx) {
      setSaveMsg('Audio not supported in this browser');
      setTimeout(() => setSaveMsg(''), 2000);
      return;
    }
    stopPlayback();
    playStateRef.current.playing = true;
    setPlaying(true);

    const stepSec = 60 / bpm / 2; // 8th-note per step (2 steps per beat)
    const startTime = ctx.currentTime + 0.05;

    const scheduleOnce = (offsetSteps) => {
      for (let i = 0; i < STEP_COUNT; i++) {
        const c = steps[i];
        const when = startTime + (offsetSteps + i) * stepSec;
        let pitchChar = c;
        if (c === '?') {
          pitchChar = NOTE_ROWS[Math.floor(Math.random() * NOTE_ROWS.length)];
        }
        if (NOTE_FREQ[pitchChar] !== undefined) {
          playNote(ctx, NOTE_FREQ[pitchChar], when, stepSec);
        }
      }
    };

    // Schedule first pass
    scheduleOnce(0);

    // Schedule UI step indicator for the first pass
    for (let i = 0; i < STEP_COUNT; i++) {
      const id = setTimeout(() => {
        if (!playStateRef.current.playing) return;
        setPlayStep(i);
      }, (0.05 + i * stepSec) * 1000);
      playTimeoutsRef.current.push(id);
    }

    if (loop) {
      // Re-arm on each pass end
      const arm = (passIdx) => {
        const id = setTimeout(() => {
          if (!playStateRef.current.playing) return;
          scheduleOnce(passIdx * STEP_COUNT);
          for (let i = 0; i < STEP_COUNT; i++) {
            const id2 = setTimeout(() => {
              if (!playStateRef.current.playing) return;
              setPlayStep(i);
            }, i * stepSec * 1000);
            playTimeoutsRef.current.push(id2);
          }
          arm(passIdx + 1);
        }, (0.05 + passIdx * STEP_COUNT * stepSec) * 1000);
        playTimeoutsRef.current.push(id);
      };
      arm(1);
    } else {
      // Stop after one pass
      const stopId = setTimeout(() => {
        stopPlayback();
      }, (0.05 + STEP_COUNT * stepSec) * 1000 + 60);
      playTimeoutsRef.current.push(stopId);
    }
  };

  // Cleanup on unmount
  useEffect(() => () => stopPlayback(), [stopPlayback]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading || !activeTune) {
    return (
      <div style={styles.root}>
        <style>{fontImport}</style>
        <p style={styles.muted}>🎵 Loading tunes…</p>
      </div>
    );
  }

  return (
    <ToolFrame
      host="isabelle"
      background="/island/tool-backgrounds/island-misc.webp"
      greeting="Compose a tune for the island PA system! Up to 16 notes — make it catchy!"
    >
    <div style={styles.root}>
      <style>{fontImport}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.title}>Island Tune Creator</h1>
            <p style={styles.subtitle}>16-step grid editor with Web Audio playback · share via string</p>
          </div>
          {saveMsg && <span style={styles.saveMsg}>{saveMsg}</span>}
        </div>
      </div>

      {/* Layout: tune list + editor */}
      <div style={styles.layout}>
        {/* Tune list */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHead}>
            <h2 style={styles.sidebarTitle}>My tunes</h2>
            <button
              onClick={createTune}
              onMouseEnter={() => setHoveredBtn('new')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                ...styles.smallBtn,
                ...(hoveredBtn === 'new' ? styles.smallBtnHover : null),
              }}
            >+ New</button>
          </div>
          <ul style={styles.tuneList}>
            {state.tunes.map(t => {
              const active = t.id === state.activeId;
              const hovered = hoveredTune === t.id;
              return (
                <li
                  key={t.id}
                  onMouseEnter={() => setHoveredTune(t.id)}
                  onMouseLeave={() => setHoveredTune(null)}
                  style={{
                    ...styles.tuneItem,
                    background: active
                      ? 'rgba(212,176,48,0.12)'
                      : hovered ? 'rgba(94,200,80,0.08)' : 'transparent',
                    border: `1px solid ${active ? '#d4b030' : hovered ? 'rgba(94,200,80,0.3)' : 'rgba(94,200,80,0.1)'}`,
                  }}
                >
                  {renamingId === t.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitRename();
                        if (e.key === 'Escape') { setRenamingId(null); setRenameValue(''); }
                      }}
                      style={styles.renameInput}
                    />
                  ) : (
                    <button
                      onClick={() => selectTune(t.id)}
                      onDoubleClick={() => startRename(t.id)}
                      style={{
                        ...styles.tuneNameBtn,
                        color: active ? '#d4b030' : '#c8e6c0',
                      }}
                      title="Click to select · Double-click to rename"
                    >
                      <span style={styles.tuneEmoji}>🎵</span>
                      <span style={styles.tuneName}>{t.name}</span>
                    </button>
                  )}
                  <div style={styles.tuneActions}>
                    <button
                      onClick={() => startRename(t.id)}
                      style={styles.iconBtn}
                      title="Rename"
                    >✏️</button>
                    <button
                      onClick={() => duplicateTune(t.id)}
                      style={styles.iconBtn}
                      title="Duplicate"
                    >⎘</button>
                    <button
                      onClick={() => deleteTune(t.id)}
                      style={{ ...styles.iconBtn, color: '#ff6464' }}
                      title="Delete"
                    >✕</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Editor */}
        <section style={styles.editor}>
          {/* Transport */}
          <div style={styles.transport}>
            {!playing ? (
              <button
                onClick={() => playTuneSteps(activeTune.steps)}
                onMouseEnter={() => setHoveredBtn('play')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  ...styles.playBtn,
                  ...(hoveredBtn === 'play' ? styles.playBtnHover : null),
                }}
              >▶ Play</button>
            ) : (
              <button
                onClick={stopPlayback}
                onMouseEnter={() => setHoveredBtn('stop')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  ...styles.stopBtn,
                  ...(hoveredBtn === 'stop' ? styles.stopBtnHover : null),
                }}
              >■ Stop</button>
            )}
            <label style={styles.transportLabel}>
              <input
                type="checkbox"
                checked={loop}
                onChange={e => setLoop(e.target.checked)}
                style={styles.checkbox}
              />
              Loop
            </label>
            <div style={styles.bpmWrap}>
              <span style={styles.bpmLabel}>BPM</span>
              <input
                type="range"
                min={MIN_BPM}
                max={MAX_BPM}
                step={1}
                value={bpm}
                onChange={e => setBpm(parseInt(e.target.value, 10))}
                style={styles.bpmSlider}
              />
              <span style={styles.bpmValue}>{bpm}</span>
            </div>
            <button
              onClick={clearTune}
              onMouseEnter={() => setHoveredBtn('clear')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                ...styles.smallBtn,
                ...(hoveredBtn === 'clear' ? styles.smallBtnHover : null),
              }}
            >Clear</button>
          </div>

          {/* Grid */}
          <div style={styles.gridWrap}>
            <div style={styles.grid}>
              {/* Header row of step numbers */}
              <div style={styles.gridRow}>
                <div style={styles.rowLabel}></div>
                {Array.from({ length: STEP_COUNT }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      ...styles.stepHead,
                      color: playStep === i ? '#4aacf0' : '#5a7a50',
                      borderColor: playStep === i ? '#4aacf0' : 'transparent',
                    }}
                  >{i + 1}</div>
                ))}
              </div>
              {ALL_ROWS.map(row => (
                <div key={row} style={styles.gridRow}>
                  <div style={{
                    ...styles.rowLabel,
                    color: row === '?' ? '#4aacf0' : row === '-' ? '#5a7a50' : '#d4b030',
                  }}>
                    {row === '-' ? 'Rest' : row === '?' ? 'Rand' : row}
                  </div>
                  {activeTune.steps.map((stepVal, i) => {
                    const isSet = stepVal === row;
                    const isHovered = hoveredCell === `${i}:${row}`;
                    const isCurrent = playStep === i;
                    return (
                      <button
                        key={i}
                        onClick={() => setStep(i, row)}
                        onMouseEnter={() => setHoveredCell(`${i}:${row}`)}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{
                          ...styles.cell,
                          background: isSet
                            ? (row === '?' ? '#4aacf0' : row === '-' ? '#5a7a50' : '#5ec850')
                            : isHovered ? 'rgba(94,200,80,0.12)' : 'rgba(12,28,14,0.95)',
                          borderColor: isSet
                            ? (row === '?' ? '#4aacf0' : row === '-' ? '#5a7a50' : '#5ec850')
                            : isCurrent
                              ? 'rgba(74,172,240,0.6)'
                              : isHovered ? 'rgba(94,200,80,0.4)' : 'rgba(94,200,80,0.1)',
                          color: isSet ? '#0a1a10' : '#c8e6c0',
                          boxShadow: isCurrent && !isSet ? '0 0 0 1px rgba(74,172,240,0.4) inset' : 'none',
                        }}
                      >
                        {isSet ? (row === '?' ? '?' : row === '-' ? '–' : row) : ''}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Share */}
          <div style={styles.shareBox}>
            <div style={styles.shareRow}>
              <code style={styles.shareString}>{encodeShare(activeTune.steps)}</code>
              <button
                onClick={copyShare}
                onMouseEnter={() => setHoveredBtn('copy')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  ...styles.smallBtn,
                  ...(hoveredBtn === 'copy' ? styles.smallBtnHover : null),
                }}
              >Copy</button>
            </div>
            <div style={styles.shareRow}>
              <input
                type="text"
                placeholder="Paste a share string starting with ACNH-TUNE-V1:"
                value={shareInput}
                onChange={e => { setShareInput(e.target.value); setShareError(''); }}
                style={styles.shareInput}
              />
              <button
                onClick={importShare}
                onMouseEnter={() => setHoveredBtn('import')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  ...styles.smallBtn,
                  ...(hoveredBtn === 'import' ? styles.smallBtnHover : null),
                }}
              >Import</button>
            </div>
            {shareError && <div style={styles.errorBox}>{shareError}</div>}
            <p style={styles.helpText}>
              Each tune is 16 steps. Click a column cell to set that step's note. Click the same cell again to clear it (rest).
              Pitches use solfege range G–F (Sol La Ti Do Re Mi Fa). <code style={styles.kbd}>?</code> picks a random pitch each time it plays. <code style={styles.kbd}>–</code> is silence.
            </p>
          </div>
        </section>
      </div>
    </div>
    </ToolFrame>
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

  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(220px, 280px) 1fr',
    gap: 16,
    alignItems: 'start',
  },

  sidebar: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  sidebarHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sidebarTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
    fontWeight: 700,
    color: '#5ec850',
    margin: 0,
  },
  tuneList: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 },
  tuneItem: {
    borderRadius: 6,
    padding: '6px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease',
  },
  tuneNameBtn: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 2px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    textAlign: 'left',
    transition: 'color 0.3s ease',
  },
  tuneEmoji: { fontSize: 14 },
  tuneName: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  renameInput: {
    flex: 1,
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid #5ec850',
    borderRadius: 4,
    padding: '4px 8px',
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    outline: 'none',
  },
  tuneActions: { display: 'flex', gap: 2 },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    color: '#5a7a50',
    fontSize: 12,
    padding: 4,
    borderRadius: 4,
    transition: 'background-color 0.3s ease, color 0.3s ease',
  },

  editor: { display: 'flex', flexDirection: 'column', gap: 14 },

  transport: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8,
    padding: 12,
  },
  playBtn: {
    background: '#5ec850',
    color: '#0a1a10',
    border: '1px solid #5ec850',
    borderRadius: 6,
    padding: '8px 18px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease',
  },
  playBtnHover: {
    background: '#6fd860',
    transform: 'translateY(-1px)',
  },
  stopBtn: {
    background: '#ff6464',
    color: '#0a1a10',
    border: '1px solid #ff6464',
    borderRadius: 6,
    padding: '8px 18px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease, transform 0.3s ease',
  },
  stopBtnHover: {
    background: '#ff8484',
    transform: 'translateY(-1px)',
  },
  smallBtn: {
    background: 'transparent',
    color: '#c8e6c0',
    border: '1px solid rgba(94,200,80,0.3)',
    borderRadius: 6,
    padding: '6px 12px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    fontSize: 13,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
  },
  smallBtnHover: {
    background: 'rgba(94,200,80,0.1)',
    borderColor: '#5ec850',
    color: '#5ec850',
  },
  transportLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#c8e6c0',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  checkbox: { accentColor: '#5ec850', cursor: 'pointer' },
  bpmWrap: { display: 'flex', alignItems: 'center', gap: 8 },
  bpmLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 12,
    color: '#5a7a50',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  bpmSlider: { width: 120, accentColor: '#4aacf0', cursor: 'pointer', outline: 'none' },
  bpmValue: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    color: '#4aacf0',
    minWidth: 28,
    textAlign: 'right',
  },

  gridWrap: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8,
    padding: 12,
    overflowX: 'auto',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 720,
  },
  gridRow: {
    display: 'grid',
    gridTemplateColumns: '64px repeat(16, 1fr)',
    gap: 4,
  },
  rowLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
  },
  stepHead: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    textAlign: 'center',
    padding: '2px 0',
    borderBottom: '1px solid transparent',
    transition: 'color 0.2s ease, border-color 0.2s ease',
  },
  cell: {
    aspectRatio: '1 / 1',
    minHeight: 32,
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 4,
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
    padding: 0,
    transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
  },

  shareBox: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  shareRow: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  shareString: {
    flex: 1,
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    color: '#4aacf0',
    background: 'rgba(74,172,240,0.06)',
    border: '1px solid rgba(74,172,240,0.2)',
    borderRadius: 6,
    padding: '8px 12px',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    minWidth: 200,
  },
  shareInput: {
    flex: 1,
    minWidth: 200,
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 6,
    padding: '8px 12px',
    color: '#c8e6c0',
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    outline: 'none',
  },
  errorBox: {
    background: 'rgba(255,100,100,0.08)',
    border: '1px solid rgba(255,100,100,0.3)',
    borderRadius: 6,
    padding: 10,
    color: '#ff6464',
    fontSize: 13,
  },
  helpText: {
    color: '#5a7a50',
    fontSize: 12,
    margin: 0,
    lineHeight: 1.5,
  },
  kbd: {
    background: 'rgba(94,200,80,0.1)',
    border: '1px solid rgba(94,200,80,0.2)',
    borderRadius: 3,
    padding: '0 4px',
    fontFamily: "'DM Mono', monospace",
    fontSize: 12,
    color: '#c8e6c0',
  },

  muted: { color: '#5a7a50', fontSize: 13, padding: 16, textAlign: 'center' },
};
