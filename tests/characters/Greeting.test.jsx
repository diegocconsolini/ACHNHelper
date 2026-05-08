// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Greeting from '../../src/characters/Greeting.jsx';
import EmptyState from '../../src/characters/EmptyState.jsx';
import LoadingState from '../../src/characters/LoadingState.jsx';

describe('Greeting', () => {
  it("renders the character's name in the portrait alt text", () => {
    render(<Greeting character="isabelle">Welcome!</Greeting>);
    const img = screen.getByRole('img');
    expect(img.getAttribute('alt')).toMatch(/Isabelle/);
  });

  it('renders children inside the speech bubble', () => {
    render(<Greeting character="tom-nook">Yes yes!</Greeting>);
    expect(screen.getByText('Yes yes!')).toBeTruthy();
  });

  it('throws on unknown character', () => {
    expect(() => render(<Greeting character="zzz">x</Greeting>)).toThrow(/Unknown character/);
  });
});

describe('EmptyState', () => {
  it('renders the message', () => {
    render(<EmptyState character="isabelle" message="Nothing to show!" />);
    expect(screen.getByText('Nothing to show!')).toBeTruthy();
  });

  it('uses thinking mood when available', () => {
    render(<EmptyState character="isabelle" message="x" />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toContain('thinking');
  });
});

describe('LoadingState', () => {
  it('renders the loading message', () => {
    render(<LoadingState character="isabelle" message="Loading island…" />);
    expect(screen.getByText('Loading island…')).toBeTruthy();
  });

  it('applies the bob animation class for reduced-motion to disable', () => {
    const { container } = render(<LoadingState character="isabelle" />);
    const img = container.querySelector('img');
    expect(img.classList.contains('acnh-idle-bob')).toBe(true);
  });
});
