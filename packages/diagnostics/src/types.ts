/**
 * @sigil/diagnostics
 *
 * Types for physics compliance checking and issue detection.
 */

/**
 * Effect types that determine physics behavior
 */
export type EffectType =
  | 'financial'
  | 'destructive'
  | 'soft-delete'
  | 'standard'
  | 'local'
  | 'navigation'
  | 'query'

/**
 * Issue severity levels
 */
export type Severity = 'error' | 'warning' | 'info'

/**
 * Pattern categories for diagnostics
 */
export type PatternCategory =
  | 'hydration'
  | 'dialog'
  | 'performance'
  | 'layout'
  | 'server-component'
  | 'react-19'
  | 'physics'

/**
 * A diagnostic issue found during analysis
 */
export interface DiagnosticIssue {
  /** Severity level */
  severity: Severity
  /** Unique code for this issue type */
  code: string
  /** Human-readable message */
  message: string
  /** Source location if available */
  location?: {
    file?: string
    line?: number
    column?: number
  }
  /** Suggested fix */
  suggestion?: string
}

/**
 * Behavioral physics compliance check result
 */
export interface BehavioralCompliance {
  /** Sync strategy: optimistic, pessimistic, or immediate */
  sync: 'optimistic' | 'pessimistic' | 'immediate'
  /** Expected timing in ms */
  timing: number
  /** Whether confirmation is required */
  confirmation: boolean
  /** Whether current implementation is compliant */
  compliant: boolean
  /** Reason for non-compliance */
  reason?: string
}

/**
 * Animation physics compliance check result
 */
export interface AnimationCompliance {
  /** Easing function used */
  easing: string
  /** Duration in ms */
  duration: number
  /** Whether current implementation is compliant */
  compliant: boolean
  /** Reason for non-compliance */
  reason?: string
}

/**
 * Material physics compliance check result
 */
export interface MaterialCompliance {
  /** Surface type */
  surface: string
  /** Shadow style */
  shadow: string
  /** Border radius */
  radius?: string
  /** Whether current implementation is compliant */
  compliant: boolean
  /** Reason for non-compliance */
  reason?: string
}

/**
 * Complete compliance result across all physics layers
 */
export interface ComplianceResult {
  /** Behavioral physics compliance */
  behavioral: BehavioralCompliance
  /** Animation physics compliance */
  animation: AnimationCompliance
  /** Material physics compliance */
  material: MaterialCompliance
}

/**
 * Full diagnostic result for a component
 */
export interface DiagnosticResult {
  /** Component name or identifier */
  component: string
  /** Detected effect type */
  effect: EffectType
  /** Issues found during analysis */
  issues: DiagnosticIssue[]
  /** Physics compliance results */
  compliance: ComplianceResult
  /** Improvement suggestions */
  suggestions: string[]
}

/**
 * Pattern cause for matching symptoms
 */
export interface PatternCause {
  /** Cause name */
  name: string
  /** Signature/pattern to look for */
  signature: string
  /** Example of problematic code */
  codeSmell?: string
  /** Solution code or explanation */
  solution: string
}

/**
 * Diagnostic pattern for matching known issues
 */
export interface DiagnosticPattern {
  /** Unique pattern ID */
  id: string
  /** Human-readable name */
  name: string
  /** Category of issue */
  category: PatternCategory
  /** Severity level */
  severity: Severity
  /** Symptoms that indicate this pattern */
  symptoms: string[]
  /** Keywords to match against */
  keywords: string[]
  /** Possible causes and solutions */
  causes: PatternCause[]
}

/**
 * Result of pattern matching
 */
export interface PatternMatchResult {
  /** Matched pattern */
  pattern: DiagnosticPattern
  /** Most likely cause */
  matchedCause: PatternCause
  /** Confidence score 0-1 */
  confidence: number
}

/**
 * Configuration for the diagnostics service
 */
export interface DiagnosticsConfig {
  /** Enable strict mode (more warnings) */
  strict?: boolean
  /** Custom patterns to include */
  customPatterns?: DiagnosticPattern[]
  /** Pattern categories to check */
  categories?: PatternCategory[]
}

/**
 * Diagnostics service interface
 */
export interface DiagnosticsService {
  /**
   * Analyze a component for physics compliance and issues
   */
  analyze(component: string, code?: string): Promise<DiagnosticResult>

  /**
   * Check if physics settings comply with effect type
   */
  checkCompliance(
    effect: EffectType,
    physics: Partial<ComplianceResult>
  ): boolean

  /**
   * Detect effect type from keywords and types
   */
  detectEffect(keywords: string[], types?: string[]): EffectType

  /**
   * Match symptoms to known patterns
   */
  matchPatterns(symptoms: string): PatternMatchResult[]

  /**
   * Get quick diagnosis from symptom description
   */
  diagnose(symptom: string): string
}

/**
 * Error codes for diagnostics package
 */
export const DiagnosticsErrorCodes = {
  ANALYSIS_FAILED: 'ANALYSIS_FAILED',
  PATTERN_NOT_FOUND: 'PATTERN_NOT_FOUND',
  INVALID_EFFECT: 'INVALID_EFFECT',
  ANCHOR_NOT_AVAILABLE: 'ANCHOR_NOT_AVAILABLE',
} as const

/**
 * Diagnostics error class
 */
export class DiagnosticsError extends Error {
  constructor(
    message: string,
    public code: keyof typeof DiagnosticsErrorCodes,
    public recoverable: boolean = true
  ) {
    super(message)
    this.name = 'DiagnosticsError'
  }
}
