/**
 * @sigil-tier gold
 * Sigil v6.1 — Physics Validator
 *
 * Physics-only validation with optimistic divergence.
 * Blocks physics violations, tags taste violations (doesn't block).
 * Used by PreToolUse hook to validate code before writing.
 *
 * v6.1: Added optimistic divergence - taste violations are tagged, not blocked.
 *
 * Performance target: <10ms
 *
 * @module process/physics-validator
 */

import { Workshop, PhysicsDefinition, ZoneDefinition } from '../types/workshop';
import { queryPhysicsWithSource, queryZoneWithSource } from './workshop-query';
import { loadWorkshop, queryMaterial } from './workshop-builder';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Zone physics constraints.
 */
export interface ZoneConstraint {
  zone: string;
  requiredPhysics: string[];
  disallowedPhysics: string[];
}

/**
 * Material timing constraints.
 */
export interface MaterialConstraint {
  material: string;
  minTiming: number;
  maxTiming: number;
}

/**
 * Fidelity constraints by zone.
 */
export interface FidelityConstraint {
  zone: string;
  maxFidelity: 'minimal' | 'subtle' | 'standard' | 'flashy';
  disallowedEffects: string[];
}

/**
 * Validation result.
 */
export interface ValidationResult {
  valid: boolean;
  violations: ValidationViolation[];
  /** v6.1: Divergent patterns (allowed but tagged) */
  divergent?: DivergentPattern[];
}

/**
 * v6.1: Divergent pattern - taste violation that is allowed but tagged.
 */
export interface DivergentPattern {
  /** Pattern identifier */
  pattern: string;
  /** Reason for divergence */
  reason: string;
  /** Tag to add to code */
  tag: string;
  /** First detected timestamp */
  detectedAt: string;
}

/**
 * A single validation violation.
 */
export interface ValidationViolation {
  type: 'zone' | 'material' | 'api' | 'fidelity';
  severity: 'error' | 'warning';
  message: string;
  suggestion?: string;
  location?: {
    line?: number;
    column?: number;
  };
}

/**
 * Validation options.
 */
export interface ValidationOptions {
  /** Workshop instance for lookups */
  workshop?: Workshop;
  /** Project root for fallback */
  projectRoot?: string;
  /** Check API correctness */
  checkApi?: boolean;
  /** Check fidelity constraints */
  checkFidelity?: boolean;
  /** Log validation decisions */
  verbose?: boolean;
}

// =============================================================================
// ZONE CONSTRAINTS
// =============================================================================

/**
 * Default zone constraints.
 * Critical zones require deliberate physics.
 */
const ZONE_CONSTRAINTS: Record<string, ZoneConstraint> = {
  critical: {
    zone: 'critical',
    requiredPhysics: ['deliberate'],
    disallowedPhysics: ['playful', 'snappy', 'instant'],
  },
  marketing: {
    zone: 'marketing',
    requiredPhysics: ['playful', 'flashy', 'smooth'],
    disallowedPhysics: [],
  },
  admin: {
    zone: 'admin',
    requiredPhysics: ['snappy', 'instant'],
    disallowedPhysics: ['deliberate'],
  },
  standard: {
    zone: 'standard',
    requiredPhysics: [],
    disallowedPhysics: [],
  },
};

/**
 * Get zone constraint.
 */
export function getZoneConstraint(zone: string): ZoneConstraint {
  return ZONE_CONSTRAINTS[zone] || ZONE_CONSTRAINTS.standard;
}

/**
 * Check if physics is allowed in zone.
 */
export function isPhysicsAllowedInZone(physics: string, zone: string): boolean {
  const constraint = getZoneConstraint(zone);

  // If zone has required physics, check if physics is in the list
  if (constraint.requiredPhysics.length > 0) {
    return constraint.requiredPhysics.includes(physics);
  }

  // Otherwise, just check it's not disallowed
  return !constraint.disallowedPhysics.includes(physics);
}

/**
 * Validate zone-physics compatibility.
 */
export function validateZoneConstraint(
  zone: string,
  physics: string
): ValidationViolation | null {
  if (isPhysicsAllowedInZone(physics, zone)) {
    return null;
  }

  const constraint = getZoneConstraint(zone);
  const suggestion =
    constraint.requiredPhysics.length > 0
      ? `Use one of: ${constraint.requiredPhysics.join(', ')}`
      : `Avoid: ${constraint.disallowedPhysics.join(', ')}`;

  return {
    type: 'zone',
    severity: 'error',
    message: `Zone violation: ${zone} zone requires ${constraint.requiredPhysics.join(' or ') || 'different'} physics, got '${physics}'`,
    suggestion,
  };
}

// =============================================================================
// MATERIAL CONSTRAINTS
// =============================================================================

/**
 * Default material constraints.
 */
const MATERIAL_CONSTRAINTS: Record<string, MaterialConstraint> = {
  clay: {
    material: 'clay',
    minTiming: 500,
    maxTiming: 2000,
  },
  glass: {
    material: 'glass',
    minTiming: 100,
    maxTiming: 400,
  },
  metal: {
    material: 'metal',
    minTiming: 50,
    maxTiming: 200,
  },
  paper: {
    material: 'paper',
    minTiming: 200,
    maxTiming: 600,
  },
};

/**
 * Get material constraint.
 */
export function getMaterialConstraint(material: string): MaterialConstraint | null {
  return MATERIAL_CONSTRAINTS[material] || null;
}

/**
 * Parse timing string to milliseconds.
 */
export function parseTimingMs(timing: string | number): number {
  if (typeof timing === 'number') {
    return timing;
  }
  const match = timing.match(/^(\d+(?:\.\d+)?)(ms|s)?$/);
  if (!match) {
    return 0;
  }
  const value = parseFloat(match[1]);
  const unit = match[2] || 'ms';
  return unit === 's' ? value * 1000 : value;
}

/**
 * Check if timing is valid for material.
 */
export function isTimingValidForMaterial(timing: number, material: string): boolean {
  const constraint = getMaterialConstraint(material);
  if (!constraint) {
    return true; // Unknown material, allow
  }
  return timing >= constraint.minTiming && timing <= constraint.maxTiming;
}

/**
 * Validate material-timing compatibility.
 */
export function validateMaterialConstraint(
  material: string,
  timing: string | number
): ValidationViolation | null {
  const constraint = getMaterialConstraint(material);
  if (!constraint) {
    return null; // Unknown material, no constraint
  }

  const timingMs = parseTimingMs(timing);
  if (isTimingValidForMaterial(timingMs, material)) {
    return null;
  }

  return {
    type: 'material',
    severity: 'error',
    message: `Material violation: ${material} requires timing between ${constraint.minTiming}ms and ${constraint.maxTiming}ms, got ${timingMs}ms`,
    suggestion: `Use timing between ${constraint.minTiming}ms and ${constraint.maxTiming}ms`,
  };
}

// =============================================================================
// API CORRECTNESS
// =============================================================================

/**
 * Validate API export exists.
 */
export function validateApiExport(
  packageName: string,
  exportName: string,
  workshop: Workshop
): ValidationViolation | null {
  const material = workshop.materials[packageName];
  if (!material) {
    return null; // Unknown package, can't validate
  }

  if (material.exports.includes(exportName)) {
    return null; // Valid export
  }

  // Find similar exports for suggestion
  const similar = material.exports
    .filter(exp => exp.toLowerCase().includes(exportName.toLowerCase().slice(0, 3)))
    .slice(0, 3);

  return {
    type: 'api',
    severity: 'error',
    message: `API error: '${exportName}' is not exported from '${packageName}'`,
    suggestion:
      similar.length > 0
        ? `Did you mean: ${similar.join(', ')}?`
        : `Available exports: ${material.exports.slice(0, 5).join(', ')}...`,
  };
}

// =============================================================================
// FIDELITY CONSTRAINTS
// =============================================================================

/**
 * Fidelity levels ranked.
 */
const FIDELITY_LEVELS = ['minimal', 'subtle', 'standard', 'flashy'] as const;

/**
 * Default fidelity constraints by zone.
 */
const FIDELITY_CONSTRAINTS: Record<string, FidelityConstraint> = {
  critical: {
    zone: 'critical',
    maxFidelity: 'subtle',
    disallowedEffects: ['3d', 'particles', 'video', 'heavy-animation'],
  },
  admin: {
    zone: 'admin',
    maxFidelity: 'minimal',
    disallowedEffects: ['gradients', 'shadows', '3d', 'particles', 'blur'],
  },
  marketing: {
    zone: 'marketing',
    maxFidelity: 'flashy',
    disallowedEffects: [],
  },
  standard: {
    zone: 'standard',
    maxFidelity: 'standard',
    disallowedEffects: ['3d', 'particles'],
  },
};

/**
 * Get fidelity constraint for zone.
 */
export function getFidelityConstraint(zone: string): FidelityConstraint {
  return FIDELITY_CONSTRAINTS[zone] || FIDELITY_CONSTRAINTS.standard;
}

/**
 * Compare fidelity levels.
 */
export function compareFidelity(
  a: string,
  b: string
): number {
  const aIndex = FIDELITY_LEVELS.indexOf(a as typeof FIDELITY_LEVELS[number]);
  const bIndex = FIDELITY_LEVELS.indexOf(b as typeof FIDELITY_LEVELS[number]);
  return aIndex - bIndex;
}

/**
 * Check if fidelity exceeds zone ceiling.
 */
export function isFidelityValid(fidelity: string, zone: string): boolean {
  const constraint = getFidelityConstraint(zone);
  return compareFidelity(fidelity, constraint.maxFidelity) <= 0;
}

/**
 * Check if effect is allowed in zone.
 */
export function isEffectAllowed(effect: string, zone: string): boolean {
  const constraint = getFidelityConstraint(zone);
  return !constraint.disallowedEffects.includes(effect.toLowerCase());
}

/**
 * Validate fidelity constraint.
 */
export function validateFidelityConstraint(
  zone: string,
  fidelity?: string,
  effects?: string[]
): ValidationViolation[] {
  const violations: ValidationViolation[] = [];
  const constraint = getFidelityConstraint(zone);

  // Check fidelity level
  if (fidelity && !isFidelityValid(fidelity, zone)) {
    violations.push({
      type: 'fidelity',
      severity: 'error',
      message: `Fidelity violation: ${zone} zone allows max '${constraint.maxFidelity}' fidelity, got '${fidelity}'`,
      suggestion: `Reduce fidelity to '${constraint.maxFidelity}' or lower`,
    });
  }

  // Check individual effects
  if (effects) {
    for (const effect of effects) {
      if (!isEffectAllowed(effect, zone)) {
        violations.push({
          type: 'fidelity',
          severity: 'error',
          message: `Fidelity violation: '${effect}' effect not allowed in ${zone} zone`,
          suggestion: `Remove '${effect}' effect or use a different zone`,
        });
      }
    }
  }

  return violations;
}

// =============================================================================
// CODE ANALYSIS
// =============================================================================

/**
 * Extract zone from code.
 */
export function extractZoneFromCode(code: string): string | null {
  // Check for zone prop
  const zonePropMatch = code.match(/zone=["'](\w+)["']/);
  if (zonePropMatch) {
    return zonePropMatch[1];
  }

  // Check for zone component
  const zoneComponentMatch = code.match(/<(Critical|Marketing|Admin|Standard)Zone/);
  if (zoneComponentMatch) {
    return zoneComponentMatch[1].toLowerCase();
  }

  // Check for @sigil-zone pragma
  const pragmaMatch = code.match(/@sigil-zone\s+(\w+)/);
  if (pragmaMatch) {
    return pragmaMatch[1];
  }

  return null;
}

/**
 * Extract physics from code.
 */
export function extractPhysicsFromCode(code: string): string | null {
  // Check for physics prop
  const physicsPropMatch = code.match(/physics=["'](\w+)["']/);
  if (physicsPropMatch) {
    return physicsPropMatch[1];
  }

  // Check for @sigil-physics pragma
  const pragmaMatch = code.match(/@sigil-physics\s+(\w+)/);
  if (pragmaMatch) {
    return pragmaMatch[1];
  }

  return null;
}

/**
 * Extract timing from code.
 */
export function extractTimingFromCode(code: string): string | null {
  // Check for duration prop
  const durationMatch = code.match(/duration=\{?["']?(\d+(?:ms|s)?|\d+)["']?\}?/);
  if (durationMatch) {
    return durationMatch[1];
  }

  // Check for timing prop
  const timingMatch = code.match(/timing=["'](\d+(?:ms|s)?)["']/);
  if (timingMatch) {
    return timingMatch[1];
  }

  // Check for transition.duration in framer-motion
  const transitionMatch = code.match(/transition=\{\{[^}]*duration:\s*(\d+(?:\.\d+)?)/);
  if (transitionMatch) {
    return `${parseFloat(transitionMatch[1]) * 1000}ms`;
  }

  return null;
}

/**
 * Extract material from code.
 */
export function extractMaterialFromCode(code: string): string | null {
  // Check for material prop
  const materialPropMatch = code.match(/material=["'](\w+)["']/);
  if (materialPropMatch) {
    return materialPropMatch[1];
  }

  // Check for @sigil-material pragma
  const pragmaMatch = code.match(/@sigil-material\s+(\w+)/);
  if (pragmaMatch) {
    return pragmaMatch[1];
  }

  return null;
}

/**
 * Extract imports from code.
 */
export function extractImportsFromCode(code: string): Array<{ package: string; exports: string[] }> {
  const imports: Array<{ package: string; exports: string[] }> = [];

  // Match ES6 imports
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["']/g;
  let match;

  while ((match = importRegex.exec(code)) !== null) {
    const exportNames = match[1]
      .split(',')
      .map(s => s.trim().split(' as ')[0].trim())
      .filter(Boolean);
    imports.push({
      package: match[2],
      exports: exportNames,
    });
  }

  // Match default imports
  const defaultImportRegex = /import\s+(\w+)\s+from\s+["']([^"']+)["']/g;
  while ((match = defaultImportRegex.exec(code)) !== null) {
    imports.push({
      package: match[2],
      exports: [match[1]],
    });
  }

  return imports;
}

// =============================================================================
// MAIN VALIDATOR
// =============================================================================

/**
 * Validate code for physics violations.
 * Returns validation result with violations if any found.
 */
export function validatePhysics(
  code: string,
  options: ValidationOptions = {}
): ValidationResult {
  const {
    workshop,
    checkApi = true,
    checkFidelity = true,
    verbose = false,
  } = options;

  const violations: ValidationViolation[] = [];

  // Extract zone and physics from code
  const zone = extractZoneFromCode(code);
  const physics = extractPhysicsFromCode(code);
  const timing = extractTimingFromCode(code);
  const material = extractMaterialFromCode(code);

  // Zone-physics validation
  if (zone && physics) {
    const zoneViolation = validateZoneConstraint(zone, physics);
    if (zoneViolation) {
      violations.push(zoneViolation);
      if (verbose) {
        console.log(`[Physics] Zone violation: ${zone} + ${physics}`);
      }
    }
  }

  // Material-timing validation
  if (material && timing) {
    const materialViolation = validateMaterialConstraint(material, timing);
    if (materialViolation) {
      violations.push(materialViolation);
      if (verbose) {
        console.log(`[Physics] Material violation: ${material} + ${timing}`);
      }
    }
  }

  // API correctness validation
  if (checkApi && workshop) {
    const imports = extractImportsFromCode(code);
    for (const imp of imports) {
      for (const exp of imp.exports) {
        const apiViolation = validateApiExport(imp.package, exp, workshop);
        if (apiViolation) {
          violations.push(apiViolation);
          if (verbose) {
            console.log(`[Physics] API violation: ${imp.package}.${exp}`);
          }
        }
      }
    }
  }

  // Fidelity validation
  if (checkFidelity && zone) {
    // Check for high-fidelity effects in the code
    const effectPatterns: Array<{ pattern: RegExp; effect: string }> = [
      { pattern: /transform3d|perspective|rotateX|rotateY|rotateZ/i, effect: '3d' },
      { pattern: /particles?|confetti/i, effect: 'particles' },
      { pattern: /video|autoplay/i, effect: 'video' },
      { pattern: /blur\(|backdrop-filter.*blur/i, effect: 'blur' },
      { pattern: /linear-gradient|radial-gradient/i, effect: 'gradients' },
      { pattern: /box-shadow|drop-shadow|shadow-/i, effect: 'shadows' },
    ];

    const detectedEffects: string[] = [];
    for (const { pattern, effect } of effectPatterns) {
      if (pattern.test(code)) {
        detectedEffects.push(effect);
      }
    }

    if (detectedEffects.length > 0) {
      const fidelityViolations = validateFidelityConstraint(zone, undefined, detectedEffects);
      violations.push(...fidelityViolations);
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Format validation result for hook response.
 */
export function formatValidationResponse(result: ValidationResult): {
  allow: boolean;
  reason?: string;
  suggestion?: string;
} {
  if (result.valid) {
    return { allow: true };
  }

  // Get first error
  const error = result.violations.find(v => v.severity === 'error');
  if (error) {
    return {
      allow: false,
      reason: error.message,
      suggestion: error.suggestion,
    };
  }

  // All warnings, allow with message
  return { allow: true };
}

/**
 * Quick validation for PreToolUse hook.
 * Returns hook response format.
 */
export function validateForHook(
  code: string,
  workshopPath?: string
): { allow: boolean; reason?: string; suggestion?: string } {
  let workshop: Workshop | undefined;

  if (workshopPath) {
    try {
      workshop = loadWorkshop(workshopPath);
    } catch {
      // No workshop, skip API checks
    }
  }

  const result = validatePhysics(code, {
    workshop,
    checkApi: !!workshop,
    checkFidelity: true,
  });

  return formatValidationResponse(result);
}

// =============================================================================
// OPTIMISTIC DIVERGENCE (v6.1)
// =============================================================================

/**
 * Violation classification for optimistic divergence.
 */
export type ViolationClass = 'physics' | 'taste';

/**
 * Classify a violation as physics (block) or taste (tag).
 *
 * Physics violations (BLOCK):
 * - Zone-physics mismatch
 * - Material-timing mismatch
 * - API errors
 *
 * Taste violations (TAG with @sigil-status divergent):
 * - Fidelity preferences
 * - Style deviations
 * - Non-canonical patterns
 */
export function classifyViolation(violation: ValidationViolation): ViolationClass {
  // Physics violations: zone and material constraints are safety
  if (violation.type === 'zone') {
    return 'physics';
  }

  if (violation.type === 'material') {
    return 'physics';
  }

  if (violation.type === 'api') {
    return 'physics';
  }

  // Fidelity violations are taste, not physics
  if (violation.type === 'fidelity') {
    return 'taste';
  }

  // Default to physics for safety
  return 'physics';
}

/**
 * v6.1: Validate with optimistic divergence.
 * Physics violations → BLOCK (safety)
 * Taste violations → TAG with @sigil-status divergent (allowed but tracked)
 *
 * Returns combined result with both violations and divergent patterns.
 */
export function validatePhysicsOptimistic(
  code: string,
  options: ValidationOptions = {}
): {
  allow: boolean;
  violations: ValidationViolation[];
  divergent: DivergentPattern[];
  tag?: string;
} {
  const result = validatePhysics(code, options);

  const physicsViolations: ValidationViolation[] = [];
  const tasteViolations: ValidationViolation[] = [];

  // Classify each violation
  for (const violation of result.violations) {
    const classification = classifyViolation(violation);
    if (classification === 'physics') {
      physicsViolations.push(violation);
    } else {
      tasteViolations.push(violation);
    }
  }

  // Convert taste violations to divergent patterns
  const divergent: DivergentPattern[] = tasteViolations.map((v, index) => ({
    pattern: `divergent-${v.type}-${index}`,
    reason: v.message,
    tag: `@sigil-status divergent`,
    detectedAt: new Date().toISOString(),
  }));

  // Only block on physics violations
  const allow = physicsViolations.length === 0;

  // Generate tag if there are divergent patterns
  const tag = divergent.length > 0
    ? `/** @sigil-status divergent - ${divergent.length} taste deviation(s) */`
    : undefined;

  return {
    allow,
    violations: physicsViolations,
    divergent,
    tag,
  };
}

/**
 * v6.1: Check if code has divergent status.
 */
export function isDivergent(code: string): boolean {
  return /@sigil-status\s+divergent/.test(code);
}

/**
 * v6.1: Extract divergent patterns from tagged code.
 */
export function extractDivergentPatterns(code: string): string[] {
  const patterns: string[] = [];
  const regex = /@sigil-status\s+divergent(?:\s*-\s*(.+?))?(?:\*\/|\n)/g;
  let match;

  while ((match = regex.exec(code)) !== null) {
    if (match[1]) {
      patterns.push(match[1].trim());
    }
  }

  return patterns;
}

// =============================================================================
// HOOK BRIDGE EXPORTS
// =============================================================================

/**
 * Hook result type for bash script bridge.
 */
export interface HookValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Physics violations found (blocking) */
  violations: Array<{
    type: string;
    severity: string;
    message: string;
    suggestion?: string;
  }>;
  /** v6.1: Divergent patterns (allowed but tagged) */
  divergent: string[];
  /** v6.1: Tag to add to code if divergent */
  tag?: string;
}

/**
 * Validation function for bash hook bridge.
 * Called by validate.sh via npx tsx.
 *
 * v6.1: Now uses optimistic divergence - taste violations are tagged, not blocked.
 *
 * @param code - Code content to validate
 * @param filePath - Optional file path for context
 * @param projectRoot - Project root for workshop lookup
 * @returns HookValidationResult
 */
export function validatePhysicsForHook(
  code: string,
  filePath?: string,
  projectRoot: string = process.cwd()
): HookValidationResult {
  // Load workshop if available
  let workshop: Workshop | undefined;
  const workshopPath = `${projectRoot}/grimoires/sigil/state/workshop.json`;

  try {
    workshop = loadWorkshop(workshopPath);
  } catch {
    // No workshop available, continue without API checks
  }

  // v6.1: Use optimistic divergence instead of blocking on all violations
  const result = validatePhysicsOptimistic(code, {
    workshop,
    projectRoot,
    checkApi: !!workshop,
    checkFidelity: true,
  });

  // Transform to hook result format
  return {
    valid: result.allow,
    violations: result.violations.map(v => ({
      type: v.type,
      severity: v.severity,
      message: v.message,
      suggestion: v.suggestion,
    })),
    divergent: result.divergent.map(d => d.pattern),
    tag: result.tag,
  };
}
