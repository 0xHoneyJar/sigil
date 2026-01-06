/**
 * Sigil v1.2.4 - Machinery Recipe Set
 *
 * For admin panels, dashboards, and data-heavy interfaces.
 * Efficiency over delight - minimal animation overhead.
 *
 * Physics profile:
 * - Feel: Efficient, instant, no-nonsense
 * - Sync: client_authoritative
 * - Base spring: (400, 30) or instant
 *
 * @example
 * ```tsx
 * import { Table, Toggle, Form } from '@sigil/recipes/machinery';
 * ```
 */

// Data display
export { Table, type TableProps, type TableColumn } from './table';

// Form controls
export { Toggle, type ToggleProps } from './toggle';
export { Form, type FormProps, type FormState, type FormFieldError } from './form';
