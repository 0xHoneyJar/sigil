/**
 * Tension to CSS Variable Mapping
 *
 * Converts tension values (0-100) to CSS custom properties.
 * 60fps updates via RAF throttle in TensionProvider.
 */

import type { TensionState } from './types.js';

/**
 * Clamp a value between min and max.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values based on tension (0-100).
 */
function lerp(tension: number, min: number, max: number): number {
  const t = clamp(tension, 0, 100) / 100;
  return min + t * (max - min);
}

/**
 * Convert tensions to CSS variables.
 *
 * Each axis controls multiple CSS properties:
 *
 * **Playfulness (0-100)**
 * - Border radius: 4px (serious) to 16px (playful)
 * - Color saturation: 80% (muted) to 100% (vibrant)
 * - Animation bounce: 1.0 (none) to 1.15 (bouncy)
 * - Corner smoothing: 0 (sharp) to 60% (smooth)
 *
 * **Weight (0-100)**
 * - Shadow opacity: 0.05 (light) to 0.15 (heavy)
 * - Shadow blur: 4px (subtle) to 24px (diffuse)
 * - Font weight: 400 (light) to 600 (bold)
 * - Padding scale: 0.8 (tight) to 1.2 (generous)
 * - Border width: 1px (thin) to 2px (thick)
 *
 * **Density (0-100)**
 * - Spacing unit: 8px (spacious) to 6px (dense)
 * - Font size base: 16px (spacious) to 14px (dense)
 * - Line height: 1.6 (airy) to 1.4 (compact)
 * - Gap: 24px (loose) to 12px (tight)
 * - Container padding: 24px (roomy) to 12px (compact)
 *
 * **Speed (0-100)**
 * - Transition duration: 300ms (deliberate) to 20ms (instant)
 * - Animation duration: 400ms (slow) to 50ms (fast)
 * - Delay: 100ms (patient) to 0ms (immediate)
 * - Easing: ease-out (smooth) to linear (direct)
 */
export function tensionsToCSSVariables(
  tensions: TensionState
): Record<string, string> {
  const { playfulness, weight, density, speed } = tensions;

  return {
    // ============ PLAYFULNESS ============
    // Higher playfulness = rounder corners
    '--sigil-border-radius': `${lerp(playfulness, 4, 16)}px`,
    // Higher playfulness = more saturated colors
    '--sigil-color-saturation': `${lerp(playfulness, 80, 100)}%`,
    // Only add bounce for very playful
    '--sigil-animation-bounce': playfulness > 70 ? '1.1' : '1.0',
    // Icon style based on playfulness
    '--sigil-icon-style': playfulness > 60 ? 'rounded' : 'sharp',
    // iOS-style corner smoothing
    '--sigil-corner-smoothing': `${lerp(playfulness, 0, 60)}%`,

    // ============ WEIGHT ============
    // Higher weight = deeper shadows
    '--sigil-shadow-opacity': `${lerp(weight, 0.05, 0.15)}`,
    // Higher weight = more blur
    '--sigil-shadow-blur': `${lerp(weight, 4, 24)}px`,
    // Higher weight = bolder fonts
    '--sigil-font-weight': weight > 60 ? '600' : '400',
    // Higher weight = more padding
    '--sigil-padding-scale': `${lerp(weight, 0.8, 1.2)}`,
    // Higher weight = thicker borders
    '--sigil-border-width': `${lerp(weight, 1, 2)}px`,

    // ============ DENSITY ============
    // Higher density = less spacing (inverted)
    '--sigil-spacing-unit': `${lerp(density, 8, 6)}px`,
    // Higher density = smaller text
    '--sigil-font-size-base': `${lerp(density, 16, 14)}px`,
    // Higher density = tighter line height
    '--sigil-line-height': `${lerp(density, 1.6, 1.4)}`,
    // Higher density = smaller gaps
    '--sigil-gap': `${lerp(density, 24, 12)}px`,
    // Higher density = less container padding
    '--sigil-container-padding': `${lerp(density, 24, 12)}px`,

    // ============ SPEED ============
    // Higher speed = faster transitions
    '--sigil-transition-duration': `${lerp(speed, 300, 20)}ms`,
    // Higher speed = faster animations
    '--sigil-animation-duration': `${lerp(speed, 400, 50)}ms`,
    // Higher speed = less delay
    '--sigil-delay': `${lerp(speed, 100, 0)}ms`,
    // Easing based on speed
    '--sigil-easing': speed > 70 ? 'linear' : 'ease-out',
  };
}

/**
 * Apply CSS variables to a DOM element.
 */
export function applyTensionVariables(
  element: HTMLElement,
  tensions: TensionState
): void {
  const variables = tensionsToCSSVariables(tensions);
  for (const [key, value] of Object.entries(variables)) {
    element.style.setProperty(key, value);
  }
}

/**
 * Get CSS variable string for use in style attribute.
 */
export function getTensionStyleString(tensions: TensionState): string {
  const variables = tensionsToCSSVariables(tensions);
  return Object.entries(variables)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
}
