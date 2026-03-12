import React, { useState, useEffect } from 'react';

const SeasonalEventCalendar = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [hemisphere, setHemisphere] = useState('northern');
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [completedEvents, setCompletedEvents] = useState({});
  const [npcVisitLog, setNpcVisitLog] = useState({});
  const currentDate = new Date();

  // Load persisted data
  useEffect(() => {
    const loadData = async () => {
      try {
        const eventData = await window.storage.get('eventCalendar');
        if (eventData) setCompletedEvents(JSON.parse(eventData.value));

        const npcData = await window.storage.get('npcVisitLog');
        if (npcData) setNpcVisitLog(JSON.parse(npcData.value));
      } catch (e) {
        console.log('Storage not available, using defaults');
      }
    };
    loadData();
  }, []);

  // Save data
  const saveEventData = async (data) => {
    setCompletedEvents(data);
    try {
      await window.storage.set('eventCalendar', JSON.stringify(data));
    } catch (e) {
      console.log('Could not save to storage');
    }
  };

  const saveNpcData = async (data) => {
    setNpcVisitLog(data);
    try {
      await window.storage.set('npcVisitLog', JSON.stringify(data));
    } catch (e) {
      console.log('Could not save to storage');
    }
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // ACNH Event Data
  const monthlyEvents = {
    january: [
      { name: "New Year's Day", emoji: '🎉', dateRange: 'Jan 1', type: 'holiday' },
      { name: 'Fishing Tourney', emoji: '🎣', dateRange: '2nd Saturday', type: 'tournament' },
    ],
    february: [
      { name: 'Setsubun', emoji: '👹', dateRange: 'Feb 1-3', type: 'holiday' },
      { name: 'Groundhog Day', emoji: '🦡', dateRange: 'Feb 2', type: 'holiday' },
      { name: 'Festivale', emoji: '🎭', dateRange: 'Feb (varies)', type: 'festival' },
      { name: "Valentine's Day", emoji: '💝', dateRange: 'Feb 14', type: 'holiday' },
    ],
    march: [
      { name: 'Shamrock Day', emoji: '☘️', dateRange: 'Mar 10-17', type: 'holiday' },
    ],
    april: [
      { name: 'Bunny Day (Easter)', emoji: '🐰', dateRange: 'Easter Sunday', type: 'festival' },
      { name: 'Fishing Tourney', emoji: '🎣', dateRange: '2nd Saturday', type: 'tournament' },
      { name: 'Nature Day', emoji: '🌍', dateRange: 'Apr 15-22', type: 'celebration' },
    ],
    may: [
      { name: 'May Day Event', emoji: '🌸', dateRange: 'Apr 29 - May 7', type: 'festival' },
      { name: 'Museum Day', emoji: '🏛️', dateRange: 'May 18-31', type: 'celebration' },
    ],
    june: [
      { name: 'Wedding Season', emoji: '💒', dateRange: 'Entire month', type: 'season' },
      { name: 'Bug-Off', emoji: '🦗', dateRange: '4th Saturday', type: 'tournament' },
    ],
    july: [
      { name: 'Tanabata Festival', emoji: '⭐', dateRange: 'Jul 7', type: 'festival' },
      { name: 'Fishing Tourney', emoji: '🎣', dateRange: '2nd Saturday', type: 'tournament' },
      { name: 'Bug-Off', emoji: '🦗', dateRange: '4th Saturday', type: 'tournament' },
    ],
    august: [
      { name: 'Fishing Tourney', emoji: '🎣', dateRange: '2nd Saturday', type: 'tournament' },
      { name: 'Fireworks Show', emoji: '🎆', dateRange: 'Every Sunday', type: 'celebration' },
      { name: 'Bug-Off', emoji: '🦗', dateRange: '4th Saturday', type: 'tournament' },
    ],
    september: [
      { name: 'Bug-Off (Final)', emoji: '🦗', dateRange: '4th Saturday', type: 'tournament' },
    ],
    october: [
      { name: 'Fishing Tourney', emoji: '🎣', dateRange: '2nd Saturday', type: 'tournament' },
      { name: 'Halloween', emoji: '👻', dateRange: 'Oct 31', type: 'holiday' },
    ],
    november: [
      { name: 'Turkey Day', emoji: '🦃', dateRange: '4th Thursday', type: 'holiday' },
    ],
    december: [
      { name: 'Toy Day', emoji: '🎁', dateRange: 'Dec 24', type: 'holiday' },
      { name: "New Year's Countdown", emoji: '🎊', dateRange: 'Dec 31', type: 'holiday' },
    ],
  };

  const seasonalMaterials = {
    northern: [
      { name: 'Cherry Blossoms', emoji: '🌸', available: 'Apr 1-10', type: 'spring' },
      { name: 'Young Spring Bamboo', emoji: '🎋', available: 'Feb 25 - May 31', type: 'spring' },
      { name: 'Summer Shells', emoji: '🐚', available: 'Jun 1 - Aug 31', type: 'summer' },
      { name: 'Acorns & Pine Cones', emoji: '🍂', available: 'Sep 1 - Dec 10', type: 'autumn' },
      { name: 'Maple Leaves', emoji: '🍁', available: 'Nov 16-25', type: 'autumn' },
      { name: 'Mushrooms', emoji: '🍄', available: 'Nov 1-30', type: 'autumn' },
      { name: 'Snowflakes', emoji: '❄️', available: 'Dec 11 - Feb 24', type: 'winter' },
      { name: 'Holiday Ornaments', emoji: '🎀', available: 'Dec 15 - Jan 6', type: 'winter' },
    ],
    southern: [
      { name: 'Cherry Blossoms', emoji: '🌸', available: 'Oct 1-10', type: 'spring' },
      { name: 'Young Spring Bamboo', emoji: '🎋', available: 'Aug 25 - Nov 30', type: 'spring' },
      { name: 'Summer Shells', emoji: '🐚', available: 'Dec 1 - Feb 28', type: 'summer' },
      { name: 'Acorns & Pine Cones', emoji: '🍂', available: 'Mar 1 - Jun 10', type: 'autumn' },
      { name: 'Maple Leaves', emoji: '🍁', available: 'May 16-25', type: 'autumn' },
      { name: 'Mushrooms', emoji: '🍄', available: 'May 1-31', type: 'autumn' },
      { name: 'Snowflakes', emoji: '❄️', available: 'Jun 11 - Aug 24', type: 'winter' },
      { name: 'Holiday Ornaments', emoji: '🎀', available: 'Jun 15 - Jul 6', type: 'winter' },
    ],
  };

  const npcVisitors = [
    { name: 'Kicks', emoji: '👟', offers: 'Shoes & bags', frequency: 'Random weekly' },
    { name: 'Label', emoji: '📋', offers: 'Fashion items', frequency: 'Random weekly' },
    { name: 'Saharah', emoji: '🏜️', offers: 'Rugs & flooring', frequency: 'Random weekly' },
    { name: 'Leif', emoji: '🌿', offers: 'Shrubs & flowers', frequency: 'Random weekly' },
    { name: 'Redd', emoji: '🎨', offers: 'Artwork (some fake)', frequency: 'Random weekly' },
    { name: 'Flick', emoji: '🦗', offers: 'Bug models', frequency: 'Random weekly' },
    { name: 'C.J.', emoji: '🐟', offers: 'Fish models', frequency: 'Random weekly' },
    { name: 'Gulliver', emoji: '⚓', offers: 'Souvenirs', frequency: 'Random weekly' },
    { name: 'Gullivarrr', emoji: '🏴‍☠️', offers: 'Pirate items', frequency: 'Random weekly' },
    { name: 'Wisp', emoji: '👻', offers: 'Spooky items', frequency: 'Random' },
    { name: 'Celeste', emoji: '🔭', offers: 'Star fragments', frequency: 'New moon nights' },
    { name: 'K.K. Slider', emoji: '🎸', offers: 'Music', frequency: 'Saturdays' },
  ];

  const styles = {
    container: {
      width: '100%',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#0a1a10',
      borderRadius: '12px',
      color: '#c8e6c0',
      fontFamily: '"DM Sans", sans-serif',
    },
    header: {
      fontFamily: '"Playfair Display", serif',
      fontSize: '28px',
      marginBottom: '20px',
      color: '#5ec850',
      textAlign: 'center',
    },
    tabContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: '1px solid rgba(94, 200, 80, 0.2)',
    },
    tab: (isActive) => ({
      padding: '10px 16px',
      backgroundColor: isActive ? 'rgba(94, 200, 80, 0.15)' : 'transparent',
      border: 'none',
      borderBottom: isActive ? '2px solid #5ec850' : '2px solid transparent',
      color: isActive ? '#5ec850' : '#5a7a50',
      cursor: 'pointer',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '14px',
      fontWeight: 500,
      transition: 'all 0.3s ease',
    }),
    controlsRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      padding: '12px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '8px',
    },
    selectInput: {
      padding: '8px 12px',
      backgroundColor: 'rgba(94, 200, 80, 0.1)',
      border: '1px solid rgba(94, 200, 80, 0.3)',
      color: '#5ec850',
      borderRadius: '6px',
      fontFamily: '"DM Sans", sans-serif',
      cursor: 'pointer',
    },
    monthGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
    },
    monthCard: (isExpanded, isCurrentMonth) => ({
      padding: '16px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: `1px solid ${isCurrentMonth ? '#5ec850' : 'rgba(94, 200, 80, 0.2)'}`,
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: isCurrentMonth ? '0 0 12px rgba(94, 200, 80, 0.2)' : 'none',
    }),
    monthTitle: {
      fontFamily: '"Playfair Display", serif',
      fontSize: '16px',
      fontWeight: 700,
      marginBottom: '8px',
      color: '#5ec850',
    },
    eventItem: (completed) => ({
      padding: '8px',
      marginBottom: '6px',
      backgroundColor: completed ? 'rgba(94, 200, 80, 0.1)' : 'rgba(212, 176, 48, 0.05)',
      border: `1px solid ${completed ? 'rgba(94, 200, 80, 0.3)' : 'rgba(212, 176, 48, 0.2)'}`,
      borderRadius: '6px',
      fontSize: '12px',
      textDecoration: completed ? 'line-through' : 'none',
      color: completed ? '#5ec850' : '#c8e6c0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
    }),
    checkbox: {
      cursor: 'pointer',
      width: '16px',
      height: '16px',
      accentColor: '#5ec850',
    },
    seasonGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
    },
    seasonCard: {
      padding: '14px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '8px',
    },
    materialName: {
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '13px',
      fontWeight: 500,
      marginBottom: '4px',
      color: '#d4b030',
    },
    availableText: {
      fontSize: '11px',
      color: '#5a7a50',
      fontFamily: '"DM Mono", monospace',
    },
    npcList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
    },
    npcCard: {
      padding: '12px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(74, 172, 240, 0.2)',
      borderRadius: '8px',
    },
    npcName: {
      fontSize: '13px',
      fontWeight: 600,
      color: '#4aacf0',
      marginBottom: '4px',
    },
    npcDetail: {
      fontSize: '11px',
      color: '#5a7a50',
      lineHeight: '1.4',
    },
    statsContainer: {
      padding: '12px',
      backgroundColor: 'rgba(212, 176, 48, 0.08)',
      border: '1px solid rgba(212, 176, 48, 0.2)',
      borderRadius: '8px',
      fontSize: '12px',
      marginTop: '16px',
      color: '#d4b030',
      fontFamily: '"DM Mono", monospace',
    },
  };

  const getMonthName = (monthKey) => {
    const names = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return names[Object.keys(monthlyEvents).indexOf(monthKey)];
  };

  const toggleEventCompleted = (monthKey, eventName) => {
    const key = `${currentYear}-${monthKey}-${eventName}`;
    const newCompleted = { ...completedEvents };
    newCompleted[key] = !newCompleted[key];
    saveEventData(newCompleted);
  };

  const getCompletedCount = () => {
    return Object.values(completedEvents).filter(v => v === true).length;
  };

  const getSeasonForMonth = (monthIndex) => {
    if (hemisphere === 'northern') {
      if ([11, 0, 1].includes(monthIndex)) return 'winter';
      if ([2, 3, 4].includes(monthIndex)) return 'spring';
      if ([5, 6, 7].includes(monthIndex)) return 'summer';
      return 'autumn';
    } else {
      if ([11, 0, 1].includes(monthIndex)) return 'summer';
      if ([2, 3, 4].includes(monthIndex)) return 'autumn';
      if ([5, 6, 7].includes(monthIndex)) return 'winter';
      return 'spring';
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <h1 style={styles.header}>🌙 Seasonal Event Calendar</h1>

      <div style={styles.tabContainer}>
        {['calendar', 'seasons', 'npc'].map(t => (
          <button
            key={t}
            style={styles.tab(activeTab === t)}
            onClick={() => setActiveTab(t)}
          >
            {t === 'calendar' && 'Calendar'}
            {t === 'seasons' && 'Seasons'}
            {t === 'npc' && 'NPC Schedule'}
          </button>
        ))}
      </div>

      {activeTab === 'calendar' && (
        <div>
          <div style={styles.controlsRow}>
            <label style={{ fontWeight: 500 }}>
              Hemisphere:
              <select
                style={{ ...styles.selectInput, marginLeft: '8px' }}
                value={hemisphere}
                onChange={(e) => setHemisphere(e.target.value)}
              >
                <option value="northern">Northern</option>
                <option value="southern">Southern</option>
              </select>
            </label>
          </div>

          <div style={styles.monthGrid}>
            {Object.entries(monthlyEvents).map(([monthKey, events], idx) => {
              const isExpanded = expandedMonth === monthKey;
              const isCurrentMonth = idx === currentMonth;
              return (
                <div
                  key={monthKey}
                  style={styles.monthCard(isExpanded, isCurrentMonth)}
                  onClick={() => setExpandedMonth(isExpanded ? null : monthKey)}
                >
                  <div style={styles.monthTitle}>
                    {getMonthName(monthKey)}
                  </div>
                  {isExpanded ? (
                    <div>
                      {events.map((event, eidx) => {
                        const eventKey = `${currentYear}-${monthKey}-${event.name}`;
                        const isCompleted = completedEvents[eventKey];
                        return (
                          <label key={eidx} style={styles.eventItem(isCompleted)}>
                            <input
                              type="checkbox"
                              style={styles.checkbox}
                              checked={isCompleted || false}
                              onChange={() => toggleEventCompleted(monthKey, event.name)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span>{event.emoji}</span>
                            <div>
                              <div style={{ fontWeight: 500 }}>{event.name}</div>
                              <div style={{ fontSize: '10px', color: '#90a890' }}>{event.dateRange}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: '#5a7a50' }}>
                      {events.length} event{events.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={styles.statsContainer}>
            📊 Events completed this year: {getCompletedCount()} / {Object.values(monthlyEvents).flat().length}
          </div>
        </div>
      )}

      {activeTab === 'seasons' && (
        <div>
          <div style={styles.controlsRow}>
            <div style={{ fontWeight: 500, color: '#5ec850' }}>
              {hemisphere === 'northern' ? 'Northern' : 'Southern'} Hemisphere - Current Season: <span style={{ textTransform: 'capitalize', color: '#d4b030' }}>{getSeasonForMonth(currentMonth)}</span>
            </div>
          </div>

          <div style={styles.seasonGrid}>
            {seasonalMaterials[hemisphere].map((material, idx) => (
              <div key={idx} style={styles.seasonCard}>
                <div style={styles.materialName}>
                  {material.emoji} {material.name}
                </div>
                <div style={styles.availableText}>
                  Available: {material.available}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.statsContainer}>
            💡 Seasonal materials appear in balloons (furniture from DIY recipes) and on the ground. Plan your balloon hunting accordingly!
          </div>
        </div>
      )}

      {activeTab === 'npc' && (
        <div>
          <div style={styles.controlsRow}>
            <label style={{ fontWeight: 500 }}>
              Log NPC visit date:
              <input
                type="date"
                style={{ ...styles.selectInput, marginLeft: '8px', width: '150px' }}
                defaultValue={currentDate.toISOString().split('T')[0]}
              />
            </label>
          </div>

          <div style={styles.npcList}>
            {npcVisitors.map((npc, idx) => (
              <div key={idx} style={styles.npcCard}>
                <div style={styles.npcName}>{npc.emoji} {npc.name}</div>
                <div style={styles.npcDetail}>
                  <div>📦 {npc.offers}</div>
                  <div style={{ marginTop: '4px' }}>🔄 {npc.frequency}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.statsContainer}>
            📝 Tip: Random visitors rotate weekly! Check back daily to find new NPCs and their special items.
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonalEventCalendar;
