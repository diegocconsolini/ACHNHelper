// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SpeechDialog from '../../src/design/components/SpeechDialog.jsx';

describe('SpeechDialog', () => {
  it('renders message when open', () => {
    render(
      <SpeechDialog
        open
        onClose={() => {}}
        character="isabelle"
        message="Heading back to the airport?"
        confirmLabel="Sign Out"
        cancelLabel="Stay"
      />
    );
    expect(screen.getByText(/Heading back to the airport/)).toBeTruthy();
  });

  it('calls onConfirm when confirm clicked', () => {
    const onConfirm = vi.fn();
    render(
      <SpeechDialog
        open
        onClose={() => {}}
        character="isabelle"
        message="x"
        confirmLabel="Sign Out"
        cancelLabel="Stay"
        onConfirm={onConfirm}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Sign Out' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel clicked', () => {
    const onCancel = vi.fn();
    render(
      <SpeechDialog
        open
        onClose={() => {}}
        character="isabelle"
        message="x"
        confirmLabel="OK"
        cancelLabel="Cancel"
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when not open', () => {
    const { container } = render(
      <SpeechDialog open={false} onClose={() => {}} character="isabelle" message="x" />
    );
    expect(container.firstChild).toBeNull();
  });
});
