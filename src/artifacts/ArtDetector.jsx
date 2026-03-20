'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AssetImg } from '../assetHelper';

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
  const [drawerArt, setDrawerArt] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerClosing, setDrawerClosing] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const drawerCache = useRef({});

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

  const openDrawer = useCallback(async (art) => {
    setDrawerArt(art);
    setDrawerClosing(false);
    setDrawerData(null);

    if (drawerCache.current[art.id]) {
      setDrawerData(drawerCache.current[art.id]);
      return;
    }

    setDrawerLoading(true);
    try {
      const encodedName = encodeURIComponent(art.name);
      const res = await fetch(`/api/nookipedia/nh/art/${encodedName}`);
      if (res.ok) {
        const data = await res.json();
        drawerCache.current[art.id] = data;
        setDrawerData(data);
      }
    } catch (err) {
      console.error('Failed to fetch art details:', err);
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerClosing(true);
    setTimeout(() => {
      setDrawerArt(null);
      setDrawerData(null);
      setDrawerClosing(false);
    }, 300);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (zoomOpen) { setZoomOpen(false); setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); return; }
        if (drawerArt) { closeDrawer(); }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [zoomOpen, drawerArt, closeDrawer]);

  const closeZoom = useCallback(() => {
    setZoomOpen(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

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
      outline: 'none',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
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
      outline: 'none',
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
      outline: 'none',
      transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
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
      outline: 'none',
      accentColor: '#5ec850',
    },
    checkboxLabel: {
      fontSize: '13px',
      color: '#5a7a50',
      cursor: 'pointer',
      outline: 'none',
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
      outline: 'none',
      transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
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
    drawerOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 1000,
      animation: 'artFadeIn 0.3s ease',
    },
    drawerOverlayClosing: {
      animation: 'artFadeOut 0.3s ease forwards',
    },
    drawer: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '520px',
      maxWidth: '90vw',
      backgroundColor: '#0a1a10',
      borderLeft: '2px solid rgba(94, 200, 80, 0.3)',
      zIndex: 1001,
      overflowY: 'auto',
      padding: '24px',
      animation: 'artDrawerSlideIn 0.3s ease',
      boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.5)',
    },
    drawerClosing: {
      animation: 'artDrawerSlideOut 0.3s ease forwards',
    },
    drawerCloseBtn: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      width: '36px',
      height: '36px',
      border: '1px solid rgba(94, 200, 80, 0.3)',
      borderRadius: '50%',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      color: '#c8e6c0',
      fontSize: '18px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'border-color 0.2s ease, background-color 0.2s ease',
      zIndex: 1002,
    },
    drawerTitle: {
      fontSize: '28px',
      fontFamily: '"Playfair Display", serif',
      fontWeight: '700',
      color: '#5ec850',
      margin: '0 0 20px 0',
      paddingRight: '40px',
    },
    comparisonContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '24px',
    },
    comparisonSingle: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '12px',
      marginBottom: '24px',
      maxWidth: '300px',
    },
    comparisonCard: {
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '8px',
      overflow: 'hidden',
      textAlign: 'center',
    },
    comparisonImage: {
      width: '100%',
      height: 'auto',
      display: 'block',
      backgroundColor: 'rgba(20, 40, 25, 0.5)',
      minHeight: '120px',
    },
    comparisonLabel: {
      padding: '8px',
      fontSize: '12px',
      fontWeight: '700',
      fontFamily: '"DM Mono", monospace',
      letterSpacing: '1px',
    },
    comparisonLabelReal: {
      color: '#5ec850',
      backgroundColor: 'rgba(94, 200, 80, 0.1)',
    },
    comparisonLabelFake: {
      color: '#e05050',
      backgroundColor: 'rgba(224, 80, 80, 0.1)',
    },
    genuineBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '700',
      fontFamily: '"DM Mono", monospace',
      backgroundColor: 'rgba(94, 200, 80, 0.15)',
      color: '#5ec850',
      border: '1px solid rgba(94, 200, 80, 0.4)',
      marginBottom: '20px',
    },
    compareButton: {
      width: '100%',
      padding: '10px 16px',
      backgroundColor: 'rgba(74, 172, 240, 0.15)',
      border: '1px solid rgba(74, 172, 240, 0.4)',
      borderRadius: '8px',
      color: '#4aacf0',
      fontSize: '14px',
      fontWeight: '700',
      fontFamily: '"DM Sans", sans-serif',
      cursor: 'pointer',
      outline: 'none',
      marginBottom: '20px',
      transition: 'background-color 0.2s ease',
    },
    drawerInfoSection: {
      marginBottom: '20px',
      padding: '16px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(212, 176, 48, 0.2)',
      borderRadius: '8px',
    },
    drawerInfoLabel: {
      fontSize: '11px',
      fontWeight: '700',
      fontFamily: '"DM Mono", monospace',
      color: '#5a7a50',
      margin: '0 0 4px 0',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
    },
    drawerInfoValue: {
      fontSize: '14px',
      color: '#d4b030',
      margin: '0 0 12px 0',
      lineHeight: '1.4',
    },
    drawerTypeBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600',
      fontFamily: '"DM Mono", monospace',
      backgroundColor: 'rgba(74, 172, 240, 0.15)',
      color: '#4aacf0',
      border: '1px solid rgba(74, 172, 240, 0.3)',
      marginBottom: '16px',
    },
    drawerPriceRow: {
      display: 'flex',
      gap: '16px',
      marginBottom: '20px',
    },
    drawerPriceCard: {
      flex: 1,
      padding: '12px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.15)',
      borderRadius: '6px',
      textAlign: 'center',
    },
    drawerPriceLabel: {
      fontSize: '11px',
      fontFamily: '"DM Mono", monospace',
      color: '#5a7a50',
      margin: '0 0 4px 0',
    },
    drawerPriceValue: {
      fontSize: '18px',
      fontWeight: '700',
      fontFamily: '"DM Mono", monospace',
      color: '#d4b030',
      margin: '0',
    },
    drawerWarningBox: {
      backgroundColor: 'rgba(212, 176, 48, 0.1)',
      border: '1px solid rgba(212, 176, 48, 0.3)',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px',
    },
    drawerWarningTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#d4b030',
      margin: '0 0 8px 0',
      fontFamily: '"Playfair Display", serif',
    },
    drawerWarningText: {
      fontSize: '13px',
      color: '#c8e6c0',
      margin: '0',
      lineHeight: '1.6',
    },
    drawerDescription: {
      fontSize: '13px',
      color: '#5a7a50',
      lineHeight: '1.6',
      margin: '0 0 20px 0',
      fontStyle: 'italic',
    },
    drawerDonatedRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '16px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '8px',
    },
    drawerLoading: {
      textAlign: 'center',
      padding: '40px 0',
      color: '#5a7a50',
      fontSize: '14px',
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

  const zoomStyles = {
    overlay: {
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)',
      zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'artZoomFadeIn 0.2s ease',
    },
    modal: {
      width: '95vw', maxWidth: '1400px', maxHeight: '95vh',
      backgroundColor: '#0a1a10', borderRadius: '12px', padding: '20px',
      position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px',
      overflow: 'hidden',
    },
    closeBtn: {
      position: 'absolute', top: '12px', right: '12px',
      background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
      width: '36px', height: '36px', borderRadius: '50%', fontSize: '18px',
      cursor: 'pointer', outline: 'none', zIndex: 1,
    },
    fakeTell: {
      backgroundColor: 'rgba(212,176,48,0.15)', border: '1px solid rgba(212,176,48,0.3)',
      borderRadius: '8px', padding: '12px 16px', color: '#d4b030',
      fontSize: '14px', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
    },
    zoomControls: {
      display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
    },
    zoomBtn: {
      padding: '6px 14px', backgroundColor: 'rgba(94,200,80,0.15)',
      border: '1px solid rgba(94,200,80,0.3)', borderRadius: '6px',
      color: '#5ec850', fontSize: '14px', fontWeight: '700',
      cursor: 'pointer', outline: 'none', fontFamily: "'DM Sans', sans-serif",
    },
    zoomLabel: {
      color: '#c8e6c0', fontSize: '13px', fontFamily: "'DM Mono', monospace", minWidth: '50px', textAlign: 'center',
    },
    imageContainer: {
      display: 'flex', gap: '12px', flex: 1, overflow: 'hidden', cursor: 'grab',
    },
    imageBox: {
      flex: 1, border: '2px solid', borderRadius: '8px', overflow: 'hidden',
      position: 'relative', backgroundColor: 'rgba(12,28,14,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '300px',
    },
    imageLabel: {
      position: 'absolute', top: '8px', left: '8px',
      padding: '4px 12px', borderRadius: '4px',
      backgroundColor: 'rgba(0,0,0,0.7)', color: '#5ec850',
      fontSize: '12px', fontWeight: '700', fontFamily: "'DM Mono', monospace",
      zIndex: 1,
    },
    zoomImage: {
      maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain',
      transition: 'transform 0.1s ease', userSelect: 'none',
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
          @keyframes artDrawerSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
          @keyframes artDrawerSlideOut { from { transform: translateX(0); } to { transform: translateX(100%); } }
          @keyframes artFadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes artFadeOut { from { opacity: 1; } to { opacity: 0; } }
          @keyframes artZoomFadeIn { from { opacity: 0; } to { opacity: 1; } }
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
                  onClick={() => openDrawer(art)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <AssetImg category="art" name={art.name} size={32} />
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
                  onClick={() => openDrawer(art)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <AssetImg category="art" name={art.name} size={32} />
                    <h3 style={styles.artName}>{art.name}</h3>
                  </div>

                  <p style={styles.artRealName}>"{art.realName}"</p>
                  <p style={styles.artArtist}>by {art.artist}</p>

                  <div style={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id={`donation-${art.id}`}
                      checked={collection[art.id] || false}
                      onChange={(e) => { e.stopPropagation(); toggleDonated(art.id); }}
                      style={styles.checkbox}
                    />
                    <label htmlFor={`donation-${art.id}`} style={styles.checkboxLabel} onClick={(e) => e.stopPropagation()}>
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
                    <AssetImg category="art" name={art.name} size={32} />
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
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '600', color: '#c8e6c0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AssetImg category="art" name={art.name} size={32} /> {art.name}
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
      {drawerArt && (
        <>
          <div
            style={{ ...styles.drawerOverlay, ...(drawerClosing ? styles.drawerOverlayClosing : {}) }}
            onClick={closeDrawer}
          />
          <div style={{ ...styles.drawer, ...(drawerClosing ? styles.drawerClosing : {}) }}>
            <button
              style={styles.drawerCloseBtn}
              onClick={closeDrawer}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#5ec850'; e.currentTarget.style.backgroundColor = 'rgba(94, 200, 80, 0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(94, 200, 80, 0.3)'; e.currentTarget.style.backgroundColor = 'rgba(12, 28, 14, 0.95)'; }}
            >
              ✕
            </button>

            <h2 style={styles.drawerTitle}>{drawerArt.name}</h2>

            {drawerLoading && (
              <div style={styles.drawerLoading}>
                <p>Loading art details...</p>
              </div>
            )}

            {!drawerLoading && drawerData && (
              <>
                {/* Real vs Fake Comparison */}
                {drawerData.has_fake && drawerData.fake_info?.image_url ? (
                  <>
                    <div style={styles.comparisonContainer}>
                      <div style={styles.comparisonCard}>
                        {drawerData.real_info?.image_url && (
                          <img
                            src={drawerData.real_info.texture_url || drawerData.real_info.image_url}
                            alt={`${drawerArt.name} - Real`}
                            style={styles.comparisonImage}
                            loading="lazy"
                          />
                        )}
                        <div style={{ ...styles.comparisonLabel, ...styles.comparisonLabelReal }}>
                          REAL
                        </div>
                      </div>
                      <div style={styles.comparisonCard}>
                        <img
                          src={drawerData.fake_info.texture_url || drawerData.fake_info.image_url}
                          alt={`${drawerArt.name} - Fake`}
                          style={styles.comparisonImage}
                          loading="lazy"
                        />
                        <div style={{ ...styles.comparisonLabel, ...styles.comparisonLabelFake }}>
                          FAKE
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setZoomOpen(true)}
                      style={styles.compareButton}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(74, 172, 240, 0.25)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(74, 172, 240, 0.15)'; }}
                    >
                      🔍 Compare Real vs Fake
                    </button>
                  </>
                ) : (
                  <div>
                    {drawerData.real_info?.image_url && (
                      <div style={styles.comparisonSingle}>
                        <div style={styles.comparisonCard}>
                          <img
                            src={drawerData.real_info.image_url}
                            alt={`${drawerArt.name} - Real`}
                            style={styles.comparisonImage}
                            loading="lazy"
                          />
                          <div style={{ ...styles.comparisonLabel, ...styles.comparisonLabelReal }}>
                            REAL
                          </div>
                        </div>
                      </div>
                    )}
                    <div style={styles.genuineBadge}>
                      Always Genuine ✓
                    </div>
                  </div>
                )}

                {/* Artwork Info */}
                <div style={styles.drawerInfoSection}>
                  <p style={styles.drawerInfoLabel}>Real Name</p>
                  <p style={styles.drawerInfoValue}>{drawerData.art_name || drawerArt.realName}</p>
                  <p style={styles.drawerInfoLabel}>Artist</p>
                  <p style={styles.drawerInfoValue}>{drawerData.author || drawerArt.artist}</p>
                  {drawerData.year && (
                    <>
                      <p style={styles.drawerInfoLabel}>Year</p>
                      <p style={styles.drawerInfoValue}>{drawerData.year}</p>
                    </>
                  )}
                  {drawerData.art_style && (
                    <>
                      <p style={styles.drawerInfoLabel}>Style</p>
                      <p style={{ ...styles.drawerInfoValue, margin: '0' }}>{drawerData.art_style}</p>
                    </>
                  )}
                </div>

                {/* Type Badge */}
                <div style={{ marginBottom: '16px' }}>
                  <span style={styles.drawerTypeBadge}>
                    {(drawerData.art_type || drawerArt.type).toUpperCase()}
                  </span>
                </div>

                {/* Prices */}
                {(drawerData.buy || drawerData.sell) && (
                  <div style={styles.drawerPriceRow}>
                    {drawerData.buy != null && (
                      <div style={styles.drawerPriceCard}>
                        <p style={styles.drawerPriceLabel}>BUY (from Redd)</p>
                        <p style={styles.drawerPriceValue}>{Number(drawerData.buy).toLocaleString()}</p>
                      </div>
                    )}
                    {drawerData.sell != null && (
                      <div style={styles.drawerPriceCard}>
                        <p style={styles.drawerPriceLabel}>SELL</p>
                        <p style={styles.drawerPriceValue}>{Number(drawerData.sell).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Fake Tell */}
                {drawerData.has_fake && drawerData.fake_info?.description && (
                  <div style={styles.drawerWarningBox}>
                    <p style={styles.drawerWarningTitle}>⚠️ How to Spot the Fake</p>
                    <p style={styles.drawerWarningText}>{drawerData.fake_info.description}</p>
                  </div>
                )}

                {/* Real Description */}
                {drawerData.real_info?.description && (
                  <p style={styles.drawerDescription}>{drawerData.real_info.description}</p>
                )}
              </>
            )}

            {/* Fallback when no API data (show local data) */}
            {!drawerLoading && !drawerData && (
              <>
                <div style={styles.drawerInfoSection}>
                  <p style={styles.drawerInfoLabel}>Real Name</p>
                  <p style={styles.drawerInfoValue}>{drawerArt.realName}</p>
                  <p style={styles.drawerInfoLabel}>Artist</p>
                  <p style={{ ...styles.drawerInfoValue, margin: '0' }}>{drawerArt.artist}</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <span style={styles.drawerTypeBadge}>{drawerArt.type.toUpperCase()}</span>
                </div>
                {drawerArt.alwaysReal && (
                  <div style={styles.genuineBadge}>Always Genuine ✓</div>
                )}
                {drawerArt.hasFake && drawerArt.fakeTell && (
                  <div style={styles.drawerWarningBox}>
                    <p style={styles.drawerWarningTitle}>⚠️ How to Spot the Fake</p>
                    <p style={styles.drawerWarningText}>{drawerArt.fakeTell}</p>
                  </div>
                )}
              </>
            )}

            {/* Donated Checkbox */}
            <div style={styles.drawerDonatedRow}>
              <input
                type="checkbox"
                id="drawer-donated"
                checked={collection[drawerArt.id] || false}
                onChange={() => toggleDonated(drawerArt.id)}
                style={styles.checkbox}
              />
              <label htmlFor="drawer-donated" style={{ ...styles.checkboxLabel, fontSize: '14px', color: '#c8e6c0' }}>
                {collection[drawerArt.id] ? 'Donated to Museum ✅' : 'Mark as Donated'}
              </label>
            </div>
          </div>
        </>
      )}

      {/* Zoom Modal */}
      {zoomOpen && drawerData && (
        <div style={zoomStyles.overlay} onClick={closeZoom}>
          <div style={zoomStyles.modal} onClick={e => e.stopPropagation()}>
            <button onClick={closeZoom} style={zoomStyles.closeBtn}>✕</button>

            <div style={zoomStyles.fakeTell}>
              ⚠ {drawerData.fake_info?.description || drawerArt?.fakeTell}
            </div>

            <div style={zoomStyles.zoomControls}>
              <button onClick={() => setZoomLevel(z => Math.max(1, z - 0.5))} style={zoomStyles.zoomBtn}>−</button>
              <span style={zoomStyles.zoomLabel}>{Math.round(zoomLevel * 100)}%</span>
              <button onClick={() => setZoomLevel(z => Math.min(5, z + 0.5))} style={zoomStyles.zoomBtn}>+</button>
              <button onClick={() => { setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); }} style={zoomStyles.zoomBtn}>Reset</button>
            </div>

            <div style={zoomStyles.imageContainer}
              onWheel={e => {
                e.preventDefault();
                setZoomLevel(z => Math.max(1, Math.min(5, z + (e.deltaY > 0 ? -0.2 : 0.2))));
              }}
              onMouseDown={e => { if (zoomLevel > 1) { setIsPanning(true); setPanStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y }); } }}
              onMouseMove={e => { if (isPanning) setPanPosition({ x: e.clientX - panStart.x, y: e.clientY - panStart.y }); }}
              onMouseUp={() => setIsPanning(false)}
              onMouseLeave={() => setIsPanning(false)}
            >
              <div style={{ ...zoomStyles.imageBox, borderColor: 'rgba(94,200,80,0.4)' }}>
                <div style={zoomStyles.imageLabel}>REAL</div>
                <img
                  src={drawerData.real_info?.texture_url || drawerData.real_info?.image_url}
                  alt="Real"
                  style={{
                    ...zoomStyles.zoomImage,
                    transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                  }}
                  draggable={false}
                />
              </div>
              <div style={{ ...zoomStyles.imageBox, borderColor: 'rgba(255,100,100,0.4)' }}>
                <div style={{ ...zoomStyles.imageLabel, color: '#ff6464' }}>FAKE</div>
                <img
                  src={drawerData.fake_info?.texture_url || drawerData.fake_info?.image_url}
                  alt="Fake"
                  style={{
                    ...zoomStyles.zoomImage,
                    transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                  }}
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtDetector;
