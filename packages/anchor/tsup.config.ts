import { defineConfig } from 'tsup';

export default defineConfig([
  // Main library entry
  {
    entry: {
      index: 'src/index.ts',
    },
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    target: 'node20',
    outDir: 'dist',
    shims: true,
  },
  // CLI entry with shebang
  {
    entry: {
      'cli/index': 'src/cli/index.ts',
    },
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    treeshake: true,
    target: 'node20',
    outDir: 'dist',
    shims: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
