'use client';

import { useState } from 'react';
import { tokens } from '../tokens.js';

const variants = {
  primary: {
    background: tokens.color.accentLeaf,
    color: tokens.color.paper,
    border: `2px solid ${tokens.color.grassDark}`,
  },
  secondary: {
    background: tokens.color.paper,
    color: tokens.color.ink,
    border: `2px solid ${tokens.color.wood}`,
  },
  ghost: {
    background: 'transparent',
    color: tokens.color.ink,
    border: '2px solid transparent',
  },
};

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  type = 'button',
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const v = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-variant={variant}
      style={{
        ...v,
        padding: '10px 20px',
        borderRadius: tokens.radius.pill,
        fontFamily: tokens.font.body,
        fontSize: 15,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        outline: 'none',
        boxShadow: hover && !disabled ? tokens.shadow.paper : 'none',
        transform: hover && !disabled ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
