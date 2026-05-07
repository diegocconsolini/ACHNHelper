// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dialog from '../../src/design/components/Dialog.jsx';

describe('Dialog', () => {
  it('renders children when open', () => {
    render(
      <Dialog open onClose={() => {}}>
        Hello
      </Dialog>,
    );
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('does not render when closed', () => {
    render(
      <Dialog open={false} onClose={() => {}}>
        Hello
      </Dialog>,
    );
    expect(screen.queryByText('Hello')).toBeNull();
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose}>
        X
      </Dialog>,
    );
    fireEvent.click(screen.getByTestId('dialog-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when dialog body is clicked', () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose}>
        X
      </Dialog>,
    );
    fireEvent.click(screen.getByTestId('dialog-body'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders title when provided', () => {
    render(
      <Dialog open onClose={() => {}} title="Are you sure?">
        Body
      </Dialog>,
    );
    expect(screen.getByText('Are you sure?')).toBeTruthy();
  });
});
