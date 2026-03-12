import React, { useState, useEffect } from 'react';
import { AssetImg } from '../assetHelper';

const GulliverTracker = () => {
  const [activeMode, setActiveMode] = useState('gulliver');
  const [visits, setVisits] = useState([]);
  const [rustedParts, setRustedParts] = useState(0);
  const [gulliverRewards, setGulliverRewards] = useState({});
  const [gullivarrRewards, setGullivarrRewards] = useState({});
  const [loading, setLoading] = useState(true);
  const [newReward, setNewReward] = useState('');
  const [newDate, setNewDate] = useState('');

  const GULLIVER_REWARDS = [
    'Pagoda', 'Pyramid', 'Sphinx', 'Stonehenge', 'Statue of Liberty',
    'Tower of Pisa', 'Moai Statue', 'Dala Horse', 'Hula Doll', 'Lucky Cat',
    'Nutcracker', 'Katana', 'Tubeteika', 'Silk Hat', 'Sombrero', 'Tam-o\'-Shanter',
    'Turban', 'Veil', 'Pigtail', 'Geisha Wig', 'Kaffiyeh', 'Milkmaid Hat',
    'Elder Mask', 'Alpinist Hat', 'Ancient Administrator Hat', 'Candy-Skull Mask',
    'Coin Headpiece'
  ];

  const GULLIVARRR_REWARDS = [
    'Pirate Treasure Chest', 'Pirate Barrel', 'Pirate Ship Cannon', 'Pirate Ship Helm',
    'Sideways Pirate Barrel', 'Pirate Wall', 'Pirate Flooring', 'Pirate Rug',
    'Pirate Treasure Crown', 'Pirate Treasure Robe', 'Pirate Outfit (Blue)', 'Pirate Outfit (Red)',
    'Pirate Coat (Blue)', 'Pirate Coat (Red)', 'Pirate Dress (Blue)', 'Pirate Dress (Red)',
    'Pirate Pants', 'Pirate Boots', 'Pirate Bandanna (Blue)', 'Pirate Bandanna (Red)',
    'Pirate Eye Patch', 'Sea Captain\'s Coat (Blue)', 'Sea Captain\'s Coat (Red)'
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get('gulliverTracker');
        if (result) {
          const data = JSON.parse(result.value);
          setVisits(data.visits || []);
          setRustedParts(data.rustedParts || 0);
          setGulliverRewards(data.gulliverRewards || {});
          setGullivarrRewards(data.gullivarrRewards || {});
        }
      } catch (error) {
        console.error('Error loading tracker data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const saveData = async (newVisits, newRusted, newGull, newGullArr) => {
    try {
      await window.storage.set('gulliverTracker', JSON.stringify({
        visits: newVisits,
        rustedParts: newRusted,
        gulliverRewards: newGull,
        gullivarrRewards: newGullArr
      }));
    } catch (error) {
      console.error('Error saving tracker data:', error);
    }
  };

  const addVisit = () => {
    if (!newDate || !newReward) return;
    const updatedVisits = [...visits, { date: newDate, mode: activeMode, reward: newReward }];
    setVisits(updatedVisits);

    if (activeMode === 'gulliver') {
      const updated = { ...gulliverRewards, [newReward]: true };
      setGulliverRewards(updated);
      saveData(updatedVisits, rustedParts, updated, gullivarrRewards);
    } else {
      const updated = { ...gullivarrRewards, [newReward]: true };
      setGullivarrRewards(updated);
      saveData(updatedVisits, rustedParts, gulliverRewards, updated);
    }

    setNewReward('');
    setNewDate('');
  };

  const addRustedPart = () => {
    if (rustedParts < 30) {
      const newRusted = rustedParts + 1;
      setRustedParts(newRusted);
      saveData(visits, newRusted, gulliverRewards, gullivarrRewards);
    }
  };

  const removeRustedPart = () => {
    if (rustedParts > 0) {
      const newRusted = rustedParts - 1;
      setRustedParts(newRusted);
      saveData(visits, newRusted, gulliverRewards, gullivarrRewards);
    }
  };

  const toggleReward = (reward) => {
    if (activeMode === 'gulliver') {
      const updated = { ...gulliverRewards, [reward]: !gulliverRewards[reward] };
      setGulliverRewards(updated);
      saveData(visits, rustedParts, updated, gullivarrRewards);
    } else {
      const updated = { ...gullivarrRewards, [reward]: !gullivarrRewards[reward] };
      setGullivarrRewards(updated);
      saveData(visits, rustedParts, gulliverRewards, updated);
    }
  };

  const deleteVisit = (index) => {
    const updatedVisits = visits.filter((_, i) => i !== index);
    setVisits(updatedVisits);
    saveData(updatedVisits, rustedParts, gulliverRewards, gullivarrRewards);
  };

  const currentRewards = activeMode === 'gulliver' ? gulliverRewards : gullivarrRewards;
  const currentRewardList = activeMode === 'gulliver' ? GULLIVER_REWARDS : GULLIVARRR_REWARDS;
  const totalRewards = Object.values(currentRewards).filter(Boolean).length;
  const rewardPercentage = Math.round((totalRewards / currentRewardList.length) * 100);
  const visitCount = visits.filter(v => v.mode === activeMode).length;

  if (loading) {
    return <div style={{ padding: '20px', color: '#5ec850' }}>Loading...</div>;
  }

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
          * { box-sizing: border-box; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}
      </style>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={{ ...styles.title, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <AssetImg category="npcs" name="Gulliver" size={32} /> Gulliver Tracker 🏴‍☠️
          </h1>
          <p style={styles.subtitle}>Track visits and collect all rewards</p>
        </div>

        <div style={styles.tabContainer}>
          <button
            onClick={() => setActiveMode('gulliver')}
            style={{
              ...styles.tab,
              ...(activeMode === 'gulliver' ? styles.tabActive : styles.tabInactive)
            }}
          >
            <AssetImg category="npcs" name="Gulliver" size={32} /> Gulliver (Sailor)
          </button>
          <button
            onClick={() => setActiveMode('gullivarrr')}
            style={{
              ...styles.tab,
              ...(activeMode === 'gullivarrr' ? styles.tabActive : styles.tabInactive)
            }}
          >
            🏴‍☠️ Gullivarrr (Pirate)
          </button>
        </div>

        {activeMode === 'gulliver' && (
          <div style={styles.rustContainer}>
            <h2 style={styles.sectionTitle}>⚙️ Rusted Parts Collection</h2>
            <p style={styles.rustDescription}>Needed for Robot Hero DIY (30 total)</p>
            <div style={styles.progressBarContainer}>
              <div style={{
                ...styles.progressBar,
                width: `${(rustedParts / 30) * 100}%`
              }} />
            </div>
            <div style={styles.rustStats}>
              <span style={styles.rustCount}>{rustedParts}/30</span>
              <div style={styles.rustButtons}>
                <button onClick={addRustedPart} style={styles.addButton}>+</button>
                <button onClick={removeRustedPart} style={styles.removeButton}>−</button>
              </div>
            </div>
          </div>
        )}

        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Visits</div>
            <div style={styles.statValue}>{visitCount}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Rewards</div>
            <div style={styles.statValue}>{totalRewards}/{currentRewardList.length}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Progress</div>
            <div style={styles.statValue}>{rewardPercentage}%</div>
          </div>
        </div>

        <div style={styles.logSection}>
          <h2 style={styles.sectionTitle}>📋 Log Visit</h2>
          <div style={styles.formGroup}>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              style={styles.input}
            />
            <select
              value={newReward}
              onChange={(e) => setNewReward(e.target.value)}
              style={styles.select}
            >
              <option value="">Select Reward...</option>
              {currentRewardList.map(reward => (
                <option key={reward} value={reward}>{reward}</option>
              ))}
            </select>
            <button
              onClick={addVisit}
              disabled={!newDate || !newReward}
              style={{
                ...styles.addVisitButton,
                ...((!newDate || !newReward) ? styles.disabledButton : {})
              }}
            >
              Log Visit
            </button>
          </div>
        </div>

        <div style={styles.rewardChecklist}>
          <h2 style={styles.sectionTitle}>🎁 Reward Checklist</h2>
          <div style={styles.checklistGrid}>
            {currentRewardList.map(reward => (
              <button
                key={reward}
                onClick={() => toggleReward(reward)}
                style={{
                  ...styles.checklistItem,
                  ...(currentRewards[reward] ? styles.checklistItemChecked : {})
                }}
              >
                <span style={styles.checkbox}>
                  {currentRewards[reward] ? '✓' : '○'}
                </span>
                <span>{reward}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.visitLog}>
          <h2 style={styles.sectionTitle}>📅 Visit History</h2>
          {visits.filter(v => v.mode === activeMode).length === 0 ? (
            <p style={styles.emptyMessage}>No visits logged yet</p>
          ) : (
            <div style={styles.visitList}>
              {visits.filter(v => v.mode === activeMode).map((visit, idx) => (
                <div key={idx} style={styles.visitItem}>
                  <div style={styles.visitContent}>
                    <div style={styles.visitDate}>{visit.date}</div>
                    <div style={styles.visitReward}>{visit.reward}</div>
                  </div>
                  <button
                    onClick={() => {
                      const visitIdx = visits.indexOf(visit);
                      deleteVisit(visitIdx);
                    }}
                    style={styles.deleteButton}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    width: '100%',
    margin: '0 auto',
    backgroundColor: '#0a1a10',
    color: '#c8e6c0',
    padding: '24px',
    borderRadius: '8px',
    fontFamily: '"DM Sans", sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
    animation: 'fadeIn 0.6s ease-in',
  },
  title: {
    fontFamily: '"Playfair Display", serif',
    fontSize: '36px',
    fontWeight: 700,
    color: '#5ec850',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#5a7a50',
    margin: 0,
    fontWeight: 400,
  },
  tabContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    borderBottom: '1px solid rgba(94, 200, 80, 0.2)',
    paddingBottom: '12px',
  },
  tab: {
    padding: '10px 20px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#5a7a50',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    fontFamily: '"DM Sans", sans-serif',
    transition: 'all 0.3s ease',
  },
  tabActive: {
    color: '#5ec850',
    borderBottom: '2px solid #5ec850',
  },
  tabInactive: {
    borderBottom: '1px solid transparent',
  },
  rustContainer: {
    backgroundColor: 'rgba(12,28,14,0.95)',
    padding: '16px',
    borderRadius: '6px',
    border: '1px solid rgba(94, 200, 80, 0.2)',
    marginBottom: '20px',
  },
  rustDescription: {
    fontSize: '12px',
    color: '#5a7a50',
    margin: '0 0 12px 0',
  },
  progressBarContainer: {
    height: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '12px',
    border: '1px solid rgba(94, 200, 80, 0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#5ec850',
    transition: 'width 0.3s ease',
  },
  rustStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rustCount: {
    fontFamily: '"DM Mono", monospace',
    fontSize: '16px',
    fontWeight: 700,
    color: '#d4b030',
  },
  rustButtons: {
    display: 'flex',
    gap: '8px',
  },
  addButton: {
    padding: '6px 12px',
    backgroundColor: '#5ec850',
    color: '#0a1a10',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  removeButton: {
    padding: '6px 12px',
    backgroundColor: 'rgba(94, 200, 80, 0.3)',
    color: '#5ec850',
    border: '1px solid rgba(94, 200, 80, 0.5)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: 'rgba(12,28,14,0.95)',
    padding: '16px',
    borderRadius: '6px',
    border: '1px solid rgba(94, 200, 80, 0.2)',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  statLabel: {
    fontSize: '12px',
    color: '#5a7a50',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
  },
  statValue: {
    fontFamily: '"DM Mono", monospace',
    fontSize: '24px',
    fontWeight: 700,
    color: '#d4b030',
  },
  sectionTitle: {
    fontFamily: '"Playfair Display", serif',
    fontSize: '18px',
    fontWeight: 700,
    color: '#5ec850',
    margin: '0 0 12px 0',
  },
  logSection: {
    backgroundColor: 'rgba(12,28,14,0.95)',
    padding: '16px',
    borderRadius: '6px',
    border: '1px solid rgba(94, 200, 80, 0.2)',
    marginBottom: '24px',
  },
  formGroup: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(94, 200, 80, 0.3)',
    borderRadius: '4px',
    color: '#c8e6c0',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '13px',
  },
  select: {
    flex: 2,
    padding: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(94, 200, 80, 0.3)',
    borderRadius: '4px',
    color: '#c8e6c0',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '13px',
    cursor: 'pointer',
  },
  addVisitButton: {
    padding: '10px 16px',
    backgroundColor: '#5ec850',
    color: '#0a1a10',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '13px',
    fontFamily: '"DM Sans", sans-serif',
    transition: 'all 0.2s ease',
  },
  disabledButton: {
    backgroundColor: 'rgba(94, 200, 80, 0.3)',
    color: '#5a7a50',
    cursor: 'not-allowed',
  },
  rewardChecklist: {
    backgroundColor: 'rgba(12,28,14,0.95)',
    padding: '16px',
    borderRadius: '6px',
    border: '1px solid rgba(94, 200, 80, 0.2)',
    marginBottom: '24px',
  },
  checklistGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(94, 200, 80, 0.2)',
    borderRadius: '4px',
    color: '#c8e6c0',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '13px',
    fontFamily: '"DM Sans", sans-serif',
    transition: 'all 0.2s ease',
  },
  checklistItemChecked: {
    backgroundColor: 'rgba(94, 200, 80, 0.2)',
    borderColor: 'rgba(94, 200, 80, 0.5)',
    color: '#5ec850',
  },
  checkbox: {
    minWidth: '20px',
    textAlign: 'center',
    fontWeight: 700,
    fontSize: '14px',
  },
  visitLog: {
    backgroundColor: 'rgba(12,28,14,0.95)',
    padding: '16px',
    borderRadius: '6px',
    border: '1px solid rgba(94, 200, 80, 0.2)',
  },
  emptyMessage: {
    fontSize: '13px',
    color: '#5a7a50',
    textAlign: 'center',
    padding: '12px',
    margin: 0,
  },
  visitList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  visitItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '4px',
    border: '1px solid rgba(94, 200, 80, 0.15)',
    transition: 'all 0.2s ease',
  },
  visitContent: {
    flex: 1,
  },
  visitDate: {
    fontFamily: '"DM Mono", monospace',
    fontSize: '12px',
    color: '#4aacf0',
    fontWeight: 700,
  },
  visitReward: {
    fontSize: '13px',
    color: '#c8e6c0',
    marginTop: '4px',
  },
  deleteButton: {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    color: '#5a7a50',
    border: '1px solid rgba(94, 200, 80, 0.2)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s ease',
  },
};

export default GulliverTracker;
