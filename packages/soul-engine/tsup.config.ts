import { defineConfig } from 'tsup';

export default defineConfig([
  // Main entry
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom'],
  },
  // Material subpath
  {
    entry: ['src/material/index.ts'],
    outDir: 'dist/material',
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    external: ['react', 'react-dom'],
  },
  // Sync subpath
  {
    entry: ['src/sync/index.ts'],
    outDir: 'dist/sync',
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    external: ['react', 'react-dom'],
  },
  // Hooks subpath
  {
    entry: ['src/hooks/index.ts'],
    outDir: 'dist/hooks',
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    external: ['react', 'react-dom'],
  },
  // Workbench subpath
  {
    entry: ['src/workbench/index.ts'],
    outDir: 'dist/workbench',
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    external: ['react', 'react-dom'],
  },
]);
