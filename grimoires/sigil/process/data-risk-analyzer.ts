/**
 * @sigil-tier gold
 * Sigil v5.0 - Data Risk Analyzer
 *
 * Analyzes data types to determine physics class via constitution lookup.
 * Law: "The button name lies. The data type doesn't."
 *
 * @module process/data-risk-analyzer
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Physics class from constitution.
 */
export type PhysicsClass = 'server-tick' | 'crdt' | 'local-first';

/**
 * Data category from constitution.
 */
export type DataCategory = 'financial' | 'health' | 'collaborative' | 'local';

/**
 * Type lookup result from constitution.
 */
export interface TypeLookupResult {
  /** The type that was looked up */
  type: string;
  /** Category in constitution (financial, health, etc.) */
  category: DataCategory | null;
  /** Resolved physics class */
  physics: PhysicsClass | null;
  /** Required patterns from constitution */
  requires: string[];
  /** Forbidden patterns from constitution */
  forbidden: string[];
  /** Whether the type was found */
  found: boolean;
}

/**
 * Result of physics resolution for multiple types.
 */
export interface ResolvedDataPhysics {
  /** Final resolved physics class (highest risk) */
  physics: PhysicsClass;
  /** All types that were analyzed */
  types: string[];
  /** Individual lookup results */
  lookups: TypeLookupResult[];
  /** Required patterns (union of all types) */
  requires: string[];
  /** Forbidden patterns (union of all types) */
  forbidden: string[];
  /** Timing configuration from physics profiles */
  timing: {
    min_ms?: number;
    recommended_ms?: number;
    max_ms?: number;
    feedback_ms?: number;
  };
  /** Easing from physics profiles */
  easing: string;
  /** Whether multiple high-risk types were found */
  multipleHighRisk: boolean;
  /** Warning message if applicable */
  warning?: string;
}

/**
 * Extracted types from a function signature.
 */
export interface ExtractedTypes {
  /** Parameter types */
  parameters: Array<{ name: string; type: string }>;
  /** Return type (if found) */
  returnType?: string;
  /** Generic parameters */
  generics: string[];
  /** All unique type names */
  allTypes: string[];
}

// =============================================================================
// CONSTITUTION DATA (LOADED AT INIT)
// =============================================================================

interface ConstitutionData {
  data_physics: Record<string, {
    types: string[];
    physics: PhysicsClass;
    requires: string[];
    forbidden: string[];
    rationale: string;
  }>;
  physics_profiles: Record<PhysicsClass, {
    description: string;
    timing: Record<string, number>;
    easing: string;
    states: string[];
    hook: string;
  }>;
  risk_hierarchy: PhysicsClass[];
}

let constitutionCache: ConstitutionData | null = null;

/**
 * Load constitution data from YAML.
 * Caches result for subsequent calls.
 *
 * @param basePath - Base path to sigil-mark (defaults to auto-detection)
 * @returns Constitution data
 *
 * @internal
 */
function loadConstitution(basePath?: string): ConstitutionData {
  if (constitutionCache) {
    return constitutionCache;
  }

  // Try to find constitution.yaml
  const paths = [
    basePath ? join(basePath, 'kernel/constitution.yaml') : null,
    join(process.cwd(), 'grimoires/sigil/constitution/constitution.yaml'),
    join(__dirname, '../kernel/constitution.yaml'),
  ].filter(Boolean) as string[];

  for (const path of paths) {
    try {
      const content = readFileSync(path, 'utf-8');
      constitutionCache = parse(content) as ConstitutionData;
      return constitutionCache;
    } catch {
      // Try next path
    }
  }

  // Return default if not found
  return getDefaultConstitution();
}

/**
 * Get default constitution (hardcoded fallback).
 *
 * @internal
 */
function getDefaultConstitution(): ConstitutionData {
  return {
    data_physics: {
      financial: {
        types: ['Money', 'Balance', 'Transfer', 'Withdrawal', 'Deposit', 'Payment', 'Subscription', 'Invoice', 'Fee', 'Stake', 'Reward', 'Claim'],
        physics: 'server-tick',
        requires: ['simulation', 'confirmation', 'explicit-pending'],
        forbidden: ['useOptimistic', 'instant-commit', 'hiding-loading'],
        rationale: 'Loss of funds is irreversible. Wait for truth.',
      },
      health: {
        types: ['Health', 'HP', 'Hardcore', 'Permadeath', 'Lives', 'Damage', 'Healing'],
        physics: 'server-tick',
        requires: ['server-authoritative-state', 'no-client-prediction-on-damage'],
        forbidden: ['optimistic-hp-updates', 'client-side-death-calculation'],
        rationale: 'Dead is dead. Server is truth.',
      },
      collaborative: {
        types: ['Task', 'Document', 'Comment', 'Thread', 'Note', 'Canvas', 'Whiteboard', 'Project', 'Team'],
        physics: 'crdt',
        requires: ['conflict-resolution', 'background-sync', 'presence-indicators'],
        forbidden: ['blocking-save', 'full-page-refresh', 'lock-for-edit'],
        rationale: 'Multiple editors. Merge, don\'t block.',
      },
      local: {
        types: ['Preference', 'Draft', 'Toggle', 'UI_State', 'Theme', 'Layout', 'Filter', 'Sort', 'Bookmark', 'History'],
        physics: 'local-first',
        requires: ['useOptimistic', 'instant-feedback', 'background-persist'],
        forbidden: ['loading-spinner-on-local', 'server-round-trip', 'blocking-ui'],
        rationale: 'User\'s intent is truth. Server catches up.',
      },
    },
    physics_profiles: {
      'server-tick': {
        description: 'Server is authoritative. Wait for confirmation.',
        timing: { min_duration_ms: 600, recommended_ms: 800, max_duration_ms: 1200 },
        easing: 'ease-out',
        states: ['idle', 'simulating', 'confirming', 'committing', 'done', 'error'],
        hook: 'useSigilMutation',
      },
      crdt: {
        description: 'Optimistic with conflict resolution.',
        timing: { feedback_ms: 50, sync_interval_ms: 1000 },
        easing: 'ease-in-out',
        states: ['idle', 'pending', 'syncing', 'done', 'conflict'],
        hook: 'useSigilMutation',
      },
      'local-first': {
        description: 'Instant feedback. No server dependency.',
        timing: { max_feedback_ms: 50 },
        easing: 'linear',
        states: ['idle', 'done'],
        hook: 'useOptimistic',
      },
    },
    risk_hierarchy: ['server-tick', 'crdt', 'local-first'],
  };
}

/**
 * Clear the constitution cache.
 * Useful for testing.
 */
export function clearConstitutionCache(): void {
  constitutionCache = null;
}

// =============================================================================
// TYPE EXTRACTION
// =============================================================================

/**
 * Extract types from a TypeScript function signature.
 *
 * @param signature - Function signature string
 * @returns Extracted types
 *
 * @example
 * ```ts
 * extractTypesFromSignature('(amount: Money) => Promise<void>')
 * // { parameters: [{ name: 'amount', type: 'Money' }], allTypes: ['Money'] }
 *
 * extractTypesFromSignature('(task: Task, user: User) => Promise<Task>')
 * // { parameters: [...], returnType: 'Task', allTypes: ['Task', 'User'] }
 * ```
 */
export function extractTypesFromSignature(signature: string): ExtractedTypes {
  const result: ExtractedTypes = {
    parameters: [],
    generics: [],
    allTypes: [],
  };

  // Extract parameter types: (name: Type, name2: Type2)
  const paramRegex = /(\w+)\s*:\s*(\w+)/g;
  let match;
  while ((match = paramRegex.exec(signature)) !== null) {
    const [, name, type] = match;
    // Skip common non-data types
    if (!isUtilityType(type)) {
      result.parameters.push({ name, type });
      if (!result.allTypes.includes(type)) {
        result.allTypes.push(type);
      }
    }
  }

  // Extract return type from Promise<Type>
  const promiseMatch = signature.match(/=>\s*Promise<(\w+)>/);
  if (promiseMatch && !isUtilityType(promiseMatch[1])) {
    result.returnType = promiseMatch[1];
    if (!result.allTypes.includes(promiseMatch[1])) {
      result.allTypes.push(promiseMatch[1]);
    }
  }

  // Extract simple return type: => Type
  if (!result.returnType) {
    const simpleReturnMatch = signature.match(/=>\s*(\w+)(?!\s*<)/);
    if (simpleReturnMatch && !isUtilityType(simpleReturnMatch[1])) {
      result.returnType = simpleReturnMatch[1];
      if (!result.allTypes.includes(simpleReturnMatch[1])) {
        result.allTypes.push(simpleReturnMatch[1]);
      }
    }
  }

  // Extract generic parameters: <T, U>
  const genericMatch = signature.match(/<([^>]+)>/g);
  if (genericMatch) {
    for (const g of genericMatch) {
      const types = g.slice(1, -1).split(/\s*,\s*/);
      for (const type of types) {
        const cleanType = type.trim();
        if (cleanType && !isUtilityType(cleanType) && !result.generics.includes(cleanType)) {
          result.generics.push(cleanType);
          if (!result.allTypes.includes(cleanType)) {
            result.allTypes.push(cleanType);
          }
        }
      }
    }
  }

  return result;
}

/**
 * Check if a type is a utility type (not a data type).
 *
 * @internal
 */
function isUtilityType(type: string): boolean {
  const utilityTypes = [
    'void', 'undefined', 'null', 'never', 'unknown', 'any',
    'string', 'number', 'boolean', 'object', 'symbol', 'bigint',
    'Promise', 'Array', 'Record', 'Partial', 'Required', 'Readonly',
    'Pick', 'Omit', 'Exclude', 'Extract', 'NonNullable', 'ReturnType',
    'Parameters', 'ConstructorParameters', 'InstanceType', 'ThisType',
    'Awaited', 'Uppercase', 'Lowercase', 'Capitalize', 'Uncapitalize',
  ];
  return utilityTypes.includes(type);
}

// =============================================================================
// CONSTITUTION LOOKUP
// =============================================================================

/**
 * Look up a type in the constitution to get its physics class.
 *
 * @param typeName - Type name to look up
 * @param basePath - Base path to sigil-mark (optional)
 * @returns Type lookup result
 *
 * @example
 * ```ts
 * lookupTypePhysics('Money')
 * // { type: 'Money', category: 'financial', physics: 'server-tick', ... }
 *
 * lookupTypePhysics('Task')
 * // { type: 'Task', category: 'collaborative', physics: 'crdt', ... }
 *
 * lookupTypePhysics('UnknownType')
 * // { type: 'UnknownType', category: null, physics: null, found: false }
 * ```
 */
export function lookupTypePhysics(typeName: string, basePath?: string): TypeLookupResult {
  const constitution = loadConstitution(basePath);

  // Search through data_physics categories
  for (const [category, config] of Object.entries(constitution.data_physics)) {
    if (config.types.includes(typeName)) {
      return {
        type: typeName,
        category: category as DataCategory,
        physics: config.physics,
        requires: config.requires || [],
        forbidden: config.forbidden || [],
        found: true,
      };
    }
  }

  // Not found
  return {
    type: typeName,
    category: null,
    physics: null,
    requires: [],
    forbidden: [],
    found: false,
  };
}

// =============================================================================
// RISK HIERARCHY RESOLUTION
// =============================================================================

/**
 * Risk levels for each physics class (lower = higher risk).
 */
const RISK_LEVELS: Record<PhysicsClass, number> = {
  'server-tick': 1,  // Highest risk
  'crdt': 2,         // Medium risk
  'local-first': 3,  // Lowest risk
};

/**
 * Resolve the highest-risk physics class from multiple types.
 *
 * @param types - Array of type names
 * @param basePath - Base path to sigil-mark (optional)
 * @returns Resolved data physics with highest risk
 *
 * @example
 * ```ts
 * resolveDataPhysics(['Money', 'Task'])
 * // { physics: 'server-tick', ... }  // Money (server-tick) > Task (crdt)
 *
 * resolveDataPhysics(['Task', 'Preference'])
 * // { physics: 'crdt', ... }  // Task (crdt) > Preference (local-first)
 *
 * resolveDataPhysics(['Preference', 'Toggle'])
 * // { physics: 'local-first', ... }  // Both are local-first
 * ```
 */
export function resolveDataPhysics(types: string[], basePath?: string): ResolvedDataPhysics {
  const constitution = loadConstitution(basePath);
  const lookups: TypeLookupResult[] = [];
  const allRequires: string[] = [];
  const allForbidden: string[] = [];

  // Look up each type
  for (const type of types) {
    const lookup = lookupTypePhysics(type, basePath);
    lookups.push(lookup);

    if (lookup.found) {
      for (const req of lookup.requires) {
        if (!allRequires.includes(req)) {
          allRequires.push(req);
        }
      }
      for (const forbidden of lookup.forbidden) {
        if (!allForbidden.includes(forbidden)) {
          allForbidden.push(forbidden);
        }
      }
    }
  }

  // Find highest-risk physics
  let highestRiskPhysics: PhysicsClass = 'local-first';
  let highestRiskLevel = RISK_LEVELS['local-first'];

  const foundPhysics: PhysicsClass[] = [];
  for (const lookup of lookups) {
    if (lookup.physics) {
      foundPhysics.push(lookup.physics);
      const riskLevel = RISK_LEVELS[lookup.physics];
      if (riskLevel < highestRiskLevel) {
        highestRiskLevel = riskLevel;
        highestRiskPhysics = lookup.physics;
      }
    }
  }

  // Check for multiple high-risk types
  const serverTickCount = foundPhysics.filter(p => p === 'server-tick').length;
  const multipleHighRisk = serverTickCount > 1;

  // Get timing from physics profiles
  const profile = constitution.physics_profiles[highestRiskPhysics];
  const timing: ResolvedDataPhysics['timing'] = {};

  if (profile?.timing) {
    if (profile.timing.min_duration_ms) timing.min_ms = profile.timing.min_duration_ms;
    if (profile.timing.recommended_ms) timing.recommended_ms = profile.timing.recommended_ms;
    if (profile.timing.max_duration_ms) timing.max_ms = profile.timing.max_duration_ms;
    if (profile.timing.feedback_ms) timing.feedback_ms = profile.timing.feedback_ms;
    if (profile.timing.max_feedback_ms) timing.feedback_ms = profile.timing.max_feedback_ms;
  }

  // Build result
  const result: ResolvedDataPhysics = {
    physics: highestRiskPhysics,
    types,
    lookups,
    requires: allRequires,
    forbidden: allForbidden,
    timing,
    easing: profile?.easing || 'ease-in-out',
    multipleHighRisk,
  };

  // Add warning for multiple types
  if (types.length > 1 && foundPhysics.length > 1) {
    const uniquePhysics = [...new Set(foundPhysics)];
    if (uniquePhysics.length > 1) {
      result.warning = `Multiple types detected: ${types.join(', ')}. Using ${highestRiskPhysics} (highest risk).`;
    }
  }

  return result;
}

// =============================================================================
// HIGH-LEVEL API
// =============================================================================

/**
 * Analyze a function signature and resolve physics.
 *
 * @param signature - TypeScript function signature
 * @param basePath - Base path to sigil-mark (optional)
 * @returns Resolved data physics
 *
 * @example
 * ```ts
 * analyzeSignaturePhysics('(amount: Money) => Promise<void>')
 * // { physics: 'server-tick', types: ['Money'], ... }
 *
 * analyzeSignaturePhysics('(task: Task) => Promise<Task>')
 * // { physics: 'crdt', types: ['Task'], ... }
 * ```
 */
export function analyzeSignaturePhysics(signature: string, basePath?: string): ResolvedDataPhysics {
  const extracted = extractTypesFromSignature(signature);
  return resolveDataPhysics(extracted.allTypes, basePath);
}

/**
 * Get physics for a single data type.
 * Convenience wrapper around resolveDataPhysics.
 *
 * @param dataType - Data type name
 * @param basePath - Base path to sigil-mark (optional)
 * @returns Resolved data physics
 *
 * @example
 * ```ts
 * getPhysicsForDataType('Money')
 * // { physics: 'server-tick', ... }
 * ```
 */
export function getPhysicsForDataType(dataType: string, basePath?: string): ResolvedDataPhysics {
  return resolveDataPhysics([dataType], basePath);
}

/**
 * Get physics for multiple data types.
 * Convenience wrapper around resolveDataPhysics.
 *
 * @param dataTypes - Array of data type names
 * @param basePath - Base path to sigil-mark (optional)
 * @returns Resolved data physics (highest risk wins)
 *
 * @example
 * ```ts
 * getPhysicsForDataTypes(['Money', 'Task'])
 * // { physics: 'server-tick', ... }  // Money takes precedence
 * ```
 */
export function getPhysicsForDataTypes(dataTypes: string[], basePath?: string): ResolvedDataPhysics {
  return resolveDataPhysics(dataTypes, basePath);
}

/**
 * Check if a type is known in the constitution.
 *
 * @param typeName - Type name to check
 * @param basePath - Base path to sigil-mark (optional)
 * @returns True if type is in constitution
 *
 * @example
 * ```ts
 * isKnownDataType('Money') // true
 * isKnownDataType('Task')  // true
 * isKnownDataType('Foo')   // false
 * ```
 */
export function isKnownDataType(typeName: string, basePath?: string): boolean {
  const lookup = lookupTypePhysics(typeName, basePath);
  return lookup.found;
}

/**
 * Get all known data types from constitution.
 *
 * @param basePath - Base path to sigil-mark (optional)
 * @returns All known data types by category
 */
export function getAllKnownDataTypes(basePath?: string): Record<DataCategory, string[]> {
  const constitution = loadConstitution(basePath);
  const result: Record<DataCategory, string[]> = {
    financial: [],
    health: [],
    collaborative: [],
    local: [],
  };

  for (const [category, config] of Object.entries(constitution.data_physics)) {
    if (category in result) {
      result[category as DataCategory] = [...config.types];
    }
  }

  return result;
}
