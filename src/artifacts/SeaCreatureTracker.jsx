'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AssetImg } from '../assetHelper';

const SEA_CREATURE_DATA = [
  { id: 1, name: "Seaweed", shadowSize: "Small", movementSpeed: "Stationary", sellPrice: 600, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🌱" },
  { id: 2, name: "Sea Grapes", shadowSize: "Small", movementSpeed: "Stationary", sellPrice: 900, northMonths: [4,5,6,7,8,9], southMonths: [10,11,12,1,2,3], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🍇" },
  { id: 3, name: "Sea Cucumber", shadowSize: "Medium", movementSpeed: "Stationary", sellPrice: 500, northMonths: [11,12,1,2,3], southMonths: [5,6,7,8,9], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🥒" },
  { id: 4, name: "Sea Pig", shadowSize: "Small", movementSpeed: "Very Fast", sellPrice: 10000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🐷" },
  { id: 5, name: "Sea Star", shadowSize: "Small", movementSpeed: "Stationary", sellPrice: 500, northMonths: [4,5,6,7,8,9], southMonths: [10,11,12,1,2,3], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "⭐" },
  { id: 6, name: "Sea Urchin", shadowSize: "Medium", movementSpeed: "Stationary", sellPrice: 1700, northMonths: [4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,10,11], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🔵" },
  { id: 7, name: "Slate Pencil Urchin", shadowSize: "Large", movementSpeed: "Stationary", sellPrice: 2000, northMonths: [1,2,3,9,10,11,12], southMonths: [3,4,5,6,7,8,9], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🔴" },
  { id: 8, name: "Sea Anemone", shadowSize: "Small", movementSpeed: "Stationary", sellPrice: 500, northMonths: [5,6,7,8,9,10], southMonths: [11,12,1,2,3,4], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🌺" },
  { id: 9, name: "Moon Jellyfish", shadowSize: "Small", movementSpeed: "Stationary", sellPrice: 600, northMonths: [7,8,9,10,11,12], southMonths: [1,2,3,4,5], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🪼" },
  { id: 10, name: "Sea Slug", shadowSize: "Small", movementSpeed: "Stationary", sellPrice: 600, northMonths: [1,2,3,4,11,12], southMonths: [5,6,7,8,9,10], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🐌" },
  { id: 11, name: "Pearl Oyster", shadowSize: "Small", movementSpeed: "Stationary", sellPrice: 2800, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🦪" },
  { id: 12, name: "Mussel", shadowSize: "Small", movementSpeed: "Stationary", sellPrice: 1500, northMonths: [6,7,8,9,10], southMonths: [12,1,2,3,4], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🐚" },
  { id: 13, name: "Oyster", shadowSize: "Small", movementSpeed: "Stationary", sellPrice: 1100, northMonths: [9,10,11,12,1,2,3,4,5], southMonths: [3,4,5,6,7,8,9], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🦪" },
  { id: 14, name: "Scallop", shadowSize: "Medium", movementSpeed: "Fast", sellPrice: 1200, northMonths: [12,1,2,3,4,5], southMonths: [6,7,8,9,10,11], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: true, emoji: "🐚" },
  { id: 15, name: "Turban Shell", shadowSize: "Small", movementSpeed: "Stationary", sellPrice: 1000, northMonths: [1,2,3,10,11,12], southMonths: [4,5,6,7,8,9], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🐢" },
  { id: 16, name: "Abalone", shadowSize: "Medium", movementSpeed: "Stationary", sellPrice: 2000, northMonths: [6,7,8,9,10,11], southMonths: [12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🦪" },
  { id: 17, name: "Gigas Giant Clam", shadowSize: "Large", movementSpeed: "Stationary", sellPrice: 15000, northMonths: [5,6,7,8,9], southMonths: [11,12,1,2,3], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🐚" },
  { id: 18, name: "Chambered Nautilus", shadowSize: "Medium", movementSpeed: "Slow", sellPrice: 1800, northMonths: [11,12,1,2,3], southMonths: [5,6,7,8,9], startHour: 16, endHour: 9, allDay: false, isPascalTrigger: false, emoji: "🐚" },
  { id: 19, name: "Octopus", shadowSize: "Large", movementSpeed: "Medium", sellPrice: 1200, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🐙" },
  { id: 20, name: "Umbrella Octopus", shadowSize: "Small", movementSpeed: "Slow", sellPrice: 6000, northMonths: [3,4,5,6,7,8,9], southMonths: [9,10,11,12,1,2,3], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🐙" },
  { id: 21, name: "Vampire Squid", shadowSize: "Medium", movementSpeed: "Slow", sellPrice: 10000, northMonths: [5,6,7,8,9,10,11,12], southMonths: [11,12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🦑" },
  { id: 22, name: "Firefly Squid", shadowSize: "Small", movementSpeed: "Fast", sellPrice: 1400, northMonths: [3,4,5], southMonths: [9,10,11], startHour: 21, endHour: 5, allDay: false, isPascalTrigger: false, emoji: "🦑" },
  { id: 23, name: "Gazami Crab", shadowSize: "Small", movementSpeed: "Medium", sellPrice: 2200, northMonths: [6,7,8,9,11,12], southMonths: [12,1,2,3,5], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🦀" },
  { id: 24, name: "Dungeness Crab", shadowSize: "Small", movementSpeed: "Medium", sellPrice: 1900, northMonths: [11,12,1,2,3,4], southMonths: [5,6,7,8,9,10], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🦀" },
  { id: 25, name: "Snow Crab", shadowSize: "Large", movementSpeed: "Slow", sellPrice: 6000, northMonths: [1,2,3,4], southMonths: [7,8,9,10], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🦀" },
  { id: 26, name: "Red King Crab", shadowSize: "Large", movementSpeed: "Medium", sellPrice: 8000, northMonths: [11,12,1,2,3,4], southMonths: [5,6,7,8,9,10], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🦀" },
  { id: 27, name: "Acorn Barnacle", shadowSize: "Small", movementSpeed: "Stationary", sellPrice: 600, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "⚪" },
  { id: 28, name: "Spider Crab", shadowSize: "Large", movementSpeed: "Medium", sellPrice: 12000, northMonths: [3,4,5], southMonths: [9,10,11], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🦀" },
  { id: 29, name: "Tiger Prawn", shadowSize: "Small", movementSpeed: "Medium", sellPrice: 3000, northMonths: [6,7,8,9,10], southMonths: [12,1,2,3,4], startHour: 16, endHour: 9, allDay: false, isPascalTrigger: false, emoji: "🦐" },
  { id: 30, name: "Sweet Shrimp", shadowSize: "Small", movementSpeed: "Medium", sellPrice: 1400, northMonths: [12,1,2], southMonths: [6,7,8], startHour: 9, endHour: 16, allDay: false, isPascalTrigger: false, emoji: "🦐" },
  { id: 31, name: "Mantis Shrimp", shadowSize: "Small", movementSpeed: "Fast", sellPrice: 2500, northMonths: [3,4,5,6,7,8,9,10,11], southMonths: [9,10,11,12,1,2,3], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🦐" },
  { id: 32, name: "Spiny Lobster", shadowSize: "Large", movementSpeed: "Stationary", sellPrice: 5000, northMonths: [10,11,12], southMonths: [4,5,6], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🦞" },
  { id: 33, name: "Lobster", shadowSize: "Large", movementSpeed: "Stationary", sellPrice: 4500, northMonths: [12,1,2,3], southMonths: [6,7,8,9], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🦞" },
  { id: 34, name: "Giant Isopod", shadowSize: "Large", movementSpeed: "Stationary", sellPrice: 12000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🪲" },
  { id: 35, name: "Horseshoe Crab", shadowSize: "Medium", movementSpeed: "Slow", sellPrice: 2500, northMonths: [7,8,9], southMonths: [1,2,3], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🦀" },
  { id: 36, name: "Sea Pineapple", shadowSize: "Small", movementSpeed: "Stationary", sellPrice: 1500, northMonths: [10,11,12,1,2,3], southMonths: [4,5,6,7,8,9], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🍍" },
  { id: 37, name: "Spotted Garden Eel", shadowSize: "Small", movementSpeed: "Medium", sellPrice: 1100, northMonths: [5,6,7,8,9,10], southMonths: [11,12,1,2,3,4], startHour: 9, endHour: 16, allDay: false, isPascalTrigger: false, emoji: "🐍" },
  { id: 38, name: "Flatworm", shadowSize: "Small", movementSpeed: "Slow", sellPrice: 700, northMonths: [6,7,8,9,10,11,12], southMonths: [12,1,2,3,4,5], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🦠" },
  { id: 39, name: "Venus' Flower Basket", shadowSize: "Medium", movementSpeed: "Stationary", sellPrice: 15000, northMonths: [10,11,12,1,2,3], southMonths: [4,5,6,7,8,9], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🌸" },
  { id: 40, name: "Whelk", shadowSize: "Small", movementSpeed: "Stationary", sellPrice: 1000, northMonths: [1,2,3,4,5,6,7,8,9,10,11,12], southMonths: [1,2,3,4,5,6,7,8,9,10,11,12], startHour: 0, endHour: 24, allDay: true, isPascalTrigger: false, emoji: "🐚" }
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getRarity = (price) => {
  if (price >= 10000) return 'Very Rare';
  if (price >= 5000) return 'Rare';
  if (price >= 2000) return 'Uncommon';
  return 'Common';
};

const RARITY_BG = {
  "Common": "rgba(143, 188, 143, 0.2)",
  "Uncommon": "rgba(94, 200, 80, 0.2)",
  "Rare": "rgba(74, 172, 240, 0.2)",
  "Very Rare": "rgba(160, 100, 220, 0.2)"
};

const RARITY_BORDER = {
  "Common": "rgba(143, 188, 143, 0.5)",
  "Uncommon": "rgba(94, 200, 80, 0.5)",
  "Rare": "rgba(74, 172, 240, 0.5)",
  "Very Rare": "rgba(160, 100, 220, 0.5)"
};

const RARITY_TEXT = {
  "Common": "#8fbc8f",
  "Uncommon": "#5ec850",
  "Rare": "#4aacf0",
  "Very Rare": "#a064dc"
};

export default function SeaCreatureTracker() {
  const [creatures, setCreatures] = useState([]);
  const [hemisphere, setHemisphere] = useState('north');
  const [searchTerm, setSearchTerm] = useState('');
  const [speedFilter, setSpeedFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [caughtStatus, setCaughtStatus] = useState({});
  const [selectedCreature, setSelectedCreature] = useState(null);
  const [creatureDetails, setCreatureDetails] = useState(null);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);
  const isLoaded = useRef(false);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await window.storage.get('acnh-sea-creature-tracker');
        if (stored) {
          const data = JSON.parse(stored.value);
          setHemisphere(data.hemisphere || 'north');
          setCaughtStatus(data.caughtStatus || {});
        }
      } catch (e) {
        console.error('Failed to load data', e);
      }
      setCreatures(SEA_CREATURE_DATA);
      isLoaded.current = true;
    };
    loadData();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (!isLoaded.current) return;
    const saveData = async () => {
      try {
        await window.storage.set('acnh-sea-creature-tracker', JSON.stringify({
          hemisphere,
          caughtStatus
        }));
      } catch (e) {
        console.error('Failed to save data', e);
      }
    };
    saveData();
  }, [hemisphere, caughtStatus]);

  // Drawer: fetch enriched data from Nookipedia proxy
  useEffect(() => {
    if (selectedCreature) {
      setCreatureDetails(null);
      fetch(`/api/nookipedia/nh/sea/${encodeURIComponent(selectedCreature.name)}`)
        .then(res => res.ok ? res.json() : null)
        .then(setCreatureDetails)
        .catch(() => setCreatureDetails(null));
    }
  }, [selectedCreature]);

  // Drawer: Escape key to close
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') closeDrawer(); };
    if (selectedCreature) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedCreature]);

  const closeDrawer = () => {
    setIsDrawerClosing(true);
    setTimeout(() => {
      setSelectedCreature(null);
      setCreatureDetails(null);
      setIsDrawerClosing(false);
    }, 200);
  };

  const getCurrentMonth = () => new Date().getMonth() + 1;
  const getCurrentHour = () => new Date().getHours();

  const isAvailableNow = (creature) => {
    const currentMonth = getCurrentMonth();
    const currentHour = getCurrentHour();
    const months = hemisphere === 'north' ? creature.northMonths : creature.southMonths;

    if (!months.includes(currentMonth)) return false;

    if (creature.allDay) return true;

    if (creature.startHour < creature.endHour) {
      return currentHour >= creature.startHour && currentHour < creature.endHour;
    } else {
      return currentHour >= creature.startHour || currentHour < creature.endHour;
    }
  };

  const getAvailabilityLabel = (creature) => {
    const months = hemisphere === 'north' ? creature.northMonths : creature.southMonths;
    if (!creature.allDay) {
      const start = creature.startHour.toString().padStart(2, '0');
      const end = creature.endHour.toString().padStart(2, '0');
      return `${start}:00 - ${end}:00`;
    }
    return 'All day';
  };

  const getSpeedValue = (speed) => {
    const speedMap = { 'Stationary': 1, 'Slow': 2, 'Medium': 3, 'Fast': 4, 'Very Fast': 5 };
    return speedMap[speed] || 1;
  };

  const getSpeedColor = (speed) => {
    const colorMap = {
      'Stationary': '#8fbc8f',
      'Slow': '#5ec850',
      'Medium': '#4aacf0',
      'Fast': '#d4b030',
      'Very Fast': '#ff6b6b'
    };
    return colorMap[speed] || '#999';
  };

  const getShadowEmoji = (size) => {
    const sizeMap = { 'Small': '⚪', 'Medium': '🔵', 'Large': '🔴' };
    return sizeMap[size] || '⚪';
  };

  const filteredCreatures = creatures.filter(creature => {
    if (searchTerm && !creature.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (speedFilter !== 'All' && creature.movementSpeed !== speedFilter) return false;

    if (availabilityFilter === 'Available Now' && !isAvailableNow(creature)) return false;
    if (availabilityFilter === 'Not Yet Caught' && caughtStatus[creature.id]) return false;

    return true;
  });

  const caughtCount = Object.values(caughtStatus).filter(Boolean).length;
  const progressPercent = creatures.length > 0 ? (caughtCount / creatures.length) * 100 : 0;

  const monthDots = (creature, month) => {
    const months = hemisphere === 'north' ? creature.northMonths : creature.southMonths;
    return months.includes(month);
  };

  const toggleCaught = (id) => {
    setCaughtStatus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const styles = {
    container: {
      width: '100%',
      backgroundColor: '#0a1a10',
      borderRadius: '12px',
      padding: '24px',
      fontFamily: '"DM Sans", sans-serif',
      color: '#c8e6c0',
      overflow: 'auto',
      maxHeight: '90vh'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '24px',
      gap: '12px',
      fontFamily: '"Playfair Display", serif'
    },
    headerTitle: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#d4b030',
      margin: 0
    },
    progressContainer: {
      marginBottom: '20px'
    },
    progressLabel: {
      fontSize: '12px',
      color: '#5a7a50',
      marginBottom: '6px'
    },
    progressBar: {
      height: '8px',
      backgroundColor: 'rgba(12,28,14,0.8)',
      borderRadius: '4px',
      overflow: 'hidden',
      border: '1px solid #5ec850'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#5ec850',
      transition: 'width 0.3s ease',
      width: `${progressPercent}%`
    },
    controls: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '16px',
      marginBottom: '20px'
    },
    controlGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#5a7a50',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      padding: '10px 12px',
      backgroundColor: 'rgba(12,28,14,0.8)',
      border: '1px solid #5ec850',
      borderRadius: '6px',
      color: '#c8e6c0',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '14px'
    },
    select: {
      padding: '10px 12px',
      backgroundColor: 'rgba(12,28,14,0.8)',
      border: '1px solid #5ec850',
      borderRadius: '6px',
      color: '#c8e6c0',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '14px',
      cursor: 'pointer',
      outline: 'none',
    },
    hemisphereToggle: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    toggleButton: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      outline: 'none',
      transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
      flex: 1,
      textAlign: 'center'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    card: {
      backgroundColor: 'rgba(12,28,14,0.95)',
      border: '1px solid rgba(94,200,80,0.3)',
      borderRadius: '8px',
      padding: '16px',
      transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
      cursor: 'pointer',
      outline: 'none',
      animation: 'fadeIn 0.3s ease'
    },
    cardName: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '8px',
      color: '#c8e6c0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    cardEmoji: {
      fontSize: '24px'
    },
    cardInfo: {
      fontSize: '12px',
      color: '#5a7a50',
      marginBottom: '12px',
      lineHeight: '1.6'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '4px'
    },
    speedBars: {
      display: 'flex',
      gap: '2px',
      alignItems: 'center'
    },
    speedBar: {
      height: '4px',
      width: '8px',
      backgroundColor: 'rgba(94,200,80,0.3)',
      borderRadius: '2px'
    },
    monthDots: {
      display: 'flex',
      gap: '4px',
      marginTop: '12px',
      flexWrap: 'wrap'
    },
    monthDot: {
      width: '14px',
      height: '14px',
      borderRadius: '50%',
      fontSize: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"DM Mono", monospace',
      fontWeight: 'bold'
    },
    caughtCheckbox: {
      marginTop: '12px',
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer',
      outline: 'none',
      accentColor: '#5ec850'
    },
    checkboxLabel: {
      fontSize: '13px',
      color: '#5a7a50'
    },
    stats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      marginTop: '24px',
      padding: '16px',
      backgroundColor: 'rgba(12,28,14,0.95)',
      border: '1px solid rgba(94,200,80,0.3)',
      borderRadius: '8px'
    },
    statItem: {
      textAlign: 'center'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#5ec850',
      fontFamily: '"DM Mono", monospace'
    },
    statLabel: {
      fontSize: '11px',
      color: '#5a7a50',
      marginTop: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    pascalBadge: {
      display: 'inline-block',
      fontSize: '14px',
      marginLeft: '4px'
    },
    availableBadge: {
      display: 'inline-block',
      padding: '2px 6px',
      backgroundColor: 'rgba(94,200,80,0.2)',
      border: '1px solid #5ec850',
      borderRadius: '4px',
      fontSize: '10px',
      color: '#5ec850',
      fontWeight: '600',
      marginTop: '8px'
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes seaDrawerSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes seaDrawerSlideOut { from { transform: translateX(0); } to { transform: translateX(100%); } }
        @keyframes seaFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes seaFadeOut { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={{ fontSize: '32px' }}>🤿</span>
          <h1 style={styles.headerTitle}>Sea Creature Tracker</h1>
        </div>

        <div style={styles.progressContainer}>
          <div style={styles.progressLabel}>Progress: {caughtCount} / {creatures.length} creatures caught</div>
          <div style={styles.progressBar}>
            <div style={styles.progressFill} />
          </div>
        </div>

        <div style={styles.controls}>
          <div style={styles.controlGroup}>
            <label style={styles.label}>Search</label>
            <input
              type="text"
              placeholder="Search creatures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.controlGroup}>
            <label style={styles.label}>Speed</label>
            <select value={speedFilter} onChange={(e) => setSpeedFilter(e.target.value)} style={styles.select}>
              <option>All</option>
              <option>Stationary</option>
              <option>Slow</option>
              <option>Medium</option>
              <option>Fast</option>
              <option>Very Fast</option>
            </select>
          </div>

          <div style={styles.controlGroup}>
            <label style={styles.label}>Availability</label>
            <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)} style={styles.select}>
              <option>All</option>
              <option>Available Now</option>
              <option>Not Yet Caught</option>
            </select>
          </div>
        </div>

        <div style={styles.controls}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={styles.label}>Hemisphere</label>
            <div style={styles.hemisphereToggle}>
              <button
                onClick={() => setHemisphere('north')}
                style={{
                  ...styles.toggleButton,
                  backgroundColor: hemisphere === 'north' ? '#5ec850' : 'rgba(12,28,14,0.8)',
                  color: hemisphere === 'north' ? '#000' : '#e0e0e0',
                  border: '1px solid #5ec850'
                }}
              >
                🌍 Northern
              </button>
              <button
                onClick={() => setHemisphere('south')}
                style={{
                  ...styles.toggleButton,
                  backgroundColor: hemisphere === 'south' ? '#5ec850' : 'rgba(12,28,14,0.8)',
                  color: hemisphere === 'south' ? '#000' : '#e0e0e0',
                  border: '1px solid #5ec850'
                }}
              >
                🌎 Southern
              </button>
            </div>
          </div>
        </div>

        <div style={styles.grid}>
          {filteredCreatures.map(creature => {
            const available = isAvailableNow(creature);
            const caught = caughtStatus[creature.id];
            const speedValue = getSpeedValue(creature.movementSpeed);
            const speedColor = getSpeedColor(creature.movementSpeed);

            return (
              <div
                key={creature.id}
                style={{
                  ...styles.card,
                  ...(available ? { borderColor: 'rgba(94,200,80,0.8)', boxShadow: '0 0 12px rgba(94,200,80,0.2)' } : {}),
                  ...(caught ? { opacity: 0.6 } : {})
                }}
                onClick={() => setSelectedCreature(creature)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(94,200,80,0.3)';
                  e.currentTarget.style.borderColor = 'rgba(94,200,80,0.6)';
                }}
                onMouseLeave={(e) => {
                  if (available) {
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(94,200,80,0.2)';
                    e.currentTarget.style.borderColor = 'rgba(94,200,80,0.8)';
                  } else {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'rgba(94,200,80,0.3)';
                  }
                }}
              >
                <div style={styles.cardName}>
                  <AssetImg category="sea-creatures" name={creature.name} size={32} />
                  <span>{creature.name}</span>
                  {creature.isPascalTrigger && <span style={styles.pascalBadge}>🦦</span>}
                </div>

                <div style={styles.cardInfo}>
                  <div style={styles.infoRow}>
                    <span>Shadow: {creature.shadowSize} {getShadowEmoji(creature.shadowSize)}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span>Speed: {creature.movementSpeed}</span>
                    <div style={styles.speedBars}>
                      {Array(speedValue).fill(0).map((_, i) => (
                        <div key={i} style={{ ...styles.speedBar, backgroundColor: speedColor }} />
                      ))}
                      {Array(5 - speedValue).fill(0).map((_, i) => (
                        <div key={i + speedValue} style={styles.speedBar} />
                      ))}
                    </div>
                  </div>
                  <div style={styles.infoRow}>
                    <span>Price:</span>
                    <span style={{ fontFamily: '"DM Mono", monospace', fontWeight: '600' }}>
                      💰 {creature.sellPrice.toLocaleString()}
                    </span>
                  </div>
                  <div style={styles.infoRow}>
                    <span>Hours: {getAvailabilityLabel(creature)}</span>
                  </div>
                </div>

                <div style={styles.monthDots}>
                  {Array(12).fill(0).map((_, i) => {
                    const month = i + 1;
                    const isAvailable = monthDots(creature, month);
                    return (
                      <div
                        key={month}
                        style={{
                          ...styles.monthDot,
                          backgroundColor: isAvailable ? '#5ec850' : 'rgba(94,200,80,0.2)',
                          color: isAvailable ? '#0a1a10' : '#666'
                        }}
                        title={MONTH_NAMES[i]}
                      >
                        {month}
                      </div>
                    );
                  })}
                </div>

                {available && <div style={styles.availableBadge}>✓ Available Now!</div>}

                <div style={styles.caughtCheckbox} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    id={`caught-${creature.id}`}
                    checked={caught || false}
                    onChange={() => toggleCaught(creature.id)}
                    style={styles.checkbox}
                  />
                  <label htmlFor={`caught-${creature.id}`} style={styles.checkboxLabel}>
                    {caught ? 'Caught' : 'Not caught'}
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.stats}>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{caughtCount}</div>
            <div style={styles.statLabel}>Caught</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{creatures.length - caughtCount}</div>
            <div style={styles.statLabel}>Remaining</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statValue}>{Math.round(progressPercent)}%</div>
            <div style={styles.statLabel}>Complete</div>
          </div>
        </div>
      </div>

      {selectedCreature && (() => {
        const creature = selectedCreature;
        const isCaught = caughtStatus[creature.id];
        const rarity = getRarity(creature.sellPrice);
        const hoursText = creature.allDay ? 'All Day' : `${creature.startHour}:00 - ${creature.endHour}:00`;
        const speedValue = getSpeedValue(creature.movementSpeed);
        const speedColor = getSpeedColor(creature.movementSpeed);

        return (
          <>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                zIndex: 9999,
                animation: isDrawerClosing ? 'seaFadeOut 0.2s ease-in forwards' : 'seaFadeIn 0.2s ease-out forwards',
              }}
              onClick={closeDrawer}
            />
            <div style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: typeof window !== 'undefined' && window.innerWidth < 600 ? '100%' : '420px',
              backgroundColor: '#0a1a10',
              borderLeft: '1px solid rgba(94, 200, 80, 0.3)',
              zIndex: 10000,
              overflowY: 'auto',
              padding: '24px',
              animation: isDrawerClosing ? 'seaDrawerSlideOut 0.2s ease-in forwards' : 'seaDrawerSlideIn 0.25s ease-out forwards',
            }}>
              {/* Close button */}
              <button
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(94, 200, 80, 0.1)',
                  border: '1px solid rgba(94, 200, 80, 0.3)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c8e6c0',
                  fontSize: '18px',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                }}
                onClick={closeDrawer}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(94, 200, 80, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(94, 200, 80, 0.1)'; }}
              >
                ✕
              </button>

              {/* Large sea creature sprite */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', marginBottom: '20px' }}>
                {creatureDetails?.render_url ? (
                  <img src={creatureDetails.render_url} alt={creature.name} style={{ width: 200, height: 200, objectFit: 'contain' }} loading="lazy" />
                ) : (
                  <AssetImg category="sea-creatures" name={creature.name} size={200} />
                )}
              </div>

              {/* Creature name */}
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '28px',
                fontWeight: '700',
                color: '#5ec850',
                textAlign: 'center',
                marginBottom: '12px',
              }}>
                {creature.name}
              </div>

              {/* Rarity badge */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{
                  display: 'inline-block',
                  backgroundColor: RARITY_BG[rarity],
                  border: `1px solid ${RARITY_BORDER[rarity]}`,
                  borderRadius: '16px',
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: RARITY_TEXT[rarity],
                }}>
                  {rarity}
                </span>
              </div>

              {/* Info grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px',
                marginBottom: '24px',
              }}>
                <div style={{
                  backgroundColor: 'rgba(94, 200, 80, 0.06)',
                  border: '1px solid rgba(94, 200, 80, 0.15)',
                  borderRadius: '8px',
                  padding: '12px',
                }}>
                  <div style={{ fontSize: '11px', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Shadow</div>
                  <div style={{ fontSize: '14px', color: '#c8e6c0', fontWeight: '500' }}>{getShadowEmoji(creature.shadowSize)} {creature.shadowSize}</div>
                </div>
                <div style={{
                  backgroundColor: 'rgba(94, 200, 80, 0.06)',
                  border: '1px solid rgba(94, 200, 80, 0.15)',
                  borderRadius: '8px',
                  padding: '12px',
                }}>
                  <div style={{ fontSize: '11px', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Speed</div>
                  <div style={{ fontSize: '14px', color: speedColor, fontWeight: '500' }}>{creature.movementSpeed}</div>
                  <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                    {Array(speedValue).fill(0).map((_, i) => (
                      <div key={i} style={{ height: '4px', width: '8px', backgroundColor: speedColor, borderRadius: '2px' }} />
                    ))}
                    {Array(5 - speedValue).fill(0).map((_, i) => (
                      <div key={i + speedValue} style={{ height: '4px', width: '8px', backgroundColor: 'rgba(94,200,80,0.3)', borderRadius: '2px' }} />
                    ))}
                  </div>
                </div>
                <div style={{
                  backgroundColor: 'rgba(94, 200, 80, 0.06)',
                  border: '1px solid rgba(94, 200, 80, 0.15)',
                  borderRadius: '8px',
                  padding: '12px',
                }}>
                  <div style={{ fontSize: '11px', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Sell Price</div>
                  <div style={{ fontSize: '14px', color: '#d4b030', fontWeight: '600', fontFamily: "'DM Mono', monospace" }}>{creature.sellPrice.toLocaleString()}</div>
                </div>
              </div>

              {/* Pascal trigger badge */}
              {creature.isPascalTrigger && (
                <div style={{
                  textAlign: 'center',
                  marginBottom: '24px',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(212, 176, 48, 0.1)',
                  border: '1px solid rgba(212, 176, 48, 0.3)',
                  borderRadius: '8px',
                }}>
                  <span style={{ color: '#d4b030', fontSize: '14px', fontWeight: '600' }}>
                    🐚 Give to Pascal for Mermaid DIY!
                  </span>
                </div>
              )}

              {/* Availability section */}
              <div style={{
                marginBottom: '24px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(94, 200, 80, 0.1)',
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Availability</div>

                <div style={{ fontSize: '14px', color: '#c8e6c0', marginBottom: '16px' }}>
                  ⏰ {hoursText}
                </div>

                {/* North months */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#5a7a50', marginBottom: '6px' }}>🌍 Northern Hemisphere</div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {MONTH_NAMES.map((month, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: creature.northMonths.includes(idx + 1) ? '#5ec850' : 'rgba(94,200,80,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '8px',
                          color: creature.northMonths.includes(idx + 1) ? '#0a1a10' : '#5a7a50',
                          fontWeight: '600',
                        }}>
                          {month.charAt(0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* South months */}
                <div>
                  <div style={{ fontSize: '11px', color: '#5a7a50', marginBottom: '6px' }}>🌏 Southern Hemisphere</div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {MONTH_NAMES.map((month, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: creature.southMonths.includes(idx + 1) ? '#5ec850' : 'rgba(94,200,80,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '8px',
                          color: creature.southMonths.includes(idx + 1) ? '#0a1a10' : '#5a7a50',
                          fontWeight: '600',
                        }}>
                          {month.charAt(0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Catchphrase from API */}
              {creatureDetails?.catchphrases?.[0] && (
                <div style={{
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(94, 200, 80, 0.1)',
                  marginBottom: '20px',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Catchphrase</div>
                  <div style={{
                    fontStyle: 'italic',
                    color: '#d4b030',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    padding: '12px',
                    backgroundColor: 'rgba(212, 176, 48, 0.06)',
                    border: '1px solid rgba(212, 176, 48, 0.15)',
                    borderRadius: '8px',
                  }}>
                    &ldquo;{creatureDetails.catchphrases[0]}&rdquo;
                  </div>
                </div>
              )}

              {/* Caught checkbox */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(94, 200, 80, 0.1)',
              }}>
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px',
                    backgroundColor: 'rgba(94, 200, 80, 0.06)',
                    border: '1px solid rgba(94, 200, 80, 0.15)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                  onClick={() => toggleCaught(creature.id)}
                >
                  <input
                    type="checkbox"
                    checked={isCaught || false}
                    onChange={() => toggleCaught(creature.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: '22px', height: '22px', cursor: 'pointer', outline: 'none', accentColor: '#5ec850' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: isCaught ? '#5ec850' : '#c8e6c0' }}>
                    {isCaught ? '✅ Caught' : 'Mark Caught'}
                  </span>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </>
  );
}
