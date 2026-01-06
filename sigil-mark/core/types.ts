/**
 * Sigil v2.0 — Core Types
 *
 * Types for the useCriticalAction hook and state stream.
 *
 * @module core/types
 */

import type {
  TimeAuthority,
  CriticalActionStatus,
  Risk,
  SelfPredictionState,
  WorldTruthState,
  ProprioceptiveConfig,
} from '../types';

// =============================================================================
// CACHE INTERFACE
// =============================================================================

/**
 * Cache interface for optimistic updates.
 */
export interface Cache {
  /** Get a value from cache */
  get<T>(key: string): T | undefined;
  /** Set a value in cache */
  set<T>(key: string, value: T): void;
  /** Update a value in cache */
  update<T>(key: string, updater: (value: T) => T): void;
  /** Append an item to an array in cache */
  append<T>(key: string, item: T): void;
  /** Remove items from an array in cache */
  remove<T>(key: string, predicate: (item: T) => boolean): void;
  /** Revert to previous value (for rollback) */
  revert(key: string): void;
}

// =============================================================================
// CRITICAL ACTION OPTIONS
// =============================================================================

/**
 * Options for useCriticalAction hook.
 *
 * @template TData - Type of data returned by mutation
 * @template TVariables - Type of variables passed to mutation
 *
 * @example Server-tick (banking)
 * ```ts
 * const payment = useCriticalAction({
 *   mutation: (amount) => api.pay(amount),
 *   timeAuthority: 'server-tick',
 *   onSuccess: () => toast.success('Payment confirmed'),
 *   onError: (err) => toast.error(err.message),
 * });
 * ```
 *
 * @example Optimistic (Linear-style)
 * ```ts
 * const create = useCriticalAction({
 *   mutation: (data) => api.issues.create(data),
 *   timeAuthority: 'optimistic',
 *   optimistic: (cache, data) => cache.append('issues', { ...data, id: 'temp' }),
 *   rollback: (cache) => cache.remove('issues', (i) => i.id === 'temp'),
 * });
 * ```
 */
export interface CriticalActionOptions<TData = unknown, TVariables = void> {
  /** Async mutation function */
  mutation: (variables: TVariables) => Promise<TData>;

  /** Who owns the clock */
  timeAuthority: TimeAuthority;

  /** Self vs World prediction config */
  proprioception?: ProprioceptiveConfig;

  /** Optimistic cache update (for optimistic/hybrid) */
  optimistic?: (cache: Cache, variables: TVariables) => void;

  /** Rollback on failure */
  rollback?: (cache: Cache, variables: TVariables) => void;

  /** Success callback */
  onSuccess?: (data: TData) => void;

  /** Error callback */
  onError?: (error: Error) => void;

  /** Risk level for UI treatment */
  risk?: Risk;

  /** Whether to require confirmation step */
  requireConfirmation?: boolean;
}

// =============================================================================
// CRITICAL ACTION STATE
// =============================================================================

/**
 * State stream emitted by useCriticalAction.
 *
 * This is the "physics" that lenses consume. Core emits state,
 * lenses render UI based on that state.
 *
 * @template TData - Type of data returned by mutation
 *
 * @example Reading state in a lens
 * ```tsx
 * function CriticalButton({ state, onAction, children }) {
 *   return (
 *     <button
 *       onClick={onAction}
 *       disabled={state.status === 'pending'}
 *       data-status={state.status}
 *     >
 *       {state.status === 'pending' ? 'Processing...' : children}
 *     </button>
 *   );
 * }
 * ```
 */
export interface CriticalActionState<TData = unknown> {
  /** Current status of the action */
  status: CriticalActionStatus;

  /** Who owns the clock */
  timeAuthority: TimeAuthority;

  /** Self predictions (legal lies for responsive feel) */
  selfPrediction: SelfPredictionState;

  /** World truth (server confirmed) */
  worldTruth: WorldTruthState;

  /** Risk level for UI treatment */
  risk: Risk;

  /** Progress percentage (0-100) or null if indeterminate */
  progress: number | null;

  /** Error if failed */
  error: Error | null;

  /** Data returned by mutation on success */
  data: TData | null;
}

// =============================================================================
// CRITICAL ACTION RETURN
// =============================================================================

/**
 * Return value of useCriticalAction hook.
 *
 * @template TData - Type of data returned by mutation
 * @template TVariables - Type of variables passed to mutation
 *
 * @example Usage
 * ```tsx
 * const payment = useCriticalAction({...});
 *
 * // Read state for UI
 * <Lens.CriticalButton state={payment.state} onAction={() => payment.commit(100)}>
 *   Pay $100
 * </Lens.CriticalButton>
 *
 * // Or programmatically
 * if (payment.state.status === 'failed') {
 *   payment.retry();
 * }
 * ```
 */
export interface CriticalAction<TData = unknown, TVariables = void> {
  /** Current state stream */
  state: CriticalActionState<TData>;

  /** Execute the action */
  commit: (variables: TVariables) => Promise<void>;

  /** Cancel a pending action (if possible) */
  cancel: () => void;

  /** Retry after failure */
  retry: () => void;

  /** Reset to idle state */
  reset: () => void;

  /** Confirm after confirming step (when requireConfirmation is true) */
  confirm: () => void;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

/**
 * Create initial state for a critical action.
 */
export function createInitialState<TData>(
  timeAuthority: TimeAuthority,
  risk: Risk = 'low'
): CriticalActionState<TData> {
  return {
    status: 'idle',
    timeAuthority,
    selfPrediction: {
      position: null,
      rotation: null,
      animation: null,
    },
    worldTruth: {
      confirmed: false,
    },
    risk,
    progress: null,
    error: null,
    data: null,
  };
}
