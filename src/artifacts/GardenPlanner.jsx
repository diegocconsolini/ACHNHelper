import React, { useState, useEffect } from 'react';

const GardenPlanner = () => {
  const FLOWERS = {
    rose: { name: 'Rose', emoji: '🌹', colors: ['Red', 'Pink', 'White', 'Yellow', 'Orange', 'Purple', 'Black'] },
    tulip: { name: 'Tulip', emoji: '🌷', colors: ['Red', 'Yellow', 'White', 'Pink', 'Purple', 'Orange'] },
    pansy: { name: 'Pansy', emoji: '🌸', colors: ['Red', 'White', 'Yellow', 'Purple', 'Orange', 'Blue'] },
    cosmos: { name: 'Cosmos', emoji: '🌼', colors: ['Red', 'Pink', 'White', 'Orange', 'Yellow', 'Black'] },
    lily: { name: 'Lily', emoji: '🪻', colors: ['Red', 'White', 'Yellow', 'Pink', 'Orange', 'Black'] },
    hyacinth: { name: 'Hyacinth', emoji: '💐', colors: ['Red', 'Pink', 'White', 'Purple', 'Blue', 'Yellow'] },
    windflower: { name: 'Windflower', emoji: '🌺', colors: ['Red', 'Pink', 'White', 'Orange', 'Purple', 'Blue'] },
    mum: { name: 'Mum', emoji: '🏵️', colors: ['Red', 'White', 'Yellow', 'Pink', 'Purple', 'Green'] }
  };

  const TEMPLATES = {
    diamond: {
      name: 'Diamond Breeding',
      pattern: (size) => {
        const grid = Array(size).fill(null).map(() => Array(size).fill(null));
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            if ((i + j) % 2 === 0) grid[i][j] = { species: 'rose', color: 'Red' };
          }
        }
        return grid;
      }
    },
    row: {
      name: 'Row Breeding',
      pattern: (size) => {
        const grid = Array(size).fill(null).map(() => Array(size).fill(null));
        for (let i = 0; i < size; i += 2) {
          for (let j = 0; j < size; j++) {
            grid[i][j] = { species: 'rose', color: 'Red' };
          }
        }
        return grid;
      }
    },
    blueRose: {
      name: 'Blue Rose Farm',
      pattern: (size) => {
        const grid = Array(size).fill(null).map(() => Array(size).fill(null));
        const colors = ['Red', 'Yellow', 'White'];
        let colorIdx = 0;
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            if ((i + j) % 3 === 0) {
              grid[i][j] = { species: 'rose', color: colors[colorIdx % colors.length] };
              colorIdx++;
            }
          }
        }
        return grid;
      }
    },
    hybrid: {
      name: 'Hybrid Island',
      pattern: (size) => {
        const grid = Array(size).fill(null).map(() => Array(size).fill(null));
        for (let i = 1; i < size; i += 3) {
          for (let j = 1; j < size; j += 3) {
            grid[i][j] = { species: 'rose', color: 'Red' };
            if (j + 1 < size) grid[i][j + 1] = { species: 'rose', color: 'Yellow' };
          }
        }
        return grid;
      }
    }
  };

  const BREEDING_RULES = {
    rose: {
      Red: ['Pink', 'Orange', 'Purple'],
      Yellow: ['Orange'],
      White: ['Pink', 'Purple'],
      Pink: ['Red', 'Orange', 'Black'],
      Orange: ['Red', 'Yellow'],
      Purple: ['Red', 'White', 'Black'],
      Black: ['Pink', 'Purple']
    }
  };

  const [gridSize, setGridSize] = useState(10);
  const [grid, setGrid] = useState(() => Array(10).fill(null).map(() => Array(10).fill(null)));
  const [selectedSpecies, setSelectedSpecies] = useState('rose');
  const [selectedColor, setSelectedColor] = useState('Red');
  const [savedLayouts, setSavedLayouts] = useState([]);
  const [layoutName, setLayoutName] = useState('');
  const [hoveredBreedingPair, setHoveredBreedingPair] = useState(null);
  const [showBreedingInfo, setShowBreedingInfo] = useState(false);
  const [activeTab, setActiveTab] = useState('grid');

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const result = await window.storage.get('gardenLayouts');
        const layouts = result ? JSON.parse(result.value) : [];
        setSavedLayouts(layouts);
      } catch (e) {
        console.error('Failed to load layouts:', e.message);
      }
    };
    loadSaved();
  }, []);

  const handleCellClick = (row, col) => {
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = { species: selectedSpecies, color: selectedColor };
    setGrid(newGrid);
  };

  const handleCellRightClick = (e, row, col) => {
    e.preventDefault();
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = null;
    setGrid(newGrid);
  };

  const resizeGrid = (newSize) => {
    setGridSize(newSize);
    const newGrid = Array(newSize).fill(null).map(() => Array(newSize).fill(null));
    for (let i = 0; i < Math.min(newSize, grid.length); i++) {
      for (let j = 0; j < Math.min(newSize, grid[i].length); j++) {
        newGrid[i][j] = grid[i][j];
      }
    }
    setGrid(newGrid);
  };

  const applyTemplate = (templateKey) => {
    const template = TEMPLATES[templateKey];
    const newGrid = template.pattern(gridSize);
    setGrid(newGrid);
  };

  const clearGrid = () => {
    if (window.confirm('Clear the entire garden? This cannot be undone.')) {
      setGrid(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)));
    }
  };

  const getBreedingPairs = () => {
    const pairs = [];
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (!grid[i][j]) continue;
        if (i + 1 < grid.length && grid[i + 1][j]) {
          pairs.push({ pos1: [i, j], pos2: [i + 1, j] });
        }
        if (j + 1 < grid[i].length && grid[i][j + 1]) {
          pairs.push({ pos1: [i, j], pos2: [i, j + 1] });
        }
      }
    }
    return pairs;
  };

  const getPossibleOffspring = (flower1, flower2) => {
    if (flower1.species !== flower2.species) return [];
    const rules = BREEDING_RULES[flower1.species];
    if (!rules) return [];
    return rules[flower1.color] || [];
  };

  const saveLayout = async () => {
    if (!layoutName.trim()) return;
    const newLayout = {
      id: Date.now(),
      name: layoutName,
      grid: grid,
      gridSize: gridSize,
      timestamp: new Date().toLocaleDateString()
    };
    const updated = [...savedLayouts, newLayout];
    setSavedLayouts(updated);
    try {
      await window.storage.set('gardenLayouts', JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save garden layouts:", error);
    }    setLayoutName('');
  };

  const loadLayout = (layout) => {
    setGrid(layout.grid);
    setGridSize(layout.gridSize);
  };

  const deleteLayout = async (id) => {
    const updated = savedLayouts.filter(l => l.id !== id);
    setSavedLayouts(updated);
    try {
      await window.storage.set('gardenLayouts', JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save garden layouts:", error);
    }  };

  const getFlowerColor = (species, color) => {
    const colorMap = {
      Red: '#dc2626', Pink: '#ec4899', White: '#f5f5f5', Yellow: '#fbbf24',
      Orange: '#f97316', Purple: '#a855f7', Black: '#1f2937', Blue: '#3b82f6', Green: '#10b981'
    };
    return colorMap[color] || '#666';
  };

  const stats = {
    totalPlots: gridSize * gridSize,
    usedPlots: grid.flat().filter(c => c).length,
    emptyPlots: grid.flat().filter(c => !c).length,
    bySpecies: Object.keys(FLOWERS).reduce((acc, sp) => {
      acc[sp] = grid.flat().filter(c => c && c.species === sp).length;
      return acc;
    }, {})
  };

  const breedingPairs = getBreedingPairs();

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>🌿 Garden Planner</h1>
        <p style={styles.subtitle}>Design your perfect island garden layout</p>
      </div>

      <div style={styles.tabBar}>
        {['grid', 'palette', 'templates', 'stats', 'saved'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tabButton,
              borderBottomColor: activeTab === tab ? '#5ec850' : 'transparent',
              color: activeTab === tab ? '#5ec850' : '#a0b0a0'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeTab === 'grid' && (
          <div style={styles.gridSection}>
            <div style={styles.gridContainer}>
              <div style={styles.gridWrapper}>
                {grid.map((row, i) => (
                  <div key={i} style={styles.gridRow}>
                    {row.map((cell, j) => (
                      <div
                        key={`${i}-${j}`}
                        onContextMenu={(e) => handleCellRightClick(e, i, j)}
                        onClick={() => handleCellClick(i, j)}
                        onMouseEnter={() => {
                          const pair = breedingPairs.find(p =>
                            (p.pos1[0] === i && p.pos1[1] === j) || (p.pos2[0] === i && p.pos2[1] === j)
                          );
                          if (pair) setHoveredBreedingPair(pair);
                        }}
                        onMouseLeave={() => setHoveredBreedingPair(null)}
                        style={{
                          ...styles.gridCell,
                          backgroundColor: cell ? getFlowerColor(cell.species, cell.color) : 'rgba(94, 200, 80, 0.1)',
                          borderColor: hoveredBreedingPair && (
                            (hoveredBreedingPair.pos1[0] === i && hoveredBreedingPair.pos1[1] === j) ||
                            (hoveredBreedingPair.pos2[0] === i && hoveredBreedingPair.pos2[1] === j)
                          ) ? '#d4b030' : 'rgba(94, 200, 80, 0.3)',
                          cursor: 'pointer',
                          fontSize: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {cell && FLOWERS[cell.species].emoji}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.gridControls}>
              <div style={styles.controlGroup}>
                <label style={styles.label}>Grid Size:</label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={gridSize}
                  onChange={(e) => resizeGrid(parseInt(e.target.value))}
                  style={styles.slider}
                />
                <span style={styles.sizeDisplay}>{gridSize}x{gridSize}</span>
              </div>
              <button onClick={clearGrid} style={styles.dangerButton}>Clear Garden</button>
              <button onClick={() => setShowBreedingInfo(!showBreedingInfo)} style={styles.infoButton}>
                {showBreedingInfo ? 'Hide' : 'Show'} Breeding Pairs ({breedingPairs.length})
              </button>
            </div>

            {showBreedingInfo && breedingPairs.length > 0 && (
              <div style={styles.breedingInfo}>
                <h3 style={styles.infoTitle}>Breeding Pairs Detected</h3>
                {breedingPairs.slice(0, 5).map((pair, idx) => {
                  const f1 = grid[pair.pos1[0]][pair.pos1[1]];
                  const f2 = grid[pair.pos2[0]][pair.pos2[1]];
                  const offspring = getPossibleOffspring(f1, f2);
                  return (
                    <div key={idx} style={styles.pairInfo}>
                      <span>{FLOWERS[f1.species].emoji} {f1.color}</span>
                      <span style={styles.pairArrow}>→</span>
                      <span>{FLOWERS[f2.species].emoji} {f2.color}</span>
                      {offspring.length > 0 && (
                        <span style={styles.offspringText}>Can produce: {offspring.join(', ')}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'palette' && (
          <div style={styles.paletteSection}>
            <h2 style={styles.sectionTitle}>Flower Palette</h2>
            <div style={styles.flowersGrid}>
              {Object.entries(FLOWERS).map(([key, flower]) => (
                <div key={key} style={styles.flowerCard}>
                  <div style={styles.flowerEmoji}>{flower.emoji}</div>
                  <h3 style={styles.flowerName}>{flower.name}</h3>
                  <div style={styles.colorSwatches}>
                    {flower.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedSpecies(key);
                          setSelectedColor(color);
                        }}
                        style={{
                          ...styles.colorSwatch,
                          backgroundColor: getFlowerColor(key, color),
                          border: selectedSpecies === key && selectedColor === color ? '3px solid #d4b030' : '2px solid rgba(94, 200, 80, 0.5)'
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {selectedSpecies && (
              <div style={styles.selectedDisplay}>
                <div style={styles.selectedFlower}>
                  <div style={{ fontSize: '48px' }}>{FLOWERS[selectedSpecies].emoji}</div>
                  <div style={styles.selectedText}>{selectedColor} {FLOWERS[selectedSpecies].name}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div style={styles.templatesSection}>
            <h2 style={styles.sectionTitle}>Garden Templates</h2>
            <p style={styles.templateSubtext}>Load a pre-designed garden layout to get started</p>
            <div style={styles.templateGrid}>
              {Object.entries(TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => applyTemplate(key)}
                  style={styles.templateCard}
                >
                  <div style={styles.templateTitle}>{template.name}</div>
                  <div style={styles.templateDesc}>
                    {key === 'diamond' && 'Checkerboard pattern for maximum breeding pairs'}
                    {key === 'row' && 'Alternating rows for efficient spacing'}
                    {key === 'blueRose' && 'Optimized for blue rose hybrid breeding'}
                    {key === 'hybrid' && 'Isolated pairs for controlled breeding'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div style={styles.statsSection}>
            <h2 style={styles.sectionTitle}>Garden Statistics</h2>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Total Plots</div>
                <div style={styles.statValue}>{stats.totalPlots}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Used Plots</div>
                <div style={styles.statValue}>{stats.usedPlots}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Empty Plots</div>
                <div style={styles.statValue}>{stats.emptyPlots}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Utilization</div>
                <div style={styles.statValue}>{Math.round((stats.usedPlots / stats.totalPlots) * 100)}%</div>
              </div>
            </div>

            <h3 style={styles.subsectionTitle}>Flowers by Species</h3>
            <div style={styles.speciesBreakdown}>
              {Object.entries(stats.bySpecies).map(([species, count]) => (
                count > 0 && (
                  <div key={species} style={styles.speciesRow}>
                    <span>{FLOWERS[species].emoji} {FLOWERS[species].name}</span>
                    <span style={styles.speciesCount}>{count}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div style={styles.savedSection}>
            <h2 style={styles.sectionTitle}>Saved Layouts</h2>
            <div style={styles.saveForm}>
              <input
                type="text"
                placeholder="Enter layout name..."
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                style={styles.textInput}
              />
              <button onClick={saveLayout} style={styles.saveButton}>💾 Save Current</button>
            </div>

            {savedLayouts.length === 0 ? (
              <div style={styles.emptyState}>No saved layouts yet. Create and save your first garden!</div>
            ) : (
              <div style={styles.layoutsList}>
                {savedLayouts.map(layout => (
                  <div key={layout.id} style={styles.layoutCard}>
                    <div style={styles.layoutInfo}>
                      <div style={styles.layoutTitle}>{layout.name}</div>
                      <div style={styles.layoutMeta}>{layout.gridSize}x{layout.gridSize} grid • {layout.timestamp}</div>
                    </div>
                    <div style={styles.layoutActions}>
                      <button onClick={() => loadLayout(layout)} style={styles.loadButton}>Load</button>
                      <button onClick={() => deleteLayout(layout.id)} style={styles.deleteButton}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '900px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#0a1a10',
    color: '#e0e0e0',
    fontFamily: '"DM Sans", sans-serif',
    minHeight: '100vh',
    animation: 'fadeIn 0.6s ease-in-out'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid rgba(94, 200, 80, 0.3)'
  },
  title: {
    fontFamily: '"Playfair Display", serif',
    fontSize: '40px',
    margin: '0 0 8px 0',
    color: '#5ec850'
  },
  subtitle: {
    fontSize: '14px',
    color: '#a0b0a0',
    margin: 0
  },
  tabBar: {
    display: 'flex',
    gap: '30px',
    marginBottom: '30px',
    borderBottom: '1px solid rgba(94, 200, 80, 0.2)',
    paddingBottom: '0'
  },
  tabButton: {
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    color: '#a0b0a0',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '10px 0',
    transition: 'all 0.3s ease'
  },
  content: {
    animation: 'fadeIn 0.4s ease-in'
  },
  gridSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  gridContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    borderRadius: '8px',
    border: '1px solid rgba(94, 200, 80, 0.2)'
  },
  gridWrapper: {
    display: 'inline-block',
    padding: '10px',
    backgroundColor: 'rgba(10, 26, 16, 0.8)',
    borderRadius: '4px'
  },
  gridRow: {
    display: 'flex',
    gap: '2px'
  },
  gridCell: {
    width: '40px',
    height: '40px',
    border: '2px solid rgba(94, 200, 80, 0.3)',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  },
  gridControls: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    borderRadius: '8px',
    border: '1px solid rgba(94, 200, 80, 0.2)',
    flexWrap: 'wrap'
  },
  controlGroup: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#a0b0a0'
  },
  slider: {
    width: '120px',
    cursor: 'pointer',
    accentColor: '#5ec850'
  },
  sizeDisplay: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#5ec850',
    minWidth: '40px'
  },
  dangerButton: {
    padding: '8px 12px',
    backgroundColor: '#dc2626',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'background-color 0.2s ease'
  },
  infoButton: {
    padding: '8px 12px',
    backgroundColor: '#4aacf0',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'background-color 0.2s ease'
  },
  breedingInfo: {
    padding: '15px',
    backgroundColor: 'rgba(74, 172, 240, 0.1)',
    border: '1px solid rgba(74, 172, 240, 0.3)',
    borderRadius: '6px'
  },
  infoTitle: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    fontWeight: '700',
    color: '#4aacf0'
  },
  pairInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    fontSize: '13px',
    color: '#d0d0d0'
  },
  pairArrow: {
    color: '#5ec850',
    fontWeight: '700'
  },
  offspringText: {
    marginLeft: 'auto',
    color: '#a0b0a0',
    fontSize: '12px'
  },
  paletteSection: {
    animation: 'fadeIn 0.4s ease-in'
  },
  sectionTitle: {
    fontFamily: '"Playfair Display", serif',
    fontSize: '28px',
    margin: '0 0 20px 0',
    color: '#5ec850'
  },
  flowersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  },
  flowerCard: {
    padding: '15px',
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    border: '1px solid rgba(94, 200, 80, 0.2)',
    borderRadius: '8px',
    textAlign: 'center',
    transition: 'all 0.3s ease'
  },
  flowerEmoji: {
    fontSize: '32px',
    marginBottom: '10px'
  },
  flowerName: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#e0e0e0'
  },
  colorSwatches: {
    display: 'flex',
    gap: '5px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  colorSwatch: {
    width: '28px',
    height: '28px',
    borderRadius: '4px',
    border: '2px solid rgba(94, 200, 80, 0.5)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  selectedDisplay: {
    padding: '20px',
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    border: '2px solid #5ec850',
    borderRadius: '8px',
    textAlign: 'center'
  },
  selectedFlower: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  selectedText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#5ec850'
  },
  templatesSection: {
    animation: 'fadeIn 0.4s ease-in'
  },
  templateSubtext: {
    color: '#a0b0a0',
    marginBottom: '20px',
    fontSize: '13px'
  },
  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
  },
  templateCard: {
    padding: '20px',
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    border: '1px solid rgba(94, 200, 80, 0.2)',
    borderRadius: '8px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: '"DM Sans", sans-serif',
    color: '#e0e0e0'
  },
  templateTitle: {
    fontWeight: '700',
    marginBottom: '8px',
    color: '#5ec850'
  },
  templateDesc: {
    fontSize: '12px',
    color: '#a0b0a0',
    lineHeight: '1.5'
  },
  statsSection: {
    animation: 'fadeIn 0.4s ease-in'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  statCard: {
    padding: '20px',
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    border: '1px solid rgba(94, 200, 80, 0.2)',
    borderRadius: '8px',
    textAlign: 'center'
  },
  statLabel: {
    fontSize: '12px',
    color: '#a0b0a0',
    marginBottom: '8px'
  },
  statValue: {
    fontSize: '32px',
    fontFamily: '"DM Mono", monospace',
    fontWeight: '700',
    color: '#5ec850'
  },
  subsectionTitle: {
    fontFamily: '"Playfair Display", serif',
    fontSize: '18px',
    margin: '0 0 15px 0',
    color: '#5ec850'
  },
  speciesBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  speciesRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    border: '1px solid rgba(94, 200, 80, 0.2)',
    borderRadius: '6px',
    fontSize: '14px'
  },
  speciesCount: {
    fontFamily: '"DM Mono", monospace',
    fontWeight: '700',
    color: '#5ec850'
  },
  savedSection: {
    animation: 'fadeIn 0.4s ease-in'
  },
  saveForm: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  textInput: {
    flex: 1,
    padding: '10px',
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    border: '1px solid rgba(94, 200, 80, 0.2)',
    borderRadius: '6px',
    color: '#e0e0e0',
    fontSize: '13px',
    fontFamily: '"DM Sans", sans-serif'
  },
  saveButton: {
    padding: '10px 15px',
    backgroundColor: '#5ec850',
    border: 'none',
    borderRadius: '6px',
    color: '#0a1a10',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'background-color 0.2s ease'
  },
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#a0b0a0',
    fontSize: '14px'
  },
  layoutsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  layoutCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: 'rgba(12, 28, 14, 0.95)',
    border: '1px solid rgba(94, 200, 80, 0.2)',
    borderRadius: '6px'
  },
  layoutInfo: {
    flex: 1
  },
  layoutTitle: {
    fontWeight: '600',
    color: '#5ec850',
    marginBottom: '4px'
  },
  layoutMeta: {
    fontSize: '12px',
    color: '#a0b0a0'
  },
  layoutActions: {
    display: 'flex',
    gap: '8px'
  },
  loadButton: {
    padding: '6px 12px',
    backgroundColor: '#5ec850',
    border: 'none',
    borderRadius: '4px',
    color: '#0a1a10',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background-color 0.2s ease'
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#dc2626',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background-color 0.2s ease'
  }
};

export default GardenPlanner;
