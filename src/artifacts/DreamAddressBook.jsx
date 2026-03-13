import React, { useState, useEffect } from 'react';
import ConfirmModal from '../ConfirmModal';
import AlertModal from '../AlertModal';

const THEME_TAGS = ['Cottagecore', 'Japanese', 'Urban', 'Fairytale', 'Spooky', 'Natural', 'Modern', 'Tropical', 'Medieval', 'Space', 'Farm', 'Cluttercore', 'Minimalist', 'Custom'];

const DreamAddressBook = () => {
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState('book');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [message, setMessage] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const EXAMPLE_DATA = [
    { id: '1', islandName: 'Jambette Isle', dreamAddress: 'DA-1234-5678-9012', ownerName: 'Example', rating: 5, tags: ['Cottagecore'], notes: 'Beautiful pastoral island with charming buildings', dateVisited: new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0], mustRevisit: true },
    { id: '2', islandName: 'Aika Village', dreamAddress: 'DA-9283-7124-8390', ownerName: 'Creator', rating: 5, tags: ['Spooky'], notes: 'Wonderfully eerie Halloween aesthetic year-round', dateVisited: new Date(Date.now() - 14*24*60*60*1000).toISOString().split('T')[0], mustRevisit: true },
    { id: '3', islandName: 'Zinnia', dreamAddress: 'DA-0799-5927-5827', ownerName: 'Artist', rating: 4, tags: ['Japanese'], notes: 'Serene zen garden with traditional architecture', dateVisited: new Date(Date.now() - 21*24*60*60*1000).toISOString().split('T')[0], mustRevisit: false },
    { id: '4', islandName: 'Stardew', dreamAddress: 'DA-5765-3412-1234', ownerName: 'Farmer', rating: 4, tags: ['Farm'], notes: 'Cozy farming community feel with crop layouts', dateVisited: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0], mustRevisit: false },
    { id: '5', islandName: 'Coral Bay', dreamAddress: 'DA-2837-1938-4726', ownerName: 'Ocean', rating: 4, tags: ['Tropical'], notes: 'Vibrant beach paradise with water features', dateVisited: new Date(Date.now() - 45*24*60*60*1000).toISOString().split('T')[0], mustRevisit: false }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await window.storage.get('dreamAddressBook');
      const data = result ? JSON.parse(result.value) : EXAMPLE_DATA;
      setEntries(data);
    } catch (e) {
      setEntries(EXAMPLE_DATA);
    }
    setLoading(false);
  };

  const saveData = async (newEntries) => {
    try {
      await window.storage.set('dreamAddressBook', JSON.stringify(newEntries));
      setEntries(newEntries);
      setMessage('✓ Saved');
      setTimeout(() => setMessage(''), 2000);
    } catch (e) {
      setMessage('✗ Save failed');
    }
  };

  const addEntry = (formData) => {
    const newEntry = {
      id: Date.now().toString(),
      ...formData,
      dateVisited: new Date().toISOString().split('T')[0],
      mustRevisit: false
    };
    saveData([newEntry, ...entries]);
  };

  const deleteEntry = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (deleteTarget !== null) {
      saveData(entries.filter(e => e.id !== deleteTarget));
      setDeleteTarget(null);
    }
  };

  const toggleMustRevisit = (id) => {
    const updated = entries.map(e => e.id === id ? { ...e, mustRevisit: !e.mustRevisit } : e);
    saveData(updated);
  };

  const copyToClipboard = (address) => {
    navigator.clipboard.writeText(address).then(() => {
      setMessage('📋 Copied to clipboard');
      setTimeout(() => setMessage(''), 2000);
    }).catch((e) => {
      console.error('Error copying to clipboard:', e);
      setMessage('⚠️ Copy failed');
      setTimeout(() => setMessage(''), 2000);
    });
  };

  const getFilteredEntries = () => {
    let filtered = entries;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.islandName.toLowerCase().includes(term) ||
        e.ownerName.toLowerCase().includes(term) ||
        e.dreamAddress.includes(term)
      );
    }

    if (filterRating > 0) {
      filtered = filtered.filter(e => e.rating === filterRating);
    }

    if (filterTag) {
      filtered = filtered.filter(e => e.tags.includes(filterTag));
    }

    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.dateVisited) - new Date(a.dateVisited));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.islandName.localeCompare(b.islandName));
    }

    return filtered;
  };

  const getFavorites = () => entries.filter(e => e.rating >= 4).sort((a, b) => new Date(b.dateVisited) - new Date(a.dateVisited));

  const getStats = () => {
    const totalVisits = entries.length;
    const avgRating = totalVisits > 0 ? (entries.reduce((sum, e) => sum + e.rating, 0) / totalVisits).toFixed(1) : 0;
    const tagCounts = {};
    entries.forEach(e => {
      e.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

    const visitsByMonth = {};
    entries.forEach(e => {
      const month = e.dateVisited.substring(0, 7);
      visitsByMonth[month] = (visitsByMonth[month] || 0) + 1;
    });

    return { totalVisits, avgRating, tagCounts: sortedTags, visitsByMonth };
  };

  const styles = {
    container: {
      width: '100%',
      padding: '20px',
      fontFamily: '"DM Sans", sans-serif',
      backgroundColor: '#0a1a10',
      minHeight: '100vh',
      color: '#c8e6c0'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '2px solid rgba(94, 200, 80, 0.3)'
    },
    title: {
      fontSize: '32px',
      fontFamily: '"Playfair Display", serif',
      color: '#5ec850',
      margin: '0 0 8px 0',
      fontWeight: 700
    },
    subtitle: {
      fontSize: '13px',
      color: '#5a7a50',
      marginTop: '5px'
    },
    messageBox: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '10px 16px',
      backgroundColor: 'rgba(94, 200, 80, 0.9)',
      color: '#0a1a10',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 600,
      zIndex: 1000
    },
    tabs: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      borderBottom: '1px solid rgba(94, 200, 80, 0.2)',
      flexWrap: 'wrap'
    },
    tab: {
      padding: '12px 18px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#5a7a50',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 500,
      borderBottom: '2px solid transparent',
      transition: 'all 0.3s ease',
      fontFamily: '"DM Sans", sans-serif'
    },
    tabActive: {
      color: '#5ec850',
      borderBottomColor: '#5ec850'
    },
    panel: {
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '8px',
      padding: '24px',
      minHeight: '400px'
    },
    form: {
      display: 'grid',
      gap: '16px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    label: {
      fontSize: '12px',
      fontWeight: 600,
      color: '#5ec850',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      padding: '10px 12px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '4px',
      color: '#c8e6c0',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '13px',
      transition: 'border-color 0.2s ease'
    },
    textarea: {
      padding: '10px 12px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '4px',
      color: '#c8e6c0',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '13px',
      minHeight: '100px',
      resize: 'vertical'
    },
    ratingSelector: {
      display: 'flex',
      gap: '8px'
    },
    starButton: {
      padding: '8px 12px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '4px',
      color: '#5a7a50',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'all 0.2s ease',
      fontFamily: '"DM Sans", sans-serif'
    },
    tagContainer: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    tagButton: {
      padding: '8px 12px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '4px',
      color: '#5a7a50',
      cursor: 'pointer',
      fontSize: '12px',
      transition: 'all 0.2s ease',
      fontFamily: '"DM Sans", sans-serif'
    },
    button: {
      padding: '12px 20px',
      backgroundColor: '#5ec850',
      color: '#0a1a10',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 600,
      transition: 'all 0.2s ease',
      fontFamily: '"DM Sans", sans-serif'
    },
    entryCard: {
      backgroundColor: 'rgba(94, 200, 80, 0.05)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '6px',
      padding: '16px',
      marginBottom: '12px',
      transition: 'all 0.2s ease'
    },
    entryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px',
      gap: '12px'
    },
    entryTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#5ec850',
      margin: 0
    },
    entryMeta: {
      fontSize: '12px',
      color: '#5a7a50',
      marginBottom: '8px'
    },
    dreamAddress: {
      fontFamily: '"DM Mono", monospace',
      color: '#4aacf0',
      fontSize: '12px',
      letterSpacing: '1px'
    },
    controls: {
      display: 'flex',
      gap: '8px',
      marginTop: '12px',
      flexWrap: 'wrap'
    },
    controlButton: {
      padding: '6px 12px',
      fontSize: '11px',
      backgroundColor: 'rgba(74, 172, 240, 0.2)',
      border: '1px solid rgba(74, 172, 240, 0.4)',
      borderRadius: '3px',
      color: '#4aacf0',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: '"DM Sans", sans-serif'
    },
    filterControls: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '12px',
      marginBottom: '20px'
    },
    statBox: {
      backgroundColor: 'rgba(94, 200, 80, 0.1)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '6px',
      padding: '16px',
      marginBottom: '16px'
    },
    statNumber: {
      fontSize: '28px',
      fontFamily: '"Playfair Display", serif',
      color: '#5ec850',
      fontWeight: 700,
      margin: '0 0 6px 0'
    },
    statLabel: {
      fontSize: '12px',
      color: '#5a7a50',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    tagBadge: {
      display: 'inline-block',
      padding: '4px 10px',
      backgroundColor: 'rgba(74, 172, 240, 0.2)',
      border: '1px solid rgba(74, 172, 240, 0.4)',
      borderRadius: '3px',
      color: '#4aacf0',
      fontSize: '11px',
      marginRight: '6px',
      marginBottom: '6px'
    }
  };

  if (loading) {
    return <div style={styles.container}><p>Loading...</p></div>;
  }

  const filteredEntries = getFilteredEntries();
  const favorites = getFavorites();
  const stats = getStats();

  return (
    <div style={styles.container}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
          *::-webkit-scrollbar { width: 8px; } *::-webkit-scrollbar-track { background: rgba(94,200,80,0.05); } *::-webkit-scrollbar-thumb { background: rgba(94,200,80,0.3); border-radius: 4px; }
        `}
      </style>

      {message && <div style={styles.messageBox}>{message}</div>}

      <div style={styles.header}>
        <h1 style={styles.title}>🌙 Dream Address Book</h1>
        <p style={styles.subtitle}>Log and explore dream island visits</p>
      </div>

      <div style={styles.tabs}>
        {[
          { id: 'book', label: '📖 My Book', count: entries.length },
          { id: 'add', label: '➕ Add Entry' },
          { id: 'favorites', label: '⭐ Favorites', count: favorites.length },
          { id: 'stats', label: '📊 Stats' }
        ].map(t => (
          <button
            key={t.id}
            style={{ ...styles.tab, ...(activeTab === t.id ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label} {t.count !== undefined && `(${t.count})`}
          </button>
        ))}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete dream address?"
        message="This entry will be permanently removed."
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div style={styles.panel}>
        {activeTab === 'book' && (
          <div>
            <div style={styles.filterControls}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Search</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Island, owner, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Filter by Rating</label>
                <select style={styles.input} value={filterRating} onChange={(e) => setFilterRating(parseInt(e.target.value))}>
                  <option value={0}>All ratings</option>
                  <option value={5}>⭐⭐⭐⭐⭐ 5 stars</option>
                  <option value={4}>⭐⭐⭐⭐ 4 stars</option>
                  <option value={3}>⭐⭐⭐ 3 stars</option>
                  <option value={2}>⭐⭐ 2 stars</option>
                  <option value={1}>⭐ 1 star</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Sort by</label>
                <select style={styles.input} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="date">Newest first</option>
                  <option value="rating">Highest rating</option>
                  <option value="name">Island name</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={styles.label}>Filter by theme</label>
              <select style={styles.input} value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
                <option value="">All themes</option>
                {THEME_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </div>

            {filteredEntries.length === 0 ? (
              <p style={{ color: '#5a7a50', textAlign: 'center', marginTop: '40px' }}>No dream addresses found</p>
            ) : (
              filteredEntries.map(entry => (
                <div key={entry.id} style={styles.entryCard} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(94, 200, 80, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(94, 200, 80, 0.05)'}>
                  <div style={styles.entryHeader}>
                    <div>
                      <h3 style={styles.entryTitle}>{entry.islandName}</h3>
                      <p style={styles.entryMeta}>by {entry.ownerName} • {entry.dateVisited}</p>
                      <p style={styles.dreamAddress}>{entry.dreamAddress}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px' }}>{['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'][entry.rating - 1]}</div>
                    </div>
                  </div>
                  {entry.notes && <p style={{ ...styles.entryMeta, marginBottom: '10px', color: '#5a7a50' }}>{entry.notes}</p>}
                  <div>
                    {entry.tags.map(tag => <span key={tag} style={styles.tagBadge}>{tag}</span>)}
                  </div>
                  <div style={styles.controls}>
                    <button style={styles.controlButton} onClick={() => copyToClipboard(entry.dreamAddress)}>📋 Copy DA</button>
                    <button style={styles.controlButton} onClick={() => deleteEntry(entry.id)}>🗑 Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'add' && <AddEntryForm onSubmit={addEntry} styles={{ ...styles }} />}

        {activeTab === 'favorites' && (
          <div>
            <p style={{ ...styles.entryMeta, marginBottom: '16px' }}>Rating 4-5 stars only</p>
            {favorites.length === 0 ? (
              <p style={{ color: '#5a7a50', textAlign: 'center', marginTop: '40px' }}>No favorites yet</p>
            ) : (
              favorites.map(entry => (
                <div key={entry.id} style={styles.entryCard} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(94, 200, 80, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(94, 200, 80, 0.05)'}>
                  <div style={styles.entryHeader}>
                    <div style={{ flex: 1 }}>
                      <h3 style={styles.entryTitle}>{entry.islandName}</h3>
                      <p style={styles.entryMeta}>by {entry.ownerName}</p>
                      <p style={styles.dreamAddress}>{entry.dreamAddress}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', marginBottom: '8px' }}>{['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'][entry.rating - 1]}</div>
                      <button
                        style={{ ...styles.controlButton, backgroundColor: entry.mustRevisit ? 'rgba(212, 176, 48, 0.3)' : 'rgba(74, 172, 240, 0.2)', borderColor: entry.mustRevisit ? 'rgba(212, 176, 48, 0.6)' : 'rgba(74, 172, 240, 0.4)', color: entry.mustRevisit ? '#d4b030' : '#4aacf0' }}
                        onClick={() => toggleMustRevisit(entry.id)}
                      >
                        {entry.mustRevisit ? '🚩' : '🏁'} Must revisit
                      </button>
                    </div>
                  </div>
                  <div style={styles.controls}>
                    <button style={styles.controlButton} onClick={() => copyToClipboard(entry.dreamAddress)}>📋 Copy DA</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={styles.statBox}>
                <p style={styles.statNumber}>{stats.totalVisits}</p>
                <p style={styles.statLabel}>Total Visits</p>
              </div>
              <div style={styles.statBox}>
                <p style={styles.statNumber}>{stats.avgRating}</p>
                <p style={styles.statLabel}>Average Rating</p>
              </div>
            </div>

            <div style={styles.statBox}>
              <p style={{ ...styles.label, marginBottom: '12px' }}>Top Themes</p>
              {stats.tagCounts.length === 0 ? (
                <p style={styles.entryMeta}>No themes recorded</p>
              ) : (
                stats.tagCounts.slice(0, 5).map(([tag, count]) => (
                  <div key={tag} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', color: '#5a7a50' }}>{tag}</span>
                      <span style={{ fontSize: '12px', fontFamily: '"DM Mono", monospace', color: '#5ec850' }}>{count}</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'rgba(94, 200, 80, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', backgroundColor: '#5ec850', width: `${(count / stats.totalVisits * 100)}%`, borderRadius: '3px' }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={styles.statBox}>
              <p style={{ ...styles.label, marginBottom: '12px' }}>Recent Activity</p>
              {Object.keys(stats.visitsByMonth).length === 0 ? (
                <p style={styles.entryMeta}>No visit history</p>
              ) : (
                Object.entries(stats.visitsByMonth).sort().reverse().slice(0, 6).map(([month, count]) => (
                  <div key={month} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', color: '#5a7a50' }}>
                    <span>{month}</span>
                    <span style={{ fontFamily: '"DM Mono", monospace', color: '#4aacf0' }}>{count} visit{count !== 1 ? 's' : ''}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AddEntryForm = ({ onSubmit, styles }) => {
  const [formData, setFormData] = useState({
    islandName: '',
    dreamAddress: '',
    ownerName: '',
    rating: 3,
    tags: [],
    notes: ''
  });
  const [alertMsg, setAlertMsg] = useState(null);

  const handleDreamAddressChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^0-9A-Z\-]/g, '');
    if (value && !value.startsWith('DA-')) {
      value = 'DA-' + value;
    }
    setFormData({ ...formData, dreamAddress: value });
  };

  const validateDreamAddress = (addr) => {
    const pattern = /^DA-\d{4}-\d{4}-\d{4}$/;
    return pattern.test(addr);
  };

  const toggleTag = (tag) => {
    const newTags = formData.tags.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag];
    setFormData({ ...formData, tags: newTags });
  };

  const handleSubmit = () => {
    if (!formData.islandName.trim()) {
      setAlertMsg('Please enter island name');
      return;
    }
    if (!validateDreamAddress(formData.dreamAddress)) {
      setAlertMsg('Dream Address must be in format: DA-XXXX-XXXX-XXXX');
      return;
    }
    if (!formData.ownerName.trim()) {
      setAlertMsg('Please enter owner name');
      return;
    }
    if (formData.tags.length === 0) {
      setAlertMsg('Please select at least one theme');
      return;
    }
    onSubmit(formData);
    setFormData({ islandName: '', dreamAddress: '', ownerName: '', rating: 3, tags: [], notes: '' });
  };

  return (
    <div style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Island Name</label>
        <input
          style={styles.input}
          type="text"
          placeholder="e.g., Jambette Isle"
          value={formData.islandName}
          onChange={(e) => setFormData({ ...formData, islandName: e.target.value })}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Dream Address</label>
        <input
          style={styles.input}
          type="text"
          placeholder="DA-XXXX-XXXX-XXXX"
          value={formData.dreamAddress}
          onChange={handleDreamAddressChange}
          maxLength="19"
        />
        <p style={{ fontSize: '11px', color: '#5a7a50', margin: '4px 0 0 0' }}>Format: DA-XXXX-XXXX-XXXX</p>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Owner Name</label>
        <input
          style={styles.input}
          type="text"
          placeholder="Creator's name"
          value={formData.ownerName}
          onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Rating</label>
        <div style={styles.ratingSelector}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              style={{ ...styles.starButton, ...(formData.rating === star ? { backgroundColor: '#5ec850', color: '#0a1a10', borderColor: '#5ec850' } : {}) }}
              onClick={() => setFormData({ ...formData, rating: star })}
            >
              {'⭐'.repeat(star)}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Themes</label>
        <div style={styles.tagContainer}>
          {THEME_TAGS.map(tag => (
            <button
              key={tag}
              style={{ ...styles.tagButton, ...(formData.tags.includes(tag) ? { backgroundColor: '#5ec850', color: '#0a1a10', borderColor: '#5ec850' } : {}) }}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Notes</label>
        <textarea
          style={styles.textarea}
          placeholder="What did you like about this island?"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <button style={styles.button} onClick={handleSubmit}>
        💾 Save Dream Address
      </button>

      <AlertModal
        open={alertMsg !== null}
        title="Missing Info"
        message={alertMsg || ''}
        onClose={() => setAlertMsg(null)}
      />
    </div>
  );
};

export default DreamAddressBook;
