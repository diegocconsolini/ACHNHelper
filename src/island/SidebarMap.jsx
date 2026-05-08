'use client';

import { tokens } from '../design/tokens.js';
import MapLocation from './MapLocation.jsx';
import { sidebarLocations, itemsForLocation } from './sidebarLocations.js';

export default function SidebarMap({
  menu,
  activeId,
  onSelect,
  header,
  footer,
  unreadCount = 0,
}) {
  return (
    <nav
      aria-label="Island map"
      className="acnh-sidebar"
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
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {header && (
        <div
          style={{
            padding: tokens.space[3],
            borderBottom: `1px dashed ${tokens.color.wood}`,
            background: tokens.color.paper,
          }}
        >
          {header}
        </div>
      )}

      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3 / 5',
          flexShrink: 0,
        }}
      >
        <img
          src="/island/sidebar-map.webp"
          alt="Hand-drawn map of your island with six locations"
          loading="eager"
          decoding="async"
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
            badge={loc.id === 'island-life' && unreadCount > 0 ? unreadCount : 0}
          />
        ))}
      </div>

      {footer && (
        <div
          style={{
            padding: tokens.space[3],
            marginTop: 'auto',
            borderTop: `1px dashed ${tokens.color.wood}`,
            background: tokens.color.paper,
          }}
        >
          {footer}
        </div>
      )}
    </nav>
  );
}
