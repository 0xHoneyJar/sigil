/**
 * Observation Capture Hook
 *
 * Capture user observations and insights from HUD.
 */

import { useCallback, useRef } from 'react'
import type { Observation } from '../types'

/**
 * Props for useObservationCapture
 */
export interface UseObservationCaptureProps {
  /** Whether observation capture is enabled */
  enabled?: boolean
  /** Callback when observation is captured */
  onObservation?: (observation: Observation) => void
}

/**
 * Generate a unique observation ID
 */
function generateObservationId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 7)
  return `obs-${timestamp}-${random}`
}

/**
 * Hook to capture observations from HUD
 */
export function useObservationCapture({
  enabled = true,
  onObservation,
}: UseObservationCaptureProps = {}) {
  const observationsRef = useRef<Observation[]>([])

  /**
   * Capture a new observation
   */
  const capture = useCallback(
    async (
      content: string,
      type: Observation['type'] = 'insight',
      context?: Observation['context'],
      tags: string[] = []
    ): Promise<Observation> => {
      const observation: Observation = {
        id: generateObservationId(),
        timestamp: new Date().toISOString(),
        type,
        content,
        tags,
        context,
      }

      if (enabled) {
        // Store locally
        observationsRef.current.push(observation)

        // Notify callback
        onObservation?.(observation)

        // In a full implementation, this would write to grimoires/sigil/observations/
        if (process.env.NODE_ENV === 'development') {
          console.log('[Sigil HUD] Observation captured:', observation)
        }
      }

      return observation
    },
    [enabled, onObservation]
  )

  /**
   * Capture a user truth observation
   */
  const captureUserTruth = useCallback(
    (content: string, context?: Observation['context']) => {
      return capture(content, 'user-truth', context, ['user-truth'])
    },
    [capture]
  )

  /**
   * Capture an issue observation
   */
  const captureIssue = useCallback(
    (content: string, context?: Observation['context']) => {
      return capture(content, 'issue', context, ['issue'])
    },
    [capture]
  )

  /**
   * Capture an insight observation
   */
  const captureInsight = useCallback(
    (content: string, context?: Observation['context']) => {
      return capture(content, 'insight', context, ['insight'])
    },
    [capture]
  )

  /**
   * Link an observation to signals
   */
  const linkToSignals = useCallback(
    (observationId: string, signalIds: string[]) => {
      const observation = observationsRef.current.find(
        (o) => o.id === observationId
      )
      if (observation) {
        observation.linkedSignals = [
          ...(observation.linkedSignals ?? []),
          ...signalIds,
        ]
      }
    },
    []
  )

  /**
   * Get all captured observations
   */
  const getObservations = useCallback(() => {
    return [...observationsRef.current]
  }, [])

  /**
   * Get observations by type
   */
  const getObservationsByType = useCallback((type: Observation['type']) => {
    return observationsRef.current.filter((o) => o.type === type)
  }, [])

  /**
   * Clear captured observations
   */
  const clearObservations = useCallback(() => {
    observationsRef.current = []
  }, [])

  return {
    capture,
    captureUserTruth,
    captureIssue,
    captureInsight,
    linkToSignals,
    getObservations,
    getObservationsByType,
    clearObservations,
  }
}
