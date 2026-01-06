/**
 * Sigil v2.0 — A11yLens GlassButton
 *
 * Accessibility-focused button with 56px min-height, extra high contrast,
 * and clear focus indicators for WCAG AAA compliance.
 *
 * @module lenses/a11y/GlassButton
 */

import React, { type FC, type CSSProperties, useState, useCallback } from 'react';
import type { GlassButtonProps } from '../types';

// =============================================================================
// STYLES
// =============================================================================

const BASE_STYLES: CSSProperties = {
  minHeight: '56px',
  padding: '14px 28px',
  fontSize: '16px',
  fontWeight: 600,
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  userSelect: 'none',
  outline: 'none',
  transition: 'box-shadow 100ms ease-out',
  letterSpacing: '0.01em',
};

// WCAG AAA compliant colors
const VARIANT_STYLES: Record<string, CSSProperties> = {
  primary: {
    backgroundColor: '#1e3a8a',
    color: '#ffffff',
    border: '3px solid #1e40af',
  },
  secondary: {
    backgroundColor: '#ffffff',
    color: '#1e3a8a',
    border: '3px solid #1e3a8a',
  },
  ghost: {
    backgroundColor: '#f3f4f6',
    color: '#111827',
    border: '3px solid #6b7280',
  },
};

const DISABLED_STYLES: CSSProperties = {
  backgroundColor: '#d1d5db',
  color: '#4b5563',
  border: '3px solid #9ca3af',
  cursor: 'not-allowed',
};

const FOCUS_RING: CSSProperties = {
  boxShadow: '0 0 0 4px #fbbf24, 0 0 0 6px #1e3a8a',
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * A11yLens GlassButton — Maximum accessibility for all users.
 *
 * Features:
 * - 56px min-height (extra large touch target)
 * - WCAG AAA contrast (7:1 ratio)
 * - 16px font size for readability
 * - Bold focus ring (4px yellow + 2px blue)
 * - High contrast variants
 *
 * @example
 * ```tsx
 * <A11yLens.GlassButton onAction={cancel} variant="secondary">
 *   Cancel
 * </A11yLens.GlassButton>
 * ```
 */
export const GlassButton: FC<GlassButtonProps> = ({
  onAction,
  children,
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);

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

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Compute styles
  const computedStyles: CSSProperties = {
    ...BASE_STYLES,
    ...(disabled ? DISABLED_STYLES : VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary),
    ...(isFocused ? FOCUS_RING : {}),
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      className={className}
      style={computedStyles}
      aria-disabled={disabled}
      data-variant={variant}
      data-sigil-glass-button
      data-sigil-a11y
    >
      {children}
    </button>
  );
};

GlassButton.displayName = 'A11yLens.GlassButton';
