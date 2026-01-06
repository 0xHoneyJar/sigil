/**
 * Sigil v2.0 — Zone Context
 *
 * All layouts provide zone context via React Context.
 * Layouts ARE Zones. Physics is DOM, not lint.
 *
 * @module layouts/context
 */

import { createContext, useContext } from 'react';
import type { ZoneType, TimeAuthority } from '../types';

// =============================================================================
// ZONE CONTEXT
// =============================================================================

/**
 * Zone context value provided by layout primitives.
 *
 * @example Reading zone context
 * ```tsx
 * const zone = useZoneContext();
 * if (zone.type === 'critical' && zone.financial) {
 *   // Force StrictLens
 * }
 * ```
 */
export interface ZoneContextValue {
  /** Zone type */
  type: ZoneType;
  /** Whether zone handles financial operations (forces StrictLens) */
  financial?: boolean;
  /** Whether zone handles competitive operations */
  competitive?: boolean;
  /** Default time authority for actions in this zone */
  timeAuthority: TimeAuthority;
}

/**
 * Default zone context when no layout is provided.
 */
export const DEFAULT_ZONE_CONTEXT: ZoneContextValue = {
  type: 'default',
  timeAuthority: 'optimistic',
};

/**
 * Zone context for layout primitives.
 *
 * @internal Use `useZoneContext()` to read zone context.
 */
export const ZoneContext = createContext<ZoneContextValue | null>(null);

ZoneContext.displayName = 'SigilZoneContext';

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Get the zone context from the nearest layout primitive.
 *
 * Falls back to default zone if no layout is found.
 *
 * @returns Zone context value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const zone = useZoneContext();
 *
 *   // zone.type: 'critical' | 'admin' | 'marketing' | 'default'
 *   // zone.financial?: boolean
 *   // zone.timeAuthority: 'optimistic' | 'server-tick' | 'hybrid'
 * }
 * ```
 */
export function useZoneContext(): ZoneContextValue {
  const context = useContext(ZoneContext);
  if (!context) {
    return DEFAULT_ZONE_CONTEXT;
  }
  return context;
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Check if a zone requires StrictLens enforcement.
 *
 * StrictLens is forced in critical zones with financial operations.
 *
 * @param zone - Zone context value
 * @returns Whether StrictLens should be forced
 */
export function requiresStrictLens(zone: ZoneContextValue): boolean {
  return zone.type === 'critical' && zone.financial === true;
}

/**
 * Check if a zone allows gameplay lenses.
 *
 * Gameplay lenses (input hints, etc.) are blocked in critical+financial zones.
 *
 * @param zone - Zone context value
 * @returns Whether gameplay lenses are allowed
 */
export function allowsGameplayLens(zone: ZoneContextValue): boolean {
  return !(zone.type === 'critical' && zone.financial);
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

export type { ZoneType, TimeAuthority };
