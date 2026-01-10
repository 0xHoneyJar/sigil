/**
 * Sigil v7.6 - Gold Tier Hooks
 *
 * Executable design principles as hooks.
 * These replace markdown documentation with type-safe, queryable code.
 *
 * @sigil-tier gold
 */

export {
  // Core hook
  useMotion,
  useMotionProperty,
  useMotionProperties,
  // Utilities
  getPhysicsConfig,
  isValidPhysics,
  getAllPhysicsNames,
  // Constants
  PHYSICS,
  // Types
  type PhysicsName,
  type PhysicsConfig,
  type MotionStyle,
} from './useMotion';
