/**
 * Sigil v10.1 "Usage Reality" - Physics System
 *
 * Effect-based physics mapping. The verb (effect) determines the physics,
 * not the noun (data type).
 *
 * "Is Credits Money? Is Points Money? Wrong question.
 *  Does the action MUTATE state? That's what matters."
 *
 * @module @sigil/physics
 * @version 10.1.0
 */

/**
 * CSS Properties type (compatible with React.CSSProperties).
 * Defined locally to avoid React dependency.
 */
type CSSProperties = Record<string, string | number | undefined>;

// =============================================================================
// Types
// =============================================================================

/**
 * Effect types that determine physics behavior.
 */
export type EffectType = 'mutation' | 'query' | 'local_state' | 'sensitive_mutation';

/**
 * Physics preset names.
 */
export type PhysicsName =
  | 'server-tick'
  | 'deliberate'
  | 'snappy'
  | 'smooth'
  | 'instant';

/**
 * Zone names for layout-based physics.
 */
export type ZoneName = 'critical' | 'important' | 'casual';

/**
 * Sync strategy for mutations.
 */
export type SyncStrategy = 'pessimistic' | 'optimistic' | 'immediate';

/**
 * Physics configuration for an effect type.
 */
export interface PhysicsConfig {
  /** Sync strategy */
  sync: SyncStrategy;
  /** Animation timing in milliseconds */
  timing: number;
  /** Whether to show simulation preview */
  simulation: boolean;
  /** CSS easing function */
  easing: string;
}

/**
 * Motion style output for use in components.
 */
export interface MotionStyle extends CSSProperties {
  transition: string;
  '--sigil-duration': string;
  '--sigil-easing': string;
}

/**
 * Framer Motion transition configuration.
 */
export interface FramerTransition {
  duration: number;
  ease: number[] | string;
}

// =============================================================================
// Physics Definitions
// =============================================================================

/**
 * Named physics presets.
 */
export const PHYSICS: Record<PhysicsName, { duration: number; easing: string }> = {
  'server-tick': {
    duration: 600,
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
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
};

/**
 * Effect type to physics configuration mapping.
 *
 * This is the core of v10.1's "Usage Reality" - physics is determined
 * by the effect (verb), not the data type (noun).
 */
export const EFFECT_PHYSICS: Record<EffectType, PhysicsConfig> = {
  mutation: {
    sync: 'pessimistic',
    timing: 800,
    simulation: true,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  query: {
    sync: 'optimistic',
    timing: 150,
    simulation: false,
    easing: 'ease-out',
  },
  local_state: {
    sync: 'immediate',
    timing: 0,
    simulation: false,
    easing: 'linear',
  },
  sensitive_mutation: {
    sync: 'pessimistic',
    timing: 1200,
    simulation: true,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

/**
 * Zone to physics mapping.
 */
export const ZONE_PHYSICS: Record<ZoneName, PhysicsName> = {
  critical: 'server-tick',
  important: 'deliberate',
  casual: 'snappy',
};

/**
 * Sensitive mutation patterns.
 * Actions matching these patterns require extra caution.
 */
export const SENSITIVE_PATTERNS = [
  'ownership',
  'permission',
  'delete',
  'transfer',
  'withdraw',
  'burn',
  'destroy',
] as const;

// =============================================================================
// Physics Inference
// =============================================================================

/**
 * Infer physics from an effect type.
 *
 * @param effect - The effect type
 * @returns Physics configuration
 *
 * @example
 * ```typescript
 * const physics = inferPhysicsFromEffect('mutation');
 * // { sync: 'pessimistic', timing: 800, simulation: true, ... }
 * ```
 */
export function inferPhysicsFromEffect(effect: EffectType): PhysicsConfig {
  return EFFECT_PHYSICS[effect];
}

/**
 * Infer effect type from action name.
 *
 * @param actionName - Name of the action/function
 * @returns Inferred effect type
 *
 * @example
 * ```typescript
 * inferEffectType('submitForm');     // 'mutation'
 * inferEffectType('fetchUsers');     // 'query'
 * inferEffectType('setIsOpen');      // 'local_state'
 * inferEffectType('transferOwnership'); // 'sensitive_mutation'
 * ```
 */
export function inferEffectType(actionName: string): EffectType {
  const lowerName = actionName.toLowerCase();

  // Check for sensitive patterns first
  for (const pattern of SENSITIVE_PATTERNS) {
    if (lowerName.includes(pattern)) {
      return 'sensitive_mutation';
    }
  }

  // Query patterns
  if (
    lowerName.startsWith('get') ||
    lowerName.startsWith('fetch') ||
    lowerName.startsWith('load') ||
    lowerName.startsWith('read') ||
    lowerName.startsWith('find') ||
    lowerName.startsWith('search') ||
    lowerName.startsWith('list')
  ) {
    return 'query';
  }

  // Local state patterns
  if (
    lowerName.startsWith('set') ||
    lowerName.startsWith('toggle') ||
    lowerName.startsWith('reset') ||
    lowerName.includes('local') ||
    lowerName.includes('state')
  ) {
    return 'local_state';
  }

  // Mutation patterns
  if (
    lowerName.startsWith('create') ||
    lowerName.startsWith('update') ||
    lowerName.startsWith('submit') ||
    lowerName.startsWith('save') ||
    lowerName.startsWith('post') ||
    lowerName.startsWith('put') ||
    lowerName.startsWith('patch') ||
    lowerName.startsWith('add') ||
    lowerName.startsWith('remove') ||
    lowerName.includes('mutation')
  ) {
    return 'mutation';
  }

  // Default to mutation (safe default)
  return 'mutation';
}

/**
 * Get physics for an action by inferring its effect type.
 *
 * @param actionName - Name of the action
 * @returns Physics configuration
 */
export function getPhysicsForAction(actionName: string): PhysicsConfig {
  const effect = inferEffectType(actionName);
  return inferPhysicsFromEffect(effect);
}

// =============================================================================
// Motion Hooks
// =============================================================================

/**
 * Get motion styles for a physics preset.
 *
 * @param physics - Physics preset name
 * @returns Motion style object
 *
 * @example
 * ```typescript
 * const motion = useMotion('snappy');
 * <button style={motion}>Click me</button>
 * ```
 */
export function useMotion(physics: PhysicsName): MotionStyle {
  const config = PHYSICS[physics];

  return {
    transition: `all ${config.duration}ms ${config.easing}`,
    '--sigil-duration': `${config.duration}ms`,
    '--sigil-easing': config.easing,
  };
}

/**
 * Get motion styles for a zone.
 *
 * @param zone - Zone name
 * @returns Motion style object
 *
 * @example
 * ```typescript
 * const motion = useZoneMotion('critical');
 * <button style={motion}>Deposit</button>
 * ```
 */
export function useZoneMotion(zone: ZoneName): MotionStyle {
  const physics = ZONE_PHYSICS[zone];
  return useMotion(physics);
}

/**
 * Get motion styles for an effect type.
 *
 * @param effect - Effect type
 * @returns Motion style object
 *
 * @example
 * ```typescript
 * const motion = useEffectMotion('mutation');
 * <button style={motion}>Submit</button>
 * ```
 */
export function useEffectMotion(effect: EffectType): MotionStyle {
  const config = EFFECT_PHYSICS[effect];

  return {
    transition: `all ${config.timing}ms ${config.easing}`,
    '--sigil-duration': `${config.timing}ms`,
    '--sigil-easing': config.easing,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get physics configuration by name.
 *
 * @param physics - Physics preset name
 */
export function getPhysics(physics: PhysicsName): { duration: number; easing: string } {
  return PHYSICS[physics];
}

/**
 * Get physics for a zone.
 *
 * @param zone - Zone name
 */
export function getZonePhysics(zone: ZoneName): {
  name: PhysicsName;
  duration: number;
  easing: string;
} {
  const physicsName = ZONE_PHYSICS[zone];
  return { name: physicsName, ...PHYSICS[physicsName] };
}

/**
 * Get Framer Motion transition configuration.
 *
 * @param physics - Physics preset name
 * @returns Framer Motion transition object
 *
 * @example
 * ```typescript
 * const transition = getFramerTransition('smooth');
 * <motion.div animate={{ opacity: 1 }} transition={transition} />
 * ```
 */
export function getFramerTransition(physics: PhysicsName): FramerTransition {
  const config = PHYSICS[physics];

  // Parse cubic-bezier for Framer Motion
  let ease: number[] | string = [0.4, 0, 0.2, 1]; // default

  if (config.easing.startsWith('cubic-bezier')) {
    const match = config.easing.match(/cubic-bezier\(([^)]+)\)/);
    if (match) {
      ease = match[1].split(',').map((n) => parseFloat(n.trim()));
    }
  } else if (config.easing === 'ease-out') {
    ease = [0, 0, 0.2, 1];
  } else if (config.easing === 'linear') {
    ease = 'linear';
  }

  return {
    duration: config.duration / 1000,
    ease,
  };
}

/**
 * Get Framer Motion transition for an effect type.
 *
 * @param effect - Effect type
 */
export function getEffectFramerTransition(effect: EffectType): FramerTransition {
  const config = EFFECT_PHYSICS[effect];

  let ease: number[] | string = [0.4, 0, 0.2, 1];
  if (config.easing === 'ease-out') {
    ease = [0, 0, 0.2, 1];
  } else if (config.easing === 'linear') {
    ease = 'linear';
  }

  return {
    duration: config.timing / 1000,
    ease,
  };
}

/**
 * Get Tailwind motion classes for a physics preset.
 *
 * @param physics - Physics preset name
 * @returns Tailwind class string
 *
 * @example
 * ```typescript
 * const classes = getMotionClasses('snappy');
 * // "transition-all duration-[150ms] ease-out"
 * ```
 */
export function getMotionClasses(physics: PhysicsName): string {
  const config = PHYSICS[physics];
  const durationClass = `duration-[${config.duration}ms]`;

  // Map to Tailwind easing
  let easingClass = 'ease-out';
  if (physics === 'deliberate' || physics === 'smooth') {
    easingClass = 'ease-in-out';
  } else if (physics === 'instant') {
    easingClass = 'ease-linear';
  }

  return `transition-all ${durationClass} ${easingClass}`;
}

/**
 * Get Tailwind motion classes for an effect type.
 *
 * @param effect - Effect type
 */
export function getEffectMotionClasses(effect: EffectType): string {
  const config = EFFECT_PHYSICS[effect];
  const durationClass = `duration-[${config.timing}ms]`;

  let easingClass = 'ease-out';
  if (config.sync === 'pessimistic') {
    easingClass = 'ease-in-out';
  } else if (config.sync === 'immediate') {
    easingClass = 'ease-linear';
  }

  return `transition-all ${durationClass} ${easingClass}`;
}

// =============================================================================
// Validation
// =============================================================================

/**
 * Check if a value is a valid physics name.
 *
 * @param value - Value to check
 */
export function isValidPhysics(value: unknown): value is PhysicsName {
  return (
    typeof value === 'string' &&
    ['server-tick', 'deliberate', 'snappy', 'smooth', 'instant'].includes(value)
  );
}

/**
 * Check if a value is a valid zone name.
 *
 * @param value - Value to check
 */
export function isValidZone(value: unknown): value is ZoneName {
  return (
    typeof value === 'string' &&
    ['critical', 'important', 'casual'].includes(value)
  );
}

/**
 * Check if a value is a valid effect type.
 *
 * @param value - Value to check
 */
export function isValidEffect(value: unknown): value is EffectType {
  return (
    typeof value === 'string' &&
    ['mutation', 'query', 'local_state', 'sensitive_mutation'].includes(value)
  );
}

/**
 * Get all physics preset names.
 */
export function getAllPhysicsNames(): PhysicsName[] {
  return Object.keys(PHYSICS) as PhysicsName[];
}

/**
 * Get all zone names.
 */
export function getAllZoneNames(): ZoneName[] {
  return Object.keys(ZONE_PHYSICS) as ZoneName[];
}

/**
 * Get all effect types.
 */
export function getAllEffectTypes(): EffectType[] {
  return Object.keys(EFFECT_PHYSICS) as EffectType[];
}
