/**
 * Warden - Ground Truth Enforcement
 *
 * Validates agent grounding statements against Sigil physics rules.
 */

// Types
export type {
  SyncStrategy,
  ConfirmationType,
  EffectType,
  PhysicsRule,
  PhysicsTable,
  VocabularyEntry,
  Vocabulary,
  GroundingStatement,
  CheckName,
  ExtendedCheckResult,
  ValidationContext,
  Zone,
  WardenInput,
  WardenResult,
  CheckResult,
} from './types.js';

// Physics Loader
export {
  loadPhysics,
  getPhysicsRule,
  getDefaultPhysics,
  clearPhysicsCache,
  isPhysicsCached,
} from './physics-loader.js';

// Vocabulary Loader
export {
  loadVocabulary,
  resolveEffectFromKeywords,
  getDefaultVocabulary,
  clearVocabularyCache,
  isVocabularyCached,
} from './vocabulary-loader.js';

// Grounding Gate
export {
  parseGroundingStatement,
  validateGrounding,
  isGroundingValid,
  getExitCode,
} from './grounding-gate.js';

// Adversarial Warden
export {
  AdversarialWarden,
  isMoreRestrictive,
  isAtLeastAsRestrictive,
  getHierarchyDescription,
  getWarden,
  resetWarden,
} from './adversarial-warden.js';

export type { AdversarialWardenResult } from './adversarial-warden.js';

// Lens Validator
export {
  validateLensContext,
  isLensContextValid,
  getLensExitCode,
  validateMultipleLensContexts,
} from './lens-validator.js';
