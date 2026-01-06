/**
 * @sigil-hook useServerTick
 * @purpose Wraps async actions to prevent optimistic UI updates
 * @physics server_authoritative - no state change until server confirms
 *
 * Use this hook for critical actions (checkout, transactions) where
 * showing success before server confirmation would break user trust.
 */

import { useState, useCallback } from 'react';

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
 */
export function useServerTick<T>(
  action: () => Promise<T>,
  options: UseServerTickOptions = {}
): UseServerTickResult<T> {
  const { minPendingTime = 0, onError, onSuccess } = options;

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (): Promise<T | undefined> => {
    // Prevent double-execution during pending state
    if (isPending) {
      return undefined;
    }

    setIsPending(true);
    setError(null);

    const startTime = Date.now();

    try {
      const result = await action();

      // Ensure minimum pending time for deliberate feel
      const elapsed = Date.now() - startTime;
      if (elapsed < minPendingTime) {
        await new Promise(resolve => setTimeout(resolve, minPendingTime - elapsed));
      }

      onSuccess?.();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      return undefined;
    } finally {
      setIsPending(false);
    }
  }, [action, isPending, minPendingTime, onError, onSuccess]);

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
