// GardenPlanner.jsx — Full UI rewrite (Tasks 4-7)
// Interactive garden grid with reducer state, sliding panel, simulation, and storage persistence.

import React, { useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { AssetImg } from '../assetHelper';
import { SPECIES, BREEDING_PATHS, COLOR_HEX } from './gardenData.js';
import { getSeedGenotype, findBreedingPairs, canClone, getOffspring } from './gardenGenetics.js';
import { simulateDay, updateBadLuckCounters, createEmptyGrid } from './gardenSimulation.js';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'garden-planner-v2';
const PANEL_WIDTH = 280;

const TOOLS = ['place', 'select', 'erase'];
const SIMULATION_TIERS = ['static', 'basic', 'campaign'];

// ─── INITIAL STATE ────────────────────────────────────────────────────────────

function makeInitialState() {
  const gridSize = 9;
  return {
    grid: createEmptyGrid(gridSize),
    gridSize,
    selectedCell: null,
    selectedSpecies: 'rose',
    selectedColor: 'Red',
    tool: 'place',
    panelOpen: false,
    panelTab: 'breed',
    simulationTier: 'static',
    pendingGrid: null,
    simulationEvents: [],
    day: 0,
    wateringVisitors: 1,
    selfWatered: true,
    badLuckCounters: {},
    wateringLog: [],
    history: [],
    savedLayouts: [],
  };
}

// ─── TEMPLATES ────────────────────────────────────────────────────────────────

function applyTemplateToGrid(templateKey, gridSize) {
  const grid = createEmptyGrid(gridSize);
  const redGeno = getSeedGenotype('rose', 'Red');
  const yellowGeno = getSeedGenotype('rose', 'Yellow');

  switch (templateKey) {
    case 'checkerboard':
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          if ((i + j) % 2 === 0) {
            grid[i][j] = { species: 'rose', color: 'Red', genotype: redGeno, source: 'seed' };
          }
        }
      }
      break;

    case 'rows':
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const color = i % 2 === 0 ? 'Red' : 'Yellow';
          const geno = i % 2 === 0 ? redGeno : yellowGeno;
          grid[i][j] = { species: 'rose', color, genotype: geno, source: 'seed' };
        }
      }
      break;

    case 'bluerose': {
      // Pairs of red+yellow for blue rose path
      for (let i = 0; i < gridSize - 1; i += 2) {
        for (let j = 0; j < gridSize; j++) {
          grid[i][j] = { species: 'rose', color: 'Red', genotype: redGeno, source: 'seed' };
          grid[i + 1][j] = { species: 'rose', color: 'Yellow', genotype: yellowGeno, source: 'seed' };
        }
      }
      break;
    }

    case 'pairs': {
      // Isolated breeding pairs 3 cells apart
      for (let i = 1; i < gridSize; i += 3) {
        for (let j = 0; j < gridSize - 1; j += 3) {
          grid[i][j] = { species: 'rose', color: 'Red', genotype: redGeno, source: 'seed' };
          if (j + 1 < gridSize) {
            grid[i][j + 1] = { species: 'rose', color: 'Yellow', genotype: yellowGeno, source: 'seed' };
          }
        }
      }
      break;
    }

    default:
      break;
  }
  return grid;
}

// ─── REDUCER ──────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {

    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    case 'SET_GRID_SIZE': {
      const s = Math.max(5, Math.min(20, action.size));
      return { ...state, gridSize: s, grid: createEmptyGrid(s), selectedCell: null, pendingGrid: null, simulationEvents: [], history: [] };
    }

    case 'PLACE_FLOWER': {
      const { row, col } = action;
      const { selectedSpecies, selectedColor, grid, gridSize, history } = state;
      const genotype = getSeedGenotype(selectedSpecies, selectedColor);
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = { species: selectedSpecies, color: selectedColor, genotype, source: genotype ? 'seed' : 'placed' };
      return { ...state, grid: newGrid, history: [...history, grid].slice(-30) };
    }

    case 'ERASE_CELL': {
      const { row, col } = action;
      const newGrid = state.grid.map(r => [...r]);
      newGrid[row][col] = null;
      const newSelected = (state.selectedCell && state.selectedCell.row === row && state.selectedCell.col === col)
        ? null : state.selectedCell;
      return { ...state, grid: newGrid, selectedCell: newSelected, history: [...state.history, state.grid].slice(-30) };
    }

    case 'SELECT_CELL':
      return { ...state, selectedCell: action.payload };

    case 'SELECT_SPECIES': {
      const species = SPECIES[action.species];
      const firstSeedColor = species?.seedColors?.[0] ?? species?.colors?.[0]?.color ?? 'Red';
      return { ...state, selectedSpecies: action.species, selectedColor: firstSeedColor };
    }

    case 'SELECT_COLOR':
      return { ...state, selectedColor: action.color };

    case 'SET_TOOL':
      return { ...state, tool: action.tool };

    case 'TOGGLE_PANEL':
      return { ...state, panelOpen: !state.panelOpen };

    case 'SET_PANEL_TAB':
      return { ...state, panelTab: action.tab, panelOpen: true };

    case 'SET_SIMULATION_TIER':
      return { ...state, simulationTier: action.tier, pendingGrid: null, simulationEvents: [] };

    case 'SET_WATERING':
      return { ...state, wateringVisitors: action.visitors };

    case 'SIMULATE_DAY': {
      const { grid, wateringVisitors, badLuckCounters, simulationTier, day } = state;
      const useBadLuck = simulationTier === 'campaign';
      const result = simulateDay(grid, { wateringVisitors, badLuckCounters, useBadLuck, day: day + 1 });
      return { ...state, pendingGrid: result.newGrid, simulationEvents: result.events };
    }

    case 'ACCEPT_DAY': {
      const { pendingGrid, simulationEvents, badLuckCounters, simulationTier, wateringVisitors, day, wateringLog } = state;
      if (!pendingGrid) return state;
      const cleanGrid = pendingGrid.map(r => r.map(c => c ? { ...c, pending: false } : null));
      const newBadLuck = simulationTier === 'campaign'
        ? updateBadLuckCounters(badLuckCounters, simulationEvents)
        : badLuckCounters;
      const logEntry = { day: day + 1, visitors: wateringVisitors, events: simulationEvents.length };
      return {
        ...state,
        grid: cleanGrid,
        pendingGrid: null,
        simulationEvents: [],
        day: day + 1,
        badLuckCounters: newBadLuck,
        wateringLog: [...wateringLog, logEntry].slice(-30),
        history: [...state.history, state.grid].slice(-30),
      };
    }

    case 'REJECT_DAY':
      return { ...state, pendingGrid: null, simulationEvents: [] };

    case 'REROLL_DAY': {
      const { grid, wateringVisitors, badLuckCounters, simulationTier, day } = state;
      const useBadLuck = simulationTier === 'campaign';
      const result = simulateDay(grid, { wateringVisitors, badLuckCounters, useBadLuck, day: day + 1 });
      return { ...state, pendingGrid: result.newGrid, simulationEvents: result.events };
    }

    case 'UNDO': {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return { ...state, grid: prev, history: state.history.slice(0, -1), pendingGrid: null, simulationEvents: [] };
    }

    case 'CLEAR_GRID':
      return {
        ...state,
        grid: createEmptyGrid(state.gridSize),
        selectedCell: null,
        pendingGrid: null,
        simulationEvents: [],
        history: [...state.history, state.grid].slice(-30),
      };

    case 'SAVE_LAYOUT': {
      if (!action.name?.trim()) return state;
      const entry = {
        id: Date.now(),
        name: action.name.trim(),
        grid: state.grid,
        gridSize: state.gridSize,
        date: new Date().toLocaleDateString(),
      };
      return { ...state, savedLayouts: [...state.savedLayouts, entry] };
    }

    case 'LOAD_LAYOUT': {
      const layout = state.savedLayouts.find(l => l.id === action.id);
      if (!layout) return state;
      return { ...state, grid: layout.grid, gridSize: layout.gridSize, selectedCell: null, pendingGrid: null, simulationEvents: [] };
    }

    case 'DELETE_LAYOUT':
      return { ...state, savedLayouts: state.savedLayouts.filter(l => l.id !== action.id) };

    case 'APPLY_TEMPLATE': {
      const newGrid = applyTemplateToGrid(action.template, state.gridSize);
      return { ...state, grid: newGrid, selectedCell: null, pendingGrid: null, simulationEvents: [], history: [...state.history, state.grid].slice(-30) };
    }

    default:
      return state;
  }
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function GardenPlanner() {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);
  const [layoutNameInput, setLayoutNameInput] = useState('');
  const saveTimerRef = useRef(null);
  const isDragging = useRef(false); // Used for drag-to-paint (Task 8)

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result?.value) {
          const saved = JSON.parse(result.value);
          dispatch({ type: 'LOAD_STATE', payload: saved });
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Debounced save on relevant state changes
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const toSave = {
          grid: state.grid,
          gridSize: state.gridSize,
          savedLayouts: state.savedLayouts,
          day: state.day,
          simulationTier: state.simulationTier,
          badLuckCounters: state.badLuckCounters,
          wateringLog: state.wateringLog,
          wateringVisitors: state.wateringVisitors,
          selectedSpecies: state.selectedSpecies,
          selectedColor: state.selectedColor,
        };
        await window.storage.set(STORAGE_KEY, JSON.stringify(toSave));
      } catch (e) {
        // ignore
      }
    }, 500);
    return () => clearTimeout(saveTimerRef.current);
  }, [state.grid, state.savedLayouts, state.day, state.simulationTier, state.badLuckCounters, state.wateringLog]);

  // Keyboard: Escape closes panel
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && state.panelOpen) {
        dispatch({ type: 'TOGGLE_PANEL' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.panelOpen]);

  // Drag-to-paint: wire up global mouseup listener
  useEffect(() => {
    const onMouseUp = () => { isDragging.current = false; };
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, []);

  // ─── CELL INTERACTION ────────────────────────────────────────────────────────

  const handleCellClick = useCallback((row, col) => {
    const cell = state.grid[row][col];
    if (state.tool === 'erase') {
      dispatch({ type: 'ERASE_CELL', row, col });
    } else if (state.tool === 'select') {
      dispatch({ type: 'SELECT_CELL', payload: cell ? { row, col } : null });
    } else {
      // place tool
      if (cell) {
        dispatch({ type: 'SELECT_CELL', payload: { row, col } });
      } else {
        dispatch({ type: 'PLACE_FLOWER', row, col });
      }
    }
  }, [state.tool, state.grid]);

  const handleCellRightClick = useCallback((e, row, col) => {
    e.preventDefault();
    dispatch({ type: 'ERASE_CELL', row, col });
  }, []);

  const handleCellDoubleClick = useCallback((row, col) => {
    dispatch({ type: 'SELECT_CELL', payload: { row, col } });
    dispatch({ type: 'SET_PANEL_TAB', tab: 'breed' });
  }, []);

  const handleCellEnter = useCallback((row, col) => {
    if (!isDragging.current) return;
    const cell = state.grid[row][col];
    if (state.tool === 'place' && !cell) {
      dispatch({ type: 'PLACE_FLOWER', row, col });
    } else if (state.tool === 'erase' && cell) {
      dispatch({ type: 'ERASE_CELL', row, col });
    }
  }, [state.tool, state.grid]);

  // ─── DERIVED STATE ───────────────────────────────────────────────────────────

  const displayGrid = state.pendingGrid || state.grid;
  const selectedCell = state.selectedCell;
  const selectedCellData = selectedCell ? displayGrid[selectedCell.row]?.[selectedCell.col] : null;
  const speciesData = SPECIES[state.selectedSpecies];
  const allColors = speciesData?.colors ?? [];
  const seedColors = speciesData?.seedColors ?? [];

  // Breeding pairs for selected cell
  const breedingPairs = selectedCell && selectedCellData
    ? findBreedingPairs(displayGrid, selectedCell.row, selectedCell.col)
    : [];

  const cloneRisk = selectedCell ? canClone(displayGrid, selectedCell.row, selectedCell.col) : false;

  // Compute neighbor highlight sets for grid visual polish
  // sameSpeciesNeighborSet: cells that are neighbors of selected cell with same species
  // offspringLandingSet: empty cells adjacent to a breeding pair
  const sameSpeciesNeighborSet = new Set();
  const offspringLandingSet = new Set();

  if (selectedCell && selectedCellData) {
    const { row: sr, col: sc } = selectedCell;
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    dirs.forEach(([dr, dc]) => {
      const nr = sr + dr;
      const nc = sc + dc;
      if (nr >= 0 && nr < state.gridSize && nc >= 0 && nc < state.gridSize) {
        const neighbor = displayGrid[nr]?.[nc];
        if (neighbor && neighbor.species === selectedCellData.species) {
          sameSpeciesNeighborSet.add(`${nr}-${nc}`);
        }
      }
    });

    // For each breeding pair, find empty adjacent cells (offspring landing spots)
    breedingPairs.forEach(pair => {
      const { row: pr, col: pc } = pair.neighbor;
      // Empty cells adjacent to either flower in the pair
      const pairCells = [[sr, sc], [pr, pc]];
      pairCells.forEach(([fr, fc]) => {
        dirs.forEach(([dr, dc]) => {
          const nr = fr + dr;
          const nc = fc + dc;
          if (nr >= 0 && nr < state.gridSize && nc >= 0 && nc < state.gridSize) {
            if (!displayGrid[nr]?.[nc]) {
              offspringLandingSet.add(`${nr}-${nc}`);
            }
          }
        });
      });
    });
  }

  // ─── STYLES (inline only) ─────────────────────────────────────────────────

  const S = {
    root: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '100vh',
      backgroundColor: '#0a1a10',
      color: '#c8e6c0',
      fontFamily: '"DM Sans", sans-serif',
      overflow: 'hidden',
    },
    toolbar: {
      flexShrink: 0,
      padding: '10px 14px 8px',
      backgroundColor: 'rgba(12,28,14,0.97)',
      borderBottom: '1px solid rgba(94,200,80,0.15)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    toolbarRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      flexWrap: 'wrap',
    },
    speciesBtn: (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      background: active ? 'rgba(94,200,80,0.2)' : 'rgba(94,200,80,0.06)',
      border: `1px solid ${active ? '#5ec850' : 'rgba(94,200,80,0.2)'}`,
      borderRadius: '6px',
      color: active ? '#5ec850' : '#5a7a50',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: active ? '700' : '400',
      fontFamily: '"DM Sans", sans-serif',
      transition: 'all 0.15s',
    }),
    colorDot: (hex, active) => ({
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      backgroundColor: hex,
      border: `2px solid ${active ? '#d4b030' : 'rgba(94,200,80,0.3)'}`,
      cursor: 'pointer',
      boxShadow: active ? '0 0 0 2px rgba(212,176,48,0.4)' : 'none',
      flexShrink: 0,
    }),
    toolBtn: (active) => ({
      padding: '4px 10px',
      background: active ? 'rgba(74,172,240,0.2)' : 'rgba(74,172,240,0.05)',
      border: `1px solid ${active ? '#4aacf0' : 'rgba(74,172,240,0.2)'}`,
      borderRadius: '6px',
      color: active ? '#4aacf0' : '#5a7a50',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: active ? '700' : '400',
      fontFamily: '"DM Sans", sans-serif',
      transition: 'all 0.15s',
    }),
    actionBtn: (color) => ({
      padding: '4px 10px',
      background: `rgba(${color === 'red' ? '220,38,38' : '90,122,80'},0.15)`,
      border: `1px solid ${color === 'red' ? 'rgba(220,38,38,0.4)' : 'rgba(90,122,80,0.3)'}`,
      borderRadius: '6px',
      color: color === 'red' ? '#ef4444' : '#5a7a50',
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: '"DM Sans", sans-serif',
    }),
    tierPill: (active) => ({
      padding: '3px 8px',
      borderRadius: '12px',
      background: active ? 'rgba(212,176,48,0.25)' : 'rgba(212,176,48,0.05)',
      border: `1px solid ${active ? '#d4b030' : 'rgba(212,176,48,0.15)'}`,
      color: active ? '#d4b030' : '#5a7a50',
      cursor: 'pointer',
      fontSize: '11px',
      fontWeight: active ? '700' : '400',
      fontFamily: '"DM Sans", sans-serif',
    }),
    sectionLabel: {
      fontSize: '11px',
      color: '#5a7a50',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    gridArea: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
      position: 'relative',
    },
    gridScroll: {
      flex: 1,
      overflow: 'auto',
      padding: '14px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    },
    cellSize: 24,
    cellGap: 2,
    gridInner: (gridSize) => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${gridSize}, 24px)`,
      gap: '2px',
      flexShrink: 0,
    }),
    cell: (occupied, selected, pending, hex) => ({
      width: '24px',
      height: '24px',
      borderRadius: '4px',
      backgroundColor: occupied ? hex : '#1a3a20',
      border: `1px solid ${selected ? '#5ec850' : occupied ? 'rgba(94,200,80,0.25)' : 'rgba(94,200,80,0.12)'}`,
      boxShadow: selected ? '0 0 0 2px #5ec850' : 'none',
      cursor: 'pointer',
      opacity: pending ? 0.55 : 1,
      transition: 'background-color 0.1s, border-color 0.1s',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    cloneOverlay: {
      position: 'absolute',
      top: '1px',
      right: '2px',
      fontSize: '7px',
      color: '#d4b030',
      fontWeight: '700',
      fontFamily: '"DM Mono", monospace',
      pointerEvents: 'none',
    },
    panel: (open) => ({
      width: open ? `${PANEL_WIDTH}px` : '0',
      flexShrink: 0,
      overflow: 'hidden',
      transition: 'width 0.25s ease',
      backgroundColor: 'rgba(12,28,14,0.98)',
      borderLeft: '1px solid rgba(94,200,80,0.12)',
      display: 'flex',
      flexDirection: 'column',
    }),
    panelInner: {
      width: `${PANEL_WIDTH}px`,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    },
    panelTabBar: {
      display: 'flex',
      borderBottom: '1px solid rgba(94,200,80,0.12)',
      flexShrink: 0,
    },
    panelTab: (active) => ({
      flex: 1,
      padding: '10px 4px',
      background: 'none',
      border: 'none',
      borderBottom: `2px solid ${active ? '#5ec850' : 'transparent'}`,
      color: active ? '#5ec850' : '#5a7a50',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: active ? '700' : '400',
      fontFamily: '"DM Sans", sans-serif',
      transition: 'all 0.15s',
    }),
    panelContent: {
      flex: 1,
      overflowY: 'auto',
      padding: '12px',
    },
    bottomBar: {
      flexShrink: 0,
      padding: '8px 14px',
      backgroundColor: 'rgba(12,28,14,0.98)',
      borderTop: '1px solid rgba(94,200,80,0.12)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      minHeight: '48px',
    },
    bottomBarText: {
      fontSize: '13px',
      color: '#c8e6c0',
      fontWeight: '600',
    },
    bottomBarMuted: {
      fontSize: '11px',
      color: '#5a7a50',
    },
    badge: (color) => ({
      display: 'inline-block',
      padding: '1px 6px',
      borderRadius: '10px',
      fontSize: '10px',
      fontWeight: '700',
      background: color === 'gold' ? 'rgba(212,176,48,0.2)' : color === 'blue' ? 'rgba(74,172,240,0.2)' : 'rgba(94,200,80,0.2)',
      color: color === 'gold' ? '#d4b030' : color === 'blue' ? '#4aacf0' : '#5ec850',
      border: `1px solid ${color === 'gold' ? 'rgba(212,176,48,0.4)' : color === 'blue' ? 'rgba(74,172,240,0.4)' : 'rgba(94,200,80,0.4)'}`,
    }),
    monoText: {
      fontFamily: '"DM Mono", monospace',
      fontSize: '11px',
      color: '#4aacf0',
    },
    separator: {
      width: '1px',
      height: '24px',
      backgroundColor: 'rgba(94,200,80,0.15)',
      flexShrink: 0,
    },
    panelToggleBtn: {
      marginLeft: 'auto',
      padding: '4px 10px',
      background: 'rgba(94,200,80,0.1)',
      border: '1px solid rgba(94,200,80,0.25)',
      borderRadius: '6px',
      color: '#5ec850',
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: '"DM Sans", sans-serif',
    },
    // Panel shared
    pLabel: {
      fontSize: '11px',
      color: '#5a7a50',
      fontWeight: '600',
      marginBottom: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    pSection: {
      marginBottom: '16px',
    },
    pCard: {
      padding: '8px 10px',
      backgroundColor: 'rgba(10,26,16,0.8)',
      border: '1px solid rgba(94,200,80,0.1)',
      borderRadius: '6px',
      marginBottom: '6px',
    },
    pBtn: (variant) => ({
      padding: '5px 10px',
      borderRadius: '5px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
      fontFamily: '"DM Sans", sans-serif',
      background: variant === 'primary' ? '#5ec850'
        : variant === 'gold' ? '#d4b030'
        : variant === 'blue' ? '#4aacf0'
        : variant === 'danger' ? '#ef4444'
        : 'rgba(94,200,80,0.15)',
      color: variant === 'ghost' ? '#5ec850' : '#0a1a10',
    }),
    simBtn: {
      padding: '7px 14px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '700',
      fontFamily: '"DM Sans", sans-serif',
      background: '#5ec850',
      color: '#0a1a10',
      width: '100%',
      marginBottom: '10px',
    },
    input: {
      flex: 1,
      padding: '6px 8px',
      background: 'rgba(10,26,16,0.9)',
      border: '1px solid rgba(94,200,80,0.2)',
      borderRadius: '5px',
      color: '#c8e6c0',
      fontSize: '12px',
      fontFamily: '"DM Sans", sans-serif',
      outline: 'none',
    },
    rangeSlider: {
      width: '100%',
      accentColor: '#5ec850',
      cursor: 'pointer',
    },
    offspringChip: (hex) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 7px',
      borderRadius: '10px',
      background: `${hex}22`,
      border: `1px solid ${hex}66`,
      fontSize: '11px',
      color: '#c8e6c0',
      marginRight: '4px',
      marginBottom: '4px',
    }),
  };

  // ─── TOOLBAR ─────────────────────────────────────────────────────────────────

  const ToolbarSpeciesRow = () => (
    <div style={S.toolbarRow}>
      <span style={S.sectionLabel}>Species:</span>
      {Object.entries(SPECIES).map(([key, sp]) => (
        <button
          key={key}
          onClick={() => dispatch({ type: 'SELECT_SPECIES', species: key })}
          style={S.speciesBtn(state.selectedSpecies === key)}
        >
          <span>{sp.emoji}</span>
          <span>{sp.name}</span>
        </button>
      ))}
    </div>
  );

  const ToolbarControlRow = () => {
    const colors = allColors;
    return (
      <div style={S.toolbarRow}>
        {/* Color palette */}
        <span style={S.sectionLabel}>Color:</span>
        {colors.map(({ color, hex, source }) => (
          <button
            key={color}
            title={`${color}${source === 'seed' ? ' (Seed)' : source === 'special' ? ' (Special)' : ''}`}
            onClick={() => dispatch({ type: 'SELECT_COLOR', color })}
            style={{ ...S.colorDot(hex, state.selectedColor === color), position: 'relative' }}
            aria-label={`${color} flower`}
          >
            {source === 'seed' && (
              <span style={{ position: 'absolute', top: -4, right: -4, fontSize: 7, color: '#d4b030',
                fontFamily: "'DM Mono', monospace", fontWeight: 700, textShadow: '0 0 2px #0a1a10' }}>S</span>
            )}
            {source === 'special' && (
              <span style={{ position: 'absolute', top: -4, right: -4, fontSize: 8, color: '#d4b030',
                textShadow: '0 0 2px #0a1a10' }}>★</span>
            )}
          </button>
        ))}

        <div style={S.separator} />

        {/* Tool buttons */}
        <span style={S.sectionLabel}>Tool:</span>
        {TOOLS.map(t => (
          <button
            key={t}
            onClick={() => dispatch({ type: 'SET_TOOL', tool: t })}
            style={S.toolBtn(state.tool === t)}
          >
            {t === 'place' ? '✏️ Place' : t === 'select' ? '🔍 Select' : '🗑️ Erase'}
          </button>
        ))}

        <div style={S.separator} />

        {/* Grid size */}
        <span style={S.sectionLabel}>Grid:</span>
        <input
          type="range" min="5" max="20" value={state.gridSize}
          onChange={e => dispatch({ type: 'SET_GRID_SIZE', size: parseInt(e.target.value) })}
          style={{ width: '80px', accentColor: '#5ec850', cursor: 'pointer' }}
        />
        <span style={{ ...S.sectionLabel, color: '#5ec850', minWidth: '34px' }}>{state.gridSize}x{state.gridSize}</span>

        <div style={S.separator} />

        {/* Simulation tier */}
        <span style={S.sectionLabel}>Sim:</span>
        {SIMULATION_TIERS.map(t => (
          <button key={t} onClick={() => dispatch({ type: 'SET_SIMULATION_TIER', tier: t })} style={S.tierPill(state.simulationTier === t)}>
            {t === 'static' ? '⏸ Static' : t === 'basic' ? '▶ Basic' : '🏕 Campaign'}
          </button>
        ))}

        <div style={S.separator} />

        {/* Actions */}
        <button onClick={() => dispatch({ type: 'UNDO' })} style={S.actionBtn('muted')} disabled={state.history.length === 0}>
          ↩ Undo
        </button>
        <button onClick={() => { if (window.confirm('Clear garden?')) dispatch({ type: 'CLEAR_GRID' }); }} style={S.actionBtn('red')}>
          Clear
        </button>

        {/* Templates */}
        <span style={S.sectionLabel}>Template:</span>
        {['checkerboard', 'rows', 'bluerose', 'pairs'].map(t => (
          <button key={t} onClick={() => dispatch({ type: 'APPLY_TEMPLATE', template: t })} style={S.actionBtn('muted')}>
            {t === 'checkerboard' ? '◼' : t === 'rows' ? '▬' : t === 'bluerose' ? '💙' : '↕'} {t}
          </button>
        ))}
      </div>
    );
  };

  // ─── GRID ─────────────────────────────────────────────────────────────────────

  const Grid = () => (
    <div
      style={S.gridInner(state.gridSize)}
      onMouseDown={() => { isDragging.current = true; }}
    >
      {displayGrid.map((row, ri) =>
        row.map((cell, ci) => {
          const isSelected = selectedCell?.row === ri && selectedCell?.col === ci;
          const hex = cell ? (COLOR_HEX[cell.color] || cell.hex || '#5ec850') : '#1a3a20';
          const showClone = cell && state.simulationTier !== 'static' && canClone(displayGrid, ri, ci);
          const cellKey = `${ri}-${ci}`;
          const isNeighborGlow = !isSelected && sameSpeciesNeighborSet.has(cellKey);
          const isOffspringLanding = !cell && offspringLandingSet.has(cellKey);

          // Build extra border/boxShadow for neighbor highlights
          let extraStyle = {};
          if (isNeighborGlow) {
            extraStyle = {
              border: '1px solid rgba(94,200,80,0.7)',
              boxShadow: '0 0 0 2px rgba(94,200,80,0.3)',
            };
          } else if (isOffspringLanding) {
            extraStyle = {
              border: '1px dashed rgba(212,176,48,0.55)',
            };
          }

          return (
            <div
              key={cellKey}
              style={{ ...S.cell(!!cell, isSelected, cell?.pending, hex), ...extraStyle }}
              onClick={() => handleCellClick(ri, ci)}
              onContextMenu={(e) => handleCellRightClick(e, ri, ci)}
              onDoubleClick={() => cell && handleCellDoubleClick(ri, ci)}
              onMouseEnter={() => handleCellEnter(ri, ci)}
              title={cell ? `${cell.color} ${cell.species}${cell.genotype ? ' · ' + cell.genotype : ''}` : `[${ri},${ci}]`}
            >
              {showClone && <span style={S.cloneOverlay}>C</span>}
            </div>
          );
        })
      )}
    </div>
  );

  // ─── PANEL: BREED TAB ─────────────────────────────────────────────────────────

  const BreedPanel = () => {
    if (!selectedCellData) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#5a7a50', fontSize: '13px' }}>
          Click a flower to see breeding info
        </div>
      );
    }

    const { species, color, genotype, source } = selectedCellData;
    const cellHex = COLOR_HEX[color] || '#5ec850';
    const sourceBadge = source === 'seed' ? 'green' : source === 'bred' ? 'blue' : 'gold';

    return (
      <>
        {/* Cell info */}
        <div style={{ ...S.pCard, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <AssetImg category="other" name={`${color.toLowerCase()}-${species} plant`} size={24} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#c8e6c0' }}>{color} {SPECIES[species]?.name}</div>
            {genotype && <div style={S.monoText}>{genotype}</div>}
            <div style={{ marginTop: '3px' }}>
              <span style={S.badge(sourceBadge)}>{source || 'placed'}</span>
              {cloneRisk && <span style={{ ...S.badge('gold'), marginLeft: '4px' }}>Clone Risk</span>}
            </div>
          </div>
        </div>

        {/* Gold Rose special case */}
        {species === 'rose' && color === 'Black' && state.simulationTier !== 'static' && (
          <div style={{
            padding: '7px 10px',
            marginBottom: '10px',
            backgroundColor: 'rgba(212,176,48,0.08)',
            border: '1px solid rgba(212,176,48,0.35)',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#d4b030',
            lineHeight: '1.5',
          }}>
            💛 Water with the <strong>Golden Watering Can</strong> for a chance to produce a <strong>Gold Rose</strong>. Gold Roses cannot be bred through normal crossover — this is a special game mechanic.
          </div>
        )}

        {/* Breeding pairs */}
        <div style={S.pLabel}>Breeding Pairs ({breedingPairs.length})</div>
        {breedingPairs.length === 0 && (
          <div style={{ fontSize: '12px', color: '#5a7a50', marginBottom: '12px' }}>No same-species neighbors with genotypes.</div>
        )}
        {breedingPairs.map((pair, idx) => {
          const neighborCell = displayGrid[pair.neighbor.row]?.[pair.neighbor.col];
          if (!neighborCell) return null;
          return (
            <div key={idx} style={{ ...S.pCard, marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <AssetImg category="other" name={`${color.toLowerCase()}-${species} plant`} size={16} />
                <span style={{ fontSize: '11px', color: '#5a7a50' }}>{color}</span>
                <span style={{ color: '#5ec850', fontSize: '12px' }}>×</span>
                <AssetImg category="other" name={`${neighborCell.color.toLowerCase()}-${neighborCell.species} plant`} size={16} />
                <span style={{ fontSize: '11px', color: '#5a7a50' }}>{neighborCell.color}</span>
                <span style={{ fontSize: '10px', color: '#5a7a50' }}>@[{pair.neighbor.row},{pair.neighbor.col}]</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {pair.offspring.map(o => {
                  const oHex = COLOR_HEX[o.color] || '#5ec850';
                  return (
                    <span key={o.color} style={S.offspringChip(oHex)}>
                      <AssetImg category="other" name={`${o.color.toLowerCase()}-${species} plant`} size={12} />
                      {o.color} {Math.round(o.probability * 100)}%
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Quick breeding summary from BREEDING_PATHS */}
        {BREEDING_PATHS[species] && (
          <>
            <div style={{ ...S.pLabel, marginTop: '12px' }}>Known Paths for {color}</div>
            {BREEDING_PATHS[species]
              .filter(p => p.parents.includes(color))
              .slice(0, 3)
              .map((p, i) => (
                <div key={i} style={{ ...S.pCard, fontSize: '11px', color: '#5a7a50' }}>
                  {p.parents.join(' × ')} →{' '}
                  {p.offspring.map(o => `${o.color}(${Math.round(o.probability * 100)}%)`).join(', ')}
                </div>
              ))}
          </>
        )}
      </>
    );
  };

  // ─── PANEL: SIM TAB ───────────────────────────────────────────────────────────

  const SimPanel = () => {
    const isCampaign = state.simulationTier === 'campaign';
    const isStatic = state.simulationTier === 'static';
    const hasPending = !!state.pendingGrid;
    const breedCount = state.simulationEvents.filter(e => e.type === 'breed').length;
    const cloneCount = state.simulationEvents.filter(e => e.type === 'clone').length;
    const failCount = state.simulationEvents.filter(e => e.type === 'fail').length;

    if (isStatic) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#5a7a50', fontSize: '13px' }}>
          Switch to Basic or Campaign mode to simulate days.
        </div>
      );
    }

    return (
      <>
        <div style={S.pSection}>
          <div style={S.pLabel}>Watering Visitors: {state.wateringVisitors}</div>
          <input
            type="range" min="0" max="5" value={state.wateringVisitors}
            onChange={e => dispatch({ type: 'SET_WATERING', visitors: parseInt(e.target.value) })}
            style={S.rangeSlider}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#5a7a50' }}>
            <span>0 (5%)</span><span>1 (10%)</span><span>2 (20%)</span><span>3 (30%)</span><span>4 (50%)</span><span>5 (80%)</span>
          </div>
        </div>

        {isCampaign && (
          <div style={S.pSection}>
            <div style={S.pLabel}>Campaign</div>
            <div style={{ ...S.pCard, display: 'flex', gap: '10px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontFamily: '"DM Mono", monospace', color: '#d4b030' }}>{state.day}</div>
                <div style={{ fontSize: '10px', color: '#5a7a50' }}>Day</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontFamily: '"DM Mono", monospace', color: '#4aacf0' }}>
                  {Object.keys(state.badLuckCounters).length}
                </div>
                <div style={{ fontSize: '10px', color: '#5a7a50' }}>Tracked Pairs</div>
              </div>
            </div>
          </div>
        )}

        {!hasPending ? (
          <button style={S.simBtn} onClick={() => dispatch({ type: 'SIMULATE_DAY' })}>
            ▶ Simulate Day {state.day + 1}
          </button>
        ) : (
          <div style={S.pSection}>
            <div style={S.pLabel}>Pending Results</div>
            <div style={{ ...S.pCard, marginBottom: '8px' }}>
              <span style={{ ...S.badge('green'), marginRight: '6px' }}>🌱 {breedCount} bred</span>
              <span style={{ ...S.badge('blue'), marginRight: '6px' }}>©️ {cloneCount} cloned</span>
              <span style={{ ...S.badge('gold') }}>✗ {failCount} failed</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={S.pBtn('primary')} onClick={() => dispatch({ type: 'ACCEPT_DAY' })}>Accept</button>
              <button style={S.pBtn('ghost')} onClick={() => dispatch({ type: 'REROLL_DAY' })}>Reroll</button>
              <button style={S.pBtn('danger')} onClick={() => dispatch({ type: 'REJECT_DAY' })}>Discard</button>
            </div>
          </div>
        )}

        {/* Events log */}
        {state.simulationEvents.length > 0 && (
          <div style={S.pSection}>
            <div style={S.pLabel}>Events ({state.simulationEvents.length})</div>
            <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
              {state.simulationEvents.map((ev, i) => (
                <div key={i} style={{ ...S.pCard, padding: '4px 8px', fontSize: '11px', color: '#5a7a50', marginBottom: '3px' }}>
                  {ev.type === 'breed' && <span style={{ color: '#5ec850' }}>🌱 Breed → [{ev.row},{ev.col}] {ev.color}</span>}
                  {ev.type === 'clone' && <span style={{ color: '#4aacf0' }}>© Clone → [{ev.row},{ev.col}] {ev.color}</span>}
                  {ev.type === 'fail' && <span style={{ color: '#5a7a50' }}>✗ Fail [{ev.row},{ev.col}]</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Watering log */}
        {isCampaign && state.wateringLog.length > 0 && (
          <div style={S.pSection}>
            <div style={S.pLabel}>Watering Log</div>
            {state.wateringLog.slice(-5).reverse().map((entry, i) => (
              <div key={i} style={{ ...S.pCard, padding: '4px 8px', fontSize: '11px', color: '#5a7a50', marginBottom: '3px' }}>
                Day {entry.day} · {entry.visitors} visitors · {entry.events} events
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  // ─── PANEL: SAVE TAB ─────────────────────────────────────────────────────────

  const SavePanel = () => (
    <>
      <div style={S.pSection}>
        <div style={S.pLabel}>Save Current Layout</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            placeholder="Layout name..."
            value={layoutNameInput}
            onChange={e => setLayoutNameInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && layoutNameInput.trim()) {
                dispatch({ type: 'SAVE_LAYOUT', name: layoutNameInput });
                setLayoutNameInput('');
              }
            }}
            style={S.input}
          />
          <button
            style={S.pBtn('primary')}
            onClick={() => {
              if (layoutNameInput.trim()) {
                dispatch({ type: 'SAVE_LAYOUT', name: layoutNameInput });
                setLayoutNameInput('');
              }
            }}
          >
            Save
          </button>
        </div>
      </div>

      <div style={S.pLabel}>Saved Layouts ({state.savedLayouts.length})</div>
      {state.savedLayouts.length === 0 && (
        <div style={{ fontSize: '12px', color: '#5a7a50', padding: '12px 0' }}>No saved layouts yet.</div>
      )}
      {state.savedLayouts.map(layout => (
        <div key={layout.id} style={{ ...S.pCard, marginBottom: '6px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#c8e6c0', marginBottom: '2px' }}>{layout.name}</div>
          <div style={{ fontSize: '10px', color: '#5a7a50', marginBottom: '6px' }}>
            {layout.gridSize}×{layout.gridSize} · {layout.date}
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button style={S.pBtn('primary')} onClick={() => dispatch({ type: 'LOAD_LAYOUT', id: layout.id })}>Load</button>
            <button style={S.pBtn('danger')} onClick={() => dispatch({ type: 'DELETE_LAYOUT', id: layout.id })}>Delete</button>
          </div>
        </div>
      ))}
    </>
  );

  // ─── BOTTOM BAR ───────────────────────────────────────────────────────────────

  const BottomBar = () => {
    if (!selectedCellData) {
      const total = state.gridSize * state.gridSize;
      const used = displayGrid.flat().filter(Boolean).length;
      return (
        <div style={S.bottomBar}>
          <span style={S.bottomBarMuted}>🌿 Garden Planner</span>
          <div style={S.separator} />
          <span style={S.monoText}>{used}/{total} cells</span>
          <span style={S.bottomBarMuted}>{state.simulationTier} mode</span>
          {state.history.length > 0 && <span style={S.bottomBarMuted}>{state.history.length} undo steps</span>}
          <button style={{ ...S.panelToggleBtn, marginLeft: 'auto' }} onClick={() => dispatch({ type: 'TOGGLE_PANEL' })}>
            {state.panelOpen ? '▶ Close Panel' : '◀ Open Panel'}
          </button>
        </div>
      );
    }

    const { species, color, genotype, source } = selectedCellData;
    const sourceBadge = source === 'seed' ? 'green' : source === 'bred' ? 'blue' : 'gold';

    return (
      <div style={S.bottomBar}>
        <AssetImg category="other" name={`${color.toLowerCase()}-${species} plant`} size={32} />
        <div>
          <div style={S.bottomBarText}>{color} {SPECIES[species]?.name}</div>
          {selectedCell && <div style={S.bottomBarMuted}>@[{selectedCell.row},{selectedCell.col}]</div>}
        </div>
        <span style={S.badge(sourceBadge)}>{source || 'placed'}</span>
        {genotype && <span style={S.monoText}>{genotype}</span>}
        {cloneRisk && <span style={S.badge('gold')}>Clone Risk</span>}
        {breedingPairs.length > 0 && (
          <span style={S.badge('blue')}>{breedingPairs.length} pair{breedingPairs.length !== 1 ? 's' : ''}</span>
        )}
        <button
          style={S.panelToggleBtn}
          onClick={() => dispatch({ type: state.panelOpen ? 'TOGGLE_PANEL' : 'SET_PANEL_TAB', tab: 'breed' })}
        >
          {state.panelOpen ? '▶ Close' : '◀ Breed Info'}
        </button>
      </div>
    );
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────────

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #0a1a10; }
        ::-webkit-scrollbar-thumb { background: rgba(94,200,80,0.25); border-radius: 3px; }
      `}</style>

      {/* Toolbar */}
      <div style={S.toolbar}>
        <ToolbarSpeciesRow />
        <ToolbarControlRow />
      </div>

      {/* Grid area + sliding panel */}
      <div style={S.gridArea}>
        <div style={S.gridScroll}>
          <Grid />
        </div>

        {/* Sliding panel */}
        <div style={S.panel(state.panelOpen)}>
          <div style={S.panelInner}>
            <div style={S.panelTabBar}>
              {['breed', 'sim', 'save'].map(tab => (
                <button
                  key={tab}
                  style={S.panelTab(state.panelTab === tab)}
                  onClick={() => dispatch({ type: 'SET_PANEL_TAB', tab })}
                >
                  {tab === 'breed' ? '🌸 Breed' : tab === 'sim' ? '▶ Sim' : '💾 Save'}
                </button>
              ))}
            </div>
            <div style={S.panelContent}>
              {state.panelTab === 'breed' && <BreedPanel />}
              {state.panelTab === 'sim' && <SimPanel />}
              {state.panelTab === 'save' && <SavePanel />}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <BottomBar />
    </div>
  );
}
