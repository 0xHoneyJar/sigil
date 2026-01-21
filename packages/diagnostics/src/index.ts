/**
 * @sigil/diagnostics
 *
 * Physics compliance checking and issue detection for Sigil.
 */

// Types
export type {
  EffectType,
  Severity,
  PatternCategory,
  DiagnosticIssue,
  BehavioralCompliance,
  AnimationCompliance,
  MaterialCompliance,
  ComplianceResult,
  DiagnosticResult,
  PatternCause,
  DiagnosticPattern,
  PatternMatchResult,
  DiagnosticsConfig,
  DiagnosticsService,
} from './types'

export { DiagnosticsError, DiagnosticsErrorCodes } from './types'

// Detection
export { detectEffect, getExpectedPhysics, keywords } from './detection'

// Compliance
export {
  checkBehavioralCompliance,
  checkAnimationCompliance,
  checkMaterialCompliance,
  checkCompliance,
  complianceToIssues,
  isFullyCompliant,
} from './compliance'

// Patterns
export { PATTERNS, getPatterns, getPatternsByCategory, getPatternById } from './patterns'

// Service
export {
  createDiagnosticsService,
  getDiagnosticsService,
  resetDiagnosticsService,
} from './service'
