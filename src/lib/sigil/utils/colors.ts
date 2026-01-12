/**
 * Sigil v7.6 - Colors Utility
 *
 * OKLCH colors as executable code. Replaces markdown color principles
 * with type-safe, validated color functions.
 *
 * "Teach the agent to read Physics, not Essays."
 *
 * @sigil-tier gold
 * @sigil-zone standard
 *
 * @example
 * ```tsx
 * import { oklch, palette } from '@/components/gold/utils/colors';
 *
 * const customBlue = oklch(0.5, 0.2, 250);
 * const primary = palette.primary;
 * ```
 */

// ============================================================================
// Types
// ============================================================================

/**
 * OKLCH color components.
 */
export interface OklchColor {
  /** Lightness (0-1) */
  l: number;
  /** Chroma (0-0.4) */
  c: number;
  /** Hue (0-360) */
  h: number;
  /** Alpha (0-1, optional) */
  a?: number;
}

/**
 * Semantic color names in the palette.
 */
export type SemanticColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral'
  | 'background'
  | 'foreground';

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate OKLCH component ranges.
 *
 * @throws Error if any component is out of valid range
 */
function validateOklch(l: number, c: number, h: number, a?: number): void {
  if (l < 0 || l > 1) {
    throw new Error(`OKLCH lightness must be 0-1, got ${l}`);
  }
  if (c < 0 || c > 0.4) {
    throw new Error(`OKLCH chroma must be 0-0.4, got ${c}`);
  }
  if (h < 0 || h > 360) {
    throw new Error(`OKLCH hue must be 0-360, got ${h}`);
  }
  if (a !== undefined && (a < 0 || a > 1)) {
    throw new Error(`OKLCH alpha must be 0-1, got ${a}`);
  }
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Create an OKLCH color string with validation.
 *
 * Agent instruction: Always use this function for colors instead of
 * hardcoded hex/rgb values. OKLCH provides perceptually uniform colors.
 *
 * @param l - Lightness (0-1)
 * @param c - Chroma (0-0.4)
 * @param h - Hue (0-360)
 * @param a - Alpha (0-1, optional)
 * @returns CSS oklch() color string
 *
 * @example
 * ```ts
 * oklch(0.5, 0.2, 250)     // "oklch(0.5 0.2 250)"
 * oklch(0.5, 0.2, 250, 0.5) // "oklch(0.5 0.2 250 / 0.5)"
 * ```
 */
export function oklch(l: number, c: number, h: number, a?: number): string {
  validateOklch(l, c, h, a);

  if (a !== undefined && a < 1) {
    return `oklch(${l} ${c} ${h} / ${a})`;
  }
  return `oklch(${l} ${c} ${h})`;
}

/**
 * Create an OKLCH color from an object.
 *
 * @param color - OKLCH color object
 * @returns CSS oklch() color string
 */
export function oklchFromObject(color: OklchColor): string {
  return oklch(color.l, color.c, color.h, color.a);
}

/**
 * Parse an OKLCH color string into components.
 *
 * @param colorString - CSS oklch() color string
 * @returns OKLCH color object or null if invalid
 */
export function parseOklch(colorString: string): OklchColor | null {
  const match = colorString.match(
    /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/
  );

  if (!match) return null;

  const [, l, c, h, a] = match;
  return {
    l: parseFloat(l),
    c: parseFloat(c),
    h: parseFloat(h),
    a: a !== undefined ? parseFloat(a) : undefined,
  };
}

// ============================================================================
// Palette
// ============================================================================

/**
 * Semantic color palette using OKLCH.
 *
 * Agent instruction: Use these semantic colors for consistency.
 * Prefer semantic names over custom colors when possible.
 */
export const palette = {
  /** Primary brand color - blue */
  primary: oklch(0.5, 0.2, 250),
  /** Secondary brand color - purple */
  secondary: oklch(0.5, 0.15, 290),
  /** Success state - green */
  success: oklch(0.6, 0.2, 145),
  /** Danger/error state - red */
  danger: oklch(0.5, 0.25, 25),
  /** Warning state - orange/amber */
  warning: oklch(0.7, 0.2, 85),
  /** Info state - cyan */
  info: oklch(0.6, 0.15, 220),
  /** Neutral/gray */
  neutral: oklch(0.5, 0.02, 250),
  /** Background - light */
  background: oklch(0.98, 0.005, 250),
  /** Foreground/text - dark */
  foreground: oklch(0.15, 0.01, 250),
} as const;

// ============================================================================
// Color Manipulation
// ============================================================================

/**
 * Lighten an OKLCH color.
 *
 * @param color - OKLCH color string
 * @param amount - Amount to lighten (0-1)
 * @returns Lightened color string
 */
export function lighten(color: string, amount: number): string {
  const parsed = parseOklch(color);
  if (!parsed) return color;

  const newL = Math.min(1, parsed.l + amount);
  return oklch(newL, parsed.c, parsed.h, parsed.a);
}

/**
 * Darken an OKLCH color.
 *
 * @param color - OKLCH color string
 * @param amount - Amount to darken (0-1)
 * @returns Darkened color string
 */
export function darken(color: string, amount: number): string {
  const parsed = parseOklch(color);
  if (!parsed) return color;

  const newL = Math.max(0, parsed.l - amount);
  return oklch(newL, parsed.c, parsed.h, parsed.a);
}

/**
 * Adjust the saturation (chroma) of an OKLCH color.
 *
 * @param color - OKLCH color string
 * @param amount - Amount to adjust chroma (-0.4 to 0.4)
 * @returns Adjusted color string
 */
export function saturate(color: string, amount: number): string {
  const parsed = parseOklch(color);
  if (!parsed) return color;

  const newC = Math.max(0, Math.min(0.4, parsed.c + amount));
  return oklch(parsed.l, newC, parsed.h, parsed.a);
}

/**
 * Set the alpha/opacity of an OKLCH color.
 *
 * @param color - OKLCH color string
 * @param alpha - Alpha value (0-1)
 * @returns Color string with alpha
 */
export function withAlpha(color: string, alpha: number): string {
  const parsed = parseOklch(color);
  if (!parsed) return color;

  return oklch(parsed.l, parsed.c, parsed.h, alpha);
}

/**
 * Shift the hue of an OKLCH color.
 *
 * @param color - OKLCH color string
 * @param degrees - Degrees to shift (can be negative)
 * @returns Color with shifted hue
 */
export function shiftHue(color: string, degrees: number): string {
  const parsed = parseOklch(color);
  if (!parsed) return color;

  let newH = (parsed.h + degrees) % 360;
  if (newH < 0) newH += 360;
  return oklch(parsed.l, parsed.c, newH, parsed.a);
}

// ============================================================================
// Contrast & Accessibility
// ============================================================================

/**
 * Get a contrasting text color for a background.
 *
 * @param backgroundColor - OKLCH background color string
 * @returns 'dark' or 'light' recommendation
 */
export function getContrastText(
  backgroundColor: string
): 'dark' | 'light' {
  const parsed = parseOklch(backgroundColor);
  if (!parsed) return 'dark';

  // OKLCH lightness directly maps to perceived brightness
  return parsed.l > 0.6 ? 'dark' : 'light';
}

/**
 * Get accessible text color for a background.
 *
 * @param backgroundColor - OKLCH background color string
 * @returns OKLCH color string for text
 */
export function getAccessibleTextColor(backgroundColor: string): string {
  const contrast = getContrastText(backgroundColor);
  return contrast === 'dark' ? palette.foreground : palette.background;
}
