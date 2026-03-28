'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { SettingsProvider } from './SettingsContext';
import ConfirmModal from './ConfirmModal';

const Dashboard = lazy(() => import('./artifacts/Dashboard.jsx'));
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
const LabelFashionHelper = lazy(() => import('./artifacts/LabelFashionHelper.jsx'));
const GyroidTracker = lazy(() => import('./artifacts/GyroidTracker.jsx'));
const CommunityHub = lazy(() => import('./artifacts/CommunityHub.jsx'));
const MaterialCalculator = lazy(() => import('./artifacts/MaterialCalculator.jsx'));
const PhotoPosterTracker = lazy(() => import('./artifacts/PhotoPosterTracker.jsx'));
const HHACalculator = lazy(() => import('./artifacts/HHACalculator.jsx'));
const Wishlist = lazy(() => import('./artifacts/Wishlist.jsx'));
const CatalogTracker = lazy(() => import('./artifacts/CatalogTracker.jsx'));
const UserProfile = lazy(() => import('./artifacts/UserProfile.jsx'));

const MENU = [
  {
    category: '📊 Dashboard',
    items: [
      { id: 'dashboard', label: 'Available Now', emoji: '🕐', component: 'Dashboard' },
    ],
  },
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
      { id: 'gyroids', label: 'Gyroid Tracker', emoji: '🗿', component: 'GyroidTracker' },
      { id: 'photos', label: 'Photos & Posters', emoji: '📸', component: 'PhotoPosterTracker' },
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
      { id: 'materials', label: 'Material Calculator', emoji: '🧮', component: 'MaterialCalculator' },
      { id: 'wishlist', label: 'Wishlist', emoji: '⭐', component: 'Wishlist' },
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
    category: '📦 Catalog',
    items: [
      { id: 'catalog', label: 'Catalog Tracker', emoji: '📦', component: 'CatalogTracker' },
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
      { id: 'label', label: 'Label Fashion', emoji: '👗', component: 'LabelFashionHelper' },
      { id: 'community', label: 'Community Hub', emoji: '🌐', component: 'CommunityHub' },
      { id: 'hha', label: 'HHA Calculator', emoji: '🏠', component: 'HHACalculator' },
    ],
  },
  {
    category: '⚙️ Settings',
    items: [
      { id: 'profile', label: 'My Profile', emoji: '👤', component: 'UserProfile' },
    ],
  },
];

const COMPONENTS = {
  Dashboard,
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
  LabelFashionHelper,
  GyroidTracker,
  CommunityHub,
  MaterialCalculator,
  PhotoPosterTracker,
  HHACalculator,
  Wishlist,
  CatalogTracker,
  UserProfile,
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
              outline: 'none',
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
  const [activeId, setActiveId] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const { data: session, status } = useSession();

  // Poll sync status every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(window.__syncStatus);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Check admin status
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email) {
      setIsAdminUser(false);
      return;
    }
    fetch('/api/admin/stats')
      .then(res => {
        setIsAdminUser(res.ok);
      })
      .catch(() => setIsAdminUser(false));
  }, [status, session?.user?.email]);

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

        {/* Auth Section */}
        <div style={styles.authSection}>
          {status === 'loading' ? (
            <div style={styles.authLoading}>...</div>
          ) : session ? (
            <div style={styles.authLoggedIn}>
              <div style={styles.authUserRow}>
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    style={styles.authAvatar}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div style={styles.authAvatarFallback}>
                    {(session.user?.name || '?')[0].toUpperCase()}
                  </div>
                )}
                <div style={styles.authUserInfo}>
                  <span style={styles.authUserName}>
                    {session.user?.name || 'Player'}
                  </span>
                  <button
                    onClick={() => setShowSignOutConfirm(true)}
                    style={styles.authSignOutLink}
                  >
                    Sign out
                  </button>
                </div>
              </div>
              {syncStatus === 'synced' && <span style={{ fontSize: 10, color: '#5a7a50', paddingLeft: 42 }}>☁️ Synced</span>}
              {syncStatus === 'syncing' && <span style={{ fontSize: 10, color: '#d4b030', paddingLeft: 42 }}>⟳ Syncing...</span>}
              {syncStatus === 'error' && <span style={{ fontSize: 10, color: '#ff6464', paddingLeft: 42 }}>⚠ Sync error</span>}
              {isAdminUser && (
                <a
                  href="/admin"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 6,
                    marginLeft: 42,
                    padding: '4px 10px',
                    background: 'rgba(212,176,48,0.1)',
                    border: '1px solid rgba(212,176,48,0.25)',
                    borderRadius: 6,
                    color: '#d4b030',
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "'DM Mono', monospace",
                    textDecoration: 'none',
                    width: 'fit-content',
                  }}
                >
                  🛡️ Admin
                </a>
              )}
            </div>
          ) : (
            <div>
              <button
                onClick={() => signIn('google', { callbackUrl: '/app' })}
                style={styles.authSignInBtn}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
              <a
                href="/"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  marginTop: '8px',
                  color: '#5a7a50',
                  fontSize: '12px',
                  textDecoration: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                ← Back to home
              </a>
            </div>
          )}
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
            v{process.env.NEXT_PUBLIC_APP_VERSION} — 32 tools
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
      <ConfirmModal
        open={showSignOutConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          setShowSignOutConfirm(false);
          signOut({ callbackUrl: '/' });
        }}
        onCancel={() => setShowSignOutConfirm(false)}
      />
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
    outline: 'none',
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
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
    outline: 'none',
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
  authSection: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(94,200,80,0.1)',
  },
  authLoading: {
    fontSize: 14,
    color: '#5a7a50',
    textAlign: 'center',
    padding: '4px 0',
    fontFamily: "'DM Mono', monospace",
  },
  authLoggedIn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  authUserRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  authAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '2px solid rgba(94,200,80,0.3)',
    flexShrink: 0,
  },
  authAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '2px solid rgba(94,200,80,0.3)',
    background: 'rgba(94,200,80,0.15)',
    color: '#5ec850',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
    flexShrink: 0,
  },
  authUserInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    overflow: 'hidden',
  },
  authUserName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  authSignOutLink: {
    background: 'none',
    border: 'none',
    color: '#5a7a50',
    fontSize: 11,
    cursor: 'pointer',
    outline: 'none',
    padding: 0,
    fontFamily: "'DM Mono', monospace",
    textAlign: 'left',
  },
  authSignInBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '8px 12px',
    background: 'rgba(94,200,80,0.08)',
    border: '1px solid rgba(94,200,80,0.25)',
    borderRadius: 8,
    color: '#c8e6c0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
    whiteSpace: 'nowrap',
  },
};

export default App;
