// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SidebarMap from '../../src/island/SidebarMap.jsx';
import {
  sidebarLocations,
  locationForCategory,
  itemsForLocation,
} from '../../src/island/sidebarLocations.js';

const MENU = [
  { category: '📊 Dashboard', items: [{ id: 'dashboard', label: 'Available Now', emoji: '🕐' }] },
  {
    category: '🐟 Critterpedia',
    items: [
      { id: 'fish', label: 'Fish Tracker', emoji: '🐟' },
      { id: 'bugs', label: 'Bug Tracker', emoji: '🦋' },
    ],
  },
  { category: '🏛️ Museum & Progress', items: [{ id: 'museum', label: 'Museum', emoji: '🏛️' }] },
  { category: '💰 Economy & Planning', items: [{ id: 'bell', label: 'Bell Calc', emoji: '💰' }] },
  { category: '🌸 Gardening', items: [{ id: 'flower', label: 'Flower Calc', emoji: '🌹' }] },
  { category: '🎨 Special & Art', items: [{ id: 'art', label: 'Art', emoji: '🎨' }] },
  { category: '📦 Catalog', items: [{ id: 'catalog', label: 'Catalog', emoji: '📦' }] },
  { category: '🏠 Island Life', items: [{ id: 'villager', label: 'Villager', emoji: '🎁' }] },
  { category: '⚙️ Settings', items: [{ id: 'profile', label: 'Profile', emoji: '👤' }] },
];

describe('sidebarLocations bindings', () => {
  it('has 6 painted locations', () => {
    expect(sidebarLocations).toHaveLength(6);
  });

  it('every MENU category maps to exactly one location', () => {
    const allCategoriesInBindings = sidebarLocations.flatMap((l) => l.menuCategories);
    for (const group of MENU) {
      expect(
        allCategoriesInBindings,
        `category "${group.category}" not bound to any location`
      ).toContain(group.category);
    }
  });

  it('locationForCategory finds Critterpedia at the dock', () => {
    const loc = locationForCategory('🐟 Critterpedia');
    expect(loc.id).toBe('critterpedia');
  });

  it('itemsForLocation aggregates items across multiple categories for art zone', () => {
    const items = itemsForLocation(MENU, 'art');
    expect(items.length).toBe(2);
    expect(items.map((i) => i.id).sort()).toEqual(['art', 'catalog']);
  });
});

describe('SidebarMap', () => {
  it('renders the sidebar-map image', () => {
    render(<SidebarMap menu={MENU} activeId="dashboard" onSelect={() => {}} />);
    const img = screen.getByRole('img', { name: /map of your island/ });
    expect(img.getAttribute('src')).toContain('/island/sidebar-map.webp');
  });

  it('renders 6 location buttons', () => {
    render(<SidebarMap menu={MENU} activeId="dashboard" onSelect={() => {}} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(6);
  });

  it('opens sub-tool flyout on click and selects a tool', () => {
    const onSelect = vi.fn();
    render(<SidebarMap menu={MENU} activeId="dashboard" onSelect={onSelect} />);
    const dock = screen.getByRole('button', { name: /The Dock/ });
    fireEvent.click(dock);
    const fishItem = screen.getByRole('menuitem', { name: /Fish Tracker/ });
    fireEvent.click(fishItem);
    expect(onSelect).toHaveBeenCalledWith('fish');
  });
});
