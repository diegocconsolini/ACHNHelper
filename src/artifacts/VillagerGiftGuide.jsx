'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AssetImg } from '../assetHelper';
import { VILLAGERS, BIRTHDAY_CALENDAR } from './villagerData';

const personalities = {
  normal: { style: 'Simple/Cute', emoji: '😊', color: '#f9b4d6' },
  peppy: { style: 'Cute/Colorful', emoji: '🌟', color: '#ff88cc' },
  lazy: { style: 'Simple/Outdoorsy', emoji: '😴', color: '#98d2a6' },
  jock: { style: 'Active/Cool', emoji: '💪', color: '#ff8844' },
  cranky: { style: 'Cool/Elegant', emoji: '😤', color: '#996633' },
  snooty: { style: 'Elegant/Gorgeous', emoji: '💅', color: '#ffdd99' },
  smug: { style: 'Elegant/Cool', emoji: '🎩', color: '#88ddff' },
  uchi: { style: 'Active/Cool', emoji: '🤙', color: '#ff99dd' }
};

const universalGifts = [
  { name: 'Iron Wall Lamp', bells: 2500, reason: 'No style conflict, moderately valued' },
  { name: 'Fruit (any crafted)', bells: 'Varies', reason: 'All villagers love fruit items' },
  { name: 'Non-native fruit', bells: '100-200', reason: 'Simple, always appreciated' }
];

const VillagerGiftGuide = () => {
  const [activeTab, setActiveTab] = useState('guide');
  const [selectedPersonality, setSelectedPersonality] = useState('normal');
  const [myVillagers, setMyVillagers] = useState([]);
  const [villagerInput, setVillagerInput] = useState('');
  const [friendshipLevel, setFriendshipLevel] = useState(3);
  const [birthdaySearch, setBirthdaySearch] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [giftLog, setGiftLog] = useState([]);
  const [dreamieWishlist, setDreamieWishlist] = useState('');
  const [drawerVillager, setDrawerVillager] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Gift Finder state
  const [giftFinderInput, setGiftFinderInput] = useState('');
  const [giftFinderAutocomplete, setGiftFinderAutocomplete] = useState(false);
  const [giftFinderVillager, setGiftFinderVillager] = useState(null);
  const [giftFinderDetails, setGiftFinderDetails] = useState(null);
  const [giftFinderClothing, setGiftFinderClothing] = useState([]);
  const [giftFinderLoading, setGiftFinderLoading] = useState(false);
  const [giftFinderError, setGiftFinderError] = useState(null);

  const openDrawer = useCallback(async (villagerName) => {
    setDrawerVillager(villagerName);
    setDrawerData(null);
    setDrawerLoading(true);
    setDrawerVisible(true);
    try {
      const res = await fetch(`/api/nookipedia/villagers?name=${encodeURIComponent(villagerName)}&nhdetails=true`);
      if (res.ok) {
        const data = await res.json();
        setDrawerData(Array.isArray(data) ? data[0] : data);
      }
    } catch (e) {
      console.error('Failed to fetch villager details:', e);
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerVisible(false);
    setTimeout(() => {
      setDrawerVillager(null);
      setDrawerData(null);
    }, 300);
  }, []);

  // Gift Finder: fetch villager details and matching clothing
  const searchGiftFinder = useCallback(async (villagerName) => {
    const villager = VILLAGERS.find(v => v.name.toLowerCase() === villagerName.toLowerCase());
    if (!villager) return;

    setGiftFinderVillager(villager);
    setGiftFinderLoading(true);
    setGiftFinderError(null);
    setGiftFinderClothing([]);
    setGiftFinderDetails(null);

    try {
      const res = await fetch(`/api/nookipedia/villagers?name=${encodeURIComponent(villager.name)}&nhdetails=true`);
      if (!res.ok) throw new Error('Failed to fetch villager details');
      const data = await res.json();
      const details = Array.isArray(data) ? data[0] : data;
      setGiftFinderDetails(details);

      const nh = details?.nh_details;
      if (nh?.fav_styles?.length && nh?.fav_colors?.length) {
        // Fetch clothing matching first style + first color combo
        const style = nh.fav_styles[0];
        const color = nh.fav_colors[0];
        const clothingRes = await fetch(`/api/nookipedia/nh/clothing?style=${encodeURIComponent(style)}&color=${encodeURIComponent(color)}`);
        if (clothingRes.ok) {
          const clothingData = await clothingRes.json();
          // Filter to items villagers can actually equip, sort by sell price descending
          const equippable = clothingData
            .filter(item => item.vill_equip)
            .sort((a, b) => (b.sell || 0) - (a.sell || 0));
          setGiftFinderClothing(equippable);
        }
      }
    } catch (e) {
      console.error('Gift Finder error:', e);
      setGiftFinderError('Could not load villager data. Try again later.');
    } finally {
      setGiftFinderLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get('villagerGiftGuide');
        if (result) {
          const data = JSON.parse(result.value);
          setMyVillagers(data.villagers || []);
          setGiftLog(data.giftLog || []);
          setDreamieWishlist(data.dreamies || '');
        }
      } catch (e) {
        console.log('First time setup', e.message);
      }
    };
    loadData();
  }, []);

  // Persist data
  const saveData = async (villagers, log, dreamies) => {
    try {
      await window.storage.set('villagerGiftGuide', JSON.stringify({
        villagers,
        giftLog: log,
        dreamies
      }));
    } catch (e) {
      console.error('Save error:', e);
    }
  };

  const addVillager = () => {
    if (villagerInput.trim() && myVillagers.length < 10) {
      const newVillager = {
        id: Date.now(),
        name: villagerInput,
        friendship: friendshipLevel,
        lastGiftDate: null
      };
      const updated = [...myVillagers, newVillager];
      setMyVillagers(updated);
      saveData(updated, giftLog, dreamieWishlist);
      setVillagerInput('');
      setFriendshipLevel(3);
    }
  };

  const removeVillager = (id) => {
    const updated = myVillagers.filter(v => v.id !== id);
    setMyVillagers(updated);
    saveData(updated, giftLog, dreamieWishlist);
  };

  const updateFriendship = (id, level) => {
    const updated = myVillagers.map(v => v.id === id ? { ...v, friendship: level } : v);
    setMyVillagers(updated);
    saveData(updated, giftLog, dreamieWishlist);
  };

  const updateDreamies = (text) => {
    setDreamieWishlist(text);
    saveData(myVillagers, giftLog, text);
  };

  const baseStyles = {
    container: {
      width: '100%',
      background: '#0a1a10',
      borderRadius: '12px',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      padding: '24px',
      fontFamily: '"DM Sans", sans-serif',
      color: '#c8e6c0',
      margin: '0 auto'
    },
    header: {
      fontSize: '28px',
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      color: '#5ec850',
      marginBottom: '24px',
      textAlign: 'center'
    },
    tabs: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      borderBottom: '2px solid rgba(94, 200, 80, 0.2)',
      paddingBottom: '12px'
    },
    tabButton: {
      padding: '10px 20px',
      border: 'none',
      background: 'transparent',
      color: '#5a7a50',
      cursor: 'pointer',
      outline: 'none',
      fontSize: '14px',
      fontWeight: 500,
      transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
      borderBottom: '3px solid transparent'
    },
    tabButtonActive: {
      color: '#5ec850',
      borderBottomColor: '#5ec850'
    },
    card: {
      background: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px'
    },
    section: {
      marginBottom: '20px'
    },
    label: {
      fontSize: '13px',
      fontFamily: '"DM Mono", monospace',
      color: '#5a7a50',
      display: 'block',
      marginBottom: '8px',
      fontWeight: 500
    },
    input: {
      width: '100%',
      padding: '10px',
      background: 'rgba(30, 50, 30, 0.6)',
      border: '1px solid rgba(94, 200, 80, 0.3)',
      color: '#c8e6c0',
      borderRadius: '4px',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    select: {
      padding: '10px',
      background: 'rgba(30, 50, 30, 0.6)',
      border: '1px solid rgba(94, 200, 80, 0.3)',
      color: '#c8e6c0',
      borderRadius: '4px',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '14px',
      cursor: 'pointer',
      outline: 'none',
    },
    button: {
      padding: '10px 20px',
      background: '#5ec850',
      color: '#0a1a10',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      outline: 'none',
      fontWeight: 600,
      fontSize: '14px',
      transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease'
    },
    buttonHover: {
      background: '#7fd66a',
      transform: 'translateY(-2px)'
    },
    personalityGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px',
      marginBottom: '20px'
    },
    personalityBox: {
      padding: '12px',
      background: 'rgba(30, 50, 30, 0.6)',
      border: '2px solid rgba(94, 200, 80, 0.3)',
      borderRadius: '6px',
      cursor: 'pointer',
      outline: 'none',
      transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
      textAlign: 'center',
      fontSize: '28px'
    },
    personalityBoxActive: {
      borderColor: '#5ec850',
      background: 'rgba(94, 200, 80, 0.1)'
    },
    pointsBreakdown: {
      background: 'rgba(20, 40, 25, 0.8)',
      border: '1px solid rgba(212, 176, 48, 0.2)',
      borderRadius: '6px',
      padding: '12px',
      marginBottom: '12px',
      fontSize: '13px'
    },
    monthGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px'
    },
    monthBox: {
      background: 'rgba(20, 40, 25, 0.8)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '6px',
      padding: '12px'
    },
    monthTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#d4b030',
      marginBottom: '8px',
      fontFamily: '"Playfair Display", serif'
    },
    villagerList: {
      fontSize: '12px',
      lineHeight: '1.6',
      color: '#5a7a50'
    },
    dosDonts: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginTop: '16px'
    },
    doBadge: {
      background: 'rgba(94, 200, 80, 0.1)',
      border: '1px solid rgba(94, 200, 80, 0.3)',
      borderRadius: '6px',
      padding: '12px'
    },
    dontBadge: {
      background: 'rgba(255, 100, 100, 0.1)',
      border: '1px solid rgba(255, 100, 100, 0.3)',
      borderRadius: '6px',
      padding: '12px'
    },
    badgeTitle: {
      fontWeight: 600,
      marginBottom: '8px',
      fontSize: '13px'
    },
    badgeList: {
      fontSize: '12px',
      lineHeight: '1.8'
    },
    villagerCard: {
      background: 'rgba(30, 50, 30, 0.6)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '6px',
      padding: '12px',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    removeBtn: {
      padding: '6px 12px',
      background: 'rgba(255, 100, 100, 0.2)',
      border: '1px solid rgba(255, 100, 100, 0.4)',
      color: '#ff6464',
      borderRadius: '4px',
      cursor: 'pointer',
      outline: 'none',
      fontSize: '12px',
      fontWeight: 600,
      transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease'
    }
  };

  // Gift Guide Tab
  const renderGiftGuide = () => {
    const p = personalities[selectedPersonality];
    return (
      <div>
        <h2 style={{ ...baseStyles.section, fontSize: '18px', fontFamily: '"Playfair Display", serif', color: '#d4b030' }}>
          Select Personality Type
        </h2>
        <div style={baseStyles.personalityGrid}>
          {Object.entries(personalities).map(([key, val]) => (
            <div
              key={key}
              style={{
                ...baseStyles.personalityBox,
                ...(selectedPersonality === key && baseStyles.personalityBoxActive)
              }}
              onClick={() => setSelectedPersonality(key)}
            >
              {val.emoji}
            </div>
          ))}
        </div>

        <div style={baseStyles.card}>
          <h3 style={{ fontSize: '16px', color: '#5ec850', marginTop: 0, marginBottom: '12px', fontFamily: '"Playfair Display", serif' }}>
            {p.emoji} {selectedPersonality.charAt(0).toUpperCase() + selectedPersonality.slice(1)} Personality
          </h3>
          <p style={{ fontSize: '13px', margin: '8px 0' }}>
            <span style={baseStyles.label}>Preferred Style:</span> {p.style}
          </p>
        </div>

        <div style={baseStyles.card}>
          <h3 style={{ fontSize: '16px', color: '#4aacf0', marginTop: 0, marginBottom: '12px', fontFamily: '"Playfair Display", serif' }}>
            Gift Point Breakdown
          </h3>
          <div style={baseStyles.pointsBreakdown}>
            <strong>+3 pts:</strong> Furniture (any value)
          </div>
          <div style={baseStyles.pointsBreakdown}>
            <strong>+2 pts:</strong> Clothing (matching style/color), flowers, bugs, fish, favorite songs
          </div>
          <div style={baseStyles.pointsBreakdown}>
            <strong>+1 pt:</strong> Any other non-trash item
          </div>
          <div style={baseStyles.pointsBreakdown}>
            <strong style={{ color: '#4aacf0' }}>+1 bonus:</strong> Gift wrapping (always wrap!)
          </div>
          <div style={baseStyles.pointsBreakdown}>
            <strong style={{ color: '#d4b030' }}>Value bonus:</strong> 250-749 bells = +1 extra, 750+ bells = +1-3 extra
          </div>
          <div style={{ ...baseStyles.pointsBreakdown, borderColor: 'rgba(255, 100, 100, 0.2)' }}>
            <strong style={{ color: '#ff8888' }}>-2 pts:</strong> Trash (boots, cans, tires, weeds, spoiled turnips)
          </div>
        </div>

        <div style={baseStyles.card}>
          <h3 style={{ fontSize: '16px', color: '#d4b030', marginTop: 0, marginBottom: '12px', fontFamily: '"Playfair Display", serif' }}>
            Universal Best Gifts
          </h3>
          {universalGifts.map((gift, i) => (
            <div key={i} style={{ marginBottom: '10px', fontSize: '13px', paddingBottom: '10px', borderBottom: i < universalGifts.length - 1 ? '1px solid rgba(94, 200, 80, 0.1)' : 'none' }}>
              <strong style={{ color: '#5ec850' }}>{gift.name}</strong>
              <div style={{ fontSize: '12px', color: '#5a7a50', marginTop: '4px' }}>
                {typeof gift.bells === 'number' ? `${gift.bells.toLocaleString()} bells` : gift.bells} • {gift.reason}
              </div>
            </div>
          ))}
        </div>

        <div style={baseStyles.dosDonts}>
          <div style={baseStyles.doBadge}>
            <div style={baseStyles.badgeTitle}>✓ DO's</div>
            <div style={baseStyles.badgeList}>
              <div>• Wrap every gift (+1 pt)</div>
              <div>• Give furniture when possible</div>
              <div>• Match their style</div>
              <div>• Gift daily for friendship</div>
              <div>• Keep non-native fruit handy</div>
            </div>
          </div>
          <div style={baseStyles.dontBadge}>
            <div style={baseStyles.badgeTitle}>✗ DON'Ts</div>
            <div style={baseStyles.badgeList}>
              <div>• Never give garbage items</div>
              <div>• Avoid wrong style clothes</div>
              <div>• Don't skip wrapping (miss +1 bonus)</div>
              <div>• No spoiled/rotten fruit</div>
              <div>• Don't gift twice daily</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Birthday Calendar Tab
  const renderBirthdayCalendar = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const searchLower = birthdaySearch.toLowerCase().trim();

    // Filter calendar entries if search is active
    const getMonthVillagers = (monthNum) => {
      const entries = BIRTHDAY_CALENDAR[monthNum] || [];
      if (!searchLower) return entries;
      return entries.filter(v => v.name.toLowerCase().includes(searchLower));
    };

    const totalResults = searchLower
      ? Object.keys(BIRTHDAY_CALENDAR).reduce((sum, m) => sum + getMonthVillagers(Number(m)).length, 0)
      : VILLAGERS.length;

    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search villagers by name..."
            value={birthdaySearch}
            onChange={(e) => setBirthdaySearch(e.target.value)}
            style={{ ...baseStyles.input, marginBottom: '8px' }}
          />
          <div style={{ fontSize: '12px', color: '#5a7a50', fontFamily: '"DM Mono", monospace' }}>
            {searchLower ? `${totalResults} villager${totalResults !== 1 ? 's' : ''} found` : `${VILLAGERS.length} villagers total`}
          </div>
        </div>
        <div style={baseStyles.monthGrid}>
          {months.map((month, idx) => {
            const villagers = getMonthVillagers(idx + 1);
            if (searchLower && villagers.length === 0) return null;
            return (
              <div key={idx} style={baseStyles.monthBox}>
                <div style={baseStyles.monthTitle}>
                  {month}
                  <span style={{ fontSize: '12px', color: '#5a7a50', fontWeight: 400, marginLeft: '8px' }}>
                    ({villagers.length})
                  </span>
                </div>
                <div style={{ ...baseStyles.villagerList, maxHeight: '200px', overflowY: 'auto' }}>
                  {villagers.map((v, i) => (
                    <div
                      key={i}
                      onClick={() => openDrawer(v.name)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingRight: '4px', cursor: 'pointer', borderRadius: '4px', padding: '2px 4px', transition: 'background 0.2s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(94, 200, 80, 0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <AssetImg category="villagers" name={v.name} size={20} />
                      <strong>{v.name}</strong>
                      <span style={{ marginLeft: 'auto', fontFamily: '"DM Mono", monospace', fontSize: '11px', color: '#5a7a50' }}>
                        {v.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // My Villagers Tab
  const renderMyVillagers = () => {
    return (
      <div>
        <div style={baseStyles.section}>
          <h3 style={{ marginTop: 0, color: '#5ec850', fontFamily: '"Playfair Display", serif' }}>Add Island Resident (Max 10)</h3>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', position: 'relative' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Villager name..."
                value={villagerInput}
                onChange={(e) => { setVillagerInput(e.target.value); setShowAutocomplete(true); }}
                onKeyPress={(e) => e.key === 'Enter' && addVillager()}
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 150)}
                onFocus={() => villagerInput.length > 0 && setShowAutocomplete(true)}
                style={baseStyles.input}
              />
              {showAutocomplete && villagerInput.length >= 1 && (() => {
                const suggestions = VILLAGERS.filter(v =>
                  v.name.toLowerCase().startsWith(villagerInput.toLowerCase())
                ).slice(0, 8);
                if (suggestions.length === 0) return null;
                return (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                    background: 'rgba(12, 28, 14, 0.98)', border: '1px solid rgba(94, 200, 80, 0.3)',
                    borderRadius: '0 0 4px 4px', maxHeight: '200px', overflowY: 'auto'
                  }}>
                    {suggestions.map(v => (
                      <div
                        key={v.name}
                        onMouseDown={() => { setVillagerInput(v.name); setShowAutocomplete(false); }}
                        style={{
                          padding: '8px 10px', cursor: 'pointer', outline: 'none', fontSize: '13px',
                          display: 'flex', alignItems: 'center', gap: '8px',
                          borderBottom: '1px solid rgba(94, 200, 80, 0.1)'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(94, 200, 80, 0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <AssetImg category="villagers" name={v.name} size={20} />
                        <span style={{ color: '#5ec850' }}>{v.name}</span>
                        <span style={{ fontSize: '11px', color: '#5a7a50', marginLeft: 'auto' }}>
                          {v.species} / {v.personality}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            <button
              onClick={addVillager}
              disabled={myVillagers.length >= 10}
              style={{
                ...baseStyles.button,
                opacity: myVillagers.length >= 10 ? 0.5 : 1,
                cursor: myVillagers.length >= 10 ? 'not-allowed' : 'pointer'
              }}
            >
              Add
            </button>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ ...baseStyles.label, marginBottom: 0 }}>Starting Friendship:</label>
            <select
              value={friendshipLevel}
              onChange={(e) => setFriendshipLevel(parseInt(e.target.value))}
              style={baseStyles.select}
            >
              {[1, 2, 3, 4, 5, 6].map(level => (
                <option key={level} value={level}>{'⭐'.repeat(level)}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={baseStyles.section}>
          <h3 style={{ marginTop: 0, color: '#d4b030', fontFamily: '"Playfair Display", serif' }}>Current Residents</h3>
          {myVillagers.length === 0 ? (
            <p style={{ color: '#808080', fontSize: '13px' }}>No villagers added yet.</p>
          ) : (
            myVillagers.map(villager => (
              <div key={villager.id} style={baseStyles.villagerCard}>
                <div
                  onClick={() => openDrawer(villager.name)}
                  style={{ cursor: 'pointer' }}
                >
                  <strong style={{ color: '#5ec850' }}>{villager.name}</strong>
                  <div style={{ fontSize: '12px', color: '#5a7a50', marginTop: '4px' }}>
                    Friendship: {'⭐'.repeat(villager.friendship)} ({villager.friendship}/6)
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select
                    value={villager.friendship}
                    onChange={(e) => updateFriendship(villager.id, parseInt(e.target.value))}
                    style={{ ...baseStyles.select, padding: '6px' }}
                  >
                    {[1, 2, 3, 4, 5, 6].map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeVillager(villager.id)}
                    style={baseStyles.removeBtn}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={baseStyles.section}>
          <h3 style={{ marginTop: 0, color: '#4aacf0', fontFamily: '"Playfair Display", serif' }}>Dreamie Wishlist</h3>
          <textarea
            placeholder="List villagers you want to find..."
            value={dreamieWishlist}
            onChange={(e) => updateDreamies(e.target.value)}
            style={{
              ...baseStyles.input,
              minHeight: '80px',
              fontFamily: '"DM Mono", monospace',
              fontSize: '12px',
              resize: 'vertical'
            }}
          />
        </div>

        {giftLog.length > 0 && (
          <div style={baseStyles.section}>
            <h3 style={{ marginTop: 0, color: '#d4b030', fontFamily: '"Playfair Display", serif' }}>Recent Gift Log</h3>
            {giftLog.slice(-5).map(log => (
              <div key={log.id} style={{ ...baseStyles.pointsBreakdown, borderColor: 'rgba(212, 176, 48, 0.2)' }}>
                <strong>{log.villagerName}</strong> received <em>{log.gift}</em> ({log.points} pts) on {log.date}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Gift Finder Tab
  const renderGiftFinder = () => {
    const nh = giftFinderDetails?.nh_details;
    const favStyles = nh?.fav_styles || [];
    const favColors = nh?.fav_colors || [];
    const isBirthdayToday = (() => {
      if (!giftFinderVillager) return false;
      const now = new Date();
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const v = VILLAGERS.find(v2 => v2.name === giftFinderVillager.name);
      if (!v) return false;
      const bday = BIRTHDAY_CALENDAR[now.getMonth() + 1]?.find(b => b.name === v.name);
      return bday && parseInt(bday.date?.split(' ').pop()) === now.getDate();
    })();

    const personalityTips = {
      Normal: { bestGifts: 'Simple, cute clothing and furniture', avoid: 'Flashy or gothic items' },
      Peppy: { bestGifts: 'Cute, colorful clothing and pop-themed items', avoid: 'Dull or plain items' },
      Lazy: { bestGifts: 'Simple, outdoorsy items and food-themed furniture', avoid: 'Formal or elegant items' },
      Jock: { bestGifts: 'Active, sporty clothing and gym equipment', avoid: 'Formal or frilly items' },
      Cranky: { bestGifts: 'Cool, elegant clothing and antique furniture', avoid: 'Cute or childish items' },
      Snooty: { bestGifts: 'Elegant, gorgeous clothing and luxury furniture', avoid: 'Simple or cheap items' },
      Smug: { bestGifts: 'Elegant, cool clothing and sophisticated furniture', avoid: 'Sporty or casual items' },
      'Big sister': { bestGifts: 'Active, cool clothing and casual furniture', avoid: 'Overly formal items' }
    };

    return (
      <div>
        {/* Search bar */}
        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Type a villager name..."
                value={giftFinderInput}
                onChange={(e) => { setGiftFinderInput(e.target.value); setGiftFinderAutocomplete(true); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const match = VILLAGERS.find(v => v.name.toLowerCase() === giftFinderInput.toLowerCase());
                    if (match) { searchGiftFinder(match.name); setGiftFinderAutocomplete(false); }
                  }
                }}
                onBlur={() => setTimeout(() => setGiftFinderAutocomplete(false), 150)}
                onFocus={() => giftFinderInput.length > 0 && setGiftFinderAutocomplete(true)}
                style={baseStyles.input}
              />
              {giftFinderAutocomplete && giftFinderInput.length >= 1 && (() => {
                const suggestions = VILLAGERS.filter(v =>
                  v.name.toLowerCase().startsWith(giftFinderInput.toLowerCase())
                ).slice(0, 8);
                if (suggestions.length === 0) return null;
                return (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                    background: 'rgba(12, 28, 14, 0.98)', border: '1px solid rgba(94, 200, 80, 0.3)',
                    borderRadius: '0 0 4px 4px', maxHeight: '200px', overflowY: 'auto'
                  }}>
                    {suggestions.map(v => (
                      <div
                        key={v.name}
                        onMouseDown={() => {
                          setGiftFinderInput(v.name);
                          setGiftFinderAutocomplete(false);
                          searchGiftFinder(v.name);
                        }}
                        style={{
                          padding: '8px 10px', cursor: 'pointer', outline: 'none', fontSize: '13px',
                          display: 'flex', alignItems: 'center', gap: '8px',
                          borderBottom: '1px solid rgba(94, 200, 80, 0.1)'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(94, 200, 80, 0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <AssetImg category="villagers" name={v.name} size={20} />
                        <span style={{ color: '#5ec850' }}>{v.name}</span>
                        <span style={{ fontSize: '11px', color: '#5a7a50', marginLeft: 'auto' }}>
                          {v.species} / {v.personality}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            <button
              onClick={() => {
                const match = VILLAGERS.find(v => v.name.toLowerCase() === giftFinderInput.toLowerCase());
                if (match) searchGiftFinder(match.name);
              }}
              style={baseStyles.button}
            >
              Search
            </button>
          </div>
        </div>

        {/* Loading state */}
        {giftFinderLoading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <AssetImg category="villagers" name={giftFinderVillager?.name || ''} size={64} />
            <div style={{ marginTop: '16px', color: '#5a7a50', fontSize: '14px', fontFamily: '"DM Mono", monospace' }}>
              Finding perfect gifts...
            </div>
          </div>
        )}

        {/* Error state */}
        {giftFinderError && (
          <div style={{ ...baseStyles.card, borderColor: 'rgba(255, 100, 100, 0.3)', textAlign: 'center' }}>
            <div style={{ color: '#ff6464', fontSize: '14px' }}>{giftFinderError}</div>
          </div>
        )}

        {/* Results */}
        {!giftFinderLoading && giftFinderVillager && giftFinderDetails && (
          <div>
            {/* Villager card */}
            <div style={{ ...baseStyles.card, display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flexShrink: 0 }}>
                {giftFinderDetails.image_url ? (
                  <img
                    src={giftFinderDetails.image_url}
                    alt={giftFinderVillager.name}
                    style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', background: 'rgba(30, 50, 30, 0.6)', border: '1px solid rgba(94, 200, 80, 0.2)', padding: '4px' }}
                  />
                ) : (
                  <AssetImg category="villagers" name={giftFinderVillager.name} size={80} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '22px', fontFamily: '"Playfair Display", serif', color: '#5ec850' }}>
                  {giftFinderVillager.name}
                </h3>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, fontFamily: '"DM Mono", monospace', background: 'rgba(74, 172, 240, 0.15)', border: '1px solid rgba(74, 172, 240, 0.3)', color: '#4aacf0' }}>
                    {giftFinderVillager.species}
                  </span>
                  <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, fontFamily: '"DM Mono", monospace', background: 'rgba(94, 200, 80, 0.15)', border: '1px solid rgba(94, 200, 80, 0.3)', color: '#5ec850' }}>
                    {giftFinderVillager.personality}
                  </span>
                  <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, fontFamily: '"DM Mono", monospace', background: 'rgba(212, 176, 48, 0.15)', border: '1px solid rgba(212, 176, 48, 0.3)', color: '#d4b030' }}>
                    {giftFinderVillager.birthday}
                  </span>
                </div>
                {favStyles.length > 0 && (
                  <div style={{ fontSize: '12px', color: '#c8e6c0' }}>
                    <span style={{ color: '#5a7a50', fontFamily: '"DM Mono", monospace' }}>Styles:</span> {favStyles.join(', ')}
                    {favColors.length > 0 && (
                      <span style={{ marginLeft: '12px' }}>
                        <span style={{ color: '#5a7a50', fontFamily: '"DM Mono", monospace' }}>Colors:</span> {favColors.join(', ')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Birthday alert */}
            {isBirthdayToday && (
              <div style={{
                ...baseStyles.card,
                borderColor: 'rgba(212, 176, 48, 0.4)',
                background: 'rgba(212, 176, 48, 0.08)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{'\uD83C\uDF82'}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#d4b030' }}>
                  It&apos;s {giftFinderVillager.name}&apos;s birthday today!
                </div>
                <div style={{ fontSize: '12px', color: '#c8e6c0', marginTop: '4px' }}>
                  Birthday gifts earn <strong style={{ color: '#5ec850' }}>2x friendship points</strong>!
                </div>
              </div>
            )}

            {/* Wrapping tip */}
            <div style={{
              ...baseStyles.card,
              borderColor: 'rgba(74, 172, 240, 0.2)',
              background: 'rgba(74, 172, 240, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px'
            }}>
              <span style={{ fontSize: '18px' }}>{'\uD83C\uDF81'}</span>
              <div style={{ fontSize: '13px' }}>
                <strong style={{ color: '#4aacf0' }}>Wrapping bonus:</strong> Always wrap gifts for <strong style={{ color: '#5ec850' }}>+1 extra friendship point</strong>!
              </div>
            </div>

            {/* Best gifts: matching clothing */}
            {favStyles.length > 0 && giftFinderClothing.length > 0 && (
              <div style={{ ...baseStyles.card, marginTop: '4px' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontFamily: '"Playfair Display", serif', color: '#5ec850' }}>
                  Best Clothing Gifts (+2 pts)
                </h3>
                <div style={{ fontSize: '12px', color: '#5a7a50', marginBottom: '12px', fontFamily: '"DM Mono", monospace' }}>
                  Matches {favStyles[0]} style + {favColors[0]} color
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
                  {giftFinderClothing.slice(0, 20).map((item, i) => {
                    const sellPrice = item.sell || 0;
                    const valueBonus = sellPrice >= 750 ? '+1-3' : sellPrice >= 250 ? '+1' : '0';
                    const imgUrl = item.variations?.[0]?.image_url;
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          background: 'rgba(30, 50, 30, 0.4)',
                          border: '1px solid rgba(94, 200, 80, 0.1)',
                          borderRadius: '6px',
                          transition: 'background-color 0.3s ease, border-color 0.3s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(94, 200, 80, 0.08)'; e.currentTarget.style.borderColor = 'rgba(94, 200, 80, 0.25)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(30, 50, 30, 0.4)'; e.currentTarget.style.borderColor = 'rgba(94, 200, 80, 0.1)'; }}
                      >
                        {imgUrl && (
                          <img src={imgUrl} alt={item.name} style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '4px' }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: '#c8e6c0', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#5a7a50', fontFamily: '"DM Mono", monospace' }}>
                            {item.category} {sellPrice > 0 && `\u2022 ${sellPrice.toLocaleString()} bells`}
                          </div>
                        </div>
                        {valueBonus !== '0' && (
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '10px',
                            fontWeight: 600,
                            fontFamily: '"DM Mono", monospace',
                            background: 'rgba(212, 176, 48, 0.15)',
                            border: '1px solid rgba(212, 176, 48, 0.3)',
                            color: '#d4b030',
                            flexShrink: 0
                          }}>
                            +{valueBonus} value
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {giftFinderClothing.length > 20 && (
                  <div style={{ fontSize: '12px', color: '#5a7a50', marginTop: '8px', fontFamily: '"DM Mono", monospace', textAlign: 'center' }}>
                    Showing top 20 of {giftFinderClothing.length} matching items
                  </div>
                )}
              </div>
            )}

            {/* General gift tips based on personality */}
            <div style={{ ...baseStyles.card, marginTop: '4px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontFamily: '"Playfair Display", serif', color: '#d4b030' }}>
                Gift Strategy for {giftFinderVillager.personality} Villagers
              </h3>
              {personalityTips[giftFinderVillager.personality] && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ ...baseStyles.pointsBreakdown, borderColor: 'rgba(94, 200, 80, 0.2)' }}>
                    <strong style={{ color: '#5ec850' }}>Recommended:</strong>
                    <div style={{ marginTop: '4px', fontSize: '13px' }}>{personalityTips[giftFinderVillager.personality].bestGifts}</div>
                  </div>
                  <div style={{ ...baseStyles.pointsBreakdown, borderColor: 'rgba(255, 100, 100, 0.2)', marginTop: '8px' }}>
                    <strong style={{ color: '#ff6464' }}>Avoid:</strong>
                    <div style={{ marginTop: '4px', fontSize: '13px' }}>{personalityTips[giftFinderVillager.personality].avoid}</div>
                  </div>
                </div>
              )}

              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontFamily: '"Playfair Display", serif', color: '#4aacf0' }}>
                Points Reference
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ ...baseStyles.pointsBreakdown, borderColor: 'rgba(94, 200, 80, 0.2)' }}>
                  <strong style={{ color: '#5ec850' }}>+3 pts</strong>
                  <div style={{ fontSize: '12px', marginTop: '2px' }}>Any furniture item</div>
                </div>
                <div style={{ ...baseStyles.pointsBreakdown, borderColor: 'rgba(94, 200, 80, 0.2)' }}>
                  <strong style={{ color: '#5ec850' }}>+2 pts</strong>
                  <div style={{ fontSize: '12px', marginTop: '2px' }}>Matching clothes, flowers, bugs, fish</div>
                </div>
                <div style={{ ...baseStyles.pointsBreakdown, borderColor: 'rgba(74, 172, 240, 0.2)' }}>
                  <strong style={{ color: '#4aacf0' }}>+1 pt</strong>
                  <div style={{ fontSize: '12px', marginTop: '2px' }}>Any other non-trash item</div>
                </div>
                <div style={{ ...baseStyles.pointsBreakdown, borderColor: 'rgba(255, 100, 100, 0.2)' }}>
                  <strong style={{ color: '#ff6464' }}>-2 pts</strong>
                  <div style={{ fontSize: '12px', marginTop: '2px' }}>Trash: boots, cans, tires, weeds</div>
                </div>
              </div>
              <div style={{ ...baseStyles.pointsBreakdown, borderColor: 'rgba(212, 176, 48, 0.2)', marginTop: '8px' }}>
                <strong style={{ color: '#d4b030' }}>Value bonus:</strong>
                <span style={{ fontSize: '12px', marginLeft: '8px' }}>250-749 bells = +1 | 750+ bells = +1-3 extra points</span>
              </div>
            </div>

            {/* No API preferences fallback */}
            {favStyles.length === 0 && (
              <div style={{ ...baseStyles.card, borderColor: 'rgba(212, 176, 48, 0.2)', marginTop: '4px' }}>
                <div style={{ fontSize: '13px', color: '#d4b030', marginBottom: '8px', fontWeight: 600 }}>
                  Style preference data not available for this villager
                </div>
                <div style={{ fontSize: '12px', color: '#c8e6c0' }}>
                  Use the personality-based tips above, or give <strong style={{ color: '#5ec850' }}>furniture (+3 pts)</strong> for guaranteed high points regardless of preferences.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!giftFinderLoading && !giftFinderVillager && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{'\uD83C\uDF81'}</div>
            <h3 style={{ fontFamily: '"Playfair Display", serif', color: '#5ec850', margin: '0 0 8px 0' }}>
              Find the Perfect Gift
            </h3>
            <p style={{ fontSize: '14px', color: '#5a7a50', margin: 0 }}>
              Search for a villager to see personalized gift recommendations based on their style and color preferences.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderDrawer = () => {
    if (!drawerVillager) return null;

    const personalityColors = {
      'Normal': '#f9b4d6',
      'Peppy': '#ff88cc',
      'Lazy': '#98d2a6',
      'Jock': '#ff8844',
      'Cranky': '#996633',
      'Snooty': '#ffdd99',
      'Smug': '#88ddff',
      'Big sister': '#ff99dd'
    };

    return (
      <>
        {/* Backdrop */}
        <div
          onClick={closeDrawer}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            zIndex: 999,
            opacity: drawerVisible ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: drawerVisible ? 'auto' : 'none'
          }}
        />
        {/* Drawer panel */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '380px',
            maxWidth: '90vw',
            background: '#0c1c0e',
            borderLeft: '2px solid rgba(94, 200, 80, 0.3)',
            zIndex: 1000,
            overflowY: 'auto',
            padding: '24px',
            fontFamily: '"DM Sans", sans-serif',
            color: '#c8e6c0',
            transform: drawerVisible ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: drawerVisible ? '-8px 0 32px rgba(0, 0, 0, 0.5)' : 'none',
            animation: drawerVisible ? 'villagerDrawerSlideIn 0.3s ease forwards' : 'none'
          }}
        >
          {/* Close button */}
          <button
            onClick={closeDrawer}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(94, 200, 80, 0.3)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              outline: 'none',
              color: '#c8e6c0',
              fontSize: '18px',
              fontWeight: 700,
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 100, 100, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
          >
            X
          </button>

          {drawerLoading ? (
            <div style={{ textAlign: 'center', paddingTop: '80px' }}>
              <AssetImg category="villagers" name={drawerVillager} size={64} />
              <div style={{ marginTop: '16px', color: '#5a7a50', fontSize: '14px', fontFamily: '"DM Mono", monospace' }}>
                Loading details...
              </div>
            </div>
          ) : drawerData ? (
            <div style={{ paddingTop: '8px' }}>
              {/* Portrait */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                {drawerData.image_url ? (
                  <img
                    src={drawerData.image_url}
                    alt={drawerData.name}
                    style={{
                      width: '160px',
                      height: '160px',
                      objectFit: 'contain',
                      borderRadius: '12px',
                      background: 'rgba(30, 50, 30, 0.6)',
                      border: '2px solid rgba(94, 200, 80, 0.2)',
                      padding: '8px'
                    }}
                  />
                ) : (
                  <AssetImg category="villagers" name={drawerVillager} size={120} />
                )}
              </div>

              {/* Name */}
              <h2 style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '28px',
                fontWeight: 700,
                color: '#5ec850',
                textAlign: 'center',
                margin: '0 0 16px 0'
              }}>
                {drawerData.name}
              </h2>

              {/* Info pills */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                {[
                  { label: drawerData.species, color: '#4aacf0' },
                  { label: drawerData.personality, color: personalityColors[drawerData.personality] || '#5ec850' },
                  { label: drawerData.gender, color: drawerData.gender === 'Male' ? '#88ddff' : '#ff88cc' }
                ].map((pill, i) => (
                  <span key={i} style={{
                    padding: '5px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: '"DM Mono", monospace',
                    background: `${pill.color}20`,
                    border: `1px solid ${pill.color}50`,
                    color: pill.color
                  }}>
                    {pill.label}
                  </span>
                ))}
              </div>

              {/* Detail rows */}
              <div style={{
                background: 'rgba(20, 40, 25, 0.8)',
                border: '1px solid rgba(94, 200, 80, 0.15)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                {/* Birthday */}
                {drawerData.birthday_month && (
                  <div>
                    <div style={{ fontSize: '11px', fontFamily: '"DM Mono", monospace', color: '#5a7a50', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Birthday</div>
                    <div style={{ fontSize: '15px' }}>
                      {'\uD83C\uDF82'} {drawerData.birthday_month} {drawerData.birthday_day}
                      {drawerData.sign && (
                        <span style={{
                          marginLeft: '8px',
                          padding: '2px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: 'rgba(212, 176, 48, 0.15)',
                          border: '1px solid rgba(212, 176, 48, 0.3)',
                          color: '#d4b030',
                          fontFamily: '"DM Mono", monospace'
                        }}>
                          {drawerData.sign}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Catchphrase */}
                {drawerData.phrase && (
                  <div>
                    <div style={{ fontSize: '11px', fontFamily: '"DM Mono", monospace', color: '#5a7a50', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Catchphrase</div>
                    <div style={{
                      fontSize: '16px',
                      fontStyle: 'italic',
                      color: '#d4b030'
                    }}>
                      &ldquo;{drawerData.phrase}&rdquo;
                    </div>
                  </div>
                )}

                {/* Quote */}
                {drawerData.quote && (
                  <div>
                    <div style={{ fontSize: '11px', fontFamily: '"DM Mono", monospace', color: '#5a7a50', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quote</div>
                    <div style={{ fontSize: '13px', color: '#5a7a50', fontStyle: 'italic', lineHeight: '1.5' }}>
                      {drawerData.quote}
                    </div>
                  </div>
                )}

                {/* Default clothing */}
                {drawerData.clothing && (
                  <div>
                    <div style={{ fontSize: '11px', fontFamily: '"DM Mono", monospace', color: '#5a7a50', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Default Clothing</div>
                    <div style={{ fontSize: '14px', color: '#4aacf0' }}>
                      {drawerData.clothing}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: '80px' }}>
              <AssetImg category="villagers" name={drawerVillager} size={64} />
              <h3 style={{ fontFamily: '"Playfair Display", serif', color: '#5ec850', marginTop: '16px' }}>{drawerVillager}</h3>
              <div style={{ color: '#5a7a50', fontSize: '13px' }}>Could not load details from API.</div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div style={baseStyles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');

        @keyframes villagerDrawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
      <h1 style={baseStyles.header}>{'\uD83C\uDF81'} Villager Gift Guide</h1>

      <div style={{ ...baseStyles.tabs, flexWrap: 'wrap' }}>
        {['guide', 'finder', 'calendar', 'villagers'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...baseStyles.tabButton,
              ...(activeTab === tab && baseStyles.tabButtonActive)
            }}
          >
            {tab === 'guide' && 'Gift Guide'}
            {tab === 'finder' && 'Gift Finder'}
            {tab === 'calendar' && 'Birthday Calendar'}
            {tab === 'villagers' && 'My Villagers'}
          </button>
        ))}
      </div>

      {activeTab === 'guide' && renderGiftGuide()}
      {activeTab === 'finder' && renderGiftFinder()}
      {activeTab === 'calendar' && renderBirthdayCalendar()}
      {activeTab === 'villagers' && renderMyVillagers()}

      {renderDrawer()}
    </div>
  );
};

export default VillagerGiftGuide;
