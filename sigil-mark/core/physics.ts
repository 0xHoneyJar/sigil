/**
 * @sigil-core Physics Tokens
 *
 * Central definition of all physics values. Components read from context,
 * which provides the appropriate physics based on zone.
 *
 * Philosophy: "Physics as data, not hardcoded values"
 * - Diffs show physics changes (this file is versioned)
 * - Context provides the right physics automatically
 * - Zero refactors when moving code between zones
 */

export type Material = 'decisive' | 'machinery' | 'glass';

export interface SpringConfig {
  type: 'spring';
  stiffness: number;
  damping: number;
  mass?: number;
}

export interface TapConfig {
  scale: number;
}

export interface PhysicsToken {
  spring: SpringConfig;
  tap: TapConfig;
  /** Minimum pending time for server actions (ms) */
  minPendingTime: number;
  /** Human-readable description */
  feel: string;
}

/**
 * Physics tokens by material type.
 *
 * @example Viewing the diff
 * ```diff
 * // Changing checkout feel from glass to decisive:
 * - spring: { stiffness: 200, damping: 20 }
 * + spring: { stiffness: 180, damping: 12 }
 * ```
 */
export const PHYSICS: Record<Material, PhysicsToken> = {
  /**
   * Decisive: Heavy, deliberate feel for critical actions.
   * Used in checkout, transactions, claims.
   *
   * Rationale:
   * - stiffness: 180 — Weighty, not snappy
   * - damping: 12 — Controlled settle, no bounce
   * - tap: 0.98 — Subtle press feedback
   * - minPending: 600ms — Deliberate processing feel
   */
  decisive: {
    spring: {
      type: 'spring',
      stiffness: 180,
      damping: 12,
    },
    tap: { scale: 0.98 },
    minPendingTime: 600,
    feel: 'Heavy, deliberate - like confirming a bank transfer',
  },

  /**
   * Machinery: Instant, efficient feel for admin actions.
   * Used in dashboards, forms, toggles.
   *
   * Rationale:
   * - stiffness: 400 — Snappy response
   * - damping: 30 — No overshoot
   * - tap: 0.96 — Crisp press
   * - minPending: 0ms — Instant feedback
   */
  machinery: {
    spring: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
    tap: { scale: 0.96 },
    minPendingTime: 0,
    feel: 'Instant, efficient - like a keyboard shortcut',
  },

  /**
   * Glass: Smooth, delightful feel for marketing/exploratory.
   * Used in landing pages, galleries, browse experiences.
   *
   * Rationale:
   * - stiffness: 200 — Smooth motion
   * - damping: 20 — Gentle settle
   * - tap: 0.97 — Light press
   * - minPending: 200ms — Brief acknowledgment
   */
  glass: {
    spring: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
    tap: { scale: 0.97 },
    minPendingTime: 200,
    feel: 'Smooth, delightful - like browsing a gallery',
  },
};

/**
 * Get physics for a material type.
 * Prefer using useSigilPhysics() hook which reads from context.
 */
export function getPhysics(material: Material): PhysicsToken {
  return PHYSICS[material];
}

/**
 * Default material when no zone context is available.
 */
export const DEFAULT_MATERIAL: Material = 'glass';

export default PHYSICS;
