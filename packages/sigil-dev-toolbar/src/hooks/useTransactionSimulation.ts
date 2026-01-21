/**
 * Hook for Transaction Simulation
 *
 * Provides easy integration for simulating transactions against a fork.
 * Manages fork state, simulation service, and result caching.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Address, Hex } from 'viem'
import {
  createForkService,
  type ForkService,
  type ForkConfig,
  type ForkProvider,
} from '../services/fork'
import {
  createSimulationService,
  type SimulationService,
  type SimulationResult,
  type SimulationTransactionRequest,
} from '../services/simulation'

/**
 * Transaction request input for the hook
 */
export interface TransactionInput {
  /** Transaction recipient */
  to: Address
  /** Transaction data */
  data?: Hex
  /** Transaction value in wei */
  value?: bigint
  /** Gas limit (optional) */
  gas?: bigint
}

/**
 * Hook configuration
 */
export interface UseTransactionSimulationConfig {
  /** Fork provider (default: 'anvil') */
  provider?: ForkProvider
  /** Fork RPC URL (for custom provider) */
  forkUrl?: string
  /** Chain ID */
  chainId?: number
  /** Anvil port (default: 8545) */
  anvilPort?: number
  /** Auto-connect on mount */
  autoConnect?: boolean
  /** Sender address (will be impersonated) */
  from?: Address
}

/**
 * Hook return type
 */
export interface UseTransactionSimulationReturn {
  /** Latest simulation result */
  result: SimulationResult | null
  /** Whether simulation is running */
  isSimulating: boolean
  /** Whether fork is connected */
  isConnected: boolean
  /** Whether fork is connecting */
  isConnecting: boolean
  /** Error message if any */
  error: string | null
  /** Simulate a transaction */
  simulate: (tx: TransactionInput) => Promise<SimulationResult | null>
  /** Connect to fork */
  connect: (config?: Partial<ForkConfig>) => Promise<void>
  /** Disconnect from fork */
  disconnect: () => Promise<void>
  /** Clear the last result */
  clearResult: () => void
  /** Reset the fork state */
  reset: () => Promise<void>
}

/**
 * Hook for transaction simulation
 *
 * @example
 * ```tsx
 * const { result, isSimulating, error, simulate } = useTransactionSimulation({
 *   from: '0x...',
 *   autoConnect: true,
 * })
 *
 * const handleSimulate = async () => {
 *   await simulate({
 *     to: '0x...',
 *     data: '0x...',
 *     value: 0n,
 *   })
 * }
 * ```
 */
export function useTransactionSimulation(
  config: UseTransactionSimulationConfig = {}
): UseTransactionSimulationReturn {
  const {
    provider = 'anvil',
    forkUrl,
    chainId = 1,
    anvilPort = 8545,
    autoConnect = false,
    from,
  } = config

  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const forkServiceRef = useRef<ForkService | null>(null)
  const simulationServiceRef = useRef<SimulationService | null>(null)
  const fromAddressRef = useRef<Address | undefined>(from)

  // Update from address ref when prop changes
  useEffect(() => {
    fromAddressRef.current = from
  }, [from])

  // Connect to fork
  const connect = useCallback(async (overrideConfig?: Partial<ForkConfig>) => {
    if (isConnected || isConnecting) return

    setIsConnecting(true)
    setError(null)

    try {
      const forkConfig: ForkConfig = {
        provider: overrideConfig?.provider ?? provider,
        forkUrl: overrideConfig?.forkUrl ?? forkUrl ?? '',
        chainId: overrideConfig?.chainId ?? chainId,
        anvilPort: overrideConfig?.anvilPort ?? anvilPort,
        customForkRpc: overrideConfig?.customForkRpc,
      }

      // Create fork service
      forkServiceRef.current = createForkService(forkConfig.provider)
      await forkServiceRef.current.createFork(forkConfig)

      // Create simulation service
      simulationServiceRef.current = createSimulationService(forkServiceRef.current)

      setIsConnected(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect to fork'
      setError(message)
      forkServiceRef.current = null
      simulationServiceRef.current = null
    } finally {
      setIsConnecting(false)
    }
  }, [isConnected, isConnecting, provider, forkUrl, chainId, anvilPort])

  // Disconnect from fork
  const disconnect = useCallback(async () => {
    if (forkServiceRef.current) {
      await forkServiceRef.current.destroy()
      forkServiceRef.current = null
      simulationServiceRef.current = null
    }
    setIsConnected(false)
    setResult(null)
    setError(null)
  }, [])

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect()
    }
    return () => {
      // Cleanup on unmount
      if (forkServiceRef.current) {
        forkServiceRef.current.destroy()
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Simulate transaction
  const simulate = useCallback(async (tx: TransactionInput): Promise<SimulationResult | null> => {
    if (!simulationServiceRef.current || !forkServiceRef.current) {
      setError('Not connected to fork. Call connect() first.')
      return null
    }

    const senderAddress = fromAddressRef.current
    if (!senderAddress) {
      setError('No sender address provided. Set "from" in config.')
      return null
    }

    setIsSimulating(true)
    setError(null)

    try {
      const request: SimulationTransactionRequest = {
        from: senderAddress,
        to: tx.to,
        data: tx.data,
        value: tx.value,
        gas: tx.gas,
      }

      const simResult = await simulationServiceRef.current.simulate(request)
      setResult(simResult)
      return simResult
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Simulation failed'
      setError(message)
      return null
    } finally {
      setIsSimulating(false)
    }
  }, [])

  // Clear result
  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  // Reset fork state
  const reset = useCallback(async () => {
    if (forkServiceRef.current) {
      await forkServiceRef.current.reset()
      setResult(null)
      setError(null)
    }
  }, [])

  return {
    result,
    isSimulating,
    isConnected,
    isConnecting,
    error,
    simulate,
    connect,
    disconnect,
    clearResult,
    reset,
  }
}

/**
 * Hook for simulation with automatic fork management
 *
 * Simplified version that auto-connects and manages fork lifecycle.
 *
 * @example
 * ```tsx
 * const { result, isSimulating, simulate } = useSimulation('0x...')
 *
 * // Simulate a simple transfer
 * await simulate({
 *   to: recipientAddress,
 *   value: parseEther('1'),
 * })
 * ```
 */
export function useSimulation(
  from: Address,
  options: Omit<UseTransactionSimulationConfig, 'from' | 'autoConnect'> = {}
): Omit<UseTransactionSimulationReturn, 'connect' | 'disconnect'> {
  const hook = useTransactionSimulation({
    ...options,
    from,
    autoConnect: true,
  })

  // Destructure to omit connect/disconnect from return
  const { connect: _connect, disconnect: _disconnect, ...rest } = hook
  return rest
}
