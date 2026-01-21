/**
 * AdversarialWarden - Detect deceptive grounding claims
 *
 * Implements adversarial testing to catch agents citing lenient physics
 * when stricter physics are required.
 */

import type { Zone, WardenResult, CheckResult, LearnedRule } from '../types.js';
import { ZONE_HIERARCHY } from '../types.js';
import type { GroundingStatement, EffectType } from './types.js';
import { validateGrounding, parseGroundingStatement } from './grounding-gate.js';

/** Component types that can use each zone */
const ZONE_RELEVANCE: Record<Zone, string[]> = {
  critical: [
    'button',
    'form',
    'modal',
    'dialog',
    'action',
    'input',
    'transaction',
    'payment',
    'claim',
    'withdraw',
    'deposit',
    'transfer',
    'swap',
    'stake',
    'mint',
    'burn',
  ],
  elevated: [
    'button',
    'form',
    'modal',
    'dialog',
    'action',
    'delete',
    'remove',
    'revoke',
    'terminate',
    'confirmation',
  ],
  standard: [
    'button',
    'form',
    'modal',
    'dialog',
    'action',
    'input',
    'card',
    'list',
    'table',
    'save',
    'edit',
    'create',
    'update',
  ],
  local: [
    'toggle',
    'switch',
    'checkbox',
    'radio',
    'select',
    'dropdown',
    'tooltip',
    'accordion',
    'tab',
    'theme',
    'preference',
    'filter',
    'sort',
  ],
};

/**
 * AdversarialWarden class for detecting deceptive grounding
 */
export class AdversarialWarden {
  private learnedRules: LearnedRule[] = [];

  /**
   * Add a learned rule to the warden
   *
   * @param rule - The learned rule to add
   */
  addLearnedRule(rule: LearnedRule): void {
    this.learnedRules.push(rule);
  }

  /**
   * Clear all learned rules
   */
  clearLearnedRules(): void {
    this.learnedRules = [];
  }

  /**
   * Get all learned rules
   */
  getLearnedRules(): LearnedRule[] {
    return [...this.learnedRules];
  }

  /**
   * Check if cited zone is relevant to the component type
   *
   * Critical zone should only be cited for buttons, forms, modals, actions
   * Citing critical for a tooltip is suspicious
   *
   * @param citedZone - The zone cited by the agent
   * @param componentName - The component name
   * @returns Check result
   */
  checkRelevance(citedZone: Zone, componentName: string): CheckResult {
    const componentLower = componentName.toLowerCase();
    const relevantTypes = ZONE_RELEVANCE[citedZone];

    // Check if component name contains any relevant type
    const isRelevant = relevantTypes.some((type) =>
      componentLower.includes(type)
    );

    if (!isRelevant) {
      // Check if it's over-claiming (critical for non-critical component)
      const zoneIndex = ZONE_HIERARCHY.indexOf(citedZone);
      if (zoneIndex <= 1) {
        // critical or elevated
        return {
          passed: false,
          reason: `Zone "${citedZone}" is unnecessarily restrictive for component "${componentName}"`,
        };
      }
    }

    return {
      passed: true,
      reason: `Zone "${citedZone}" is appropriate for component "${componentName}"`,
    };
  }

  /**
   * Check learned rules against a grounding statement
   *
   * @param statement - Parsed grounding statement
   * @returns Check result with missing rule citations
   */
  checkLearnedRules(statement: GroundingStatement): CheckResult {
    const missingRules: string[] = [];

    for (const rule of this.learnedRules) {
      if (!rule.grounding_requirement?.must_cite) continue;

      // Check if rule trigger matches the statement
      const triggerMatches = this.checkRuleTrigger(rule, statement);
      if (!triggerMatches) continue;

      // Check if the required citation is present
      const citationPresent = this.checkCitationPresent(rule, statement);
      if (!citationPresent) {
        missingRules.push(rule.id);
      }
    }

    if (missingRules.length > 0) {
      return {
        passed: false,
        reason: `Missing required rule citations: ${missingRules.join(', ')}`,
      };
    }

    return {
      passed: true,
      reason: 'All required rule citations present',
    };
  }

  /**
   * Check if a rule's trigger matches the statement
   */
  private checkRuleTrigger(
    rule: LearnedRule,
    statement: GroundingStatement
  ): boolean {
    const trigger = rule.rule.trigger;

    // Check component name pattern
    if (trigger.component_name_contains) {
      const matches = trigger.component_name_contains.some((pattern) =>
        statement.component.toLowerCase().includes(pattern.toLowerCase())
      );
      if (!matches) return false;
    }

    // Check zone pattern
    if (trigger.zone) {
      if (statement.citedZone !== trigger.zone) return false;
    }

    // Check effect pattern
    if (trigger.effect && statement.inferredEffect !== trigger.effect) {
      return false;
    }

    return true;
  }

  /**
   * Check if required citation is present in statement
   */
  private checkCitationPresent(
    rule: LearnedRule,
    statement: GroundingStatement
  ): boolean {
    const mustCite = rule.grounding_requirement?.must_cite;
    if (!mustCite) return true;

    // Check if the statement's raw text contains the required citation
    const rawLower = statement.raw.toLowerCase();

    // Check for zone citation
    if (mustCite.zone && statement.citedZone !== mustCite.zone) {
      return false;
    }

    // Check for physics citations
    if (mustCite.physics) {
      for (const physics of mustCite.physics) {
        if (!rawLower.includes(physics.toLowerCase())) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Run full adversarial validation
   *
   * @param input - Raw text or parsed statement
   * @param options - Validation options
   * @returns Extended warden result with adversarial checks
   */
  async validate(
    input: string | GroundingStatement,
    options?: {
      physicsPath?: string;
      vocabularyPath?: string;
    }
  ): Promise<AdversarialWardenResult> {
    // Parse statement if string
    const statement =
      typeof input === 'string' ? parseGroundingStatement(input) : input;

    // Run base grounding validation
    const baseResult = await validateGrounding(statement, options);

    // Run adversarial checks
    const relevanceCheck = statement.component
      ? this.checkRelevance(
          statement.citedZone ?? 'standard',
          statement.component
        )
      : { passed: true, reason: 'No component to check' };

    const learnedRulesCheck = this.checkLearnedRules(statement);

    // Determine final status
    let status = baseResult.status;
    let correction = baseResult.correction;

    // Relevance failure indicates DRIFT (over-claiming)
    if (!relevanceCheck.passed && status === 'VALID') {
      status = 'DRIFT';
      correction = relevanceCheck.reason;
    }

    // Learned rules failure indicates DRIFT
    if (!learnedRulesCheck.passed && status === 'VALID') {
      status = 'DRIFT';
      correction = learnedRulesCheck.reason;
    }

    return {
      ...baseResult,
      status,
      ...(correction !== undefined && { correction }),
      adversarialChecks: {
        relevance: relevanceCheck,
        learnedRules: learnedRulesCheck,
      },
    };
  }
}

/**
 * Extended result with adversarial checks
 */
export interface AdversarialWardenResult extends WardenResult {
  adversarialChecks: {
    relevance: CheckResult;
    learnedRules: CheckResult;
  };
}

/**
 * Check if zone A is more restrictive than zone B
 *
 * @param a - First zone
 * @param b - Second zone
 * @returns True if A is more restrictive (lower index in hierarchy)
 */
export function isMoreRestrictive(a: Zone, b: Zone): boolean {
  const indexA = ZONE_HIERARCHY.indexOf(a);
  const indexB = ZONE_HIERARCHY.indexOf(b);
  return indexA < indexB;
}

/**
 * Check if zone A is at least as restrictive as zone B
 *
 * @param a - First zone
 * @param b - Second zone
 * @returns True if A is equal to or more restrictive than B
 */
export function isAtLeastAsRestrictive(a: Zone, b: Zone): boolean {
  const indexA = ZONE_HIERARCHY.indexOf(a);
  const indexB = ZONE_HIERARCHY.indexOf(b);
  return indexA <= indexB;
}

/**
 * Get the zone hierarchy as a readable string
 */
export function getHierarchyDescription(): string {
  return ZONE_HIERARCHY.map((zone, i) => {
    const restrictiveness =
      i === 0 ? 'most restrictive' : i === ZONE_HIERARCHY.length - 1 ? 'least restrictive' : '';
    return `${zone}${restrictiveness ? ` (${restrictiveness})` : ''}`;
  }).join(' > ');
}

/**
 * Create a singleton warden instance
 */
let wardenInstance: AdversarialWarden | null = null;

/**
 * Get or create the singleton warden instance
 */
export function getWarden(): AdversarialWarden {
  if (!wardenInstance) {
    wardenInstance = new AdversarialWarden();
  }
  return wardenInstance;
}

/**
 * Reset the singleton warden instance (for testing)
 */
export function resetWarden(): void {
  wardenInstance = null;
}
