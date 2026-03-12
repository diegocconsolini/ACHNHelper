import React, { useState, useEffect } from 'react';

const FlowerCalculator = () => {
  const [selectedSpecies, setSelectedSpecies] = useState('Rose');
  const [parent1, setParent1] = useState(null);
  const [parent2, setParent2] = useState(null);
  const [offspring, setOffspring] = useState([]);
  const [activeTab, setActiveTab] = useState('calculator');
  const [blueRoseProgress, setBlueRoseProgress] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const result = await window.storage.get('blueRoseProgress');
        if (result) {
          setBlueRoseProgress(parseInt(JSON.parse(result.value), 10));
        }
      } catch (err) {
        console.log('Storage not available');
      }
    };
    loadProgress();
  }, []);

  const flowerData = {
    Rose: {
      emoji: '🌹',
      genes: 4,
      colors: [
        { name: 'Red', genes: 'RR-YY-WW-ss', source: 'seed', hex: '#d63031' },
        { name: 'White', genes: 'rr-YY-WW-ss', source: 'seed', hex: '#f8f9fa' },
        { name: 'Yellow', genes: 'rr-yy-WW-ss', source: 'seed', hex: '#fdcb6e' },
        { name: 'Purple', genes: 'rr-YY-ww-ss', source: 'hybrid', hex: '#a29bfe' },
        { name: 'Black', genes: 'rr-yy-ww-ss', source: 'hybrid', hex: '#2d3436' },
        { name: 'Orange', genes: 'Rr-yy-WW-ss', source: 'hybrid', hex: '#e17055' },
        { name: 'Pink', genes: 'Rr-YY-WW-ss', source: 'hybrid', hex: '#fd79a8' },
        { name: 'Blue', genes: 'rr-yy-WW-SS', source: 'hybrid', hex: '#4aacf0' },
        { name: 'Gold', genes: 'Rr-yy-WW-SS', source: 'hybrid', hex: '#d4b030' },
        { name: 'Green', genes: 'rr-yy-ww-SS', source: 'hybrid', hex: '#5ec850' }
      ]
    },
    Tulip: {
      emoji: '🌷',
      genes: 3,
      colors: [
        { name: 'Red', genes: 'RR-YY-WW', source: 'seed', hex: '#e74c3c' },
        { name: 'Yellow', genes: 'rr-yy-WW', source: 'seed', hex: '#f1c40f' },
        { name: 'White', genes: 'rr-YY-WW', source: 'seed', hex: '#ecf0f1' },
        { name: 'Purple', genes: 'rr-YY-ww', source: 'hybrid', hex: '#9b59b6' },
        { name: 'Black', genes: 'rr-yy-ww', source: 'hybrid', hex: '#34495e' },
        { name: 'Orange', genes: 'Rr-yy-WW', source: 'hybrid', hex: '#e67e22' },
        { name: 'Pink', genes: 'Rr-YY-WW', source: 'hybrid', hex: '#f48fb1' }
      ]
    },
    Pansy: {
      emoji: '🌸',
      genes: 3,
      colors: [
        { name: 'Red', genes: 'RR-YY-WW', source: 'seed', hex: '#c0392b' },
        { name: 'Yellow', genes: 'rr-yy-WW', source: 'seed', hex: '#f9ca24' },
        { name: 'White', genes: 'rr-YY-WW', source: 'seed', hex: '#f5f6fa' },
        { name: 'Purple', genes: 'rr-YY-ww', source: 'hybrid', hex: '#6c5ce7' },
        { name: 'Black', genes: 'rr-yy-ww', source: 'hybrid', hex: '#2f3542' },
        { name: 'Orange', genes: 'Rr-yy-WW', source: 'hybrid', hex: '#ff7f50' },
        { name: 'Blue', genes: 'rr-YY-ww', source: 'hybrid', hex: '#0984e3' }
      ]
    },
    Cosmos: {
      emoji: '🌼',
      genes: 3,
      colors: [
        { name: 'Red', genes: 'RR-YY-WW', source: 'seed', hex: '#e63946' },
        { name: 'Yellow', genes: 'rr-yy-WW', source: 'seed', hex: '#ffd60a' },
        { name: 'White', genes: 'rr-YY-WW', source: 'seed', hex: '#f0f0f0' },
        { name: 'Orange', genes: 'Rr-yy-WW', source: 'hybrid', hex: '#f77f00' },
        { name: 'Black', genes: 'rr-yy-ww', source: 'hybrid', hex: '#1a1a2e' },
        { name: 'Pink', genes: 'Rr-YY-WW', source: 'hybrid', hex: '#ff69b4' }
      ]
    },
    Lily: {
      emoji: '🌺',
      genes: 3,
      colors: [
        { name: 'Red', genes: 'RR-YY-WW', source: 'seed', hex: '#dc143c' },
        { name: 'Yellow', genes: 'rr-yy-WW', source: 'seed', hex: '#ffeb3b' },
        { name: 'White', genes: 'rr-YY-WW', source: 'seed', hex: '#fffaf0' },
        { name: 'Orange', genes: 'Rr-yy-WW', source: 'hybrid', hex: '#ff6347' },
        { name: 'Black', genes: 'rr-yy-ww', source: 'hybrid', hex: '#1c1c1c' },
        { name: 'Pink', genes: 'Rr-YY-WW', source: 'hybrid', hex: '#ff1493' }
      ]
    },
    Hyacinth: {
      emoji: '💐',
      genes: 3,
      colors: [
        { name: 'Red', genes: 'RR-YY-WW', source: 'seed', hex: '#ff0000' },
        { name: 'Yellow', genes: 'rr-yy-WW', source: 'seed', hex: '#ffff00' },
        { name: 'White', genes: 'rr-YY-WW', source: 'seed', hex: '#ffffff' },
        { name: 'Purple', genes: 'rr-YY-ww', source: 'hybrid', hex: '#800080' },
        { name: 'Blue', genes: 'rr-yy-ww', source: 'hybrid', hex: '#1e90ff' },
        { name: 'Pink', genes: 'Rr-YY-WW', source: 'hybrid', hex: '#ffc0cb' }
      ]
    },
    Windflower: {
      emoji: '🪻',
      genes: 3,
      colors: [
        { name: 'Red', genes: 'RR-YY-WW', source: 'seed', hex: '#b22222' },
        { name: 'Yellow', genes: 'rr-yy-WW', source: 'seed', hex: '#daa520' },
        { name: 'White', genes: 'rr-YY-WW', source: 'seed', hex: '#f5f5f5' },
        { name: 'Purple', genes: 'rr-YY-ww', source: 'hybrid', hex: '#dda0dd' },
        { name: 'Blue', genes: 'rr-yy-ww', source: 'hybrid', hex: '#4169e1' },
        { name: 'Orange', genes: 'Rr-yy-WW', source: 'hybrid', hex: '#ff8c00' }
      ]
    },
    Mum: {
      emoji: '🌻',
      genes: 3,
      colors: [
        { name: 'Red', genes: 'RR-YY-WW', source: 'seed', hex: '#8b0000' },
        { name: 'Yellow', genes: 'rr-yy-WW', source: 'seed', hex: '#ffd700' },
        { name: 'White', genes: 'rr-YY-WW', source: 'seed', hex: '#f0f8ff' },
        { name: 'Purple', genes: 'rr-YY-ww', source: 'hybrid', hex: '#ba55d3' },
        { name: 'Pink', genes: 'Rr-YY-WW', source: 'hybrid', hex: '#ff69b4' },
        { name: 'Green', genes: 'rr-yy-ww', source: 'hybrid', hex: '#32cd32' }
      ]
    }
  };

  const blueRoseSteps = [
    { title: 'Breed Seed Red + Seed Yellow', description: 'Create Orange hybrids as base stock', flowers: '🌹🌹' },
    { title: 'Breed Orange Hybrids Together', description: 'Target Hybrid Red genotype', flowers: '🌹🌹' },
    { title: 'Breed Hybrid Reds for White', description: 'Generate white offspring base', flowers: '🌹🌹' },
    { title: 'Breed Special White for Blue', description: 'Final cross produces Blue Rose', flowers: '🌹💙' }
  ];

  const breedingPaths = {
    Rose: [
      { p1: 'Red', p2: 'Red', results: [{ color: 'Red', chance: 75 }, { color: 'Pink', chance: 25 }] },
      { p1: 'Red', p2: 'White', results: [{ color: 'Red', chance: 25 }, { color: 'White', chance: 25 }, { color: 'Pink', chance: 50 }] },
      { p1: 'Red', p2: 'Yellow', results: [{ color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }, { color: 'Orange', chance: 50 }] },
      { p1: 'Yellow', p2: 'Yellow', results: [{ color: 'Yellow', chance: 100 }] },
      { p1: 'White', p2: 'White', results: [{ color: 'White', chance: 100 }] },
      { p1: 'Orange', p2: 'Orange', results: [{ color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }, { color: 'Orange', chance: 50 }] },
      { p1: 'Purple', p2: 'Purple', results: [{ color: 'Purple', chance: 100 }] },
      { p1: 'Pink', p2: 'Pink', results: [{ color: 'Red', chance: 25 }, { color: 'Pink', chance: 50 }, { color: 'White', chance: 25 }] },
    ],
    Tulip: [
      { p1: 'Red', p2: 'Red', results: [{ color: 'Red', chance: 75 }, { color: 'Pink', chance: 25 }] },
      { p1: 'Red', p2: 'Yellow', results: [{ color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }, { color: 'Orange', chance: 50 }] },
      { p1: 'White', p2: 'White', results: [{ color: 'White', chance: 100 }] },
      { p1: 'Purple', p2: 'Purple', results: [{ color: 'Purple', chance: 100 }] },
      { p1: 'Orange', p2: 'Orange', results: [{ color: 'Orange', chance: 50 }, { color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }] },
    ],
    Pansy: [
      { p1: 'Red', p2: 'Red', results: [{ color: 'Red', chance: 75 }, { color: 'Pink', chance: 25 }] },
      { p1: 'White', p2: 'White', results: [{ color: 'White', chance: 100 }] },
      { p1: 'Yellow', p2: 'Yellow', results: [{ color: 'Yellow', chance: 100 }] },
      { p1: 'Red', p2: 'Yellow', results: [{ color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }, { color: 'Orange', chance: 50 }] },
      { p1: 'Purple', p2: 'Purple', results: [{ color: 'Purple', chance: 100 }] },
      { p1: 'Blue', p2: 'Blue', results: [{ color: 'Blue', chance: 100 }] },
    ],
    Cosmos: [
      { p1: 'Red', p2: 'Red', results: [{ color: 'Red', chance: 75 }, { color: 'Pink', chance: 25 }] },
      { p1: 'Red', p2: 'Yellow', results: [{ color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }, { color: 'Orange', chance: 50 }] },
      { p1: 'White', p2: 'Red', results: [{ color: 'Red', chance: 25 }, { color: 'White', chance: 25 }, { color: 'Pink', chance: 50 }] },
      { p1: 'Orange', p2: 'Orange', results: [{ color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }, { color: 'Orange', chance: 50 }] },
      { p1: 'Black', p2: 'Black', results: [{ color: 'Black', chance: 100 }] },
    ],
    Lily: [
      { p1: 'Red', p2: 'Red', results: [{ color: 'Red', chance: 75 }, { color: 'Pink', chance: 25 }] },
      { p1: 'White', p2: 'White', results: [{ color: 'White', chance: 100 }] },
      { p1: 'Yellow', p2: 'Yellow', results: [{ color: 'Yellow', chance: 100 }] },
      { p1: 'Red', p2: 'Yellow', results: [{ color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }, { color: 'Orange', chance: 50 }] },
      { p1: 'Black', p2: 'Black', results: [{ color: 'Black', chance: 100 }] },
    ],
    Hyacinth: [
      { p1: 'Red', p2: 'Red', results: [{ color: 'Red', chance: 75 }, { color: 'Pink', chance: 25 }] },
      { p1: 'White', p2: 'White', results: [{ color: 'White', chance: 100 }] },
      { p1: 'Blue', p2: 'Blue', results: [{ color: 'Blue', chance: 100 }] },
      { p1: 'Red', p2: 'Blue', results: [{ color: 'Red', chance: 25 }, { color: 'Blue', chance: 25 }, { color: 'Purple', chance: 50 }] },
      { p1: 'Purple', p2: 'Purple', results: [{ color: 'Purple', chance: 100 }] },
    ],
    Windflower: [
      { p1: 'Red', p2: 'Red', results: [{ color: 'Red', chance: 75 }, { color: 'Pink', chance: 25 }] },
      { p1: 'White', p2: 'White', results: [{ color: 'White', chance: 100 }] },
      { p1: 'Orange', p2: 'Orange', results: [{ color: 'Orange', chance: 75 }, { color: 'Red', chance: 25 }] },
      { p1: 'Red', p2: 'White', results: [{ color: 'Red', chance: 25 }, { color: 'White', chance: 25 }, { color: 'Pink', chance: 50 }] },
      { p1: 'Purple', p2: 'Purple', results: [{ color: 'Purple', chance: 100 }] },
      { p1: 'Blue', p2: 'Blue', results: [{ color: 'Blue', chance: 100 }] },
    ],
    Mum: [
      { p1: 'Red', p2: 'Red', results: [{ color: 'Red', chance: 75 }, { color: 'Pink', chance: 25 }] },
      { p1: 'White', p2: 'White', results: [{ color: 'White', chance: 100 }] },
      { p1: 'Yellow', p2: 'Yellow', results: [{ color: 'Yellow', chance: 100 }] },
      { p1: 'Red', p2: 'Yellow', results: [{ color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }, { color: 'Orange', chance: 50 }] },
      { p1: 'Purple', p2: 'Purple', results: [{ color: 'Purple', chance: 100 }] },
      { p1: 'Green', p2: 'Green', results: [{ color: 'Green', chance: 100 }] },
    ],
  };

  const calculateOffspring = (color1, color2) => {
    const paths = breedingPaths[selectedSpecies] || [];
    const match = paths.find(p =>
      (p.p1 === color1.name && p.p2 === color2.name) ||
      (p.p1 === color2.name && p.p2 === color1.name)
    );

    if (match) {
      const colors = flowerData[selectedSpecies].colors;
      const results = match.results.map(r => {
        const colorData = colors.find(c => c.name === r.color);
        return {
          name: r.color,
          genes: colorData ? colorData.genes : '???',
          probability: r.chance,
          hex: colorData ? colorData.hex : '#666'
        };
      });
      results.sort((a, b) => b.probability - a.probability);
      setOffspring(results);
    } else {
      setOffspring([{ name: 'No known breeding path', genes: 'Try different parents', probability: 0, hex: '#666' }]);
    }
  };

  const updateBlueRoseProgress = async (step) => {
    setBlueRoseProgress(step);
    try {
      await window.storage.set('blueRoseProgress', JSON.stringify(step));
    } catch (err) {
      console.log('Storage not available');
    }
  };

  const currentFlower = flowerData[selectedSpecies];

  const styles = {
    container: {
      fontFamily: '"DM Sans", sans-serif',
      backgroundColor: '#0a1a10',
      color: '#c8e6c0',
      minHeight: '100vh',
      padding: '20px',
      width: '100%',
      margin: '0 auto'
    },
    header: {
      fontFamily: '"Playfair Display", serif',
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '20px',
      textAlign: 'center',
      color: '#5ec850'
    },
    tabContainer: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      borderBottom: '1px solid rgba(94, 200, 80, 0.2)',
      paddingBottom: '12px',
      overflow: 'auto'
    },
    tab: {
      padding: '10px 16px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#5ec850',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    tabActive: {
      color: '#5ec850',
      borderBottomColor: '#5ec850',
      backgroundColor: 'rgba(94, 200, 80, 0.1)'
    },
    speciesContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      flexWrap: 'wrap'
    },
    speciesButton: {
      padding: '10px 16px',
      border: '2px solid rgba(94, 200, 80, 0.3)',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      color: '#5ec850',
      cursor: 'pointer',
      borderRadius: '6px',
      fontSize: '14px',
      transition: 'all 0.3s ease'
    },
    speciesButtonActive: {
      borderColor: '#5ec850',
      backgroundColor: 'rgba(94, 200, 80, 0.15)',
      color: '#5ec850'
    },
    card: {
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      transition: 'all 0.3s ease'
    },
    cardHover: {
      borderColor: '#5ec850',
      boxShadow: '0 0 12px rgba(94, 200, 80, 0.15)'
    },
    colorGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: '12px'
    },
    colorBox: {
      padding: '12px',
      borderRadius: '6px',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      backgroundColor: 'rgba(12, 28, 14, 0.8)',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    colorBoxActive: {
      borderColor: '#d4b030',
      boxShadow: '0 0 8px rgba(212, 176, 48, 0.3)'
    },
    colorSwatch: {
      width: '40px',
      height: '40px',
      borderRadius: '4px',
      margin: '0 auto 8px',
      border: '2px solid rgba(232, 245, 233, 0.1)'
    },
    offspringBar: {
      width: '100%',
      height: '24px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '6px'
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#5ec850',
      transition: 'width 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: '6px',
      color: '#0a1a10',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    stepContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    step: {
      padding: '16px',
      borderRadius: '6px',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      backgroundColor: 'rgba(12, 28, 14, 0.8)',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    stepActive: {
      backgroundColor: 'rgba(94, 200, 80, 0.15)',
      borderColor: '#5ec850',
      boxShadow: '0 0 12px rgba(94, 200, 80, 0.2)'
    },
    stepNumber: {
      display: 'inline-block',
      width: '28px',
      height: '28px',
      backgroundColor: '#5ec850',
      color: '#0a1a10',
      borderRadius: '50%',
      textAlign: 'center',
      lineHeight: '28px',
      fontWeight: 'bold',
      marginRight: '12px'
    },
    timeEstimate: {
      fontSize: '12px',
      color: '#4aacf0',
      marginTop: '8px',
      fontFamily: '"DM Mono", monospace'
    },
    geneDisplay: {
      fontFamily: '"DM Mono", monospace',
      fontSize: '12px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      padding: '8px',
      borderRadius: '4px',
      color: '#d4b030',
      marginTop: '6px',
      wordBreak: 'break-all'
    },
    sourceTag: {
      display: 'inline-block',
      padding: '2px 6px',
      fontSize: '10px',
      borderRadius: '3px',
      marginLeft: '8px',
      fontWeight: 'bold'
    },
    seedTag: {
      backgroundColor: '#4aacf0',
      color: '#0a1a10'
    },
    hybridTag: {
      backgroundColor: '#d4b030',
      color: '#0a1a10'
    },
    section: {
      marginBottom: '24px'
    },
    sectionTitle: {
      fontFamily: '"Playfair Display", serif',
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '16px',
      color: '#d4b030',
      paddingBottom: '8px',
      borderBottom: '1px solid rgba(212, 176, 48, 0.2)'
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
      `}</style>

      <div style={styles.header}>🌹 Flower Breeding Calculator 🌹</div>

      <div style={styles.tabContainer}>
        {['calculator', 'gallery', 'blueRose'].map(tab => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'calculator' && '🧪 Calculator'}
            {tab === 'gallery' && '🎨 Gallery'}
            {tab === 'blueRose' && '💙 Blue Rose'}
          </button>
        ))}
      </div>

      <div style={styles.speciesContainer}>
        {Object.keys(flowerData).map(species => (
          <button
            key={species}
            style={{
              ...styles.speciesButton,
              ...(selectedSpecies === species ? styles.speciesButtonActive : {})
            }}
            onClick={() => {
              setSelectedSpecies(species);
              setParent1(null);
              setParent2(null);
              setOffspring([]);
            }}
          >
            {flowerData[species].emoji} {species}
          </button>
        ))}
      </div>

      {activeTab === 'calculator' && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>🧪 Breeding Calculator</div>
          <div style={styles.card}>
            <div style={{ marginBottom: '16px', fontSize: '14px', color: '#5ec850' }}>
              Select two parent colors to see offspring possibilities:
            </div>
            <div style={styles.colorGrid}>
              {currentFlower.colors.map(color => (
                <div
                  key={color.name}
                  style={{
                    ...styles.colorBox,
                    ...(parent1?.name === color.name || parent2?.name === color.name
                      ? styles.colorBoxActive
                      : {})
                  }}
                  onClick={() => {
                    if (!parent1) {
                      setParent1(color);
                    } else if (!parent2 && parent1.name !== color.name) {
                      setParent2(color);
                      calculateOffspring(parent1, color);
                    } else {
                      setParent1(color);
                      setParent2(null);
                      setOffspring([]);
                    }
                  }}
                >
                  <div style={{ ...styles.colorSwatch, backgroundColor: color.hex }} />
                  <div style={{ fontSize: '12px', fontWeight: '500' }}>{color.name}</div>
                  <span style={{ ...styles.sourceTag, ...( color.source === 'seed' ? styles.seedTag : styles.hybridTag) }}>
                    {color.source === 'seed' ? 'SEED' : 'HYBRID'}
                  </span>
                  <div style={styles.geneDisplay}>{color.genes}</div>
                </div>
              ))}
            </div>
          </div>

          {parent1 && parent2 && (
            <div style={styles.card}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#5ec850' }}>
                {parent1.name} {currentFlower.emoji} × {parent2.name} {currentFlower.emoji}
              </div>
              <div style={{ fontSize: '12px', color: '#5ec850', marginBottom: '16px' }}>
                Possible offspring and approximate breeding rates:
              </div>
              {offspring.map(result => (
                <div key={result.name} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ fontWeight: '500' }}>{result.name}</div>
                    <div style={{ color: '#5ec850', fontWeight: 'bold' }}>{result.probability}%</div>
                  </div>
                  <div style={styles.offspringBar}>
                    <div style={{ ...styles.progressBar, width: `${result.probability}%` }}>
                      {result.probability > 15 && `${result.probability}%`}
                    </div>
                  </div>
                  <div style={styles.geneDisplay}>{result.genes}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'gallery' && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>🎨 {currentFlower.emoji} Color Gallery</div>
          <div style={styles.card}>
            <div style={styles.colorGrid}>
              {currentFlower.colors.map(color => (
                <div
                  key={color.name}
                  style={{
                    ...styles.colorBox,
                    ...(hoveredId === color.name ? styles.cardHover : {})
                  }}
                  onMouseEnter={() => setHoveredId(color.name)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div style={{ ...styles.colorSwatch, backgroundColor: color.hex }} />
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>{color.name}</div>
                  <span style={{ ...styles.sourceTag, ...( color.source === 'seed' ? styles.seedTag : styles.hybridTag) }}>
                    {color.source === 'seed' ? 'SEED' : 'HYBRID'}
                  </span>
                  <div style={styles.geneDisplay}>{color.genes}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'blueRose' && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>💙 Blue Rose Breeding Path</div>
          <div style={styles.card}>
            <div style={{ marginBottom: '12px', fontSize: '12px', color: '#4aacf0' }}>
              🕐 Estimated Time: 4-6 weeks of dedicated breeding
            </div>
            <div style={{ marginBottom: '20px', fontSize: '13px', color: '#5ec850' }}>
              Track your progress through the breeding steps:
            </div>
            <div style={styles.stepContainer}>
              {blueRoseSteps.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.step,
                    ...(blueRoseProgress === idx ? styles.stepActive : {})
                  }}
                  onClick={() => updateBlueRoseProgress(idx)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={styles.stepNumber}>{idx + 1}</div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#5ec850' }}>{step.title}</div>
                      <div style={{ fontSize: '12px', color: '#5ec850', marginTop: '4px' }}>
                        {step.description}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', marginLeft: '40px' }}>{step.flowers}</div>
                  <div style={styles.timeEstimate}>Step {idx + 1} of 4</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowerCalculator;
