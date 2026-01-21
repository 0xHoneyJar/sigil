/**
 * Lens React Hooks
 *
 * React hooks for accessing lens state.
 */

import type { Address } from 'viem'
import { useLensStore } from './store'
import type { LensState, LensContext, SavedAddress } from './types'

/**
 * Hook to get the full lens state
 *
 * @example
 * ```tsx
 * function LensStatus() {
 *   const { enabled, impersonatedAddress, realAddress } = useLens()
 *   return <div>{enabled ? `Impersonating ${impersonatedAddress}` : 'Not impersonating'}</div>
 * }
 * ```
 */
export function useLens(): LensState {
  return useLensStore((state) => ({
    enabled: state.enabled,
    impersonatedAddress: state.impersonatedAddress,
    realAddress: state.realAddress,
    savedAddresses: state.savedAddresses,
  }))
}

/**
 * Hook to get lens context for components
 *
 * @example
 * ```tsx
 * function AddressDisplay() {
 *   const { isImpersonating, impersonatedAddress, realAddress } = useLensContext()
 *   return <div>{isImpersonating ? impersonatedAddress : realAddress}</div>
 * }
 * ```
 */
export function useLensContext(): LensContext {
  return useLensStore((state) => ({
    isImpersonating: state.enabled && state.impersonatedAddress !== null,
    impersonatedAddress: state.impersonatedAddress,
    realAddress: state.realAddress,
  }))
}

/**
 * Hook to check if currently impersonating
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
  return useLensStore(
    (state) => state.enabled && state.impersonatedAddress !== null
  )
}

/**
 * Hook to get the impersonated address (or null if not impersonating)
 */
export function useImpersonatedAddress(): Address | null {
  return useLensStore((state) =>
    state.enabled ? state.impersonatedAddress : null
  )
}

/**
 * Hook to get the real connected address
 */
export function useRealAddress(): Address | null {
  return useLensStore((state) => state.realAddress)
}

/**
 * Hook to get the effective address (impersonated if active, otherwise real)
 */
export function useEffectiveAddress(): Address | undefined {
  return useLensStore((state) => {
    if (state.enabled && state.impersonatedAddress) {
      return state.impersonatedAddress
    }
    return state.realAddress ?? undefined
  })
}

/**
 * Hook to get saved addresses and actions
 *
 * @example
 * ```tsx
 * function SavedAddressList() {
 *   const { savedAddresses, saveAddress, removeAddress, selectAddress } = useSavedAddresses()
 *   return (
 *     <ul>
 *       {savedAddresses.map(({ address, label }) => (
 *         <li key={address} onClick={() => selectAddress(address)}>
 *           {label}: {address}
 *           <button onClick={() => removeAddress(address)}>Remove</button>
 *         </li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useSavedAddresses() {
  const savedAddresses = useLensStore((state) => state.savedAddresses)
  const saveAddress = useLensStore((state) => state.saveAddress)
  const removeAddress = useLensStore((state) => state.removeAddress)
  const setImpersonatedAddress = useLensStore((state) => state.setImpersonatedAddress)

  return {
    savedAddresses,
    saveAddress: (entry: Omit<SavedAddress, 'addedAt'>) => saveAddress(entry),
    removeAddress,
    selectAddress: setImpersonatedAddress,
  }
}

/**
 * Hook to get lens actions
 */
export function useLensActions() {
  const setImpersonatedAddress = useLensStore((state) => state.setImpersonatedAddress)
  const clearImpersonation = useLensStore((state) => state.clearImpersonation)
  const setRealAddress = useLensStore((state) => state.setRealAddress)

  return {
    setImpersonatedAddress,
    clearImpersonation,
    setRealAddress,
  }
}
