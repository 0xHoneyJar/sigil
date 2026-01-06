/**
 * Sigil v2.0 — A11yLens
 *
 * Accessibility-focused lens with 56px targets, WCAG AAA contrast,
 * and enhanced focus indicators for users who need maximum clarity.
 *
 * @module lenses/a11y
 */

import { CriticalButton } from './critical-button';
import { GlassButton } from './glass-button';
import { MachineryItem } from './machinery-item';
import type { Lens } from '../types';

// =============================================================================
// LENS DEFINITION
// =============================================================================

/**
 * A11yLens — Maximum accessibility for all users.
 *
 * Features:
 * - 56px min-height (extra large touch targets)
 * - WCAG AAA contrast ratio (7:1)
 * - 16-18px font sizes for readability
 * - Bold focus rings (4px yellow + 2px blue)
 * - Clear visual status indicators
 * - No reliance on color alone
 *
 * Use when:
 * - Building for users with visual impairments
 * - Meeting WCAG AAA compliance requirements
 * - Creating kiosk or public terminal interfaces
 * - Supporting users with motor impairments
 *
 * @example
 * ```tsx
 * // App-wide accessibility mode
 * <LensProvider initialLens={A11yLens}>
 *   <App />
 * </LensProvider>
 *
 * // User preference toggle
 * function AccessibilityToggle() {
 *   const preference = useLensPreference();
 *   return (
 *     <button onClick={() =>
 *       preference?.setLens(A11yLens)
 *     }>
 *       Enable High Contrast
 *     </button>
 *   );
 * }
 * ```
 */
export const A11yLens: Lens = {
  name: 'A11yLens',
  classification: 'cosmetic',
  CriticalButton,
  GlassButton,
  MachineryItem,
};

// =============================================================================
// EXPORTS
// =============================================================================

export { CriticalButton, GlassButton, MachineryItem };
