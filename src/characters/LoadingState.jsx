'use client';

import { tokens } from '../design/tokens.js';
import { getCharacter, getPortrait } from './index.js';

const ANIM_STYLE_ID = '__acnh_idle_bob_keyframes';

function ensureKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(ANIM_STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = ANIM_STYLE_ID;
  el.textContent = `
    @keyframes acnhIdleBob {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-4px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .acnh-idle-bob { animation: none !important; }
    }
  `;
  document.head.appendChild(el);
}

export default function LoadingState({ character = 'isabelle', mood, message = 'One moment…' }) {
  const c = getCharacter(character);
  const portrait = getPortrait(character, mood);
  ensureKeyframes();

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: tokens.space[3],
        padding: tokens.space[6],
      }}
    >
      <img
        className="acnh-idle-bob"
        src={portrait}
        alt={`${c.name} is thinking`}
        style={{
          width: 120,
          height: 'auto',
          animation: 'acnhIdleBob 2s ease-in-out infinite',
        }}
      />
      <div
        style={{
          color: tokens.color.inkSoft,
          fontFamily: tokens.font.handwriting,
          fontSize: 18,
        }}
      >
        {message}
      </div>
    </div>
  );
}
