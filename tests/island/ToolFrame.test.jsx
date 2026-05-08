// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ToolFrame from '../../src/island/ToolFrame.jsx';

describe('ToolFrame', () => {
  it('renders children', () => {
    render(
      <ToolFrame host="isabelle">
        <div data-testid="child">data table</div>
      </ToolFrame>
    );
    expect(screen.getByTestId('child').textContent).toBe('data table');
  });

  it('renders greeting in the host speech bubble when provided', () => {
    render(
      <ToolFrame host="isabelle" greeting="Welcome to the island!">
        <div />
      </ToolFrame>
    );
    expect(screen.getByText('Welcome to the island!')).toBeTruthy();
  });

  it('renders footer when provided', () => {
    render(
      <ToolFrame host="isabelle" footer={<span>tray content</span>}>
        <div />
      </ToolFrame>
    );
    expect(screen.getByText('tray content')).toBeTruthy();
  });

  it('omits greeting block when prop is missing', () => {
    render(
      <ToolFrame host="isabelle">
        <div data-testid="only-child" />
      </ToolFrame>
    );
    expect(screen.queryByRole('region', { name: /Isabelle says/ })).toBeNull();
  });
});
