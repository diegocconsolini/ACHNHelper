'use client';

import React, { useState, useEffect, useRef } from 'react';

// HHA rank thresholds by house expansion level (verified from Nookipedia wiki)
const RANK_THRESHOLDS = [
  { label: 'Initial House', B: [0, 9999], A: [10000, 14999], S: 15000 },
  { label: 'Main Room Upgrade', B: [0, 16999], A: [17000, 22999], S: 23000 },
  { label: 'Back Room', B: [0, 24999], A: [25000, 34999], S: 35000 },
  { label: 'Left Room', B: [0, 37999], A: [38000, 46999], S: 47000 },
  { label: 'Right Room', B: [0, 49999], A: [50000, 59999], S: 60000 },
  { label: 'Second Floor', B: [0, 63999], A: [64000, 74999], S: 75000 },
  { label: 'Basement (Full House)', B: [0, 79999], A: [80000, 89999], S: 90000 },
];

// Bonus descriptions and values (verified from Nookipedia wiki)
const BONUS_TYPES = [
  {
    id: 'series',
    name: 'Series Bonus',
    desc: 'Place 4+ items from the same furniture series',
    points: '1,000 per item',
    icon: '🪑',
    color: '#5ec850',
    inputType: 'number',
    defaultVal: 0,
    calculate: (val) => val * 1000,
  },
  {
    id: 'setComplete',
    name: 'Complete Set Bonus',
    desc: 'Display a complete matching furniture set',
    points: '800 per item',
    icon: '✅',
    color: '#5ec850',
    inputType: 'number',
    defaultVal: 0,
    calculate: (val) => val * 800,
  },
  {
    id: 'colorHigh',
    name: 'Color Coordination (90%+)',
    desc: '90% or more of room items share same color',
    points: '600 per item',
    icon: '🎨',
    color: '#4aacf0',
    inputType: 'number',
    defaultVal: 0,
    calculate: (val) => val * 600,
  },
  {
    id: 'colorMed',
    name: 'Color Coordination (70-89%)',
    desc: '70-89% of room items share same color',
    points: '200 per item',
    icon: '🎨',
    color: '#4aacf0',
    inputType: 'number',
    defaultVal: 0,
    calculate: (val) => val * 200,
  },
  {
    id: 'category',
    name: 'Category Match',
    desc: '3+ items from same category (outdoor, antique, etc.)',
    points: '500 per item',
    icon: '📦',
    color: '#d4b030',
    inputType: 'number',
    defaultVal: 0,
    calculate: (val) => val * 500,
  },
  {
    id: 'lucky',
    name: 'Lucky Items',
    desc: 'Lucky items placed in home (lucky cat, lucky gold cat, etc.)',
    points: '777 per item',
    icon: '🍀',
    color: '#d4b030',
    inputType: 'number',
    defaultVal: 0,
    calculate: (val) => val * 777,
  },
  {
    id: 'fengShui',
    name: 'Feng Shui',
    desc: 'Correct color items in S/E/W walls (max 3 per room)',
    points: '500 per placement',
    icon: '🧭',
    color: '#d4b030',
    inputType: 'number',
    defaultVal: 0,
    calculate: (val) => val * 500,
  },
  {
    id: 'wallMount',
    name: 'Wall-Mounted Items',
    desc: 'Wall-mounted furniture (max 3 per room)',
    points: '400 per item',
    icon: '🖼️',
    color: '#4aacf0',
    inputType: 'number',
    defaultVal: 0,
    calculate: (val) => Math.min(val, 3) * 400,
  },
];

// Milestone bonuses
const MILESTONES = [
  { count: 6, points: 1000, label: '6 furniture items' },
  { count: 10, points: 1000, label: '10 furniture items' },
  { count: 15, points: 1000, label: '15 furniture items' },
  { count: 20, points: 1000, label: '20 furniture items' },
];

// Essential item types — having all 4 gives 2,500 bonus
const ESSENTIAL_TYPES = ['Chair', 'Table', 'Dresser', 'Bed'];

// Feng Shui tips
const FENG_SHUI_INFO = [
  { direction: 'South Wall', color: 'Green', desc: 'Place green items along the south wall' },
  { direction: 'East Wall', color: 'Red', desc: 'Place red items along the east wall' },
  { direction: 'West Wall', color: 'Yellow', desc: 'Place yellow items along the west wall' },
];

export default function HHACalculator() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allFurnitureNames, setAllFurnitureNames] = useState([]);
  const [namesLoaded, setNamesLoaded] = useState(false);
  const [namesLoading, setNamesLoading] = useState(false);
  const [itemCache, setItemCache] = useState({});
  const [expansionLevel, setExpansionLevel] = useState(6);
  const [bonuses, setBonuses] = useState({});
  const [essentials, setEssentials] = useState({ Chair: false, Table: false, Dresser: false, Bed: false });
  const [hoverStates, setHoverStates] = useState({});
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  // Load saved data
  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await window.storage.get('acnh-hha-calculator');
        if (stored) {
          const data = JSON.parse(stored.value);
          if (data.items) setItems(data.items);
          if (data.expansionLevel !== undefined) setExpansionLevel(data.expansionLevel);
          if (data.bonuses) setBonuses(data.bonuses);
          if (data.essentials) setEssentials(data.essentials);
          if (data.itemCache) setItemCache(data.itemCache);
        }
      } catch (e) {
        console.log('Storage not available');
      }
    };
    loadData();
  }, []);

  // Save data
  const saveData = async (newItems, newExpansion, newBonuses, newEssentials, newCache) => {
    try {
      await window.storage.set('acnh-hha-calculator', JSON.stringify({
        items: newItems,
        expansionLevel: newExpansion,
        bonuses: newBonuses,
        essentials: newEssentials,
        itemCache: newCache,
      }));
    } catch (e) {
      console.error('Error saving:', e);
    }
  };

  // Load furniture name list for autocomplete
  const loadFurnitureNames = async () => {
    if (namesLoaded || namesLoading) return;
    setNamesLoading(true);
    try {
      const res = await fetch('/api/nookipedia/nh/furniture?excludedetails=true');
      if (res.ok) {
        const names = await res.json();
        setAllFurnitureNames(names);
        setNamesLoaded(true);
      }
    } catch (e) {
      console.error('Failed to load furniture names:', e);
    }
    setNamesLoading(false);
  };

  // Search furniture by name
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      if (namesLoaded) {
        const q = searchQuery.toLowerCase();
        const matches = allFurnitureNames
          .filter(name => name.toLowerCase().includes(q))
          .slice(0, 12);
        setSearchResults(matches);
      } else {
        setSearchResults([]);
      }
    }, 150);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, allFurnitureNames, namesLoaded]);

  // Fetch item details from API
  const fetchItemDetails = async (name) => {
    if (itemCache[name]) return itemCache[name];

    try {
      const res = await fetch(`/api/nookipedia/nh/furniture/${encodeURIComponent(name)}`);
      if (res.ok) {
        const data = await res.json();
        const details = {
          name: data.name || name,
          hhaBase: data.hha_base || 0,
          hhaCategory: data.hha_category || 'Unknown',
          sell: data.sell || 0,
          series: data.series || null,
          set: data.set || null,
          category: data.category || 'Housewares',
          imageUrl: data.image_url || null,
          colors: data.variations?.[0]?.colors || [],
        };
        const newCache = { ...itemCache, [name]: details };
        setItemCache(newCache);
        return details;
      }
    } catch (e) {
      console.error('Failed to fetch item:', e);
    }
    return { name, hhaBase: 0, hhaCategory: 'Unknown', sell: 0, category: 'Unknown', colors: [] };
  };

  // Add item
  const addItem = async (name) => {
    setIsSearching(true);
    const details = await fetchItemDetails(name);
    const newItems = [...items, { ...details, id: Date.now() + Math.random() }];
    setItems(newItems);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    saveData(newItems, expansionLevel, bonuses, essentials, { ...itemCache, [name]: details });
  };

  // Remove item
  const removeItem = (id) => {
    const newItems = items.filter(i => i.id !== id);
    setItems(newItems);
    saveData(newItems, expansionLevel, bonuses, essentials, itemCache);
  };

  // Clear all items
  const clearAll = () => {
    setItems([]);
    setBonuses({});
    setEssentials({ Chair: false, Table: false, Dresser: false, Bed: false });
    saveData([], expansionLevel, {}, { Chair: false, Table: false, Dresser: false, Bed: false }, itemCache);
  };

  // Calculate scores
  const basePoints = items.reduce((sum, i) => sum + (i.hhaBase || 0), 0);

  const bonusPoints = BONUS_TYPES.reduce((sum, bt) => {
    const val = bonuses[bt.id] || 0;
    return sum + bt.calculate(val);
  }, 0);

  const milestonePoints = MILESTONES.reduce((sum, m) => {
    return sum + (items.length >= m.count ? m.points : 0);
  }, 0);

  const essentialCount = Object.values(essentials).filter(Boolean).length;
  const essentialBonus = essentialCount === 4 ? 2500 : 0;

  const totalScore = basePoints + bonusPoints + milestonePoints + essentialBonus;

  // Determine rank
  const threshold = RANK_THRESHOLDS[expansionLevel];
  let currentRank = 'B';
  let rankColor = '#5a7a50';
  if (totalScore >= threshold.S) {
    currentRank = 'S';
    rankColor = '#d4b030';
  } else if (totalScore >= threshold.A[0]) {
    currentRank = 'A';
    rankColor = '#5ec850';
  }

  // Progress to next rank
  let progressPercent = 0;
  let nextRankLabel = '';
  let pointsToNext = 0;
  if (currentRank === 'B') {
    progressPercent = Math.min(100, (totalScore / threshold.A[0]) * 100);
    nextRankLabel = 'A';
    pointsToNext = Math.max(0, threshold.A[0] - totalScore);
  } else if (currentRank === 'A') {
    progressPercent = Math.min(100, ((totalScore - threshold.A[0]) / (threshold.S - threshold.A[0])) * 100);
    nextRankLabel = 'S';
    pointsToNext = Math.max(0, threshold.S - totalScore);
  } else {
    progressPercent = 100;
    nextRankLabel = '';
    pointsToNext = 0;
  }

  const updateBonus = (id, val) => {
    const numVal = Math.max(0, parseInt(val) || 0);
    const newBonuses = { ...bonuses, [id]: numVal };
    setBonuses(newBonuses);
    saveData(items, expansionLevel, newBonuses, essentials, itemCache);
  };

  const updateEssential = (type) => {
    const newEssentials = { ...essentials, [type]: !essentials[type] };
    setEssentials(newEssentials);
    saveData(items, expansionLevel, bonuses, newEssentials, itemCache);
  };

  const updateExpansion = (val) => {
    setExpansionLevel(val);
    saveData(items, val, bonuses, essentials, itemCache);
  };

  const setHover = (key, val) => setHoverStates(p => ({ ...p, [key]: val }));

  const tabs = [
    { id: 'calculator', label: 'Calculator', icon: '🏠' },
    { id: 'bonuses', label: 'Bonuses', icon: '⭐' },
    { id: 'tips', label: 'Tips & Guide', icon: '📖' },
  ];

  return (
    <div style={styles.container}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={{ fontSize: 36 }}>🏠</span>
          <div>
            <h1 style={styles.title}>HHA Score Calculator</h1>
            <p style={styles.subtitle}>Happy Home Academy point tracker & rank calculator</p>
          </div>
        </div>
      </div>

      {/* Score Summary Card */}
      <div style={styles.scoreCard}>
        <div style={styles.scoreRow}>
          <div style={styles.scoreBlock}>
            <span style={styles.scoreLabel}>Total Score</span>
            <span style={styles.scoreValue}>{totalScore.toLocaleString()}</span>
          </div>
          <div style={styles.scoreBlock}>
            <span style={styles.scoreLabel}>Current Rank</span>
            <span style={{ ...styles.rankBadge, background: `${rankColor}22`, color: rankColor, border: `2px solid ${rankColor}` }}>
              {currentRank}
            </span>
          </div>
          <div style={styles.scoreBlock}>
            <span style={styles.scoreLabel}>Base Points</span>
            <span style={styles.scoreSmall}>{basePoints.toLocaleString()}</span>
          </div>
          <div style={styles.scoreBlock}>
            <span style={styles.scoreLabel}>Bonus Points</span>
            <span style={{ ...styles.scoreSmall, color: '#d4b030' }}>{(bonusPoints + milestonePoints + essentialBonus).toLocaleString()}</span>
          </div>
          <div style={styles.scoreBlock}>
            <span style={styles.scoreLabel}>Items</span>
            <span style={{ ...styles.scoreSmall, color: '#4aacf0' }}>{items.length}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>
              {currentRank === 'S' ? 'S Rank achieved!' : `${pointsToNext.toLocaleString()} points to Rank ${nextRankLabel}`}
            </span>
            <span style={{ ...styles.progressLabel, color: '#5a7a50' }}>
              {threshold.label}
            </span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{
              ...styles.progressFill,
              width: `${progressPercent}%`,
              background: currentRank === 'S' ? 'linear-gradient(90deg, #d4b030, #f0d060)' :
                currentRank === 'A' ? 'linear-gradient(90deg, #5ec850, #80e870)' :
                'linear-gradient(90deg, #5a7a50, #7a9a70)',
            }} />
          </div>
          <div style={styles.thresholdLabels}>
            <span style={styles.thresholdVal}>B: 0</span>
            <span style={styles.thresholdVal}>A: {threshold.A[0].toLocaleString()}</span>
            <span style={styles.thresholdVal}>S: {threshold.S.toLocaleString()}</span>
          </div>
        </div>

        {/* House Expansion Selector */}
        <div style={styles.expansionRow}>
          <span style={styles.expansionLabel}>House Level:</span>
          <select
            value={expansionLevel}
            onChange={(e) => updateExpansion(parseInt(e.target.value))}
            style={styles.expansionSelect}
          >
            {RANK_THRESHOLDS.map((t, i) => (
              <option key={i} value={i}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabRow}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            onMouseEnter={() => setHover(`tab-${tab.id}`, true)}
            onMouseLeave={() => setHover(`tab-${tab.id}`, false)}
            style={{
              ...styles.tab,
              background: activeTab === tab.id ? 'rgba(94,200,80,0.15)' : hoverStates[`tab-${tab.id}`] ? 'rgba(94,200,80,0.08)' : 'transparent',
              borderColor: activeTab === tab.id ? '#5ec850' : 'rgba(94,200,80,0.1)',
              color: activeTab === tab.id ? '#5ec850' : '#c8e6c0',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Calculator Tab */}
      {activeTab === 'calculator' && (
        <div style={styles.tabContent}>
          {/* Search Box */}
          <div style={styles.searchSection}>
            <label style={styles.searchLabel}>Add Furniture</label>
            <div style={styles.searchInputRow}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={namesLoading ? 'Loading furniture list...' : namesLoaded ? 'Search furniture by name...' : 'Click to load furniture list...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={loadFurnitureNames}
                style={styles.searchInput}
              />
              {isSearching && <span style={styles.searchSpinner}>Loading...</span>}
            </div>
            {searchResults.length > 0 && (
              <div style={styles.searchDropdown}>
                {searchResults.map((name, i) => (
                  <button
                    key={i}
                    onClick={() => addItem(name)}
                    onMouseEnter={() => setHover(`sr-${i}`, true)}
                    onMouseLeave={() => setHover(`sr-${i}`, false)}
                    style={{
                      ...styles.searchResultItem,
                      background: hoverStates[`sr-${i}`] ? 'rgba(94,200,80,0.15)' : 'transparent',
                    }}
                  >
                    <span>🪑</span>
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            )}
            {searchQuery.length >= 2 && searchResults.length === 0 && namesLoaded && !isSearching && (
              <div style={styles.noResults}>No furniture found matching "{searchQuery}"</div>
            )}
          </div>

          {/* Essential Items */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>
              <span>🛋️</span>
              <span>Essential Items</span>
              <span style={{ ...styles.bonusBadge, background: essentialBonus > 0 ? 'rgba(94,200,80,0.15)' : 'rgba(90,122,80,0.15)', color: essentialBonus > 0 ? '#5ec850' : '#5a7a50' }}>
                +{essentialBonus.toLocaleString()} pts
              </span>
            </h3>
            <p style={styles.sectionDesc}>Having all 4 essential item types gives a 2,500 point bonus</p>
            <div style={styles.essentialRow}>
              {ESSENTIAL_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => updateEssential(type)}
                  onMouseEnter={() => setHover(`ess-${type}`, true)}
                  onMouseLeave={() => setHover(`ess-${type}`, false)}
                  style={{
                    ...styles.essentialBtn,
                    background: essentials[type] ? 'rgba(94,200,80,0.15)' : hoverStates[`ess-${type}`] ? 'rgba(94,200,80,0.06)' : 'rgba(12,28,14,0.95)',
                    borderColor: essentials[type] ? 'rgba(94,200,80,0.5)' : 'rgba(94,200,80,0.1)',
                    color: essentials[type] ? '#5ec850' : '#c8e6c0',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{type === 'Chair' ? '🪑' : type === 'Table' ? '🪵' : type === 'Dresser' ? '🗄️' : '🛏️'}</span>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{type}</span>
                  {essentials[type] && <span style={{ fontSize: 10, color: '#5ec850' }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Item List */}
          <div style={styles.sectionCard}>
            <div style={styles.sectionTitleRow}>
              <h3 style={styles.sectionTitle}>
                <span>📋</span>
                <span>Furniture Items ({items.length})</span>
              </h3>
              {items.length > 0 && (
                <button
                  onClick={clearAll}
                  onMouseEnter={() => setHover('clear', true)}
                  onMouseLeave={() => setHover('clear', false)}
                  style={{
                    ...styles.clearBtn,
                    background: hoverStates.clear ? 'rgba(255,100,100,0.15)' : 'transparent',
                  }}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Milestone progress */}
            {items.length > 0 && (
              <div style={styles.milestoneRow}>
                {MILESTONES.map(m => (
                  <div key={m.count} style={{
                    ...styles.milestoneBadge,
                    background: items.length >= m.count ? 'rgba(212,176,48,0.15)' : 'rgba(12,28,14,0.5)',
                    borderColor: items.length >= m.count ? 'rgba(212,176,48,0.3)' : 'rgba(94,200,80,0.1)',
                    color: items.length >= m.count ? '#d4b030' : '#5a7a50',
                  }}>
                    {items.length >= m.count ? '✓' : ''} {m.count} items (+{m.points.toLocaleString()})
                  </div>
                ))}
              </div>
            )}

            {items.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={{ fontSize: 40 }}>🪑</span>
                <p style={{ color: '#5a7a50', fontSize: 14, marginTop: 8 }}>
                  Search and add furniture to calculate your HHA score
                </p>
              </div>
            ) : (
              <div style={styles.itemList}>
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHover(`item-${item.id}`, true)}
                    onMouseLeave={() => setHover(`item-${item.id}`, false)}
                    style={{
                      ...styles.itemRow,
                      background: hoverStates[`item-${item.id}`] ? 'rgba(94,200,80,0.06)' : 'transparent',
                      animationDelay: `${idx * 30}ms`,
                    }}
                  >
                    <div style={styles.itemInfo}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" style={styles.itemThumb} />
                      ) : (
                        <span style={{ fontSize: 22 }}>🪑</span>
                      )}
                      <div style={styles.itemDetails}>
                        <span style={styles.itemName}>{item.name}</span>
                        <span style={styles.itemMeta}>
                          {item.hhaCategory !== 'Unknown' && <span>{item.hhaCategory}</span>}
                          {item.series && <span style={{ color: '#4aacf0' }}>Series: {item.series}</span>}
                          {item.set && <span style={{ color: '#d4b030' }}>Set: {item.set}</span>}
                        </span>
                      </div>
                    </div>
                    <div style={styles.itemRight}>
                      <span style={styles.itemPoints}>{(item.hhaBase || 0).toLocaleString()} pts</span>
                      <button
                        onClick={() => removeItem(item.id)}
                        onMouseEnter={() => setHover(`del-${item.id}`, true)}
                        onMouseLeave={() => setHover(`del-${item.id}`, false)}
                        style={{
                          ...styles.removeBtn,
                          color: hoverStates[`del-${item.id}`] ? '#ff6464' : '#5a7a50',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bonuses Tab */}
      {activeTab === 'bonuses' && (
        <div style={styles.tabContent}>
          <p style={styles.bonusIntro}>
            Enter the number of qualifying items for each bonus category. These are applied on top of your base furniture points.
          </p>

          <div style={styles.bonusGrid}>
            {BONUS_TYPES.map(bt => {
              const val = bonuses[bt.id] || 0;
              const pts = bt.calculate(val);
              return (
                <div
                  key={bt.id}
                  style={styles.bonusCard}
                  onMouseEnter={() => setHover(`bonus-${bt.id}`, true)}
                  onMouseLeave={() => setHover(`bonus-${bt.id}`, false)}
                >
                  <div style={styles.bonusCardHeader}>
                    <span style={{ fontSize: 24 }}>{bt.icon}</span>
                    <div>
                      <span style={{ ...styles.bonusCardName, color: bt.color }}>{bt.name}</span>
                      <span style={styles.bonusCardDesc}>{bt.desc}</span>
                    </div>
                  </div>
                  <div style={styles.bonusCardBody}>
                    <div style={styles.bonusInputRow}>
                      <span style={styles.bonusRate}>{bt.points}</span>
                      <div style={styles.bonusCounterRow}>
                        <button
                          onClick={() => updateBonus(bt.id, val - 1)}
                          style={styles.counterBtn}
                        >−</button>
                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={(e) => updateBonus(bt.id, e.target.value)}
                          style={styles.bonusInput}
                        />
                        <button
                          onClick={() => updateBonus(bt.id, val + 1)}
                          style={styles.counterBtn}
                        >+</button>
                      </div>
                    </div>
                    <div style={styles.bonusPointsRow}>
                      <span style={{ ...styles.bonusPointsVal, color: pts > 0 ? bt.color : '#5a7a50' }}>
                        +{pts.toLocaleString()} pts
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Bonus Summary */}
          <div style={styles.bonusSummary}>
            <span style={styles.bonusSummaryLabel}>Total Bonus Points</span>
            <span style={styles.bonusSummaryVal}>+{(bonusPoints + milestonePoints + essentialBonus).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Tips Tab */}
      {activeTab === 'tips' && (
        <div style={styles.tabContent}>
          {/* Rank Thresholds Table */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>
              <span>🏆</span>
              <span>Rank Thresholds by House Level</span>
            </h3>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>House Level</th>
                    <th style={{ ...styles.th, color: '#5a7a50' }}>B Rank</th>
                    <th style={{ ...styles.th, color: '#5ec850' }}>A Rank</th>
                    <th style={{ ...styles.th, color: '#d4b030' }}>S Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {RANK_THRESHOLDS.map((t, i) => (
                    <tr key={i} style={{ background: i === expansionLevel ? 'rgba(94,200,80,0.08)' : 'transparent' }}>
                      <td style={styles.td}>{t.label} {i === expansionLevel ? '◄' : ''}</td>
                      <td style={{ ...styles.td, color: '#5a7a50' }}>0 – {t.B[1].toLocaleString()}</td>
                      <td style={{ ...styles.td, color: '#5ec850' }}>{t.A[0].toLocaleString()} – {t.A[1].toLocaleString()}</td>
                      <td style={{ ...styles.td, color: '#d4b030' }}>{t.S.toLocaleString()}+</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feng Shui Guide */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>
              <span>🧭</span>
              <span>Feng Shui Guide</span>
            </h3>
            <p style={styles.sectionDesc}>
              Place items of specific colors against certain walls for +500 points each (max 1,500 per room).
            </p>
            <div style={styles.fengShuiGrid}>
              {FENG_SHUI_INFO.map(fs => (
                <div key={fs.direction} style={styles.fengShuiCard}>
                  <div style={{
                    ...styles.fengShuiColor,
                    background: fs.color === 'Green' ? 'rgba(94,200,80,0.2)' :
                      fs.color === 'Red' ? 'rgba(255,100,100,0.2)' :
                      'rgba(212,176,48,0.2)',
                    color: fs.color === 'Green' ? '#5ec850' :
                      fs.color === 'Red' ? '#ff6464' :
                      '#d4b030',
                  }}>
                    {fs.color}
                  </div>
                  <span style={styles.fengShuiDir}>{fs.direction}</span>
                  <span style={styles.fengShuiDesc}>{fs.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>
              <span>💡</span>
              <span>Scoring Tips</span>
            </h3>
            <div style={styles.tipsList}>
              {[
                { icon: '🪑', text: 'Ensure you have all 4 essential items (chair, table, dresser, bed) for a 2,500 point bonus' },
                { icon: '🎨', text: 'Color-coordinate your rooms — 90%+ matching color gives 600 points per item' },
                { icon: '📦', text: 'Group items from the same furniture series together — 4+ items gives 1,000 per item' },
                { icon: '🧭', text: 'Use Feng Shui placement: green items on south wall, red on east, yellow on west' },
                { icon: '🖼️', text: 'Hang items on walls — wall-mounted furniture gives 400 extra points each (max 3 per room)' },
                { icon: '🍀', text: 'Lucky items like the Lucky Cat give 777 bonus points each' },
                { icon: '📐', text: 'Items placed on tables or dressers earn more points than items on the floor' },
                { icon: '🔢', text: 'Milestone bonuses at 6, 10, 15, and 20 furniture items (1,000 pts each)' },
              ].map((tip, i) => (
                <div key={i} style={styles.tipItem}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{tip.icon}</span>
                  <span style={styles.tipText}>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bonus Reference */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>
              <span>📊</span>
              <span>Bonus Point Reference</span>
            </h3>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Bonus Type</th>
                    <th style={styles.th}>Points</th>
                    <th style={styles.th}>Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {BONUS_TYPES.map(bt => (
                    <tr key={bt.id}>
                      <td style={{ ...styles.td, color: bt.color }}>{bt.icon} {bt.name}</td>
                      <td style={styles.td}>{bt.points}</td>
                      <td style={{ ...styles.td, color: '#5a7a50' }}>{bt.desc}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ ...styles.td, color: '#5ec850' }}>🛋️ Essential Items</td>
                    <td style={styles.td}>2,500 total</td>
                    <td style={{ ...styles.td, color: '#5a7a50' }}>Have all 4 types: chair, table, dresser, bed</td>
                  </tr>
                  <tr>
                    <td style={{ ...styles.td, color: '#4aacf0' }}>📐 Milestones</td>
                    <td style={styles.td}>1,000 each</td>
                    <td style={{ ...styles.td, color: '#5a7a50' }}>At 6, 10, 15, and 20 furniture items</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a1a10',
    padding: 24,
    fontFamily: "'DM Sans', sans-serif",
    color: '#c8e6c0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
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
    margin: 0,
    marginTop: 2,
    fontFamily: "'DM Sans', sans-serif",
  },
  scoreCard: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.15)',
    borderRadius: 14,
    padding: 24,
    marginBottom: 20,
  },
  scoreRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  scoreLabel: {
    fontSize: 11,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreValue: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 36,
    fontWeight: 900,
    color: '#5ec850',
  },
  scoreSmall: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 22,
    fontWeight: 500,
    color: '#c8e6c0',
  },
  rankBadge: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 32,
    fontWeight: 900,
    width: 52,
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#c8e6c0',
    fontFamily: "'DM Mono', monospace",
  },
  progressTrack: {
    height: 10,
    background: 'rgba(94,200,80,0.08)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    transition: 'width 0.5s ease',
  },
  thresholdLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  thresholdVal: {
    fontSize: 10,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
  },
  expansionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  expansionLabel: {
    fontSize: 12,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
  },
  expansionSelect: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.2)',
    borderRadius: 8,
    color: '#c8e6c0',
    padding: '6px 12px',
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    cursor: 'pointer',
  },
  tabRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 18px',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  },
  tabContent: {
    animation: 'fadeIn 0.3s ease',
  },
  searchSection: {
    marginBottom: 20,
  },
  searchLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: '#5ec850',
    marginBottom: 6,
    display: 'block',
    fontFamily: "'DM Sans', sans-serif",
  },
  searchInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.2)',
    borderRadius: 10,
    color: '#c8e6c0',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
  },
  searchSpinner: {
    position: 'absolute',
    right: 12,
    fontSize: 12,
    color: '#d4b030',
    fontFamily: "'DM Mono', monospace",
  },
  searchDropdown: {
    background: 'rgba(12,28,14,0.98)',
    border: '1px solid rgba(94,200,80,0.2)',
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  searchResultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '10px 16px',
    border: 'none',
    borderBottom: '1px solid rgba(94,200,80,0.06)',
    color: '#c8e6c0',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    outline: 'none',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
  },
  noResults: {
    padding: '10px 16px',
    fontSize: 13,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
  },
  sectionCard: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
    fontWeight: 700,
    color: '#c8e6c0',
    margin: 0,
    marginBottom: 8,
  },
  sectionTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionDesc: {
    fontSize: 13,
    color: '#5a7a50',
    margin: 0,
    marginBottom: 12,
    lineHeight: 1.5,
  },
  essentialRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  essentialBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '12px 20px',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 10,
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  },
  bonusBadge: {
    fontSize: 11,
    fontFamily: "'DM Mono', monospace",
    padding: '2px 8px',
    borderRadius: 6,
    marginLeft: 'auto',
  },
  clearBtn: {
    border: '1px solid rgba(255,100,100,0.2)',
    borderRadius: 8,
    color: '#ff6464',
    padding: '6px 14px',
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease',
  },
  milestoneRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  milestoneBadge: {
    fontSize: 11,
    fontFamily: "'DM Mono', monospace",
    padding: '4px 10px',
    borderRadius: 8,
    border: '1px solid',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 0',
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderBottom: '1px solid rgba(94,200,80,0.06)',
    transition: 'background-color 0.15s ease',
  },
  itemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  itemThumb: {
    width: 32,
    height: 32,
    borderRadius: 6,
    objectFit: 'contain',
    flexShrink: 0,
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 500,
    color: '#c8e6c0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemMeta: {
    display: 'flex',
    gap: 8,
    fontSize: 11,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  itemPoints: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    fontWeight: 500,
    color: '#5ec850',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    fontSize: 16,
    cursor: 'pointer',
    padding: '4px 8px',
    outline: 'none',
    transition: 'color 0.15s ease',
  },
  bonusIntro: {
    fontSize: 14,
    color: '#5a7a50',
    marginBottom: 20,
    lineHeight: 1.6,
  },
  bonusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 14,
    marginBottom: 20,
  },
  bonusCard: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 12,
    padding: 16,
    transition: 'border-color 0.2s ease',
  },
  bonusCardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  bonusCardName: {
    fontSize: 14,
    fontWeight: 700,
    display: 'block',
    fontFamily: "'DM Sans', sans-serif",
  },
  bonusCardDesc: {
    fontSize: 12,
    color: '#5a7a50',
    display: 'block',
    lineHeight: 1.4,
    marginTop: 2,
  },
  bonusCardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  bonusInputRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bonusRate: {
    fontSize: 11,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
  },
  bonusCounterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  counterBtn: {
    width: 30,
    height: 30,
    background: 'rgba(94,200,80,0.08)',
    border: '1px solid rgba(94,200,80,0.15)',
    borderRadius: 8,
    color: '#5ec850',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bonusInput: {
    width: 50,
    textAlign: 'center',
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.15)',
    borderRadius: 6,
    color: '#c8e6c0',
    padding: '4px 8px',
    fontSize: 14,
    fontFamily: "'DM Mono', monospace",
    outline: 'none',
  },
  bonusPointsRow: {
    textAlign: 'right',
  },
  bonusPointsVal: {
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "'DM Mono', monospace",
  },
  bonusSummary: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(212,176,48,0.2)',
    borderRadius: 12,
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bonusSummaryLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif",
  },
  bonusSummaryVal: {
    fontSize: 22,
    fontWeight: 900,
    fontFamily: "'Playfair Display', serif",
    color: '#d4b030',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
  },
  th: {
    textAlign: 'left',
    padding: '10px 14px',
    borderBottom: '1px solid rgba(94,200,80,0.15)',
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    fontWeight: 500,
    color: '#c8e6c0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  td: {
    padding: '10px 14px',
    borderBottom: '1px solid rgba(94,200,80,0.06)',
    color: '#c8e6c0',
    fontSize: 13,
  },
  fengShuiGrid: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  fengShuiCard: {
    flex: '1 1 160px',
    background: 'rgba(12,28,14,0.5)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 10,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  fengShuiColor: {
    fontSize: 13,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 6,
    width: 'fit-content',
    fontFamily: "'DM Mono', monospace",
  },
  fengShuiDir: {
    fontSize: 14,
    fontWeight: 600,
    color: '#c8e6c0',
  },
  fengShuiDesc: {
    fontSize: 12,
    color: '#5a7a50',
    lineHeight: 1.4,
  },
  tipsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  tipItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '8px 0',
    borderBottom: '1px solid rgba(94,200,80,0.06)',
  },
  tipText: {
    fontSize: 13,
    color: '#c8e6c0',
    lineHeight: 1.5,
  },
};
