import { defineConfig } from 'vitest/config';

// Automated tests cover the timing engine only (see .kiro/steering/tech.md).
export default defineConfig({
  test: {
    include: ['src/engine/**/*.test.ts'],
    environment: 'node',
  },
});
