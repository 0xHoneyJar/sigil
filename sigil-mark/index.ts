/**
 * Sigil v2.0 — Reality Engine
 *
 * Design physics framework that separates Truth (Core) from Experience (Lens).
 *
 * ## Architecture (3 Layers)
 *
 * ```
 * ┌────────────────────────────────────────────────────────────┐
 * │  CORE LAYER — Physics engines (Truth)                     │
 * │  useCriticalAction → State Stream                         │
 * │  { status, timeAuthority, selfPrediction, worldTruth }    │
 * ├────────────────────────────────────────────────────────────┤
 * │  LAYOUT LAYER — Zones + Structural Physics                │
 * │  CriticalZone, MachineryLayout, GlassLayout               │
 * │  Layouts ARE Zones. Physics is DOM, not lint.             │
 * ├────────────────────────────────────────────────────────────┤
 * │  LENS LAYER — Interchangeable UIs (Experience)            │
 * │  useLens() → Lens components                              │
 * │  DefaultLens, StrictLens, A11yLens                        │
 * └────────────────────────────────────────────────────────────┘
 * ```
 *
 * ## Quick Start
 *
 * ```tsx
 * import {
 *   // Core
 *   useCriticalAction,
 *   // Layouts
 *   CriticalZone,
 *   MachineryLayout,
 *   GlassLayout,
 *   // Lenses
 *   useLens,
 *   LensProvider,
 *   DefaultLens,
 *   StrictLens,
 *   A11yLens,
 * } from 'sigil-mark';
 *
 * function PaymentForm({ amount }: { amount: number }) {
 *   const payment = useCriticalAction({
 *     mutation: () => api.pay(amount),
 *     timeAuthority: 'server-tick',
 *   });
 *
 *   const Lens = useLens(); // Auto-selects StrictLens in CriticalZone
 *
 *   return (
 *     <CriticalZone financial>
 *       <CriticalZone.Content>
 *         <h2>Confirm Payment</h2>
 *         <p>${amount}</p>
 *       </CriticalZone.Content>
 *       <CriticalZone.Actions>
 *         <Lens.CriticalButton state={payment.state} onAction={payment.commit}>
 *           Pay Now
 *         </Lens.CriticalButton>
 *       </CriticalZone.Actions>
 *     </CriticalZone>
 *   );
 * }
 * ```
 *
 * @module sigil-mark
 * @version 2.0.0
 */

// =============================================================================
// CORE LAYER — Physics Engines (Truth)
// =============================================================================

export {
  // Main hook
  useCriticalAction,
  // Cache
  useLocalCache,
  createCache,
  // Proprioception
  createProprioception,
  lerp,
  lerpPosition,
  createInitialPrediction,
  createPositionPrediction,
  SERVER_TICK_CONFIG,
  GAME_MOVEMENT_CONFIG,
  OPTIMISTIC_UI_CONFIG,
  // State factory
  createInitialState,
  // Types
  type CriticalActionOptions,
  type CriticalActionState,
  type CriticalAction,
  type Cache,
  type ProprioceptionState,
  type ProprioceptionManager,
} from './core';

// =============================================================================
// LAYOUT LAYER — Zones + Structural Physics
// =============================================================================

export {
  // Layouts
  CriticalZone,
  MachineryLayout,
  GlassLayout,
  // Context
  ZoneContext,
  useZoneContext,
  DEFAULT_ZONE_CONTEXT,
  // Utilities
  requiresStrictLens,
  allowsGameplayLens,
  // Types
  type ZoneContextValue,
  type ZoneType,
  type TimeAuthority,
  type CriticalZoneProps,
  type CriticalZoneContentProps,
  type CriticalZoneActionsProps,
  type MachineryLayoutProps,
  type MachineryLayoutListProps,
  type MachineryLayoutItemProps,
  type MachineryLayoutSearchProps,
  type MachineryLayoutEmptyProps,
  type GlassLayoutProps,
  type GlassLayoutVariant,
  type GlassLayoutImageProps,
  type GlassLayoutContentProps,
  type GlassLayoutTitleProps,
  type GlassLayoutDescriptionProps,
  type GlassLayoutActionsProps,
} from './layouts';

// =============================================================================
// LENS LAYER — Interchangeable UIs (Experience)
// =============================================================================

export {
  // Built-in lenses
  DefaultLens,
  StrictLens,
  A11yLens,
  // Provider
  LensProvider,
  useLensPreference,
  useUserLens,
  // Hook
  useLens,
  registerDefaultLens,
  registerStrictLens,
  getDefaultLens,
  getStrictLens,
  // Types
  type Lens,
  type CriticalButtonProps,
  type GlassButtonProps,
  type MachineryItemProps,
  type LensPreference,
  type LensClassification,
  type LensProviderProps,
  type UseLensOptions,
} from './lenses';

// =============================================================================
// SHARED TYPES
// =============================================================================

export {
  type TimeAuthority as CoreTimeAuthority,
  type CriticalActionStatus,
  type Risk,
  type SelfPredictionState,
  type WorldTruthState,
  type ProprioceptiveConfig,
  type PositionPrediction,
  type ReconciliationStrategy,
} from './types';

// =============================================================================
// v1.2.5 DEPRECATED EXPORTS
// These will be removed in v3.0
// =============================================================================

export {
  // Zone resolver (still useful for AI/Claude integration)
  resolveZone,
  isConstraintViolation,
  getRecipesPath,
  type ZoneConfig,
  type RecipeSet,
  type SyncMode,
  type ZoneConstraints,
  type ConstraintLevel,
} from './core/zone-resolver';

// Deprecated physics (use layouts instead)
export {
  /** @deprecated Use CriticalZone instead */
  SigilZone,
  /** @deprecated Use useLens() instead */
  useSigilPhysics,
  /** @deprecated Use useCriticalAction with timeAuthority: 'server-tick' instead */
  useServerAuthoritative,
  /** @deprecated Use useLens() instead */
  withSigilPhysics,
  type SigilZoneProps,
  type SigilZoneContextValue,
} from './core';

// =============================================================================
// VERSION
// =============================================================================

/** Sigil version */
export const VERSION = '2.0.0';

/** Architecture codename */
export const CODENAME = 'Reality Engine';
