/**
 * Sigil v2.6 — Craftsman's Flow
 *
 * Design physics framework with Process Layer for human-AI collaboration.
 *
 * ## Architecture (4 Layers)
 *
 * ```
 * ┌────────────────────────────────────────────────────────────┐
 * │  PROCESS LAYER — Human decisions (NEW in v2.6)            │
 * │  Constitution, Lens Array, Consultation Chamber, Surveys  │
 * │  YAML/Markdown captured by Claude, referenced in code     │
 * ├────────────────────────────────────────────────────────────┤
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
 *   // Process (v2.6)
 *   useProcessContext,
 *   ProcessContextProvider,
 *   // Core
 *   useCriticalAction,
 *   // Layouts
 *   CriticalZone,
 *   // Lenses
 *   useLens,
 * } from 'sigil-mark';
 *
 * function PaymentForm({ amount }: { amount: number }) {
 *   const { constitution, decisions } = useProcessContext();
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
 * @version 2.6.0
 */

// =============================================================================
// PROCESS LAYER — Human Decisions (v2.6)
// =============================================================================

export {
  // Context
  ProcessContextProvider,
  ProcessContext,
  useProcessContext,
  useConstitution,
  useLensArray,
  useDecisions,
  useCurrentPersona,
  useDecisionsForCurrentZone,
  // Constitution
  readConstitution,
  isCapabilityProtected,
  getCapabilityEnforcement,
  validateAction,
  DEFAULT_CONSTITUTION,
  // Decisions
  readAllDecisions,
  getDecisionsForZone,
  isDecisionExpired,
  getDaysRemaining,
  lockDecision,
  unlockDecision,
  LOCK_PERIODS,
  // Personas
  readLensArray,
  getPersona,
  getAllPersonas,
  getPhysicsForPersona,
  validateLensStack,
  DEFAULT_LENS_ARRAY,
  // Vibe Checks
  readVibeChecks,
  getTriggerById,
  shouldTriggerSurvey,
  recordSurveyResponse,
  DEFAULT_VIBE_CHECKS,
  // Types
  type ProcessContextValue,
  type Constitution,
  type ProtectedCapability,
  type EnforcementLevel,
  type Decision,
  type DecisionScope,
  type DecisionStatus,
  type LensArray,
  type Persona,
  type PersonaPhysics,
  type PersonaConstraints,
  type VibeChecks,
  type SurveyTrigger,
} from './process';

export {
  // Zone-Persona Integration (v2.6)
  getPersonaForZone,
  resolveZoneWithPersona,
  DEFAULT_ZONE_PERSONA_MAP,
  type PersonaId,
} from './core/zone-resolver';

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
export const VERSION = '2.6.0';

/** Architecture codename */
export const CODENAME = "Craftsman's Flow";
