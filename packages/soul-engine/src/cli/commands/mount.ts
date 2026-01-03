/**
 * sigil mount
 *
 * Mount Soul Engine onto existing project.
 * Detects zones from file structure and updates configuration.
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig, writeConfig, type ZoneConfig } from '../../lib/config.js';
import { generateClaudeContext } from '../../lib/claude.js';
import { writeFileSync } from 'fs';

interface MountOptions {
  detect?: boolean;
}

// Common directory patterns for zone detection
const ZONE_PATTERNS: Record<string, { material: 'glass' | 'clay' | 'machinery'; sync: string }> = {
  checkout: { material: 'clay', sync: 'server_tick' },
  payment: { material: 'clay', sync: 'server_tick' },
  auth: { material: 'clay', sync: 'server_tick' },
  login: { material: 'clay', sync: 'server_tick' },
  signup: { material: 'clay', sync: 'server_tick' },
  trade: { material: 'clay', sync: 'server_tick' },
  wallet: { material: 'clay', sync: 'server_tick' },
  dashboard: { material: 'machinery', sync: 'lww' },
  admin: { material: 'machinery', sync: 'lww' },
  settings: { material: 'machinery', sync: 'lww' },
  explore: { material: 'glass', sync: 'lww' },
  discover: { material: 'glass', sync: 'lww' },
  browse: { material: 'glass', sync: 'lww' },
  marketing: { material: 'clay', sync: 'none' },
  landing: { material: 'clay', sync: 'none' },
};

function detectZones(cwd: string): ZoneConfig[] {
  const zones: ZoneConfig[] = [];
  const srcDirs = ['src', 'app', 'pages', 'components'];

  for (const srcDir of srcDirs) {
    const srcPath = join(cwd, srcDir);
    if (!existsSync(srcPath)) continue;

    // Check for features/pages directories
    const featureDirs = ['features', 'pages', 'routes', 'modules'];
    for (const featureDir of featureDirs) {
      const featurePath = join(srcPath, featureDir);
      if (!existsSync(featurePath)) continue;

      try {
        const entries = readdirSync(featurePath);
        for (const entry of entries) {
          const entryPath = join(featurePath, entry);
          if (!statSync(entryPath).isDirectory()) continue;

          const lowerEntry = entry.toLowerCase();
          for (const [pattern, config] of Object.entries(ZONE_PATTERNS)) {
            if (lowerEntry.includes(pattern)) {
              const relativePath = relative(cwd, entryPath);
              zones.push({
                name: entry,
                material: config.material,
                sync: config.sync,
                paths: [`${relativePath}/**`],
              });
              break;
            }
          }
        }
      } catch {
        // Skip inaccessible directories
      }
    }
  }

  return zones;
}

export async function mountCommand(options: MountOptions) {
  const cwd = process.cwd();
  const spinner = ora('Mounting Soul Engine...').start();

  try {
    // Check for existing setup
    const configPath = join(cwd, '.sigilrc.yaml');
    if (!existsSync(configPath)) {
      spinner.fail('No .sigilrc.yaml found. Run `sigil init` first.');
      return;
    }

    // Load existing config
    const config = loadConfig(configPath);

    // Detect zones
    spinner.text = 'Detecting zones...';
    const detectedZones = detectZones(cwd);

    if (detectedZones.length === 0) {
      spinner.info('No zones auto-detected. Add zones manually to .sigilrc.yaml');
      return;
    }

    // Merge with existing zones (don't overwrite)
    const existingPaths = new Set(
      config.zones.flatMap((z) => z.paths)
    );
    const newZones = detectedZones.filter(
      (z) => !z.paths.some((p) => existingPaths.has(p))
    );

    if (newZones.length === 0) {
      spinner.info('All detected zones already configured.');
      return;
    }

    // Update config
    config.zones = [...config.zones, ...newZones];
    writeConfig(configPath, config);

    // Regenerate CLAUDE.md
    spinner.text = 'Updating Claude context...';
    const claudePath = join(cwd, 'CLAUDE.md');
    const claudeContent = generateClaudeContext(config);
    writeFileSync(claudePath, claudeContent);

    spinner.succeed(chalk.green(`Mounted ${newZones.length} zone(s)!`));

    console.log('');
    console.log(chalk.cyan('Detected zones:'));
    for (const zone of newZones) {
      console.log(
        `  ${chalk.dim('-')} ${chalk.bold(zone.name)}: ${zone.material} + ${zone.sync}`
      );
      for (const path of zone.paths) {
        console.log(`      ${chalk.dim(path)}`);
      }
    }
    console.log('');
    console.log(chalk.yellow('Review zones in .sigilrc.yaml and adjust as needed.'));
  } catch (error) {
    spinner.fail(chalk.red('Mount failed'));
    console.error(error);
    process.exit(1);
  }
}
