/**
 * Sigil v2.0 — MachineryLayout
 *
 * Layout primitive for keyboard-driven admin UI. Provides zone context
 * AND structural physics (keyboard navigation) in a single component.
 *
 * Layouts ARE Zones. Physics is DOM, not lint.
 *
 * @module layouts/MachineryLayout
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  type ReactNode,
  type ReactElement,
  type FC,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';
import { ZoneContext, type ZoneContextValue } from './context';

// =============================================================================
// TYPES
// =============================================================================

/**
 * MachineryLayout props.
 */
export interface MachineryLayoutProps {
  /** Child content */
  children: ReactNode;
  /** Key for state persistence */
  stateKey?: string;
  /** Callback when item is activated (Enter/Space) */
  onAction?: (id: string) => void;
  /** Callback when item is deleted (Delete/Backspace) */
  onDelete?: (id: string) => void;
  /** Optional className for styling */
  className?: string;
}

/**
 * MachineryLayout.List props.
 */
export interface MachineryLayoutListProps {
  /** Item children */
  children: ReactNode;
  /** Optional className for styling */
  className?: string;
}

/**
 * MachineryLayout.Item props.
 */
export interface MachineryLayoutItemProps {
  /** Unique identifier for the item */
  id: string;
  /** Item content */
  children: ReactNode;
  /** Optional className for styling */
  className?: string;
}

/**
 * MachineryLayout.Search props.
 */
export interface MachineryLayoutSearchProps {
  /** Placeholder text */
  placeholder?: string;
  /** Controlled value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Optional className for styling */
  className?: string;
}

/**
 * MachineryLayout.Empty props.
 */
export interface MachineryLayoutEmptyProps {
  /** Empty state content */
  children: ReactNode;
  /** Optional className for styling */
  className?: string;
}

// =============================================================================
// INTERNAL CONTEXT
// =============================================================================

/**
 * Internal context for MachineryLayout.
 * @internal
 */
interface MachineryLayoutInternalContextValue {
  /** Currently active item ID */
  activeId: string | null;
  /** Set active item */
  setActiveId: (id: string | null) => void;
  /** Registered item IDs in order */
  itemIds: string[];
  /** Register an item */
  registerItem: (id: string) => void;
  /** Unregister an item */
  unregisterItem: (id: string) => void;
  /** Action callback */
  onAction?: (id: string) => void;
  /** Delete callback */
  onDelete?: (id: string) => void;
}

const MachineryLayoutInternalContext =
  createContext<MachineryLayoutInternalContextValue | null>(null);

function useMachineryLayoutInternal(): MachineryLayoutInternalContextValue {
  const context = useContext(MachineryLayoutInternalContext);
  if (!context) {
    throw new Error(
      'MachineryLayout subcomponents must be used within a MachineryLayout'
    );
  }
  return context;
}

// =============================================================================
// KEYBOARD NAVIGATION
// =============================================================================

/**
 * Keyboard navigation handler.
 * @internal
 */
function useKeyboardNavigation(
  itemIds: string[],
  activeId: string | null,
  setActiveId: (id: string | null) => void,
  onAction?: (id: string) => void,
  onDelete?: (id: string) => void
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (itemIds.length === 0) return;

      const currentIndex = activeId ? itemIds.indexOf(activeId) : -1;

      switch (event.key) {
        // Arrow navigation
        case 'ArrowDown':
        case 'j': // Vim-style
          event.preventDefault();
          if (currentIndex < itemIds.length - 1) {
            setActiveId(itemIds[currentIndex + 1]);
          } else if (currentIndex === -1 && itemIds.length > 0) {
            setActiveId(itemIds[0]);
          }
          break;

        case 'ArrowUp':
        case 'k': // Vim-style
          event.preventDefault();
          if (currentIndex > 0) {
            setActiveId(itemIds[currentIndex - 1]);
          } else if (currentIndex === -1 && itemIds.length > 0) {
            setActiveId(itemIds[itemIds.length - 1]);
          }
          break;

        // Activate item
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (activeId && onAction) {
            onAction(activeId);
          }
          break;

        // Delete item
        case 'Delete':
        case 'Backspace':
          event.preventDefault();
          if (activeId && onDelete) {
            onDelete(activeId);
          }
          break;

        // Deselect
        case 'Escape':
          event.preventDefault();
          setActiveId(null);
          break;

        // Jump to first
        case 'Home':
          event.preventDefault();
          if (itemIds.length > 0) {
            setActiveId(itemIds[0]);
          }
          break;

        // Jump to last
        case 'End':
          event.preventDefault();
          if (itemIds.length > 0) {
            setActiveId(itemIds[itemIds.length - 1]);
          }
          break;
      }
    },
    [itemIds, activeId, setActiveId, onAction, onDelete]
  );

  return handleKeyDown;
}

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

/**
 * MachineryLayout.List — Container for items.
 *
 * @example
 * ```tsx
 * <MachineryLayout.List>
 *   {items.map(item => (
 *     <MachineryLayout.Item key={item.id} id={item.id}>
 *       {item.name}
 *     </MachineryLayout.Item>
 *   ))}
 * </MachineryLayout.List>
 * ```
 */
const MachineryLayoutList: FC<MachineryLayoutListProps> = ({
  children,
  className = '',
}) => {
  // Validate we're inside a MachineryLayout
  useMachineryLayoutInternal();

  return (
    <div
      className={`sigil-machinery-list ${className}`.trim()}
      data-sigil-slot="list"
      role="listbox"
    >
      {children}
    </div>
  );
};

MachineryLayoutList.displayName = 'MachineryLayout.List';

/**
 * MachineryLayout.Item — Single list item.
 *
 * @example
 * ```tsx
 * <MachineryLayout.Item id="invoice-1">
 *   Invoice #001 - $500
 * </MachineryLayout.Item>
 * ```
 */
const MachineryLayoutItem: FC<MachineryLayoutItemProps> = ({
  id,
  children,
  className = '',
}) => {
  const { activeId, setActiveId, registerItem, unregisterItem, onAction } =
    useMachineryLayoutInternal();

  const isActive = activeId === id;

  // Register/unregister on mount/unmount
  useEffect(() => {
    registerItem(id);
    return () => unregisterItem(id);
  }, [id, registerItem, unregisterItem]);

  const handleClick = useCallback(() => {
    setActiveId(id);
  }, [id, setActiveId]);

  const handleDoubleClick = useCallback(() => {
    if (onAction) {
      onAction(id);
    }
  }, [id, onAction]);

  return (
    <div
      className={`sigil-machinery-item ${className}`.trim()}
      data-sigil-slot="item"
      data-sigil-active={isActive}
      data-sigil-item-id={id}
      role="option"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{
        cursor: 'pointer',
        backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        borderLeft: isActive ? '3px solid rgb(59, 130, 246)' : '3px solid transparent',
        padding: '8px 12px',
        transition: 'all 100ms ease-out',
      }}
    >
      {children}
    </div>
  );
};

MachineryLayoutItem.displayName = 'MachineryLayout.Item';

/**
 * MachineryLayout.Search — Filter input.
 *
 * @example
 * ```tsx
 * <MachineryLayout.Search
 *   placeholder="Filter invoices..."
 *   value={filter}
 *   onChange={setFilter}
 * />
 * ```
 */
const MachineryLayoutSearch: FC<MachineryLayoutSearchProps> = ({
  placeholder = 'Search...',
  value,
  onChange,
  className = '',
}) => {
  // Validate we're inside a MachineryLayout
  useMachineryLayoutInternal();

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event.target.value);
    },
    [onChange]
  );

  return (
    <input
      type="text"
      className={`sigil-machinery-search ${className}`.trim()}
      data-sigil-slot="search"
      placeholder={placeholder}
      value={value ?? ''}
      onChange={handleChange}
      style={{
        width: '100%',
        padding: '8px 12px',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '4px',
        marginBottom: '8px',
      }}
    />
  );
};

MachineryLayoutSearch.displayName = 'MachineryLayout.Search';

/**
 * MachineryLayout.Empty — Empty state.
 *
 * @example
 * ```tsx
 * <MachineryLayout.Empty>
 *   No invoices found
 * </MachineryLayout.Empty>
 * ```
 */
const MachineryLayoutEmpty: FC<MachineryLayoutEmptyProps> = ({
  children,
  className = '',
}) => {
  // Validate we're inside a MachineryLayout
  useMachineryLayoutInternal();

  return (
    <div
      className={`sigil-machinery-empty ${className}`.trim()}
      data-sigil-slot="empty"
      style={{
        padding: '24px',
        textAlign: 'center',
        color: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      {children}
    </div>
  );
};

MachineryLayoutEmpty.displayName = 'MachineryLayout.Empty';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * MachineryLayout — Keyboard-driven list UI.
 *
 * Provides:
 * - Zone context: `{ type: 'admin', timeAuthority: 'optimistic' }`
 * - Keyboard navigation: Arrow keys, j/k, Enter, Delete, Escape, Home/End
 *
 * In v2.0, Layouts ARE Zones. MachineryLayout replaces the old
 * `<SigilZone material="machinery">` pattern.
 *
 * @example Basic usage
 * ```tsx
 * <MachineryLayout
 *   stateKey="invoices"
 *   onAction={(id) => router.push(`/invoices/${id}`)}
 *   onDelete={(id) => deleteInvoice(id)}
 * >
 *   <MachineryLayout.Search placeholder="Filter..." />
 *   <MachineryLayout.List>
 *     {invoices.map((inv) => (
 *       <MachineryLayout.Item key={inv.id} id={inv.id}>
 *         {inv.number} - ${inv.amount}
 *       </MachineryLayout.Item>
 *     ))}
 *   </MachineryLayout.List>
 * </MachineryLayout>
 * ```
 *
 * @example Keyboard shortcuts
 * - Arrow Up/Down or j/k: Navigate items
 * - Enter/Space: Activate current item
 * - Delete/Backspace: Delete current item
 * - Escape: Deselect
 * - Home/End: Jump to first/last
 */
function MachineryLayout({
  children,
  stateKey,
  onAction,
  onDelete,
  className = '',
}: MachineryLayoutProps): ReactElement {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [itemIds, setItemIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create zone context value
  const zoneContextValue: ZoneContextValue = useMemo(
    () => ({
      type: 'admin',
      timeAuthority: 'optimistic', // Admin zones use optimistic
    }),
    []
  );

  // Register/unregister items
  const registerItem = useCallback((id: string) => {
    setItemIds((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }, []);

  const unregisterItem = useCallback((id: string) => {
    setItemIds((prev) => prev.filter((i) => i !== id));
  }, []);

  // Create internal context value
  const internalContextValue: MachineryLayoutInternalContextValue = useMemo(
    () => ({
      activeId,
      setActiveId,
      itemIds,
      registerItem,
      unregisterItem,
      onAction,
      onDelete,
    }),
    [activeId, itemIds, registerItem, unregisterItem, onAction, onDelete]
  );

  // Keyboard navigation
  const handleKeyDown = useKeyboardNavigation(
    itemIds,
    activeId,
    setActiveId,
    onAction,
    onDelete
  );

  return (
    <ZoneContext.Provider value={zoneContextValue}>
      <MachineryLayoutInternalContext.Provider value={internalContextValue}>
        <div
          ref={containerRef}
          className={`sigil-machinery-layout ${className}`.trim()}
          data-sigil-zone="admin"
          data-sigil-state-key={stateKey}
          role="application"
          aria-label="Keyboard navigable list"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          style={{
            outline: 'none',
          }}
        >
          {children}
        </div>
      </MachineryLayoutInternalContext.Provider>
    </ZoneContext.Provider>
  );
}

// Attach subcomponents
MachineryLayout.List = MachineryLayoutList;
MachineryLayout.Item = MachineryLayoutItem;
MachineryLayout.Search = MachineryLayoutSearch;
MachineryLayout.Empty = MachineryLayoutEmpty;

MachineryLayout.displayName = 'MachineryLayout';

// =============================================================================
// EXPORTS
// =============================================================================

export { MachineryLayout };
export type {
  MachineryLayoutProps,
  MachineryLayoutListProps,
  MachineryLayoutItemProps,
  MachineryLayoutSearchProps,
  MachineryLayoutEmptyProps,
};
