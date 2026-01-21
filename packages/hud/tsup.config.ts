import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  external: [
    'react',
    '@sigil/anchor',
    '@sigil/fork',
    '@sigil/simulation',
    '@sigil/lens',
    '@sigil/diagnostics',
  ],
  treeshake: true,
})
