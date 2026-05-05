'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';

const CATEGORIES = [
  { id: 'item', label: 'Item', emoji: '📦' },
  { id: 'villager', label: 'Villager', emoji: '🧑' },
  { id: 'diy', label: 'DIY Recipe', emoji: '🔨' },
  { id: 'material', label: 'Material', emoji: '🌳' },
];

const STATUSES = [
  { id: 'open', label: 'Open', color: '#5ec850' },
  { id: 'pending', label: 'Pending', color: '#d4b030' },
  { id: 'completed', label: 'Completed', color: '#5a7a50' },
  { id: 'cancelled', label: 'Cancelled', color: '#ff6464' },
];

function timeAgo(iso) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export default function TradingBoard() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [intentFilter, setIntentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('open');
  const [search, setSearch] = useState('');

  // Form
  const [showForm, setShowForm] = useState(false);
  const [formCategory, setFormCategory] = useState('item');
  const [formIntent, setFormIntent] = useState('offering');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTradeFor, setFormTradeFor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (intentFilter !== 'all') params.set('intent', intentFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      const r = await fetch(`/api/trades?${params}`);
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        setError(e.error || `Server returned ${r.status}`);
        setTrades([]);
        return;
      }
      const d = await r.json();
      setTrades(d.trades || []);
      setAuthed(!!d.authed);
    } catch (e) {
      setError(e.message || 'Failed to load trades');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, intentFilter, statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const submitTrade = async () => {
    setError('');
    if (!formTitle.trim()) {
      setError('Title required.');
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formCategory,
          intent: formIntent,
          title: formTitle.trim(),
          description: formDescription,
          trade_for: formTradeFor,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(d.error || `Server returned ${r.status}`);
      } else {
        setSaveMsg('✓ Listing posted');
        setTimeout(() => setSaveMsg(''), 1800);
        setFormTitle('');
        setFormDescription('');
        setFormTradeFor('');
        setShowForm(false);
        await load();
      }
    } catch (e) {
      setError(e.message || 'Failed to post listing');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const r = await fetch('/api/trades', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (r.ok) {
        setSaveMsg(`✓ Marked ${status}`);
        setTimeout(() => setSaveMsg(''), 1500);
        await load();
      }
    } catch { /* ignore */ }
  };

  const removeTrade = async (id) => {
    try {
      const r = await fetch(`/api/trades?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (r.ok) {
        setSaveMsg('✓ Deleted');
        setTimeout(() => setSaveMsg(''), 1500);
        await load();
      }
    } catch { /* ignore */ }
  };

  const myCount = useMemo(() => trades.filter(t => t.is_mine).length, [trades]);

  return (
    <div style={styles.root}>
      <style>{fontImport}</style>

      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.title}>Trading Board</h1>
            <p style={styles.subtitle}>Community trade listings · items, villagers, DIY recipes, materials</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {saveMsg && <span style={styles.saveMsg}>{saveMsg}</span>}
            {authed && (
              <button onClick={() => setShowForm(s => !s)} style={styles.primaryBtn}>
                {showForm ? '× Close form' : '+ Post listing'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submit form */}
      {showForm && authed && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>New listing</h2>
          <div style={styles.formGrid}>
            <label style={styles.fieldRow}>
              <span style={styles.fieldLabel}>Category</span>
              <select value={formCategory} onChange={e => setFormCategory(e.target.value)} style={styles.fieldInput}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>
            </label>
            <label style={styles.fieldRow}>
              <span style={styles.fieldLabel}>Intent</span>
              <select value={formIntent} onChange={e => setFormIntent(e.target.value)} style={styles.fieldInput}>
                <option value="offering">Offering (have)</option>
                <option value="looking_for">Looking for (want)</option>
              </select>
            </label>
            <label style={{ ...styles.fieldRow, gridColumn: '1 / -1' }}>
              <span style={styles.fieldLabel}>Title (max 80 chars)</span>
              <input
                type="text" maxLength={80}
                value={formTitle} onChange={e => setFormTitle(e.target.value)}
                placeholder={formIntent === 'offering' ? 'e.g. White rose hybrid pair' : 'e.g. Looking for Raymond'}
                style={styles.fieldInput}
              />
            </label>
            <label style={{ ...styles.fieldRow, gridColumn: '1 / -1' }}>
              <span style={styles.fieldLabel}>{formIntent === 'offering' ? 'Trade for (what you want)' : 'Offering in return (what you have)'}</span>
              <input
                type="text" maxLength={200}
                value={formTradeFor} onChange={e => setFormTradeFor(e.target.value)}
                placeholder="e.g. NMT, blue roses, specific fish bait"
                style={styles.fieldInput}
              />
            </label>
            <label style={{ ...styles.fieldRow, gridColumn: '1 / -1' }}>
              <span style={styles.fieldLabel}>Details (max 500 chars)</span>
              <textarea
                maxLength={500} rows={3}
                value={formDescription} onChange={e => setFormDescription(e.target.value)}
                placeholder="Anything else — variant, color, queue rules, hours…"
                style={{ ...styles.fieldInput, fontFamily: "'DM Sans', sans-serif", resize: 'vertical' }}
              />
            </label>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
              <button onClick={submitTrade} disabled={submitting} style={styles.primaryBtn}>
                {submitting ? 'Posting…' : 'Post listing'}
              </button>
              <button onClick={() => setShowForm(false)} style={styles.secondaryBtn}>Cancel</button>
            </div>
            {error && <div style={{ gridColumn: '1 / -1' }}><p style={styles.errorBox}>{error}</p></div>}
          </div>
          <p style={styles.helpText}>Max 5 open listings per user · close completed/cancelled trades to free up slots.</p>
        </div>
      )}

      {!authed && (
        <p style={styles.note}>Sign in to post listings. Browsing is open to everyone.</p>
      )}

      {/* Filters */}
      <div style={styles.filterRow}>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={styles.fieldInput}>
          <option value="all">All categories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>
        <select value={intentFilter} onChange={e => setIntentFilter(e.target.value)} style={styles.fieldInput}>
          <option value="all">All intents</option>
          <option value="offering">Offering</option>
          <option value="looking_for">Looking for</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={styles.fieldInput}>
          <option value="all">Any status</option>
          {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <input
          type="text" placeholder="Search title…" value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...styles.fieldInput, flex: 1, minWidth: 180 }}
        />
        <button onClick={load} style={styles.secondaryBtn}>↻ Refresh</button>
      </div>

      {authed && myCount > 0 && (
        <p style={styles.muted}>You have {myCount} listing{myCount === 1 ? '' : 's'} matching the current filter.</p>
      )}

      {/* Trade feed */}
      {loading ? (
        <p style={styles.muted}>Loading…</p>
      ) : trades.length === 0 ? (
        <div style={styles.card}>
          <p style={styles.muted}>No listings match. Try widening your filters or be the first to post.</p>
        </div>
      ) : (
        <div style={styles.tradeGrid}>
          {trades.map(t => {
            const cat = CATEGORIES.find(c => c.id === t.category);
            const status = STATUSES.find(s => s.id === t.status);
            return (
              <div key={t.id} style={{ ...styles.tradeCard, borderLeft: `3px solid ${status?.color || '#5ec850'}` }}>
                <div style={styles.tradeHead}>
                  <div>
                    <h3 style={styles.tradeTitle}>{t.title}</h3>
                    <div style={styles.tradeMeta}>
                      <span style={{ color: '#c8e6c0' }}>{cat?.emoji} {cat?.label}</span>
                      <span style={styles.muted}> · </span>
                      <span style={{ color: t.intent === 'offering' ? '#5ec850' : '#4aacf0' }}>
                        {t.intent === 'offering' ? '↗ Offering' : '↘ Looking for'}
                      </span>
                      <span style={styles.muted}> · </span>
                      <span style={{ color: status?.color }}>{status?.label}</span>
                    </div>
                  </div>
                  {t.is_mine && (
                    <span style={styles.youBadge}>YOU</span>
                  )}
                </div>

                {t.trade_for && (
                  <div style={styles.tradeForBox}>
                    <span style={styles.fieldLabel}>{t.intent === 'offering' ? 'Wants' : 'Offers'}</span>
                    <span style={{ color: '#c8e6c0' }}>{t.trade_for}</span>
                  </div>
                )}

                {t.description && (
                  <p style={styles.tradeDesc}>{t.description}</p>
                )}

                <div style={styles.tradeFooter}>
                  <span style={styles.muted}>
                    🏝 <strong style={{ color: '#c8e6c0' }}>{t.island_name}</strong>
                    {t.hemisphere && <span> · {t.hemisphere === 'north' ? 'N' : 'S'}</span>}
                    <span> · {timeAgo(t.created_at)}</span>
                  </span>
                  {t.friend_code && (
                    <code style={styles.fcChip}>{t.friend_code}</code>
                  )}
                </div>

                {t.is_mine && (
                  <div style={styles.tradeActions}>
                    {t.status === 'open' && (
                      <>
                        <button onClick={() => updateStatus(t.id, 'pending')} style={styles.smallBtn}>Mark pending</button>
                        <button onClick={() => updateStatus(t.id, 'completed')} style={styles.smallBtn}>Mark completed</button>
                      </>
                    )}
                    {(t.status === 'pending' || t.status === 'cancelled') && (
                      <button onClick={() => updateStatus(t.id, 'open')} style={styles.smallBtn}>Reopen</button>
                    )}
                    <button onClick={() => removeTrade(t.id)} style={{ ...styles.smallBtn, color: '#ff6464' }}>Delete</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
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
  header: { display: 'flex', flexDirection: 'column', gap: 6 },
  headerTop: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  title: { fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 32, color: '#5ec850', margin: 0 },
  subtitle: { color: '#5a7a50', fontSize: 14, margin: '4px 0 0 0' },
  saveMsg: { fontFamily: "'DM Mono', monospace", color: '#d4b030', fontSize: 13 },

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
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
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

  filterRow: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },

  primaryBtn: {
    background: '#5ec850', color: '#0a1a10',
    border: '1px solid #5ec850', borderRadius: 6,
    padding: '8px 14px', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13,
    cursor: 'pointer', outline: 'none',
    transition: 'background-color 0.3s ease',
  },
  secondaryBtn: {
    background: 'transparent', color: '#c8e6c0',
    border: '1px solid rgba(94,200,80,0.3)', borderRadius: 6,
    padding: '8px 14px', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 13,
    cursor: 'pointer', outline: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
  },
  smallBtn: {
    background: 'transparent', color: '#c8e6c0',
    border: '1px solid rgba(94,200,80,0.2)', borderRadius: 4,
    padding: '4px 10px', fontFamily: "'DM Sans', sans-serif", fontSize: 12,
    cursor: 'pointer', outline: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  },

  tradeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 10,
  },
  tradeCard: {
    background: 'rgba(12,28,14,0.95)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8, padding: 14,
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  tradeHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  tradeTitle: { fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, margin: 0, color: '#c8e6c0' },
  tradeMeta: { fontSize: 12, fontFamily: "'DM Mono', monospace", marginTop: 4 },
  tradeForBox: {
    display: 'flex', flexDirection: 'column', gap: 4,
    background: 'rgba(94,200,80,0.06)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 4, padding: '6px 10px',
  },
  tradeDesc: { color: '#5a7a50', fontSize: 13, margin: 0, lineHeight: 1.5 },
  tradeFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontSize: 12 },
  fcChip: {
    fontFamily: "'DM Mono', monospace", fontSize: 12,
    color: '#4aacf0', background: 'rgba(74,172,240,0.08)',
    border: '1px solid rgba(74,172,240,0.3)',
    borderRadius: 4, padding: '2px 8px',
  },
  tradeActions: { display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid rgba(94,200,80,0.1)', paddingTop: 8 },
  youBadge: {
    fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 700,
    color: '#d4b030', background: 'rgba(212,176,48,0.1)',
    border: '1px solid rgba(212,176,48,0.3)',
    borderRadius: 4, padding: '2px 6px',
    height: 'fit-content',
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
