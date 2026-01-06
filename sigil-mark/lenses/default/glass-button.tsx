/**
 * Sigil v2.0 — DefaultLens GlassButton
 *
 * Standard button for GlassLayout with 44px min-height,
 * variant support, and hover/active states.
 *
 * @module lenses/default/GlassButton
 */

import React, { type FC, type CSSProperties, useState, useCallback } from 'react';
import type { GlassButtonProps } from '../types';

// =============================================================================
// STYLES
// =============================================================================

const BASE_STYLES: CSSProperties = {
  minHeight: '44px',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 500,
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 150ms ease-out',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  userSelect: 'none',
  outline: 'none',
};

const VARIANT_STYLES: Record<string, CSSProperties> = {
  primary: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'transparent',
    color: '#3b82f6',
    border: '1px solid #3b82f6',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#6b7280',
    border: 'none',
  },
};

const VARIANT_HOVER_STYLES: Record<string, CSSProperties> = {
  primary: {
    backgroundColor: '#2563eb',
  },
  secondary: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  ghost: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
};

const DISABLED_STYLES: CSSProperties = {
  backgroundColor: '#e5e7eb',
  color: '#9ca3af',
  border: 'none',
  cursor: 'not-allowed',
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * DefaultLens GlassButton — Standard button for general use.
 *
 * Features:
 * - 44px min-height (touch-friendly)
 * - Variant support (primary, secondary, ghost)
 * - Hover/active states
 * - Focus ring for accessibility
 *
 * @example
 * ```tsx
 * <DefaultLens.GlassButton onAction={cancel} variant="secondary">
 *   Cancel
 * </DefaultLens.GlassButton>
 * ```
 */
export const GlassButton: FC<GlassButtonProps> = ({
  onAction,
  children,
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (!disabled) {
      setIsHovered(true);
    }
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsPressed(false);
  }, []);

  const handleMouseDown = useCallback(() => {
    if (!disabled) {
      setIsPressed(true);
    }
  }, [disabled]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

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
          setIsPressed(true);
          onAction();
        }
      }
    },
    [disabled, onAction]
  );

  const handleKeyUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  // Compute styles
  const baseVariantStyles = disabled
    ? DISABLED_STYLES
    : VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary;

  const hoverStyles =
    isHovered && !disabled
      ? VARIANT_HOVER_STYLES[variant] ?? VARIANT_HOVER_STYLES.primary
      : {};

  const computedStyles: CSSProperties = {
    ...BASE_STYLES,
    ...baseVariantStyles,
    ...hoverStyles,
    transform: isPressed ? 'scale(0.98)' : 'scale(1)',
    opacity: isPressed ? 0.9 : 1,
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      disabled={disabled}
      className={className}
      style={computedStyles}
      aria-disabled={disabled}
      data-variant={variant}
      data-sigil-glass-button
    >
      {children}
    </button>
  );
};

GlassButton.displayName = 'DefaultLens.GlassButton';
