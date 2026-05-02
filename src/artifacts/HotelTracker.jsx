'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ConfirmModal from '../ConfirmModal';

// ─── Static reference data (3.0 hotel system) ────────────────────────────────

const STORAGE_KEY = 'hotel-tracker';

// Brand-recognition tier thresholds (in stars or guests-checked-in milestones).
// Sourced from the in-game hotel manager's progression dialog (3.0+).
const BRAND_TIERS = [
  { tier: 1, label: 'Newcomer', minGuests: 0,   color: '#5a7a50' },
  { tier: 2, label: 'Rising',   minGuests: 25,  color: '#5ec850' },
  { tier: 3, label: 'Notable',  minGuests: 75,  color: '#4aacf0' },
  { tier: 4, label: 'Renowned', minGuests: 150, color: '#d4b030' },
  { tier: 5, label: 'Legend',   minGuests: 300, color: '#d4b030' },
];

// 7 Niko-driven DIY Donation Box quest categories used by the Resort Hotel
// "DIY Goods Wanted!" Nook Miles+ achievement (Fulfill 5 / 50 / 150 / 300 requests).
const DONATION_QUEST_CATEGORIES = [
  'Furniture (Housewares)',
  'Furniture (Wall-mounted)',
  'Clothing (Tops)',
  'Clothing (Bottoms)',
  'Clothing (Headwear)',
  'Custom design / pattern',
  'Cooking dish',
];

// Slumber Island themes (game-defined island templates available in 3.0).
const SLUMBER_THEMES = [
  'Tropical', 'Snowy', 'Forest', 'Bamboo', 'Cliffside', 'Beach',
  'Cherry Blossom', 'Autumn', 'Mushroom', 'Custom',
];
const SLUMBER_SIZES = ['Small', 'Medium', 'Large'];
const SLUMBER_TIMES = ['Morning', 'Afternoon', 'Sunset', 'Night'];
const SLUMBER_WEATHERS = ['Clear', 'Cloudy', 'Rain', 'Snow', 'Aurora'];
const MAX_ISLAND_SLOTS = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyState() {
  return {
    hotel: {
      ticketsBalance: 0,
      ticketsLifetimeEarned: 0,
      guestsCheckedIn: 0,
      souvenirOwned: [], // furniture names from /nh/furniture (hotel souvenir shop)
      donationLog: [],   // [{ id, date, category, item, completed }]
      guestLog: [],      // [{ id, villagerName, date, notes }]
    },
    slumberIslands: [],  // [{ id, name, size, theme, time, weather, screenshots:[], customDesignCount, coEditors:[{ name, friendCode }], notes }]
  };
}

function brandTierFor(guestsCheckedIn) {
  let current = BRAND_TIERS[0];
  for (const t of BRAND_TIERS) {
    if (guestsCheckedIn >= t.minGuests) current = t;
  }
  return current;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HotelTracker() {
  const [activeTab, setActiveTab] = useState('hotel');
  const [state, setState] = useState(emptyState());
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState('');
  const [hoveredTab, setHoveredTab] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Souvenir sub-catalog state
  const [souvenirItems, setSouvenirItems] = useState(null);
  const [souvenirLoading, setSouvenirLoading] = useState(false);
  const [souvenirError, setSouvenirError] = useState(null);
  const [souvenirSearch, setSouvenirSearch] = useState('');

  // Forms
  const [donationForm, setDonationForm] = useState({ category: DONATION_QUEST_CATEGORIES[0], item: '' });
  const [guestForm, setGuestForm] = useState({ villagerName: '', notes: '' });
  const [islandForm, setIslandForm] = useState({
    name: '', size: 'Medium', theme: 'Tropical', time: 'Afternoon', weather: 'Clear',
    customDesignCount: 0, coEditors: '', notes: '',
  });
  const [editingIslandId, setEditingIslandId] = useState(null);

  // ── Persistence ──
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result) {
          const parsed = JSON.parse(result.value);
          setState({ ...emptyState(), ...parsed,
            hotel: { ...emptyState().hotel, ...(parsed.hotel || {}) },
            slumberIslands: Array.isArray(parsed.slumberIslands) ? parsed.slumberIslands : [],
          });
        }
      } catch (e) { /* keep defaults */ }
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

  // ── Souvenir sub-catalog (lazy fetch) ──
  const loadSouvenirCatalog = useCallback(async () => {
    if (souvenirItems || souvenirLoading) return;
    setSouvenirLoading(true);
    setSouvenirError(null);
    try {
      const res = await fetch('/api/nookipedia/nh/furniture');
      if (!res.ok) throw new Error(`API ${res.status}`);
      const all = await res.json();
      const hotelItems = all.filter(item =>
        Array.isArray(item.availability) &&
        item.availability.some(a => /hotel souvenir/i.test(a.from || ''))
      );
      setSouvenirItems(hotelItems);
    } catch (e) {
      setSouvenirError(e.message || 'Failed to load souvenirs');
    } finally {
      setSouvenirLoading(false);
    }
  }, [souvenirItems, souvenirLoading]);

  // ── Hotel tab actions ──
  const updateHotel = (patch) => persist({ ...state, hotel: { ...state.hotel, ...patch } });

  const setTicketsBalance = (n) => {
    const balance = Math.max(0, parseInt(n, 10) || 0);
    updateHotel({ ticketsBalance: balance });
  };
  const setTicketsLifetime = (n) => {
    const v = Math.max(0, parseInt(n, 10) || 0);
    updateHotel({ ticketsLifetimeEarned: v });
  };
  const setGuests = (n) => {
    const v = Math.max(0, parseInt(n, 10) || 0);
    updateHotel({ guestsCheckedIn: v });
  };

  const toggleSouvenirOwned = (itemName) => {
    const owned = state.hotel.souvenirOwned.includes(itemName);
    const next = owned
      ? state.hotel.souvenirOwned.filter(n => n !== itemName)
      : [...state.hotel.souvenirOwned, itemName];
    updateHotel({ souvenirOwned: next });
  };

  const addDonationEntry = () => {
    if (!donationForm.item.trim()) return;
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      category: donationForm.category,
      item: donationForm.item.trim(),
      completed: false,
    };
    updateHotel({ donationLog: [entry, ...state.hotel.donationLog] });
    setDonationForm({ category: DONATION_QUEST_CATEGORIES[0], item: '' });
  };

  const toggleDonationComplete = (id) => {
    updateHotel({
      donationLog: state.hotel.donationLog.map(d =>
        d.id === id ? { ...d, completed: !d.completed } : d),
    });
  };

  const deleteDonationEntry = (id) => {
    updateHotel({ donationLog: state.hotel.donationLog.filter(d => d.id !== id) });
  };

  const addGuestEntry = () => {
    if (!guestForm.villagerName.trim()) return;
    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      villagerName: guestForm.villagerName.trim(),
      notes: guestForm.notes.trim(),
    };
    updateHotel({ guestLog: [entry, ...state.hotel.guestLog] });
    setGuestForm({ villagerName: '', notes: '' });
  };

  const deleteGuestEntry = (id) => {
    updateHotel({ guestLog: state.hotel.guestLog.filter(g => g.id !== id) });
  };

  // ── Slumber islands actions ──
  const resetIslandForm = () => {
    setIslandForm({
      name: '', size: 'Medium', theme: 'Tropical', time: 'Afternoon', weather: 'Clear',
      customDesignCount: 0, coEditors: '', notes: '',
    });
    setEditingIslandId(null);
  };

  const saveIsland = () => {
    if (!islandForm.name.trim()) return;
    if (!editingIslandId && state.slumberIslands.length >= MAX_ISLAND_SLOTS) {
      setSaveMsg(`Limit: ${MAX_ISLAND_SLOTS} islands`);
      setTimeout(() => setSaveMsg(''), 2000);
      return;
    }
    const coEditors = islandForm.coEditors
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(token => {
        // Format "Name (SW-1234-5678-9012)" or just "Name" or just code.
        const m = token.match(/^(.*?)\s*\(?(SW-\d{4}-\d{4}-\d{4})\)?$/i);
        if (m) return { name: m[1].trim() || 'Friend', friendCode: m[2].toUpperCase() };
        return { name: token, friendCode: '' };
      });
    const data = {
      id: editingIslandId || Date.now().toString(),
      name: islandForm.name.trim(),
      size: islandForm.size,
      theme: islandForm.theme,
      time: islandForm.time,
      weather: islandForm.weather,
      customDesignCount: Math.max(0, parseInt(islandForm.customDesignCount, 10) || 0),
      coEditors,
      notes: islandForm.notes.trim(),
      screenshots: editingIslandId
        ? (state.slumberIslands.find(i => i.id === editingIslandId)?.screenshots || [])
        : [],
    };
    const islands = editingIslandId
      ? state.slumberIslands.map(i => i.id === editingIslandId ? data : i)
      : [...state.slumberIslands, data];
    persist({ ...state, slumberIslands: islands });
    resetIslandForm();
  };

  const editIsland = (island) => {
    setIslandForm({
      name: island.name,
      size: island.size,
      theme: island.theme,
      time: island.time,
      weather: island.weather,
      customDesignCount: island.customDesignCount,
      coEditors: island.coEditors.map(e =>
        e.friendCode ? `${e.name} (${e.friendCode})` : e.name).join(', '),
      notes: island.notes,
    });
    setEditingIslandId(island.id);
  };

  const removeIsland = (id) => setDeleteTarget(id);
  const confirmDeleteIsland = () => {
    if (deleteTarget) {
      persist({ ...state, slumberIslands: state.slumberIslands.filter(i => i.id !== deleteTarget) });
      setDeleteTarget(null);
    }
  };

  const addScreenshot = (islandId, file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 1024 * 1024) {
      setSaveMsg('Image must be < 1MB');
      setTimeout(() => setSaveMsg(''), 2000);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const islands = state.slumberIslands.map(i =>
        i.id === islandId ? { ...i, screenshots: [...(i.screenshots || []), dataUrl] } : i);
      persist({ ...state, slumberIslands: islands });
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = (islandId, idx) => {
    const islands = state.slumberIslands.map(i =>
      i.id === islandId ? { ...i, screenshots: (i.screenshots || []).filter((_, j) => j !== idx) } : i);
    persist({ ...state, slumberIslands: islands });
  };

  // ── Derived ──
  const tier = brandTierFor(state.hotel.guestsCheckedIn);
  const nextTier = BRAND_TIERS.find(t => t.tier === tier.tier + 1);
  const tierProgress = nextTier
    ? Math.min(100, ((state.hotel.guestsCheckedIn - tier.minGuests) /
        (nextTier.minGuests - tier.minGuests)) * 100)
    : 100;

  const filteredSouvenirs = useMemo(() => {
    if (!souvenirItems) return [];
    const q = souvenirSearch.toLowerCase().trim();
    if (!q) return souvenirItems;
    return souvenirItems.filter(it => it.name.toLowerCase().includes(q));
  }, [souvenirItems, souvenirSearch]);

  const donationsCompleted = state.hotel.donationLog.filter(d => d.completed).length;

  // Auto-load souvenir catalog on first hotel-tab paint after load.
  useEffect(() => {
    if (!loading && activeTab === 'hotel') loadSouvenirCatalog();
  }, [loading, activeTab, loadSouvenirCatalog]);

  if (loading) {
    return (
      <div style={styles.root}>
        <style>{fontImport}</style>
        <p style={styles.loadingText}>🏨 Loading hotel data...</p>
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
            <h1 style={styles.title}>Hotel Tracker</h1>
            <p style={styles.subtitle}>Resort Hotel + Slumber Islands (ACNH 3.0)</p>
          </div>
          {saveMsg && <span style={styles.saveMsg}>{saveMsg}</span>}
        </div>

        <div style={styles.tabRow}>
          {[
            { id: 'hotel', label: 'Hotel', emoji: '🏨' },
            { id: 'islands', label: 'Slumber Islands', emoji: '🏝️' },
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

      {activeTab === 'hotel' ? (
        <div style={styles.body}>
          {/* Hotel summary cards */}
          <div style={styles.summaryGrid}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statLabel, color: '#4aacf0' }}>Hotel Tickets</div>
              <input
                type="number"
                min="0"
                value={state.hotel.ticketsBalance}
                onChange={e => setTicketsBalance(e.target.value)}
                style={{ ...styles.statInput, color: '#4aacf0', borderColor: 'rgba(74,172,240,0.3)' }}
              />
              <div style={styles.statSub}>balance</div>
            </div>

            <div style={styles.statCard}>
              <div style={{ ...styles.statLabel, color: '#d4b030' }}>Lifetime Earned</div>
              <input
                type="number"
                min="0"
                value={state.hotel.ticketsLifetimeEarned}
                onChange={e => setTicketsLifetime(e.target.value)}
                style={{ ...styles.statInput, color: '#d4b030', borderColor: 'rgba(212,176,48,0.3)' }}
              />
              <div style={styles.statSub}>tickets total</div>
            </div>

            <div style={styles.statCard}>
              <div style={{ ...styles.statLabel, color: '#5ec850' }}>Guests Checked In</div>
              <input
                type="number"
                min="0"
                value={state.hotel.guestsCheckedIn}
                onChange={e => setGuests(e.target.value)}
                style={{ ...styles.statInput, color: '#5ec850', borderColor: 'rgba(94,200,80,0.3)' }}
              />
              <div style={styles.statSub}>since 3.0 launch</div>
            </div>
          </div>

          {/* Brand recognition tier */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Brand Recognition</h2>
            <div style={styles.tierCard}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                <span style={{ ...styles.tierBadge, color: tier.color, borderColor: tier.color }}>
                  Tier {tier.tier}
                </span>
                <span style={{ ...styles.tierLabel, color: tier.color }}>{tier.label}</span>
              </div>
              <div style={styles.tierBarTrack}>
                <div style={{
                  ...styles.tierBarFill,
                  width: `${tierProgress}%`,
                  background: tier.color,
                }} />
              </div>
              <div style={styles.tierMeta}>
                {nextTier
                  ? `${nextTier.minGuests - state.hotel.guestsCheckedIn} more guests to ${nextTier.label} (Tier ${nextTier.tier})`
                  : 'Max tier reached — Hotel of Legend'}
              </div>
              <div style={styles.tierTickRow}>
                {BRAND_TIERS.map(t => (
                  <div key={t.tier} style={{
                    ...styles.tierTick,
                    color: state.hotel.guestsCheckedIn >= t.minGuests ? t.color : '#5a7a50',
                    borderColor: state.hotel.guestsCheckedIn >= t.minGuests ? t.color : 'rgba(94,200,80,0.1)',
                  }}>
                    {t.tier}★ {t.minGuests}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Souvenir shop sub-catalog */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Souvenir Shop</h2>
            <p style={styles.sectionMeta}>
              Furniture available at the hotel souvenir shop (sourced live from Nookipedia).
              Prices in <span style={{ color: '#4aacf0' }}>Hotel Tickets</span>.
            </p>
            {souvenirError && (
              <div style={styles.errorBox}>Could not load souvenirs: {souvenirError}</div>
            )}
            <input
              type="text"
              placeholder="Search souvenirs…"
              value={souvenirSearch}
              onChange={e => setSouvenirSearch(e.target.value)}
              style={styles.searchInput}
            />
            <div style={styles.souvenirGrid}>
              {souvenirLoading && <div style={styles.muted}>Loading souvenir catalog…</div>}
              {souvenirItems && filteredSouvenirs.length === 0 && !souvenirLoading && (
                <div style={styles.muted}>No souvenirs match.</div>
              )}
              {filteredSouvenirs.map(item => {
                const owned = state.hotel.souvenirOwned.includes(item.name);
                const price = (item.buy || []).find(b => b.currency === 'Hotel Tickets');
                return (
                  <div key={item.name} style={{
                    ...styles.souvenirCard,
                    borderColor: owned ? 'rgba(94,200,80,0.4)' : 'rgba(94,200,80,0.1)',
                    background: owned ? 'rgba(94,200,80,0.08)' : 'rgba(12,28,14,0.95)',
                  }}>
                    <button
                      onClick={() => toggleSouvenirOwned(item.name)}
                      style={{
                        ...styles.souvenirCheck,
                        background: owned ? 'rgba(94,200,80,0.2)' : 'rgba(94,200,80,0.05)',
                        borderColor: owned ? '#5ec850' : 'rgba(94,200,80,0.15)',
                        color: owned ? '#5ec850' : '#5a7a50',
                      }}
                      title={owned ? 'Mark as not owned' : 'Mark as owned'}
                    >
                      {owned ? '✓' : '○'}
                    </button>
                    <div style={styles.souvenirName}>{item.name}</div>
                    <div style={styles.souvenirMeta}>
                      <span style={{ color: '#5a7a50' }}>{item.category}</span>
                      {price && (
                        <span style={{ color: '#4aacf0', fontFamily: "'DM Mono', monospace" }}>
                          {price.price} 🎫
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {souvenirItems && (
              <div style={styles.muted}>
                {state.hotel.souvenirOwned.length} / {souvenirItems.length} owned
              </div>
            )}
          </div>

          {/* DIY Donation Box quest log */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>DIY Donation Box</h2>
            <p style={styles.sectionMeta}>
              Track requests for the Resort Hotel donation box (Nook Miles+ "DIY Goods Wanted!").
              {' '}<span style={{ color: '#d4b030' }}>{donationsCompleted} / {state.hotel.donationLog.length} completed</span>
            </p>
            <div style={styles.formRow}>
              <select
                value={donationForm.category}
                onChange={e => setDonationForm({ ...donationForm, category: e.target.value })}
                style={styles.select}
              >
                {DONATION_QUEST_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                type="text"
                placeholder="Item or DIY name…"
                value={donationForm.item}
                onChange={e => setDonationForm({ ...donationForm, item: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && addDonationEntry()}
                style={styles.input}
              />
              <button
                onClick={addDonationEntry}
                onMouseEnter={() => setHoveredBtn('don-add')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  ...styles.primaryBtn,
                  background: hoveredBtn === 'don-add' ? 'rgba(94,200,80,0.25)' : 'rgba(94,200,80,0.15)',
                }}
              >
                Add
              </button>
            </div>
            <div style={styles.donationList}>
              {state.hotel.donationLog.map(d => (
                <div key={d.id} style={{
                  ...styles.donationCard,
                  borderColor: d.completed ? 'rgba(94,200,80,0.4)' : 'rgba(94,200,80,0.1)',
                  opacity: d.completed ? 0.6 : 1,
                }}>
                  <button
                    onClick={() => toggleDonationComplete(d.id)}
                    style={{
                      ...styles.checkBox,
                      borderColor: d.completed ? '#5ec850' : 'rgba(94,200,80,0.2)',
                      background: d.completed ? 'rgba(94,200,80,0.2)' : 'transparent',
                      color: d.completed ? '#5ec850' : '#5a7a50',
                    }}
                  >
                    {d.completed ? '✓' : ''}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...styles.donationItem, textDecoration: d.completed ? 'line-through' : 'none' }}>
                      {d.item}
                    </div>
                    <div style={styles.donationMeta}>
                      {d.category} · {d.date}
                    </div>
                  </div>
                  <button onClick={() => deleteDonationEntry(d.id)} style={styles.iconBtn} title="Remove">✕</button>
                </div>
              ))}
              {state.hotel.donationLog.length === 0 && (
                <div style={styles.muted}>No donation requests logged yet.</div>
              )}
            </div>
          </div>

          {/* Guest log */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Guest Log</h2>
            <p style={styles.sectionMeta}>
              Log villagers who've stayed at the hotel.
              {' '}<span style={{ color: '#5a7a50' }}>(Cross-link to villagerData.js — type the name as it appears on the gift guide.)</span>
            </p>
            <div style={styles.formRow}>
              <input
                type="text"
                placeholder="Villager name…"
                value={guestForm.villagerName}
                onChange={e => setGuestForm({ ...guestForm, villagerName: e.target.value })}
                style={{ ...styles.input, flex: 1 }}
              />
              <input
                type="text"
                placeholder="Notes (optional)…"
                value={guestForm.notes}
                onChange={e => setGuestForm({ ...guestForm, notes: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && addGuestEntry()}
                style={{ ...styles.input, flex: 2 }}
              />
              <button
                onClick={addGuestEntry}
                onMouseEnter={() => setHoveredBtn('g-add')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  ...styles.primaryBtn,
                  background: hoveredBtn === 'g-add' ? 'rgba(94,200,80,0.25)' : 'rgba(94,200,80,0.15)',
                }}
              >
                Log
              </button>
            </div>
            <div style={styles.donationList}>
              {state.hotel.guestLog.map(g => (
                <div key={g.id} style={styles.donationCard}>
                  <span style={{ fontSize: 22 }}>🐾</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.donationItem}>{g.villagerName}</div>
                    <div style={styles.donationMeta}>
                      {g.date}
                      {g.notes && <span style={{ marginLeft: 8, color: '#c8e6c0' }}>· {g.notes}</span>}
                    </div>
                  </div>
                  <button onClick={() => deleteGuestEntry(g.id)} style={styles.iconBtn} title="Remove">✕</button>
                </div>
              ))}
              {state.hotel.guestLog.length === 0 && (
                <div style={styles.muted}>No guests logged yet.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.body}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Slumber Islands ({state.slumberIslands.length} / {MAX_ISLAND_SLOTS})
            </h2>
            <p style={styles.sectionMeta}>
              Up to {MAX_ISLAND_SLOTS} dream-island slots unlocked via Reset Service in 3.0.
            </p>

            <div style={styles.islandFormCard}>
              <h3 style={styles.subTitle}>{editingIslandId ? 'Edit Island' : 'New Island'}</h3>
              <div style={styles.formGrid}>
                <label style={styles.formLabel}>
                  Name
                  <input
                    type="text"
                    value={islandForm.name}
                    onChange={e => setIslandForm({ ...islandForm, name: e.target.value })}
                    style={styles.input}
                    placeholder="Coral Bay"
                  />
                </label>
                <label style={styles.formLabel}>
                  Size
                  <select
                    value={islandForm.size}
                    onChange={e => setIslandForm({ ...islandForm, size: e.target.value })}
                    style={styles.select}
                  >
                    {SLUMBER_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label style={styles.formLabel}>
                  Theme
                  <select
                    value={islandForm.theme}
                    onChange={e => setIslandForm({ ...islandForm, theme: e.target.value })}
                    style={styles.select}
                  >
                    {SLUMBER_THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label style={styles.formLabel}>
                  Time of day
                  <select
                    value={islandForm.time}
                    onChange={e => setIslandForm({ ...islandForm, time: e.target.value })}
                    style={styles.select}
                  >
                    {SLUMBER_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label style={styles.formLabel}>
                  Weather
                  <select
                    value={islandForm.weather}
                    onChange={e => setIslandForm({ ...islandForm, weather: e.target.value })}
                    style={styles.select}
                  >
                    {SLUMBER_WEATHERS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </label>
                <label style={styles.formLabel}>
                  Custom designs
                  <input
                    type="number"
                    min="0"
                    value={islandForm.customDesignCount}
                    onChange={e => setIslandForm({ ...islandForm, customDesignCount: e.target.value })}
                    style={styles.input}
                  />
                </label>
                <label style={{ ...styles.formLabel, gridColumn: '1 / -1' }}>
                  Co-editor friend codes (comma-separated, e.g. <code style={{ color: '#d4b030' }}>Alex (SW-1234-5678-9012), Sam</code>)
                  <input
                    type="text"
                    value={islandForm.coEditors}
                    onChange={e => setIslandForm({ ...islandForm, coEditors: e.target.value })}
                    style={styles.input}
                  />
                </label>
                <label style={{ ...styles.formLabel, gridColumn: '1 / -1' }}>
                  Notes
                  <textarea
                    value={islandForm.notes}
                    onChange={e => setIslandForm({ ...islandForm, notes: e.target.value })}
                    style={{ ...styles.input, minHeight: 60, resize: 'vertical', fontFamily: "'DM Sans', sans-serif" }}
                  />
                </label>
              </div>
              <div style={styles.formButtons}>
                <button
                  onClick={saveIsland}
                  onMouseEnter={() => setHoveredBtn('isle-save')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    ...styles.primaryBtn,
                    background: hoveredBtn === 'isle-save' ? 'rgba(94,200,80,0.25)' : 'rgba(94,200,80,0.15)',
                  }}
                >
                  {editingIslandId ? 'Save changes' : 'Add island'}
                </button>
                {editingIslandId && (
                  <button onClick={resetIslandForm} style={styles.secondaryBtn}>Cancel</button>
                )}
              </div>
            </div>

            <div style={styles.islandList}>
              {state.slumberIslands.map(island => (
                <div key={island.id} style={styles.islandCard}>
                  <div style={styles.islandHeader}>
                    <div>
                      <h3 style={styles.islandTitle}>{island.name}</h3>
                      <div style={styles.islandTags}>
                        <span style={styles.tagChip}>{island.size}</span>
                        <span style={{ ...styles.tagChip, color: '#d4b030', borderColor: 'rgba(212,176,48,0.4)' }}>
                          {island.theme}
                        </span>
                        <span style={styles.tagChip}>{island.time}</span>
                        <span style={styles.tagChip}>{island.weather}</span>
                        <span style={{ ...styles.tagChip, color: '#4aacf0', borderColor: 'rgba(74,172,240,0.4)' }}>
                          {island.customDesignCount} 🎨
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => editIsland(island)} style={styles.secondaryBtn}>Edit</button>
                      <button
                        onClick={() => removeIsland(island.id)}
                        style={{ ...styles.secondaryBtn, color: '#ff6464', borderColor: 'rgba(255,100,100,0.3)' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {island.notes && <p style={styles.islandNotes}>{island.notes}</p>}
                  {island.coEditors.length > 0 && (
                    <div style={styles.coEditorRow}>
                      <span style={{ color: '#5a7a50', fontSize: 12 }}>Co-editors:</span>
                      {island.coEditors.map((e, i) => (
                        <span key={i} style={styles.coEditor}>
                          {e.name}
                          {e.friendCode && <code style={{ color: '#4aacf0', marginLeft: 6, fontSize: 11 }}>{e.friendCode}</code>}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={styles.shotRow}>
                    {(island.screenshots || []).map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <div key={i} style={styles.shotWrap}>
                        <img src={src} alt={`${island.name} #${i + 1}`} style={styles.shotImg} />
                        <button
                          onClick={() => removeScreenshot(island.id, i)}
                          style={styles.shotRemove}
                          title="Remove screenshot"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <label style={styles.shotAdd}>
                      + Add
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) addScreenshot(island.id, f);
                          e.target.value = '';
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>
              ))}
              {state.slumberIslands.length === 0 && (
                <div style={styles.muted}>No islands yet — add your first slumber island above.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Slumber Island?"
        message="This will permanently remove the island and its screenshots. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDeleteIsland}
        onCancel={() => setDeleteTarget(null)}
      />
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
  loadingText: { color: '#5a7a50', fontSize: 14, padding: 40, textAlign: 'center' },
  header: { marginBottom: 20 },
  headerTop: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  title: { fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 32, color: '#5ec850', margin: 0 },
  subtitle: { color: '#5a7a50', fontSize: 14, margin: '4px 0 0 0' },
  saveMsg: { fontFamily: "'DM Mono', monospace", color: '#d4b030', fontSize: 13 },
  tabRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  tab: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 16px', borderRadius: 6, fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
    cursor: 'pointer', outline: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
  },
  body: { display: 'flex', flexDirection: 'column', gap: 24 },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 },
  statCard: {
    background: 'rgba(12,28,14,0.95)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 6,
  },
  statLabel: { fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' },
  statInput: {
    background: 'transparent', border: '1px solid rgba(94,200,80,0.2)',
    borderRadius: 4, padding: '8px 10px',
    fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 500,
    outline: 'none',
  },
  statSub: { color: '#5a7a50', fontSize: 11 },
  section: {
    background: 'rgba(12,28,14,0.95)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8, padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
  },
  sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#c8e6c0', margin: 0, fontWeight: 700 },
  sectionMeta: { color: '#5a7a50', fontSize: 13, margin: 0 },
  subTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#c8e6c0', margin: 0, fontWeight: 700 },

  // Brand tier
  tierCard: { display: 'flex', flexDirection: 'column', gap: 10 },
  tierBadge: {
    fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 500,
    padding: '4px 10px', border: '1px solid', borderRadius: 4,
  },
  tierLabel: { fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900 },
  tierBarTrack: { height: 8, background: 'rgba(94,200,80,0.1)', borderRadius: 4, overflow: 'hidden' },
  tierBarFill: { height: '100%', borderRadius: 4, transition: 'width 0.4s ease' },
  tierMeta: { color: '#5a7a50', fontSize: 12 },
  tierTickRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tierTick: {
    fontFamily: "'DM Mono', monospace", fontSize: 11,
    padding: '3px 8px', border: '1px solid', borderRadius: 3,
  },

  // Souvenirs
  searchInput: {
    background: 'rgba(12,28,14,0.95)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 6, padding: '8px 12px', color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none',
  },
  souvenirGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 8, maxHeight: 360, overflowY: 'auto',
  },
  souvenirCard: {
    border: '1px solid', borderRadius: 6, padding: 10,
    display: 'flex', flexDirection: 'column', gap: 6,
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  },
  souvenirCheck: {
    alignSelf: 'flex-end', width: 24, height: 24, borderRadius: 4,
    border: '1px solid', cursor: 'pointer', outline: 'none',
    fontFamily: "'DM Mono', monospace", fontSize: 14,
  },
  souvenirName: { fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 13, color: '#c8e6c0' },
  souvenirMeta: { display: 'flex', justifyContent: 'space-between', fontSize: 11 },

  // Donation log + guest log
  formRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  input: {
    flex: 1, background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)', borderRadius: 6,
    padding: '8px 12px', color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none',
  },
  select: {
    background: 'rgba(12,28,14,0.95)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 6, padding: '8px 12px', color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none',
  },
  primaryBtn: {
    background: 'rgba(94,200,80,0.15)',
    border: '1px solid #5ec850', color: '#5ec850',
    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
    padding: '8px 16px', borderRadius: 6, cursor: 'pointer', outline: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
  },
  secondaryBtn: {
    background: 'transparent', border: '1px solid rgba(94,200,80,0.2)',
    color: '#c8e6c0', fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
    padding: '8px 14px', borderRadius: 6, cursor: 'pointer', outline: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
  },
  donationList: { display: 'flex', flexDirection: 'column', gap: 6 },
  donationCard: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(12,28,14,0.5)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 6, padding: '8px 12px',
  },
  checkBox: {
    width: 22, height: 22, borderRadius: 4, border: '1px solid',
    cursor: 'pointer', outline: 'none', fontFamily: "'DM Mono', monospace", fontSize: 12,
  },
  donationItem: { color: '#c8e6c0', fontSize: 14, fontWeight: 500 },
  donationMeta: { color: '#5a7a50', fontSize: 11, fontFamily: "'DM Mono', monospace" },
  iconBtn: {
    background: 'transparent', border: 'none', color: '#5a7a50',
    cursor: 'pointer', outline: 'none', fontSize: 14, padding: 4,
  },
  muted: { color: '#5a7a50', fontSize: 13 },
  errorBox: {
    background: 'rgba(255,100,100,0.08)', border: '1px solid rgba(255,100,100,0.3)',
    borderRadius: 6, padding: 10, color: '#ff6464', fontSize: 13,
  },

  // Slumber islands
  islandFormCard: {
    background: 'rgba(12,28,14,0.5)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
  },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 },
  formLabel: { display: 'flex', flexDirection: 'column', gap: 4, color: '#c8e6c0', fontSize: 13 },
  formButtons: { display: 'flex', gap: 8, justifyContent: 'flex-end' },

  islandList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 },
  islandCard: {
    background: 'rgba(12,28,14,0.95)', border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
  },
  islandHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' },
  islandTitle: { fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#5ec850', margin: 0, fontWeight: 700 },
  islandTags: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  tagChip: {
    fontSize: 11, fontFamily: "'DM Mono', monospace", color: '#c8e6c0',
    border: '1px solid rgba(94,200,80,0.2)', borderRadius: 3, padding: '2px 6px',
  },
  islandNotes: { color: '#c8e6c0', fontSize: 13, margin: 0, lineHeight: 1.5 },
  coEditorRow: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  coEditor: { fontSize: 12, color: '#c8e6c0', background: 'rgba(74,172,240,0.06)', padding: '2px 8px', borderRadius: 3, border: '1px solid rgba(74,172,240,0.2)' },

  shotRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  shotWrap: { position: 'relative', width: 90, height: 90, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(94,200,80,0.2)' },
  shotImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  shotRemove: {
    position: 'absolute', top: 2, right: 2,
    background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff',
    width: 20, height: 20, borderRadius: 10, cursor: 'pointer', outline: 'none',
    fontSize: 11, lineHeight: 1,
  },
  shotAdd: {
    width: 90, height: 90, borderRadius: 4,
    border: '1px dashed rgba(94,200,80,0.3)', color: '#5a7a50',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: 'pointer',
  },
};
