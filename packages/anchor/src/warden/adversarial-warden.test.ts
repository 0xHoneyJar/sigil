/**
 * Adversarial Warden Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  AdversarialWarden,
  isMoreRestrictive,
  isAtLeastAsRestrictive,
  getHierarchyDescription,
  resetWarden,
  getWarden,
} from './adversarial-warden.js';
import { clearPhysicsCache } from './physics-loader.js';
import { clearVocabularyCache } from './vocabulary-loader.js';
import type { LearnedRule } from '../types.js';

describe('AdversarialWarden', () => {
  let warden: AdversarialWarden;

  beforeEach(() => {
    resetWarden();
    clearPhysicsCache();
    clearVocabularyCache();
    warden = new AdversarialWarden();
  });

  describe('isMoreRestrictive', () => {
    it('returns true when first zone is more restrictive', () => {
      expect(isMoreRestrictive('critical', 'elevated')).toBe(true);
      expect(isMoreRestrictive('critical', 'standard')).toBe(true);
      expect(isMoreRestrictive('critical', 'local')).toBe(true);
      expect(isMoreRestrictive('elevated', 'standard')).toBe(true);
      expect(isMoreRestrictive('elevated', 'local')).toBe(true);
      expect(isMoreRestrictive('standard', 'local')).toBe(true);
    });

    it('returns false when first zone is less or equally restrictive', () => {
      expect(isMoreRestrictive('local', 'critical')).toBe(false);
      expect(isMoreRestrictive('standard', 'critical')).toBe(false);
      expect(isMoreRestrictive('elevated', 'critical')).toBe(false);
      expect(isMoreRestrictive('critical', 'critical')).toBe(false);
      expect(isMoreRestrictive('local', 'local')).toBe(false);
    });
  });

  describe('isAtLeastAsRestrictive', () => {
    it('returns true when first zone is equal or more restrictive', () => {
      expect(isAtLeastAsRestrictive('critical', 'critical')).toBe(true);
      expect(isAtLeastAsRestrictive('critical', 'elevated')).toBe(true);
      expect(isAtLeastAsRestrictive('critical', 'standard')).toBe(true);
      expect(isAtLeastAsRestrictive('elevated', 'standard')).toBe(true);
      expect(isAtLeastAsRestrictive('standard', 'standard')).toBe(true);
    });

    it('returns false when first zone is less restrictive', () => {
      expect(isAtLeastAsRestrictive('local', 'critical')).toBe(false);
      expect(isAtLeastAsRestrictive('standard', 'critical')).toBe(false);
      expect(isAtLeastAsRestrictive('local', 'standard')).toBe(false);
    });
  });

  describe('getHierarchyDescription', () => {
    it('returns a readable hierarchy string', () => {
      const desc = getHierarchyDescription();
      expect(desc).toContain('critical');
      expect(desc).toContain('elevated');
      expect(desc).toContain('standard');
      expect(desc).toContain('local');
      expect(desc).toContain('>');
    });
  });

  describe('checkRelevance', () => {
    it('passes when zone is relevant to component type', () => {
      const result = warden.checkRelevance('critical', 'ClaimButton');
      expect(result.passed).toBe(true);
    });

    it('passes for elevated zone on delete component', () => {
      const result = warden.checkRelevance('elevated', 'DeleteButton');
      expect(result.passed).toBe(true);
    });

    it('passes for local zone on toggle component', () => {
      const result = warden.checkRelevance('local', 'ThemeToggle');
      expect(result.passed).toBe(true);
    });

    it('fails when critical zone cited for non-critical component', () => {
      const result = warden.checkRelevance('critical', 'TooltipComponent');
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('unnecessarily restrictive');
    });

    it('fails when elevated zone cited for non-elevated component', () => {
      const result = warden.checkRelevance('elevated', 'ThemeSwitch');
      expect(result.passed).toBe(false);
      expect(result.reason).toContain('unnecessarily restrictive');
    });
  });

  describe('learned rules', () => {
    const mockRule: LearnedRule = {
      id: 'anchor-test-001',
      version: '1.0.0',
      description: 'Test rule for financial buttons',
      created_from: 'manual',
      rule: {
        trigger: {
          component_name_contains: ['claim', 'withdraw'],
        },
        constraint: {
          type: 'timing',
          operator: '>=',
          expected: 800,
          message: 'Financial buttons require 800ms timing',
        },
      },
      grounding_requirement: {
        must_cite: {
          zone: 'critical',
          physics: ['pessimistic', '800ms'],
        },
      },
      created_at: '2026-01-20T00:00:00Z',
      updated_at: '2026-01-20T00:00:00Z',
    };

    it('can add and get learned rules', () => {
      expect(warden.getLearnedRules()).toHaveLength(0);

      warden.addLearnedRule(mockRule);

      expect(warden.getLearnedRules()).toHaveLength(1);
      expect(warden.getLearnedRules()[0]!.id).toBe('anchor-test-001');
    });

    it('can clear learned rules', () => {
      warden.addLearnedRule(mockRule);
      expect(warden.getLearnedRules()).toHaveLength(1);

      warden.clearLearnedRules();

      expect(warden.getLearnedRules()).toHaveLength(0);
    });

    it('checks learned rules against statement', () => {
      warden.addLearnedRule(mockRule);

      // Statement that matches trigger but missing citation
      const result = warden.checkLearnedRules({
        component: 'ClaimButton',
        citedZone: 'standard', // Should be critical
        detectedKeywords: ['claim'],
        inferredEffect: 'financial',
        claimedPhysics: {},
        raw: 'Component: ClaimButton\nZone: standard',
      });

      expect(result.passed).toBe(false);
      expect(result.reason).toContain('anchor-test-001');
    });

    it('passes when learned rule citation is present', () => {
      warden.addLearnedRule(mockRule);

      const result = warden.checkLearnedRules({
        component: 'ClaimButton',
        citedZone: 'critical',
        detectedKeywords: ['claim'],
        inferredEffect: 'financial',
        claimedPhysics: { sync: 'pessimistic', timing: 800 },
        raw: 'Component: ClaimButton\nZone: critical\nSync: pessimistic\nTiming: 800ms',
      });

      expect(result.passed).toBe(true);
    });
  });

  describe('validate', () => {
    it('validates correct financial grounding', async () => {
      const text = `
Component: ClaimButton
Zone: critical
Effect: Financial
Sync: pessimistic
Timing: 800ms
Confirmation: required
Keywords: claim
`;
      const result = await warden.validate(text);

      expect(result.status).toBe('VALID');
      expect(result.adversarialChecks.relevance.passed).toBe(true);
      expect(result.adversarialChecks.learnedRules.passed).toBe(true);
    });

    it('detects DECEPTIVE when citing standard for financial', async () => {
      const text = `
Component: ClaimButton
Zone: standard
Keywords: claim
`;
      const result = await warden.validate(text);

      expect(result.status).toBe('DECEPTIVE');
      expect(result.requiredZone).toBe('critical');
      expect(result.citedZone).toBe('standard');
    });

    it('detects DRIFT when citing critical for tooltip', async () => {
      const text = `
Component: HelpTooltip
Zone: critical
`;
      const result = await warden.validate(text);

      expect(result.status).toBe('DRIFT');
      expect(result.adversarialChecks.relevance.passed).toBe(false);
    });

    it('detects DRIFT when learned rule citation is missing', async () => {
      const rule: LearnedRule = {
        id: 'test-rule',
        version: '1.0.0',
        description: 'Test',
        created_from: 'manual',
        rule: {
          trigger: { component_name_contains: ['withdraw'] },
          constraint: { type: 'timing', operator: '>=', expected: 800, message: 'Test' },
        },
        grounding_requirement: {
          must_cite: { zone: 'critical', physics: ['pessimistic'] },
        },
        created_at: '2026-01-20T00:00:00Z',
        updated_at: '2026-01-20T00:00:00Z',
      };

      warden.addLearnedRule(rule);

      const text = `
Component: WithdrawButton
Zone: standard
`;
      const result = await warden.validate(text);

      expect(result.status).toBe('DRIFT');
    });

    it('passes correct citation with learned rules', async () => {
      const rule: LearnedRule = {
        id: 'test-rule',
        version: '1.0.0',
        description: 'Test',
        created_from: 'manual',
        rule: {
          trigger: { component_name_contains: ['withdraw'] },
          constraint: { type: 'timing', operator: '>=', expected: 800, message: 'Test' },
        },
        grounding_requirement: {
          must_cite: { zone: 'critical', physics: ['pessimistic'] },
        },
        created_at: '2026-01-20T00:00:00Z',
        updated_at: '2026-01-20T00:00:00Z',
      };

      warden.addLearnedRule(rule);

      const text = `
Component: WithdrawButton
Zone: critical
Sync: pessimistic
Timing: 800ms
Keywords: withdraw
`;
      const result = await warden.validate(text);

      expect(result.status).toBe('VALID');
    });
  });

  describe('singleton', () => {
    it('returns same instance', () => {
      const warden1 = getWarden();
      const warden2 = getWarden();
      expect(warden1).toBe(warden2);
    });

    it('reset creates new instance', () => {
      const warden1 = getWarden();
      resetWarden();
      const warden2 = getWarden();
      expect(warden1).not.toBe(warden2);
    });
  });
});
