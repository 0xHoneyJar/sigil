/**
 * useTensions Hook
 *
 * React hook for accessing and modifying tension state.
 */

import { useContext } from 'react';
import { TensionContext } from './TensionProvider.js';
import type { TensionContextValue } from './types.js';

/**
 * Hook to access tension context.
 *
 * Must be used within a TensionProvider.
 *
 * @example
 * ```tsx
 * function TensionSlider() {
 *   const { tensions, setTension, cssVariables } = useTensions();
 *
 *   return (
 *     <input
 *       type="range"
 *       min={0}
 *       max={100}
 *       value={tensions.playfulness}
 *       onChange={(e) => setTension('playfulness', Number(e.target.value))}
 *     />
 *   );
 * }
 * ```
 *
 * @throws Error if used outside of TensionProvider
 */
export function useTensions(): TensionContextValue {
  const context = useContext(TensionContext);

  if (!context) {
    throw new Error(
      'useTensions must be used within a TensionProvider. ' +
        'Wrap your app with <TensionProvider> to use tension hooks.'
    );
  }

  return context;
}

/**
 * Hook to access just the tension values (read-only).
 *
 * Useful for components that only need to read tensions.
 *
 * @example
 * ```tsx
 * function TensionDisplay() {
 *   const tensions = useTensionValues();
 *   return <div>Playfulness: {tensions.playfulness}</div>;
 * }
 * ```
 */
export function useTensionValues() {
  const { tensions } = useTensions();
  return tensions;
}

/**
 * Hook to access just the CSS variables.
 *
 * @example
 * ```tsx
 * function ThemedBox() {
 *   const cssVariables = useTensionCSSVariables();
 *   return <div style={cssVariables}>Styled with tensions</div>;
 * }
 * ```
 */
export function useTensionCSSVariables() {
  const { cssVariables } = useTensions();
  return cssVariables;
}
