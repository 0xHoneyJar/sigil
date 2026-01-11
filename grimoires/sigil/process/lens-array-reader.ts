/**
 * Sigil v2.6 — Lens Array Reader
 *
 * Reads and manages user personas with physics and constraints.
 * Implements graceful degradation: never throws, always returns valid data.
 *
 * Philosophy: "Same feature, different truth. Not simplified - just appropriate."
 *
 * @module process/lens-array-reader
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
 * A user persona with physics and constraints.
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
  /** Physical interaction requirements */
  physics: PersonaPhysics;
  /** Constraints and limitations */
  constraints: PersonaConstraints;
  /** Priority for conflict resolution (higher wins) */
  priority: number;
}

/**
 * Stacking configuration.
 */
export interface StackingConfig {
  /** Allowed lens combinations */
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
 * The Lens Array: user personas with physics and constraints.
 */
export interface LensArray {
  /** Schema version */
  version: string;
  /** Map of persona ID to persona */
  lenses: Record<string, Persona>;
  /** Properties that cannot be overridden */
  immutable_properties: string[];
  /** Stacking configuration */
  stacking: StackingConfig;
}

/**
 * Result of validating a lens stack.
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
 * Default empty lens array.
 */
export const DEFAULT_LENS_ARRAY: LensArray = {
  version: '3.0.0',
  lenses: {},
  immutable_properties: [],
  stacking: DEFAULT_STACKING,
};

/**
 * Default path to the lens array file.
 */
export const DEFAULT_LENS_ARRAY_PATH = 'sigil-mark/lens-array/lenses.yaml';

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

  return {
    id,
    name: obj.name as string,
    alias: obj.alias as string,
    description: typeof obj.description === 'string' ? obj.description : undefined,
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
  };
}

/**
 * Validates and normalizes a lens array.
 */
function validateLensArray(parsed: unknown): LensArray {
  if (typeof parsed !== 'object' || parsed === null) {
    console.warn('[Sigil LensArray] Invalid lens array format, using defaults');
    return DEFAULT_LENS_ARRAY;
  }

  const obj = parsed as Record<string, unknown>;

  // Validate version
  const version = typeof obj.version === 'string' ? obj.version : '3.0.0';

  // Validate lenses
  const lenses: Record<string, Persona> = {};
  if (typeof obj.lenses === 'object' && obj.lenses !== null) {
    for (const [id, lens] of Object.entries(obj.lenses as Record<string, unknown>)) {
      const persona = normalizePersona(lens as Record<string, unknown>, id);
      if (persona) {
        lenses[id] = persona;
      } else {
        console.warn(`[Sigil LensArray] Skipping invalid persona: ${id}`);
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
    lenses,
    immutable_properties,
    stacking,
  };
}

// =============================================================================
// READER FUNCTIONS
// =============================================================================

/**
 * Reads and parses the Lens Array from a YAML file.
 *
 * Implements graceful degradation:
 * - If file doesn't exist: returns empty lens array
 * - If YAML is invalid: returns empty lens array
 * - If individual personas are invalid: skips them
 *
 * @param filePath - Path to the lens array YAML file
 * @returns Parsed and validated LensArray
 *
 * @example
 * ```ts
 * const lensArray = await readLensArray();
 * console.log(Object.keys(lensArray.lenses)); // ['power_user', 'newcomer', ...]
 * ```
 */
export async function readLensArray(
  filePath: string = DEFAULT_LENS_ARRAY_PATH
): Promise<LensArray> {
  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    const content = await fs.readFile(resolvedPath, 'utf-8');
    const parsed = YAML.parse(content);
    return validateLensArray(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[Sigil LensArray] File not found: ${filePath}, using defaults`);
    } else if (error instanceof YAML.YAMLParseError) {
      console.error(`[Sigil LensArray] YAML parse error: ${error.message}`);
    } else {
      console.error(`[Sigil LensArray] Error reading lens array: ${error}`);
    }
    return DEFAULT_LENS_ARRAY;
  }
}

/**
 * Synchronously reads and parses the Lens Array from a YAML file.
 *
 * @param filePath - Path to the lens array YAML file
 * @returns Parsed and validated LensArray
 */
export function readLensArraySync(
  filePath: string = DEFAULT_LENS_ARRAY_PATH
): LensArray {
  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fsSync = require('fs');
    const content = fsSync.readFileSync(resolvedPath, 'utf-8');
    const parsed = YAML.parse(content);
    return validateLensArray(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[Sigil LensArray] File not found: ${filePath}, using defaults`);
    } else {
      console.error(`[Sigil LensArray] Error reading lens array: ${error}`);
    }
    return DEFAULT_LENS_ARRAY;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Gets a persona by ID.
 *
 * @param lensArray - The lens array to search
 * @param personaId - The persona ID to find
 * @returns The persona, or undefined if not found
 *
 * @example
 * ```ts
 * const lensArray = await readLensArray();
 * const powerUser = getPersona(lensArray, 'power_user');
 * console.log(powerUser?.alias); // 'Chef'
 * ```
 */
export function getPersona(
  lensArray: LensArray,
  personaId: string
): Persona | undefined {
  return lensArray.lenses[personaId];
}

/**
 * Gets all personas as an array.
 *
 * @param lensArray - The lens array
 * @returns Array of all personas
 */
export function getAllPersonas(lensArray: LensArray): Persona[] {
  return Object.values(lensArray.lenses);
}

/**
 * Gets the physics configuration for a persona.
 *
 * @param lensArray - The lens array to search
 * @param personaId - The persona ID
 * @returns The persona's physics, or undefined if not found
 */
export function getPhysicsForPersona(
  lensArray: LensArray,
  personaId: string
): PersonaPhysics | undefined {
  const persona = getPersona(lensArray, personaId);
  return persona?.physics;
}

/**
 * Gets the constraints for a persona.
 *
 * @param lensArray - The lens array to search
 * @param personaId - The persona ID
 * @returns The persona's constraints, or undefined if not found
 */
export function getConstraintsForPersona(
  lensArray: LensArray,
  personaId: string
): PersonaConstraints | undefined {
  const persona = getPersona(lensArray, personaId);
  return persona?.constraints;
}

// =============================================================================
// STACKING VALIDATION
// =============================================================================

/**
 * Checks if a combination is in a list of combinations.
 */
function isCombinationInList(
  stack: string[],
  combinations: string[][]
): boolean {
  const stackSet = new Set(stack);
  return combinations.some((combo) => {
    const comboSet = new Set(combo);
    // Check if stack contains all elements of combo
    return combo.every((id) => stackSet.has(id)) && combo.length === stack.length;
  });
}

/**
 * Checks if a stack contains any forbidden combination.
 */
function containsForbiddenCombination(
  stack: string[],
  forbidden: string[][]
): string[] | null {
  const stackSet = new Set(stack);
  for (const combo of forbidden) {
    // Check if all elements of the forbidden combo are in the stack
    if (combo.every((id) => stackSet.has(id))) {
      return combo;
    }
  }
  return null;
}

/**
 * Validates a lens stack against the stacking configuration.
 *
 * @param lensArray - The lens array with stacking config
 * @param stack - Array of persona IDs to stack
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```ts
 * const lensArray = await readLensArray();
 * const result = validateLensStack(lensArray, ['power_user', 'accessibility']);
 * if (result.valid) {
 *   console.log('Stack is valid');
 * } else {
 *   console.log(result.error);
 * }
 * ```
 */
export function validateLensStack(
  lensArray: LensArray,
  stack: string[]
): StackValidationResult {
  const { stacking, lenses } = lensArray;

  // Check for empty stack
  if (stack.length === 0) {
    return { valid: false, error: 'Stack cannot be empty' };
  }

  // Check for single lens (always valid)
  if (stack.length === 1) {
    const persona = lenses[stack[0]];
    if (!persona) {
      return { valid: false, error: `Unknown persona: ${stack[0]}` };
    }
    return { valid: true, stack: [persona] };
  }

  // Check max stack depth
  if (stack.length > stacking.max_stack_depth) {
    return {
      valid: false,
      error: `Stack exceeds max depth of ${stacking.max_stack_depth}`,
    };
  }

  // Validate all personas exist
  const personas: Persona[] = [];
  for (const id of stack) {
    const persona = lenses[id];
    if (!persona) {
      return { valid: false, error: `Unknown persona: ${id}` };
    }
    personas.push(persona);
  }

  // Check for forbidden combinations
  if (stacking.forbidden_combinations && stacking.forbidden_combinations.length > 0) {
    const forbidden = containsForbiddenCombination(
      stack,
      stacking.forbidden_combinations
    );
    if (forbidden) {
      return {
        valid: false,
        error: `Forbidden combination: ${forbidden.join(' + ')}`,
      };
    }
  }

  // Check for allowed combinations (if specified)
  if (stacking.allowed_combinations && stacking.allowed_combinations.length > 0) {
    // Sort both for comparison
    const sortedStack = [...stack].sort();
    const isAllowed = stacking.allowed_combinations.some((combo) => {
      const sortedCombo = [...combo].sort();
      return (
        sortedStack.length === sortedCombo.length &&
        sortedStack.every((id, i) => id === sortedCombo[i])
      );
    });

    if (!isAllowed) {
      return {
        valid: false,
        error: `Combination not in allowed list: ${stack.join(' + ')}`,
      };
    }
  }

  return { valid: true, stack: personas };
}

// =============================================================================
// CONFLICT RESOLUTION
// =============================================================================

/**
 * Gets the priority of a persona for conflict resolution.
 */
function getResolutionPriority(
  lensArray: LensArray,
  persona: Persona
): number {
  const { stacking } = lensArray;

  // If priority_order is specified, use position in that list
  if (stacking.priority_order && stacking.priority_order.length > 0) {
    const index = stacking.priority_order.indexOf(persona.id);
    if (index !== -1) {
      // Lower index = higher priority
      return stacking.priority_order.length - index;
    }
  }

  // Fall back to persona's own priority
  return persona.priority;
}

/**
 * Resolves a conflict between stacked lenses.
 *
 * @param lensArray - The lens array with stacking config
 * @param stack - Array of personas in the stack
 * @param property - The property to resolve
 * @returns Resolution result with winning persona and value
 *
 * @example
 * ```ts
 * const lensArray = await readLensArray();
 * const result = resolveStackConflict(
 *   lensArray,
 *   [powerUser, accessibility],
 *   'physics.tap_targets.min_size'
 * );
 * console.log(result.winner.alias); // 'A11y' (accessibility wins)
 * ```
 */
export function resolveStackConflict(
  lensArray: LensArray,
  stack: Persona[],
  property: string
): ConflictResolutionResult {
  const { stacking, immutable_properties } = lensArray;

  if (stack.length === 0) {
    throw new Error('Cannot resolve conflict on empty stack');
  }

  if (stack.length === 1) {
    const value = getNestedProperty(stack[0], property);
    return {
      winner: stack[0],
      property,
      value,
      losers: [],
    };
  }

  // Check for immutable property
  const isImmutable = immutable_properties.some(
    (p) => property.startsWith(p) || p.startsWith(property)
  );

  if (isImmutable) {
    // For immutable properties, find the first persona that has the property set to true
    for (const persona of stack) {
      const value = getNestedProperty(persona, property);
      if (value === true) {
        return {
          winner: persona,
          property,
          value: true,
          losers: stack.filter((p) => p.id !== persona.id),
        };
      }
    }
  }

  // Apply conflict resolution strategy
  switch (stacking.conflict_resolution) {
    case 'first': {
      const value = getNestedProperty(stack[0], property);
      return {
        winner: stack[0],
        property,
        value,
        losers: stack.slice(1),
      };
    }

    case 'last': {
      const winner = stack[stack.length - 1];
      const value = getNestedProperty(winner, property);
      return {
        winner,
        property,
        value,
        losers: stack.slice(0, -1),
      };
    }

    case 'merge': {
      // For merge, take the strictest constraint
      const winner = findStrictestPersona(stack, property);
      const value = getNestedProperty(winner, property);
      return {
        winner,
        property,
        value,
        losers: stack.filter((p) => p.id !== winner.id),
      };
    }

    case 'priority':
    default: {
      // Sort by priority (highest first)
      const sorted = [...stack].sort(
        (a, b) => getResolutionPriority(lensArray, b) - getResolutionPriority(lensArray, a)
      );
      const winner = sorted[0];
      const value = getNestedProperty(winner, property);
      return {
        winner,
        property,
        value,
        losers: sorted.slice(1),
      };
    }
  }
}

/**
 * Gets a nested property from an object using dot notation.
 */
function getNestedProperty(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Finds the persona with the strictest constraint for a property.
 * For numeric properties, smaller is stricter.
 * For boolean properties, true is stricter.
 */
function findStrictestPersona(stack: Persona[], property: string): Persona {
  let strictest = stack[0];
  let strictestValue = getNestedProperty(strictest, property);

  for (const persona of stack.slice(1)) {
    const value = getNestedProperty(persona, property);

    if (value === undefined) {
      continue;
    }

    // For boolean properties, true is stricter
    if (typeof value === 'boolean' && value === true) {
      strictest = persona;
      strictestValue = value;
      continue;
    }

    // For numeric properties, smaller is stricter
    if (typeof value === 'number' && typeof strictestValue === 'number') {
      if (value < strictestValue) {
        strictest = persona;
        strictestValue = value;
      }
      continue;
    }

    // For string sizes (e.g., '48px'), extract number and compare
    if (typeof value === 'string' && typeof strictestValue === 'string') {
      const numValue = parseFloat(value);
      const numStrictest = parseFloat(strictestValue);
      if (!isNaN(numValue) && !isNaN(numStrictest) && numValue > numStrictest) {
        // Larger tap targets are stricter (safer)
        strictest = persona;
        strictestValue = value;
      }
    }
  }

  return strictest;
}

/**
 * Merges a stack of personas into a single resolved persona.
 *
 * @param lensArray - The lens array with stacking config
 * @param stack - Array of persona IDs to merge
 * @returns Merged persona, or null if validation fails
 */
export function mergeStack(
  lensArray: LensArray,
  stack: string[]
): Persona | null {
  const validation = validateLensStack(lensArray, stack);
  if (!validation.valid || !validation.stack) {
    return null;
  }

  const personas = validation.stack;
  const base = personas[0];

  // Create merged persona
  const merged: Persona = {
    id: stack.join('+'),
    name: personas.map((p) => p.name).join(' + '),
    alias: personas.map((p) => p.alias).join('+'),
    description: `Merged: ${personas.map((p) => p.description).join('; ')}`,
    priority: Math.max(...personas.map((p) => p.priority)),
    physics: { ...base.physics },
    constraints: { ...base.constraints },
  };

  // Resolve conflicts for physics properties
  const physicsProps = ['tap_targets.min_size', 'tap_targets.spacing', 'input_method'];
  for (const prop of physicsProps) {
    const result = resolveStackConflict(lensArray, personas, `physics.${prop}`);
    setNestedProperty(merged, `physics.${prop}`, result.value);
  }

  // Resolve conflicts for constraint properties
  const constraintProps = [
    'max_actions_per_screen',
    'reading_level',
    'session_duration',
    'error_tolerance',
    'cognitive_load',
  ];
  for (const prop of constraintProps) {
    const result = resolveStackConflict(lensArray, personas, `constraints.${prop}`);
    setNestedProperty(merged, `constraints.${prop}`, result.value);
  }

  // Always use strictest accessibility requirements
  const accessibilityProps = [
    'accessibility.screen_reader',
    'accessibility.high_contrast',
    'accessibility.large_text',
    'accessibility.reduced_motion',
  ];
  for (const prop of accessibilityProps) {
    const result = resolveStackConflict(lensArray, personas, `constraints.${prop}`);
    if (result.value === true) {
      setNestedProperty(merged, `constraints.${prop}`, true);
    }
  }

  return merged;
}

/**
 * Sets a nested property on an object using dot notation.
 */
function setNestedProperty(obj: unknown, path: string, value: unknown): void {
  const parts = path.split('.');
  let current = obj as Record<string, unknown>;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === undefined || current[part] === null) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
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
  Cognitive load: ${persona.constraints.cognitive_load || 'unspecified'}`;
}

/**
 * Formats a lens array summary.
 *
 * @param lensArray - The lens array to summarize
 * @returns Formatted string
 */
export function formatLensArraySummary(lensArray: LensArray): string {
  const personas = getAllPersonas(lensArray);
  const personaList = personas
    .map((p) => `  - ${p.alias} (${p.name})`)
    .join('\n');

  return `Sigil Lens Array v${lensArray.version}
Personas (${personas.length}):
${personaList}

Stacking:
  Max depth: ${lensArray.stacking.max_stack_depth}
  Resolution: ${lensArray.stacking.conflict_resolution}`;
}
