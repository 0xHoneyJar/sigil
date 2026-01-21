/**
 * Anvil Fork Provider
 *
 * Fork service implementation using Anvil (local Ethereum node).
 */

import type { Address } from 'viem'
import type { ForkConfig, ForkService, ForkSnapshot, ForkState } from '../types'
import { ForkError, ForkErrorCodes } from '../types'

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
      throw new ForkError('Fork not active', ForkErrorCodes.NOT_ACTIVE)
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
      throw new ForkError(
        data.error.message || 'RPC error',
        ForkErrorCodes.RPC_ERROR
      )
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
        throw new ForkError(
          `Failed to connect to Anvil at ${rpcUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ForkErrorCodes.CONNECTION_FAILED
        )
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
