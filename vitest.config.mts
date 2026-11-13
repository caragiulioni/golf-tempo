import { defineConfig } from 'vitest/config';

// Automated tests cover the timing engine and the pure UI helpers in src/ui/lib.
export default defineConfig({
  test: {
    include: ['src/engine/**/*.test.ts', 'src/ui/lib/**/*.test.ts'],
    environment: 'node',
  },
});
