/**
 * Sigil v3.0 — Living Engine
 *
 * Design physics framework for AI-assisted UI development.
 *
 * ## Architecture
 *
 * ```
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                        AGENT TIME (Generation)                         │
 * │  Constitution, Vocabulary, Personas, Philosophy — YAML                 │
 * │  Agent reads during code generation. NOT bundled for browser.          │
 * │                                                                         │
 * │  To access Process: import { readConstitution } from 'sigil-mark/process'│
 * └─────────────────────────────────────────────────────────────────────────┘
 *                                │
 *                                ↓
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                         RUNTIME (Browser)                              │
 * │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
 * │  │     Core     │  │    Layout    │  │     Lens     │                  │
 * │  │  (Hooks,     │  │ (CriticalZone│  │ (DefaultLens │                  │
 * │  │   Physics)   │  │  Machinery)  │  │  StrictLens) │                  │
 * │  └──────────────┘  └──────────────┘  └──────────────┘                  │
 * │                                                                         │
 * │               Pure React, no fs, no YAML parsing                        │
 * └─────────────────────────────────────────────────────────────────────────┘
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
 *   // Lenses
 *   useLens,
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
 * ## Process Layer (Agent-Only)
 *
 * The Process layer (Constitution, Personas, Decisions, etc.) is for
 * AGENT USE ONLY during code generation. Do NOT import in client code.
 *
 * ```typescript
 * // In agent/build context only:
 * import { readConstitution } from 'sigil-mark/process';
 * ```
 *
 * @module sigil-mark
 * @version 3.0.0
 */

// =============================================================================
// PROCESS LAYER — REMOVED FROM RUNTIME EXPORTS (v3.0)
// =============================================================================

/**
 * @deprecated ProcessContextProvider has been removed in v3.0.
 *
 * The Process layer (Constitution, Personas, Decisions, Vibe Checks) is now
 * AGENT-ONLY. It reads YAML files using Node.js `fs` and cannot run in browser.
 *
 * Migration:
 * - Remove ProcessContextProvider from your app
 * - Process context is embedded at code generation time by the agent
 * - Runtime components receive configuration via props, not context
 *
 * For agent/build-time access, import directly:
 * ```typescript
 * import { readConstitution } from 'sigil-mark/process';
 * ```
 */

// Re-export types only (no runtime functions) for backwards compatibility
export type {
  Constitution,
  ProtectedCapability,
  EnforcementLevel,
  Decision,
  DecisionScope,
  DecisionStatus,
  LensArray,
  Persona,
  PersonaPhysics,
  PersonaConstraints,
  VibeChecks,
  SurveyTrigger,
} from './process';

// Zone-Persona integration remains (pure TypeScript, no fs)
export {
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
export const VERSION = '3.0.0';

/** Architecture codename */
export const CODENAME = "Living Engine";
