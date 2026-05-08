'use client';

import { useEffect, useState } from 'react';

export default function SeasonalDecorations() {
  const [decoration, setDecoration] = useState(null);

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();

    // Bunny Day: April 4-13 (post-Easter window)
    if (month === 4 && day >= 4 && day <= 13) {
      setDecoration({ emoji: '🥚', label: 'Bunny Day', tone: '#f4a8d8' });
    } else if (month === 10 && day >= 30 && day <= 31) {
      setDecoration({ emoji: '🎃', label: 'Spooky Day', tone: '#ff8c40' });
    } else if (month === 12 && day >= 24 && day <= 26) {
      setDecoration({ emoji: '🎄', label: 'Toy Day', tone: '#e85a5a' });
    }
  }, []);

  if (!decoration) return null;

  return (
    <div
      aria-label={decoration.label}
      title={decoration.label}
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        fontSize: 28,
        zIndex: 4,
        animation: 'acnhSeasonalBob 3s ease-in-out infinite',
        pointerEvents: 'none',
        textShadow: `0 2px 8px ${decoration.tone}`,
      }}
    >
      <style>{`
        @keyframes acnhSeasonalBob {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50%      { transform: translateY(-4px) rotate(3deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-label="${decoration.label}"] { animation: none !important; }
        }
      `}</style>
      {decoration.emoji}
    </div>
  );
}
