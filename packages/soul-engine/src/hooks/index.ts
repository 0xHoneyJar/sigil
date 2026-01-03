/**
 * Hooks
 *
 * React hooks for Material, Tension, and Sync state management.
 *
 * Sprint 10: Full Tension System implementation
 * - TensionProvider context provider
 * - useTensions hook for state management
 * - tensionsToCSSVariables for CSS variable generation
 * - Named presets (linear, airbnb, nintendo, osrs)
 * - SQLite persistence integration
 */

// ============ TYPES ============
export type {
  TensionState,
  TensionPresetName,
  TensionPreset,
  TensionContextValue,
  TensionProviderProps,
  TensionCSSVariable,
} from './types.js';

// ============ PRESETS ============
export {
  DEFAULT_TENSIONS,
  TENSION_PRESETS,
  getPreset,
  getPresetNames,
  isValidPreset,
} from './presets.js';

// ============ CSS VARIABLE GENERATION ============
export {
  tensionsToCSSVariables,
  applyTensionVariables,
  getTensionStyleString,
} from './tensionsToCSSVariables.js';

// ============ CONTEXT & HOOKS ============
export { TensionContext, TensionProvider } from './TensionProvider.js';
export {
  useTensions,
  useTensionValues,
  useTensionCSSVariables,
} from './useTensions.js';
