'use client';

import { useState } from 'react';
import { tokens } from '@/src/design/tokens.js';
import Button from '@/src/design/components/Button.jsx';
import PaperPanel from '@/src/design/components/PaperPanel.jsx';
import Card from '@/src/design/components/Card.jsx';
import Dialog from '@/src/design/components/Dialog.jsx';

export default function DesignShowcase() {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (process.env.NODE_ENV === 'production') {
    return (
      <div style={{ padding: 40, fontFamily: 'system-ui' }}>
        <p>This page is only available in development.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 40,
        background: tokens.color.grass,
        fontFamily: tokens.font.body,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
      `}</style>

      <h1
        style={{
          fontFamily: tokens.font.display,
          fontSize: 42,
          color: tokens.color.ink,
          marginBottom: 24,
        }}
      >
        Island Design System
      </h1>

      <Card header="Buttons" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Card>

      <Card header="Color tokens" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 12,
          }}
        >
          {Object.entries(tokens.color).map(([name, value]) => (
            <div
              key={name}
              style={{
                background: value,
                padding: 16,
                borderRadius: tokens.radius.sm,
                color:
                  name.includes('paper') || name === 'sand'
                    ? tokens.color.ink
                    : '#fff',
                fontFamily: tokens.font.mono,
                fontSize: 11,
              }}
            >
              {name}
              <br />
              {value}
            </div>
          ))}
        </div>
      </Card>

      <Card header="PaperPanel variants" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <PaperPanel variant="light" padding={20} style={{ flex: 1 }}>
            Light paper
          </PaperPanel>
          <PaperPanel variant="dark" padding={20} style={{ flex: 1 }}>
            Dark paper
          </PaperPanel>
        </div>
      </Card>

      <Card header="Dialog">
        <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Hello, islander!"
          footer={
            <>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setDialogOpen(false)}>OK</Button>
            </>
          }
        >
          This is the new dialog component. It replaces ConfirmModal and
          AlertModal in Phase 3.
        </Dialog>
      </Card>
    </div>
  );
}
