/**
 * GroundingGate Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseGroundingStatement,
  validateGrounding,
  isGroundingValid,
  getExitCode,
} from './grounding-gate.js';
import { clearPhysicsCache } from './physics-loader.js';
import { clearVocabularyCache } from './vocabulary-loader.js';

describe('GroundingGate', () => {
  beforeEach(() => {
    clearPhysicsCache();
    clearVocabularyCache();
  });

  describe('parseGroundingStatement', () => {
    it('extracts component name', () => {
      const statement = parseGroundingStatement('Component: ClaimButton');
      expect(statement.component).toBe('ClaimButton');
    });

    it('extracts component from button pattern', () => {
      const statement = parseGroundingStatement('Generating "ClaimButton" component');
      expect(statement.component).toBe('ClaimButton');
    });

    it('extracts zone', () => {
      const statement = parseGroundingStatement('Zone: critical');
      expect(statement.citedZone).toBe('critical');
    });

    it('extracts effect', () => {
      const statement = parseGroundingStatement('Effect: Financial mutation');
      expect(statement.inferredEffect).toBe('financial');
    });

    it('extracts sync strategy', () => {
      const statement = parseGroundingStatement('Sync: pessimistic');
      expect(statement.claimedPhysics.sync).toBe('pessimistic');
    });

    it('extracts timing', () => {
      const statement = parseGroundingStatement('Timing: 800ms');
      expect(statement.claimedPhysics.timing).toBe(800);
    });

    it('extracts confirmation', () => {
      const statement = parseGroundingStatement('Confirmation: required');
      expect(statement.claimedPhysics.confirmation).toBe('required');
    });

    it('extracts keywords', () => {
      const statement = parseGroundingStatement('This is a claim button for deposit');
      expect(statement.detectedKeywords).toContain('claim');
      expect(statement.detectedKeywords).toContain('deposit');
    });

    it('parses physics analysis box', () => {
      const text = `
┌─ Physics Analysis ─────────────────────────────────────┐
│  Component:    ClaimButton                             │
│  Effect:       Financial mutation                      │
│  Zone:         critical                                │
│  Sync:         pessimistic                             │
│  Timing:       800ms                                   │
│  Confirmation: required                                │
└────────────────────────────────────────────────────────┘
`;
      const statement = parseGroundingStatement(text);

      expect(statement.component).toBe('ClaimButton');
      expect(statement.inferredEffect).toBe('financial');
      expect(statement.citedZone).toBe('critical');
      expect(statement.claimedPhysics.sync).toBe('pessimistic');
      expect(statement.claimedPhysics.timing).toBe(800);
      expect(statement.claimedPhysics.confirmation).toBe('required');
    });

    it('detects inline physics mentions', () => {
      const statement = parseGroundingStatement(
        'Using pessimistic sync with 800ms timing for this financial operation'
      );

      expect(statement.claimedPhysics.sync).toBe('pessimistic');
      expect(statement.claimedPhysics.timing).toBe(800);
      expect(statement.detectedKeywords).toContain('financial');
    });

    it('preserves raw statement', () => {
      const text = 'Test statement';
      const statement = parseGroundingStatement(text);
      expect(statement.raw).toBe(text);
    });
  });

  describe('validateGrounding', () => {
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
      const result = await validateGrounding(text);

      expect(result.status).toBe('VALID');
      expect(result.checks.relevance.passed).toBe(true);
      expect(result.checks.hierarchy.passed).toBe(true);
      expect(result.checks.rules.passed).toBe(true);
    });

    it('detects zone hierarchy violation', async () => {
      const text = `
Component: ClaimButton
Zone: local
Effect: Financial
Keywords: claim
`;
      const result = await validateGrounding(text);

      expect(result.status).toBe('DECEPTIVE');
      expect(result.checks.hierarchy.passed).toBe(false);
      expect(result.requiredZone).toBe('critical');
      expect(result.citedZone).toBe('local');
    });

    it('detects missing zone as drift', async () => {
      const text = `
Component: ClaimButton
Effect: Financial
Keywords: claim
`;
      const result = await validateGrounding(text);

      expect(result.status).toBe('DECEPTIVE');
      expect(result.checks.hierarchy.passed).toBe(false);
    });

    it('validates destructive grounding', async () => {
      const text = `
Component: DeleteButton
Zone: elevated
Effect: Destructive
Sync: pessimistic
Timing: 600ms
Confirmation: required
Keywords: delete
`;
      const result = await validateGrounding(text);

      expect(result.status).toBe('VALID');
      expect(result.requiredZone).toBe('elevated');
    });

    it('validates standard grounding', async () => {
      const text = `
Component: SaveButton
Zone: standard
Effect: Standard
Sync: optimistic
Timing: 200ms
Keywords: save
`;
      const result = await validateGrounding(text);

      expect(result.status).toBe('VALID');
      expect(result.requiredZone).toBe('standard');
    });

    it('validates local grounding', async () => {
      const text = `
Component: ThemeToggle
Zone: local
Effect: Local
Sync: immediate
Timing: 100ms
Keywords: toggle
`;
      const result = await validateGrounding(text);

      expect(result.status).toBe('VALID');
      expect(result.requiredZone).toBe('local');
    });

    it('allows more restrictive zone than required', async () => {
      // Using critical zone for standard effect is OK (more restrictive)
      const text = `
Component: SaveButton
Zone: elevated
Effect: Standard
Sync: pessimistic
Timing: 200ms
Keywords: save
`;
      const result = await validateGrounding(text);

      // Hierarchy check should pass (elevated is more restrictive than standard)
      expect(result.checks.hierarchy.passed).toBe(true);
    });

    it('detects drift when no relevant keywords', async () => {
      const text = `
Component: RandomComponent
Zone: standard
`;
      const result = await validateGrounding(text);

      expect(result.status).toBe('DRIFT');
      expect(result.checks.relevance.passed).toBe(false);
    });

    it('provides correction message for violations', async () => {
      const text = `
Component: ClaimButton
Zone: local
Keywords: claim
`;
      const result = await validateGrounding(text);

      expect(result.correction).toBeDefined();
      expect(result.correction).toContain('local');
      expect(result.correction).toContain('critical');
    });
  });

  describe('isGroundingValid', () => {
    it('returns true for valid grounding', async () => {
      const text = `
Component: ClaimButton
Zone: critical
Sync: pessimistic
Timing: 800ms
Confirmation: required
Keywords: claim
`;
      const valid = await isGroundingValid(text);
      expect(valid).toBe(true);
    });

    it('returns false for invalid grounding', async () => {
      const text = `
Component: ClaimButton
Zone: local
Keywords: claim
`;
      const valid = await isGroundingValid(text);
      expect(valid).toBe(false);
    });
  });

  describe('getExitCode', () => {
    it('returns 0 for VALID', () => {
      const result = {
        status: 'VALID' as const,
        checks: {
          relevance: { passed: true, reason: '' },
          hierarchy: { passed: true, reason: '' },
          rules: { passed: true, reason: '' },
        },
        requiredZone: 'standard' as const,
        citedZone: 'standard' as const,
      };

      expect(getExitCode(result)).toBe(0);
    });

    it('returns 1 for DRIFT', () => {
      const result = {
        status: 'DRIFT' as const,
        checks: {
          relevance: { passed: false, reason: '' },
          hierarchy: { passed: true, reason: '' },
          rules: { passed: true, reason: '' },
        },
        requiredZone: 'standard' as const,
        citedZone: 'standard' as const,
      };

      expect(getExitCode(result)).toBe(1);
    });

    it('returns 2 for DECEPTIVE', () => {
      const result = {
        status: 'DECEPTIVE' as const,
        checks: {
          relevance: { passed: true, reason: '' },
          hierarchy: { passed: false, reason: '' },
          rules: { passed: true, reason: '' },
        },
        requiredZone: 'critical' as const,
        citedZone: 'local' as const,
      };

      expect(getExitCode(result)).toBe(2);
    });
  });

  describe('keyword detection', () => {
    it('detects financial keywords', async () => {
      const cases = ['claim', 'deposit', 'withdraw', 'stake', 'swap', 'mint'];

      for (const keyword of cases) {
        const result = await validateGrounding(`Component: Test\nZone: critical\nKeywords: ${keyword}`);
        expect(result.requiredZone).toBe('critical');
      }
    });

    it('detects destructive keywords', async () => {
      const cases = ['delete', 'remove', 'destroy', 'revoke'];

      for (const keyword of cases) {
        const result = await validateGrounding(`Component: Test\nZone: elevated\nKeywords: ${keyword}`);
        expect(result.requiredZone).toBe('elevated');
      }
    });

    it('detects standard keywords', async () => {
      const cases = ['save', 'update', 'edit', 'create', 'like'];

      for (const keyword of cases) {
        const result = await validateGrounding(`Component: Test\nZone: standard\nKeywords: ${keyword}`);
        expect(result.requiredZone).toBe('standard');
      }
    });

    it('detects local keywords', async () => {
      const cases = ['toggle', 'switch', 'expand', 'collapse'];

      for (const keyword of cases) {
        const result = await validateGrounding(`Component: Test\nZone: local\nKeywords: ${keyword}`);
        expect(result.requiredZone).toBe('local');
      }
    });
  });
});
