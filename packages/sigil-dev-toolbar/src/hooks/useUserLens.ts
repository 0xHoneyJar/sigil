import { useAccount } from 'wagmi'
import { useDevToolbarSelector } from '../providers/DevToolbarProvider'
import type { Address } from 'viem'

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

  const userLens = useDevToolbarSelector((state) => state.userLens)

  const isImpersonating = userLens.enabled && userLens.impersonatedAddress !== null
  const address = isImpersonating ? userLens.impersonatedAddress! : realAddress

  return {
    address,
    realAddress,
    isImpersonating,
    impersonatedAddress: userLens.impersonatedAddress,
    isConnected,
  }
}

/**
 * Hook to get just the impersonation status
 *
 * @example
 * ```tsx
 * function LensBadge() {
 *   const isImpersonating = useIsImpersonating()
 *   if (!isImpersonating) return null
 *   return <Badge variant="warning">Lens Active</Badge>
 * }
 * ```
 */
export function useIsImpersonating(): boolean {
  return useDevToolbarSelector(
    (state) => state.userLens.enabled && state.userLens.impersonatedAddress !== null
  )
}

/**
 * Hook to get the impersonated address (or null if not impersonating)
 */
export function useImpersonatedAddress(): Address | null {
  return useDevToolbarSelector((state) =>
    state.userLens.enabled ? state.userLens.impersonatedAddress : null
  )
}

/**
 * Hook to get saved addresses for quick selection
 */
export function useSavedAddresses() {
  const savedAddresses = useDevToolbarSelector((state) => state.userLens.savedAddresses)
  const { saveAddress, removeAddress, setImpersonatedAddress } = useDevToolbarSelector((state) => ({
    saveAddress: state.saveAddress,
    removeAddress: state.removeAddress,
    setImpersonatedAddress: state.setImpersonatedAddress,
  }))

  return {
    savedAddresses,
    saveAddress,
    removeAddress,
    selectAddress: setImpersonatedAddress,
  }
}
