/**
 * Sigil v2.0 — useLocalCache Hook
 *
 * React hook for managing local cache with optimistic updates and rollback.
 *
 * @module core/useLocalCache
 */

import { useState, useCallback, useRef } from 'react';
import type { Cache } from './types';

// =============================================================================
// HOOK
// =============================================================================

/**
 * useLocalCache — Hook for managing local cache with optimistic updates.
 *
 * Provides a cache interface with history for rollback support.
 * Each key maintains its own history stack for independent rollback.
 *
 * @example Basic usage
 * ```tsx
 * function IssueList() {
 *   const cache = useLocalCache();
 *
 *   // Initialize data
 *   useEffect(() => {
 *     cache.set('issues', fetchedIssues);
 *   }, [fetchedIssues]);
 *
 *   // Get data
 *   const issues = cache.get<Issue[]>('issues') ?? [];
 *
 *   // Optimistic add
 *   const addIssue = (issue: Issue) => {
 *     cache.append('issues', issue);
 *   };
 *
 *   // Rollback on error
 *   const handleError = () => {
 *     cache.revert('issues');
 *   };
 * }
 * ```
 *
 * @example With useCriticalAction
 * ```tsx
 * function CreateIssue() {
 *   const cache = useLocalCache();
 *
 *   const create = useCriticalAction({
 *     mutation: (data) => api.issues.create(data),
 *     timeAuthority: 'optimistic',
 *     optimistic: (_, data) => {
 *       cache.append('issues', { ...data, id: 'temp', status: 'pending' });
 *     },
 *     rollback: () => {
 *       cache.revert('issues');
 *     },
 *   });
 * }
 * ```
 */
export function useLocalCache(): Cache {
  // Store for cache data
  const storeRef = useRef<Map<string, unknown>>(new Map());

  // History for each key (for rollback)
  const historyRef = useRef<Map<string, unknown[]>>(new Map());

  // Version counter to trigger re-renders
  const [, setVersion] = useState(0);

  // Trigger re-render
  const triggerUpdate = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  // Save current value to history before mutation
  const saveHistory = useCallback((key: string) => {
    const current = storeRef.current.get(key);
    const keyHistory = historyRef.current.get(key) || [];
    // Deep clone to preserve state
    keyHistory.push(current !== undefined ? structuredClone(current) : undefined);
    historyRef.current.set(key, keyHistory);
  }, []);

  // ==========================================================================
  // CACHE METHODS
  // ==========================================================================

  /**
   * Get a value from cache.
   */
  const get = useCallback(<T>(key: string): T | undefined => {
    return storeRef.current.get(key) as T | undefined;
  }, []);

  /**
   * Set a value in cache.
   */
  const set = useCallback(
    <T>(key: string, value: T): void => {
      saveHistory(key);
      storeRef.current.set(key, value);
      triggerUpdate();
    },
    [saveHistory, triggerUpdate]
  );

  /**
   * Update a value in cache using an updater function.
   */
  const update = useCallback(
    <T>(key: string, updater: (value: T) => T): void => {
      saveHistory(key);
      const current = storeRef.current.get(key) as T;
      storeRef.current.set(key, updater(current));
      triggerUpdate();
    },
    [saveHistory, triggerUpdate]
  );

  /**
   * Append an item to an array in cache.
   */
  const append = useCallback(
    <T>(key: string, item: T): void => {
      saveHistory(key);
      const current = (storeRef.current.get(key) as T[]) || [];
      storeRef.current.set(key, [...current, item]);
      triggerUpdate();
    },
    [saveHistory, triggerUpdate]
  );

  /**
   * Remove items from an array in cache.
   */
  const remove = useCallback(
    <T>(key: string, predicate: (item: T) => boolean): void => {
      saveHistory(key);
      const current = (storeRef.current.get(key) as T[]) || [];
      storeRef.current.set(
        key,
        current.filter((item) => !predicate(item))
      );
      triggerUpdate();
    },
    [saveHistory, triggerUpdate]
  );

  /**
   * Revert to previous value (for rollback).
   */
  const revert = useCallback(
    (key: string): void => {
      const keyHistory = historyRef.current.get(key);
      if (keyHistory && keyHistory.length > 0) {
        const previous = keyHistory.pop();
        if (previous !== undefined) {
          storeRef.current.set(key, previous);
        } else {
          storeRef.current.delete(key);
        }
        triggerUpdate();
      }
    },
    [triggerUpdate]
  );

  // Return stable cache object
  return {
    get,
    set,
    update,
    append,
    remove,
    revert,
  };
}

// =============================================================================
// STANDALONE CACHE FACTORY
// =============================================================================

/**
 * Create a standalone cache (not a hook).
 *
 * Useful for module-level caching or when you need a cache outside React.
 *
 * @example
 * ```ts
 * const cache = createCache();
 *
 * cache.set('user', { id: 1, name: 'Alice' });
 * cache.update('user', (u) => ({ ...u, name: 'Bob' }));
 * cache.revert('user'); // Back to { id: 1, name: 'Alice' }
 * ```
 */
export function createCache(): Cache {
  const store = new Map<string, unknown>();
  const history = new Map<string, unknown[]>();

  const saveHistory = (key: string) => {
    const current = store.get(key);
    const keyHistory = history.get(key) || [];
    keyHistory.push(current !== undefined ? structuredClone(current) : undefined);
    history.set(key, keyHistory);
  };

  return {
    get<T>(key: string): T | undefined {
      return store.get(key) as T | undefined;
    },

    set<T>(key: string, value: T): void {
      saveHistory(key);
      store.set(key, value);
    },

    update<T>(key: string, updater: (value: T) => T): void {
      saveHistory(key);
      const current = store.get(key) as T;
      store.set(key, updater(current));
    },

    append<T>(key: string, item: T): void {
      saveHistory(key);
      const current = (store.get(key) as T[]) || [];
      store.set(key, [...current, item]);
    },

    remove<T>(key: string, predicate: (item: T) => boolean): void {
      saveHistory(key);
      const current = (store.get(key) as T[]) || [];
      store.set(key, current.filter((item) => !predicate(item)));
    },

    revert(key: string): void {
      const keyHistory = history.get(key);
      if (keyHistory && keyHistory.length > 0) {
        const previous = keyHistory.pop();
        if (previous !== undefined) {
          store.set(key, previous);
        } else {
          store.delete(key);
        }
      }
    },
  };
}

export default useLocalCache;
