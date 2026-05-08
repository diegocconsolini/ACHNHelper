'use client';

import { useState } from 'react';
import Link from 'next/link';
import Greeting from '../../src/characters/Greeting.jsx';
import SpeechDialog from '../../src/design/components/SpeechDialog.jsx';
import { tokens } from '../../src/design/tokens.js';

export default function DodoPage() {
  const [code, setCode] = useState('');
  const [showResult, setShowResult] = useState(false);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${tokens.color.skyDay}, ${tokens.color.skySunset})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: tokens.space[6],
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Playfair+Display:wght@700;900&display=swap');`}</style>
      <div style={{ maxWidth: 720, width: '100%' }}>
        <Greeting character="isabelle" mood="welcome">
          Welcome to Dodo Airlines! Got a Dodo Code? I can fly you over to a friend's island.
        </Greeting>

        <div style={{ marginTop: tokens.space[6], textAlign: 'center' }}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 5))}
            placeholder="ABCDE"
            maxLength={5}
            style={{
              fontFamily: tokens.font.mono,
              fontSize: 28,
              padding: '12px 20px',
              background: tokens.color.paper,
              color: tokens.color.ink,
              border: `2px solid ${tokens.color.wood}`,
              borderRadius: tokens.radius.md,
              textAlign: 'center',
              letterSpacing: 6,
              outline: 'none',
              width: 200,
            }}
          />
          <div style={{ marginTop: tokens.space[4] }}>
            <button
              onClick={() => setShowResult(true)}
              disabled={code.length !== 5}
              style={{
                padding: '10px 24px',
                background: tokens.color.accentLeaf,
                color: tokens.color.paper,
                border: `2px solid ${tokens.color.grassDark}`,
                borderRadius: tokens.radius.pill,
                fontFamily: tokens.font.body,
                fontSize: 15,
                fontWeight: 700,
                cursor: code.length === 5 ? 'pointer' : 'not-allowed',
                opacity: code.length === 5 ? 1 : 0.5,
                outline: 'none',
              }}
            >
              Take me there!
            </button>
          </div>
          <div style={{ marginTop: tokens.space[6] }}>
            <Link
              href="/"
              style={{
                fontFamily: tokens.font.handwriting,
                fontSize: 16,
                color: tokens.color.ink,
                textDecoration: 'underline',
              }}
            >
              ← Back to the island
            </Link>
          </div>
        </div>
      </div>

      <SpeechDialog
        open={showResult}
        onClose={() => setShowResult(false)}
        character="isabelle"
        mood="thinking"
        message={`I don't recognize the code "${code}", mayor… are you sure it's right? Hmm, try asking your friend for a fresh one!`}
        confirmLabel="Try again"
        onConfirm={() => {
          setShowResult(false);
          setCode('');
        }}
      />
    </main>
  );
}
