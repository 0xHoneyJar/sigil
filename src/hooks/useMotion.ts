/**
 * Sigil v10.1 "Usage Reality" - useMotion Hook
 *
 * Motion physics as executable code. Replaces markdown principles
 * with type-safe, agent-queryable motion configurations.
 *
 * "Teach the agent to read Physics, not Essays."
 *
 * @module @sigil/hooks/useMotion
 * @version 10.1.0
 *
 * @example
 * ```tsx
 * import { useMotion } from '@/hooks/useMotion';
 *
 * function Button() {
 *   const motion = useMotion('snappy');
 *   return <button style={{ transition: motion.transition }}>Click</button>;
 * }
 * ```
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Available physics presets.
 *
 * - server-tick: For server-dependent operations (600ms) - claims, deposits
 * - deliberate: For critical zone interactions (800ms) - confirmations
 * - snappy: For immediate feedback (150ms) - buttons, toggles
 * - smooth: For ambient transitions (300ms) - hover, focus
 * - instant: For no-delay updates (0ms) - local state changes
 */
export type PhysicsName =
  | 'server-tick'
  | 'deliberate'
  | 'snappy'
  | 'smooth'
  | 'instant';

/**
 * Physics configuration values.
 */
export interface PhysicsConfig {
  /** Duration in milliseconds */
  duration: number;
  /** CSS easing function */
  easing: string;
}

/**
 * Motion style output for use in components.
 */
export interface MotionStyle {
  /** CSS transition property value */
  transition: string;
  /** Duration in milliseconds */
  duration: number;
  /** Easing function */
  easing: string;
  /** CSS transition-duration value */
  transitionDuration: string;
  /** CSS transition-timing-function value */
  transitionTimingFunction: string;
}

// ============================================================================
// Physics Configurations
// ============================================================================

/**
 * Physics presets with timing and easing values.
 *
 * Agent instruction: Use these presets based on zone and data type:
 * - critical zone + financial data → 'deliberate' or 'server-tick'
 * - standard zone + interactive → 'snappy'
 * - ambient/decorative → 'smooth'
 * - local-first state → 'instant'
 */
export const PHYSICS: Record<PhysicsName, PhysicsConfig> = {
  'server-tick': {
    duration: 600,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  deliberate: {
    duration: 800,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  snappy: {
    duration: 150,
    easing: 'ease-out',
  },
  smooth: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  instant: {
    duration: 0,
    easing: 'linear',
  },
} as const;

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Get motion styles for a physics preset.
 *
 * @param physics - The physics preset name
 * @returns Motion style object with transition properties
 *
 * @example
 * ```tsx
 * const { transition, duration } = useMotion('snappy');
 * // transition = "all 150ms ease-out"
 * // duration = 150
 * ```
 */
export function useMotion(physics: PhysicsName): MotionStyle {
  const config = PHYSICS[physics];

  return {
    transition: `all ${config.duration}ms ${config.easing}`,
    duration: config.duration,
    easing: config.easing,
    transitionDuration: `${config.duration}ms`,
    transitionTimingFunction: config.easing,
  };
}

/**
 * Get motion styles for a specific CSS property.
 *
 * @param physics - The physics preset name
 * @param property - CSS property to animate (e.g., 'opacity', 'transform')
 * @returns Motion style object with property-specific transition
 *
 * @example
 * ```tsx
 * const { transition } = useMotionProperty('smooth', 'opacity');
 * // transition = "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)"
 * ```
 */
export function useMotionProperty(
  physics: PhysicsName,
  property: string
): MotionStyle {
  const config = PHYSICS[physics];

  return {
    transition: `${property} ${config.duration}ms ${config.easing}`,
    duration: config.duration,
    easing: config.easing,
    transitionDuration: `${config.duration}ms`,
    transitionTimingFunction: config.easing,
  };
}

/**
 * Get motion styles for multiple CSS properties.
 *
 * @param physics - The physics preset name
 * @param properties - Array of CSS properties to animate
 * @returns Motion style object with multi-property transition
 *
 * @example
 * ```tsx
 * const { transition } = useMotionProperties('snappy', ['opacity', 'transform']);
 * // transition = "opacity 150ms ease-out, transform 150ms ease-out"
 * ```
 */
export function useMotionProperties(
  physics: PhysicsName,
  properties: string[]
): MotionStyle {
  const config = PHYSICS[physics];

  const transitions = properties
    .map((prop) => `${prop} ${config.duration}ms ${config.easing}`)
    .join(', ');

  return {
    transition: transitions,
    duration: config.duration,
    easing: config.easing,
    transitionDuration: `${config.duration}ms`,
    transitionTimingFunction: config.easing,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get raw physics configuration without computed styles.
 *
 * @param physics - The physics preset name
 * @returns Raw physics configuration
 */
export function getPhysicsConfig(physics: PhysicsName): PhysicsConfig {
  return PHYSICS[physics];
}

/**
 * Check if a value is a valid physics name.
 *
 * @param value - Value to check
 * @returns true if value is a valid PhysicsName
 */
export function isValidPhysics(value: unknown): value is PhysicsName {
  return (
    typeof value === 'string' &&
    ['server-tick', 'deliberate', 'snappy', 'smooth', 'instant'].includes(value)
  );
}

/**
 * Get all available physics names.
 *
 * @returns Array of all physics preset names
 */
export function getAllPhysicsNames(): PhysicsName[] {
  return Object.keys(PHYSICS) as PhysicsName[];
}
