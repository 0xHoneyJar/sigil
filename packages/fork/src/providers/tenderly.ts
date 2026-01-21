/**
 * Tenderly Fork Provider
 *
 * Fork service implementation using Tenderly's fork API.
 */

import type { Address } from 'viem'
import type { ForkConfig, ForkService, ForkSnapshot, ForkState } from '../types'
import { ForkError, ForkErrorCodes } from '../types'

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
      throw new ForkError(
        'Tenderly API key and project required',
        ForkErrorCodes.CONNECTION_FAILED
      )
    }

    const response = await fetch(
      `https://api.tenderly.co/api/v1/account/${config.tenderlyProject}/project/${config.tenderlyProject}${endpoint}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': config.tenderlyApiKey,
        },
        body: body ? JSON.stringify(body) : undefined,
      }
    )

    if (!response.ok) {
      throw new ForkError(
        `Tenderly API error: ${response.statusText}`,
        ForkErrorCodes.RPC_ERROR
      )
    }

    return response.json()
  }

  const service: ForkService = {
    async createFork(cfg: ForkConfig): Promise<ForkState> {
      config = cfg

      const forkResponse = (await tenderlyApi('/fork', 'POST', {
        network_id: cfg.chainId.toString(),
        block_number: cfg.forkBlockNumber ? Number(cfg.forkBlockNumber) : undefined,
      })) as { simulation_fork: { id: string; block_number: number; rpc_url: string } }

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
      if (!forkId) {
        throw new ForkError('Fork not active', ForkErrorCodes.NOT_ACTIVE)
      }

      const response = (await tenderlyApi(`/fork/${forkId}/snapshot`, 'POST')) as {
        snapshot: { id: string; block_number: number }
      }

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
      if (!forkId) {
        throw new ForkError('Fork not active', ForkErrorCodes.NOT_ACTIVE)
      }

      try {
        await tenderlyApi(`/fork/${forkId}/snapshot/${snapshotId}`, 'PUT')
        state.currentSnapshotId = snapshotId
        return true
      } catch {
        return false
      }
    },

    async reset(): Promise<void> {
      if (!forkId || !config) {
        throw new ForkError('Fork not active', ForkErrorCodes.NOT_ACTIVE)
      }

      // Delete and recreate the fork
      await tenderlyApi(`/fork/${forkId}`, 'DELETE')
      await service.createFork(config)
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
      if (!state.rpcUrl) {
        throw new ForkError('Fork not active', ForkErrorCodes.NOT_ACTIVE)
      }

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
      if (!state.rpcUrl) {
        throw new ForkError('Fork not active', ForkErrorCodes.NOT_ACTIVE)
      }

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

  return service
}
