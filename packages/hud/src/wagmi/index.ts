/**
 * Wagmi integration for Sigil HUD
 *
 * Drop-in replacement for wagmi's useAccount that respects Lens impersonation.
 *
 * @example
 * ```tsx
 * // Replace: import { useAccount } from 'wagmi'
 * import { useAccount } from '@thehoneyjar/sigil-hud/wagmi'
 *
 * function MyComponent() {
 *   const { address, realAddress, isImpersonating } = useAccount()
 *   // address = effective address (impersonated if lens enabled)
 *   // realAddress = real wallet (for signing)
 * }
 * ```
 */

import { useAccount as useWagmiAccount } from 'wagmi'
import type { Address } from 'viem'

/**
 * Return type for useAccount hook
 */
export interface LensAwareAccountReturn {
  /** Address for reads (impersonated if lens enabled, otherwise real) */
  address: Address | undefined
  /** The user's real connected address (always available for signing) */
  realAddress: Address | undefined
  /** Whether currently impersonating another address */
  isImpersonating: boolean
  /** The impersonated address (if any) */
  impersonatedAddress: Address | null
  /** Whether the wallet is connected */
  isConnected: boolean
  /** Connector info */
  connector: ReturnType<typeof useWagmiAccount>['connector']
  /** Chain ID */
  chainId: ReturnType<typeof useWagmiAccount>['chainId']
  /** Connection status */
  status: ReturnType<typeof useWagmiAccount>['status']
}

// Attempt to import lens store - may not be installed
let useLensStore: (() => { impersonatedAddress: Address | null; enabled: boolean }) | null = null

try {
  // Dynamic require to handle optional dependency
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const lensModule = require('@thehoneyjar/sigil-lens')
  useLensStore = lensModule.useLensStore
} catch {
  // sigil-lens not installed, will fall back to standard wagmi behavior
}

/**
 * Drop-in replacement for wagmi's useAccount.
 *
 * When @thehoneyjar/sigil-lens is installed and Lens is enabled,
 * returns the impersonated address for reads while preserving
 * the real address for signing.
 *
 * @example
 * ```tsx
 * // Replace: import { useAccount } from 'wagmi'
 * import { useAccount } from '@thehoneyjar/sigil-hud/wagmi'
 *
 * function MyComponent() {
 *   const { address, realAddress, isImpersonating } = useAccount()
 *
 *   // Use `address` for read operations (queries, display)
 *   const { data } = useBalance({ address })
 *
 *   // Use `realAddress` for write operations (signing)
 *   const { writeContract } = useWriteContract()
 * }
 * ```
 */
export function useAccount(): LensAwareAccountReturn {
  const wagmiAccount = useWagmiAccount()

  // If sigil-lens is available, check for impersonation
  if (useLensStore) {
    try {
      const lensState = useLensStore()
      const isImpersonating = lensState.enabled && lensState.impersonatedAddress !== null

      return {
        ...wagmiAccount,
        address: isImpersonating ? lensState.impersonatedAddress! : wagmiAccount.address,
        realAddress: wagmiAccount.address,
        isImpersonating,
        impersonatedAddress: lensState.impersonatedAddress,
      }
    } catch {
      // If lens store errors, fall back to standard behavior
    }
  }

  // Fallback: no lens, just return wagmi account with additional fields
  return {
    ...wagmiAccount,
    realAddress: wagmiAccount.address,
    isImpersonating: false,
    impersonatedAddress: null,
  }
}

/**
 * Simple hook to get the effective address for reads.
 *
 * This is a convenience wrapper around useAccount that returns only the address.
 * Use when you only need the effective address and don't need signing capabilities.
 *
 * @example
 * ```tsx
 * import { useEffectiveAddress } from '@thehoneyjar/sigil-hud/wagmi'
 *
 * function BalanceDisplay() {
 *   const address = useEffectiveAddress()
 *   const { data } = useBalance({ address })
 *   return <div>{data?.formatted}</div>
 * }
 * ```
 */
export function useEffectiveAddress(): Address | undefined {
  const { address } = useAccount()
  return address
}

/**
 * Re-export useLensAwareAccount for backward compatibility
 * with existing code using @thehoneyjar/sigil-lens/wagmi
 */
export const useLensAwareAccount = useAccount
