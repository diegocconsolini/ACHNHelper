'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Greeting from '../src/characters/Greeting.jsx';
import { tokens } from '../src/design/tokens.js';

function skyForHour(h) {
  // Dawn 5-7: sunset → day; Day 7-17: full day; Sunset 17-20: sunset; Night 20-5: night
  if (h >= 7 && h < 17) {
    return [tokens.color.skyDay, tokens.color.skyDay];
  }
  if (h >= 17 && h < 20) {
    return [tokens.color.skySunset, tokens.color.skyDay];
  }
  if (h >= 5 && h < 7) {
    return [tokens.color.skySunset, tokens.color.skyDay];
  }
  return [tokens.color.skyNight, tokens.color.skySunset];
}

export default function NotFound() {
  const [sky, setSky] = useState([tokens.color.skySunset, tokens.color.skyDay]);

  useEffect(() => {
    setSky(skyForHour(new Date().getHours()));
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${sky[0]} 0%, ${sky[1]} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: tokens.space[6],
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Playfair+Display:wght@700;900&display=swap');
        @keyframes acnhKKStrum {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0.7); }
          40%      { opacity: 1; transform: translateY(-12px) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .acnh-kk-note { animation: none !important; opacity: 0.7 !important; }
        }
      `}</style>
      <div style={{ maxWidth: 720, width: '100%', position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <Greeting character="kk-slider" mood="strumming">
            The page you're looking for hasn't been written yet, dude. I'm
            still composing the song about it. Want to head back home?
          </Greeting>
          <span
            className="acnh-kk-note"
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 30,
              left: 90,
              fontSize: 28,
              animation: 'acnhKKStrum 1.6s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          >
            ♪
          </span>
        </div>
        <div style={{ marginTop: tokens.space[6], textAlign: 'center' }}>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              background: tokens.color.paper,
              color: tokens.color.ink,
              border: `2px solid ${tokens.color.wood}`,
              borderRadius: tokens.radius.pill,
              fontFamily: tokens.font.handwriting,
              fontSize: 18,
              textDecoration: 'none',
              boxShadow: tokens.shadow.paper,
            }}
          >
            Take me back to the island
          </Link>
        </div>
      </div>
    </main>
  );
}
