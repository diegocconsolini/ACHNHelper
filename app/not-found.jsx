import Link from 'next/link';
import Greeting from '../src/characters/Greeting.jsx';
import { tokens } from '../src/design/tokens.js';

export const metadata = {
  title: '404 — ACNH Helper Suite',
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${tokens.color.skySunset} 0%, ${tokens.color.skyDay} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: tokens.space[6],
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Playfair+Display:wght@700;900&display=swap');`}</style>
      <div style={{ maxWidth: 720, width: '100%' }}>
        <Greeting character="kk-slider" mood="strumming">
          The page you're looking for hasn't been written yet, dude. I'm
          still composing the song about it. Want to head back home?
        </Greeting>
        <div style={{ marginTop: tokens.space[6], textAlign: 'center' }}>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              background: tokens.color.paper,
              color: tokens.color.ink,
              border: `2px solid ${tokens.color.wood}`,
              borderRadius: tokens.radius.pill,
              fontFamily: tokens.font.handwriting,
              fontSize: 18,
              textDecoration: 'none',
              boxShadow: tokens.shadow.paper,
            }}
          >
            Take me back to the island
          </Link>
        </div>
      </div>
    </main>
  );
}
