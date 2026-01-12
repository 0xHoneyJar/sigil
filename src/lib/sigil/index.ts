/**
 * Sigil v10.1 "Usage Reality" - Core Library
 *
 * The codebase is the dataset.
 * Usage is the authority.
 * The agent reads the AST to infer the physics.
 *
 * @module @sigil/core
 * @version 10.1.0
 */

export const VERSION = '10.1.0';
export const CODENAME = 'Usage Reality';

// =============================================================================
// Context Module
// =============================================================================
// Invisible accumulation of taste, persona, and project knowledge.

export {
  // Core class
  SigilContext,
  // Learning
  processLearningSignal,
  // Utilities
  createContext,
  getDefaultTaste,
  getDefaultPersona,
  getDefaultProject,
  // Types
  type TasteContext,
  type PersonaContext,
  type ProjectContext,
  type LearningSignal,
} from './context';

// =============================================================================
// Survival Module
// =============================================================================
// Usage-based authority inference. No file moves, no broken imports.

export {
  // Core class
  SurvivalEngine,
  // Standalone functions
  inferAuthority,
  countImports,
  getStabilityDays,
  runSurvivalEngine,
  // Types
  type Tier,
  type ComponentStats,
  type PromotionResult,
  type AuthorityConfig,
} from './survival';

// =============================================================================
// Physics Module
// =============================================================================
// Effect-based physics. The verb determines the physics, not the noun.

export {
  // Motion hooks
  useMotion,
  useZoneMotion,
  useEffectMotion,
  // Physics inference
  inferPhysicsFromEffect,
  inferEffectType,
  getPhysicsForAction,
  // Utility functions
  getPhysics,
  getZonePhysics,
  getFramerTransition,
  getEffectFramerTransition,
  getMotionClasses,
  getEffectMotionClasses,
  // Validation
  isValidPhysics,
  isValidZone,
  isValidEffect,
  getAllPhysicsNames,
  getAllZoneNames,
  getAllEffectTypes,
  // Constants
  PHYSICS,
  EFFECT_PHYSICS,
  ZONE_PHYSICS,
  SENSITIVE_PATTERNS,
  // Types
  type EffectType,
  type PhysicsName,
  type ZoneName,
  type SyncStrategy,
  type PhysicsConfig,
  type MotionStyle,
  type FramerTransition,
} from './physics';

// =============================================================================
// AST Reader Module
// =============================================================================
// AST-based intent inference using TypeScript Compiler API.

export {
  // Intent inference
  inferIntent,
  analyzeAST,
  batchAnalyze,
  // Low-level AST functions
  parseAST,
  hasProps,
  returnsPromise,
  usesMutation,
  hasFetchPost,
  usesTypes,
  // Configuration
  getDetectionPatterns,
  // Types
  type InferredIntent,
  type ASTAnalysis,
} from './ast-reader';

// =============================================================================
// Diagnostician Module
// =============================================================================
// Pattern library for debugging without questions.

export {
  // Pattern matching
  matchSymptoms,
  diagnose,
  generateReport,
  // Pattern queries
  getPatternsByCategory,
  getPatternsBySeverity,
  getPatternById,
  getAllCategories,
  getPatternCounts,
  hasCriticalMatch,
  // Pattern library
  PATTERNS,
  // Types
  type DiagnosticPattern,
  type PatternCause,
  type DiagnosticResult,
  type DiagnosticReport,
  type PatternCategory,
  type Severity,
} from './diagnostician';

// =============================================================================
// Search Module
// =============================================================================
// Vector search for semantic code discovery with grep fallback.

export {
  // Index operations
  buildIndex,
  loadIndex,
  indexNeedsRebuild,
  getIndexStats,
  // Search functions
  search,
  smartSearch,
  findCanonical,
  // Cache functions
  clearCache,
  // Types
  type SearchResult,
  type IndexEntry,
  type SearchIndex,
  type SearchOptions,
  type CanonicalResult,
} from './search';

// =============================================================================
// Utilities (from Sprint 1)
// =============================================================================

export * from './utils';
