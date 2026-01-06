/**
 * Sigil v2.0 — StrictLens GlassButton
 *
 * High contrast button with 48px min-height and clear visual states.
 * No decorative effects.
 *
 * @module lenses/strict/GlassButton
 */

import React, { type FC, type CSSProperties, useCallback } from 'react';
import type { GlassButtonProps } from '../types';

// =============================================================================
// STYLES
// =============================================================================

const BASE_STYLES: CSSProperties = {
  minHeight: '48px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: 600,
  borderRadius: '4px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  userSelect: 'none',
  outline: 'none',
  // No transition for strict mode
};

const VARIANT_STYLES: Record<string, CSSProperties> = {
  primary: {
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: '2px solid #1e40af',
  },
  secondary: {
    backgroundColor: '#ffffff',
    color: '#1d4ed8',
    border: '2px solid #1d4ed8',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#374151',
    border: '2px solid #d1d5db',
  },
};

const DISABLED_STYLES: CSSProperties = {
  backgroundColor: '#e5e7eb',
  color: '#6b7280',
  border: '2px solid #d1d5db',
  cursor: 'not-allowed',
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * StrictLens GlassButton — High contrast button for critical contexts.
 *
 * Features:
 * - 48px min-height (larger touch target)
 * - High contrast colors
 * - Bold borders
 * - No hover/active animations
 *
 * @example
 * ```tsx
 * <StrictLens.GlassButton onAction={cancel} variant="secondary">
 *   Cancel
 * </StrictLens.GlassButton>
 * ```
 */
export const GlassButton: FC<GlassButtonProps> = ({
  onAction,
  children,
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onAction();
    }
  }, [disabled, onAction]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!disabled) {
          onAction();
        }
      }
    },
    [disabled, onAction]
  );

  // Compute styles (no hover effects in strict mode)
  const computedStyles: CSSProperties = {
    ...BASE_STYLES,
    ...(disabled ? DISABLED_STYLES : VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary),
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={className}
      style={computedStyles}
      aria-disabled={disabled}
      data-variant={variant}
      data-sigil-glass-button
      data-sigil-strict
    >
      {children}
    </button>
  );
};

GlassButton.displayName = 'StrictLens.GlassButton';
