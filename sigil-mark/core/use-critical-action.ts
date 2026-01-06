/**
 * Sigil v2.0 — useCriticalAction Hook
 *
 * The primary physics engine hook. Emits state streams that lenses consume.
 * Supports three time authorities: optimistic, server-tick, hybrid.
 *
 * @module core/useCriticalAction
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  CriticalActionOptions,
  CriticalActionState,
  CriticalAction,
  Cache,
} from './types';
import { createInitialState } from './types';
import { createProprioception, type ProprioceptionManager } from './proprioception';
import { createCache } from './use-local-cache';

// Global cache instance (in production, use context or state management)
const globalCache = createCache();

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * useCriticalAction — Physics engine hook for critical actions.
 *
 * Emits a state stream that lenses consume. Supports three time authorities:
 *
 * - `optimistic` — Client owns clock. Instant update. Silent rollback.
 * - `server-tick` — Server owns clock. Must show pending. Visible rollback.
 * - `hybrid` — Optimistic with sync indicator. Visible rollback.
 *
 * @template TData - Type of data returned by mutation
 * @template TVariables - Type of variables passed to mutation
 *
 * @example Server-tick (banking)
 * ```tsx
 * const payment = useCriticalAction({
 *   mutation: () => api.pay(amount),
 *   timeAuthority: 'server-tick',
 * });
 *
 * <Lens.CriticalButton state={payment.state} onAction={() => payment.commit()}>
 *   Pay ${amount}
 * </Lens.CriticalButton>
 * ```
 *
 * @example Optimistic (Linear-style)
 * ```tsx
 * const create = useCriticalAction({
 *   mutation: (data) => api.issues.create(data),
 *   timeAuthority: 'optimistic',
 *   optimistic: (cache, data) => cache.append('issues', { ...data, id: 'temp' }),
 *   rollback: (cache) => cache.remove('issues', (i) => i.id === 'temp'),
 * });
 * ```
 *
 * @example Hybrid (Figma-style)
 * ```tsx
 * const save = useCriticalAction({
 *   mutation: (doc) => api.documents.save(doc),
 *   timeAuthority: 'hybrid',
 *   optimistic: (cache, doc) => cache.set('document', doc),
 * });
 * // Shows sync indicator while pending, visible rollback on failure
 * ```
 */
export function useCriticalAction<TData = unknown, TVariables = void>(
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
    risk = 'low',
    requireConfirmation = false,
  } = options;

  // State
  const [state, setState] = useState<CriticalActionState<TData>>(() =>
    createInitialState<TData>(timeAuthority, risk)
  );

  // Refs to avoid stale closures
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const lastVariablesRef = useRef<TVariables | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Proprioception manager for position predictions
  const proprioceptionManagerRef = useRef<ProprioceptionManager | null>(null);

  // Initialize proprioception manager if config provided
  useEffect(() => {
    if (proprioception) {
      proprioceptionManagerRef.current = createProprioception(
        proprioception,
        (propState) => {
          // Update state when proprioception changes (confidence decay)
          setState((prev) => ({
            ...prev,
            selfPrediction: propState.selfPrediction,
          }));
        }
      );
    }

    return () => {
      proprioceptionManagerRef.current?.dispose();
    };
  }, [proprioception]);

  // ==========================================================================
  // COMMIT — Execute the action
  // ==========================================================================

  const commit = useCallback(
    async (variables: TVariables): Promise<void> => {
      // Prevent double execution
      if (state.status === 'pending' || state.status === 'confirming') {
        return;
      }

      lastVariablesRef.current = variables;

      // If confirmation required, go to confirming state first
      if (requireConfirmation && state.status === 'idle') {
        setState((prev) => ({
          ...prev,
          status: 'confirming',
        }));
        return;
      }

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      // =======================================================================
      // OPTIMISTIC TIME AUTHORITY
      // =======================================================================

      if (timeAuthority === 'optimistic') {
        // Apply optimistic update immediately
        if (optimistic) {
          optimistic(globalCache, variables);
        }

        // Apply self-predictions immediately via proprioception manager
        if (proprioception?.self && proprioceptionManagerRef.current) {
          const manager = proprioceptionManagerRef.current;

          // Build prediction state
          const prediction: {
            animation?: string | null;
            rotation?: number | null;
            position?: { predicted: unknown; confidence: number; render: 'ghost' | 'solid' | 'hidden' } | null;
          } = {};

          if (proprioception.self.animation?.optimistic) {
            prediction.animation = 'active';
          }

          if (proprioception.self.rotation?.instant) {
            prediction.rotation = 1;
          }

          if (proprioception.self.position?.enabled) {
            prediction.position = {
              predicted: variables, // The predicted state
              confidence: 1,
              render: proprioception.self.position.render || 'ghost',
            };
          }

          manager.predict(prediction);

          setState((prev) => ({
            ...prev,
            status: 'pending',
            selfPrediction: manager.getState().selfPrediction,
          }));
        } else if (proprioception?.self) {
          setState((prev) => ({
            ...prev,
            status: 'pending',
            selfPrediction: {
              ...prev.selfPrediction,
              animation: proprioception.self.animation?.optimistic
                ? 'active'
                : null,
              rotation: proprioception.self.rotation?.instant
                ? 1
                : prev.selfPrediction.rotation,
            },
          }));
        } else {
          setState((prev) => ({
            ...prev,
            status: 'pending',
          }));
        }

        try {
          const data = await mutation(variables);

          // Reconcile proprioception with server truth
          if (proprioceptionManagerRef.current) {
            proprioceptionManagerRef.current.setWorldTruth({
              confirmed: true,
              position: data,
            });
            proprioceptionManagerRef.current.reconcile();
          }

          setState((prev) => ({
            ...prev,
            status: 'confirmed',
            data,
            worldTruth: { confirmed: true, position: data },
            selfPrediction: {
              position: null,
              rotation: null,
              animation: null,
            },
            error: null,
          }));

          onSuccess?.(data);
        } catch (err) {
          // Silent rollback for optimistic — don't show error to user
          if (rollback) {
            rollback(globalCache, variables);
          }

          // Reset proprioception
          proprioceptionManagerRef.current?.reset();

          // Reset to idle silently (no error shown for optimistic)
          setState((prev) => ({
            ...prev,
            status: 'idle',
            selfPrediction: {
              position: null,
              rotation: null,
              animation: null,
            },
            error: null, // Silent rollback
          }));

          // Still call onError for logging
          onError?.(err instanceof Error ? err : new Error(String(err)));
        }
        return;
      }

      // =======================================================================
      // SERVER-TICK TIME AUTHORITY
      // =======================================================================

      if (timeAuthority === 'server-tick') {
        // Server owns clock — show pending state, wait for server
        setState((prev) => ({
          ...prev,
          status: 'pending',
          progress: null,
        }));

        try {
          const data = await mutation(variables);

          setState((prev) => ({
            ...prev,
            status: 'confirmed',
            data,
            worldTruth: { confirmed: true },
            error: null,
          }));

          onSuccess?.(data);
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));

          // Visible error for server-tick
          setState((prev) => ({
            ...prev,
            status: 'failed',
            error,
          }));

          onError?.(error);
        }
        return;
      }

      // =======================================================================
      // HYBRID TIME AUTHORITY
      // =======================================================================

      if (timeAuthority === 'hybrid') {
        // Apply optimistic update immediately
        if (optimistic) {
          optimistic(globalCache, variables);
        }

        // Apply self-predictions immediately via proprioception manager
        if (proprioception?.self && proprioceptionManagerRef.current) {
          const manager = proprioceptionManagerRef.current;

          const prediction: {
            animation?: string | null;
            rotation?: number | null;
            position?: { predicted: unknown; confidence: number; render: 'ghost' | 'solid' | 'hidden' } | null;
          } = {};

          if (proprioception.self.animation?.optimistic) {
            prediction.animation = 'active';
          }

          if (proprioception.self.rotation?.instant) {
            prediction.rotation = 1;
          }

          if (proprioception.self.position?.enabled) {
            prediction.position = {
              predicted: variables,
              confidence: 1,
              render: proprioception.self.position.render || 'ghost',
            };
          }

          manager.predict(prediction);

          setState((prev) => ({
            ...prev,
            status: 'pending',
            selfPrediction: manager.getState().selfPrediction,
          }));
        } else {
          // Show pending with sync indicator
          setState((prev) => ({
            ...prev,
            status: 'pending',
            selfPrediction: {
              ...prev.selfPrediction,
              animation: proprioception?.self?.animation?.optimistic
                ? 'active'
                : null,
            },
          }));
        }

        try {
          const data = await mutation(variables);

          // Reconcile proprioception with server truth
          if (proprioceptionManagerRef.current) {
            proprioceptionManagerRef.current.setWorldTruth({
              confirmed: true,
              position: data,
            });
            proprioceptionManagerRef.current.reconcile();
          }

          // Reconcile self-prediction with server truth
          setState((prev) => ({
            ...prev,
            status: 'confirmed',
            data,
            worldTruth: { confirmed: true, position: data },
            selfPrediction: {
              position: null,
              rotation: null,
              animation: null,
            },
            error: null,
          }));

          onSuccess?.(data);
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));

          // Visible rollback for hybrid
          if (rollback) {
            rollback(globalCache, variables);
          }

          // Reset proprioception
          proprioceptionManagerRef.current?.reset();

          setState((prev) => ({
            ...prev,
            status: 'failed',
            selfPrediction: {
              position: null,
              rotation: null,
              animation: null,
            },
            error,
          }));

          onError?.(error);
        }
        return;
      }
    },
    [
      state.status,
      requireConfirmation,
      timeAuthority,
      optimistic,
      proprioception,
      mutation,
      onSuccess,
      rollback,
      onError,
    ]
  );

  // ==========================================================================
  // CONFIRM — Confirm after confirming step
  // ==========================================================================

  const confirm = useCallback(() => {
    if (state.status === 'confirming' && lastVariablesRef.current !== null) {
      // Bypass the requireConfirmation check on second call
      setState((prev) => ({
        ...prev,
        status: 'idle',
      }));
      // Re-trigger commit without confirmation requirement
      const vars = lastVariablesRef.current;
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          status: 'pending',
        }));

        mutation(vars)
          .then((data) => {
            setState((prev) => ({
              ...prev,
              status: 'confirmed',
              data,
              worldTruth: { confirmed: true },
              error: null,
            }));
            onSuccess?.(data);
          })
          .catch((err) => {
            const error = err instanceof Error ? err : new Error(String(err));
            if (timeAuthority === 'optimistic') {
              // Silent rollback
              setState((prev) => ({
                ...prev,
                status: 'idle',
                error: null,
              }));
            } else {
              setState((prev) => ({
                ...prev,
                status: 'failed',
                error,
              }));
            }
            onError?.(error);
          });
      }, 0);
    }
  }, [state.status, mutation, onSuccess, onError, timeAuthority]);

  // ==========================================================================
  // CANCEL — Cancel a pending action
  // ==========================================================================

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // If in confirming state, just go back to idle
    if (state.status === 'confirming') {
      setState((prev) => ({
        ...prev,
        status: 'idle',
      }));
      return;
    }

    // Rollback optimistic updates
    if (
      (timeAuthority === 'optimistic' || timeAuthority === 'hybrid') &&
      rollback &&
      lastVariablesRef.current !== null
    ) {
      rollback(globalCache, lastVariablesRef.current);
    }

    setState((prev) => ({
      ...prev,
      status: 'idle',
      error: null,
    }));
  }, [state.status, timeAuthority, rollback]);

  // ==========================================================================
  // RETRY — Retry after failure
  // ==========================================================================

  const retry = useCallback(() => {
    if (state.status === 'failed' && lastVariablesRef.current !== null) {
      commit(lastVariablesRef.current);
    }
  }, [state.status, commit]);

  // ==========================================================================
  // RESET — Reset to idle state
  // ==========================================================================

  const reset = useCallback(() => {
    setState(createInitialState<TData>(timeAuthority, risk));
    lastVariablesRef.current = null;
    abortControllerRef.current = null;
  }, [timeAuthority, risk]);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    state,
    commit,
    cancel,
    retry,
    reset,
    confirm,
  };
}

export default useCriticalAction;
