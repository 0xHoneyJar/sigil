/**
 * Lens Store
 *
 * Zustand store for lens state management.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Address } from 'viem'
import type { LensState, SavedAddress } from './types'

/**
 * Lens store actions
 */
interface LensActions {
  setImpersonatedAddress: (address: Address) => void
  clearImpersonation: () => void
  setRealAddress: (address: Address | null) => void
  saveAddress: (entry: Omit<SavedAddress, 'addedAt'>) => void
  removeAddress: (address: Address) => void
  reset: () => void
}

/**
 * Combined lens store type
 */
export type LensStore = LensState & LensActions

/**
 * Initial lens state
 */
const initialState: LensState = {
  enabled: false,
  impersonatedAddress: null,
  realAddress: null,
  savedAddresses: [],
}

/**
 * Create the lens store
 */
export const useLensStore = create<LensStore>()(
  persist(
    (set) => ({
      ...initialState,

      setImpersonatedAddress: (address: Address) =>
        set({
          enabled: true,
          impersonatedAddress: address,
        }),

      clearImpersonation: () =>
        set({
          enabled: false,
          impersonatedAddress: null,
        }),

      setRealAddress: (address: Address | null) =>
        set({ realAddress: address }),

      saveAddress: (entry: Omit<SavedAddress, 'addedAt'>) =>
        set((state) => {
          // Don't add duplicates
          if (state.savedAddresses.some((a) => a.address === entry.address)) {
            return state
          }
          return {
            savedAddresses: [
              ...state.savedAddresses,
              { ...entry, addedAt: Date.now() },
            ],
          }
        }),

      removeAddress: (address: Address) =>
        set((state) => ({
          savedAddresses: state.savedAddresses.filter((a) => a.address !== address),
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'sigil-lens-storage',
      partialize: (state) => ({
        savedAddresses: state.savedAddresses,
      }),
    }
  )
)

/**
 * Get lens store state (for non-React contexts)
 */
export function getLensState(): LensState {
  const state = useLensStore.getState()
  return {
    enabled: state.enabled,
    impersonatedAddress: state.impersonatedAddress,
    realAddress: state.realAddress,
    savedAddresses: state.savedAddresses,
  }
}
