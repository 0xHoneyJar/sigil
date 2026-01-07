/**
 * Sigil v3.0 — Persona Reader
 *
 * Reads and manages user personas (archetypes) with physics and constraints.
 * Implements graceful degradation: never throws, always returns valid data.
 *
 * TERMINOLOGY (v3.0):
 * - "Persona" = User archetype (power_user, newcomer, mobile, accessibility)
 * - "Lens" = UI rendering variant (DefaultLens, StrictLens, A11yLens)
 *
 * Philosophy: "Same feature, different truth. Not simplified - just appropriate."
 *
 * @module process/persona-reader
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import YAML from 'yaml';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Input method for a persona.
 */
export type InputMethod = 'keyboard' | 'mouse' | 'touch' | 'mixed' | 'voice';

/**
 * Reading comprehension level.
 */
export type ReadingLevel = 'basic' | 'standard' | 'advanced';

/**
 * Expected session duration.
 */
export type SessionDuration = 'brief' | 'moderate' | 'extended';

/**
 * Error tolerance level.
 */
export type ErrorTolerance = 'low' | 'medium' | 'high';

/**
 * Cognitive load level.
 */
export type CognitiveLoad = 'minimal' | 'moderate' | 'high';

/**
 * Conflict resolution strategy.
 */
export type ConflictResolution = 'priority' | 'merge' | 'first' | 'last';

/**
 * Default UI lens type.
 */
export type DefaultLensType = 'default' | 'strict' | 'guided' | 'a11y';

/**
 * Tap target configuration.
 */
export interface TapTargets {
  min_size?: string;
  spacing?: string;
}

/**
 * Shortcut configuration.
 */
export interface ShortcutConfig {
  expected: boolean;
  required?: string[];
}

/**
 * Motion configuration.
 */
export interface MotionConfig {
  reduced: boolean;
  duration_multiplier?: number;
}

/**
 * Feedback configuration.
 */
export interface FeedbackConfig {
  haptic?: boolean;
  audio?: boolean;
  visual?: boolean;
}

/**
 * Physics for a persona (physical interaction requirements).
 */
export interface PersonaPhysics {
  input_method: InputMethod;
  tap_targets?: TapTargets;
  shortcuts?: ShortcutConfig;
  motion?: MotionConfig;
  feedback?: FeedbackConfig;
}

/**
 * Accessibility requirements.
 */
export interface AccessibilityRequirements {
  screen_reader?: boolean;
  high_contrast?: boolean;
  large_text?: boolean;
  reduced_motion?: boolean;
}

/**
 * Constraints for a persona.
 */
export interface PersonaConstraints {
  max_actions_per_screen?: number;
  reading_level?: ReadingLevel;
  session_duration?: SessionDuration;
  error_tolerance?: ErrorTolerance;
  cognitive_load?: CognitiveLoad;
  accessibility?: AccessibilityRequirements;
}

/**
 * User experience preferences for a persona.
 */
export interface PersonaPreferences {
  motion?: 'snappy' | 'warm' | 'reassuring' | 'reduced';
  help?: 'always' | 'on_demand' | 'contextual' | 'never';
  density?: 'high' | 'medium' | 'low';
  touch_targets?: string;
  animations?: boolean;
}

/**
 * A user persona (archetype) with physics and constraints.
 */
export interface Persona {
  /** Persona ID (e.g., 'power_user', 'newcomer') */
  id: string;
  /** Human-readable name */
  name: string;
  /** Short alias (e.g., 'Chef', 'Henlocker') */
  alias: string;
  /** Description of who this persona represents */
  description?: string;
  /** Default UI Lens for this persona */
  default_lens?: DefaultLensType;
  /** Physical interaction requirements */
  physics: PersonaPhysics;
  /** Constraints and limitations */
  constraints: PersonaConstraints;
  /** User experience preferences */
  preferences?: PersonaPreferences;
  /** Priority for conflict resolution (higher wins) */
  priority: number;
}

/**
 * Stacking configuration.
 */
export interface StackingConfig {
  /** Allowed persona combinations */
  allowed_combinations?: string[][];
  /** Forbidden combinations */
  forbidden_combinations?: string[][];
  /** Conflict resolution strategy */
  conflict_resolution: ConflictResolution;
  /** Priority order for resolution */
  priority_order?: string[];
  /** Maximum stack depth */
  max_stack_depth: number;
}

/**
 * The Persona Array: user personas with physics and constraints.
 */
export interface PersonaArray {
  /** Schema version */
  version: string;
  /** Map of persona ID to persona */
  personas: Record<string, Persona>;
  /** Properties that cannot be overridden */
  immutable_properties: string[];
  /** Stacking configuration */
  stacking: StackingConfig;
}

/**
 * Result of validating a persona stack.
 */
export interface StackValidationResult {
  valid: boolean;
  error?: string;
  stack?: Persona[];
}

/**
 * Result of resolving a stack conflict.
 */
export interface ConflictResolutionResult {
  winner: Persona;
  property: string;
  value: unknown;
  losers: Persona[];
}

// =============================================================================
// DEFAULTS
// =============================================================================

/**
 * Default stacking configuration.
 */
const DEFAULT_STACKING: StackingConfig = {
  allowed_combinations: [],
  forbidden_combinations: [],
  conflict_resolution: 'priority',
  priority_order: [],
  max_stack_depth: 3,
};

/**
 * Default empty persona array.
 */
export const DEFAULT_PERSONA_ARRAY: PersonaArray = {
  version: '3.0.0',
  personas: {},
  immutable_properties: [],
  stacking: DEFAULT_STACKING,
};

/**
 * Default path to the personas file.
 */
export const DEFAULT_PERSONAS_PATH = 'sigil-mark/personas/personas.yaml';

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validates an input method.
 */
function isValidInputMethod(value: unknown): value is InputMethod {
  return ['keyboard', 'mouse', 'touch', 'mixed', 'voice'].includes(value as string);
}

/**
 * Validates a conflict resolution strategy.
 */
function isValidConflictResolution(value: unknown): value is ConflictResolution {
  return ['priority', 'merge', 'first', 'last'].includes(value as string);
}

/**
 * Validates persona physics.
 */
function isValidPhysics(value: unknown): value is PersonaPhysics {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return isValidInputMethod(obj.input_method);
}

/**
 * Validates a persona object.
 */
function isValidPersona(value: unknown, id: string): value is Omit<Persona, 'id'> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.name === 'string' &&
    obj.name.length > 0 &&
    typeof obj.alias === 'string' &&
    isValidPhysics(obj.physics) &&
    typeof obj.constraints === 'object'
  );
}

/**
 * Normalizes a persona object.
 */
function normalizePersona(obj: Record<string, unknown>, id: string): Persona | null {
  if (!isValidPersona(obj, id)) {
    return null;
  }

  const physics = obj.physics as Record<string, unknown>;
  const constraints = obj.constraints as Record<string, unknown>;
  const preferences = obj.preferences as Record<string, unknown> | undefined;

  return {
    id,
    name: obj.name as string,
    alias: obj.alias as string,
    description: typeof obj.description === 'string' ? obj.description : undefined,
    default_lens: typeof obj.default_lens === 'string' ? obj.default_lens as DefaultLensType : undefined,
    priority: typeof obj.priority === 'number' ? obj.priority : 0,
    physics: {
      input_method: physics.input_method as InputMethod,
      tap_targets: physics.tap_targets as TapTargets | undefined,
      shortcuts: physics.shortcuts as ShortcutConfig | undefined,
      motion: physics.motion as MotionConfig | undefined,
      feedback: physics.feedback as FeedbackConfig | undefined,
    },
    constraints: {
      max_actions_per_screen: constraints.max_actions_per_screen as number | undefined,
      reading_level: constraints.reading_level as ReadingLevel | undefined,
      session_duration: constraints.session_duration as SessionDuration | undefined,
      error_tolerance: constraints.error_tolerance as ErrorTolerance | undefined,
      cognitive_load: constraints.cognitive_load as CognitiveLoad | undefined,
      accessibility: constraints.accessibility as AccessibilityRequirements | undefined,
    },
    preferences: preferences ? {
      motion: preferences.motion as PersonaPreferences['motion'],
      help: preferences.help as PersonaPreferences['help'],
      density: preferences.density as PersonaPreferences['density'],
      touch_targets: preferences.touch_targets as string | undefined,
      animations: preferences.animations as boolean | undefined,
    } : undefined,
  };
}

/**
 * Validates and normalizes a persona array.
 */
function validatePersonaArray(parsed: unknown): PersonaArray {
  if (typeof parsed !== 'object' || parsed === null) {
    console.warn('[Sigil Personas] Invalid persona array format, using defaults');
    return DEFAULT_PERSONA_ARRAY;
  }

  const obj = parsed as Record<string, unknown>;

  // Validate version
  const version = typeof obj.version === 'string' ? obj.version : '3.0.0';

  // Validate personas (can be under 'personas' or 'lenses' for backwards compat)
  const personasObj = obj.personas ?? obj.lenses;
  const personas: Record<string, Persona> = {};
  if (typeof personasObj === 'object' && personasObj !== null) {
    for (const [id, persona] of Object.entries(personasObj as Record<string, unknown>)) {
      const normalized = normalizePersona(persona as Record<string, unknown>, id);
      if (normalized) {
        personas[id] = normalized;
      } else {
        console.warn(`[Sigil Personas] Skipping invalid persona: ${id}`);
      }
    }
  }

  // Validate immutable properties
  const immutable_properties: string[] = [];
  if (Array.isArray(obj.immutable_properties)) {
    for (const prop of obj.immutable_properties) {
      if (typeof prop === 'string') {
        immutable_properties.push(prop);
      }
    }
  }

  // Validate stacking
  let stacking: StackingConfig = DEFAULT_STACKING;
  if (typeof obj.stacking === 'object' && obj.stacking !== null) {
    const s = obj.stacking as Record<string, unknown>;
    stacking = {
      allowed_combinations: Array.isArray(s.allowed_combinations)
        ? s.allowed_combinations.filter(
            (c): c is string[] =>
              Array.isArray(c) && c.every((item) => typeof item === 'string')
          )
        : [],
      forbidden_combinations: Array.isArray(s.forbidden_combinations)
        ? s.forbidden_combinations.filter(
            (c): c is string[] =>
              Array.isArray(c) && c.every((item) => typeof item === 'string')
          )
        : [],
      conflict_resolution: isValidConflictResolution(s.conflict_resolution)
        ? s.conflict_resolution
        : 'priority',
      priority_order: Array.isArray(s.priority_order)
        ? s.priority_order.filter((p): p is string => typeof p === 'string')
        : [],
      max_stack_depth:
        typeof s.max_stack_depth === 'number' ? s.max_stack_depth : 3,
    };
  }

  return {
    version,
    personas,
    immutable_properties,
    stacking,
  };
}

// =============================================================================
// READER FUNCTIONS
// =============================================================================

/**
 * Reads and parses the Persona Array from a YAML file.
 *
 * Implements graceful degradation:
 * - If file doesn't exist: returns empty persona array
 * - If YAML is invalid: returns empty persona array
 * - If individual personas are invalid: skips them
 *
 * @param filePath - Path to the personas YAML file
 * @returns Parsed and validated PersonaArray
 *
 * @example
 * ```ts
 * const personas = await readPersonas();
 * console.log(Object.keys(personas.personas)); // ['power_user', 'newcomer', ...]
 * ```
 */
export async function readPersonas(
  filePath: string = DEFAULT_PERSONAS_PATH
): Promise<PersonaArray> {
  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    const content = await fs.readFile(resolvedPath, 'utf-8');
    const parsed = YAML.parse(content);
    return validatePersonaArray(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[Sigil Personas] File not found: ${filePath}, using defaults`);
    } else if (error instanceof YAML.YAMLParseError) {
      console.error(`[Sigil Personas] YAML parse error: ${error.message}`);
    } else {
      console.error(`[Sigil Personas] Error reading personas: ${error}`);
    }
    return DEFAULT_PERSONA_ARRAY;
  }
}

/**
 * Synchronously reads and parses the Persona Array from a YAML file.
 *
 * @param filePath - Path to the personas YAML file
 * @returns Parsed and validated PersonaArray
 */
export function readPersonasSync(
  filePath: string = DEFAULT_PERSONAS_PATH
): PersonaArray {
  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fsSync = require('fs');
    const content = fsSync.readFileSync(resolvedPath, 'utf-8');
    const parsed = YAML.parse(content);
    return validatePersonaArray(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[Sigil Personas] File not found: ${filePath}, using defaults`);
    } else {
      console.error(`[Sigil Personas] Error reading personas: ${error}`);
    }
    return DEFAULT_PERSONA_ARRAY;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Gets a persona by ID.
 *
 * @param personaArray - The persona array to search
 * @param personaId - The persona ID to find
 * @returns The persona, or undefined if not found
 *
 * @example
 * ```ts
 * const personas = await readPersonas();
 * const powerUser = getPersonaById(personas, 'power_user');
 * console.log(powerUser?.alias); // 'Chef'
 * ```
 */
export function getPersonaById(
  personaArray: PersonaArray,
  personaId: string
): Persona | undefined {
  return personaArray.personas[personaId];
}

/**
 * Gets all personas as an array.
 *
 * @param personaArray - The persona array
 * @returns Array of all personas
 */
export function getAllPersonas(personaArray: PersonaArray): Persona[] {
  return Object.values(personaArray.personas);
}

/**
 * Gets the physics configuration for a persona.
 *
 * @param personaArray - The persona array to search
 * @param personaId - The persona ID
 * @returns The persona's physics, or undefined if not found
 */
export function getPhysicsForPersona(
  personaArray: PersonaArray,
  personaId: string
): PersonaPhysics | undefined {
  const persona = getPersonaById(personaArray, personaId);
  return persona?.physics;
}

/**
 * Gets the constraints for a persona.
 *
 * @param personaArray - The persona array to search
 * @param personaId - The persona ID
 * @returns The persona's constraints, or undefined if not found
 */
export function getConstraintsForPersona(
  personaArray: PersonaArray,
  personaId: string
): PersonaConstraints | undefined {
  const persona = getPersonaById(personaArray, personaId);
  return persona?.constraints;
}

/**
 * Gets the preferences for a persona.
 *
 * @param personaArray - The persona array to search
 * @param personaId - The persona ID
 * @returns The persona's preferences, or undefined if not found
 */
export function getPreferencesForPersona(
  personaArray: PersonaArray,
  personaId: string
): PersonaPreferences | undefined {
  const persona = getPersonaById(personaArray, personaId);
  return persona?.preferences;
}

/**
 * Gets the default lens for a persona.
 *
 * @param personaArray - The persona array to search
 * @param personaId - The persona ID
 * @returns The persona's default lens, or 'default' if not found
 */
export function getDefaultLensForPersona(
  personaArray: PersonaArray,
  personaId: string
): DefaultLensType {
  const persona = getPersonaById(personaArray, personaId);
  return persona?.default_lens ?? 'default';
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Formats a persona for display.
 *
 * @param persona - The persona to format
 * @returns Formatted string
 */
export function formatPersonaSummary(persona: Persona): string {
  return `${persona.alias} (${persona.name})
  Input: ${persona.physics.input_method}
  Tap targets: ${persona.physics.tap_targets?.min_size || 'default'}
  Max actions: ${persona.constraints.max_actions_per_screen || 'unlimited'}
  Cognitive load: ${persona.constraints.cognitive_load || 'unspecified'}
  Default lens: ${persona.default_lens || 'default'}`;
}

/**
 * Formats a persona array summary.
 *
 * @param personaArray - The persona array to summarize
 * @returns Formatted string
 */
export function formatPersonaArraySummary(personaArray: PersonaArray): string {
  const personas = getAllPersonas(personaArray);
  const personaList = personas
    .map((p) => `  - ${p.alias} (${p.name}) → ${p.default_lens || 'default'} lens`)
    .join('\n');

  return `Sigil Personas v${personaArray.version}
Personas (${personas.length}):
${personaList}

Stacking:
  Max depth: ${personaArray.stacking.max_stack_depth}
  Resolution: ${personaArray.stacking.conflict_resolution}`;
}

// =============================================================================
// BACKWARDS COMPATIBILITY (Deprecated)
// =============================================================================

/**
 * @deprecated Use PersonaArray instead. Will be removed in v4.0.
 */
export type LensArray = PersonaArray;

/**
 * @deprecated Use DEFAULT_PERSONA_ARRAY instead. Will be removed in v4.0.
 */
export const DEFAULT_LENS_ARRAY = DEFAULT_PERSONA_ARRAY;

/**
 * @deprecated Use DEFAULT_PERSONAS_PATH instead. Will be removed in v4.0.
 */
export const DEFAULT_LENS_ARRAY_PATH = 'sigil-mark/lens-array/lenses.yaml';

let hasWarnedLensArray = false;

/**
 * @deprecated Use readPersonas instead. Will be removed in v4.0.
 */
export async function readLensArray(
  filePath: string = DEFAULT_LENS_ARRAY_PATH
): Promise<PersonaArray> {
  if (!hasWarnedLensArray) {
    console.warn(
      '[Sigil] "readLensArray" is deprecated. Use "readPersonas" instead. ' +
      'The term "Lens" now refers only to UI rendering variants (DefaultLens, StrictLens, A11yLens).'
    );
    hasWarnedLensArray = true;
  }
  return readPersonas(filePath);
}

/**
 * @deprecated Use readPersonasSync instead. Will be removed in v4.0.
 */
export function readLensArraySync(
  filePath: string = DEFAULT_LENS_ARRAY_PATH
): PersonaArray {
  if (!hasWarnedLensArray) {
    console.warn(
      '[Sigil] "readLensArraySync" is deprecated. Use "readPersonasSync" instead. ' +
      'The term "Lens" now refers only to UI rendering variants.'
    );
    hasWarnedLensArray = true;
  }
  return readPersonasSync(filePath);
}

/**
 * @deprecated Use getPersonaById instead. Alias kept for backwards compatibility.
 */
export const getPersona = getPersonaById;
