'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokens } from '../design/tokens.js';
import { hotspots } from './hotspotsData.js';

export default function HeroIsland() {
  const router = useRouter();
  const [hovered, setHovered] = useState(null);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 1400,
        margin: '0 auto',
        aspectRatio: `${hotspots.imageWidth} / ${hotspots.imageHeight}`,
      }}
    >
      <picture>
        <source srcSet="/island/hero.webp" type="image/webp" />
        <img
          src="/island/hero.png"
          alt="Animal Crossing island map with clickable buildings"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'contain',
            borderRadius: 16,
            boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
          }}
        />
      </picture>

      {hotspots.buildings.map((b) => {
        const isHovered = hovered === b.id;
        return (
          <button
            key={b.id}
            onClick={() => router.push(b.route)}
            onMouseEnter={() => setHovered(b.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(b.id)}
            onBlur={() => setHovered(null)}
            aria-label={`Go to ${b.label}`}
            style={{
              position: 'absolute',
              left: `${b.xPct - b.wPct / 2}%`,
              top: `${b.yPct - b.hPct / 2}%`,
              width: `${b.wPct}%`,
              height: `${b.hPct}%`,
              background: isHovered
                ? 'rgba(255, 255, 255, 0.18)'
                : 'transparent',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              outline: 'none',
              transition: 'background 0.2s ease, transform 0.2s ease',
              transform: isHovered ? 'scale(1.04)' : 'scale(1)',
            }}
          />
        );
      })}

      {hovered && (() => {
        const b = hotspots.buildings.find((x) => x.id === hovered);
        if (!b) return null;
        return (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: `${b.xPct}%`,
              top: `${Math.max(0, b.yPct - b.hPct / 2 - 4)}%`,
              transform: 'translate(-50%, -100%)',
              background: tokens.color.paper,
              color: tokens.color.ink,
              fontFamily: tokens.font.handwriting,
              fontSize: 'clamp(14px, 1.4vw, 18px)',
              padding: '6px 14px',
              borderRadius: tokens.radius.pill,
              border: `1.5px solid ${tokens.color.woodDark}`,
              boxShadow: tokens.shadow.paper,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {b.label}
          </div>
        );
      })()}
    </div>
  );
}
