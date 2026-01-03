/**
 * Soul Binder
 *
 * Binds design context to AI agents via CLAUDE.md generation.
 * Manages zone context injection, corrections, and paper cut tracking.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';
import type { SoulBinderConfig, SoulContext, Correction } from './index.js';
import type { SigilConfig } from '../lib/config.js';
import type { TensionState } from '../hooks/types.js';
import { loadTensionsFromDB, loadCorrectionsFromDB } from '../lib/db.js';

/**
 * Soul Binder class
 *
 * Manages the binding between Sigil configuration and AI context.
 */
export class SoulBinder {
  private config: SoulBinderConfig;
  private sigilConfig: SigilConfig | null = null;
  private tensions: TensionState | null = null;
  private corrections: Correction[] = [];

  constructor(config: SoulBinderConfig) {
    this.config = {
      configPath: join(config.projectRoot, '.sigilrc.yaml'),
      dbPath: join(config.projectRoot, '.sigil', 'sigil.db'),
      correctionsPath: join(config.projectRoot, '.sigil', 'corrections.yaml'),
      ...config,
    };
  }

  /**
   * Load configuration from files
   */
  async load(): Promise<void> {
    await this.loadSigilConfig();
    await this.loadTensions();
    await this.loadCorrections();
  }

  /**
   * Load .sigilrc.yaml configuration
   */
  private async loadSigilConfig(): Promise<void> {
    const configPath = this.config.configPath!;

    if (!existsSync(configPath)) {
      console.warn(`Sigil config not found at ${configPath}`);
      return;
    }

    try {
      const content = readFileSync(configPath, 'utf-8');
      this.sigilConfig = parse(content) as SigilConfig;
    } catch (error) {
      console.error('Failed to load Sigil config:', error);
    }
  }

  /**
   * Load tensions from SQLite database
   */
  private async loadTensions(): Promise<void> {
    const dbPath = this.config.dbPath!;

    if (!existsSync(dbPath)) {
      return;
    }

    try {
      this.tensions = await loadTensionsFromDB(dbPath);
    } catch (error) {
      console.error('Failed to load tensions:', error);
    }
  }

  /**
   * Load corrections from YAML file or database
   */
  private async loadCorrections(): Promise<void> {
    // Try YAML file first
    const yamlPath = this.config.correctionsPath!;
    if (existsSync(yamlPath)) {
      try {
        const content = readFileSync(yamlPath, 'utf-8');
        const data = parse(content) as { corrections?: Correction[] };
        if (data.corrections) {
          this.corrections = data.corrections.map((c) => ({
            id: c.id || `corr-${Date.now()}`,
            flaggedAt: c.flaggedAt || new Date().toISOString(),
            issue: c.issue,
            correction: c.correction,
            appliesTo: c.appliesTo || '*',
          }));
          return;
        }
      } catch {
        // Fall through to database
      }
    }

    // Try database
    const dbPath = this.config.dbPath!;
    if (existsSync(dbPath)) {
      try {
        const dbCorrections = await loadCorrectionsFromDB(dbPath);
        this.corrections = dbCorrections.map((c) => ({
          id: c.id,
          flaggedAt: new Date().toISOString(),
          issue: c.issue,
          correction: c.correction,
          appliesTo: c.appliesTo || '*',
        }));
      } catch {
        // Ignore errors
      }
    }
  }

  /**
   * Get soul context for a specific zone or file path
   */
  getSoulContext(zoneOrPath?: string): SoulContext {
    const defaultTensions = {
      playfulness: 50,
      weight: 50,
      density: 50,
      speed: 50,
    };

    // Determine zone from path
    let zone = 'default';
    let material: 'glass' | 'clay' | 'machinery' = 'clay';

    if (this.sigilConfig?.zones && zoneOrPath) {
      for (const z of this.sigilConfig.zones) {
        // Check if zoneOrPath matches zone name
        if (z.name === zoneOrPath) {
          zone = z.name;
          material = z.material as 'glass' | 'clay' | 'machinery';
          break;
        }

        // Check if zoneOrPath matches any glob patterns
        for (const pattern of z.paths) {
          if (this.matchGlob(zoneOrPath, pattern)) {
            zone = z.name;
            material = z.material as 'glass' | 'clay' | 'machinery';
            break;
          }
        }
      }
    }

    // Filter corrections for this zone
    const relevantCorrections = this.corrections.filter((c) => {
      if (c.appliesTo === '*') return true;
      if (!zoneOrPath) return true;
      return this.matchGlob(zoneOrPath, c.appliesTo);
    });

    return {
      material,
      zone,
      tensions: this.tensions || defaultTensions,
      corrections: relevantCorrections,
    };
  }

  /**
   * Simple glob matching (supports ** and *)
   */
  private matchGlob(path: string, pattern: string): boolean {
    // Convert glob to regex
    const regexPattern = pattern
      .replace(/\*\*/g, '___DOUBLE_STAR___')
      .replace(/\*/g, '[^/]*')
      .replace(/___DOUBLE_STAR___/g, '.*');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  /**
   * Get all zones
   */
  getZones(): Array<{ name: string; material: string; paths: string[] }> {
    return this.sigilConfig?.zones || [];
  }

  /**
   * Get current tensions
   */
  getTensions(): TensionState | null {
    return this.tensions;
  }

  /**
   * Get all corrections
   */
  getCorrections(): Correction[] {
    return this.corrections;
  }

  /**
   * Get Sigil configuration
   */
  getConfig(): SigilConfig | null {
    return this.sigilConfig;
  }
}
