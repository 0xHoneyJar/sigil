/**
 * sigil init
 *
 * Initialize Soul Engine in current project.
 * Creates: .sigilrc.yaml, .sigil/sigil.db, sigil-workbench/
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { initDatabase } from '../../lib/db.js';
import { DEFAULT_CONFIG, writeConfig } from '../../lib/config.js';
import { generateClaudeContext } from '../../lib/claude.js';

interface InitOptions {
  force?: boolean;
}

export async function initCommand(options: InitOptions) {
  const cwd = process.cwd();
  const spinner = ora('Initializing Sigil Soul Engine...').start();

  try {
    // Check for existing setup
    const setupMarker = join(cwd, '.sigil-setup-complete');
    if (existsSync(setupMarker) && !options.force) {
      spinner.fail('Sigil already initialized. Use --force to reinitialize.');
      return;
    }

    // Step 1: Create .sigilrc.yaml
    spinner.text = 'Creating configuration...';
    const configPath = join(cwd, '.sigilrc.yaml');
    writeConfig(configPath, DEFAULT_CONFIG);

    // Step 2: Create .sigil directory and database
    spinner.text = 'Setting up database...';
    const sigilDir = join(cwd, '.sigil');
    if (!existsSync(sigilDir)) {
      mkdirSync(sigilDir, { recursive: true });
    }

    const dbPath = join(sigilDir, 'sigil.db');
    await initDatabase(dbPath);

    // Step 3: Create corrections.yaml
    const correctionsPath = join(sigilDir, 'corrections.yaml');
    if (!existsSync(correctionsPath)) {
      writeFileSync(
        correctionsPath,
        `# Local learning from human overrides
corrections: []
`
      );
    }

    // Step 4: Create sigil-workbench directory
    spinner.text = 'Scaffolding Workbench...';
    const workbenchDir = join(cwd, 'sigil-workbench');
    if (!existsSync(workbenchDir)) {
      mkdirSync(workbenchDir, { recursive: true });

      // Create minimal workbench scaffold
      writeFileSync(
        join(workbenchDir, 'package.json'),
        JSON.stringify(
          {
            name: 'sigil-workbench',
            version: '0.1.0',
            private: true,
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'vite build',
              preview: 'vite preview',
            },
            dependencies: {
              '@sigil/soul-engine': '^0.4.0',
              react: '^18.2.0',
              'react-dom': '^18.2.0',
            },
            devDependencies: {
              '@vitejs/plugin-react': '^4.2.0',
              vite: '^5.0.0',
            },
          },
          null,
          2
        )
      );

      writeFileSync(
        join(workbenchDir, 'vite.config.ts'),
        `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3333,
  },
  optimizeDeps: {
    exclude: ['sql.js'],
  },
});
`
      );

      writeFileSync(
        join(workbenchDir, 'index.html'),
        `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sigil Workbench</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
      );

      // Create src directory with main entry
      const workbenchSrc = join(workbenchDir, 'src');
      mkdirSync(workbenchSrc, { recursive: true });

      writeFileSync(
        join(workbenchSrc, 'main.tsx'),
        `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`
      );

      writeFileSync(
        join(workbenchSrc, 'App.tsx'),
        `import React from 'react';

export default function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Sigil Workbench</h1>
      <p>Run <code>npm install</code> then <code>npm run dev</code> to start.</p>
      <p>Full Workbench implementation coming in Sprint 12.</p>
    </div>
  );
}
`
      );
    }

    // Step 5: Generate CLAUDE.md
    spinner.text = 'Generating Claude context...';
    const claudePath = join(cwd, 'CLAUDE.md');
    const claudeContent = generateClaudeContext(DEFAULT_CONFIG);
    writeFileSync(claudePath, claudeContent);

    // Step 6: Create setup marker
    writeFileSync(setupMarker, new Date().toISOString());

    spinner.succeed(chalk.green('Sigil Soul Engine initialized!'));

    console.log('');
    console.log(chalk.cyan('Created:'));
    console.log(`  ${chalk.dim('-')} .sigilrc.yaml      ${chalk.dim('Configuration')}`);
    console.log(`  ${chalk.dim('-')} .sigil/sigil.db    ${chalk.dim('State database')}`);
    console.log(`  ${chalk.dim('-')} sigil-workbench/   ${chalk.dim('Workbench app')}`);
    console.log(`  ${chalk.dim('-')} CLAUDE.md          ${chalk.dim('AI context')}`);
    console.log('');
    console.log(chalk.yellow('Next steps:'));
    console.log(`  1. Run ${chalk.cyan('sigil mount')} to detect zones`);
    console.log(`  2. Run ${chalk.cyan('cd sigil-workbench && npm install')}`);
    console.log(`  3. Run ${chalk.cyan('sigil workbench')} to open Workbench`);
  } catch (error) {
    spinner.fail(chalk.red('Initialization failed'));
    console.error(error);
    process.exit(1);
  }
}
