/**
 * Sigil v2.0 — LensProvider
 *
 * Context provider for user lens preference.
 * Allows users to select their preferred lens (DefaultLens, A11yLens, etc.)
 *
 * @module lenses/LensProvider
 */

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
  type FC,
} from 'react';
import type { Lens, LensPreference } from './types';

// =============================================================================
// CONTEXT
// =============================================================================

/**
 * Context for user lens preference.
 * @internal Use `useLensPreference()` to read preference.
 */
const LensPreferenceContext = createContext<LensPreference | null>(null);

LensPreferenceContext.displayName = 'SigilLensPreferenceContext';

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Get the user's lens preference from context.
 *
 * Returns null if no LensProvider is present.
 *
 * @returns Lens preference or null
 *
 * @example
 * ```tsx
 * function LensSwitcher() {
 *   const preference = useLensPreference();
 *
 *   if (!preference) return null;
 *
 *   return (
 *     <select onChange={(e) => preference.setLens(lenses[e.target.value])}>
 *       <option value="default">Default</option>
 *       <option value="a11y">Accessibility</option>
 *     </select>
 *   );
 * }
 * ```
 */
export function useLensPreference(): LensPreference | null {
  return useContext(LensPreferenceContext);
}

/**
 * Get the user's selected lens.
 *
 * Returns null if no lens is selected or no LensProvider is present.
 *
 * @returns Selected lens or null
 *
 * @internal Use `useLens()` for zone-aware lens resolution.
 */
export function useUserLens(): Lens | null {
  const preference = useContext(LensPreferenceContext);
  return preference?.lens ?? null;
}

// =============================================================================
// PROVIDER
// =============================================================================

/**
 * LensProvider props.
 */
export interface LensProviderProps {
  /** Child components */
  children: ReactNode;

  /** Initial lens (optional) */
  initialLens?: Lens;
}

/**
 * LensProvider — Context provider for user lens preference.
 *
 * Wrap your app (or a section) with LensProvider to allow users
 * to select their preferred lens.
 *
 * @example App-level provider
 * ```tsx
 * function App() {
 *   return (
 *     <LensProvider initialLens={DefaultLens}>
 *       <AppContent />
 *     </LensProvider>
 *   );
 * }
 * ```
 *
 * @example Section-specific provider
 * ```tsx
 * function SettingsSection() {
 *   return (
 *     <LensProvider initialLens={A11yLens}>
 *       <AccessibilitySettings />
 *     </LensProvider>
 *   );
 * }
 * ```
 */
export const LensProvider: FC<LensProviderProps> = ({
  children,
  initialLens,
}) => {
  const [lens, setLens] = useState<Lens | null>(initialLens ?? null);

  const value: LensPreference = useMemo(
    () => ({
      lens,
      setLens,
    }),
    [lens]
  );

  return (
    <LensPreferenceContext.Provider value={value}>
      {children}
    </LensPreferenceContext.Provider>
  );
};

LensProvider.displayName = 'LensProvider';

// =============================================================================
// EXPORTS
// =============================================================================

export { LensPreferenceContext };
