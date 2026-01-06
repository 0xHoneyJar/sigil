/**
 * Sigil v2.0 — Lenses Layer
 *
 * Interchangeable UI renderers (Experience layer).
 * Lenses consume the same physics but render differently.
 *
 * @module lenses
 */

// =============================================================================
// BUILT-IN LENSES
// =============================================================================

// Import lenses to trigger registration
export { DefaultLens } from './default';
export { StrictLens } from './strict';
export { A11yLens } from './a11y';

// =============================================================================
// PROVIDER
// =============================================================================

export { LensProvider, useLensPreference, useUserLens } from './lens-provider';
export type { LensProviderProps } from './lens-provider';

// =============================================================================
// HOOK
// =============================================================================

export {
  useLens,
  registerDefaultLens,
  registerStrictLens,
  getDefaultLens,
  getStrictLens,
} from './use-lens';
export type { UseLensOptions } from './use-lens';

// =============================================================================
// TYPES
// =============================================================================

export type {
  Lens,
  CriticalButtonProps,
  GlassButtonProps,
  MachineryItemProps,
  LensPreference,
  LensClassification,
} from './types';
