'use client';

import { useState } from 'react';
import { tokens } from '../design/tokens.js';
import { getCharacter, getPortrait } from './index.js';

export default function HostFloatingTip({ character, mood, trigger, message }) {
  const [open, setOpen] = useState(false);
  const c = getCharacter(character);
  const portrait = getPortrait(character, mood);

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label={`${c.name} has a tip about ${typeof trigger === 'string' ? trigger : 'this'}`}
        style={{
          background: 'none',
          border: `1px dashed ${tokens.color.wood}`,
          borderRadius: tokens.radius.sm,
          color: tokens.color.ink,
          fontFamily: tokens.font.handwriting,
          fontSize: 14,
          padding: '2px 8px',
          cursor: 'help',
          outline: 'none',
        }}
      >
        {trigger}
      </button>
      {open && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            marginTop: 6,
            padding: 10,
            background: tokens.color.paper,
            border: `2px solid ${tokens.color.wood}`,
            borderRadius: tokens.radius.md,
            boxShadow: tokens.shadow.sign,
            minWidth: 220,
            maxWidth: 320,
          }}
        >
          <img
            src={portrait}
            alt={c.name}
            loading="lazy"
            decoding="async"
            style={{ width: 40, height: 'auto', flexShrink: 0 }}
          />
          <div
            style={{
              fontFamily: tokens.font.handwriting,
              fontSize: 14,
              color: tokens.color.ink,
              lineHeight: 1.4,
            }}
          >
            {message}
          </div>
        </div>
      )}
    </span>
  );
}
