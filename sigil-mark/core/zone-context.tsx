'use client';

/**
 * Sigil v3.0 — Zone Context (Runtime)
 *
 * React context for runtime zone management.
 * Integrates with PersonaContext to provide persona-aware zone configuration.
 *
 * IMPORTANT: This is a RUNTIME component. Zone configuration comes from
 * Layout components, not file paths.
 *
 * Philosophy: "Same feature, different truth. Not simplified - just appropriate."
 *
 * @module core/zone-context
 */

import React, {
  createContext,
  useContext,
  useMemo,
} from 'react';
import {
  usePersona,
  getEffectivePreferences,
  type PersonaId,
  type PersonaPreferences,
  type LensType,
  type ZoneConfig,
  type ZonePersonaOverride,
} from './persona-context';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Zone type.
 */
export type ZoneType = 'critical' | 'admin' | 'marketing' | 'default';

/**
 * Time authority mode.
 */
export type TimeAuthority = 'server-tick' | 'optimistic' | 'hybrid';

/**
 * Zone context value.
 */
export interface ZoneContextValue {
  /** Current zone type */
  zone: ZoneType;
  /** Time authority for this zone */
  timeAuthority: TimeAuthority;
  /** Whether this is a financial zone (critical + financial flag) */
  isFinancial: boolean;
  /** Current persona in this zone */
  currentPersona: PersonaId;
  /** Effective preferences (persona + zone overrides) */
  effectivePreferences: PersonaPreferences & { effectiveLens?: LensType };
  /** Zone-level constraints */
  constraints: Record<string, string>;
  /** Persona overrides for this zone */
  personaOverrides: Record<PersonaId, ZonePersonaOverride>;
}

/**
 * Props for ZoneProvider.
 */
export interface ZoneProviderProps {
  /** Children to render */
  children: React.ReactNode;
  /** Zone type */
  zone: ZoneType;
  /** Time authority mode */
  timeAuthority?: TimeAuthority;
  /** Whether this is a financial zone */
  financial?: boolean;
  /** Zone constraints */
  constraints?: Record<string, string>;
  /** Persona-specific overrides for this zone */
  personaOverrides?: Record<PersonaId, ZonePersonaOverride>;
}

// =============================================================================
// DEFAULTS
// =============================================================================

/**
 * Default zone context value.
 */
const defaultContextValue: ZoneContextValue = {
  zone: 'default',
  timeAuthority: 'optimistic',
  isFinancial: false,
  currentPersona: 'newcomer',
  effectivePreferences: {
    motion: 'warm',
    help: 'contextual',
    density: 'medium',
  },
  constraints: {},
  personaOverrides: {},
};

/**
 * Default constraints by zone.
 */
const DEFAULT_ZONE_CONSTRAINTS: Record<ZoneType, Record<string, string>> = {
  critical: {
    optimistic_ui: 'forbidden',
    loading_spinners: 'warn',
    animations: 'warn',
  },
  admin: {
    raw_physics: 'allowed',
  },
  marketing: {},
  default: {},
};

/**
 * Default time authority by zone.
 */
const DEFAULT_ZONE_TIME_AUTHORITY: Record<ZoneType, TimeAuthority> = {
  critical: 'server-tick',
  admin: 'optimistic',
  marketing: 'optimistic',
  default: 'optimistic',
};

// =============================================================================
// CONTEXT
// =============================================================================

/**
 * Zone context.
 */
export const ZoneContext = createContext<ZoneContextValue>(defaultContextValue);

/**
 * Provider component for zone context.
 *
 * Integrates with PersonaContext to provide persona-aware zone configuration.
 *
 * @example
 * ```tsx
 * <ZoneProvider
 *   zone="critical"
 *   financial
 *   personaOverrides={{
 *     newcomer: { lens: 'guided', help: 'always' },
 *   }}
 * >
 *   <WithdrawForm />
 * </ZoneProvider>
 * ```
 */
export function ZoneProvider({
  children,
  zone,
  timeAuthority,
  financial = false,
  constraints,
  personaOverrides = {},
}: ZoneProviderProps): JSX.Element {
  // Get persona context
  const { currentPersona, preferences } = usePersona();

  // Resolve effective time authority
  const effectiveTimeAuthority = timeAuthority ?? DEFAULT_ZONE_TIME_AUTHORITY[zone];

  // Resolve effective constraints
  const effectiveConstraints = useMemo(() => {
    return { ...DEFAULT_ZONE_CONSTRAINTS[zone], ...constraints };
  }, [zone, constraints]);

  // Build zone config for getEffectivePreferences
  const zoneConfig: ZoneConfig = useMemo(() => ({
    layout: zone,
    timeAuthority: effectiveTimeAuthority,
    lens: 'user-preference',
    constraints: effectiveConstraints,
    persona_overrides: personaOverrides,
  }), [zone, effectiveTimeAuthority, effectiveConstraints, personaOverrides]);

  // Get effective preferences with zone overrides
  const effectivePreferences = useMemo(() => {
    return getEffectivePreferences(preferences, zoneConfig, currentPersona);
  }, [preferences, zoneConfig, currentPersona]);

  // Context value
  const value = useMemo<ZoneContextValue>(
    () => ({
      zone,
      timeAuthority: effectiveTimeAuthority,
      isFinancial: zone === 'critical' && financial,
      currentPersona,
      effectivePreferences,
      constraints: effectiveConstraints,
      personaOverrides,
    }),
    [zone, effectiveTimeAuthority, financial, currentPersona, effectivePreferences, effectiveConstraints, personaOverrides]
  );

  return <ZoneContext.Provider value={value}>{children}</ZoneContext.Provider>;
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to access zone context.
 *
 * Returns sensible defaults if used outside ZoneProvider.
 *
 * @returns Zone context value
 */
export function useZone(): ZoneContextValue {
  return useContext(ZoneContext);
}

/**
 * Hook to check if in a specific zone.
 *
 * @param zone - Zone to check
 * @returns True if currently in that zone
 */
export function useIsZone(zone: ZoneType): boolean {
  const { zone: currentZone } = useZone();
  return currentZone === zone;
}

/**
 * Hook to check if in a financial zone.
 *
 * @returns True if in a financial zone
 */
export function useIsFinancialZone(): boolean {
  const { isFinancial } = useZone();
  return isFinancial;
}

/**
 * Hook to get effective preferences for current zone and persona.
 *
 * @returns Effective preferences with zone overrides applied
 */
export function useZonePreferences(): PersonaPreferences & { effectiveLens?: LensType } {
  const { effectivePreferences } = useZone();
  return effectivePreferences;
}

/**
 * Hook to check if a constraint is forbidden in current zone.
 *
 * @param constraint - Constraint name to check
 * @returns True if constraint is forbidden
 */
export function useIsConstraintForbidden(constraint: string): boolean {
  const { constraints } = useZone();
  return constraints[constraint] === 'forbidden';
}

/**
 * Hook to check if a constraint should warn in current zone.
 *
 * @param constraint - Constraint name to check
 * @returns True if constraint should warn
 */
export function useIsConstraintWarned(constraint: string): boolean {
  const { constraints } = useZone();
  return constraints[constraint] === 'warn';
}

// =============================================================================
// LAYOUT COMPONENTS
// =============================================================================

/**
 * Props for CriticalZone layout.
 */
export interface CriticalZoneProps {
  /** Children to render */
  children: React.ReactNode;
  /** Whether this zone handles financial transactions */
  financial?: boolean;
  /** Additional constraints */
  constraints?: Record<string, string>;
  /** Persona overrides */
  personaOverrides?: Record<PersonaId, ZonePersonaOverride>;
}

/**
 * CriticalZone layout component.
 *
 * Wraps content in a critical zone context.
 * Forces server-tick time authority and strict constraints.
 *
 * @example
 * ```tsx
 * <CriticalZone financial>
 *   <WithdrawForm />
 * </CriticalZone>
 * ```
 */
export function CriticalZone({
  children,
  financial = false,
  constraints,
  personaOverrides,
}: CriticalZoneProps): JSX.Element {
  return (
    <ZoneProvider
      zone="critical"
      timeAuthority="server-tick"
      financial={financial}
      constraints={constraints}
      personaOverrides={personaOverrides}
    >
      {children}
    </ZoneProvider>
  );
}

/**
 * Props for MachineryLayout.
 */
export interface MachineryLayoutProps {
  /** Children to render */
  children: React.ReactNode;
  /** Additional constraints */
  constraints?: Record<string, string>;
  /** Persona overrides */
  personaOverrides?: Record<PersonaId, ZonePersonaOverride>;
}

/**
 * MachineryLayout component.
 *
 * Wraps content in an admin zone context.
 * Keyboard-driven with raw physics allowed.
 *
 * @example
 * ```tsx
 * <MachineryLayout>
 *   <AdminDashboard />
 * </MachineryLayout>
 * ```
 */
export function MachineryLayout({
  children,
  constraints,
  personaOverrides,
}: MachineryLayoutProps): JSX.Element {
  return (
    <ZoneProvider
      zone="admin"
      timeAuthority="optimistic"
      constraints={constraints}
      personaOverrides={personaOverrides}
    >
      {children}
    </ZoneProvider>
  );
}

/**
 * Props for GlassLayout.
 */
export interface GlassLayoutProps {
  /** Children to render */
  children: React.ReactNode;
  /** Layout variant */
  variant?: 'card' | 'hero' | 'showcase';
  /** Additional constraints */
  constraints?: Record<string, string>;
  /** Persona overrides */
  personaOverrides?: Record<PersonaId, ZonePersonaOverride>;
}

/**
 * GlassLayout component.
 *
 * Wraps content in a marketing zone context.
 * Hover-driven with playful interactions.
 *
 * @example
 * ```tsx
 * <GlassLayout variant="hero">
 *   <HeroSection />
 * </GlassLayout>
 * ```
 */
export function GlassLayout({
  children,
  constraints,
  personaOverrides,
}: GlassLayoutProps): JSX.Element {
  return (
    <ZoneProvider
      zone="marketing"
      timeAuthority="optimistic"
      constraints={constraints}
      personaOverrides={personaOverrides}
    >
      {children}
    </ZoneProvider>
  );
}
