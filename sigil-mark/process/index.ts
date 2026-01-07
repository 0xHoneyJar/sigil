/**
 * Sigil v3.0 — Process Layer (AGENT-ONLY)
 *
 * @server-only
 *
 * ⚠️  WARNING: This module is for AGENT USE ONLY during code generation.
 * ⚠️  DO NOT import this module in client-side (browser) code.
 * ⚠️  This module uses Node.js `fs` and will crash in browser environments.
 *
 * The Process layer provides design context to the agent during code generation:
 * - Constitution: Protected capabilities that always work
 * - Personas: User archetypes with physics and constraints (renamed from Lens Array)
 * - Consultation Chamber: Locked decisions with time-based expiry
 * - Vibe Checks: Micro-surveys and behavioral signals
 *
 * ## Agent Protocol
 *
 * 1. Agent reads Process layer YAML at generation time
 * 2. Agent embeds relevant context into generated code
 * 3. Runtime components receive configuration via props
 * 4. No YAML reading happens at runtime
 *
 * ## Migration from v2.6
 *
 * ```typescript
 * // v2.6 (BROKEN - crashes in browser)
 * import { ProcessContextProvider } from 'sigil-mark';
 *
 * // v3.0 (CORRECT - agent-only)
 * import { readConstitution } from 'sigil-mark/process'; // Agent/build only
 * ```
 *
 * @module process
 */

// =============================================================================
// VOCABULARY (v3.0)
// =============================================================================

export {
  // Reader
  readVocabulary,
  readVocabularySync,
  // Helpers
  getTerm,
  getAllTerms,
  getTermsForZone,
  getTermFeel,
  hasTerm,
  getEngineeringName,
  getTermsByEngineeringName,
  // Display
  formatTermSummary,
  formatVocabularySummary,
  // Constants
  DEFAULT_VOCABULARY,
  DEFAULT_VOCABULARY_PATH,
  DEFAULT_TERM_FEEL,
  // Types
  type Vocabulary,
  type VocabularyTerm,
  type TermFeel,
  type Material,
  type Motion,
  type Tone,
} from './vocabulary-reader';

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
// PERSONAS (v3.0 - renamed from Lens Array)
// =============================================================================

export {
  // Reader (v3.0)
  readPersonas,
  readPersonasSync,
  // Helpers (v3.0)
  getPersonaById,
  getAllPersonas,
  getPhysicsForPersona,
  getConstraintsForPersona,
  getPreferencesForPersona,
  getDefaultLensForPersona,
  // Display
  formatPersonaSummary,
  formatPersonaArraySummary,
  // Constants
  DEFAULT_PERSONA_ARRAY,
  DEFAULT_PERSONAS_PATH,
  // Types
  type PersonaArray,
  type Persona,
  type PersonaPhysics,
  type PersonaConstraints,
  type PersonaPreferences,
  type DefaultLensType,
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
  // Backwards compatibility (deprecated)
  readLensArray,
  readLensArraySync,
  getPersona,
  DEFAULT_LENS_ARRAY,
  DEFAULT_LENS_ARRAY_PATH,
  type LensArray,
} from './persona-reader';

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
// PHILOSOPHY (Soul Binder)
// =============================================================================

export {
  // Reader
  readPhilosophy,
  readPhilosophySync,
  // Helpers
  getPrinciple,
  getPrinciplesForZone,
  getPrinciplesByPriority,
  getPrimaryIntent,
  isAntiGoal,
  getConflictRule,
  resolveConflict,
  principleAppliesToZone,
  // Display
  formatPrincipleSummary,
  formatPhilosophySummary,
  // Constants
  DEFAULT_PHILOSOPHY,
  DEFAULT_PHILOSOPHY_PATH,
  // Types
  type Philosophy,
  type Principle,
  type PrincipleExample,
  type Intent,
  type ConflictRule,
  type ConflictResolution,
  type ConflictContext,
  type ResolutionStrategy,
  type ConflictResult,
} from './philosophy-reader';

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
  // Behavioral Signal Helpers (v3.0)
  getBehavioralSignals,
  getEnabledBehavioralSignals,
  getBehavioralSignalById,
  getBehavioralSignalsForZone,
  getBehavioralSignalsBySeverity,
  formatBehavioralSignalSummary,
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
  // Behavioral Signal Types (v3.0)
  type BehavioralSignal,
  type SignalTriggerEvent,
  type SignalSeverity,
} from './vibe-check-reader';

// =============================================================================
// MOODBOARD (v3.1)
// =============================================================================

export {
  // Reader
  readMoodboard,
  readMoodboardSync,
  // Query helpers
  getEntriesForZone as getMoodboardEntriesForZone,
  getEntriesForMaterial,
  getEntriesForTerm,
  getAntiPatterns,
  getEntriesForSource,
  getFeaturedReferences,
  searchMoodboard,
  getEntriesByTag,
  // Display helpers
  formatEntrySummary,
  formatMoodboardSummary,
  // Constants
  DEFAULT_MOODBOARD,
  DEFAULT_MOODBOARD_PATH,
  MAX_SCAN_DEPTH,
  SUPPORTED_IMAGE_EXTENSIONS,
  CATEGORY_DIRECTORIES,
  // Types
  type Moodboard,
  type MoodboardEntry,
  type MoodboardCategory,
  type MoodboardFrontmatter,
  type MoodboardIndex,
  type MoodboardStats,
  type FeaturedReference,
  type AntiPatternSeverity,
} from './moodboard-reader';
