'use client';

import { tokens } from '../tokens.js';
import PaperPanel from './PaperPanel.jsx';

export default function Card({
  children,
  header,
  footer,
  variant = 'light',
  padding = 16,
  style,
  ...rest
}) {
  return (
    <PaperPanel
      variant={variant}
      padding={0}
      style={{ overflow: 'hidden', ...style }}
      {...rest}
    >
      {header && (
        <div
          style={{
            padding: `${padding}px ${padding}px 8px`,
            fontFamily: tokens.font.display,
            fontSize: 18,
            fontWeight: 700,
            color: tokens.color.ink,
            borderBottom: `1px dashed ${tokens.color.wood}`,
          }}
        >
          {header}
        </div>
      )}
      <div style={{ padding }}>{children}</div>
      {footer && (
        <div
          style={{
            padding: `8px ${padding}px ${padding}px`,
            fontFamily: tokens.font.body,
            fontSize: 13,
            color: tokens.color.inkSoft,
            borderTop: `1px dashed ${tokens.color.wood}`,
          }}
        >
          {footer}
        </div>
      )}
    </PaperPanel>
  );
}
