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

import { useState, useEffect, useSyncExternalStore } from 'react'
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

/**
 * Lens store type
 */
type LensStore = {
  getState: () => { impersonatedAddress: Address | null; enabled: boolean }
  subscribe: (listener: () => void) => () => void
}

/**
 * Module-level state for lens store
 */
let lensStore: LensStore | null = null
let lensLoadAttempted = false
let lensLoadPromise: Promise<void> | null = null
const lensLoadListeners = new Set<() => void>()

/**
 * Notify listeners when lens load state changes
 */
function notifyLensLoadListeners() {
  lensLoadListeners.forEach((listener) => listener())
}

/**
 * Load lens store using dynamic import (ESM-safe)
 */
function loadLensStore(): Promise<void> {
  if (lensLoadPromise) return lensLoadPromise

  // Use dynamic import with string variable to avoid TypeScript module resolution
  // This is intentional - sigil-lens is an optional peer dependency
  const moduleName = '@thehoneyjar/sigil-lens'
  lensLoadPromise = import(/* webpackIgnore: true */ moduleName)
    .then((module: { useLensStore?: LensStore }) => {
      // The module exports useLensStore which is a zustand hook
      // Zustand hooks have a getState() method and subscribe()
      const { useLensStore } = module
      if (useLensStore && typeof useLensStore.getState === 'function') {
        lensStore = useLensStore
      }
    })
    .catch(() => {
      // sigil-lens not installed or failed to load
      // This is expected when the optional dependency isn't installed
    })
    .finally(() => {
      lensLoadAttempted = true
      notifyLensLoadListeners()
    })

  return lensLoadPromise
}

// Start loading lens store immediately (non-blocking)
if (typeof window !== 'undefined') {
  loadLensStore()
}

/**
 * Hook to track lens store loading state
 */
function useLensStoreLoaded(): boolean {
  const [loaded, setLoaded] = useState(lensLoadAttempted)

  useEffect(() => {
    if (lensLoadAttempted) {
      setLoaded(true)
      return
    }

    // Start loading if not already started
    loadLensStore()

    // Subscribe to load completion
    const listener = () => setLoaded(true)
    lensLoadListeners.add(listener)

    return () => {
      lensLoadListeners.delete(listener)
    }
  }, [])

  return loaded
}

/**
 * Hook to subscribe to lens store state
 */
function useLensState(): { impersonatedAddress: Address | null; enabled: boolean } | null {
  const loaded = useLensStoreLoaded()

  // Use useSyncExternalStore for proper React 18 concurrent mode support
  const state = useSyncExternalStore(
    (callback) => {
      if (!lensStore) return () => {}
      return lensStore.subscribe(callback)
    },
    () => (lensStore ? lensStore.getState() : null),
    () => null // Server snapshot
  )

  if (!loaded || !lensStore) return null
  return state
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
  const lensState = useLensState()

  // If sigil-lens is available and has state, check for impersonation
  if (lensState) {
    const isImpersonating = lensState.enabled && lensState.impersonatedAddress !== null

    return {
      ...wagmiAccount,
      address: isImpersonating ? lensState.impersonatedAddress! : wagmiAccount.address,
      realAddress: wagmiAccount.address,
      isImpersonating,
      impersonatedAddress: lensState.impersonatedAddress,
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
