/**
 * Sigil v2.6 — Constitution Reader
 *
 * Reads and validates the Constitution (protected capabilities).
 * Implements graceful degradation: never throws, always returns valid data.
 *
 * @module process/constitution-reader
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import YAML from 'yaml';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Enforcement level for a protected capability.
 * - `block`: Prevent the violation entirely
 * - `warn`: Show a warning but allow the action
 * - `log`: Silently log the violation
 */
export type EnforcementLevel = 'block' | 'warn' | 'log';

/**
 * A protected capability that must always work.
 */
export interface ProtectedCapability {
  /** Unique identifier (e.g., 'withdraw', 'deposit') */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of what this capability does */
  description: string;
  /** How to handle violations */
  enforcement: EnforcementLevel;
  /** Why this capability is protected */
  rationale: string;
  /** Zones where this capability applies (empty = all zones) */
  zones?: string[];
}

/**
 * Configuration for auditing override attempts.
 */
export interface OverrideAuditConfig {
  /** Whether to audit override attempts */
  enabled: boolean;
  /** Path to write audit logs */
  path?: string;
  /** Whether overrides require a justification */
  requires_justification: boolean;
  /** Stakeholders to notify on override */
  notify: string[];
}

/**
 * The Constitution: protected capabilities that always work.
 */
export interface Constitution {
  /** Schema version */
  version: string;
  /** Default enforcement level */
  enforcement: EnforcementLevel;
  /** List of protected capabilities */
  protected: ProtectedCapability[];
  /** Override audit configuration */
  override_audit?: OverrideAuditConfig;
}

// =============================================================================
// DEFAULTS
// =============================================================================

/**
 * Default empty constitution returned when file is missing or invalid.
 */
export const DEFAULT_CONSTITUTION: Constitution = {
  version: '2.6.0',
  enforcement: 'warn',
  protected: [],
  override_audit: {
    enabled: false,
    requires_justification: false,
    notify: [],
  },
};

/**
 * Default path to the constitution file.
 */
export const DEFAULT_CONSTITUTION_PATH = 'sigil-mark/constitution/protected-capabilities.yaml';

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validates an enforcement level.
 */
function isValidEnforcement(value: unknown): value is EnforcementLevel {
  return value === 'block' || value === 'warn' || value === 'log';
}

/**
 * Validates a protected capability object.
 */
function isValidCapability(value: unknown): value is ProtectedCapability {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    obj.id.length > 0 &&
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    isValidEnforcement(obj.enforcement) &&
    typeof obj.rationale === 'string' &&
    (obj.zones === undefined || Array.isArray(obj.zones))
  );
}

/**
 * Validates and normalizes a constitution object.
 * Returns a valid Constitution, filtering out invalid capabilities.
 */
function validateConstitution(parsed: unknown): Constitution {
  if (typeof parsed !== 'object' || parsed === null) {
    console.warn('[Sigil Constitution] Invalid constitution format, using defaults');
    return DEFAULT_CONSTITUTION;
  }

  const obj = parsed as Record<string, unknown>;

  // Validate version
  const version = typeof obj.version === 'string' ? obj.version : '2.6.0';

  // Validate enforcement
  const enforcement = isValidEnforcement(obj.enforcement) ? obj.enforcement : 'warn';

  // Validate protected capabilities
  const protectedCaps: ProtectedCapability[] = [];
  if (Array.isArray(obj.protected)) {
    for (const cap of obj.protected) {
      if (isValidCapability(cap)) {
        protectedCaps.push({
          id: cap.id,
          name: cap.name,
          description: cap.description,
          enforcement: cap.enforcement,
          rationale: cap.rationale,
          zones: cap.zones,
        });
      } else {
        console.warn(
          `[Sigil Constitution] Skipping invalid capability: ${JSON.stringify(cap)}`
        );
      }
    }
  }

  // Validate override_audit
  let overrideAudit: OverrideAuditConfig = {
    enabled: false,
    requires_justification: false,
    notify: [],
  };

  if (typeof obj.override_audit === 'object' && obj.override_audit !== null) {
    const audit = obj.override_audit as Record<string, unknown>;
    overrideAudit = {
      enabled: typeof audit.enabled === 'boolean' ? audit.enabled : false,
      path: typeof audit.path === 'string' ? audit.path : undefined,
      requires_justification:
        typeof audit.requires_justification === 'boolean'
          ? audit.requires_justification
          : false,
      notify: Array.isArray(audit.notify)
        ? audit.notify.filter((n): n is string => typeof n === 'string')
        : [],
    };
  }

  return {
    version,
    enforcement,
    protected: protectedCaps,
    override_audit: overrideAudit,
  };
}

// =============================================================================
// READER FUNCTIONS
// =============================================================================

/**
 * Reads and parses the Constitution from a YAML file.
 *
 * Implements graceful degradation:
 * - If file doesn't exist: returns empty constitution
 * - If YAML is invalid: returns empty constitution
 * - If individual capabilities are invalid: skips them
 *
 * @param filePath - Path to the constitution YAML file
 * @returns Parsed and validated Constitution
 *
 * @example
 * ```ts
 * const constitution = await readConstitution();
 * console.log(constitution.protected.length); // 8
 * ```
 */
export async function readConstitution(
  filePath: string = DEFAULT_CONSTITUTION_PATH
): Promise<Constitution> {
  try {
    // Resolve path relative to cwd
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    const content = await fs.readFile(resolvedPath, 'utf-8');
    const parsed = YAML.parse(content);
    return validateConstitution(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[Sigil Constitution] File not found: ${filePath}, using defaults`);
    } else if (error instanceof YAML.YAMLParseError) {
      console.error(`[Sigil Constitution] YAML parse error: ${error.message}`);
    } else {
      console.error(`[Sigil Constitution] Error reading constitution: ${error}`);
    }
    return DEFAULT_CONSTITUTION;
  }
}

/**
 * Synchronously reads and parses the Constitution from a YAML file.
 * Only use this in contexts where async is not possible.
 *
 * @param filePath - Path to the constitution YAML file
 * @returns Parsed and validated Constitution
 */
export function readConstitutionSync(
  filePath: string = DEFAULT_CONSTITUTION_PATH
): Constitution {
  try {
    // Resolve path relative to cwd
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    // Use dynamic require for sync fs
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fsSync = require('fs');
    const content = fsSync.readFileSync(resolvedPath, 'utf-8');
    const parsed = YAML.parse(content);
    return validateConstitution(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[Sigil Constitution] File not found: ${filePath}, using defaults`);
    } else {
      console.error(`[Sigil Constitution] Error reading constitution: ${error}`);
    }
    return DEFAULT_CONSTITUTION;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Checks if a capability is protected in the constitution.
 *
 * @param constitution - The constitution to check
 * @param capabilityId - The capability ID to check
 * @returns True if the capability is protected
 *
 * @example
 * ```ts
 * const constitution = await readConstitution();
 * isCapabilityProtected(constitution, 'withdraw'); // true
 * isCapabilityProtected(constitution, 'unknown'); // false
 * ```
 */
export function isCapabilityProtected(
  constitution: Constitution,
  capabilityId: string
): boolean {
  return constitution.protected.some((cap) => cap.id === capabilityId);
}

/**
 * Gets the enforcement level for a capability.
 *
 * @param constitution - The constitution to check
 * @param capabilityId - The capability ID to check
 * @returns The enforcement level, or null if not found
 *
 * @example
 * ```ts
 * const constitution = await readConstitution();
 * getCapabilityEnforcement(constitution, 'withdraw'); // 'block'
 * getCapabilityEnforcement(constitution, 'help_access'); // 'warn'
 * getCapabilityEnforcement(constitution, 'unknown'); // null
 * ```
 */
export function getCapabilityEnforcement(
  constitution: Constitution,
  capabilityId: string
): EnforcementLevel | null {
  const capability = constitution.protected.find((cap) => cap.id === capabilityId);
  return capability?.enforcement ?? null;
}

/**
 * Gets a protected capability by ID.
 *
 * @param constitution - The constitution to check
 * @param capabilityId - The capability ID to get
 * @returns The capability, or undefined if not found
 */
export function getCapability(
  constitution: Constitution,
  capabilityId: string
): ProtectedCapability | undefined {
  return constitution.protected.find((cap) => cap.id === capabilityId);
}

/**
 * Gets all protected capabilities for a specific zone.
 *
 * @param constitution - The constitution to check
 * @param zone - The zone to filter by
 * @returns Array of capabilities that apply to the zone
 *
 * @example
 * ```ts
 * const constitution = await readConstitution();
 * getCapabilitiesForZone(constitution, 'critical'); // [withdraw, deposit, ...]
 * ```
 */
export function getCapabilitiesForZone(
  constitution: Constitution,
  zone: string
): ProtectedCapability[] {
  return constitution.protected.filter((cap) => {
    // If zones is empty or undefined, applies to all zones
    if (!cap.zones || cap.zones.length === 0) {
      return true;
    }
    return cap.zones.includes(zone);
  });
}

/**
 * Validates an action against the constitution.
 *
 * @param constitution - The constitution to check
 * @param capabilityId - The capability being exercised
 * @param zone - The zone where the action is happening
 * @returns Validation result with enforcement level
 *
 * @example
 * ```ts
 * const constitution = await readConstitution();
 * const result = validateAction(constitution, 'withdraw', 'critical');
 * // { valid: true, capability: {...}, enforcement: 'block' }
 * ```
 */
export function validateAction(
  constitution: Constitution,
  capabilityId: string,
  zone?: string
): {
  valid: boolean;
  capability: ProtectedCapability | null;
  enforcement: EnforcementLevel;
  message?: string;
} {
  const capability = getCapability(constitution, capabilityId);

  if (!capability) {
    return {
      valid: true,
      capability: null,
      enforcement: constitution.enforcement,
      message: `Capability '${capabilityId}' is not protected`,
    };
  }

  // Check if capability applies to this zone
  if (zone && capability.zones && capability.zones.length > 0) {
    if (!capability.zones.includes(zone)) {
      return {
        valid: true,
        capability,
        enforcement: constitution.enforcement,
        message: `Capability '${capabilityId}' does not apply to zone '${zone}'`,
      };
    }
  }

  return {
    valid: true,
    capability,
    enforcement: capability.enforcement,
  };
}
