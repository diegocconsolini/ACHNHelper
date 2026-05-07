// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../src/design/components/Button.jsx';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeTruthy();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Press</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies variant prop to data-attr for testing', () => {
    render(<Button variant="secondary">X</Button>);
    expect(screen.getByRole('button').getAttribute('data-variant')).toBe('secondary');
  });

  it('defaults variant to primary', () => {
    render(<Button>X</Button>);
    expect(screen.getByRole('button').getAttribute('data-variant')).toBe('primary');
  });
});
