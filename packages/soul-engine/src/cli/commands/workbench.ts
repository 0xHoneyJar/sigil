/**
 * sigil workbench
 *
 * Open Sigil Workbench app.
 * Starts the Vite dev server for the workbench.
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

interface WorkbenchOptions {
  port?: string;
}

export async function workbenchCommand(options: WorkbenchOptions) {
  const cwd = process.cwd();
  const port = options.port || '3333';
  const spinner = ora('Starting Workbench...').start();

  try {
    // Check for workbench directory
    const workbenchDir = join(cwd, 'sigil-workbench');
    if (!existsSync(workbenchDir)) {
      spinner.fail('No sigil-workbench/ found. Run `sigil init` first.');
      return;
    }

    // Check for node_modules
    const nodeModules = join(workbenchDir, 'node_modules');
    if (!existsSync(nodeModules)) {
      spinner.fail(
        'Dependencies not installed. Run `cd sigil-workbench && npm install` first.'
      );
      return;
    }

    spinner.succeed(chalk.green('Starting Workbench...'));
    console.log('');
    console.log(chalk.cyan(`  Workbench: http://localhost:${port}`));
    console.log(chalk.dim('  Press Ctrl+C to stop'));
    console.log('');

    // Start Vite dev server
    const viteProcess = spawn('npm', ['run', 'dev', '--', '--port', port], {
      cwd: workbenchDir,
      stdio: 'inherit',
      shell: true,
    });

    viteProcess.on('error', (error) => {
      console.error(chalk.red('Failed to start Workbench:'), error.message);
      process.exit(1);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      viteProcess.kill('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      viteProcess.kill('SIGTERM');
      process.exit(0);
    });
  } catch (error) {
    spinner.fail(chalk.red('Workbench failed to start'));
    console.error(error);
    process.exit(1);
  }
}
