/**
 * React hook for IPC Client
 */

import { useState, useCallback, useRef } from 'react'
import { getIPCClient, type IPCClient } from '../ipc/client'
import type { LensValidateResponse, AnchorValidateResponse } from '../ipc/types'
import type { LensContext, Zone } from '../types'

export interface UseIPCClientReturn {
  /** Validate lens context */
  validateLens: (context: LensContext, zone?: Zone) => Promise<LensValidateResponse>
  /** Validate with Anchor */
  validateAnchor: (statement?: string, lensContext?: LensContext, zone?: Zone) => Promise<AnchorValidateResponse>
  /** Whether a request is in progress */
  isLoading: boolean
  /** Last error message */
  error: string | null
  /** Clear error */
  clearError: () => void
}

/**
 * Hook for using the IPC client in components
 */
export function useIPCClient(): UseIPCClientReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const clientRef = useRef<IPCClient | null>(null)

  // Get or create client
  const getClient = useCallback((): IPCClient => {
    if (!clientRef.current) {
      clientRef.current = getIPCClient()
    }
    return clientRef.current
  }, [])

  // Validate lens context
  const validateLens = useCallback(
    async (context: LensContext, zone?: Zone): Promise<LensValidateResponse> => {
      setIsLoading(true)
      setError(null)
      try {
        const client = getClient()
        const result = await client.validateLensContext(context, zone)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [getClient]
  )

  // Validate with Anchor
  const validateAnchor = useCallback(
    async (
      statement?: string,
      lensContext?: LensContext,
      zone?: Zone
    ): Promise<AnchorValidateResponse> => {
      setIsLoading(true)
      setError(null)
      try {
        const client = getClient()
        const result = await client.validateAnchor(statement, lensContext, zone)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [getClient]
  )

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    validateLens,
    validateAnchor,
    isLoading,
    error,
    clearError,
  }
}
