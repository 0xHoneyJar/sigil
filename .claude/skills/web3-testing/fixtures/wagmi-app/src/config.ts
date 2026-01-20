import { createConfig, http } from 'wagmi'
import { mainnet, arbitrum, base } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, arbitrum, base],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
