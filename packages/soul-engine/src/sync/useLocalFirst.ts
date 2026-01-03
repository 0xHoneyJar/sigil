/**
 * useLocalFirst Hook
 *
 * React hook for LWW (Last Write Wins) sync strategy.
 * Provides optimistic UI updates with background sync.
 *
 * From SDD: "useLocalFirst returns optimistic value immediately"
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { UseLocalFirstOptions, UseLocalFirstResult } from './types.js';

/**
 * useLocalFirst hook
 *
 * Use this hook for data where optimistic updates are safe:
 * - User preferences (theme, layout, settings)
 * - Toggle states (favorites, pins, flags)
 * - Position/order changes (drag and drop, sort)
 * - Selection state
 *
 * Updates are applied locally immediately, then synced in background.
 *
 * @example
 * ```tsx
 * function ThemeToggle() {
 *   const { value, update, isSyncing } = useLocalFirst('theme', 'light');
 *
 *   return (
 *     <button onClick={() => update(value === 'light' ? 'dark' : 'light')}>
 *       {value === 'light' ? 'Dark Mode' : 'Light Mode'}
 *       {isSyncing && <Spinner size="small" />}
 *     </button>
 *   );
 * }
 * ```
 */
export function useLocalFirst<T>(
  key: string,
  initialValue: T,
  options: UseLocalFirstOptions = {}
): UseLocalFirstResult<T> {
  const { syncToServer = true, debounceMs = 1000, onError } = options;

  // Local value (updated immediately)
  const [value, setValue] = useState<T>(initialValue);

  // Sync state tracking
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Debounce timer ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Pending sync value
  const pendingSyncRef = useRef<T | null>(null);

  /**
   * Update value locally (immediate) and sync in background (debounced)
   */
  const update = useCallback(
    (newValue: T): void => {
      // Update local state immediately (optimistic)
      setValue(newValue);
      setError(null);

      // Track pending sync
      pendingSyncRef.current = newValue;

      // Skip sync if disabled
      if (!syncToServer) return;

      // Clear existing debounce timer
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set up debounced sync
      debounceRef.current = setTimeout(async () => {
        const valueToSync = pendingSyncRef.current;
        if (valueToSync === null) return;

        setIsSyncing(true);

        try {
          // Simulate background sync
          // In production: await api.sync(key, valueToSync);
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Check if value changed during sync
          if (pendingSyncRef.current === valueToSync) {
            pendingSyncRef.current = null;
          }
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          onError?.(error);
          // Note: We don't revert the local value on sync failure
          // The UI shows the error but keeps the optimistic update
        } finally {
          setIsSyncing(false);
        }
      }, debounceMs);
    },
    [key, syncToServer, debounceMs, onError]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    value,
    update,
    isSyncing,
    error,
  };
}

/**
 * Type guard to check if a result is from useLocalFirst
 */
export function isLocalFirstResult<T>(
  result: unknown
): result is UseLocalFirstResult<T> {
  return (
    typeof result === 'object' &&
    result !== null &&
    'isSyncing' in result &&
    typeof (result as UseLocalFirstResult<T>).update === 'function' &&
    !('isPending' in result) // Distinguish from useServerTick
  );
}
