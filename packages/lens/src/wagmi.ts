/**
 * Lens Wagmi Integration
 *
 * Wagmi-aware hooks for lens functionality.
 */

import { useAccount } from 'wagmi'
import { useEffect } from 'react'
import type { Address } from 'viem'
import { useLensStore } from './store'

/**
 * Return type for useLensAwareAccount
 */
export interface LensAwareAccount {
  /** Address for reads - impersonated if lens enabled, otherwise real */
  address: Address | undefined
  /** The user's real connected address (always available for signing) */
  realAddress: Address | undefined
  /** Whether currently impersonating another address */
  isImpersonating: boolean
  /** The impersonated address (if any) */
  impersonatedAddress: Address | null
  /** Whether the wallet is connected */
  isConnected: boolean
}

/**
 * Hook that returns impersonated address for reads, real address for writes.
 *
 * Use this hook in place of wagmi's `useAccount` when you want components
 * to display data for an impersonated address while still being able to
 * sign transactions with the real connected wallet.
 *
 * @example
 * ```tsx
 * function WalletInfo() {
 *   const { address, realAddress, isImpersonating } = useLensAwareAccount()
 *
 *   // Use `address` for reading data (respects impersonation)
 *   const { data: balance } = useBalance({ address })
 *
 *   // Use `realAddress` for signing transactions
 *   const { writeContract } = useWriteContract()
 *
 *   return (
 *     <div>
 *       <p>Viewing: {address}</p>
 *       {isImpersonating && <Badge>Lens Active</Badge>}
 *       <button onClick={() => writeContract({ ... })}>
 *         Sign with {realAddress}
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useLensAwareAccount(): LensAwareAccount {
  const { address: realAddress, isConnected } = useAccount()
  const setRealAddress = useLensStore((state) => state.setRealAddress)

  // Sync real address to lens store
  useEffect(() => {
    setRealAddress(realAddress ?? null)
  }, [realAddress, setRealAddress])

  const enabled = useLensStore((state) => state.enabled)
  const impersonatedAddress = useLensStore((state) => state.impersonatedAddress)

  const isImpersonating = enabled && impersonatedAddress !== null
  const address = isImpersonating ? impersonatedAddress : realAddress

  return {
    address,
    realAddress,
    isImpersonating,
    impersonatedAddress,
    isConnected,
  }
}
