/**
 * Hook for managing fork chain state
 *
 * Provides React integration for fork service.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import type { Address } from 'viem'
import {
  createForkService,
  type ForkService,
  type ForkConfig,
  type ForkState,
  type ForkSnapshot,
  type ForkProvider,
} from '../services/fork'

/**
 * Fork state hook return type
 */
export interface UseForkStateReturn {
  /** Current fork state */
  state: ForkState
  /** Whether fork operation is in progress */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Create a new fork */
  createFork: (config: ForkConfig) => Promise<void>
  /** Take a snapshot */
  snapshot: (description?: string) => Promise<ForkSnapshot | null>
  /** Revert to a snapshot */
  revert: (snapshotId: string) => Promise<boolean>
  /** Reset fork to initial state */
  reset: () => Promise<void>
  /** Destroy the fork */
  destroy: () => Promise<void>
  /** Set account balance */
  setBalance: (address: Address, balance: bigint) => Promise<void>
  /** Impersonate an account */
  impersonateAccount: (address: Address) => Promise<void>
  /** Stop impersonating an account */
  stopImpersonating: (address: Address) => Promise<void>
  /** Mine blocks */
  mineBlock: (blocks?: number) => Promise<void>
  /** All snapshots taken */
  snapshots: ForkSnapshot[]
}

/**
 * Hook for managing fork chain state
 */
export function useForkState(defaultProvider: ForkProvider = 'anvil'): UseForkStateReturn {
  const [state, setState] = useState<ForkState>({
    active: false,
    rpcUrl: null,
    blockNumber: null,
    chainId: null,
    createdAt: null,
    snapshotCount: 0,
    currentSnapshotId: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [snapshots, setSnapshots] = useState<ForkSnapshot[]>([])

  const serviceRef = useRef<ForkService | null>(null)

  // Initialize service on mount
  useEffect(() => {
    serviceRef.current = createForkService(defaultProvider)
    return () => {
      if (serviceRef.current) {
        serviceRef.current.destroy()
        serviceRef.current = null
      }
    }
  }, [defaultProvider])

  const createFork = useCallback(async (config: ForkConfig) => {
    if (!serviceRef.current) {
      serviceRef.current = createForkService(config.provider)
    }

    setIsLoading(true)
    setError(null)

    try {
      const newState = await serviceRef.current.createFork(config)
      setState(newState)
      setSnapshots([])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create fork'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const snapshot = useCallback(async (description?: string): Promise<ForkSnapshot | null> => {
    if (!serviceRef.current) {
      setError('Fork service not initialized')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const snap = await serviceRef.current.snapshot(description)
      setSnapshots(prev => [...prev, snap])
      setState(serviceRef.current!.getState())
      return snap
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to take snapshot'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const revert = useCallback(async (snapshotId: string): Promise<boolean> => {
    if (!serviceRef.current) {
      setError('Fork service not initialized')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const success = await serviceRef.current.revert(snapshotId)
      if (success) {
        setState(serviceRef.current.getState())
      }
      return success
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to revert'
      setError(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(async () => {
    if (!serviceRef.current) {
      setError('Fork service not initialized')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await serviceRef.current.reset()
      setState(serviceRef.current.getState())
      setSnapshots([])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const destroy = useCallback(async () => {
    if (!serviceRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      await serviceRef.current.destroy()
      setState({
        active: false,
        rpcUrl: null,
        blockNumber: null,
        chainId: null,
        createdAt: null,
        snapshotCount: 0,
        currentSnapshotId: null,
      })
      setSnapshots([])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to destroy fork'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setBalance = useCallback(async (address: Address, balance: bigint) => {
    if (!serviceRef.current) {
      setError('Fork service not initialized')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await serviceRef.current.setBalance(address, balance)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set balance'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const impersonateAccount = useCallback(async (address: Address) => {
    if (!serviceRef.current) {
      setError('Fork service not initialized')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await serviceRef.current.impersonateAccount(address)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to impersonate account'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const stopImpersonating = useCallback(async (address: Address) => {
    if (!serviceRef.current) {
      setError('Fork service not initialized')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await serviceRef.current.stopImpersonating(address)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stop impersonating'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const mineBlock = useCallback(async (blocks = 1) => {
    if (!serviceRef.current) {
      setError('Fork service not initialized')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await serviceRef.current.mineBlock(blocks)
      setState(serviceRef.current.getState())
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mine block'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    state,
    isLoading,
    error,
    createFork,
    snapshot,
    revert,
    reset,
    destroy,
    setBalance,
    impersonateAccount,
    stopImpersonating,
    mineBlock,
    snapshots,
  }
}
