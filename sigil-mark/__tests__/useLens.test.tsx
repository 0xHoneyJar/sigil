/**
 * Sigil v2.0 — useLens Hook Tests
 *
 * Tests zone-aware lens resolution and enforcement.
 *
 * @module __tests__/useLens.test
 */

import React from 'react';
import { renderHook } from '@testing-library/react';
import { useLens, registerDefaultLens, registerStrictLens } from '../lenses/useLens';
import { LensProvider } from '../lenses/LensProvider';
import { ZoneContext } from '../layouts/context';
import type { Lens } from '../lenses/types';
import type { ZoneContextValue } from '../layouts/context';

// =============================================================================
// TEST LENSES
// =============================================================================

const TestDefaultLens: Lens = {
  name: 'TestDefaultLens',
  classification: 'cosmetic',
  CriticalButton: () => null,
  GlassButton: () => null,
  MachineryItem: () => null,
};

const TestStrictLens: Lens = {
  name: 'TestStrictLens',
  classification: 'cosmetic',
  CriticalButton: () => null,
  GlassButton: () => null,
  MachineryItem: () => null,
};

const TestUserLens: Lens = {
  name: 'TestUserLens',
  classification: 'cosmetic',
  CriticalButton: () => null,
  GlassButton: () => null,
  MachineryItem: () => null,
};

// =============================================================================
// SETUP
// =============================================================================

beforeAll(() => {
  // Register test lenses
  registerDefaultLens(TestDefaultLens);
  registerStrictLens(TestStrictLens);
});

// =============================================================================
// BASIC RESOLUTION TESTS
// =============================================================================

describe('useLens', () => {
  describe('basic lens resolution', () => {
    it('returns DefaultLens when no context or preference', () => {
      const { result } = renderHook(() => useLens());
      expect(result.current.name).toBe('TestDefaultLens');
    });

    it('returns user preference when LensProvider is present', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LensProvider initialLens={TestUserLens}>{children}</LensProvider>
      );

      const { result } = renderHook(() => useLens(), { wrapper });
      expect(result.current.name).toBe('TestUserLens');
    });

    it('returns DefaultLens when LensProvider has no initial lens', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LensProvider>{children}</LensProvider>
      );

      const { result } = renderHook(() => useLens(), { wrapper });
      expect(result.current.name).toBe('TestDefaultLens');
    });
  });

  // ===========================================================================
  // ZONE ENFORCEMENT TESTS
  // ===========================================================================

  describe('zone enforcement', () => {
    it('forces StrictLens in critical+financial zone', () => {
      const criticalFinancialZone: ZoneContextValue = {
        type: 'critical',
        financial: true,
        timeAuthority: 'server-tick',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ZoneContext.Provider value={criticalFinancialZone}>
          <LensProvider initialLens={TestUserLens}>{children}</LensProvider>
        </ZoneContext.Provider>
      );

      const { result } = renderHook(() => useLens(), { wrapper });
      expect(result.current.name).toBe('TestStrictLens');
    });

    it('does not force StrictLens in critical non-financial zone', () => {
      const criticalNonFinancialZone: ZoneContextValue = {
        type: 'critical',
        financial: false,
        timeAuthority: 'server-tick',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ZoneContext.Provider value={criticalNonFinancialZone}>
          <LensProvider initialLens={TestUserLens}>{children}</LensProvider>
        </ZoneContext.Provider>
      );

      const { result } = renderHook(() => useLens(), { wrapper });
      expect(result.current.name).toBe('TestUserLens');
    });

    it('uses user preference in admin zone', () => {
      const adminZone: ZoneContextValue = {
        type: 'admin',
        timeAuthority: 'optimistic',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ZoneContext.Provider value={adminZone}>
          <LensProvider initialLens={TestUserLens}>{children}</LensProvider>
        </ZoneContext.Provider>
      );

      const { result } = renderHook(() => useLens(), { wrapper });
      expect(result.current.name).toBe('TestUserLens');
    });

    it('uses user preference in marketing zone', () => {
      const marketingZone: ZoneContextValue = {
        type: 'marketing',
        timeAuthority: 'optimistic',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ZoneContext.Provider value={marketingZone}>
          <LensProvider initialLens={TestUserLens}>{children}</LensProvider>
        </ZoneContext.Provider>
      );

      const { result } = renderHook(() => useLens(), { wrapper });
      expect(result.current.name).toBe('TestUserLens');
    });

    it('uses DefaultLens in marketing zone with no preference', () => {
      const marketingZone: ZoneContextValue = {
        type: 'marketing',
        timeAuthority: 'optimistic',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ZoneContext.Provider value={marketingZone}>
          <LensProvider>{children}</LensProvider>
        </ZoneContext.Provider>
      );

      const { result } = renderHook(() => useLens(), { wrapper });
      expect(result.current.name).toBe('TestDefaultLens');
    });
  });

  // ===========================================================================
  // OVERRIDE ZONE TESTS
  // ===========================================================================

  describe('overrideZone option', () => {
    it('uses overrideZone instead of context', () => {
      const adminZone: ZoneContextValue = {
        type: 'admin',
        timeAuthority: 'optimistic',
      };

      const criticalFinancialOverride: ZoneContextValue = {
        type: 'critical',
        financial: true,
        timeAuthority: 'server-tick',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ZoneContext.Provider value={adminZone}>
          <LensProvider initialLens={TestUserLens}>{children}</LensProvider>
        </ZoneContext.Provider>
      );

      const { result } = renderHook(
        () => useLens({ overrideZone: criticalFinancialOverride }),
        { wrapper }
      );

      // Should be StrictLens because override is critical+financial
      expect(result.current.name).toBe('TestStrictLens');
    });

    it('allows admin zone override in critical context', () => {
      const criticalFinancialZone: ZoneContextValue = {
        type: 'critical',
        financial: true,
        timeAuthority: 'server-tick',
      };

      const adminOverride: ZoneContextValue = {
        type: 'admin',
        timeAuthority: 'optimistic',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ZoneContext.Provider value={criticalFinancialZone}>
          <LensProvider initialLens={TestUserLens}>{children}</LensProvider>
        </ZoneContext.Provider>
      );

      const { result } = renderHook(
        () => useLens({ overrideZone: adminOverride }),
        { wrapper }
      );

      // Should be UserLens because override is admin (not critical+financial)
      expect(result.current.name).toBe('TestUserLens');
    });
  });

  // ===========================================================================
  // DEFAULT ZONE TESTS
  // ===========================================================================

  describe('default zone handling', () => {
    it('uses DefaultLens in default zone with no preference', () => {
      const defaultZone: ZoneContextValue = {
        type: 'default',
        timeAuthority: 'optimistic',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ZoneContext.Provider value={defaultZone}>
          <LensProvider>{children}</LensProvider>
        </ZoneContext.Provider>
      );

      const { result } = renderHook(() => useLens(), { wrapper });
      expect(result.current.name).toBe('TestDefaultLens');
    });

    it('uses user preference in default zone', () => {
      const defaultZone: ZoneContextValue = {
        type: 'default',
        timeAuthority: 'optimistic',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ZoneContext.Provider value={defaultZone}>
          <LensProvider initialLens={TestUserLens}>{children}</LensProvider>
        </ZoneContext.Provider>
      );

      const { result } = renderHook(() => useLens(), { wrapper });
      expect(result.current.name).toBe('TestUserLens');
    });
  });

  // ===========================================================================
  // ENFORCEMENT LOGGING TESTS
  // ===========================================================================

  describe('enforcement logging', () => {
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it('logs warning when forcing StrictLens in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const criticalFinancialZone: ZoneContextValue = {
        type: 'critical',
        financial: true,
        timeAuthority: 'server-tick',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ZoneContext.Provider value={criticalFinancialZone}>
          <LensProvider initialLens={TestUserLens}>{children}</LensProvider>
        </ZoneContext.Provider>
      );

      renderHook(() => useLens(), { wrapper });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Sigil useLens] Lens enforcement:')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Forcing TestStrictLens')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Financial zone requires StrictLens')
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('does not log when StrictLens matches user preference', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const criticalFinancialZone: ZoneContextValue = {
        type: 'critical',
        financial: true,
        timeAuthority: 'server-tick',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ZoneContext.Provider value={criticalFinancialZone}>
          <LensProvider initialLens={TestStrictLens}>{children}</LensProvider>
        </ZoneContext.Provider>
      );

      renderHook(() => useLens(), { wrapper });

      // Should not warn when requested lens matches enforced lens
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('does not log in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const criticalFinancialZone: ZoneContextValue = {
        type: 'critical',
        financial: true,
        timeAuthority: 'server-tick',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ZoneContext.Provider value={criticalFinancialZone}>
          <LensProvider initialLens={TestUserLens}>{children}</LensProvider>
        </ZoneContext.Provider>
      );

      renderHook(() => useLens(), { wrapper });

      expect(consoleWarnSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  // ===========================================================================
  // COMPETITIVE ZONE TESTS
  // ===========================================================================

  describe('competitive zone handling', () => {
    it('does not force StrictLens for competitive flag alone', () => {
      const competitiveZone: ZoneContextValue = {
        type: 'admin',
        competitive: true,
        timeAuthority: 'optimistic',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ZoneContext.Provider value={competitiveZone}>
          <LensProvider initialLens={TestUserLens}>{children}</LensProvider>
        </ZoneContext.Provider>
      );

      const { result } = renderHook(() => useLens(), { wrapper });
      // Competitive alone does not force StrictLens
      expect(result.current.name).toBe('TestUserLens');
    });

    it('forces StrictLens for critical+financial+competitive', () => {
      const allFlagsZone: ZoneContextValue = {
        type: 'critical',
        financial: true,
        competitive: true,
        timeAuthority: 'server-tick',
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ZoneContext.Provider value={allFlagsZone}>
          <LensProvider initialLens={TestUserLens}>{children}</LensProvider>
        </ZoneContext.Provider>
      );

      const { result } = renderHook(() => useLens(), { wrapper });
      expect(result.current.name).toBe('TestStrictLens');
    });
  });
});

// =============================================================================
// LENSPROVIDER TESTS
// =============================================================================

describe('LensProvider', () => {
  it('provides lens preference to children', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LensProvider initialLens={TestUserLens}>{children}</LensProvider>
    );

    const { result } = renderHook(() => useLens(), { wrapper });
    expect(result.current.name).toBe('TestUserLens');
  });

  it('allows nested LensProviders', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LensProvider initialLens={TestDefaultLens}>
        <LensProvider initialLens={TestUserLens}>{children}</LensProvider>
      </LensProvider>
    );

    const { result } = renderHook(() => useLens(), { wrapper });
    // Should get the inner provider's lens
    expect(result.current.name).toBe('TestUserLens');
  });
});
