/**
 * Sigil Gold Registry
 * 
 * This file is THE CANON. Components exported here are "Gold" status.
 * The agent reads this file FIRST on any UI task.
 * 
 * To promote a component: Add an export line here (1-line change)
 * To demote a component: Remove the export line (1-line change)
 * 
 * Components live in src/components/ — they NEVER move.
 * Only this registry file changes.
 */

// =============================================================================
// BUTTONS
// =============================================================================

/** 
 * CriticalButton — For irreversible financial actions
 * Zone: critical | Physics: server-tick (600ms)
 * Use for: claim, deposit, withdraw, confirm
 */
export { CriticalButton } from '../components/CriticalButton';

/**
 * Button — Standard interactive button
 * Zone: casual/important | Physics: snappy (150ms)
 * Use for: navigation, toggles, non-critical actions
 */
export { Button } from '../components/Button';

// =============================================================================
// FEEDBACK
// =============================================================================

/**
 * ConfirmDialog — For confirming critical actions
 * Zone: critical | Physics: deliberate (800ms)
 * Use for: final confirmation before irreversible actions
 */
export { ConfirmDialog } from '../components/ConfirmDialog';

/**
 * LoadingSpinner — Standard loading indicator
 * Zone: any | Physics: smooth (300ms)
 */
export { LoadingSpinner } from '../components/LoadingSpinner';

// =============================================================================
// LAYOUT
// =============================================================================

/**
 * Card — Standard content container
 * Zone: casual | Physics: smooth (300ms)
 */
export { Card } from '../components/Card';

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type { CriticalButtonProps } from '../components/CriticalButton';
export type { ButtonProps } from '../components/Button';
export type { ConfirmDialogProps } from '../components/ConfirmDialog';
export type { CardProps } from '../components/Card';
