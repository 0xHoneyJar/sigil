/**
 * HUD Theme Constants
 *
 * Shared design tokens for consistent styling across HUD components.
 * Implements TASK-205 styling requirements.
 */

/**
 * Color palette
 */
export const colors = {
  // Brand
  primary: '#10b981', // emerald-500
  primaryLight: 'rgba(16, 185, 129, 0.2)',
  primaryBorder: 'rgba(16, 185, 129, 0.3)',

  // Status
  success: '#22c55e', // green-500
  successLight: 'rgba(34, 197, 94, 0.1)',
  successBorder: 'rgba(34, 197, 94, 0.3)',

  warning: '#eab308', // yellow-500
  warningLight: 'rgba(234, 179, 8, 0.1)',
  warningBorder: 'rgba(234, 179, 8, 0.3)',

  error: '#ef4444', // red-500
  errorLight: 'rgba(239, 68, 68, 0.1)',
  errorBorder: 'rgba(239, 68, 68, 0.3)',

  info: '#3b82f6', // blue-500
  infoLight: 'rgba(59, 130, 246, 0.1)',
  infoBorder: 'rgba(59, 130, 246, 0.3)',

  // Neutral
  text: '#fff',
  textMuted: '#888',
  textDim: '#666',
  textDisabled: '#555',

  background: 'rgba(0, 0, 0, 0.9)',
  backgroundElevated: 'rgba(26, 26, 26, 1)',
  backgroundHover: 'rgba(255, 255, 255, 0.05)',
  backgroundActive: 'rgba(255, 255, 255, 0.08)',
  backgroundInput: 'rgba(255, 255, 255, 0.02)',

  border: 'rgba(255, 255, 255, 0.1)',
  borderSubtle: 'rgba(255, 255, 255, 0.05)',
  borderStrong: 'rgba(255, 255, 255, 0.2)',

  // Effects
  financial: '#ef4444',
  destructive: '#f97316',
  softDelete: '#eab308',
  standard: '#22c55e',
  local: '#3b82f6',
  navigation: '#8b5cf6',
  query: '#06b6d4',
} as const

/**
 * Typography
 */
export const typography = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontFamilySans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',

  // Sizes
  xs: '10px',
  sm: '11px',
  base: '12px',
  md: '13px',
  lg: '14px',

  // Weights
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,

  // Line heights
  lineHeightTight: 1.25,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.6,

  // Letter spacing
  letterSpacingTight: '-0.02em',
  letterSpacingNormal: '0',
  letterSpacingWide: '0.5px',
} as const

/**
 * Spacing
 */
export const spacing = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
} as const

/**
 * Border radius
 */
export const radii = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
} as const

/**
 * Shadows
 */
export const shadows = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.2)',
  md: '0 4px 12px rgba(0, 0, 0, 0.3)',
  lg: '0 8px 20px rgba(0, 0, 0, 0.4)',
  xl: '0 20px 40px rgba(0, 0, 0, 0.5)',
  primary: '0 4px 12px rgba(16, 185, 129, 0.3)',
  primaryHover: '0 6px 16px rgba(16, 185, 129, 0.4)',
} as const

/**
 * Transitions
 */
export const transitions = {
  fast: '0.1s ease-out',
  normal: '0.15s ease-out',
  slow: '0.2s ease-out',
  spring: '0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const

/**
 * Z-index
 */
export const zIndex = {
  base: 1,
  dropdown: 100,
  sticky: 1000,
  fixed: 5000,
  modal: 10000,
  tooltip: 15000,
} as const

/**
 * Common style patterns
 */
export const patterns = {
  // Buttons
  button: {
    base: {
      padding: `${spacing.md} ${spacing.lg}`,
      borderRadius: radii.md,
      fontSize: typography.sm,
      fontWeight: typography.medium,
      cursor: 'pointer',
      transition: transitions.normal,
      border: '1px solid',
    },
    primary: {
      backgroundColor: colors.primaryLight,
      borderColor: colors.primaryBorder,
      color: colors.primary,
    },
    secondary: {
      backgroundColor: colors.backgroundInput,
      borderColor: colors.border,
      color: colors.textMuted,
    },
    danger: {
      backgroundColor: colors.errorLight,
      borderColor: colors.errorBorder,
      color: colors.error,
    },
  },

  // Inputs
  input: {
    base: {
      padding: spacing.md,
      backgroundColor: colors.backgroundInput,
      border: `1px solid ${colors.border}`,
      borderRadius: radii.md,
      color: colors.text,
      fontSize: typography.sm,
      fontFamily: typography.fontFamily,
    },
  },

  // Cards
  card: {
    base: {
      padding: spacing.lg,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      borderRadius: radii.lg,
      border: `1px solid ${colors.borderSubtle}`,
    },
  },

  // Labels
  label: {
    base: {
      fontSize: typography.xs,
      fontWeight: typography.semibold,
      color: colors.textMuted,
      textTransform: 'uppercase' as const,
      letterSpacing: typography.letterSpacingWide,
    },
  },

  // Badges
  badge: {
    base: {
      padding: `2px ${spacing.sm}`,
      borderRadius: radii.sm,
      fontSize: '9px',
      fontWeight: typography.semibold,
      border: '1px solid',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.3px',
    },
  },
} as const

/**
 * Effect type to color mapping
 */
export const effectColors: Record<string, string> = {
  financial: colors.financial,
  destructive: colors.destructive,
  'soft-delete': colors.softDelete,
  standard: colors.standard,
  local: colors.local,
  navigation: colors.navigation,
  query: colors.query,
}

/**
 * Get effect color
 */
export function getEffectColor(effect: string): string {
  return effectColors[effect] ?? colors.textMuted
}

/**
 * Create CSS properties object
 */
export function createStyles<T extends Record<string, React.CSSProperties>>(
  styles: T
): T {
  return styles
}
