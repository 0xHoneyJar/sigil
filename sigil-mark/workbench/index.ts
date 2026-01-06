/**
 * Sigil Workbench v1.2.4
 *
 * A/B toggle utilities for comparing physics values.
 * Two modes available:
 *
 * 1. Hot-Swap Mode: CSS custom properties, instant toggle
 *    - Best for single component testing
 *    - Physics values swap via CSS variables
 *
 * 2. Iframe Mode: Side-by-side iframes, visibility toggle
 *    - Best for full flow testing
 *    - Complete page comparison
 *
 * @example
 * ```tsx
 * // Hot-swap mode
 * import { hotSwap } from '@sigil/workbench';
 *
 * hotSwap.init(
 *   { stiffness: 180, damping: 12 },  // Before
 *   { stiffness: 300, damping: 8 }    // After
 * );
 *
 * // Press Space to toggle
 * ```
 *
 * @example
 * ```tsx
 * // Iframe mode
 * import { iframe } from '@sigil/workbench';
 *
 * iframe.init({
 *   urlA: 'http://localhost:3000?physics=before',
 *   urlB: 'http://localhost:3000?physics=after',
 *   container: document.getElementById('preview')!
 * });
 *
 * // Press Space to toggle
 * ```
 */

export * from './ab-toggle';
export * from './ab-iframe';

export { default as hotSwap } from './ab-toggle';
export { default as iframe } from './ab-iframe';
