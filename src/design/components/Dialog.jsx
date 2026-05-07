'use client';

import { useEffect } from 'react';
import { tokens } from '../tokens.js';
import PaperPanel from './PaperPanel.jsx';

export default function Dialog({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      data-testid="dialog-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(58, 42, 26, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        data-testid="dialog-body"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 440 }}
      >
        <PaperPanel variant="light" padding={20}>
          {title && (
            <h3
              style={{
                margin: '0 0 12px',
                fontFamily: tokens.font.display,
                fontSize: 22,
                color: tokens.color.ink,
              }}
            >
              {title}
            </h3>
          )}
          <div
            style={{
              fontFamily: tokens.font.body,
              fontSize: 15,
              color: tokens.color.inkSoft,
            }}
          >
            {children}
          </div>
          {footer && (
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                gap: 8,
                justifyContent: 'flex-end',
              }}
            >
              {footer}
            </div>
          )}
        </PaperPanel>
      </div>
    </div>
  );
}
