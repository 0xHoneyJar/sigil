/**
 * @sigil/fork
 *
 * Fork chain state for local testing with Anvil and Tenderly integration.
 */

// Types
export type {
  ForkProvider,
  ForkConfig,
  ForkState,
  ForkSnapshot,
  ForkService,
} from './types'

export { ForkError, ForkErrorCodes } from './types'

// Providers
export { createAnvilForkService } from './providers/anvil'
export { createTenderlyForkService } from './providers/tenderly'

// Factory function
import type { ForkProvider, ForkService } from './types'
import { createAnvilForkService } from './providers/anvil'
import { createTenderlyForkService } from './providers/tenderly'

/**
 * Create a fork service based on provider type
 */
export function createForkService(provider: ForkProvider): ForkService {
  switch (provider) {
    case 'anvil':
      return createAnvilForkService()
    case 'tenderly':
      return createTenderlyForkService()
    case 'custom':
      return createAnvilForkService() // Custom uses same interface as Anvil
    default:
      throw new Error(`Unknown fork provider: ${provider}`)
  }
}

/**
 * Default fork service singleton
 */
let defaultForkService: ForkService | null = null

/**
 * Get the default fork service
 */
export function getForkService(provider: ForkProvider = 'anvil'): ForkService {
  if (!defaultForkService) {
    defaultForkService = createForkService(provider)
  }
  return defaultForkService
}

/**
 * Reset the default fork service
 */
export function resetForkService(): void {
  if (defaultForkService) {
    defaultForkService.destroy()
    defaultForkService = null
  }
}
