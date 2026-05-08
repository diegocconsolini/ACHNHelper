'use client';

import { tokens } from '../design/tokens.js';
import { getCharacter, getPortrait } from './index.js';

export default function Greeting({ character, mood, size = 'md', children }) {
  const c = getCharacter(character);
  const portrait = getPortrait(character, mood);
  const dims = size === 'sm' ? 80 : size === 'lg' ? 200 : 130;

  return (
    <div
      role="region"
      aria-label={`${c.name} says`}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: tokens.space[4],
        padding: tokens.space[3],
      }}
    >
      <img
        src={portrait}
        alt={`${c.name}, ${c.role}`}
        loading="lazy"
        decoding="async"
        style={{
          width: dims,
          height: 'auto',
          flexShrink: 0,
        }}
      />
      <div
        style={{
          flex: 1,
          background: 'url(/island/chrome/speech-bubble-paper.webp) center/100% 100% no-repeat',
          padding: '32px 40px',
          minHeight: 96,
          color: tokens.color.ink,
          fontFamily: tokens.font.handwriting,
          fontSize: 'clamp(16px, 1.6vw, 20px)',
          lineHeight: 1.5,
        }}
      >
        {children}
      </div>
    </div>
  );
}
