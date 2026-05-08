// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResettiTrap from '../../src/components/ResettiTrap.jsx';

const KEY = 'acnh-resetti-counter';

describe('ResettiTrap', () => {
  beforeEach(() => {
    localStorage.removeItem(KEY);
  });

  it('does not show on a single page load', () => {
    render(<ResettiTrap />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('triggers when 5 timestamps land within 30 seconds', () => {
    const now = Date.now();
    localStorage.setItem(KEY, JSON.stringify([now - 1000, now - 800, now - 600, now - 400]));
    render(<ResettiTrap />);
    // The component pushes a 5th timestamp on mount, so threshold is met
    expect(screen.queryByText(/keep restartin/)).toBeTruthy();
  });

  it('does not trigger when timestamps are older than 30 seconds', () => {
    const old = Date.now() - 60_000;
    localStorage.setItem(KEY, JSON.stringify([old, old, old, old]));
    render(<ResettiTrap />);
    expect(screen.queryByText(/keep restartin/)).toBeNull();
  });
});
