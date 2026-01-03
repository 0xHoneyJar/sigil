/**
 * useServerTick Hook
 *
 * React hook for server-tick sync strategy.
 * CRITICAL: This hook NEVER uses optimistic UI.
 *
 * From PRD: "Server-tick data MUST show pending state"
 * From SDD: "useServerTick returns isPending, never optimistic"
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { UseServerTickOptions, UseServerTickResult } from './types.js';

/**
 * useServerTick hook
 *
 * Use this hook for high-stakes data that requires server confirmation:
 * - Financial transactions (balance, transfers, payments)
 * - Game state (health, inventory, combat results)
 * - Claims and ownership changes
 *
 * IMPORTANT: This hook NEVER returns optimistic state.
 * The UI MUST show pending indicator when isPending=true.
 *
 * @example
 * ```tsx
 * function WithdrawButton({ balance, amount }) {
 *   const { update, isPending, error } = useServerTick('balance', balance);
 *
 *   return (
 *     <button
 *       onClick={() => update(balance - amount)}
 *       disabled={isPending}
 *     >
 *       {isPending ? 'Processing...' : `Withdraw ${amount} GP`}
 *     </button>
 *   );
 * }
 * ```
 */
export function useServerTick<T>(
  key: string,
  initialValue: T,
  options: UseServerTickOptions = {}
): UseServerTickResult<T> {
  const { tickRateMs = 600, onError, onSuccess } = options;

  // Server-confirmed value (the only source of truth)
  const [value, setValue] = useState<T>(initialValue);

  // Pending state tracking
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastConfirmedAt, setLastConfirmedAt] = useState<Date | null>(null);

  // Track pending updates for debouncing
  const pendingUpdateRef = useRef<T | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Submit an update to the server
   * Returns a promise that resolves when server confirms
   */
  const update = useCallback(
    async (newValue: T): Promise<void> => {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setIsPending(true);
      setError(null);
      pendingUpdateRef.current = newValue;

      try {
        // Simulate server round-trip with tick rate
        // In production, this would be an actual server call
        await new Promise<void>((resolve, reject) => {
          timeoutRef.current = setTimeout(() => {
            // Check if this is still the latest pending update
            if (pendingUpdateRef.current === newValue) {
              // Simulate server validation
              // In production: const result = await api.update(key, newValue);
              setValue(newValue);
              setLastConfirmedAt(new Date());
              pendingUpdateRef.current = null;
              onSuccess?.();
              resolve();
            } else {
              // Update was superseded, resolve without changing value
              resolve();
            }
          }, tickRateMs);
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
        throw error;
      } finally {
        // Only clear pending if this was the last update
        if (pendingUpdateRef.current === null) {
          setIsPending(false);
        }
      }
    },
    [key, tickRateMs, onError, onSuccess]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    value,
    update,
    isPending,
    error,
    lastConfirmedAt,
  };
}

/**
 * Type guard to check if a result is from useServerTick
 */
export function isServerTickResult<T>(
  result: unknown
): result is UseServerTickResult<T> {
  return (
    typeof result === 'object' &&
    result !== null &&
    'isPending' in result &&
    'lastConfirmedAt' in result &&
    typeof (result as UseServerTickResult<T>).update === 'function'
  );
}
