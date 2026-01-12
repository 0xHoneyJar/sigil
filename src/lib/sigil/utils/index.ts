/**
 * Sigil v10.1 "Usage Reality" - Utilities
 *
 * Executable design principles as utilities.
 *
 * @module @sigil/utils
 * @version 10.1.0
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
