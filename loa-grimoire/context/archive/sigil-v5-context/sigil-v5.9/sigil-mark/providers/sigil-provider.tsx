/**
 * SigilProvider - Runtime context for zones and personas
 * 
 * Provides context for useSigilMutation to resolve physics.
 * 
 * @sigil-tier gold
 * @sigil-zone standard
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface SigilContextValue {
  zone: string;
  persona: string;
  vibes?: {
    timing_modifier?: number;
    seasonal_theme?: string;
  };
}

export interface SigilProviderProps {
  children: ReactNode;
  
  /** Current zone (can be overridden by ZoneLayout components) */
  zone?: string;
  
  /** Current user persona */
  persona?: string;
  
  /** Remote vibes (from feature flags, A/B tests) */
  vibes?: SigilContextValue['vibes'];
}

// ============================================================================
// Context
// ============================================================================

export const SigilContext = createContext<SigilContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export function SigilProvider({
  children,
  zone = 'standard',
  persona = 'default',
  vibes,
}: SigilProviderProps) {
  const value = useMemo<SigilContextValue>(
    () => ({
      zone,
      persona,
      vibes,
    }),
    [zone, persona, vibes]
  );
  
  return (
    <SigilContext.Provider value={value}>
      {children}
    </SigilContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

export function useSigilZoneContext() {
  const context = useContext(SigilContext);
  return {
    current: context?.zone || 'standard',
  };
}

export function useSigilPersonaContext() {
  const context = useContext(SigilContext);
  return {
    current: context?.persona || 'default',
  };
}

export function useSigilVibes() {
  const context = useContext(SigilContext);
  return context?.vibes || {};
}

// ============================================================================
// Zone Components
// ============================================================================

interface ZoneLayoutProps {
  children: ReactNode;
  financial?: boolean;
}

/**
 * CriticalZone - Wrapper that sets critical zone context
 * Forces server-tick physics for all children
 */
export function CriticalZone({ children, financial }: ZoneLayoutProps) {
  const parentContext = useContext(SigilContext);
  
  const value = useMemo<SigilContextValue>(
    () => ({
      ...parentContext,
      zone: 'critical',
      persona: parentContext?.persona || 'default',
    }),
    [parentContext]
  );
  
  return (
    <SigilContext.Provider value={value}>
      <div data-sigil-zone="critical" data-sigil-financial={financial}>
        {children}
      </div>
    </SigilContext.Provider>
  );
}

/**
 * GlassLayout - Wrapper for exploratory/marketing zones
 * Uses local-first physics by default
 */
export function GlassLayout({ children }: { children: ReactNode }) {
  const parentContext = useContext(SigilContext);
  
  const value = useMemo<SigilContextValue>(
    () => ({
      ...parentContext,
      zone: 'glass',
      persona: parentContext?.persona || 'default',
    }),
    [parentContext]
  );
  
  return (
    <SigilContext.Provider value={value}>
      <div data-sigil-zone="glass">
        {children}
      </div>
    </SigilContext.Provider>
  );
}

/**
 * MachineryLayout - Wrapper for admin/power-user zones
 * Uses instant/snappy physics
 */
export function MachineryLayout({ children }: { children: ReactNode }) {
  const parentContext = useContext(SigilContext);
  
  const value = useMemo<SigilContextValue>(
    () => ({
      ...parentContext,
      zone: 'machinery',
      persona: parentContext?.persona || 'default',
    }),
    [parentContext]
  );
  
  return (
    <SigilContext.Provider value={value}>
      <div data-sigil-zone="machinery">
        {children}
      </div>
    </SigilContext.Provider>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default SigilProvider;
