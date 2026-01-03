/**
 * TensionProvider
 *
 * React context provider for the tension system.
 * Provides 60fps tension updates via RAF throttling.
 */

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  TensionState,
  TensionContextValue,
  TensionProviderProps,
  TensionPresetName,
} from './types.js';
import { DEFAULT_TENSIONS, getPreset, isValidPreset } from './presets.js';
import { tensionsToCSSVariables, applyTensionVariables } from './tensionsToCSSVariables.js';

/**
 * Tension context - null by default, must be used within provider.
 */
export const TensionContext = createContext<TensionContextValue | null>(null);

/**
 * Clamp tension value to valid range (0-100).
 */
function clampTension(value: number): number {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

/**
 * TensionProvider component.
 *
 * Wraps your application to provide tension context.
 * Updates CSS variables on :root element.
 *
 * @example
 * ```tsx
 * <TensionProvider initialTensions={{ playfulness: 70 }}>
 *   <App />
 * </TensionProvider>
 * ```
 */
export function TensionProvider({
  initialTensions,
  dbPath,
  children,
  autoLoad = true,
  autoSave = false,
  immediateUpdates = false,
}: TensionProviderProps): React.ReactElement {
  // Merge initial tensions with defaults
  const [tensions, setTensionsState] = useState<TensionState>(() => ({
    ...DEFAULT_TENSIONS,
    ...initialTensions,
  }));

  // Track loading and dirty state
  const [isLoading, setIsLoading] = useState(autoLoad && !!dbPath);
  const [isDirty, setIsDirty] = useState(false);

  // Original tensions for dirty tracking
  const savedTensionsRef = useRef<TensionState>(tensions);

  // RAF reference for 60fps throttling
  const rafRef = useRef<number | null>(null);

  // Pending tensions for batched updates
  const pendingTensionsRef = useRef<Partial<TensionState> | null>(null);

  /**
   * Apply pending tension updates via RAF for 60fps.
   */
  const flushPendingUpdates = useCallback(() => {
    if (pendingTensionsRef.current) {
      setTensionsState((prev) => {
        const next = { ...prev, ...pendingTensionsRef.current };
        // Clamp all values
        return {
          playfulness: clampTension(next.playfulness ?? prev.playfulness),
          weight: clampTension(next.weight ?? prev.weight),
          density: clampTension(next.density ?? prev.density),
          speed: clampTension(next.speed ?? prev.speed),
        };
      });
      pendingTensionsRef.current = null;
    }
    rafRef.current = null;
  }, []);

  /**
   * Set a single tension axis.
   * Uses RAF throttling for 60fps updates unless immediateUpdates is true.
   */
  const setTension = useCallback(
    (key: keyof TensionState, value: number) => {
      if (immediateUpdates) {
        // Immediate update for tests
        setTensionsState((prev) => ({
          ...prev,
          [key]: clampTension(value),
        }));
      } else {
        // RAF throttled update for production
        pendingTensionsRef.current = {
          ...pendingTensionsRef.current,
          [key]: value,
        };

        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(flushPendingUpdates);
        }
      }

      setIsDirty(true);
    },
    [flushPendingUpdates, immediateUpdates]
  );

  /**
   * Set multiple tensions at once.
   */
  const setTensions = useCallback(
    (newTensions: Partial<TensionState>) => {
      if (immediateUpdates) {
        // Immediate update for tests
        setTensionsState((prev) => {
          const next = { ...prev, ...newTensions };
          return {
            playfulness: clampTension(next.playfulness ?? prev.playfulness),
            weight: clampTension(next.weight ?? prev.weight),
            density: clampTension(next.density ?? prev.density),
            speed: clampTension(next.speed ?? prev.speed),
          };
        });
      } else {
        // RAF throttled update for production
        pendingTensionsRef.current = {
          ...pendingTensionsRef.current,
          ...newTensions,
        };

        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(flushPendingUpdates);
        }
      }

      setIsDirty(true);
    },
    [flushPendingUpdates, immediateUpdates]
  );

  /**
   * Reset all tensions to defaults.
   */
  const resetTensions = useCallback(() => {
    setTensionsState(DEFAULT_TENSIONS);
    setIsDirty(true);
  }, []);

  /**
   * Apply a named preset.
   */
  const applyPreset = useCallback((presetName: TensionPresetName | string) => {
    if (!isValidPreset(presetName)) {
      console.warn(`Unknown tension preset: ${presetName}`);
      return;
    }

    const preset = getPreset(presetName);
    if (preset) {
      setTensionsState(preset.tensions);
      setIsDirty(true);
    }
  }, []);

  /**
   * Save tensions to persistent storage (SQLite).
   */
  const saveTensions = useCallback(async () => {
    if (!dbPath) {
      console.warn('No dbPath provided to TensionProvider, cannot save');
      return;
    }

    try {
      // Dynamic import to avoid bundling sql.js in non-Node environments
      const { saveTensionsToDB } = await import('../lib/db.js');
      await saveTensionsToDB(dbPath, tensions);
      savedTensionsRef.current = tensions;
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save tensions:', error);
      throw error;
    }
  }, [dbPath, tensions]);

  /**
   * Load tensions from database on mount.
   */
  useEffect(() => {
    if (!autoLoad || !dbPath) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function loadTensions() {
      try {
        const { loadTensionsFromDB } = await import('../lib/db.js');
        const loaded = await loadTensionsFromDB(dbPath);

        if (mounted && loaded) {
          setTensionsState(loaded);
          savedTensionsRef.current = loaded;
        }
      } catch (error) {
        console.error('Failed to load tensions:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadTensions();

    return () => {
      mounted = false;
    };
  }, [autoLoad, dbPath]);

  /**
   * Auto-save on tension changes if enabled.
   */
  useEffect(() => {
    if (!autoSave || !isDirty || !dbPath) {
      return;
    }

    const timeout = setTimeout(() => {
      saveTensions().catch(console.error);
    }, 500); // Debounce by 500ms

    return () => clearTimeout(timeout);
  }, [autoSave, isDirty, dbPath, saveTensions]);

  /**
   * Apply CSS variables to :root on tension changes.
   */
  useEffect(() => {
    if (typeof document !== 'undefined') {
      applyTensionVariables(document.documentElement, tensions);
    }
  }, [tensions]);

  /**
   * Cleanup RAF on unmount.
   */
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  /**
   * Compute CSS variables.
   */
  const cssVariables = useMemo(() => tensionsToCSSVariables(tensions), [tensions]);

  /**
   * Context value.
   */
  const value: TensionContextValue = useMemo(
    () => ({
      tensions,
      setTension,
      setTensions,
      resetTensions,
      applyPreset,
      saveTensions,
      cssVariables,
      isLoading,
      isDirty,
    }),
    [
      tensions,
      setTension,
      setTensions,
      resetTensions,
      applyPreset,
      saveTensions,
      cssVariables,
      isLoading,
      isDirty,
    ]
  );

  return (
    <TensionContext.Provider value={value}>{children}</TensionContext.Provider>
  );
}
