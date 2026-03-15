'use client';

import React, { useState, useEffect } from 'react';
import { AssetImg } from '../assetHelper';

const SONGS = [
  { id: 1, name: "Agent K.K.", genre: "Rock", mood: ["Energetic", "Bold"], isHidden: false },
  { id: 2, name: "Aloha K.K.", genre: "World", mood: ["Upbeat", "Happy"], isHidden: false },
  { id: 3, name: "Animal City", genre: "Pop", mood: ["Upbeat", "Happy", "Energetic"], isHidden: true },
  { id: 4, name: "Bubblegum K.K.", genre: "Pop", mood: ["Upbeat", "Happy"], isHidden: false },
  { id: 5, name: "Café K.K.", genre: "Jazz", mood: ["Chill", "Peaceful", "Mellow"], isHidden: false },
  { id: 6, name: "Chillwave", genre: "Electronic", mood: ["Chill", "Peaceful"], isHidden: false },
  { id: 7, name: "Comrade K.K.", genre: "Electronic", mood: ["Bold", "Energetic"], isHidden: false },
  { id: 8, name: "DJ K.K.", genre: "Electronic", mood: ["Energetic", "Upbeat"], isHidden: false },
  { id: 9, name: "Drivin'", genre: "Soul/R&B", mood: ["Chill", "Peaceful"], isHidden: true },
  { id: 10, name: "Farewell", genre: "Ballad", mood: ["Sad", "Mellow", "Peaceful"], isHidden: true },
  { id: 11, name: "Forest Life", genre: "Pop", mood: ["Peaceful", "Chill"], isHidden: false },
  { id: 12, name: "Go K.K. Rider", genre: "Country", mood: ["Energetic", "Bold"], isHidden: false },
  { id: 13, name: "Hypno K.K.", genre: "Electronic", mood: ["Chill", "Upbeat"], isHidden: false },
  { id: 14, name: "I Love You", genre: "Ballad", mood: ["Romantic", "Peaceful"], isHidden: false },
  { id: 15, name: "Imperial K.K.", genre: "World", mood: ["Bold", "Energetic"], isHidden: false },
  { id: 16, name: "K.K. Adventure", genre: "Pop", mood: ["Upbeat", "Energetic"], isHidden: false },
  { id: 17, name: "K.K. Aria", genre: "Classical", mood: ["Peaceful", "Mellow"], isHidden: false },
  { id: 18, name: "K.K. Ballad", genre: "Ballad", mood: ["Romantic", "Peaceful"], isHidden: false },
  { id: 19, name: "K.K. Bashment", genre: "Electronic", mood: ["Energetic", "Upbeat"], isHidden: false },
  { id: 20, name: "K.K. Bazaar", genre: "World", mood: ["Energetic", "Upbeat"], isHidden: false },
  { id: 21, name: "K.K. Birthday", genre: "Pop", mood: ["Happy", "Upbeat"], isHidden: false },
  { id: 22, name: "K.K. Blues", genre: "Soul/R&B", mood: ["Sad", "Mellow"], isHidden: false },
  { id: 23, name: "K.K. Bossa", genre: "Jazz", mood: ["Chill", "Peaceful"], isHidden: false },
  { id: 24, name: "K.K. Break", genre: "Electronic", mood: ["Energetic", "Bold"], isHidden: false },
  { id: 25, name: "K.K. Calypso", genre: "World", mood: ["Energetic", "Happy"], isHidden: false },
  { id: 26, name: "K.K. Casbah", genre: "World", mood: ["Energetic", "Exotic"], isHidden: false },
  { id: 27, name: "K.K. Chorale", genre: "Classical", mood: ["Peaceful", "Spiritual"], isHidden: false },
  { id: 28, name: "K.K. Chorinho", genre: "World", mood: ["Upbeat", "Happy"], isHidden: false },
  { id: 29, name: "K.K. Condor", genre: "World", mood: ["Peaceful", "Chill"], isHidden: false },
  { id: 30, name: "K.K. Country", genre: "Country", mood: ["Upbeat", "Chill"], isHidden: false },
  { id: 31, name: "K.K. Cruisin'", genre: "Soul/R&B", mood: ["Chill", "Peaceful"], isHidden: false },
  { id: 32, name: "K.K. D&B", genre: "Electronic", mood: ["Energetic", "Upbeat"], isHidden: false },
  { id: 33, name: "K.K. Dirge", genre: "Ballad", mood: ["Sad", "Mellow"], isHidden: false },
  { id: 34, name: "K.K. Disco", genre: "Pop", mood: ["Energetic", "Upbeat", "Happy"], isHidden: false },
  { id: 35, name: "K.K. Dixie", genre: "Jazz", mood: ["Upbeat", "Energetic"], isHidden: false },
  { id: 36, name: "K.K. Dub", genre: "Electronic", mood: ["Chill", "Peaceful"], isHidden: false },
  { id: 37, name: "K.K. Étude", genre: "Classical", mood: ["Energetic", "Peaceful"], isHidden: false },
  { id: 38, name: "K.K. Faire", genre: "World", mood: ["Upbeat", "Happy"], isHidden: false },
  { id: 39, name: "K.K. Flamenco", genre: "World", mood: ["Energetic", "Upbeat"], isHidden: false },
  { id: 40, name: "K.K. Folk", genre: "Country", mood: ["Peaceful", "Mellow"], isHidden: false },
  { id: 41, name: "K.K. Fugue", genre: "Classical", mood: ["Peaceful", "Mellow"], isHidden: false },
  { id: 42, name: "K.K. Fusion", genre: "Jazz", mood: ["Energetic", "Upbeat"], isHidden: false },
  { id: 43, name: "K.K. Groove", genre: "Soul/R&B", mood: ["Energetic", "Upbeat"], isHidden: false },
  { id: 44, name: "K.K. Gumbo", genre: "Soul/R&B", mood: ["Upbeat", "Energetic"], isHidden: false },
  { id: 45, name: "K.K. Hop", genre: "Electronic", mood: ["Energetic", "Upbeat"], isHidden: false },
  { id: 46, name: "K.K. House", genre: "Electronic", mood: ["Energetic", "Upbeat"], isHidden: false },
  { id: 47, name: "K.K. Island", genre: "World", mood: ["Chill", "Peaceful"], isHidden: false },
  { id: 48, name: "K.K. Jazz", genre: "Jazz", mood: ["Chill", "Mellow"], isHidden: false },
  { id: 49, name: "K.K. Jongara", genre: "World", mood: ["Bold", "Energetic"], isHidden: false },
  { id: 50, name: "K.K. Khoomei", genre: "World", mood: ["Peaceful", "Exotic"], isHidden: false },
  { id: 51, name: "K.K. Lament", genre: "Ballad", mood: ["Sad", "Mellow"], isHidden: false },
  { id: 52, name: "K.K. Love Song", genre: "Ballad", mood: ["Romantic", "Mellow"], isHidden: false },
  { id: 53, name: "K.K. Lovers", genre: "Ballad", mood: ["Romantic", "Peaceful"], isHidden: false },
  { id: 54, name: "K.K. Lullaby", genre: "Classical", mood: ["Peaceful", "Mellow", "Chill"], isHidden: false },
  { id: 55, name: "K.K. Mambo", genre: "World", mood: ["Energetic", "Upbeat"], isHidden: false },
  { id: 56, name: "K.K. Marathon", genre: "Electronic", mood: ["Energetic", "Upbeat"], isHidden: false },
  { id: 57, name: "K.K. March", genre: "Pop", mood: ["Upbeat", "Energetic"], isHidden: false },
  { id: 58, name: "K.K. Mariachi", genre: "World", mood: ["Upbeat", "Happy"], isHidden: false },
  { id: 59, name: "K.K. Metal", genre: "Rock", mood: ["Energetic", "Bold"], isHidden: false },
  { id: 60, name: "K.K. Milonga", genre: "World", mood: ["Romantic", "Energetic"], isHidden: false },
  { id: 61, name: "K.K. Moody", genre: "Jazz", mood: ["Sad", "Mellow", "Chill"], isHidden: false },
  { id: 62, name: "K.K. Oasis", genre: "World", mood: ["Peaceful", "Mellow"], isHidden: false },
  { id: 63, name: "K.K. Parade", genre: "Pop", mood: ["Upbeat", "Happy", "Energetic"], isHidden: false },
  { id: 64, name: "K.K. Polka", genre: "World", mood: ["Upbeat", "Energetic"], isHidden: false },
  { id: 65, name: "K.K. Ragtime", genre: "Jazz", mood: ["Upbeat", "Energetic"], isHidden: false },
  { id: 66, name: "K.K. Rally", genre: "Pop", mood: ["Upbeat", "Energetic"], isHidden: false },
  { id: 67, name: "K.K. Reggae", genre: "World", mood: ["Chill", "Peaceful"], isHidden: false },
  { id: 68, name: "K.K. Robot Synth", genre: "Electronic", mood: ["Energetic", "Upbeat"], isHidden: false },
  { id: 69, name: "K.K. Rock", genre: "Rock", mood: ["Energetic", "Upbeat"], isHidden: false },
  { id: 70, name: "K.K. Rockabilly", genre: "Rock", mood: ["Energetic", "Upbeat"], isHidden: false },
  { id: 71, name: "K.K. Safari", genre: "World", mood: ["Upbeat", "Happy"], isHidden: false },
  { id: 72, name: "K.K. Salsa", genre: "World", mood: ["Energetic", "Upbeat", "Happy"], isHidden: false },
  { id: 73, name: "K.K. Samba", genre: "World", mood: ["Energetic", "Upbeat"], isHidden: false },
  { id: 74, name: "K.K. Ska", genre: "Rock", mood: ["Energetic", "Upbeat"], isHidden: false },
  { id: 75, name: "K.K. Slack-Key", genre: "World", mood: ["Chill", "Peaceful"], isHidden: false },
  { id: 76, name: "K.K. Sonata", genre: "Classical", mood: ["Peaceful", "Mellow"], isHidden: false },
  { id: 77, name: "K.K. Song", genre: "Ballad", mood: ["Romantic", "Peaceful"], isHidden: false },
  { id: 78, name: "K.K. Soul", genre: "Soul/R&B", mood: ["Upbeat", "Happy"], isHidden: false },
  { id: 79, name: "K.K. Steppe", genre: "World", mood: ["Peaceful", "Chill"], isHidden: false },
  { id: 80, name: "K.K. Stroll", genre: "Pop", mood: ["Chill", "Peaceful"], isHidden: false },
  { id: 81, name: "K.K. Swing", genre: "Jazz", mood: ["Upbeat", "Energetic"], isHidden: false },
  { id: 82, name: "K.K. Synth", genre: "Electronic", mood: ["Upbeat", "Energetic"], isHidden: false },
  { id: 83, name: "K.K. Tango", genre: "World", mood: ["Romantic", "Energetic"], isHidden: false },
  { id: 84, name: "K.K. Technopop", genre: "Electronic", mood: ["Energetic", "Upbeat"], isHidden: false },
  { id: 85, name: "K.K. Waltz", genre: "Classical", mood: ["Romantic", "Peaceful", "Mellow"], isHidden: false },
  { id: 86, name: "K.K. Western", genre: "Country", mood: ["Bold", "Energetic"], isHidden: false },
  { id: 87, name: "King K.K.", genre: "Rock", mood: ["Bold", "Energetic"], isHidden: false },
  { id: 88, name: "Lucky K.K.", genre: "Pop", mood: ["Happy", "Upbeat"], isHidden: false },
  { id: 89, name: "Marine Song 2001", genre: "Ballad", mood: ["Romantic", "Peaceful"], isHidden: false },
  { id: 90, name: "Mountain Song", genre: "Pop", mood: ["Peaceful", "Chill"], isHidden: false },
  { id: 91, name: "Mr. K.K.", genre: "Jazz", mood: ["Chill", "Mellow"], isHidden: false },
  { id: 92, name: "My Place", genre: "Ballad", mood: ["Romantic", "Peaceful"], isHidden: false },
  { id: 93, name: "Neapolitan", genre: "Classical", mood: ["Peaceful", "Elegant"], isHidden: false },
  { id: 94, name: "Only Me", genre: "Ballad", mood: ["Romantic", "Peaceful", "Mellow"], isHidden: false },
  { id: 95, name: "Pondering", genre: "Ballad", mood: ["Peaceful", "Mellow"], isHidden: false },
  { id: 96, name: "Rockin' K.K.", genre: "Rock", mood: ["Energetic", "Bold"], isHidden: false },
  { id: 97, name: "Soulful K.K.", genre: "Soul/R&B", mood: ["Chill", "Peaceful"], isHidden: false },
  { id: 98, name: "Space K.K.", genre: "Electronic", mood: ["Bold", "Energetic"], isHidden: false },
  { id: 99, name: "Spring Blossoms", genre: "Ballad", mood: ["Romantic", "Peaceful"], isHidden: false },
  { id: 100, name: "Stale Cupcakes", genre: "Pop", mood: ["Quirky", "Happy"], isHidden: false },
  { id: 101, name: "Steep Hill", genre: "Pop", mood: ["Upbeat", "Happy"], isHidden: false },
  { id: 102, name: "Surfin' K.K.", genre: "Rock", mood: ["Upbeat", "Energetic"], isHidden: false },
  { id: 103, name: "The K. Funk", genre: "Soul/R&B", mood: ["Energetic", "Upbeat"], isHidden: false },
  { id: 104, name: "To the Edge", genre: "Rock", mood: ["Bold", "Energetic"], isHidden: false },
  { id: 105, name: "Two Days Ago", genre: "Ballad", mood: ["Romantic", "Peaceful"], isHidden: false },
  { id: 106, name: "Wandering", genre: "Ballad", mood: ["Peaceful", "Mellow"], isHidden: false },
  { id: 107, name: "Welcome Horizons", genre: "Pop", mood: ["Upbeat", "Happy"], isHidden: false },
];

const GENRES = ["All", "Rock", "Pop", "Jazz", "Classical", "Electronic", "World", "Country", "Soul/R&B", "Ballad"];
const MOODS = ["Energetic", "Bold", "Upbeat", "Happy", "Chill", "Peaceful", "Mellow", "Romantic", "Sad", "Elegant", "Spiritual", "Exotic", "Quirky"];
const HIDDEN_SONGS = [
  { id: 3, name: "Animal City", unlock: "Request by name during K.K. concert" },
  { id: 9, name: "Drivin'", unlock: "Request by name during K.K. concert" },
  { id: 10, name: "Farewell", unlock: "Request by name during K.K. concert" },
];

export default function KKCatalogue() {
  const [activeTab, setActiveTab] = useState('catalogue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [collectedSongs, setCollectedSongs] = useState(new Set());
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [hoveredSongId, setHoveredSongId] = useState(null);

  useEffect(() => {
    loadCollectedSongs();
    loadWallPlan();
  }, []);

  const loadCollectedSongs = async () => {
    try {
      const result = await window.storage.get('kkCollection');
      const data = result ? JSON.parse(result.value) : [];
      setCollectedSongs(new Set(data));
    } catch (err) {
      console.error('Error loading collected songs:', err);
      setCollectedSongs(new Set());
    }
  };

  const loadWallPlan = async () => {
    try {
      const result = await window.storage.get('kkWallPlan');
      const data = result ? JSON.parse(result.value) : [];
      setRooms(data);
    } catch (err) {
      console.error('Error loading wall plan:', err);
      setRooms([]);
    }
  };

  const saveCollectedSongs = async (newCollected) => {
    try {
      await window.storage.set('kkCollection', JSON.stringify(Array.from(newCollected)));
    } catch (err) {
      console.error('Error saving collected songs:', err);
    }
  };

  const saveWallPlan = async (newRooms) => {
    try {
      await window.storage.set('kkWallPlan', JSON.stringify(newRooms));
    } catch (err) {
      console.error('Error saving wall plan:', err);
    }
  };

  const toggleSongCollected = (songId) => {
    const newCollected = new Set(collectedSongs);
    if (newCollected.has(songId)) {
      newCollected.delete(songId);
    } else {
      newCollected.add(songId);
    }
    setCollectedSongs(newCollected);
    saveCollectedSongs(newCollected);
  };

  const toggleMoodFilter = (mood) => {
    const newMoods = selectedMoods.includes(mood)
      ? selectedMoods.filter(m => m !== mood)
      : [...selectedMoods, mood];
    setSelectedMoods(newMoods);
  };

  const getFilteredSongs = () => {
    return SONGS.filter(song => {
      const matchesSearch = song.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === 'All' || song.genre === selectedGenre;
      const matchesMoods = selectedMoods.length === 0 || selectedMoods.some(m => song.mood.includes(m));
      return matchesSearch && matchesGenre && matchesMoods;
    });
  };

  const filteredSongs = getFilteredSongs();
  const collectedCount = collectedSongs.size;
  const hiddenFound = HIDDEN_SONGS.filter(s => collectedSongs.has(s.id)).length;

  const addRoom = () => {
    if (newRoomName.trim()) {
      const newRooms = [...rooms, { id: Date.now(), name: newRoomName, songs: [] }];
      setRooms(newRooms);
      saveWallPlan(newRooms);
      setNewRoomName('');
    }
  };

  const removeRoom = (roomId) => {
    const newRooms = rooms.filter(r => r.id !== roomId);
    setRooms(newRooms);
    saveWallPlan(newRooms);
  };

  const assignSongToRoom = (roomId, songId) => {
    const newRooms = rooms.map(r => {
      if (r.id === roomId) {
        return { ...r, songs: [...new Set([...r.songs, songId])] };
      }
      return r;
    });
    setRooms(newRooms);
    saveWallPlan(newRooms);
  };

  const removeSongFromRoom = (roomId, songId) => {
    const newRooms = rooms.map(r => {
      if (r.id === roomId) {
        return { ...r, songs: r.songs.filter(s => s !== songId) };
      }
      return r;
    });
    setRooms(newRooms);
    saveWallPlan(newRooms);
  };

  const getRandomSong = () => {
    const moods = selectedMoods.length > 0 ? selectedMoods : MOODS;
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    const matchingSongs = SONGS.filter(s => s.mood.includes(randomMood));
    return matchingSongs[Math.floor(Math.random() * matchingSongs.length)] || SONGS[0];
  };

  const styles = {
    container: {
      backgroundColor: '#0a1a10',
      color: '#ffffff',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: "'DM Sans', sans-serif",
    },
    panel: {
      width: '100%',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      borderRadius: '8px',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      padding: '24px',
    },
    header: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '32px',
      fontWeight: '700',
      marginBottom: '8px',
      color: '#d4b030',
    },
    subheader: {
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: '24px',
    },
    stats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      marginBottom: '24px',
    },
    statCard: {
      backgroundColor: 'rgba(94, 200, 80, 0.1)',
      border: '1px solid rgba(94, 200, 80, 0.3)',
      borderRadius: '6px',
      padding: '16px',
      textAlign: 'center',
    },
    statValue: {
      fontFamily: "'DM Mono', monospace",
      fontSize: '24px',
      fontWeight: '700',
      color: '#5ec850',
      marginBottom: '4px',
    },
    statLabel: {
      fontSize: '12px',
      color: 'rgba(255, 255, 255, 0.6)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    tabBar: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      borderBottom: '1px solid rgba(94, 200, 80, 0.2)',
      paddingBottom: '12px',
    },
    tab: (isActive) => ({
      padding: '8px 16px',
      backgroundColor: 'transparent',
      border: 'none',
      color: isActive ? '#5ec850' : 'rgba(255, 255, 255, 0.6)',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      fontWeight: isActive ? '700' : '400',
      cursor: 'pointer',
      borderBottom: isActive ? '2px solid #5ec850' : 'none',
      transition: 'all 0.3s ease',
    }),
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: 'rgba(94, 200, 80, 0.1)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '8px',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#5ec850',
      width: `${(collectedCount / SONGS.length) * 100}%`,
      transition: 'width 0.3s ease',
    },
    searchBox: {
      width: '100%',
      padding: '12px 16px',
      backgroundColor: 'rgba(94, 200, 80, 0.05)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '6px',
      color: '#ffffff',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      marginBottom: '16px',
    },
    filterGroup: {
      marginBottom: '20px',
    },
    filterLabel: {
      fontSize: '12px',
      fontWeight: '700',
      color: 'rgba(255, 255, 255, 0.7)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '10px',
      display: 'block',
    },
    genreButtons: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginBottom: '16px',
    },
    genreBtn: (isActive) => ({
      padding: '6px 12px',
      backgroundColor: isActive ? '#5ec850' : 'rgba(94, 200, 80, 0.1)',
      border: `1px solid ${isActive ? '#5ec850' : 'rgba(94, 200, 80, 0.3)'}`,
      borderRadius: '4px',
      color: isActive ? '#0a1a10' : 'rgba(255, 255, 255, 0.8)',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
    moodPills: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
    },
    moodPill: (isActive) => ({
      padding: '6px 12px',
      backgroundColor: isActive ? '#4aacf0' : 'rgba(74, 172, 240, 0.1)',
      border: `1px solid ${isActive ? '#4aacf0' : 'rgba(74, 172, 240, 0.3)'}`,
      borderRadius: '16px',
      color: isActive ? '#0a1a10' : 'rgba(255, 255, 255, 0.7)',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '11px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
    songGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '16px',
      marginTop: '20px',
    },
    songCard: {
      backgroundColor: 'rgba(12, 28, 14, 0.6)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '6px',
      padding: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
    },
    songCardHover: {
      backgroundColor: 'rgba(94, 200, 80, 0.1)',
      borderColor: 'rgba(94, 200, 80, 0.4)',
      boxShadow: '0 4px 12px rgba(94, 200, 80, 0.15)',
    },
    songEmoji: {
      fontSize: '28px',
      marginBottom: '8px',
    },
    songName: {
      fontWeight: '700',
      fontSize: '14px',
      marginBottom: '8px',
      lineHeight: '1.3',
    },
    genreTag: {
      display: 'inline-block',
      backgroundColor: 'rgba(212, 176, 48, 0.2)',
      border: '1px solid rgba(212, 176, 48, 0.4)',
      borderRadius: '4px',
      padding: '4px 8px',
      fontSize: '10px',
      fontWeight: '600',
      color: '#d4b030',
      marginBottom: '8px',
    },
    moodTags: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px',
      marginBottom: '12px',
      flex: '1',
    },
    moodTag: {
      backgroundColor: 'rgba(74, 172, 240, 0.2)',
      border: '1px solid rgba(74, 172, 240, 0.3)',
      borderRadius: '3px',
      padding: '3px 6px',
      fontSize: '9px',
      color: '#4aacf0',
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer',
      accentColor: '#5ec850',
    },
    checkboxRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: 'auto',
    },
    hiddenBadge: {
      display: 'inline-block',
      backgroundColor: 'rgba(74, 172, 240, 0.2)',
      border: '1px solid rgba(74, 172, 240, 0.4)',
      borderRadius: '4px',
      padding: '4px 8px',
      fontSize: '10px',
      fontWeight: '600',
      color: '#4aacf0',
    },
    saturdaySection: {
      marginBottom: '24px',
    },
    saturdayHeader: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '16px',
      color: '#d4b030',
    },
    requestBox: {
      backgroundColor: 'rgba(94, 200, 80, 0.1)',
      border: '1px solid rgba(94, 200, 80, 0.3)',
      borderRadius: '6px',
      padding: '20px',
      marginBottom: '20px',
    },
    requestTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: '12px',
    },
    requestButtons: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginBottom: '12px',
    },
    randomBtn: {
      padding: '10px 16px',
      backgroundColor: '#5ec850',
      border: 'none',
      borderRadius: '4px',
      color: '#0a1a10',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '12px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    resultBox: {
      backgroundColor: 'rgba(94, 200, 80, 0.15)',
      border: '1px solid rgba(94, 200, 80, 0.4)',
      borderRadius: '6px',
      padding: '16px',
      marginTop: '12px',
    },
    hiddenSection: {
      marginTop: '20px',
    },
    hiddenSongItem: {
      backgroundColor: 'rgba(74, 172, 240, 0.08)',
      border: '1px solid rgba(74, 172, 240, 0.3)',
      borderRadius: '6px',
      padding: '12px',
      marginBottom: '10px',
    },
    wallPlannerInput: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
    },
    textInput: {
      flex: '1',
      padding: '10px 12px',
      backgroundColor: 'rgba(94, 200, 80, 0.05)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '4px',
      color: '#ffffff',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
    },
    addBtn: {
      padding: '10px 16px',
      backgroundColor: '#5ec850',
      border: 'none',
      borderRadius: '4px',
      color: '#0a1a10',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '12px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    roomCard: {
      backgroundColor: 'rgba(12, 28, 14, 0.6)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '6px',
      padding: '16px',
      marginBottom: '16px',
    },
    roomName: {
      fontSize: '14px',
      fontWeight: '700',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    removeBtn: {
      padding: '4px 8px',
      backgroundColor: 'rgba(212, 176, 48, 0.2)',
      border: '1px solid rgba(212, 176, 48, 0.4)',
      borderRadius: '4px',
      color: '#d4b030',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '10px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    roomSongs: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginBottom: '8px',
    },
    songBadge: {
      backgroundColor: 'rgba(74, 172, 240, 0.2)',
      border: '1px solid rgba(74, 172, 240, 0.3)',
      borderRadius: '4px',
      padding: '4px 8px',
      fontSize: '11px',
      color: '#4aacf0',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    songSelect: {
      width: '100%',
      padding: '8px 12px',
      backgroundColor: 'rgba(94, 200, 80, 0.05)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '4px',
      color: '#ffffff',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '13px',
    },
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
      `}</style>
      <div style={styles.panel}>
        <h1 style={styles.header}>🎵 K.K. Catalogue</h1>
        <p style={styles.subheader}>Complete your K.K. Slider song collection</p>

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{collectedCount}</div>
            <div style={styles.statLabel}>Collected</div>
            <div style={styles.progressBar}>
              <div style={styles.progressFill} />
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{SONGS.length}</div>
            <div style={styles.statLabel}>Total Songs</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{hiddenFound}/3</div>
            <div style={styles.statLabel}>Hidden Found</div>
          </div>
        </div>

        <div style={styles.tabBar}>
          {['catalogue', 'saturday', 'wallplanner'].map(tab => (
            <button
              key={tab}
              style={styles.tab(activeTab === tab)}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'catalogue' && 'Catalogue'}
              {tab === 'saturday' && 'Saturday Night'}
              {tab === 'wallplanner' && 'Wall Planner'}
            </button>
          ))}
        </div>

        {activeTab === 'catalogue' && (
          <div>
            <input
              type="text"
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchBox}
            />

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Genre</label>
              <div style={styles.genreButtons}>
                {GENRES.map(genre => (
                  <button
                    key={genre}
                    style={styles.genreBtn(selectedGenre === genre)}
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Mood</label>
              <div style={styles.moodPills}>
                {MOODS.map(mood => (
                  <button
                    key={mood}
                    style={styles.moodPill(selectedMoods.includes(mood))}
                    onClick={() => toggleMoodFilter(mood)}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.songGrid}>
              {filteredSongs.map(song => {
                const isCollected = collectedSongs.has(song.id);
                const isHovered = hoveredSongId === song.id;
                return (
                  <div
                    key={song.id}
                    style={{
                      ...styles.songCard,
                      ...(isHovered ? styles.songCardHover : {}),
                    }}
                    onMouseEnter={() => setHoveredSongId(song.id)}
                    onMouseLeave={() => setHoveredSongId(null)}
                  >
                    <AssetImg category="music" name={song.name} size={48} imageType="Album Image" />
                    <div style={styles.songName}>{song.name}</div>
                    {song.isHidden && <span style={styles.hiddenBadge}>🔒 Hidden</span>}
                    <span style={styles.genreTag}>{song.genre}</span>
                    <div style={styles.moodTags}>
                      {song.mood.map(m => (
                        <span key={m} style={styles.moodTag}>{m}</span>
                      ))}
                    </div>
                    <div style={styles.checkboxRow}>
                      <input
                        type="checkbox"
                        checked={isCollected}
                        onChange={() => toggleSongCollected(song.id)}
                        style={styles.checkbox}
                      />
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                        {isCollected ? 'Collected' : 'Collect'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'saturday' && (
          <div>
            <h2 style={{ ...styles.saturdayHeader, marginTop: '0' }}>🎸 It's Saturday Night!</h2>

            <div style={styles.requestBox}>
              <div style={styles.requestTitle}>Request a Song</div>
              <div style={styles.requestButtons}>
                {['Happy', 'Chill', 'Energetic'].map(mood => (
                  <button
                    key={mood}
                    style={styles.genreBtn(selectedMoods.includes(mood))}
                    onClick={() => toggleMoodFilter(mood)}
                  >
                    {mood}
                  </button>
                ))}
              </div>
              <button style={styles.randomBtn} onClick={() => {
                const random = getRandomSong();
                setSelectedMoods(random.mood);
              }}>
                🎲 Random Request
              </button>
              {selectedMoods.length > 0 && (
                <div style={styles.resultBox}>
                  {(() => {
                    const matching = SONGS.filter(s => selectedMoods.some(m => s.mood.includes(m)));
                    const suggestion = matching[Math.floor(Math.random() * matching.length)];
                    return suggestion ? (
                      <div>
                        <strong>{suggestion.name}</strong> - {suggestion.genre}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            <div style={styles.hiddenSection}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>🔒 Hidden Songs</h3>
              {HIDDEN_SONGS.map(hidden => {
                const isFound = collectedSongs.has(hidden.id);
                return (
                  <div key={hidden.id} style={styles.hiddenSongItem}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '16px' }}>🔐</span>
                      <strong>{hidden.name}</strong>
                      {isFound && <span style={{ fontSize: '12px', color: '#5ec850' }}>✓ Found</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                      Unlock: {hidden.unlock}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'wallplanner' && (
          <div>
            <div style={styles.wallPlannerInput}>
              <input
                type="text"
                placeholder="Enter room name (e.g., Living Room)..."
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRoom()}
                style={styles.textInput}
              />
              <button style={styles.addBtn} onClick={addRoom}>+ Add Room</button>
            </div>

            <div>
              {rooms.length === 0 ? (
                <div style={{ ...styles.requestBox, textAlign: 'center' }}>
                  <p>Create a room to start planning your music!</p>
                </div>
              ) : (
                rooms.map(room => (
                  <div key={room.id} style={styles.roomCard}>
                    <div style={styles.roomName}>
                      <strong>🏠 {room.name}</strong>
                      <button style={styles.removeBtn} onClick={() => removeRoom(room.id)}>Remove</button>
                    </div>
                    {room.songs.length > 0 && (
                      <div style={styles.roomSongs}>
                        {room.songs.map(songId => {
                          const song = SONGS.find(s => s.id === songId);
                          return (
                            <div key={songId} style={styles.songBadge}>
                              <AssetImg category="music" name={song.name} size={20} imageType="Album Image" /> {song.name}
                              <button
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#4aacf0',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  padding: '0',
                                }}
                                onClick={() => removeSongFromRoom(room.id, songId)}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <select
                      style={styles.songSelect}
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          assignSongToRoom(room.id, parseInt(e.target.value));
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">+ Assign a song...</option>
                      {SONGS.map(song => (
                        <option key={song.id} value={song.id}>
                          {song.name} - {song.genre}
                        </option>
                      ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
