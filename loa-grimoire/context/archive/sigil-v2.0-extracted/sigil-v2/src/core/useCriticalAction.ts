// Sigil v2.0 — Core: useCriticalAction
// Physics engine for high-stakes actions with time authority and proprioception

import { useState, useCallback, useRef, useId } from 'react';
import type {
  CriticalAction,
  CriticalActionOptions,
  CriticalActionState,
  SelfPredictionState,
  WorldTruthState,
  TimeAuthority,
  ProprioceptiveConfig,
} from '../types';
import { useLocalCache } from './useLocalCache';

const INITIAL_SELF_PREDICTION: SelfPredictionState = {
  position: null,
  rotation: null,
  animation: null,
};

const INITIAL_WORLD_TRUTH: WorldTruthState = {
  confirmed: false,
};

/**
 * useCriticalAction — Core physics engine for high-stakes actions
 * 
 * Handles:
 * - Time Authority (optimistic, server-tick, hybrid)
 * - Proprioception (self predictions vs world truth)
 * - State streaming to lenses
 * 
 * @example
 * ```tsx
 * const payment = useCriticalAction({
 *   mutation: () => api.pay(amount),
 *   timeAuthority: 'server-tick',
 *   proprioception: {
 *     self: { rotation: { instant: true } },
 *     world: { balance: 'server-only' },
 *   },
 * });
 * 
 * <Lens.CriticalButton state={payment.state} onAction={payment.commit}>
 *   Pay ${amount}
 * </Lens.CriticalButton>
 * ```
 */
export function useCriticalAction<TData, TVariables = void>(
  options: CriticalActionOptions<TData, TVariables>
): CriticalAction<TData, TVariables> {
  const {
    mutation,
    timeAuthority,
    proprioception,
    optimistic,
    rollback,
    onSuccess,
    onError,
  } = options;

  const id = useId();
  const cache = useLocalCache();
  const predictionStartRef = useRef<number | null>(null);
  const variablesRef = useRef<TVariables | null>(null);

  const [state, setState] = useState<CriticalActionState<TData>>({
    status: 'idle',
    timeAuthority,
    selfPrediction: INITIAL_SELF_PREDICTION,
    worldTruth: INITIAL_WORLD_TRUTH,
    risk: 'medium',
    progress: null,
    error: null,
    data: null,
  });

  /**
   * Apply self-predictions (legal lies for responsive feel)
   */
  const applySelfPredictions = useCallback(
    (variables: TVariables) => {
      if (!proprioception?.self) return;

      const selfPrediction: SelfPredictionState = { ...INITIAL_SELF_PREDICTION };

      // Rotation prediction (instant feel)
      if (proprioception.self.rotation?.instant) {
        selfPrediction.rotation = calculateRotation(variables);
      }

      // Animation prediction (start immediately)
      if (proprioception.self.animation?.optimistic) {
        selfPrediction.animation = inferAnimation(variables);
      }

      // Position prediction (ghost/solid)
      if (proprioception.self.position?.enabled) {
        predictionStartRef.current = Date.now();
        selfPrediction.position = {
          predicted: extractPosition(variables),
          confidence: 1,
          render: proprioception.self.position.render,
        };
      }

      setState((s) => ({ ...s, selfPrediction }));
    },
    [proprioception]
  );

  /**
   * Update prediction confidence over time
   */
  const updatePredictionConfidence = useCallback(() => {
    if (!predictionStartRef.current || !proprioception?.self?.position) return;

    const drift = Date.now() - predictionStartRef.current;
    const maxDrift = proprioception.self.position.maxDrift;
    const confidence = Math.max(0, 1 - drift / maxDrift);

    setState((s) => {
      if (!s.selfPrediction.position) return s;
      return {
        ...s,
        selfPrediction: {
          ...s.selfPrediction,
          position: {
            ...s.selfPrediction.position,
            confidence,
          },
        },
      };
    });

    return drift >= maxDrift;
  }, [proprioception]);

  /**
   * Reconcile self-predictions with server truth
   */
  const reconcilePredictions = useCallback(
    async (serverData: TData) => {
      if (!proprioception?.self?.position) return;

      const { reconcile } = proprioception.self.position;
      const serverPosition = extractPositionFromResult(serverData);

      if (reconcile === 'lerp') {
        // Smooth interpolation to server truth
        await lerpToPosition(serverPosition);
      } else if (reconcile === 'snap') {
        // Instant correction
        // (handled by clearing prediction state)
      }
      // 'ignore' keeps prediction (dangerous, rarely used)
    },
    [proprioception]
  );

  /**
   * Commit the action
   */
  const commit = useCallback(
    async (variables: TVariables) => {
      variablesRef.current = variables;

      // Apply self-predictions immediately (legal lies)
      applySelfPredictions(variables);

      // Handle based on time authority
      switch (timeAuthority) {
        case 'optimistic':
          // Client owns clock - instant update
          if (optimistic) {
            optimistic(cache, variables);
          }
          setState((s) => ({ ...s, status: 'pending' }));
          break;

        case 'server-tick':
          // Server owns clock
          if (proprioception?.self?.position?.enabled) {
            // Prediction allowed for feel, but status is pending
            setState((s) => ({ ...s, status: 'pending' }));
            
            // Start confidence decay
            const interval = setInterval(() => {
              const expired = updatePredictionConfidence();
              if (expired) clearInterval(interval);
            }, 100);
          } else {
            // No prediction - just wait
            setState((s) => ({ ...s, status: 'pending' }));
          }
          break;

        case 'hybrid':
          // Optimistic with sync indicator
          if (optimistic) {
            optimistic(cache, variables);
          }
          setState((s) => ({ ...s, status: 'pending' }));
          break;
      }

      try {
        const result = await mutation(variables);

        // Reconcile predictions with server truth
        await reconcilePredictions(result);

        // Update state
        setState((s) => ({
          ...s,
          status: 'confirmed',
          selfPrediction: INITIAL_SELF_PREDICTION,
          worldTruth: { confirmed: true },
          data: result,
          error: null,
        }));

        onSuccess?.(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        // Rollback
        if (rollback && variablesRef.current) {
          rollback(cache, variablesRef.current);
        }

        // Error visibility based on time authority
        const showError = timeAuthority !== 'optimistic';

        setState((s) => ({
          ...s,
          status: showError ? 'failed' : 'idle',
          selfPrediction: INITIAL_SELF_PREDICTION,
          worldTruth: { confirmed: false },
          error: showError ? error : null,
          data: null,
        }));

        if (showError) {
          onError?.(error);
        }
      }
    },
    [
      mutation,
      timeAuthority,
      proprioception,
      optimistic,
      rollback,
      cache,
      applySelfPredictions,
      updatePredictionConfidence,
      reconcilePredictions,
      onSuccess,
      onError,
    ]
  );

  /**
   * Cancel the action
   */
  const cancel = useCallback(() => {
    if (rollback && variablesRef.current) {
      rollback(cache, variablesRef.current);
    }
    setState((s) => ({
      ...s,
      status: 'idle',
      selfPrediction: INITIAL_SELF_PREDICTION,
      error: null,
    }));
    predictionStartRef.current = null;
  }, [rollback, cache]);

  /**
   * Retry after failure
   */
  const retry = useCallback(() => {
    setState((s) => ({
      ...s,
      status: 'idle',
      error: null,
    }));
  }, []);

  return { state, commit, cancel, retry };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function calculateRotation<T>(variables: T): number {
  // Extract target position and calculate rotation
  // This is application-specific
  const target = (variables as any)?.target;
  if (target && typeof target.x === 'number' && typeof target.y === 'number') {
    return Math.atan2(target.y, target.x);
  }
  return 0;
}

function inferAnimation<T>(variables: T): string {
  // Infer animation from action type
  const action = (variables as any)?.action || (variables as any)?.type;
  if (action === 'move') return 'walking';
  if (action === 'attack') return 'attacking';
  return 'idle';
}

function extractPosition<T>(variables: T): unknown {
  return (variables as any)?.target || (variables as any)?.position;
}

function extractPositionFromResult<T>(result: T): unknown {
  return (result as any)?.position || (result as any)?.target;
}

async function lerpToPosition(target: unknown): Promise<void> {
  // Smooth interpolation implementation
  // This would integrate with your animation system
  return new Promise((resolve) => setTimeout(resolve, 200));
}
