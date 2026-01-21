/**
 * Signal Capture Hook
 *
 * Capture taste signals from HUD interactions.
 */

import { useCallback, useRef } from 'react'
import type { Signal } from '../types'

/**
 * Props for useSignalCapture
 */
export interface UseSignalCaptureProps {
  /** Whether signal capture is enabled */
  enabled?: boolean
  /** Callback when signal is captured */
  onSignal?: (signal: Signal) => void
}

/**
 * Hook to capture taste signals from HUD
 */
export function useSignalCapture({
  enabled = true,
  onSignal,
}: UseSignalCaptureProps = {}) {
  const signalsRef = useRef<Signal[]>([])

  /**
   * Append a signal to the taste log
   */
  const appendSignal = useCallback(
    async (signalData: Omit<Signal, 'timestamp' | 'source'>): Promise<void> => {
      if (!enabled) return

      const signal: Signal = {
        ...signalData,
        timestamp: new Date().toISOString(),
        source: 'hud',
      }

      // Store locally
      signalsRef.current.push(signal)

      // Notify callback
      onSignal?.(signal)

      // In a full implementation, this would write to grimoires/sigil/taste.md
      // For now, we log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Sigil HUD] Signal captured:', signal)
      }
    },
    [enabled, onSignal]
  )

  /**
   * Create an ACCEPT signal
   */
  const accept = useCallback(
    (component: string, effect: string, craftType: Signal['component']['craft_type'] = 'generate') => {
      return appendSignal({
        signal: 'ACCEPT',
        component: {
          name: component,
          effect,
          craft_type: craftType,
        },
      })
    },
    [appendSignal]
  )

  /**
   * Create a MODIFY signal
   */
  const modify = useCallback(
    (
      component: string,
      effect: string,
      change: { from: string; to: string },
      learning?: { inference: string; recommendation?: string }
    ) => {
      return appendSignal({
        signal: 'MODIFY',
        component: {
          name: component,
          effect,
          craft_type: 'generate',
        },
        change,
        learning,
      })
    },
    [appendSignal]
  )

  /**
   * Create a REJECT signal
   */
  const reject = useCallback(
    (component: string, effect: string, reason: string) => {
      return appendSignal({
        signal: 'REJECT',
        component: {
          name: component,
          effect,
          craft_type: 'generate',
        },
        rejection_reason: reason,
      })
    },
    [appendSignal]
  )

  /**
   * Get all captured signals
   */
  const getSignals = useCallback(() => {
    return [...signalsRef.current]
  }, [])

  /**
   * Clear captured signals
   */
  const clearSignals = useCallback(() => {
    signalsRef.current = []
  }, [])

  return {
    appendSignal,
    accept,
    modify,
    reject,
    getSignals,
    clearSignals,
  }
}
