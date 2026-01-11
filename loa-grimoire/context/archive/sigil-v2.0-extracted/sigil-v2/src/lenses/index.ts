// Sigil v2.0 — Lens Registry
// Manages lens registration, validation, and zone-based enforcement

import React, { createContext, useContext, ReactNode } from 'react';
import type { Lens, Zone, LensClassification, IntegrityFlags } from '../types';
import { DefaultLens } from './default';
import { StrictLens } from './strict';
import { A11yLens } from './a11y';

// =============================================================================
// LENS CONTEXT
// =============================================================================

interface LensContextValue {
  lens: Lens;
  setLens: (lens: Lens) => void;
}

const LensContext = createContext<LensContextValue | null>(null);

// =============================================================================
// LENS PROVIDER
// =============================================================================

interface LensProviderProps {
  lens?: Lens;
  children: ReactNode;
}

export function LensProvider({ lens = DefaultLens, children }: LensProviderProps) {
  const [currentLens, setCurrentLens] = React.useState<Lens>(lens);

  return (
    <LensContext.Provider value={{ lens: currentLens, setLens: setCurrentLens }}>
      {children}
    </LensContext.Provider>
  );
}

// =============================================================================
// USE LENS HOOK
// =============================================================================

/**
 * useLens — Get the appropriate lens for the current zone
 * 
 * Automatically enforces StrictLens in critical/financial zones
 * regardless of user preference.
 * 
 * @example
 * ```tsx
 * // In critical zone - returns StrictLens
 * const Lens = useLens({ type: 'critical', financial: true });
 * 
 * // In marketing zone - returns user preference
 * const Lens = useLens({ type: 'marketing' });
 * ```
 */
export function useLens(zone?: Zone): Lens {
  const context = useContext(LensContext);
  const userLens = context?.lens || DefaultLens;

  // No zone specified - return user preference
  if (!zone) return userLens;

  // Get integrity flags for user's lens
  const flags = getLensIntegrity(userLens);

  // CRITICAL ZONE: Force StrictLens
  if (zone.type === 'critical' && flags.restrictions.criticalZones) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[Sigil] Lens "${userLens.name}" (${flags.classification}) ` +
        `restricted in critical zone. Using StrictLens.`
      );
    }
    return StrictLens;
  }

  // FINANCIAL ZONE: Force StrictLens for non-cosmetic
  if (zone.financial && flags.restrictions.financialFlow) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[Sigil] Lens "${userLens.name}" blocked in financial flow. Using StrictLens.`
      );
    }
    return StrictLens;
  }

  // COMPETITIVE MODE: Force StrictLens for gameplay lenses
  if (zone.competitive && flags.restrictions.competitiveMode) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[Sigil] Lens "${userLens.name}" blocked in competitive mode. Using StrictLens.`
      );
    }
    return StrictLens;
  }

  return userLens;
}

// =============================================================================
// INTEGRITY FLAGS
// =============================================================================

/**
 * Get integrity flags for a lens
 */
export function getLensIntegrity(lens: Lens): IntegrityFlags {
  const classification = lens.classification;

  const restrictions = {
    criticalZones: classification !== 'cosmetic',
    financialFlow: classification === 'gameplay',
    competitiveMode: classification === 'gameplay',
  };

  return {
    classification,
    permissions: getLensPermissions(classification),
    restrictions,
  };
}

function getLensPermissions(classification: LensClassification) {
  const base = {
    colors: true,
    typography: true,
    spacing: true,
    animations: true,
    icons: true,
  };

  switch (classification) {
    case 'cosmetic':
      return base;

    case 'utility':
      return {
        ...base,
        overlays: true,
        highlights: true,
        badges: true,
        tooltips: true,
      };

    case 'gameplay':
      return {
        ...base,
        overlays: true,
        highlights: true,
        badges: true,
        tooltips: true,
        inputHints: true,
        dataAugmentation: true,
      };
  }
}

// =============================================================================
// LENS REGISTRY
// =============================================================================

const lensRegistry = new Map<string, Lens>();

// Register built-in lenses
lensRegistry.set('DefaultLens', DefaultLens);
lensRegistry.set('StrictLens', StrictLens);
lensRegistry.set('A11yLens', A11yLens);

/**
 * Register a new lens
 */
export function registerLens(lens: Lens): void {
  // In a real implementation, this would run ergonomic validation
  // See profiler/ergonomic.ts for validation logic
  lensRegistry.set(lens.name, lens);
}

/**
 * Get a lens by name
 */
export function getLens(name: string): Lens | undefined {
  return lensRegistry.get(name);
}

/**
 * Get all registered lenses
 */
export function getAllLenses(): Lens[] {
  return Array.from(lensRegistry.values());
}

// =============================================================================
// EXPORTS
// =============================================================================

export { DefaultLens } from './default';
export { StrictLens } from './strict';
export { A11yLens } from './a11y';
