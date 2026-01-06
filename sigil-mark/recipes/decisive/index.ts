/**
 * Sigil v1.2.4 - Decisive Recipe Set
 *
 * For checkout, transactions, and critical actions where user trust matters.
 *
 * Physics profile:
 * - Feel: Heavy, deliberate, trustworthy
 * - Sync: server_authoritative
 * - Base spring: (180, 12)
 *
 * @example
 * ```tsx
 * import { Button, ConfirmFlow } from '@sigil/recipes/decisive';
 * ```
 */

// Base Button recipe
export { Button, type ButtonProps } from './button';

// Button variants
export { ButtonNintendo, type ButtonNintendoProps } from './button.nintendo';
export { ButtonRelaxed, type ButtonRelaxedProps } from './button.relaxed';

// Multi-step flows
export { ConfirmFlow, type ConfirmFlowProps, type ConfirmFlowState } from './confirm-flow';
