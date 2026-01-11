/**
 * Sigil Soul Engine v10 — Tension System
 * 
 * Tensions are real-time adjustable feel parameters.
 * Playfulness, Weight, Density, Speed (0-100 each).
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// TENSION STATE
// ═══════════════════════════════════════════════════════════════════════════

export interface TensionState {
  playfulness: number;  // 0-100: Serious ↔ Playful
  weight: number;       // 0-100: Light ↔ Heavy
  density: number;      // 0-100: Spacious ↔ Dense
  speed: number;        // 0-100: Deliberate ↔ Instant
}

export const DEFAULT_TENSIONS: TensionState = {
  playfulness: 50,
  weight: 50,
  density: 50,
  speed: 50,
};

// ═══════════════════════════════════════════════════════════════════════════
// TENSION TO CSS VARIABLES
// ═══════════════════════════════════════════════════════════════════════════

export function tensionsToCSSVariables(tensions: TensionState): Record<string, string> {
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

// ═══════════════════════════════════════════════════════════════════════════
// TENSION CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

interface TensionContextValue {
  tensions: TensionState;
  setTension: (key: keyof TensionState, value: number) => void;
  setTensions: (tensions: Partial<TensionState>) => void;
  resetTensions: () => void;
  cssVariables: Record<string, string>;
}

const TensionContext = createContext<TensionContextValue | null>(null);

export function TensionProvider({ 
  children,
  initialTensions = DEFAULT_TENSIONS,
}: { 
  children: ReactNode;
  initialTensions?: Partial<TensionState>;
}) {
  const [tensions, setTensionsState] = useState<TensionState>({
    ...DEFAULT_TENSIONS,
    ...initialTensions,
  });
  
  const setTension = useCallback((key: keyof TensionState, value: number) => {
    // Clamp to 0-100
    const clamped = Math.max(0, Math.min(100, value));
    setTensionsState(prev => ({ ...prev, [key]: clamped }));
  }, []);
  
  const setTensions = useCallback((newTensions: Partial<TensionState>) => {
    setTensionsState(prev => ({
      ...prev,
      ...Object.fromEntries(
        Object.entries(newTensions).map(([k, v]) => [k, Math.max(0, Math.min(100, v))])
      ),
    }));
  }, []);
  
  const resetTensions = useCallback(() => {
    setTensionsState(DEFAULT_TENSIONS);
  }, []);
  
  const cssVariables = tensionsToCSSVariables(tensions);
  
  return (
    <TensionContext.Provider value={{ tensions, setTension, setTensions, resetTensions, cssVariables }}>
      <div style={cssVariables as React.CSSProperties}>
        {children}
      </div>
    </TensionContext.Provider>
  );
}

export function useTensions(): TensionContextValue {
  const context = useContext(TensionContext);
  if (!context) {
    throw new Error('useTensions must be used within a TensionProvider');
  }
  return context;
}

// ═══════════════════════════════════════════════════════════════════════════
// TENSION SLIDER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface TensionSliderProps {
  tensionKey: keyof TensionState;
  label: string;
  lowLabel: string;
  highLabel: string;
}

export function TensionSlider({ tensionKey, label, lowLabel, highLabel }: TensionSliderProps) {
  const { tensions, setTension } = useTensions();
  const value = tensions[tensionKey];
  
  return (
    <div className="tension-slider">
      <div className="tension-slider-header">
        <span className="tension-label">{label}</span>
        <span className="tension-value">{value}</span>
      </div>
      <div className="tension-slider-track">
        <span className="tension-low">{lowLabel}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setTension(tensionKey, parseInt(e.target.value))}
          className="tension-input"
        />
        <span className="tension-high">{highLabel}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TENSION CONTROLS PANEL
// ═══════════════════════════════════════════════════════════════════════════

export function TensionControlsPanel() {
  return (
    <div className="tension-controls-panel">
      <h3>Tension Controls</h3>
      
      <TensionSlider
        tensionKey="playfulness"
        label="Playfulness"
        lowLabel="Serious"
        highLabel="Playful"
      />
      
      <TensionSlider
        tensionKey="weight"
        label="Weight"
        lowLabel="Light"
        highLabel="Heavy"
      />
      
      <TensionSlider
        tensionKey="density"
        label="Density"
        lowLabel="Spacious"
        highLabel="Dense"
      />
      
      <TensionSlider
        tensionKey="speed"
        label="Speed"
        lowLabel="Deliberate"
        highLabel="Instant"
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PRESETS
// ═══════════════════════════════════════════════════════════════════════════

export const TENSION_PRESETS: Record<string, TensionState> = {
  linear: {
    playfulness: 20,
    weight: 30,
    density: 70,
    speed: 95,
  },
  airbnb: {
    playfulness: 50,
    weight: 60,
    density: 40,
    speed: 50,
  },
  nintendo: {
    playfulness: 80,
    weight: 50,
    density: 30,
    speed: 60,
  },
  osrs: {
    playfulness: 30,
    weight: 70,
    density: 60,
    speed: 40,
  },
};
