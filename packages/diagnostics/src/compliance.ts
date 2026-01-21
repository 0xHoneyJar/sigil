/**
 * Physics Compliance Checking
 *
 * Verify that component physics match expected values for effect type.
 */

import type {
  EffectType,
  ComplianceResult,
  BehavioralCompliance,
  AnimationCompliance,
  MaterialCompliance,
  DiagnosticIssue,
} from './types'
import { getExpectedPhysics } from './detection'

/**
 * Expected animation values by effect type
 */
const EXPECTED_ANIMATION: Record<
  EffectType,
  { easing: string; duration: number }
> = {
  financial: { easing: 'ease-out', duration: 800 },
  destructive: { easing: 'ease-out', duration: 600 },
  'soft-delete': { easing: 'spring(500)', duration: 200 },
  standard: { easing: 'spring(500)', duration: 200 },
  navigation: { easing: 'ease', duration: 150 },
  query: { easing: 'ease-out', duration: 150 },
  local: { easing: 'spring(700)', duration: 100 },
}

/**
 * Expected material values by effect type
 */
const EXPECTED_MATERIAL: Record<EffectType, { surface: string; shadow: string }> =
  {
    financial: { surface: 'elevated', shadow: 'soft' },
    destructive: { surface: 'elevated', shadow: 'none' },
    'soft-delete': { surface: 'flat', shadow: 'none' },
    standard: { surface: 'elevated', shadow: 'soft' },
    navigation: { surface: 'flat', shadow: 'none' },
    query: { surface: 'flat', shadow: 'none' },
    local: { surface: 'flat', shadow: 'none' },
  }

/**
 * Timing tolerance for compliance checking (ms)
 */
const TIMING_TOLERANCE = 100

/**
 * Check behavioral physics compliance
 */
export function checkBehavioralCompliance(
  effect: EffectType,
  actual: Partial<BehavioralCompliance>
): BehavioralCompliance {
  const expected = getExpectedPhysics(effect)

  const syncMatch = actual.sync === expected.sync
  const timingMatch =
    actual.timing === undefined ||
    Math.abs(actual.timing - expected.timing) <= TIMING_TOLERANCE
  const confirmMatch =
    actual.confirmation === undefined ||
    actual.confirmation === expected.confirmation

  const compliant = syncMatch && timingMatch && confirmMatch

  let reason: string | undefined
  if (!compliant) {
    const issues: string[] = []
    if (!syncMatch) {
      issues.push(`sync should be ${expected.sync}, got ${actual.sync}`)
    }
    if (!timingMatch) {
      issues.push(`timing should be ${expected.timing}ms, got ${actual.timing}ms`)
    }
    if (!confirmMatch) {
      issues.push(
        `confirmation should be ${expected.confirmation}, got ${actual.confirmation}`
      )
    }
    reason = issues.join('; ')
  }

  return {
    sync: actual.sync ?? expected.sync,
    timing: actual.timing ?? expected.timing,
    confirmation: actual.confirmation ?? expected.confirmation,
    compliant,
    reason,
  }
}

/**
 * Check animation physics compliance
 */
export function checkAnimationCompliance(
  effect: EffectType,
  actual: Partial<AnimationCompliance>
): AnimationCompliance {
  const expected = EXPECTED_ANIMATION[effect]

  // Easing is more flexible - check if it's in the right family
  const easingMatch =
    actual.easing === undefined || isCompatibleEasing(actual.easing, expected.easing)

  const durationMatch =
    actual.duration === undefined ||
    Math.abs(actual.duration - expected.duration) <= TIMING_TOLERANCE

  const compliant = easingMatch && durationMatch

  let reason: string | undefined
  if (!compliant) {
    const issues: string[] = []
    if (!easingMatch) {
      issues.push(`easing should be ${expected.easing}, got ${actual.easing}`)
    }
    if (!durationMatch) {
      issues.push(
        `duration should be ${expected.duration}ms, got ${actual.duration}ms`
      )
    }
    reason = issues.join('; ')
  }

  return {
    easing: actual.easing ?? expected.easing,
    duration: actual.duration ?? expected.duration,
    compliant,
    reason,
  }
}

/**
 * Check if easing function is compatible with expected
 */
function isCompatibleEasing(actual: string, expected: string): boolean {
  // Exact match
  if (actual === expected) return true

  // Spring family
  if (expected.includes('spring') && actual.includes('spring')) return true

  // Ease family
  if (expected.includes('ease') && actual.includes('ease')) return true

  return false
}

/**
 * Check material physics compliance
 */
export function checkMaterialCompliance(
  effect: EffectType,
  actual: Partial<MaterialCompliance>
): MaterialCompliance {
  const expected = EXPECTED_MATERIAL[effect]

  const surfaceMatch = actual.surface === undefined || actual.surface === expected.surface
  const shadowMatch = actual.shadow === undefined || actual.shadow === expected.shadow

  const compliant = surfaceMatch && shadowMatch

  let reason: string | undefined
  if (!compliant) {
    const issues: string[] = []
    if (!surfaceMatch) {
      issues.push(`surface should be ${expected.surface}, got ${actual.surface}`)
    }
    if (!shadowMatch) {
      issues.push(`shadow should be ${expected.shadow}, got ${actual.shadow}`)
    }
    reason = issues.join('; ')
  }

  return {
    surface: actual.surface ?? expected.surface,
    shadow: actual.shadow ?? expected.shadow,
    radius: actual.radius,
    compliant,
    reason,
  }
}

/**
 * Check full compliance across all physics layers
 */
export function checkCompliance(
  effect: EffectType,
  physics: Partial<ComplianceResult>
): ComplianceResult {
  return {
    behavioral: checkBehavioralCompliance(effect, physics.behavioral ?? {}),
    animation: checkAnimationCompliance(effect, physics.animation ?? {}),
    material: checkMaterialCompliance(effect, physics.material ?? {}),
  }
}

/**
 * Generate issues from compliance result
 */
export function complianceToIssues(
  compliance: ComplianceResult
): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = []

  if (!compliance.behavioral.compliant && compliance.behavioral.reason) {
    issues.push({
      severity: 'error',
      code: 'BEHAVIORAL_NONCOMPLIANT',
      message: `Behavioral physics non-compliant: ${compliance.behavioral.reason}`,
      suggestion: 'Review sync strategy, timing, and confirmation settings',
    })
  }

  if (!compliance.animation.compliant && compliance.animation.reason) {
    issues.push({
      severity: 'warning',
      code: 'ANIMATION_NONCOMPLIANT',
      message: `Animation physics non-compliant: ${compliance.animation.reason}`,
      suggestion: 'Adjust easing and duration to match effect type',
    })
  }

  if (!compliance.material.compliant && compliance.material.reason) {
    issues.push({
      severity: 'info',
      code: 'MATERIAL_NONCOMPLIANT',
      message: `Material physics non-compliant: ${compliance.material.reason}`,
      suggestion: 'Consider adjusting surface and shadow properties',
    })
  }

  return issues
}

/**
 * Check if compliance result is fully compliant
 */
export function isFullyCompliant(compliance: ComplianceResult): boolean {
  return (
    compliance.behavioral.compliant &&
    compliance.animation.compliant &&
    compliance.material.compliant
  )
}
