import React, { useState, useEffect } from 'react';
import { AssetImg } from '../assetHelper';

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

  // All genotypes sourced from ACNH-Helper-Suite/data/flowers.js
  // Colors verified against manifest.json and Nookipedia
  const flowerData = {
    Rose: {
      emoji: '🌹',
      genes: 4,
      seedColors: ['Red', 'White', 'Yellow'],
      colors: [
        { name: 'Red',    genes: 'RR-yy-WW-ss', source: 'seed',   hex: '#d63031', hasAsset: true },
        { name: 'White',  genes: 'rr-yy-WW-Ss', source: 'seed',   hex: '#f8f9fa', hasAsset: true },
        { name: 'Yellow', genes: 'rr-YY-WW-ss', source: 'seed',   hex: '#fdcb6e', hasAsset: true },
        { name: 'Pink',   genes: 'Rr-yy-WW-Ss', source: 'hybrid', hex: '#fd79a8', hasAsset: true },
        { name: 'Purple', genes: 'rr-yy-ww-Ss', source: 'hybrid', hex: '#a29bfe', hasAsset: true },
        { name: 'Orange', genes: 'RR-Yy-WW-ss', source: 'hybrid', hex: '#e17055', hasAsset: true },
        { name: 'Black',  genes: 'RR-yy-ww-ss', source: 'hybrid', hex: '#2d3436', hasAsset: true },
        { name: 'Blue',   genes: 'RR-YY-ww-ss', source: 'hybrid', hex: '#4aacf0', hasAsset: true },
        // Gold rose requires golden watering can on black rose — see Gold Rose section
        { name: 'Gold',   genes: 'RR-YY-ww-ss', source: 'special', hex: '#d4b030', hasAsset: true,
          note: 'Water Black roses with Golden Watering Can' },
        // Green rose has no manifest asset
        { name: 'Green',  genes: 'rr-YY-ww-ss', source: 'hybrid', hex: '#5ec850', hasAsset: false }
      ]
    },
    Tulip: {
      emoji: '🌷',
      genes: 3,
      seedColors: ['Red', 'White', 'Yellow'],
      colors: [
        { name: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#e74c3c', hasAsset: true },
        { name: 'White',  genes: 'rr-yy-WW', source: 'seed',   hex: '#ecf0f1', hasAsset: true },
        { name: 'Yellow', genes: 'RR-YY-ww', source: 'seed',   hex: '#f1c40f', hasAsset: true },
        { name: 'Pink',   genes: 'Rr-yy-WW', source: 'hybrid', hex: '#f48fb1', hasAsset: true },
        { name: 'Purple', genes: 'rr-yy-ww', source: 'hybrid', hex: '#9b59b6', hasAsset: true },
        { name: 'Orange', genes: 'RR-Yy-ww', source: 'hybrid', hex: '#e67e22', hasAsset: true },
        { name: 'Black',  genes: 'rr-yy-ww', source: 'hybrid', hex: '#34495e', hasAsset: true }
      ]
    },
    Pansy: {
      emoji: '🌸',
      genes: 3,
      // NO PINK PANSY — does not exist in the game
      seedColors: ['Red', 'White', 'Yellow'],
      colors: [
        { name: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#c0392b', hasAsset: true },
        { name: 'White',  genes: 'rr-yy-WW', source: 'seed',   hex: '#f5f6fa', hasAsset: true },
        { name: 'Yellow', genes: 'RR-YY-ww', source: 'seed',   hex: '#f9ca24', hasAsset: true },
        { name: 'Orange', genes: 'RR-Yy-ww', source: 'hybrid', hex: '#ff7f50', hasAsset: true },
        { name: 'Blue',   genes: 'rr-yy-ww', source: 'hybrid', hex: '#0984e3', hasAsset: true },
        { name: 'Purple', genes: 'rr-yy-ww', source: 'hybrid', hex: '#6c5ce7', hasAsset: true }
      ]
    },
    Cosmos: {
      emoji: '🌼',
      genes: 3,
      seedColors: ['Red', 'White', 'Yellow'],
      colors: [
        { name: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#e63946', hasAsset: true },
        { name: 'White',  genes: 'rr-yy-WW', source: 'seed',   hex: '#f0f0f0', hasAsset: true },
        { name: 'Yellow', genes: 'RR-YY-ww', source: 'seed',   hex: '#ffd60a', hasAsset: true },
        { name: 'Pink',   genes: 'Rr-yy-WW', source: 'hybrid', hex: '#ff69b4', hasAsset: true },
        { name: 'Orange', genes: 'RR-Yy-ww', source: 'hybrid', hex: '#f77f00', hasAsset: true },
        { name: 'Black',  genes: 'rr-yy-ww', source: 'hybrid', hex: '#1a1a2e', hasAsset: true }
      ]
    },
    Lily: {
      emoji: '🌺',
      genes: 3,
      seedColors: ['Red', 'White', 'Yellow'],
      colors: [
        { name: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#dc143c', hasAsset: true },
        { name: 'White',  genes: 'rr-yy-WW', source: 'seed',   hex: '#fffaf0', hasAsset: true },
        { name: 'Yellow', genes: 'RR-YY-ww', source: 'seed',   hex: '#ffeb3b', hasAsset: true },
        { name: 'Pink',   genes: 'Rr-yy-WW', source: 'hybrid', hex: '#ff1493', hasAsset: true },
        { name: 'Orange', genes: 'RR-Yy-ww', source: 'hybrid', hex: '#ff6347', hasAsset: true },
        { name: 'Black',  genes: 'rr-yy-ww', source: 'hybrid', hex: '#1c1c1c', hasAsset: true }
      ]
    },
    Hyacinth: {
      emoji: '💐',
      genes: 3,
      // Seed colors: Red, White, Yellow (Blue is also a seed color per Nookipedia)
      seedColors: ['Red', 'White', 'Yellow', 'Blue'],
      colors: [
        { name: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#ff0000', hasAsset: true },
        { name: 'White',  genes: 'rr-yy-WW', source: 'seed',   hex: '#ffffff', hasAsset: true },
        // Yellow hyacinth: RR-YY-ww (same pattern as other 3-gene species, seed from Nook's)
        { name: 'Yellow', genes: 'RR-YY-ww', source: 'seed',   hex: '#ffff00', hasAsset: true },
        // Blue is available as seed bag per Nookipedia
        { name: 'Blue',   genes: 'rr-yy-ww', source: 'seed',   hex: '#1e90ff', hasAsset: true },
        { name: 'Pink',   genes: 'Rr-yy-WW', source: 'hybrid', hex: '#ffc0cb', hasAsset: true },
        // Orange hyacinth: RR-Yy-ww (consistent with other 3-gene orange hybrid pattern)
        { name: 'Orange', genes: 'RR-Yy-ww', source: 'hybrid', hex: '#ff8c00', hasAsset: true },
        { name: 'Purple', genes: 'rr-yy-ww', source: 'hybrid', hex: '#800080', hasAsset: true }
      ]
    },
    Windflower: {
      emoji: '🪻',
      genes: 3,
      // Seed colors: Red, White, Orange — NO YELLOW WINDFLOWER
      seedColors: ['Red', 'White', 'Orange'],
      colors: [
        { name: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#b22222', hasAsset: true },
        { name: 'White',  genes: 'rr-yy-WW', source: 'seed',   hex: '#f5f5f5', hasAsset: true },
        // Orange is a SEED color for Windflower (not hybrid)
        { name: 'Orange', genes: 'RR-Yy-ww', source: 'seed',   hex: '#ff8c00', hasAsset: true },
        { name: 'Pink',   genes: 'Rr-yy-WW', source: 'hybrid', hex: '#dda0dd', hasAsset: true },
        { name: 'Blue',   genes: 'rr-yy-ww', source: 'hybrid', hex: '#4169e1', hasAsset: true },
        { name: 'Purple', genes: 'rr-yy-ww', source: 'hybrid', hex: '#dda0dd', hasAsset: true }
      ]
    },
    Mum: {
      emoji: '🌻',
      genes: 3,
      seedColors: ['Red', 'White', 'Yellow'],
      colors: [
        { name: 'Red',    genes: 'RR-yy-ww', source: 'seed',   hex: '#8b0000', hasAsset: true },
        { name: 'White',  genes: 'rr-yy-WW', source: 'seed',   hex: '#f0f8ff', hasAsset: true },
        { name: 'Yellow', genes: 'RR-YY-ww', source: 'seed',   hex: '#ffd700', hasAsset: true },
        { name: 'Pink',   genes: 'Rr-yy-WW', source: 'hybrid', hex: '#ff69b4', hasAsset: true },
        { name: 'Purple', genes: 'rr-yy-ww', source: 'hybrid', hex: '#ba55d3', hasAsset: true },
        { name: 'Green',  genes: 'rr-YY-ww', source: 'hybrid', hex: '#32cd32', hasAsset: true }
      ]
    }
  };

  // Blue Rose path from flowers.js blueRosePath
  const blueRoseSteps = [
    {
      title: 'Breed Seed Red + Seed Yellow',
      description: 'Plant seed red and seed yellow roses next to each other. They produce orange roses with special hybrid genes — these are NOT regular orange roses.',
      note: 'Seed Red × Seed Yellow → Special Orange Hybrids'
    },
    {
      title: 'Breed Special Orange Hybrids Together',
      description: 'Take two orange hybrid roses from Step 1 and breed them together. This produces a mix of colors including rare hybrid red roses.',
      note: 'Orange Hybrid × Orange Hybrid → Hybrid Red (rare)'
    },
    {
      title: 'Breed Hybrid Red + Hybrid Red',
      description: 'Breed two hybrid red roses together. This creates another generation of hybrid reds with more refined gene combinations.',
      note: 'Hybrid Red × Hybrid Red → Hybrid Red++'
    },
    {
      title: 'Breed Hybrid Red++ for Blue Rose',
      description: 'Continue breeding hybrid red roses. Blue roses appear at approximately 1/64 chance (~1.56%) per bloom cycle. Keep at it!',
      note: '~1.56% chance per bloom — estimated 4–6 weeks'
    }
  ];

  // Breeding paths sourced from flowers.js breedingPaths
  // Pansy: NO Pink path — Pink pansy does not exist
  const breedingPaths = {
    Rose: [
      { p1: 'Red',    p2: 'Red',    results: [{ color: 'Red', chance: 75 }, { color: 'Pink', chance: 25 }] },
      { p1: 'Red',    p2: 'White',  results: [{ color: 'Red', chance: 25 }, { color: 'White', chance: 25 }, { color: 'Pink', chance: 50 }] },
      { p1: 'Red',    p2: 'Yellow', results: [{ color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }, { color: 'Orange', chance: 50 }] },
      { p1: 'Yellow', p2: 'Yellow', results: [{ color: 'Yellow', chance: 100 }] },
      { p1: 'White',  p2: 'White',  results: [{ color: 'White', chance: 100 }] },
      { p1: 'Orange', p2: 'Orange', results: [{ color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }, { color: 'Orange', chance: 50 }] },
      { p1: 'Purple', p2: 'Purple', results: [{ color: 'Purple', chance: 100 }] },
      { p1: 'Pink',   p2: 'Pink',   results: [{ color: 'Red', chance: 25 }, { color: 'Pink', chance: 50 }, { color: 'White', chance: 25 }] }
    ],
    Tulip: [
      { p1: 'Red',    p2: 'Red',    results: [{ color: 'Red', chance: 75 }, { color: 'Pink', chance: 25 }] },
      { p1: 'Red',    p2: 'Yellow', results: [{ color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }, { color: 'Orange', chance: 50 }] },
      { p1: 'White',  p2: 'White',  results: [{ color: 'White', chance: 100 }] },
      { p1: 'Purple', p2: 'Purple', results: [{ color: 'Purple', chance: 100 }] },
      { p1: 'Orange', p2: 'Orange', results: [{ color: 'Orange', chance: 50 }, { color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }] }
    ],
    // Pansy has NO Pink — breeding paths updated accordingly
    Pansy: [
      { p1: 'White',  p2: 'White',  results: [{ color: 'White', chance: 100 }] },
      { p1: 'Yellow', p2: 'Yellow', results: [{ color: 'Yellow', chance: 100 }] },
      { p1: 'Red',    p2: 'Yellow', results: [{ color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }, { color: 'Orange', chance: 50 }] },
      { p1: 'Purple', p2: 'Purple', results: [{ color: 'Purple', chance: 100 }] },
      { p1: 'Blue',   p2: 'Blue',   results: [{ color: 'Blue', chance: 100 }] }
    ],
    Cosmos: [
      { p1: 'Red',    p2: 'Red',    results: [{ color: 'Red', chance: 75 }, { color: 'Pink', chance: 25 }] },
      { p1: 'Red',    p2: 'Yellow', results: [{ color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }, { color: 'Orange', chance: 50 }] },
      { p1: 'White',  p2: 'Red',    results: [{ color: 'Red', chance: 25 }, { color: 'White', chance: 25 }, { color: 'Pink', chance: 50 }] },
      { p1: 'Orange', p2: 'Orange', results: [{ color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }, { color: 'Orange', chance: 50 }] },
      { p1: 'Black',  p2: 'Black',  results: [{ color: 'Black', chance: 100 }] }
    ],
    Lily: [
      { p1: 'Red',    p2: 'Red',    results: [{ color: 'Red', chance: 75 }, { color: 'Pink', chance: 25 }] },
      { p1: 'White',  p2: 'White',  results: [{ color: 'White', chance: 100 }] },
      { p1: 'Yellow', p2: 'Yellow', results: [{ color: 'Yellow', chance: 100 }] },
      { p1: 'Red',    p2: 'Yellow', results: [{ color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }, { color: 'Orange', chance: 50 }] },
      { p1: 'Black',  p2: 'Black',  results: [{ color: 'Black', chance: 100 }] }
    ],
    Hyacinth: [
      { p1: 'Red',    p2: 'Red',    results: [{ color: 'Red', chance: 75 }, { color: 'Pink', chance: 25 }] },
      { p1: 'White',  p2: 'White',  results: [{ color: 'White', chance: 100 }] },
      { p1: 'Blue',   p2: 'Blue',   results: [{ color: 'Blue', chance: 100 }] },
      { p1: 'Red',    p2: 'Blue',   results: [{ color: 'Red', chance: 25 }, { color: 'Blue', chance: 25 }, { color: 'Purple', chance: 50 }] },
      { p1: 'Purple', p2: 'Purple', results: [{ color: 'Purple', chance: 100 }] },
      { p1: 'Red',    p2: 'Yellow', results: [{ color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }, { color: 'Orange', chance: 50 }] }
    ],
    // Windflower: Orange is a seed — Orange x Orange path valid, NO Yellow windflower
    Windflower: [
      { p1: 'Red',    p2: 'Red',    results: [{ color: 'Red', chance: 75 }, { color: 'Pink', chance: 25 }] },
      { p1: 'White',  p2: 'White',  results: [{ color: 'White', chance: 100 }] },
      { p1: 'Orange', p2: 'Orange', results: [{ color: 'Orange', chance: 75 }, { color: 'Red', chance: 25 }] },
      { p1: 'Red',    p2: 'White',  results: [{ color: 'Red', chance: 25 }, { color: 'White', chance: 25 }, { color: 'Pink', chance: 50 }] },
      { p1: 'Purple', p2: 'Purple', results: [{ color: 'Purple', chance: 100 }] },
      { p1: 'Blue',   p2: 'Blue',   results: [{ color: 'Blue', chance: 100 }] }
    ],
    Mum: [
      { p1: 'Red',    p2: 'Red',    results: [{ color: 'Red', chance: 75 }, { color: 'Pink', chance: 25 }] },
      { p1: 'White',  p2: 'White',  results: [{ color: 'White', chance: 100 }] },
      { p1: 'Yellow', p2: 'Yellow', results: [{ color: 'Yellow', chance: 100 }] },
      { p1: 'Red',    p2: 'Yellow', results: [{ color: 'Red', chance: 25 }, { color: 'Yellow', chance: 25 }, { color: 'Purple', chance: 50 }] },
      { p1: 'Purple', p2: 'Purple', results: [{ color: 'Purple', chance: 100 }] },
      { p1: 'Green',  p2: 'Green',  results: [{ color: 'Green', chance: 100 }] }
    ]
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
          hex: colorData ? colorData.hex : '#666',
          hasAsset: colorData ? colorData.hasAsset : false
        };
      });
      results.sort((a, b) => b.probability - a.probability);
      setOffspring(results);
    } else {
      setOffspring([{ name: 'No known breeding path', genes: 'Try different parents', probability: 0, hex: '#666', hasAsset: false }]);
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
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
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
      marginRight: '12px',
      flexShrink: 0
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
      marginLeft: '4px',
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
    specialTag: {
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
    },
    specialCard: {
      backgroundColor: 'rgba(212, 176, 48, 0.08)',
      border: '1px solid rgba(212, 176, 48, 0.4)',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    },
    infoBox: {
      backgroundColor: 'rgba(74, 172, 240, 0.08)',
      border: '1px solid rgba(74, 172, 240, 0.3)',
      borderRadius: '6px',
      padding: '12px 16px',
      fontSize: '13px',
      color: '#4aacf0',
      marginBottom: '16px'
    }
  };

  const getSourceTag = (source) => {
    if (source === 'seed') return { style: styles.seedTag, label: 'SEED' };
    if (source === 'special') return { style: styles.specialTag, label: 'SPECIAL' };
    return { style: styles.hybridTag, label: 'HYBRID' };
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
      `}</style>

      <div style={{ ...styles.header, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <AssetImg category="other" name="red-rose plant" size={32} />
        Flower Breeding Calculator
        <AssetImg category="other" name="blue-rose plant" size={32} />
      </div>

      <div style={styles.tabContainer}>
        {['calculator', 'gallery', 'blueRose', 'goldRose'].map(tab => (
          <button
            key={tab}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'calculator' && '🧪 Calculator'}
            {tab === 'gallery' && '🎨 Gallery'}
            {tab === 'blueRose' && '💙 Blue Rose'}
            {tab === 'goldRose' && '✨ Gold Rose'}
          </button>
        ))}
      </div>

      <div style={styles.speciesContainer}>
        {Object.keys(flowerData).map(species => (
          <button
            key={species}
            style={{ ...styles.speciesButton, ...(selectedSpecies === species ? styles.speciesButtonActive : {}) }}
            onClick={() => {
              setSelectedSpecies(species);
              setParent1(null);
              setParent2(null);
              setOffspring([]);
            }}
          >
            <AssetImg category="other" name={`red-${species.toLowerCase()} plant`} size={20} />
            {species}
          </button>
        ))}
      </div>

      {activeTab === 'calculator' && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>🧪 Breeding Calculator — {selectedSpecies}</div>

          {selectedSpecies === 'Pansy' && (
            <div style={styles.infoBox}>
              Note: Pink Pansy does not exist in Animal Crossing: New Horizons.
            </div>
          )}
          {selectedSpecies === 'Windflower' && (
            <div style={styles.infoBox}>
              Note: Yellow Windflower does not exist. Windflower seed colors are Red, White, and Orange.
            </div>
          )}

          <div style={styles.card}>
            <div style={{ marginBottom: '16px', fontSize: '14px', color: '#5ec850' }}>
              Select two parent colors to see offspring possibilities:
            </div>
            <div style={styles.colorGrid}>
              {currentFlower.colors.filter(c => c.source !== 'special').map(color => {
                const isSelected = parent1?.name === color.name || parent2?.name === color.name;
                return (
                  <div
                    key={color.name}
                    style={{ ...styles.colorBox, ...(isSelected ? styles.colorBoxActive : {}) }}
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
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', minHeight: '40px', alignItems: 'center' }}>
                      {color.hasAsset
                        ? <AssetImg category="other" name={`${color.name.toLowerCase()}-${selectedSpecies.toLowerCase()} plant`} size={36} />
                        : <div style={{ ...styles.colorSwatch, margin: '0 auto' , backgroundColor: color.hex }} />
                      }
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '500' }}>{color.name}</div>
                    {!color.hasAsset && (
                      <div style={{ fontSize: '10px', color: '#5a7a50', marginTop: '2px' }}>no image</div>
                    )}
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ ...styles.sourceTag, ...getSourceTag(color.source).style }}>
                        {getSourceTag(color.source).label}
                      </span>
                    </div>
                    <div style={styles.geneDisplay}>{color.genes}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {parent1 && parent2 && (
            <div style={styles.card}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#5ec850', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {parent1.hasAsset
                  ? <AssetImg category="other" name={`${parent1.name.toLowerCase()}-${selectedSpecies.toLowerCase()} plant`} size={24} />
                  : <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: parent1.hex, flexShrink: 0 }} />
                }
                <span>{parent1.name}</span>
                <span style={{ color: '#5a7a50' }}>×</span>
                {parent2.hasAsset
                  ? <AssetImg category="other" name={`${parent2.name.toLowerCase()}-${selectedSpecies.toLowerCase()} plant`} size={24} />
                  : <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: parent2.hex, flexShrink: 0 }} />
                }
                <span>{parent2.name}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#5ec850', marginBottom: '16px' }}>
                Possible offspring and approximate breeding rates:
              </div>
              {offspring.map(result => (
                <div key={result.name} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {result.hasAsset
                        ? <AssetImg category="other" name={`${result.name.toLowerCase()}-${selectedSpecies.toLowerCase()} plant`} size={20} />
                        : <div style={{ width: '20px', height: '20px', borderRadius: '3px', backgroundColor: result.hex }} />
                      }
                      <span style={{ fontWeight: '500' }}>{result.name}</span>
                    </div>
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
          <div style={styles.sectionTitle}>
            🎨 Color Gallery — {selectedSpecies}
          </div>

          {selectedSpecies === 'Pansy' && (
            <div style={styles.infoBox}>
              Pink Pansy does not exist in Animal Crossing: New Horizons.
            </div>
          )}
          {selectedSpecies === 'Windflower' && (
            <div style={styles.infoBox}>
              Yellow Windflower does not exist. Seed colors are Red, White, and Orange.
            </div>
          )}

          <div style={{ marginBottom: '12px', fontSize: '13px', color: '#5a7a50' }}>
            Seed colors: {currentFlower.seedColors.join(', ')} · Gene system: {currentFlower.genes}-gene
          </div>

          <div style={styles.card}>
            <div style={styles.colorGrid}>
              {currentFlower.colors.map(color => {
                const tag = getSourceTag(color.source);
                return (
                  <div
                    key={color.name}
                    style={{ ...styles.colorBox, ...(hoveredId === color.name ? styles.cardHover : {}) }}
                    onMouseEnter={() => setHoveredId(color.name)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', minHeight: '44px', alignItems: 'center' }}>
                      {color.hasAsset
                        ? <AssetImg category="other" name={`${color.name.toLowerCase()}-${selectedSpecies.toLowerCase()} plant`} size={40} />
                        : <div style={{ ...styles.colorSwatch, margin: '0 auto', backgroundColor: color.hex }} />
                      }
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{color.name}</div>
                    {!color.hasAsset && (
                      <div style={{ fontSize: '10px', color: '#5a7a50', marginTop: '2px' }}>no image available</div>
                    )}
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ ...styles.sourceTag, ...tag.style }}>{tag.label}</span>
                    </div>
                    <div style={styles.geneDisplay}>{color.genes}</div>
                    {color.note && (
                      <div style={{ fontSize: '10px', color: '#d4b030', marginTop: '4px' }}>
                        {color.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'blueRose' && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>💙 Blue Rose Breeding Path</div>

          <div style={styles.infoBox}>
            Blue Rose is the rarest hybrid in ACNH. The folklore method uses selective breeding across 4 generations of hybrid genetics. Estimated time: 4–6 weeks.
          </div>

          <div style={{ marginBottom: '12px', fontSize: '12px', color: '#4aacf0', fontFamily: '"DM Mono", monospace' }}>
            Click a step to mark your current progress:
          </div>

          <div style={styles.stepContainer}>
            {blueRoseSteps.map((step, idx) => (
              <div
                key={idx}
                style={{ ...styles.step, ...(blueRoseProgress === idx ? styles.stepActive : {}) }}
                onClick={() => updateBlueRoseProgress(idx)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={styles.stepNumber}>{idx + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#5ec850' }}>{step.title}</div>
                    <div style={{ fontSize: '12px', color: '#c8e6c0', marginTop: '4px' }}>
                      {step.description}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: '40px', alignItems: 'center' }}>
                  <AssetImg category="other" name="red-rose plant" size={24} />
                  {idx < 3
                    ? <AssetImg category="other" name="orange-rose plant" size={24} />
                    : <AssetImg category="other" name="blue-rose plant" size={24} />
                  }
                </div>
                <div style={styles.timeEstimate}>
                  Step {idx + 1} of 4 — {step.note}
                </div>
                {blueRoseProgress === idx && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#5ec850', fontWeight: 'bold' }}>
                    ← Currently working on this step
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'goldRose' && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>✨ Gold Rose — Special Mechanic</div>

          <div style={{ ...styles.infoBox, borderColor: 'rgba(212, 176, 48, 0.4)', color: '#d4b030', backgroundColor: 'rgba(212, 176, 48, 0.08)' }}>
            Gold Roses are NOT bred through standard cross-pollination. They require a special mechanic using the Golden Watering Can.
          </div>

          <div style={styles.specialCard}>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', fontWeight: 'bold', color: '#d4b030', marginBottom: '16px' }}>
              How to Get Gold Roses
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ ...styles.stepNumber, backgroundColor: '#d4b030', flexShrink: 0 }}>1</div>
                <div>
                  <div style={{ fontWeight: '600', color: '#c8e6c0', marginBottom: '4px' }}>Obtain Black Roses</div>
                  <div style={{ fontSize: '13px', color: '#5a7a50' }}>
                    Breed Black Roses using the standard hybrid method. Black Rose genotype: <span style={{ fontFamily: '"DM Mono", monospace', color: '#d4b030' }}>RR-yy-ww-ss</span>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <AssetImg category="other" name="black-rose plant" size={36} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ ...styles.stepNumber, backgroundColor: '#d4b030', flexShrink: 0 }}>2</div>
                <div>
                  <div style={{ fontWeight: '600', color: '#c8e6c0', marginBottom: '4px' }}>Obtain the Golden Watering Can</div>
                  <div style={{ fontSize: '13px', color: '#5a7a50' }}>
                    The Golden Watering Can is unlocked after achieving a 5-star island rating. It has 200 uses and can water up to 9 tiles in a 3×3 area.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ ...styles.stepNumber, backgroundColor: '#d4b030', flexShrink: 0 }}>3</div>
                <div>
                  <div style={{ fontWeight: '600', color: '#c8e6c0', marginBottom: '4px' }}>Water Black Roses with the Golden Watering Can</div>
                  <div style={{ fontSize: '13px', color: '#5a7a50' }}>
                    Use the Golden Watering Can on Black Roses. On the next day, watered Black Roses have a chance to produce a Gold Rose offspring.
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <AssetImg category="other" name="black-rose plant" size={32} />
                    <span style={{ color: '#d4b030', fontSize: '18px' }}>→</span>
                    <AssetImg category="other" name="gold-rose plant" size={32} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '12px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: '#d4b030', fontFamily: '"DM Mono", monospace', marginBottom: '4px' }}>
                Gold Rose genotype: RR-YY-ww-ss
              </div>
              <div style={{ fontSize: '12px', color: '#5a7a50' }}>
                Note: Gold Roses cannot breed further gold roses through standard watering — the Golden Watering Can method on Black Roses is the only way.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowerCalculator;
