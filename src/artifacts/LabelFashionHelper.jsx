'use client';

import React, { useState, useEffect, useCallback } from 'react';

const THEMES = [
  'Comfy', 'Everyday', 'Fairy tale', 'Formal', 'Goth',
  'Outdoorsy', 'Party', 'Sporty', 'Theatrical', 'Vacation', 'Work',
];

const CATEGORIES = [
  'All', 'Tops', 'Bottoms', 'Dress-Up', 'Headwear',
  'Accessories', 'Socks', 'Shoes', 'Bags', 'Umbrellas',
];

const STORAGE_KEY = 'acnh-label-helper';

const LabelFashionHelper = () => {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [clothingData, setClothingData] = useState({});
  const [themeCounts, setThemeCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [owned, setOwned] = useState([]);
  const [detailItem, setDetailItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fadeIn, setFadeIn] = useState(false);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    loadOwned();
  }, []);

  useEffect(() => {
    if (selectedTheme) {
      setFadeIn(false);
      const t = setTimeout(() => setFadeIn(true), 50);
      return () => clearTimeout(t);
    }
  }, [selectedTheme, categoryFilter]);

  const loadOwned = async () => {
    try {
      const result = await window.storage.get(STORAGE_KEY);
      const data = result ? JSON.parse(result.value) : { owned: [] };
      setOwned(data.owned || []);
    } catch {
      setOwned([]);
    }
  };

  const saveOwned = async (newOwned) => {
    setOwned(newOwned);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify({ owned: newOwned }));
    } catch { /* silent */ }
  };

  const toggleOwned = (itemName) => {
    const next = owned.includes(itemName)
      ? owned.filter(n => n !== itemName)
      : [...owned, itemName];
    saveOwned(next);
  };

  const fetchTheme = useCallback(async (theme) => {
    if (clothingData[theme]) return;
    setLoading(true);
    try {
      const encodedTheme = encodeURIComponent(theme);
      const res = await fetch(`/api/nookipedia/nh/clothing?labeltheme=${encodedTheme}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setClothingData(prev => ({ ...prev, [theme]: data }));
      setThemeCounts(prev => ({ ...prev, [theme]: data.length }));
    } catch (err) {
      console.error('Failed to fetch clothing for theme:', theme, err);
      setClothingData(prev => ({ ...prev, [theme]: [] }));
    } finally {
      setLoading(false);
    }
  }, [clothingData]);

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    setCategoryFilter('All');
    setSearchTerm('');
    setDetailItem(null);
    fetchTheme(theme);
  };

  const getCategory = (item) => {
    const cat = (item.category || '').toLowerCase();
    if (cat.includes('top') || cat.includes('shirt') || cat.includes('sweater') || cat.includes('coat') || cat.includes('jacket') || cat.includes('tee') || cat.includes('blouse')) return 'Tops';
    if (cat.includes('bottom') || cat.includes('pants') || cat.includes('skirt') || cat.includes('shorts')) return 'Bottoms';
    if (cat.includes('dress') || cat.includes('robe') || cat.includes('outfit') || cat.includes('costume')) return 'Dress-Up';
    if (cat.includes('hat') || cat.includes('helmet') || cat.includes('cap') || cat.includes('headwear') || cat.includes('wig') || cat.includes('ribbon') || cat.includes('veil') || cat.includes('tiara') || cat.includes('crown')) return 'Headwear';
    if (cat.includes('accessori') || cat.includes('glasses') || cat.includes('mask') || cat.includes('nose') || cat.includes('mouth') || cat.includes('eye')) return 'Accessories';
    if (cat.includes('sock') || cat.includes('tights') || cat.includes('stockings') || cat.includes('leggings')) return 'Socks';
    if (cat.includes('shoe') || cat.includes('boot') || cat.includes('sandal') || cat.includes('sneaker') || cat.includes('loafer') || cat.includes('slipper') || cat.includes('heel') || cat.includes('pumps')) return 'Shoes';
    if (cat.includes('bag') || cat.includes('backpack') || cat.includes('pochette') || cat.includes('purse') || cat.includes('sacoche') || cat.includes('tote')) return 'Bags';
    if (cat.includes('umbrella') || cat.includes('parasol')) return 'Umbrellas';
    return 'Accessories';
  };

  const currentItems = selectedTheme && clothingData[selectedTheme]
    ? clothingData[selectedTheme]
      .filter(item => categoryFilter === 'All' || getCategory(item) === categoryFilter)
      .filter(item => !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const ownedByCategory = {};
  if (selectedTheme && clothingData[selectedTheme]) {
    clothingData[selectedTheme]
      .filter(item => owned.includes(item.name))
      .forEach(item => {
        const cat = getCategory(item);
        if (!ownedByCategory[cat]) ownedByCategory[cat] = [];
        ownedByCategory[cat].push(item);
      });
  }

  const ownedCount = selectedTheme && clothingData[selectedTheme]
    ? clothingData[selectedTheme].filter(item => owned.includes(item.name)).length
    : 0;

  const getItemImage = (item) => {
    if (item.variations && item.variations.length > 0 && item.variations[0].image_url) {
      return item.variations[0].image_url;
    }
    if (item.image_url) return item.image_url;
    return null;
  };

  return (
    <div style={styles.root}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <span style={{ fontSize: 36 }}>👗</span>
          <div>
            <h1 style={styles.title}>Label Fashion Challenge</h1>
            <p style={styles.subtitle}>
              Find clothing that matches Label's fashion themes
            </p>
          </div>
        </div>
      </div>

      {/* Theme Selector */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Select a Theme</h2>
        <div style={styles.themeGrid}>
          {THEMES.map(theme => {
            const isActive = selectedTheme === theme;
            const isHover = hovered === `theme-${theme}`;
            return (
              <button
                key={theme}
                onClick={() => handleThemeSelect(theme)}
                onMouseEnter={() => setHovered(`theme-${theme}`)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  ...styles.themeBtn,
                  background: isActive
                    ? 'rgba(94,200,80,0.2)'
                    : isHover
                      ? 'rgba(94,200,80,0.08)'
                      : 'rgba(12,28,14,0.95)',
                  border: isActive
                    ? '1px solid #5ec850'
                    : '1px solid rgba(94,200,80,0.15)',
                  color: isActive ? '#5ec850' : '#c8e6c0',
                  transform: isHover ? 'translateY(-1px)' : 'none',
                }}
              >
                <span style={styles.themeName}>{theme}</span>
                {themeCounts[theme] != null && (
                  <span style={{
                    ...styles.themeBadge,
                    background: isActive ? 'rgba(94,200,80,0.3)' : 'rgba(212,176,48,0.15)',
                    color: isActive ? '#5ec850' : '#d4b030',
                  }}>
                    {themeCounts[theme]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={styles.loadingContainer}>
          <span style={{ fontSize: 32, animation: 'spin 1s linear infinite' }}>🧵</span>
          <p style={{ color: '#5ec850', fontFamily: "'DM Sans', sans-serif", marginTop: 8 }}>
            Loading clothing data...
          </p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Results */}
      {selectedTheme && !loading && clothingData[selectedTheme] && (
        <>
          {/* Category Filter + Search */}
          <div style={styles.filterRow}>
            <div style={styles.categoryBtns}>
              {CATEGORIES.map(cat => {
                const isActive = categoryFilter === cat;
                const isHover = hovered === `cat-${cat}`;
                const count = cat === 'All'
                  ? clothingData[selectedTheme].length
                  : clothingData[selectedTheme].filter(i => getCategory(i) === cat).length;
                if (cat !== 'All' && count === 0) return null;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    onMouseEnter={() => setHovered(`cat-${cat}`)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      ...styles.catBtn,
                      background: isActive ? 'rgba(74,172,240,0.15)' : isHover ? 'rgba(74,172,240,0.08)' : 'transparent',
                      border: isActive ? '1px solid rgba(74,172,240,0.5)' : '1px solid rgba(94,200,80,0.1)',
                      color: isActive ? '#4aacf0' : '#c8e6c0',
                    }}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Stats bar */}
          <div style={styles.statsBar}>
            <span style={{ color: '#5a7a50', fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
              {currentItems.length} item{currentItems.length !== 1 ? 's' : ''}
              {categoryFilter !== 'All' ? ` in ${categoryFilter}` : ''}
              {' '} · <span style={{ color: '#d4b030' }}>{ownedCount} owned</span>
            </span>
          </div>

          {/* Clothing Grid */}
          <div style={{
            ...styles.clothingGrid,
            opacity: fadeIn ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}>
            {currentItems.map(item => {
              const isOwned = owned.includes(item.name);
              const isHover = hovered === `item-${item.name}`;
              const img = getItemImage(item);
              return (
                <div
                  key={item.name}
                  onClick={() => setDetailItem(item)}
                  onMouseEnter={() => setHovered(`item-${item.name}`)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    ...styles.itemCard,
                    border: isOwned
                      ? '1px solid rgba(94,200,80,0.4)'
                      : '1px solid rgba(94,200,80,0.1)',
                    background: isOwned
                      ? 'rgba(94,200,80,0.05)'
                      : 'rgba(12,28,14,0.95)',
                    transform: isHover ? 'translateY(-2px)' : 'none',
                    boxShadow: isHover ? '0 4px 16px rgba(0,0,0,0.3)' : 'none',
                  }}
                >
                  <div style={styles.itemImageWrap}>
                    {img ? (
                      <img src={img} alt={item.name} style={styles.itemImage} />
                    ) : (
                      <span style={{ fontSize: 32 }}>👕</span>
                    )}
                  </div>
                  <div style={styles.itemInfo}>
                    <span style={styles.itemName}>{item.name}</span>
                    <span style={styles.itemCategory}>{getCategory(item)}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOwned(item.name);
                    }}
                    onMouseEnter={() => setHovered(`own-${item.name}`)}
                    onMouseLeave={() => setHovered(`item-${item.name}`)}
                    style={{
                      ...styles.ownBtn,
                      background: isOwned
                        ? 'rgba(94,200,80,0.2)'
                        : 'rgba(94,200,80,0.05)',
                      border: isOwned
                        ? '1px solid rgba(94,200,80,0.5)'
                        : '1px solid rgba(94,200,80,0.15)',
                      color: isOwned ? '#5ec850' : '#5a7a50',
                    }}
                  >
                    {isOwned ? '✓ Owned' : 'Own'}
                  </button>
                </div>
              );
            })}
          </div>

          {currentItems.length === 0 && (
            <div style={styles.emptyState}>
              <span style={{ fontSize: 32 }}>🔍</span>
              <p style={{ color: '#5a7a50', fontSize: 14, marginTop: 8 }}>
                No items match your current filter.
              </p>
            </div>
          )}

          {/* Outfit Summary */}
          {Object.keys(ownedByCategory).length > 0 && (
            <div style={styles.outfitSection}>
              <h2 style={styles.sectionTitle}>
                <span style={{ color: '#d4b030' }}>Your Outfit</span>
                <span style={{ fontSize: 13, color: '#5a7a50', fontWeight: 400, marginLeft: 8, fontFamily: "'DM Mono', monospace" }}>
                  {ownedCount} item{ownedCount !== 1 ? 's' : ''} for "{selectedTheme}"
                </span>
              </h2>
              <div style={styles.outfitGrid}>
                {CATEGORIES.filter(c => c !== 'All' && ownedByCategory[c]).map(cat => (
                  <div key={cat} style={styles.outfitCategory}>
                    <div style={styles.outfitCatHeader}>{cat}</div>
                    {ownedByCategory[cat].map(item => {
                      const img = getItemImage(item);
                      return (
                        <div key={item.name} style={styles.outfitItem}>
                          {img ? (
                            <img src={img} alt={item.name} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                          ) : (
                            <span style={{ fontSize: 16 }}>👕</span>
                          )}
                          <span style={{ fontSize: 12, color: '#c8e6c0' }}>{item.name}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Welcome state */}
      {!selectedTheme && !loading && (
        <div style={styles.welcomeState}>
          <span style={{ fontSize: 48 }}>✂️</span>
          <p style={{ color: '#5a7a50', fontSize: 15, marginTop: 12, textAlign: 'center', lineHeight: 1.6 }}>
            When Label visits your island, she'll challenge you to wear an outfit
            matching one of 11 fashion themes. Select a theme above to browse
            matching clothing and build your outfit.
          </p>
        </div>
      )}

      {/* Detail Drawer */}
      {detailItem && (
        <div style={styles.drawerOverlay} onClick={() => setDetailItem(null)}>
          <div style={styles.drawer} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setDetailItem(null)}
              style={styles.drawerClose}
            >
              ✕
            </button>
            <div style={styles.drawerContent}>
              <div style={styles.drawerImageWrap}>
                {getItemImage(detailItem) ? (
                  <img src={getItemImage(detailItem)} alt={detailItem.name} style={styles.drawerImage} />
                ) : (
                  <span style={{ fontSize: 64 }}>👕</span>
                )}
              </div>
              <h3 style={styles.drawerTitle}>{detailItem.name}</h3>
              <span style={styles.drawerCategoryBadge}>{getCategory(detailItem)}</span>

              <div style={styles.drawerMeta}>
                {detailItem.sell && (
                  <div style={styles.drawerRow}>
                    <span style={styles.drawerLabel}>Sell Price</span>
                    <span style={styles.drawerValue}>
                      <span style={{ color: '#d4b030' }}>{detailItem.sell}</span> Bells
                    </span>
                  </div>
                )}
                {detailItem.styles && detailItem.styles.length > 0 && (
                  <div style={styles.drawerRow}>
                    <span style={styles.drawerLabel}>Styles</span>
                    <span style={styles.drawerValue}>
                      {detailItem.styles.join(', ')}
                    </span>
                  </div>
                )}
                {detailItem.label_themes && detailItem.label_themes.length > 0 && (
                  <div style={styles.drawerRow}>
                    <span style={styles.drawerLabel}>Label Themes</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {detailItem.label_themes.map(t => (
                        <span key={t} style={{
                          fontSize: 11,
                          padding: '2px 8px',
                          borderRadius: 10,
                          background: t === selectedTheme ? 'rgba(94,200,80,0.2)' : 'rgba(74,172,240,0.1)',
                          color: t === selectedTheme ? '#5ec850' : '#4aacf0',
                          fontFamily: "'DM Mono', monospace",
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {detailItem.seasonality && (
                  <div style={styles.drawerRow}>
                    <span style={styles.drawerLabel}>Seasonality</span>
                    <span style={styles.drawerValue}>{detailItem.seasonality}</span>
                  </div>
                )}
                {detailItem.variations && detailItem.variations.length > 1 && (
                  <div style={styles.drawerRow}>
                    <span style={styles.drawerLabel}>Variations</span>
                    <span style={styles.drawerValue}>{detailItem.variations.length} colors</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => toggleOwned(detailItem.name)}
                style={{
                  ...styles.drawerOwnBtn,
                  background: owned.includes(detailItem.name)
                    ? 'rgba(94,200,80,0.2)'
                    : 'rgba(94,200,80,0.08)',
                  border: owned.includes(detailItem.name)
                    ? '1px solid #5ec850'
                    : '1px solid rgba(94,200,80,0.3)',
                  color: owned.includes(detailItem.name) ? '#5ec850' : '#c8e6c0',
                }}
              >
                {owned.includes(detailItem.name) ? '✓ Owned' : 'Mark as Owned'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  root: {
    padding: 24,
    minHeight: '100vh',
    background: '#0a1a10',
    fontFamily: "'DM Sans', sans-serif",
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28,
    fontWeight: 900,
    color: '#5ec850',
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: '#5a7a50',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
    fontWeight: 700,
    color: '#c8e6c0',
    marginBottom: 12,
  },
  themeGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease',
  },
  themeName: {},
  themeBadge: {
    fontSize: 11,
    padding: '1px 7px',
    borderRadius: 10,
    fontFamily: "'DM Mono', monospace",
    fontWeight: 500,
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBtns: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  catBtn: {
    padding: '5px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    fontWeight: 500,
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  },
  searchInput: {
    padding: '7px 14px',
    borderRadius: 8,
    border: '1px solid rgba(94,200,80,0.15)',
    background: 'rgba(12,28,14,0.95)',
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    outline: 'none',
    width: 200,
  },
  statsBar: {
    marginBottom: 16,
    padding: '8px 0',
    borderBottom: '1px solid rgba(94,200,80,0.08)',
  },
  clothingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 12,
    marginBottom: 24,
  },
  itemCard: {
    borderRadius: 10,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
  },
  itemImageWrap: {
    width: 64,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    background: 'rgba(94,200,80,0.04)',
  },
  itemImage: {
    width: 56,
    height: 56,
    objectFit: 'contain',
  },
  itemInfo: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minHeight: 36,
  },
  itemName: {
    fontSize: 12,
    fontWeight: 600,
    color: '#c8e6c0',
    lineHeight: 1.3,
  },
  itemCategory: {
    fontSize: 10,
    color: '#4aacf0',
    fontFamily: "'DM Mono', monospace",
  },
  ownBtn: {
    padding: '4px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    fontWeight: 500,
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 48,
  },
  welcomeState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 48,
  },
  outfitSection: {
    marginTop: 8,
    padding: 20,
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(212,176,48,0.2)',
    borderRadius: 12,
    marginBottom: 24,
  },
  outfitGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 12,
  },
  outfitCategory: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: 10,
  },
  outfitCatHeader: {
    fontSize: 12,
    fontWeight: 700,
    color: '#4aacf0',
    fontFamily: "'DM Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    borderBottom: '1px solid rgba(74,172,240,0.15)',
    paddingBottom: 6,
  },
  outfitItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 0',
  },
  drawerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  drawer: {
    background: 'rgba(12,28,14,0.98)',
    border: '1px solid rgba(94,200,80,0.2)',
    borderRadius: 16,
    padding: 0,
    width: 400,
    maxWidth: '90vw',
    maxHeight: '85vh',
    overflowY: 'auto',
    position: 'relative',
  },
  drawerClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    background: 'rgba(94,200,80,0.1)',
    border: '1px solid rgba(94,200,80,0.2)',
    color: '#c8e6c0',
    width: 32,
    height: 32,
    borderRadius: 8,
    cursor: 'pointer',
    outline: 'none',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerContent: {
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  drawerImageWrap: {
    width: 120,
    height: 120,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(94,200,80,0.04)',
    borderRadius: 12,
  },
  drawerImage: {
    width: 100,
    height: 100,
    objectFit: 'contain',
  },
  drawerTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 20,
    fontWeight: 700,
    color: '#c8e6c0',
    textAlign: 'center',
    margin: 0,
  },
  drawerCategoryBadge: {
    fontSize: 11,
    padding: '3px 12px',
    borderRadius: 10,
    background: 'rgba(74,172,240,0.12)',
    color: '#4aacf0',
    fontFamily: "'DM Mono', monospace",
    fontWeight: 500,
  },
  drawerMeta: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginTop: 8,
  },
  drawerRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  drawerLabel: {
    fontSize: 11,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  drawerValue: {
    fontSize: 14,
    color: '#c8e6c0',
  },
  drawerOwnBtn: {
    marginTop: 8,
    padding: '10px 24px',
    borderRadius: 8,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
    width: '100%',
  },
};

export default LabelFashionHelper;
