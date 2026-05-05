'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';

const SLOTS = [
  { id: 0, kind: 'buy', label: 'Sun (Daisy Mae)' },
  { id: 1, kind: 'sell', label: 'Mon AM' },
  { id: 2, kind: 'sell', label: 'Mon PM' },
  { id: 3, kind: 'sell', label: 'Tue AM' },
  { id: 4, kind: 'sell', label: 'Tue PM' },
  { id: 5, kind: 'sell', label: 'Wed AM' },
  { id: 6, kind: 'sell', label: 'Wed PM' },
  { id: 7, kind: 'sell', label: 'Thu AM' },
  { id: 8, kind: 'sell', label: 'Thu PM' },
  { id: 9, kind: 'sell', label: 'Fri AM' },
  { id: 10, kind: 'sell', label: 'Fri PM' },
  { id: 11, kind: 'sell', label: 'Sat AM' },
  { id: 12, kind: 'sell', label: 'Sat PM' },
];

function slotLabel(slot) {
  return SLOTS.find(s => s.id === slot)?.label || `Slot ${slot}`;
}

function timeAgo(iso) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export default function StalkMarket() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [kindFilter, setKindFilter] = useState('all'); // all | buy | sell
  const [minPrice, setMinPrice] = useState(0);
  const [error, setError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  // Form state
  const [formKind, setFormKind] = useState('sell');
  const [formSlot, setFormSlot] = useState(1);
  const [formPrice, setFormPrice] = useState('');
  const [formDodo, setFormDodo] = useState('');
  const [formNote, setFormNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (kindFilter !== 'all') params.set('kind', kindFilter);
      if (minPrice > 0) params.set('minPrice', String(minPrice));
      const r = await fetch(`/api/turnip-prices?${params}`);
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        setError(e.error || `Server returned ${r.status}`);
        setPrices([]);
        return;
      }
      const d = await r.json();
      setPrices(d.prices || []);
      setAuthed(!!d.authed);
    } catch (e) {
      setError(e.message || 'Failed to load prices');
    } finally {
      setLoading(false);
    }
  }, [kindFilter, minPrice]);

  useEffect(() => { load(); }, [load]);

  // Keep slot consistent with kind
  useEffect(() => {
    if (formKind === 'buy' && formSlot !== 0) setFormSlot(0);
    if (formKind === 'sell' && formSlot === 0) setFormSlot(1);
  }, [formKind, formSlot]);

  const submitPrice = async () => {
    setError('');
    const price = parseInt(formPrice, 10);
    if (!Number.isInteger(price) || price < 9 || price > 999) {
      setError('Price must be 9–999 bells.');
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch('/api/turnip-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price, kind: formKind, slot: formSlot,
          dodo: formDodo, note: formNote,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(d.error || `Server returned ${r.status}`);
      } else {
        setSaveMsg('✓ Price posted');
        setTimeout(() => setSaveMsg(''), 1800);
        setFormPrice('');
        await load();
      }
    } catch (e) {
      setError(e.message || 'Failed to post price');
    } finally {
      setSubmitting(false);
    }
  };

  const removePrice = async (id) => {
    try {
      const r = await fetch(`/api/turnip-prices?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (r.ok) {
        setSaveMsg('✓ Removed');
        setTimeout(() => setSaveMsg(''), 1500);
        await load();
      }
    } catch { /* ignore */ }
  };

  const stats = useMemo(() => {
    const buys = prices.filter(p => p.kind === 'buy');
    const sells = prices.filter(p => p.kind === 'sell');
    const bestBuy = buys.reduce((m, p) => Math.max(m, p.price), 0);
    const bestSell = sells.reduce((m, p) => Math.max(m, p.price), 0);
    return { count: prices.length, bestBuy, bestSell };
  }, [prices]);

  return (
    <div style={styles.root}>
      <style>{fontImport}</style>

      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.title}>Stalk Market</h1>
            <p style={styles.subtitle}>Community-shared turnip prices · this week's best buys & sells</p>
          </div>
          {saveMsg && <span style={styles.saveMsg}>{saveMsg}</span>}
        </div>

        {/* Summary */}
        <div style={styles.summaryRow}>
          <SummaryCard label="Active prices" value={stats.count} color="#5ec850" />
          <SummaryCard label="Best buy (Sun)" value={stats.bestBuy ? `${stats.bestBuy} ⛁` : '—'} color="#4aacf0" />
          <SummaryCard label="Best sell (Mon-Sat)" value={stats.bestSell ? `${stats.bestSell} ⛁` : '—'} color="#d4b030" />
        </div>
      </div>

      {/* Submit form */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Share your price</h2>
        {!authed ? (
          <p style={styles.note}>Sign in to share your turnip prices with the community.</p>
        ) : (
          <div style={styles.formGrid}>
            <label style={styles.fieldRow}>
              <span style={styles.fieldLabel}>Type</span>
              <select value={formKind} onChange={e => setFormKind(e.target.value)} style={styles.fieldInput}>
                <option value="sell">Sell (Mon-Sat, Nook's Cranny)</option>
                <option value="buy">Buy (Sun, Daisy Mae)</option>
              </select>
            </label>
            <label style={styles.fieldRow}>
              <span style={styles.fieldLabel}>When</span>
              <select value={formSlot} onChange={e => setFormSlot(parseInt(e.target.value, 10))} style={styles.fieldInput}>
                {SLOTS.filter(s => s.kind === formKind).map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>
            <label style={styles.fieldRow}>
              <span style={styles.fieldLabel}>Price (bells)</span>
              <input
                type="number" min={9} max={999} step={1}
                value={formPrice} onChange={e => setFormPrice(e.target.value)}
                placeholder="e.g. 543"
                style={styles.fieldInput}
              />
            </label>
            <label style={styles.fieldRow}>
              <span style={styles.fieldLabel}>Dodo (optional)</span>
              <input
                type="text" maxLength={8}
                value={formDodo} onChange={e => setFormDodo(e.target.value.toUpperCase())}
                placeholder="ABCDE"
                style={styles.fieldInput}
              />
            </label>
            <label style={{ ...styles.fieldRow, gridColumn: '1 / -1' }}>
              <span style={styles.fieldLabel}>Note (optional)</span>
              <input
                type="text" maxLength={140}
                value={formNote} onChange={e => setFormNote(e.target.value)}
                placeholder="Queue rules, tips, hours…"
                style={styles.fieldInput}
              />
            </label>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
              <button onClick={submitPrice} disabled={submitting} style={styles.primaryBtn}>
                {submitting ? 'Posting…' : 'Post price'}
              </button>
              <button onClick={() => { setFormPrice(''); setFormDodo(''); setFormNote(''); }} style={styles.secondaryBtn}>
                Clear form
              </button>
            </div>
            {error && <div style={{ gridColumn: '1 / -1' }}><p style={styles.errorBox}>{error}</p></div>}
          </div>
        )}
      </div>

      {/* Filter row */}
      <div style={styles.filterRow}>
        <select value={kindFilter} onChange={e => setKindFilter(e.target.value)} style={styles.fieldInput}>
          <option value="all">All prices</option>
          <option value="sell">Sell only</option>
          <option value="buy">Buy only</option>
        </select>
        <label style={styles.inlineLabel}>
          <span style={styles.fieldLabel}>Min price</span>
          <input
            type="number" min={0} max={999} step={10}
            value={minPrice} onChange={e => setMinPrice(parseInt(e.target.value || '0', 10))}
            style={{ ...styles.fieldInput, width: 100 }}
          />
        </label>
        <button onClick={load} style={styles.secondaryBtn}>↻ Refresh</button>
      </div>

      {/* Price feed */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>This week's prices</h2>
        {loading ? (
          <p style={styles.muted}>Loading…</p>
        ) : prices.length === 0 ? (
          <p style={styles.muted}>No prices posted yet this week. Be the first!</p>
        ) : (
          <div style={styles.priceList}>
            {prices.map(p => (
              <div key={p.id} style={styles.priceRow}>
                <div style={styles.pricePrice}>
                  <span style={{
                    color: p.kind === 'buy' ? '#4aacf0' : '#d4b030',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 22, fontWeight: 700,
                  }}>{p.price}</span>
                  <span style={{ color: '#5a7a50', fontSize: 12 }}>bells</span>
                </div>
                <div style={styles.priceMeta}>
                  <strong style={{ color: '#c8e6c0', fontSize: 14 }}>{p.island_name}</strong>
                  <span style={{ color: '#5a7a50', fontSize: 12 }}>
                    {p.kind === 'buy' ? '🛒 Buy' : '💰 Sell'} · {slotLabel(p.slot)}
                    {p.hemisphere && <span> · {p.hemisphere === 'north' ? 'N' : 'S'}</span>}
                    <span> · {timeAgo(p.created_at)}</span>
                  </span>
                  {p.note && <span style={styles.priceNote}>{p.note}</span>}
                </div>
                <div style={styles.priceActions}>
                  {p.dodo && authed ? (
                    <code style={styles.dodoChip}>🛬 {p.dodo}</code>
                  ) : p.dodo ? (
                    <span style={{ ...styles.muted, fontSize: 11 }}>Sign in for dodo</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p style={styles.helpText}>
        Prices reset every Sunday (UTC). Each user can post one price per slot per week — submitting again updates your previous entry.
        Dodo codes are hidden from anonymous viewers to keep traffic to genuine players.
      </p>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={styles.summaryCard}>
      <div style={{ color, fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{value}</div>
      <div style={styles.summaryLabel}>{label}</div>
    </div>
  );
}

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`;

const styles = {
  root: {
    background: '#0a1a10', color: '#c8e6c0', fontFamily: "'DM Sans', sans-serif",
    minHeight: '100%', padding: 20,
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  header: { display: 'flex', flexDirection: 'column', gap: 12 },
  headerTop: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  title: { fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 32, color: '#5ec850', margin: 0 },
  subtitle: { color: '#5a7a50', fontSize: 14, margin: '4px 0 0 0' },
  saveMsg: { fontFamily: "'DM Mono', monospace", color: '#d4b030', fontSize: 13 },

  summaryRow: { display: 'flex', flexWrap: 'wrap', gap: 14 },
  summaryCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'rgba(12,28,14,0.95)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8, padding: '10px 16px', minWidth: 180,
  },
  summaryLabel: {
    fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12,
    textTransform: 'uppercase', letterSpacing: '0.05em', color: '#5a7a50',
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

  formGrid: {
    display: 'grid', gap: 10,
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  },
  fieldRow: { display: 'flex', flexDirection: 'column', gap: 4 },
  fieldLabel: {
    fontSize: 11, color: '#5a7a50',
    fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  fieldInput: {
    background: 'rgba(12,28,14,0.95)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 4, padding: '8px 10px', color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none',
  },
  inlineLabel: { display: 'flex', alignItems: 'center', gap: 6 },

  filterRow: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },

  primaryBtn: {
    background: '#5ec850', color: '#0a1a10',
    border: '1px solid #5ec850', borderRadius: 6,
    padding: '8px 18px', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14,
    cursor: 'pointer', outline: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  },
  secondaryBtn: {
    background: 'transparent', color: '#c8e6c0',
    border: '1px solid rgba(94,200,80,0.3)', borderRadius: 6,
    padding: '8px 18px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 14,
    cursor: 'pointer', outline: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
  },

  priceList: { display: 'flex', flexDirection: 'column', gap: 6 },
  priceRow: {
    display: 'grid', gridTemplateColumns: '110px 1fr auto', gap: 12,
    alignItems: 'center',
    padding: '10px 12px', borderRadius: 6,
    background: 'rgba(94,200,80,0.04)', border: '1px solid rgba(94,200,80,0.1)',
  },
  pricePrice: { display: 'flex', alignItems: 'baseline', gap: 6 },
  priceMeta: { display: 'flex', flexDirection: 'column', gap: 4 },
  priceNote: { color: '#5a7a50', fontSize: 12, fontStyle: 'italic' },
  priceActions: { display: 'flex', gap: 6, alignItems: 'center' },
  dodoChip: {
    fontFamily: "'DM Mono', monospace", fontSize: 13,
    color: '#4aacf0', background: 'rgba(74,172,240,0.08)',
    border: '1px solid rgba(74,172,240,0.3)',
    borderRadius: 4, padding: '4px 10px',
  },

  errorBox: {
    background: 'rgba(255,100,100,0.08)', border: '1px solid rgba(255,100,100,0.3)',
    borderRadius: 6, padding: 10, color: '#ff6464', fontSize: 13, margin: 0,
  },
  note: {
    color: '#d4b030', fontSize: 13, margin: 0,
    background: 'rgba(212,176,48,0.08)', border: '1px solid rgba(212,176,48,0.2)',
    borderRadius: 6, padding: 10,
  },
  helpText: { color: '#5a7a50', fontSize: 12, margin: 0, lineHeight: 1.5 },
  muted: { color: '#5a7a50', fontSize: 13 },
};
