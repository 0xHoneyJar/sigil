/**
 * @sigil/simulation
 *
 * Transaction simulation against fork chains.
 */

// Types
export type {
  SimulationRequest,
  SimulationResult,
  SimulationService,
  BalanceChange,
  StateChange,
  SimulationLog,
} from './types'

export { SimulationError, SimulationErrorCodes } from './types'

// Service
export { createSimulationService } from './service'

// Re-export fork types for convenience
export type { ForkService, ForkState, ForkConfig } from '@thehoneyjar/sigil-fork'

// Singleton management
import type { ForkService } from '@thehoneyjar/sigil-fork'
import type { SimulationService } from './types'
import { createSimulationService } from './service'

/**
 * Default simulation service singleton
 */
let defaultSimulationService: SimulationService | null = null

/**
 * Get the default simulation service
 */
export function getSimulationService(forkService: ForkService): SimulationService {
  if (!defaultSimulationService) {
    defaultSimulationService = createSimulationService(forkService)
  }
  return defaultSimulationService
}

/**
 * Reset the default simulation service
 */
export function resetSimulationService(): void {
  defaultSimulationService = null
}
