import React, { useState, useEffect } from 'react';

const FiveStarChecker = () => {
  const STORAGE_KEY = 'acnh-five-star-checker';

  const [data, setData] = useState({
    villagers: 8,
    nooksCount: 1,
    ableCount: 1,
    museumCount: 1,
    campsiteCount: 1,
    bridgesCount: 0,
    inclineCount: 0,
    fencingSegments: 0,
    treesPlanted: 0,
    flowersPlanted: 0,
    furnitureOutdoor: 0,
    diyFurniture: 0,
    weedCount: 0,
    groundItems: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result && result.value) {
          setData(JSON.parse(result.value));
        }
      } catch (e) {
        console.log('Loading default data');
      }
    };
    loadData();
  }, []);

  const saveData = async (newData) => {
    setData(newData);
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.log('Error in saveData function', e);
    }
  };

  const calculateDevelopmentPoints = () => {
    let points = 0;

    // Villagers (need 8-10)
    if (data.villagers >= 8 && data.villagers <= 10) {
      points += 420;
    } else if (data.villagers > 10) {
      points += Math.max(0, 420 - (data.villagers - 10) * 20);
    } else {
      points += Math.max(0, data.villagers * 52.5);
    }

    // Buildings
    points += (data.nooksCount * 75) + (data.ableCount * 75) + (data.museumCount * 75) + (data.campsiteCount * 75);
    points += (data.bridgesCount * 15) + (data.inclineCount * 15);

    // Fencing (50+ segments = 50 points)
    if (data.fencingSegments >= 50) {
      points += 50;
    } else {
      points += data.fencingSegments;
    }

    return points;
  };

  const calculateSceneryPoints = () => {
    let points = 0;

    // Trees (110-200 optimal)
    if (data.treesPlanted >= 110 && data.treesPlanted <= 200) {
      points += 120;
    } else if (data.treesPlanted > 200) {
      points += Math.max(0, 120 - (data.treesPlanted - 200));
    } else {
      points += Math.max(0, data.treesPlanted * 1.09);
    }

    // Flowers (200+)
    if (data.flowersPlanted >= 200) {
      points += 120;
    } else {
      points += Math.max(0, data.flowersPlanted * 0.6);
    }

    // Outdoor furniture
    points += Math.min(data.furnitureOutdoor * 0.5, 100);

    // DIY furniture bonus
    points += Math.min(data.diyFurniture * 1, 50);

    // Weed penalty
    points += Math.max(0, 50 - (data.weedCount * 5));

    // Ground items penalty
    points += Math.max(0, 60 - (data.groundItems * 3));

    return Math.round(points);
  };

  const devPoints = calculateDevelopmentPoints();
  const sceneryPoints = calculateSceneryPoints();
  const totalPoints = devPoints + sceneryPoints;

  const calculateStars = () => {
    if (totalPoints < 665) return 1;
    if (totalPoints < 1115) return 2;
    if (totalPoints < 1565) return 3;
    if (totalPoints < 1965) return 4;
    return 5;
  };

  const stars = calculateStars();
  const devMet = devPoints >= 665;
  const sceneryMet = sceneryPoints >= 450;

  const updateField = (field, value) => {
    const newData = { ...data, [field]: Math.max(0, value) };
    saveData(newData);
  };

  const resetData = () => {
    const defaultData = {
      villagers: 8,
      nooksCount: 1,
      ableCount: 1,
      museumCount: 1,
      campsiteCount: 1,
      bridgesCount: 0,
      inclineCount: 0,
      fencingSegments: 0,
      treesPlanted: 0,
      flowersPlanted: 0,
      furnitureOutdoor: 0,
      diyFurniture: 0,
      weedCount: 0,
      groundItems: 0,
    };
    saveData(defaultData);
  };

  const issues = [];
  if (data.groundItems > 10) issues.push("Too many items on ground (aim for <10)");
  if (data.treesPlanted < 110) issues.push("Need more trees (aim for 110+)");
  if (data.treesPlanted > 220) issues.push("Too many trees (max ~220)");
  if (data.flowersPlanted < 200) issues.push("Need more flowers (aim for 200+)");
  if (data.weedCount > 5) issues.push("Pull weeds! (currently " + data.weedCount + ")");
  if (data.fencingSegments < 50) issues.push("Add more fencing (aim for 50+)");
  if (data.nooksCount === 0 || data.ableCount === 0 || data.museumCount === 0) issues.push("Missing key buildings");

  const tips = {
    1: "Focus on building infrastructure and placing furniture. Every item counts!",
    2: "Add villagers (8-10), more fencing, and start decorating with outdoor items.",
    3: "Plant 110+ trees, 200+ flowers, and place more outdoor furniture. Reduce ground clutter.",
    4: "Fine-tune: remove excess items from ground, ensure fencing covers 50+ segments, variety in furniture placement.",
    5: "Congratulations! Your island is perfect. Maintain by preventing weeds and ground clutter."
  };

  const starDisplay = '⭐'.repeat(stars) + '☆'.repeat(5 - stars);

  return (
    <div style={{
      width: '900px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#0a1a10',
      color: '#fff',
      fontFamily: '"DM Sans", sans-serif',
      minHeight: '100vh',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400&display=swap');
      `}</style>

      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: `2px solid ${('#5ec850')}`,
      }}>
        <h1 style={{
          fontFamily: '"Playfair Display", serif',
          fontSize: '48px',
          margin: '0 0 10px 0',
          color: '#5ec850',
        }}>5-Star Island Checker ⭐</h1>
        <p style={{ margin: '0', fontSize: '14px', color: '#aaa' }}>
          Track your progress toward island perfection
        </p>
      </div>

      {/* Star Rating Display */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'rgba(12,28,14,0.95)',
        borderRadius: '8px',
        borderLeft: `4px solid ${('#d4b030')}`,
      }}>
        <div style={{
          fontSize: '72px',
          letterSpacing: '8px',
          marginBottom: '10px',
          animation: 'pulse 2s infinite',
        }}>
          {starDisplay}
        </div>
        <p style={{ fontSize: '18px', margin: '10px 0', color: '#5ec850', fontWeight: '700' }}>
          Current Rating: {stars} Star{stars !== 1 ? 's' : ''}
        </p>
        <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#aaa' }}>
          Total: {totalPoints} points
        </p>
      </div>

      {/* Tips */}
      <div style={{
        padding: '15px',
        backgroundColor: 'rgba(74,172,240,0.1)',
        borderLeft: `4px solid ${('#4aacf0')}`,
        marginBottom: '25px',
        borderRadius: '4px',
        fontSize: '14px',
        lineHeight: '1.6',
      }}>
        💡 <strong>Tip for {stars}-Star Islands:</strong> {tips[stars]}
      </div>

      {/* Issues/Warnings */}
      {issues.length > 0 && (
        <div style={{
          padding: '15px',
          backgroundColor: 'rgba(212,176,48,0.1)',
          borderLeft: `4px solid ${('#d4b030')}`,
          marginBottom: '25px',
          borderRadius: '4px',
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: '700', fontSize: '14px' }}>Issues to Address:</p>
          {issues.map((issue, i) => (
            <p key={i} style={{ margin: '5px 0', fontSize: '13px' }}>🔸 {issue}</p>
          ))}
        </div>
      )}

      {/* Development Points Section */}
      <div style={{
        marginBottom: '25px',
        padding: '20px',
        backgroundColor: 'rgba(12,28,14,0.95)',
        borderRadius: '8px',
        borderLeft: `4px solid ${devMet ? '#5ec850' : '#d4b030'}`,
      }}>
        <h2 style={{
          fontSize: '22px',
          margin: '0 0 15px 0',
          color: devMet ? '#5ec850' : '#d4b030',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          🏗️ Development ({devPoints}/665)
          {devMet && <span style={{ fontSize: '18px' }}>✓</span>}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {/* Villagers */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#aaa' }}>
              Villagers (need 8-10): {data.villagers}
            </label>
            <input
              type="range"
              min="1"
              max="15"
              value={data.villagers}
              onChange={(e) => updateField('villagers', parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: '12px', color: '#5ec850', marginTop: '5px' }}>
              {data.villagers >= 8 && data.villagers <= 10 ? '✓ Optimal' : data.villagers > 10 ? '⚠️ Too many' : '⚠️ Need more'}
            </div>
          </div>

          {/* Bridges */}
          <div>
            <label style={{ fontSize: '13px', marginBottom: '8px', color: '#aaa', display: 'block' }}>
              Bridges & Inclines
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  value={data.bridgesCount}
                  onChange={(e) => updateField('bridgesCount', parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#1a2f20',
                    border: '1px solid #5ec850',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                  placeholder="Bridges"
                />
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '3px' }}>Bridges</div>
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  value={data.inclineCount}
                  onChange={(e) => updateField('inclineCount', parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#1a2f20',
                    border: '1px solid #5ec850',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                  placeholder="Inclines"
                />
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '3px' }}>Inclines</div>
              </div>
            </div>
          </div>

          {/* Buildings */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#aaa' }}>
              Buildings
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {[
                { key: 'nooksCount', label: "🏪 Nook's" },
                { key: 'ableCount', label: '👗 Able' },
                { key: 'museumCount', label: '🖼️ Museum' },
                { key: 'campsiteCount', label: '⛺ Campsite' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <button
                    onClick={() => updateField(key, data[key] + 1)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: data[key] > 0 ? '#5ec850' : '#1a2f20',
                      color: data[key] > 0 ? '#0a1a10' : '#aaa',
                      border: `1px solid ${data[key] > 0 ? '#5ec850' : '#444'}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '700',
                    }}
                  >
                    {label} ({data[key]})
                  </button>
                  {data[key] > 0 && (
                    <button
                      onClick={() => updateField(key, Math.max(0, data[key] - 1))}
                      style={{
                        width: '100%',
                        padding: '4px',
                        marginTop: '4px',
                        backgroundColor: 'transparent',
                        color: '#d4b030',
                        border: '1px solid #d4b030',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fencing */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#aaa' }}>
              Fencing Segments (need 50+): {data.fencingSegments}
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                value={data.fencingSegments}
                onChange={(e) => updateField('fencingSegments', parseInt(e.target.value) || 0)}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: '#1a2f20',
                  border: '1px solid #5ec850',
                  color: '#fff',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
              <button
                onClick={() => updateField('fencingSegments', data.fencingSegments + 10)}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#5ec850',
                  color: '#0a1a10',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '700',
                }}
              >
                +10
              </button>
            </div>
            <div style={{ fontSize: '12px', color: data.fencingSegments >= 50 ? '#5ec850' : '#d4b030', marginTop: '5px' }}>
              {data.fencingSegments >= 50 ? '✓ Goal met!' : `Need ${50 - data.fencingSegments} more`}
            </div>
          </div>
        </div>
      </div>

      {/* Scenery Points Section */}
      <div style={{
        marginBottom: '25px',
        padding: '20px',
        backgroundColor: 'rgba(12,28,14,0.95)',
        borderRadius: '8px',
        borderLeft: `4px solid ${sceneryMet ? '#5ec850' : '#d4b030'}`,
      }}>
        <h2 style={{
          fontSize: '22px',
          margin: '0 0 15px 0',
          color: sceneryMet ? '#5ec850' : '#d4b030',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          🌿 Scenery ({sceneryPoints}/450)
          {sceneryMet && <span style={{ fontSize: '18px' }}>✓</span>}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {/* Trees */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#aaa' }}>
              Trees Planted (110-200): {data.treesPlanted}
            </label>
            <input
              type="number"
              value={data.treesPlanted}
              onChange={(e) => updateField('treesPlanted', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a2f20',
                border: '1px solid #5ec850',
                color: '#fff',
                borderRadius: '4px',
                marginBottom: '8px',
                fontSize: '14px',
              }}
            />
            <div style={{ fontSize: '12px', color: data.treesPlanted >= 110 && data.treesPlanted <= 200 ? '#5ec850' : '#d4b030' }}>
              {data.treesPlanted >= 110 && data.treesPlanted <= 200 ? '✓ Optimal range' : '⚠️ Adjust amount'}
            </div>
          </div>

          {/* Flowers */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#aaa' }}>
              Flowers Planted (200+): {data.flowersPlanted}
            </label>
            <input
              type="number"
              value={data.flowersPlanted}
              onChange={(e) => updateField('flowersPlanted', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a2f20',
                border: '1px solid #5ec850',
                color: '#fff',
                borderRadius: '4px',
                marginBottom: '8px',
                fontSize: '14px',
              }}
            />
            <div style={{ fontSize: '12px', color: data.flowersPlanted >= 200 ? '#5ec850' : '#d4b030' }}>
              {data.flowersPlanted >= 200 ? '✓ Goal met!' : `Need ${200 - data.flowersPlanted} more`}
            </div>
          </div>

          {/* Outdoor Furniture */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#aaa' }}>
              Outdoor Furniture Placed: {data.furnitureOutdoor}
            </label>
            <input
              type="number"
              value={data.furnitureOutdoor}
              onChange={(e) => updateField('furnitureOutdoor', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a2f20',
                border: '1px solid #5ec850',
                color: '#fff',
                borderRadius: '4px',
                marginBottom: '8px',
                fontSize: '14px',
              }}
            />
            <div style={{ fontSize: '12px', color: '#aaa' }}>Varies in impact</div>
          </div>

          {/* DIY Furniture */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#aaa' }}>
              DIY/Custom Furniture: {data.diyFurniture}
            </label>
            <input
              type="number"
              value={data.diyFurniture}
              onChange={(e) => updateField('diyFurniture', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a2f20',
                border: '1px solid #5ec850',
                color: '#fff',
                borderRadius: '4px',
                marginBottom: '8px',
                fontSize: '14px',
              }}
            />
            <div style={{ fontSize: '12px', color: '#aaa' }}>Handmade items boost score</div>
          </div>

          {/* Weeds */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#aaa' }}>
              Weeds Growing: {data.weedCount}
            </label>
            <input
              type="number"
              value={data.weedCount}
              onChange={(e) => updateField('weedCount', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a2f20',
                border: '1px solid #5ec850',
                color: '#fff',
                borderRadius: '4px',
                marginBottom: '8px',
                fontSize: '14px',
              }}
            />
            <div style={{ fontSize: '12px', color: data.weedCount === 0 ? '#5ec850' : '#d4b030' }}>
              {data.weedCount === 0 ? '✓ Keep island clean!' : `Penalty: -${data.weedCount * 5} pts`}
            </div>
          </div>

          {/* Ground Items */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#aaa' }}>
              Items on Ground: {data.groundItems}
            </label>
            <input
              type="number"
              value={data.groundItems}
              onChange={(e) => updateField('groundItems', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#1a2f20',
                border: '1px solid #5ec850',
                color: '#fff',
                borderRadius: '4px',
                marginBottom: '8px',
                fontSize: '14px',
              }}
            />
            <div style={{ fontSize: '12px', color: data.groundItems < 5 ? '#5ec850' : '#d4b030' }}>
              {data.groundItems === 0 ? '✓ Perfect!' : `Penalty: -${data.groundItems * 3} pts`}
            </div>
          </div>
        </div>
      </div>

      {/* Score Summary */}
      <div style={{
        padding: '20px',
        backgroundColor: 'rgba(12,28,14,0.95)',
        borderRadius: '8px',
        marginBottom: '25px',
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#d4b030', fontSize: '16px' }}>Score Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          <div style={{ padding: '10px', backgroundColor: 'rgba(94,200,80,0.1)', borderRadius: '4px', borderLeft: `3px solid #5ec850` }}>
            <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Development</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#5ec850' }}>{devPoints}</div>
            <div style={{ fontSize: '11px', color: '#aaa', marginTop: '5px' }}>Need: 665+</div>
          </div>
          <div style={{ padding: '10px', backgroundColor: 'rgba(94,200,80,0.1)', borderRadius: '4px', borderLeft: `3px solid #5ec850` }}>
            <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Scenery</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#5ec850' }}>{sceneryPoints}</div>
            <div style={{ fontSize: '11px', color: '#aaa', marginTop: '5px' }}>Need: 450+</div>
          </div>
          <div style={{ padding: '10px', backgroundColor: 'rgba(212,176,48,0.1)', borderRadius: '4px', borderLeft: `3px solid #d4b030` }}>
            <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Total</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#d4b030' }}>{totalPoints}</div>
            <div style={{ fontSize: '11px', color: '#aaa', marginTop: '5px' }}>All thresholds</div>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetData}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: 'transparent',
          color: '#d4b030',
          border: `1px solid #d4b030`,
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '700',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(212,176,48,0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
        }}
      >
        🔄 Reset All Data
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        input[type="range"] {
          accent-color: #5ec850;
        }
      `}</style>
    </div>
  );
};

export default FiveStarChecker;
