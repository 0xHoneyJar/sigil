// AGENT-ONLY: Do not import in browser code
// This module is for agent use ONLY during code generation.
// It uses Node.js fs and will crash in browser environments.

/**
 * Sigil v4.1 — Process Context (REMOVED)
 *
 * @deprecated ProcessContextProvider and all React hooks have been REMOVED in v4.1.
 *
 * The Process layer is AGENT-ONLY. It does NOT run in browsers.
 *
 * ## Why This Was Removed
 *
 * The Process layer reads YAML files using Node.js `fs`, which crashes in browsers.
 * v4.1 provides proper runtime context via SigilProvider instead.
 *
 * ## Migration
 *
 * ### For Runtime Context
 * Use SigilProvider from sigil-mark/providers instead:
 *
 * ```tsx
 * // BEFORE (v3.0 - broken in browsers)
 * import { ProcessContextProvider, useProcessContext } from 'sigil-mark/process';
 *
 * // AFTER (v4.1 - works correctly)
 * import { SigilProvider, useSigilZoneContext, useSigilPersonaContext } from 'sigil-mark/providers';
 *
 * // Wrap your app
 * <SigilProvider persona="newcomer">
 *   <App />
 * </SigilProvider>
 *
 * // In components
 * const { current: zone } = useSigilZoneContext();
 * const { current: persona } = useSigilPersonaContext();
 * ```
 *
 * ### For Agent-Time Reading
 * Use the reader functions directly (in Node.js only):
 *
 * ```typescript
 * // In agent/build scripts (NOT browser code)
 * import { readConstitution, readPersonas, readZones } from 'sigil-mark/process';
 * ```
 *
 * See MIGRATION-v4.1.md for full migration guide.
 *
 * @module process/process-context
 */

import type { Constitution } from './constitution-reader';
import type { LensArray, Persona } from './persona-reader';
import type { Decision } from './decision-reader';

// =============================================================================
// TYPES (preserved for backwards compatibility)
// =============================================================================

/**
 * Process context value type.
 * @deprecated Use SigilProvider context types instead.
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
 * Process context provider props type.
 * @deprecated Use SigilProviderProps instead.
 */
export interface ProcessContextProviderProps {
  children: unknown;
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
// REMOVED EXPORTS
// These functions throw helpful errors directing users to the correct v4.1 APIs
// =============================================================================

const REMOVAL_MESSAGE = `
[Sigil v4.1] ProcessContextProvider has been REMOVED.

The Process layer is AGENT-ONLY and cannot run in browsers.

For runtime context, use SigilProvider instead:

  import { SigilProvider, useSigilZoneContext } from 'sigil-mark/providers';

  // Wrap your app
  <SigilProvider persona="newcomer">
    <App />
  </SigilProvider>

  // In components
  const { current: zone } = useSigilZoneContext();

See MIGRATION-v4.1.md for full migration guide.
`;

/**
 * @deprecated REMOVED in v4.1. Use SigilProvider from sigil-mark/providers instead.
 * @throws Always throws with migration instructions.
 */
export function ProcessContextProvider(): never {
  throw new Error(REMOVAL_MESSAGE);
}

/**
 * @deprecated REMOVED in v4.1. This is a stub that will be removed.
 */
export const ProcessContext = null;

/**
 * @deprecated REMOVED in v4.1. Use useSigilZoneContext or useSigilPersonaContext instead.
 * @throws Always throws with migration instructions.
 */
export function useProcessContext(): never {
  throw new Error(REMOVAL_MESSAGE);
}

/**
 * @deprecated REMOVED in v4.1. Use readConstitution() in agent scripts instead.
 * @throws Always throws with migration instructions.
 */
export function useConstitution(): never {
  throw new Error(
    '[Sigil v4.1] useConstitution has been REMOVED.\n\n' +
      'For agent-time reading, use readConstitution() from sigil-mark/process.\n' +
      'For runtime, constitution data should be passed via props.\n\n' +
      'See MIGRATION-v4.1.md for full migration guide.'
  );
}

/**
 * @deprecated REMOVED in v4.1. Use useSigilPersonaContext instead.
 * @throws Always throws with migration instructions.
 */
export function useLensArray(): never {
  throw new Error(
    '[Sigil v4.1] useLensArray has been REMOVED.\n\n' +
      'For runtime persona context, use useSigilPersonaContext from sigil-mark/providers.\n\n' +
      'See MIGRATION-v4.1.md for full migration guide.'
  );
}

/**
 * @deprecated REMOVED in v4.1. Use readAllDecisions() in agent scripts instead.
 * @throws Always throws with migration instructions.
 */
export function useDecisions(): never {
  throw new Error(
    '[Sigil v4.1] useDecisions has been REMOVED.\n\n' +
      'For agent-time reading, use readAllDecisions() from sigil-mark/process.\n' +
      'Decisions are read at agent-time, not runtime.\n\n' +
      'See MIGRATION-v4.1.md for full migration guide.'
  );
}

/**
 * @deprecated REMOVED in v4.1. Use useSigilPersonaContext instead.
 * @throws Always throws with migration instructions.
 */
export function useCurrentPersona(): never {
  throw new Error(
    '[Sigil v4.1] useCurrentPersona has been REMOVED.\n\n' +
      'For runtime persona context, use useSigilPersonaContext from sigil-mark/providers.\n\n' +
      'See MIGRATION-v4.1.md for full migration guide.'
  );
}

/**
 * @deprecated REMOVED in v4.1.
 * @throws Always throws with migration instructions.
 */
export function useDecisionsForCurrentZone(): never {
  throw new Error(
    '[Sigil v4.1] useDecisionsForCurrentZone has been REMOVED.\n\n' +
      'For agent-time reading, use getDecisionsForZone() from sigil-mark/process.\n' +
      'Decisions are read at agent-time, not runtime.\n\n' +
      'See MIGRATION-v4.1.md for full migration guide.'
  );
}

export default ProcessContextProvider;
