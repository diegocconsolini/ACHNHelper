'use client';

import { tokens } from '../tokens.js';

export default function PaperPanel({
  children,
  variant = 'light',
  padding = 16,
  style,
  ...rest
}) {
  const bg = variant === 'dark' ? tokens.color.paperDark : tokens.color.paper;
  const texture =
    variant === 'dark'
      ? '/design/textures/paper-dark.svg'
      : '/design/textures/paper-light.svg';

  return (
    <div
      style={{
        backgroundColor: bg,
        backgroundImage: `url(${texture})`,
        backgroundSize: '200px 200px',
        borderRadius: tokens.radius.md,
        padding,
        boxShadow: tokens.shadow.paper,
        color: tokens.color.ink,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
