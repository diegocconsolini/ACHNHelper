'use client';

import { tokens } from '../design/tokens.js';
import MapLocation from './MapLocation.jsx';
import { sidebarLocations, itemsForLocation } from './sidebarLocations.js';

export default function SidebarMap({ menu, activeId, onSelect }) {
  return (
    <nav
      aria-label="Island map"
      style={{
        position: 'relative',
        width: 320,
        flexShrink: 0,
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'visible',
        background: tokens.color.paperDark,
        borderRight: `2px solid ${tokens.color.wood}`,
        padding: 0,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3 / 5',
        }}
      >
        <img
          src="/island/sidebar-map.webp"
          alt="Hand-drawn map of your island with six locations"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'cover',
          }}
        />
        {sidebarLocations.map((loc) => (
          <MapLocation
            key={loc.id}
            location={loc}
            items={itemsForLocation(menu, loc.id)}
            activeId={activeId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </nav>
  );
}
