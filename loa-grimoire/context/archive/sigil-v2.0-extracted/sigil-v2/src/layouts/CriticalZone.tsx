// Sigil v2.0 — Layout: CriticalZone
// Structural physics for high-stakes UI

import React, { createContext, useContext, ReactNode, Children, isValidElement } from 'react';

// =============================================================================
// CONTEXT
// =============================================================================

interface CriticalZoneContextValue {
  financial: boolean;
}

const CriticalZoneContext = createContext<CriticalZoneContextValue | null>(null);

export function useCriticalZoneContext() {
  const context = useContext(CriticalZoneContext);
  if (!context) {
    throw new Error('CriticalZone components must be used within CriticalZone');
  }
  return context;
}

// =============================================================================
// CRITICAL ZONE
// =============================================================================

interface CriticalZoneProps {
  children: ReactNode;
  financial?: boolean;
}

/**
 * CriticalZone — Layout primitive for high-stakes UI
 * 
 * Physics enforced:
 * - 32px gap between actions (CSS, not lint)
 * - Critical actions auto-sorted to last
 * - Max 3 actions per zone
 * 
 * @example
 * ```tsx
 * <CriticalZone financial>
 *   <CriticalZone.Content>
 *     <h2>Confirm Transfer</h2>
 *   </CriticalZone.Content>
 *   <CriticalZone.Actions>
 *     <Glass.Button>Cancel</Glass.Button>
 *     <Critical.Button>Confirm</Critical.Button>
 *   </CriticalZone.Actions>
 * </CriticalZone>
 * ```
 */
export function CriticalZone({ children, financial = false }: CriticalZoneProps) {
  return (
    <CriticalZoneContext.Provider value={{ financial }}>
      <div
        className="flex flex-col gap-6 p-6 bg-white dark:bg-neutral-900 rounded-lg shadow-lg"
        role="region"
        aria-label="Critical action zone"
      >
        {children}
      </div>
    </CriticalZoneContext.Provider>
  );
}

// =============================================================================
// CONTENT SLOT
// =============================================================================

interface CriticalZoneContentProps {
  children: ReactNode;
}

function CriticalZoneContent({ children }: CriticalZoneContentProps) {
  return <div className="space-y-2">{children}</div>;
}

// =============================================================================
// ACTIONS SLOT
// =============================================================================

interface CriticalZoneActionsProps {
  children: ReactNode;
  maxActions?: number;
}

/**
 * CriticalZone.Actions — Action slot with enforced physics
 * 
 * Physics:
 * - 32px gap (gap-8)
 * - Critical buttons sorted to last
 * - Max actions enforced
 */
function CriticalZoneActions({ children, maxActions = 3 }: CriticalZoneActionsProps) {
  // Convert children to array for sorting
  const childArray = Children.toArray(children);
  
  // Warn if too many actions
  if (childArray.length > maxActions) {
    console.warn(
      `CriticalZone.Actions: Max ${maxActions} actions allowed, got ${childArray.length}. ` +
      `Consider using a dropdown or secondary view.`
    );
  }

  // Sort: Glass/regular first, Critical last (destructive last)
  const sorted = [...childArray].sort((a, b) => {
    const aIsCritical = isCriticalElement(a);
    const bIsCritical = isCriticalElement(b);
    
    if (aIsCritical && !bIsCritical) return 1;  // Critical goes last
    if (!aIsCritical && bIsCritical) return -1;
    return 0;
  });

  return (
    <div
      className="flex items-center justify-end gap-8 pt-4 border-t border-neutral-200 dark:border-neutral-700"
      // gap-8 = 32px — PHYSICS IS CSS, NOT LINT
    >
      {sorted.slice(0, maxActions)}
    </div>
  );
}

/**
 * Check if element is a Critical button
 */
function isCriticalElement(element: unknown): boolean {
  if (!isValidElement(element)) return false;
  
  // Check displayName or name
  const type = element.type as any;
  const name = type?.displayName || type?.name || '';
  
  return (
    name.includes('Critical') ||
    name.includes('Destructive') ||
    name.includes('Danger')
  );
}

// =============================================================================
// ATTACH SUBCOMPONENTS
// =============================================================================

CriticalZone.Content = CriticalZoneContent;
CriticalZone.Actions = CriticalZoneActions;

// =============================================================================
// EXPORTS
// =============================================================================

export { CriticalZoneContent, CriticalZoneActions };
