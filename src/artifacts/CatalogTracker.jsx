'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

const TABS = [
  { id: 'furniture', label: 'Furniture', emoji: '🪑', endpoint: 'furniture' },
  { id: 'clothing', label: 'Clothing', emoji: '👕', endpoint: 'clothing' },
  { id: 'interior', label: 'Interior', emoji: '🏠', endpoint: 'interior' },
];

const SUBCATEGORIES = {
  furniture: ['Housewares', 'Miscellaneous', 'Wall-mounted', 'Ceiling Decor'],
  clothing: ['Tops', 'Bottoms', 'Dress-Up', 'Headwear', 'Accessories', 'Socks', 'Shoes', 'Bags', 'Umbrellas'],
  interior: ['Rugs', 'Wallpaper', 'Floors'],
};

const API_COLORS = [
  'Aqua', 'Beige', 'Black', 'Blue', 'Brown', 'Colorful',
  'Gray', 'Green', 'Orange', 'Pink', 'Purple', 'Red', 'White', 'Yellow',
];

const PAGE_SIZE = 50;
const STORAGE_KEY = 'acnh-catalog-tracker';

// 3.0 series additions to the Nookipedia furniture catalog (item_series field).
// "Zen Modern" was renamed to "Artful" in game v3.0.2 — see RENAME_MAP below.
const FURNITURE_SERIES_3_0 = [
  'Artful', 'Kids', 'LEGO®', 'Marble', 'Splatoon', 'The Legend of Zelda', 'Tubular',
];
// Other long-standing series worth filtering by (curated subset).
const FURNITURE_SERIES_OTHER = [
  'Antique', 'Bamboo', 'Cardboard', 'Cute', 'Diner', 'Frozen', 'Golden',
  'Imperial', 'Iron', 'Ironwood', 'Log', 'Mario', 'Mermaid', 'Moroccan',
  'Pirate', 'Rattan', 'Shell', 'Spooky', 'Wooden',
];
const FURNITURE_SERIES = [...FURNITURE_SERIES_3_0, ...FURNITURE_SERIES_OTHER].sort();

// One-time storage migration: items saved under "Zen Modern" need to be remapped
// to "Artful" since the upstream rename in 3.0.2. Idempotent.
const SERIES_RENAME_MAP = { 'Zen Modern': 'Artful' };
const STORAGE_MIGRATION_VERSION = 2;

function migrateCatalogStorage(stored) {
  if (!stored || typeof stored !== 'object') return { data: stored, changed: false };
  if (stored.__migration === STORAGE_MIGRATION_VERSION) return { data: stored, changed: false };
  let changed = false;
  const remap = (arr) => {
    if (!Array.isArray(arr)) return arr;
    return arr.map(name => {
      if (typeof name !== 'string') return name;
      // Older versions may have stored series-tagged compound keys. Plain item
      // names are not affected. We only remap any literal "Zen Modern" tag/name.
      for (const [from, to] of Object.entries(SERIES_RENAME_MAP)) {
        if (name === from || name.includes(`[${from}]`)) {
          changed = true;
          return name === from ? to : name.replaceAll(`[${from}]`, `[${to}]`);
        }
      }
      return name;
    });
  };
  const next = {
    furniture: remap(stored.furniture || []),
    clothing: remap(stored.clothing || []),
    interior: remap(stored.interior || []),
    __migration: STORAGE_MIGRATION_VERSION,
  };
  return { data: next, changed: changed || !stored.__migration };
}

const CatalogTracker = () => {
  const [activeTab, setActiveTab] = useState('furniture');
  const [activeSubcat, setActiveSubcat] = useState('Housewares');
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('');
  const [seriesIndex, setSeriesIndex] = useState(null); // { 'Artful': Set('artful bed', ...) }
  const [items, setItems] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cataloged, setCataloged] = useState({ furniture: [], clothing: [], interior: [] });
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [detailItem, setDetailItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [hoveredSubcat, setHoveredSubcat] = useState(null);
  const [hoveredColor, setHoveredColor] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredLoadMore, setHoveredLoadMore] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [subcatTotals, setSubcatTotals] = useState({});
  const [message, setMessage] = useState('');
  const cacheRef = useRef({});

  // Load cataloged data from storage (with one-time Zen Modern → Artful migration)
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result) {
          const raw = JSON.parse(result.value);
          const { data, changed } = migrateCatalogStorage(raw);
          setCataloged(data);
          if (changed) {
            try { await window.storage.set(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
          }
        }
      } catch (e) {
        // Keep defaults
      }
    })();
  }, []);

  // Save cataloged data
  const saveCataloged = useCallback(async (newCataloged) => {
    setCataloged(newCataloged);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(newCataloged));
      setMessage('Saved');
      setTimeout(() => setMessage(''), 1500);
    } catch (e) {
      setMessage('Save failed');
    }
  }, []);

  // Fetch items for subcategory
  const fetchSubcategory = useCallback(async (tab, subcat, color = '') => {
    const cacheKey = `${tab}:${subcat}:${color}`;
    if (cacheRef.current[cacheKey]) {
      setItems(cacheRef.current[cacheKey]);
      setItemCount(cacheRef.current[cacheKey].length);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setItems([]);
    setItemCount(0);

    try {
      const endpoint = TABS.find(t => t.id === tab).endpoint;
      let url = `/api/nookipedia/nh/${endpoint}?category=${encodeURIComponent(subcat)}&excludedetails=true`;
      if (color) url += `&color=${encodeURIComponent(color)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      // The API returns an array of item name strings when excludedetails=true
      const names = Array.isArray(data)
        ? data.map(item => typeof item === 'string' ? item : (item.name || item))
        : [];

      cacheRef.current[cacheKey] = names;
      setItems(names);
      setItemCount(names.length);

      // Store total for progress tracking (only for unfiltered results)
      if (!color) {
        setSubcatTotals(prev => ({ ...prev, [`${tab}:${subcat}`]: names.length }));
      }
    } catch (e) {
      setError(e.message || 'Failed to load items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lazily build a name → series index from the full furniture list so the
  // series filter doesn't require N detail fetches. Only triggered on demand.
  const buildSeriesIndex = useCallback(async () => {
    if (seriesIndex) return seriesIndex;
    try {
      const res = await fetch('/api/nookipedia/nh/furniture');
      if (!res.ok) throw new Error(`API ${res.status}`);
      const all = await res.json();
      const byName = new Map();
      for (const item of all) {
        if (item && item.name && item.item_series) {
          byName.set(item.name.toLowerCase(), item.item_series);
        }
      }
      setSeriesIndex(byName);
      return byName;
    } catch (e) {
      // Series filter unavailable — leave seriesIndex null so UI can show error.
      return null;
    }
  }, [seriesIndex]);

  // Build the index when the user picks a series for the first time.
  useEffect(() => {
    if (seriesFilter && !seriesIndex && activeTab === 'furniture') {
      buildSeriesIndex();
    }
  }, [seriesFilter, seriesIndex, activeTab, buildSeriesIndex]);

  // Fetch when tab, subcategory, or color filter changes
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
    setFadeIn(false);
    fetchSubcategory(activeTab, activeSubcat, colorFilter);
    requestAnimationFrame(() => setFadeIn(true));
  }, [activeTab, activeSubcat, colorFilter, fetchSubcategory]);

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setActiveSubcat(SUBCATEGORIES[tabId][0]);
    setDetailItem(null);
    setColorFilter('');
    setSearchTerm('');
    setSeriesFilter('');
  };

  // Filter items (search + series; series only meaningful on the furniture tab)
  const filteredItems = items.filter(name => {
    if (searchTerm && !name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (seriesFilter && activeTab === 'furniture') {
      if (!seriesIndex) return false; // index still loading; show nothing rather than wrong list
      if (seriesIndex.get(name.toLowerCase()) !== seriesFilter) return false;
    }
    return true;
  });

  const displayedItems = filteredItems.slice(0, displayCount);
  const hasMore = displayCount < filteredItems.length;

  // Toggle cataloged
  const toggleCataloged = (name) => {
    const tabItems = cataloged[activeTab] || [];
    const newItems = tabItems.includes(name)
      ? tabItems.filter(n => n !== name)
      : [...tabItems, name];
    saveCataloged({ ...cataloged, [activeTab]: newItems });
  };

  // Fetch item detail
  const fetchDetail = async (name) => {
    setDetailItem({ name, data: null });
    setDetailLoading(true);
    setDetailError(null);

    const detailCacheKey = `detail:${activeTab}:${name}`;
    if (cacheRef.current[detailCacheKey]) {
      setDetailItem({ name, data: cacheRef.current[detailCacheKey] });
      setDetailLoading(false);
      return;
    }

    try {
      const endpoint = TABS.find(t => t.id === activeTab).endpoint;
      const url = `/api/nookipedia/nh/${endpoint}/${encodeURIComponent(name)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      cacheRef.current[detailCacheKey] = data;
      setDetailItem({ name, data });
    } catch (e) {
      setDetailError(e.message || 'Failed to load details');
    } finally {
      setDetailLoading(false);
    }
  };

  // Count cataloged per subcategory
  const getCatalogCount = (tab) => {
    return (cataloged[tab] || []).length;
  };

  const getSubcatCatalogCount = (tab, subcat) => {
    const cacheKey = `${tab}:${subcat}`;
    const total = subcatTotals[cacheKey] || 0;
    const tabItems = cataloged[tab] || [];
    const subcatItems = cacheRef.current[cacheKey] || [];
    const count = subcatItems.filter(n => tabItems.includes(n)).length;
    return { count, total };
  };

  const totalCataloged = Object.values(cataloged).reduce((sum, arr) => sum + arr.length, 0);

  // Close detail panel
  const closeDetail = () => {
    setDetailItem(null);
    setDetailError(null);
  };

  return (
    <div style={styles.root}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.title}>Catalog Tracker</h1>
            <p style={styles.subtitle}>Browse and track furniture, clothing, and interior items</p>
          </div>
          <div style={styles.headerStats}>
            <div style={styles.statBadge}>
              <span style={styles.statNumber}>{totalCataloged}</span>
              <span style={styles.statLabel}>cataloged</span>
            </div>
            {message && <span style={styles.saveMsg}>{message}</span>}
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabRow}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const isHovered = hoveredTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                style={{
                  ...styles.tab,
                  background: isActive ? 'rgba(94,200,80,0.15)' : isHovered ? 'rgba(94,200,80,0.08)' : 'transparent',
                  borderColor: isActive ? '#5ec850' : isHovered ? 'rgba(94,200,80,0.3)' : 'rgba(94,200,80,0.1)',
                  color: isActive ? '#5ec850' : '#c8e6c0',
                }}
              >
                <span style={{ fontSize: 18 }}>{tab.emoji}</span>
                <span>{tab.label}</span>
                <span style={styles.tabCount}>{getCatalogCount(tab.id)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={styles.body}>
        {/* Subcategory buttons */}
        <div style={styles.subcatRow}>
          {SUBCATEGORIES[activeTab].map(subcat => {
            const isActive = activeSubcat === subcat;
            const isHovered = hoveredSubcat === subcat;
            const { count, total } = getSubcatCatalogCount(activeTab, subcat);
            return (
              <button
                key={subcat}
                onClick={() => { setActiveSubcat(subcat); setDetailItem(null); setColorFilter(''); setSearchTerm(''); }}
                onMouseEnter={() => setHoveredSubcat(subcat)}
                onMouseLeave={() => setHoveredSubcat(null)}
                style={{
                  ...styles.subcatBtn,
                  background: isActive ? 'rgba(74,172,240,0.15)' : isHovered ? 'rgba(74,172,240,0.08)' : 'rgba(12,28,14,0.95)',
                  borderColor: isActive ? '#4aacf0' : isHovered ? 'rgba(74,172,240,0.3)' : 'rgba(94,200,80,0.1)',
                  color: isActive ? '#4aacf0' : '#c8e6c0',
                }}
              >
                <span>{subcat}</span>
                {total > 0 && (
                  <span style={{
                    ...styles.subcatCount,
                    background: isActive ? 'rgba(74,172,240,0.2)' : 'rgba(94,200,80,0.1)',
                    color: isActive ? '#4aacf0' : '#5a7a50',
                  }}>
                    {count}/{total}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search and filters */}
        <div style={styles.filterRow}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setDisplayCount(PAGE_SIZE); }}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={styles.clearBtn}
              >
                ✕
              </button>
            )}
          </div>

          <div style={styles.colorFilterWrap}>
            <select
              value={colorFilter}
              onChange={e => setColorFilter(e.target.value)}
              style={styles.colorSelect}
            >
              <option value="">All Colors</option>
              {API_COLORS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {activeTab === 'furniture' && (
            <div style={styles.colorFilterWrap}>
              <select
                value={seriesFilter}
                onChange={e => { setSeriesFilter(e.target.value); setDisplayCount(PAGE_SIZE); }}
                style={{
                  ...styles.colorSelect,
                  borderColor: seriesFilter ? '#d4b030' : 'rgba(94,200,80,0.1)',
                  color: seriesFilter ? '#d4b030' : '#c8e6c0',
                }}
                title="Filter by furniture series (3.0 series marked with ✦)"
              >
                <option value="">All Series</option>
                {FURNITURE_SERIES.map(s => (
                  <option key={s} value={s}>
                    {FURNITURE_SERIES_3_0.includes(s) ? '✦ ' : ''}{s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {seriesFilter && activeTab === 'furniture' && !seriesIndex && (
          <div style={{
            margin: '8px 0', padding: '10px 14px', borderRadius: 6,
            background: 'rgba(212,176,48,0.08)', border: '1px solid rgba(212,176,48,0.25)',
            color: '#d4b030', fontFamily: "'DM Sans', sans-serif", fontSize: 13,
          }}>
            Loading series index — fetching the full furniture catalog once…
          </div>
        )}

        {/* Content area */}
        <div style={styles.contentArea}>
          {/* Items grid */}
          <div style={{
            ...styles.gridArea,
            opacity: fadeIn ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}>
            {loading ? (
              <div style={styles.loadingArea}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} style={styles.skeleton} />
                ))}
              </div>
            ) : error ? (
              <div style={styles.errorBox}>
                <span style={{ fontSize: 36 }}>🍂</span>
                <p style={styles.errorText}>Unable to load items</p>
                <p style={styles.errorDetail}>{error}</p>
                <button
                  onClick={() => fetchSubcategory(activeTab, activeSubcat)}
                  style={styles.retryBtn}
                >
                  Retry
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div style={styles.emptyBox}>
                <span style={{ fontSize: 36 }}>📭</span>
                <p style={styles.emptyText}>
                  {searchTerm ? 'No items match your search' : 'No items found'}
                </p>
              </div>
            ) : (
              <>
                <div style={styles.resultsMeta}>
                  <span style={styles.resultsCount}>
                    {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                    {searchTerm && ` matching "${searchTerm}"`}
                  </span>
                </div>
                <div style={styles.grid}>
                  {displayedItems.map(name => {
                    const isCataloged = (cataloged[activeTab] || []).includes(name);
                    const isHovered = hoveredItem === name;
                    return (
                      <div
                        key={name}
                        onMouseEnter={() => setHoveredItem(name)}
                        onMouseLeave={() => setHoveredItem(null)}
                        style={{
                          ...styles.itemCard,
                          background: isCataloged
                            ? 'rgba(94,200,80,0.08)'
                            : isHovered ? 'rgba(12,28,14,1)' : 'rgba(12,28,14,0.95)',
                          borderColor: isCataloged
                            ? 'rgba(94,200,80,0.25)'
                            : isHovered ? 'rgba(94,200,80,0.2)' : 'rgba(94,200,80,0.1)',
                          transform: isHovered ? 'translateY(-1px)' : 'none',
                        }}
                      >
                        <button
                          onClick={() => fetchDetail(name)}
                          style={styles.itemClickArea}
                        >
                          <span style={styles.itemEmoji}>
                            {activeTab === 'furniture' ? '🪑' : activeTab === 'clothing' ? '👕' : '🏠'}
                          </span>
                          <span style={styles.itemName}>{name}</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleCataloged(name); }}
                          style={{
                            ...styles.checkBtn,
                            background: isCataloged ? 'rgba(94,200,80,0.2)' : 'rgba(94,200,80,0.05)',
                            borderColor: isCataloged ? '#5ec850' : 'rgba(94,200,80,0.15)',
                            color: isCataloged ? '#5ec850' : '#5a7a50',
                          }}
                          title={isCataloged ? 'Remove from catalog' : 'Mark as cataloged'}
                        >
                          {isCataloged ? '✓' : '○'}
                        </button>
                      </div>
                    );
                  })}
                </div>
                {hasMore && (
                  <button
                    onClick={() => setDisplayCount(prev => prev + PAGE_SIZE)}
                    onMouseEnter={() => setHoveredLoadMore(true)}
                    onMouseLeave={() => setHoveredLoadMore(false)}
                    style={{
                      ...styles.loadMoreBtn,
                      background: hoveredLoadMore ? 'rgba(212,176,48,0.15)' : 'rgba(212,176,48,0.08)',
                      borderColor: hoveredLoadMore ? '#d4b030' : 'rgba(212,176,48,0.25)',
                    }}
                  >
                    Load More ({filteredItems.length - displayCount} remaining)
                  </button>
                )}
              </>
            )}
          </div>

          {/* Detail drawer */}
          {detailItem && (
            <div style={styles.drawer}>
              <div style={styles.drawerHeader}>
                <h3 style={styles.drawerTitle}>{detailItem.name}</h3>
                <button onClick={closeDetail} style={styles.drawerClose}>✕</button>
              </div>
              {detailLoading ? (
                <div style={styles.drawerLoading}>
                  <span style={{ fontSize: 32 }}>🍃</span>
                  <p style={{ color: '#5a7a50', marginTop: 8, fontFamily: "'DM Sans', sans-serif" }}>Loading details...</p>
                </div>
              ) : detailError ? (
                <div style={styles.drawerError}>
                  <p style={{ color: '#ff6464' }}>Failed to load details</p>
                  <p style={{ color: '#5a7a50', fontSize: 12 }}>{detailError}</p>
                </div>
              ) : detailItem.data ? (
                <DetailPanel data={detailItem.data} tab={activeTab} isCataloged={(cataloged[activeTab] || []).includes(detailItem.name)} onToggle={() => toggleCataloged(detailItem.name)} />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Detail panel sub-component
const DetailPanel = ({ data, tab, isCataloged, onToggle }) => {
  const [hoveredVariation, setHoveredVariation] = useState(null);
  const [hoveredCatalogBtn, setHoveredCatalogBtn] = useState(false);

  // Handle both single item and array response from API
  const item = Array.isArray(data) ? data[0] : data;
  if (!item) return <p style={{ color: '#5a7a50', padding: 16 }}>No data available</p>;

  const variations = item.variations || [];
  const firstImage = variations.length > 0 ? (variations[0].image_url || variations[0].storage_image) : (item.image_url || null);

  return (
    <div style={styles.detailContent}>
      {/* Main image */}
      {firstImage && (
        <div style={styles.detailImgWrap}>
          <img src={firstImage} alt={item.name} style={styles.detailImg} />
        </div>
      )}

      {/* Catalog button */}
      <button
        onClick={onToggle}
        onMouseEnter={() => setHoveredCatalogBtn(true)}
        onMouseLeave={() => setHoveredCatalogBtn(false)}
        style={{
          ...styles.detailCatalogBtn,
          background: isCataloged
            ? hoveredCatalogBtn ? 'rgba(255,100,100,0.15)' : 'rgba(94,200,80,0.15)'
            : hoveredCatalogBtn ? 'rgba(94,200,80,0.15)' : 'rgba(94,200,80,0.08)',
          borderColor: isCataloged
            ? hoveredCatalogBtn ? '#ff6464' : '#5ec850'
            : hoveredCatalogBtn ? '#5ec850' : 'rgba(94,200,80,0.25)',
          color: isCataloged
            ? hoveredCatalogBtn ? '#ff6464' : '#5ec850'
            : hoveredCatalogBtn ? '#5ec850' : '#c8e6c0',
        }}
      >
        {isCataloged ? (hoveredCatalogBtn ? '✕ Remove' : '✓ Cataloged') : '+ Add to Catalog'}
      </button>

      {/* Info rows */}
      <div style={styles.detailInfoGrid}>
        {item.category && (
          <InfoRow label="Category" value={item.category} />
        )}
        {item.series && (
          <InfoRow label="Series" value={item.series} color="#d4b030" />
        )}
        {item.buy !== undefined && item.buy !== null && (
          <InfoRow label="Buy" value={`${typeof item.buy === 'object' ? JSON.stringify(item.buy) : item.buy} Bells`} />
        )}
        {(item.sell !== undefined && item.sell !== null) && (
          <InfoRow label="Sell" value={`${item.sell} Bells`} />
        )}
        {item.hha_base !== undefined && (
          <InfoRow label="HHA Points" value={item.hha_base} color="#4aacf0" />
        )}
        {item.size && (
          <InfoRow label="Size" value={item.size} />
        )}
        {item.color1 && (
          <InfoRow label="Colors" value={[item.color1, item.color2].filter(Boolean).join(', ')} />
        )}
        {item.hha_category && (
          <InfoRow label="HHA Category" value={item.hha_category} />
        )}
        {item.tag && (
          <InfoRow label="Tag" value={item.tag} />
        )}
        {item.themes && (
          <InfoRow label="Themes" value={Array.isArray(item.themes) ? item.themes.map(t => t.theme || t).join(', ') : item.themes} />
        )}
        {item.availability && item.availability.length > 0 && (
          <InfoRow label="Available from" value={
            Array.isArray(item.availability)
              ? item.availability.map(a => a.from || a).join(', ')
              : item.availability
          } />
        )}
      </div>

      {/* Variations */}
      {variations.length > 1 && (
        <div style={styles.variationsSection}>
          <h4 style={styles.variationsTitle}>Variations ({variations.length})</h4>
          <div style={styles.variationsGrid}>
            {variations.map((v, i) => {
              const isHovered = hoveredVariation === i;
              const vImg = v.image_url || v.storage_image;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredVariation(i)}
                  onMouseLeave={() => setHoveredVariation(null)}
                  style={{
                    ...styles.variationCard,
                    borderColor: isHovered ? 'rgba(94,200,80,0.3)' : 'rgba(94,200,80,0.1)',
                    background: isHovered ? 'rgba(12,28,14,1)' : 'rgba(12,28,14,0.95)',
                  }}
                >
                  {vImg && (
                    <img src={vImg} alt={v.variation || `Variant ${i + 1}`} style={styles.variationImg} />
                  )}
                  <span style={styles.variationName}>{v.variation || `Variant ${i + 1}`}</span>
                  {v.color1 && (
                    <span style={styles.variationColor}>{[v.color1, v.color2].filter(Boolean).join(', ')}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value, color }) => (
  <div style={styles.infoRow}>
    <span style={styles.infoLabel}>{label}</span>
    <span style={{ ...styles.infoValue, color: color || '#c8e6c0' }}>{value}</span>
  </div>
);

const styles = {
  root: {
    background: '#0a1a10',
    minHeight: '100vh',
    fontFamily: "'DM Sans', sans-serif",
    color: '#c8e6c0',
  },
  header: {
    padding: '28px 32px 0',
    borderBottom: '1px solid rgba(94,200,80,0.1)',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 16,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 32,
    fontWeight: 900,
    color: '#5ec850',
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: '#5a7a50',
    marginTop: 4,
  },
  headerStats: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  statBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 20px',
    background: 'rgba(212,176,48,0.1)',
    border: '1px solid rgba(212,176,48,0.25)',
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 900,
    fontFamily: "'Playfair Display', serif",
    color: '#d4b030',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "'DM Mono', monospace",
    color: '#5a7a50',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  saveMsg: {
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    color: '#5ec850',
  },
  tabRow: {
    display: 'flex',
    gap: 4,
    marginTop: 8,
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    border: '1px solid rgba(94,200,80,0.1)',
    borderBottom: 'none',
    borderRadius: '10px 10px 0 0',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  },
  tabCount: {
    fontSize: 11,
    fontFamily: "'DM Mono', monospace",
    background: 'rgba(94,200,80,0.1)',
    padding: '2px 8px',
    borderRadius: 8,
    color: '#5a7a50',
  },
  body: {
    padding: '20px 32px 32px',
  },
  subcatRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  subcatBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  },
  subcatCount: {
    fontSize: 10,
    fontFamily: "'DM Mono', monospace",
    padding: '2px 6px',
    borderRadius: 6,
  },
  filterRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: 200,
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.15)',
    borderRadius: 10,
    padding: '0 12px',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    padding: '10px 0',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#5a7a50',
    cursor: 'pointer',
    outline: 'none',
    fontSize: 14,
    padding: '4px 8px',
  },
  colorFilterWrap: {},
  colorSelect: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.15)',
    borderRadius: 10,
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    padding: '10px 16px',
    cursor: 'pointer',
    outline: 'none',
  },
  contentArea: {
    display: 'flex',
    gap: 20,
    alignItems: 'flex-start',
  },
  gridArea: {
    flex: 1,
    minWidth: 0,
  },
  loadingArea: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 10,
  },
  skeleton: {
    height: 52,
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.05)',
    borderRadius: 10,
    animation: 'none',
  },
  errorBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#c8e6c0',
  },
  errorDetail: {
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    color: '#5a7a50',
  },
  retryBtn: {
    padding: '8px 20px',
    background: 'rgba(94,200,80,0.1)',
    border: '1px solid rgba(94,200,80,0.3)',
    borderRadius: 8,
    color: '#5ec850',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#5a7a50',
  },
  resultsMeta: {
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    color: '#5a7a50',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 8,
  },
  itemCard: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 10,
    padding: '0 4px 0 0',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
    overflow: 'hidden',
  },
  itemClickArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 12px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    textAlign: 'left',
    minWidth: 0,
  },
  itemEmoji: {
    fontSize: 18,
    flexShrink: 0,
  },
  itemName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid rgba(94,200,80,0.15)',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Mono', monospace",
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  },
  loadMoreBtn: {
    display: 'block',
    width: '100%',
    padding: '14px',
    marginTop: 16,
    border: '1px solid rgba(212,176,48,0.25)',
    borderRadius: 10,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    color: '#d4b030',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
  },
  // Detail drawer
  drawer: {
    width: 360,
    flexShrink: 0,
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.15)',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'sticky',
    top: 0,
    maxHeight: 'calc(100vh - 200px)',
    overflowY: 'auto',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(94,200,80,0.1)',
  },
  drawerTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
    fontWeight: 700,
    color: '#5ec850',
    margin: 0,
  },
  drawerClose: {
    background: 'none',
    border: 'none',
    color: '#5a7a50',
    fontSize: 18,
    cursor: 'pointer',
    outline: 'none',
    padding: '4px 8px',
  },
  drawerLoading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  drawerError: {
    padding: 20,
    textAlign: 'center',
  },
  detailContent: {
    padding: 20,
  },
  detailImgWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 16,
    background: 'rgba(94,200,80,0.03)',
    borderRadius: 10,
    border: '1px solid rgba(94,200,80,0.08)',
  },
  detailImg: {
    width: 128,
    height: 128,
    objectFit: 'contain',
  },
  detailCatalogBtn: {
    display: 'block',
    width: '100%',
    padding: '10px',
    border: '1px solid rgba(94,200,80,0.25)',
    borderRadius: 8,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 16,
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  },
  detailInfoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid rgba(94,200,80,0.05)',
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    color: '#5a7a50',
    flexShrink: 0,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: 500,
    textAlign: 'right',
  },
  variationsSection: {
    marginTop: 20,
  },
  variationsTitle: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 12,
    fontWeight: 500,
    color: '#5a7a50',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  variationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: 8,
  },
  variationCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 8,
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8,
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
  },
  variationImg: {
    width: 48,
    height: 48,
    objectFit: 'contain',
    marginBottom: 4,
  },
  variationName: {
    fontSize: 10,
    color: '#c8e6c0',
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '100%',
  },
  variationColor: {
    fontSize: 9,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
  },
};

export default CatalogTracker;
