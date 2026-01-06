/**
 * Sigil v2.0 — StrictLens
 *
 * High-stakes lens with 48px targets, high contrast, and no animations.
 * Forced in critical+financial zones for maximum clarity.
 *
 * @module lenses/strict
 */

import { CriticalButton } from './critical-button';
import { GlassButton } from './glass-button';
import { MachineryItem } from './machinery-item';
import { registerStrictLens } from '../use-lens';
import type { Lens } from '../types';

// =============================================================================
// LENS DEFINITION
// =============================================================================

/**
 * StrictLens — Maximum clarity for critical operations.
 *
 * Features:
 * - 48px min-height for larger touch targets
 * - High contrast colors
 * - Bold borders for clear boundaries
 * - No animations (instant visual feedback)
 * - Always-visible delete buttons
 *
 * Automatically enforced in:
 * - CriticalZone with `financial={true}`
 *
 * @example
 * ```tsx
 * // Automatic in financial critical zones
 * <CriticalZone financial>
 *   <PaymentButton /> // useLens() returns StrictLens
 * </CriticalZone>
 *
 * // Manual usage
 * <LensProvider initialLens={StrictLens}>
 *   <HighStakesForm />
 * </LensProvider>
 * ```
 */
export const StrictLens: Lens = {
  name: 'StrictLens',
  classification: 'cosmetic',
  CriticalButton,
  GlassButton,
  MachineryItem,
};

// =============================================================================
// REGISTRATION
// =============================================================================

// Register as the strict lens
registerStrictLens(StrictLens);

// =============================================================================
// EXPORTS
// =============================================================================

export { CriticalButton, GlassButton, MachineryItem };
