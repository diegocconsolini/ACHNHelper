'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AssetImg } from '../assetHelper';
import { DIY_CATEGORIES } from './diyRecipeData';

const STORAGE_KEY = 'acnh-wishlist';

// Verified item names from existing trackers (FishTracker, BugTracker, SeaCreatureTracker, KKCatalogue, ArtDetector)
const ITEM_DATABASE = {
  fish: [
    'Bitterling','Pale Chub','Crucian Carp','Dace','Carp','Koi','Goldfish','Pop-eyed Goldfish',
    'Ranchu Goldfish','Killifish','Crawfish','Soft-shelled Turtle','Snapping Turtle','Tadpole',
    'Frog','Freshwater Goby','Loach','Catfish','Giant Snakehead','Bluegill','Yellow Perch',
    'Black Bass','Tilapia','Pike','Pond Smelt','Sweetfish','Cherry Salmon','Char','Golden Trout',
    'Stringfish','Salmon','King Salmon','Mitten Crab','Guppy','Nibble Fish','Angelfish','Betta',
    'Neon Tetra','Rainbowfish','Piranha','Arowana','Dorado','Gar','Arapaima','Saddled Bichir',
    'Sturgeon','Sea Butterfly','Sea Horse','Clown Fish','Surgeonfish','Butterfly Fish',
    'Napoleonfish','Zebra Turkeyfish','Blowfish','Puffer Fish','Anchovy','Horse Mackerel',
    'Barred Knifejaw','Sea Bass','Red Snapper','Dab','Olive Flounder','Squid','Moray Eel',
    'Ribbon Eel','Tuna','Blue Marlin','Giant Trevally','Mahi-Mahi','Ocean Sunfish','Ray',
    'Saw Shark','Hammerhead Shark','Great White Shark','Whale Shark','Suckerfish','Football Fish',
    'Oarfish','Barreleye','Coelacanth',
  ],
  bugs: [
    'Common Butterfly','Yellow Butterfly','Tiger Butterfly','Peacock Butterfly','Common Bluebottle',
    'Paper Kite Butterfly','Great Purple Emperor','Monarch Butterfly','Emperor Butterfly',
    'Agrias Butterfly','Rajah Brooke\'s Birdwing','Queen Alexandra\'s Birdwing','Moth','Atlas Moth',
    'Madagascan Sunset Moth','Long Locust','Migratory Locust','Rice Grasshopper','Grasshopper',
    'Cricket','Bell Cricket','Mantis','Orchid Mantis','Honeybee','Wasp','Brown Cicada',
    'Robust Cicada','Giant Cicada','Walker Cicada','Evening Cicada','Cicada Shell','Red Dragonfly',
    'Darner Dragonfly','Banded Dragonfly','Damselfly','Firefly','Mole Cricket','Pondskater',
    'Diving Beetle','Giant Water Bug','Stinkbug','Man-faced Stink Bug','Ladybug','Tiger Beetle',
    'Jewel Beetle','Violin Beetle','Citrus Long-horned Beetle','Rosalia Batesi Beetle',
    'Blue Weevil Beetle','Dung Beetle','Earth-boring Dung Beetle','Scarab Beetle','Drone Beetle',
    'Goliath Beetle','Saw Stag','Miyama Stag','Giant Stag','Rainbow Stag','Cyclommatus Stag',
    'Golden Stag','Giraffe Stag','Horned Dynastid','Horned Atlas','Horned Elephant',
    'Horned Hercules','Walking Leaf','Walking Stick','Bagworm','Ant','Hermit Crab','Wharf Roach',
    'Fly','Mosquito','Flea','Snail','Pill Bug','Centipede','Spider','Tarantula','Scorpion',
  ],
  sea: [
    'Seaweed','Sea Grapes','Sea Cucumber','Sea Pig','Sea Star','Sea Urchin','Slate Pencil Urchin',
    'Sea Anemone','Moon Jellyfish','Sea Slug','Pearl Oyster','Mussel','Oyster','Scallop',
    'Turban Shell','Abalone','Gigas Giant Clam','Chambered Nautilus','Octopus','Umbrella Octopus',
    'Vampire Squid','Firefly Squid','Gazami Crab','Dungeness Crab','Snow Crab','Red King Crab',
    'Acorn Barnacle','Spider Crab','Tiger Prawn','Sweet Shrimp','Mantis Shrimp','Spiny Lobster',
    'Lobster','Giant Isopod','Horseshoe Crab','Sea Pineapple','Spotted Garden Eel','Flatworm',
    'Venus\' Flower Basket','Whelk',
  ],
  song: [
    'Agent K.K.','Aloha K.K.','Animal City','Bubblegum K.K.','Caf\u00e9 K.K.','Chillwave',
    'Comrade K.K.','DJ K.K.','Drivin\'','Farewell','Forest Life','Go K.K. Rider!','Hypno K.K.',
    'I Love You','Imperial K.K.','K.K. Adventure','K.K. Aria','K.K. Ballad','K.K. Bashment',
    'K.K. Bazaar','K.K. Birthday','K.K. Blues','K.K. Bossa','K.K. Break','K.K. Calypso',
    'K.K. Casbah','K.K. Chorale','K.K. Chorinho','K.K. Condor','K.K. Country','K.K. Cruisin\'',
    'K.K. D&B','K.K. Dirge','K.K. Disco','K.K. Dixie','K.K. Dub','K.K. \u00c9tude','K.K. Faire',
    'K.K. Flamenco','K.K. Folk','K.K. Fugue','K.K. Fusion','K.K. Groove','K.K. Gumbo',
    'K.K. Hop','K.K. House','K.K. Island','K.K. Jazz','K.K. Jongara','K.K. Khoomei',
    'K.K. Lament','K.K. Love Song','K.K. Lovers','K.K. Lullaby','K.K. Mambo','K.K. Marathon',
    'K.K. March','K.K. Mariachi','K.K. Metal','K.K. Milonga','K.K. Moody','K.K. Oasis',
    'K.K. Parade','K.K. Polka','K.K. Ragtime','K.K. Rally','K.K. Reggae','K.K. Robot Synth',
    'K.K. Rock','K.K. Rockabilly','K.K. Safari','K.K. Salsa','K.K. Samba','K.K. Ska',
    'K.K. Slack-Key','K.K. Sonata','K.K. Song','K.K. Soul','K.K. Steppe','K.K. Stroll',
    'K.K. Swing','K.K. Synth','K.K. Tango','K.K. Technopop','K.K. Waltz','K.K. Western',
    'King K.K.','Lucky K.K.','Marine Song 2001','Mountain Song','Mr. K.K.','My Place',
    'Neapolitan','Only Me','Pondering','Rockin\' K.K.','Soulful K.K.','Space K.K.',
    'Spring Blossoms','Stale Cupcakes','Steep Hill','Surfin\' K.K.','The K. Funk',
    'To the Edge','Two Days Ago','Wandering','Welcome Horizons',
  ],
  art: [
    'Calm Painting','Common Painting','Dynamic Painting','Flowery Painting','Glowing Painting',
    'Moody Painting','Mysterious Painting','Nice Painting','Perfect Painting','Proper Painting',
    'Sinking Painting','Twinkling Painting','Warm Painting','Worthy Painting','Academic Painting',
    'Amazing Painting','Basic Painting','Detailed Painting','Famous Painting','Graceful Painting',
    'Jolly Painting','Moving Painting','Quaint Painting','Scary Painting','Scenic Painting',
    'Serene Painting','Solemn Painting','Wild Painting Left Half','Wild Painting Right Half',
    'Wistful Painting','Familiar Statue','Great Statue','Ancient Statue','Beautiful Statue',
    'Gallant Statue','Informative Statue','Motherly Statue','Mystic Statue','Robust Statue',
    'Rock-head Statue','Tremendous Statue','Valiant Statue','Warrior Statue',
  ],
};

// Build recipe name list from diyRecipeData
const RECIPE_NAMES = Object.values(DIY_CATEGORIES).flatMap(cat => cat.recipes);

const TYPE_CONFIG = {
  fish:   { label: 'Fish',          emoji: '\u{1F41F}', color: '#4aacf0', assetCategory: 'fish' },
  bugs:   { label: 'Bugs',          emoji: '\u{1F98B}', color: '#5ec850', assetCategory: 'bugs' },
  sea:    { label: 'Sea Creatures', emoji: '\u{1F419}', color: '#4aacf0', assetCategory: 'sea-creatures' },
  recipe: { label: 'Recipes',       emoji: '\u{1F528}', color: '#d4b030', assetCategory: 'recipes' },
  song:   { label: 'Songs',         emoji: '\u{1F3B5}', color: '#d4b030', assetCategory: 'music' },
  art:    { label: 'Art',           emoji: '\u{1F3A8}', color: '#4aacf0', assetCategory: 'art' },
};

const TYPE_ORDER = ['fish', 'bugs', 'sea', 'recipe', 'song', 'art'];

function getDefaultData() {
  return { items: [] };
}

function getSearchResults(type, query) {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  let source;
  if (type === 'recipe') {
    source = RECIPE_NAMES;
  } else {
    source = ITEM_DATABASE[type] || [];
  }
  return source.filter(n => n.toLowerCase().includes(q)).slice(0, 12);
}

export default function Wishlist() {
  const [data, setData] = useState(getDefaultData());
  const [loaded, setLoaded] = useState(false);
  const [addType, setAddType] = useState('fish');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [activeTab, setActiveTab] = useState('wanted');
  const [hoveredTab, setHoveredTab] = useState(null);
  const [hoveredType, setHoveredType] = useState(null);
  const searchRef = useRef(null);

  // Load
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result) {
          const parsed = JSON.parse(result.value);
          setData(parsed && parsed.items ? parsed : getDefaultData());
        }
      } catch (e) {
        console.error('Wishlist load error:', e);
      }
      setLoaded(true);
    })();
  }, []);

  // Save
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Wishlist save error:', e);
      }
    })();
  }, [data, loaded]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addItem = (name) => {
    const exists = data.items.some(i => i.type === addType && i.name === name);
    if (exists) return;
    const newItem = {
      type: addType,
      name,
      addedAt: new Date().toISOString(),
      obtained: false,
    };
    setData(prev => ({ items: [...prev.items, newItem] }));
    setSearchQuery('');
    setShowResults(false);
  };

  const removeItem = (type, name) => {
    setData(prev => ({
      items: prev.items.filter(i => !(i.type === type && i.name === name)),
    }));
  };

  const toggleObtained = (type, name) => {
    setData(prev => ({
      items: prev.items.map(i =>
        i.type === type && i.name === name ? { ...i, obtained: !i.obtained } : i
      ),
    }));
  };

  const exportList = async () => {
    const wanted = data.items.filter(i => !i.obtained);
    const obtained = data.items.filter(i => i.obtained);
    let text = 'ACNH Wishlist\n============\n\n';
    if (wanted.length > 0) {
      text += 'Wanted:\n';
      wanted.forEach(i => {
        text += `  [ ] ${i.name} (${TYPE_CONFIG[i.type]?.label || i.type})\n`;
      });
      text += '\n';
    }
    if (obtained.length > 0) {
      text += 'Obtained:\n';
      obtained.forEach(i => {
        text += `  [x] ${i.name} (${TYPE_CONFIG[i.type]?.label || i.type})\n`;
      });
    }
    if (wanted.length === 0 && obtained.length === 0) {
      text += '(empty)\n';
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const wantedItems = data.items.filter(i => !i.obtained);
  const obtainedItems = data.items.filter(i => i.obtained);
  const searchResults = getSearchResults(addType, searchQuery);

  // Group items by type
  const groupByType = (items) => {
    const groups = {};
    TYPE_ORDER.forEach(t => {
      const typeItems = items.filter(i => i.type === t);
      if (typeItems.length > 0) groups[t] = typeItems;
    });
    return groups;
  };

  const wantedGroups = groupByType(wantedItems);
  const obtainedGroups = groupByType(obtainedItems);
  const displayGroups = activeTab === 'wanted' ? wantedGroups : obtainedGroups;
  const displayItems = activeTab === 'wanted' ? wantedItems : obtainedItems;

  if (!loaded) {
    return (
      <div style={styles.container}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`}</style>
        <div style={styles.loadingWrap}>
          <span style={{ fontSize: 48 }}>🍃</span>
          <p style={{ color: '#5ec850', fontFamily: "'DM Sans', sans-serif", marginTop: 12 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.title}>Wishlist</h1>
            <p style={styles.subtitle}>
              Track items you want across all categories
            </p>
          </div>
          <button
            onClick={exportList}
            onMouseEnter={() => setHoveredBtn('export')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...styles.exportBtn,
              background: hoveredBtn === 'export' ? 'rgba(74,172,240,0.25)' : 'rgba(74,172,240,0.1)',
              borderColor: hoveredBtn === 'export' ? 'rgba(74,172,240,0.5)' : 'rgba(74,172,240,0.25)',
            }}
          >
            {copiedMsg ? 'Copied!' : 'Export as Text'}
          </button>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <span style={styles.statNumber}>{wantedItems.length}</span>
            <span style={styles.statLabel}>Wanted</span>
          </div>
          <div style={styles.statBox}>
            <span style={{ ...styles.statNumber, color: '#5ec850' }}>{obtainedItems.length}</span>
            <span style={styles.statLabel}>Obtained</span>
          </div>
          <div style={styles.statBox}>
            <span style={{ ...styles.statNumber, color: '#d4b030' }}>{data.items.length}</span>
            <span style={styles.statLabel}>Total</span>
          </div>
        </div>
      </div>

      {/* Add Item Section */}
      <div style={styles.addSection}>
        <h2 style={styles.sectionTitle}>Add Item</h2>

        {/* Type Selector */}
        <div style={styles.typeRow}>
          {TYPE_ORDER.map(t => (
            <button
              key={t}
              onClick={() => { setAddType(t); setSearchQuery(''); setShowResults(false); }}
              onMouseEnter={() => setHoveredType(t)}
              onMouseLeave={() => setHoveredType(null)}
              style={{
                ...styles.typeBtn,
                background: addType === t
                  ? `${TYPE_CONFIG[t].color}22`
                  : hoveredType === t ? 'rgba(94,200,80,0.08)' : 'transparent',
                borderColor: addType === t ? TYPE_CONFIG[t].color : 'rgba(94,200,80,0.1)',
                color: addType === t ? TYPE_CONFIG[t].color : '#c8e6c0',
              }}
            >
              <span>{TYPE_CONFIG[t].emoji}</span>
              <span>{TYPE_CONFIG[t].label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div ref={searchRef} style={styles.searchWrap}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
            onFocus={() => { if (searchQuery.length >= 1) setShowResults(true); }}
            placeholder={`Search ${TYPE_CONFIG[addType].label.toLowerCase()}...`}
            style={styles.searchInput}
          />
          {showResults && searchResults.length > 0 && (
            <div style={styles.dropdown}>
              {searchResults.map((name, idx) => {
                const alreadyAdded = data.items.some(i => i.type === addType && i.name === name);
                return (
                  <button
                    key={`${name}-${idx}`}
                    onClick={() => !alreadyAdded && addItem(name)}
                    onMouseEnter={() => setHoveredItem(`add-${idx}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                      ...styles.dropdownItem,
                      background: hoveredItem === `add-${idx}` ? 'rgba(94,200,80,0.1)' : 'transparent',
                      opacity: alreadyAdded ? 0.4 : 1,
                      cursor: alreadyAdded ? 'default' : 'pointer',
                    }}
                  >
                    <AssetImg category={TYPE_CONFIG[addType].assetCategory} name={name} size={24} />
                    <span style={styles.dropdownName}>{name}</span>
                    {alreadyAdded && <span style={styles.addedBadge}>Added</span>}
                  </button>
                );
              })}
            </div>
          )}
          {showResults && searchQuery.length >= 1 && searchResults.length === 0 && (
            <div style={styles.dropdown}>
              <div style={styles.noResults}>No matching {TYPE_CONFIG[addType].label.toLowerCase()} found</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabRow}>
        {['wanted', 'obtained'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            onMouseEnter={() => setHoveredTab(tab)}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              ...styles.tabBtn,
              background: activeTab === tab
                ? 'rgba(94,200,80,0.15)'
                : hoveredTab === tab ? 'rgba(94,200,80,0.06)' : 'transparent',
              borderBottom: activeTab === tab ? '2px solid #5ec850' : '2px solid transparent',
              color: activeTab === tab ? '#5ec850' : '#5a7a50',
            }}
          >
            {tab === 'wanted' ? `Wanted (${wantedItems.length})` : `Obtained (${obtainedItems.length})`}
          </button>
        ))}
      </div>

      {/* Item List */}
      <div style={styles.listArea}>
        {Object.keys(displayGroups).length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: 48 }}>
              {activeTab === 'wanted' ? '\u{1F3AF}' : '\u{2705}'}
            </span>
            <p style={styles.emptyTitle}>
              {activeTab === 'wanted'
                ? 'Your wishlist is empty'
                : 'No obtained items yet'}
            </p>
            <p style={styles.emptyText}>
              {activeTab === 'wanted'
                ? 'Add items from any tracker\'s detail view!'
                : 'Check off items as you obtain them.'}
            </p>
          </div>
        ) : (
          Object.entries(displayGroups).map(([type, items]) => (
            <div key={type} style={styles.typeGroup}>
              <div style={styles.groupHeader}>
                <span style={{ fontSize: 18 }}>{TYPE_CONFIG[type].emoji}</span>
                <span style={styles.groupTitle}>{TYPE_CONFIG[type].label}</span>
                <span style={{
                  ...styles.groupCount,
                  background: `${TYPE_CONFIG[type].color}22`,
                  color: TYPE_CONFIG[type].color,
                }}>
                  {items.length}
                </span>
              </div>
              <div style={styles.itemGrid}>
                {items.map((item) => {
                  const key = `${item.type}-${item.name}`;
                  return (
                    <div
                      key={key}
                      onMouseEnter={() => setHoveredItem(key)}
                      onMouseLeave={() => setHoveredItem(null)}
                      style={{
                        ...styles.itemCard,
                        borderColor: hoveredItem === key ? 'rgba(94,200,80,0.3)' : 'rgba(94,200,80,0.1)',
                        background: hoveredItem === key ? 'rgba(12,28,14,1)' : 'rgba(12,28,14,0.95)',
                      }}
                    >
                      <div style={styles.itemLeft}>
                        <button
                          onClick={() => toggleObtained(item.type, item.name)}
                          onMouseEnter={() => setHoveredBtn(`check-${key}`)}
                          onMouseLeave={() => setHoveredBtn(null)}
                          style={{
                            ...styles.checkBtn,
                            background: item.obtained
                              ? 'rgba(94,200,80,0.2)'
                              : hoveredBtn === `check-${key}` ? 'rgba(94,200,80,0.1)' : 'transparent',
                            borderColor: item.obtained ? '#5ec850' : 'rgba(94,200,80,0.2)',
                            color: item.obtained ? '#5ec850' : 'transparent',
                          }}
                        >
                          {item.obtained ? '\u2713' : ''}
                        </button>
                        <AssetImg category={TYPE_CONFIG[item.type].assetCategory} name={item.name} size={28} />
                        <div style={styles.itemInfo}>
                          <span style={{
                            ...styles.itemName,
                            textDecoration: item.obtained ? 'line-through' : 'none',
                            opacity: item.obtained ? 0.6 : 1,
                          }}>
                            {item.name}
                          </span>
                          <span style={styles.itemDate}>
                            Added {new Date(item.addedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div style={styles.itemRight}>
                        <span style={{
                          ...styles.typeBadge,
                          background: `${TYPE_CONFIG[item.type].color}18`,
                          color: TYPE_CONFIG[item.type].color,
                          borderColor: `${TYPE_CONFIG[item.type].color}40`,
                        }}>
                          {TYPE_CONFIG[item.type].label}
                        </span>
                        <button
                          onClick={() => removeItem(item.type, item.name)}
                          onMouseEnter={() => setHoveredBtn(`rm-${key}`)}
                          onMouseLeave={() => setHoveredBtn(null)}
                          style={{
                            ...styles.removeBtn,
                            background: hoveredBtn === `rm-${key}` ? 'rgba(255,100,100,0.15)' : 'transparent',
                            color: hoveredBtn === `rm-${key}` ? '#ff6464' : '#5a7a50',
                          }}
                        >
                          \u2715
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a1a10',
    fontFamily: "'DM Sans', sans-serif",
    color: '#c8e6c0',
    padding: '24px 32px',
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 32,
    fontWeight: 900,
    color: '#5ec850',
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: '#5a7a50',
    marginTop: 4,
  },
  exportBtn: {
    padding: '10px 20px',
    background: 'rgba(74,172,240,0.1)',
    border: '1px solid rgba(74,172,240,0.25)',
    borderRadius: 8,
    color: '#4aacf0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
  },
  statsRow: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  statBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8,
  },
  statNumber: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 20,
    fontWeight: 500,
    color: '#4aacf0',
  },
  statLabel: {
    fontSize: 13,
    color: '#5a7a50',
  },
  addSection: {
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 18,
    fontWeight: 700,
    color: '#d4b030',
    margin: '0 0 12px 0',
  },
  typeRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  typeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  },
  searchWrap: {
    position: 'relative',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(94,200,80,0.15)',
    borderRadius: 8,
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'rgba(8,16,10,0.98)',
    border: '1px solid rgba(94,200,80,0.2)',
    borderRadius: 8,
    marginTop: 4,
    zIndex: 100,
    overflow: 'hidden',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '10px 14px',
    border: 'none',
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    cursor: 'pointer',
    outline: 'none',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
  },
  dropdownName: {
    flex: 1,
  },
  addedBadge: {
    fontSize: 11,
    fontFamily: "'DM Mono', monospace",
    color: '#5a7a50',
    padding: '2px 6px',
    background: 'rgba(94,200,80,0.08)',
    borderRadius: 4,
  },
  noResults: {
    padding: '12px 14px',
    color: '#5a7a50',
    fontSize: 13,
    fontStyle: 'italic',
  },
  tabRow: {
    display: 'flex',
    gap: 0,
    borderBottom: '1px solid rgba(94,200,80,0.1)',
    marginBottom: 20,
  },
  tabBtn: {
    padding: '10px 20px',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
  },
  listArea: {
    minHeight: 200,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
  },
  emptyTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 20,
    fontWeight: 700,
    color: '#5ec850',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#5a7a50',
  },
  typeGroup: {
    marginBottom: 24,
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  groupTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 16,
    fontWeight: 700,
    color: '#c8e6c0',
  },
  groupCount: {
    fontSize: 11,
    fontFamily: "'DM Mono', monospace",
    fontWeight: 500,
    padding: '2px 8px',
    borderRadius: 10,
  },
  itemGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  itemCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 8,
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  checkBtn: {
    width: 22,
    height: 22,
    borderRadius: 4,
    border: '1px solid rgba(94,200,80,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    outline: 'none',
    flexShrink: 0,
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  },
  itemInfo: {
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
  itemDate: {
    fontSize: 11,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  typeBadge: {
    fontSize: 11,
    fontFamily: "'DM Mono', monospace",
    fontWeight: 500,
    padding: '3px 8px',
    borderRadius: 6,
    border: '1px solid',
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, color 0.2s ease',
  },
};
