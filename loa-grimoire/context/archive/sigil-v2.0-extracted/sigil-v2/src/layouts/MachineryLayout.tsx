// Sigil v2.0 — Layout: MachineryLayout
// Structural physics for keyboard-driven UI

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
  KeyboardEvent,
} from 'react';

// =============================================================================
// CONTEXT
// =============================================================================

interface MachineryContextValue {
  activeId: string | null;
  setActiveId: (id: string) => void;
  registerItem: (id: string) => void;
  unregisterItem: (id: string) => void;
  items: string[];
}

const MachineryContext = createContext<MachineryContextValue | null>(null);

export function useMachineryContext() {
  const context = useContext(MachineryContext);
  if (!context) {
    throw new Error('Machinery components must be used within MachineryLayout');
  }
  return context;
}

// =============================================================================
// ITEM CONTEXT
// =============================================================================

interface MachineryItemContextValue {
  isActive: boolean;
  id: string;
}

const MachineryItemContext = createContext<MachineryItemContextValue | null>(null);

export function useMachineryItemContext() {
  const context = useContext(MachineryItemContext);
  if (!context) {
    throw new Error('MachineryItem content must be used within MachineryLayout.Item');
  }
  return context;
}

// =============================================================================
// MACHINERY LAYOUT
// =============================================================================

interface MachineryLayoutProps {
  children: ReactNode;
  stateKey?: string;
  onAction?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * MachineryLayout — Layout primitive for keyboard-driven UI
 * 
 * Physics enforced:
 * - Arrow key navigation
 * - Enter to activate
 * - Delete/Backspace to delete
 * - Escape to deselect
 * 
 * @example
 * ```tsx
 * <MachineryLayout stateKey="invoices" onAction={selectInvoice}>
 *   <MachineryLayout.List>
 *     {invoices.map(inv => (
 *       <MachineryLayout.Item key={inv.id} id={inv.id}>
 *         {inv.number}
 *       </MachineryLayout.Item>
 *     ))}
 *   </MachineryLayout.List>
 * </MachineryLayout>
 * ```
 */
export function MachineryLayout({
  children,
  stateKey,
  onAction,
  onDelete,
}: MachineryLayoutProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const registerItem = useCallback((id: string) => {
    setItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const unregisterItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item !== id));
  }, []);

  /**
   * Keyboard navigation — PHYSICS IS STRUCTURAL
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = activeId ? items.indexOf(activeId) : -1;

      switch (e.key) {
        case 'ArrowDown':
        case 'j': // Vim binding
          e.preventDefault();
          if (items.length > 0) {
            const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            setActiveId(items[nextIndex]);
          }
          break;

        case 'ArrowUp':
        case 'k': // Vim binding
          e.preventDefault();
          if (items.length > 0) {
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            setActiveId(items[prevIndex]);
          }
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          if (activeId && onAction) {
            onAction(activeId);
          }
          break;

        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          if (activeId && onDelete) {
            onDelete(activeId);
          }
          break;

        case 'Escape':
          e.preventDefault();
          setActiveId(null);
          break;

        case 'Home':
          e.preventDefault();
          if (items.length > 0) {
            setActiveId(items[0]);
          }
          break;

        case 'End':
          e.preventDefault();
          if (items.length > 0) {
            setActiveId(items[items.length - 1]);
          }
          break;
      }
    },
    [activeId, items, onAction, onDelete]
  );

  return (
    <MachineryContext.Provider
      value={{ activeId, setActiveId, registerItem, unregisterItem, items }}
    >
      <div
        ref={containerRef}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="application"
        aria-label="Keyboard-navigable list"
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
      >
        {children}
      </div>
    </MachineryContext.Provider>
  );
}

// =============================================================================
// LIST SLOT
// =============================================================================

interface MachineryListProps {
  children: ReactNode;
}

function MachineryList({ children }: MachineryListProps) {
  return (
    <div role="listbox" className="divide-y divide-neutral-200 dark:divide-neutral-700">
      {children}
    </div>
  );
}

// =============================================================================
// ITEM SLOT
// =============================================================================

interface MachineryItemProps {
  id: string;
  children: ReactNode;
  onAction?: () => void;
  onDelete?: () => void;
}

function MachineryItem({ id, children, onAction, onDelete }: MachineryItemProps) {
  const { activeId, setActiveId, registerItem, unregisterItem } = useMachineryContext();
  const isActive = activeId === id;

  // Register on mount, unregister on unmount
  useEffect(() => {
    registerItem(id);
    return () => unregisterItem(id);
  }, [id, registerItem, unregisterItem]);

  return (
    <MachineryItemContext.Provider value={{ isActive, id }}>
      <div
        role="option"
        aria-selected={isActive}
        onClick={() => {
          setActiveId(id);
          onAction?.();
        }}
        className={`
          px-4 py-3 cursor-default select-none transition-colors
          ${isActive
            ? 'bg-blue-50 dark:bg-blue-900/20'
            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }
        `}
      >
        {children}
      </div>
    </MachineryItemContext.Provider>
  );
}

// =============================================================================
// SEARCH SLOT
// =============================================================================

interface MachinerySearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

function MachinerySearch({
  placeholder = 'Search...',
  value,
  onChange,
}: MachinerySearchProps) {
  return (
    <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="
          w-full px-3 py-2 
          bg-neutral-100 dark:bg-neutral-800 
          border-0 rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500
        "
      />
    </div>
  );
}

// =============================================================================
// EMPTY SLOT
// =============================================================================

interface MachineryEmptyProps {
  children: ReactNode;
}

function MachineryEmpty({ children }: MachineryEmptyProps) {
  return (
    <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
      {children}
    </div>
  );
}

// =============================================================================
// ATTACH SUBCOMPONENTS
// =============================================================================

MachineryLayout.List = MachineryList;
MachineryLayout.Item = MachineryItem;
MachineryLayout.Search = MachinerySearch;
MachineryLayout.Empty = MachineryEmpty;

// =============================================================================
// EXPORTS
// =============================================================================

export { MachineryList, MachineryItem, MachinerySearch, MachineryEmpty };
