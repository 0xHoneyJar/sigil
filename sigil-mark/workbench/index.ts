/**
 * Sigil Workbench v1.2.4
 *
 * A/B toggle utilities for comparing physics values.
 *
 * Philosophy: "Feel the difference, don't just see it"
 * - Context-based A/B toggle that works with framer-motion
 * - React hook for integration with SigilZone
 * - Iframe mode for full flow testing
 *
 * @example Context-based A/B toggle (recommended)
 * ```tsx
 * import { SigilZone } from 'sigil-mark/core';
 * import { useABToggle, initABToggle } from 'sigil-mark/workbench';
 *
 * // Initialize comparison
 * initABToggle('decisive', 'glass');
 *
 * function App() {
 *   const { currentMaterial, mode } = useABToggle();
 *
 *   return (
 *     <SigilZone material={currentMaterial}>
 *       <p>Mode: {mode} ({currentMaterial})</p>
 *       <Button>Click to feel the physics</Button>
 *     </SigilZone>
 *   );
 * }
 *
 * // Press Space to toggle A/B
 * ```
 *
 * @example Iframe mode for flow testing
 * ```tsx
 * import { ABIframe } from 'sigil-mark/workbench';
 *
 * ABIframe.init({
 *   urlA: 'http://localhost:3000?material=decisive',
 *   urlB: 'http://localhost:3000?material=glass',
 *   container: document.getElementById('preview')!
 * });
 * ```
 */

// A/B Toggle (context-based, works with framer-motion)
export {
  initABToggle,
  toggle,
  getState,
  getCurrentMaterial,
  onToggle,
  destroyABToggle,
  type ABToggleState,
} from './ab-toggle';

// React hook for A/B toggle
export { useABToggle, type UseABToggleResult } from './use-ab-toggle';

// Iframe-based A/B comparison
export * from './ab-iframe';

// Default exports
export { default as ABToggle } from './ab-toggle';
export { default as ABIframe } from './ab-iframe';
