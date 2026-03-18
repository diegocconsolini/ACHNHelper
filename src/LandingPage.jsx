'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { AssetImg } from './assetHelper';

// --- Coverflow sprite data ---
const COVERFLOW_ITEMS = [
  { category: 'villagers', name: 'Raymond' },
  { category: 'fish', name: 'Coelacanth' },
  { category: 'npcs', name: 'Isabelle' },
  { category: 'bugs', name: 'Atlas Moth' },
  { category: 'villagers', name: 'Marshal' },
  { category: 'npcs', name: 'K.K. Slider' },
  { category: 'fish', name: 'Oarfish' },
  { category: 'villagers', name: 'Ankha' },
  { category: 'npcs', name: 'Celeste' },
  { category: 'fish', name: 'Whale Shark' },
  { category: 'villagers', name: 'Bob' },
  { category: 'bugs', name: "Queen Alexandra's Birdwing" },
  { category: 'npcs', name: 'Tom Nook' },
  { category: 'villagers', name: 'Judy' },
  { category: 'fish', name: 'Golden Trout' },
];

// --- Category cards ---
const CATEGORIES = [
  {
    emoji: '\uD83D\uDC1F',
    name: 'Critterpedia',
    tools: ['Fish Tracker', 'Bug Tracker', 'Sea Creature Tracker'],
    sprites: [
      { category: 'fish', name: 'Coelacanth', size: 40 },
      { category: 'bugs', name: 'Atlas Moth', size: 40 },
    ],
  },
  {
    emoji: '\uD83C\uDFDB\uFE0F',
    name: 'Museum & Progress',
    tools: ['Museum Tracker', 'Golden Tools', 'Nook Miles'],
    sprites: [
      { category: 'art', name: 'Great Statue', size: 40 },
    ],
  },
  {
    emoji: '\uD83D\uDCB0',
    name: 'Economy & Planning',
    tools: ['Turnip Tracker', 'Bell Calculator', "Nook's Cranny Log", 'Daily Routine', '5-Star Checker'],
    sprites: [],
  },
  {
    emoji: '\uD83C\uDF38',
    name: 'Gardening',
    tools: ['Flower Calculator', 'Garden Planner', 'Island Flower Map'],
    sprites: [
      { category: 'other', name: 'blue-rose plant', size: 40 },
    ],
  },
  {
    emoji: '\uD83C\uDFA8',
    name: 'Special & Art',
    tools: ['Gulliver Tracker', 'Art Detector', 'K.K. Catalogue'],
    sprites: [
      { category: 'npcs', name: 'K.K. Slider', size: 40 },
    ],
  },
  {
    emoji: '\uD83C\uDFE0',
    name: 'Island Life',
    tools: ['Villager Gift Guide', 'Seasonal Events', 'DIY Recipes', 'Celeste Tracker', 'Dream Address Book'],
    sprites: [
      { category: 'villagers', name: 'Raymond', size: 40 },
    ],
  },
];

// --- Tool highlights ---
const HIGHLIGHTS = [
  {
    title: 'Garden Planner',
    desc: 'Interactive breeding simulator with real Mendelian genetics',
    color: '#5ec850',
    sprite: { category: 'other', name: 'blue-rose plant', size: 48 },
  },
  {
    title: 'DIY Recipe Tracker',
    desc: '781 verified recipes across 28 categories',
    color: '#d4b030',
    sprite: { category: 'npcs', name: 'Tom Nook', size: 48 },
  },
  {
    title: 'Flower Calculator',
    desc: 'Datamined genotypes for all 8 species',
    color: '#4aacf0',
    sprite: { category: 'other', name: 'gold-rose plant', size: 48 },
  },
];

// --- Asset showcase sprites ---
const SHOWCASE_SPRITES = [
  { category: 'villagers', name: 'Raymond' },
  { category: 'villagers', name: 'Ankha' },
  { category: 'villagers', name: 'Marina' },
  { category: 'villagers', name: 'Sherb' },
  { category: 'villagers', name: 'Dom' },
  { category: 'villagers', name: 'Stitches' },
  { category: 'villagers', name: 'Audie' },
  { category: 'fish', name: 'Coelacanth' },
  { category: 'fish', name: 'Oarfish' },
  { category: 'fish', name: 'Bitterling' },
  { category: 'bugs', name: 'Scorpion' },
  { category: 'bugs', name: 'Tarantula' },
  { category: 'npcs', name: 'Isabelle' },
  { category: 'npcs', name: 'Blathers' },
  { category: 'npcs', name: 'Celeste' },
  { category: 'npcs', name: 'Flick' },
  { category: 'npcs', name: 'C.J.' },
  { category: 'art', name: 'Familiar Statue' },
  { category: 'other', name: 'red-rose plant' },
  { category: 'music', name: 'K.K. Bubblegum', imageType: 'Album Image' },
];

export default function LandingPage() {
  const { data: session, status } = useSession();
  const [coverflowIndex, setCoverflowIndex] = useState(0);
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});

  // Auto-rotate coverflow
  useEffect(() => {
    const interval = setInterval(() => {
      setCoverflowIndex(prev => (prev + 1) % COVERFLOW_ITEMS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Intersection observer for fade-in
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({ ...prev, [entry.target.dataset.section]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );

    Object.values(sectionRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const setSectionRef = useCallback((key) => (el) => {
    sectionRefs.current[key] = el;
  }, []);

  const sectionStyle = (key) => ({
    opacity: visibleSections[key] ? 1 : 0,
    transform: visibleSections[key] ? 'translateY(0)' : 'translateY(30px)',
    transition: 'opacity 0.7s ease, transform 0.7s ease',
  });

  const handleSignIn = () => signIn('google', { callbackUrl: '/app' });
  const handleGuest = () => { window.location.href = '/app'; };
  const handleGoToTools = () => { window.location.href = '/app'; };

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      {/* ===== SECTION 1: HERO ===== */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>ACNH Helper Suite</h1>
        <p style={styles.heroSubtitle}>Your complete island companion</p>

        {/* 3D Coverflow */}
        <div style={styles.coverflowContainer}>
          <div style={styles.coverflowTrack}>
            {COVERFLOW_ITEMS.map((item, i) => {
              const offset = ((i - coverflowIndex + COVERFLOW_ITEMS.length) % COVERFLOW_ITEMS.length);
              // Normalize to range [-7, 7]
              const dist = offset > 7 ? offset - COVERFLOW_ITEMS.length : offset;
              const absDist = Math.abs(dist);
              const isVisible = absDist <= 4;

              if (!isVisible) return null;

              const translateX = dist * 90;
              const scale = absDist === 0 ? 1 : Math.max(0.4, 1 - absDist * 0.18);
              const rotateY = dist * -25;
              const zIndex = 10 - absDist;
              const opacity = absDist === 0 ? 1 : Math.max(0.3, 1 - absDist * 0.25);

              return (
                <div
                  key={`${item.category}-${item.name}`}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale}) perspective(800px) rotateY(${rotateY}deg)`,
                    zIndex,
                    opacity,
                    transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    filter: absDist === 0 ? 'drop-shadow(0 0 20px rgba(94,200,80,0.4))' : 'none',
                  }}
                >
                  <AssetImg
                    category={item.category}
                    name={item.name}
                    size={absDist === 0 ? 80 : 56}
                    imageType={item.imageType}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats bar */}
        <div style={styles.statsBar}>
          <span style={styles.stat}>24 tools</span>
          <span style={styles.statDot}>&bull;</span>
          <span style={styles.stat}>781 recipes</span>
          <span style={styles.statDot}>&bull;</span>
          <span style={styles.stat}>21,626 sprites</span>
        </div>

        {/* CTA buttons */}
        <div style={styles.ctaRow}>
          {status === 'authenticated' ? (
            <button onClick={handleGoToTools} style={styles.ctaPrimary}>
              Go to my tools &rarr;
            </button>
          ) : (
            <>
              <button onClick={handleSignIn} style={styles.ctaPrimary}>
                Sign in with Google
              </button>
              <button onClick={handleGuest} style={styles.ctaSecondary}>
                Try as Guest
              </button>
            </>
          )}
        </div>
      </section>

      {/* ===== SECTION 2: FEATURE GRID ===== */}
      <section
        ref={setSectionRef('features')}
        data-section="features"
        style={{ ...styles.section, ...sectionStyle('features') }}
      >
        <h2 style={styles.sectionTitle}>Everything you need</h2>
        <p style={styles.sectionSubtitle}>24 specialized tools across 6 categories</p>
        <div style={styles.featureGrid}>
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              onClick={handleGuest}
              style={styles.featureCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(94,200,80,0.4)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(94,200,80,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={styles.featureCardHeader}>
                <span style={{ fontSize: '28px' }}>{cat.emoji}</span>
                <span style={styles.featureCardName}>{cat.name}</span>
              </div>
              <div style={styles.featureCardSprites}>
                {cat.sprites.map((s) => (
                  <AssetImg key={s.name} category={s.category} name={s.name} size={s.size} />
                ))}
              </div>
              <ul style={styles.featureCardTools}>
                {cat.tools.map((t) => (
                  <li key={t} style={styles.featureCardTool}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SECTION 3: TOOL HIGHLIGHTS ===== */}
      <section
        ref={setSectionRef('highlights')}
        data-section="highlights"
        style={{ ...styles.section, ...sectionStyle('highlights') }}
      >
        <h2 style={styles.sectionTitle}>Powered by real game data</h2>
        <p style={styles.sectionSubtitle}>Every value datamined and community-verified</p>
        <div style={styles.highlightGrid}>
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.title}
              style={{ ...styles.highlightCard, borderTop: `3px solid ${h.color}` }}
            >
              <div style={styles.highlightSpriteRow}>
                <AssetImg category={h.sprite.category} name={h.sprite.name} size={h.sprite.size} />
              </div>
              <h3 style={{ ...styles.highlightTitle, color: h.color }}>{h.title}</h3>
              <p style={styles.highlightDesc}>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SECTION 4: ASSET SHOWCASE ===== */}
      <section
        ref={setSectionRef('showcase')}
        data-section="showcase"
        style={{ ...styles.section, ...sectionStyle('showcase') }}
      >
        <h2 style={styles.sectionTitle}>21,626 datamined game sprites</h2>
        <p style={styles.sectionSubtitle}>Real in-game artwork for every item, villager, and critter</p>
        <div style={styles.showcaseGrid}>
          {SHOWCASE_SPRITES.map((s) => (
            <div key={`${s.category}-${s.name}`} style={styles.showcaseItem}>
              <AssetImg
                category={s.category}
                name={s.name}
                size={56}
                imageType={s.imageType}
              />
              <span style={styles.showcaseLabel}>{s.name}</span>
            </div>
          ))}
        </div>
        <div style={styles.showcaseFadeLeft} />
        <div style={styles.showcaseFadeRight} />
      </section>

      {/* ===== SECTION 5: LOGIN/SYNC ===== */}
      <section
        ref={setSectionRef('sync')}
        data-section="sync"
        style={{ ...styles.section, ...sectionStyle('sync') }}
      >
        <div style={styles.syncContainer}>
          <div style={styles.syncText}>
            <h2 style={styles.sectionTitle}>Never lose your island progress</h2>
            <ul style={styles.syncList}>
              <li style={styles.syncItem}>Sync your data across devices</li>
              <li style={styles.syncItem}>Save your island profile</li>
              <li style={styles.syncItem}>Track museum completion</li>
            </ul>
            <p style={styles.syncNote}>Works great without login too</p>
            {status !== 'authenticated' && (
              <button onClick={handleSignIn} style={{ ...styles.ctaPrimary, marginTop: '16px' }}>
                Sign in with Google
              </button>
            )}
          </div>
          <div style={styles.syncSprite}>
            <AssetImg category="npcs" name="Isabelle" size={96} />
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: FOOTER ===== */}
      <footer style={styles.footer}>
        <p style={styles.footerVersion}>
          ACNH Helper Suite v{process.env.NEXT_PUBLIC_APP_VERSION}
        </p>
        <div style={styles.footerLinks}>
          <a
            href="https://github.com/diegocavalariconsolini/acnh-portal"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.footerLink}
          >
            Open Source
          </a>
          <span style={styles.footerDot}>&bull;</span>
          <span style={styles.footerLink}>Game data from Nookipedia</span>
          <span style={styles.footerDot}>&bull;</span>
          <span style={styles.footerLink}>Not affiliated with Nintendo</span>
        </div>
      </footer>
    </div>
  );
}

// ======================== STYLES ========================

const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    backgroundColor: '#0a1a10',
    color: '#c8e6c0',
    minHeight: '100vh',
    overflowX: 'hidden',
  },

  // --- Hero ---
  hero: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px 40px',
    textAlign: 'center',
    position: 'relative',
    background: 'radial-gradient(ellipse at 50% 30%, rgba(94,200,80,0.06) 0%, transparent 70%)',
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
    fontWeight: 900,
    color: '#5ec850',
    margin: '0 0 12px',
    letterSpacing: '-0.02em',
  },
  heroSubtitle: {
    fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
    color: '#c8e6c0',
    margin: '0 0 48px',
    fontWeight: 400,
    opacity: 0.85,
  },

  // --- Coverflow ---
  coverflowContainer: {
    width: '100%',
    maxWidth: '700px',
    height: '120px',
    position: 'relative',
    marginBottom: '40px',
    perspective: '1000px',
  },
  coverflowTrack: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },

  // --- Stats ---
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '36px',
    flexWrap: 'wrap',
  },
  stat: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.95rem',
    color: '#d4b030',
    fontWeight: 500,
  },
  statDot: {
    color: '#5a7a50',
    fontSize: '0.8rem',
  },

  // --- CTAs ---
  ctaRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ctaPrimary: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '1rem',
    fontWeight: 700,
    padding: '14px 32px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#5ec850',
    color: '#0a1a10',
    cursor: 'pointer',
    outline: 'none',

    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  ctaSecondary: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '1rem',
    fontWeight: 500,
    padding: '14px 32px',
    borderRadius: '8px',
    border: '1px solid rgba(94,200,80,0.3)',
    backgroundColor: 'transparent',
    color: '#c8e6c0',
    cursor: 'pointer',
    outline: 'none',

    transition: 'transform 0.2s, border-color 0.2s',
  },

  // --- Section shared ---
  section: {
    padding: '80px 24px',
    maxWidth: '1100px',
    margin: '0 auto',
    position: 'relative',
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
    fontWeight: 700,
    color: '#c8e6c0',
    textAlign: 'center',
    margin: '0 0 8px',
  },
  sectionSubtitle: {
    fontSize: '1rem',
    color: '#5a7a50',
    textAlign: 'center',
    margin: '0 0 40px',
    fontWeight: 400,
  },

  // --- Feature Grid ---
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  featureCard: {
    backgroundColor: 'rgba(12,28,14,0.95)',
    border: '1px solid rgba(94,200,80,0.1)',
    borderRadius: '12px',
    padding: '24px',
    cursor: 'pointer',
    outline: 'none',

    transition: 'border-color 0.3s, transform 0.3s',
  },
  featureCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  featureCardName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#5ec850',
  },
  featureCardSprites: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
    minHeight: '40px',
    alignItems: 'center',
  },
  featureCardTools: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  featureCardTool: {
    fontSize: '0.9rem',
    color: '#c8e6c0',
    padding: '3px 0',
    opacity: 0.8,
  },

  // --- Highlights ---
  highlightGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  highlightCard: {
    backgroundColor: 'rgba(12,28,14,0.95)',
    borderRadius: '12px',
    padding: '28px 24px',
    textAlign: 'center',
  },
  highlightSpriteRow: {
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'center',
  },
  highlightTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.3rem',
    fontWeight: 700,
    margin: '0 0 8px',
  },
  highlightDesc: {
    fontSize: '0.95rem',
    color: '#c8e6c0',
    opacity: 0.8,
    margin: 0,
    lineHeight: 1.5,
  },

  // --- Showcase ---
  showcaseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '16px',
    position: 'relative',
  },
  showcaseItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  showcaseLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.7rem',
    color: '#5a7a50',
    textAlign: 'center',
    lineHeight: 1.2,
  },
  showcaseFadeLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '40px',
    background: 'linear-gradient(to right, #0a1a10, transparent)',
    pointerEvents: 'none',
  },
  showcaseFadeRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '40px',
    background: 'linear-gradient(to left, #0a1a10, transparent)',
    pointerEvents: 'none',
  },

  // --- Sync ---
  syncContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '48px',
    flexWrap: 'wrap',
  },
  syncText: {
    flex: '1 1 300px',
    maxWidth: '500px',
  },
  syncList: {
    listStyle: 'none',
    padding: 0,
    margin: '24px 0 16px',
  },
  syncItem: {
    fontSize: '1rem',
    color: '#c8e6c0',
    padding: '6px 0',
    paddingLeft: '20px',
    position: 'relative',
  },
  syncNote: {
    fontSize: '0.9rem',
    color: '#4aacf0',
    fontWeight: 500,
    margin: '8px 0 0',
  },
  syncSprite: {
    flex: '0 0 auto',
    animation: 'float 3s ease-in-out infinite',
  },

  // --- Footer ---
  footer: {
    padding: '40px 24px',
    textAlign: 'center',
    borderTop: '1px solid rgba(94,200,80,0.08)',
  },
  footerVersion: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.85rem',
    color: '#5a7a50',
    margin: '0 0 12px',
  },
  footerLinks: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  footerLink: {
    fontSize: '0.85rem',
    color: '#5a7a50',
    textDecoration: 'none',
  },
  footerDot: {
    color: '#5a7a50',
    fontSize: '0.6rem',
  },
};
