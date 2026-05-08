'use client';

import Dialog from './Dialog.jsx';
import Button from './Button.jsx';
import { tokens } from '../tokens.js';
import { getCharacter, getPortrait } from '../../characters/index.js';

export default function SpeechDialog({
  open,
  onClose,
  character = 'isabelle',
  mood,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = false,
}) {
  if (!open) return null;
  const c = getCharacter(character);
  const portrait = getPortrait(character, mood);

  return (
    <Dialog open={open} onClose={onClose}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.space[3],
          marginBottom: tokens.space[4],
        }}
      >
        <img
          src={portrait}
          alt={c.name}
          style={{ width: 72, height: 'auto', flexShrink: 0 }}
        />
        <div
          style={{
            fontFamily: tokens.font.display,
            fontSize: 22,
            color: tokens.color.ink,
          }}
        >
          {c.name}
        </div>
      </div>
      <div
        style={{
          background: 'url(/island/chrome/speech-bubble-paper.webp) center/100% 100% no-repeat',
          padding: '24px 32px',
          minHeight: 80,
          fontFamily: tokens.font.handwriting,
          fontSize: 18,
          lineHeight: 1.5,
          color: tokens.color.ink,
          marginBottom: tokens.space[4],
        }}
      >
        {message}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: tokens.space[2] }}>
        {cancelLabel && (
          <Button variant="ghost" onClick={onCancel ?? onClose}>
            {cancelLabel}
          </Button>
        )}
        {confirmLabel && (
          <Button
            variant={destructive ? 'secondary' : 'primary'}
            onClick={onConfirm}
            style={
              destructive
                ? { background: tokens.color.accentBerry, color: tokens.color.paper, border: `2px solid ${tokens.color.accentBerry}` }
                : undefined
            }
          >
            {confirmLabel}
          </Button>
        )}
      </div>
    </Dialog>
  );
}
