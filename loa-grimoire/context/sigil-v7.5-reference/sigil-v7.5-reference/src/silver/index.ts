/**
 * Sigil Silver Registry
 * 
 * Components exported here are "Silver" status — proven patterns
 * that work well but haven't achieved canonical Gold status yet.
 * 
 * Silver can import: Gold, Silver
 * Silver cannot import: Draft
 * 
 * Promotion path: Consistent usage + 0 mutinies → Nomination PR → Gold
 */

// =============================================================================
// OVERLAYS
// =============================================================================

/**
 * Tooltip — Contextual information on hover
 * Candidate for Gold: 12 uses, 0 mutinies
 */
export { Tooltip } from '../components/Tooltip';

/**
 * Modal — Generic modal container
 * Needs more consistent usage patterns before Gold
 */
export { Modal } from '../components/Modal';

// =============================================================================
// FORMS
// =============================================================================

/**
 * Input — Text input field
 * Candidate for Gold: Reviewing validation patterns
 */
export { Input } from '../components/Input';

/**
 * Select — Dropdown select
 */
export { Select } from '../components/Select';

// =============================================================================
// NAVIGATION
// =============================================================================

/**
 * Tabs — Tab navigation component
 */
export { Tabs } from '../components/Tabs';

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type { TooltipProps } from '../components/Tooltip';
export type { ModalProps } from '../components/Modal';
export type { InputProps } from '../components/Input';
export type { SelectProps } from '../components/Select';
export type { TabsProps } from '../components/Tabs';
