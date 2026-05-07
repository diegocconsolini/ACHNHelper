'use client';

import { useState } from 'react';
import { tokens } from '../design/tokens.js';
import { AssetImg } from '../assetHelper.jsx';

export default function Building({ building, onSelect }) {
  const [hover, setHover] = useState(false);
  const { id, label, x, y, w, h, color, sprite } = building;

  const roofOverhang = 12;
  const roofHeight = 28;

  return (
    <g
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onSelect(building)}
      style={{
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        transformOrigin: `${x + w / 2}px ${y + h / 2}px`,
        transform: hover ? 'scale(1.04)' : 'scale(1)',
      }}
      data-building={id}
    >
      <rect
        x={x}
        y={y + roofHeight}
        width={w}
        height={h - roofHeight}
        fill={tokens.color.paper}
        stroke={tokens.color.woodDark}
        strokeWidth={2}
        rx={4}
      />
      <polygon
        points={`${x - roofOverhang},${y + roofHeight} ${x + w / 2},${y} ${x + w + roofOverhang},${y + roofHeight}`}
        fill={color}
        stroke={tokens.color.woodDark}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <rect
        x={x + w / 2 - 18}
        y={y + h - 50}
        width={36}
        height={50}
        fill={tokens.color.woodDark}
        rx={4}
      />
      <foreignObject
        x={x + w / 2 - 24}
        y={y + roofHeight + 8}
        width={48}
        height={48}
        style={{ pointerEvents: 'none' }}
      >
        <AssetImg category={sprite.category} name={sprite.name} size={48} />
      </foreignObject>
      {hover && (
        <g style={{ pointerEvents: 'none' }}>
          <rect
            x={x + w / 2 - 80}
            y={y - 36}
            width={160}
            height={28}
            rx={14}
            fill={tokens.color.paper}
            stroke={tokens.color.woodDark}
            strokeWidth={1.5}
          />
          <text
            x={x + w / 2}
            y={y - 18}
            textAnchor="middle"
            fontFamily={tokens.font.handwriting}
            fontSize="16"
            fill={tokens.color.ink}
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
}
