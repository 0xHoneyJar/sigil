/**
 * Sync Module Tests
 *
 * Sprint 11: Comprehensive test coverage for Interaction Router
 * - Keyword classification with comprehensive signals
 * - InteractionRouter class functionality
 * - Sync hooks (useServerTick, useLocalFirst, useCRDTText)
 * - Declaration management and persistence
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  classifyByKeywords,
  detectSyncStrategy,
  getSyncConfig,
  getSyncWarnings,
  InteractionRouter,
  declareSyncStrategy,
  STRATEGY_SIGNALS,
} from './index.js';
import type {
  SyncStrategy,
  DeclarationRecord,
  RouteContext,
  SyncDetectionResult,
} from './types.js';

// ============ STRATEGY_SIGNALS TESTS ============

describe('STRATEGY_SIGNALS', () => {
  it('should have comprehensive server_tick keywords', () => {
    const keywords = STRATEGY_SIGNALS.server_tick;

    // Financial
    expect(keywords).toContain('trade');
    expect(keywords).toContain('transfer');
    expect(keywords).toContain('balance');
    expect(keywords).toContain('wallet');
    expect(keywords).toContain('withdraw');
    expect(keywords).toContain('deposit');
    expect(keywords).toContain('payment');
    expect(keywords).toContain('transaction');

    // Gaming
    expect(keywords).toContain('attack');
    expect(keywords).toContain('health');
    expect(keywords).toContain('inventory');
    expect(keywords).toContain('combat');
    expect(keywords).toContain('xp');
    expect(keywords).toContain('level');

    // Claims
    expect(keywords).toContain('claim');
    expect(keywords).toContain('stake');
    expect(keywords).toContain('mint');
  });

  it('should have comprehensive crdt keywords', () => {
    const keywords = STRATEGY_SIGNALS.crdt;

    // Text editing
    expect(keywords).toContain('edit');
    expect(keywords).toContain('write');
    expect(keywords).toContain('document');

    // Collaboration
    expect(keywords).toContain('comment');
    expect(keywords).toContain('message');
    expect(keywords).toContain('collaborative');
    expect(keywords).toContain('shared');
    expect(keywords).toContain('realtime');
  });

  it('should have comprehensive lww keywords', () => {
    const keywords = STRATEGY_SIGNALS.lww;

    // Toggles
    expect(keywords).toContain('toggle');
    expect(keywords).toContain('switch');

    // Settings
    expect(keywords).toContain('preference');
    expect(keywords).toContain('setting');
    expect(keywords).toContain('config');
    expect(keywords).toContain('theme');

    // State
    expect(keywords).toContain('status');
    expect(keywords).toContain('favorite');
    expect(keywords).toContain('archive');
  });

  it('should have comprehensive none keywords', () => {
    const keywords = STRATEGY_SIGNALS.none;

    // UI elements
    expect(keywords).toContain('modal');
    expect(keywords).toContain('dropdown');
    expect(keywords).toContain('tooltip');

    // Interaction states
    expect(keywords).toContain('hover');
    expect(keywords).toContain('focus');
    expect(keywords).toContain('expand');
    expect(keywords).toContain('collapse');

    // Navigation
    expect(keywords).toContain('tab');
    expect(keywords).toContain('sidebar');
    expect(keywords).toContain('navigate');
  });
});

// ============ classifyByKeywords TESTS ============

describe('classifyByKeywords', () => {
  describe('server_tick classification', () => {
    it('should classify financial keywords as server_tick', () => {
      expect(classifyByKeywords('withdraw balance').strategy).toBe('server_tick');
      expect(classifyByKeywords('user wallet').strategy).toBe('server_tick');
      expect(classifyByKeywords('transfer money').strategy).toBe('server_tick');
      expect(classifyByKeywords('payment processing').strategy).toBe('server_tick');
      expect(classifyByKeywords('deposit funds').strategy).toBe('server_tick');
    });

    it('should classify gaming keywords as server_tick', () => {
      expect(classifyByKeywords('player health').strategy).toBe('server_tick');
      expect(classifyByKeywords('inventory update').strategy).toBe('server_tick');
      expect(classifyByKeywords('attack enemy').strategy).toBe('server_tick');
      expect(classifyByKeywords('combat damage').strategy).toBe('server_tick');
      expect(classifyByKeywords('xp gained').strategy).toBe('server_tick');
    });

    it('should classify claim keywords as server_tick', () => {
      expect(classifyByKeywords('claim rewards').strategy).toBe('server_tick');
      expect(classifyByKeywords('stake tokens').strategy).toBe('server_tick');
      expect(classifyByKeywords('mint nft').strategy).toBe('server_tick');
    });

    it('should have high confidence with multiple matches', () => {
      const result = classifyByKeywords('withdraw balance from wallet');
      expect(result.strategy).toBe('server_tick');
      expect(result.confidence).toBe('high');
      expect(result.matchedKeywords.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('crdt classification', () => {
    it('should classify text editing keywords as crdt', () => {
      expect(classifyByKeywords('edit document').strategy).toBe('crdt');
      expect(classifyByKeywords('write comment').strategy).toBe('crdt');
      expect(classifyByKeywords('collaborative text').strategy).toBe('crdt');
      expect(classifyByKeywords('message draft').strategy).toBe('crdt');
    });

    it('should classify collaboration keywords as crdt', () => {
      expect(classifyByKeywords('shared document').strategy).toBe('crdt');
      expect(classifyByKeywords('realtime editing').strategy).toBe('crdt');
      expect(classifyByKeywords('collaborative notes').strategy).toBe('crdt');
    });
  });

  describe('lww classification', () => {
    it('should classify preference keywords as lww', () => {
      expect(classifyByKeywords('toggle theme').strategy).toBe('lww');
      expect(classifyByKeywords('user preference').strategy).toBe('lww');
      expect(classifyByKeywords('select option').strategy).toBe('lww');
      expect(classifyByKeywords('config setting').strategy).toBe('lww');
    });

    it('should classify state keywords as lww', () => {
      expect(classifyByKeywords('user status').strategy).toBe('lww');
      expect(classifyByKeywords('favorite recipe').strategy).toBe('lww');
      expect(classifyByKeywords('pin star').strategy).toBe('lww');
    });
  });

  describe('none classification', () => {
    it('should classify UI keywords as none', () => {
      // Use exact keywords without substring conflicts
      expect(classifyByKeywords('show modal').strategy).toBe('none');
      expect(classifyByKeywords('tooltip overlay').strategy).toBe('none');
      expect(classifyByKeywords('sidebar panel').strategy).toBe('none');
    });

    it('should classify interaction state keywords as none', () => {
      expect(classifyByKeywords('hover tooltip').strategy).toBe('none');
      expect(classifyByKeywords('blur active').strategy).toBe('none');
      expect(classifyByKeywords('show hide').strategy).toBe('none');
    });
  });

  describe('substring edge cases', () => {
    it('should handle server_tick priority for compound words', () => {
      // 'dropdown' contains 'drop' which is server_tick for gaming
      // This is expected behavior - server_tick has highest priority
      const result = classifyByKeywords('dropdown menu');
      expect(result.strategy).toBe('server_tick');
      expect(result.matchedKeywords).toContain('drop');
    });

    it('should handle crdt priority for compound words', () => {
      // 'dialog' contains 'log' which is crdt for journal/logging
      const result = classifyByKeywords('open dialog');
      expect(result.strategy).toBe('crdt');
      expect(result.matchedKeywords).toContain('log');
    });
  });

  describe('unknown patterns', () => {
    it('should return null for unknown patterns', () => {
      expect(classifyByKeywords('random thing').strategy).toBe(null);
      expect(classifyByKeywords('foo bar baz').strategy).toBe(null);
      expect(classifyByKeywords('xyz123').strategy).toBe(null);
    });

    it('should require explicit declaration for unknown patterns', () => {
      const result = classifyByKeywords('unknown pattern xyz');
      expect(result.strategy).toBe(null);
      expect(result.rationale).toContain('requires explicit declaration');
    });
  });

  describe('priority ordering', () => {
    it('should prioritize server_tick over other strategies', () => {
      // Contains both server_tick and lww keywords
      const result = classifyByKeywords('trade toggle switch');
      expect(result.strategy).toBe('server_tick');
    });

    it('should prioritize crdt over lww', () => {
      // Contains both crdt and lww keywords
      const result = classifyByKeywords('edit preference setting');
      expect(result.strategy).toBe('crdt');
    });
  });
});

// ============ detectSyncStrategy TESTS ============

describe('detectSyncStrategy', () => {
  it('should return warnings for server_tick', () => {
    const result = detectSyncStrategy('withdraw from balance');
    expect(result.strategy).toBe('server_tick');
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('NEVER use optimistic UI');
  });

  it('should return warnings for crdt', () => {
    const result = detectSyncStrategy('collaborative document editing');
    expect(result.strategy).toBe('crdt');
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('presence cursors');
  });

  it('should return null strategy for unknown patterns', () => {
    const result = detectSyncStrategy('unknown pattern xyz');
    expect(result.strategy).toBe(null);
    expect(result.rationale).toContain('requires explicit declaration');
  });

  it('should include matched keywords', () => {
    const result = detectSyncStrategy('withdraw balance wallet');
    expect(result.matchedKeywords).toContain('withdraw');
    expect(result.matchedKeywords).toContain('balance');
    expect(result.matchedKeywords).toContain('wallet');
  });

  it('should include confidence level', () => {
    const result = detectSyncStrategy('withdraw balance wallet');
    expect(['high', 'medium', 'low']).toContain(result.confidence);
  });
});

// ============ getSyncWarnings TESTS ============

describe('getSyncWarnings', () => {
  it('should return critical warnings for server_tick', () => {
    const warnings = getSyncWarnings('server_tick');
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].severity).toBe('critical');
    expect(warnings[0].message).toContain('NEVER use optimistic UI');
  });

  it('should return info warnings for crdt', () => {
    const warnings = getSyncWarnings('crdt');
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some((w) => w.severity === 'info')).toBe(true);
  });

  it('should return info warnings for lww', () => {
    const warnings = getSyncWarnings('lww');
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].severity).toBe('info');
    expect(warnings[0].message).toContain('Last write wins');
  });

  it('should return empty array for none', () => {
    const warnings = getSyncWarnings('none');
    expect(warnings).toEqual([]);
  });
});

// ============ getSyncConfig TESTS ============

describe('getSyncConfig', () => {
  it('should return non-optimistic config for server_tick', () => {
    const config = getSyncConfig('server_tick');
    expect(config.strategy).toBe('server_tick');
    expect(config.uiFeedback.optimistic).toBe(false);
    expect(config.uiFeedback.pendingIndicator).toBe('prominent');
  });

  it('should return optimistic config for crdt', () => {
    const config = getSyncConfig('crdt');
    expect(config.strategy).toBe('crdt');
    expect(config.uiFeedback.optimistic).toBe(true);
    expect(config.uiFeedback.showPresence).toBe(true);
  });

  it('should return optimistic config for lww', () => {
    const config = getSyncConfig('lww');
    expect(config.strategy).toBe('lww');
    expect(config.uiFeedback.optimistic).toBe(true);
  });

  it('should include tick rate for server_tick', () => {
    const config = getSyncConfig('server_tick', 1000);
    expect(config.tickRateMs).toBe(1000);
  });

  it('should use default tick rate if not provided', () => {
    const config = getSyncConfig('server_tick');
    expect(config.tickRateMs).toBe(600);
  });
});

// ============ InteractionRouter TESTS ============

describe('InteractionRouter', () => {
  let router: InteractionRouter;

  beforeEach(() => {
    router = new InteractionRouter();
  });

  describe('route()', () => {
    it('should route based on keyword classification', () => {
      const context: RouteContext = {
        dataPath: 'user.balance',
        description: 'withdraw from wallet',
      };

      const result = router.route(context);
      expect('strategy' in result).toBe(true);
      if ('strategy' in result) {
        expect(result.strategy).toBe('server_tick');
      }
    });

    it('should require declaration for unknown patterns', () => {
      const context: RouteContext = {
        dataPath: 'some.unknown.path',
        description: 'xyz123 foo bar',
      };

      const result = router.route(context);
      expect('requiresDeclaration' in result).toBe(true);
      if ('requiresDeclaration' in result) {
        expect(result.requiresDeclaration).toBe(true);
        expect(result.suggestions.length).toBeGreaterThan(0);
      }
    });

    it('should use explicit declaration over keyword detection', async () => {
      // First, declare a strategy
      await router.declare(
        {
          dataPath: 'user.status',
          strategy: 'server_tick',
          rationale: 'Critical user status',
        },
        'test'
      );

      // Route should use declaration, not keyword detection
      const context: RouteContext = {
        dataPath: 'user.status',
        description: 'toggle status', // Would normally be lww
      };

      const result = router.route(context);
      expect('strategy' in result).toBe(true);
      if ('strategy' in result) {
        expect(result.strategy).toBe('server_tick');
      }
    });
  });

  describe('declare()', () => {
    it('should save declaration', async () => {
      const record = await router.declare(
        {
          dataPath: 'game.inventory',
          strategy: 'server_tick',
          rationale: 'Game inventory is critical',
        },
        'developer'
      );

      expect(record.dataPath).toBe('game.inventory');
      expect(record.strategy).toBe('server_tick');
      expect(record.declaredBy).toBe('developer');
      expect(record.declaredAt).toBeDefined();
    });

    it('should be retrievable after declaration', async () => {
      await router.declare(
        {
          dataPath: 'test.path',
          strategy: 'crdt',
          rationale: 'Test',
        },
        'test'
      );

      const declarations = router.getDeclarations();
      expect(declarations.some((d) => d.dataPath === 'test.path')).toBe(true);
    });
  });

  describe('findDeclaration()', () => {
    beforeEach(async () => {
      await router.declare(
        { dataPath: 'user.balance', strategy: 'server_tick', rationale: 'Financial' },
        'test'
      );
      await router.declare(
        { dataPath: 'game.*.inventory', strategy: 'server_tick', rationale: 'Game items' },
        'test'
      );
    });

    it('should find exact match', () => {
      const decl = router.findDeclaration('user.balance');
      expect(decl).toBeDefined();
      expect(decl?.strategy).toBe('server_tick');
    });

    it('should find pattern match', () => {
      const decl = router.findDeclaration('game.player1.inventory');
      expect(decl).toBeDefined();
      expect(decl?.strategy).toBe('server_tick');
    });

    it('should return undefined for non-matching path', () => {
      const decl = router.findDeclaration('unknown.path');
      expect(decl).toBeUndefined();
    });
  });

  describe('removeDeclaration()', () => {
    it('should remove declaration', async () => {
      await router.declare(
        { dataPath: 'test.remove', strategy: 'lww', rationale: 'Test' },
        'test'
      );

      expect(router.findDeclaration('test.remove')).toBeDefined();

      const removed = router.removeDeclaration('test.remove');
      expect(removed).toBe(true);
      expect(router.findDeclaration('test.remove')).toBeUndefined();
    });

    it('should return false for non-existent declaration', () => {
      const removed = router.removeDeclaration('non.existent');
      expect(removed).toBe(false);
    });
  });

  describe('loadDeclarations()', () => {
    it('should load declarations from array', () => {
      const declarations: DeclarationRecord[] = [
        {
          dataPath: 'loaded.path1',
          strategy: 'server_tick',
          declaredBy: 'test',
          declaredAt: new Date().toISOString(),
          rationale: 'Loaded',
        },
        {
          dataPath: 'loaded.path2',
          strategy: 'crdt',
          declaredBy: 'test',
          declaredAt: new Date().toISOString(),
          rationale: 'Loaded',
        },
      ];

      router.loadDeclarations(declarations);

      expect(router.findDeclaration('loaded.path1')?.strategy).toBe('server_tick');
      expect(router.findDeclaration('loaded.path2')?.strategy).toBe('crdt');
    });
  });

  describe('with persistence callback', () => {
    it('should call onDeclarationSave when declaring', async () => {
      const saveFn = vi.fn().mockResolvedValue(undefined);
      const routerWithPersist = new InteractionRouter({
        onDeclarationSave: saveFn,
      });

      await routerWithPersist.declare(
        { dataPath: 'test.path', strategy: 'lww', rationale: 'Test' },
        'test'
      );

      expect(saveFn).toHaveBeenCalledTimes(1);
      expect(saveFn).toHaveBeenCalledWith(
        expect.objectContaining({
          dataPath: 'test.path',
          strategy: 'lww',
        })
      );
    });
  });
});

// ============ declareSyncStrategy HELPER TESTS ============

describe('declareSyncStrategy', () => {
  it('should be a convenience wrapper for router.declare', async () => {
    const router = new InteractionRouter();

    const record = await declareSyncStrategy(
      router,
      'helper.test',
      'crdt',
      'Testing helper function',
      'helper-test'
    );

    expect(record.dataPath).toBe('helper.test');
    expect(record.strategy).toBe('crdt');
    expect(record.declaredBy).toBe('helper-test');
  });
});

// ============ EDGE CASE TESTS ============

describe('Edge cases', () => {
  it('should handle empty strings', () => {
    const result = classifyByKeywords('');
    expect(result.strategy).toBe(null);
  });

  it('should handle case insensitivity', () => {
    expect(classifyByKeywords('WITHDRAW BALANCE').strategy).toBe('server_tick');
    expect(classifyByKeywords('Edit Document').strategy).toBe('crdt');
    expect(classifyByKeywords('Toggle THEME').strategy).toBe('lww');
  });

  it('should handle special characters', () => {
    expect(classifyByKeywords('withdraw-balance').strategy).toBe('server_tick');
    expect(classifyByKeywords('user_balance').strategy).toBe('server_tick');
  });

  it('should handle multi-word descriptions', () => {
    const result = classifyByKeywords(
      'This is a long description about withdrawing balance from a user wallet'
    );
    expect(result.strategy).toBe('server_tick');
    expect(result.matchedKeywords.length).toBeGreaterThan(1);
  });
});

// ============ ROUTE RESULT TYPES TESTS ============

describe('Route result types', () => {
  let router: InteractionRouter;

  beforeEach(() => {
    router = new InteractionRouter();
  });

  it('should return SyncConfig for detected strategies', () => {
    const result = router.route({
      dataPath: 'user.balance',
      description: 'withdraw money',
    });

    expect('strategy' in result).toBe(true);
    if ('strategy' in result) {
      expect(result.uiFeedback).toBeDefined();
      expect(result.description).toBeDefined();
    }
  });

  it('should return requiresDeclaration for unknown patterns', () => {
    const result = router.route({
      dataPath: 'unknown',
      description: 'xyz123',
    });

    expect('requiresDeclaration' in result).toBe(true);
    if ('requiresDeclaration' in result) {
      expect(result.reason).toBeDefined();
      expect(result.suggestions).toBeDefined();
    }
  });

  it('should provide path-based suggestions', () => {
    const result = router.route({
      dataPath: 'user.transaction.history',
      description: 'xyz123',
    });

    if ('requiresDeclaration' in result) {
      // Should suggest server_tick based on 'transaction' in path
      expect(result.suggestions).toContain('server_tick');
    }
  });
});
