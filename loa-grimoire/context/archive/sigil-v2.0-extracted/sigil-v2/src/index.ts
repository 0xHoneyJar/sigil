// Sigil v2.0 — Reality Engine
// Design physics for products

// =============================================================================
// CORE — Physics engines
// =============================================================================

export {
  useCriticalAction,
  useLocalCache,
  useGlobalCache,
} from './core';

export type {
  CriticalAction,
  CriticalActionOptions,
  CriticalActionState,
  TimeAuthority,
  ProprioceptiveConfig,
  SelfPredictionState,
  WorldTruthState,
  Cache,
} from './core';

// =============================================================================
// LAYOUTS — Structural physics
// =============================================================================

export {
  CriticalZone,
  MachineryLayout,
  GlassLayout,
  useCriticalZoneContext,
  useMachineryContext,
  useMachineryItemContext,
  useGlassContext,
} from './layouts';

// =============================================================================
// LENSES — Interchangeable UIs
// =============================================================================

export {
  useLens,
  LensProvider,
  registerLens,
  getLens,
  getAllLenses,
  getLensIntegrity,
  DefaultLens,
  StrictLens,
  A11yLens,
} from './lenses';

export type {
  Lens,
  LensClassification,
  CriticalButtonProps,
  GlassButtonProps,
  MachineryItemProps,
} from './types';

// =============================================================================
// PROFILER — Ergonomic validation
// =============================================================================

export {
  profileLens,
  registerLensWithValidation,
  LensRejection,
  DEFAULT_ERGONOMIC_CONFIG,
  getRelativeLuminance,
  getContrastRatio,
  parseColor,
} from './profiler';

export type {
  ErgonomicConfig,
  ErgonomicValidation,
  HitboxIssue,
  ContrastIssue,
  FocusIssue,
} from './profiler';

// =============================================================================
// INTEGRITY — Zone enforcement
// =============================================================================

export {
  classifyLens,
  getIntegrityFlags,
  isLensAllowedInZone,
  getLensRestrictionReason,
  createZone,
  matchesZonePath,
} from './integrity';

export type {
  Zone,
  IntegrityFlags,
} from './integrity';

// =============================================================================
// TYPES
// =============================================================================

export * from './types';
