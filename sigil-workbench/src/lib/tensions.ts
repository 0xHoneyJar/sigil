/**
 * Tension to CSS Variable Mapping
 *
 * Converts tension values (0-100) to CSS custom properties.
 */

import type { TensionState } from './types';

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
 * Round to a specified number of decimal places.
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
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
    '--sigil-border-radius': `${round(lerp(playfulness, 4, 16))}px`,
    '--sigil-color-saturation': `${round(lerp(playfulness, 80, 100))}%`,
    '--sigil-animation-bounce': playfulness > 70 ? '1.1' : '1.0',
    '--sigil-icon-style': playfulness > 60 ? 'rounded' : 'sharp',
    '--sigil-corner-smoothing': `${round(lerp(playfulness, 0, 60))}%`,

    // ============ WEIGHT ============
    '--sigil-shadow-opacity': `${round(lerp(weight, 0.05, 0.15), 3)}`,
    '--sigil-shadow-blur': `${round(lerp(weight, 4, 24))}px`,
    '--sigil-font-weight': weight > 60 ? '600' : '400',
    '--sigil-padding-scale': `${round(lerp(weight, 0.8, 1.2))}`,
    '--sigil-border-width': `${round(lerp(weight, 1, 2))}px`,

    // ============ DENSITY ============
    '--sigil-spacing-unit': `${round(lerp(density, 8, 6))}px`,
    '--sigil-font-size-base': `${round(lerp(density, 16, 14))}px`,
    '--sigil-line-height': `${round(lerp(density, 1.6, 1.4))}`,
    '--sigil-gap': `${round(lerp(density, 24, 12))}px`,
    '--sigil-container-padding': `${round(lerp(density, 24, 12))}px`,

    // ============ SPEED ============
    '--sigil-transition-duration': `${round(lerp(speed, 300, 20))}ms`,
    '--sigil-animation-duration': `${round(lerp(speed, 400, 50))}ms`,
    '--sigil-delay': `${round(lerp(speed, 100, 0))}ms`,
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

/**
 * Clamp tension value to valid range (0-100).
 */
export function clampTension(value: number): number {
  return Math.min(Math.max(Math.round(value), 0), 100);
}
