/**
 * useSigilMutation - Type-driven physics hook
 * 
 * Automatically resolves physics from data types in your function signature.
 * Money types get simulation flow. Task types get CRDT. Toggle types get instant.
 * 
 * @sigil-tier gold
 * @sigil-zone critical
 */

import { useState, useCallback, useContext, useMemo } from 'react';
import { SigilContext } from '../providers/sigil-provider';

// ============================================================================
// Types
// ============================================================================

export type SigilState = 
  | 'idle' 
  | 'simulating' 
  | 'confirming' 
  | 'committing' 
  | 'done' 
  | 'error';

export type PhysicsClass = 'server-tick' | 'crdt' | 'local-first';

export interface SimulationPreview<T = unknown> {
  predictedResult: T;
  estimatedDuration: number;
  warnings: string[];
  fees?: {
    amount: string;
    currency: string;
  };
}

export interface ResolvedPhysics {
  class: PhysicsClass;
  timing: {
    duration: number;
    easing: string;
  };
  requires: string[];
  forbidden: string[];
}

export interface UseSigilMutationOptions<TData, TVariables> {
  /** The mutation function to execute */
  mutation: (variables: TVariables) => Promise<TData>;
  
  /** Optional simulation function for server-tick physics */
  simulate?: (variables: TVariables) => Promise<SimulationPreview<TData>>;
  
  /** Override detected physics (use sparingly) */
  unsafe_override_physics?: Partial<ResolvedPhysics>;
  
  /** Reason for override (required if overriding) */
  unsafe_override_reason?: string;
  
  /** Success callback */
  onSuccess?: (data: TData) => void;
  
  /** Error callback */
  onError?: (error: Error) => void;
  
  /** Reset callback */
  onReset?: () => void;
}

export interface UseSigilMutationResult<TData, TVariables> {
  // State
  state: SigilState;
  data: TData | null;
  error: Error | null;
  preview: SimulationPreview<TData> | null;
  
  // Resolved physics
  physics: ResolvedPhysics;
  
  // Computed UI state
  disabled: boolean;
  isPending: boolean;
  isSimulating: boolean;
  isConfirming: boolean;
  
  // CSS variables for styling
  cssVars: React.CSSProperties;
  
  // Actions
  simulate: (variables: TVariables) => Promise<void>;
  confirm: () => Promise<void>;
  execute: (variables: TVariables) => Promise<void>;
  reset: () => void;
}

// ============================================================================
// Physics Resolution
// ============================================================================

const DEFAULT_PHYSICS: Record<PhysicsClass, ResolvedPhysics> = {
  'server-tick': {
    class: 'server-tick',
    timing: { duration: 800, easing: 'ease-out' },
    requires: ['simulation', 'confirmation', 'explicit-pending'],
    forbidden: ['useOptimistic', 'instant-commit'],
  },
  'crdt': {
    class: 'crdt',
    timing: { duration: 300, easing: 'ease-in-out' },
    requires: ['conflict-resolution', 'background-sync'],
    forbidden: ['blocking-save'],
  },
  'local-first': {
    class: 'local-first',
    timing: { duration: 50, easing: 'linear' },
    requires: ['useOptimistic', 'instant-feedback'],
    forbidden: ['loading-spinner-on-local'],
  },
};

/**
 * Resolve physics from zone context
 * In real implementation, this would analyze type annotations
 */
function resolvePhysics(
  context: { zone?: string; persona?: string },
  override?: Partial<ResolvedPhysics>
): ResolvedPhysics {
  // Default to server-tick for critical zones
  const zone = context.zone || 'standard';
  
  let basePhysics: ResolvedPhysics;
  
  switch (zone) {
    case 'critical':
      basePhysics = DEFAULT_PHYSICS['server-tick'];
      break;
    case 'admin':
      basePhysics = DEFAULT_PHYSICS['local-first'];
      break;
    default:
      basePhysics = DEFAULT_PHYSICS['crdt'];
  }
  
  // Apply override if provided
  if (override) {
    return {
      ...basePhysics,
      ...override,
      timing: { ...basePhysics.timing, ...override.timing },
    };
  }
  
  return basePhysics;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useSigilMutation<TData = unknown, TVariables = void>(
  options: UseSigilMutationOptions<TData, TVariables>
): UseSigilMutationResult<TData, TVariables> {
  const {
    mutation,
    simulate: simulateFn,
    unsafe_override_physics,
    unsafe_override_reason,
    onSuccess,
    onError,
    onReset,
  } = options;
  
  // Get context from provider
  const context = useContext(SigilContext) || { zone: 'standard', persona: 'default' };
  
  // Resolve physics
  const physics = useMemo(() => {
    if (unsafe_override_physics && !unsafe_override_reason) {
      console.warn(
        '[Sigil] Physics override without reason. ' +
        'Please provide unsafe_override_reason for governance tracking.'
      );
    }
    return resolvePhysics(context, unsafe_override_physics);
  }, [context, unsafe_override_physics, unsafe_override_reason]);
  
  // State
  const [state, setState] = useState<SigilState>('idle');
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [preview, setPreview] = useState<SimulationPreview<TData> | null>(null);
  const [pendingVariables, setPendingVariables] = useState<TVariables | null>(null);
  
  // Reset function
  const reset = useCallback(() => {
    setState('idle');
    setData(null);
    setError(null);
    setPreview(null);
    setPendingVariables(null);
    onReset?.();
  }, [onReset]);
  
  // Simulate function (for server-tick physics)
  const simulate = useCallback(async (variables: TVariables) => {
    if (physics.class !== 'server-tick') {
      // For non-server-tick, skip simulation and execute directly
      await execute(variables);
      return;
    }
    
    setState('simulating');
    setPendingVariables(variables);
    
    try {
      if (simulateFn) {
        const result = await simulateFn(variables);
        setPreview(result);
      } else {
        // Default preview if no simulate function provided
        setPreview({
          predictedResult: null as unknown as TData,
          estimatedDuration: physics.timing.duration,
          warnings: [],
        });
      }
      setState('confirming');
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setState('error');
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }, [physics, simulateFn, onError]);
  
  // Confirm function (after simulation)
  const confirm = useCallback(async () => {
    if (state !== 'confirming' || !pendingVariables) {
      console.warn('[Sigil] confirm() called without pending variables');
      return;
    }
    
    setState('committing');
    
    try {
      const result = await mutation(pendingVariables);
      setData(result);
      setState('done');
      onSuccess?.(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setState('error');
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }, [state, pendingVariables, mutation, onSuccess, onError]);
  
  // Direct execute function (for non-server-tick or skipping simulation)
  const execute = useCallback(async (variables: TVariables) => {
    if (physics.class === 'server-tick' && physics.requires.includes('simulation')) {
      // For server-tick, should use simulate → confirm flow
      console.warn(
        '[Sigil] execute() called on server-tick physics. ' +
        'Consider using simulate() → confirm() for safety.'
      );
    }
    
    setState('committing');
    
    try {
      const result = await mutation(variables);
      setData(result);
      setState('done');
      onSuccess?.(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setState('error');
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }, [physics, mutation, onSuccess, onError]);
  
  // Computed UI state
  const disabled = state !== 'idle' && state !== 'confirming';
  const isPending = state === 'committing';
  const isSimulating = state === 'simulating';
  const isConfirming = state === 'confirming';
  
  // CSS variables for styling
  const cssVars: React.CSSProperties = {
    '--sigil-duration': `${physics.timing.duration}ms`,
    '--sigil-easing': physics.timing.easing,
  } as React.CSSProperties;
  
  return {
    // State
    state,
    data,
    error,
    preview,
    
    // Resolved physics
    physics,
    
    // Computed UI state
    disabled,
    isPending,
    isSimulating,
    isConfirming,
    
    // CSS variables
    cssVars,
    
    // Actions
    simulate,
    confirm,
    execute,
    reset,
  };
}

// ============================================================================
// Exports
// ============================================================================

export default useSigilMutation;
