/**
 * Sigil v2.0 — DefaultLens MachineryItem
 *
 * Standard list item for MachineryLayout with hover highlighting
 * and active state styling.
 *
 * @module lenses/default/MachineryItem
 */

import React, { type FC, type CSSProperties, useState, useCallback } from 'react';
import type { MachineryItemProps } from '../types';

// =============================================================================
// STYLES
// =============================================================================

const BASE_STYLES: CSSProperties = {
  padding: '12px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 100ms ease-out',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  userSelect: 'none',
  outline: 'none',
  backgroundColor: 'transparent',
  border: '1px solid transparent',
};

const HOVER_STYLES: CSSProperties = {
  backgroundColor: 'rgba(59, 130, 246, 0.05)',
};

const ACTIVE_STYLES: CSSProperties = {
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  borderColor: '#3b82f6',
};

const DELETE_BUTTON_STYLES: CSSProperties = {
  padding: '4px 8px',
  fontSize: '12px',
  color: '#ef4444',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  opacity: 0,
  transition: 'opacity 100ms ease-out',
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * DefaultLens MachineryItem — Standard list item for admin UI.
 *
 * Features:
 * - Hover highlighting
 * - Active state with border
 * - Optional delete button (visible on hover)
 * - Keyboard accessible
 *
 * @example
 * ```tsx
 * <DefaultLens.MachineryItem
 *   onAction={() => selectItem(id)}
 *   onDelete={() => deleteItem(id)}
 *   isActive={activeId === id}
 * >
 *   Item Content
 * </DefaultLens.MachineryItem>
 * ```
 */
export const MachineryItem: FC<MachineryItemProps> = ({
  onAction,
  onDelete,
  isActive = false,
  children,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleClick = useCallback(() => {
    onAction();
  }, [onAction]);

  const handleDoubleClick = useCallback(() => {
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

  // Compute styles
  const computedStyles: CSSProperties = {
    ...BASE_STYLES,
    ...(isHovered && !isActive ? HOVER_STYLES : {}),
    ...(isActive ? ACTIVE_STYLES : {}),
  };

  const deleteButtonStyles: CSSProperties = {
    ...DELETE_BUTTON_STYLES,
    opacity: isHovered && onDelete ? 1 : 0,
  };

  return (
    <div
      role="option"
      tabIndex={0}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      className={className}
      style={computedStyles}
      aria-selected={isActive}
      data-active={isActive}
      data-sigil-machinery-item
    >
      <div style={{ flex: 1 }}>{children}</div>
      {onDelete && (
        <button
          type="button"
          onClick={handleDeleteClick}
          style={deleteButtonStyles}
          aria-label="Delete item"
          tabIndex={-1}
        >
          Delete
        </button>
      )}
    </div>
  );
};

MachineryItem.displayName = 'DefaultLens.MachineryItem';
