// Sigil v2.0 — Core: useLocalCache
// Local-first cache with rollback support

import { useState, useCallback, useRef } from 'react';
import type { Cache } from '../types';

interface CacheEntry<T = unknown> {
  current: T;
  previous: T | undefined;
}

/**
 * useLocalCache — Local-first data cache with rollback
 * 
 * Used by core hooks for optimistic updates and rollback.
 * 
 * @example
 * ```tsx
 * const cache = useLocalCache();
 * 
 * // Optimistic update
 * cache.update('balance', (b) => b - amount);
 * 
 * // On failure
 * cache.revert('balance');
 * ```
 */
export function useLocalCache(): Cache {
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const [, forceUpdate] = useState({});

  const get = useCallback(<T>(key: string): T | undefined => {
    const entry = cacheRef.current.get(key);
    return entry?.current as T | undefined;
  }, []);

  const set = useCallback(<T>(key: string, value: T): void => {
    const existing = cacheRef.current.get(key);
    cacheRef.current.set(key, {
      current: value,
      previous: existing?.current,
    });
    forceUpdate({});
  }, []);

  const update = useCallback(<T>(key: string, updater: (value: T) => T): void => {
    const existing = cacheRef.current.get(key);
    const currentValue = existing?.current as T;
    const newValue = updater(currentValue);
    cacheRef.current.set(key, {
      current: newValue,
      previous: currentValue,
    });
    forceUpdate({});
  }, []);

  const append = useCallback(<T>(key: string, item: T): void => {
    const existing = cacheRef.current.get(key);
    const currentArray = (existing?.current as T[]) || [];
    const newArray = [...currentArray, item];
    cacheRef.current.set(key, {
      current: newArray,
      previous: currentArray,
    });
    forceUpdate({});
  }, []);

  const remove = useCallback(<T>(key: string, predicate: (item: T) => boolean): void => {
    const existing = cacheRef.current.get(key);
    const currentArray = (existing?.current as T[]) || [];
    const newArray = currentArray.filter((item) => !predicate(item));
    cacheRef.current.set(key, {
      current: newArray,
      previous: currentArray,
    });
    forceUpdate({});
  }, []);

  const revert = useCallback((key: string): void => {
    const existing = cacheRef.current.get(key);
    if (existing && existing.previous !== undefined) {
      cacheRef.current.set(key, {
        current: existing.previous,
        previous: undefined,
      });
      forceUpdate({});
    }
  }, []);

  return { get, set, update, append, remove, revert };
}

/**
 * Global cache for shared state across components
 */
const globalCache = new Map<string, CacheEntry>();

export function useGlobalCache(): Cache {
  const [, forceUpdate] = useState({});

  const get = useCallback(<T>(key: string): T | undefined => {
    const entry = globalCache.get(key);
    return entry?.current as T | undefined;
  }, []);

  const set = useCallback(<T>(key: string, value: T): void => {
    const existing = globalCache.get(key);
    globalCache.set(key, {
      current: value,
      previous: existing?.current,
    });
    forceUpdate({});
  }, []);

  const update = useCallback(<T>(key: string, updater: (value: T) => T): void => {
    const existing = globalCache.get(key);
    const currentValue = existing?.current as T;
    const newValue = updater(currentValue);
    globalCache.set(key, {
      current: newValue,
      previous: currentValue,
    });
    forceUpdate({});
  }, []);

  const append = useCallback(<T>(key: string, item: T): void => {
    const existing = globalCache.get(key);
    const currentArray = (existing?.current as T[]) || [];
    const newArray = [...currentArray, item];
    globalCache.set(key, {
      current: newArray,
      previous: currentArray,
    });
    forceUpdate({});
  }, []);

  const remove = useCallback(<T>(key: string, predicate: (item: T) => boolean): void => {
    const existing = globalCache.get(key);
    const currentArray = (existing?.current as T[]) || [];
    const newArray = currentArray.filter((item) => !predicate(item));
    globalCache.set(key, {
      current: newArray,
      previous: currentArray,
    });
    forceUpdate({});
  }, []);

  const revert = useCallback((key: string): void => {
    const existing = globalCache.get(key);
    if (existing && existing.previous !== undefined) {
      globalCache.set(key, {
        current: existing.previous,
        previous: undefined,
      });
      forceUpdate({});
    }
  }, []);

  return { get, set, update, append, remove, revert };
}
