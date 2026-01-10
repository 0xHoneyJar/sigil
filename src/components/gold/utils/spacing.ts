/**
 * Sigil v7.6 - Spacing Utility
 *
 * Spacing scale as executable code. Replaces markdown spacing principles
 * with type-safe, validated spacing functions.
 *
 * "Teach the agent to read Physics, not Essays."
 *
 * @sigil-tier gold
 * @sigil-zone standard
 *
 * @example
 * ```tsx
 * import { spacing, SPACING } from '@/components/gold/utils/spacing';
 *
 * const padding = spacing(4);  // "16px"
 * const gap = SPACING[2];      // "8px"
 * ```
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Valid spacing scale keys.
 * Based on 4px base unit.
 */
export type SpacingKey =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 8
  | 10
  | 12
  | 16
  | 20
  | 24;

/**
 * Spacing configuration with numeric key and CSS value.
 */
export type SpacingScale = Record<SpacingKey, string>;

// ============================================================================
// Spacing Scale
// ============================================================================

/**
 * Spacing scale with 4px base unit.
 *
 * Agent instruction: Always use these spacing values instead of
 * arbitrary pixel values. This ensures visual consistency.
 *
 * Scale: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
 */
export const SPACING: SpacingScale = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get a spacing value from the scale.
 *
 * @param key - Spacing scale key
 * @returns CSS spacing value
 *
 * @example
 * ```ts
 * spacing(4)   // "16px"
 * spacing(0)   // "0"
 * spacing(8)   // "32px"
 * ```
 */
export function spacing(key: SpacingKey): string {
  return SPACING[key];
}

/**
 * Get spacing as a number (in pixels).
 *
 * @param key - Spacing scale key
 * @returns Numeric pixel value
 *
 * @example
 * ```ts
 * spacingPx(4)  // 16
 * spacingPx(0)  // 0
 * ```
 */
export function spacingPx(key: SpacingKey): number {
  if (key === 0) return 0;
  return key * 4;
}

/**
 * Create a margin shorthand from spacing keys.
 *
 * @param top - Top margin key
 * @param right - Right margin key (defaults to top)
 * @param bottom - Bottom margin key (defaults to top)
 * @param left - Left margin key (defaults to right)
 * @returns CSS margin value
 *
 * @example
 * ```ts
 * margin(4)           // "16px"
 * margin(4, 2)        // "16px 8px"
 * margin(4, 2, 3, 1)  // "16px 8px 12px 4px"
 * ```
 */
export function margin(
  top: SpacingKey,
  right?: SpacingKey,
  bottom?: SpacingKey,
  left?: SpacingKey
): string {
  if (right === undefined) {
    return spacing(top);
  }
  if (bottom === undefined) {
    return `${spacing(top)} ${spacing(right)}`;
  }
  if (left === undefined) {
    return `${spacing(top)} ${spacing(right)} ${spacing(bottom)}`;
  }
  return `${spacing(top)} ${spacing(right)} ${spacing(bottom)} ${spacing(left)}`;
}

/**
 * Create a padding shorthand from spacing keys.
 *
 * @param top - Top padding key
 * @param right - Right padding key (defaults to top)
 * @param bottom - Bottom padding key (defaults to top)
 * @param left - Left padding key (defaults to right)
 * @returns CSS padding value
 *
 * @example
 * ```ts
 * padding(4)           // "16px"
 * padding(4, 2)        // "16px 8px"
 * padding(4, 2, 3, 1)  // "16px 8px 12px 4px"
 * ```
 */
export function padding(
  top: SpacingKey,
  right?: SpacingKey,
  bottom?: SpacingKey,
  left?: SpacingKey
): string {
  return margin(top, right, bottom, left);
}

/**
 * Create a gap value for flexbox/grid layouts.
 *
 * @param rowGap - Row gap key
 * @param columnGap - Column gap key (defaults to rowGap)
 * @returns CSS gap value
 *
 * @example
 * ```ts
 * gap(4)     // "16px"
 * gap(4, 2)  // "16px 8px"
 * ```
 */
export function gap(rowGap: SpacingKey, columnGap?: SpacingKey): string {
  if (columnGap === undefined) {
    return spacing(rowGap);
  }
  return `${spacing(rowGap)} ${spacing(columnGap)}`;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Check if a value is a valid spacing key.
 *
 * @param value - Value to check
 * @returns true if value is a valid SpacingKey
 */
export function isValidSpacing(value: unknown): value is SpacingKey {
  return (
    typeof value === 'number' &&
    [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24].includes(value)
  );
}

/**
 * Get all available spacing keys.
 *
 * @returns Array of all spacing scale keys
 */
export function getAllSpacingKeys(): SpacingKey[] {
  return [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24];
}

/**
 * Convert an arbitrary pixel value to the nearest spacing key.
 *
 * @param pixels - Pixel value
 * @returns Nearest spacing key
 *
 * @example
 * ```ts
 * nearestSpacing(15)  // 4 (16px)
 * nearestSpacing(30)  // 8 (32px)
 * ```
 */
export function nearestSpacing(pixels: number): SpacingKey {
  const keys = getAllSpacingKeys();
  let closest: SpacingKey = 0;
  let minDiff = Infinity;

  for (const key of keys) {
    const value = spacingPx(key);
    const diff = Math.abs(value - pixels);
    if (diff < minDiff) {
      minDiff = diff;
      closest = key;
    }
  }

  return closest;
}
