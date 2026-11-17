import { defineConfig } from 'vitest/config';

// Automated tests cover the timing engine, the pure UI helpers in src/ui/lib, and the player's scheduling in src/audio.
export default defineConfig({
  test: {
    include: ['src/engine/**/*.test.ts', 'src/ui/lib/**/*.test.ts', 'src/theme/**/*.test.ts', 'src/config-mode/**/*.test.ts', 'src/audio/**/*.test.ts'],
    environment: 'node',
  },
});
