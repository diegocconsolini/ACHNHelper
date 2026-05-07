'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokens } from '../design/tokens.js';
import { skyPalette } from './timeOfDay.js';
import { BUILDINGS } from './buildings.js';
import Building from './Building.jsx';

const VIEWBOX_W = 1000;
const VIEWBOX_H = 600;

export default function IslandScene() {
  const router = useRouter();
  const [hour, setHour] = useState(12);

  useEffect(() => {
    setHour(new Date().getHours());
    const tick = setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => clearInterval(tick);
  }, []);

  const sky = skyPalette(hour);

  const onSelect = (b) => {
    router.push(b.route);
  };

  return (
    <div
      style={{
        width: '100%',
        background: `linear-gradient(180deg, ${sky.top} 0%, ${sky.bottom} 100%)`,
        padding: '40px 20px 60px',
      }}
    >
      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '70vh',
          display: 'block',
          margin: '0 auto',
        }}
        role="img"
        aria-label="Animal Crossing island map with clickable buildings"
      >
        <circle cx={120} cy={80} r={36} fill={sky.sun} opacity={0.85} />

        <rect x={0} y={520} width={VIEWBOX_W} height={80} fill={tokens.color.water} opacity={0.9} />
        <rect x={0} y={520} width={VIEWBOX_W} height={80} fill={tokens.color.water} opacity={0.5}>
          <animate attributeName="opacity" values="0.5;0.7;0.5" dur="4s" repeatCount="indefinite" />
        </rect>

        <ellipse cx={500} cy={520} rx={490} ry={120} fill={tokens.color.sand} />
        <ellipse cx={500} cy={470} rx={460} ry={250} fill={tokens.color.grass} />

        <path
          d="M 60 470 Q 250 380, 460 360 Q 700 340, 940 380"
          stroke={tokens.color.path}
          strokeWidth={28}
          fill="none"
          strokeLinecap="round"
          opacity={0.85}
        />

        {[
          [80, 350], [60, 440], [950, 350], [930, 440], [380, 350], [620, 350], [500, 200], [880, 200], [120, 220],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <rect x={cx - 4} y={cy} width={8} height={20} fill={tokens.color.woodDark} />
            <circle cx={cx} cy={cy - 4} r={20} fill={tokens.color.grassDark} />
          </g>
        ))}

        {BUILDINGS.map((b) => (
          <Building key={b.id} building={b} onSelect={onSelect} />
        ))}
      </svg>
    </div>
  );
}
