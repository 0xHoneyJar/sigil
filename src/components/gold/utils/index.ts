/**
 * Sigil v7.6 - Gold Tier Utilities
 *
 * Executable design principles as utilities.
 * These replace markdown documentation with type-safe, queryable code.
 *
 * @sigil-tier gold
 */

// Colors
export {
  // Core function
  oklch,
  oklchFromObject,
  parseOklch,
  // Palette
  palette,
  // Manipulation
  lighten,
  darken,
  saturate,
  withAlpha,
  shiftHue,
  // Accessibility
  getContrastText,
  getAccessibleTextColor,
  // Types
  type OklchColor,
  type SemanticColor,
} from './colors';

// Spacing
export {
  // Core function
  spacing,
  spacingPx,
  // Shorthands
  margin,
  padding,
  gap,
  // Validation
  isValidSpacing,
  getAllSpacingKeys,
  nearestSpacing,
  // Constants
  SPACING,
  // Types
  type SpacingKey,
  type SpacingScale,
} from './spacing';
