/**
 * sigil sync
 *
 * Sync current state to CLAUDE.md.
 * Regenerates the Claude context file with current tensions and corrections.
 */

import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig } from '../../lib/config.js';
import { generateClaudeContext } from '../../lib/claude.js';
import { loadTensionsFromDB } from '../../lib/db.js';

export async function syncCommand() {
  const cwd = process.cwd();
  const spinner = ora('Syncing to CLAUDE.md...').start();

  try {
    // Check for existing setup
    const configPath = join(cwd, '.sigilrc.yaml');
    if (!existsSync(configPath)) {
      spinner.fail('No .sigilrc.yaml found. Run `sigil init` first.');
      return;
    }

    // Load config
    const config = loadConfig(configPath);

    // Load current tensions from database
    const dbPath = join(cwd, '.sigil', 'sigil.db');
    if (existsSync(dbPath)) {
      try {
        const tensions = await loadTensionsFromDB(dbPath);
        if (tensions) {
          config.tensions = {
            ...config.tensions,
            current: tensions,
          };
        }
      } catch {
        // Use default tensions if DB read fails
      }
    }

    // Generate CLAUDE.md
    spinner.text = 'Generating Claude context...';
    const claudePath = join(cwd, 'CLAUDE.md');
    const claudeContent = generateClaudeContext(config);
    writeFileSync(claudePath, claudeContent);

    spinner.succeed(chalk.green('CLAUDE.md synced!'));

    console.log('');
    console.log(chalk.dim('Updated:'));
    console.log(`  ${chalk.dim('-')} Material physics`);
    console.log(`  ${chalk.dim('-')} Current tensions`);
    console.log(`  ${chalk.dim('-')} Zone configuration`);
    console.log(`  ${chalk.dim('-')} Local corrections`);
  } catch (error) {
    spinner.fail(chalk.red('Sync failed'));
    console.error(error);
    process.exit(1);
  }
}
