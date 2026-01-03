/**
 * Hooks
 *
 * React hooks for Material, Tension, and Sync state management.
 */

// Tension types
export interface TensionState {
  playfulness: number; // 0-100: Serious <-> Playful
  weight: number; // 0-100: Light <-> Heavy
  density: number; // 0-100: Spacious <-> Dense
  speed: number; // 0-100: Deliberate <-> Instant
}

export const DEFAULT_TENSIONS: TensionState = {
  playfulness: 50,
  weight: 50,
  density: 50,
  speed: 50,
};

// Tension presets
export const TENSION_PRESETS: Record<string, TensionState> = {
  linear: { playfulness: 20, weight: 30, density: 70, speed: 95 },
  airbnb: { playfulness: 50, weight: 60, density: 40, speed: 50 },
  nintendo: { playfulness: 80, weight: 50, density: 30, speed: 60 },
  osrs: { playfulness: 30, weight: 70, density: 60, speed: 40 },
};

/**
 * Convert tensions to CSS variables
 */
export function tensionsToCSSVariables(
  tensions: TensionState
): Record<string, string> {
  return {
    // Playfulness affects curves and colors
    '--sigil-border-radius': `${4 + tensions.playfulness * 0.12}px`,
    '--sigil-color-saturation': `${80 + tensions.playfulness * 0.2}%`,
    '--sigil-animation-bounce': tensions.playfulness > 70 ? '1.1' : '1.0',
    '--sigil-icon-style': tensions.playfulness > 60 ? 'rounded' : 'sharp',

    // Weight affects shadows and fonts
    '--sigil-shadow-opacity': `${0.05 + tensions.weight * 0.001}`,
    '--sigil-font-weight': tensions.weight > 60 ? '600' : '400',
    '--sigil-padding-scale': `${0.8 + tensions.weight * 0.004}`,
    '--sigil-shadow-blur': `${4 + tensions.weight * 0.2}px`,

    // Density affects spacing
    '--sigil-spacing-unit': `${8 - tensions.density * 0.02}px`,
    '--sigil-font-size-base': `${16 - tensions.density * 0.02}px`,
    '--sigil-line-height': `${1.6 - tensions.density * 0.002}`,
    '--sigil-gap': `${24 - tensions.density * 0.12}px`,

    // Speed affects transitions
    '--sigil-transition-duration': `${300 - tensions.speed * 2.8}ms`,
    '--sigil-animation-duration': `${400 - tensions.speed * 3.5}ms`,
    '--sigil-delay': `${100 - tensions.speed}ms`,
  };
}

// Placeholder exports - full implementation in Sprint 10
export type TensionContextValue = {
  tensions: TensionState;
  setTension: (key: keyof TensionState, value: number) => void;
  setTensions: (tensions: Partial<TensionState>) => void;
  resetTensions: () => void;
  applyPreset: (presetName: string) => void;
  cssVariables: Record<string, string>;
};
