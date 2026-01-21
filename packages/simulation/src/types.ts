/**
 * Simulation Service Types
 */

import type { Address, Hash, Hex } from 'viem'

/**
 * Transaction request for simulation
 */
export interface SimulationRequest {
  /** Transaction sender */
  from: Address
  /** Transaction recipient */
  to: Address
  /** Transaction value in wei */
  value?: bigint
  /** Transaction data */
  data?: Hex
  /** Gas limit (optional, will be estimated if not provided) */
  gas?: bigint
  /** Gas price (optional) */
  gasPrice?: bigint
  /** Max fee per gas (EIP-1559) */
  maxFeePerGas?: bigint
  /** Max priority fee per gas (EIP-1559) */
  maxPriorityFeePerGas?: bigint
  /** Nonce (optional, will be fetched if not provided) */
  nonce?: number
}

/**
 * Balance change from simulation
 */
export interface BalanceChange {
  /** Address whose balance changed */
  address: Address
  /** Token address (null for ETH) */
  token: Address | null
  /** Token symbol (if known) */
  symbol?: string
  /** Balance before transaction */
  before: bigint
  /** Balance after transaction */
  after: bigint
  /** Change amount (can be negative) */
  delta: bigint
}

/**
 * State change from simulation
 */
export interface StateChange {
  /** Contract address */
  address: Address
  /** Storage slot */
  slot: Hex
  /** Value before transaction */
  before: Hex
  /** Value after transaction */
  after: Hex
}

/**
 * Event log from simulation
 */
export interface SimulationLog {
  /** Contract address that emitted the log */
  address: Address
  /** Log topics */
  topics: Hex[]
  /** Log data */
  data: Hex
  /** Decoded event name (if ABI available) */
  eventName?: string
  /** Decoded event args (if ABI available) */
  decodedArgs?: Record<string, unknown>
}

/**
 * Simulation result
 */
export interface SimulationResult {
  /** Whether transaction succeeded */
  success: boolean
  /** Transaction hash (from simulation) */
  hash?: Hash
  /** Gas used */
  gasUsed: bigint
  /** Gas limit */
  gasLimit: bigint
  /** Effective gas price */
  effectiveGasPrice: bigint
  /** Total cost in wei (gasUsed * effectiveGasPrice + value) */
  totalCost: bigint
  /** Return value (if any) */
  returnValue?: Hex
  /** Revert reason (if failed) */
  revertReason?: string
  /** Balance changes */
  balanceChanges: BalanceChange[]
  /** State changes */
  stateChanges: StateChange[]
  /** Event logs */
  logs: SimulationLog[]
  /** Block number simulation was run at */
  blockNumber: bigint
  /** Timestamp of simulation */
  timestamp: number
}

/**
 * Simulation service interface
 */
export interface SimulationService {
  /** Simulate a transaction */
  simulate(tx: SimulationRequest): Promise<SimulationResult>
  /** Estimate gas for a transaction */
  estimateGas(tx: SimulationRequest): Promise<bigint>
  /** Get current gas price */
  getGasPrice(): Promise<bigint>
  /** Decode revert reason from error data */
  decodeRevertReason(data: Hex): string | null
}

/**
 * Simulation error
 */
export class SimulationError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true
  ) {
    super(message)
    this.name = 'SimulationError'
  }
}

/**
 * Simulation error codes
 */
export const SimulationErrorCodes = {
  FORK_NOT_ACTIVE: 'SIMULATION_FORK_NOT_ACTIVE',
  TRANSACTION_FAILED: 'SIMULATION_TRANSACTION_FAILED',
  IMPERSONATION_FAILED: 'SIMULATION_IMPERSONATION_FAILED',
  GAS_ESTIMATION_FAILED: 'SIMULATION_GAS_ESTIMATION_FAILED',
} as const
