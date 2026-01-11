/**
 * @sigil-tier bronze
 * Sigil v6.1 — Forge Mode (DEPRECATED)
 *
 * @deprecated v6.1: Forge mode is replaced by optimistic divergence.
 * Taste violations are now tagged (not blocked), making explicit forge mode unnecessary.
 * Use validatePhysicsOptimistic() from physics-validator.ts instead.
 *
 * This file is kept for backwards compatibility but functions are no-ops.
 *
 * @see physics-validator.ts#validatePhysicsOptimistic
 * @module process/forge-mode
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Forge mode context.
 */
export interface ForgeContext {
  /** Whether forge mode is active */
  forgeMode: boolean;
  /** Whether survival patterns are bypassed */
  survivalBypass: boolean;
  /** Whether only physics validation applies */
  physicsOnly: boolean;
  /** Activation timestamp */
  activatedAt?: string;
  /** Forge session ID */
  sessionId?: string;
}

/**
 * Forge trigger detection result.
 */
export interface ForgeTrigger {
  /** Whether forge mode was triggered */
  detected: boolean;
  /** Trigger source */
  source?: 'flag' | 'command';
  /** Original prompt (without forge flag) */
  cleanPrompt?: string;
}

/**
 * Forge generation result.
 */
export interface ForgeGeneration {
  /** Forge session ID */
  sessionId: string;
  /** Generated code */
  code: string;
  /** Physics validation result */
  physicsValid: boolean;
  /** Physics violations (if any) */
  violations?: string[];
  /** Generation timestamp */
  generatedAt: string;
  /** User decision (null if pending) */
  decision: 'keep' | 'discard' | null;
}

/**
 * Forge decision log entry.
 */
export interface ForgeDecisionLog {
  /** Session ID */
  sessionId: string;
  /** Decision made */
  decision: 'keep' | 'discard';
  /** Decision timestamp */
  decidedAt: string;
  /** Optional reason */
  reason?: string;
}

// =============================================================================
// FORGE TRIGGER DETECTION
// =============================================================================

/**
 * Pattern for detecting --forge flag.
 */
const FORGE_FLAG_PATTERN = /--forge\b/i;

/**
 * Pattern for detecting /forge command.
 */
const FORGE_COMMAND_PATTERN = /^\/forge\b/i;

/**
 * Detect forge mode trigger in prompt.
 */
export function detectForgeTrigger(prompt: string): ForgeTrigger {
  // Check for /forge command
  if (FORGE_COMMAND_PATTERN.test(prompt)) {
    return {
      detected: true,
      source: 'command',
      cleanPrompt: prompt.replace(FORGE_COMMAND_PATTERN, '').trim(),
    };
  }

  // Check for --forge flag
  if (FORGE_FLAG_PATTERN.test(prompt)) {
    return {
      detected: true,
      source: 'flag',
      cleanPrompt: prompt.replace(FORGE_FLAG_PATTERN, '').trim(),
    };
  }

  return { detected: false };
}

/**
 * Check if prompt contains forge trigger.
 */
export function isForgeModeRequested(prompt: string): boolean {
  return detectForgeTrigger(prompt).detected;
}

// =============================================================================
// FORGE CONTEXT MANAGEMENT
// =============================================================================

/**
 * Active forge sessions (session memory only).
 */
const activeForges = new Map<string, ForgeGeneration>();

/**
 * Decision log (session memory only).
 */
const decisionLog: ForgeDecisionLog[] = [];

/**
 * Generate unique forge session ID.
 */
function generateForgeSessionId(): string {
  return `forge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Create forge context for a session.
 */
export function createForgeContext(): ForgeContext {
  const sessionId = generateForgeSessionId();
  return {
    forgeMode: true,
    survivalBypass: true,
    physicsOnly: true,
    activatedAt: new Date().toISOString(),
    sessionId,
  };
}

/**
 * Get default (non-forge) context.
 */
export function getDefaultContext(): ForgeContext {
  return {
    forgeMode: false,
    survivalBypass: false,
    physicsOnly: false,
  };
}

/**
 * Check if context is in forge mode.
 */
export function isForgeMode(context: ForgeContext): boolean {
  return context.forgeMode === true;
}

// =============================================================================
// SURVIVAL BYPASS
// =============================================================================

/**
 * Options for pattern checking.
 */
export interface PatternCheckOptions {
  /** Forge context */
  context: ForgeContext;
  /** Pattern to check */
  pattern: string;
  /** Pattern type */
  type: 'survival' | 'rejected' | 'canonical';
}

/**
 * Check if pattern should be considered.
 * In forge mode, survival/rejected/canonical patterns are bypassed.
 */
export function shouldCheckPattern(options: PatternCheckOptions): boolean {
  const { context, type } = options;

  // In forge mode, bypass survival-related pattern checks
  if (isForgeMode(context)) {
    switch (type) {
      case 'survival':
        return false; // Don't check survival patterns
      case 'rejected':
        return false; // Don't warn about rejected patterns
      case 'canonical':
        return false; // Don't prefer canonical patterns
    }
  }

  // Normal mode: check all patterns
  return true;
}

/**
 * Check if survival patterns should be loaded.
 */
export function shouldLoadSurvival(context: ForgeContext): boolean {
  return !isForgeMode(context);
}

/**
 * Check if rejected pattern warnings should be shown.
 */
export function shouldWarnRejected(context: ForgeContext): boolean {
  return !isForgeMode(context);
}

/**
 * Check if canonical patterns should be preferred.
 */
export function shouldPreferCanonical(context: ForgeContext): boolean {
  return !isForgeMode(context);
}

// =============================================================================
// FORGE GENERATION MANAGEMENT
// =============================================================================

/**
 * Store a forge generation for user decision.
 */
export function storeForgeGeneration(
  sessionId: string,
  code: string,
  physicsValid: boolean,
  violations?: string[]
): ForgeGeneration {
  const generation: ForgeGeneration = {
    sessionId,
    code,
    physicsValid,
    violations,
    generatedAt: new Date().toISOString(),
    decision: null,
  };

  activeForges.set(sessionId, generation);
  return generation;
}

/**
 * Get a pending forge generation.
 */
export function getForgeGeneration(sessionId: string): ForgeGeneration | null {
  return activeForges.get(sessionId) || null;
}

/**
 * Get all pending forge generations.
 */
export function getPendingForgeGenerations(): ForgeGeneration[] {
  return Array.from(activeForges.values()).filter(g => g.decision === null);
}

/**
 * Check if there are pending forge decisions.
 */
export function hasPendingForgeDecisions(): boolean {
  return getPendingForgeGenerations().length > 0;
}

// =============================================================================
// USER DECISION HANDLING
// =============================================================================

/**
 * Record user decision on forge generation.
 */
export function recordForgeDecision(
  sessionId: string,
  decision: 'keep' | 'discard',
  reason?: string
): boolean {
  const generation = activeForges.get(sessionId);
  if (!generation) {
    return false;
  }

  // Update generation with decision
  generation.decision = decision;

  // Log the decision
  const logEntry: ForgeDecisionLog = {
    sessionId,
    decision,
    decidedAt: new Date().toISOString(),
    reason,
  };
  decisionLog.push(logEntry);

  // If discarded, remove from active forges
  if (decision === 'discard') {
    activeForges.delete(sessionId);
  }

  return true;
}

/**
 * Keep a forge generation (enters normal workflow).
 */
export function keepForgeGeneration(
  sessionId: string,
  reason?: string
): boolean {
  return recordForgeDecision(sessionId, 'keep', reason);
}

/**
 * Discard a forge generation (removed entirely).
 */
export function discardForgeGeneration(
  sessionId: string,
  reason?: string
): boolean {
  return recordForgeDecision(sessionId, 'discard', reason);
}

/**
 * Get the decision log.
 */
export function getForgeDecisionLog(): ForgeDecisionLog[] {
  return [...decisionLog];
}

/**
 * Get decisions for a specific session.
 */
export function getForgeDecision(sessionId: string): ForgeDecisionLog | null {
  return decisionLog.find(d => d.sessionId === sessionId) || null;
}

// =============================================================================
// FORGE MODE UTILITIES
// =============================================================================

/**
 * Format forge activation message.
 */
export function formatForgeActivation(context: ForgeContext): string {
  return [
    '🔥 **Forge Mode Activated**',
    '',
    'Bypassing:',
    '- Survival patterns',
    '- Rejected pattern warnings',
    '- Canonical pattern preference',
    '',
    'Still enforcing:',
    '- Zone physics constraints',
    '- Material timing constraints',
    '- API correctness',
    '- Fidelity ceiling',
    '',
    `Session: ${context.sessionId}`,
  ].join('\n');
}

/**
 * Format forge decision prompt.
 */
export function formatForgeDecisionPrompt(generation: ForgeGeneration): string {
  const lines = [
    '🔨 **Forge Generation Complete**',
    '',
    `Physics Valid: ${generation.physicsValid ? '✓' : '✗'}`,
  ];

  if (generation.violations && generation.violations.length > 0) {
    lines.push('', 'Violations:');
    generation.violations.forEach(v => lines.push(`- ${v}`));
  }

  lines.push(
    '',
    '**Keep this exploration?**',
    '- `keep` — Enter normal /craft workflow',
    '- `discard` — Remove generated code entirely'
  );

  return lines.join('\n');
}

/**
 * Format forge decision result.
 */
export function formatForgeDecisionResult(
  decision: 'keep' | 'discard',
  sessionId: string
): string {
  if (decision === 'keep') {
    return `✓ Forge generation kept (${sessionId}). Entering normal workflow.`;
  } else {
    return `✗ Forge generation discarded (${sessionId}). No trace remains.`;
  }
}

// =============================================================================
// INTEGRATION HELPERS
// =============================================================================

/**
 * Prepare context for /craft based on prompt.
 */
export function prepareCraftContext(prompt: string): {
  context: ForgeContext;
  cleanPrompt: string;
} {
  const trigger = detectForgeTrigger(prompt);

  if (trigger.detected) {
    return {
      context: createForgeContext(),
      cleanPrompt: trigger.cleanPrompt || prompt,
    };
  }

  return {
    context: getDefaultContext(),
    cleanPrompt: prompt,
  };
}

/**
 * Complete forge flow interface.
 */
export interface ForgeFlow {
  /** Start forge session */
  start: () => ForgeContext;
  /** Store generation for decision */
  store: (code: string, physicsValid: boolean, violations?: string[]) => ForgeGeneration;
  /** Keep the generation */
  keep: (reason?: string) => boolean;
  /** Discard the generation */
  discard: (reason?: string) => boolean;
  /** Get current generation */
  getGeneration: () => ForgeGeneration | null;
  /** Check if pending */
  isPending: () => boolean;
}

/**
 * Create a forge flow helper.
 */
export function createForgeFlow(): ForgeFlow {
  let context: ForgeContext | null = null;
  let sessionId: string | null = null;

  return {
    start: () => {
      context = createForgeContext();
      sessionId = context.sessionId!;
      return context;
    },

    store: (code: string, physicsValid: boolean, violations?: string[]) => {
      if (!sessionId) {
        throw new Error('Forge flow not started');
      }
      return storeForgeGeneration(sessionId, code, physicsValid, violations);
    },

    keep: (reason?: string) => {
      if (!sessionId) return false;
      return keepForgeGeneration(sessionId, reason);
    },

    discard: (reason?: string) => {
      if (!sessionId) return false;
      return discardForgeGeneration(sessionId, reason);
    },

    getGeneration: () => {
      if (!sessionId) return null;
      return getForgeGeneration(sessionId);
    },

    isPending: () => {
      if (!sessionId) return false;
      const gen = getForgeGeneration(sessionId);
      return gen !== null && gen.decision === null;
    },
  };
}

// =============================================================================
// CLEANUP
// =============================================================================

/**
 * Clear all forge sessions (for testing).
 */
export function clearForgeSessions(): void {
  activeForges.clear();
  decisionLog.length = 0;
}
