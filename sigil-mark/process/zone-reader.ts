/**
 * Sigil v4.0 — Zone Reader
 *
 * Reads and manages zone configurations from .sigilrc.yaml.
 * Zones define context-specific UI behavior with journey stages, persona mapping, and trust states.
 *
 * v4.0 ADDITIONS:
 * - Journey context: journey_stage, persona_likely, trust_state
 * - Path-based detection for agent-time: paths[]
 * - Evidence-based: evidence[], last_refined
 *
 * Philosophy: "Layout-based zones declare context. Journey-based zones explain why."
 *
 * @module process/zone-reader
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import YAML from 'yaml';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Layout type for zones.
 */
export type ZoneLayout = 'CriticalZone' | 'MachineryLayout' | 'GlassLayout' | null;

/**
 * Time authority for state management.
 */
export type TimeAuthority = 'server-tick' | 'optimistic';

/**
 * Trust state for zone context (v4.0).
 */
export type TrustState = 'building' | 'established' | 'critical';

/**
 * Lens type for zones.
 */
export type ZoneLens = 'default' | 'strict' | 'guided' | 'a11y' | 'user-preference';

/**
 * Motion style for zones.
 */
export type ZoneMotion = 'snappy' | 'deliberate' | 'warm' | 'reassuring' | 'playful' | 'reduced';

/**
 * Constraint level.
 */
export type ConstraintLevel = 'allowed' | 'warn' | 'forbidden';

/**
 * Zone constraints.
 */
export interface ZoneConstraints {
  optimistic_ui?: ConstraintLevel;
  loading_spinners?: ConstraintLevel;
  animations?: ConstraintLevel;
  raw_physics?: ConstraintLevel;
}

/**
 * Persona override within a zone.
 */
export interface PersonaOverride {
  lens?: 'default' | 'strict' | 'guided' | 'a11y';
  help?: 'always' | 'on_demand' | 'contextual' | 'never';
  density?: 'high' | 'medium' | 'low';
  motion?: 'snappy' | 'deliberate' | 'warm' | 'reassuring' | 'reduced';
}

/**
 * A zone configuration with journey context (v4.0).
 */
export interface Zone {
  /** Zone ID (e.g., 'critical', 'admin', 'marketing') */
  id: string;

  /** File path globs for agent-time zone detection (v4.0) */
  paths?: string[];

  /** Layout component name */
  layout: ZoneLayout;

  /** Time authority for state management */
  time_authority: TimeAuthority;

  /** Default lens for this zone */
  lens?: ZoneLens;

  /** Motion style for this zone */
  motion?: ZoneMotion;

  /** Constraints for UI patterns */
  constraints: ZoneConstraints;

  // v4.0: Journey context
  /** The user journey stage this zone represents (v4.0) */
  journey_stage?: string;

  /** Most likely persona in this zone (v4.0) */
  persona_likely?: string;

  /** Trust state for this zone context (v4.0) */
  trust_state?: TrustState;

  /** Default persona ID for this zone */
  default_persona?: string;

  /** Persona-specific overrides for this zone */
  persona_overrides?: Record<string, PersonaOverride>;

  // v4.0: Evidence-based
  /** Evidence citations for zone configuration (v4.0) */
  evidence?: string[];

  /** ISO date when zone was last refined (v4.0) */
  last_refined?: string;
}

/**
 * Zone configuration from .sigilrc.yaml.
 */
export interface ZoneConfig {
  /** Map of zone ID to zone */
  zones: Record<string, Zone>;
}

// =============================================================================
// DEFAULTS
// =============================================================================

/**
 * Default zone configuration.
 */
export const DEFAULT_ZONE_CONFIG: ZoneConfig = {
  zones: {
    default: {
      id: 'default',
      layout: null,
      time_authority: 'optimistic',
      lens: 'default',
      constraints: {},
      persona_overrides: {},
    },
  },
};

/**
 * Default path to the sigilrc file.
 */
export const DEFAULT_SIGILRC_PATH = '.sigilrc.yaml';

// =============================================================================
// VALIDATION
// =============================================================================

const VALID_LAYOUTS: ZoneLayout[] = ['CriticalZone', 'MachineryLayout', 'GlassLayout', null];
const VALID_TIME_AUTHORITIES: TimeAuthority[] = ['server-tick', 'optimistic'];
const VALID_TRUST_STATES: TrustState[] = ['building', 'established', 'critical'];

/**
 * Normalizes a zone object.
 */
function normalizeZone(obj: Record<string, unknown>, id: string): Zone {
  // Support both camelCase and snake_case for time authority
  const timeAuthority = obj.timeAuthority ?? obj.time_authority;

  // v4.0: Parse path globs
  const paths = Array.isArray(obj.paths)
    ? obj.paths.filter((p): p is string => typeof p === 'string')
    : undefined;

  // v4.0: Parse evidence-based fields
  const evidence = Array.isArray(obj.evidence)
    ? obj.evidence.filter((e): e is string => typeof e === 'string')
    : undefined;

  const trust_state = VALID_TRUST_STATES.includes(obj.trust_state as TrustState)
    ? obj.trust_state as TrustState
    : undefined;

  const journey_stage = typeof obj.journey_stage === 'string' ? obj.journey_stage : undefined;
  const persona_likely = typeof obj.persona_likely === 'string' ? obj.persona_likely : undefined;
  const last_refined = typeof obj.last_refined === 'string' ? obj.last_refined : undefined;

  return {
    id,
    paths,
    layout: VALID_LAYOUTS.includes(obj.layout as ZoneLayout)
      ? obj.layout as ZoneLayout
      : null,
    time_authority: VALID_TIME_AUTHORITIES.includes(timeAuthority as TimeAuthority)
      ? timeAuthority as TimeAuthority
      : 'optimistic',
    lens: typeof obj.lens === 'string' ? obj.lens as ZoneLens : undefined,
    motion: typeof obj.motion === 'string' ? obj.motion as ZoneMotion : undefined,
    constraints: typeof obj.constraints === 'object' && obj.constraints !== null
      ? obj.constraints as ZoneConstraints
      : {},

    // v4.0: Journey context
    journey_stage,
    persona_likely,
    trust_state,

    default_persona: typeof obj.default_persona === 'string' ? obj.default_persona : undefined,
    persona_overrides: typeof obj.persona_overrides === 'object' && obj.persona_overrides !== null
      ? obj.persona_overrides as Record<string, PersonaOverride>
      : undefined,

    // v4.0: Evidence-based
    evidence,
    last_refined,
  };
}

/**
 * Validates and normalizes zone configuration.
 */
function validateZoneConfig(parsed: unknown): ZoneConfig {
  if (typeof parsed !== 'object' || parsed === null) {
    console.warn('[Sigil Zones] Invalid configuration format, using defaults');
    return DEFAULT_ZONE_CONFIG;
  }

  const obj = parsed as Record<string, unknown>;
  const zonesObj = obj.zones;

  const zones: Record<string, Zone> = {};
  if (typeof zonesObj === 'object' && zonesObj !== null) {
    for (const [id, zone] of Object.entries(zonesObj as Record<string, unknown>)) {
      if (typeof zone === 'object' && zone !== null) {
        zones[id] = normalizeZone(zone as Record<string, unknown>, id);
      }
    }
  }

  // Ensure default zone exists
  if (!zones.default) {
    zones.default = DEFAULT_ZONE_CONFIG.zones.default;
  }

  return { zones };
}

// =============================================================================
// READER FUNCTIONS
// =============================================================================

/**
 * Reads and parses zone configuration from .sigilrc.yaml.
 *
 * @param filePath - Path to the sigilrc file
 * @returns Parsed and validated ZoneConfig
 */
export async function readZones(
  filePath: string = DEFAULT_SIGILRC_PATH
): Promise<ZoneConfig> {
  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    const content = await fs.readFile(resolvedPath, 'utf-8');
    const parsed = YAML.parse(content);
    return validateZoneConfig(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[Sigil Zones] File not found: ${filePath}, using defaults`);
    } else if (error instanceof YAML.YAMLParseError) {
      console.error(`[Sigil Zones] YAML parse error: ${error.message}`);
    } else {
      console.error(`[Sigil Zones] Error reading zones: ${error}`);
    }
    return DEFAULT_ZONE_CONFIG;
  }
}

/**
 * Synchronously reads and parses zone configuration.
 *
 * @param filePath - Path to the sigilrc file
 * @returns Parsed and validated ZoneConfig
 */
export function readZonesSync(
  filePath: string = DEFAULT_SIGILRC_PATH
): ZoneConfig {
  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fsSync = require('fs');
    const content = fsSync.readFileSync(resolvedPath, 'utf-8');
    const parsed = YAML.parse(content);
    return validateZoneConfig(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[Sigil Zones] File not found: ${filePath}, using defaults`);
    } else {
      console.error(`[Sigil Zones] Error reading zones: ${error}`);
    }
    return DEFAULT_ZONE_CONFIG;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Gets a zone by ID.
 *
 * @param config - The zone configuration
 * @param zoneId - The zone ID to find
 * @returns The zone, or the default zone if not found
 */
export function getZoneById(config: ZoneConfig, zoneId: string): Zone {
  return config.zones[zoneId] ?? config.zones.default;
}

/**
 * Gets all zones as an array.
 *
 * @param config - The zone configuration
 * @returns Array of all zones
 */
export function getAllZones(config: ZoneConfig): Zone[] {
  return Object.values(config.zones);
}

/**
 * Resolves a zone from a file path (v4.0).
 * Matches file path against zone paths[] globs.
 *
 * @param config - The zone configuration
 * @param filePath - The file path to match
 * @returns The matching zone, or default zone if no match
 */
export function resolveZoneFromPath(config: ZoneConfig, filePath: string): Zone {
  const normalizedPath = filePath.replace(/\\/g, '/');

  for (const zone of getAllZones(config)) {
    if (zone.paths) {
      for (const pattern of zone.paths) {
        // Simple glob matching (supports ** and *)
        const regexPattern = pattern
          .replace(/\*\*/g, '.*')
          .replace(/\*/g, '[^/]*')
          .replace(/\//g, '\\/');
        const regex = new RegExp(`^${regexPattern}$`);
        if (regex.test(normalizedPath)) {
          return zone;
        }
      }
    }
  }

  return config.zones.default;
}

// =============================================================================
// v4.0 HELPER FUNCTIONS
// =============================================================================

/**
 * Gets the journey stage for a zone (v4.0).
 *
 * @param config - The zone configuration
 * @param zoneId - The zone ID
 * @returns The zone's journey stage, or undefined if not specified
 */
export function getJourneyStageForZone(config: ZoneConfig, zoneId: string): string | undefined {
  const zone = getZoneById(config, zoneId);
  return zone.journey_stage;
}

/**
 * Gets the likely persona for a zone (v4.0).
 *
 * @param config - The zone configuration
 * @param zoneId - The zone ID
 * @returns The zone's likely persona, or undefined if not specified
 */
export function getPersonaLikelyForZone(config: ZoneConfig, zoneId: string): string | undefined {
  const zone = getZoneById(config, zoneId);
  return zone.persona_likely;
}

/**
 * Gets the trust state for a zone (v4.0).
 *
 * @param config - The zone configuration
 * @param zoneId - The zone ID
 * @returns The zone's trust state, or undefined if not specified
 */
export function getTrustStateForZone(config: ZoneConfig, zoneId: string): TrustState | undefined {
  const zone = getZoneById(config, zoneId);
  return zone.trust_state;
}

/**
 * Gets zones by trust state (v4.0).
 *
 * @param config - The zone configuration
 * @param trustState - The trust state to match
 * @returns Array of zones with that trust state
 */
export function getZonesByTrustState(config: ZoneConfig, trustState: TrustState): Zone[] {
  return getAllZones(config).filter((z) => z.trust_state === trustState);
}

/**
 * Gets zones for a journey stage (v4.0).
 *
 * @param config - The zone configuration
 * @param journeyStage - The journey stage to match
 * @returns Array of zones for that journey stage
 */
export function getZonesForJourneyStage(config: ZoneConfig, journeyStage: string): Zone[] {
  return getAllZones(config).filter((z) => z.journey_stage === journeyStage);
}

/**
 * Checks if a zone has journey context (v4.0).
 *
 * @param zone - The zone to check
 * @returns true if the zone has journey_stage defined
 */
export function hasJourneyContext(zone: Zone): boolean {
  return zone.journey_stage !== undefined;
}

/**
 * Gets zones that lack journey context (v4.0).
 * Useful for /garden health checks.
 *
 * @param config - The zone configuration
 * @returns Array of zones without journey context
 */
export function getZonesWithoutJourneyContext(config: ZoneConfig): Zone[] {
  return getAllZones(config).filter((z) => !hasJourneyContext(z));
}

/**
 * Gets effective preferences for a zone + persona combination.
 *
 * @param zone - The zone
 * @param personaId - The persona ID
 * @returns Merged preferences from zone and persona override
 */
export function getEffectivePreferences(
  zone: Zone,
  personaId: string
): PersonaOverride {
  const override = zone.persona_overrides?.[personaId] ?? {};
  return {
    lens: override.lens ?? (zone.lens === 'user-preference' ? undefined : zone.lens as PersonaOverride['lens']),
    motion: override.motion ?? zone.motion as PersonaOverride['motion'],
    help: override.help,
    density: override.density,
  };
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Formats a zone summary.
 *
 * @param zone - The zone to format
 * @returns Formatted string
 */
export function formatZoneSummary(zone: Zone): string {
  const journeyInfo = zone.journey_stage ? ` [${zone.journey_stage}]` : '';
  const trustInfo = zone.trust_state ? ` (${zone.trust_state})` : '';

  return `${zone.id}${journeyInfo}${trustInfo}
  Layout: ${zone.layout ?? 'none'}
  Time: ${zone.time_authority}
  Lens: ${zone.lens ?? 'default'}
  Motion: ${zone.motion ?? 'default'}
  Persona likely: ${zone.persona_likely ?? 'any'}`;
}

/**
 * Formats a zone configuration summary.
 *
 * @param config - The zone configuration
 * @returns Formatted string
 */
export function formatZoneConfigSummary(config: ZoneConfig): string {
  const zones = getAllZones(config);
  const zoneList = zones
    .map((z) => {
      const journey = z.journey_stage ? ` → ${z.journey_stage}` : '';
      return `  - ${z.id}: ${z.layout ?? 'none'}${journey}`;
    })
    .join('\n');

  const withJourney = zones.filter(hasJourneyContext).length;

  return `Sigil Zones v4.0
Zones (${zones.length}):
${zoneList}

Journey context: ${withJourney}/${zones.length} zones`;
}
