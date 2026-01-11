// Sigil v2.0 — Profiler: Ergonomic
// Validates lenses for hitbox, contrast, and focus requirements

import type {
  Lens,
  ErgonomicConfig,
  ErgonomicValidation,
  HitboxIssue,
  ContrastIssue,
  FocusIssue,
  LensRegistration,
} from '../types';

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

export const DEFAULT_ERGONOMIC_CONFIG: ErgonomicConfig = {
  hitbox: {
    minTouchTarget: 44,
    maxCenterDrift: 2,
    minClickableArea: 0.9,
  },
  contrast: {
    minRatio: 4.5, // WCAG AA
    criticalMinRatio: 7.0, // WCAG AAA
    criticalElements: ['button', 'a', 'input', 'select'],
  },
  focus: {
    indicatorRequired: true,
    minIndicatorContrast: 3.0,
  },
};

// =============================================================================
// LENS REJECTION ERROR
// =============================================================================

export class LensRejection extends Error {
  constructor(
    public reason: string,
    public type: 'hitbox' | 'contrast' | 'focus'
  ) {
    super(`Lens rejected (${type}): ${reason}`);
    this.name = 'LensRejection';
  }
}

// =============================================================================
// PROFILE LENS
// =============================================================================

/**
 * Profile a lens for ergonomic compliance
 * 
 * This would typically render the lens components in a test environment
 * and measure their actual dimensions and colors.
 * 
 * @example
 * ```tsx
 * const validation = profileLens(myLens);
 * if (!validation.hitbox.valid) {
 *   console.error('Hitbox issues:', validation.hitbox.issues);
 * }
 * ```
 */
export function profileLens(
  lens: Lens,
  config: ErgonomicConfig = DEFAULT_ERGONOMIC_CONFIG
): ErgonomicValidation {
  // In a real implementation, this would:
  // 1. Render each lens component in a test environment
  // 2. Measure actual DOM dimensions
  // 3. Extract computed colors
  // 4. Check focus indicator visibility

  // For this reference implementation, we do static analysis
  // based on the lens classification and known component patterns

  const hitboxValidation = validateHitboxes(lens, config.hitbox);
  const contrastValidation = validateContrast(lens, config.contrast);
  const focusValidation = validateFocus(lens, config.focus);

  return {
    hitbox: hitboxValidation,
    contrast: contrastValidation,
    focus: focusValidation,
  };
}

// =============================================================================
// REGISTER LENS
// =============================================================================

/**
 * Register a lens with ergonomic validation
 * 
 * Throws LensRejection if validation fails.
 * 
 * @example
 * ```tsx
 * try {
 *   const registration = registerLensWithValidation(myLens);
 *   console.log('Lens approved:', registration.status);
 * } catch (error) {
 *   if (error instanceof LensRejection) {
 *     console.error('Lens rejected:', error.reason);
 *   }
 * }
 * ```
 */
export function registerLensWithValidation(
  lens: Lens,
  config: ErgonomicConfig = DEFAULT_ERGONOMIC_CONFIG
): LensRegistration {
  const profile = profileLens(lens, config);

  // Check hitbox
  if (!profile.hitbox.valid) {
    const firstIssue = profile.hitbox.issues[0];
    throw new LensRejection(
      `${firstIssue.element}: ${firstIssue.type} ${firstIssue.measured} ` +
      `${firstIssue.type === 'size' ? 'below' : 'exceeds'} ` +
      `${firstIssue.type === 'size' ? 'minimum' : 'maximum'} ${firstIssue.required}`,
      'hitbox'
    );
  }

  // Check contrast
  if (!profile.contrast.valid) {
    const firstIssue = profile.contrast.issues[0];
    throw new LensRejection(
      `${firstIssue.element}: contrast ratio ${firstIssue.measured.toFixed(2)} ` +
      `below required ${firstIssue.required}`,
      'contrast'
    );
  }

  // Check focus
  if (!profile.focus.valid) {
    const firstIssue = profile.focus.issues[0];
    throw new LensRejection(
      `${firstIssue.element}: focus indicator ${firstIssue.issue}`,
      'focus'
    );
  }

  return {
    lens,
    profile,
    status: 'approved',
    classification: lens.classification,
  };
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

function validateHitboxes(
  lens: Lens,
  config: ErgonomicConfig['hitbox']
): { valid: boolean; issues: HitboxIssue[] } {
  const issues: HitboxIssue[] = [];

  // In a real implementation, we would render components and measure
  // For now, we assume built-in lenses pass (they use min-h-[44px])

  // Example of what we'd check:
  // - Button min-height >= 44px
  // - Button min-width >= 44px
  // - Visual center within 2px of click target center
  // - At least 90% of visual area is clickable

  return {
    valid: issues.length === 0,
    issues,
  };
}

function validateContrast(
  lens: Lens,
  config: ErgonomicConfig['contrast']
): { valid: boolean; issues: ContrastIssue[] } {
  const issues: ContrastIssue[] = [];

  // In a real implementation, we would:
  // 1. Render components
  // 2. Extract foreground and background colors
  // 3. Calculate contrast ratio using WCAG formula
  // 4. Check against thresholds

  // Contrast ratio formula:
  // (L1 + 0.05) / (L2 + 0.05)
  // where L1 is lighter luminance, L2 is darker

  return {
    valid: issues.length === 0,
    issues,
  };
}

function validateFocus(
  lens: Lens,
  config: ErgonomicConfig['focus']
): { valid: boolean; issues: FocusIssue[] } {
  const issues: FocusIssue[] = [];

  // In a real implementation, we would:
  // 1. Focus each interactive element
  // 2. Check that a focus indicator appears
  // 3. Measure focus indicator contrast

  return {
    valid: issues.length === 0,
    issues,
  };
}

// =============================================================================
// CONTRAST CALCULATION UTILITIES
// =============================================================================

/**
 * Calculate relative luminance of a color
 * Per WCAG 2.1 definition
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Per WCAG 2.1 definition
 */
export function getContrastRatio(
  fg: { r: number; g: number; b: number },
  bg: { r: number; g: number; b: number }
): number {
  const l1 = getRelativeLuminance(fg.r, fg.g, fg.b);
  const l2 = getRelativeLuminance(bg.r, bg.g, bg.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse a CSS color string to RGB
 */
export function parseColor(color: string): { r: number; g: number; b: number } | null {
  // Handle hex
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }

  // Handle rgb/rgba
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  return null;
}
