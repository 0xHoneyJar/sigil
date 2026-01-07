/**
 * Sigil v2.6 — Process Context
 *
 * React context provider for the Process layer.
 * Provides Constitution, LensArray, and Decisions to all child components.
 *
 * @module process/process-context
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

import {
  readConstitution,
  type Constitution,
  DEFAULT_CONSTITUTION,
} from './constitution-reader';

import {
  readLensArray,
  getPersona,
  type LensArray,
  type Persona,
  DEFAULT_LENS_ARRAY,
} from './lens-array-reader';

import {
  readAllDecisions,
  getActiveDecisions,
  type Decision,
} from './decision-reader';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Process context value.
 */
export interface ProcessContextValue {
  /** Constitution (protected capabilities) */
  constitution: Constitution;
  /** Lens array (personas) */
  lensArray: LensArray;
  /** All decisions */
  decisions: Decision[];
  /** Active (locked, non-expired) decisions */
  activeDecisions: Decision[];
  /** Current persona (if set) */
  currentPersona: Persona | null;
  /** Current zone (if set) */
  currentZone: string | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Set the current persona */
  setCurrentPersona: (personaId: string | null) => void;
  /** Set the current zone */
  setCurrentZone: (zone: string | null) => void;
  /** Refresh all process data */
  refresh: () => Promise<void>;
}

/**
 * Process context provider props.
 */
export interface ProcessContextProviderProps {
  children: ReactNode;
  /** Optional custom constitution path */
  constitutionPath?: string;
  /** Optional custom lens array path */
  lensArrayPath?: string;
  /** Optional custom decisions path */
  decisionsPath?: string;
  /** Initial persona ID */
  initialPersonaId?: string;
  /** Initial zone */
  initialZone?: string;
}

// =============================================================================
// CONTEXT
// =============================================================================

/**
 * Default context value (used before provider mounts).
 */
const defaultContextValue: ProcessContextValue = {
  constitution: DEFAULT_CONSTITUTION,
  lensArray: DEFAULT_LENS_ARRAY,
  decisions: [],
  activeDecisions: [],
  currentPersona: null,
  currentZone: null,
  loading: true,
  error: null,
  setCurrentPersona: () => {},
  setCurrentZone: () => {},
  refresh: async () => {},
};

/**
 * Process context.
 */
export const ProcessContext = createContext<ProcessContextValue>(defaultContextValue);

// =============================================================================
// PROVIDER
// =============================================================================

/**
 * Process context provider.
 *
 * Loads all Process layer data on mount and provides it to children.
 *
 * @example
 * ```tsx
 * <ProcessContextProvider>
 *   <App />
 * </ProcessContextProvider>
 * ```
 */
export function ProcessContextProvider({
  children,
  constitutionPath,
  lensArrayPath,
  decisionsPath,
  initialPersonaId,
  initialZone,
}: ProcessContextProviderProps): React.ReactElement {
  // State
  const [constitution, setConstitution] = useState<Constitution>(DEFAULT_CONSTITUTION);
  const [lensArray, setLensArray] = useState<LensArray>(DEFAULT_LENS_ARRAY);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [currentPersonaId, setCurrentPersonaId] = useState<string | null>(
    initialPersonaId ?? null
  );
  const [currentZone, setCurrentZone] = useState<string | null>(initialZone ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Derived state
  const activeDecisions = useMemo(
    () => decisions.filter((d) => d.status === 'locked'),
    [decisions]
  );

  const currentPersona = useMemo(
    () => (currentPersonaId ? getPersona(lensArray, currentPersonaId) ?? null : null),
    [lensArray, currentPersonaId]
  );

  // Load all process data
  const loadProcessData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load all data in parallel
      const [constitutionData, lensArrayData, decisionsData] = await Promise.all([
        readConstitution(constitutionPath),
        readLensArray(lensArrayPath),
        readAllDecisions(decisionsPath),
      ]);

      setConstitution(constitutionData);
      setLensArray(lensArrayData);
      setDecisions(decisionsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [constitutionPath, lensArrayPath, decisionsPath]);

  // Load on mount
  useEffect(() => {
    loadProcessData();
  }, [loadProcessData]);

  // Handlers
  const setCurrentPersona = useCallback((personaId: string | null) => {
    setCurrentPersonaId(personaId);
  }, []);

  // Context value
  const contextValue = useMemo<ProcessContextValue>(
    () => ({
      constitution,
      lensArray,
      decisions,
      activeDecisions,
      currentPersona,
      currentZone,
      loading,
      error,
      setCurrentPersona,
      setCurrentZone,
      refresh: loadProcessData,
    }),
    [
      constitution,
      lensArray,
      decisions,
      activeDecisions,
      currentPersona,
      currentZone,
      loading,
      error,
      setCurrentPersona,
      setCurrentZone,
      loadProcessData,
    ]
  );

  return (
    <ProcessContext.Provider value={contextValue}>
      {children}
    </ProcessContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Use the Process context.
 *
 * @returns Process context value
 * @throws If used outside of ProcessContextProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { constitution, currentPersona, loading } = useProcessContext();
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <p>Protected capabilities: {constitution.protected.length}</p>
 *       {currentPersona && <p>Current persona: {currentPersona.alias}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useProcessContext(): ProcessContextValue {
  const context = useContext(ProcessContext);

  if (context === defaultContextValue) {
    console.warn(
      '[Sigil ProcessContext] useProcessContext called outside of ProcessContextProvider'
    );
  }

  return context;
}

// =============================================================================
// SPECIALIZED HOOKS
// =============================================================================

/**
 * Use just the Constitution from Process context.
 *
 * @returns Constitution and loading state
 */
export function useConstitution(): {
  constitution: Constitution;
  loading: boolean;
  error: Error | null;
} {
  const { constitution, loading, error } = useProcessContext();
  return { constitution, loading, error };
}

/**
 * Use just the Lens Array from Process context.
 *
 * @returns Lens array and loading state
 */
export function useLensArray(): {
  lensArray: LensArray;
  loading: boolean;
  error: Error | null;
} {
  const { lensArray, loading, error } = useProcessContext();
  return { lensArray, loading, error };
}

/**
 * Use just the Decisions from Process context.
 *
 * @returns Decisions and loading state
 */
export function useDecisions(): {
  decisions: Decision[];
  activeDecisions: Decision[];
  loading: boolean;
  error: Error | null;
} {
  const { decisions, activeDecisions, loading, error } = useProcessContext();
  return { decisions, activeDecisions, loading, error };
}

/**
 * Use the current persona from Process context.
 *
 * @returns Current persona and setter
 */
export function useCurrentPersona(): {
  persona: Persona | null;
  setPersona: (personaId: string | null) => void;
  loading: boolean;
} {
  const { currentPersona, setCurrentPersona, loading } = useProcessContext();
  return { persona: currentPersona, setPersona: setCurrentPersona, loading };
}

/**
 * Get decisions for the current zone.
 *
 * @returns Decisions for the current zone
 */
export function useDecisionsForCurrentZone(): Decision[] {
  const { activeDecisions, currentZone } = useProcessContext();

  return useMemo(
    () =>
      currentZone
        ? activeDecisions.filter((d) => d.context?.zone === currentZone)
        : [],
    [activeDecisions, currentZone]
  );
}

export default ProcessContextProvider;
