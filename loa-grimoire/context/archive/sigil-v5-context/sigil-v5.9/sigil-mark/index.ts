/**
 * Sigil v5.9 - The Lucid Studio
 * Design Context Framework for AI-assisted development
 * 
 * "Filesystem is truth. Agency stays with the human. Rules evolve."
 */

// Hooks
export { useSigilMutation } from './hooks/use-sigil-mutation';
export type {
  SigilState,
  PhysicsClass,
  SimulationPreview,
  ResolvedPhysics,
  UseSigilMutationOptions,
  UseSigilMutationResult,
} from './hooks/use-sigil-mutation';

// Providers
export {
  SigilProvider,
  SigilContext,
  useSigilZoneContext,
  useSigilPersonaContext,
  useSigilVibes,
} from './providers/sigil-provider';
export type {
  SigilContextValue,
  SigilProviderProps,
} from './providers/sigil-provider';

// Layouts
export {
  CriticalZone,
  GlassLayout,
  MachineryLayout,
} from './providers/sigil-provider';

// Version
export const SIGIL_VERSION = '5.9.0';
export const SIGIL_CODENAME = 'The Lucid Studio';
