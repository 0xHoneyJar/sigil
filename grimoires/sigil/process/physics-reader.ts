/**
 * Sigil v4.1 - Physics Reader
 *
 * Reads and manages physics configuration from kernel/physics.yaml.
 * Provides motion timing, easing, and constraints for agent-time, compile-time, and runtime use.
 *
 * Philosophy: "Physics should feel intentional. Every timing value has meaning."
 *
 * @module process/physics-reader
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import YAML from 'yaml';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Motion name (matches physics.yaml keys).
 */
export type MotionName =
  | 'instant'
  | 'snappy'
  | 'warm'
  | 'deliberate'
  | 'reassuring'
  | 'celebratory'
  | 'reduced';

/**
 * Sync strategy name.
 */
export type SyncStrategyName = 'pessimistic' | 'optimistic' | 'hybrid';

/**
 * Duration configuration (fixed or range).
 */
export interface DurationConfig {
  /** Fixed value (for instant, reduced) */
  value?: number;
  /** Minimum duration (for ranges) */
  min?: number;
  /** Maximum duration (for ranges) */
  max?: number;
  /** Default duration (for ranges) */
  default?: number;
}

/**
 * Zone preferences for motion/sync.
 */
export interface ZonePreferences {
  /** Zones where this is preferred */
  prefer: string[];
  /** Zones where this should be avoided */
  avoid: string[];
}

/**
 * Motion configuration from physics.yaml.
 */
export interface MotionConfig {
  /** Human-readable description */
  description: string;
  /** Duration configuration */
  duration: DurationConfig;
  /** Time unit (always 'ms') */
  unit: 'ms';
  /** CSS easing string */
  easing: string;
  /** Example use cases */
  use_cases?: string[];
  /** Zone preferences */
  zones?: ZonePreferences;
  /** Whether this is for accessibility */
  accessibility?: boolean;
}

/**
 * Sync strategy configuration from physics.yaml.
 */
export interface SyncStrategyConfig {
  /** Human-readable description */
  description: string;
  /** Key characteristics */
  characteristics: string[];
  /** Default motion for this strategy */
  default_motion: MotionName;
  /** Zone preferences */
  zones?: ZonePreferences;
  /** Code example */
  example?: string;
}

/**
 * Timing constraint (min/max for ESLint rule).
 */
export interface TimingConstraint {
  /** Minimum allowed timing in ms */
  min: number;
  /** Maximum allowed timing in ms */
  max: number;
}

/**
 * Default fallback values.
 */
export interface PhysicsDefaults {
  /** Default motion name */
  motion: MotionName;
  /** Default sync strategy */
  sync: SyncStrategyName;
  /** Default CSS easing */
  easing: string;
  /** Default timing in ms */
  timing: number;
}

/**
 * Full physics configuration from physics.yaml.
 */
export interface PhysicsConfig {
  /** Schema version */
  version: string;
  /** Motion configurations */
  motions: Record<MotionName, MotionConfig>;
  /** Sync strategy configurations */
  sync_strategies: Record<SyncStrategyName, SyncStrategyConfig>;
  /** Timing constraints for ESLint */
  constraints: Record<MotionName, TimingConstraint>;
  /** Default fallback values */
  defaults: PhysicsDefaults;
}

// =============================================================================
// DEFAULTS (Hardcoded fallbacks)
// =============================================================================

/**
 * Default motion configurations (used when physics.yaml is missing).
 */
export const DEFAULT_MOTION_CONFIGS: Record<MotionName, MotionConfig> = {
  instant: {
    description: 'No perceptible delay.',
    duration: { value: 0 },
    unit: 'ms',
    easing: 'linear',
  },
  snappy: {
    description: 'Quick, responsive feel.',
    duration: { min: 100, max: 200, default: 150 },
    unit: 'ms',
    easing: 'ease-out',
  },
  warm: {
    description: 'Smooth, welcoming transitions.',
    duration: { min: 200, max: 400, default: 300 },
    unit: 'ms',
    easing: 'ease-in-out',
  },
  deliberate: {
    description: 'Slower, considered motion.',
    duration: { min: 500, max: 1000, default: 800 },
    unit: 'ms',
    easing: 'ease-out',
  },
  reassuring: {
    description: 'Calm, steady motion.',
    duration: { min: 800, max: 1500, default: 1200 },
    unit: 'ms',
    easing: 'ease-in-out',
  },
  celebratory: {
    description: 'Joyful, bouncy motion.',
    duration: { min: 800, max: 1500, default: 1200 },
    unit: 'ms',
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  reduced: {
    description: 'Minimal motion for accessibility.',
    duration: { value: 0 },
    unit: 'ms',
    easing: 'linear',
    accessibility: true,
  },
};

/**
 * Default timing constraints.
 */
export const DEFAULT_CONSTRAINTS: Record<MotionName, TimingConstraint> = {
  instant: { min: 0, max: 50 },
  snappy: { min: 100, max: 200 },
  warm: { min: 200, max: 400 },
  deliberate: { min: 500, max: 1000 },
  reassuring: { min: 800, max: 1500 },
  celebratory: { min: 800, max: 1500 },
  reduced: { min: 0, max: 0 },
};

/**
 * Default sync strategy configurations.
 */
export const DEFAULT_SYNC_STRATEGIES: Record<SyncStrategyName, SyncStrategyConfig> = {
  pessimistic: {
    description: 'Server owns clock. Must show pending state.',
    characteristics: ['Button disabled while pending', 'Loading indicator required'],
    default_motion: 'deliberate',
  },
  optimistic: {
    description: 'Client owns clock. Instant update.',
    characteristics: ['Immediate UI update', 'Silent rollback on failure'],
    default_motion: 'snappy',
  },
  hybrid: {
    description: 'Optimistic with indicator. Visible rollback.',
    characteristics: ['Immediate UI update with indicator', 'Visible rollback on failure'],
    default_motion: 'warm',
  },
};

/**
 * Default physics configuration.
 */
export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  version: '4.1.0',
  motions: DEFAULT_MOTION_CONFIGS,
  sync_strategies: DEFAULT_SYNC_STRATEGIES,
  constraints: DEFAULT_CONSTRAINTS,
  defaults: {
    motion: 'warm',
    sync: 'optimistic',
    easing: 'ease-in-out',
    timing: 300,
  },
};

/**
 * Default path to the physics file.
 */
export const DEFAULT_PHYSICS_PATH = 'grimoires/sigil/constitution/physics.yaml';

// =============================================================================
// CACHE
// =============================================================================

let cachedConfig: PhysicsConfig | null = null;
let cachedPath: string | null = null;

/**
 * Clears the physics config cache.
 * Useful for testing or when physics.yaml is updated.
 */
export function clearPhysicsCache(): void {
  cachedConfig = null;
  cachedPath = null;
}

// =============================================================================
// VALIDATION
// =============================================================================

const VALID_MOTION_NAMES: MotionName[] = [
  'instant', 'snappy', 'warm', 'deliberate', 'reassuring', 'celebratory', 'reduced'
];

const VALID_SYNC_STRATEGIES: SyncStrategyName[] = ['pessimistic', 'optimistic', 'hybrid'];

/**
 * Validates a motion name.
 */
function isValidMotionName(name: string): name is MotionName {
  return VALID_MOTION_NAMES.includes(name as MotionName);
}

/**
 * Validates a sync strategy name.
 */
function isValidSyncStrategy(name: string): name is SyncStrategyName {
  return VALID_SYNC_STRATEGIES.includes(name as SyncStrategyName);
}

/**
 * Normalizes a motion config from parsed YAML.
 */
function normalizeMotionConfig(obj: Record<string, unknown>): MotionConfig {
  const duration = obj.duration as Record<string, number> | undefined;

  return {
    description: typeof obj.description === 'string' ? obj.description : '',
    duration: {
      value: duration?.value,
      min: duration?.min,
      max: duration?.max,
      default: duration?.default,
    },
    unit: 'ms',
    easing: typeof obj.easing === 'string' ? obj.easing : 'ease-in-out',
    use_cases: Array.isArray(obj.use_cases) ? obj.use_cases : undefined,
    zones: obj.zones as ZonePreferences | undefined,
    accessibility: typeof obj.accessibility === 'boolean' ? obj.accessibility : undefined,
  };
}

/**
 * Normalizes a sync strategy config from parsed YAML.
 */
function normalizeSyncStrategyConfig(obj: Record<string, unknown>): SyncStrategyConfig {
  return {
    description: typeof obj.description === 'string' ? obj.description : '',
    characteristics: Array.isArray(obj.characteristics) ? obj.characteristics : [],
    default_motion: isValidMotionName(obj.default_motion as string)
      ? (obj.default_motion as MotionName)
      : 'warm',
    zones: obj.zones as ZonePreferences | undefined,
    example: typeof obj.example === 'string' ? obj.example : undefined,
  };
}

/**
 * Validates and normalizes physics configuration.
 */
function validatePhysicsConfig(parsed: unknown): PhysicsConfig {
  if (typeof parsed !== 'object' || parsed === null) {
    console.warn('[Sigil Physics] Invalid configuration format, using defaults');
    return DEFAULT_PHYSICS_CONFIG;
  }

  const obj = parsed as Record<string, unknown>;

  // Version
  const version = typeof obj.version === 'string' ? obj.version : '4.1.0';

  // Motions
  const motions: Record<MotionName, MotionConfig> = { ...DEFAULT_MOTION_CONFIGS };
  if (typeof obj.motions === 'object' && obj.motions !== null) {
    for (const [name, config] of Object.entries(obj.motions as Record<string, unknown>)) {
      if (isValidMotionName(name) && typeof config === 'object' && config !== null) {
        motions[name] = normalizeMotionConfig(config as Record<string, unknown>);
      }
    }
  }

  // Sync strategies
  const sync_strategies: Record<SyncStrategyName, SyncStrategyConfig> = { ...DEFAULT_SYNC_STRATEGIES };
  if (typeof obj.sync_strategies === 'object' && obj.sync_strategies !== null) {
    for (const [name, config] of Object.entries(obj.sync_strategies as Record<string, unknown>)) {
      if (isValidSyncStrategy(name) && typeof config === 'object' && config !== null) {
        sync_strategies[name] = normalizeSyncStrategyConfig(config as Record<string, unknown>);
      }
    }
  }

  // Constraints
  const constraints: Record<MotionName, TimingConstraint> = { ...DEFAULT_CONSTRAINTS };
  if (typeof obj.constraints === 'object' && obj.constraints !== null) {
    for (const [name, constraint] of Object.entries(obj.constraints as Record<string, unknown>)) {
      if (isValidMotionName(name) && typeof constraint === 'object' && constraint !== null) {
        const c = constraint as Record<string, number>;
        constraints[name] = {
          min: typeof c.min === 'number' ? c.min : DEFAULT_CONSTRAINTS[name].min,
          max: typeof c.max === 'number' ? c.max : DEFAULT_CONSTRAINTS[name].max,
        };
      }
    }
  }

  // Defaults
  const defaultsObj = obj.defaults as Record<string, unknown> | undefined;
  const defaults: PhysicsDefaults = {
    motion: isValidMotionName(defaultsObj?.motion as string)
      ? (defaultsObj?.motion as MotionName)
      : 'warm',
    sync: isValidSyncStrategy(defaultsObj?.sync as string)
      ? (defaultsObj?.sync as SyncStrategyName)
      : 'optimistic',
    easing: typeof defaultsObj?.easing === 'string' ? defaultsObj.easing : 'ease-in-out',
    timing: typeof defaultsObj?.timing === 'number' ? defaultsObj.timing : 300,
  };

  return {
    version,
    motions,
    sync_strategies,
    constraints,
    defaults,
  };
}

// =============================================================================
// READER FUNCTIONS
// =============================================================================

/**
 * Reads and parses physics configuration from kernel/physics.yaml.
 *
 * Results are cached for performance. Use clearPhysicsCache() to force reload.
 *
 * @param filePath - Path to the physics YAML file
 * @returns Parsed and validated PhysicsConfig
 *
 * @example
 * ```ts
 * const physics = await readPhysics();
 * const deliberate = physics.motions.deliberate;
 * console.log(deliberate.duration.default); // 800
 * ```
 */
export async function readPhysics(
  filePath: string = DEFAULT_PHYSICS_PATH
): Promise<PhysicsConfig> {
  // Return cached if same path
  if (cachedConfig && cachedPath === filePath) {
    return cachedConfig;
  }

  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    const content = await fs.readFile(resolvedPath, 'utf-8');
    const parsed = YAML.parse(content);
    cachedConfig = validatePhysicsConfig(parsed);
    cachedPath = filePath;
    return cachedConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[Sigil Physics] File not found: ${filePath}, using defaults`);
    } else if (error instanceof YAML.YAMLParseError) {
      console.error(`[Sigil Physics] YAML parse error: ${error.message}`);
    } else {
      console.error(`[Sigil Physics] Error reading physics: ${error}`);
    }
    return DEFAULT_PHYSICS_CONFIG;
  }
}

/**
 * Synchronously reads and parses physics configuration.
 *
 * @param filePath - Path to the physics YAML file
 * @returns Parsed and validated PhysicsConfig
 */
export function readPhysicsSync(
  filePath: string = DEFAULT_PHYSICS_PATH
): PhysicsConfig {
  // Return cached if same path
  if (cachedConfig && cachedPath === filePath) {
    return cachedConfig;
  }

  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fsSync = require('fs');
    const content = fsSync.readFileSync(resolvedPath, 'utf-8');
    const parsed = YAML.parse(content);
    cachedConfig = validatePhysicsConfig(parsed);
    cachedPath = filePath;
    return cachedConfig;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[Sigil Physics] File not found: ${filePath}, using defaults`);
    } else {
      console.error(`[Sigil Physics] Error reading physics: ${error}`);
    }
    return DEFAULT_PHYSICS_CONFIG;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Gets the full motion configuration for a motion name.
 *
 * @param motion - The motion name
 * @param config - Optional PhysicsConfig (uses cache or defaults if not provided)
 * @returns Full motion configuration
 *
 * @example
 * ```ts
 * const deliberate = getMotionConfig('deliberate');
 * console.log(deliberate.easing); // 'ease-out'
 * ```
 */
export function getMotionConfig(
  motion: MotionName | string,
  config: PhysicsConfig = cachedConfig ?? DEFAULT_PHYSICS_CONFIG
): MotionConfig {
  if (!isValidMotionName(motion)) {
    return config.motions[config.defaults.motion];
  }
  return config.motions[motion];
}

/**
 * Gets the timing in milliseconds for a motion name.
 * Uses the default value for ranges.
 *
 * @param motion - The motion name
 * @param config - Optional PhysicsConfig (uses cache or defaults if not provided)
 * @returns Timing in milliseconds
 *
 * @example
 * ```ts
 * getMotionTiming('deliberate'); // 800
 * getMotionTiming('instant');    // 0
 * getMotionTiming('snappy');     // 150
 * ```
 */
export function getMotionTiming(
  motion: MotionName | string,
  config: PhysicsConfig = cachedConfig ?? DEFAULT_PHYSICS_CONFIG
): number {
  const motionConfig = getMotionConfig(motion, config);
  const duration = motionConfig.duration;

  // Fixed value
  if (duration.value !== undefined) {
    return duration.value;
  }

  // Range - use default
  if (duration.default !== undefined) {
    return duration.default;
  }

  // Fallback to config defaults
  return config.defaults.timing;
}

/**
 * Gets the CSS easing string for a motion name.
 *
 * @param motion - The motion name
 * @param config - Optional PhysicsConfig (uses cache or defaults if not provided)
 * @returns CSS easing string
 *
 * @example
 * ```ts
 * getMotionEasing('deliberate');   // 'ease-out'
 * getMotionEasing('celebratory'); // 'cubic-bezier(0.34, 1.56, 0.64, 1)'
 * ```
 */
export function getMotionEasing(
  motion: MotionName | string,
  config: PhysicsConfig = cachedConfig ?? DEFAULT_PHYSICS_CONFIG
): string {
  return getMotionConfig(motion, config).easing;
}

/**
 * Gets the timing constraints (min/max) for a motion name.
 * Used by eslint-plugin-sigil/zone-compliance rule.
 *
 * @param motion - The motion name
 * @param config - Optional PhysicsConfig (uses cache or defaults if not provided)
 * @returns Timing constraint with min and max
 *
 * @example
 * ```ts
 * getMotionConstraints('deliberate'); // { min: 500, max: 1000 }
 * getMotionConstraints('snappy');     // { min: 100, max: 200 }
 * ```
 */
export function getMotionConstraints(
  motion: MotionName | string,
  config: PhysicsConfig = cachedConfig ?? DEFAULT_PHYSICS_CONFIG
): TimingConstraint {
  if (!isValidMotionName(motion)) {
    return config.constraints[config.defaults.motion];
  }
  return config.constraints[motion];
}

/**
 * Gets the sync strategy configuration.
 *
 * @param strategy - The sync strategy name
 * @param config - Optional PhysicsConfig (uses cache or defaults if not provided)
 * @returns Sync strategy configuration
 *
 * @example
 * ```ts
 * const pessimistic = getSyncStrategyConfig('pessimistic');
 * console.log(pessimistic.default_motion); // 'deliberate'
 * ```
 */
export function getSyncStrategyConfig(
  strategy: SyncStrategyName | string,
  config: PhysicsConfig = cachedConfig ?? DEFAULT_PHYSICS_CONFIG
): SyncStrategyConfig {
  if (!isValidSyncStrategy(strategy)) {
    return config.sync_strategies[config.defaults.sync];
  }
  return config.sync_strategies[strategy];
}

/**
 * Gets the default motion for a sync strategy.
 *
 * @param strategy - The sync strategy name
 * @param config - Optional PhysicsConfig (uses cache or defaults if not provided)
 * @returns Default motion name for the strategy
 *
 * @example
 * ```ts
 * getDefaultMotionForSync('pessimistic'); // 'deliberate'
 * getDefaultMotionForSync('optimistic');  // 'snappy'
 * ```
 */
export function getDefaultMotionForSync(
  strategy: SyncStrategyName | string,
  config: PhysicsConfig = cachedConfig ?? DEFAULT_PHYSICS_CONFIG
): MotionName {
  return getSyncStrategyConfig(strategy, config).default_motion;
}

/**
 * Gets all motion names.
 *
 * @returns Array of all valid motion names
 */
export function getAllMotionNames(): MotionName[] {
  return [...VALID_MOTION_NAMES];
}

/**
 * Gets all sync strategy names.
 *
 * @returns Array of all valid sync strategy names
 */
export function getAllSyncStrategyNames(): SyncStrategyName[] {
  return [...VALID_SYNC_STRATEGIES];
}

/**
 * Checks if a timing value is within constraints for a motion.
 *
 * @param motion - The motion name
 * @param timingMs - The timing value in milliseconds
 * @param config - Optional PhysicsConfig
 * @returns Object with valid flag and reason if invalid
 *
 * @example
 * ```ts
 * validateTimingForMotion('deliberate', 200);
 * // { valid: false, reason: 'too_fast', min: 500, max: 1000 }
 *
 * validateTimingForMotion('deliberate', 800);
 * // { valid: true }
 * ```
 */
export function validateTimingForMotion(
  motion: MotionName | string,
  timingMs: number,
  config: PhysicsConfig = cachedConfig ?? DEFAULT_PHYSICS_CONFIG
): { valid: boolean; reason?: 'too_fast' | 'too_slow'; min?: number; max?: number } {
  const constraints = getMotionConstraints(motion, config);

  if (timingMs < constraints.min) {
    return { valid: false, reason: 'too_fast', min: constraints.min, max: constraints.max };
  }

  if (timingMs > constraints.max) {
    return { valid: false, reason: 'too_slow', min: constraints.min, max: constraints.max };
  }

  return { valid: true };
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Formats a motion configuration summary.
 *
 * @param motion - Motion name
 * @param config - Motion configuration
 * @returns Formatted string
 */
export function formatMotionSummary(motion: MotionName, config: MotionConfig): string {
  const timing = config.duration.value ?? config.duration.default ?? 0;
  const range = config.duration.min && config.duration.max
    ? ` (${config.duration.min}-${config.duration.max}ms)`
    : '';

  return `${motion}: ${timing}ms${range}
  Easing: ${config.easing}
  ${config.description}`;
}

/**
 * Formats a physics configuration summary.
 *
 * @param config - Physics configuration
 * @returns Formatted string
 */
export function formatPhysicsSummary(config: PhysicsConfig): string {
  const motionList = Object.entries(config.motions)
    .map(([name, mc]) => {
      const timing = mc.duration.value ?? mc.duration.default ?? 0;
      return `  - ${name}: ${timing}ms (${mc.easing})`;
    })
    .join('\n');

  const syncList = Object.entries(config.sync_strategies)
    .map(([name, sc]) => `  - ${name}: ${sc.default_motion}`)
    .join('\n');

  return `Sigil Physics v${config.version}

Motions:
${motionList}

Sync Strategies:
${syncList}

Defaults:
  - Motion: ${config.defaults.motion}
  - Sync: ${config.defaults.sync}
  - Timing: ${config.defaults.timing}ms`;
}
