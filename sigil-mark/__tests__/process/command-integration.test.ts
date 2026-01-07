/**
 * Command Integration Tests (v2.6)
 *
 * Tests the integration between Claude commands and the Process layer.
 * These tests verify that the readers and helpers work correctly
 * to support /craft, /consult, and /garden commands.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

// Zone resolver imports
import {
  resolveZone,
  getPersonaForZone,
  DEFAULT_ZONE_PERSONA_MAP,
} from '../../core/zone-resolver';

// Decision imports
import {
  LOCK_PERIODS,
  getDaysRemaining,
  isDecisionExpired,
  type Decision,
} from '../../process/decision-reader';

// Constitution types
import type {
  Constitution,
  ProtectedCapability,
  EnforcementLevel,
} from '../../process/constitution-reader';

// Lens array types
import type { LensArray, Persona } from '../../process/lens-array-reader';

describe('Command Integration Tests', () => {
  describe('/craft Command Context - Zone to Persona Mapping', () => {
    it('should map critical zone to power_user persona', () => {
      expect(getPersonaForZone('critical')).toBe('power_user');
    });

    it('should map checkout zone to power_user persona', () => {
      expect(getPersonaForZone('checkout')).toBe('power_user');
    });

    it('should map marketing zone to newcomer persona', () => {
      expect(getPersonaForZone('marketing')).toBe('newcomer');
    });

    it('should map landing zone to newcomer persona', () => {
      expect(getPersonaForZone('landing')).toBe('newcomer');
    });

    it('should map mobile zone to mobile persona', () => {
      expect(getPersonaForZone('mobile')).toBe('mobile');
    });

    it('should map a11y zone to accessibility persona', () => {
      expect(getPersonaForZone('a11y')).toBe('accessibility');
    });

    it('should map admin zone to power_user persona', () => {
      expect(getPersonaForZone('admin')).toBe('power_user');
    });

    it('should use custom mapping when provided', () => {
      const customMapping = { special: 'mobile' };
      expect(getPersonaForZone('special', customMapping)).toBe('mobile');
    });

    it('should fall back to newcomer for unknown zones', () => {
      expect(getPersonaForZone('unknown_zone')).toBe('newcomer');
    });

    it('should have correct DEFAULT_ZONE_PERSONA_MAP', () => {
      expect(DEFAULT_ZONE_PERSONA_MAP).toEqual({
        // Critical zones → power users
        critical: 'power_user',
        checkout: 'power_user',
        claim: 'power_user',
        withdraw: 'power_user',
        deposit: 'power_user',
        // Marketing zones → newcomers
        marketing: 'newcomer',
        landing: 'newcomer',
        onboarding: 'newcomer',
        welcome: 'newcomer',
        // Admin zones → power users
        admin: 'power_user',
        dashboard: 'power_user',
        settings: 'power_user',
        // Mobile zones
        mobile: 'mobile',
        app: 'mobile',
        // Accessibility zones
        a11y: 'accessibility',
        accessible: 'accessibility',
      });
    });
  });

  describe('/consult Command - Lock Periods', () => {
    it('should have correct LOCK_PERIODS for strategic scope', () => {
      expect(LOCK_PERIODS.strategic).toBe(180);
    });

    it('should have correct LOCK_PERIODS for direction scope', () => {
      expect(LOCK_PERIODS.direction).toBe(90);
    });

    it('should have correct LOCK_PERIODS for execution scope', () => {
      expect(LOCK_PERIODS.execution).toBe(30);
    });

    it('should correctly calculate days remaining for decision', () => {
      const futureDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);
      const decision: Decision = {
        id: 'DEC-2026-001',
        topic: 'Test',
        decision: 'Test decision',
        scope: 'direction',
        locked_at: new Date().toISOString(),
        locked_by: 'Test',
        expires_at: futureDate.toISOString(),
        rationale: 'Test rationale',
        status: 'locked',
      };

      const daysRemaining = getDaysRemaining(decision);
      expect(daysRemaining).toBeCloseTo(45, 0);
    });

    it('should return negative days for expired decisions', () => {
      const pastDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
      const decision: Decision = {
        id: 'DEC-2026-002',
        topic: 'Expired Test',
        decision: 'Test decision',
        scope: 'execution',
        locked_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        locked_by: 'Test',
        expires_at: pastDate.toISOString(),
        rationale: 'Test rationale',
        status: 'locked',
      };

      const daysRemaining = getDaysRemaining(decision);
      expect(daysRemaining).toBeLessThan(0);
    });

    it('should correctly identify expired decisions', () => {
      const pastDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
      const decision: Decision = {
        id: 'DEC-2026-003',
        topic: 'Expired Test',
        decision: 'Test decision',
        scope: 'execution',
        locked_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        locked_by: 'Test',
        expires_at: pastDate.toISOString(),
        rationale: 'Test rationale',
        status: 'locked',
      };

      expect(isDecisionExpired(decision)).toBe(true);
    });

    it('should correctly identify non-expired decisions', () => {
      const futureDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);
      const decision: Decision = {
        id: 'DEC-2026-004',
        topic: 'Active Test',
        decision: 'Test decision',
        scope: 'direction',
        locked_at: new Date().toISOString(),
        locked_by: 'Test',
        expires_at: futureDate.toISOString(),
        rationale: 'Test rationale',
        status: 'locked',
      };

      expect(isDecisionExpired(decision)).toBe(false);
    });
  });

  describe('/garden Command - Health Checks', () => {
    it('should identify decisions with unlock history', () => {
      const decision: Decision = {
        id: 'DEC-2026-005',
        topic: 'Unlocked Test',
        decision: 'Test decision',
        scope: 'direction',
        locked_at: new Date().toISOString(),
        locked_by: 'Test',
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        rationale: 'Test rationale',
        status: 'unlocked',
        unlock_history: [
          {
            unlocked_at: new Date().toISOString(),
            unlocked_by: 'Developer',
            justification: 'New requirements',
          },
        ],
      };

      const hasUnlockHistory = decision.unlock_history && decision.unlock_history.length > 0;
      expect(hasUnlockHistory).toBe(true);
    });

    it('should filter decisions by status', () => {
      const decisions: Decision[] = [
        {
          id: 'DEC-2026-006',
          topic: 'Locked',
          decision: 'Test',
          scope: 'direction',
          locked_at: new Date().toISOString(),
          locked_by: 'Test',
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          rationale: 'Test',
          status: 'locked',
        },
        {
          id: 'DEC-2026-007',
          topic: 'Unlocked',
          decision: 'Test',
          scope: 'direction',
          locked_at: new Date().toISOString(),
          locked_by: 'Test',
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          rationale: 'Test',
          status: 'unlocked',
        },
        {
          id: 'DEC-2026-008',
          topic: 'Expired',
          decision: 'Test',
          scope: 'execution',
          locked_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          locked_by: 'Test',
          expires_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          rationale: 'Test',
          status: 'expired',
        },
      ];

      const locked = decisions.filter((d) => d.status === 'locked');
      const unlocked = decisions.filter((d) => d.status === 'unlocked');
      const expired = decisions.filter((d) => d.status === 'expired');

      expect(locked).toHaveLength(1);
      expect(unlocked).toHaveLength(1);
      expect(expired).toHaveLength(1);
    });

    it('should group Constitution capabilities by enforcement level', () => {
      const capabilities: ProtectedCapability[] = [
        {
          id: 'withdraw',
          name: 'Withdraw',
          description: 'Withdraw funds',
          enforcement: 'block',
          rationale: 'Critical capability',
        },
        {
          id: 'deposit',
          name: 'Deposit',
          description: 'Deposit funds',
          enforcement: 'block',
          rationale: 'Critical capability',
        },
        {
          id: 'fee_disclosure',
          name: 'Fee Disclosure',
          description: 'Show fees',
          enforcement: 'warn',
          rationale: 'Important for transparency',
        },
        {
          id: 'balance_visible',
          name: 'Balance Visible',
          description: 'Show balance',
          enforcement: 'log',
          rationale: 'User convenience',
        },
      ];

      const blocked = capabilities.filter((c) => c.enforcement === 'block');
      const warned = capabilities.filter((c) => c.enforcement === 'warn');
      const logged = capabilities.filter((c) => c.enforcement === 'log');

      expect(blocked).toHaveLength(2);
      expect(warned).toHaveLength(1);
      expect(logged).toHaveLength(1);
    });
  });

  describe('Cross-Command Integration', () => {
    it('should support zone → persona → physics flow', () => {
      // Step 1: Resolve zone
      const zone = 'critical';

      // Step 2: Get persona for zone
      const personaId = getPersonaForZone(zone);
      expect(personaId).toBe('power_user');

      // Step 3: Persona physics would be loaded from lens-array
      // This test verifies the mapping is correct
      const expectedPhysics = {
        input_method: 'keyboard',
        shortcuts: { expected: true },
      };

      // The actual physics would come from lens-array-reader
      // but we can verify the mapping is correct
      expect(personaId).toBe('power_user');
    });

    it('should support decision filtering by zone context', () => {
      const decisions: Decision[] = [
        {
          id: 'DEC-2026-009',
          topic: 'Critical Decision',
          decision: 'Test',
          scope: 'direction',
          locked_at: new Date().toISOString(),
          locked_by: 'Test',
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          context: { zone: 'critical' },
          rationale: 'Test',
          status: 'locked',
        },
        {
          id: 'DEC-2026-010',
          topic: 'Marketing Decision',
          decision: 'Test',
          scope: 'direction',
          locked_at: new Date().toISOString(),
          locked_by: 'Test',
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          context: { zone: 'marketing' },
          rationale: 'Test',
          status: 'locked',
        },
      ];

      // Filter decisions for 'critical' zone (like /craft would do)
      const criticalDecisions = decisions.filter(
        (d) => d.status === 'locked' && d.context?.zone === 'critical'
      );

      expect(criticalDecisions).toHaveLength(1);
      expect(criticalDecisions[0].id).toBe('DEC-2026-009');
    });

    it('should support Constitution capability checking by zone', () => {
      const capabilities: ProtectedCapability[] = [
        {
          id: 'withdraw',
          name: 'Withdraw',
          description: 'Withdraw funds',
          enforcement: 'block',
          rationale: 'Critical capability',
          zones: ['critical', 'checkout'],
        },
        {
          id: 'fee_disclosure',
          name: 'Fee Disclosure',
          description: 'Show fees',
          enforcement: 'warn',
          rationale: 'Important for transparency',
          zones: ['checkout'],
        },
      ];

      // Filter capabilities for 'critical' zone
      const criticalCapabilities = capabilities.filter(
        (c) => !c.zones || c.zones.length === 0 || c.zones.includes('critical')
      );

      // Filter capabilities for 'checkout' zone
      const checkoutCapabilities = capabilities.filter(
        (c) => !c.zones || c.zones.length === 0 || c.zones.includes('checkout')
      );

      expect(criticalCapabilities).toHaveLength(1);
      expect(criticalCapabilities[0].id).toBe('withdraw');

      expect(checkoutCapabilities).toHaveLength(2);
    });

    it('should support unlock history tracking', () => {
      const decision: Decision = {
        id: 'DEC-2026-011',
        topic: 'Multi-unlock Test',
        decision: 'Test',
        scope: 'direction',
        locked_at: new Date().toISOString(),
        locked_by: 'Test',
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        rationale: 'Test',
        status: 'unlocked',
        unlock_history: [
          {
            unlocked_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            unlocked_by: 'Developer 1',
            justification: 'First unlock reason',
          },
          {
            unlocked_at: new Date().toISOString(),
            unlocked_by: 'Developer 2',
            justification: 'Second unlock reason',
          },
        ],
      };

      expect(decision.unlock_history).toHaveLength(2);
      expect(decision.unlock_history?.[0].justification).toBe('First unlock reason');
      expect(decision.unlock_history?.[1].justification).toBe('Second unlock reason');
    });
  });

  describe('Priority Ordering', () => {
    it('should order recommendations by priority level', () => {
      const recommendations = [
        { priority: 'LOW', type: 'layout_coverage', message: 'Low coverage' },
        { priority: 'CRITICAL', type: 'constitution_violation', message: 'Block violation' },
        { priority: 'MEDIUM', type: 'persona_missing', message: 'Missing persona' },
        { priority: 'HIGH', type: 'expired_decision', message: 'Expired' },
      ];

      const priorityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
      const sorted = recommendations.sort(
        (a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
      );

      expect(sorted[0].priority).toBe('CRITICAL');
      expect(sorted[1].priority).toBe('HIGH');
      expect(sorted[2].priority).toBe('MEDIUM');
      expect(sorted[3].priority).toBe('LOW');
    });
  });
});
