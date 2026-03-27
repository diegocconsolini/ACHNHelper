'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'acnh-gyroid-tracker';

const SOUND_COLORS = {
  'Crash': '#ff6b6b',
  'Drum set': '#d4b030',
  'Hi-hat': '#4aacf0',
  'Kick': '#5ec850',
  'Melody': '#cc66ff',
  'Snare': '#ff9f43',
};

const SOUND_TYPES = ['All', 'Crash', 'Drum set', 'Hi-hat', 'Kick', 'Melody', 'Snare'];

const GyroidTracker = () => {
  const [gyroids, setGyroids] = useState([]);
  const [collected, setCollected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [soundFilter, setSoundFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [drawerGyroid, setDrawerGyroid] = useState(null);
  const [drawerClosing, setDrawerClosing] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredCheck, setHoveredCheck] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);

  // Load collected state from storage
  useEffect(() => {
    const load = async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result) {
          const data = JSON.parse(result.value);
          setCollected(data.collected || []);
        }
      } catch (e) {
        console.error('Error loading gyroid data:', e);
      }
    };
    load();
  }, []);

  // Fetch gyroids from API
  useEffect(() => {
    const fetchGyroids = async () => {
      try {
        const res = await fetch('/api/nookipedia/nh/gyroids');
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        setGyroids(data);
        setFadeIn(true);
      } catch (e) {
        console.error('Error fetching gyroids:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGyroids();
  }, []);

  const saveCollected = useCallback(async (newCollected) => {
    setCollected(newCollected);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify({ collected: newCollected }));
    } catch (e) {
      console.error('Error saving gyroid data:', e);
    }
  }, []);

  const toggleCollected = useCallback((name) => {
    setCollected(prev => {
      const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name];
      window.storage.set(STORAGE_KEY, JSON.stringify({ collected: next })).catch(() => {});
      return next;
    });
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerClosing(true);
    setTimeout(() => {
      setDrawerGyroid(null);
      setDrawerClosing(false);
    }, 250);
  }, []);

  // Escape key closes drawer
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') closeDrawer(); };
    if (drawerGyroid) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [drawerGyroid, closeDrawer]);

  // Filter gyroids
  const filtered = gyroids.filter(g => {
    if (soundFilter !== 'All' && g.sound !== soundFilter) return false;
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const collectedCount = collected.length;
  const totalCount = gyroids.length || 36;
  const progressPct = totalCount > 0 ? (collectedCount / totalCount) * 100 : 0;

  // Progress ring
  const ringSize = 64;
  const ringStroke = 5;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (progressPct / 100) * ringCircumference;

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const styles = {
    container: {
      padding: '24px',
      fontFamily: "'DM Sans', sans-serif",
      color: '#c8e6c0',
      minHeight: '100vh',
      opacity: fadeIn ? 1 : 0,
      transition: 'opacity 0.4s ease',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px',
    },
    titleSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '32px',
      fontWeight: 900,
      color: '#5ec850',
      margin: 0,
    },
    subtitle: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      color: '#5a7a50',
      marginTop: '4px',
    },
    progressRing: {
      position: 'relative',
      width: ringSize,
      height: ringSize,
      flexShrink: 0,
    },
    progressText: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontFamily: "'DM Mono', monospace",
      fontSize: '13px',
      fontWeight: 500,
      color: '#c8e6c0',
      textAlign: 'center',
      lineHeight: 1.1,
    },
    controls: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '20px',
      alignItems: 'center',
    },
    searchInput: {
      background: 'rgba(12,28,14,0.95)',
      border: '1px solid rgba(94,200,80,0.15)',
      borderRadius: '8px',
      padding: '8px 14px',
      color: '#c8e6c0',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      outline: 'none',
      width: '220px',
      transition: 'border-color 0.2s ease',
    },
    filterBtns: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
    },
    filterBtn: (active, sound) => ({
      padding: '6px 14px',
      borderRadius: '16px',
      border: active ? `1px solid ${sound === 'All' ? '#5ec850' : (SOUND_COLORS[sound] || '#5ec850')}` : '1px solid rgba(94,200,80,0.15)',
      background: active ? `${sound === 'All' ? '#5ec850' : (SOUND_COLORS[sound] || '#5ec850')}22` : 'rgba(12,28,14,0.95)',
      color: active ? (sound === 'All' ? '#5ec850' : (SOUND_COLORS[sound] || '#5ec850')) : '#5a7a50',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '13px',
      fontWeight: 500,
      cursor: 'pointer',
      outline: 'none',
      transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
    }),
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '14px',
      marginTop: '8px',
    },
    card: (isHovered, isCollected) => ({
      background: 'rgba(12,28,14,0.95)',
      border: isCollected ? '1px solid rgba(94,200,80,0.35)' : '1px solid rgba(94,200,80,0.1)',
      borderRadius: '12px',
      padding: '16px',
      cursor: 'pointer',
      transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
      transform: isHovered ? 'translateY(-2px)' : 'none',
      boxShadow: isHovered ? '0 4px 16px rgba(94,200,80,0.12)' : 'none',
      position: 'relative',
    }),
    cardEmoji: {
      fontSize: '36px',
      marginBottom: '8px',
      display: 'block',
    },
    cardImage: {
      width: '48px',
      height: '48px',
      objectFit: 'contain',
      marginBottom: '8px',
      borderRadius: '6px',
    },
    cardName: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '15px',
      fontWeight: 700,
      color: '#c8e6c0',
      marginBottom: '6px',
    },
    soundBadge: (sound) => ({
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '10px',
      fontSize: '11px',
      fontWeight: 500,
      fontFamily: "'DM Mono', monospace",
      color: SOUND_COLORS[sound] || '#c8e6c0',
      background: `${SOUND_COLORS[sound] || '#5ec850'}18`,
      border: `1px solid ${SOUND_COLORS[sound] || '#5ec850'}33`,
    }),
    cardPrice: {
      fontFamily: "'DM Mono', monospace",
      fontSize: '12px',
      color: '#d4b030',
      marginTop: '6px',
    },
    checkMark: (isCollected) => ({
      position: 'absolute',
      top: '10px',
      right: '10px',
      width: '22px',
      height: '22px',
      borderRadius: '50%',
      border: isCollected ? '2px solid #5ec850' : '2px solid rgba(94,200,80,0.2)',
      background: isCollected ? '#5ec850' : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      color: '#0a1a10',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
    }),
    // Drawer
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      opacity: drawerClosing ? 0 : 1,
      transition: 'opacity 0.25s ease',
    },
    drawer: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '380px',
      maxWidth: '90vw',
      background: '#0a1a10',
      borderLeft: '1px solid rgba(94,200,80,0.15)',
      zIndex: 1001,
      overflowY: 'auto',
      padding: '28px 24px',
      transform: drawerClosing ? 'translateX(100%)' : 'translateX(0)',
      transition: 'transform 0.25s ease',
    },
    drawerClose: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      background: 'none',
      border: 'none',
      color: '#5a7a50',
      fontSize: '24px',
      cursor: 'pointer',
      outline: 'none',
      padding: '4px 8px',
      transition: 'color 0.2s ease',
    },
    drawerImage: {
      width: '100px',
      height: '100px',
      objectFit: 'contain',
      borderRadius: '12px',
      marginBottom: '16px',
      background: 'rgba(12,28,14,0.95)',
      padding: '8px',
    },
    drawerEmoji: {
      fontSize: '72px',
      marginBottom: '16px',
      display: 'block',
    },
    drawerTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '28px',
      fontWeight: 900,
      color: '#c8e6c0',
      marginBottom: '8px',
    },
    drawerField: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid rgba(94,200,80,0.08)',
    },
    drawerLabel: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '13px',
      color: '#5a7a50',
      fontWeight: 500,
    },
    drawerValue: {
      fontFamily: "'DM Mono', monospace",
      fontSize: '13px',
      color: '#c8e6c0',
      fontWeight: 400,
    },
    drawerCheckBtn: (isCollected) => ({
      marginTop: '20px',
      width: '100%',
      padding: '12px',
      borderRadius: '10px',
      border: 'none',
      background: isCollected ? 'rgba(94,200,80,0.15)' : '#5ec850',
      color: isCollected ? '#5ec850' : '#0a1a10',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '15px',
      fontWeight: 700,
      cursor: 'pointer',
      outline: 'none',
      transition: 'background-color 0.2s ease, color 0.2s ease',
    }),
    variationsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '8px',
    },
    variationChip: {
      padding: '4px 10px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: "'DM Sans', sans-serif",
      background: 'rgba(74,172,240,0.1)',
      border: '1px solid rgba(74,172,240,0.2)',
      color: '#4aacf0',
    },
    variationImg: {
      width: '36px',
      height: '36px',
      objectFit: 'contain',
      borderRadius: '6px',
      background: 'rgba(12,28,14,0.95)',
    },
    // Loading
    loadingSkeleton: {
      background: 'rgba(12,28,14,0.95)',
      border: '1px solid rgba(94,200,80,0.1)',
      borderRadius: '12px',
      padding: '16px',
      height: '140px',
      animation: 'pulse 1.5s ease-in-out infinite',
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px 24px',
      color: '#5a7a50',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '15px',
    },
    errorState: {
      textAlign: 'center',
      padding: '48px 24px',
      color: '#ff6464',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '15px',
    },
    stats: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
      marginBottom: '20px',
    },
    statCard: {
      background: 'rgba(12,28,14,0.95)',
      border: '1px solid rgba(94,200,80,0.1)',
      borderRadius: '10px',
      padding: '12px 18px',
      flex: '1 1 120px',
    },
    statValue: {
      fontFamily: "'DM Mono', monospace",
      fontSize: '22px',
      fontWeight: 500,
      color: '#5ec850',
    },
    statLabel: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '12px',
      color: '#5a7a50',
      marginTop: '2px',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
@keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
        <div style={styles.header}>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>Gyroid Tracker</h1>
          </div>
        </div>
        <div style={styles.grid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={styles.loadingSkeleton} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`}</style>
        <h1 style={styles.title}>Gyroid Tracker</h1>
        <div style={styles.errorState}>
          <p>Failed to load gyroid data: {error}</p>
          <p style={{ marginTop: '8px', color: '#5a7a50' }}>Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  // Count collected by sound type
  const soundCounts = {};
  SOUND_TYPES.filter(s => s !== 'All').forEach(s => {
    const total = gyroids.filter(g => g.sound === s).length;
    const done = gyroids.filter(g => g.sound === s && collected.includes(g.name)).length;
    soundCounts[s] = { total, done };
  });

  return (
    <div style={styles.container}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
@keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <div style={styles.progressRing}>
            <svg width={ringSize} height={ringSize}>
              <circle
                cx={ringSize / 2} cy={ringSize / 2} r={ringRadius}
                fill="none" stroke="rgba(94,200,80,0.1)" strokeWidth={ringStroke}
              />
              <circle
                cx={ringSize / 2} cy={ringSize / 2} r={ringRadius}
                fill="none" stroke="#5ec850" strokeWidth={ringStroke}
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                style={{ transition: 'stroke-dashoffset 0.4s ease' }}
              />
            </svg>
            <div style={styles.progressText}>
              {collectedCount}/{totalCount}
            </div>
          </div>
          <div>
            <h1 style={styles.title}>Gyroid Tracker</h1>
            <div style={styles.subtitle}>
              {collectedCount === totalCount ? 'All gyroids collected!' : `${totalCount - collectedCount} remaining`}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        {SOUND_TYPES.filter(s => s !== 'All').map(s => (
          <div key={s} style={styles.statCard}>
            <div style={{ ...styles.statValue, color: SOUND_COLORS[s] }}>
              {soundCounts[s]?.done || 0}/{soundCounts[s]?.total || 0}
            </div>
            <div style={styles.statLabel}>{s}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <input
          style={styles.searchInput}
          placeholder="Search gyroids..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(94,200,80,0.4)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(94,200,80,0.15)'; }}
        />
        <div style={styles.filterBtns}>
          {SOUND_TYPES.map(s => (
            <button
              key={s}
              style={styles.filterBtn(soundFilter === s, s)}
              onClick={() => setSoundFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={styles.emptyState}>No gyroids match your filters.</div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((g) => {
            const isCollected = collected.includes(g.name);
            const isHovered = hoveredCard === g.name;
            const imageUrl = g.variations?.[0]?.image_url;
            return (
              <div
                key={g.name}
                style={styles.card(isHovered, isCollected)}
                onMouseEnter={() => setHoveredCard(g.name)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setDrawerGyroid(g)}
              >
                <div
                  style={styles.checkMark(isCollected)}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCollected(g.name);
                  }}
                  onMouseEnter={() => setHoveredCheck(g.name)}
                  onMouseLeave={() => setHoveredCheck(null)}
                >
                  {isCollected ? '✓' : ''}
                </div>
                {imageUrl ? (
                  <img src={imageUrl} alt={g.name} style={styles.cardImage} loading="lazy" />
                ) : (
                  <span style={styles.cardEmoji}>🗿</span>
                )}
                <div style={styles.cardName}>{capitalize(g.name)}</div>
                <div style={styles.soundBadge(g.sound)}>{g.sound}</div>
                <div style={styles.cardPrice}>💰 {g.sell?.toLocaleString() || '—'}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Drawer */}
      {drawerGyroid && (
        <>
          <div style={styles.overlay} onClick={closeDrawer} />
          <div style={styles.drawer}>
            <button style={styles.drawerClose} onClick={closeDrawer}>✕</button>

            {drawerGyroid.variations?.[0]?.image_url ? (
              <img
                src={drawerGyroid.variations[0].image_url}
                alt={drawerGyroid.name}
                style={styles.drawerImage}
              />
            ) : (
              <span style={styles.drawerEmoji}>🗿</span>
            )}

            <div style={styles.drawerTitle}>{capitalize(drawerGyroid.name)}</div>
            <div style={{ ...styles.soundBadge(drawerGyroid.sound), marginBottom: '20px' }}>
              {drawerGyroid.sound}
            </div>

            <div style={styles.drawerField}>
              <span style={styles.drawerLabel}>Sell Price</span>
              <span style={{ ...styles.drawerValue, color: '#d4b030' }}>
                {drawerGyroid.sell?.toLocaleString() || '—'} Bells
              </span>
            </div>

            <div style={styles.drawerField}>
              <span style={styles.drawerLabel}>HHA Base</span>
              <span style={styles.drawerValue}>{drawerGyroid.hha_base || '—'}</span>
            </div>

            <div style={styles.drawerField}>
              <span style={styles.drawerLabel}>Variations</span>
              <span style={{ ...styles.drawerValue, color: '#4aacf0' }}>
                {drawerGyroid.variation_total || '—'}
              </span>
            </div>

            <div style={styles.drawerField}>
              <span style={styles.drawerLabel}>Customizable</span>
              <span style={styles.drawerValue}>
                {drawerGyroid.customizable ? `Yes (${drawerGyroid.custom_kits} kit)` : 'No'}
              </span>
            </div>

            {drawerGyroid.custom_body_part && (
              <div style={styles.drawerField}>
                <span style={styles.drawerLabel}>Custom Part</span>
                <span style={styles.drawerValue}>{drawerGyroid.custom_body_part}</span>
              </div>
            )}

            {drawerGyroid.cyrus_price > 0 && (
              <div style={styles.drawerField}>
                <span style={styles.drawerLabel}>Cyrus Price</span>
                <span style={{ ...styles.drawerValue, color: '#d4b030' }}>
                  {drawerGyroid.cyrus_price?.toLocaleString()} Bells
                </span>
              </div>
            )}

            <div style={styles.drawerField}>
              <span style={styles.drawerLabel}>Found By</span>
              <span style={styles.drawerValue}>
                {drawerGyroid.availability?.map(a => a.from).join(', ') || 'Dig spot'}
              </span>
            </div>

            <div style={styles.drawerField}>
              <span style={styles.drawerLabel}>Version Added</span>
              <span style={styles.drawerValue}>{drawerGyroid.version_added || '—'}</span>
            </div>

            {/* Variations */}
            {drawerGyroid.variations && drawerGyroid.variations.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ ...styles.drawerLabel, marginBottom: '8px' }}>Color Variations</div>
                <div style={styles.variationsList}>
                  {drawerGyroid.variations.map((v, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {v.image_url && (
                        <img src={v.image_url} alt={v.variation} style={styles.variationImg} loading="lazy" />
                      )}
                      <span style={styles.variationChip}>{v.variation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              style={styles.drawerCheckBtn(collected.includes(drawerGyroid.name))}
              onClick={() => toggleCollected(drawerGyroid.name)}
            >
              {collected.includes(drawerGyroid.name) ? '✓ Collected' : 'Mark as Collected'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GyroidTracker;
