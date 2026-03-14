import React, { useState, useEffect } from 'react';
import { AssetImg } from '../assetHelper';
import { SPECIES, BREEDING_PATHS, BLUE_ROSE_PATH, GOLD_ROSE_INFO } from './gardenData';

// Adapt gardenData format to component format:
// gardenData: SPECIES[lowercase].colors[].color, probability float 0-1
// Component: flowerData[TitleCase].colors[].name, chance int 0-100
const flowerData = Object.fromEntries(
  Object.entries(SPECIES).map(([key, sp]) => [
    sp.name,
    {
      emoji: sp.emoji,
      genes: sp.geneCount,
      seedColors: sp.seedColors,
      colors: sp.colors.map(c => ({
        name: c.color,
        genes: c.genes,
        source: c.source,
        hex: c.hex,
        hasAsset: c.hasAsset,
        ...(c.note ? { note: c.note } : {}),
      })),
    }
  ])
);

const breedingPaths = Object.fromEntries(
  Object.entries(BREEDING_PATHS).map(([key, paths]) => [
    SPECIES[key].name,
    paths.map(p => ({
      p1: p.parents[0],
      p2: p.parents[1],
      results: p.offspring.map(o => ({
        color: o.color,
        chance: Math.round(o.probability * 100),
      })),
    })),
  ])
);

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
            {BLUE_ROSE_PATH.map((step, idx) => (
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
