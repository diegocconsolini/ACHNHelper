'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DIY_CATEGORIES } from './diyRecipeData';

// Build flat list of all recipe names for autocomplete
const ALL_RECIPE_NAMES = Object.values(DIY_CATEGORIES).flatMap(cat => cat.recipes);

// Check if a name exists in our recipe list (case-insensitive)
const isKnownRecipe = (name) => {
  const lower = name.toLowerCase();
  return ALL_RECIPE_NAMES.some(r => r.toLowerCase() === lower);
};

const STORAGE_KEY = 'acnh-material-calculator';
const MAX_DEPTH = 5;

export default function MaterialCalculator() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [recipeTree, setRecipeTree] = useState(null);
  const [flatMaterials, setFlatMaterials] = useState([]);
  const [checkedMaterials, setCheckedMaterials] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [recipeImage, setRecipeImage] = useState(null);
  const [hoveredSuggestion, setHoveredSuggestion] = useState(-1);
  const [hoveredRecent, setHoveredRecent] = useState(-1);
  const [hoveredCalcBtn, setHoveredCalcBtn] = useState(false);
  const [hoveredClearBtn, setHoveredClearBtn] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const fetchCacheRef = useRef(new Map());

  // Load recent searches
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await window.storage.get(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored.value);
          setRecentSearches(data.recentSearches || []);
        }
      } catch (e) { /* ignore */ }
    };
    load();
  }, []);

  // Save recent searches
  const saveRecentSearches = useCallback(async (searches) => {
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify({ recentSearches: searches }));
    } catch (e) { /* ignore */ }
  }, []);

  // Autocomplete filtering
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const lower = query.toLowerCase();
    const matches = ALL_RECIPE_NAMES
      .filter(name => name.toLowerCase().includes(lower))
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(lower);
        const bStarts = b.toLowerCase().startsWith(lower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 8);
    setSuggestions(matches);
  }, [query]);

  // Click outside to close suggestions
  useEffect(() => {
    const handler = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch a single recipe from API with caching
  const fetchRecipe = useCallback(async (name) => {
    const cacheKey = name.toLowerCase();
    if (fetchCacheRef.current.has(cacheKey)) {
      return fetchCacheRef.current.get(cacheKey);
    }
    try {
      const res = await fetch(`/api/nookipedia/nh/recipes/${encodeURIComponent(name)}`);
      if (!res.ok) {
        fetchCacheRef.current.set(cacheKey, null);
        return null;
      }
      const data = await res.json();
      fetchCacheRef.current.set(cacheKey, data);
      return data;
    } catch {
      fetchCacheRef.current.set(cacheKey, null);
      return null;
    }
  }, []);

  // Recursive tree builder
  const buildTree = useCallback(async (name, count = 1, depth = 0) => {
    if (depth >= MAX_DEPTH) {
      return { name, count, materials: [], isRaw: true, depthLimited: true };
    }

    const data = await fetchRecipe(name);
    if (!data || !data.materials || data.materials.length === 0) {
      return { name, count, materials: [], isRaw: true };
    }

    const children = await Promise.all(
      data.materials.map(async (mat) => {
        const matCount = (mat.count || 1) * count;
        // Only recurse if the material is itself a known recipe
        if (isKnownRecipe(mat.name)) {
          const childData = await fetchRecipe(mat.name);
          if (childData && childData.materials && childData.materials.length > 0) {
            return buildTree(mat.name, matCount, depth + 1);
          }
        }
        return { name: mat.name, count: matCount, materials: [], isRaw: true };
      })
    );

    return {
      name,
      count,
      image: data.image_url || null,
      materials: children,
      isRaw: false,
    };
  }, [fetchRecipe]);

  // Flatten tree to get raw material totals
  const flattenTree = useCallback((node) => {
    const totals = {};
    const walk = (n) => {
      if (n.isRaw) {
        totals[n.name] = (totals[n.name] || 0) + n.count;
      } else {
        (n.materials || []).forEach(walk);
      }
    };
    walk(node);
    return Object.entries(totals)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Calculate materials
  const handleCalculate = useCallback(async (recipeName) => {
    const name = recipeName || query.trim();
    if (!name) return;

    setLoading(true);
    setError(null);
    setRecipeTree(null);
    setFlatMaterials([]);
    setCheckedMaterials({});
    setRecipeImage(null);
    setExpandedNodes({});
    setShowSuggestions(false);

    try {
      const tree = await buildTree(name, quantity);
      if (tree.isRaw && tree.materials.length === 0) {
        setError(`"${name}" was not found as a craftable recipe. Check the spelling and try again.`);
        setLoading(false);
        return;
      }

      setRecipeTree(tree);
      setRecipeImage(tree.image || null);
      setFlatMaterials(flattenTree(tree));

      // Expand root by default
      setExpandedNodes({ [name]: true });

      // Update recent searches
      const updated = [name, ...recentSearches.filter(s => s.toLowerCase() !== name.toLowerCase())].slice(0, 10);
      setRecentSearches(updated);
      saveRecentSearches(updated);
    } catch (e) {
      setError('Failed to fetch recipe data. Please try again.');
    }
    setLoading(false);
  }, [query, quantity, buildTree, flattenTree, recentSearches, saveRecentSearches]);

  const toggleNode = (name) => {
    setExpandedNodes(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleMaterial = (name) => {
    setCheckedMaterials(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  const clearResults = () => {
    setRecipeTree(null);
    setFlatMaterials([]);
    setCheckedMaterials({});
    setRecipeImage(null);
    setError(null);
    setQuery('');
    setExpandedNodes({});
  };

  // Render tree recursively
  const renderTree = (node, depth = 0) => {
    const isExpanded = expandedNodes[node.name];
    const hasChildren = !node.isRaw && node.materials && node.materials.length > 0;

    return (
      <div key={`${node.name}-${depth}`} style={{ marginLeft: depth * 20 }}>
        <div
          style={{
            ...styles.treeNode,
            cursor: hasChildren ? 'pointer' : 'default',
            backgroundColor: hasChildren ? 'rgba(94,200,80,0.05)' : 'transparent',
            borderLeft: node.isRaw
              ? '3px solid #5a7a50'
              : depth === 0
                ? '3px solid #5ec850'
                : '3px solid #4aacf0',
          }}
          onClick={() => hasChildren && toggleNode(node.name)}
        >
          <span style={{ marginRight: 8, fontFamily: "'DM Mono', monospace", color: '#d4b030', fontWeight: 500 }}>
            {node.count}x
          </span>
          {hasChildren && (
            <span style={{ marginRight: 6, fontSize: 12, color: '#5a7a50', transition: 'transform 0.2s ease' }}>
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            color: node.isRaw ? '#c8e6c0' : '#4aacf0',
            fontWeight: node.isRaw ? 400 : 500,
          }}>
            {node.name}
          </span>
          {!node.isRaw && (
            <span style={{
              marginLeft: 8,
              fontSize: 11,
              color: '#5a7a50',
              fontFamily: "'DM Mono', monospace",
            }}>
              (craftable)
            </span>
          )}
          {node.depthLimited && (
            <span style={{
              marginLeft: 8,
              fontSize: 11,
              color: '#d4b030',
              fontFamily: "'DM Mono', monospace",
            }}>
              (depth limit)
            </span>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            {node.materials.map((child, i) => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spin { to { transform: rotate(360deg); } }
`}</style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>DIY Material Calculator</h1>
        <p style={styles.subtitle}>
          Break down any recipe into its raw materials — recursively resolves sub-recipes
        </p>
      </div>

      {/* Search area */}
      <div style={styles.searchArea}>
        <div style={styles.searchRow}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              placeholder="Type a recipe name..."
              style={styles.input}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div ref={suggestionsRef} style={styles.suggestions}>
                {suggestions.map((name, i) => (
                  <div
                    key={name}
                    style={{
                      ...styles.suggestionItem,
                      backgroundColor: hoveredSuggestion === i ? 'rgba(94,200,80,0.15)' : 'transparent',
                    }}
                    onMouseEnter={() => setHoveredSuggestion(i)}
                    onMouseLeave={() => setHoveredSuggestion(-1)}
                    onClick={() => {
                      setQuery(name);
                      setShowSuggestions(false);
                      setSuggestions([]);
                    }}
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.qtyWrapper}>
            <label style={styles.qtyLabel}>Qty</label>
            <input
              type="number"
              min={1}
              max={99}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
              style={styles.qtyInput}
            />
          </div>

          <button
            style={{
              ...styles.calcBtn,
              backgroundColor: hoveredCalcBtn ? '#4db840' : '#5ec850',
              transform: hoveredCalcBtn ? 'translateY(-1px)' : 'none',
            }}
            onMouseEnter={() => setHoveredCalcBtn(true)}
            onMouseLeave={() => setHoveredCalcBtn(false)}
            onClick={() => handleCalculate()}
            disabled={loading || !query.trim()}
          >
            {loading ? 'Calculating...' : 'Calculate'}
          </button>

          {recipeTree && (
            <button
              style={{
                ...styles.clearBtn,
                backgroundColor: hoveredClearBtn ? 'rgba(255,100,100,0.2)' : 'transparent',
              }}
              onMouseEnter={() => setHoveredClearBtn(true)}
              onMouseLeave={() => setHoveredClearBtn(false)}
              onClick={clearResults}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Recent searches */}
      {recentSearches.length > 0 && !recipeTree && !loading && (
        <div style={styles.recentSection}>
          <h3 style={styles.recentTitle}>Recent Searches</h3>
          <div style={styles.recentList}>
            {recentSearches.map((name, i) => (
              <button
                key={name}
                style={{
                  ...styles.recentChip,
                  backgroundColor: hoveredRecent === i ? 'rgba(74,172,240,0.2)' : 'rgba(74,172,240,0.08)',
                  borderColor: hoveredRecent === i ? 'rgba(74,172,240,0.5)' : 'rgba(74,172,240,0.2)',
                }}
                onMouseEnter={() => setHoveredRecent(i)}
                onMouseLeave={() => setHoveredRecent(-1)}
                onClick={() => { setQuery(name); handleCalculate(name); }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={styles.loadingCard}>
          <div style={styles.spinner} />
          <p style={{ color: '#c8e6c0', fontFamily: "'DM Sans', sans-serif", margin: '12px 0 0' }}>
            Calculating materials...
          </p>
          <p style={{ color: '#5a7a50', fontFamily: "'DM Mono', monospace", fontSize: 12, margin: '4px 0 0' }}>
            Recursively resolving sub-recipes
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={styles.errorCard}>
          <p style={{ margin: 0, color: '#ff6464', fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
        </div>
      )}

      {/* Results */}
      {recipeTree && !loading && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {/* Recipe header */}
          <div style={styles.resultHeader}>
            {recipeImage && (
              <img src={recipeImage} alt={recipeTree.name} style={styles.recipeImg} />
            )}
            <div>
              <h2 style={styles.resultTitle}>{recipeTree.name}</h2>
              <p style={styles.resultSubtitle}>
                {quantity > 1 ? `${quantity}x — ` : ''}
                {flatMaterials.length} raw material{flatMaterials.length !== 1 ? 's' : ''} needed
              </p>
            </div>
          </div>

          {/* Two-column layout */}
          <div style={styles.columns}>
            {/* Tree view */}
            <div style={styles.treeCard}>
              <h3 style={styles.cardTitle}>Recipe Breakdown</h3>
              <div style={styles.treeContainer}>
                {renderTree(recipeTree)}
              </div>
            </div>

            {/* Flat totals */}
            <div style={styles.totalsCard}>
              <h3 style={styles.cardTitle}>
                Total Raw Materials
                {quantity > 1 && (
                  <span style={{ color: '#d4b030', fontSize: 14, fontWeight: 400, marginLeft: 8 }}>
                    (x{quantity})
                  </span>
                )}
              </h3>
              <div style={styles.materialsList}>
                {flatMaterials.map((mat) => {
                  const checked = checkedMaterials[mat.name] || false;
                  return (
                    <div
                      key={mat.name}
                      style={{
                        ...styles.materialRow,
                        opacity: checked ? 0.5 : 1,
                        textDecoration: checked ? 'line-through' : 'none',
                      }}
                      onClick={() => toggleMaterial(mat.name)}
                    >
                      <div style={{
                        ...styles.checkbox,
                        backgroundColor: checked ? '#5ec850' : 'transparent',
                        borderColor: checked ? '#5ec850' : '#5a7a50',
                      }}>
                        {checked && <span style={{ color: '#0a1a10', fontSize: 12, lineHeight: 1 }}>✓</span>}
                      </div>
                      <span style={styles.materialName}>{mat.name}</span>
                      <span style={styles.materialCount}>{mat.count}</span>
                    </div>
                  );
                })}
              </div>
              {flatMaterials.length > 0 && (
                <div style={styles.checkProgress}>
                  {Object.values(checkedMaterials).filter(Boolean).length} / {flatMaterials.length} gathered
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: 24,
    fontFamily: "'DM Sans', sans-serif",
    color: '#c8e6c0',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 900,
    fontSize: 28,
    color: '#5ec850',
    margin: 0,
  },
  subtitle: {
    fontFamily: "'DM Sans', sans-serif",
    color: '#5a7a50',
    fontSize: 14,
    margin: '6px 0 0',
  },
  searchArea: {
    marginBottom: 20,
  },
  searchRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.2)',
    borderRadius: 8,
    color: '#c8e6c0',
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box',
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(12,28,14,0.98)',
    border: '1px solid rgba(94,200,80,0.2)',
    borderRadius: 8,
    marginTop: 4,
    zIndex: 100,
    overflow: 'hidden',
  },
  suggestionItem: {
    padding: '8px 14px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: '#c8e6c0',
    transition: 'background-color 0.15s ease',
  },
  qtyWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  qtyLabel: {
    fontSize: 11,
    color: '#5a7a50',
    fontFamily: "'DM Mono', monospace",
    fontWeight: 500,
  },
  qtyInput: {
    width: 60,
    padding: '10px 8px',
    backgroundColor: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.2)',
    borderRadius: 8,
    color: '#d4b030',
    fontSize: 15,
    fontFamily: "'DM Mono', monospace",
    fontWeight: 500,
    textAlign: 'center',
    outline: 'none',
  },
  calcBtn: {
    padding: '10px 20px',
    backgroundColor: '#5ec850',
    border: 'none',
    borderRadius: 8,
    color: '#0a1a10',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    whiteSpace: 'nowrap',
  },
  clearBtn: {
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,100,100,0.3)',
    borderRadius: 8,
    color: '#ff6464',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
    whiteSpace: 'nowrap',
  },
  recentSection: {
    marginBottom: 20,
  },
  recentTitle: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    color: '#5a7a50',
    margin: '0 0 8px',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recentList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    padding: '6px 12px',
    backgroundColor: 'rgba(74,172,240,0.08)',
    border: '1px solid rgba(74,172,240,0.2)',
    borderRadius: 16,
    color: '#4aacf0',
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  },
  loadingCard: {
    padding: 32,
    backgroundColor: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 12,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid rgba(94,200,80,0.2)',
    borderTopColor: '#5ec850',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorCard: {
    padding: 16,
    backgroundColor: 'rgba(255,100,100,0.08)',
    border: '1px solid rgba(255,100,100,0.2)',
    borderRadius: 12,
    marginBottom: 16,
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.15)',
    borderRadius: 12,
  },
  recipeImg: {
    width: 64,
    height: 64,
    objectFit: 'contain',
    borderRadius: 8,
    backgroundColor: 'rgba(94,200,80,0.05)',
    padding: 4,
  },
  resultTitle: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: 22,
    color: '#c8e6c0',
    margin: 0,
  },
  resultSubtitle: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    color: '#5a7a50',
    margin: '4px 0 0',
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  treeCard: {
    padding: 16,
    backgroundColor: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: 12,
  },
  totalsCard: {
    padding: 16,
    backgroundColor: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(212,176,48,0.15)',
    borderRadius: 12,
  },
  cardTitle: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: 16,
    color: '#5ec850',
    margin: '0 0 12px',
  },
  treeContainer: {
    maxHeight: 500,
    overflowY: 'auto',
  },
  treeNode: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: 6,
    marginBottom: 2,
    transition: 'background-color 0.15s ease',
    userSelect: 'none',
  },
  materialsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  materialRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    border: '2px solid #5a7a50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
  },
  materialName: {
    flex: 1,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: '#c8e6c0',
  },
  materialCount: {
    fontFamily: "'DM Mono', monospace",
    fontWeight: 500,
    fontSize: 14,
    color: '#d4b030',
    minWidth: 30,
    textAlign: 'right',
  },
  checkProgress: {
    marginTop: 12,
    padding: '8px 12px',
    backgroundColor: 'rgba(94,200,80,0.05)',
    borderRadius: 8,
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    color: '#5a7a50',
    textAlign: 'center',
  },
};
