// AGENT-ONLY: Do not import in browser code
// This module uses Node.js fs and will crash in browser environments.

/**
 * Sigil v4.1 — Process Layer (AGENT-ONLY)
 *
 * @server-only
 *
 * ===============================================================================
 * ⚠️  WARNING: This module is for AGENT USE ONLY during code generation.
 * ⚠️  DO NOT import this module in client-side (browser) code.
 * ⚠️  This module uses Node.js `fs` and will crash in browser environments.
 * ===============================================================================
 *
 * The Process layer provides design context to the agent during code generation:
 * - Constitution: Protected capabilities that always work
 * - Personas: User archetypes with evidence-based characteristics and journey stages
 * - Zones: Context-specific UI with journey stages and trust states
 * - Consultation Chamber: Locked decisions with time-based expiry
 * - Vibe Checks: Micro-surveys and behavioral signals
 * - Physics: Motion timing and easing configurations
 * - Vocabulary: Term → feel mapping
 *
 * ## v4.1 Changes
 *
 * - REMOVED: ProcessContextProvider, useProcessContext, useConstitution, useDecisions
 * - These were React hooks that incorrectly used Node.js fs in browsers
 * - For runtime context, use SigilProvider from sigil-mark/providers
 * - Process layer now ONLY exports reader functions for agent/build-time use
 *
 * ## Agent Protocol
 *
 * 1. Agent reads Process layer YAML at generation time
 * 2. Agent embeds relevant context into generated code
 * 3. Runtime components receive configuration via props
 * 4. No YAML reading happens at runtime
 *
 * ## For Runtime Context
 *
 * Use SigilProvider from sigil-mark/providers instead:
 *
 * ```tsx
 * import { SigilProvider, useSigilZoneContext } from 'sigil-mark/providers';
 *
 * <SigilProvider persona="newcomer">
 *   <App />
 * </SigilProvider>
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
  // Helpers (core)
  getTerm,
  getAllTerms,
  getTermsForZone,
  getTermFeel,
  hasTerm,
  getEngineeringName,
  getTermsByEngineeringName,
  // Helpers (v4.1)
  getRecommendedPhysics,
  findByEngineeringName,
  getUnrefinedTerms,
  getTermsRefinedAfter,
  matchComponentToTerm,
  getVocabularyStats,
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
// PHYSICS (v4.1)
// =============================================================================

export {
  // Reader
  readPhysics,
  readPhysicsSync,
  clearPhysicsCache,
  // Helpers
  getMotionConfig,
  getMotionTiming,
  getMotionEasing,
  getMotionConstraints,
  getSyncStrategyConfig,
  getDefaultMotionForSync,
  getAllMotionNames,
  getAllSyncStrategyNames,
  validateTimingForMotion,
  // Display
  formatMotionSummary,
  formatPhysicsSummary,
  // Constants
  DEFAULT_PHYSICS_CONFIG,
  DEFAULT_PHYSICS_PATH,
  DEFAULT_MOTION_CONFIGS,
  DEFAULT_CONSTRAINTS,
  DEFAULT_SYNC_STRATEGIES,
  // Types
  type PhysicsConfig,
  type MotionConfig,
  type MotionName,
  type SyncStrategyName,
  type SyncStrategyConfig,
  type DurationConfig,
  type TimingConstraint,
  type ZonePreferences,
  type PhysicsDefaults,
} from './physics-reader';

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
// PERSONAS (v4.0 - evidence-based with journey stages)
// =============================================================================

export {
  // Reader
  readPersonas,
  readPersonasSync,
  // Helpers (core)
  getPersonaById,
  getAllPersonas,
  getPhysicsForPersona,
  getConstraintsForPersona,
  getPreferencesForPersona,
  getDefaultLensForPersona,
  // Helpers (v4.0 - evidence-based)
  getEvidenceSourceForPersona,
  getEvidenceForPersona,
  getTrustLevelForPersona,
  getJourneyStagesForPersona,
  getPersonasForJourneyStage,
  getPersonasByTrustLevel,
  hasEvidence,
  getPersonasWithoutEvidence,
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
  // v4.0 types
  type EvidenceSource,
  type TrustLevel,
  // Backwards compatibility (deprecated)
  readLensArray,
  readLensArraySync,
  getPersona,
  DEFAULT_LENS_ARRAY,
  DEFAULT_LENS_ARRAY_PATH,
  type LensArray,
} from './persona-reader';

// =============================================================================
// ZONES (v4.0 - journey-based with trust states)
// =============================================================================

export {
  // Reader
  readZones,
  readZonesSync,
  // Helpers (core)
  getZoneById,
  getAllZones,
  resolveZoneFromPath,
  getEffectivePreferences,
  // Helpers (v4.0 - journey-based)
  getJourneyStageForZone,
  getPersonaLikelyForZone,
  getTrustStateForZone,
  getZonesByTrustState,
  getZonesForJourneyStage,
  hasJourneyContext,
  getZonesWithoutJourneyContext,
  // Display
  formatZoneSummary,
  formatZoneConfigSummary,
  // Constants
  DEFAULT_ZONE_CONFIG,
  DEFAULT_SIGILRC_PATH,
  // Types
  type ZoneConfig,
  type Zone,
  type ZoneLayout,
  type TimeAuthority,
  type TrustState,
  type ZoneLens,
  type ZoneMotion,
  type ConstraintLevel,
  type ZoneConstraints,
  type PersonaOverride,
} from './zone-reader';

// =============================================================================
// PROCESS CONTEXT (REMOVED in v4.1 — Types Only)
// =============================================================================
// IMPORTANT: Runtime hooks have been REMOVED in v4.1.
// The Process layer is AGENT-ONLY and cannot run in browsers.
// For runtime context, use SigilProvider from sigil-mark/providers.
//
// These exports now throw helpful errors directing users to the correct APIs.
// Types are preserved for backwards compatibility during migration.
// =============================================================================

export {
  // Types only - preserved for migration
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

// =============================================================================
// COMPONENT SCANNER (v5.0 - Live Grep Discovery)
// =============================================================================

export {
  // Core search functions
  findComponentsByTier,
  findComponentsByZone,
  findComponentsByDataType,
  findComponentsByCriteria,
  findAllSigilComponents,
  // Pragma parsing
  parsePragmas,
  getComponentsWithPragmas,
  // Types
  type SigilTier,
  type SigilZone,
  type ParsedPragmas,
  type ComponentMatch,
  type SearchOptions,
} from './component-scanner';

// =============================================================================
// DATA RISK ANALYZER (v5.0 - Constitution-Based Physics Resolution)
// =============================================================================

export {
  // Type extraction
  extractTypesFromSignature,
  // Constitution lookup
  lookupTypePhysics,
  // Risk hierarchy resolution
  resolveDataPhysics,
  // High-level API
  analyzeSignaturePhysics,
  getPhysicsForDataType,
  getPhysicsForDataTypes,
  // Utilities
  isKnownDataType,
  getAllKnownDataTypes,
  clearConstitutionCache,
  // Types
  type PhysicsClass,
  type DataCategory,
  type TypeLookupResult,
  type ResolvedDataPhysics,
  type ExtractedTypes,
} from './data-risk-analyzer';

// =============================================================================
// VIOLATION SCANNER (v5.0 - JIT Polish)
// =============================================================================

export {
  // Scanner
  scanFile,
  scanFiles,
  scanStagedFiles,
  // Formatters
  formatViolations,
  formatSummary,
  // Utilities
  clearFidelityCache,
  // Types
  type Violation,
  type ViolationSeverity,
  type ViolationType,
  type ScanResult,
} from './violation-scanner';

// =============================================================================
// DIFF GENERATOR (v5.0 - JIT Polish)
// =============================================================================

export {
  // Generator
  generateFileDiff,
  generateDiffs,
  // Formatters
  formatFileDiff,
  formatDiffs,
  formatDiffsWithColor,
  // Applier
  applyDiffs,
  // Types
  type DiffHunk,
  type FileDiff,
  type DiffResult,
} from './diff-generator';

// =============================================================================
// POLISH COMMAND (v5.0 - JIT Polish)
// =============================================================================

export {
  // Command
  polish,
  polishCheck,
  polishApply,
  // CLI
  runPolishCLI,
  // Types
  type PolishOptions,
  type PolishResult,
} from './polish-command';

// =============================================================================
// STATUS PROPAGATION (v5.0 - Sprint 7)
// =============================================================================

export {
  // Import parsing
  parseImports,
  resolveImportPath,
  getFileTier,
  // Tier comparison
  minTier,
  compareTiers,
  // Import analysis
  analyzeImports,
  calculateEffectiveTier,
  analyzeComponentStatus,
  scanStatusPropagation,
  // Formatters
  formatStatusAnalysis,
  formatPropagationSummary,
  // Types
  type ImportInfo,
  type TierDowngrade,
  type StatusAnalysis,
} from './status-propagation';

// =============================================================================
// GOVERNANCE LOGGER (v5.0 - Sprint 7)
// =============================================================================

export {
  // Justification logging
  logJustification,
  readJustifications,
  generateOverrideComment,
  // Amendment proposals
  generateAmendmentId,
  createAmendment,
  proposeAmendment,
  readAmendments,
  // Negotiation helpers
  formatNegotiationOptions,
  handleBypass,
  handleAmend,
  // Formatters
  formatJustificationSummary,
  formatAmendmentSummary,
  // Types
  type JustificationEntry,
  type AmendmentProposal,
  type NegotiationOptions,
  type ViolationContext,
} from './governance-logger';

// =============================================================================
// GARDEN COMMAND (v5.0 - Sprint 8)
// =============================================================================

export {
  // Command
  garden,
  gardenDrift,
  // CLI
  runGardenCLI,
  // Formatters
  formatGardenResult,
  formatGardenSummary,
  // Types
  type GardenOptions,
  type GardenResult,
  type GardenIssue,
  type IssueSeverity,
} from './garden-command';

// =============================================================================
// AMEND COMMAND (v5.0 - Sprint 8)
// =============================================================================

export {
  // Command
  amend,
  listAmendments,
  getPendingAmendments,
  // CLI
  runAmendCLI,
  // Formatters
  formatAmendResult,
  formatPendingReminder,
  // Types
  type AmendOptions,
  type AmendResult,
} from './amend-command';

// =============================================================================
// WORKSHOP BUILDER (v6.0 - Sprint 1)
// =============================================================================

export {
  // Hash utilities
  getFileHash,
  getPackageHash,
  getImportsHash,
  // Staleness detection
  checkWorkshopStaleness,
  isWorkshopStale,
  // Material extraction
  readImportsList,
  extractExportsFromDts,
  extractSignaturesFromDts,
  extractMaterial,
  // Component extraction
  parseJSDocPragmas,
  extractImportsFromFile,
  extractComponent,
  scanSanctuary,
  // Config parsing
  parseSigilConfig,
  // Builder
  buildWorkshop,
  // Loader
  loadWorkshop,
  // Query helpers
  queryMaterial,
  queryComponent,
  queryPhysics,
  queryZone,
} from './workshop-builder';

// =============================================================================
// STARTUP SENTINEL (v6.0 - Sprint 2)
// =============================================================================

export {
  // Lock file handling
  acquireLock,
  releaseLock,
  isLocked,
  // Quick rebuild
  quickRebuild,
  // Sentinel
  runSentinel,
  // Integration with /craft
  ensureWorkshopReady,
  logSentinelDecision,
  // Types
  type SentinelResult,
  type SentinelOptions,
  type QuickRebuildOptions,
  type QuickRebuildResult,
} from './startup-sentinel';

// =============================================================================
// SANCTUARY SCANNER (v6.0 - Sprint 3)
// =============================================================================

export {
  // Tier lookup
  findByTier,
  // Zone lookup
  findByZone,
  // Physics lookup
  findByPhysics,
  // Vocabulary lookup
  findByVocabulary,
  // Combined search
  findComponents,
  // Component details
  getComponentDetails,
  listAllComponents,
  getComponentStats,
  // Types
  type ScanResult,
  type ScanOptions,
} from './sanctuary-scanner';

// =============================================================================
// WORKSHOP QUERY (v6.0 - Sprint 4)
// =============================================================================

export {
  // Material query with fallback
  queryMaterialWithFallback,
  // Component query
  queryComponentWithSource,
  // Physics query
  queryPhysicsWithSource,
  // Zone query
  queryZoneWithSource,
  // Batch queries
  queryMaterials,
  queryComponents,
  // Query API factory
  createQueryAPI,
  loadWorkshopWithQueryAPI,
  // Cache management
  clearQueryCache,
  // Types
  type QueryOptions,
  type WorkshopQueryAPI,
} from './workshop-query';

// =============================================================================
// PHYSICS VALIDATOR (v6.0 - Sprint 5)
// =============================================================================

export {
  // Zone constraints
  getZoneConstraint,
  isPhysicsAllowedInZone,
  validateZoneConstraint,
  // Material constraints
  getMaterialConstraint,
  parseTimingMs,
  isTimingValidForMaterial,
  validateMaterialConstraint,
  // API correctness
  validateApiExport,
  // Fidelity constraints
  getFidelityConstraint,
  compareFidelity,
  isFidelityValid,
  isEffectAllowed,
  validateFidelityConstraint,
  // Code extraction
  extractZoneFromCode,
  extractPhysicsFromCode,
  extractTimingFromCode,
  extractMaterialFromCode,
  extractImportsFromCode,
  // Main validator
  validatePhysics,
  formatValidationResponse,
  validateForHook,
  // Types
  type ZoneConstraint,
  type MaterialConstraint,
  type FidelityConstraint,
  type ValidationResult,
  type ValidationViolation,
  type ValidationOptions,
} from './physics-validator';

// =============================================================================
// SEED MANAGER (v6.0 - Sprint 6)
// =============================================================================

export {
  // Seed loading
  loadSeed,
  loadSeedFromLibrary,
  saveSeed,
  selectSeed,
  // Sanctuary detection
  isSanctuaryEmpty,
  // Fade behavior
  markAsFaded,
  isFaded,
  clearFadedCache,
  // Virtual component queries
  queryVirtualComponent,
  getAllVirtualComponents,
  findVirtualByTier,
  findVirtualByZone,
  findVirtualByVocabulary,
  // Seed metadata
  getSeedPhysics,
  getSeedMaterial,
  getSeedTypography,
  getSeedSpacing,
  // Integration
  ensureSeedContext,
  getSeedOptions,
  // Constants
  DEFAULT_SEED_PATH,
  SEED_LIBRARY_PATH,
} from './seed-manager';

// =============================================================================
// EPHEMERAL INSPIRATION (v6.0 - Sprint 7)
// =============================================================================

export {
  // Trigger detection
  detectInspirationTrigger,
  extractUrl,
  // Context forking
  createForkedContext,
  getForkedContext,
  updateForkedContext,
  discardForkedContext,
  isContextActive,
  getActiveContextIds,
  clearAllContexts,
  // Style extraction
  extractColors,
  extractTypography,
  extractSpacing,
  extractGradients,
  extractStylesFromCSS,
  // Sanctification
  storeRecentGeneration,
  getRecentGeneration,
  getMostRecentGeneration,
  formatSanctifyEntry,
  clearRecentGenerations,
  // Integration
  createEphemeralFlow,
  // Types
  type InspirationTrigger,
  type ExtractedStyles,
  type ForkedContext,
  type SanctifyRequest,
  type SanctifyResult,
  type EphemeralFlow,
} from './ephemeral-inspiration';

// =============================================================================
// FORGE MODE (v6.0 - Sprint 8)
// =============================================================================

export {
  // Trigger detection
  detectForgeTrigger,
  isForgeModeRequested,
  // Context management
  createForgeContext,
  getDefaultContext,
  isForgeMode,
  // Survival bypass
  shouldCheckPattern,
  shouldLoadSurvival,
  shouldWarnRejected,
  shouldPreferCanonical,
  // Generation management
  storeForgeGeneration,
  getForgeGeneration,
  getPendingForgeGenerations,
  hasPendingForgeDecisions,
  // Decision handling
  recordForgeDecision,
  keepForgeGeneration,
  discardForgeGeneration,
  getForgeDecisionLog,
  getForgeDecision,
  // Utilities
  formatForgeActivation,
  formatForgeDecisionPrompt,
  formatForgeDecisionResult,
  // Integration
  prepareCraftContext,
  createForgeFlow,
  // Cleanup
  clearForgeSessions,
  // Types
  type ForgeContext,
  type ForgeTrigger,
  type ForgeGeneration,
  type ForgeDecisionLog,
  type PatternCheckOptions,
  type ForgeFlow,
} from './forge-mode';

// =============================================================================
// ERA MANAGER (v6.0 - Sprint 9)
// =============================================================================

export {
  // Constants
  DEFAULT_ERA,
  ERAS_DIRECTORY,
  SURVIVAL_PATH,
  // Era reading
  getCurrentEra,
  getCurrentEraName,
  eraExists,
  // Era archiving
  archiveEra,
  loadEraArchive,
  listArchivedEras,
  // Era transition
  transitionToNewEra,
  initializeDefaultEra,
  // Craft log integration
  addEraToLogEntry,
  filterLogsByEra,
  getErasFromLogs,
  // Rules.md markers
  formatEraSection,
  updateRulesWithEra,
  // Validation
  isValidEraName,
  canTransitionToEra,
  // Formatting
  formatEraTransitionMessage,
  formatEraSummary,
  // Types
  type Era,
  type EraArchive,
  type EraTransitionResult,
  type SurvivalEraInfo,
  type EraLogEntry,
} from './era-manager';

// =============================================================================
// SURVIVAL OBSERVER (v6.0 - Sprint 10)
// =============================================================================

export {
  // Constants
  SURVIVAL_PATH as OBSERVER_SURVIVAL_PATH,
  PATTERN_TAG_PREFIX,
  PROMOTION_THRESHOLDS,
  // Pattern detection
  detectPatterns,
  hasPatternTag,
  getPatternTags,
  // Pattern tagging
  addPatternTag,
  addPatternTags,
  // Survival index
  loadSurvivalIndex,
  saveSurvivalIndex,
  determineStatus,
  updatePattern,
  rejectPattern,
  // Observation
  observePatterns,
  observeAndTag,
  // Gardener
  countPatternOccurrences,
  applyPromotionRules,
  runGardener,
  // Formatting
  formatObservationResult,
  formatGardenerResult,
  // Types
  type PatternStatus,
  type PatternEntry,
  type SurvivalIndex,
  type DetectedPattern,
  type PatternTag,
  type ObservationResult,
} from './survival-observer';

// =============================================================================
// CHRONICLING RATIONALE (v6.0 - Sprint 11)
// =============================================================================

export {
  // Constants
  CRAFT_LOG_DIR,
  // Log generation
  generateLogFilename,
  formatDecisionsTable,
  formatNewPatterns,
  formatPhysicsChecks,
  formatVocabulary,
  generateCraftLog,
  ensureLogDirectory,
  writeCraftLog,
  // Session collection
  createSession,
  addDecision,
  addPattern,
  addPhysicsCheck,
  setContext,
  // Log reading
  listCraftLogs,
  readCraftLog,
  filterLogsByComponent,
  // Formatting
  formatLogResult,
  formatLogList,
  // Types
  type CraftSession,
  type CraftDecision,
  type CraftContext,
  type PatternUsage,
  type PhysicsCheck,
  type CraftLogResult,
} from './chronicling-rationale';

// =============================================================================
// AUDITING COHESION (v6.0 - Sprint 11)
// =============================================================================

export {
  // Constants
  DEFAULT_THRESHOLDS,
  PROPERTY_PATTERNS,
  // Property extraction
  parseNumericValue,
  extractProperties,
  extractDeviations,
  extractTier,
  extractZone,
  extractComponentName,
  parseComponent,
  // Baseline calculation
  calculateAverage,
  buildTierBaseline,
  // Variance calculation
  calculateVariance,
  checkThreshold,
  compareToBaseline,
  // Audit execution
  auditComponent,
  auditFromFile,
  // Formatting
  formatVarianceTable,
  formatFlaggedItems,
  formatJustifiedDeviations,
  formatAuditReport,
  formatQuickSummary,
  // Types
  type PropertyValue,
  type ComponentMeta,
  type DeviationAnnotation,
  type VarianceResult,
  type AuditResult,
  type TierBaseline,
} from './auditing-cohesion';

// =============================================================================
// AGENT ORCHESTRATION (v6.0 - Sprint 12)
// =============================================================================

export {
  // Vocabulary resolution
  extractVocabularyTerms,
  resolveZoneFromVocabulary,
  resolvePhysicsFromZone,
  resolveContext,
  // Pattern selection
  selectPatterns,
  // Craft flow
  runCraftFlow,
  // Benchmarking
  runBenchmarks,
  // Formatting
  formatSkillsSummary,
  formatCraftFlowResult,
  formatBenchmarkResults,
  // Types
  type CraftPhase,
  type SkillResult,
  type ResolvedContext,
  type PatternSelection,
  type CraftFlowResult,
  type OrchestrationOptions,
  type BenchmarkResult,
} from './agent-orchestration';

// =============================================================================
// FILESYSTEM REGISTRY (v7.6 - Sprint 1)
// =============================================================================

export {
  // Core functions
  getTier,
  getComponentsInTier,
  moveComponent,
  regenerateIndex,
  isImportAllowed,
  // Helpers
  getComponentPath,
  initializeTierStructure,
  // Types
  type Tier,
  type ComponentInfo,
  type MoveResult,
  type ImportCheck,
} from './filesystem-registry';

// =============================================================================
// LINTER GATE (v7.6 - Sprint 1)
// =============================================================================

export {
  // Quick check
  canPromote,
  // Full gate
  runLinterGate,
  // Individual checks
  runEslintCheck,
  runTypescriptCheck,
  runSigilChecks,
  // Utilities
  formatReport,
  loadConfig,
  // Types
  type LinterGateConfig,
  type CheckResult,
  type LinterGateResult,
} from './linter-gate';

// =============================================================================
// SURVIVAL ENGINE (v7.6 - Sprint 1)
// =============================================================================

export {
  // Main engine
  runSurvivalEngine,
  // Criteria checks
  meetsSurvivalCriteria,
  meetsCleanlinessGate,
  // Promotion
  promoteComponent,
  vetoPromotion,
  // Demotion
  demoteComponent,
  // Stats
  loadStats,
  saveStats,
  recordMutiny,
  // Utilities
  generateReport,
  // Types
  type SurvivalStats,
  type ComponentStats,
  type PendingPromotion,
  type Demotion,
  type SurvivalCriteria,
  type TriggerType,
  type SurvivalEngineResult,
} from './survival-engine';
