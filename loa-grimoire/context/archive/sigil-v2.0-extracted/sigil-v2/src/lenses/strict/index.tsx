// Sigil v2.0 — Lens: Strict
// Vanilla lens forced in critical/financial zones
// No overlays, no hints, maximum clarity

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
 * StrictLens.CriticalButton
 * 
 * Maximum clarity version:
 * - No animations that might distract
 * - Clear status text
 * - High contrast
 */
export function CriticalButton({
  state,
  onAction,
  children,
  labels = {},
}: CriticalButtonProps) {
  const isDisabled = state.status !== 'idle' && state.status !== 'failed';

  // High contrast, no fancy effects
  const statusStyles = {
    idle: 'bg-black text-white border-2 border-black',
    confirming: 'bg-neutral-700 text-white border-2 border-neutral-700',
    pending: 'bg-neutral-500 text-white border-2 border-neutral-500',
    confirmed: 'bg-green-700 text-white border-2 border-green-700',
    failed: 'bg-red-700 text-white border-2 border-red-700',
  };

  return (
    <button
      type="button"
      onClick={onAction}
      disabled={isDisabled}
      aria-busy={state.status === 'pending'}
      aria-invalid={state.status === 'failed'}
      className={`
        min-h-[48px] px-6 py-3
        rounded-lg font-bold text-base
        focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-black
        ${statusStyles[state.status]}
        ${isDisabled ? 'cursor-not-allowed' : ''}
      `}
      // No scale animations in StrictLens
    >
      {state.status === 'idle' && children}
      {state.status === 'confirming' && (
        <span role="status">{labels.confirming || 'Confirming...'}</span>
      )}
      {state.status === 'pending' && (
        <span role="status" className="flex items-center gap-2">
          <span className="animate-pulse">●</span>
          {labels.pending || 'Processing...'}
        </span>
      )}
      {state.status === 'confirmed' && (
        <span role="status">{labels.confirmed || '✓ Complete'}</span>
      )}
      {state.status === 'failed' && (
        <span role="alert">
          {labels.failed || 'Error'}: {state.error?.message || 'Please try again'}
        </span>
      )}
      {/* No prediction indicator in StrictLens - only truth */}
    </button>
  );
}

CriticalButton.displayName = 'StrictCriticalButton';

// =============================================================================
// GLASS BUTTON
// =============================================================================

/**
 * StrictLens.GlassButton
 * 
 * Clear secondary button:
 * - High contrast
 * - No hover effects
 */
export function GlassButton({
  onAction,
  children,
  variant = 'secondary',
}: GlassButtonProps) {
  const variantStyles = {
    primary: 'bg-blue-700 text-white border-2 border-blue-700',
    secondary: 'bg-white text-black border-2 border-black',
    ghost: 'bg-transparent text-black border-2 border-transparent',
  };

  return (
    <button
      type="button"
      onClick={onAction}
      className={`
        min-h-[48px] px-6 py-3
        rounded-lg font-bold text-base
        focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-black
        ${variantStyles[variant]}
      `}
    >
      {children}
    </button>
  );
}

GlassButton.displayName = 'StrictGlassButton';

// =============================================================================
// MACHINERY ITEM
// =============================================================================

/**
 * StrictLens.MachineryItem
 * 
 * Clear list item:
 * - High contrast active state
 * - No fancy animations
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
        px-4 py-4 cursor-default select-none
        border-l-4
        ${isActive
          ? 'bg-blue-100 border-l-blue-700 dark:bg-blue-900 dark:border-l-blue-400'
          : 'border-l-transparent'
        }
      `}
    >
      {children}
    </div>
  );
}

MachineryItem.displayName = 'StrictMachineryItem';

// =============================================================================
// LENS EXPORT
// =============================================================================

export const StrictLens: Lens = {
  name: 'StrictLens',
  classification: 'cosmetic',
  CriticalButton,
  GlassButton,
  MachineryItem,
};

export default StrictLens;
