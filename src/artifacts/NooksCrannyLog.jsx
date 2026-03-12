import React, { useState, useEffect } from 'react';

const NooksCrannyLog = () => {
  const STORAGE_KEY = 'acnh-nooks-cranny-log';
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [hotItem, setHotItem] = useState('');
  const [hotItemPrice, setHotItemPrice] = useState('');
  const [limitedItems, setLimitedItems] = useState([{ name: '', price: '', bought: false }]);
  const [wallpaper, setWallpaper] = useState('');
  const [flooring, setFlooring] = useState('');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('entry');

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        const data = result ? JSON.parse(result.value) : [];
        setEntries(data);
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    };
    loadData();
  }, []);

  const saveData = async (newEntries) => {
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(newEntries));
      setEntries(newEntries);
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  };

  const handleAddEntry = async () => {
    if (!hotItem.trim()) {
      alert('Please enter a hot item');
      return;
    }

    const validLimitedItems = limitedItems.filter(item => item.name.trim());
    const newEntry = {
      id: Date.now(),
      date: selectedDate,
      hotItem,
      hotItemPrice: parseInt(hotItemPrice) || 0,
      limitedItems: validLimitedItems,
      wallpaper,
      flooring,
      notes,
      timestamp: new Date().toISOString()
    };

    const existingIndex = entries.findIndex(e => e.date === selectedDate);
    let updated = [...entries];
    if (existingIndex >= 0) {
      updated[existingIndex] = newEntry;
    } else {
      updated.push(newEntry);
    }
    updated.sort((a, b) => new Date(b.date) - new Date(a.date));

    await saveData(updated);

    setHotItem('');
    setHotItemPrice('');
    setLimitedItems([{ name: '', price: '', bought: false }]);
    setWallpaper('');
    setFlooring('');
    setNotes('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleDeleteEntry = async (id) => {
    const updated = entries.filter(e => e.id !== id);
    await saveData(updated);
  };

  const handleLimitedItemChange = (index, field, value) => {
    const updated = [...limitedItems];
    updated[index][field] = value;
    setLimitedItems(updated);
  };

  const addLimitedItemSlot = () => {
    if (limitedItems.length < 5) {
      setLimitedItems([...limitedItems, { name: '', price: '', bought: false }]);
    }
  };

  const getHotItemStats = () => {
    const stats = {};
    entries.forEach(e => {
      stats[e.hotItem] = (stats[e.hotItem] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  };

  const getTotalBellsSpent = () => {
    return entries.reduce((sum, e) => {
      const limited = e.limitedItems.reduce((s, item) => s + (item.bought ? parseInt(item.price) || 0 : 0), 0);
      return sum + limited;
    }, 0);
  };

  const getConsecutiveDayStreak = () => {
    if (entries.length === 0) return 0;
    const sortedDates = entries.map(e => new Date(e.date)).sort((a, b) => b - a);
    let streak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const diff = (sortedDates[i] - sortedDates[i + 1]) / (1000 * 60 * 60 * 24);
      if (Math.round(diff) === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const groupEntriesByWeek = () => {
    const grouped = {};
    entries.forEach(e => {
      const date = new Date(e.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      if (!grouped[weekKey]) grouped[weekKey] = [];
      grouped[weekKey].push(e);
    });
    return grouped;
  };

  const containerStyle = {
    fontFamily: "'DM Sans', sans-serif",
    backgroundColor: '#0a1a10',
    color: '#c8e6c0',
    minHeight: '100vh',
    padding: '20px',
    width: '100%',
    margin: '0 auto'
  };

  const headerStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#5ec850'
  };

  const tabContainerStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '2px solid #5ec850'
  };

  const tabStyle = (isActive) => ({
    padding: '10px 20px',
    backgroundColor: isActive ? '#5ec850' : 'transparent',
    color: isActive ? '#0a1a10' : '#5ec850',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    borderRadius: '4px 4px 0 0'
  });

  const cardStyle = {
    backgroundColor: 'rgba(12,28,14,0.95)',
    borderLeft: '4px solid #5ec850',
    padding: '20px',
    marginBottom: '15px',
    borderRadius: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '12px',
    backgroundColor: 'rgba(94,200,80,0.1)',
    border: '1px solid #5ec850',
    borderRadius: '4px',
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    backgroundColor: '#5ec850',
    color: '#0a1a10',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    marginRight: '10px',
    marginBottom: '10px'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#4aacf0',
    marginRight: '5px'
  };

  const statBoxStyle = {
    backgroundColor: 'rgba(212,176,48,0.1)',
    border: '1px solid #d4b030',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '10px',
    textAlign: 'center'
  };

  const statValueStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#d4b030'
  };

  const statLabelStyle = {
    fontSize: '12px',
    color: '#5a7a50',
    marginTop: '5px'
  };

  const entriesByWeek = groupEntriesByWeek();
  const hotItemStats = getHotItemStats();

  return (
    <div style={containerStyle}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
          * { box-sizing: border-box; }
          input:focus, textarea:focus, select:focus { outline: none; box-shadow: 0 0 0 2px #5ec850; }
        `}
      </style>

      <div style={headerStyle}>Nook's Cranny Log 🏪</div>

      <div style={tabContainerStyle}>
        <button style={tabStyle(activeTab === 'entry')} onClick={() => setActiveTab('entry')}>
          Daily Entry
        </button>
        <button style={tabStyle(activeTab === 'history')} onClick={() => setActiveTab('history')}>
          History
        </button>
        <button style={tabStyle(activeTab === 'stats')} onClick={() => setActiveTab('stats')}>
          Stats & Tracker
        </button>
      </div>

      {activeTab === 'entry' && (
        <div>
          <div style={cardStyle}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#d4b030' }}>
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={cardStyle}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#d4b030' }}>
              Hot Item of the Day ⭐
            </label>
            <input
              type="text"
              placeholder="e.g., Lovely Sofa"
              value={hotItem}
              onChange={(e) => setHotItem(e.target.value)}
              style={inputStyle}
            />
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#d4b030' }}>
              Sell Price
            </label>
            <input
              type="number"
              placeholder="Sell price in bells"
              value={hotItemPrice}
              onChange={(e) => setHotItemPrice(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={cardStyle}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#d4b030' }}>
              Limited Items (up to 5) 🛍️
            </label>
            {limitedItems.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(94,200,80,0.2)' }}>
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => handleLimitedItemChange(idx, 'name', e.target.value)}
                  style={inputStyle}
                />
                <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => handleLimitedItemChange(idx, 'price', e.target.value)}
                    style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5a7a50', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={item.bought}
                      onChange={(e) => handleLimitedItemChange(idx, 'bought', e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    Bought
                  </label>
                </div>
              </div>
            ))}
            {limitedItems.length < 5 && (
              <button style={secondaryButtonStyle} onClick={addLimitedItemSlot}>
                + Add Item Slot
              </button>
            )}
          </div>

          <div style={cardStyle}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#d4b030' }}>
              Wallpaper of the Day
            </label>
            <input
              type="text"
              placeholder="e.g., Blue Illusion Wall"
              value={wallpaper}
              onChange={(e) => setWallpaper(e.target.value)}
              style={inputStyle}
            />
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#d4b030' }}>
              Flooring of the Day
            </label>
            <input
              type="text"
              placeholder="e.g., Wooden Mosaic Tile"
              value={flooring}
              onChange={(e) => setFlooring(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={cardStyle}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#d4b030' }}>
              Notes 📝
            </label>
            <textarea
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                ...inputStyle,
                minHeight: '80px',
                resize: 'vertical',
                fontFamily: "'DM Sans', sans-serif"
              }}
            />
          </div>

          <button style={buttonStyle} onClick={handleAddEntry}>
            Save Entry ✓
          </button>
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#d4b030', marginBottom: '15px' }}>📅 Log History (Grouped by Week)</h3>
            {Object.keys(entriesByWeek).length === 0 ? (
              <div style={cardStyle}>No entries yet. Start logging! 📋</div>
            ) : (
              Object.entries(entriesByWeek).map(([weekKey, weekEntries]) => (
                <div key={weekKey}>
                  <h4 style={{ color: '#5ec850', marginTop: '20px', marginBottom: '10px' }}>
                    Week of {new Date(weekKey).toLocaleDateString()}
                  </h4>
                  {weekEntries.map((entry) => (
                    <div key={entry.id} style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <span style={{ fontSize: '14px', color: '#d4b030', fontWeight: 'bold' }}>
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        <button
                          style={{
                            backgroundColor: '#ff6b6b',
                            color: 'white',
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          Delete
                        </button>
                      </div>

                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#5ec850', fontWeight: 'bold' }}>Hot Item:</span> {entry.hotItem} ({entry.hotItemPrice} bells)
                      </div>

                      {entry.wallpaper && (
                        <div style={{ marginBottom: '8px', color: '#5a7a50' }}>
                          <span style={{ color: '#5ec850', fontWeight: 'bold' }}>Wallpaper:</span> {entry.wallpaper}
                        </div>
                      )}

                      {entry.flooring && (
                        <div style={{ marginBottom: '8px', color: '#5a7a50' }}>
                          <span style={{ color: '#5ec850', fontWeight: 'bold' }}>Flooring:</span> {entry.flooring}
                        </div>
                      )}

                      {entry.limitedItems.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ color: '#5ec850', fontWeight: 'bold' }}>Limited Items:</span>
                          <ul style={{ margin: '8px 0 0 20px', color: '#5a7a50' }}>
                            {entry.limitedItems.map((item, idx) => (
                              <li key={idx}>
                                {item.name} - {item.price} bells {item.bought ? '✓' : ''}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {entry.notes && (
                        <div style={{ marginTop: '8px', color: '#5a7a50', fontStyle: 'italic' }}>
                          <span style={{ color: '#5ec850', fontWeight: 'bold' }}>Notes:</span> {entry.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div>
          <h3 style={{ color: '#d4b030', marginBottom: '15px' }}>📊 Statistics & Tracker</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
            <div style={statBoxStyle}>
              <div style={statValueStyle}>{getTotalBellsSpent().toLocaleString()}</div>
              <div style={statLabelStyle}>Total Bells Spent</div>
            </div>
            <div style={statBoxStyle}>
              <div style={statValueStyle}>{entries.length}</div>
              <div style={statLabelStyle}>Days Logged</div>
            </div>
            <div style={statBoxStyle}>
              <div style={statValueStyle}>{getConsecutiveDayStreak()}</div>
              <div style={statLabelStyle}>Logging Streak</div>
            </div>
          </div>

          <div style={cardStyle}>
            <h4 style={{ color: '#d4b030', marginBottom: '15px' }}>⭐ Most Common Hot Items</h4>
            {hotItemStats.length === 0 ? (
              <div style={{ color: '#5a7a50' }}>No hot items logged yet.</div>
            ) : (
              <div>
                {hotItemStats.slice(0, 10).map(([item, count], idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(94,200,80,0.1)', alignItems: 'center' }}>
                    <span>{item}</span>
                    <span style={{ backgroundColor: 'rgba(212,176,48,0.2)', padding: '4px 12px', borderRadius: '20px', color: '#d4b030', fontSize: '12px', fontWeight: 'bold' }}>
                      {count}x
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NooksCrannyLog;
