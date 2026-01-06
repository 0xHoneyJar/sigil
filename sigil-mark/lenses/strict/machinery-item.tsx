/**
 * Sigil v2.0 — StrictLens MachineryItem
 *
 * Clear active state with bold border indicator.
 * No decorative hover effects.
 *
 * @module lenses/strict/MachineryItem
 */

import React, { type FC, type CSSProperties, useCallback } from 'react';
import type { MachineryItemProps } from '../types';

// =============================================================================
// STYLES
// =============================================================================

const BASE_STYLES: CSSProperties = {
  padding: '14px 18px',
  borderRadius: '4px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  userSelect: 'none',
  outline: 'none',
  backgroundColor: '#ffffff',
  border: '2px solid #e5e7eb',
  // No transition for strict mode
};

const ACTIVE_STYLES: CSSProperties = {
  backgroundColor: '#eff6ff',
  borderColor: '#1d4ed8',
};

const DELETE_BUTTON_STYLES: CSSProperties = {
  padding: '6px 12px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#dc2626',
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '4px',
  cursor: 'pointer',
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * StrictLens MachineryItem — Clear selection state for admin UI.
 *
 * Features:
 * - Bold border indicator for active state
 * - High contrast selection background
 * - Always-visible delete button (when handler provided)
 * - No hover decorations
 *
 * @example
 * ```tsx
 * <StrictLens.MachineryItem
 *   onAction={() => selectItem(id)}
 *   onDelete={() => deleteItem(id)}
 *   isActive={activeId === id}
 * >
 *   Item Content
 * </StrictLens.MachineryItem>
 * ```
 */
export const MachineryItem: FC<MachineryItemProps> = ({
  onAction,
  onDelete,
  isActive = false,
  children,
  className = '',
}) => {
  const handleClick = useCallback(() => {
    onAction();
  }, [onAction]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onAction();
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && onDelete) {
        event.preventDefault();
        onDelete();
      }
    },
    [onAction, onDelete]
  );

  const handleDeleteClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onDelete?.();
    },
    [onDelete]
  );

  // Compute styles (no hover effects in strict mode)
  const computedStyles: CSSProperties = {
    ...BASE_STYLES,
    ...(isActive ? ACTIVE_STYLES : {}),
  };

  return (
    <div
      role="option"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={className}
      style={computedStyles}
      aria-selected={isActive}
      data-active={isActive}
      data-sigil-machinery-item
      data-sigil-strict
    >
      <div style={{ flex: 1 }}>{children}</div>
      {onDelete && (
        <button
          type="button"
          onClick={handleDeleteClick}
          style={DELETE_BUTTON_STYLES}
          aria-label="Delete item"
        >
          Delete
        </button>
      )}
    </div>
  );
};

MachineryItem.displayName = 'StrictLens.MachineryItem';
