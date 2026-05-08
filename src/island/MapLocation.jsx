'use client';

import { useState } from 'react';
import { tokens } from '../design/tokens.js';

export default function MapLocation({ location, items, activeId, onSelect }) {
  const [open, setOpen] = useState(false);
  const hasActive = items.some((i) => i.id === activeId);

  return (
    <>
      <button
        type="button"
        aria-label={`${location.label} — ${items.length} tools`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        style={{
          position: 'absolute',
          left: `${location.xPct - location.wPct / 2}%`,
          top: `${location.yPct - location.hPct / 2}%`,
          width: `${location.wPct}%`,
          height: `${location.hPct}%`,
          background: hasActive
            ? 'rgba(94, 200, 80, 0.22)'
            : open
            ? 'rgba(255, 255, 255, 0.18)'
            : 'transparent',
          border: hasActive
            ? `2px solid ${tokens.color.accentLeaf}`
            : '2px solid transparent',
          borderRadius: tokens.radius.md,
          cursor: 'pointer',
          outline: 'none',
          transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
          transform: open ? 'scale(1.04)' : 'scale(1)',
          padding: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: tokens.font.handwriting,
            fontSize: 13,
            color: tokens.color.ink,
            background: open || hasActive ? 'rgba(254, 246, 228, 0.85)' : 'transparent',
            borderRadius: tokens.radius.md,
            transition: 'background 0.2s ease',
            pointerEvents: 'none',
            textShadow: '0 1px 2px rgba(255,255,255,0.6)',
          }}
        >
          {location.label}
        </span>
      </button>

      {open && (
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          style={{
            position: 'absolute',
            left: `${location.xPct + location.wPct / 2 + 1}%`,
            top: `${Math.max(0, location.yPct - 4)}%`,
            transform: 'translate(0, 0)',
            zIndex: 5,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            background: tokens.color.paper,
            border: `2px solid ${tokens.color.wood}`,
            borderRadius: tokens.radius.md,
            padding: '8px 10px',
            boxShadow: tokens.shadow.sign,
            minWidth: 180,
          }}
          role="menu"
          aria-label={`${location.label} tools`}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              aria-current={activeId === item.id ? 'page' : undefined}
              onClick={() => {
                onSelect?.(item.id);
                setOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                background: activeId === item.id ? tokens.color.accentLeaf : 'transparent',
                color: activeId === item.id ? tokens.color.paper : tokens.color.ink,
                border: 'none',
                borderRadius: tokens.radius.sm,
                fontFamily: tokens.font.handwriting,
                fontSize: 15,
                cursor: 'pointer',
                outline: 'none',
                textAlign: 'left',
                transition: 'background-color 0.15s ease, color 0.15s ease',
              }}
            >
              <span aria-hidden="true">{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
