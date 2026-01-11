/**
 * Sigil v3.0 — Philosophy Reader
 *
 * Reads and manages the philosophy layer (intent, principles, conflict resolution).
 * Implements graceful degradation: never throws, always returns valid data.
 *
 * Philosophy: "Sweat the art. We handle the mechanics. Return to flow."
 *
 * @module process/philosophy-reader
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import YAML from 'yaml';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Conflict resolution context.
 */
export type ConflictContext = 'always' | 'critical_zone' | 'marketing_zone' | 'admin_zone';

/**
 * Default resolution strategy.
 */
export type ResolutionStrategy = 'priority' | 'first' | 'merge' | 'ask';

/**
 * Example of principle application.
 */
export interface PrincipleExample {
  scenario: string;
  good: string;
  bad?: string;
}

/**
 * A design principle.
 */
export interface Principle {
  /** Unique identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** The principle statement */
  statement: string;
  /** Why this principle exists */
  rationale: string;
  /** Priority for conflict resolution (higher wins) */
  priority: number;
  /** Zones where this applies (empty = all) */
  zones: string[];
  /** Examples of application */
  examples: PrincipleExample[];
}

/**
 * Product intent hierarchy.
 */
export interface Intent {
  /** Primary product goal */
  primary: string;
  /** Secondary goals in priority order */
  secondary: string[];
  /** What we explicitly do NOT want */
  anti_goals: string[];
}

/**
 * A conflict resolution rule.
 */
export interface ConflictRule {
  /** Unique rule identifier */
  id: string;
  /** The two concerns in conflict */
  conflict: [string, string];
  /** Which concern wins */
  winner: string;
  /** Why this resolution was chosen */
  rationale: string;
  /** Context where this applies */
  context: ConflictContext;
}

/**
 * Conflict resolution configuration.
 */
export interface ConflictResolution {
  /** Resolution rules */
  rules: ConflictRule[];
  /** Default strategy when no rule matches */
  default_strategy: ResolutionStrategy;
}

/**
 * The Philosophy: intent, principles, and conflict resolution.
 */
export interface Philosophy {
  /** Schema version */
  version: string;
  /** Philosophy codename */
  codename: string;
  /** Product intent hierarchy */
  intent: Intent;
  /** Design principles */
  principles: Principle[];
  /** Conflict resolution rules */
  conflict_resolution: ConflictResolution;
  /** Decision hierarchy (priority order) */
  decision_hierarchy: string[];
}

/**
 * Result of conflict resolution.
 */
export interface ConflictResult {
  /** The winning concern */
  winner: string;
  /** The losing concern */
  loser: string;
  /** Rationale for the decision */
  rationale: string;
  /** The rule that was applied (or null if default) */
  rule: ConflictRule | null;
  /** Resolution strategy used */
  strategy: ResolutionStrategy;
}

// =============================================================================
// DEFAULTS
// =============================================================================

/**
 * Default philosophy (minimal fallback).
 */
export const DEFAULT_PHILOSOPHY: Philosophy = {
  version: '3.0.0',
  codename: 'Default',
  intent: {
    primary: 'Build trust through transparency',
    secondary: [],
    anti_goals: [],
  },
  principles: [],
  conflict_resolution: {
    rules: [],
    default_strategy: 'priority',
  },
  decision_hierarchy: [],
};

/**
 * Default path to the philosophy file.
 */
export const DEFAULT_PHILOSOPHY_PATH = 'sigil-mark/soul-binder/philosophy.yaml';

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Valid conflict contexts.
 */
const VALID_CONTEXTS: ConflictContext[] = ['always', 'critical_zone', 'marketing_zone', 'admin_zone'];

/**
 * Valid resolution strategies.
 */
const VALID_STRATEGIES: ResolutionStrategy[] = ['priority', 'first', 'merge', 'ask'];

/**
 * Validates a conflict context.
 */
function isValidContext(value: unknown): value is ConflictContext {
  return typeof value === 'string' && VALID_CONTEXTS.includes(value as ConflictContext);
}

/**
 * Validates a resolution strategy.
 */
function isValidStrategy(value: unknown): value is ResolutionStrategy {
  return typeof value === 'string' && VALID_STRATEGIES.includes(value as ResolutionStrategy);
}

/**
 * Validates a principle example.
 */
function isValidExample(value: unknown): value is PrincipleExample {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.scenario === 'string' &&
    obj.scenario.length > 0 &&
    typeof obj.good === 'string' &&
    obj.good.length > 0
  );
}

/**
 * Validates a principle.
 */
function isValidPrinciple(value: unknown): value is Omit<Principle, 'priority' | 'zones' | 'examples'> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    obj.id.length > 0 &&
    typeof obj.name === 'string' &&
    obj.name.length > 0 &&
    typeof obj.statement === 'string' &&
    obj.statement.length > 0 &&
    typeof obj.rationale === 'string' &&
    obj.rationale.length > 0
  );
}

/**
 * Validates a conflict rule.
 */
function isValidConflictRule(value: unknown): value is Omit<ConflictRule, 'context'> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    obj.id.length > 0 &&
    Array.isArray(obj.conflict) &&
    obj.conflict.length === 2 &&
    typeof obj.conflict[0] === 'string' &&
    typeof obj.conflict[1] === 'string' &&
    typeof obj.winner === 'string' &&
    obj.winner.length > 0 &&
    typeof obj.rationale === 'string'
  );
}

/**
 * Normalizes a principle.
 */
function normalizePrinciple(obj: Record<string, unknown>): Principle | null {
  if (!isValidPrinciple(obj)) {
    return null;
  }

  const examples: PrincipleExample[] = [];
  if (Array.isArray(obj.examples)) {
    for (const example of obj.examples) {
      if (isValidExample(example)) {
        examples.push({
          scenario: (example as Record<string, unknown>).scenario as string,
          good: (example as Record<string, unknown>).good as string,
          bad: (example as Record<string, unknown>).bad as string | undefined,
        });
      }
    }
  }

  const zones: string[] = [];
  if (Array.isArray(obj.zones)) {
    for (const zone of obj.zones) {
      if (typeof zone === 'string') {
        zones.push(zone);
      }
    }
  }

  return {
    id: obj.id as string,
    name: obj.name as string,
    statement: obj.statement as string,
    rationale: obj.rationale as string,
    priority: typeof obj.priority === 'number' ? obj.priority : 0,
    zones,
    examples,
  };
}

/**
 * Normalizes a conflict rule.
 */
function normalizeConflictRule(obj: Record<string, unknown>): ConflictRule | null {
  if (!isValidConflictRule(obj)) {
    return null;
  }

  return {
    id: obj.id as string,
    conflict: obj.conflict as [string, string],
    winner: obj.winner as string,
    rationale: obj.rationale as string,
    context: isValidContext(obj.context) ? obj.context : 'always',
  };
}

/**
 * Validates and normalizes a philosophy object.
 */
function validatePhilosophy(parsed: unknown): Philosophy {
  if (typeof parsed !== 'object' || parsed === null) {
    console.warn('[Sigil Philosophy] Invalid philosophy format, using defaults');
    return DEFAULT_PHILOSOPHY;
  }

  const obj = parsed as Record<string, unknown>;

  // Validate version
  const version = typeof obj.version === 'string' ? obj.version : '3.0.0';
  const codename = typeof obj.codename === 'string' ? obj.codename : 'Unknown';

  // Validate intent
  let intent: Intent = DEFAULT_PHILOSOPHY.intent;
  if (typeof obj.intent === 'object' && obj.intent !== null) {
    const intentObj = obj.intent as Record<string, unknown>;
    intent = {
      primary: typeof intentObj.primary === 'string' ? intentObj.primary : DEFAULT_PHILOSOPHY.intent.primary,
      secondary: Array.isArray(intentObj.secondary)
        ? intentObj.secondary.filter((s): s is string => typeof s === 'string')
        : [],
      anti_goals: Array.isArray(intentObj.anti_goals)
        ? intentObj.anti_goals.filter((s): s is string => typeof s === 'string')
        : [],
    };
  }

  // Validate principles
  const principles: Principle[] = [];
  if (Array.isArray(obj.principles)) {
    for (const principle of obj.principles) {
      const normalized = normalizePrinciple(principle as Record<string, unknown>);
      if (normalized) {
        principles.push(normalized);
      } else {
        console.warn(`[Sigil Philosophy] Skipping invalid principle`);
      }
    }
  }

  // Validate conflict resolution
  let conflictResolution: ConflictResolution = DEFAULT_PHILOSOPHY.conflict_resolution;
  if (typeof obj.conflict_resolution === 'object' && obj.conflict_resolution !== null) {
    const crObj = obj.conflict_resolution as Record<string, unknown>;
    const rules: ConflictRule[] = [];

    if (Array.isArray(crObj.rules)) {
      for (const rule of crObj.rules) {
        const normalized = normalizeConflictRule(rule as Record<string, unknown>);
        if (normalized) {
          rules.push(normalized);
        }
      }
    }

    conflictResolution = {
      rules,
      default_strategy: isValidStrategy(crObj.default_strategy)
        ? crObj.default_strategy
        : 'priority',
    };
  }

  // Validate decision hierarchy
  const decisionHierarchy: string[] = Array.isArray(obj.decision_hierarchy)
    ? obj.decision_hierarchy.filter((s): s is string => typeof s === 'string')
    : [];

  return {
    version,
    codename,
    intent,
    principles,
    conflict_resolution: conflictResolution,
    decision_hierarchy: decisionHierarchy,
  };
}

// =============================================================================
// READER FUNCTIONS
// =============================================================================

/**
 * Reads and parses the Philosophy from a YAML file.
 *
 * Implements graceful degradation:
 * - If file doesn't exist: returns default philosophy
 * - If YAML is invalid: returns default philosophy
 * - If individual items are invalid: skips them
 *
 * @param filePath - Path to the philosophy YAML file
 * @returns Parsed and validated Philosophy
 *
 * @example
 * ```ts
 * const philosophy = await readPhilosophy();
 * console.log(philosophy.intent.primary); // 'Trust above all else'
 * ```
 */
export async function readPhilosophy(
  filePath: string = DEFAULT_PHILOSOPHY_PATH
): Promise<Philosophy> {
  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    const content = await fs.readFile(resolvedPath, 'utf-8');
    const parsed = YAML.parse(content);
    return validatePhilosophy(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[Sigil Philosophy] File not found: ${filePath}, using defaults`);
    } else if (error instanceof YAML.YAMLParseError) {
      console.error(`[Sigil Philosophy] YAML parse error: ${error.message}`);
    } else {
      console.error(`[Sigil Philosophy] Error reading philosophy: ${error}`);
    }
    return DEFAULT_PHILOSOPHY;
  }
}

/**
 * Synchronously reads and parses the Philosophy from a YAML file.
 *
 * @param filePath - Path to the philosophy YAML file
 * @returns Parsed and validated Philosophy
 */
export function readPhilosophySync(
  filePath: string = DEFAULT_PHILOSOPHY_PATH
): Philosophy {
  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fsSync = require('fs');
    const content = fsSync.readFileSync(resolvedPath, 'utf-8');
    const parsed = YAML.parse(content);
    return validatePhilosophy(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[Sigil Philosophy] File not found: ${filePath}, using defaults`);
    } else {
      console.error(`[Sigil Philosophy] Error reading philosophy: ${error}`);
    }
    return DEFAULT_PHILOSOPHY;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Gets a principle by ID.
 *
 * @param philosophy - The philosophy to search
 * @param principleId - The principle ID to find
 * @returns The principle, or undefined if not found
 */
export function getPrinciple(
  philosophy: Philosophy,
  principleId: string
): Principle | undefined {
  return philosophy.principles.find((p) => p.id === principleId);
}

/**
 * Gets all principles for a zone.
 *
 * @param philosophy - The philosophy to search
 * @param zone - The zone to filter by
 * @returns Array of principles for the zone (including global principles)
 */
export function getPrinciplesForZone(
  philosophy: Philosophy,
  zone: string
): Principle[] {
  return philosophy.principles.filter(
    (p) => p.zones.length === 0 || p.zones.includes(zone.toLowerCase())
  );
}

/**
 * Gets principles sorted by priority (highest first).
 *
 * @param philosophy - The philosophy
 * @returns Array of principles sorted by priority
 */
export function getPrinciplesByPriority(philosophy: Philosophy): Principle[] {
  return [...philosophy.principles].sort((a, b) => b.priority - a.priority);
}

/**
 * Gets the primary intent.
 *
 * @param philosophy - The philosophy
 * @returns The primary intent string
 */
export function getPrimaryIntent(philosophy: Philosophy): string {
  return philosophy.intent.primary;
}

/**
 * Checks if something is an anti-goal.
 *
 * @param philosophy - The philosophy
 * @param goal - The goal to check
 * @returns True if this is an anti-goal
 */
export function isAntiGoal(philosophy: Philosophy, goal: string): boolean {
  const lowerGoal = goal.toLowerCase();
  return philosophy.intent.anti_goals.some(
    (ag) => ag.toLowerCase().includes(lowerGoal) || lowerGoal.includes(ag.toLowerCase())
  );
}

/**
 * Gets a conflict rule by ID.
 *
 * @param philosophy - The philosophy
 * @param ruleId - The rule ID to find
 * @returns The rule, or undefined if not found
 */
export function getConflictRule(
  philosophy: Philosophy,
  ruleId: string
): ConflictRule | undefined {
  return philosophy.conflict_resolution.rules.find((r) => r.id === ruleId);
}

/**
 * Resolves a conflict between two concerns.
 *
 * @param philosophy - The philosophy
 * @param concernA - First concern
 * @param concernB - Second concern
 * @param context - Optional context for resolution
 * @returns Conflict resolution result
 *
 * @example
 * ```ts
 * const philosophy = await readPhilosophy();
 * const result = resolveConflict(philosophy, 'trust', 'speed');
 * console.log(result.winner); // 'trust'
 * console.log(result.rationale); // 'Speed can be recovered. Trust cannot.'
 * ```
 */
export function resolveConflict(
  philosophy: Philosophy,
  concernA: string,
  concernB: string,
  context: ConflictContext = 'always'
): ConflictResult {
  const lowerA = concernA.toLowerCase();
  const lowerB = concernB.toLowerCase();

  // Find matching rule
  const matchingRule = philosophy.conflict_resolution.rules.find((rule) => {
    const [c1, c2] = rule.conflict.map((c) => c.toLowerCase());
    const matchesConcerns =
      (c1 === lowerA && c2 === lowerB) || (c1 === lowerB && c2 === lowerA);
    const matchesContext = rule.context === 'always' || rule.context === context;
    return matchesConcerns && matchesContext;
  });

  if (matchingRule) {
    const winner = matchingRule.winner.toLowerCase();
    return {
      winner: winner === lowerA ? concernA : concernB,
      loser: winner === lowerA ? concernB : concernA,
      rationale: matchingRule.rationale,
      rule: matchingRule,
      strategy: 'priority',
    };
  }

  // Fallback: use decision hierarchy
  const hierarchyA = philosophy.decision_hierarchy.findIndex(
    (p) => p.toLowerCase() === lowerA
  );
  const hierarchyB = philosophy.decision_hierarchy.findIndex(
    (p) => p.toLowerCase() === lowerB
  );

  // If both are in hierarchy, earlier (lower index) wins
  if (hierarchyA !== -1 && hierarchyB !== -1) {
    const winnerIdx = hierarchyA < hierarchyB ? hierarchyA : hierarchyB;
    const loserIdx = hierarchyA < hierarchyB ? hierarchyB : hierarchyA;
    return {
      winner: philosophy.decision_hierarchy[winnerIdx],
      loser: philosophy.decision_hierarchy[loserIdx],
      rationale: 'Resolved by decision hierarchy order',
      rule: null,
      strategy: philosophy.conflict_resolution.default_strategy,
    };
  }

  // If only one is in hierarchy, it wins
  if (hierarchyA !== -1) {
    return {
      winner: concernA,
      loser: concernB,
      rationale: `${concernA} is in decision hierarchy`,
      rule: null,
      strategy: philosophy.conflict_resolution.default_strategy,
    };
  }

  if (hierarchyB !== -1) {
    return {
      winner: concernB,
      loser: concernA,
      rationale: `${concernB} is in decision hierarchy`,
      rule: null,
      strategy: philosophy.conflict_resolution.default_strategy,
    };
  }

  // No resolution found - return first concern (deterministic)
  return {
    winner: concernA,
    loser: concernB,
    rationale: 'No matching rule or hierarchy entry; defaulting to first concern',
    rule: null,
    strategy: philosophy.conflict_resolution.default_strategy,
  };
}

/**
 * Checks if a principle applies to a given zone.
 *
 * @param principle - The principle to check
 * @param zone - The zone to check against
 * @returns True if the principle applies to this zone
 */
export function principleAppliesToZone(principle: Principle, zone: string): boolean {
  return principle.zones.length === 0 || principle.zones.includes(zone.toLowerCase());
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Formats a principle for display.
 *
 * @param principle - The principle to format
 * @returns Formatted string
 */
export function formatPrincipleSummary(principle: Principle): string {
  return `${principle.name} (${principle.id})
  Statement: "${principle.statement}"
  Priority: ${principle.priority}
  Zones: ${principle.zones.length === 0 ? 'All zones' : principle.zones.join(', ')}`;
}

/**
 * Formats a philosophy summary.
 *
 * @param philosophy - The philosophy to summarize
 * @returns Formatted string
 */
export function formatPhilosophySummary(philosophy: Philosophy): string {
  const principleList = philosophy.principles
    .map((p) => `  - ${p.name}: "${p.statement.slice(0, 50)}..."`)
    .join('\n');

  const ruleList = philosophy.conflict_resolution.rules
    .map((r) => `  - ${r.conflict[0]} vs ${r.conflict[1]} → ${r.winner}`)
    .join('\n');

  return `Sigil Philosophy v${philosophy.version} — "${philosophy.codename}"

Primary Intent: ${philosophy.intent.primary}

Principles (${philosophy.principles.length}):
${principleList}

Conflict Rules (${philosophy.conflict_resolution.rules.length}):
${ruleList}

Decision Hierarchy:
  ${philosophy.decision_hierarchy.join(' → ')}`;
}
