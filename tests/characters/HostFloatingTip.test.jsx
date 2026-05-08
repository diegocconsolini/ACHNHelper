// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HostFloatingTip from '../../src/characters/HostFloatingTip.jsx';

describe('HostFloatingTip', () => {
  it('renders the trigger text', () => {
    render(
      <HostFloatingTip character="tom-nook" trigger="Why pay loans?" message="Yes yes!" />
    );
    expect(screen.getByRole('button', { name: /tip about/ })).toBeTruthy();
    expect(screen.getByText('Why pay loans?')).toBeTruthy();
  });

  it('shows the tooltip message on hover', () => {
    render(
      <HostFloatingTip character="tom-nook" trigger="Why pay loans?" message="Settling each loan expands your home." />
    );
    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole('tooltip')).toBeTruthy();
    expect(screen.getByText(/Settling each loan/)).toBeTruthy();
  });

  it('hides the tooltip on blur', () => {
    render(
      <HostFloatingTip character="tom-nook" trigger="x" message="hidden" />
    );
    const trigger = screen.getByRole('button');
    fireEvent.focus(trigger);
    expect(screen.queryByRole('tooltip')).toBeTruthy();
    fireEvent.blur(trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
