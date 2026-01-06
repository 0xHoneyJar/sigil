/**
 * @sigil-workbench useABToggle React Hook
 *
 * React hook for A/B toggle that triggers re-renders when physics change.
 * Use with SigilZone to automatically update component physics.
 *
 * @example
 * ```tsx
 * import { SigilZone } from 'sigil-mark/core';
 * import { useABToggle, initABToggle } from 'sigil-mark/workbench';
 *
 * // Initialize once at app start
 * initABToggle('decisive', 'glass');
 *
 * function ABTestPage() {
 *   const { currentMaterial, mode, toggle } = useABToggle();
 *
 *   return (
 *     <SigilZone material={currentMaterial}>
 *       <div className="p-8">
 *         <p>Mode: {mode} ({currentMaterial})</p>
 *         <p>Press Space to toggle, or click the button below</p>
 *         <button onClick={toggle}>Toggle A/B</button>
 *
 *         <Button onAction={async () => {}}>
 *           Feel the physics
 *         </Button>
 *       </div>
 *     </SigilZone>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import {
  onToggle,
  toggle as toggleAB,
  getState,
  initABToggle,
  destroyABToggle,
  type ABToggleState,
} from './ab-toggle';
import type { Material } from '../core/physics';

export interface UseABToggleResult {
  /** Current A/B mode */
  mode: 'A' | 'B' | null;
  /** Current material based on mode */
  currentMaterial: Material;
  /** Material for A mode */
  materialA: Material | null;
  /** Material for B mode */
  materialB: Material | null;
  /** Toggle between A and B */
  toggle: () => void;
  /** Whether A/B toggle is initialized */
  isInitialized: boolean;
  /** Initialize with specific materials */
  init: (materialA: Material, materialB: Material) => void;
  /** Clean up */
  destroy: () => void;
}

/**
 * React hook for A/B toggle integration.
 *
 * Automatically subscribes to toggle changes and triggers re-renders.
 * Pass the `currentMaterial` to SigilZone to apply physics.
 *
 * @param defaultMaterial - Material to use when A/B is not initialized
 */
export function useABToggle(defaultMaterial: Material = 'glass'): UseABToggleResult {
  const [state, setState] = useState<ABToggleState | null>(getState);

  // Subscribe to toggle changes
  useEffect(() => {
    const unsubscribe = onToggle((newState) => {
      setState(newState);
    });

    // Set initial state
    setState(getState());

    return unsubscribe;
  }, []);

  const toggle = useCallback(() => {
    toggleAB();
  }, []);

  const init = useCallback((materialA: Material, materialB: Material) => {
    initABToggle(materialA, materialB);
  }, []);

  const destroy = useCallback(() => {
    destroyABToggle();
    setState(null);
  }, []);

  return {
    mode: state?.mode ?? null,
    currentMaterial: state?.currentMaterial ?? defaultMaterial,
    materialA: state?.materialA ?? null,
    materialB: state?.materialB ?? null,
    toggle,
    isInitialized: state !== null,
    init,
    destroy,
  };
}

export default useABToggle;
