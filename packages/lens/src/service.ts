/**
 * Lens Service Implementation
 *
 * Provides lens functionality for non-React contexts.
 */

import type { Address } from 'viem'
import type { LensService, LensState, LensContext, SavedAddress } from './types'
import { useLensStore, getLensState } from './store'

/**
 * Create a lens service
 */
export function createLensService(): LensService {
  const store = useLensStore

  return {
    getState(): LensState {
      return getLensState()
    },

    setImpersonatedAddress(address: Address): void {
      store.getState().setImpersonatedAddress(address)
    },

    clearImpersonation(): void {
      store.getState().clearImpersonation()
    },

    setRealAddress(address: Address | null): void {
      store.getState().setRealAddress(address)
    },

    saveAddress(entry: Omit<SavedAddress, 'addedAt'>): void {
      store.getState().saveAddress(entry)
    },

    removeAddress(address: Address): void {
      store.getState().removeAddress(address)
    },

    getContext(): LensContext {
      const state = getLensState()
      return {
        isImpersonating: state.enabled && state.impersonatedAddress !== null,
        impersonatedAddress: state.impersonatedAddress,
        realAddress: state.realAddress,
      }
    },

    subscribe(listener: (state: LensState) => void): () => void {
      return store.subscribe((state) => {
        listener({
          enabled: state.enabled,
          impersonatedAddress: state.impersonatedAddress,
          realAddress: state.realAddress,
          savedAddresses: state.savedAddresses,
        })
      })
    },
  }
}

/**
 * Default lens service singleton
 */
let defaultLensService: LensService | null = null

/**
 * Get the default lens service
 */
export function getLensService(): LensService {
  if (!defaultLensService) {
    defaultLensService = createLensService()
  }
  return defaultLensService
}

/**
 * Reset the default lens service
 */
export function resetLensService(): void {
  if (defaultLensService) {
    useLensStore.getState().reset()
  }
  defaultLensService = null
}
