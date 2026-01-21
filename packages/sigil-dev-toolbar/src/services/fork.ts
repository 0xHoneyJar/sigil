/**
 * Fork Chain State Service
 *
 * Provides integration with Anvil/Tenderly for chain state forking.
 * Enables transaction simulation without real funds.
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
 * Create an Anvil-based fork service
 */
export function createAnvilForkService(): ForkService {
  let state: ForkState = {
    active: false,
    rpcUrl: null,
    blockNumber: null,
    chainId: null,
    createdAt: null,
    snapshotCount: 0,
    currentSnapshotId: null,
  }

  const snapshots: Map<string, ForkSnapshot> = new Map()

  async function jsonRpc(method: string, params: unknown[] = []): Promise<unknown> {
    if (!state.rpcUrl) {
      throw new Error('Fork not active')
    }

    const response = await fetch(state.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      }),
    })

    const data = await response.json()
    if (data.error) {
      throw new Error(data.error.message || 'RPC error')
    }
    return data.result
  }

  return {
    async createFork(config: ForkConfig): Promise<ForkState> {
      // For Anvil, we assume it's already running at the specified port
      // In a real implementation, we might spawn Anvil as a subprocess
      const rpcUrl = config.customForkRpc || `http://127.0.0.1:${config.anvilPort || 8545}`

      try {
        // Test connection and get chain ID
        const chainIdHex = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_chainId',
            params: [],
          }),
        }).then(r => r.json()).then(d => d.result)

        const blockNumberHex = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'eth_blockNumber',
            params: [],
          }),
        }).then(r => r.json()).then(d => d.result)

        state = {
          active: true,
          rpcUrl,
          blockNumber: BigInt(blockNumberHex),
          chainId: parseInt(chainIdHex, 16),
          createdAt: Date.now(),
          snapshotCount: 0,
          currentSnapshotId: null,
        }

        return state
      } catch (error) {
        throw new Error(`Failed to connect to Anvil at ${rpcUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    },

    getState(): ForkState {
      return { ...state }
    },

    async snapshot(description?: string): Promise<ForkSnapshot> {
      const result = await jsonRpc('evm_snapshot') as string
      const id = result

      const blockNumberHex = await jsonRpc('eth_blockNumber') as string
      const snapshot: ForkSnapshot = {
        id,
        blockNumber: BigInt(blockNumberHex),
        timestamp: Date.now(),
        description,
      }

      snapshots.set(id, snapshot)
      state.snapshotCount++
      state.currentSnapshotId = id

      return snapshot
    },

    async revert(snapshotId: string): Promise<boolean> {
      const result = await jsonRpc('evm_revert', [snapshotId]) as boolean
      if (result) {
        state.currentSnapshotId = snapshotId
      }
      return result
    },

    async reset(): Promise<void> {
      await jsonRpc('anvil_reset')
      snapshots.clear()
      state.snapshotCount = 0
      state.currentSnapshotId = null
    },

    async destroy(): Promise<void> {
      state = {
        active: false,
        rpcUrl: null,
        blockNumber: null,
        chainId: null,
        createdAt: null,
        snapshotCount: 0,
        currentSnapshotId: null,
      }
      snapshots.clear()
    },

    async setBalance(address: Address, balance: bigint): Promise<void> {
      await jsonRpc('anvil_setBalance', [address, `0x${balance.toString(16)}`])
    },

    async impersonateAccount(address: Address): Promise<void> {
      await jsonRpc('anvil_impersonateAccount', [address])
    },

    async stopImpersonating(address: Address): Promise<void> {
      await jsonRpc('anvil_stopImpersonatingAccount', [address])
    },

    async mineBlock(blocks = 1): Promise<void> {
      await jsonRpc('anvil_mine', [blocks])
    },

    getRpcUrl(): string | null {
      return state.rpcUrl
    },
  }
}

/**
 * Create a Tenderly-based fork service
 */
export function createTenderlyForkService(): ForkService {
  let state: ForkState = {
    active: false,
    rpcUrl: null,
    blockNumber: null,
    chainId: null,
    createdAt: null,
    snapshotCount: 0,
    currentSnapshotId: null,
  }

  let forkId: string | null = null
  let config: ForkConfig | null = null

  async function tenderlyApi(endpoint: string, method = 'GET', body?: unknown): Promise<unknown> {
    if (!config?.tenderlyApiKey || !config?.tenderlyProject) {
      throw new Error('Tenderly API key and project required')
    }

    const response = await fetch(`https://api.tenderly.co/api/v1/account/${config.tenderlyProject}/project/${config.tenderlyProject}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': config.tenderlyApiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      throw new Error(`Tenderly API error: ${response.statusText}`)
    }

    return response.json()
  }

  return {
    async createFork(cfg: ForkConfig): Promise<ForkState> {
      config = cfg

      const forkResponse = await tenderlyApi('/fork', 'POST', {
        network_id: cfg.chainId.toString(),
        block_number: cfg.forkBlockNumber ? Number(cfg.forkBlockNumber) : undefined,
      }) as { simulation_fork: { id: string; block_number: number; rpc_url: string } }

      forkId = forkResponse.simulation_fork.id

      state = {
        active: true,
        rpcUrl: forkResponse.simulation_fork.rpc_url,
        blockNumber: BigInt(forkResponse.simulation_fork.block_number),
        chainId: cfg.chainId,
        createdAt: Date.now(),
        snapshotCount: 0,
        currentSnapshotId: null,
      }

      return state
    },

    getState(): ForkState {
      return { ...state }
    },

    async snapshot(description?: string): Promise<ForkSnapshot> {
      if (!forkId) throw new Error('Fork not active')

      const response = await tenderlyApi(`/fork/${forkId}/snapshot`, 'POST') as { snapshot: { id: string; block_number: number } }

      const snapshot: ForkSnapshot = {
        id: response.snapshot.id,
        blockNumber: BigInt(response.snapshot.block_number),
        timestamp: Date.now(),
        description,
      }

      state.snapshotCount++
      state.currentSnapshotId = snapshot.id

      return snapshot
    },

    async revert(snapshotId: string): Promise<boolean> {
      if (!forkId) throw new Error('Fork not active')

      try {
        await tenderlyApi(`/fork/${forkId}/snapshot/${snapshotId}`, 'PUT')
        state.currentSnapshotId = snapshotId
        return true
      } catch {
        return false
      }
    },

    async reset(): Promise<void> {
      if (!forkId || !config) throw new Error('Fork not active')

      // Delete and recreate the fork
      await tenderlyApi(`/fork/${forkId}`, 'DELETE')
      await this.createFork(config)
    },

    async destroy(): Promise<void> {
      if (forkId) {
        try {
          await tenderlyApi(`/fork/${forkId}`, 'DELETE')
        } catch {
          // Ignore errors during cleanup
        }
      }

      state = {
        active: false,
        rpcUrl: null,
        blockNumber: null,
        chainId: null,
        createdAt: null,
        snapshotCount: 0,
        currentSnapshotId: null,
      }
      forkId = null
      config = null
    },

    async setBalance(address: Address, balance: bigint): Promise<void> {
      if (!state.rpcUrl) throw new Error('Fork not active')

      await fetch(state.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tenderly_setBalance',
          params: [address, `0x${balance.toString(16)}`],
        }),
      })
    },

    async impersonateAccount(_address: Address): Promise<void> {
      // Tenderly handles impersonation differently - not needed for basic fork
    },

    async stopImpersonating(_address: Address): Promise<void> {
      // Tenderly handles impersonation differently - not needed for basic fork
    },

    async mineBlock(blocks = 1): Promise<void> {
      if (!state.rpcUrl) throw new Error('Fork not active')

      await fetch(state.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'evm_increaseTime',
          params: [blocks * 12], // 12 seconds per block
        }),
      })
    },

    getRpcUrl(): string | null {
      return state.rpcUrl
    },
  }
}

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
