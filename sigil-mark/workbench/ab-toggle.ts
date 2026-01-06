/**
 * @sigil-workbench A/B Toggle
 *
 * Enables real-time physics comparison through context, not CSS variables.
 * Works with framer-motion components that read physics from SigilZone.
 *
 * Philosophy: "Feel the difference, don't just see it"
 * - Context-based: Components re-render with new physics
 * - Event-driven: Listen for toggle changes
 * - Keyboard: Press Space to toggle A/B
 *
 * Usage with SigilZone:
 * ```tsx
 * import { SigilZone, useSigilPhysics } from 'sigil-mark/core';
 * import { useABToggle, initABToggle } from 'sigil-mark/workbench';
 *
 * // Initialize comparison
 * initABToggle('decisive', 'glass');
 *
 * // In your app
 * function App() {
 *   const { currentMaterial } = useABToggle();
 *
 *   return (
 *     <SigilZone material={currentMaterial}>
 *       <Button>Click me to feel the physics</Button>
 *     </SigilZone>
 *   );
 * }
 * ```
 */

import type { Material } from '../core/physics';

export interface ABToggleState {
  mode: 'A' | 'B';
  materialA: Material;
  materialB: Material;
  currentMaterial: Material;
}

// Global state (singleton for workbench use)
let state: ABToggleState | null = null;
const listeners = new Set<(state: ABToggleState) => void>();

/**
 * Initialize A/B toggle with two materials to compare.
 *
 * @example
 * ```tsx
 * // Compare decisive vs glass physics
 * initABToggle('decisive', 'glass');
 *
 * // Press Space to toggle between them
 * ```
 */
export function initABToggle(materialA: Material, materialB: Material): ABToggleState {
  state = {
    mode: 'A',
    materialA,
    materialB,
    currentMaterial: materialA,
  };

  setupKeyboardListener();
  notifyListeners();

  console.log(`[sigil] A/B toggle initialized: ${materialA} (A) vs ${materialB} (B)`);
  console.log('[sigil] Press Space to toggle');

  return state;
}

/**
 * Toggle between A and B.
 */
export function toggle(): ABToggleState | null {
  if (!state) {
    console.warn('[sigil] A/B toggle not initialized. Call initABToggle first.');
    return null;
  }

  state = {
    ...state,
    mode: state.mode === 'A' ? 'B' : 'A',
    currentMaterial: state.mode === 'A' ? state.materialB : state.materialA,
  };

  notifyListeners();
  console.log(`[sigil] Switched to ${state.mode}: ${state.currentMaterial}`);

  return state;
}

/**
 * Get current toggle state.
 */
export function getState(): ABToggleState | null {
  return state;
}

/**
 * Get current material (convenience function).
 */
export function getCurrentMaterial(): Material | null {
  return state?.currentMaterial ?? null;
}

/**
 * Subscribe to toggle changes.
 * Returns unsubscribe function.
 *
 * @example
 * ```tsx
 * const unsubscribe = onToggle((state) => {
 *   console.log('Now using:', state.currentMaterial);
 * });
 *
 * // Later: unsubscribe();
 * ```
 */
export function onToggle(callback: (state: ABToggleState) => void): () => void {
  listeners.add(callback);

  // Call immediately with current state if initialized
  if (state) {
    callback(state);
  }

  return () => listeners.delete(callback);
}

/**
 * Clean up A/B toggle.
 */
export function destroyABToggle(): void {
  state = null;
  listeners.clear();
  removeKeyboardListener();
  console.log('[sigil] A/B toggle destroyed');
}

// Internal: Notify all listeners
function notifyListeners(): void {
  if (state) {
    listeners.forEach(listener => listener(state!));
  }
}

// Internal: Keyboard handling
let keyboardListenerAttached = false;

function handleKeydown(event: KeyboardEvent): void {
  if (event.code === 'Space' && !isInputFocused()) {
    event.preventDefault();
    toggle();
  }
}

function setupKeyboardListener(): void {
  if (keyboardListenerAttached) return;

  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handleKeydown);
    keyboardListenerAttached = true;
  }
}

function removeKeyboardListener(): void {
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleKeydown);
    keyboardListenerAttached = false;
  }
}

function isInputFocused(): boolean {
  if (typeof document === 'undefined') return false;

  const active = document.activeElement;
  return (
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement ||
    active instanceof HTMLSelectElement ||
    active?.hasAttribute('contenteditable')
  );
}

// Export default for convenience
export default {
  init: initABToggle,
  toggle,
  getState,
  getCurrentMaterial,
  onToggle,
  destroy: destroyABToggle,
};
