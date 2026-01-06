/**
 * @sigil-hook useServerTick
 * @purpose Wraps async actions to prevent optimistic UI updates
 * @physics server_authoritative - no state change until server confirms
 *
 * Use this hook for critical actions (checkout, transactions) where
 * showing success before server confirmation would break user trust.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseServerTickOptions {
  /** Minimum display time for pending state (ms) */
  minPendingTime?: number;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Callback on success */
  onSuccess?: () => void;
}

export interface UseServerTickResult<T> {
  /** Execute the action - returns promise with result */
  execute: () => Promise<T | undefined>;
  /** Whether action is currently pending */
  isPending: boolean;
  /** Last error from action */
  error: Error | null;
  /** Reset error state */
  resetError: () => void;
}

/**
 * Hook for server-authoritative actions that prevents optimistic updates.
 *
 * Uses refs internally to avoid stale closure issues when callbacks
 * are not memoized by the caller.
 *
 * @example
 * ```tsx
 * const { execute, isPending } = useServerTick(async () => {
 *   await api.confirmPurchase(orderId);
 * });
 *
 * return (
 *   <Button onClick={execute} disabled={isPending}>
 *     {isPending ? 'Processing...' : 'Confirm Purchase'}
 *   </Button>
 * );
 * ```
 *
 * @example With minimum pending time (for deliberate feel)
 * ```tsx
 * const { execute, isPending } = useServerTick(
 *   async () => api.confirm(),
 *   { minPendingTime: 600 }  // Decisive zone feel
 * );
 * ```
 */
export function useServerTick<T>(
  action: () => Promise<T>,
  options: UseServerTickOptions = {}
): UseServerTickResult<T> {
  const { minPendingTime = 0, onError, onSuccess } = options;

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use refs to avoid stale closure issues
  // This fixes the dependency bug where unmemoized callbacks cause re-renders
  const actionRef = useRef(action);
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);

  // Update refs on each render
  useEffect(() => {
    actionRef.current = action;
    onErrorRef.current = onError;
    onSuccessRef.current = onSuccess;
  });

  // Track if component is mounted to avoid state updates after unmount
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (): Promise<T | undefined> => {
    // Prevent double-execution during pending state
    if (isPending) {
      return undefined;
    }

    setIsPending(true);
    setError(null);

    const startTime = Date.now();

    try {
      // Use ref to get current action (avoids stale closure)
      const result = await actionRef.current();

      // Ensure minimum pending time for deliberate feel
      const elapsed = Date.now() - startTime;
      if (elapsed < minPendingTime) {
        await new Promise(resolve => setTimeout(resolve, minPendingTime - elapsed));
      }

      // Only update state if still mounted
      if (isMountedRef.current) {
        onSuccessRef.current?.();
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      // Only update state if still mounted
      if (isMountedRef.current) {
        setError(error);
        onErrorRef.current?.(error);
      }
      return undefined;
    } finally {
      // Only update state if still mounted
      if (isMountedRef.current) {
        setIsPending(false);
      }
    }
  }, [isPending, minPendingTime]); // Removed action from deps - using ref instead

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    execute,
    isPending,
    error,
    resetError,
  };
}

export default useServerTick;
