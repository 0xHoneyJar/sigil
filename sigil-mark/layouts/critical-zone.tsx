/**
 * Sigil v2.0 — CriticalZone Layout
 *
 * Layout primitive for high-stakes UI. Provides both zone context
 * AND structural physics in a single component.
 *
 * Layouts ARE Zones. Physics is DOM, not lint.
 *
 * @module layouts/CriticalZone
 */

import React, {
  createContext,
  useContext,
  useMemo,
  Children,
  isValidElement,
  cloneElement,
  type ReactNode,
  type ReactElement,
  type FC,
} from 'react';
import { ZoneContext, type ZoneContextValue } from './context';

// =============================================================================
// TYPES
// =============================================================================

/**
 * CriticalZone props.
 */
export interface CriticalZoneProps {
  /** Child content and actions */
  children: ReactNode;
  /** Whether zone handles financial operations (default: true) */
  financial?: boolean;
  /** Optional className for styling */
  className?: string;
}

/**
 * CriticalZone.Content props.
 */
export interface CriticalZoneContentProps {
  /** Zone body content */
  children: ReactNode;
  /** Optional className for styling */
  className?: string;
}

/**
 * CriticalZone.Actions props.
 */
export interface CriticalZoneActionsProps {
  /** Action buttons */
  children: ReactNode;
  /** Maximum number of actions allowed (default: 3) */
  maxActions?: number;
  /** Optional className for styling */
  className?: string;
}

// =============================================================================
// INTERNAL CONTEXT
// =============================================================================

/**
 * Internal context for CriticalZone subcomponents.
 * @internal
 */
interface CriticalZoneInternalContextValue {
  financial: boolean;
}

const CriticalZoneInternalContext =
  createContext<CriticalZoneInternalContextValue | null>(null);

function useCriticalZoneInternal(): CriticalZoneInternalContextValue {
  const context = useContext(CriticalZoneInternalContext);
  if (!context) {
    throw new Error(
      'CriticalZone subcomponents must be used within a CriticalZone'
    );
  }
  return context;
}

// =============================================================================
// CRITICAL DETECTION
// =============================================================================

/**
 * Data attribute used to mark critical buttons for auto-sorting.
 * @internal
 */
const CRITICAL_BUTTON_ATTR = 'data-sigil-critical';

/**
 * Check if a React element is marked as a critical button.
 * Critical buttons are detected by:
 * 1. Having `data-sigil-critical` prop
 * 2. Having a `state` prop (CriticalButton signature)
 * @internal
 */
function isCriticalButton(element: ReactElement): boolean {
  const props = element.props as Record<string, unknown>;

  // Check for explicit critical marker
  if (props[CRITICAL_BUTTON_ATTR] === true) {
    return true;
  }

  // Check for CriticalButton signature (has state prop with status)
  if (props.state && typeof props.state === 'object') {
    const state = props.state as Record<string, unknown>;
    if ('status' in state) {
      return true;
    }
  }

  return false;
}

/**
 * Sort children so critical buttons appear last.
 * This ensures the destructive/important action is always in the last position.
 * @internal
 */
function sortCriticalButtonsLast(children: ReactNode): ReactNode[] {
  const childArray = Children.toArray(children);

  const nonCritical: ReactNode[] = [];
  const critical: ReactNode[] = [];

  childArray.forEach((child) => {
    if (isValidElement(child) && isCriticalButton(child)) {
      critical.push(child);
    } else {
      nonCritical.push(child);
    }
  });

  return [...nonCritical, ...critical];
}

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

/**
 * CriticalZone.Content — Body content slot.
 *
 * Contains the main content of the critical zone (forms, confirmations, etc.).
 *
 * @example
 * ```tsx
 * <CriticalZone.Content>
 *   <h2>Confirm Transfer</h2>
 *   <p>You are about to transfer $500</p>
 * </CriticalZone.Content>
 * ```
 */
const CriticalZoneContent: FC<CriticalZoneContentProps> = ({
  children,
  className = '',
}) => {
  // Validate we're inside a CriticalZone
  useCriticalZoneInternal();

  return (
    <div
      className={`sigil-critical-content ${className}`.trim()}
      data-sigil-slot="content"
    >
      {children}
    </div>
  );
};

CriticalZoneContent.displayName = 'CriticalZone.Content';

/**
 * CriticalZone.Actions — Action buttons slot.
 *
 * Contains action buttons with enforced 32px gap.
 * Critical buttons are automatically sorted to the last position.
 *
 * @example
 * ```tsx
 * <CriticalZone.Actions>
 *   <Lens.GlassButton onAction={cancel}>Cancel</Lens.GlassButton>
 *   <Lens.CriticalButton state={state} onAction={commit}>
 *     Confirm Transfer
 *   </Lens.CriticalButton>
 * </CriticalZone.Actions>
 * ```
 */
const CriticalZoneActions: FC<CriticalZoneActionsProps> = ({
  children,
  maxActions = 3,
  className = '',
}) => {
  // Validate we're inside a CriticalZone
  const { financial } = useCriticalZoneInternal();

  // Sort critical buttons to last position
  const sortedChildren = useMemo(
    () => sortCriticalButtonsLast(children),
    [children]
  );

  // Check for action overflow
  const childCount = Children.count(sortedChildren);

  if (childCount > maxActions) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[Sigil CriticalZone.Actions] Too many actions (${childCount}/${maxActions}). ` +
          `Critical zones should have at most ${maxActions} actions to maintain clarity. ` +
          `Consider consolidating actions or using a dropdown menu.`
      );
    }
  }

  // Add critical marker to CriticalButtons for proper identification
  const markedChildren = sortedChildren.map((child, index) => {
    if (isValidElement(child) && isCriticalButton(child)) {
      return cloneElement(child as ReactElement<Record<string, unknown>>, {
        [CRITICAL_BUTTON_ATTR]: true,
        key: (child as ReactElement).key ?? `critical-action-${index}`,
      });
    }
    return child;
  });

  return (
    <div
      className={`sigil-critical-actions ${className}`.trim()}
      data-sigil-slot="actions"
      data-sigil-financial={financial}
      style={{
        display: 'flex',
        gap: '32px', // 32px gap enforcement (gap-8 in Tailwind)
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
      {markedChildren}
    </div>
  );
};

CriticalZoneActions.displayName = 'CriticalZone.Actions';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * CriticalZone — Layout primitive for high-stakes UI.
 *
 * Provides:
 * - Zone context: `{ type: 'critical', financial, timeAuthority: 'server-tick' }`
 * - Structural physics: 32px gap, action ordering, max 3 actions
 *
 * In v2.0, Layouts ARE Zones. CriticalZone replaces the old
 * `<SigilZone material="decisive">` pattern.
 *
 * @example Basic usage
 * ```tsx
 * <CriticalZone financial>
 *   <CriticalZone.Content>
 *     <h2>Confirm Payment</h2>
 *     <p>Amount: $500</p>
 *   </CriticalZone.Content>
 *
 *   <CriticalZone.Actions>
 *     <Lens.GlassButton onAction={cancel}>Cancel</Lens.GlassButton>
 *     <Lens.CriticalButton state={payment.state} onAction={() => payment.commit()}>
 *       Pay $500
 *     </Lens.CriticalButton>
 *   </CriticalZone.Actions>
 * </CriticalZone>
 * ```
 *
 * @example Non-financial critical zone
 * ```tsx
 * <CriticalZone financial={false}>
 *   <CriticalZone.Content>
 *     <h2>Delete Account</h2>
 *     <p>This action cannot be undone.</p>
 *   </CriticalZone.Content>
 *
 *   <CriticalZone.Actions>
 *     <Lens.GlassButton onAction={cancel}>Cancel</Lens.GlassButton>
 *     <Lens.CriticalButton state={deleteState} onAction={() => deleteAccount()}>
 *       Delete Account
 *     </Lens.CriticalButton>
 *   </CriticalZone.Actions>
 * </CriticalZone>
 * ```
 */
function CriticalZone({
  children,
  financial = true,
  className = '',
}: CriticalZoneProps): ReactElement {
  // Create zone context value
  const zoneContextValue: ZoneContextValue = useMemo(
    () => ({
      type: 'critical',
      financial,
      timeAuthority: 'server-tick', // Critical zones always use server-tick
    }),
    [financial]
  );

  // Create internal context value
  const internalContextValue: CriticalZoneInternalContextValue = useMemo(
    () => ({ financial }),
    [financial]
  );

  return (
    <ZoneContext.Provider value={zoneContextValue}>
      <CriticalZoneInternalContext.Provider value={internalContextValue}>
        <div
          className={`sigil-critical-zone ${className}`.trim()}
          data-sigil-zone="critical"
          data-sigil-financial={financial}
          role="region"
          aria-label={financial ? 'Financial action zone' : 'Critical action zone'}
        >
          {children}
        </div>
      </CriticalZoneInternalContext.Provider>
    </ZoneContext.Provider>
  );
}

// Attach subcomponents
CriticalZone.Content = CriticalZoneContent;
CriticalZone.Actions = CriticalZoneActions;

CriticalZone.displayName = 'CriticalZone';

// =============================================================================
// EXPORTS
// =============================================================================

export { CriticalZone };
export type {
  CriticalZoneProps,
  CriticalZoneContentProps,
  CriticalZoneActionsProps,
};
