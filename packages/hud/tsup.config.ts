import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'wagmi/index': 'src/wagmi/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  external: [
    'react',
    'wagmi',
    'viem',
    '@thehoneyjar/sigil-anchor',
    '@thehoneyjar/sigil-fork',
    '@thehoneyjar/sigil-simulation',
    '@thehoneyjar/sigil-lens',
    '@thehoneyjar/sigil-diagnostics',
  ],
  treeshake: true,
  sourcemap: true,
})
