/**
 * Fork Service Types
 *
 * Core types for fork chain state management.
 */

import type { Address } from 'viem'

/**
 * Fork provider type
 */
export type ForkProvider = 'anvil' | 'tenderly' | 'custom'

/**
 * Fork configuration
 */
export interface ForkConfig {
  /** Fork provider type */
  provider: ForkProvider
  /** RPC URL to fork from (mainnet, testnet, etc.) */
  forkUrl: string
  /** Block number to fork at (undefined = latest) */
  forkBlockNumber?: bigint
  /** Chain ID for the fork */
  chainId: number
  /** Anvil-specific: port to run on */
  anvilPort?: number
  /** Tenderly-specific: project slug */
  tenderlyProject?: string
  /** Tenderly-specific: API key */
  tenderlyApiKey?: string
  /** Custom fork RPC URL (when provider = 'custom') */
  customForkRpc?: string
}

/**
 * Fork state
 */
export interface ForkState {
  /** Whether fork is active */
  active: boolean
  /** Fork RPC URL */
  rpcUrl: string | null
  /** Block number fork was created at */
  blockNumber: bigint | null
  /** Chain ID */
  chainId: number | null
  /** Fork creation timestamp */
  createdAt: number | null
  /** Number of snapshots taken */
  snapshotCount: number
  /** Current snapshot ID */
  currentSnapshotId: string | null
}

/**
 * Fork snapshot for state restoration
 */
export interface ForkSnapshot {
  id: string
  blockNumber: bigint
  timestamp: number
  description?: string
}

/**
 * Fork service interface
 */
export interface ForkService {
  /** Create a new fork */
  createFork(config: ForkConfig): Promise<ForkState>
  /** Get current fork state */
  getState(): ForkState
  /** Take a snapshot of current fork state */
  snapshot(description?: string): Promise<ForkSnapshot>
  /** Revert to a snapshot */
  revert(snapshotId: string): Promise<boolean>
  /** Reset fork to initial state */
  reset(): Promise<void>
  /** Destroy the fork */
  destroy(): Promise<void>
  /** Set account balance (for testing) */
  setBalance(address: Address, balance: bigint): Promise<void>
  /** Impersonate an address (for testing) */
  impersonateAccount(address: Address): Promise<void>
  /** Stop impersonating an address */
  stopImpersonating(address: Address): Promise<void>
  /** Mine a block */
  mineBlock(blocks?: number): Promise<void>
  /** Get fork RPC URL */
  getRpcUrl(): string | null
}

/**
 * Fork error
 */
export class ForkError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true
  ) {
    super(message)
    this.name = 'ForkError'
  }
}

/**
 * Fork error codes
 */
export const ForkErrorCodes = {
  NOT_ACTIVE: 'FORK_NOT_ACTIVE',
  CONNECTION_FAILED: 'FORK_CONNECTION_FAILED',
  SNAPSHOT_FAILED: 'FORK_SNAPSHOT_FAILED',
  REVERT_FAILED: 'FORK_REVERT_FAILED',
  RPC_ERROR: 'FORK_RPC_ERROR',
} as const
