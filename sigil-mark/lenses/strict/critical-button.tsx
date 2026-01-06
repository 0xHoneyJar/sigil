/**
 * Sigil v2.0 — StrictLens CriticalButton
 *
 * High-stakes button with 48px min-height, high contrast,
 * and no distracting animations. Forced in critical+financial zones.
 *
 * @module lenses/strict/CriticalButton
 */

import React, { type FC, type CSSProperties, useCallback } from 'react';
import type { CriticalButtonProps } from '../types';

// =============================================================================
// STYLES
// =============================================================================

const BASE_STYLES: CSSProperties = {
  minHeight: '48px',
  padding: '14px 28px',
  fontSize: '16px',
  fontWeight: 700,
  borderRadius: '4px',
  border: '2px solid',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  userSelect: 'none',
  outline: 'none',
  // No transition for strict mode - instant feedback
};

const STATUS_STYLES: Record<string, CSSProperties> = {
  idle: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1e40af',
    color: '#ffffff',
  },
  confirming: {
    backgroundColor: '#d97706',
    borderColor: '#b45309',
    color: '#ffffff',
  },
  pending: {
    backgroundColor: '#4b5563',
    borderColor: '#374151',
    color: '#ffffff',
    cursor: 'wait',
  },
  confirmed: {
    backgroundColor: '#059669',
    borderColor: '#047857',
    color: '#ffffff',
  },
  failed: {
    backgroundColor: '#dc2626',
    borderColor: '#b91c1c',
    color: '#ffffff',
  },
};

const DISABLED_STYLES: CSSProperties = {
  backgroundColor: '#9ca3af',
  borderColor: '#6b7280',
  color: '#ffffff',
  cursor: 'not-allowed',
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * StrictLens CriticalButton — Maximum clarity for critical actions.
 *
 * Features:
 * - 48px min-height (larger touch target)
 * - High contrast colors
 * - No animations (instant feedback)
 * - Clear status differentiation
 * - Bold borders
 *
 * @example
 * ```tsx
 * // Automatically used in CriticalZone with financial=true
 * <CriticalZone financial>
 *   <Lens.CriticalButton state={payment.state} onAction={commit}>
 *     Confirm Payment
 *   </Lens.CriticalButton>
 * </CriticalZone>
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

  // Compute styles (no hover/press effects in strict mode)
  const computedStyles: CSSProperties = {
    ...BASE_STYLES,
    ...(disabled ? DISABLED_STYLES : STATUS_STYLES[state.status] ?? STATUS_STYLES.idle),
  };

  const isDisabled = disabled || state.status === 'pending';

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      className={className}
      style={computedStyles}
      aria-disabled={isDisabled}
      aria-busy={state.status === 'pending'}
      data-status={state.status}
      data-sigil-critical-button
      data-sigil-strict
    >
      {state.status === 'pending' && (
        <span aria-hidden="true" style={{ marginRight: '4px' }}>
          ⏳
        </span>
      )}
      {getLabel()}
    </button>
  );
};

CriticalButton.displayName = 'StrictLens.CriticalButton';
