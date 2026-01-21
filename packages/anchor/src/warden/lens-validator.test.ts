/**
 * LensValidator Tests
 */

import { describe, it, expect } from 'vitest';
import {
  validateLensContext,
  isLensContextValid,
  getLensExitCode,
  validateMultipleLensContexts,
} from './lens-validator.js';
import type { LensContext } from '../types.js';
import { LensExitCode } from '../types.js';

describe('LensValidator', () => {
  describe('validateLensContext', () => {
    it('passes when all values match', () => {
      const context: LensContext = {
        impersonatedAddress: '0x1234567890abcdef1234567890abcdef12345678',
        component: 'BalanceDisplay',
        observedValue: '1000',
        onChainValue: '1000',
        indexedValue: '1000',
        dataSource: 'on-chain',
      };

      const result = validateLensContext(context, 'standard');
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('detects data source mismatch (observed != on_chain)', () => {
      const context: LensContext = {
        impersonatedAddress: '0x1234567890abcdef1234567890abcdef12345678',
        component: 'BalanceDisplay',
        observedValue: '900',
        onChainValue: '1000',
        dataSource: 'on-chain',
      };

      const result = validateLensContext(context, 'critical');
      expect(result.valid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('data_source_mismatch');
      expect(result.issues[0].severity).toBe('error');
      expect(result.issues[0].expected).toBe('1000');
      expect(result.issues[0].actual).toBe('900');
    });

    it('detects stale indexed data (indexed != on_chain)', () => {
      const context: LensContext = {
        impersonatedAddress: '0x1234567890abcdef1234567890abcdef12345678',
        component: 'StakeHistory',
        observedValue: '1000',
        onChainValue: '1000',
        indexedValue: '800',
        dataSource: 'mixed',
      };

      const result = validateLensContext(context, 'elevated');
      expect(result.valid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('stale_indexed_data');
      expect(result.issues[0].severity).toBe('error');
    });

    it('detects financial zone using indexed data source', () => {
      const context: LensContext = {
        impersonatedAddress: '0x1234567890abcdef1234567890abcdef12345678',
        component: 'ClaimButton',
        dataSource: 'indexed',
      };

      const result = validateLensContext(context, 'critical');
      expect(result.valid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('lens_financial_check');
      expect(result.issues[0].severity).toBe('error');
      expect(result.issues[0].suggestion).toContain('on-chain data');
    });

    it('allows indexed data for non-critical zones', () => {
      const context: LensContext = {
        impersonatedAddress: '0x1234567890abcdef1234567890abcdef12345678',
        component: 'ActivityFeed',
        dataSource: 'indexed',
      };

      const result = validateLensContext(context, 'standard');
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('detects impersonation address leak', () => {
      const context: LensContext = {
        impersonatedAddress: '0xAAAA567890abcdef1234567890abcdef12345678',
        realAddress: '0xBBBB567890abcdef1234567890abcdef12345678',
        component: 'ProfileHeader',
        observedValue: 'Address: 0xBBBB567890abcdef1234567890abcdef12345678',
      };

      const result = validateLensContext(context);
      expect(result.valid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('impersonation_leak');
      expect(result.issues[0].expected).toBe('0xAAAA567890abcdef1234567890abcdef12345678');
    });

    it('handles BigInt string normalization', () => {
      const context: LensContext = {
        impersonatedAddress: '0x1234567890abcdef1234567890abcdef12345678',
        component: 'TokenBalance',
        observedValue: '1000000000000000000n',
        onChainValue: '1000000000000000000',
        dataSource: 'on-chain',
      };

      const result = validateLensContext(context, 'critical');
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('handles hex value normalization (case insensitive)', () => {
      const context: LensContext = {
        impersonatedAddress: '0x1234567890abcdef1234567890abcdef12345678',
        component: 'AddressDisplay',
        observedValue: '0xABCD1234',
        onChainValue: '0xabcd1234',
        dataSource: 'on-chain',
      };

      const result = validateLensContext(context);
      expect(result.valid).toBe(true);
    });

    it('handles decimal precision normalization', () => {
      const context: LensContext = {
        impersonatedAddress: '0x1234567890abcdef1234567890abcdef12345678',
        component: 'PriceDisplay',
        observedValue: '1.00',
        onChainValue: '1',
        dataSource: 'on-chain',
      };

      const result = validateLensContext(context);
      expect(result.valid).toBe(true);
    });

    it('returns multiple issues when multiple checks fail', () => {
      const context: LensContext = {
        impersonatedAddress: '0xAAAA567890abcdef1234567890abcdef12345678',
        realAddress: '0xBBBB567890abcdef1234567890abcdef12345678',
        component: 'FinancialSummary',
        observedValue: '0xBBBB567890abcdef1234567890abcdef12345678: 500',
        onChainValue: '1000',
        indexedValue: '800',
        dataSource: 'indexed',
      };

      const result = validateLensContext(context, 'critical');
      expect(result.valid).toBe(false);
      // Should detect: data_source_mismatch, stale_indexed_data, lens_financial_check, impersonation_leak
      expect(result.issues.length).toBeGreaterThanOrEqual(3);
    });

    it('sets correct severity based on zone', () => {
      const context: LensContext = {
        impersonatedAddress: '0x1234567890abcdef1234567890abcdef12345678',
        component: 'Display',
        observedValue: '100',
        onChainValue: '200',
        dataSource: 'on-chain',
      };

      // Critical zone = error severity
      const criticalResult = validateLensContext(context, 'critical');
      expect(criticalResult.issues[0].severity).toBe('error');

      // Standard zone = warning severity
      const standardResult = validateLensContext(context, 'standard');
      expect(standardResult.issues[0].severity).toBe('warning');

      // Local zone = info severity
      const localResult = validateLensContext(context, 'local');
      expect(localResult.issues[0].severity).toBe('info');
    });
  });

  describe('isLensContextValid', () => {
    it('returns true for valid context', () => {
      const context: LensContext = {
        impersonatedAddress: '0x1234567890abcdef1234567890abcdef12345678',
        component: 'Test',
        observedValue: '100',
        onChainValue: '100',
        dataSource: 'on-chain',
      };

      expect(isLensContextValid(context, 'critical')).toBe(true);
    });

    it('returns false for invalid context', () => {
      const context: LensContext = {
        impersonatedAddress: '0x1234567890abcdef1234567890abcdef12345678',
        component: 'Test',
        dataSource: 'indexed',
      };

      expect(isLensContextValid(context, 'critical')).toBe(false);
    });
  });

  describe('getLensExitCode', () => {
    it('returns PASS for valid result with no issues', () => {
      const result = {
        valid: true,
        issues: [],
        summary: 'All checks passed',
      };

      expect(getLensExitCode(result)).toBe(LensExitCode.PASS);
    });

    it('returns LENS_ERROR for errors', () => {
      const result = {
        valid: false,
        issues: [{
          type: 'data_source_mismatch' as const,
          severity: 'error' as const,
          message: 'Mismatch',
          component: 'Test',
        }],
        summary: 'Errors found',
      };

      expect(getLensExitCode(result)).toBe(LensExitCode.LENS_ERROR);
    });

    it('returns LENS_WARNING for warnings only', () => {
      const result = {
        valid: true,
        issues: [{
          type: 'data_source_mismatch' as const,
          severity: 'warning' as const,
          message: 'Mismatch',
          component: 'Test',
        }],
        summary: 'Warnings found',
      };

      expect(getLensExitCode(result)).toBe(LensExitCode.LENS_WARNING);
    });

    it('returns PASS for info only', () => {
      const result = {
        valid: true,
        issues: [{
          type: 'data_source_mismatch' as const,
          severity: 'info' as const,
          message: 'Info',
          component: 'Test',
        }],
        summary: 'Info found',
      };

      expect(getLensExitCode(result)).toBe(LensExitCode.PASS);
    });
  });

  describe('validateMultipleLensContexts', () => {
    it('validates multiple contexts and aggregates issues', () => {
      const contexts = [
        {
          context: {
            impersonatedAddress: '0x1234567890abcdef1234567890abcdef12345678',
            component: 'Component1',
            observedValue: '100',
            onChainValue: '100',
            dataSource: 'on-chain' as const,
          },
          zone: 'standard' as const,
        },
        {
          context: {
            impersonatedAddress: '0x1234567890abcdef1234567890abcdef12345678',
            component: 'Component2',
            observedValue: '200',
            onChainValue: '300',
            dataSource: 'on-chain' as const,
          },
          zone: 'critical' as const,
        },
      ];

      const result = validateMultipleLensContexts(contexts);
      expect(result.valid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].component).toBe('Component2');
      expect(result.summary).toContain('2 contexts');
    });

    it('returns valid when all contexts pass', () => {
      const contexts = [
        {
          context: {
            impersonatedAddress: '0x1234567890abcdef1234567890abcdef12345678',
            component: 'Component1',
            observedValue: '100',
            onChainValue: '100',
            dataSource: 'on-chain' as const,
          },
          zone: 'critical' as const,
        },
        {
          context: {
            impersonatedAddress: '0x1234567890abcdef1234567890abcdef12345678',
            component: 'Component2',
            observedValue: '200',
            onChainValue: '200',
            dataSource: 'on-chain' as const,
          },
          zone: 'standard' as const,
        },
      ];

      const result = validateMultipleLensContexts(contexts);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.summary).toContain('successfully');
    });
  });
});
