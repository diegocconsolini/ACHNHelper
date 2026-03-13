import React, { useState, lazy, Suspense } from 'react';
import { SettingsProvider } from './SettingsContext';

const FishTracker = lazy(() => import('./artifacts/FishTracker.jsx'));
const BugTracker = lazy(() => import('./artifacts/BugTracker.jsx'));
const SeaCreatureTracker = lazy(() => import('./artifacts/SeaCreatureTracker.jsx'));
const MuseumTracker = lazy(() => import('./artifacts/MuseumTracker.jsx'));
const GoldenToolTracker = lazy(() => import('./artifacts/GoldenToolTracker.jsx'));
const NookMilesTracker = lazy(() => import('./artifacts/NookMilesTracker.jsx'));
const TurnipTracker = lazy(() => import('./artifacts/TurnipTracker.jsx'));
const BellCalculator = lazy(() => import('./artifacts/BellCalculator.jsx'));
const NooksCrannyLog = lazy(() => import('./artifacts/NooksCrannyLog.jsx'));
const FiveStarChecker = lazy(() => import('./artifacts/FiveStarChecker.jsx'));
const DailyRoutine = lazy(() => import('./artifacts/DailyRoutine.jsx'));
const FlowerCalculator = lazy(() => import('./artifacts/FlowerCalculator.jsx'));
const GardenPlanner = lazy(() => import('./artifacts/GardenPlanner.jsx'));
const IslandFlowerMap = lazy(() => import('./artifacts/IslandFlowerMap.jsx'));
const GulliverTracker = lazy(() => import('./artifacts/GulliverTracker.jsx'));
const ArtDetector = lazy(() => import('./artifacts/ArtDetector.jsx'));
const KKCatalogue = lazy(() => import('./artifacts/KKCatalogue.jsx'));
const VillagerGiftGuide = lazy(() => import('./artifacts/VillagerGiftGuide.jsx'));
const SeasonalEventCalendar = lazy(() => import('./artifacts/SeasonalEventCalendar.jsx'));
const DIYRecipeTracker = lazy(() => import('./artifacts/DIYRecipeTracker.jsx'));
const CelesteMeteorTracker = lazy(() => import('./artifacts/CelesteMeteorTracker.jsx'));
const DreamAddressBook = lazy(() => import('./artifacts/DreamAddressBook.jsx'));
const Settings = lazy(() => import('./artifacts/Settings.jsx'));

const MENU = [
  {
    category: '🐟 Critterpedia',
    items: [
      { id: 'fish', label: 'Fish Tracker', emoji: '🐟', component: 'FishTracker' },
      { id: 'bugs', label: 'Bug Tracker', emoji: '🦋', component: 'BugTracker' },
      { id: 'sea', label: 'Sea Creatures', emoji: '🐙', component: 'SeaCreatureTracker' },
    ],
  },
  {
    category: '🏛️ Museum & Progress',
    items: [
      { id: 'museum', label: 'Museum Tracker', emoji: '🏛️', component: 'MuseumTracker' },
      { id: 'golden', label: 'Golden Tools', emoji: '✨', component: 'GoldenToolTracker' },
      { id: 'nookmiles', label: 'Nook Miles', emoji: '🎖️', component: 'NookMilesTracker' },
    ],
  },
  {
    category: '💰 Economy & Planning',
    items: [
      { id: 'turnip', label: 'Turnip Tracker', emoji: '📈', component: 'TurnipTracker' },
      { id: 'bell', label: 'Bell Calculator', emoji: '💰', component: 'BellCalculator' },
      { id: 'nooks', label: "Nook's Cranny Log", emoji: '🏪', component: 'NooksCrannyLog' },
      { id: 'fivestar', label: '5-Star Checker', emoji: '⭐', component: 'FiveStarChecker' },
      { id: 'daily', label: 'Daily Routine', emoji: '📋', component: 'DailyRoutine' },
    ],
  },
  {
    category: '🌸 Gardening',
    items: [
      { id: 'flower', label: 'Flower Calculator', emoji: '🌹', component: 'FlowerCalculator' },
      { id: 'garden', label: 'Garden Planner', emoji: '🌻', component: 'GardenPlanner' },
      { id: 'flowermap', label: 'Island Flower Map', emoji: '🗺️', component: 'IslandFlowerMap' },
    ],
  },
  {
    category: '🎨 Special & Art',
    items: [
      { id: 'gulliver', label: 'Gulliver Tracker', emoji: '🐦', component: 'GulliverTracker' },
      { id: 'art', label: 'Art Detector', emoji: '🎨', component: 'ArtDetector' },
      { id: 'kk', label: 'K.K. Catalogue', emoji: '🎵', component: 'KKCatalogue' },
    ],
  },
  {
    category: '🏠 Island Life',
    items: [
      { id: 'villager', label: 'Villager Gift Guide', emoji: '🎁', component: 'VillagerGiftGuide' },
      { id: 'events', label: 'Event Calendar', emoji: '📅', component: 'SeasonalEventCalendar' },
      { id: 'diy', label: 'DIY Recipe Tracker', emoji: '🔨', component: 'DIYRecipeTracker' },
      { id: 'celeste', label: 'Celeste & Meteors', emoji: '🌠', component: 'CelesteMeteorTracker' },
      { id: 'dreams', label: 'Dream Address Book', emoji: '☁️', component: 'DreamAddressBook' },
    ],
  },
  {
    category: '⚙️ Settings',
    items: [
      { id: 'settings', label: 'Settings', emoji: '⚙️', component: 'Settings' },
    ],
  },
];

const COMPONENTS = {
  FishTracker,
  BugTracker,
  SeaCreatureTracker,
  MuseumTracker,
  GoldenToolTracker,
  NookMilesTracker,
  TurnipTracker,
  BellCalculator,
  NooksCrannyLog,
  FiveStarChecker,
  DailyRoutine,
  FlowerCalculator,
  GardenPlanner,
  IslandFlowerMap,
  GulliverTracker,
  ArtDetector,
  KKCatalogue,
  VillagerGiftGuide,
  SeasonalEventCalendar,
  DIYRecipeTracker,
  CelesteMeteorTracker,
  DreamAddressBook,
  Settings,
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  reset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 16,
          background: '#0a1a10',
          fontFamily: "'DM Sans', sans-serif",
          color: '#c8e6c0',
          padding: 32,
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 56 }}>🍂</span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24,
            fontWeight: 700,
            color: '#5ec850',
          }}>
            This tool ran into a problem
          </h2>
          <p style={{ fontSize: 14, color: '#5a7a50', maxWidth: 420, lineHeight: 1.6 }}>
            Something unexpected happened while loading this tool. Your saved data is safe.
          </p>
          {this.state.error && (
            <p style={{
              fontSize: 12,
              color: '#5a7a50',
              fontFamily: "'DM Mono', monospace",
              background: 'rgba(12,28,14,0.95)',
              border: '1px solid rgba(94,200,80,0.1)',
              borderRadius: 8,
              padding: '8px 16px',
              maxWidth: 480,
              wordBreak: 'break-word',
            }}>
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.reset}
            style={{
              marginTop: 8,
              padding: '10px 24px',
              background: 'rgba(94,200,80,0.15)',
              border: '1px solid rgba(94,200,80,0.35)',
              borderRadius: 8,
              color: '#5ec850',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Reload Tool
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [activeId, setActiveId] = useState('fish');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeItem = MENU.flatMap(g => g.items).find(i => i.id === activeId);
  const ActiveComponent = activeItem?.component ? COMPONENTS[activeItem.component] : null;

  return (
    <SettingsProvider>
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a1a10; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0a1a10; }
        ::-webkit-scrollbar-thumb { background: #1a3a20; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #2a4a30; }
      `}</style>

      {/* Sidebar */}
      <div style={{
        ...styles.sidebar,
        width: sidebarOpen ? 260 : 0,
        padding: sidebarOpen ? '20px 0' : 0,
        overflow: 'hidden',
      }}>
        <div style={styles.logoArea}>
          <span style={{ fontSize: 28 }}>🏝️</span>
          <span style={styles.logoText}>ACNH Helper Suite</span>
        </div>

        <div style={styles.menuScroll}>
          {MENU.map(group => (
            <div key={group.category} style={styles.menuGroup}>
              <div style={styles.categoryLabel}>{group.category}</div>
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                  style={{
                    ...styles.menuItem,
                    background: activeId === item.id ? 'rgba(94,200,80,0.15)' : 'transparent',
                    borderLeft: activeId === item.id ? '3px solid #5ec850' : '3px solid transparent',
                    opacity: item.component ? 1 : 0.45,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{item.emoji}</span>
                  <span style={styles.menuLabel}>{item.label}</span>
                  {!item.component && <span style={styles.comingSoon}>soon</span>}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div style={styles.sidebarFooter}>
          <span style={{ fontSize: 11, color: '#3a5a40', fontFamily: "'DM Mono', monospace" }}>
            v{__APP_VERSION__} — 23 tools
          </span>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={styles.toggleBtn}
        title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>

      {/* Main Content */}
      <div style={styles.main}>
        {ActiveComponent ? (
          <ErrorBoundary key={activeId}>
            <Suspense fallback={
              <div style={styles.loading}>
                <span style={{ fontSize: 48 }}>🍃</span>
                <p style={{ color: '#5ec850', fontFamily: "'DM Sans', sans-serif", marginTop: 12 }}>Loading...</p>
              </div>
            }>
              <ActiveComponent />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <div style={styles.placeholder}>
            <span style={{ fontSize: 64 }}>{activeItem?.emoji || '🏝️'}</span>
            <h2 style={styles.placeholderTitle}>{activeItem?.label || 'Welcome'}</h2>
            <p style={styles.placeholderText}>This tool is coming soon!</p>
          </div>
        )}
      </div>
    </div>
    </SettingsProvider>
  );
}

const styles = {
  root: {
    display: 'flex',
    height: '100vh',
    background: '#0a1a10',
    fontFamily: "'DM Sans', sans-serif",
    color: '#c8e6c0',
  },
  sidebar: {
    background: 'rgba(8,16,10,0.95)',
    borderRight: '1px solid rgba(94,200,80,0.1)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease, padding 0.3s ease',
    flexShrink: 0,
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 20px 20px',
    borderBottom: '1px solid rgba(94,200,80,0.1)',
  },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 16,
    fontWeight: 900,
    color: '#5ec850',
    whiteSpace: 'nowrap',
  },
  menuScroll: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 0',
  },
  menuGroup: {
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#5a7a50',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    padding: '8px 20px 4px',
    fontFamily: "'DM Mono', monospace",
    whiteSpace: 'nowrap',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  menuLabel: {
    flex: 1,
    textAlign: 'left',
  },
  comingSoon: {
    fontSize: 9,
    background: 'rgba(212,176,48,0.2)',
    color: '#d4b030',
    padding: '2px 6px',
    borderRadius: 8,
    fontFamily: "'DM Mono', monospace",
  },
  sidebarFooter: {
    padding: '12px 20px',
    borderTop: '1px solid rgba(94,200,80,0.1)',
    textAlign: 'center',
  },
  toggleBtn: {
    position: 'fixed',
    bottom: 20,
    left: 8,
    zIndex: 100,
    background: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.2)',
    color: '#5ec850',
    width: 28,
    height: 28,
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: 0,
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 12,
  },
  placeholderTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 28,
    color: '#5ec850',
  },
  placeholderText: {
    fontSize: 16,
    color: '#5a7a50',
  },
};

export default App;
