'use client';

import { tokens } from '../design/tokens.js';
import { getCharacter, getPortrait } from './index.js';

export default function EmptyState({ character = 'isabelle', mood, message }) {
  const c = getCharacter(character);
  const moodToUse = mood || (c.portraits.thinking ? 'thinking' : c.defaultMood);
  const portrait = getPortrait(character, moodToUse);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: tokens.space[3],
        padding: tokens.space[8],
        textAlign: 'center',
      }}
    >
      <img
        src={portrait}
        alt={`${c.name}, ${c.role}`}
        loading="lazy"
        decoding="async"
        style={{ width: 140, height: 'auto', opacity: 0.9 }}
      />
      <div
        style={{
          background: 'url(/island/chrome/speech-bubble-paper.webp) center/100% 100% no-repeat',
          padding: 'clamp(28px, 4vw, 40px) clamp(56px, 11%, 96px)',
          maxWidth: 420,
          color: tokens.color.ink,
          fontFamily: tokens.font.handwriting,
          fontSize: 18,
          lineHeight: 1.5,
        }}
      >
        {message}
      </div>
    </div>
  );
}
