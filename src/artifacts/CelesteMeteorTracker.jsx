'use client';

import React, { useState, useEffect } from 'react';
import { AssetImg } from '../assetHelper';

const CelesteMeteorTracker = () => {
  const [activeTab, setActiveTab] = useState('zodiac');
  const [zodiacData, setZodiacData] = useState({});
  const [celesteRecipes, setCelesteRecipes] = useState({});
  const [meteorLog, setMeteorLog] = useState([]);
  const [celesteVisits, setCelesteVisits] = useState([]);
  const [fragments, setFragments] = useState({});
  const [wishes, setWishes] = useState(0);
  const [newWishes, setNewWishes] = useState('');
  const [hoveredButtonId, setHoveredButtonId] = useState(null);

  const ZODIACS = [
    { name: 'Capricorn', emoji: '♑', dates: 'Dec 22 - Jan 19', item: 'Capricorn Ornament', materials: '2 Capricorn Frags, 3 Star Frags, 2 Gold Nuggets, 12 Stone' },
    { name: 'Aquarius', emoji: '♒', dates: 'Jan 20 - Feb 18', item: 'Aquarius Urn', materials: '2 Aquarius Frags, 3 Star Frags, 2 Gold Nuggets, 5 Stone' },
    { name: 'Pisces', emoji: '♓', dates: 'Feb 19 - Mar 20', item: 'Pisces Lamp', materials: '2 Pisces Frags, 3 Star Frags, 2 Gold Nuggets, 4 Stone' },
    { name: 'Aries', emoji: '♈', dates: 'Mar 21 - Apr 19', item: 'Aries Rocking Chair', materials: '2 Aries Frags, 3 Star Frags, 1 Gold Nugget, 5 Stone' },
    { name: 'Taurus', emoji: '♉', dates: 'Apr 20 - May 20', item: 'Taurus Bathtub', materials: '2 Taurus Frags, 3 Star Frags, 1 Gold Nugget, 8 Stone' },
    { name: 'Gemini', emoji: '♊', dates: 'May 21 - Jun 20', item: 'Gemini Closet', materials: '2 Gemini Frags, 3 Star Frags, 2 Gold Nuggets, 6 Stone' },
    { name: 'Cancer', emoji: '♋', dates: 'Jun 21 - Jul 22', item: 'Cancer Table', materials: '2 Cancer Frags, 3 Star Frags, 2 Gold Nuggets, 3 Stone' },
    { name: 'Leo', emoji: '♌', dates: 'Jul 23 - Aug 22', item: 'Leo Sculpture', materials: '2 Leo Frags, 3 Star Frags, 2 Gold Nuggets, 3 Stone' },
    { name: 'Virgo', emoji: '♍', dates: 'Aug 23 - Sep 22', item: 'Virgo Harp', materials: '2 Virgo Frags, 3 Star Frags, 2 Gold Nuggets, 4 Stone' },
    { name: 'Libra', emoji: '♎', dates: 'Sep 23 - Oct 22', item: 'Libra Scale', materials: '2 Libra Frags, 3 Star Frags, 2 Gold Nuggets' },
    { name: 'Scorpio', emoji: '♏', dates: 'Oct 23 - Nov 21', item: 'Scorpio Lamp', materials: '2 Scorpio Frags, 3 Star Frags, 2 Gold Nuggets, 5 Stone' },
    { name: 'Sagittarius', emoji: '♐', dates: 'Nov 22 - Dec 21', item: 'Sagittarius Arrow', materials: '2 Sagittarius Frags, 3 Star Frags, 2 Gold Nuggets' },
  ];

  const SPACE_ITEMS = [
    'Crescent-Moon Chair', 'Nova Light', 'Moon', 'Star Clock', 'Starry Garland', 'Asteroid',
    'Satellite', 'Rocket', 'Crewed Spaceship', 'Lunar Lander', 'Lunar Rover', 'Flying Saucer',
    'Space Shuttle', 'Lunar Surface', 'Astronaut Suit', 'Star Head', 'Star Pochette', 'Starry Wall',
    'Starry-Sky Wall', 'Galaxy Flooring', 'Sci-Fi Wall', 'Sci-Fi Flooring'
  ];

  const WANDS = [
    'Star Wand', 'Cosmos Wand', 'Rose Wand', 'Lily Wand', 'Hyacinth Wand', 'Windflower Wand',
    'Tulip Wand', 'Pansy Wand', 'Mums Wand', 'Bamboo Wand', 'Iron Wand', 'Golden Wand', 'Tree-Branch Wand'
  ];

  const getCurrentZodiac = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
    if (month === 1 && day >= 20 || month === 2 && day <= 18) return 'Aquarius';
    if (month === 2 && day >= 19 || month === 3 && day <= 20) return 'Pisces';
    if (month === 3 && day >= 21 || month === 4 && day <= 19) return 'Aries';
    if (month === 4 && day >= 20 || month === 5 && day <= 20) return 'Taurus';
    if (month === 5 && day >= 21 || month === 6 && day <= 20) return 'Gemini';
    if (month === 6 && day >= 21 || month === 7 && day <= 22) return 'Cancer';
    if (month === 7 && day >= 23 || month === 8 && day <= 22) return 'Leo';
    if (month === 8 && day >= 23 || month === 9 && day <= 22) return 'Virgo';
    if (month === 9 && day >= 23 || month === 10 && day <= 22) return 'Libra';
    if (month === 10 && day >= 23 || month === 11 && day <= 21) return 'Scorpio';
    return 'Sagittarius';
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get('celesteTracker');
        if (result) {
          const data = JSON.parse(result.value);
          setZodiacData(data.zodiacData || {});
          setCelesteRecipes(data.celesteRecipes || {});
          setMeteorLog(data.meteorLog || []);
          setCelesteVisits(data.celesteVisits || []);
          setFragments(data.fragments || {});
          setWishes(data.wishes || 0);
        } else {
          const initialZodiac = ZODIACS.reduce((acc, z) => ({ ...acc, [z.name]: false }), {});
          const initialRecipes = {};
          SPACE_ITEMS.forEach(item => { initialRecipes[item] = false; });
          WANDS.forEach(wand => { initialRecipes[wand] = false; });
          setZodiacData(initialZodiac);
          setCelesteRecipes(initialRecipes);
          const initialFrags = ZODIACS.reduce((acc, z) => ({ ...acc, [z.name]: 0 }), { 'Star': 0, 'Large Star': 0 });
          setFragments(initialFrags);
        }
      } catch (err) {
        console.error('Load error:', err);
      }
    };
    loadData();
  }, []);

  const saveData = async (newZodiac, newRecipes, newLog, newVisits, newFrags, newWishes) => {
    try {
      const dataToSave = {
        zodiacData: newZodiac,
        celesteRecipes: newRecipes,
        meteorLog: newLog,
        celesteVisits: newVisits,
        fragments: newFrags,
        wishes: newWishes
      };
      await window.storage.set('celesteTracker', JSON.stringify(dataToSave));
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const toggleZodiac = async (zodiacName) => {
    const updated = { ...zodiacData, [zodiacName]: !zodiacData[zodiacName] };
    setZodiacData(updated);
    await saveData(updated, celesteRecipes, meteorLog, celesteVisits, fragments, wishes);
  };

  const toggleRecipe = async (recipeName) => {
    const updated = { ...celesteRecipes, [recipeName]: !celesteRecipes[recipeName] };
    setCelesteRecipes(updated);
    await saveData(zodiacData, updated, meteorLog, celesteVisits, fragments, wishes);
  };

  const addMeteorEntry = async () => {
    if (!newWishes || isNaN(newWishes) || newWishes < 1) return;
    const count = parseInt(newWishes);
    const starFrag = Math.floor(count * 0.8);
    const largeFrag = Math.floor(count * 0.05);
    const zodiacFrag = count - starFrag - largeFrag;
    const entry = {
      date: new Date().toLocaleDateString(),
      wishes: count,
      estimatedStar: starFrag,
      estimatedLarge: largeFrag,
      estimatedZodiac: zodiacFrag
    };
    const updated = [...meteorLog, entry];
    setMeteorLog(updated);
    setNewWishes('');
    await saveData(zodiacData, celesteRecipes, updated, celesteVisits, fragments, wishes + count);
    setWishes(wishes + count);
  };

  const addCelesteVisit = async () => {
    const visit = { date: new Date().toLocaleDateString() };
    const updated = [...celesteVisits, visit];
    setCelesteVisits(updated);
    await saveData(zodiacData, celesteRecipes, meteorLog, updated, fragments, wishes);
  };

  const updateFragmentCount = async (fragType, newCount) => {
    const updated = { ...fragments, [fragType]: Math.max(0, newCount) };
    setFragments(updated);
    await saveData(zodiacData, celesteRecipes, meteorLog, celesteVisits, updated, wishes);
  };

  const currentZodiac = getCurrentZodiac();
  const zodiacCount = Object.values(zodiacData).filter(Boolean).length;
  const recipeCount = Object.values(celesteRecipes).filter(Boolean).length;
  const totalRecipes = Object.keys(celesteRecipes).length;

  const styles = {
    container: {
      width: '100%',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#0a1a10',
      color: '#c8e6c0',
      fontFamily: '"DM Sans", sans-serif',
      borderRadius: '8px',
      minHeight: '100vh'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      borderBottom: '2px solid rgba(94, 200, 80, 0.3)',
      paddingBottom: '15px'
    },
    title: {
      fontSize: '36px',
      fontFamily: '"Playfair Display", serif',
      fontWeight: '700',
      color: '#5ec850',
      margin: '0 0 5px 0'
    },
    subtitle: {
      fontSize: '14px',
      color: '#5a7a50',
      margin: 0
    },
    tabContainer: {
      display: 'flex',
      gap: '10px',
      marginBottom: '25px',
      borderBottom: '1px solid rgba(94, 200, 80, 0.2)'
    },
    tab: {
      padding: '12px 20px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#5a7a50',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      borderBottom: '2px solid transparent',
      transition: 'all 0.3s ease',
      fontFamily: '"DM Sans", sans-serif'
    },
    tabActive: {
      color: '#5ec850',
      borderBottomColor: '#5ec850'
    },
    statRow: {
      display: 'flex',
      gap: '20px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    },
    statBox: {
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      padding: '12px 16px',
      borderRadius: '6px',
      fontSize: '13px'
    },
    statLabel: {
      color: '#5a7a50',
      fontSize: '12px',
      marginBottom: '4px'
    },
    statValue: {
      color: '#5ec850',
      fontSize: '20px',
      fontFamily: '"DM Mono", monospace',
      fontWeight: '700'
    },
    zodiacGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '15px',
      marginBottom: '20px'
    },
    zodiacCard: {
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      padding: '15px',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    zodiacCardActive: {
      backgroundColor: 'rgba(94, 200, 80, 0.15)',
      borderColor: 'rgba(94, 200, 80, 0.5)',
      boxShadow: '0 0 12px rgba(94, 200, 80, 0.2)'
    },
    zodiacCardCurrent: {
      borderColor: '#d4b030',
      boxShadow: '0 0 15px rgba(212, 176, 48, 0.3)'
    },
    zodiacHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '8px'
    },
    zodiacEmoji: {
      fontSize: '24px'
    },
    zodiacName: {
      fontWeight: '700',
      color: '#d4b030',
      fontSize: '15px'
    },
    zodiacDates: {
      fontSize: '12px',
      color: '#5a7a50',
      marginBottom: '8px'
    },
    zodiacItem: {
      fontSize: '13px',
      color: '#c8e6c0',
      marginBottom: '6px'
    },
    zodiacMaterials: {
      fontSize: '11px',
      color: '#5a7a50',
      lineHeight: '1.4'
    },
    checkbox: {
      marginTop: '10px'
    },
    checkboxInput: {
      width: '18px',
      height: '18px',
      cursor: 'pointer',
      accentColor: '#5ec850'
    },
    recipeGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      marginBottom: '20px'
    },
    recipeCard: {
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      padding: '12px',
      borderRadius: '6px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '12px'
    },
    recipeCardLearned: {
      backgroundColor: 'rgba(94, 200, 80, 0.15)',
      borderColor: 'rgba(94, 200, 80, 0.5)',
      color: '#5ec850',
      textDecoration: 'line-through'
    },
    recipeGroup: {
      marginBottom: '20px'
    },
    groupLabel: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#d4b030',
      marginBottom: '10px',
      padding: '10px 0'
    },
    meteorLog: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    inputSection: {
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      padding: '15px',
      borderRadius: '6px',
      marginBottom: '20px'
    },
    inputLabel: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '500',
      marginBottom: '8px',
      color: '#d4b030'
    },
    inputField: {
      width: '100%',
      padding: '8px 12px',
      backgroundColor: 'rgba(12, 28, 14, 0.7)',
      border: '1px solid rgba(94, 200, 80, 0.3)',
      borderRadius: '4px',
      color: '#c8e6c0',
      fontFamily: '"DM Mono", monospace',
      fontSize: '13px',
      boxSizing: 'border-box',
      marginBottom: '10px'
    },
    button: {
      padding: '8px 16px',
      backgroundColor: '#5ec850',
      border: 'none',
      borderRadius: '4px',
      color: '#0a1a10',
      fontWeight: '700',
      cursor: 'pointer',
      fontSize: '13px',
      fontFamily: '"DM Sans", sans-serif',
      transition: 'all 0.3s ease'
    },
    buttonHover: {
      backgroundColor: '#4aacf0',
      transform: 'translateY(-2px)'
    },
    logEntry: {
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      padding: '12px',
      borderRadius: '6px'
    },
    logDate: {
      fontSize: '12px',
      color: '#5a7a50',
      marginBottom: '8px'
    },
    logStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
      fontSize: '12px'
    },
    logStat: {
      color: '#5ec850',
      fontFamily: '"DM Mono", monospace'
    },
    fragmentTracker: {
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      padding: '15px',
      borderRadius: '6px',
      marginBottom: '20px'
    },
    fragmentItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
      fontSize: '13px'
    },
    fragmentLabel: {
      color: '#d4b030',
      fontWeight: '500'
    },
    fragmentInput: {
      width: '80px',
      padding: '6px 8px',
      backgroundColor: 'rgba(12, 28, 14, 0.7)',
      border: '1px solid rgba(94, 200, 80, 0.3)',
      borderRadius: '4px',
      color: '#5ec850',
      fontFamily: '"DM Mono", monospace',
      fontSize: '12px',
      boxSizing: 'border-box'
    },
    progressRing: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: `conic-gradient(#5ec850 ${(zodiacCount / 12) * 360}deg, rgba(94, 200, 80, 0.2) 0deg)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 20px',
      flexDirection: 'column'
    },
    progressText: {
      color: '#5ec850',
      fontFamily: '"DM Mono", monospace',
      fontSize: '18px',
      fontWeight: '700'
    },
    progressLabel: {
      fontSize: '10px',
      color: '#5a7a50'
    }
  };

  return (
    <div style={styles.container}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>🌙 Celeste & Meteor Tracker</h1>
        <p style={styles.subtitle}>ACNH Cosmic Companion Guide</p>
      </div>

      <div style={styles.statRow}>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>Total Wishes</div>
          <div style={styles.statValue}>{wishes}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>Zodiac Items</div>
          <div style={styles.statValue}>{zodiacCount}/12</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>Celeste Recipes</div>
          <div style={styles.statValue}>{recipeCount}/{totalRecipes}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>Current Zodiac</div>
          <div style={styles.statValue}>{currentZodiac}</div>
        </div>
      </div>

      <div style={styles.tabContainer}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'zodiac' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('zodiac')}
        >
          ♈ Zodiac Tracker
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'recipes' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('recipes')}
        >
          ✨ Celeste Recipes
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'meteor' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('meteor')}
        >
          ☄️ Meteor Log
        </button>
      </div>

      {activeTab === 'zodiac' && (
        <div>
          <div style={styles.progressRing}>
            <div style={styles.progressText}>{zodiacCount}</div>
            <div style={styles.progressLabel}>of 12</div>
          </div>
          <div style={styles.zodiacGrid}>
            {ZODIACS.map((zodiac) => (
              <div
                key={zodiac.name}
                style={{
                  ...styles.zodiacCard,
                  ...(zodiacData[zodiac.name] ? styles.zodiacCardActive : {}),
                  ...(zodiac.name === currentZodiac ? styles.zodiacCardCurrent : {})
                }}
                onClick={() => toggleZodiac(zodiac.name)}
              >
                <div style={styles.zodiacHeader}>
                  <span style={styles.zodiacEmoji}>{zodiac.emoji}</span>
                  <span style={styles.zodiacName}>{zodiac.name}</span>
                </div>
                <div style={styles.zodiacDates}>{zodiac.dates}</div>
                <div style={styles.zodiacItem}>{zodiac.item}</div>
                <div style={styles.zodiacMaterials}>{zodiac.materials}</div>
                <div style={styles.checkbox}>
                  <input
                    type="checkbox"
                    style={styles.checkboxInput}
                    checked={zodiacData[zodiac.name] || false}
                    readOnly
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={styles.fragmentTracker}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#d4b030', marginBottom: '15px' }}>📦 Fragment Inventory</div>
            {['Star', 'Large Star', ...ZODIACS.map(z => z.name)].map((fragType) => (
              <div key={fragType} style={styles.fragmentItem}>
                <span style={styles.fragmentLabel}>{fragType}</span>
                <input
                  type="number"
                  style={styles.fragmentInput}
                  value={fragments[fragType] || 0}
                  onChange={(e) => updateFragmentCount(fragType, parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'recipes' && (
        <div>
          <div style={styles.recipeGroup}>
            <div style={styles.groupLabel}>♈ Zodiac Items (12)</div>
            <div style={styles.recipeGrid}>
              {ZODIACS.map((zodiac) => (
                <div
                  key={zodiac.item}
                  style={{
                    ...styles.recipeCard,
                    ...(celesteRecipes[zodiac.item] ? styles.recipeCardLearned : {})
                  }}
                  onClick={() => toggleRecipe(zodiac.item)}
                >
                  <AssetImg category="recipes" name={zodiac.item} size={32} style={{ display: 'block', margin: '0 auto 4px' }} />
                  {zodiac.item}
                </div>
              ))}
            </div>
          </div>

          <div style={styles.recipeGroup}>
            <div style={styles.groupLabel}>🚀 Space Items (22)</div>
            <div style={styles.recipeGrid}>
              {SPACE_ITEMS.map((item) => (
                <div
                  key={item}
                  style={{
                    ...styles.recipeCard,
                    ...(celesteRecipes[item] ? styles.recipeCardLearned : {})
                  }}
                  onClick={() => toggleRecipe(item)}
                >
                  <AssetImg category="recipes" name={item} size={32} style={{ display: 'block', margin: '0 auto 4px' }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div style={styles.recipeGroup}>
            <div style={styles.groupLabel}>✨ Wands (13)</div>
            <div style={styles.recipeGrid}>
              {WANDS.map((wand) => (
                <div
                  key={wand}
                  style={{
                    ...styles.recipeCard,
                    ...(celesteRecipes[wand] ? styles.recipeCardLearned : {})
                  }}
                  onClick={() => toggleRecipe(wand)}
                >
                  <AssetImg category="recipes" name={wand} size={32} style={{ display: 'block', margin: '0 auto 4px' }} />
                  {wand}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'meteor' && (
        <div>
          <div style={styles.inputSection}>
            <label style={styles.inputLabel}>🌠 Log Meteor Shower</label>
            <input
              type="number"
              style={styles.inputField}
              placeholder="Enter wishes made"
              value={newWishes}
              onChange={(e) => setNewWishes(e.target.value)}
              min="1"
            />
            <button
              style={{ ...styles.button, ...(hoveredButtonId === 'addEntry' ? styles.buttonHover : {}) }}
              onClick={addMeteorEntry}
              onMouseEnter={() => setHoveredButtonId('addEntry')}
              onMouseLeave={() => setHoveredButtonId(null)}
            >
              Add Entry
            </button>
          </div>

          <div style={{ backgroundColor: 'rgba(12, 28, 14, 0.95)', border: '1px solid rgba(94, 200, 80, 0.2)', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#d4b030', marginBottom: '12px' }}>📊 Fragment Drop Rates</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '13px' }}>
              <div><span style={{ color: '#5ec850' }}>⭐ Star Fragment</span><br/><span style={{ fontFamily: '"DM Mono", monospace', color: '#4aacf0' }}>80%</span></div>
              <div><span style={{ color: '#5ec850' }}>💫 Large Star</span><br/><span style={{ fontFamily: '"DM Mono", monospace', color: '#4aacf0' }}>5%</span></div>
              <div><span style={{ color: '#5ec850' }}>🔮 Zodiac</span><br/><span style={{ fontFamily: '"DM Mono", monospace', color: '#4aacf0' }}>15%</span></div>
            </div>
          </div>

          <div style={{ fontSize: '14px', fontWeight: '700', color: '#d4b030', marginBottom: '12px' }}>☄️ Meteor Shower Log</div>
          <div style={styles.meteorLog}>
            {meteorLog.length === 0 ? (
              <div style={{ ...styles.logEntry, textAlign: 'center', color: '#5a7a50' }}>No meteor showers logged yet</div>
            ) : (
              meteorLog.map((entry, idx) => (
                <div key={idx} style={styles.logEntry}>
                  <div style={styles.logDate}>📅 {entry.date}</div>
                  <div style={styles.logStats}>
                    <div style={styles.logStat}>⭐ {entry.estimatedStar}</div>
                    <div style={styles.logStat}>💫 {entry.estimatedLarge}</div>
                    <div style={styles.logStat}>🔮 {entry.estimatedZodiac}</div>
                    <div style={styles.logStat}>🌠 {entry.wishes} wishes</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#d4b030', marginBottom: '12px' }}>🌙 Celeste Visits</div>
            <button
              style={{ ...styles.button, ...(hoveredButtonId === 'logVisit' ? styles.buttonHover : {}) }}
              onClick={addCelesteVisit}
              onMouseEnter={() => setHoveredButtonId('logVisit')}
              onMouseLeave={() => setHoveredButtonId(null)}
            >
              Log Visit Today
            </button>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {celesteVisits.length === 0 ? (
                <div style={{ ...styles.logEntry, textAlign: 'center', color: '#5a7a50' }}>No Celeste visits recorded</div>
              ) : (
                celesteVisits.map((visit, idx) => (
                  <div key={idx} style={{ ...styles.logEntry, padding: '8px 12px', fontSize: '13px' }}>
                    ✨ {visit.date}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CelesteMeteorTracker;
