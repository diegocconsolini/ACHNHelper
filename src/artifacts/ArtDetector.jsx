import React, { useState, useEffect } from 'react';

const ART_DATA = [
  // PAINTINGS - Always Real (14)
  { id: 1, name: "Calm Painting", type: "painting", realName: "A Sunday on the Island of La Grande Jatte", artist: "Georges Seurat", hasFake: false, fakeTell: null, alwaysReal: true },
  { id: 2, name: "Common Painting", type: "painting", realName: "The Gleaners", artist: "Jean-François Millet", hasFake: false, fakeTell: null, alwaysReal: true },
  { id: 3, name: "Dynamic Painting", type: "painting", realName: "The Great Wave off Kanagawa", artist: "Katsushika Hokusai", hasFake: false, fakeTell: null, alwaysReal: true },
  { id: 4, name: "Flowery Painting", type: "painting", realName: "Sunflowers", artist: "Vincent van Gogh", hasFake: false, fakeTell: null, alwaysReal: true },
  { id: 5, name: "Glowing Painting", type: "painting", realName: "The Fighting Temeraire", artist: "J.M.W. Turner", hasFake: false, fakeTell: null, alwaysReal: true },
  { id: 6, name: "Moody Painting", type: "painting", realName: "The Sower", artist: "Jean-François Millet", hasFake: false, fakeTell: null, alwaysReal: true },
  { id: 7, name: "Mysterious Painting", type: "painting", realName: "Isle of the Dead", artist: "Arnold Böcklin", hasFake: false, fakeTell: null, alwaysReal: true },
  { id: 8, name: "Nice Painting", type: "painting", realName: "The Fifer", artist: "Édouard Manet", hasFake: false, fakeTell: null, alwaysReal: true },
  { id: 9, name: "Perfect Painting", type: "painting", realName: "Apples and Oranges", artist: "Paul Cézanne", hasFake: false, fakeTell: null, alwaysReal: true },
  { id: 10, name: "Proper Painting", type: "painting", realName: "A Bar at the Folies-Bergère", artist: "Édouard Manet", hasFake: false, fakeTell: null, alwaysReal: true },
  { id: 11, name: "Sinking Painting", type: "painting", realName: "Ophelia", artist: "John Everett Millais", hasFake: false, fakeTell: null, alwaysReal: true },
  { id: 12, name: "Twinkling Painting", type: "painting", realName: "The Starry Night", artist: "Vincent van Gogh", hasFake: false, fakeTell: null, alwaysReal: true },
  { id: 13, name: "Warm Painting", type: "painting", realName: "The Clothed Maja", artist: "Francisco Goya", hasFake: false, fakeTell: null, alwaysReal: true },
  { id: 14, name: "Worthy Painting", type: "painting", realName: "Liberty Leading the People", artist: "Eugène Delacroix", hasFake: false, fakeTell: null, alwaysReal: true },
  // PAINTINGS - With Fakes (16)
  { id: 15, name: "Academic Painting", type: "painting", realName: "Vitruvian Man", artist: "Leonardo da Vinci", hasFake: true, fakeTell: "Coffee stain in upper right corner", alwaysReal: false },
  { id: 16, name: "Amazing Painting", type: "painting", realName: "The Night Watch", artist: "Rembrandt", hasFake: true, fakeTell: "Man in center has his hat removed", alwaysReal: false },
  { id: 17, name: "Basic Painting", type: "painting", realName: "The Blue Boy", artist: "Thomas Gainsborough", hasFake: true, fakeTell: "Boy has bowl-cut bangs", alwaysReal: false },
  { id: 18, name: "Detailed Painting", type: "painting", realName: "Rouen Cathedral / Ajisai Sōkeizu", artist: "Itō Jakuchū", hasFake: true, fakeTell: "Purple flowers and different details", alwaysReal: false },
  { id: 19, name: "Famous Painting", type: "painting", realName: "Mona Lisa", artist: "Leonardo da Vinci", hasFake: true, fakeTell: "Eyebrows are raised or arched", alwaysReal: false },
  { id: 20, name: "Graceful Painting", type: "painting", realName: "Beauty Looking Back", artist: "Hishikawa Moronobu", hasFake: true, fakeTell: "Figure is larger and fills frame", alwaysReal: false },
  { id: 21, name: "Jolly Painting", type: "painting", realName: "Summer", artist: "Giuseppe Arcimboldo", hasFake: true, fakeTell: "Chest flower/artichoke is missing", alwaysReal: false },
  { id: 22, name: "Moving Painting", type: "painting", realName: "The Birth of Venus", artist: "Sandro Botticelli", hasFake: true, fakeTell: "Trees are missing on the right", alwaysReal: false },
  { id: 23, name: "Quaint Painting", type: "painting", realName: "The Milkmaid", artist: "Johannes Vermeer", hasFake: true, fakeTell: "Pouring too much milk", alwaysReal: false },
  { id: 24, name: "Scary Painting", type: "painting", realName: "Ōtani Oniji III", artist: "Tōshūsai Sharaku", hasFake: true, fakeTell: "Sad expression with upward-slanting eyebrows", alwaysReal: false },
  { id: 25, name: "Scenic Painting", type: "painting", realName: "The Hunters in the Snow", artist: "Pieter Brueghel the Elder", hasFake: true, fakeTell: "Only one hunter in bottom left", alwaysReal: false },
  { id: 26, name: "Serene Painting", type: "painting", realName: "Lady with an Ermine", artist: "Leonardo da Vinci", hasFake: true, fakeTell: "Ermine is black and white patterned instead of pure white", alwaysReal: false },
  { id: 27, name: "Solemn Painting", type: "painting", realName: "Las Meninas", artist: "Diego Velázquez", hasFake: true, fakeTell: "Person in background has raised arm", alwaysReal: false },
  { id: 28, name: "Wild Painting Left Half", type: "painting", realName: "Fūjin and Raijin Screen", artist: "Tawaraya Sōtatsu", hasFake: true, fakeTell: "Green Raijin is white (should be green)", alwaysReal: false },
  { id: 29, name: "Wild Painting Right Half", type: "painting", realName: "Fūjin and Raijin Screen", artist: "Tawaraya Sōtatsu", hasFake: true, fakeTell: "White Fūjin is green (should be white)", alwaysReal: false },
  { id: 30, name: "Wistful Painting", type: "painting", realName: "Girl with a Pearl Earring", artist: "Johannes Vermeer", hasFake: true, fakeTell: "Star-shaped earring instead of pearl", alwaysReal: false },
  // STATUES - Always Real (2)
  { id: 31, name: "Familiar Statue", type: "statue", realName: "The Thinker", artist: "Auguste Rodin", hasFake: false, fakeTell: null, alwaysReal: true },
  { id: 32, name: "Great Statue", type: "statue", realName: "King Kamehameha I", artist: "Thomas Ridgeway Gould", hasFake: false, fakeTell: null, alwaysReal: true },
  // STATUES - With Fakes (11)
  { id: 33, name: "Ancient Statue", type: "statue", realName: "Dogū figurine", artist: "Jōmon period", hasFake: true, fakeTell: "Has antennae on head; eyes glow at night", alwaysReal: false },
  { id: 34, name: "Beautiful Statue", type: "statue", realName: "Venus de Milo", artist: "Unknown", hasFake: true, fakeTell: "Wearing a necklace", alwaysReal: false },
  { id: 35, name: "Gallant Statue", type: "statue", realName: "David", artist: "Michelangelo", hasFake: true, fakeTell: "Holding a book between arm and body", alwaysReal: false },
  { id: 36, name: "Informative Statue", type: "statue", realName: "Rosetta Stone", artist: "Unknown", hasFake: true, fakeTell: "Glowing blue color", alwaysReal: false },
  { id: 37, name: "Motherly Statue", type: "statue", realName: "Capitoline Wolf", artist: "Unknown", hasFake: true, fakeTell: "Tongue is sticking out", alwaysReal: false },
  { id: 38, name: "Mystic Statue", type: "statue", realName: "Bust of Nefertiti", artist: "Thutmose", hasFake: true, fakeTell: "Wearing an earring on right ear", alwaysReal: false },
  { id: 39, name: "Robust Statue", type: "statue", realName: "Discobolus", artist: "Myron", hasFake: true, fakeTell: "Wearing a wristwatch", alwaysReal: false },
  { id: 40, name: "Rock-head Statue", type: "statue", realName: "Olmec Colossal Head", artist: "Unknown", hasFake: true, fakeTell: "Smiling expression", alwaysReal: false },
  { id: 41, name: "Tremendous Statue", type: "statue", realName: "Houmuwu Ding", artist: "Unknown", hasFake: true, fakeTell: "Has a lid on top", alwaysReal: false },
  { id: 42, name: "Valiant Statue", type: "statue", realName: "Nike of Samothrace", artist: "Unknown", hasFake: true, fakeTell: "Left leg forward instead of right", alwaysReal: false },
  { id: 43, name: "Warrior Statue", type: "statue", realName: "Terracotta Warrior", artist: "Unknown", hasFake: true, fakeTell: "Holding a shovel", alwaysReal: false },
];

const ArtDetector = () => {
  const [activeTab, setActiveTab] = useState('detector');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [collection, setCollection] = useState({});
  const [reddSelection, setReddSelection] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get('artCollection');
        const storedCollection = result ? JSON.parse(result.value) : {};
        setCollection(storedCollection);

        const reddResult = await window.storage.get('reddSelection');
        const storedReddSelection = reddResult ? JSON.parse(reddResult.value) : [];
        setReddSelection(storedReddSelection);
      } catch (error) {
        console.error('Error loading art data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const saveCollection = async (newCollection) => {
    setCollection(newCollection);
    await window.storage.set('artCollection', JSON.stringify(newCollection));
  };

  const saveReddSelection = async (newSelection) => {
    setReddSelection(newSelection);
    await window.storage.set('reddSelection', JSON.stringify(newSelection));
  };

  const toggleDonated = (id) => {
    const newCollection = { ...collection };
    newCollection[id] = !newCollection[id];
    saveCollection(newCollection);
  };

  const toggleReddSelection = (id) => {
    let newSelection = [...reddSelection];
    if (newSelection.includes(id)) {
      newSelection = newSelection.filter(artId => artId !== id);
    } else if (newSelection.length < 4) {
      newSelection.push(id);
    }
    saveReddSelection(newSelection);
  };

  const filteredArt = ART_DATA.filter(art => {
    const matchesSearch = art.name.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = true;

    if (filterType === 'painting') matchesFilter = art.type === 'painting';
    if (filterType === 'statue') matchesFilter = art.type === 'statue';
    if (filterType === 'alwaysReal') matchesFilter = art.alwaysReal === true;
    if (filterType === 'hasFake') matchesFilter = art.hasFake === true;

    return matchesSearch && matchesFilter;
  });

  const donatedCount = Object.values(collection).filter(Boolean).length;
  const donatedPaintings = ART_DATA.filter(a => a.type === 'painting' && collection[a.id]).length;
  const donatedStatues = ART_DATA.filter(a => a.type === 'statue' && collection[a.id]).length;
  const alwaysRealCount = ART_DATA.filter(a => a.alwaysReal).length;
  const hasFakeCount = ART_DATA.filter(a => a.hasFake).length;

  const styles = {
    container: {
      width: '100%',
      padding: '20px',
      backgroundColor: '#0a1a10',
      minHeight: '100vh',
      fontFamily: '"DM Sans", sans-serif',
      color: '#c8e6c0',
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '1px solid rgba(94, 200, 80, 0.3)',
    },
    title: {
      fontSize: '36px',
      fontFamily: '"Playfair Display", serif',
      fontWeight: '700',
      color: '#5ec850',
      margin: '0 0 8px 0',
    },
    subtitle: {
      fontSize: '14px',
      color: '#5a7a50',
      margin: '0',
    },
    tabsContainer: {
      display: 'flex',
      gap: '12px',
      marginBottom: '30px',
      borderBottom: '1px solid rgba(94, 200, 80, 0.2)',
    },
    tab: {
      padding: '12px 24px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#5a7a50',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      borderBottom: '2px solid transparent',
      fontFamily: '"DM Sans", sans-serif',
    },
    tabActive: {
      color: '#5ec850',
      borderBottomColor: '#5ec850',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '12px',
      marginBottom: '30px',
    },
    statCard: {
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '8px',
      padding: '16px',
      textAlign: 'center',
    },
    statValue: {
      fontSize: '24px',
      fontFamily: '"DM Mono", monospace',
      fontWeight: '700',
      color: '#5ec850',
      margin: '0 0 4px 0',
    },
    statLabel: {
      fontSize: '12px',
      color: '#5a7a50',
      margin: '0',
    },
    controlsContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '24px',
    },
    searchInput: {
      padding: '12px 16px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.3)',
      borderRadius: '6px',
      color: '#c8e6c0',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '14px',
      transition: 'border-color 0.3s ease',
      gridColumn: '1 / -1',
    },
    filterSelect: {
      padding: '12px 16px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.3)',
      borderRadius: '6px',
      color: '#c8e6c0',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'border-color 0.3s ease',
    },
    artGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: '16px',
      marginBottom: '30px',
    },
    artCard: {
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '8px',
      padding: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    artCardHover: {
      backgroundColor: 'rgba(12, 28, 14, 0.98)',
      borderColor: 'rgba(94, 200, 80, 0.5)',
      boxShadow: '0 4px 12px rgba(94, 200, 80, 0.1)',
    },
    artName: {
      fontSize: '16px',
      fontWeight: '700',
      margin: '0 0 8px 0',
      color: '#5ec850',
      fontFamily: '"Playfair Display", serif',
    },
    artType: {
      fontSize: '12px',
      color: '#5a7a50',
      margin: '0 0 4px 0',
      fontFamily: '"DM Mono", monospace',
    },
    artRealName: {
      fontSize: '13px',
      color: '#c8e6c0',
      margin: '8px 0 4px 0',
      fontStyle: 'italic',
    },
    artArtist: {
      fontSize: '12px',
      color: '#5a7a50',
      margin: '0 0 12px 0',
    },
    badgeContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '12px',
      flexWrap: 'wrap',
    },
    badge: {
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      fontFamily: '"DM Mono", monospace',
    },
    badgeAlwaysReal: {
      backgroundColor: 'rgba(94, 200, 80, 0.2)',
      color: '#5ec850',
      border: '1px solid rgba(94, 200, 80, 0.4)',
    },
    badgeHasFake: {
      backgroundColor: 'rgba(212, 176, 48, 0.2)',
      color: '#d4b030',
      border: '1px solid rgba(212, 176, 48, 0.4)',
    },
    fakeTell: {
      backgroundColor: 'rgba(212, 176, 48, 0.1)',
      border: '1px solid rgba(212, 176, 48, 0.3)',
      borderRadius: '6px',
      padding: '10px 12px',
      marginTop: '12px',
      fontSize: '12px',
      color: '#c8e6c0',
      lineHeight: '1.5',
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '12px',
      paddingTop: '12px',
      borderTop: '1px solid rgba(94, 200, 80, 0.1)',
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer',
      accentColor: '#5ec850',
    },
    checkboxLabel: {
      fontSize: '13px',
      color: '#5a7a50',
      cursor: 'pointer',
      userSelect: 'none',
    },
    progressContainer: {
      marginBottom: '24px',
    },
    progressBar: {
      height: '8px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '8px',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#5ec850',
      transition: 'width 0.3s ease',
    },
    progressLabel: {
      fontSize: '12px',
      color: '#5a7a50',
      fontFamily: '"DM Mono", monospace',
    },
    reddModeContainer: {
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '2px solid rgba(212, 176, 48, 0.4)',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '24px',
    },
    reddTitle: {
      fontSize: '20px',
      fontFamily: '"Playfair Display", serif',
      fontWeight: '700',
      color: '#d4b030',
      margin: '0 0 16px 0',
    },
    reddInfo: {
      fontSize: '13px',
      color: '#5a7a50',
      marginBottom: '16px',
    },
    reddSelectionGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '12px',
    },
    reddCard: {
      backgroundColor: 'rgba(20, 40, 25, 0.8)',
      border: '1px solid rgba(94, 200, 80, 0.3)',
      borderRadius: '6px',
      padding: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    reddCardSelected: {
      backgroundColor: 'rgba(94, 200, 80, 0.15)',
      borderColor: '#5ec850',
      boxShadow: '0 0 8px rgba(94, 200, 80, 0.2)',
    },
    reddCardDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#5a7a50',
    },
    emptyStateIcon: {
      fontSize: '48px',
      marginBottom: '16px',
    },
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <style>
          {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`}
        </style>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#5ec850' }}>Loading art collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
          input:focus, select:focus { outline: none; border-color: #5ec850 !important; box-shadow: 0 0 8px rgba(94, 200, 80, 0.2); }
        `}
      </style>

      <div style={styles.header}>
        <h1 style={styles.title}>🎨 Redd's Art Detector</h1>
        <p style={styles.subtitle}>Know which paintings and statues are forgeries</p>
      </div>

      <div style={styles.tabsContainer}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'detector' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('detector')}
        >
          🔍 Detector
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'collection' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('collection')}
        >
          📚 Collection
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'redd' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('redd')}
        >
          💰 Redd Mode
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <p style={styles.statValue}>{ART_DATA.length}</p>
          <p style={styles.statLabel}>Total Art Pieces</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statValue}>{alwaysRealCount}</p>
          <p style={styles.statLabel}>Always Real</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statValue}>{hasFakeCount}</p>
          <p style={styles.statLabel}>Has Forgery</p>
        </div>
        {activeTab === 'collection' && (
          <div style={styles.statCard}>
            <p style={styles.statValue}>{donatedCount}</p>
            <p style={styles.statLabel}>Donated</p>
          </div>
        )}
      </div>

      {activeTab === 'detector' && (
        <>
          <div style={styles.controlsContainer}>
            <input
              type="text"
              placeholder="Search art by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Art</option>
              <option value="painting">Paintings Only</option>
              <option value="statue">Statues Only</option>
              <option value="alwaysReal">Always Real ✅</option>
              <option value="hasFake">Has Forgery ⚠️</option>
            </select>
          </div>

          {filteredArt.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>🔎</div>
              <p>No art pieces found matching your search</p>
            </div>
          ) : (
            <div style={styles.artGrid}>
              {filteredArt.map((art) => (
                <div
                  key={art.id}
                  style={{ ...styles.artCard, ...(expandedId === art.id ? styles.artCardHover : {}) }}
                  onMouseEnter={() => setExpandedId(art.id)}
                  onMouseLeave={() => setExpandedId(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{art.type === 'painting' ? '🖼️' : '🗿'}</span>
                    <h3 style={styles.artName}>{art.name}</h3>
                  </div>

                  <p style={styles.artType}>{art.type.toUpperCase()}</p>
                  <p style={styles.artRealName}>"{art.realName}"</p>
                  <p style={styles.artArtist}>by {art.artist}</p>

                  <div style={styles.badgeContainer}>
                    {art.alwaysReal && (
                      <span style={{ ...styles.badge, ...styles.badgeAlwaysReal }}>✅ ALWAYS REAL</span>
                    )}
                    {art.hasFake && (
                      <span style={{ ...styles.badge, ...styles.badgeHasFake }}>⚠️ HAS FAKE</span>
                    )}
                  </div>

                  {art.hasFake && expandedId === art.id && (
                    <div style={styles.fakeTell}>
                      <strong>Fake Tell:</strong> {art.fakeTell}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'collection' && (
        <>
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${(donatedCount / 43) * 100}%` }}></div>
            </div>
            <p style={styles.progressLabel}>{donatedCount}/43 pieces donated to museum</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#5a7a50', margin: '0 0 8px 0' }}>
              Paintings: {donatedPaintings}/30 | Statues: {donatedStatues}/13
            </p>
          </div>

          {ART_DATA.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>📚</div>
              <p>No art pieces to show</p>
            </div>
          ) : (
            <div style={styles.artGrid}>
              {ART_DATA.map((art) => (
                <div
                  key={art.id}
                  style={{ ...styles.artCard, ...(expandedId === art.id ? styles.artCardHover : {}) }}
                  onMouseEnter={() => setExpandedId(art.id)}
                  onMouseLeave={() => setExpandedId(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{art.type === 'painting' ? '🖼️' : '🗿'}</span>
                    <h3 style={styles.artName}>{art.name}</h3>
                  </div>

                  <p style={styles.artRealName}>"{art.realName}"</p>
                  <p style={styles.artArtist}>by {art.artist}</p>

                  <div style={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id={`donation-${art.id}`}
                      checked={collection[art.id] || false}
                      onChange={() => toggleDonated(art.id)}
                      style={styles.checkbox}
                    />
                    <label htmlFor={`donation-${art.id}`} style={styles.checkboxLabel}>
                      {collection[art.id] ? 'Donated ✅' : 'Not donated'}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'redd' && (
        <>
          <div style={styles.reddModeContainer}>
            <h2 style={styles.reddTitle}>🎭 Redd is Here!</h2>
            <p style={styles.reddInfo}>
              Select up to 4 art pieces that Redd is selling today. We'll help you spot the fakes!
            </p>
            <p style={{ fontSize: '12px', color: '#5a7a50', margin: '0' }}>
              Selected: {reddSelection.length}/4
            </p>
          </div>

          <div style={styles.reddSelectionGrid}>
            {ART_DATA.map((art) => {
              const isSelected = reddSelection.includes(art.id);
              const isDisabled = !isSelected && reddSelection.length >= 4;
              return (
                <div
                  key={art.id}
                  style={{
                    ...styles.reddCard,
                    ...(isSelected ? styles.reddCardSelected : {}),
                    ...(isDisabled ? styles.reddCardDisabled : {}),
                  }}
                  onClick={() => !isDisabled && toggleReddSelection(art.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{art.type === 'painting' ? '🖼️' : '🗿'}</span>
                    <h4 style={{ ...styles.artName, fontSize: '14px', margin: '0' }}>{art.name}</h4>
                  </div>

                  {isSelected && (
                    <>
                      <p style={{ ...styles.artRealName, margin: '8px 0 4px 0' }}>"{art.realName}"</p>
                      <p style={{ ...styles.artArtist, fontSize: '11px', margin: '0 0 8px 0' }}>by {art.artist}</p>

                      {art.alwaysReal && (
                        <div style={{ ...styles.badge, ...styles.badgeAlwaysReal, display: 'block', marginBottom: '8px' }}>
                          ✅ Safe to Buy
                        </div>
                      )}

                      {art.hasFake && (
                        <>
                          <div style={{ ...styles.badge, ...styles.badgeHasFake, display: 'block', marginBottom: '8px' }}>
                            ⚠️ Check Carefully
                          </div>
                          <div style={{ ...styles.fakeTell, marginTop: '8px', backgroundColor: 'rgba(212, 176, 48, 0.05)', padding: '8px' }}>
                            <strong style={{ color: '#d4b030' }}>Fake Tell:</strong> {art.fakeTell}
                          </div>
                        </>
                      )}
                    </>
                  )}

                  <div style={{ marginTop: '8px', textAlign: 'center' }}>
                    {isSelected ? (
                      <span style={{ fontSize: '12px', color: '#5ec850', fontWeight: '600' }}>✓ Selected</span>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#5a7a50' }}>Click to select</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {reddSelection.length > 0 && (
            <div style={{ ...styles.reddModeContainer, marginTop: '24px', backgroundColor: 'rgba(74, 172, 240, 0.1)', borderColor: 'rgba(74, 172, 240, 0.4)' }}>
              <h3 style={{ ...styles.reddTitle, color: '#4aacf0' }}>📋 Today's Selection Summary</h3>
              {reddSelection.map((id) => {
                const art = ART_DATA.find(a => a.id === id);
                return (
                  <div key={id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(74, 172, 240, 0.2)' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '600', color: '#c8e6c0' }}>
                      {art.type === 'painting' ? '🖼️' : '🗿'} {art.name}
                    </p>
                    <p style={{ margin: '0', fontSize: '12px', color: '#5a7a50' }}>
                      {art.alwaysReal ? '✅ Safe - Always genuine' : `⚠️ Risk - Check for: ${art.fakeTell}`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ArtDetector;
