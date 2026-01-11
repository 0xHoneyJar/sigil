// Sigil v2.0 — Lens: Default
// Standard UI components that consume state streams

import React from 'react';
import type {
  CriticalButtonProps,
  GlassButtonProps,
  MachineryItemProps,
  Lens,
} from '../../types';

// =============================================================================
// CRITICAL BUTTON
// =============================================================================

/**
 * DefaultLens.CriticalButton
 * 
 * Standard critical button with:
 * - 44px minimum touch target
 * - Status-based styling
 * - Risk-based focus ring color
 */
export function CriticalButton({
  state,
  onAction,
  children,
  labels = {},
}: CriticalButtonProps) {
  const isDisabled = state.status !== 'idle' && state.status !== 'failed';

  const statusStyles = {
    idle: 'bg-neutral-900 text-white hover:bg-neutral-800',
    confirming: 'bg-neutral-700 text-white',
    pending: 'bg-neutral-600 text-white',
    confirmed: 'bg-green-600 text-white',
    failed: 'bg-red-600 text-white',
  };

  const riskRingStyles = {
    low: 'focus:ring-green-500',
    medium: 'focus:ring-yellow-500',
    high: 'focus:ring-red-500',
  };

  return (
    <button
      type="button"
      onClick={onAction}
      disabled={isDisabled}
      className={`
        min-h-[44px] px-4 py-3 
        rounded-lg font-medium
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${statusStyles[state.status]}
        ${riskRingStyles[state.risk]}
        ${isDisabled ? 'cursor-not-allowed opacity-80' : ''}
        active:scale-[0.98]
      `}
    >
      {state.status === 'idle' && children}
      {state.status === 'confirming' && (labels.confirming || 'Hold to confirm...')}
      {state.status === 'pending' && (
        <span className="flex items-center gap-2">
          <Spinner />
          {labels.pending || 'Confirming...'}
        </span>
      )}
      {state.status === 'confirmed' && (labels.confirmed || '✓ Done')}
      {state.status === 'failed' && (
        <span>{labels.failed || 'Failed'}: {state.error?.message}</span>
      )}

      {/* Prediction indicator */}
      {state.selfPrediction.position && (
        <span
          className="ml-2 text-xs opacity-60"
          style={{ opacity: state.selfPrediction.position.confidence }}
        >
          (predicting)
        </span>
      )}
    </button>
  );
}

CriticalButton.displayName = 'CriticalButton';

// =============================================================================
// GLASS BUTTON
// =============================================================================

/**
 * DefaultLens.GlassButton
 * 
 * Secondary/cancel button with:
 * - 44px minimum touch target
 * - Subtle hover effects
 */
export function GlassButton({
  onAction,
  children,
  variant = 'secondary',
}: GlassButtonProps) {
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700',
    ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800',
  };

  return (
    <button
      type="button"
      onClick={onAction}
      className={`
        min-h-[44px] px-4 py-3
        rounded-lg font-medium
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${variantStyles[variant]}
        active:scale-[0.98]
      `}
    >
      {children}
    </button>
  );
}

GlassButton.displayName = 'GlassButton';

// =============================================================================
// MACHINERY ITEM
// =============================================================================

/**
 * DefaultLens.MachineryItem
 * 
 * List item with:
 * - Keyboard-driven interaction
 * - Active state highlighting
 */
export function MachineryItem({
  onAction,
  onDelete,
  isActive = false,
  children,
}: MachineryItemProps) {
  return (
    <div
      role="option"
      aria-selected={isActive}
      onClick={onAction}
      className={`
        px-4 py-3 cursor-default select-none
        transition-colors duration-100
        ${isActive
          ? 'bg-blue-50 dark:bg-blue-900/20'
          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
        }
      `}
    >
      {children}
    </div>
  );
}

MachineryItem.displayName = 'MachineryItem';

// =============================================================================
// HELPERS
// =============================================================================

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// =============================================================================
// LENS EXPORT
// =============================================================================

export const DefaultLens: Lens = {
  name: 'DefaultLens',
  classification: 'cosmetic',
  CriticalButton,
  GlassButton,
  MachineryItem,
};

export default DefaultLens;
