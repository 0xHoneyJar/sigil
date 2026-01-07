'use client';

/**
 * Sigil v3.0 — Persona Context (Runtime)
 *
 * React context for runtime persona management.
 * Provides auto-detection, preference persistence, and persona switching.
 *
 * IMPORTANT: This is a RUNTIME component. No YAML parsing.
 * Persona definitions come from props (embedded by agent at build time).
 *
 * Philosophy: "Same feature, different truth. Not simplified - just appropriate."
 *
 * @module core/persona-context
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Persona ID type.
 */
export type PersonaId = 'power_user' | 'newcomer' | 'mobile' | 'accessibility' | string;

/**
 * Lens type for UI rendering.
 */
export type LensType = 'default' | 'strict' | 'guided' | 'a11y';

/**
 * Motion preference.
 */
export type MotionPreference = 'snappy' | 'warm' | 'reassuring' | 'reduced';

/**
 * Help visibility preference.
 */
export type HelpPreference = 'always' | 'on_demand' | 'contextual' | 'never';

/**
 * Information density preference.
 */
export type DensityPreference = 'high' | 'medium' | 'low';

/**
 * Persona preferences at runtime.
 */
export interface PersonaPreferences {
  /** Motion style preference */
  motion: MotionPreference;
  /** Help visibility preference */
  help: HelpPreference;
  /** Information density preference */
  density: DensityPreference;
  /** Touch target size (e.g., "44px", "48px", "56px") */
  touchTargets?: string;
  /** Whether animations are enabled */
  animations?: boolean;
}

/**
 * Detection result for auto-detection.
 */
export interface DetectionResult {
  /** Detected persona ID */
  persona: PersonaId;
  /** Confidence level (0-1) */
  confidence: number;
  /** Signals that led to this detection */
  signals: string[];
}

/**
 * Persona context value.
 */
export interface PersonaContextValue {
  /** Current persona ID */
  currentPersona: PersonaId;
  /** Current persona preferences */
  preferences: PersonaPreferences;
  /** Default lens for current persona */
  defaultLens: LensType;
  /** Set persona manually */
  setPersona: (persona: PersonaId) => void;
  /** Override specific preferences */
  overridePreferences: (overrides: Partial<PersonaPreferences>) => void;
  /** Reset to auto-detected persona */
  resetToAuto: () => void;
  /** Auto-detection result (if available) */
  autoDetected: DetectionResult | null;
  /** Whether persona was manually set */
  isManuallySet: boolean;
}

/**
 * Props for PersonaProvider.
 */
export interface PersonaProviderProps {
  /** Children to render */
  children: React.ReactNode;
  /** Default persona if detection fails */
  defaultPersona?: PersonaId;
  /** Persona preferences map (embedded by agent) */
  personaPreferences?: Record<PersonaId, PersonaPreferences>;
  /** Persona → lens mapping (embedded by agent) */
  personaLensMap?: Record<PersonaId, LensType>;
  /** Disable auto-detection */
  disableAutoDetection?: boolean;
  /** localStorage key for persistence */
  storageKey?: string;
  /** Override initial persona */
  initialPersona?: PersonaId;
}

// =============================================================================
// DEFAULTS
// =============================================================================

/**
 * Default preferences for each persona.
 */
const DEFAULT_PERSONA_PREFERENCES: Record<PersonaId, PersonaPreferences> = {
  power_user: {
    motion: 'snappy',
    help: 'on_demand',
    density: 'high',
    touchTargets: '32px',
    animations: true,
  },
  newcomer: {
    motion: 'reassuring',
    help: 'always',
    density: 'low',
    touchTargets: '44px',
    animations: true,
  },
  mobile: {
    motion: 'warm',
    help: 'contextual',
    density: 'medium',
    touchTargets: '48px',
    animations: true,
  },
  accessibility: {
    motion: 'reduced',
    help: 'always',
    density: 'low',
    touchTargets: '56px',
    animations: false,
  },
};

/**
 * Default lens for each persona.
 */
const DEFAULT_PERSONA_LENS_MAP: Record<PersonaId, LensType> = {
  power_user: 'strict',
  newcomer: 'guided',
  mobile: 'default',
  accessibility: 'a11y',
};

/**
 * Default persona when detection fails.
 */
const DEFAULT_PERSONA: PersonaId = 'newcomer';

/**
 * localStorage key for persona preference.
 */
const DEFAULT_STORAGE_KEY = 'sigil_persona_preference';

// =============================================================================
// DETECTION
// =============================================================================

/**
 * Detects persona based on device and browser signals.
 */
function detectPersona(): DetectionResult {
  const signals: string[] = [];
  let persona: PersonaId = DEFAULT_PERSONA;
  let confidence = 0.5;

  // Check if running in browser
  if (typeof window === 'undefined') {
    return { persona: DEFAULT_PERSONA, confidence: 0, signals: ['ssr'] };
  }

  // Accessibility detection (highest priority)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

  if (prefersReducedMotion || prefersHighContrast) {
    signals.push(prefersReducedMotion ? 'prefers-reduced-motion' : 'prefers-high-contrast');
    persona = 'accessibility';
    confidence = 0.9;
  }

  // Mobile detection
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileWidth = window.innerWidth < 768;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  if (persona !== 'accessibility' && (isTouchDevice || isMobileWidth || isMobileUA)) {
    signals.push('touch-device');
    if (isMobileWidth) signals.push('mobile-viewport');
    if (isMobileUA) signals.push('mobile-ua');
    persona = 'mobile';
    confidence = signals.length >= 2 ? 0.85 : 0.7;
  }

  // Newcomer detection (default if no other signals)
  if (signals.length === 0) {
    signals.push('no-specific-signals');
    persona = DEFAULT_PERSONA;
    confidence = 0.5;
  }

  return { persona, confidence, signals };
}

// =============================================================================
// CONTEXT
// =============================================================================

/**
 * Default context value.
 */
const defaultContextValue: PersonaContextValue = {
  currentPersona: DEFAULT_PERSONA,
  preferences: DEFAULT_PERSONA_PREFERENCES[DEFAULT_PERSONA],
  defaultLens: DEFAULT_PERSONA_LENS_MAP[DEFAULT_PERSONA],
  setPersona: () => {},
  overridePreferences: () => {},
  resetToAuto: () => {},
  autoDetected: null,
  isManuallySet: false,
};

/**
 * Persona context.
 */
export const PersonaContext = createContext<PersonaContextValue>(defaultContextValue);

/**
 * Provider component for persona context.
 *
 * @example
 * ```tsx
 * <PersonaProvider
 *   defaultPersona="newcomer"
 *   personaPreferences={{
 *     power_user: { motion: 'snappy', help: 'on_demand', density: 'high' },
 *     newcomer: { motion: 'reassuring', help: 'always', density: 'low' },
 *   }}
 * >
 *   <App />
 * </PersonaProvider>
 * ```
 */
export function PersonaProvider({
  children,
  defaultPersona = DEFAULT_PERSONA,
  personaPreferences = DEFAULT_PERSONA_PREFERENCES,
  personaLensMap = DEFAULT_PERSONA_LENS_MAP,
  disableAutoDetection = false,
  storageKey = DEFAULT_STORAGE_KEY,
  initialPersona,
}: PersonaProviderProps): JSX.Element {
  // State
  const [currentPersona, setCurrentPersona] = useState<PersonaId>(initialPersona || defaultPersona);
  const [preferenceOverrides, setPreferenceOverrides] = useState<Partial<PersonaPreferences>>({});
  const [autoDetected, setAutoDetected] = useState<DetectionResult | null>(null);
  const [isManuallySet, setIsManuallySet] = useState<boolean>(false);

  // Auto-detection on mount
  useEffect(() => {
    if (disableAutoDetection) return;

    // Check localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.persona && typeof parsed.persona === 'string') {
            setCurrentPersona(parsed.persona as PersonaId);
            setIsManuallySet(true);
            return;
          }
        } catch {
          // Invalid stored value, continue with detection
        }
      }
    }

    // Auto-detect
    const detected = detectPersona();
    setAutoDetected(detected);
    setCurrentPersona(detected.persona);
  }, [disableAutoDetection, storageKey]);

  // Persist preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isManuallySet) {
      localStorage.setItem(storageKey, JSON.stringify({ persona: currentPersona }));
    }
  }, [currentPersona, isManuallySet, storageKey]);

  // Get base preferences for current persona
  const basePreferences = useMemo(() => {
    return personaPreferences[currentPersona] || DEFAULT_PERSONA_PREFERENCES[currentPersona] || DEFAULT_PERSONA_PREFERENCES[DEFAULT_PERSONA];
  }, [currentPersona, personaPreferences]);

  // Merge base preferences with overrides
  const preferences = useMemo(() => {
    return { ...basePreferences, ...preferenceOverrides };
  }, [basePreferences, preferenceOverrides]);

  // Get default lens for current persona
  const defaultLens = useMemo(() => {
    return personaLensMap[currentPersona] || DEFAULT_PERSONA_LENS_MAP[currentPersona] || 'default';
  }, [currentPersona, personaLensMap]);

  // Set persona manually
  const setPersona = useCallback((persona: PersonaId) => {
    setCurrentPersona(persona);
    setIsManuallySet(true);
    setPreferenceOverrides({});
  }, []);

  // Override preferences
  const overridePreferences = useCallback((overrides: Partial<PersonaPreferences>) => {
    setPreferenceOverrides((prev) => ({ ...prev, ...overrides }));
  }, []);

  // Reset to auto-detected
  const resetToAuto = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
    setIsManuallySet(false);
    setPreferenceOverrides({});
    const detected = detectPersona();
    setAutoDetected(detected);
    setCurrentPersona(detected.persona);
  }, [storageKey]);

  // Context value
  const value = useMemo<PersonaContextValue>(
    () => ({
      currentPersona,
      preferences,
      defaultLens,
      setPersona,
      overridePreferences,
      resetToAuto,
      autoDetected,
      isManuallySet,
    }),
    [
      currentPersona,
      preferences,
      defaultLens,
      setPersona,
      overridePreferences,
      resetToAuto,
      autoDetected,
      isManuallySet,
    ]
  );

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to access persona context.
 *
 * Returns sensible defaults if used outside PersonaProvider.
 *
 * @returns Persona context value
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { currentPersona, preferences, setPersona } = usePersona();
 *
 *   return (
 *     <div style={{ padding: preferences.density === 'high' ? '8px' : '16px' }}>
 *       Current persona: {currentPersona}
 *       <button onClick={() => setPersona('power_user')}>
 *         Switch to Power User
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePersona(): PersonaContextValue {
  return useContext(PersonaContext);
}

/**
 * Hook to check if current persona matches.
 *
 * @param persona - Persona to check
 * @returns True if current persona matches
 */
export function useIsPersona(persona: PersonaId): boolean {
  const { currentPersona } = usePersona();
  return currentPersona === persona;
}

/**
 * Hook to get current persona preferences.
 *
 * @returns Current persona preferences
 */
export function usePersonaPreferences(): PersonaPreferences {
  const { preferences } = usePersona();
  return preferences;
}

/**
 * Hook to get the default lens for current persona.
 *
 * @returns Default lens type
 */
export function useDefaultLens(): LensType {
  const { defaultLens } = usePersona();
  return defaultLens;
}

// =============================================================================
// ZONE-PERSONA UTILITIES
// =============================================================================

/**
 * Zone override configuration.
 */
export interface ZonePersonaOverride {
  lens?: LensType;
  help?: HelpPreference;
  density?: DensityPreference;
  motion?: MotionPreference;
}

/**
 * Zone configuration with persona overrides.
 */
export interface ZoneConfig {
  layout: string | null;
  timeAuthority: 'server-tick' | 'optimistic' | 'hybrid';
  lens: LensType | 'user-preference';
  constraints: Record<string, string>;
  persona_overrides?: Record<PersonaId, ZonePersonaOverride>;
}

/**
 * Gets effective preferences by merging zone overrides with persona base preferences.
 *
 * Priority order (highest first):
 * 1. Zone persona override
 * 2. Persona base preferences
 * 3. Zone defaults
 *
 * @param basePreferences - Base persona preferences
 * @param zone - Zone configuration
 * @param persona - Current persona ID
 * @returns Merged effective preferences
 *
 * @example
 * ```ts
 * const effective = getEffectivePreferences(
 *   { motion: 'snappy', help: 'on_demand', density: 'high' },
 *   criticalZoneConfig,
 *   'newcomer'
 * );
 * // Returns: { motion: 'reassuring', help: 'always', density: 'low', ... }
 * ```
 */
export function getEffectivePreferences(
  basePreferences: PersonaPreferences,
  zone: ZoneConfig | undefined,
  persona: PersonaId
): PersonaPreferences & { effectiveLens?: LensType } {
  // Start with base preferences
  const result = { ...basePreferences };

  // No zone or no overrides - return base
  if (!zone || !zone.persona_overrides) {
    return result;
  }

  // Get override for this persona
  const override = zone.persona_overrides[persona];
  if (!override) {
    return result;
  }

  // Merge override into result
  return {
    ...result,
    ...(override.help && { help: override.help }),
    ...(override.density && { density: override.density }),
    ...(override.motion && { motion: override.motion }),
    ...(override.lens && { effectiveLens: override.lens }),
  };
}

/**
 * Hook to get effective preferences with zone overrides.
 *
 * @param zoneConfig - Zone configuration (from Layout component)
 * @returns Effective preferences with zone overrides applied
 */
export function useEffectivePreferences(zoneConfig?: ZoneConfig): PersonaPreferences & { effectiveLens?: LensType } {
  const { currentPersona, preferences } = usePersona();
  return getEffectivePreferences(preferences, zoneConfig, currentPersona);
}
