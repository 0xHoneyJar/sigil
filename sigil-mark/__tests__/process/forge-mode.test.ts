/**
 * @sigil-tier gold
 * Sigil v6.0 — Forge Mode Tests
 *
 * Tests for precedent-breaking exploration mode.
 *
 * @module __tests__/process/forge-mode
 */

import {
  // Trigger detection
  detectForgeTrigger,
  isForgeModeRequested,
  // Context management
  createForgeContext,
  getDefaultContext,
  isForgeMode,
  // Survival bypass
  shouldCheckPattern,
  shouldLoadSurvival,
  shouldWarnRejected,
  shouldPreferCanonical,
  // Generation management
  storeForgeGeneration,
  getForgeGeneration,
  getPendingForgeGenerations,
  hasPendingForgeDecisions,
  // Decision handling
  recordForgeDecision,
  keepForgeGeneration,
  discardForgeGeneration,
  getForgeDecisionLog,
  getForgeDecision,
  // Utilities
  formatForgeActivation,
  formatForgeDecisionPrompt,
  formatForgeDecisionResult,
  // Integration
  prepareCraftContext,
  createForgeFlow,
  // Cleanup
  clearForgeSessions,
} from '../../process/forge-mode';

// =============================================================================
// TRIGGER DETECTION TESTS
// =============================================================================

describe('Trigger Detection', () => {
  describe('detectForgeTrigger', () => {
    it('detects --forge flag', () => {
      const result = detectForgeTrigger('create a button --forge');
      expect(result.detected).toBe(true);
      expect(result.source).toBe('flag');
      expect(result.cleanPrompt).toBe('create a button');
    });

    it('detects /forge command', () => {
      const result = detectForgeTrigger('/forge create a button');
      expect(result.detected).toBe(true);
      expect(result.source).toBe('command');
      expect(result.cleanPrompt).toBe('create a button');
    });

    it('handles --forge at start', () => {
      const result = detectForgeTrigger('--forge create something new');
      expect(result.detected).toBe(true);
      expect(result.cleanPrompt).toBe('create something new');
    });

    it('returns not detected for normal prompts', () => {
      const result = detectForgeTrigger('create a button with blue color');
      expect(result.detected).toBe(false);
    });

    it('is case insensitive', () => {
      expect(detectForgeTrigger('--FORGE test').detected).toBe(true);
      expect(detectForgeTrigger('/FORGE test').detected).toBe(true);
    });
  });

  describe('isForgeModeRequested', () => {
    it('returns true for forge prompts', () => {
      expect(isForgeModeRequested('--forge test')).toBe(true);
      expect(isForgeModeRequested('/forge test')).toBe(true);
    });

    it('returns false for normal prompts', () => {
      expect(isForgeModeRequested('normal prompt')).toBe(false);
    });
  });
});

// =============================================================================
// CONTEXT MANAGEMENT TESTS
// =============================================================================

describe('Context Management', () => {
  describe('createForgeContext', () => {
    it('creates context with forge mode enabled', () => {
      const context = createForgeContext();
      expect(context.forgeMode).toBe(true);
      expect(context.survivalBypass).toBe(true);
      expect(context.physicsOnly).toBe(true);
    });

    it('includes activation timestamp', () => {
      const context = createForgeContext();
      expect(context.activatedAt).toBeDefined();
    });

    it('generates unique session IDs', () => {
      const c1 = createForgeContext();
      const c2 = createForgeContext();
      expect(c1.sessionId).not.toBe(c2.sessionId);
    });
  });

  describe('getDefaultContext', () => {
    it('returns non-forge context', () => {
      const context = getDefaultContext();
      expect(context.forgeMode).toBe(false);
      expect(context.survivalBypass).toBe(false);
      expect(context.physicsOnly).toBe(false);
    });
  });

  describe('isForgeMode', () => {
    it('returns true for forge context', () => {
      const context = createForgeContext();
      expect(isForgeMode(context)).toBe(true);
    });

    it('returns false for default context', () => {
      const context = getDefaultContext();
      expect(isForgeMode(context)).toBe(false);
    });
  });
});

// =============================================================================
// SURVIVAL BYPASS TESTS
// =============================================================================

describe('Survival Bypass', () => {
  describe('shouldCheckPattern', () => {
    it('bypasses survival patterns in forge mode', () => {
      const context = createForgeContext();
      expect(
        shouldCheckPattern({ context, pattern: 'test', type: 'survival' })
      ).toBe(false);
    });

    it('bypasses rejected patterns in forge mode', () => {
      const context = createForgeContext();
      expect(
        shouldCheckPattern({ context, pattern: 'test', type: 'rejected' })
      ).toBe(false);
    });

    it('bypasses canonical patterns in forge mode', () => {
      const context = createForgeContext();
      expect(
        shouldCheckPattern({ context, pattern: 'test', type: 'canonical' })
      ).toBe(false);
    });

    it('checks all patterns in normal mode', () => {
      const context = getDefaultContext();
      expect(
        shouldCheckPattern({ context, pattern: 'test', type: 'survival' })
      ).toBe(true);
      expect(
        shouldCheckPattern({ context, pattern: 'test', type: 'rejected' })
      ).toBe(true);
      expect(
        shouldCheckPattern({ context, pattern: 'test', type: 'canonical' })
      ).toBe(true);
    });
  });

  describe('shouldLoadSurvival', () => {
    it('returns false in forge mode', () => {
      const context = createForgeContext();
      expect(shouldLoadSurvival(context)).toBe(false);
    });

    it('returns true in normal mode', () => {
      const context = getDefaultContext();
      expect(shouldLoadSurvival(context)).toBe(true);
    });
  });

  describe('shouldWarnRejected', () => {
    it('returns false in forge mode', () => {
      const context = createForgeContext();
      expect(shouldWarnRejected(context)).toBe(false);
    });

    it('returns true in normal mode', () => {
      const context = getDefaultContext();
      expect(shouldWarnRejected(context)).toBe(true);
    });
  });

  describe('shouldPreferCanonical', () => {
    it('returns false in forge mode', () => {
      const context = createForgeContext();
      expect(shouldPreferCanonical(context)).toBe(false);
    });

    it('returns true in normal mode', () => {
      const context = getDefaultContext();
      expect(shouldPreferCanonical(context)).toBe(true);
    });
  });
});

// =============================================================================
// GENERATION MANAGEMENT TESTS
// =============================================================================

describe('Generation Management', () => {
  beforeEach(() => {
    clearForgeSessions();
  });

  describe('storeForgeGeneration', () => {
    it('stores generation with session ID', () => {
      const gen = storeForgeGeneration('test-1', 'const x = 1;', true);
      expect(gen.sessionId).toBe('test-1');
      expect(gen.code).toBe('const x = 1;');
      expect(gen.physicsValid).toBe(true);
    });

    it('stores violations if present', () => {
      const gen = storeForgeGeneration('test-2', 'code', false, ['violation1']);
      expect(gen.physicsValid).toBe(false);
      expect(gen.violations).toContain('violation1');
    });

    it('starts with null decision', () => {
      const gen = storeForgeGeneration('test-3', 'code', true);
      expect(gen.decision).toBeNull();
    });
  });

  describe('getForgeGeneration', () => {
    it('retrieves stored generation', () => {
      storeForgeGeneration('test-get', 'code', true);
      const gen = getForgeGeneration('test-get');
      expect(gen).not.toBeNull();
      expect(gen?.code).toBe('code');
    });

    it('returns null for unknown session', () => {
      const gen = getForgeGeneration('unknown');
      expect(gen).toBeNull();
    });
  });

  describe('getPendingForgeGenerations', () => {
    it('returns only pending generations', () => {
      storeForgeGeneration('pending-1', 'code1', true);
      storeForgeGeneration('pending-2', 'code2', true);
      keepForgeGeneration('pending-1');

      const pending = getPendingForgeGenerations();
      expect(pending).toHaveLength(1);
      expect(pending[0].sessionId).toBe('pending-2');
    });
  });

  describe('hasPendingForgeDecisions', () => {
    it('returns true when pending', () => {
      storeForgeGeneration('pending', 'code', true);
      expect(hasPendingForgeDecisions()).toBe(true);
    });

    it('returns false when no pending', () => {
      clearForgeSessions();
      expect(hasPendingForgeDecisions()).toBe(false);
    });
  });
});

// =============================================================================
// DECISION HANDLING TESTS
// =============================================================================

describe('Decision Handling', () => {
  beforeEach(() => {
    clearForgeSessions();
  });

  describe('recordForgeDecision', () => {
    it('records keep decision', () => {
      storeForgeGeneration('decide-1', 'code', true);
      const result = recordForgeDecision('decide-1', 'keep');
      expect(result).toBe(true);

      const gen = getForgeGeneration('decide-1');
      expect(gen?.decision).toBe('keep');
    });

    it('records discard decision', () => {
      storeForgeGeneration('decide-2', 'code', true);
      const result = recordForgeDecision('decide-2', 'discard');
      expect(result).toBe(true);

      // Discarded generations are removed
      const gen = getForgeGeneration('decide-2');
      expect(gen).toBeNull();
    });

    it('returns false for unknown session', () => {
      const result = recordForgeDecision('unknown', 'keep');
      expect(result).toBe(false);
    });
  });

  describe('keepForgeGeneration', () => {
    it('marks generation as kept', () => {
      storeForgeGeneration('keep-test', 'code', true);
      keepForgeGeneration('keep-test', 'looks good');

      const gen = getForgeGeneration('keep-test');
      expect(gen?.decision).toBe('keep');
    });
  });

  describe('discardForgeGeneration', () => {
    it('removes generation', () => {
      storeForgeGeneration('discard-test', 'code', true);
      discardForgeGeneration('discard-test', 'not what I wanted');

      const gen = getForgeGeneration('discard-test');
      expect(gen).toBeNull();
    });
  });

  describe('getForgeDecisionLog', () => {
    it('returns all decisions', () => {
      storeForgeGeneration('log-1', 'code1', true);
      storeForgeGeneration('log-2', 'code2', true);
      keepForgeGeneration('log-1');
      discardForgeGeneration('log-2');

      const log = getForgeDecisionLog();
      expect(log).toHaveLength(2);
    });
  });

  describe('getForgeDecision', () => {
    it('returns specific decision', () => {
      storeForgeGeneration('specific', 'code', true);
      keepForgeGeneration('specific', 'nice');

      const decision = getForgeDecision('specific');
      expect(decision?.decision).toBe('keep');
      expect(decision?.reason).toBe('nice');
    });

    it('returns null for unknown session', () => {
      const decision = getForgeDecision('unknown');
      expect(decision).toBeNull();
    });
  });
});

// =============================================================================
// FORMATTING TESTS
// =============================================================================

describe('Formatting', () => {
  describe('formatForgeActivation', () => {
    it('includes key information', () => {
      const context = createForgeContext();
      const message = formatForgeActivation(context);

      expect(message).toContain('Forge Mode Activated');
      expect(message).toContain('Survival patterns');
      expect(message).toContain('Zone physics constraints');
      expect(message).toContain(context.sessionId!);
    });
  });

  describe('formatForgeDecisionPrompt', () => {
    it('shows physics validity', () => {
      const gen = storeForgeGeneration('format-1', 'code', true);
      const prompt = formatForgeDecisionPrompt(gen);

      expect(prompt).toContain('Physics Valid: ✓');
      expect(prompt).toContain('Keep this exploration?');
    });

    it('shows violations when present', () => {
      const gen = storeForgeGeneration('format-2', 'code', false, ['bad timing']);
      const prompt = formatForgeDecisionPrompt(gen);

      expect(prompt).toContain('Physics Valid: ✗');
      expect(prompt).toContain('bad timing');
    });
  });

  describe('formatForgeDecisionResult', () => {
    it('formats keep result', () => {
      const result = formatForgeDecisionResult('keep', 'session-1');
      expect(result).toContain('kept');
      expect(result).toContain('session-1');
    });

    it('formats discard result', () => {
      const result = formatForgeDecisionResult('discard', 'session-2');
      expect(result).toContain('discarded');
      expect(result).toContain('session-2');
    });
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('Integration', () => {
  beforeEach(() => {
    clearForgeSessions();
  });

  describe('prepareCraftContext', () => {
    it('returns forge context for forge prompts', () => {
      const { context, cleanPrompt } = prepareCraftContext('--forge create');
      expect(context.forgeMode).toBe(true);
      expect(cleanPrompt).toBe('create');
    });

    it('returns default context for normal prompts', () => {
      const { context, cleanPrompt } = prepareCraftContext('create a button');
      expect(context.forgeMode).toBe(false);
      expect(cleanPrompt).toBe('create a button');
    });
  });

  describe('createForgeFlow', () => {
    it('manages complete flow', () => {
      const flow = createForgeFlow();

      // Start
      const context = flow.start();
      expect(context.forgeMode).toBe(true);

      // Store
      const gen = flow.store('const x = 1;', true);
      expect(gen.code).toBe('const x = 1;');

      // Pending
      expect(flow.isPending()).toBe(true);

      // Keep
      expect(flow.keep('looks good')).toBe(true);
      expect(flow.isPending()).toBe(false);

      // Get final generation
      const finalGen = flow.getGeneration();
      expect(finalGen?.decision).toBe('keep');
    });

    it('handles discard flow', () => {
      const flow = createForgeFlow();
      flow.start();
      flow.store('bad code', false, ['violation']);

      expect(flow.isPending()).toBe(true);
      expect(flow.discard('not good')).toBe(true);

      // After discard, generation is removed
      expect(flow.getGeneration()).toBeNull();
    });

    it('throws when storing without starting', () => {
      const flow = createForgeFlow();
      expect(() => flow.store('code', true)).toThrow('Forge flow not started');
    });
  });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

describe('Performance', () => {
  beforeEach(() => {
    clearForgeSessions();
  });

  it('trigger detection in <1ms', () => {
    const start = performance.now();
    detectForgeTrigger('--forge create a complex component with many features');
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(1);
  });

  it('100 forge operations in <10ms', () => {
    const start = performance.now();

    for (let i = 0; i < 100; i++) {
      const flow = createForgeFlow();
      flow.start();
      flow.store(`code-${i}`, true);
      if (i % 2 === 0) {
        flow.keep();
      } else {
        flow.discard();
      }
    }

    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(10);
  });
});
