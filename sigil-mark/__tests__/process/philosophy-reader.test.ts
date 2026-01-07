/**
 * Sigil v3.0 — Philosophy Reader Tests
 *
 * Tests for reading and validating the Philosophy layer.
 * Philosophy captures intent, principles, and conflict resolution.
 *
 * @module __tests__/process/philosophy-reader
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as path from 'path';
import {
  readPhilosophy,
  readPhilosophySync,
  getPrinciple,
  getPrinciplesForZone,
  getPrinciplesByPriority,
  getPrimaryIntent,
  isAntiGoal,
  getConflictRule,
  resolveConflict,
  principleAppliesToZone,
  formatPrincipleSummary,
  formatPhilosophySummary,
  DEFAULT_PHILOSOPHY,
  type Philosophy,
  type Principle,
  type ConflictRule,
} from '../../process/philosophy-reader';

// =============================================================================
// TEST DATA
// =============================================================================

const VALID_PHILOSOPHY: Philosophy = {
  version: '3.0.0',
  codename: 'Test Engine',
  intent: {
    primary: 'Trust above all else',
    secondary: ['Empower craftsman deliberation', 'Protect user autonomy'],
    anti_goals: ['Never rush critical decisions', 'Never hide important information'],
  },
  principles: [
    {
      id: 'trust_first',
      name: 'Trust First',
      statement: 'Trust can be damaged but never recovered.',
      rationale: 'In financial apps, broken promises destroy relationships.',
      priority: 100,
      zones: [],
      examples: [
        {
          scenario: 'User wants to withdraw',
          good: 'Clear confirmation, visible fees',
          bad: 'One-click withdraw with fine print',
        },
      ],
    },
    {
      id: 'newcomer_safety',
      name: 'Newcomer Safety',
      statement: 'Protect the newcomer when needs conflict.',
      rationale: 'Power users can customize. Newcomers cannot.',
      priority: 80,
      zones: ['critical'],
      examples: [],
    },
    {
      id: 'escape_hatches',
      name: 'Escape Hatches',
      statement: 'Users must always have a way out.',
      rationale: 'Trapped users become anxious users.',
      priority: 70,
      zones: [],
      examples: [],
    },
  ],
  conflict_resolution: {
    rules: [
      {
        id: 'trust_vs_speed',
        conflict: ['trust', 'speed'],
        winner: 'trust',
        rationale: 'Speed can be recovered. Trust cannot.',
        context: 'always',
      },
      {
        id: 'newcomer_vs_power_user',
        conflict: ['newcomer', 'power_user'],
        winner: 'newcomer',
        rationale: 'Power users can customize.',
        context: 'always',
      },
      {
        id: 'simplicity_vs_completeness',
        conflict: ['simplicity', 'completeness'],
        winner: 'simplicity',
        rationale: 'In critical zones, less is more.',
        context: 'critical_zone',
      },
    ],
    default_strategy: 'priority',
  },
  decision_hierarchy: ['trust_first', 'newcomer_safety', 'escape_hatches'],
};

// =============================================================================
// TESTS: readPhilosophy
// =============================================================================

describe('readPhilosophy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should read and parse valid philosophy YAML', async () => {
    const philosophy = await readPhilosophy(
      path.join(process.cwd(), 'soul-binder/philosophy.yaml')
    );

    expect(philosophy.version).toBe('3.0.0');
    expect(philosophy.codename).toBe('Living Engine');
    expect(philosophy.intent.primary).toBeTruthy();
    expect(philosophy.principles.length).toBeGreaterThan(0);
  });

  it('should return default philosophy when file does not exist', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const philosophy = await readPhilosophy('/nonexistent/path.yaml');

    expect(philosophy).toEqual(DEFAULT_PHILOSOPHY);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('File not found')
    );

    consoleSpy.mockRestore();
  });

  it('should return default philosophy for invalid YAML', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const philosophy = await readPhilosophy(__filename);

    expect(philosophy.version).toBeDefined();
    expect(philosophy.principles).toBeDefined();

    consoleSpy.mockRestore();
  });

  it('should have valid principle structure for all principles', async () => {
    const philosophy = await readPhilosophy(
      path.join(process.cwd(), 'soul-binder/philosophy.yaml')
    );

    for (const principle of philosophy.principles) {
      expect(principle.id).toBeDefined();
      expect(principle.name).toBeDefined();
      expect(principle.statement).toBeDefined();
      expect(principle.rationale).toBeDefined();
      expect(typeof principle.priority).toBe('number');
      expect(Array.isArray(principle.zones)).toBe(true);
    }
  });
});

// =============================================================================
// TESTS: readPhilosophySync
// =============================================================================

describe('readPhilosophySync', () => {
  it('should read and parse valid philosophy YAML synchronously', () => {
    const philosophy = readPhilosophySync(
      path.join(process.cwd(), 'soul-binder/philosophy.yaml')
    );

    expect(philosophy.version).toBe('3.0.0');
    expect(philosophy.principles.length).toBeGreaterThan(0);
  });

  it('should return default philosophy when file does not exist', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const philosophy = readPhilosophySync('/nonexistent/path.yaml');

    expect(philosophy).toEqual(DEFAULT_PHILOSOPHY);

    consoleSpy.mockRestore();
  });
});

// =============================================================================
// TESTS: getPrinciple
// =============================================================================

describe('getPrinciple', () => {
  it('should return principle by ID', () => {
    const principle = getPrinciple(VALID_PHILOSOPHY, 'trust_first');

    expect(principle).toBeDefined();
    expect(principle?.id).toBe('trust_first');
    expect(principle?.name).toBe('Trust First');
  });

  it('should return undefined for non-existent principle', () => {
    expect(getPrinciple(VALID_PHILOSOPHY, 'unknown')).toBeUndefined();
    expect(getPrinciple(VALID_PHILOSOPHY, '')).toBeUndefined();
  });

  it('should handle empty philosophy', () => {
    expect(getPrinciple(DEFAULT_PHILOSOPHY, 'trust_first')).toBeUndefined();
  });
});

// =============================================================================
// TESTS: getPrinciplesForZone
// =============================================================================

describe('getPrinciplesForZone', () => {
  it('should return zone-specific and global principles', () => {
    const principles = getPrinciplesForZone(VALID_PHILOSOPHY, 'critical');

    const ids = principles.map((p) => p.id);
    expect(ids).toContain('trust_first'); // Global (zones: [])
    expect(ids).toContain('newcomer_safety'); // Zone-specific
    expect(ids).toContain('escape_hatches'); // Global
  });

  it('should return only global principles for unknown zone', () => {
    const principles = getPrinciplesForZone(VALID_PHILOSOPHY, 'unknown');

    const ids = principles.map((p) => p.id);
    expect(ids).toContain('trust_first'); // Global
    expect(ids).toContain('escape_hatches'); // Global
    expect(ids).not.toContain('newcomer_safety'); // Critical only
  });

  it('should handle empty philosophy', () => {
    const principles = getPrinciplesForZone(DEFAULT_PHILOSOPHY, 'critical');
    expect(principles).toEqual([]);
  });
});

// =============================================================================
// TESTS: getPrinciplesByPriority
// =============================================================================

describe('getPrinciplesByPriority', () => {
  it('should return principles sorted by priority (highest first)', () => {
    const principles = getPrinciplesByPriority(VALID_PHILOSOPHY);

    expect(principles[0].id).toBe('trust_first'); // Priority 100
    expect(principles[1].id).toBe('newcomer_safety'); // Priority 80
    expect(principles[2].id).toBe('escape_hatches'); // Priority 70
  });

  it('should handle empty philosophy', () => {
    const principles = getPrinciplesByPriority(DEFAULT_PHILOSOPHY);
    expect(principles).toEqual([]);
  });
});

// =============================================================================
// TESTS: getPrimaryIntent
// =============================================================================

describe('getPrimaryIntent', () => {
  it('should return primary intent', () => {
    expect(getPrimaryIntent(VALID_PHILOSOPHY)).toBe('Trust above all else');
  });

  it('should return default intent for empty philosophy', () => {
    expect(getPrimaryIntent(DEFAULT_PHILOSOPHY)).toBe('Build trust through transparency');
  });
});

// =============================================================================
// TESTS: isAntiGoal
// =============================================================================

describe('isAntiGoal', () => {
  it('should detect anti-goals', () => {
    expect(isAntiGoal(VALID_PHILOSOPHY, 'rush')).toBe(true);
    expect(isAntiGoal(VALID_PHILOSOPHY, 'hide')).toBe(true);
  });

  it('should return false for non-anti-goals', () => {
    expect(isAntiGoal(VALID_PHILOSOPHY, 'trust')).toBe(false);
    expect(isAntiGoal(VALID_PHILOSOPHY, 'help')).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(isAntiGoal(VALID_PHILOSOPHY, 'RUSH')).toBe(true);
    expect(isAntiGoal(VALID_PHILOSOPHY, 'Rush')).toBe(true);
  });

  it('should handle empty philosophy', () => {
    expect(isAntiGoal(DEFAULT_PHILOSOPHY, 'anything')).toBe(false);
  });
});

// =============================================================================
// TESTS: getConflictRule
// =============================================================================

describe('getConflictRule', () => {
  it('should return conflict rule by ID', () => {
    const rule = getConflictRule(VALID_PHILOSOPHY, 'trust_vs_speed');

    expect(rule).toBeDefined();
    expect(rule?.conflict).toEqual(['trust', 'speed']);
    expect(rule?.winner).toBe('trust');
  });

  it('should return undefined for non-existent rule', () => {
    expect(getConflictRule(VALID_PHILOSOPHY, 'unknown')).toBeUndefined();
  });

  it('should handle empty philosophy', () => {
    expect(getConflictRule(DEFAULT_PHILOSOPHY, 'trust_vs_speed')).toBeUndefined();
  });
});

// =============================================================================
// TESTS: resolveConflict
// =============================================================================

describe('resolveConflict', () => {
  it('should resolve conflict using matching rule', () => {
    const result = resolveConflict(VALID_PHILOSOPHY, 'trust', 'speed');

    expect(result.winner).toBe('trust');
    expect(result.loser).toBe('speed');
    expect(result.rationale).toContain('recovered');
    expect(result.rule).toBeDefined();
  });

  it('should handle reversed concern order', () => {
    const result = resolveConflict(VALID_PHILOSOPHY, 'speed', 'trust');

    expect(result.winner).toBe('trust');
    expect(result.loser).toBe('speed');
  });

  it('should use decision hierarchy when no rule matches', () => {
    const result = resolveConflict(VALID_PHILOSOPHY, 'trust_first', 'newcomer_safety');

    expect(result.winner).toBe('trust_first'); // Earlier in hierarchy
    expect(result.loser).toBe('newcomer_safety');
    expect(result.rule).toBeNull();
  });

  it('should respect context-specific rules', () => {
    const resultCritical = resolveConflict(
      VALID_PHILOSOPHY,
      'simplicity',
      'completeness',
      'critical_zone'
    );
    expect(resultCritical.winner).toBe('simplicity');

    const resultMarketing = resolveConflict(
      VALID_PHILOSOPHY,
      'simplicity',
      'completeness',
      'marketing_zone'
    );
    // No matching rule for marketing_zone
    expect(resultMarketing.rule).toBeNull();
  });

  it('should return first concern when no resolution found', () => {
    const result = resolveConflict(VALID_PHILOSOPHY, 'unknown1', 'unknown2');

    expect(result.winner).toBe('unknown1');
    expect(result.rule).toBeNull();
  });

  it('should handle empty philosophy', () => {
    const result = resolveConflict(DEFAULT_PHILOSOPHY, 'trust', 'speed');

    expect(result.winner).toBe('trust'); // First concern
    expect(result.rule).toBeNull();
  });
});

// =============================================================================
// TESTS: principleAppliesToZone
// =============================================================================

describe('principleAppliesToZone', () => {
  it('should return true for global principles', () => {
    const trustFirst = VALID_PHILOSOPHY.principles[0];
    expect(principleAppliesToZone(trustFirst, 'critical')).toBe(true);
    expect(principleAppliesToZone(trustFirst, 'marketing')).toBe(true);
    expect(principleAppliesToZone(trustFirst, 'any')).toBe(true);
  });

  it('should return true for zone-specific principles in correct zone', () => {
    const newcomerSafety = VALID_PHILOSOPHY.principles[1];
    expect(principleAppliesToZone(newcomerSafety, 'critical')).toBe(true);
  });

  it('should return false for zone-specific principles in wrong zone', () => {
    const newcomerSafety = VALID_PHILOSOPHY.principles[1];
    expect(principleAppliesToZone(newcomerSafety, 'marketing')).toBe(false);
    expect(principleAppliesToZone(newcomerSafety, 'admin')).toBe(false);
  });
});

// =============================================================================
// TESTS: formatPrincipleSummary
// =============================================================================

describe('formatPrincipleSummary', () => {
  it('should format principle summary', () => {
    const principle = VALID_PHILOSOPHY.principles[0];
    const summary = formatPrincipleSummary(principle);

    expect(summary).toContain('Trust First (trust_first)');
    expect(summary).toContain('Statement: "Trust can be damaged');
    expect(summary).toContain('Priority: 100');
    expect(summary).toContain('All zones');
  });

  it('should show specific zones for zone-limited principles', () => {
    const principle = VALID_PHILOSOPHY.principles[1];
    const summary = formatPrincipleSummary(principle);

    expect(summary).toContain('critical');
  });
});

// =============================================================================
// TESTS: formatPhilosophySummary
// =============================================================================

describe('formatPhilosophySummary', () => {
  it('should format philosophy summary', () => {
    const summary = formatPhilosophySummary(VALID_PHILOSOPHY);

    expect(summary).toContain('Sigil Philosophy v3.0.0');
    expect(summary).toContain('Test Engine');
    expect(summary).toContain('Trust above all else');
    expect(summary).toContain('Principles (3)');
    expect(summary).toContain('Conflict Rules (3)');
    expect(summary).toContain('trust_first');
  });

  it('should handle empty philosophy', () => {
    const summary = formatPhilosophySummary(DEFAULT_PHILOSOPHY);

    expect(summary).toContain('Principles (0)');
    expect(summary).toContain('Conflict Rules (0)');
  });
});

// =============================================================================
// TESTS: Graceful Degradation
// =============================================================================

describe('Graceful Degradation', () => {
  it('should never throw on missing file', async () => {
    const philosophy = await readPhilosophy('/definitely/does/not/exist.yaml');

    expect(philosophy).toEqual(DEFAULT_PHILOSOPHY);
  });

  it('should return valid structure even with empty input', async () => {
    const philosophy = await readPhilosophy('/dev/null');

    expect(philosophy.version).toBeDefined();
    expect(philosophy.intent).toBeDefined();
    expect(Array.isArray(philosophy.principles)).toBe(true);
  });

  it('should have working helper functions with default philosophy', () => {
    expect(getPrinciple(DEFAULT_PHILOSOPHY, 'anything')).toBeUndefined();
    expect(getPrinciplesForZone(DEFAULT_PHILOSOPHY, 'critical')).toEqual([]);
    expect(getPrinciplesByPriority(DEFAULT_PHILOSOPHY)).toEqual([]);
    expect(getPrimaryIntent(DEFAULT_PHILOSOPHY)).toBeTruthy();
    expect(isAntiGoal(DEFAULT_PHILOSOPHY, 'anything')).toBe(false);
    expect(getConflictRule(DEFAULT_PHILOSOPHY, 'anything')).toBeUndefined();

    const result = resolveConflict(DEFAULT_PHILOSOPHY, 'a', 'b');
    expect(result.winner).toBe('a');
  });
});
