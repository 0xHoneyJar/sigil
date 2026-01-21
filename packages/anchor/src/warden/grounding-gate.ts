/**
 * GroundingGate - Validate agent grounding statements
 *
 * Parses agent output for grounding statements and validates them
 * against Sigil physics rules.
 */

import { loadPhysics } from './physics-loader.js';
import { loadVocabulary, resolveEffectFromKeywords } from './vocabulary-loader.js';
import { ZONE_HIERARCHY } from '../types.js';
import type { Zone, WardenResult, CheckResult } from '../types.js';
import type {
  GroundingStatement,
  PhysicsTable,
  Vocabulary,
  EffectType,
  SyncStrategy,
  ConfirmationType,
} from './types.js';

/** Zone to effect type mapping */
const ZONE_TO_EFFECT: Record<Zone, EffectType> = {
  critical: 'financial',
  elevated: 'destructive',
  standard: 'standard',
  local: 'local',
};

/** Effect type to zone mapping */
const EFFECT_TO_ZONE: Record<EffectType, Zone> = {
  financial: 'critical',
  destructive: 'elevated',
  soft_delete: 'standard',
  standard: 'standard',
  navigation: 'local',
  query: 'local',
  local: 'local',
  high_freq: 'local',
};

/**
 * Parse zone from string
 */
function parseZone(value: string): Zone | null {
  const normalized = value.toLowerCase().trim();
  if (normalized === 'critical') return 'critical';
  if (normalized === 'elevated') return 'elevated';
  if (normalized === 'standard') return 'standard';
  if (normalized === 'local') return 'local';
  return null;
}

/**
 * Parse sync strategy from string
 */
function parseSyncStrategy(value: string): SyncStrategy | undefined {
  const normalized = value.toLowerCase().trim();
  if (normalized.includes('pessimistic')) return 'pessimistic';
  if (normalized.includes('optimistic')) return 'optimistic';
  if (normalized.includes('immediate')) return 'immediate';
  return undefined;
}

/**
 * Parse timing from string
 */
function parseTiming(value: string): number | undefined {
  const match = value.match(/(\d+)\s*ms/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return undefined;
}

/**
 * Parse confirmation from string
 */
function parseConfirmation(value: string): ConfirmationType | undefined {
  const normalized = value.toLowerCase().trim();
  if (normalized.includes('required') || normalized === 'yes') return 'required';
  if (normalized.includes('toast') || normalized.includes('undo')) return 'toast_undo';
  if (normalized.includes('none') || normalized === 'no') return 'none';
  return undefined;
}

/**
 * Extract keywords from text
 * Note: Only extracts action keywords, not zone/effect labels from structured fields
 */
function extractKeywords(text: string): string[] {
  // Remove structured field labels to avoid false positives
  // e.g., "Zone: standard" should not detect "standard" as an action keyword
  const cleanedText = text
    .replace(/Zone:\s*\w+/gi, '')
    .replace(/Effect:\s*[\w\s]+/gi, '')
    .replace(/Sync:\s*\w+/gi, '')
    .replace(/Confirmation:\s*[\w\s+]+/gi, '');

  // Common keywords to look for
  const keywordPatterns = [
    // Financial
    'claim', 'deposit', 'withdraw', 'transfer', 'swap', 'send', 'pay', 'purchase',
    'mint', 'burn', 'stake', 'unstake', 'bridge', 'approve', 'redeem', 'harvest',
    // Destructive
    'delete', 'remove', 'destroy', 'revoke', 'terminate', 'purge', 'erase', 'wipe',
    // Soft delete
    'archive', 'hide', 'trash', 'dismiss', 'snooze', 'mute',
    // Standard
    'save', 'update', 'edit', 'create', 'add', 'like', 'follow', 'bookmark',
    // Local
    'toggle', 'switch', 'expand', 'collapse', 'select', 'focus',
    // Navigation
    'navigate', 'go', 'back', 'forward', 'link', 'route',
    // Query
    'fetch', 'load', 'get', 'list', 'search', 'find',
    // Domain/type hints
    'wallet', 'token', 'nft', 'contract', 'chain', 'gas',
    'currency', 'money', 'amount', 'balance', 'price', 'fee',
    // Effect type names (for inline detection in prose)
    'financial', 'destructive',
  ];

  const words = cleanedText.toLowerCase().split(/[\s,.:;!?()\[\]{}]+/);
  const foundKeywords: string[] = [];

  for (const word of words) {
    if (keywordPatterns.includes(word)) {
      foundKeywords.push(word);
    }
  }

  return [...new Set(foundKeywords)];
}

/**
 * Parse grounding statement from text
 *
 * Looks for patterns like:
 * - "Zone: critical"
 * - "Effect: Financial"
 * - "Sync: pessimistic"
 * - "Timing: 800ms"
 * - Physics analysis boxes
 */
export function parseGroundingStatement(text: string): GroundingStatement {
  const statement: GroundingStatement = {
    component: '',
    citedZone: null,
    detectedKeywords: [],
    inferredEffect: null,
    claimedPhysics: {},
    raw: text,
  };

  // Extract component name
  // Handle analysis box format with trailing whitespace and box characters
  const componentMatch = text.match(/(?:Component|Button|Modal|Form|Dialog):\s*["']?([^\s"'│|]+)/i);
  if (componentMatch && componentMatch[1]) {
    statement.component = componentMatch[1].trim();
  } else {
    // Try to find component name from context
    const buttonMatch = text.match(/["']?(\w+(?:Button|Modal|Form|Dialog|Card|Input))["']?/);
    if (buttonMatch && buttonMatch[1]) {
      statement.component = buttonMatch[1];
    }
  }

  // Extract zone
  const zoneMatch = text.match(/Zone:\s*(\w+)/i);
  if (zoneMatch && zoneMatch[1]) {
    statement.citedZone = parseZone(zoneMatch[1]);
  }

  // Extract effect
  const effectMatch = text.match(/Effect:\s*(\w+(?:\s+\w+)?)/i);
  if (effectMatch && effectMatch[1]) {
    const effectStr = effectMatch[1].toLowerCase();
    if (effectStr.includes('financial')) statement.inferredEffect = 'financial';
    else if (effectStr.includes('destructive')) statement.inferredEffect = 'destructive';
    else if (effectStr.includes('soft')) statement.inferredEffect = 'soft_delete';
    else if (effectStr.includes('standard')) statement.inferredEffect = 'standard';
    else if (effectStr.includes('local')) statement.inferredEffect = 'local';
    else if (effectStr.includes('navigation')) statement.inferredEffect = 'navigation';
    else if (effectStr.includes('query')) statement.inferredEffect = 'query';
  }

  // Extract sync strategy
  const syncMatch = text.match(/Sync:\s*(\w+)/i);
  if (syncMatch && syncMatch[1]) {
    const parsed = parseSyncStrategy(syncMatch[1]);
    if (parsed) statement.claimedPhysics.sync = parsed;
  } else {
    // Look for inline mentions
    if (text.toLowerCase().includes('pessimistic')) {
      statement.claimedPhysics.sync = 'pessimistic';
    } else if (text.toLowerCase().includes('optimistic')) {
      statement.claimedPhysics.sync = 'optimistic';
    } else if (text.toLowerCase().includes('immediate')) {
      statement.claimedPhysics.sync = 'immediate';
    }
  }

  // Extract timing
  const timingMatch = text.match(/Timing:\s*(\d+\s*ms)/i);
  if (timingMatch && timingMatch[1]) {
    const parsed = parseTiming(timingMatch[1]);
    if (parsed !== undefined) statement.claimedPhysics.timing = parsed;
  } else {
    // Look for inline timing
    const inlineTiming = text.match(/(\d+)\s*ms/);
    if (inlineTiming && inlineTiming[1]) {
      statement.claimedPhysics.timing = parseInt(inlineTiming[1], 10);
    }
  }

  // Extract confirmation
  const confirmMatch = text.match(/Confirm(?:ation)?:\s*(\w+(?:\s*\+\s*\w+)?)/i);
  if (confirmMatch && confirmMatch[1]) {
    const parsed = parseConfirmation(confirmMatch[1]);
    if (parsed) statement.claimedPhysics.confirmation = parsed;
  } else {
    // Look for inline mentions
    if (text.toLowerCase().includes('confirmation required')) {
      statement.claimedPhysics.confirmation = 'required';
    } else if (text.toLowerCase().includes('toast') && text.toLowerCase().includes('undo')) {
      statement.claimedPhysics.confirmation = 'toast_undo';
    }
  }

  // Extract keywords
  statement.detectedKeywords = extractKeywords(text);

  return statement;
}

/**
 * Determine required zone based on keywords and effect
 */
function determineRequiredZone(
  keywords: string[],
  effect: EffectType | null,
  vocabulary: Vocabulary
): Zone {
  // If we have an explicit effect, use its zone
  if (effect) {
    return EFFECT_TO_ZONE[effect];
  }

  // Check for type overrides (highest priority)
  for (const keyword of keywords) {
    const override = vocabulary.typeOverrides.get(keyword.toLowerCase());
    if (override) {
      return EFFECT_TO_ZONE[override];
    }
  }

  // Check for financial keywords (critical zone)
  const financialKeywords = vocabulary.effects.get('financial')?.keywords ?? [];
  for (const keyword of keywords) {
    if (financialKeywords.includes(keyword.toLowerCase())) {
      return 'critical';
    }
  }

  // Check for destructive keywords (elevated zone)
  const destructiveKeywords = vocabulary.effects.get('destructive')?.keywords ?? [];
  for (const keyword of keywords) {
    if (destructiveKeywords.includes(keyword.toLowerCase())) {
      return 'elevated';
    }
  }

  // Default to standard
  return 'standard';
}

/**
 * Check keyword relevance
 */
function checkRelevance(
  statement: GroundingStatement,
  vocabulary: Vocabulary
): CheckResult {
  const { detectedKeywords, component } = statement;

  // If no keywords detected, check if component name contains hints
  if (detectedKeywords.length === 0) {
    const componentLower = component.toLowerCase();
    const allKeywords: string[] = [];

    for (const entry of vocabulary.effects.values()) {
      allKeywords.push(...entry.keywords);
    }

    const hasRelevantComponent = allKeywords.some((k) => componentLower.includes(k));

    if (!hasRelevantComponent) {
      return {
        passed: false,
        reason: 'No relevant keywords detected in statement or component name',
      };
    }
  }

  return {
    passed: true,
    reason: `Keywords detected: ${detectedKeywords.join(', ') || 'from component name'}`,
  };
}

/**
 * Check zone hierarchy compliance
 */
function checkHierarchy(
  statement: GroundingStatement,
  requiredZone: Zone
): CheckResult {
  const { citedZone } = statement;

  if (!citedZone) {
    return {
      passed: false,
      reason: 'No zone cited in statement',
    };
  }

  const requiredIndex = ZONE_HIERARCHY.indexOf(requiredZone);
  const citedIndex = ZONE_HIERARCHY.indexOf(citedZone);

  // Cited zone must be at least as restrictive as required
  // Lower index = more restrictive (critical=0, local=3)
  if (citedIndex > requiredIndex) {
    return {
      passed: false,
      reason: `Zone "${citedZone}" is less restrictive than required "${requiredZone}"`,
    };
  }

  if (citedIndex < requiredIndex) {
    return {
      passed: true,
      reason: `Zone "${citedZone}" is more restrictive than required "${requiredZone}" (OK)`,
    };
  }

  return {
    passed: true,
    reason: `Zone "${citedZone}" matches required zone`,
  };
}

/**
 * Check physics rules compliance
 */
async function checkRules(
  statement: GroundingStatement,
  requiredZone: Zone,
  physics: PhysicsTable
): Promise<CheckResult> {
  const { claimedPhysics } = statement;
  const requiredEffect = ZONE_TO_EFFECT[requiredZone];
  const rule = physics.get(requiredEffect);

  if (!rule) {
    return {
      passed: false,
      reason: `No physics rule found for effect "${requiredEffect}"`,
    };
  }

  const violations: string[] = [];

  // Check sync strategy
  if (claimedPhysics.sync && claimedPhysics.sync !== rule.sync) {
    // Pessimistic is always acceptable for lower zones
    if (claimedPhysics.sync !== 'pessimistic') {
      violations.push(`Sync: claimed "${claimedPhysics.sync}", required "${rule.sync}"`);
    }
  }

  // Check timing (allow some tolerance)
  if (claimedPhysics.timing !== undefined) {
    const timingDiff = Math.abs(claimedPhysics.timing - rule.timing);
    // Allow 100ms tolerance for deliberate adjustments
    if (timingDiff > 100 && claimedPhysics.timing < rule.timing) {
      violations.push(
        `Timing: claimed ${claimedPhysics.timing}ms, required minimum ${rule.timing}ms`
      );
    }
  }

  // Check confirmation
  if (claimedPhysics.confirmation) {
    // "required" is always acceptable
    if (
      rule.confirmation === 'required' &&
      claimedPhysics.confirmation !== 'required'
    ) {
      violations.push(
        `Confirmation: claimed "${claimedPhysics.confirmation}", required "${rule.confirmation}"`
      );
    }
  }

  if (violations.length > 0) {
    return {
      passed: false,
      reason: violations.join('; '),
    };
  }

  return {
    passed: true,
    reason: 'Physics rules validated',
  };
}

/**
 * Validate a grounding statement
 *
 * @param input - Raw text or parsed statement
 * @param options - Validation options
 * @returns Warden validation result
 */
export async function validateGrounding(
  input: string | GroundingStatement,
  options?: {
    physicsPath?: string;
    vocabularyPath?: string;
  }
): Promise<WardenResult> {
  // Load physics and vocabulary
  const physics = await loadPhysics(options?.physicsPath);
  const vocabulary = await loadVocabulary(options?.vocabularyPath);

  // Parse statement if string
  const statement =
    typeof input === 'string' ? parseGroundingStatement(input) : input;

  // Resolve effect from keywords if not already set
  if (!statement.inferredEffect && statement.detectedKeywords.length > 0) {
    statement.inferredEffect = await resolveEffectFromKeywords(
      statement.detectedKeywords,
      vocabulary
    );
  }

  // Determine required zone
  const requiredZone = determineRequiredZone(
    statement.detectedKeywords,
    statement.inferredEffect,
    vocabulary
  );

  // Run validation checks
  const relevanceCheck = checkRelevance(statement, vocabulary);
  const hierarchyCheck = checkHierarchy(statement, requiredZone);
  const rulesCheck = await checkRules(statement, requiredZone, physics);

  // Determine overall status
  let status: WardenResult['status'] = 'VALID';
  let correction: string | undefined;

  if (!relevanceCheck.passed) {
    status = 'DRIFT';
    correction = 'Statement lacks relevant keywords for effect detection.';
  } else if (!hierarchyCheck.passed) {
    status = 'DECEPTIVE';
    correction = `Zone mismatch: cited "${statement.citedZone}", required "${requiredZone}".`;
  } else if (!rulesCheck.passed) {
    status = 'DRIFT';
    correction = `Physics violation: ${rulesCheck.reason}`;
  }

  return {
    status,
    checks: {
      relevance: relevanceCheck,
      hierarchy: hierarchyCheck,
      rules: rulesCheck,
    },
    requiredZone,
    citedZone: statement.citedZone,
    ...(correction !== undefined && { correction }),
  };
}

/**
 * Quick validation check - returns true if valid
 */
export async function isGroundingValid(
  input: string | GroundingStatement,
  options?: {
    physicsPath?: string;
    vocabularyPath?: string;
  }
): Promise<boolean> {
  const result = await validateGrounding(input, options);
  return result.status === 'VALID';
}

/**
 * Get exit code for validation result
 */
export function getExitCode(result: WardenResult): number {
  switch (result.status) {
    case 'VALID':
      return 0; // PASS
    case 'DRIFT':
      return 1; // DRIFT
    case 'DECEPTIVE':
      return 2; // DECEPTIVE
    default:
      return 3; // VIOLATION
  }
}
