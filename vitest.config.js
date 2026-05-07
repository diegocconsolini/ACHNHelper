import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{js,jsx,ts,tsx}'],
    setupFiles: ['tests/design/setup.js'],
    globals: false,
  },
});
