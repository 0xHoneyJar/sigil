/**
 * Sigil v2.0 — A11yLens CriticalButton
 *
 * Accessibility-focused button with 56px min-height, extra high contrast
 * for WCAG AAA compliance, and clear focus indicators.
 *
 * @module lenses/a11y/CriticalButton
 */

import React, { type FC, type CSSProperties, useCallback } from 'react';
import type { CriticalButtonProps } from '../types';

// =============================================================================
// STYLES
// =============================================================================

/**
 * WCAG AAA requires contrast ratio of 7:1 for normal text.
 * All colors chosen to meet or exceed this requirement.
 */

const BASE_STYLES: CSSProperties = {
  minHeight: '56px',
  padding: '16px 32px',
  fontSize: '18px',
  fontWeight: 700,
  borderRadius: '8px',
  border: '3px solid',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  userSelect: 'none',
  outline: 'none',
  transition: 'box-shadow 100ms ease-out',
  letterSpacing: '0.02em',
};

// High contrast colors meeting WCAG AAA (7:1 ratio)
const STATUS_STYLES: Record<string, CSSProperties> = {
  idle: {
    backgroundColor: '#1e3a8a', // Dark blue
    borderColor: '#1e40af',
    color: '#ffffff',
  },
  confirming: {
    backgroundColor: '#92400e', // Dark amber
    borderColor: '#b45309',
    color: '#ffffff',
  },
  pending: {
    backgroundColor: '#374151', // Dark gray
    borderColor: '#4b5563',
    color: '#ffffff',
    cursor: 'wait',
  },
  confirmed: {
    backgroundColor: '#065f46', // Dark green
    borderColor: '#047857',
    color: '#ffffff',
  },
  failed: {
    backgroundColor: '#991b1b', // Dark red
    borderColor: '#b91c1c',
    color: '#ffffff',
  },
};

const DISABLED_STYLES: CSSProperties = {
  backgroundColor: '#6b7280',
  borderColor: '#4b5563',
  color: '#ffffff',
  cursor: 'not-allowed',
};

const FOCUS_RING: CSSProperties = {
  boxShadow: '0 0 0 4px #fbbf24, 0 0 0 6px #1e3a8a',
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * A11yLens CriticalButton — Maximum accessibility for all users.
 *
 * Features:
 * - 56px min-height (extra large touch target)
 * - WCAG AAA contrast (7:1 ratio)
 * - 18px font size for readability
 * - Bold focus ring (4px yellow + 2px blue)
 * - Clear status indicators
 *
 * @example
 * ```tsx
 * <LensProvider initialLens={A11yLens}>
 *   <Lens.CriticalButton state={state} onAction={commit}>
 *     Confirm Action
 *   </Lens.CriticalButton>
 * </LensProvider>
 * ```
 */
export const CriticalButton: FC<CriticalButtonProps> = ({
  state,
  onAction,
  children,
  labels,
  disabled = false,
  className = '',
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const handleClick = useCallback(() => {
    if (!disabled && state.status !== 'pending') {
      onAction();
    }
  }, [disabled, state.status, onAction]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!disabled && state.status !== 'pending') {
          onAction();
        }
      }
    },
    [disabled, state.status, onAction]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Get label for current state
  const getLabel = (): React.ReactNode => {
    switch (state.status) {
      case 'confirming':
        return labels?.confirming ?? children;
      case 'pending':
        return labels?.pending ?? children;
      case 'confirmed':
        return labels?.confirmed ?? children;
      case 'failed':
        return labels?.failed ?? children;
      default:
        return children;
    }
  };

  // Compute styles
  const computedStyles: CSSProperties = {
    ...BASE_STYLES,
    ...(disabled ? DISABLED_STYLES : STATUS_STYLES[state.status] ?? STATUS_STYLES.idle),
    ...(isFocused ? FOCUS_RING : {}),
  };

  const isDisabled = disabled || state.status === 'pending';

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={isDisabled}
      className={className}
      style={computedStyles}
      aria-disabled={isDisabled}
      aria-busy={state.status === 'pending'}
      aria-live="polite"
      data-status={state.status}
      data-sigil-critical-button
      data-sigil-a11y
    >
      {state.status === 'pending' && (
        <span aria-hidden="true" style={{ fontSize: '20px' }}>
          ⏳
        </span>
      )}
      {state.status === 'confirmed' && (
        <span aria-hidden="true" style={{ fontSize: '20px' }}>
          ✓
        </span>
      )}
      {state.status === 'failed' && (
        <span aria-hidden="true" style={{ fontSize: '20px' }}>
          ✗
        </span>
      )}
      {getLabel()}
    </button>
  );
};

CriticalButton.displayName = 'A11yLens.CriticalButton';
