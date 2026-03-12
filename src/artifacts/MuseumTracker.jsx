import React, { useState, useEffect } from 'react';

const MuseumTracker = () => {
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
    { id: 1, name: 'Ammonite', species: 'Ammonite', part: 'Full' },
    { id: 2, name: 'Ankylo Skull', species: 'Ankylosaurus', part: 'Skull' },
    { id: 3, name: 'Ankylo Tail', species: 'Ankylosaurus', part: 'Tail' },
    { id: 4, name: 'Ankylo Torso', species: 'Ankylosaurus', part: 'Torso' },
    { id: 5, name: 'Archaeopteryx', species: 'Archaeopteryx', part: 'Full' },
    { id: 6, name: 'Australopith Skull', species: 'Australopithecus', part: 'Skull' },
    { id: 7, name: 'Australopith Torso', species: 'Australopithecus', part: 'Torso' },
    { id: 8, name: 'Brachio Chest', species: 'Brachiosaurus', part: 'Chest' },
    { id: 9, name: 'Brachio Pelvis', species: 'Brachiosaurus', part: 'Pelvis' },
    { id: 10, name: 'Brachio Skull', species: 'Brachiosaurus', part: 'Skull' },
    { id: 11, name: 'Brachio Tail', species: 'Brachiosaurus', part: 'Tail' },
    { id: 12, name: 'Coprolite', species: 'Coprolite', part: 'Full' },
    { id: 13, name: 'Deinony Chest', species: 'Deinonychus', part: 'Chest' },
    { id: 14, name: 'Deinony Tail', species: 'Deinonychus', part: 'Tail' },
    { id: 15, name: 'Dimetrodon Skull', species: 'Dimetrodon', part: 'Skull' },
    { id: 16, name: 'Dimetrodon Torso', species: 'Dimetrodon', part: 'Torso' },
    { id: 17, name: 'Dinosaur Egg', species: 'Dinosaur Egg', part: 'Full' },
    { id: 18, name: 'Diplo Chest', species: 'Diplodocus', part: 'Chest' },
    { id: 19, name: 'Diplo Neck', species: 'Diplodocus', part: 'Neck' },
    { id: 20, name: 'Diplo Pelvis', species: 'Diplodocus', part: 'Pelvis' },
    { id: 21, name: 'Diplo Skull', species: 'Diplodocus', part: 'Skull' },
    { id: 22, name: 'Diplo Tail', species: 'Diplodocus', part: 'Tail' },
    { id: 23, name: 'Iguanodon Skull', species: 'Iguanodon', part: 'Skull' },
    { id: 24, name: 'Iguanodon Tail', species: 'Iguanodon', part: 'Tail' },
    { id: 25, name: 'Iguanodon Torso', species: 'Iguanodon', part: 'Torso' },
    { id: 26, name: 'Iguanodon Leg', species: 'Iguanodon', part: 'Leg' },
    { id: 27, name: 'Mammoth Skull', species: 'Mammoth', part: 'Skull' },
    { id: 28, name: 'Mammoth Torso', species: 'Mammoth', part: 'Torso' },
    { id: 29, name: 'Megacero Skull', species: 'Megaceros', part: 'Skull' },
    { id: 30, name: 'Megacero Tail', species: 'Megaceros', part: 'Tail' },
    { id: 31, name: 'Megacero Torso', species: 'Megaceros', part: 'Torso' },
    { id: 32, name: 'Megalo Left Side', species: 'Megalosaurus', part: 'Left Side' },
    { id: 33, name: 'Megalo Right Side', species: 'Megalosaurus', part: 'Right Side' },
    { id: 34, name: 'Megalo Skull', species: 'Megalosaurus', part: 'Skull' },
    { id: 35, name: 'Megalo Tail', species: 'Megalosaurus', part: 'Tail' },
    { id: 36, name: 'Myllokunmingia', species: 'Myllokunmingia', part: 'Full' },
    { id: 37, name: 'Ophthalmo Skull', species: 'Opthalmosaurus', part: 'Skull' },
    { id: 38, name: 'Ophthalmo Torso', species: 'Opthalmosaurus', part: 'Torso' },
    { id: 39, name: 'Parasaur Chest', species: 'Parasaurolophus', part: 'Chest' },
    { id: 40, name: 'Parasaur Skull', species: 'Parasaurolophus', part: 'Skull' },
    { id: 41, name: 'Parasaur Tail', species: 'Parasaurolophus', part: 'Tail' },
    { id: 42, name: 'Peking Man Skull', species: 'Peking Man', part: 'Skull' },
    { id: 43, name: 'Peking Man Torso', species: 'Peking Man', part: 'Torso' },
    { id: 44, name: 'Plesio Body', species: 'Plesiosaur', part: 'Body' },
    { id: 45, name: 'Plesio Neck', species: 'Plesiosaur', part: 'Neck' },
    { id: 46, name: 'Plesio Skull', species: 'Plesiosaur', part: 'Skull' },
    { id: 47, name: 'Plesio Tail', species: 'Plesiosaur', part: 'Tail' },
    { id: 48, name: 'Ptera Body', species: 'Pteranodon', part: 'Body' },
    { id: 49, name: 'Ptera Left Wing', species: 'Pteranodon', part: 'Left Wing' },
    { id: 50, name: 'Ptera Right Wing', species: 'Pteranodon', part: 'Right Wing' },
    { id: 51, name: 'Ptera Skull', species: 'Pteranodon', part: 'Skull' },
    { id: 52, name: 'Right Megalo Side', species: 'Megalosaurus', part: 'Right Side' },
    { id: 53, name: 'Saber Tooth Skull', species: 'Saber Tooth', part: 'Skull' },
    { id: 54, name: 'Saber Tooth Torso', species: 'Saber Tooth', part: 'Torso' },
    { id: 55, name: 'Seismo Chest', species: 'Seismosaurus', part: 'Chest' },
    { id: 56, name: 'Seismo Neck', species: 'Seismosaurus', part: 'Neck' },
    { id: 57, name: 'Seismo Tail', species: 'Seismosaurus', part: 'Tail' },
    { id: 58, name: 'Shark-tooth Pattern', species: 'Shark Tooth', part: 'Full' },
    { id: 59, name: 'Spino Chest', species: 'Spinosaurus', part: 'Chest' },
    { id: 60, name: 'Spino Skull', species: 'Spinosaurus', part: 'Skull' },
    { id: 61, name: 'Spino Tail', species: 'Spinosaurus', part: 'Tail' },
    { id: 62, name: 'Stego Chest', species: 'Stegosaurus', part: 'Chest' },
    { id: 63, name: 'Stego Skull', species: 'Stegosaurus', part: 'Skull' },
    { id: 64, name: 'Stego Tail', species: 'Stegosaurus', part: 'Tail' },
    { id: 65, name: 'T-Rex Chest', species: 'Tyrannosaurus', part: 'Chest' },
    { id: 66, name: 'T-Rex Skull', species: 'Tyrannosaurus', part: 'Skull' },
    { id: 67, name: 'T-Rex Tail', species: 'Tyrannosaurus', part: 'Tail' },
    { id: 68, name: 'Tricera Skull', species: 'Triceratops', part: 'Skull' },
    { id: 69, name: 'Tricera Tail', species: 'Triceratops', part: 'Tail' },
    { id: 70, name: 'Tricera Torso', species: 'Triceratops', part: 'Torso' },
    { id: 71, name: 'Trilobite', species: 'Trilobite', part: 'Full' },
    { id: 72, name: 'Vestigial Tail', species: 'Vestigial Tail', part: 'Full' },
    { id: 73, name: 'Vertebra Torso', species: 'Vertebra', part: 'Torso' }
  ];

  const ART = [
    { id: 1, name: 'Academic Painting', type: 'Painting', alwaysReal: true },
    { id: 2, name: 'Amazing Painting', type: 'Painting', alwaysReal: false },
    { id: 3, name: 'Ancient Statue', type: 'Statue', alwaysReal: true },
    { id: 4, name: 'Angry Gnome', type: 'Statue', alwaysReal: true },
    { id: 5, name: 'Armillary Sphere', type: 'Statue', alwaysReal: true },
    { id: 6, name: 'Beautiful Statue', type: 'Statue', alwaysReal: false },
    { id: 7, name: 'Basic Painting', type: 'Painting', alwaysReal: true },
    { id: 8, name: 'Calm Painting', type: 'Painting', alwaysReal: false },
    { id: 9, name: 'Detailed Painting', type: 'Painting', alwaysReal: true },
    { id: 10, name: 'Eerie Painting', type: 'Painting', alwaysReal: true },
    { id: 11, name: 'Exquisite Statue', type: 'Statue', alwaysReal: false },
    { id: 12, name: 'Flowery Painting', type: 'Painting', alwaysReal: true },
    { id: 13, name: 'Forgery Painting', type: 'Painting', alwaysReal: false },
    { id: 14, name: 'Gallant Statue', type: 'Statue', alwaysReal: true },
    { id: 15, name: 'Gave Painting', type: 'Painting', alwaysReal: true },
    { id: 16, name: 'Glowing Painting', type: 'Painting', alwaysReal: true },
    { id: 17, name: 'Graceful Painting', type: 'Painting', alwaysReal: false },
    { id: 18, name: 'Great Statue', type: 'Statue', alwaysReal: false },
    { id: 19, name: 'Hauntingly Beautiful Statue', type: 'Statue', alwaysReal: false },
    { id: 20, name: 'Jolly Painting', type: 'Painting', alwaysReal: true },
    { id: 21, name: 'Landmarks Painting', type: 'Painting', alwaysReal: true },
    { id: 22, name: 'Leaf Pile Painting', type: 'Painting', alwaysReal: false },
    { id: 23, name: 'Mysterious Painting', type: 'Painting', alwaysReal: true },
    { id: 24, name: 'Motherly Statue', type: 'Statue', alwaysReal: true },
    { id: 25, name: 'Moving Painting', type: 'Painting', alwaysReal: false },
    { id: 26, name: 'Nice Painting', type: 'Painting', alwaysReal: true },
    { id: 27, name: 'Nude Statue', type: 'Statue', alwaysReal: false },
    { id: 28, name: 'Perfect Painting', type: 'Painting', alwaysReal: false },
    { id: 29, name: 'Proper Painting', type: 'Painting', alwaysReal: true },
    { id: 30, name: 'Quaint Painting', type: 'Painting', alwaysReal: true },
    { id: 31, name: 'Quiet Painting', type: 'Painting', alwaysReal: false },
    { id: 32, name: 'Robust Statue', type: 'Statue', alwaysReal: true },
    { id: 33, name: 'Rock-head Statue', type: 'Statue', alwaysReal: true },
    { id: 34, name: 'Scenic Painting', type: 'Painting', alwaysReal: true },
    { id: 35, name: 'Serene Painting', type: 'Painting', alwaysReal: true },
    { id: 36, name: 'Solemn Painting', type: 'Painting', alwaysReal: true },
    { id: 37, name: 'Stately Painting', type: 'Painting', alwaysReal: true },
    { id: 38, name: 'Tremendous Statue', type: 'Statue', alwaysReal: true },
    { id: 39, name: 'Unfinished Painting', type: 'Painting', alwaysReal: false },
    { id: 40, name: 'Valiant Statue', type: 'Statue', alwaysReal: true },
    { id: 41, name: 'Worthy Painting', type: 'Painting', alwaysReal: true },
    { id: 42, name: 'Wistful Painting', type: 'Painting', alwaysReal: true },
    { id: 43, name: 'Warm Painting', type: 'Painting', alwaysReal: true }
  ];

  const [donated, setDonated] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('fish');
  const [loaded, setLoaded] = useState(false);

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

  const styles = {
    container: {
      width: '900px',
      margin: '0 auto',
      backgroundColor: '#0a1a10',
      color: '#e0e0e0',
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
      color: '#e0e0e0',
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
      color: '#999',
      cursor: 'pointer',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
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
      transition: 'all 0.2s ease',
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
      color: '#e0e0e0',
      lineHeight: '1.3'
    },
    itemNameUndone: {
      color: '#999'
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
      color: '#999',
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
                      onClick={() => toggleDonation(key)}
                      onMouseEnter={(e) => {
                        if (!isDonated) e.currentTarget.style.borderColor = '#5ec850';
                      }}
                      onMouseLeave={(e) => {
                        if (!isDonated) e.currentTarget.style.borderColor = 'rgba(94,200,80,0.3)';
                      }}
                    >
                      <div style={{ ...styles.itemName, ...(isDonated ? {} : styles.itemNameUndone) }}>
                        {fossil.name}
                      </div>
                      <div style={styles.checkbox}>
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
                  onClick={() => toggleDonation(key)}
                  onMouseEnter={(e) => {
                    if (!isDonated) e.currentTarget.style.borderColor = '#5ec850';
                  }}
                  onMouseLeave={(e) => {
                    if (!isDonated) e.currentTarget.style.borderColor = 'rgba(94,200,80,0.3)';
                  }}
                >
                  <div style={{ ...styles.itemName, ...(isDonated ? {} : styles.itemNameUndone) }}>
                    {art.name} {art.alwaysReal && '⭐'}
                  </div>
                  <div style={styles.checkbox}>
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
                  onClick={() => toggleDonation(key)}
                  onMouseEnter={(e) => {
                    if (!isDonated) e.currentTarget.style.borderColor = '#5ec850';
                  }}
                  onMouseLeave={(e) => {
                    if (!isDonated) e.currentTarget.style.borderColor = 'rgba(94,200,80,0.3)';
                  }}
                >
                  <div style={{ ...styles.itemName, ...(isDonated ? {} : styles.itemNameUndone) }}>
                    {art.name} {art.alwaysReal && '⭐'}
                  </div>
                  <div style={styles.checkbox}>
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
    if (sectionKey === 'fish') { sectionItems = FISH; sectionPrefix = 'fish'; }
    else if (sectionKey === 'bugs') { sectionItems = BUGS; sectionPrefix = 'bugs'; }
    else if (sectionKey === 'sea') { sectionItems = SEA_CREATURES; sectionPrefix = 'sea'; }

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
              onClick={() => toggleDonation(key)}
              onMouseEnter={(e) => {
                if (!isDonated) e.currentTarget.style.borderColor = '#5ec850';
              }}
              onMouseLeave={(e) => {
                if (!isDonated) e.currentTarget.style.borderColor = 'rgba(94,200,80,0.3)';
              }}
            >
              <div style={{ ...styles.itemName, ...(isDonated ? {} : styles.itemNameUndone) }}>
                {name}
              </div>
              <div style={styles.checkbox}>
                {isDonated ? '✅' : '☐'}
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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400&display=swap');
        * { box-sizing: border-box; }
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
          { key: 'fish', label: '🐟 Fish', count: 80 },
          { key: 'bugs', label: '🪲 Bugs', count: 80 },
          { key: 'sea', label: '🐚 Sea Creatures', count: 40 },
          { key: 'fossils', label: '🦴 Fossils', count: 73 },
          { key: 'art', label: '🎨 Art', count: 43 }
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

      {activeTab === 'fish' && renderSection('fish', filterItems(FISH), 'Fish', '🐟')}
      {activeTab === 'bugs' && renderSection('bugs', filterItems(BUGS), 'Bugs', '🪲')}
      {activeTab === 'sea' && renderSection('sea', filterItems(SEA_CREATURES), 'Sea Creatures', '🐚')}
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
    </div>
  );
};

export default MuseumTracker;
