'use client';

import React, { useState, useEffect } from 'react';
import { AssetImg } from '../assetHelper';
import { DIY_CATEGORIES, SOURCES, SEASONAL_SECTIONS, STORAGE_KEY, TOTAL_RECIPES } from './diyRecipeData';

// Verified ACNH DIY Recipe Tracker — all names sourced from manifest + Nookipedia
const DIYRecipeTracker = () => {
  const [activeTab, setActiveTab] = useState('category');
  const [learnedRecipes, setLearnedRecipes] = useState(new Set());
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [hemisphere, setHemisphere] = useState('northern');

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result) {
          const data = JSON.parse(result.value);
          const allRecipes = new Set(
            Object.values(DIY_CATEGORIES).flatMap(cat => cat.recipes)
          );
          const cleaned = (data.learned || []).filter(name => allRecipes.has(name));
          setLearnedRecipes(new Set(cleaned));
        }
      } catch (err) {
        console.error('Failed to load DIY tracker data:', err);
      }
    };
    loadData();
  }, []);

  // Persist whenever learnedRecipes changes
  useEffect(() => {
    (async () => {
      try {
        await window.storage.set(
          STORAGE_KEY,
          JSON.stringify({ learned: Array.from(learnedRecipes) })
        );
      } catch (e) {
        console.error('Error saving recipes:', e);
      }
    })();
  }, [learnedRecipes]);

  const toggleRecipeLearned = (recipe) => {
    setLearnedRecipes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recipe)) {
        newSet.delete(recipe);
      } else {
        newSet.add(recipe);
      }
      return newSet;
    });
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const getFilteredCategories = () => {
    if (!searchTerm) return DIY_CATEGORIES;
    const term = searchTerm.toLowerCase();
    const filtered = {};
    Object.entries(DIY_CATEGORIES).forEach(([cat, data]) => {
      const matchedRecipes = data.recipes.filter(r =>
        r.toLowerCase().includes(term)
      );
      if (matchedRecipes.length > 0 || cat.toLowerCase().includes(term)) {
        filtered[cat] = { ...data, recipes: matchedRecipes.length > 0 ? matchedRecipes : data.recipes };
      }
    });
    return filtered;
  };

  const getCategoryProgress = (categoryName) => {
    const recipes = DIY_CATEGORIES[categoryName].recipes;
    const learned = recipes.filter(r => learnedRecipes.has(r)).length;
    return { learned, total: recipes.length };
  };

  const learnedCount = learnedRecipes.size;
  const progressPercent = TOTAL_RECIPES > 0 ? Math.round((learnedCount / TOTAL_RECIPES) * 100) : 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const styles = {
    container: {
      width: '100%',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#0a1a10',
      minHeight: '100vh',
      fontFamily: "'DM Sans', sans-serif",
      color: '#c8e6c0'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '36px',
      fontWeight: 700,
      color: '#5ec850',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '14px',
      color: '#5a7a50',
      margin: 0
    },
    tabs: {
      display: 'flex',
      gap: '4px',
      marginBottom: '24px',
      borderBottom: '1px solid rgba(94, 200, 80, 0.2)',
      flexWrap: 'wrap'
    },
    tabButton: {
      padding: '10px 18px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#5a7a50',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',      outline: 'none',

      borderBottom: '2px solid transparent',
      transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease'
    },
    tabButtonActive: {
      color: '#5ec850',
      borderBottomColor: '#5ec850'
    },
    statsBox: {
      display: 'flex',
      gap: '24px',
      marginBottom: '24px',
      padding: '20px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '8px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    progressRingWrap: {
      flex: '0 0 120px',
      textAlign: 'center'
    },
    progressText: {
      fontFamily: "'DM Mono', monospace",
      fontSize: '24px',
      fontWeight: 700,
      color: '#5ec850',
      margin: '4px 0 0 0'
    },
    progressSubtext: {
      fontSize: '12px',
      color: '#5a7a50',
      margin: '2px 0 0 0'
    },
    statsContent: {
      flex: 1,
      minWidth: '160px'
    },
    statRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
      fontSize: '14px'
    },
    statLabel: {
      color: '#5a7a50'
    },
    statValue: {
      color: '#d4b030',
      fontFamily: "'DM Mono', monospace",
      fontWeight: 700
    },
    searchBox: {
      width: '100%',
      padding: '12px 16px',
      marginBottom: '20px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.3)',
      borderRadius: '6px',
      color: '#c8e6c0',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    categoryCard: {
      marginBottom: '10px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    categoryHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      cursor: 'pointer',      outline: 'none',

      transition: 'background-color 0.2s ease'
    },
    categoryTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flex: 1,
      margin: 0,
      fontSize: '15px',
      fontWeight: 600,
      color: '#c8e6c0'
    },
    categoryRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    categoryCount: {
      fontSize: '13px',
      color: '#d4b030',
      fontFamily: "'DM Mono', monospace",
      minWidth: '48px',
      textAlign: 'right'
    },
    progressBar: {
      width: '80px',
      height: '5px',
      backgroundColor: 'rgba(94, 200, 80, 0.15)',
      borderRadius: '3px',
      overflow: 'hidden'
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#5ec850',
      transition: 'width 0.3s ease'
    },
    expandIcon: {
      fontSize: '14px',
      color: '#5a7a50',
      transition: 'transform 0.25s ease'
    },
    categoryContent: {
      padding: '14px',
      backgroundColor: 'rgba(0, 0, 0, 0.25)',
      borderTop: '1px solid rgba(94, 200, 80, 0.1)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
      gap: '6px'
    },
    recipeItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '7px',
      padding: '7px 8px',
      backgroundColor: 'rgba(12, 28, 14, 0.6)',
      border: '1px solid rgba(94, 200, 80, 0.12)',
      borderRadius: '4px',
      cursor: 'pointer',      outline: 'none',

      transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
      fontSize: '12px'
    },
    checkbox: {
      width: '14px',
      height: '14px',
      cursor: 'pointer',      outline: 'none',

      accentColor: '#5ec850',
      flexShrink: 0
    },
    sourceCard: {
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '8px'
    },
    sourceTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '16px',
      fontWeight: 600,
      color: '#5ec850',
      margin: '0 0 8px 0'
    },
    sourceDesc: {
      fontSize: '13px',
      color: '#5a7a50',
      marginBottom: '8px',
      lineHeight: 1.55
    },
    sourceTips: {
      fontSize: '12px',
      color: '#4aacf0',
      padding: '8px 10px',
      backgroundColor: 'rgba(74, 172, 240, 0.08)',
      borderRadius: '4px',
      marginBottom: '10px',
      borderLeft: '3px solid #4aacf0'
    },
    sourceMeta: {
      display: 'flex',
      gap: '20px',
      fontSize: '12px'
    },
    sourceMetaItem: {
      color: '#5a7a50'
    },
    sourceLabel: {
      color: '#5ec850',
      fontWeight: 600
    },
    seasonCard: {
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '8px'
    },
    seasonHeader: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '10px',
      marginBottom: '10px'
    },
    seasonName: {
      fontSize: '16px',
      fontWeight: 700,
      color: '#d4b030',
      margin: 0,
      fontFamily: "'Playfair Display', serif"
    },
    seasonSource: {
      fontSize: '12px',
      color: '#4aacf0',
      fontStyle: 'italic'
    },
    seasonDates: {
      display: 'flex',
      gap: '16px',
      marginBottom: '10px',
      fontSize: '13px'
    },
    seasonDate: {
      color: '#5a7a50'
    },
    seasonDateHL: {
      color: '#5ec850',
      fontWeight: 600
    },
    seasonRecipes: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px'
    },
    seasonRecipePill: {
      fontSize: '11px',
      padding: '3px 8px',
      backgroundColor: 'rgba(94, 200, 80, 0.08)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '12px',
      color: '#c8e6c0'
    },
    hemisphereToggle: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px',
      flexWrap: 'wrap'
    },
    toggleButton: {
      padding: '8px 16px',
      border: '1px solid rgba(94, 200, 80, 0.3)',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      color: '#5ec850',
      borderRadius: '4px',
      cursor: 'pointer',      outline: 'none',

      fontSize: '12px',
      fontWeight: 500,
      transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease'
    },
    toggleButtonActive: {
      backgroundColor: '#5ec850',
      color: '#0a1a10',
      borderColor: '#5ec850'
    },
    noResults: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#5a7a50',
      fontSize: '14px'
    }
  };

  const filteredCategories = getFilteredCategories();

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input[type="text"]:focus { outline: none; border-color: #5ec850 !important; }
      `}</style>

      <div style={styles.header}>
        <h1 style={styles.title}>DIY Recipe Tracker</h1>
        <p style={styles.subtitle}>Track all {TOTAL_RECIPES} verified ACNH DIY recipes</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'category', label: 'By Category' },
          { id: 'source', label: 'By Source' },
          { id: 'seasonal', label: 'Seasonal Guide' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tabButton,
              ...(activeTab === tab.id ? styles.tabButtonActive : {})
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Box */}
      {activeTab !== 'seasonal' && (
        <div style={styles.statsBox}>
          <div style={styles.progressRingWrap}>
            <svg width="100" height="100" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(94,200,80,0.1)" strokeWidth="6" />
              <circle
                cx="60" cy="60" r="45"
                fill="none"
                stroke="#5ec850"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease', transformOrigin: 'center', transform: 'rotate(-90deg)' }}
              />
            </svg>
            <p style={styles.progressText}>{progressPercent}%</p>
            <p style={styles.progressSubtext}>{learnedCount} / {TOTAL_RECIPES}</p>
          </div>
          <div style={styles.statsContent}>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Learned</span>
              <span style={styles.statValue}>{learnedCount}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Remaining</span>
              <span style={styles.statValue}>{TOTAL_RECIPES - learnedCount}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Categories</span>
              <span style={styles.statValue}>{Object.keys(DIY_CATEGORIES).length}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Total Recipes</span>
              <span style={styles.statValue}>{TOTAL_RECIPES}</span>
            </div>
          </div>
        </div>
      )}

      {/* By Category Tab */}
      {activeTab === 'category' && (
        <div>
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchBox}
          />

          {Object.keys(filteredCategories).length > 0 ? (
            Object.entries(filteredCategories).map(([category, data]) => {
              const { learned, total } = getCategoryProgress(category);
              const isExpanded = expandedCategories.has(category);
              const catPct = total > 0 ? (learned / total) * 100 : 0;

              return (
                <div key={category} style={styles.categoryCard}>
                  <div
                    style={styles.categoryHeader}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(94,200,80,0.07)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    onClick={() => toggleCategory(category)}
                  >
                    <h3 style={styles.categoryTitle}>
                      <span>{data.emoji}</span>
                      <span>{category}</span>
                    </h3>
                    <div style={styles.categoryRight}>
                      <div style={styles.progressBar}>
                        <div style={{ ...styles.progressBarFill, width: `${catPct}%` }} />
                      </div>
                      <div style={styles.categoryCount}>{learned}/{total}</div>
                      <span
                        style={{
                          ...styles.expandIcon,
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                      >
                        ▼
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={styles.categoryContent}>
                      {data.recipes.map(recipe => {
                        const isLearned = learnedRecipes.has(recipe);
                        return (
                          <div
                            key={recipe}
                            style={{
                              ...styles.recipeItem,
                              backgroundColor: isLearned ? 'rgba(94,200,80,0.12)' : 'rgba(12,28,14,0.6)',
                              borderColor: isLearned ? 'rgba(94,200,80,0.35)' : 'rgba(94,200,80,0.12)'
                            }}
                            onMouseEnter={(e) => {
                              if (!isLearned) e.currentTarget.style.backgroundColor = 'rgba(94,200,80,0.08)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = isLearned ? 'rgba(94,200,80,0.12)' : 'rgba(12,28,14,0.6)';
                            }}
                            onClick={() => toggleRecipeLearned(recipe)}
                          >
                            <input
                              type="checkbox"
                              checked={isLearned}
                              onChange={() => toggleRecipeLearned(recipe)}
                              onClick={(e) => e.stopPropagation()}
                              style={styles.checkbox}
                            />
                            {data.isCooking ? (
                              <span style={{ fontSize: '18px', marginRight: '6px' }}>{data.emoji}</span>
                            ) : (
                              <AssetImg category="recipes" name={recipe} size={22} />
                            )}
                            <span style={{
                              textDecoration: isLearned ? 'line-through' : 'none',
                              color: isLearned ? '#5a7a50' : '#c8e6c0',
                              lineHeight: 1.3
                            }}>
                              {recipe}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={styles.noResults}>No recipes found matching "{searchTerm}"</div>
          )}
        </div>
      )}

      {/* By Source Tab */}
      {activeTab === 'source' && (
        <div>
          {SOURCES.map((source, idx) => (
            <div key={idx} style={styles.sourceCard}>
              <h3 style={styles.sourceTitle}>
                <span style={{ fontSize: '20px' }}>{source.emoji}</span>
                {source.name}
              </h3>
              <p style={styles.sourceDesc}>{source.description}</p>
              <div style={styles.sourceTips}>
                {source.tips}
              </div>
              <div style={styles.sourceMeta}>
                <div style={styles.sourceMetaItem}>
                  <span style={styles.sourceLabel}>Daily: </span>
                  {source.daily ? 'Yes' : 'No'}
                </div>
                <div style={styles.sourceMetaItem}>
                  <span style={styles.sourceLabel}>Limit: </span>
                  {source.limit}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seasonal Guide Tab */}
      {activeTab === 'seasonal' && (
        <div>
          <div style={styles.hemisphereToggle}>
            <button
              onClick={() => setHemisphere('northern')}
              style={{
                ...styles.toggleButton,
                ...(hemisphere === 'northern' ? styles.toggleButtonActive : {})
              }}
            >
              Northern Hemisphere
            </button>
            <button
              onClick={() => setHemisphere('southern')}
              style={{
                ...styles.toggleButton,
                ...(hemisphere === 'southern' ? styles.toggleButtonActive : {})
              }}
            >
              Southern Hemisphere
            </button>
          </div>

          <div style={{
            marginBottom: '20px',
            padding: '12px 16px',
            backgroundColor: 'rgba(74,172,240,0.08)',
            borderRadius: '6px',
            borderLeft: '3px solid #4aacf0',
            fontSize: '13px',
            color: '#5a7a50'
          }}>
            Seasonal recipes are obtained from balloons and special NPCs during their active windows.
            Dates shown are for the <strong style={{ color: '#5ec850' }}>
              {hemisphere === 'northern' ? 'Northern' : 'Southern'} Hemisphere
            </strong>.
          </div>

          {SEASONAL_SECTIONS.map((section, idx) => (
            <div key={idx} style={styles.seasonCard}>
              <div style={styles.seasonHeader}>
                <h3 style={styles.seasonName}>{section.emoji} {section.name}</h3>
                <span style={styles.seasonSource}>{section.source}</span>
              </div>
              <div style={styles.seasonDates}>
                <span style={styles.seasonDate}>
                  Window:{' '}
                  <span style={styles.seasonDateHL}>
                    {hemisphere === 'northern' ? section.nh : section.sh}
                  </span>
                </span>
              </div>
              <div style={styles.seasonRecipes}>
                {section.recipes.map(recipe => (
                  <span key={recipe} style={styles.seasonRecipePill}>{recipe}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DIYRecipeTracker;
