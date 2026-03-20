'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { AssetImg } from '../../src/assetHelper';

const FRUITS = ['apple', 'cherry', 'orange', 'peach', 'pear'];
const FLOWERS = ['cosmos', 'hyacinth', 'lily', 'mum', 'pansy', 'rose', 'tulip', 'windflower'];
const THEME_TAGS = [
  'cottagecore', 'urban', 'japanese', 'fairy', 'natural', 'spooky',
  'tropical', 'medieval', 'retro', 'kidcore', 'academia', 'space',
];
const LOOKING_FOR = ['friends', 'trading', 'cataloging', 'co-op', 'inspiration', 'tours'];
const PER_PAGE = 20;

function timeAgo(dateStr) {
  if (!dateStr) return 'Unknown';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function CommunityPage() {
  const { data: session } = useSession();

  const [profiles, setProfiles] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [hemisphere, setHemisphere] = useState('all');
  const [fruit, setFruit] = useState('all');
  const [flower, setFlower] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLookingFor, setSelectedLookingFor] = useState([]);
  const [search, setSearch] = useState('');

  // Favorites (local set for instant UI updates)
  const [favorites, setFavorites] = useState(new Set());

  // Hover states
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredFav, setHoveredFav] = useState(null);
  const [hoveredPill, setHoveredPill] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredPageBtn, setHoveredPageBtn] = useState(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (hemisphere !== 'all') params.set('hemisphere', hemisphere);
      if (fruit !== 'all') params.set('fruit', fruit);
      if (flower !== 'all') params.set('flower', flower);
      if (selectedTags.length === 1) params.set('tag', selectedTags[0]);
      if (selectedLookingFor.length === 1) params.set('lookingFor', selectedLookingFor[0]);
      params.set('page', String(page));
      params.set('limit', String(PER_PAGE));

      const res = await fetch(`/api/community?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProfiles(data.profiles || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);

      // Sync favorites from API response
      const favSet = new Set();
      (data.profiles || []).forEach(p => {
        if (p.is_favorited) favSet.add(p.user_id);
      });
      setFavorites(prev => {
        const merged = new Set(prev);
        favSet.forEach(id => merged.add(id));
        // Remove un-favorited from current page
        (data.profiles || []).forEach(p => {
          if (!p.is_favorited) merged.delete(p.user_id);
        });
        return merged;
      });
    } catch {
      setProfiles([]);
      setTotal(0);
      setTotalPages(0);
    }
    setLoading(false);
  }, [hemisphere, fruit, flower, selectedTags, selectedLookingFor, page]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [hemisphere, fruit, flower, selectedTags, selectedLookingFor]);

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleLookingFor = (item) => {
    setSelectedLookingFor(prev =>
      prev.includes(item) ? prev.filter(t => t !== item) : [...prev, item]
    );
  };

  const toggleFavorite = async (userId) => {
    if (!session) return;
    const isFav = favorites.has(userId);

    // Optimistic update
    setFavorites(prev => {
      const next = new Set(prev);
      if (isFav) next.delete(userId);
      else next.add(userId);
      return next;
    });

    try {
      await fetch(`/api/community/favorite/${userId}`, {
        method: isFav ? 'DELETE' : 'POST',
      });
    } catch {
      // Revert on error
      setFavorites(prev => {
        const next = new Set(prev);
        if (isFav) next.add(userId);
        else next.delete(userId);
        return next;
      });
    }
  };

  // Client-side search filter (island name)
  const filtered = search.trim()
    ? profiles.filter(p =>
        p.island_name?.toLowerCase().includes(search.trim().toLowerCase())
      )
    : profiles;

  // Multi-tag client-side filter (API only supports single tag)
  const displayed = filtered.filter(p => {
    if (selectedTags.length > 1) {
      if (!selectedTags.every(t => (p.theme_tags || []).includes(t))) return false;
    }
    if (selectedLookingFor.length > 1) {
      if (!selectedLookingFor.every(t => (p.looking_for || []).includes(t))) return false;
    }
    return true;
  });

  const from = (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::selection { background: rgba(94,200,80,0.3); color: #fff; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Navigation */}
      <div style={styles.nav}>
        <a
          href="/"
          style={{
            ...styles.navLink,
            ...(hoveredNav === 'home' ? styles.navLinkHover : {}),
          }}
          onMouseEnter={() => setHoveredNav('home')}
          onMouseLeave={() => setHoveredNav(null)}
        >
          Home
        </a>
        <span style={styles.navSep}>/</span>
        <a
          href="/app"
          style={{
            ...styles.navLink,
            ...(hoveredNav === 'portal' ? styles.navLinkHover : {}),
          }}
          onMouseEnter={() => setHoveredNav('portal')}
          onMouseLeave={() => setHoveredNav(null)}
        >
          Portal
        </a>
        <span style={styles.navSep}>/</span>
        <span style={styles.navCurrent}>Community</span>
      </div>

      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>Community Directory</h1>
        <p style={styles.subtitle}>Find friends, explore islands, share your dream address</p>
        <div style={styles.statsBar}>
          <span style={styles.statBadge}>
            {total} published profile{total !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        {/* Hemisphere */}
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Hemisphere</span>
          <div style={styles.filterRow}>
            {['all', 'north', 'south'].map(h => (
              <button
                key={h}
                onClick={() => setHemisphere(h)}
                style={{
                  ...styles.filterBtn,
                  ...(hemisphere === h ? styles.filterBtnActive : {}),
                  ...(hoveredPill === `hem-${h}` && hemisphere !== h ? styles.filterBtnHover : {}),
                }}
                onMouseEnter={() => setHoveredPill(`hem-${h}`)}
                onMouseLeave={() => setHoveredPill(null)}
              >
                {h === 'all' ? 'All' : h === 'north' ? 'North' : 'South'}
              </button>
            ))}
          </div>
        </div>

        {/* Native Fruit */}
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Native Fruit</span>
          <div style={styles.filterRow}>
            <button
              onClick={() => setFruit('all')}
              style={{
                ...styles.filterBtn,
                ...(fruit === 'all' ? styles.filterBtnActive : {}),
                ...(hoveredPill === 'fruit-all' && fruit !== 'all' ? styles.filterBtnHover : {}),
              }}
              onMouseEnter={() => setHoveredPill('fruit-all')}
              onMouseLeave={() => setHoveredPill(null)}
            >
              All
            </button>
            {FRUITS.map(f => (
              <button
                key={f}
                onClick={() => setFruit(f)}
                style={{
                  ...styles.filterBtn,
                  ...(fruit === f ? styles.filterBtnActive : {}),
                  ...(hoveredPill === `fruit-${f}` && fruit !== f ? styles.filterBtnHover : {}),
                }}
                onMouseEnter={() => setHoveredPill(`fruit-${f}`)}
                onMouseLeave={() => setHoveredPill(null)}
              >
                <AssetImg category="other" name={f} size={18} fallback="" style={{ marginRight: 4, verticalAlign: 'middle' }} />
                <span style={{ verticalAlign: 'middle' }}>{f.charAt(0).toUpperCase() + f.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Native Flower */}
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Native Flower</span>
          <div style={styles.filterRow}>
            <button
              onClick={() => setFlower('all')}
              style={{
                ...styles.filterBtn,
                ...(flower === 'all' ? styles.filterBtnActive : {}),
                ...(hoveredPill === 'flower-all' && flower !== 'all' ? styles.filterBtnHover : {}),
              }}
              onMouseEnter={() => setHoveredPill('flower-all')}
              onMouseLeave={() => setHoveredPill(null)}
            >
              All
            </button>
            {FLOWERS.map(f => (
              <button
                key={f}
                onClick={() => setFlower(f)}
                style={{
                  ...styles.filterBtn,
                  ...(flower === f ? styles.filterBtnActive : {}),
                  ...(hoveredPill === `flower-${f}` && flower !== f ? styles.filterBtnHover : {}),
                }}
                onMouseEnter={() => setHoveredPill(`flower-${f}`)}
                onMouseLeave={() => setHoveredPill(null)}
              >
                <span style={{ verticalAlign: 'middle' }}>{f.charAt(0).toUpperCase() + f.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Tags */}
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Theme</span>
          <div style={styles.filterRow}>
            {THEME_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  ...styles.tagPill,
                  ...(selectedTags.includes(tag) ? styles.tagPillActive : {}),
                  ...(hoveredPill === `tag-${tag}` && !selectedTags.includes(tag) ? styles.tagPillHover : {}),
                }}
                onMouseEnter={() => setHoveredPill(`tag-${tag}`)}
                onMouseLeave={() => setHoveredPill(null)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Looking For */}
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Looking For</span>
          <div style={styles.filterRow}>
            {LOOKING_FOR.map(item => (
              <button
                key={item}
                onClick={() => toggleLookingFor(item)}
                style={{
                  ...styles.tagPill,
                  ...(selectedLookingFor.includes(item) ? styles.lookingForPillActive : {}),
                  ...(hoveredPill === `lf-${item}` && !selectedLookingFor.includes(item) ? styles.tagPillHover : {}),
                }}
                onMouseEnter={() => setHoveredPill(`lf-${item}`)}
                onMouseLeave={() => setHoveredPill(null)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Search Island</span>
          <input
            type="text"
            placeholder="Search by island name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={styles.loadingWrap}>
          <div style={styles.loadingText}>Loading profiles...</div>
        </div>
      ) : displayed.length === 0 ? (
        <div style={styles.emptyWrap}>
          <div style={styles.emptyIcon}>🏝️</div>
          <h2 style={styles.emptyTitle}>No profiles found</h2>
          <p style={styles.emptyText}>
            {search || selectedTags.length > 0 || selectedLookingFor.length > 0
              ? 'Try adjusting your filters or search query.'
              : 'Be the first to share your island!'}
          </p>
          <a
            href="/app"
            style={{
              ...styles.emptyLink,
              ...(hoveredNav === 'empty-portal' ? { backgroundColor: 'rgba(94,200,80,0.2)' } : {}),
            }}
            onMouseEnter={() => setHoveredNav('empty-portal')}
            onMouseLeave={() => setHoveredNav(null)}
          >
            Open Portal to set up your profile
          </a>
        </div>
      ) : (
        <>
          {/* Profile Grid */}
          <div style={styles.grid}>
            {displayed.map((profile, idx) => (
              <div
                key={profile.user_id}
                style={{
                  ...styles.card,
                  ...(hoveredCard === profile.user_id ? styles.cardHover : {}),
                  animation: `fadeIn 0.3s ease ${idx * 0.03}s both`,
                }}
                onMouseEnter={() => setHoveredCard(profile.user_id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Card Header */}
                <div style={styles.cardHeader}>
                  <div style={styles.cardTitleRow}>
                    <h3 style={styles.cardTitle}>
                      {profile.island_name || 'Unnamed Island'}
                    </h3>
                    {session && (
                      <button
                        onClick={() => toggleFavorite(profile.user_id)}
                        style={{
                          ...styles.favBtn,
                          color: favorites.has(profile.user_id) ? '#e74c3c' : '#5a7a50',
                          ...(hoveredFav === profile.user_id ? { transform: 'scale(1.2)' } : {}),
                        }}
                        onMouseEnter={() => setHoveredFav(profile.user_id)}
                        onMouseLeave={() => setHoveredFav(null)}
                        title={favorites.has(profile.user_id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {favorites.has(profile.user_id) ? '♥' : '♡'}
                      </button>
                    )}
                  </div>

                  {/* Hemisphere badge */}
                  {profile.hemisphere && (
                    <span style={{
                      ...styles.hemBadge,
                      backgroundColor: profile.hemisphere === 'north'
                        ? 'rgba(94,200,80,0.15)' : 'rgba(74,172,240,0.15)',
                      color: profile.hemisphere === 'north' ? '#5ec850' : '#4aacf0',
                    }}>
                      {profile.hemisphere === 'north' ? '🌸 North' : '❄️ South'}
                    </span>
                  )}
                </div>

                {/* Island Details */}
                <div style={styles.cardDetails}>
                  {/* Fruit + Flower row */}
                  <div style={styles.detailRow}>
                    {profile.native_fruit && (
                      <div style={styles.detailItem}>
                        <AssetImg category="other" name={profile.native_fruit} size={22} fallback="🍎" />
                        <span style={styles.detailText}>
                          {profile.native_fruit.charAt(0).toUpperCase() + profile.native_fruit.slice(1)}
                        </span>
                      </div>
                    )}
                    {profile.native_flower && (
                      <div style={styles.detailItem}>
                        <span style={styles.detailText}>
                          🌺 {profile.native_flower.charAt(0).toUpperCase() + profile.native_flower.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  {profile.island_rating && (
                    <div style={styles.ratingRow}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <span key={s} style={{
                          color: s <= profile.island_rating ? '#d4b030' : '#2a3a20',
                          fontSize: 14,
                        }}>★</span>
                      ))}
                    </div>
                  )}

                  {/* Dream Address */}
                  {profile.dream_address && (
                    <div style={styles.codeRow}>
                      <span style={styles.codeLabel}>Dream</span>
                      <span style={styles.codeValue}>{profile.dream_address}</span>
                    </div>
                  )}

                  {/* Friend Code */}
                  <div style={styles.codeRow}>
                    <span style={styles.codeLabel}>Friend Code</span>
                    {session ? (
                      profile.friend_code ? (
                        <span style={styles.codeValue}>{profile.friend_code}</span>
                      ) : (
                        <span style={styles.noCode}>Not shared</span>
                      )
                    ) : (
                      <span style={styles.loginPrompt}>🔒 Sign in to see</span>
                    )}
                  </div>
                </div>

                {/* Screenshot thumbnail */}
                {profile.screenshots?.length > 0 && (
                  <div style={styles.screenshotRow}>
                    <img
                      src={profile.screenshots[0]}
                      alt={`${profile.island_name || 'Island'} screenshot`}
                      style={styles.cardScreenshot}
                    />
                    {profile.screenshots.length > 1 && (
                      <span style={styles.photoBadge}>
                        +{profile.screenshots.length - 1} more
                      </span>
                    )}
                  </div>
                )}

                {/* Bio */}
                {profile.bio && (
                  <p style={styles.bio}>{profile.bio}</p>
                )}

                {/* Tags */}
                {(profile.theme_tags?.length > 0 || profile.looking_for?.length > 0) && (
                  <div style={styles.tagsWrap}>
                    {(profile.theme_tags || []).map(tag => (
                      <span key={tag} style={styles.cardTag}>{tag}</span>
                    ))}
                    {(profile.looking_for || []).map(item => (
                      <span key={item} style={styles.cardLookingFor}>{item}</span>
                    ))}
                  </div>
                )}

                {/* Last Active */}
                <div style={styles.lastActive}>
                  Active {timeAgo(profile.last_active)}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <span style={styles.pageInfo}>
                Showing {from}–{to} of {total} profile{total !== 1 ? 's' : ''}
              </span>
              <div style={styles.pageButtons}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    ...styles.pageBtn,
                    ...(page === 1 ? styles.pageBtnDisabled : {}),
                    ...(hoveredPageBtn === 'prev' && page !== 1 ? styles.pageBtnHover : {}),
                  }}
                  onMouseEnter={() => setHoveredPageBtn('prev')}
                  onMouseLeave={() => setHoveredPageBtn(null)}
                >
                  Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      style={{
                        ...styles.pageBtn,
                        ...(page === pageNum ? styles.pageBtnActive : {}),
                        ...(hoveredPageBtn === pageNum && page !== pageNum ? styles.pageBtnHover : {}),
                      }}
                      onMouseEnter={() => setHoveredPageBtn(pageNum)}
                      onMouseLeave={() => setHoveredPageBtn(null)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    ...styles.pageBtn,
                    ...(page === totalPages ? styles.pageBtnDisabled : {}),
                    ...(hoveredPageBtn === 'next' && page !== totalPages ? styles.pageBtnHover : {}),
                  }}
                  onMouseEnter={() => setHoveredPageBtn('next')}
                  onMouseLeave={() => setHoveredPageBtn(null)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  page: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#0a1a10',
    padding: '24px 32px 64px',
    fontFamily: "'DM Sans', sans-serif",
    color: '#c8e6c0',
  },
  nav: {
    marginBottom: 24,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
  },
  navLink: {
    color: '#5ec850',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  navLinkHover: {
    color: '#8ef880',
  },
  navSep: {
    color: '#5a7a50',
    margin: '0 8px',
  },
  navCurrent: {
    color: '#5a7a50',
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 900,
    fontSize: 42,
    color: '#5ec850',
    margin: '0 0 8px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 16,
    color: '#5a7a50',
    margin: '0 0 16px',
    fontWeight: 400,
  },
  statsBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
  },
  statBadge: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    color: '#d4b030',
    backgroundColor: 'rgba(212,176,48,0.1)',
    border: '1px solid rgba(212,176,48,0.2)',
    borderRadius: 6,
    padding: '4px 12px',
  },
  filterBar: {
    backgroundColor: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.15)',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 28,
  },
  filterGroup: {
    marginBottom: 14,
  },
  filterLabel: {
    display: 'block',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    fontWeight: 700,
    color: '#5a7a50',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 8,
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 14px',
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    color: '#c8e6c0',
    backgroundColor: 'rgba(94,200,80,0.06)',
    border: '1px solid rgba(94,200,80,0.15)',
    borderRadius: 20,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s, border-color 0.2s',
  },
  filterBtnActive: {
    backgroundColor: 'rgba(94,200,80,0.2)',
    borderColor: '#5ec850',
    color: '#5ec850',
  },
  filterBtnHover: {
    backgroundColor: 'rgba(94,200,80,0.12)',
    borderColor: 'rgba(94,200,80,0.3)',
  },
  tagPill: {
    padding: '5px 12px',
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    color: '#c8e6c0',
    backgroundColor: 'rgba(94,200,80,0.06)',
    border: '1px solid rgba(94,200,80,0.12)',
    borderRadius: 14,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s, border-color 0.2s',
  },
  tagPillActive: {
    backgroundColor: 'rgba(94,200,80,0.2)',
    borderColor: '#5ec850',
    color: '#5ec850',
  },
  tagPillHover: {
    backgroundColor: 'rgba(94,200,80,0.12)',
  },
  lookingForPillActive: {
    backgroundColor: 'rgba(74,172,240,0.2)',
    borderColor: '#4aacf0',
    color: '#4aacf0',
  },
  searchInput: {
    width: '100%',
    maxWidth: 360,
    padding: '8px 14px',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    color: '#c8e6c0',
    backgroundColor: 'rgba(10,26,16,0.6)',
    border: '1px solid rgba(94,200,80,0.2)',
    borderRadius: 8,
    outline: 'none',
  },
  loadingWrap: {
    textAlign: 'center',
    padding: '80px 0',
  },
  loadingText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 16,
    color: '#5a7a50',
  },
  emptyWrap: {
    textAlign: 'center',
    padding: '80px 0',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: 24,
    color: '#c8e6c0',
    margin: '0 0 8px',
  },
  emptyText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: '#5a7a50',
    margin: '0 0 20px',
  },
  emptyLink: {
    display: 'inline-block',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    color: '#5ec850',
    textDecoration: 'none',
    padding: '10px 20px',
    border: '1px solid rgba(94,200,80,0.3)',
    borderRadius: 8,
    transition: 'background-color 0.2s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 20,
  },
  card: {
    backgroundColor: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.2)',
    borderRadius: 14,
    padding: '20px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  cardHover: {
    borderColor: 'rgba(94,200,80,0.4)',
    boxShadow: '0 0 20px rgba(94,200,80,0.08)',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  cardTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    fontSize: 20,
    color: '#c8e6c0',
    margin: 0,
  },
  favBtn: {
    background: 'none',
    border: 'none',
    fontSize: 22,
    cursor: 'pointer',
    outline: 'none',
    padding: '2px 4px',
    transition: 'transform 0.15s, color 0.2s',
    lineHeight: 1,
  },
  hemBadge: {
    display: 'inline-block',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: '#c8e6c0',
  },
  ratingRow: {
    display: 'flex',
    gap: 2,
  },
  codeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  codeLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    color: '#5a7a50',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    minWidth: 80,
  },
  codeValue: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 13,
    color: '#4aacf0',
  },
  noCode: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    color: '#5a7a50',
    fontStyle: 'italic',
  },
  loginPrompt: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    color: '#d4b030',
  },
  screenshotRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  cardScreenshot: {
    width: '100%',
    maxWidth: 280,
    height: 80,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid rgba(94,200,80,0.15)',
  },
  photoBadge: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    color: '#d4b030',
    backgroundColor: 'rgba(212,176,48,0.1)',
    border: '1px solid rgba(212,176,48,0.2)',
    borderRadius: 10,
    padding: '2px 8px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  bio: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: '#a0c098',
    lineHeight: 1.5,
    margin: 0,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
  },
  tagsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 5,
  },
  cardTag: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 10,
    fontWeight: 600,
    color: '#5ec850',
    backgroundColor: 'rgba(94,200,80,0.1)',
    border: '1px solid rgba(94,200,80,0.15)',
    borderRadius: 10,
    padding: '2px 8px',
  },
  cardLookingFor: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 10,
    fontWeight: 600,
    color: '#4aacf0',
    backgroundColor: 'rgba(74,172,240,0.1)',
    border: '1px solid rgba(74,172,240,0.15)',
    borderRadius: 10,
    padding: '2px 8px',
  },
  lastActive: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    color: '#5a7a50',
    marginTop: 'auto',
  },
  pagination: {
    marginTop: 32,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  pageInfo: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 12,
    color: '#5a7a50',
  },
  pageButtons: {
    display: 'flex',
    gap: 6,
  },
  pageBtn: {
    padding: '6px 12px',
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    color: '#c8e6c0',
    backgroundColor: 'rgba(94,200,80,0.06)',
    border: '1px solid rgba(94,200,80,0.15)',
    borderRadius: 6,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s, border-color 0.2s',
  },
  pageBtnActive: {
    backgroundColor: 'rgba(94,200,80,0.2)',
    borderColor: '#5ec850',
    color: '#5ec850',
  },
  pageBtnHover: {
    backgroundColor: 'rgba(94,200,80,0.12)',
  },
  pageBtnDisabled: {
    color: '#2a3a20',
    cursor: 'default',
    borderColor: 'rgba(94,200,80,0.05)',
  },
};
