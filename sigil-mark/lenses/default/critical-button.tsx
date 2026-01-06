/**
 * Sigil v2.0 — DefaultLens CriticalButton
 *
 * Standard critical button with 44px min-height, status-based styling,
 * and tap scale animation.
 *
 * @module lenses/default/CriticalButton
 */

import React, { type FC, type CSSProperties, useState, useCallback } from 'react';
import type { CriticalButtonProps } from '../types';

// =============================================================================
// STYLES
// =============================================================================

const BASE_STYLES: CSSProperties = {
  minHeight: '44px',
  padding: '12px 24px',
  fontSize: '16px',
  fontWeight: 600,
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 150ms ease-out',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  userSelect: 'none',
  outline: 'none',
};

const STATUS_STYLES: Record<string, CSSProperties> = {
  idle: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  confirming: {
    backgroundColor: '#f59e0b',
    color: '#ffffff',
  },
  pending: {
    backgroundColor: '#6b7280',
    color: '#ffffff',
    cursor: 'not-allowed',
  },
  confirmed: {
    backgroundColor: '#10b981',
    color: '#ffffff',
  },
  failed: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
  },
};

const DISABLED_STYLES: CSSProperties = {
  backgroundColor: '#d1d5db',
  color: '#9ca3af',
  cursor: 'not-allowed',
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * DefaultLens CriticalButton — Standard button for critical actions.
 *
 * Features:
 * - 44px min-height (touch-friendly)
 * - Status-based styling (idle, confirming, pending, confirmed, failed)
 * - Tap scale animation
 * - Focus ring for accessibility
 *
 * @example
 * ```tsx
 * <DefaultLens.CriticalButton
 *   state={payment.state}
 *   onAction={() => payment.commit()}
 *   labels={{ pending: 'Processing...' }}
 * >
 *   Pay $500
 * </DefaultLens.CriticalButton>
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
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = useCallback(() => {
    if (!disabled && state.status !== 'pending') {
      setIsPressed(true);
    }
  }, [disabled, state.status]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

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
          setIsPressed(true);
          onAction();
        }
      }
    },
    [disabled, state.status, onAction]
  );

  const handleKeyUp = useCallback(() => {
    setIsPressed(false);
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
    transform: isPressed ? 'scale(0.96)' : 'scale(1)',
    boxShadow: isPressed
      ? '0 1px 2px rgba(0, 0, 0, 0.1)'
      : '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const isDisabled = disabled || state.status === 'pending';

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      disabled={isDisabled}
      className={className}
      style={computedStyles}
      aria-disabled={isDisabled}
      aria-busy={state.status === 'pending'}
      data-status={state.status}
      data-sigil-critical-button
    >
      {state.status === 'pending' && (
        <span
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
          aria-hidden="true"
        />
      )}
      {getLabel()}
    </button>
  );
};

CriticalButton.displayName = 'DefaultLens.CriticalButton';
