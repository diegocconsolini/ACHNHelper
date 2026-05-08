'use client';

import Greeting from '../characters/Greeting.jsx';
import { tokens } from '../design/tokens.js';

export default function ToolFrame({
  host,
  hostMood,
  background,
  greeting,
  children,
  footer,
}) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100%',
        padding: tokens.space[4],
      }}
    >
      {background && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `url(${background}) center/cover no-repeat`,
            opacity: 0.12,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {greeting && (
          <Greeting character={host} mood={hostMood}>
            {greeting}
          </Greeting>
        )}
        <div style={{ marginTop: greeting ? tokens.space[3] : 0 }}>{children}</div>
        {footer && (
          <div
            style={{
              marginTop: tokens.space[5],
              padding: tokens.space[3],
              background: tokens.color.paper,
              border: `2px solid ${tokens.color.wood}`,
              borderRadius: tokens.radius.md,
              boxShadow: tokens.shadow.paper,
              fontFamily: tokens.font.handwriting,
              color: tokens.color.ink,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
