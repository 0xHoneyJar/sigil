/**
 * Sigil CLI
 *
 * Command-line interface for Soul Engine.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { mountCommand } from './commands/mount.js';
import { syncCommand } from './commands/sync.js';
import { workbenchCommand } from './commands/workbench.js';
import { VERSION } from '../index.js';

const program = new Command();

program
  .name('sigil')
  .description('Sigil Soul Engine CLI - Design context framework')
  .version(VERSION);

program
  .command('init')
  .description('Initialize Soul Engine in current project')
  .option('-f, --force', 'Overwrite existing configuration')
  .action(initCommand);

program
  .command('mount')
  .description('Mount Soul Engine onto existing project')
  .option('-d, --detect', 'Auto-detect zones from file structure')
  .action(mountCommand);

program
  .command('sync')
  .description('Sync current state to CLAUDE.md')
  .action(syncCommand);

program
  .command('workbench')
  .description('Open Sigil Workbench app')
  .option('-p, --port <port>', 'Port to run on', '3333')
  .action(workbenchCommand);

export function run() {
  program.parse();
}

// Also export for testing
export { program };
