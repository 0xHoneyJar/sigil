/**
 * Sigil v2.6 — Decision Reader
 *
 * Reads, writes, and manages locked decisions from the Consultation Chamber.
 * Implements graceful degradation: never throws, always returns valid data.
 *
 * Philosophy: "After you've thought deeply, lock it. Stop re-arguing."
 *
 * @module process/decision-reader
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import YAML from 'yaml';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Decision scope determines lock duration.
 * - `strategic`: Fundamental direction (180 days)
 * - `direction`: Pattern/approach choice (90 days)
 * - `execution`: Implementation detail (30 days)
 */
export type DecisionScope = 'strategic' | 'direction' | 'execution';

/**
 * Decision status.
 * - `locked`: Currently protected from being reopened
 * - `unlocked`: Was locked, but has been unlocked with justification
 * - `expired`: Lock period has passed
 */
export type DecisionStatus = 'locked' | 'unlocked' | 'expired';

/**
 * An option that was considered during deliberation.
 */
export interface ConsideredOption {
  option: string;
  pros?: string[];
  cons?: string[];
}

/**
 * Context for a decision.
 */
export interface DecisionContext {
  /** Relevant zone (e.g., 'critical', 'marketing') */
  zone?: string;
  /** Reference to moodboard section */
  moodboard_ref?: string;
  /** Relevant file paths */
  files?: string[];
  /** Options that were considered */
  options_considered?: ConsideredOption[];
}

/**
 * An unlock event in the decision's history.
 */
export interface UnlockEvent {
  /** When the decision was unlocked */
  unlocked_at: string;
  /** Who unlocked it */
  unlocked_by: string;
  /** Why it was unlocked */
  justification: string;
}

/**
 * A locked decision from the Consultation Chamber.
 */
export interface Decision {
  /** Unique identifier (e.g., 'DEC-2026-001') */
  id: string;
  /** What the decision is about */
  topic: string;
  /** The actual decision made */
  decision: string;
  /** Scope determines lock duration */
  scope: DecisionScope;
  /** When the decision was locked */
  locked_at: string;
  /** Who locked the decision */
  locked_by: string;
  /** When the lock expires */
  expires_at: string;
  /** Context for the decision */
  context?: DecisionContext;
  /** Why this decision was made */
  rationale: string;
  /** Current status */
  status: DecisionStatus;
  /** History of unlock events */
  unlock_history?: UnlockEvent[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Lock periods in days for each scope.
 */
export const LOCK_PERIODS: Record<DecisionScope, number> = {
  strategic: 180,
  direction: 90,
  execution: 30,
} as const;

/**
 * Default path to the decisions directory.
 */
export const DEFAULT_DECISIONS_PATH = 'sigil-mark/consultation-chamber/decisions';

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validates a decision scope.
 */
function isValidScope(value: unknown): value is DecisionScope {
  return value === 'strategic' || value === 'direction' || value === 'execution';
}

/**
 * Validates a decision status.
 */
function isValidStatus(value: unknown): value is DecisionStatus {
  return value === 'locked' || value === 'unlocked' || value === 'expired';
}

/**
 * Validates a decision object.
 */
function isValidDecision(value: unknown): value is Decision {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    obj.id.length > 0 &&
    typeof obj.topic === 'string' &&
    typeof obj.decision === 'string' &&
    isValidScope(obj.scope) &&
    typeof obj.locked_at === 'string' &&
    typeof obj.locked_by === 'string' &&
    typeof obj.expires_at === 'string' &&
    typeof obj.rationale === 'string' &&
    isValidStatus(obj.status)
  );
}

/**
 * Normalizes a decision object, filling in optional fields.
 */
function normalizeDecision(obj: Record<string, unknown>): Decision | null {
  if (!isValidDecision(obj)) {
    return null;
  }

  return {
    id: obj.id,
    topic: obj.topic,
    decision: obj.decision,
    scope: obj.scope,
    locked_at: obj.locked_at,
    locked_by: obj.locked_by,
    expires_at: obj.expires_at,
    context: obj.context as DecisionContext | undefined,
    rationale: obj.rationale,
    status: obj.status,
    unlock_history: Array.isArray(obj.unlock_history)
      ? (obj.unlock_history as UnlockEvent[])
      : [],
  };
}

// =============================================================================
// ID GENERATION
// =============================================================================

/**
 * Generates a unique decision ID.
 * Format: DEC-YYYY-NNN (e.g., DEC-2026-001)
 */
export function generateDecisionId(existingIds: string[] = []): string {
  const year = new Date().getFullYear();
  const prefix = `DEC-${year}-`;

  // Find highest existing sequence for this year
  let maxSeq = 0;
  for (const id of existingIds) {
    if (id.startsWith(prefix)) {
      const seq = parseInt(id.slice(prefix.length), 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `${prefix}${String(nextSeq).padStart(3, '0')}`;
}

// =============================================================================
// READ OPERATIONS
// =============================================================================

/**
 * Reads all decisions from the decisions directory.
 *
 * @param basePath - Path to the decisions directory
 * @returns Array of all decisions
 *
 * @example
 * ```ts
 * const decisions = await readAllDecisions();
 * console.log(decisions.length); // Number of decisions
 * ```
 */
export async function readAllDecisions(
  basePath: string = DEFAULT_DECISIONS_PATH
): Promise<Decision[]> {
  try {
    const resolvedPath = path.isAbsolute(basePath)
      ? basePath
      : path.resolve(process.cwd(), basePath);

    // Check if directory exists
    try {
      await fs.access(resolvedPath);
    } catch {
      console.warn(`[Sigil Decisions] Directory not found: ${basePath}, returning empty`);
      return [];
    }

    const files = await fs.readdir(resolvedPath);
    const yamlFiles = files.filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));

    const decisions: Decision[] = [];

    for (const file of yamlFiles) {
      try {
        const filePath = path.join(resolvedPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = YAML.parse(content);
        const decision = normalizeDecision(parsed);

        if (decision) {
          // Auto-update expired status
          if (decision.status === 'locked' && isDecisionExpired(decision)) {
            decision.status = 'expired';
          }
          decisions.push(decision);
        } else {
          console.warn(`[Sigil Decisions] Invalid decision file: ${file}`);
        }
      } catch (error) {
        console.warn(`[Sigil Decisions] Error reading ${file}: ${error}`);
      }
    }

    return decisions;
  } catch (error) {
    console.error(`[Sigil Decisions] Error reading decisions: ${error}`);
    return [];
  }
}

/**
 * Gets all locked decisions for a specific zone.
 *
 * @param zone - The zone to filter by
 * @param basePath - Path to the decisions directory
 * @returns Array of active decisions for the zone
 *
 * @example
 * ```ts
 * const criticalDecisions = await getDecisionsForZone('critical');
 * ```
 */
export async function getDecisionsForZone(
  zone: string,
  basePath?: string
): Promise<Decision[]> {
  const all = await readAllDecisions(basePath);
  return all.filter(
    (d) => d.status === 'locked' && d.context?.zone === zone
  );
}

/**
 * Gets all active (locked, non-expired) decisions.
 *
 * @param basePath - Path to the decisions directory
 * @returns Array of active decisions
 */
export async function getActiveDecisions(basePath?: string): Promise<Decision[]> {
  const all = await readAllDecisions(basePath);
  return all.filter((d) => d.status === 'locked' && !isDecisionExpired(d));
}

/**
 * Gets a decision by ID.
 *
 * @param id - Decision ID
 * @param basePath - Path to the decisions directory
 * @returns The decision, or undefined if not found
 */
export async function getDecisionById(
  id: string,
  basePath?: string
): Promise<Decision | undefined> {
  const all = await readAllDecisions(basePath);
  return all.find((d) => d.id === id);
}

// =============================================================================
// EXPIRY CHECKING
// =============================================================================

/**
 * Checks if a decision's lock has expired.
 *
 * @param decision - The decision to check
 * @returns True if the decision has expired
 *
 * @example
 * ```ts
 * if (isDecisionExpired(decision)) {
 *   console.log('Lock has expired');
 * }
 * ```
 */
export function isDecisionExpired(decision: Decision): boolean {
  const expiresAt = new Date(decision.expires_at);
  return expiresAt < new Date();
}

/**
 * Gets the number of days remaining on a decision's lock.
 *
 * @param decision - The decision to check
 * @returns Days remaining (negative if expired)
 */
export function getDaysRemaining(decision: Decision): number {
  const expiresAt = new Date(decision.expires_at);
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// =============================================================================
// WRITE OPERATIONS
// =============================================================================

/**
 * Locks a new decision.
 *
 * @param topic - What the decision is about
 * @param decision - The actual decision
 * @param scope - Decision scope (strategic/direction/execution)
 * @param context - Decision context
 * @param rationale - Why this decision was made
 * @param lockedBy - Who is locking the decision
 * @param basePath - Path to the decisions directory
 * @returns The created decision
 *
 * @example
 * ```ts
 * const decision = await lockDecision(
 *   'Primary CTA color',
 *   'Blue (#0066CC)',
 *   'direction',
 *   { zone: 'critical' },
 *   'Industry standard, high conversion',
 *   'designer@example.com'
 * );
 * ```
 */
export async function lockDecision(
  topic: string,
  decision: string,
  scope: DecisionScope,
  context: DecisionContext,
  rationale: string,
  lockedBy: string,
  basePath: string = DEFAULT_DECISIONS_PATH
): Promise<Decision> {
  const resolvedPath = path.isAbsolute(basePath)
    ? basePath
    : path.resolve(process.cwd(), basePath);

  // Ensure directory exists
  await fs.mkdir(resolvedPath, { recursive: true });

  // Get existing IDs to generate unique ID
  const existing = await readAllDecisions(basePath);
  const existingIds = existing.map((d) => d.id);
  const id = generateDecisionId(existingIds);

  // Calculate expiry based on scope
  const lockedAt = new Date().toISOString();
  const expiresAt = new Date(
    Date.now() + LOCK_PERIODS[scope] * 24 * 60 * 60 * 1000
  ).toISOString();

  const newDecision: Decision = {
    id,
    topic,
    decision,
    scope,
    locked_at: lockedAt,
    locked_by: lockedBy,
    expires_at: expiresAt,
    context,
    rationale,
    status: 'locked',
    unlock_history: [],
  };

  // Write to file
  const filePath = path.join(resolvedPath, `${id}.yaml`);
  const yamlContent = YAML.stringify(newDecision, {
    lineWidth: 0,
    defaultStringType: 'PLAIN',
    defaultKeyType: 'PLAIN',
  });

  await fs.writeFile(filePath, yamlContent, 'utf-8');

  return newDecision;
}

/**
 * Unlocks a decision with justification.
 *
 * @param id - Decision ID to unlock
 * @param justification - Why the decision is being unlocked
 * @param unlockedBy - Who is unlocking the decision
 * @param basePath - Path to the decisions directory
 * @returns The updated decision, or undefined if not found
 *
 * @example
 * ```ts
 * const updated = await unlockDecision(
 *   'DEC-2026-001',
 *   'New user research contradicts this decision',
 *   'researcher@example.com'
 * );
 * ```
 */
export async function unlockDecision(
  id: string,
  justification: string,
  unlockedBy: string,
  basePath: string = DEFAULT_DECISIONS_PATH
): Promise<Decision | undefined> {
  const resolvedPath = path.isAbsolute(basePath)
    ? basePath
    : path.resolve(process.cwd(), basePath);

  const filePath = path.join(resolvedPath, `${id}.yaml`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = YAML.parse(content);
    const decision = normalizeDecision(parsed);

    if (!decision) {
      console.error(`[Sigil Decisions] Invalid decision file: ${id}`);
      return undefined;
    }

    // Add unlock event to history
    const unlockEvent: UnlockEvent = {
      unlocked_at: new Date().toISOString(),
      unlocked_by: unlockedBy,
      justification,
    };

    decision.unlock_history = decision.unlock_history || [];
    decision.unlock_history.push(unlockEvent);
    decision.status = 'unlocked';

    // Write updated decision
    const yamlContent = YAML.stringify(decision, {
      lineWidth: 0,
      defaultStringType: 'PLAIN',
      defaultKeyType: 'PLAIN',
    });

    await fs.writeFile(filePath, yamlContent, 'utf-8');

    return decision;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[Sigil Decisions] Decision not found: ${id}`);
    } else {
      console.error(`[Sigil Decisions] Error unlocking ${id}: ${error}`);
    }
    return undefined;
  }
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Formats a decision for display.
 *
 * @param decision - The decision to format
 * @returns Formatted string for display
 */
export function formatDecisionSummary(decision: Decision): string {
  const days = getDaysRemaining(decision);
  const status = decision.status === 'locked'
    ? `🔒 Locked (${days} days remaining)`
    : decision.status === 'expired'
      ? '⏰ Expired'
      : '🔓 Unlocked';

  return `${decision.id}: ${decision.topic}\n  Decision: ${decision.decision}\n  Status: ${status}`;
}
