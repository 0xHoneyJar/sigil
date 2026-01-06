/**
 * Sigil v2.0 — Core Module
 *
 * Physics engines that emit state streams. The source of Truth.
 *
 * v2.0 introduces:
 * - useCriticalAction — Main physics hook with time authority + proprioception
 * - Three time authorities: optimistic, server-tick, hybrid
 * - State streams that lenses consume
 *
 * @example v2.0 Usage
 * ```tsx
 * import { useCriticalAction } from 'sigil-mark/core';
 *
 * const payment = useCriticalAction({
 *   mutation: () => api.pay(amount),
 *   timeAuthority: 'server-tick',
 * });
 *
 * <Lens.CriticalButton state={payment.state} onAction={() => payment.commit()}>
 *   Pay ${amount}
 * </Lens.CriticalButton>
 * ```
 */

// =============================================================================
// v2.0 EXPORTS — Reality Engine
// =============================================================================

// Main physics hook
export { useCriticalAction } from './use-critical-action';

// Local cache hook
export { useLocalCache, createCache } from './use-local-cache';

// Proprioception
export {
  createProprioception,
  lerp,
  lerpPosition,
  createInitialPrediction,
  createPositionPrediction,
  SERVER_TICK_CONFIG,
  GAME_MOVEMENT_CONFIG,
  OPTIMISTIC_UI_CONFIG,
  type ProprioceptionState,
  type ProprioceptionManager,
} from './proprioception';

// Core types
export {
  createInitialState,
  type CriticalActionOptions,
  type CriticalActionState,
  type CriticalAction,
  type Cache,
} from './types';

// =============================================================================
// v1.2.5 EXPORTS — DEPRECATED (will be removed in v3.0)
// =============================================================================

// Physics tokens (the source of truth for physics values)
/** @deprecated Use layout primitives (CriticalZone, etc.) instead */
export {
  PHYSICS,
  getPhysics,
  DEFAULT_MATERIAL,
  type Material,
  type SpringConfig,
  type TapConfig,
  type PhysicsToken,
} from './physics';

// Zone context provider and hooks
/** @deprecated Use layout primitives (CriticalZone, MachineryLayout, GlassLayout) instead */
export {
  SigilZone,
  useSigilPhysics,
  useServerAuthoritative,
  withSigilPhysics,
  type SigilZoneProps,
  type SigilZoneContextValue,
} from './sigil-zone';

// Zone resolution utilities (file path → zone)
export {
  resolveZone,
  isConstraintViolation,
  getRecipesPath,
  type ZoneConfig,
  type RecipeSet,
  type SyncMode,
  type ZoneConstraints,
  type ConstraintLevel,
} from './zone-resolver';

// History utilities
export {
  logRefinement,
  parseRefinementLog,
  extractPatterns,
  suggestPattern,
  type RefinementEntry,
  type RefinementPattern,
} from './history';
