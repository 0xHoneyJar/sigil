#!/usr/bin/env node

/**
 * Sigil Soul Engine CLI
 *
 * Commands:
 * - sigil init     Initialize Soul Engine in project
 * - sigil mount    Mount onto existing project
 * - sigil sync     Sync tensions to CLAUDE.md
 * - sigil workbench Open Workbench app
 */

import('../dist/cli/index.js')
  .then((cli) => cli.run())
  .catch((err) => {
    console.error('Failed to load Sigil CLI:', err.message);
    process.exit(1);
  });
