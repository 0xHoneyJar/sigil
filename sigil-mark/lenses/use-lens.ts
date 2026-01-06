/**
 * Sigil v2.0 — useLens Hook
 *
 * Zone-aware lens resolution hook.
 * Returns the appropriate lens based on zone context and user preference.
 *
 * @module lenses/useLens
 */

import { useZoneContext, requiresStrictLens, type ZoneContextValue } from '../layouts/context';
import { useUserLens } from './lens-provider';
import type { Lens } from './types';

// =============================================================================
// PLACEHOLDER LENSES
// =============================================================================

/**
 * Placeholder DefaultLens until Sprint 6 implements it.
 * @internal Will be replaced by actual implementation in Sprint 6.
 */
const PLACEHOLDER_DEFAULT_LENS: Lens = {
  name: 'DefaultLens',
  classification: 'cosmetic',
  CriticalButton: () => null,
  GlassButton: () => null,
  MachineryItem: () => null,
};

/**
 * Placeholder StrictLens until Sprint 6 implements it.
 * @internal Will be replaced by actual implementation in Sprint 6.
 */
const PLACEHOLDER_STRICT_LENS: Lens = {
  name: 'StrictLens',
  classification: 'cosmetic',
  CriticalButton: () => null,
  GlassButton: () => null,
  MachineryItem: () => null,
};

// =============================================================================
// LENS REGISTRY
// =============================================================================

/**
 * Registry for built-in lenses.
 * @internal Used for lens resolution and enforcement.
 */
let DefaultLens: Lens = PLACEHOLDER_DEFAULT_LENS;
let StrictLens: Lens = PLACEHOLDER_STRICT_LENS;

/**
 * Register the DefaultLens implementation.
 * @internal Called by lenses/default/index.tsx
 */
export function registerDefaultLens(lens: Lens): void {
  DefaultLens = lens;
}

/**
 * Register the StrictLens implementation.
 * @internal Called by lenses/strict/index.tsx
 */
export function registerStrictLens(lens: Lens): void {
  StrictLens = lens;
}

/**
 * Get the current DefaultLens.
 * @internal
 */
export function getDefaultLens(): Lens {
  return DefaultLens;
}

/**
 * Get the current StrictLens.
 * @internal
 */
export function getStrictLens(): Lens {
  return StrictLens;
}

// =============================================================================
// LENS ENFORCEMENT
// =============================================================================

/**
 * Log lens enforcement warning in development.
 * @internal
 */
function logLensEnforcement(
  zone: ZoneContextValue,
  forcedLens: Lens,
  requestedLens: Lens | null
): void {
  if (process.env.NODE_ENV !== 'production') {
    const requestedName = requestedLens?.name ?? 'DefaultLens';

    if (requestedName !== forcedLens.name) {
      console.warn(
        `[Sigil useLens] Lens enforcement: ` +
          `Forcing ${forcedLens.name} in ${zone.type} zone ` +
          `(requested: ${requestedName}). ` +
          `Reason: ${zone.financial ? 'Financial zone requires StrictLens' : 'Zone enforcement'}.`
      );
    }
  }
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Options for useLens hook.
 */
export interface UseLensOptions {
  /** Override zone context (for testing) */
  overrideZone?: ZoneContextValue;
}

/**
 * Get the appropriate lens for the current zone.
 *
 * Resolution order:
 * 1. Critical zone + financial → StrictLens (forced, logged in dev)
 * 2. User preference from LensProvider
 * 3. DefaultLens (fallback)
 *
 * @param options - Optional configuration
 * @returns The lens to use for rendering
 *
 * @example Basic usage
 * ```tsx
 * function PaymentButton() {
 *   const Lens = useLens();
 *   const payment = useCriticalAction({ ... });
 *
 *   return (
 *     <Lens.CriticalButton state={payment.state} onAction={() => payment.commit()}>
 *       Pay
 *     </Lens.CriticalButton>
 *   );
 * }
 * ```
 *
 * @example Inside CriticalZone
 * ```tsx
 * <CriticalZone financial>
 *   <PaymentButton /> // useLens() returns StrictLens
 * </CriticalZone>
 * ```
 *
 * @example Inside MachineryLayout
 * ```tsx
 * <MachineryLayout>
 *   <ItemList /> // useLens() returns user preference or DefaultLens
 * </MachineryLayout>
 * ```
 */
export function useLens(options?: UseLensOptions): Lens {
  const zoneContext = useZoneContext();
  const userLens = useUserLens();

  const zone = options?.overrideZone ?? zoneContext;

  // Critical zone + financial → Force StrictLens
  if (requiresStrictLens(zone)) {
    logLensEnforcement(zone, StrictLens, userLens);
    return StrictLens;
  }

  // User preference if set
  if (userLens) {
    return userLens;
  }

  // Default fallback
  return DefaultLens;
}

// =============================================================================
// EXPORTS
// =============================================================================

export { DefaultLens, StrictLens };
