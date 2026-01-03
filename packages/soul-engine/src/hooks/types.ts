/**
 * Tension System Types
 *
 * Type definitions for the 4-axis tension system.
 */

/**
 * TensionState represents the 4 axes of product feel.
 * Each axis ranges from 0-100.
 */
export interface TensionState {
  /** 0-100: Serious (0) <-> Playful (100) */
  playfulness: number;
  /** 0-100: Light (0) <-> Heavy (100) */
  weight: number;
  /** 0-100: Spacious (0) <-> Dense (100) */
  density: number;
  /** 0-100: Deliberate (0) <-> Instant (100) */
  speed: number;
}

/**
 * Named tension presets for common design paradigms.
 */
export type TensionPresetName = 'linear' | 'airbnb' | 'nintendo' | 'osrs';

/**
 * Tension preset with metadata.
 */
export interface TensionPreset {
  name: TensionPresetName;
  description: string;
  tensions: TensionState;
}

/**
 * Context value returned by useTensions hook.
 */
export interface TensionContextValue {
  /** Current tension state */
  tensions: TensionState;
  /** Set a single tension axis */
  setTension: (key: keyof TensionState, value: number) => void;
  /** Set multiple tensions at once */
  setTensions: (tensions: Partial<TensionState>) => void;
  /** Reset all tensions to defaults */
  resetTensions: () => void;
  /** Apply a named preset */
  applyPreset: (presetName: TensionPresetName | string) => void;
  /** Save tensions to persistent storage */
  saveTensions: () => Promise<void>;
  /** CSS variables derived from current tensions */
  cssVariables: Record<string, string>;
  /** Whether tensions are currently being loaded */
  isLoading: boolean;
  /** Whether there are unsaved changes */
  isDirty: boolean;
}

/**
 * Props for TensionProvider component.
 */
export interface TensionProviderProps {
  /** Initial tension values (overrides defaults) */
  initialTensions?: Partial<TensionState>;
  /** Path to SQLite database for persistence */
  dbPath?: string;
  /** Children to render within provider */
  children: React.ReactNode;
  /** Whether to auto-load from database on mount */
  autoLoad?: boolean;
  /** Whether to auto-save on tension changes */
  autoSave?: boolean;
  /** Apply updates immediately without RAF throttling (useful for tests) */
  immediateUpdates?: boolean;
}

/**
 * CSS variable names generated from tensions.
 */
export type TensionCSSVariable =
  // Playfulness variables
  | '--sigil-border-radius'
  | '--sigil-color-saturation'
  | '--sigil-animation-bounce'
  | '--sigil-icon-style'
  | '--sigil-corner-smoothing'
  // Weight variables
  | '--sigil-shadow-opacity'
  | '--sigil-shadow-blur'
  | '--sigil-font-weight'
  | '--sigil-padding-scale'
  | '--sigil-border-width'
  // Density variables
  | '--sigil-spacing-unit'
  | '--sigil-font-size-base'
  | '--sigil-line-height'
  | '--sigil-gap'
  | '--sigil-container-padding'
  // Speed variables
  | '--sigil-transition-duration'
  | '--sigil-animation-duration'
  | '--sigil-delay'
  | '--sigil-easing';
