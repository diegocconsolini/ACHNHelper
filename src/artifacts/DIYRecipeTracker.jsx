'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AssetImg } from '../assetHelper';
import { DIY_CATEGORIES, SOURCES, SEASONAL_SECTIONS, STORAGE_KEY, TOTAL_RECIPES } from './diyRecipeData';

// Verified ACNH DIY Recipe Tracker — all names sourced from manifest + Nookipedia
const DIYRecipeTracker = () => {
  const [activeTab, setActiveTab] = useState('category');
  const [learnedRecipes, setLearnedRecipes] = useState(new Set());
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [hemisphere, setHemisphere] = useState('northern');

  // Drawer state
  const [drawerRecipe, setDrawerRecipe] = useState(null);
  const [drawerCategory, setDrawerCategory] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState(null);
  const [drawerClosing, setDrawerClosing] = useState(false);

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

  // Find which category a recipe belongs to
  const findRecipeCategory = useCallback((recipeName) => {
    for (const [cat, data] of Object.entries(DIY_CATEGORIES)) {
      if (data.recipes.includes(recipeName)) {
        return { name: cat, emoji: data.emoji, isCooking: !!data.isCooking };
      }
    }
    return null;
  }, []);

  // Open the detail drawer and fetch API data
  const openDrawer = useCallback(async (recipeName) => {
    const category = findRecipeCategory(recipeName);
    setDrawerRecipe(recipeName);
    setDrawerCategory(category);
    setDrawerData(null);
    setDrawerError(null);
    setDrawerLoading(true);
    setDrawerClosing(false);

    try {
      const encodedName = encodeURIComponent(recipeName);
      const res = await fetch(`/api/nookipedia/nh/recipes/${encodedName}`);
      if (res.ok) {
        const data = await res.json();
        setDrawerData(data);
      } else if (res.status === 404) {
        // Recipe not found in API — common for cooking recipes
        setDrawerData(null);
        setDrawerError('not_found');
      } else {
        setDrawerError('api_error');
      }
    } catch (err) {
      console.error('Failed to fetch recipe details:', err);
      setDrawerError('network_error');
    } finally {
      setDrawerLoading(false);
    }
  }, [findRecipeCategory]);

  // Close drawer with animation
  const closeDrawer = useCallback(() => {
    setDrawerClosing(true);
    setTimeout(() => {
      setDrawerRecipe(null);
      setDrawerCategory(null);
      setDrawerData(null);
      setDrawerError(null);
      setDrawerLoading(false);
      setDrawerClosing(false);
    }, 250);
  }, []);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && drawerRecipe) closeDrawer();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerRecipe, closeDrawer]);

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
      cursor: 'pointer',
      outline: 'none',
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
      cursor: 'pointer',
      outline: 'none',
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
      cursor: 'pointer',
      outline: 'none',
      transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
      fontSize: '12px'
    },
    checkbox: {
      width: '14px',
      height: '14px',
      cursor: 'pointer',
      outline: 'none',
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
      cursor: 'pointer',
      outline: 'none',
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
    },
    // Drawer styles
    drawerOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 1000,
      animation: drawerClosing ? 'recipeDrawerOverlayFadeOut 0.25s ease forwards' : 'recipeDrawerOverlayFadeIn 0.25s ease forwards'
    },
    drawer: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '420px',
      maxWidth: '90vw',
      backgroundColor: '#0c1c0e',
      borderLeft: '1px solid rgba(94, 200, 80, 0.25)',
      zIndex: 1001,
      overflowY: 'auto',
      padding: '28px 24px',
      boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.5)',
      animation: drawerClosing ? 'recipeDrawerSlideOut 0.25s ease forwards' : 'recipeDrawerSlideIn 0.3s ease forwards'
    },
    drawerCloseBtn: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      width: '32px',
      height: '32px',
      border: '1px solid rgba(94, 200, 80, 0.3)',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      color: '#c8e6c0',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 700,
      transition: 'background-color 0.15s ease, border-color 0.15s ease'
    },
    drawerImage: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '20px',
      marginTop: '8px'
    },
    drawerRecipeName: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '28px',
      fontWeight: 700,
      color: '#5ec850',
      margin: '0 0 12px 0',
      lineHeight: 1.2
    },
    drawerCategoryPill: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      backgroundColor: 'rgba(94, 200, 80, 0.1)',
      border: '1px solid rgba(94, 200, 80, 0.25)',
      borderRadius: '16px',
      fontSize: '13px',
      color: '#c8e6c0',
      marginBottom: '20px'
    },
    drawerSection: {
      marginBottom: '18px'
    },
    drawerSectionTitle: {
      fontSize: '11px',
      fontWeight: 700,
      color: '#5a7a50',
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      marginBottom: '8px'
    },
    drawerMaterialCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 12px',
      backgroundColor: 'rgba(12, 28, 14, 0.95)',
      border: '1px solid rgba(94, 200, 80, 0.15)',
      borderRadius: '6px',
      marginBottom: '6px'
    },
    drawerMaterialCount: {
      fontFamily: "'DM Mono', monospace",
      fontSize: '14px',
      fontWeight: 700,
      color: '#d4b030',
      minWidth: '28px'
    },
    drawerMaterialName: {
      fontSize: '14px',
      color: '#c8e6c0'
    },
    drawerSellPrice: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 14px',
      backgroundColor: 'rgba(212, 176, 48, 0.08)',
      border: '1px solid rgba(212, 176, 48, 0.2)',
      borderRadius: '6px',
      fontSize: '16px',
      fontFamily: "'DM Mono', monospace",
      fontWeight: 700,
      color: '#d4b030'
    },
    drawerAvailabilityItem: {
      padding: '10px 12px',
      backgroundColor: 'rgba(74, 172, 240, 0.06)',
      border: '1px solid rgba(74, 172, 240, 0.15)',
      borderRadius: '6px',
      marginBottom: '6px',
      fontSize: '13px',
      color: '#c8e6c0',
      lineHeight: 1.5
    },
    drawerAvailFrom: {
      fontWeight: 600,
      color: '#4aacf0'
    },
    drawerAvailNote: {
      fontSize: '12px',
      color: '#5a7a50',
      marginTop: '4px'
    },
    drawerUnlockCount: {
      padding: '12px 14px',
      backgroundColor: 'rgba(94, 200, 80, 0.06)',
      border: '1px solid rgba(94, 200, 80, 0.15)',
      borderRadius: '6px',
      fontSize: '14px',
      color: '#c8e6c0'
    },
    drawerUnlockValue: {
      fontFamily: "'DM Mono', monospace",
      fontWeight: 700,
      color: '#5ec850'
    },
    drawerCheckbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 14px',
      backgroundColor: 'rgba(94, 200, 80, 0.06)',
      border: '1px solid rgba(94, 200, 80, 0.2)',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background-color 0.15s ease'
    },
    drawerLoading: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      padding: '40px 0',
      color: '#5a7a50',
      fontSize: '14px'
    },
    drawerSpinner: {
      width: '28px',
      height: '28px',
      border: '3px solid rgba(94, 200, 80, 0.15)',
      borderTopColor: '#5ec850',
      borderRadius: '50%',
      animation: 'recipeDrawerSpin 0.7s linear infinite'
    },
    drawerError: {
      padding: '16px',
      backgroundColor: 'rgba(74, 172, 240, 0.06)',
      border: '1px solid rgba(74, 172, 240, 0.15)',
      borderRadius: '6px',
      fontSize: '13px',
      color: '#5a7a50',
      textAlign: 'center',
      lineHeight: 1.6
    },
    drawerDivider: {
      height: '1px',
      backgroundColor: 'rgba(94, 200, 80, 0.1)',
      margin: '20px 0'
    }
  };

  const filteredCategories = getFilteredCategories();

  // Render the detail drawer
  const renderDrawer = () => {
    if (!drawerRecipe) return null;

    const isLearned = learnedRecipes.has(drawerRecipe);
    const isCooking = drawerCategory?.isCooking;

    return (
      <>
        {/* Overlay */}
        <div style={styles.drawerOverlay} onClick={closeDrawer} />

        {/* Drawer panel */}
        <div style={styles.drawer}>
          {/* Close button */}
          <button
            style={styles.drawerCloseBtn}
            onClick={closeDrawer}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(94, 200, 80, 0.15)';
              e.currentTarget.style.borderColor = '#5ec850';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(12, 28, 14, 0.95)';
              e.currentTarget.style.borderColor = 'rgba(94, 200, 80, 0.3)';
            }}
            aria-label="Close drawer"
          >
            X
          </button>

          {/* Recipe image */}
          <div style={styles.drawerImage}>
            {drawerData?.image_url ? (
              <img
                src={drawerData.image_url}
                alt={drawerRecipe}
                width={80}
                height={80}
                style={{ imageRendering: 'auto', borderRadius: '8px' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : isCooking ? (
              <span style={{ fontSize: '64px' }}>{drawerCategory?.emoji || ''}</span>
            ) : (
              <AssetImg category="recipes" name={drawerRecipe} size={80} />
            )}
          </div>

          {/* Recipe name */}
          <h2 style={styles.drawerRecipeName}>{drawerRecipe}</h2>

          {/* Category pill */}
          {drawerCategory && (
            <div style={styles.drawerCategoryPill}>
              <span>{drawerCategory.emoji}</span>
              <span>{drawerCategory.name}</span>
            </div>
          )}

          {/* Loading state */}
          {drawerLoading && (
            <div style={styles.drawerLoading}>
              <div style={styles.drawerSpinner} />
              <span>Fetching recipe details...</span>
            </div>
          )}

          {/* Error state — show local info only */}
          {!drawerLoading && drawerError && (
            <div style={styles.drawerError}>
              {drawerError === 'not_found'
                ? 'Detailed recipe info not available from the API for this item. Showing local data only.'
                : 'Could not fetch recipe details. Showing local data only.'}
            </div>
          )}

          {/* API data sections */}
          {!drawerLoading && drawerData && (
            <>
              {/* Materials */}
              {drawerData.materials && drawerData.materials.length > 0 && (
                <div style={styles.drawerSection}>
                  <div style={styles.drawerSectionTitle}>Materials</div>
                  {drawerData.materials.map((mat, idx) => (
                    <div key={idx} style={styles.drawerMaterialCard}>
                      <span style={styles.drawerMaterialCount}>{mat.count}x</span>
                      <span style={styles.drawerMaterialName}>{mat.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sell price */}
              {drawerData.sell != null && (
                <div style={styles.drawerSection}>
                  <div style={styles.drawerSectionTitle}>Sell Price</div>
                  <div style={styles.drawerSellPrice}>
                    <span style={{ fontSize: '18px' }}>Bells</span>
                    <span>{drawerData.sell.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Availability / How to obtain */}
              {drawerData.availability && drawerData.availability.length > 0 && (
                <div style={styles.drawerSection}>
                  <div style={styles.drawerSectionTitle}>How to Obtain</div>
                  {drawerData.availability.map((avail, idx) => (
                    <div key={idx} style={styles.drawerAvailabilityItem}>
                      <span style={styles.drawerAvailFrom}>{avail.from}</span>
                      {avail.note && (
                        <div style={styles.drawerAvailNote}>{avail.note}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Recipes to unlock */}
              {drawerData.recipes_to_unlock != null && (
                <div style={styles.drawerSection}>
                  <div style={styles.drawerSectionTitle}>Recipes to Unlock</div>
                  <div style={styles.drawerUnlockCount}>
                    <span style={styles.drawerUnlockValue}>{drawerData.recipes_to_unlock}</span>
                    {' '}recipe{drawerData.recipes_to_unlock !== 1 ? 's' : ''} needed before this one becomes available
                  </div>
                </div>
              )}
            </>
          )}

          {/* Divider before checkbox */}
          <div style={styles.drawerDivider} />

          {/* Learned checkbox — always visible */}
          <div style={styles.drawerSection}>
            <div style={styles.drawerSectionTitle}>Collection Status</div>
            <div
              style={{
                ...styles.drawerCheckbox,
                backgroundColor: isLearned ? 'rgba(94, 200, 80, 0.12)' : 'rgba(94, 200, 80, 0.06)',
                borderColor: isLearned ? 'rgba(94, 200, 80, 0.35)' : 'rgba(94, 200, 80, 0.2)'
              }}
              onClick={() => toggleRecipeLearned(drawerRecipe)}
            >
              <input
                type="checkbox"
                checked={isLearned}
                onChange={() => toggleRecipeLearned(drawerRecipe)}
                onClick={(e) => e.stopPropagation()}
                style={{ ...styles.checkbox, width: '18px', height: '18px' }}
              />
              <span style={{
                fontSize: '15px',
                fontWeight: 600,
                color: isLearned ? '#5ec850' : '#c8e6c0'
              }}>
                {isLearned ? 'Learned' : 'Not learned yet'}
              </span>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input[type="text"]:focus { outline: none; border-color: #5ec850 !important; }
        @keyframes recipeDrawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes recipeDrawerSlideOut {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
        @keyframes recipeDrawerOverlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes recipeDrawerOverlayFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes recipeDrawerSpin {
          to { transform: rotate(360deg); }
        }
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
                            onClick={() => openDrawer(recipe)}
                          >
                            <input
                              type="checkbox"
                              checked={isLearned}
                              onChange={() => toggleRecipeLearned(recipe)}
                              onClick={(e) => e.stopPropagation()}
                              style={styles.checkbox}
                            />
                            <AssetImg category={data.isCooking ? "cooking" : "recipes"} name={recipe} size={22} />
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
            <div style={styles.noResults}>No recipes found matching &quot;{searchTerm}&quot;</div>
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

      {/* Recipe Detail Drawer */}
      {renderDrawer()}
    </div>
  );
};

export default DIYRecipeTracker;
