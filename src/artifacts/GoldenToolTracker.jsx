import React, { useState, useEffect } from 'react';

const GoldenToolTracker = () => {
  const [toolsData, setToolsData] = useState({
    fishingRod: { caught: 0, target: 80 },
    net: { caught: 0, target: 80 },
    axe: { broken: 0, target: 100 },
    slingshot: { shot: 0, target: 300 },
    wateringCan: { fiveStar: false },
    shovel: { helped: 0, target: 30 },
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get('acnh-golden-tools');
        if (result) {
          const data = JSON.parse(result.value);
          setToolsData(data);
        }
      } catch (error) {
        console.error('Error loading tools data:', error);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const saveData = async (newData) => {
    setToolsData(newData);
    try {
      await window.storage.set('acnh-golden-tools', JSON.stringify(newData));
    } catch (error) {
      console.error('Error saving tools data:', error);
    }
  };

  const updateTool = (toolKey, field, value) => {
    const newData = { ...toolsData };
    newData[toolKey][field] = value;
    saveData(newData);
  };

  const incrementCounter = (toolKey, field, max) => {
    const current = toolsData[toolKey][field];
    if (current < max) {
      updateTool(toolKey, field, current + 1);
    }
  };

  const decrementCounter = (toolKey, field) => {
    const current = toolsData[toolKey][field];
    if (current > 0) {
      updateTool(toolKey, field, current - 1);
    }
  };

  const toggleCheckbox = (toolKey, field) => {
    const current = toolsData[toolKey][field];
    updateTool(toolKey, field, !current);
  };

  const getUnlockedCount = () => {
    let count = 0;
    if (toolsData.fishingRod.caught >= 80) count++;
    if (toolsData.net.caught >= 80) count++;
    if (toolsData.axe.broken >= 100) count++;
    if (toolsData.slingshot.shot >= 300) count++;
    if (toolsData.wateringCan.fiveStar) count++;
    if (toolsData.shovel.helped >= 30) count++;
    return count;
  };

  const getProgressPercent = (current, target) => {
    return Math.min(100, Math.round((current / target) * 100));
  };

  if (isLoading) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#5ec850', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  const unlockedCount = getUnlockedCount();

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <span style={styles.titleText}>Golden Tool Tracker</span>
          <span style={styles.sparkles}>✨</span>
        </div>
        <div style={styles.progressSummary}>
          <div style={styles.progressText}>{unlockedCount}/6 Unlocked</div>
          <div style={styles.overallProgressBar}>
            <div
              style={{
                ...styles.overallProgressFill,
                width: `${(unlockedCount / 6) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div style={styles.toolsGrid}>
        {/* Golden Fishing Rod */}
        <ToolCard
          emoji="🎣"
          name="Golden Fishing Rod"
          requirement="Catch all 80 fish"
          isUnlocked={toolsData.fishingRod.caught >= 80}
          progressPercent={getProgressPercent(toolsData.fishingRod.caught, 80)}
        >
          <div style={styles.counterSection}>
            <div style={styles.counterDisplay}>
              {toolsData.fishingRod.caught} / 80 Fish
            </div>
            <div style={styles.counterButtons}>
              <button
                style={{...styles.button, ...styles.minusButton}}
                onClick={() => decrementCounter('fishingRod', 'caught')}
              >
                −
              </button>
              <input
                type="number"
                min="0"
                max="80"
                value={toolsData.fishingRod.caught}
                onChange={(e) => updateTool('fishingRod', 'caught', Math.min(80, Math.max(0, parseInt(e.target.value) || 0)))}
                style={styles.numberInput}
              />
              <button
                style={{...styles.button, ...styles.plusButton}}
                onClick={() => incrementCounter('fishingRod', 'caught', 80)}
              >
                +
              </button>
            </div>
          </div>
        </ToolCard>

        {/* Golden Net */}
        <ToolCard
          emoji="🦋"
          name="Golden Net"
          requirement="Catch all 80 bugs"
          isUnlocked={toolsData.net.caught >= 80}
          progressPercent={getProgressPercent(toolsData.net.caught, 80)}
        >
          <div style={styles.counterSection}>
            <div style={styles.counterDisplay}>
              {toolsData.net.caught} / 80 Bugs
            </div>
            <div style={styles.counterButtons}>
              <button
                style={{...styles.button, ...styles.minusButton}}
                onClick={() => decrementCounter('net', 'caught')}
              >
                −
              </button>
              <input
                type="number"
                min="0"
                max="80"
                value={toolsData.net.caught}
                onChange={(e) => updateTool('net', 'caught', Math.min(80, Math.max(0, parseInt(e.target.value) || 0)))}
                style={styles.numberInput}
              />
              <button
                style={{...styles.button, ...styles.plusButton}}
                onClick={() => incrementCounter('net', 'caught', 80)}
              >
                +
              </button>
            </div>
          </div>
        </ToolCard>

        {/* Golden Axe */}
        <ToolCard
          emoji="🪓"
          name="Golden Axe"
          requirement="Break 100 axes"
          isUnlocked={toolsData.axe.broken >= 100}
          progressPercent={getProgressPercent(toolsData.axe.broken, 100)}
        >
          <div style={styles.counterSection}>
            <div style={styles.counterDisplay}>
              {toolsData.axe.broken} / 100 Axes Broken
            </div>
            <div style={styles.counterButtons}>
              <button
                style={{...styles.button, ...styles.minusButton}}
                onClick={() => decrementCounter('axe', 'broken')}
              >
                −
              </button>
              <input
                type="number"
                min="0"
                max="100"
                value={toolsData.axe.broken}
                onChange={(e) => updateTool('axe', 'broken', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                style={styles.numberInput}
              />
              <button
                style={{...styles.button, ...styles.plusButton}}
                onClick={() => incrementCounter('axe', 'broken', 100)}
              >
                +
              </button>
            </div>
          </div>
        </ToolCard>

        {/* Golden Slingshot */}
        <ToolCard
          emoji="🏹"
          name="Golden Slingshot"
          requirement="Shoot down 300 balloons"
          isUnlocked={toolsData.slingshot.shot >= 300}
          progressPercent={getProgressPercent(toolsData.slingshot.shot, 300)}
        >
          <div style={styles.counterSection}>
            <div style={styles.counterDisplay}>
              {toolsData.slingshot.shot} / 300 Balloons
            </div>
            <div style={styles.counterButtons}>
              <button
                style={{...styles.button, ...styles.minusButton}}
                onClick={() => decrementCounter('slingshot', 'shot')}
              >
                −
              </button>
              <input
                type="number"
                min="0"
                max="300"
                value={toolsData.slingshot.shot}
                onChange={(e) => updateTool('slingshot', 'shot', Math.min(300, Math.max(0, parseInt(e.target.value) || 0)))}
                style={styles.numberInput}
              />
              <button
                style={{...styles.button, ...styles.plusButton}}
                onClick={() => incrementCounter('slingshot', 'shot', 300)}
              >
                +
              </button>
            </div>
          </div>
        </ToolCard>

        {/* Golden Watering Can */}
        <ToolCard
          emoji="💧"
          name="Golden Watering Can"
          requirement="Achieve 5-star island rating"
          isUnlocked={toolsData.wateringCan.fiveStar}
          progressPercent={toolsData.wateringCan.fiveStar ? 100 : 0}
        >
          <div style={styles.checkboxSection}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={toolsData.wateringCan.fiveStar}
                onChange={() => toggleCheckbox('wateringCan', 'fiveStar')}
                style={styles.checkboxInput}
              />
              <span style={styles.checkboxText}>5-Star Rating Achieved</span>
            </label>
          </div>
        </ToolCard>

        {/* Golden Shovel */}
        <ToolCard
          emoji="🛠️"
          name="Golden Shovel"
          requirement="Help Gulliver/Gullivarrr 30 times"
          isUnlocked={toolsData.shovel.helped >= 30}
          progressPercent={getProgressPercent(toolsData.shovel.helped, 30)}
        >
          <div style={styles.counterSection}>
            <div style={styles.counterDisplay}>
              {toolsData.shovel.helped} / 30 Times Helped
            </div>
            <div style={styles.counterButtons}>
              <button
                style={{...styles.button, ...styles.minusButton}}
                onClick={() => decrementCounter('shovel', 'helped')}
              >
                −
              </button>
              <input
                type="number"
                min="0"
                max="30"
                value={toolsData.shovel.helped}
                onChange={(e) => updateTool('shovel', 'helped', Math.min(30, Math.max(0, parseInt(e.target.value) || 0)))}
                style={styles.numberInput}
              />
              <button
                style={{...styles.button, ...styles.plusButton}}
                onClick={() => incrementCounter('shovel', 'helped', 30)}
              >
                +
              </button>
            </div>
          </div>
        </ToolCard>
      </div>

      {/* Tips Section */}
      <div style={styles.tipsSection}>
        <h3 style={styles.tipsTitle}>💡 Quick Tips</h3>
        <div style={styles.tipsList}>
          <div style={styles.tip}>
            <strong>🎣 Fishing:</strong> Fish spawn year-round. Check hourly availability in Critterpedia.
          </div>
          <div style={styles.tip}>
            <strong>🦋 Bugs:</strong> Some bugs only appear in specific seasons. Plan accordingly!
          </div>
          <div style={styles.tip}>
            <strong>🪓 Axes:</strong> Plant trees and farm them—break flimsy axes (1 point) or regular axes (1 point each).
          </div>
          <div style={styles.tip}>
            <strong>🏹 Balloons:</strong> Balloons spawn on your beach daily. Use loud music to track them easily.
          </div>
          <div style={styles.tip}>
            <strong>💧 Island Rating:</strong> Increase happiness with furniture, flowers, and minimal clutter. Check with Isabelle!
          </div>
          <div style={styles.tip}>
            <strong>🛠️ Gulliver:</strong> He washes ashore randomly. Help him wake up and find his communicator parts (5 items).
          </div>
        </div>
      </div>
    </div>
  );
};

const ToolCard = ({ emoji, name, requirement, isUnlocked, progressPercent, children }) => {
  const cardStyle = {
    ...styles.toolCard,
    border: isUnlocked
      ? '2px solid #d4b030'
      : '2px solid rgba(94, 200, 80, 0.2)',
    boxShadow: isUnlocked
      ? '0 0 20px rgba(212, 176, 48, 0.3), inset 0 0 20px rgba(212, 176, 48, 0.1)'
      : 'none',
  };

  return (
    <div style={cardStyle}>
      <div style={styles.emojiSection}>{emoji}</div>
      <h3 style={{
        ...styles.toolName,
        color: isUnlocked ? '#d4b030' : '#ffffff',
      }}>
        {name}
      </h3>
      <p style={styles.toolRequirement}>{requirement}</p>

      <div style={styles.progressBarContainer}>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progressPercent}%`,
              background: isUnlocked
                ? 'linear-gradient(90deg, #d4b030, #ffd966)'
                : 'linear-gradient(90deg, #5ec850, #7dd96f)',
            }}
          />
        </div>
        <span style={styles.progressLabel}>{progressPercent}%</span>
      </div>

      {children}

      {isUnlocked && (
        <div style={styles.unlockedBadge}>🏆 Unlocked!</div>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    backgroundColor: '#0a1a10',
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif",
    padding: '24px',
    boxSizing: 'border-box',
    borderRadius: '12px',
    maxHeight: '100vh',
    overflowY: 'auto',
  },
  header: {
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '2px solid rgba(94, 200, 80, 0.3)',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  titleText: {
    fontSize: '32px',
    fontFamily: "'Playfair Display', serif",
    fontWeight: '700',
    color: '#5ec850',
  },
  sparkles: {
    fontSize: '32px',
    animation: 'pulse 2s ease-in-out infinite',
  },
  progressSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  progressText: {
    fontSize: '14px',
    color: '#5ec850',
    fontWeight: '600',
    minWidth: '80px',
  },
  overallProgressBar: {
    flex: 1,
    height: '8px',
    backgroundColor: 'rgba(94, 200, 80, 0.2)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  overallProgressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #5ec850, #7dd96f)',
    transition: 'width 0.3s ease',
  },
  toolsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '32px',
  },
  toolCard: {
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    padding: '20px',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
  },
  emojiSection: {
    fontSize: '48px',
    textAlign: 'center',
    marginBottom: '12px',
    lineHeight: '1',
  },
  toolName: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    textAlign: 'center',
    fontFamily: "'Playfair Display', serif",
  },
  toolRequirement: {
    fontSize: '12px',
    color: '#5a7a50',
    margin: '0 0 16px 0',
    textAlign: 'center',
  },
  progressBarContainer: {
    marginBottom: '16px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: '6px',
    backgroundColor: 'rgba(94, 200, 80, 0.2)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  progressLabel: {
    fontSize: '12px',
    color: '#5ec850',
    fontWeight: '600',
    minWidth: '40px',
    textAlign: 'right',
  },
  counterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  counterDisplay: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#5ec850',
    textAlign: 'center',
  },
  counterButtons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'rgba(94, 200, 80, 0.2)',
    border: '1px solid #5ec850',
    color: '#5ec850',
    width: '36px',
    height: '36px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    fontFamily: "'DM Mono', monospace",
  },
  minusButton: {},
  plusButton: {},
  numberInput: {
    width: '80px',
    padding: '8px',
    backgroundColor: 'rgba(94, 200, 80, 0.1)',
    border: '1px solid #5ec850',
    color: '#5ec850',
    borderRadius: '4px',
    textAlign: 'center',
    fontFamily: "'DM Mono', monospace",
    fontSize: '14px',
  },
  checkboxSection: {
    padding: '12px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkboxInput: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#5ec850',
  },
  checkboxText: {
    fontSize: '14px',
    color: '#5ec850',
    fontWeight: '500',
  },
  unlockedBadge: {
    marginTop: '12px',
    padding: '8px',
    backgroundColor: 'rgba(212, 176, 48, 0.2)',
    border: '1px solid #d4b030',
    borderRadius: '4px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#d4b030',
  },
  tipsSection: {
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid rgba(94, 200, 80, 0.2)',
  },
  tipsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#5ec850',
    margin: '0 0 16px 0',
    fontFamily: "'Playfair Display', serif",
  },
  tipsList: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  tip: {
    fontSize: '12px',
    color: '#5a7a50',
    lineHeight: '1.6',
  },
};

export default GoldenToolTracker;
