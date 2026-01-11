// Sigil v2.0 — Lens: A11y
// Accessibility-focused lens with high contrast and large targets

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
 * A11yLens.CriticalButton
 * 
 * Accessibility-optimized:
 * - 56px minimum touch target (larger than 44px)
 * - 7:1 contrast ratio (WCAG AAA)
 * - Clear screen reader announcements
 * - Reduced motion
 */
export function CriticalButton({
  state,
  onAction,
  children,
  labels = {},
}: CriticalButtonProps) {
  const isDisabled = state.status !== 'idle' && state.status !== 'failed';

  const statusStyles = {
    idle: 'bg-black text-white',
    confirming: 'bg-blue-900 text-white',
    pending: 'bg-blue-800 text-white',
    confirmed: 'bg-green-900 text-white',
    failed: 'bg-red-900 text-white',
  };

  return (
    <button
      type="button"
      onClick={onAction}
      disabled={isDisabled}
      aria-busy={state.status === 'pending'}
      aria-invalid={state.status === 'failed'}
      aria-describedby={state.status === 'failed' ? 'error-message' : undefined}
      className={`
        min-h-[56px] px-8 py-4
        text-xl font-bold
        border-4 border-current
        rounded-xl
        focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-yellow-400
        ${statusStyles[state.status]}
        ${isDisabled ? 'cursor-not-allowed' : ''}
      `}
      // No scale transforms - reduced motion
    >
      {/* Screen reader live region */}
      <span aria-live="polite" className="sr-only">
        {state.status === 'pending' && 'Processing your request. Please wait.'}
        {state.status === 'confirmed' && 'Action completed successfully.'}
        {state.status === 'failed' && `Error: ${state.error?.message}`}
      </span>

      {/* Visible content */}
      {state.status === 'idle' && children}
      {state.status === 'confirming' && (labels.confirming || 'Please confirm...')}
      {state.status === 'pending' && (
        <span className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">⏳</span>
          {labels.pending || 'Processing...'}
        </span>
      )}
      {state.status === 'confirmed' && (
        <span className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">✓</span>
          {labels.confirmed || 'Complete'}
        </span>
      )}
      {state.status === 'failed' && (
        <span id="error-message" role="alert">
          <span className="text-2xl" aria-hidden="true">⚠</span>
          {' '}{labels.failed || 'Error'}: {state.error?.message}
        </span>
      )}
    </button>
  );
}

CriticalButton.displayName = 'A11yCriticalButton';

// =============================================================================
// GLASS BUTTON
// =============================================================================

/**
 * A11yLens.GlassButton
 * 
 * Accessibility-optimized secondary button:
 * - 56px minimum touch target
 * - High contrast border
 */
export function GlassButton({
  onAction,
  children,
  variant = 'secondary',
}: GlassButtonProps) {
  const variantStyles = {
    primary: 'bg-blue-800 text-white border-blue-800',
    secondary: 'bg-white text-black border-black',
    ghost: 'bg-transparent text-black border-black',
  };

  return (
    <button
      type="button"
      onClick={onAction}
      className={`
        min-h-[56px] px-8 py-4
        text-xl font-bold
        border-4
        rounded-xl
        focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-yellow-400
        ${variantStyles[variant]}
      `}
    >
      {children}
    </button>
  );
}

GlassButton.displayName = 'A11yGlassButton';

// =============================================================================
// MACHINERY ITEM
// =============================================================================

/**
 * A11yLens.MachineryItem
 * 
 * Accessibility-optimized list item:
 * - Larger padding for easier targeting
 * - High contrast focus state
 * - Clear selection indicator
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
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onAction?.();
        }
        if ((e.key === 'Delete' || e.key === 'Backspace') && onDelete) {
          e.preventDefault();
          onDelete();
        }
      }}
      className={`
        px-6 py-5 cursor-default
        text-lg
        border-l-8
        focus:outline-none focus:ring-4 focus:ring-inset focus:ring-yellow-400
        ${isActive
          ? 'bg-blue-100 border-l-blue-800 font-bold dark:bg-blue-900 dark:border-l-blue-300'
          : 'border-l-transparent'
        }
      `}
    >
      {/* Selection indicator for screen readers */}
      {isActive && <span className="sr-only">Selected: </span>}
      {children}
    </div>
  );
}

MachineryItem.displayName = 'A11yMachineryItem';

// =============================================================================
// LENS EXPORT
// =============================================================================

export const A11yLens: Lens = {
  name: 'A11yLens',
  classification: 'cosmetic',
  CriticalButton,
  GlassButton,
  MachineryItem,
};

export default A11yLens;
