/**
 * @sigil/lens
 *
 * Address impersonation for testing different user states.
 */

// Types
export type {
  LensState,
  LensContext,
  LensService,
  SavedAddress,
} from './types'

export { LensError, LensErrorCodes } from './types'

// Store (for advanced usage)
export { useLensStore, getLensState } from './store'

// Service
export {
  createLensService,
  getLensService,
  resetLensService,
} from './service'

// Hooks
export {
  useLens,
  useLensContext,
  useIsImpersonating,
  useImpersonatedAddress,
  useRealAddress,
  useEffectiveAddress,
  useSavedAddresses,
  useLensActions,
} from './hooks'
