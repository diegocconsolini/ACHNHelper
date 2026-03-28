'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AssetImg } from '../assetHelper';

const STORAGE_KEY = 'acnh-photo-poster-tracker';

const TABS = ['All', 'Photos', 'Posters'];

function extractVillagerName(itemName) {
  return itemName
    .replace(/'s photo$/i, '')
    .replace(/'s poster$/i, '')
    .replace(/'s photo$/i, '')
    .replace(/'s poster$/i, '');
}

function isPhoto(name) {
  return /photo$/i.test(name);
}

function isPoster(name) {
  return /poster$/i.test(name);
}

const ProgressRing = ({ value, total, size = 80, color = '#5ec850', label }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? value / total : 0;
  const offset = circumference * (1 - pct);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(94,200,80,0.1)" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
          fill="#c8e6c0" fontSize={size > 60 ? 14 : 11} fontFamily="'DM Mono', monospace" fontWeight={500}
          style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <span style={{ fontSize: 11, color: '#5a7a50', fontFamily: "'DM Mono', monospace" }}>
        {value}/{total} {label}
      </span>
    </div>
  );
};

const PhotoPosterTracker = () => {
  const [items, setItems] = useState([]);
  const [collected, setCollected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [drawerItem, setDrawerItem] = useState(null);
  const [drawerDetails, setDrawerDetails] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerClosing, setDrawerClosing] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [hoveredCheck, setHoveredCheck] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [hoveredTipsBtn, setHoveredTipsBtn] = useState(false);
  const drawerRef = useRef(null);

  // Load collected state
  useEffect(() => {
    const load = async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result) {
          const data = JSON.parse(result.value);
          setCollected(data.collected || []);
        }
      } catch (e) {
        console.error('Error loading photo/poster data:', e);
      }
    };
    load();
  }, []);

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/nookipedia/nh/photos?excludedetails=true');
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        setItems(data.sort((a, b) => a.localeCompare(b)));
        setFadeIn(true);
      } catch (e) {
        console.error('Error fetching photos/posters:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const toggleCollected = useCallback((name) => {
    setCollected(prev => {
      const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name];
      window.storage.set(STORAGE_KEY, JSON.stringify({ collected: next })).catch(() => {});
      return next;
    });
  }, []);

  const openDrawer = useCallback(async (itemName) => {
    setDrawerItem(itemName);
    setDrawerDetails(null);
    setDrawerLoading(true);
    setDrawerClosing(false);
    try {
      const res = await fetch(`/api/nookipedia/nh/photos/${encodeURIComponent(itemName)}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setDrawerDetails(data);
    } catch (e) {
      console.error('Error fetching details:', e);
      setDrawerDetails({ error: e.message });
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerClosing(true);
    setTimeout(() => {
      setDrawerItem(null);
      setDrawerDetails(null);
      setDrawerClosing(false);
    }, 250);
  }, []);

  // Click outside drawer
  useEffect(() => {
    if (!drawerItem) return;
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        closeDrawer();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [drawerItem, closeDrawer]);

  // Filter items
  const filtered = items.filter(name => {
    if (activeTab === 'Photos' && !isPhoto(name)) return false;
    if (activeTab === 'Posters' && !isPoster(name)) return false;
    if (search) {
      const villager = extractVillagerName(name).toLowerCase();
      if (!villager.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const totalPhotos = items.filter(isPhoto).length;
  const totalPosters = items.filter(isPoster).length;
  const collectedPhotos = collected.filter(n => isPhoto(n)).length;
  const collectedPosters = collected.filter(n => isPoster(n)).length;
  const totalCollected = collected.length;

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`}</style>
        <div style={styles.loadingWrap}>
          <span style={{ fontSize: 48 }}>📸</span>
          <p style={{ color: '#5ec850', fontFamily: "'DM Sans', sans-serif", marginTop: 12 }}>Loading photos & posters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`}</style>
        <div style={styles.loadingWrap}>
          <span style={{ fontSize: 48 }}>⚠️</span>
          <p style={{ color: '#ff6464', fontFamily: "'DM Sans', sans-serif", marginTop: 12 }}>Failed to load: {error}</p>
        </div>
      </div>
    );
  }

  const drawerVillager = drawerItem ? extractVillagerName(drawerItem) : '';

  return (
    <div style={{ ...styles.container, opacity: fadeIn ? 1 : 0, transition: 'opacity 0.5s ease' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 32 }}>📸</span>
          <div>
            <h1 style={styles.title}>Photo & Poster Collection</h1>
            <p style={styles.subtitle}>
              Track your villager photos and posters — {totalCollected} of {items.length} collected
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowTips(!showTips)}
          onMouseEnter={() => setHoveredTipsBtn(true)}
          onMouseLeave={() => setHoveredTipsBtn(false)}
          style={{
            ...styles.tipsBtn,
            background: hoveredTipsBtn ? 'rgba(212,176,48,0.2)' : 'rgba(212,176,48,0.1)',
            border: hoveredTipsBtn ? '1px solid rgba(212,176,48,0.5)' : '1px solid rgba(212,176,48,0.25)',
          }}
        >
          💡 Friendship Tips
        </button>
      </div>

      {/* Friendship tips panel */}
      {showTips && (
        <div style={styles.tipsPanel}>
          <h3 style={styles.tipsTitle}>How to Get Villager Photos</h3>
          <div style={styles.tipsGrid}>
            <div style={styles.tipCard}>
              <span style={{ fontSize: 20 }}>🎁</span>
              <div>
                <strong style={{ color: '#5ec850' }}>Gift Daily</strong>
                <p style={styles.tipText}>Give a wrapped gift worth 2,500+ Bells every day. Iron Wall Lamp and Gold Rose Wreath are popular choices.</p>
              </div>
            </div>
            <div style={styles.tipCard}>
              <span style={{ fontSize: 20 }}>💬</span>
              <div>
                <strong style={{ color: '#5ec850' }}>Talk Often</strong>
                <p style={styles.tipText}>Have at least one conversation per day. Additional chats give diminishing returns.</p>
              </div>
            </div>
            <div style={styles.tipCard}>
              <span style={{ fontSize: 20 }}>✉️</span>
              <div>
                <strong style={{ color: '#4aacf0' }}>Send Letters</strong>
                <p style={styles.tipText}>Send letters with a gift attached. Villagers love getting mail!</p>
              </div>
            </div>
            <div style={styles.tipCard}>
              <span style={{ fontSize: 20 }}>🏥</span>
              <div>
                <strong style={{ color: '#4aacf0' }}>Give Medicine</strong>
                <p style={styles.tipText}>When a villager is sick, give them medicine for a big friendship boost.</p>
              </div>
            </div>
            <div style={styles.tipCard}>
              <span style={{ fontSize: 20 }}>📸</span>
              <div>
                <strong style={{ color: '#d4b030' }}>Max Friendship</strong>
                <p style={styles.tipText}>Photos are only given at maximum friendship level (6 full points). It takes about 2 weeks of daily gifting.</p>
              </div>
            </div>
            <div style={styles.tipCard}>
              <span style={{ fontSize: 20 }}>🖼️</span>
              <div>
                <strong style={{ color: '#d4b030' }}>Posters</strong>
                <p style={styles.tipText}>Posters unlock via Nook Shopping after inviting a villager to Photopia (Harv's Island) or scanning their amiibo.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={styles.statsRow}>
        <ProgressRing value={totalCollected} total={items.length} size={80} color="#5ec850" label="total" />
        <ProgressRing value={collectedPhotos} total={totalPhotos} size={70} color="#d4b030" label="photos" />
        <ProgressRing value={collectedPosters} total={totalPosters} size={70} color="#4aacf0" label="posters" />
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.tabRow}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              onMouseEnter={() => setHoveredTab(tab)}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                ...styles.tabBtn,
                background: activeTab === tab ? 'rgba(94,200,80,0.2)' : hoveredTab === tab ? 'rgba(94,200,80,0.08)' : 'transparent',
                border: activeTab === tab ? '1px solid rgba(94,200,80,0.4)' : '1px solid rgba(94,200,80,0.1)',
                color: activeTab === tab ? '#5ec850' : '#5a7a50',
              }}
            >
              {tab}
              <span style={styles.tabCount}>
                {tab === 'All' ? items.length : tab === 'Photos' ? totalPhotos : totalPosters}
              </span>
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search villager name..."
          style={styles.searchInput}
        />
      </div>

      {/* Grid */}
      <div style={styles.grid}>
        {filtered.map(name => {
          const villager = extractVillagerName(name);
          const isCollected = collected.includes(name);
          const type = isPhoto(name) ? 'photo' : 'poster';
          const isHovered = hoveredCard === name;

          return (
            <div
              key={name}
              onClick={() => openDrawer(name)}
              onMouseEnter={() => setHoveredCard(name)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                ...styles.card,
                background: isHovered ? 'rgba(12,28,14,1)' : 'rgba(12,28,14,0.95)',
                border: isHovered
                  ? `1px solid ${type === 'photo' ? 'rgba(212,176,48,0.4)' : 'rgba(74,172,240,0.4)'}`
                  : '1px solid rgba(94,200,80,0.1)',
                transform: isHovered ? 'translateY(-2px)' : 'none',
                opacity: isCollected ? 1 : 0.65,
              }}
            >
              <div
                onClick={(e) => { e.stopPropagation(); toggleCollected(name); }}
                onMouseEnter={() => setHoveredCheck(name)}
                onMouseLeave={() => setHoveredCheck(null)}
                style={{
                  ...styles.checkbox,
                  background: isCollected ? '#5ec850' : hoveredCheck === name ? 'rgba(94,200,80,0.15)' : 'rgba(94,200,80,0.05)',
                  border: isCollected ? '2px solid #5ec850' : '2px solid rgba(94,200,80,0.3)',
                }}
              >
                {isCollected && <span style={{ color: '#0a1a10', fontSize: 12, fontWeight: 700 }}>✓</span>}
              </div>
              <div style={styles.cardSprite}>
                <AssetImg category="villagers" name={villager} size={40} />
              </div>
              <div style={styles.cardInfo}>
                <span style={styles.cardName}>{villager}</span>
                <span style={{
                  ...styles.typeBadge,
                  background: type === 'photo' ? 'rgba(212,176,48,0.15)' : 'rgba(74,172,240,0.15)',
                  color: type === 'photo' ? '#d4b030' : '#4aacf0',
                  border: type === 'photo' ? '1px solid rgba(212,176,48,0.25)' : '1px solid rgba(74,172,240,0.25)',
                }}>
                  {type === 'photo' ? '📸 Photo' : '🖼️ Poster'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={styles.emptyState}>
          <span style={{ fontSize: 40 }}>🔍</span>
          <p style={{ color: '#5a7a50', marginTop: 8 }}>No items match your search.</p>
        </div>
      )}

      {/* Detail Drawer */}
      {drawerItem && (
        <div style={styles.drawerOverlay}>
          <div
            ref={drawerRef}
            style={{
              ...styles.drawer,
              animation: drawerClosing ? 'none' : undefined,
              transform: drawerClosing ? 'translateX(100%)' : 'translateX(0)',
              transition: 'transform 0.25s ease',
            }}
          >
            <button onClick={closeDrawer} style={styles.drawerClose}>✕</button>

            <div style={styles.drawerHeader}>
              <AssetImg category="villagers" name={drawerVillager} size={72} />
              <h2 style={styles.drawerTitle}>{drawerVillager}</h2>
              <span style={{
                ...styles.typeBadge,
                fontSize: 13,
                padding: '4px 14px',
                background: isPhoto(drawerItem) ? 'rgba(212,176,48,0.15)' : 'rgba(74,172,240,0.15)',
                color: isPhoto(drawerItem) ? '#d4b030' : '#4aacf0',
                border: isPhoto(drawerItem) ? '1px solid rgba(212,176,48,0.25)' : '1px solid rgba(74,172,240,0.25)',
              }}>
                {isPhoto(drawerItem) ? '📸 Photo' : '🖼️ Poster'}
              </span>
            </div>

            {drawerLoading ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#5a7a50' }}>Loading details...</div>
            ) : drawerDetails?.error ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#ff6464' }}>Failed to load details</div>
            ) : drawerDetails ? (
              <div style={styles.drawerBody}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Item Name</span>
                  <span style={styles.detailValue}>{drawerDetails.name}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Category</span>
                  <span style={styles.detailValue}>{drawerDetails.category}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Sell Price</span>
                  <span style={styles.detailValue}>
                    {drawerDetails.sell != null ? `${drawerDetails.sell} Bells` : '—'}
                  </span>
                </div>
                {drawerDetails.buy?.length > 0 && (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Buy Price</span>
                    <span style={styles.detailValue}>
                      {drawerDetails.buy.map(b => `${b.price} ${b.currency}`).join(', ')}
                    </span>
                  </div>
                )}
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>HHA Base</span>
                  <span style={styles.detailValue}>{drawerDetails.hha_base ?? '—'}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Customizable</span>
                  <span style={styles.detailValue}>{drawerDetails.customizable ? 'Yes' : 'No'}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>How to Obtain</span>
                  <span style={styles.detailValue}>
                    {drawerDetails.availability?.map(a => a.from).join(', ') || '—'}
                  </span>
                </div>

                {/* Frame Variations (photos have multiple) */}
                {drawerDetails.variations?.length > 1 && (
                  <div style={{ marginTop: 16 }}>
                    <span style={{ ...styles.detailLabel, display: 'block', marginBottom: 8 }}>
                      Frame Variations ({drawerDetails.variations.length})
                    </span>
                    <div style={styles.variationsGrid}>
                      {drawerDetails.variations.map((v, i) => (
                        <div key={i} style={styles.variationChip}>
                          {v.variation || 'Default'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collected toggle in drawer */}
                <button
                  onClick={() => toggleCollected(drawerItem)}
                  style={{
                    ...styles.drawerCollectBtn,
                    background: collected.includes(drawerItem) ? 'rgba(94,200,80,0.2)' : 'rgba(94,200,80,0.08)',
                    border: collected.includes(drawerItem) ? '1px solid rgba(94,200,80,0.5)' : '1px solid rgba(94,200,80,0.2)',
                  }}
                >
                  {collected.includes(drawerItem) ? '✓ Collected' : 'Mark as Collected'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: 24,
    minHeight: '100vh',
    background: '#0a1a10',
    fontFamily: "'DM Sans', sans-serif",
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28,
    fontWeight: 900,
    color: '#5ec850',
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    color: '#5a7a50',
    marginTop: 4,
    fontFamily: "'DM Mono', monospace",
  },
  tipsBtn: {
    padding: '8px 16px',
    borderRadius: 8,
    color: '#d4b030',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
    whiteSpace: 'nowrap',
  },
  tipsPanel: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(212,176,48,0.15)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  tipsTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
    fontWeight: 700,
    color: '#d4b030',
    marginBottom: 16,
  },
  tipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 12,
  },
  tipCard: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    padding: 12,
    background: 'rgba(10,26,16,0.8)',
    borderRadius: 8,
    border: '1px solid rgba(94,200,80,0.08)',
  },
  tipText: {
    fontSize: 12,
    color: '#5a7a50',
    lineHeight: 1.5,
    marginTop: 2,
  },
  statsRow: {
    display: 'flex',
    gap: 32,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px 0',
    marginBottom: 20,
    background: 'rgba(12,28,14,0.95)',
    borderRadius: 12,
    border: '1px solid rgba(94,200,80,0.1)',
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  tabRow: {
    display: 'flex',
    gap: 6,
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 8,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  },
  tabCount: {
    fontSize: 11,
    fontFamily: "'DM Mono', monospace",
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    minWidth: 180,
    padding: '8px 14px',
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.15)',
    borderRadius: 8,
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    outline: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 10,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
    position: 'relative',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
  },
  cardSprite: {
    flexShrink: 0,
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    overflow: 'hidden',
  },
  cardName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#c8e6c0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  typeBadge: {
    fontSize: 10,
    fontFamily: "'DM Mono', monospace",
    padding: '2px 8px',
    borderRadius: 6,
    width: 'fit-content',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  drawerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  drawer: {
    width: 380,
    maxWidth: '90vw',
    height: '100vh',
    background: '#0a1a10',
    borderLeft: '1px solid rgba(94,200,80,0.15)',
    overflowY: 'auto',
    padding: 24,
    position: 'relative',
  },
  drawerClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    background: 'none',
    border: 'none',
    color: '#5a7a50',
    fontSize: 20,
    cursor: 'pointer',
    outline: 'none',
    padding: 4,
  },
  drawerHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottom: '1px solid rgba(94,200,80,0.1)',
    marginBottom: 16,
  },
  drawerTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    fontWeight: 700,
    color: '#c8e6c0',
    margin: 0,
  },
  drawerBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid rgba(94,200,80,0.05)',
  },
  detailLabel: {
    fontSize: 12,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
  },
  detailValue: {
    fontSize: 13,
    color: '#c8e6c0',
    fontWeight: 500,
    textAlign: 'right',
  },
  variationsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  variationChip: {
    padding: '4px 10px',
    background: 'rgba(212,176,48,0.1)',
    border: '1px solid rgba(212,176,48,0.2)',
    borderRadius: 6,
    fontSize: 11,
    color: '#d4b030',
    fontFamily: "'DM Mono', monospace",
  },
  drawerCollectBtn: {
    marginTop: 20,
    padding: '12px 20px',
    borderRadius: 10,
    color: '#5ec850',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
    textAlign: 'center',
  },
};

export default PhotoPosterTracker;
