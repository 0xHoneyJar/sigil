/**
 * Sigil v2.6 — Process Layer
 *
 * Human interaction layer for capturing design decisions.
 * - Constitution: Protected capabilities that always work
 * - Lens Array: User personas with physics and constraints
 * - Consultation Chamber: Locked decisions with time-based expiry
 * - Vibe Checks: Micro-surveys for qualitative feedback
 *
 * @module process
 */

// =============================================================================
// CONSTITUTION
// =============================================================================

export {
  // Reader
  readConstitution,
  readConstitutionSync,
  // Helpers
  isCapabilityProtected,
  getCapabilityEnforcement,
  getCapability,
  getCapabilitiesForZone,
  validateAction,
  // Constants
  DEFAULT_CONSTITUTION,
  DEFAULT_CONSTITUTION_PATH,
  // Types
  type Constitution,
  type ProtectedCapability,
  type OverrideAuditConfig,
  type EnforcementLevel,
} from './constitution-reader';

// =============================================================================
// CONSULTATION CHAMBER (Decisions)
// =============================================================================

export {
  // Read operations
  readAllDecisions,
  getDecisionsForZone,
  getActiveDecisions,
  getDecisionById,
  // Expiry checking
  isDecisionExpired,
  getDaysRemaining,
  // Write operations
  lockDecision,
  unlockDecision,
  // Utilities
  generateDecisionId,
  formatDecisionSummary,
  // Constants
  LOCK_PERIODS,
  DEFAULT_DECISIONS_PATH,
  // Types
  type Decision,
  type DecisionScope,
  type DecisionStatus,
  type DecisionContext,
  type ConsideredOption,
  type UnlockEvent,
} from './decision-reader';

// =============================================================================
// LENS ARRAY (Personas)
// =============================================================================

export {
  // Reader
  readLensArray,
  readLensArraySync,
  // Helpers
  getPersona,
  getAllPersonas,
  getPhysicsForPersona,
  getConstraintsForPersona,
  // Stacking
  validateLensStack,
  resolveStackConflict,
  mergeStack,
  // Display
  formatPersonaSummary,
  formatLensArraySummary,
  // Constants
  DEFAULT_LENS_ARRAY,
  DEFAULT_LENS_ARRAY_PATH,
  // Types
  type LensArray,
  type Persona,
  type PersonaPhysics,
  type PersonaConstraints,
  type StackingConfig,
  type StackValidationResult,
  type ConflictResolutionResult,
  type InputMethod,
  type ReadingLevel,
  type SessionDuration,
  type ErrorTolerance,
  type CognitiveLoad,
  type ConflictResolution,
  type TapTargets,
  type ShortcutConfig,
  type MotionConfig,
  type FeedbackConfig,
  type AccessibilityRequirements,
} from './lens-array-reader';

// =============================================================================
// PROCESS CONTEXT (React)
// =============================================================================

export {
  // Provider
  ProcessContextProvider,
  ProcessContext,
  // Main hook
  useProcessContext,
  // Specialized hooks
  useConstitution,
  useLensArray,
  useDecisions,
  useCurrentPersona,
  useDecisionsForCurrentZone,
  // Types
  type ProcessContextValue,
  type ProcessContextProviderProps,
} from './process-context';

// =============================================================================
// VIBE CHECKS (Surveys)
// =============================================================================

export {
  // Reader
  readVibeChecks,
  readVibeChecksSync,
  // Helpers
  getTriggerById,
  getEnabledTriggers,
  getTriggersForZone,
  getTriggersByType,
  // Cooldown management
  createSessionState,
  isInCooldown,
  hasIntervalPassed,
  isSessionLimitReached,
  isDailyLimitReached,
  shouldTriggerSurvey,
  recordSurveyShown,
  // Response recording
  recordSurveyResponse,
  // Display
  formatTriggerSummary,
  formatVibeChecksSummary,
  // Constants
  DEFAULT_VIBE_CHECKS,
  DEFAULT_VIBE_CHECKS_PATH,
  // Types
  type VibeChecks,
  type SurveyTrigger,
  type SurveyOption,
  type SurveyResponse,
  type SessionState,
  type CooldownState,
  type FeedbackConfig,
  type DisplayConfig,
  type LimitsConfig,
  type TriggerType,
  type SurveyType,
  type FeedbackDestination,
  type DisplayPosition,
  type DisplayTheme,
} from './vibe-check-reader';
