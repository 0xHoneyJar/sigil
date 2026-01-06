/**
 * Sigil v2.0 — DefaultLens
 *
 * Standard lens with 44px targets, status-based styling, and animations.
 * The default choice for most UI contexts.
 *
 * @module lenses/default
 */

import { CriticalButton } from './critical-button';
import { GlassButton } from './glass-button';
import { MachineryItem } from './machinery-item';
import { registerDefaultLens } from '../use-lens';
import type { Lens } from '../types';

// =============================================================================
// LENS DEFINITION
// =============================================================================

/**
 * DefaultLens — Standard UI with 44px targets and animations.
 *
 * Features:
 * - 44px min-height for touch-friendly targets
 * - Status-based styling for CriticalButton
 * - Variant support for GlassButton (primary, secondary, ghost)
 * - Hover highlighting for MachineryItem
 * - Tap scale animations
 *
 * @example
 * ```tsx
 * const Lens = useLens();
 * // In most zones, returns DefaultLens
 *
 * <Lens.CriticalButton state={state} onAction={commit}>
 *   Submit
 * </Lens.CriticalButton>
 * ```
 */
export const DefaultLens: Lens = {
  name: 'DefaultLens',
  classification: 'cosmetic',
  CriticalButton,
  GlassButton,
  MachineryItem,
};

// =============================================================================
// REGISTRATION
// =============================================================================

// Register as the default lens
registerDefaultLens(DefaultLens);

// =============================================================================
// EXPORTS
// =============================================================================

export { CriticalButton, GlassButton, MachineryItem };
