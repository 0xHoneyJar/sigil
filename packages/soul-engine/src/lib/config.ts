/**
 * Configuration Schema
 *
 * Handles .sigilrc.yaml parsing and writing.
 */

import { readFileSync, writeFileSync } from 'fs';
import { parse, stringify } from 'yaml';
import type { TensionState } from '../hooks/index.js';
import { DEFAULT_TENSIONS, TENSION_PRESETS } from '../hooks/index.js';
import type { MaterialType } from '../material/index.js';

/**
 * Zone configuration
 */
export interface ZoneConfig {
  name: string;
  material: MaterialType;
  sync: string;
  paths: string[];
}

/**
 * Tension preset configuration
 */
export interface TensionPreset {
  name: string;
  playfulness: number;
  weight: number;
  density: number;
  speed: number;
}

/**
 * Gardener configuration
 */
export interface GardenerConfig {
  paper_cut_threshold: number;
  three_to_one_rule: boolean;
  enforcement: 'advisory' | 'blocking';
}

/**
 * Founder Mode configuration
 */
export interface FounderModeConfig {
  pair_required: boolean;
  invariant_protection: string[];
}

/**
 * Full Sigil configuration
 */
export interface SigilConfig {
  version: string;
  zones: ZoneConfig[];
  tensions: {
    current?: TensionState;
    presets: TensionPreset[];
  };
  gardener: GardenerConfig;
  founder_mode: FounderModeConfig;
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: SigilConfig = {
  version: '0.4',
  zones: [
    {
      name: 'critical',
      material: 'clay',
      sync: 'server_tick',
      paths: ['src/features/checkout/**', 'src/features/claim/**'],
    },
    {
      name: 'transactional',
      material: 'machinery',
      sync: 'lww',
      paths: ['src/features/dashboard/**'],
    },
    {
      name: 'exploratory',
      material: 'glass',
      sync: 'lww',
      paths: ['src/features/discovery/**'],
    },
  ],
  tensions: {
    current: DEFAULT_TENSIONS,
    presets: Object.entries(TENSION_PRESETS).map(([name, values]) => ({
      name,
      ...values,
    })),
  },
  gardener: {
    paper_cut_threshold: 10,
    three_to_one_rule: true,
    enforcement: 'advisory',
  },
  founder_mode: {
    pair_required: true,
    invariant_protection: ['accessibility', 'security'],
  },
};

/**
 * Load configuration from file
 */
export function loadConfig(configPath: string): SigilConfig {
  const content = readFileSync(configPath, 'utf-8');
  const config = parse(content) as SigilConfig;

  // Merge with defaults for any missing fields
  return {
    ...DEFAULT_CONFIG,
    ...config,
    tensions: {
      ...DEFAULT_CONFIG.tensions,
      ...config.tensions,
    },
    gardener: {
      ...DEFAULT_CONFIG.gardener,
      ...config.gardener,
    },
    founder_mode: {
      ...DEFAULT_CONFIG.founder_mode,
      ...config.founder_mode,
    },
  };
}

/**
 * Write configuration to file
 */
export function writeConfig(configPath: string, config: SigilConfig): void {
  const content = stringify(config, {
    indent: 2,
    lineWidth: 0,
  });
  writeFileSync(configPath, content);
}

/**
 * Get zone for a file path
 */
export function getZoneForPath(
  config: SigilConfig,
  filePath: string
): ZoneConfig | null {
  for (const zone of config.zones) {
    for (const pattern of zone.paths) {
      // Simple glob matching (** for any, * for single level)
      const regex = new RegExp(
        '^' +
          pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*')
            .replace(/\//g, '\\/') +
          '$'
      );
      if (regex.test(filePath)) {
        return zone;
      }
    }
  }
  return null;
}

/**
 * Get material for a file path
 */
export function getMaterialForPath(
  config: SigilConfig,
  filePath: string
): MaterialType {
  const zone = getZoneForPath(config, filePath);
  return zone?.material || 'clay'; // Default to clay
}
