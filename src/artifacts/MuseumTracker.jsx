'use client';

import React, { useState, useEffect } from 'react';
import { AssetImg } from '../assetHelper';

const FISH = [
  'Bitterling', 'Pale Chub', 'Crucian Carp', 'Dace', 'Carp', 'Koi', 'Goldfish', 'Pop-eyed Goldfish', 'Ranchu Goldfish', 'Killifish',
  'Crawfish', 'Soft-shelled Turtle', 'Snapping Turtle', 'Tadpole', 'Frog', 'Freshwater Goby', 'Loach', 'Catfish', 'Giant Snakehead', 'Bluegill',
  'Yellow Perch', 'Black Bass', 'Tilapia', 'Pike', 'Pond Smelt', 'Sweetfish', 'Cherry Salmon', 'Char', 'Golden Trout', 'Stringfish',
  'Salmon', 'King Salmon', 'Mitten Crab', 'Guppy', 'Nibble Fish', 'Angelfish', 'Betta', 'Neon Tetra', 'Rainbowfish', 'Piranha',
  'Arowana', 'Dorado', 'Gar', 'Arapaima', 'Saddled Bichir', 'Sturgeon', 'Sea Butterfly', 'Sea Horse', 'Clown Fish', 'Surgeonfish',
  'Butterfly Fish', 'Napoleonfish', 'Zebra Turkeyfish', 'Blowfish', 'Puffer Fish', 'Anchovy', 'Horse Mackerel', 'Barred Knifejaw', 'Sea Bass', 'Red Snapper',
  'Dab', 'Olive Flounder', 'Squid', 'Moray Eel', 'Ribbon Eel', 'Tuna', 'Blue Marlin', 'Giant Trevally', 'Mahi-Mahi', 'Ocean Sunfish',
  'Ray', 'Saw Shark', 'Hammerhead Shark', 'Great White Shark', 'Whale Shark', 'Suckerfish', 'Football Fish', 'Oarfish', 'Barreleye', 'Coelacanth'
];

const BUGS = [
  'Common Butterfly', 'Yellow Butterfly', 'Tiger Butterfly', 'Peacock Butterfly', 'Common Bluebottle', 'Paper Kite Butterfly', 'Great Purple Emperor', 'Monarch Butterfly', 'Emperor Butterfly', 'Agrias Butterfly',
  'Rajah Brooke\'s Birdwing', 'Queen Alexandra\'s Birdwing', 'Moth', 'Atlas Moth', 'Madagascan Sunset Moth', 'Long Locust', 'Migratory Locust', 'Rice Grasshopper', 'Grasshopper', 'Cricket',
  'Bell Cricket', 'Mantis', 'Orchid Mantis', 'Honeybee', 'Wasp', 'Brown Cicada', 'Robust Cicada', 'Giant Cicada', 'Walker Cicada', 'Evening Cicada',
  'Cicada Shell', 'Red Dragonfly', 'Darner Dragonfly', 'Banded Dragonfly', 'Damselfly', 'Firefly', 'Mole Cricket', 'Pondskater', 'Diving Beetle', 'Giant Water Bug',
  'Stinkbug', 'Man-faced Stink Bug', 'Ladybug', 'Tiger Beetle', 'Jewel Beetle', 'Violin Beetle', 'Citrus Long-horned Beetle', 'Rosalia Batesi Beetle', 'Blue Weevil Beetle', 'Dung Beetle',
  'Earth-boring Dung Beetle', 'Scarab Beetle', 'Drone Beetle', 'Goliath Beetle', 'Saw Stag', 'Miyama Stag', 'Giant Stag', 'Rainbow Stag', 'Cyclommatus Stag', 'Golden Stag',
  'Giraffe Stag', 'Horned Dynastid', 'Horned Atlas', 'Horned Elephant', 'Horned Hercules', 'Walking Leaf', 'Walking Stick', 'Bagworm', 'Ant', 'Hermit Crab',
  'Wharf Roach', 'Fly', 'Mosquito', 'Flea', 'Snail', 'Pill Bug', 'Centipede', 'Spider', 'Tarantula', 'Scorpion'
];

const SEA_CREATURES = [
  'Seaweed', 'Sea Grapes', 'Sea Cucumber', 'Sea Pig', 'Sea Star', 'Sea Urchin', 'Slate Pencil Urchin', 'Sea Anemone', 'Moon Jellyfish', 'Sea Slug',
  'Pearl Oyster', 'Mussel', 'Oyster', 'Scallop', 'Turban Shell', 'Abalone', 'Gigas Giant Clam', 'Chambered Nautilus', 'Octopus', 'Umbrella Octopus',
  'Vampire Squid', 'Firefly Squid', 'Gazami Crab', 'Dungeness Crab', 'Snow Crab', 'Red King Crab', 'Acorn Barnacle', 'Spider Crab', 'Tiger Prawn', 'Sweet Shrimp',
  'Mantis Shrimp', 'Spiny Lobster', 'Lobster', 'Giant Isopod', 'Horseshoe Crab', 'Sea Pineapple', 'Spotted Garden Eel', 'Flatworm', 'Venus\' Flower Basket', 'Whelk'
];

const FOSSILS = [
  // Ankylosaurus (3 parts)
  { id: 1, name: 'Ankylo Skull', species: 'Ankylosaurus', part: 'Skull', sellPrice: 3500 },
  { id: 2, name: 'Ankylo Torso', species: 'Ankylosaurus', part: 'Torso', sellPrice: 3000 },
  { id: 3, name: 'Ankylo Tail', species: 'Ankylosaurus', part: 'Tail', sellPrice: 2500 },
  // Archelon (2 parts)
  { id: 4, name: 'Archelon Skull', species: 'Archelon', part: 'Skull', sellPrice: 4000 },
  { id: 5, name: 'Archelon Tail', species: 'Archelon', part: 'Tail', sellPrice: 3500 },
  // Brachiosaurus (4 parts)
  { id: 6, name: 'Brachio Skull', species: 'Brachiosaurus', part: 'Skull', sellPrice: 6000 },
  { id: 7, name: 'Brachio Chest', species: 'Brachiosaurus', part: 'Chest', sellPrice: 5500 },
  { id: 8, name: 'Brachio Pelvis', species: 'Brachiosaurus', part: 'Pelvis', sellPrice: 5000 },
  { id: 9, name: 'Brachio Tail', species: 'Brachiosaurus', part: 'Tail', sellPrice: 5500 },
  // Deinonychus (2 parts)
  { id: 10, name: 'Deinony Torso', species: 'Deinonychus', part: 'Torso', sellPrice: 3000 },
  { id: 11, name: 'Deinony Tail', species: 'Deinonychus', part: 'Tail', sellPrice: 2500 },
  // Dimetrodon (2 parts)
  { id: 12, name: 'Dimetrodon Skull', species: 'Dimetrodon', part: 'Skull', sellPrice: 5500 },
  { id: 13, name: 'Dimetrodon Torso', species: 'Dimetrodon', part: 'Torso', sellPrice: 5000 },
  // Diplodocus (6 parts)
  { id: 14, name: 'Diplo Skull', species: 'Diplodocus', part: 'Skull', sellPrice: 5000 },
  { id: 15, name: 'Diplo Neck', species: 'Diplodocus', part: 'Neck', sellPrice: 4500 },
  { id: 16, name: 'Diplo Chest', species: 'Diplodocus', part: 'Chest', sellPrice: 4000 },
  { id: 17, name: 'Diplo Pelvis', species: 'Diplodocus', part: 'Pelvis', sellPrice: 4500 },
  { id: 18, name: 'Diplo Tail', species: 'Diplodocus', part: 'Tail', sellPrice: 5000 },
  { id: 19, name: 'Diplo Tail Tip', species: 'Diplodocus', part: 'Tail Tip', sellPrice: 4000 },
  // Iguanodon (3 parts)
  { id: 20, name: 'Iguanodon Skull', species: 'Iguanodon', part: 'Skull', sellPrice: 4000 },
  { id: 21, name: 'Iguanodon Torso', species: 'Iguanodon', part: 'Torso', sellPrice: 3500 },
  { id: 22, name: 'Iguanodon Tail', species: 'Iguanodon', part: 'Tail', sellPrice: 3000 },
  // Mammoth (2 parts)
  { id: 23, name: 'Mammoth Skull', species: 'Mammoth', part: 'Skull', sellPrice: 3000 },
  { id: 24, name: 'Mammoth Torso', species: 'Mammoth', part: 'Torso', sellPrice: 2500 },
  // Megaceros (3 parts)
  { id: 25, name: 'Megacero Skull', species: 'Megaceros', part: 'Skull', sellPrice: 4500 },
  { id: 26, name: 'Megacero Torso', species: 'Megaceros', part: 'Torso', sellPrice: 3500 },
  { id: 27, name: 'Megacero Tail', species: 'Megaceros', part: 'Tail', sellPrice: 3000 },
  // Megaloceros (2 parts)
  { id: 28, name: 'Left Megalo Side', species: 'Megaloceros', part: 'Left Side', sellPrice: 4000 },
  { id: 29, name: 'Right Megalo Side', species: 'Megaloceros', part: 'Right Side', sellPrice: 5500 },
  // Ophthalmosaurus (2 parts)
  { id: 30, name: 'Ophthalmo Skull', species: 'Ophthalmosaurus', part: 'Skull', sellPrice: 2500 },
  { id: 31, name: 'Ophthalmo Torso', species: 'Ophthalmosaurus', part: 'Torso', sellPrice: 2000 },
  // Pachycephalosaurus (2 parts)
  { id: 32, name: 'Pachy Skull', species: 'Pachycephalosaurus', part: 'Skull', sellPrice: 4000 },
  { id: 33, name: 'Pachy Tail', species: 'Pachycephalosaurus', part: 'Tail', sellPrice: 3500 },
  // Parasaurolophus (3 parts)
  { id: 34, name: 'Parasaur Skull', species: 'Parasaurolophus', part: 'Skull', sellPrice: 3500 },
  { id: 35, name: 'Parasaur Torso', species: 'Parasaurolophus', part: 'Torso', sellPrice: 3000 },
  { id: 36, name: 'Parasaur Tail', species: 'Parasaurolophus', part: 'Tail', sellPrice: 2500 },
  // Plesiosaur (3 parts) — "Plesio Body" renamed to "Plesio Torso" in v1.3.0
  { id: 37, name: 'Plesio Skull', species: 'Plesiosaur', part: 'Skull', sellPrice: 4000 },
  { id: 38, name: 'Plesio Torso', species: 'Plesiosaur', part: 'Torso', sellPrice: 4500 },
  { id: 39, name: 'Plesio Tail', species: 'Plesiosaur', part: 'Tail', sellPrice: 4500 },
  // Pteranodon (3 parts)
  { id: 40, name: 'Ptera Body', species: 'Pteranodon', part: 'Body', sellPrice: 4000 },
  { id: 41, name: 'Left Ptera Wing', species: 'Pteranodon', part: 'Left Wing', sellPrice: 4500 },
  { id: 42, name: 'Right Ptera Wing', species: 'Pteranodon', part: 'Right Wing', sellPrice: 4500 },
  // Quetzalcoatlus (3 parts)
  { id: 43, name: 'Quetzal Torso', species: 'Quetzalcoatlus', part: 'Torso', sellPrice: 4500 },
  { id: 44, name: 'Left Quetzal Wing', species: 'Quetzalcoatlus', part: 'Left Wing', sellPrice: 5000 },
  { id: 45, name: 'Right Quetzal Wing', species: 'Quetzalcoatlus', part: 'Right Wing', sellPrice: 5000 },
  // Saber-tooth Tiger (2 parts)
  { id: 46, name: 'Sabertooth Skull', species: 'Saber-tooth Tiger', part: 'Skull', sellPrice: 2500 },
  { id: 47, name: 'Sabertooth Tail', species: 'Saber-tooth Tiger', part: 'Tail', sellPrice: 2000 },
  // Spinosaurus (3 parts)
  { id: 48, name: 'Spino Skull', species: 'Spinosaurus', part: 'Skull', sellPrice: 4000 },
  { id: 49, name: 'Spino Torso', species: 'Spinosaurus', part: 'Torso', sellPrice: 3000 },
  { id: 50, name: 'Spino Tail', species: 'Spinosaurus', part: 'Tail', sellPrice: 2500 },
  // Stegosaurus (3 parts)
  { id: 51, name: 'Stego Skull', species: 'Stegosaurus', part: 'Skull', sellPrice: 5000 },
  { id: 52, name: 'Stego Torso', species: 'Stegosaurus', part: 'Torso', sellPrice: 4500 },
  { id: 53, name: 'Stego Tail', species: 'Stegosaurus', part: 'Tail', sellPrice: 4000 },
  // Tyrannosaurus Rex (3 parts)
  { id: 54, name: 'T. rex Skull', species: 'Tyrannosaurus Rex', part: 'Skull', sellPrice: 6000 },
  { id: 55, name: 'T. rex Torso', species: 'Tyrannosaurus Rex', part: 'Torso', sellPrice: 5500 },
  { id: 56, name: 'T. rex Tail', species: 'Tyrannosaurus Rex', part: 'Tail', sellPrice: 5000 },
  // Triceratops (3 parts)
  { id: 57, name: 'Tricera Skull', species: 'Triceratops', part: 'Skull', sellPrice: 5500 },
  { id: 58, name: 'Tricera Torso', species: 'Triceratops', part: 'Torso', sellPrice: 5000 },
  { id: 59, name: 'Tricera Tail', species: 'Triceratops', part: 'Tail', sellPrice: 4500 },
  // Standalone fossils (14 pieces)
  { id: 60, name: 'Acanthostega', species: 'Acanthostega', part: 'Whole', sellPrice: 2000 },
  { id: 61, name: 'Amber', species: 'Amber', part: 'Whole', sellPrice: 1200 },
  { id: 62, name: 'Ammonite', species: 'Ammonite', part: 'Whole', sellPrice: 1100 },
  { id: 63, name: 'Anomalocaris', species: 'Anomalocaris', part: 'Whole', sellPrice: 2000 },
  { id: 64, name: 'Archaeopteryx', species: 'Archaeopteryx', part: 'Whole', sellPrice: 1300 },
  { id: 65, name: 'Australopith', species: 'Australopith', part: 'Whole', sellPrice: 1100 },
  { id: 66, name: 'Coprolite', species: 'Coprolite', part: 'Whole', sellPrice: 1100 },
  { id: 67, name: 'Dinosaur Track', species: 'Dinosaur Track', part: 'Whole', sellPrice: 1000 },
  { id: 68, name: 'Dunkleosteus', species: 'Dunkleosteus', part: 'Whole', sellPrice: 3500 },
  { id: 69, name: 'Eusthenopteron', species: 'Eusthenopteron', part: 'Whole', sellPrice: 2000 },
  { id: 70, name: 'Juramaia', species: 'Juramaia', part: 'Whole', sellPrice: 1500 },
  { id: 71, name: 'Myllokunmingia', species: 'Myllokunmingia', part: 'Whole', sellPrice: 1500 },
  { id: 72, name: 'Shark-tooth Pattern', species: 'Shark-tooth Pattern', part: 'Whole', sellPrice: 1000 },
  { id: 73, name: 'Trilobite', species: 'Trilobite', part: 'Whole', sellPrice: 1300 }
];

const ART = [
  // Paintings — Always Real (14)
  { id: 1, name: 'Calm Painting', type: 'Painting', alwaysReal: true },
  { id: 2, name: 'Common Painting', type: 'Painting', alwaysReal: true },
  { id: 3, name: 'Dynamic Painting', type: 'Painting', alwaysReal: true },
  { id: 4, name: 'Flowery Painting', type: 'Painting', alwaysReal: true },
  { id: 5, name: 'Glowing Painting', type: 'Painting', alwaysReal: true },
  { id: 6, name: 'Moody Painting', type: 'Painting', alwaysReal: true },
  { id: 7, name: 'Mysterious Painting', type: 'Painting', alwaysReal: true },
  { id: 8, name: 'Nice Painting', type: 'Painting', alwaysReal: true },
  { id: 9, name: 'Perfect Painting', type: 'Painting', alwaysReal: true },
  { id: 10, name: 'Proper Painting', type: 'Painting', alwaysReal: true },
  { id: 11, name: 'Sinking Painting', type: 'Painting', alwaysReal: true },
  { id: 12, name: 'Twinkling Painting', type: 'Painting', alwaysReal: true },
  { id: 13, name: 'Warm Painting', type: 'Painting', alwaysReal: true },
  { id: 14, name: 'Worthy Painting', type: 'Painting', alwaysReal: true },
  // Paintings — With Fakes (16)
  { id: 15, name: 'Academic Painting', type: 'Painting', alwaysReal: false },
  { id: 16, name: 'Amazing Painting', type: 'Painting', alwaysReal: false },
  { id: 17, name: 'Basic Painting', type: 'Painting', alwaysReal: false },
  { id: 18, name: 'Detailed Painting', type: 'Painting', alwaysReal: false },
  { id: 19, name: 'Famous Painting', type: 'Painting', alwaysReal: false },
  { id: 20, name: 'Graceful Painting', type: 'Painting', alwaysReal: false },
  { id: 21, name: 'Jolly Painting', type: 'Painting', alwaysReal: false },
  { id: 22, name: 'Moving Painting', type: 'Painting', alwaysReal: false },
  { id: 23, name: 'Quaint Painting', type: 'Painting', alwaysReal: false },
  { id: 24, name: 'Scary Painting', type: 'Painting', alwaysReal: false },
  { id: 25, name: 'Scenic Painting', type: 'Painting', alwaysReal: false },
  { id: 26, name: 'Serene Painting', type: 'Painting', alwaysReal: false },
  { id: 27, name: 'Solemn Painting', type: 'Painting', alwaysReal: false },
  { id: 28, name: 'Wild Painting Left Half', type: 'Painting', alwaysReal: false },
  { id: 29, name: 'Wild Painting Right Half', type: 'Painting', alwaysReal: false },
  { id: 30, name: 'Wistful Painting', type: 'Painting', alwaysReal: false },
  // Statues — Always Real (2)
  { id: 31, name: 'Familiar Statue', type: 'Statue', alwaysReal: true },
  { id: 32, name: 'Great Statue', type: 'Statue', alwaysReal: true },
  // Statues — With Fakes (11)
  { id: 33, name: 'Ancient Statue', type: 'Statue', alwaysReal: false },
  { id: 34, name: 'Beautiful Statue', type: 'Statue', alwaysReal: false },
  { id: 35, name: 'Gallant Statue', type: 'Statue', alwaysReal: false },
  { id: 36, name: 'Informative Statue', type: 'Statue', alwaysReal: false },
  { id: 37, name: 'Motherly Statue', type: 'Statue', alwaysReal: false },
  { id: 38, name: 'Mystic Statue', type: 'Statue', alwaysReal: false },
  { id: 39, name: 'Robust Statue', type: 'Statue', alwaysReal: false },
  { id: 40, name: 'Rock-head Statue', type: 'Statue', alwaysReal: false },
  { id: 41, name: 'Tremendous Statue', type: 'Statue', alwaysReal: false },
  { id: 42, name: 'Valiant Statue', type: 'Statue', alwaysReal: false },
  { id: 43, name: 'Warrior Statue', type: 'Statue', alwaysReal: false }
];

const MuseumTracker = () => {
  const [donated, setDonated] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('fish');
  const [loaded, setLoaded] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get('acnh-museum-tracker');
        if (result) {
          setDonated(JSON.parse(result.value));
        }
      } catch (e) {
        console.error('Error loading museum data:', e);
      }
      setLoaded(true);
    };
    loadData();
  }, []);

  const saveDonated = async (updatedDonated) => {
    setDonated(updatedDonated);
    try {
      await window.storage.set('acnh-museum-tracker', JSON.stringify(updatedDonated));
    } catch (e) {
      console.error('Error saving museum data:', e);
    }
  };

  const toggleDonation = (key) => {
    const updated = { ...donated, [key]: !donated[key] };
    saveDonated(updated);
  };

  const getDonationCount = (section) => {
    if (section === 'fish') return FISH.filter((_, i) => donated[`fish-${i}`]).length;
    if (section === 'bugs') return BUGS.filter((_, i) => donated[`bugs-${i}`]).length;
    if (section === 'sea') return SEA_CREATURES.filter((_, i) => donated[`sea-${i}`]).length;
    if (section === 'fossils') return FOSSILS.filter((_, i) => donated[`fossil-${i}`]).length;
    if (section === 'art') return ART.filter((_, i) => donated[`art-${i}`]).length;
    return 0;
  };

  const getTotalDonated = () => {
    return getDonationCount('fish') + getDonationCount('bugs') + getDonationCount('sea') + getDonationCount('fossils') + getDonationCount('art');
  };

  const getTotalCount = () => 80 + 80 + 40 + 73 + 43;

  const getCompletionPercent = () => {
    const total = getTotalCount();
    return total > 0 ? Math.round((getTotalDonated() / total) * 100) : 0;
  };

  const filterItems = (items) => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(item => {
      const name = typeof item === 'string' ? item : item.name;
      return name.toLowerCase().includes(term);
    });
  };

  const openDrawer = (item, type) => {
    const name = typeof item === 'string' ? item : item.name;
    setSelectedItem(item);
    setSelectedType(type);
    setDrawerData(null);

    const API_MAP = {
      fish: `/api/nookipedia/nh/fish/${encodeURIComponent(name)}`,
      bug: `/api/nookipedia/nh/bugs/${encodeURIComponent(name)}`,
      sea: `/api/nookipedia/nh/sea/${encodeURIComponent(name)}`,
      fossil: `/api/nookipedia/nh/fossils/individuals/${encodeURIComponent(name)}`,
      art: `/api/nookipedia/nh/art/${encodeURIComponent(name)}`,
    };

    fetch(API_MAP[type])
      .then(res => res.ok ? res.json() : null)
      .then(setDrawerData)
      .catch(() => setDrawerData(null));
  };

  const closeDrawer = () => {
    setIsDrawerClosing(true);
    setTimeout(() => {
      setSelectedItem(null);
      setSelectedType(null);
      setDrawerData(null);
      setIsDrawerClosing(false);
    }, 200);
  };

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') closeDrawer(); };
    if (selectedItem) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedItem]);

  const styles = {
    container: {
      width: '100%',
      margin: '0 auto',
      backgroundColor: '#0a1a10',
      color: '#c8e6c0',
      fontFamily: '"DM Sans", sans-serif',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '24px',
      borderBottom: '2px solid rgba(94,200,80,0.3)',
      paddingBottom: '16px'
    },
    headerTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      fontFamily: '"Playfair Display", serif',
      marginBottom: '8px',
      color: '#5ec850'
    },
    progressBar: {
      width: '100%',
      height: '32px',
      backgroundColor: 'rgba(12,28,14,0.8)',
      borderRadius: '16px',
      overflow: 'hidden',
      marginTop: '12px',
      border: '1px solid #5ec850'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#5ec850',
      transition: 'width 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#0a1a10',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    searchContainer: {
      marginBottom: '20px',
      display: 'flex',
      gap: '8px'
    },
    searchInput: {
      flex: 1,
      padding: '10px 14px',
      backgroundColor: 'rgba(12,28,14,0.95)',
      border: '1px solid #5ec850',
      borderRadius: '6px',
      color: '#c8e6c0',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '14px'
    },
    tabContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '20px',
      borderBottom: '1px solid rgba(94,200,80,0.2)',
      overflowX: 'auto'
    },
    tab: {
      padding: '12px 16px',
      backgroundColor: 'transparent',
      border: 'none',
      color: '#5a7a50',
      cursor: 'pointer',
      outline: 'none',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
      borderBottom: '2px solid transparent',
      whiteSpace: 'nowrap'
    },
    tabActive: {
      color: '#5ec850',
      borderBottomColor: '#5ec850'
    },
    itemGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '12px',
      marginBottom: '20px'
    },
    itemCard: {
      backgroundColor: 'rgba(12,28,14,0.95)',
      border: '1px solid rgba(94,200,80,0.3)',
      borderRadius: '6px',
      padding: '12px',
      cursor: 'pointer',
      outline: 'none',
      transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    itemCardHover: {
      borderColor: '#5ec850',
      backgroundColor: 'rgba(94,200,80,0.1)'
    },
    itemCardDonated: {
      borderColor: '#5ec850',
      backgroundColor: 'rgba(94,200,80,0.15)'
    },
    itemCardUndone: {
      opacity: 0.6
    },
    itemName: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#c8e6c0',
      lineHeight: '1.3'
    },
    itemNameUndone: {
      color: '#5a7a50'
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      color: '#5ec850'
    },
    fossiltitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#5ec850',
      marginTop: '16px',
      marginBottom: '12px',
      fontFamily: '"Playfair Display", serif'
    },
    statsBar: {
      backgroundColor: 'rgba(12,28,14,0.95)',
      border: '1px solid rgba(94,200,80,0.3)',
      borderRadius: '6px',
      padding: '16px',
      marginTop: '24px',
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '12px',
      textAlign: 'center'
    },
    statItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    statLabel: {
      fontSize: '11px',
      color: '#5a7a50',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    statValue: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#5ec850',
      fontFamily: '"DM Mono", monospace'
    },
    statPercent: {
      fontSize: '11px',
      color: '#d4b030'
    }
  };

  const renderSection = (sectionKey, items, title, emoji) => {
    const filtered = filterItems(items);
    const isLoaded = loaded;

    if (sectionKey === 'fossils') {
      const grouped = {};
      filtered.forEach((fossil) => {
        if (!grouped[fossil.species]) grouped[fossil.species] = [];
        grouped[fossil.species].push(fossil);
      });

      return (
        <div key={sectionKey}>
          {Object.entries(grouped).map(([species, fossils]) => (
            <div key={species}>
              <div style={styles.fossiltitle}>
                {species} ({fossils.filter((f, i) => {
                  const idx = FOSSILS.indexOf(f);
                  return donated[`fossil-${idx}`];
                }).length}/{fossils.length})
              </div>
              <div style={styles.itemGrid}>
                {fossils.map((fossil, idx) => {
                  const globalIdx = FOSSILS.indexOf(fossil);
                  const key = `fossil-${globalIdx}`;
                  const isDonated = isLoaded && donated[key];
                  return (
                    <div
                      key={globalIdx}
                      style={{
                        ...styles.itemCard,
                        ...(isDonated ? styles.itemCardDonated : styles.itemCardUndone)
                      }}
                      onClick={() => openDrawer(fossil, 'fossil')}
                      onMouseEnter={(e) => {
                        if (!isDonated) e.currentTarget.style.borderColor = '#5ec850';
                      }}
                      onMouseLeave={(e) => {
                        if (!isDonated) e.currentTarget.style.borderColor = 'rgba(94,200,80,0.3)';
                      }}
                    >
                      <AssetImg category="fossils" name={fossil.name} size={40} />
                      <div style={{ ...styles.itemName, ...(isDonated ? {} : styles.itemNameUndone) }}>
                        {fossil.name}
                      </div>
                      <div style={styles.checkbox} onClick={(e) => { e.stopPropagation(); toggleDonation(key); }}>
                        {isDonated ? '✅' : '☐'} {fossil.part}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (sectionKey === 'art') {
      const paintings = filtered.filter(a => a.type === 'Painting');
      const statues = filtered.filter(a => a.type === 'Statue');

      return (
        <div key={sectionKey}>
          <div style={styles.fossiltitle}>
            Paintings ({paintings.filter((_, i) => {
              const globalIdx = ART.indexOf(ART.find(a => a.name === paintings[i].name));
              return globalIdx >= 0 && donated[`art-${globalIdx}`];
            }).length}/{paintings.length})
          </div>
          <div style={styles.itemGrid}>
            {paintings.map((art) => {
              const globalIdx = ART.indexOf(art);
              const key = `art-${globalIdx}`;
              const isDonated = isLoaded && donated[key];
              return (
                <div
                  key={globalIdx}
                  style={{
                    ...styles.itemCard,
                    ...(isDonated ? styles.itemCardDonated : styles.itemCardUndone)
                  }}
                  onClick={() => openDrawer(art, 'art')}
                  onMouseEnter={(e) => {
                    if (!isDonated) e.currentTarget.style.borderColor = '#5ec850';
                  }}
                  onMouseLeave={(e) => {
                    if (!isDonated) e.currentTarget.style.borderColor = 'rgba(94,200,80,0.3)';
                  }}
                >
                  <AssetImg category="art" name={art.name} size={40} />
                  <div style={{ ...styles.itemName, ...(isDonated ? {} : styles.itemNameUndone) }}>
                    {art.name} {art.alwaysReal && '⭐'}
                  </div>
                  <div style={styles.checkbox} onClick={(e) => { e.stopPropagation(); toggleDonation(key); }}>
                    {isDonated ? '✅' : '☐'}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={styles.fossiltitle}>
            Statues ({statues.filter((_, i) => {
              const globalIdx = ART.indexOf(ART.find(a => a.name === statues[i].name));
              return globalIdx >= 0 && donated[`art-${globalIdx}`];
            }).length}/{statues.length})
          </div>
          <div style={styles.itemGrid}>
            {statues.map((art) => {
              const globalIdx = ART.indexOf(art);
              const key = `art-${globalIdx}`;
              const isDonated = isLoaded && donated[key];
              return (
                <div
                  key={globalIdx}
                  style={{
                    ...styles.itemCard,
                    ...(isDonated ? styles.itemCardDonated : styles.itemCardUndone)
                  }}
                  onClick={() => openDrawer(art, 'art')}
                  onMouseEnter={(e) => {
                    if (!isDonated) e.currentTarget.style.borderColor = '#5ec850';
                  }}
                  onMouseLeave={(e) => {
                    if (!isDonated) e.currentTarget.style.borderColor = 'rgba(94,200,80,0.3)';
                  }}
                >
                  <AssetImg category="art" name={art.name} size={40} />
                  <div style={{ ...styles.itemName, ...(isDonated ? {} : styles.itemNameUndone) }}>
                    {art.name} {art.alwaysReal && '⭐'}
                  </div>
                  <div style={styles.checkbox} onClick={(e) => { e.stopPropagation(); toggleDonation(key); }}>
                    {isDonated ? '✅' : '☐'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    let sectionItems = [];
    let sectionPrefix = '';
    let assetCategory = '';
    if (sectionKey === 'fish') { sectionItems = FISH; sectionPrefix = 'fish'; assetCategory = 'fish'; }
    else if (sectionKey === 'bugs') { sectionItems = BUGS; sectionPrefix = 'bugs'; assetCategory = 'bugs'; }
    else if (sectionKey === 'sea') { sectionItems = SEA_CREATURES; sectionPrefix = 'sea'; assetCategory = 'sea-creatures'; }

    const typeMap = { fish: 'fish', bugs: 'bug', sea: 'sea' };
    return (
      <div key={sectionKey} style={styles.itemGrid}>
        {filtered.map((name, idx) => {
          const globalIdx = sectionItems.indexOf(name);
          const key = `${sectionPrefix}-${globalIdx}`;
          const isDonated = isLoaded && donated[key];
          return (
            <div
              key={globalIdx}
              style={{
                ...styles.itemCard,
                ...(isDonated ? styles.itemCardDonated : styles.itemCardUndone)
              }}
              onClick={() => openDrawer(name, typeMap[sectionKey])}
              onMouseEnter={(e) => {
                if (!isDonated) e.currentTarget.style.borderColor = '#5ec850';
              }}
              onMouseLeave={(e) => {
                if (!isDonated) e.currentTarget.style.borderColor = 'rgba(94,200,80,0.3)';
              }}
            >
              <AssetImg category={assetCategory} name={name} size={40} />
              <div style={{ ...styles.itemName, ...(isDonated ? {} : styles.itemNameUndone) }}>
                {name}
              </div>
              <div style={styles.checkbox} onClick={(e) => { e.stopPropagation(); toggleDonation(key); }}>
                {isDonated ? '✅' : '☐'} Donated
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes museumDrawerSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes museumDrawerSlideOut { from { transform: translateX(0); } to { transform: translateX(100%); } }
        @keyframes museumFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes museumFadeOut { from { opacity: 1; } to { opacity: 0; } }
      `}</style>

      <div style={styles.header}>
        <div style={styles.headerTitle}>🏛️ Museum Tracker</div>
        <div style={styles.progressBar}>
          <div style={{
            ...styles.progressFill,
            width: `${getCompletionPercent()}%`
          }}>
            {getCompletionPercent()}%
          </div>
        </div>
      </div>

      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="🔍 Search all items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.tabContainer}>
        {[
          { key: 'fish', label: <><AssetImg category="fish" name="Bitterling" size={18} /> Fish</>, count: 80 },
          { key: 'bugs', label: <><AssetImg category="bugs" name="Common Butterfly" size={18} /> Bugs</>, count: 80 },
          { key: 'sea', label: <><AssetImg category="sea-creatures" name="Seaweed" size={18} /> Sea Creatures</>, count: 40 },
          { key: 'fossils', label: <><AssetImg category="fossils" name="Ammonite" size={18} /> Fossils</>, count: 73 },
          { key: 'art', label: <><AssetImg category="art" name="Academic Painting" size={18} /> Art</>, count: 43 }
        ].map(section => (
          <button
            key={section.key}
            style={{
              ...styles.tab,
              ...(activeTab === section.key ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab(section.key)}
          >
            {section.label} <span style={{ fontSize: '11px', opacity: 0.7 }}>({getDonationCount(section.key)}/{section.count})</span>
          </button>
        ))}
      </div>

      {activeTab === 'fish' && renderSection('fish', FISH, 'Fish', '🐟')}
      {activeTab === 'bugs' && renderSection('bugs', BUGS, 'Bugs', '🪲')}
      {activeTab === 'sea' && renderSection('sea', SEA_CREATURES, 'Sea Creatures', '🐚')}
      {activeTab === 'fossils' && renderSection('fossils', FOSSILS, 'Fossils', '🦴')}
      {activeTab === 'art' && renderSection('art', ART, 'Art', '🎨')}

      <div style={styles.statsBar}>
        <div style={styles.statItem}>
          <div style={styles.statLabel}>Total Donated</div>
          <div style={styles.statValue}>{getTotalDonated()}</div>
          <div style={styles.statPercent}>{getCompletionPercent()}%</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statLabel}>Fish</div>
          <div style={styles.statValue}>{getDonationCount('fish')}</div>
          <div style={styles.statPercent}>{FISH.length > 0 ? Math.round((getDonationCount('fish')/80)*100) : 0}%</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statLabel}>Bugs</div>
          <div style={styles.statValue}>{getDonationCount('bugs')}</div>
          <div style={styles.statPercent}>{BUGS.length > 0 ? Math.round((getDonationCount('bugs')/80)*100) : 0}%</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statLabel}>Sea</div>
          <div style={styles.statValue}>{getDonationCount('sea')}</div>
          <div style={styles.statPercent}>{SEA_CREATURES.length > 0 ? Math.round((getDonationCount('sea')/40)*100) : 0}%</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statLabel}>Fossils</div>
          <div style={styles.statValue}>{getDonationCount('fossils')}</div>
          <div style={styles.statPercent}>{FOSSILS.length > 0 ? Math.round((getDonationCount('fossils')/73)*100) : 0}%</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statLabel}>Art</div>
          <div style={styles.statValue}>{getDonationCount('art')}</div>
          <div style={styles.statPercent}>{ART.length > 0 ? Math.round((getDonationCount('art')/43)*100) : 0}%</div>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedItem && (() => {
        const itemName = typeof selectedItem === 'string' ? selectedItem : selectedItem.name;
        const assetCategoryMap = { fish: 'fish', bug: 'bugs', sea: 'sea-creatures', fossil: 'fossils', art: 'art' };
        const sectionLabel = { fish: 'Fish', bug: 'Bug', sea: 'Sea Creature', fossil: 'Fossil', art: 'Art' };

        return (
          <>
            <div
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 9999,
                animation: isDrawerClosing ? 'museumFadeOut 0.2s ease-in forwards' : 'museumFadeIn 0.2s ease-out forwards',
              }}
              onClick={closeDrawer}
            />
            <div style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: typeof window !== 'undefined' && window.innerWidth < 600 ? '100%' : '420px',
              backgroundColor: '#0a1a10', borderLeft: '1px solid rgba(94, 200, 80, 0.3)',
              zIndex: 10000, overflowY: 'auto', padding: '24px',
              animation: isDrawerClosing ? 'museumDrawerSlideOut 0.2s ease-in forwards' : 'museumDrawerSlideIn 0.25s ease-out forwards',
            }}>
              {/* Close button */}
              <button
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'rgba(94, 200, 80, 0.1)', border: '1px solid rgba(94, 200, 80, 0.3)',
                  borderRadius: '50%', width: '36px', height: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#c8e6c0', fontSize: '18px', cursor: 'pointer', outline: 'none',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                }}
                onClick={closeDrawer}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(94, 200, 80, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(94, 200, 80, 0.1)'; }}
              >
                ✕
              </button>

              {/* Section badge */}
              <div style={{ textAlign: 'center', marginTop: '8px', marginBottom: '8px' }}>
                <span style={{
                  display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '600',
                  backgroundColor: 'rgba(74, 172, 240, 0.15)', color: '#4aacf0', textTransform: 'uppercase', letterSpacing: '1px',
                }}>{sectionLabel[selectedType]}</span>
              </div>

              {/* Sprite */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                {drawerData?.render_url ? (
                  <img src={drawerData.render_url} alt={itemName} style={{ width: 200, height: 200, objectFit: 'contain' }} loading="lazy" />
                ) : (
                  <AssetImg category={assetCategoryMap[selectedType]} name={itemName} size={200} />
                )}
              </div>

              {/* Name */}
              <div style={{
                fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: '700',
                color: '#5ec850', textAlign: 'center', marginBottom: '16px',
              }}>
                {itemName}
              </div>

              {/* === Fish / Bug / Sea Creature drawer === */}
              {(selectedType === 'fish' || selectedType === 'bug' || selectedType === 'sea') && (
                <>
                  {/* Loading / API data */}
                  {!drawerData ? (
                    <div style={{ textAlign: 'center', color: '#5a7a50', fontStyle: 'italic', padding: '20px' }}>Loading details...</div>
                  ) : (
                    <>
                      {/* Rarity */}
                      {drawerData.rarity && (
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                          <span style={{
                            display: 'inline-block', padding: '6px 16px', borderRadius: '16px', fontSize: '13px', fontWeight: '600',
                            backgroundColor: 'rgba(94,200,80,0.15)', border: '1px solid rgba(94,200,80,0.3)', color: '#5ec850',
                          }}>{drawerData.rarity}</span>
                        </div>
                      )}

                      {/* Info grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                        {drawerData.sell_nook != null && (
                          <div style={{ backgroundColor: 'rgba(94,200,80,0.06)', border: '1px solid rgba(94,200,80,0.15)', borderRadius: '8px', padding: '12px' }}>
                            <div style={{ fontSize: '11px', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Sell Price</div>
                            <div style={{ fontSize: '14px', color: '#d4b030', fontWeight: '600', fontFamily: "'DM Mono', monospace" }}>{Number(drawerData.sell_nook).toLocaleString()} Bells</div>
                          </div>
                        )}
                        {drawerData.location && (
                          <div style={{ backgroundColor: 'rgba(94,200,80,0.06)', border: '1px solid rgba(94,200,80,0.15)', borderRadius: '8px', padding: '12px' }}>
                            <div style={{ fontSize: '11px', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Location</div>
                            <div style={{ fontSize: '14px', color: '#c8e6c0', fontWeight: '500' }}>{drawerData.location}</div>
                          </div>
                        )}
                        {drawerData.shadow_size && (
                          <div style={{ backgroundColor: 'rgba(94,200,80,0.06)', border: '1px solid rgba(94,200,80,0.15)', borderRadius: '8px', padding: '12px' }}>
                            <div style={{ fontSize: '11px', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Shadow</div>
                            <div style={{ fontSize: '14px', color: '#c8e6c0', fontWeight: '500' }}>{drawerData.shadow_size}</div>
                          </div>
                        )}
                        {drawerData.speed && (
                          <div style={{ backgroundColor: 'rgba(94,200,80,0.06)', border: '1px solid rgba(94,200,80,0.15)', borderRadius: '8px', padding: '12px' }}>
                            <div style={{ fontSize: '11px', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Speed</div>
                            <div style={{ fontSize: '14px', color: '#c8e6c0', fontWeight: '500' }}>{drawerData.speed}</div>
                          </div>
                        )}
                      </div>

                      {/* Catchphrase */}
                      {drawerData.catchphrases?.[0] && (
                        <div style={{ marginBottom: '20px', paddingTop: '20px', borderTop: '1px solid rgba(94,200,80,0.1)' }}>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Catchphrase</div>
                          <div style={{
                            fontStyle: 'italic', color: '#d4b030', fontSize: '14px', lineHeight: '1.6',
                            padding: '12px', backgroundColor: 'rgba(212,176,48,0.06)', border: '1px solid rgba(212,176,48,0.15)', borderRadius: '8px',
                          }}>
                            &ldquo;{drawerData.catchphrases[0]}&rdquo;
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* === Fossil drawer === */}
              {selectedType === 'fossil' && (
                <>
                  {/* Local data */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ backgroundColor: 'rgba(94,200,80,0.06)', border: '1px solid rgba(94,200,80,0.15)', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Fossil Group</div>
                      <div style={{ fontSize: '14px', color: '#c8e6c0', fontWeight: '500' }}>{selectedItem.species}</div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(94,200,80,0.06)', border: '1px solid rgba(94,200,80,0.15)', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Part</div>
                      <div style={{ fontSize: '14px', color: '#c8e6c0', fontWeight: '500' }}>{selectedItem.part}</div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(94,200,80,0.06)', border: '1px solid rgba(94,200,80,0.15)', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Sell Price</div>
                      <div style={{ fontSize: '14px', color: '#d4b030', fontWeight: '600', fontFamily: "'DM Mono', monospace" }}>{selectedItem.sellPrice.toLocaleString()} Bells</div>
                    </div>
                  </div>

                  {/* API data */}
                  {!drawerData ? (
                    <div style={{ textAlign: 'center', color: '#5a7a50', fontStyle: 'italic', padding: '20px' }}>Loading details...</div>
                  ) : (
                    <>
                      {drawerData.image_url && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', paddingTop: '20px', borderTop: '1px solid rgba(94,200,80,0.1)' }}>
                          <img src={drawerData.image_url} alt={itemName} style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }} />
                        </div>
                      )}
                      {drawerData.colors && drawerData.colors.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Colors</div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {drawerData.colors.map((color, i) => (
                              <span key={i} style={{
                                padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500',
                                backgroundColor: 'rgba(74,172,240,0.12)', color: '#4aacf0', border: '1px solid rgba(74,172,240,0.25)',
                              }}>{color}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* === Art drawer === */}
              {selectedType === 'art' && (
                <>
                  {/* Always real badge */}
                  {selectedItem.alwaysReal && (
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '6px 16px', borderRadius: '16px', fontSize: '13px', fontWeight: '600',
                        backgroundColor: 'rgba(94,200,80,0.2)', border: '1px solid rgba(94,200,80,0.4)', color: '#5ec850',
                      }}>⭐ Always Real</span>
                    </div>
                  )}
                  {!selectedItem.alwaysReal && (
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '6px 16px', borderRadius: '16px', fontSize: '13px', fontWeight: '600',
                        backgroundColor: 'rgba(212,176,48,0.15)', border: '1px solid rgba(212,176,48,0.3)', color: '#d4b030',
                      }}>⚠ Has Forgery</span>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ backgroundColor: 'rgba(94,200,80,0.06)', border: '1px solid rgba(94,200,80,0.15)', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Type</div>
                      <div style={{ fontSize: '14px', color: '#c8e6c0', fontWeight: '500' }}>{selectedItem.type}</div>
                    </div>
                    {drawerData?.sell_nook != null && (
                      <div style={{ backgroundColor: 'rgba(94,200,80,0.06)', border: '1px solid rgba(94,200,80,0.15)', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Sell Price</div>
                        <div style={{ fontSize: '14px', color: '#d4b030', fontWeight: '600', fontFamily: "'DM Mono', monospace" }}>{Number(drawerData.sell_nook).toLocaleString()} Bells</div>
                      </div>
                    )}
                  </div>

                  {!drawerData ? (
                    <div style={{ textAlign: 'center', color: '#5a7a50', fontStyle: 'italic', padding: '20px' }}>Loading details...</div>
                  ) : (
                    <>
                      {/* Art name / author */}
                      {drawerData.art_name && (
                        <div style={{ marginBottom: '20px', paddingTop: '20px', borderTop: '1px solid rgba(94,200,80,0.1)' }}>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Real-World Artwork</div>
                          <div style={{ fontSize: '16px', color: '#c8e6c0', fontWeight: '600', fontFamily: "'Playfair Display', serif", marginBottom: '4px' }}>{drawerData.art_name}</div>
                          {drawerData.author && <div style={{ fontSize: '13px', color: '#5a7a50' }}>by {drawerData.author}</div>}
                        </div>
                      )}

                      {/* Real image */}
                      {drawerData.image_url && (
                        <div style={{ marginBottom: '20px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#5a7a50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Real Version</div>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <img src={drawerData.image_url} alt={`${itemName} (Real)`} style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px', border: '1px solid rgba(94,200,80,0.2)' }} />
                          </div>
                        </div>
                      )}

                      {/* Fake image */}
                      {drawerData.fake_image_url && (
                        <div style={{ marginBottom: '20px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#d4b030', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Fake Version</div>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <img src={drawerData.fake_image_url} alt={`${itemName} (Fake)`} style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px', border: '1px solid rgba(212,176,48,0.3)' }} />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </>
        );
      })()}
    </div>
  );
};

export default MuseumTracker;
