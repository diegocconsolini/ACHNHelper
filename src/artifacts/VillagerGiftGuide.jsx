import React, { useState, useEffect } from 'react';
import { AssetImg } from '../assetHelper';

const VillagerGiftGuide = () => {
  const [activeTab, setActiveTab] = useState('guide');
  const [selectedPersonality, setSelectedPersonality] = useState('normal');
  const [myVillagers, setMyVillagers] = useState([]);
  const [villagerInput, setVillagerInput] = useState('');
  const [friendshipLevel, setFriendshipLevel] = useState(3);
  const [giftLog, setGiftLog] = useState([]);
  const [dreamieWishlist, setDreamieWishlist] = useState('');

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

  const birthdayVillagers = {
    1: [{ name: 'Bob', date: 1 }, { name: 'Diana', date: 4 }, { name: 'Roald', date: 5 }, { name: 'Genji', date: 21 }, { name: 'Sherb', date: 18 }],
    2: [{ name: 'Stitches', date: 10 }, { name: 'Ribbot', date: 13 }, { name: 'Lily', date: 4 }, { name: 'Olivia', date: 3 }, { name: 'Rosie', date: 27 }],
    3: [{ name: 'Coco', date: 1 }, { name: 'Molly', date: 7 }, { name: 'Zucker', date: 8 }, { name: 'Judy', date: 10 }, { name: 'Hopkins', date: 11 }, { name: 'Dotty', date: 14 }, { name: 'Julian', date: 15 }, { name: 'Merengue', date: 19 }, { name: 'Dom', date: 18 }, { name: 'Fauna', date: 26 }, { name: 'Lolly', date: 27 }, { name: 'Skye', date: 24 }],
    4: [{ name: 'Beau', date: 5 }, { name: 'Colton', date: 1 }, { name: 'Punchy', date: 11 }, { name: 'Pietro', date: 19 }, { name: 'Agnes', date: 21 }, { name: 'Cephalobot', date: 20 }],
    5: [{ name: 'Cherry', date: 11 }, { name: 'Pekoe', date: 18 }, { name: 'Gayle', date: 17 }, { name: 'Sasha', date: 19 }],
    6: [{ name: 'Maple', date: 15 }, { name: 'Marina', date: 26 }, { name: 'Tangy', date: 17 }],
    7: [{ name: 'Apollo', date: 4 }, { name: 'Ketchup', date: 27 }, { name: 'Erik', date: 27 }, { name: 'Static', date: 9 }, { name: 'Merry', date: 29 }],
    8: [{ name: 'Audie', date: 31 }, { name: 'Poppy', date: 5 }, { name: 'Nan', date: 24 }],
    9: [{ name: 'Ankha', date: 22 }, { name: 'Marshal', date: 29 }, { name: 'Ione', date: 28 }, { name: 'Whitney', date: 17 }],
    10: [{ name: 'Raymond', date: 1 }, { name: 'Shino', date: 8 }, { name: 'Petri', date: 11 }],
    11: [{ name: 'Lucky', date: 4 }, { name: 'Tia', date: 18 }, { name: 'Wolfgang', date: 25 }, { name: 'Kabuki', date: 29 }, { name: 'Bam', date: 7 }],
    12: [{ name: 'Fang', date: 18 }, { name: 'Freya', date: 14 }, { name: 'Blanche', date: 21 }, { name: 'Kyle', date: 6 }]
  };

  const universalGifts = [
    { name: 'Iron Wall Lamp', bells: 2500, reason: 'No style conflict, moderately valued' },
    { name: 'Fruit (any crafted)', bells: 'Varies', reason: 'All villagers love fruit items' },
    { name: 'Non-native fruit', bells: '100-200', reason: 'Simple, always appreciated' }
  ];

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
        console.log('First time setup');
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
      fontSize: '14px',
      fontWeight: 500,
      transition: 'all 0.3s ease',
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
      cursor: 'pointer'
    },
    button: {
      padding: '10px 20px',
      background: '#5ec850',
      color: '#0a1a10',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '14px',
      transition: 'all 0.3s ease'
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
      transition: 'all 0.3s ease',
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
      fontSize: '12px',
      fontWeight: 600,
      transition: 'all 0.3s ease'
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
            <strong>+3 pts:</strong> Furniture ({'>'}10,000 bells)
          </div>
          <div style={baseStyles.pointsBreakdown}>
            <strong>+2 pts:</strong> Favorite clothing style ({p.style})
          </div>
          <div style={baseStyles.pointsBreakdown}>
            <strong>+2 pts:</strong> Flowers, Fish, Insects, Tools, or Music
          </div>
          <div style={baseStyles.pointsBreakdown}>
            <strong>+1 pt:</strong> Wrapped gift bonus (always wrap!)
          </div>
          <div style={{ ...baseStyles.pointsBreakdown, borderColor: 'rgba(255, 100, 100, 0.2)' }}>
            <strong style={{ color: '#ff8888' }}>-2 pts:</strong> Garbage items (boots, cans, tires)
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
              <div>• Don't skip wrapping (-1 pt)</div>
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

    return (
      <div style={baseStyles.monthGrid}>
        {months.map((month, idx) => (
          <div key={idx} style={baseStyles.monthBox}>
            <div style={baseStyles.monthTitle}>{month}</div>
            <div style={baseStyles.villagerList}>
              {birthdayVillagers[idx + 1]?.map((v, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AssetImg category="villagers" name={v.name} size={24} />
                  <strong>{v.name}</strong> – {v.date}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // My Villagers Tab
  const renderMyVillagers = () => {
    return (
      <div>
        <div style={baseStyles.section}>
          <h3 style={{ marginTop: 0, color: '#5ec850', fontFamily: '"Playfair Display", serif' }}>Add Island Resident (Max 10)</h3>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Villager name..."
              value={villagerInput}
              onChange={(e) => setVillagerInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addVillager()}
              style={{ ...baseStyles.input, flex: 1 }}
            />
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
                <div>
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

  return (
    <div style={baseStyles.container}>
      <style>{'@import url(\'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap\');'}</style>
      <h1 style={baseStyles.header}>🎁 Villager Gift Guide</h1>

      <div style={baseStyles.tabs}>
        {['guide', 'calendar', 'villagers'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...baseStyles.tabButton,
              ...(activeTab === tab && baseStyles.tabButtonActive)
            }}
          >
            {tab === 'guide' && 'Gift Guide'}
            {tab === 'calendar' && 'Birthday Calendar'}
            {tab === 'villagers' && 'My Villagers'}
          </button>
        ))}
      </div>

      {activeTab === 'guide' && renderGiftGuide()}
      {activeTab === 'calendar' && renderBirthdayCalendar()}
      {activeTab === 'villagers' && renderMyVillagers()}
    </div>
  );
};

export default VillagerGiftGuide;
