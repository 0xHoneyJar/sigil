/**
 * Diagnostics Service
 *
 * Main service for physics compliance checking and issue detection.
 */

import type {
  DiagnosticsService,
  DiagnosticsConfig,
  DiagnosticResult,
  EffectType,
  ComplianceResult,
  PatternMatchResult,
  DiagnosticsError,
} from './types'
import { DiagnosticsErrorCodes } from './types'
import { detectEffect, getExpectedPhysics } from './detection'
import {
  checkCompliance,
  complianceToIssues,
  isFullyCompliant,
} from './compliance'
import { PATTERNS, getPatternById } from './patterns'

/**
 * Default compliance result for when physics aren't specified
 */
function createDefaultCompliance(effect: EffectType): ComplianceResult {
  const behavioral = getExpectedPhysics(effect)
  return {
    behavioral: {
      ...behavioral,
      compliant: true,
    },
    animation: {
      easing: 'ease-out',
      duration: behavioral.timing,
      compliant: true,
    },
    material: {
      surface: 'elevated',
      shadow: 'soft',
      compliant: true,
    },
  }
}

/**
 * Create a diagnostics service
 */
export function createDiagnosticsService(
  anchorClient?: unknown,
  config: DiagnosticsConfig = {}
): DiagnosticsService {
  const patterns = [...PATTERNS, ...(config.customPatterns ?? [])]

  return {
    async analyze(component: string, code?: string): Promise<DiagnosticResult> {
      // Extract keywords from component name and code
      const keywords = extractKeywords(component, code)

      // Detect effect type
      const effect = detectEffect(keywords)

      // Get expected physics for this effect
      const expectedPhysics = getExpectedPhysics(effect)

      // Check compliance (if code is provided, we could parse it for actual values)
      // For now, we'll use defaults
      const compliance = createDefaultCompliance(effect)

      // Generate issues from compliance
      const issues = complianceToIssues(compliance)

      // Match against known patterns if code is provided
      if (code) {
        const patternIssues = matchCodePatterns(code, patterns)
        issues.push(...patternIssues)
      }

      // Generate suggestions based on effect type
      const suggestions = generateSuggestions(effect, compliance)

      return {
        component,
        effect,
        issues,
        compliance,
        suggestions,
      }
    },

    checkCompliance(
      effect: EffectType,
      physics: Partial<ComplianceResult>
    ): boolean {
      const result = checkCompliance(effect, physics)
      return isFullyCompliant(result)
    },

    detectEffect(keywords: string[], types?: string[]): EffectType {
      return detectEffect(keywords, types)
    },

    matchPatterns(symptoms: string): PatternMatchResult[] {
      const results: PatternMatchResult[] = []
      const lowerSymptoms = symptoms.toLowerCase()

      for (const pattern of patterns) {
        // Filter by category if specified
        if (config.categories && !config.categories.includes(pattern.category)) {
          continue
        }

        // Check keywords
        const keywordMatches = pattern.keywords.filter((k) =>
          lowerSymptoms.includes(k.toLowerCase())
        )

        if (keywordMatches.length === 0) continue

        // Check symptoms
        const symptomMatches = pattern.symptoms.filter(
          (s) =>
            lowerSymptoms.includes(s.toLowerCase()) ||
            s
              .toLowerCase()
              .split(' ')
              .some((word) => lowerSymptoms.includes(word))
        )

        // Calculate confidence
        const confidence = Math.min(
          0.95,
          keywordMatches.length * 0.2 + symptomMatches.length * 0.3
        )

        if (confidence > 0.3) {
          // Pick most likely cause
          const matchedCause = pattern.causes[0]

          results.push({
            pattern,
            matchedCause,
            confidence,
          })
        }
      }

      // Sort by confidence
      return results.sort((a, b) => b.confidence - a.confidence)
    },

    diagnose(symptom: string): string {
      const results = this.matchPatterns(symptom)

      if (results.length === 0) {
        return "I couldn't match this to a known pattern. Can you describe what's happening in more detail?"
      }

      const top = results[0]
      let response = `**Found: ${top.pattern.name}** (${Math.round(top.confidence * 100)}% confidence)\n\n`
      response += `**Cause:** ${top.matchedCause.name}\n\n`

      if (top.matchedCause.codeSmell) {
        response += `**Code smell:**\n\`\`\`typescript\n${top.matchedCause.codeSmell}\n\`\`\`\n\n`
      }

      response += `**Solution:**\n\`\`\`typescript\n${top.matchedCause.solution}\n\`\`\``

      return response.trim()
    },
  }
}

/**
 * Extract keywords from component name and code
 */
function extractKeywords(component: string, code?: string): string[] {
  const keywords: string[] = []

  // Split component name into words
  const componentWords = component
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
  keywords.push(...componentWords)

  // Extract keywords from code if provided
  if (code) {
    // Look for common patterns
    const patterns = [
      /onClick\s*=\s*\{.*?(delete|remove|save|submit|claim|withdraw)/gi,
      /mutation[Ff]n:\s*.*?(delete|remove|save|submit|claim|withdraw)/gi,
      /useMutation.*?(delete|remove|save|submit|claim|withdraw)/gi,
    ]

    for (const pattern of patterns) {
      const matches = code.match(pattern)
      if (matches) {
        keywords.push(...matches)
      }
    }
  }

  return keywords
}

/**
 * Match code against known patterns
 */
function matchCodePatterns(
  code: string,
  patterns: typeof PATTERNS
): import('./types').DiagnosticIssue[] {
  const issues: import('./types').DiagnosticIssue[] = []

  // Check for optimistic update on financial operations
  if (
    code.includes('onMutate') &&
    (code.includes('claim') ||
      code.includes('withdraw') ||
      code.includes('transfer'))
  ) {
    issues.push({
      severity: 'error',
      code: 'FINANCIAL_OPTIMISTIC',
      message:
        'Detected optimistic update (onMutate) on financial operation. Financial operations should use pessimistic sync.',
      suggestion:
        'Remove onMutate and use onSuccess with query invalidation instead.',
    })
  }

  // Check for delete without confirmation
  if (
    code.includes('delete') &&
    !code.includes('confirm') &&
    !code.includes('showConfirm')
  ) {
    const hasDirectDelete =
      /onClick\s*=\s*\{.*?delete/i.test(code) ||
      /<button[^>]*>.*?[Dd]elete.*?<\/button>/i.test(code)

    if (hasDirectDelete) {
      issues.push({
        severity: 'warning',
        code: 'DESTRUCTIVE_NO_CONFIRM',
        message:
          'Delete operation appears to have no confirmation step. Destructive actions should require confirmation.',
        suggestion:
          'Add a confirmation dialog before executing the delete operation.',
      })
    }
  }

  // Check for useMediaQuery without mount check
  if (code.includes('useMediaQuery') && !code.includes('mounted')) {
    issues.push({
      severity: 'warning',
      code: 'HYDRATION_MEDIA_QUERY',
      message:
        'useMediaQuery without mount check may cause hydration mismatch.',
      suggestion:
        'Add a mounted state check: const [mounted, setMounted] = useState(false); useEffect(() => setMounted(true), []);',
    })
  }

  return issues
}

/**
 * Generate suggestions based on effect type and compliance
 */
function generateSuggestions(
  effect: EffectType,
  compliance: ComplianceResult
): string[] {
  const suggestions: string[] = []

  if (effect === 'financial') {
    suggestions.push('Use pessimistic sync - no onMutate for financial operations')
    suggestions.push('Show amount and confirmation before executing')
    suggestions.push('Invalidate queries on success to refresh balances')
  }

  if (effect === 'destructive') {
    suggestions.push('Add two-step confirmation before destructive actions')
    suggestions.push('Use 600ms timing for deliberate feel')
    suggestions.push('Provide clear description of what will be deleted')
  }

  if (effect === 'soft-delete') {
    suggestions.push('Use toast with undo action instead of confirmation dialog')
    suggestions.push('Optimistic update is safe since operation is reversible')
  }

  if (!compliance.behavioral.compliant) {
    suggestions.push(
      `Consider changing sync to ${compliance.behavioral.sync} for ${effect} operations`
    )
  }

  return suggestions
}

/**
 * Default diagnostics service singleton
 */
let defaultDiagnosticsService: DiagnosticsService | null = null

/**
 * Get the default diagnostics service
 */
export function getDiagnosticsService(
  anchorClient?: unknown
): DiagnosticsService {
  if (!defaultDiagnosticsService) {
    defaultDiagnosticsService = createDiagnosticsService(anchorClient)
  }
  return defaultDiagnosticsService
}

/**
 * Reset the default diagnostics service
 */
export function resetDiagnosticsService(): void {
  defaultDiagnosticsService = null
}
