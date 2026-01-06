/**
 * Sigil v2.0 — A11yLens MachineryItem
 *
 * Accessibility-focused list item with large touch targets, high contrast,
 * and clear focus indicators for WCAG AAA compliance.
 *
 * @module lenses/a11y/MachineryItem
 */

import React, { type FC, type CSSProperties, useState, useCallback } from 'react';
import type { MachineryItemProps } from '../types';

// =============================================================================
// STYLES
// =============================================================================

const BASE_STYLES: CSSProperties = {
  padding: '18px 20px',
  minHeight: '56px',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  userSelect: 'none',
  outline: 'none',
  backgroundColor: '#ffffff',
  border: '3px solid #d1d5db',
  transition: 'box-shadow 100ms ease-out',
  fontSize: '16px',
};

const ACTIVE_STYLES: CSSProperties = {
  backgroundColor: '#dbeafe',
  borderColor: '#1e3a8a',
};

const FOCUS_RING: CSSProperties = {
  boxShadow: '0 0 0 4px #fbbf24, 0 0 0 6px #1e3a8a',
};

const DELETE_BUTTON_STYLES: CSSProperties = {
  minHeight: '44px',
  padding: '10px 16px',
  fontSize: '14px',
  fontWeight: 700,
  color: '#ffffff',
  backgroundColor: '#991b1b',
  border: '2px solid #7f1d1d',
  borderRadius: '6px',
  cursor: 'pointer',
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * A11yLens MachineryItem — Maximum accessibility for admin UI.
 *
 * Features:
 * - 56px min-height (extra large touch target)
 * - WCAG AAA contrast
 * - Bold focus ring (4px yellow + 2px blue)
 * - Large, high-contrast delete button
 * - 16px font size for readability
 *
 * @example
 * ```tsx
 * <A11yLens.MachineryItem
 *   onAction={() => selectItem(id)}
 *   onDelete={() => deleteItem(id)}
 *   isActive={activeId === id}
 * >
 *   Item Content
 * </A11yLens.MachineryItem>
 * ```
 */
export const MachineryItem: FC<MachineryItemProps> = ({
  onAction,
  onDelete,
  isActive = false,
  children,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);

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

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

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
    ...(isActive ? ACTIVE_STYLES : {}),
    ...(isFocused ? FOCUS_RING : {}),
  };

  return (
    <div
      role="option"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
      style={computedStyles}
      aria-selected={isActive}
      data-active={isActive}
      data-sigil-machinery-item
      data-sigil-a11y
    >
      <div style={{ flex: 1, fontWeight: isActive ? 600 : 400 }}>{children}</div>
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

MachineryItem.displayName = 'A11yLens.MachineryItem';
