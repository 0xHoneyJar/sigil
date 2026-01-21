/**
 * Lens Service Types
 *
 * Types for address impersonation functionality.
 */

import type { Address } from 'viem'

/**
 * Saved address entry for quick selection
 */
export interface SavedAddress {
  address: Address
  label: string
  addedAt: number
}

/**
 * Lens state
 */
export interface LensState {
  /** Whether lens impersonation is enabled */
  enabled: boolean
  /** Currently impersonated address */
  impersonatedAddress: Address | null
  /** The real connected wallet address */
  realAddress: Address | null
  /** Saved addresses for quick selection */
  savedAddresses: SavedAddress[]
}

/**
 * Lens context for components
 */
export interface LensContext {
  /** Whether currently impersonating */
  isImpersonating: boolean
  /** The impersonated address (if any) */
  impersonatedAddress: Address | null
  /** The real connected address */
  realAddress: Address | null
}

/**
 * Lens service interface
 */
export interface LensService {
  /** Get current lens state */
  getState(): LensState
  /** Enable lens and set impersonated address */
  setImpersonatedAddress(address: Address): void
  /** Clear impersonation */
  clearImpersonation(): void
  /** Set the real address (from wallet connection) */
  setRealAddress(address: Address | null): void
  /** Save an address for quick access */
  saveAddress(entry: Omit<SavedAddress, 'addedAt'>): void
  /** Remove a saved address */
  removeAddress(address: Address): void
  /** Get lens context */
  getContext(): LensContext
  /** Subscribe to state changes */
  subscribe(listener: (state: LensState) => void): () => void
}

/**
 * Lens error
 */
export class LensError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true
  ) {
    super(message)
    this.name = 'LensError'
  }
}

/**
 * Lens error codes
 */
export const LensErrorCodes = {
  INVALID_ADDRESS: 'LENS_INVALID_ADDRESS',
  NOT_CONNECTED: 'LENS_NOT_CONNECTED',
} as const
