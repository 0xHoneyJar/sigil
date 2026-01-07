import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx'],
    environmentMatchGlobs: [
      // Use node for non-React tests
      ['__tests__/process/constitution-reader.test.ts', 'node'],
      ['__tests__/process/decision-reader.test.ts', 'node'],
      ['__tests__/process/lens-array-reader.test.ts', 'node'],
      ['__tests__/zone-persona.test.ts', 'node'],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
