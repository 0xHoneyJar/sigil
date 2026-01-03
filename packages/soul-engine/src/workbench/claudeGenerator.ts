/**
 * Claude Context Generator
 *
 * Generates CLAUDE.md content for AI context injection.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';
import type { SigilConfig } from '../lib/config.js';
import type { TensionState } from '../hooks/types.js';
import type { Correction } from './index.js';
import { MATERIALS } from '../material/index.js';

interface ClaudeContextOptions {
  projectRoot: string;
  config?: SigilConfig;
  tensions?: TensionState;
  corrections?: Correction[];
}

/**
 * Load corrections from YAML file
 */
function loadCorrectionsFromFile(correctionsPath: string): Correction[] {
  if (!existsSync(correctionsPath)) return [];

  try {
    const content = readFileSync(correctionsPath, 'utf-8');
    const data = parse(content) as { corrections?: Correction[] };
    return (data.corrections || []).map((c) => ({
      id: c.id || `corr-${Date.now()}`,
      flaggedAt: c.flaggedAt || new Date().toISOString(),
      issue: c.issue,
      correction: c.correction,
      appliesTo: c.appliesTo || '*',
    }));
  } catch {
    return [];
  }
}

/**
 * Generate CLAUDE.md content
 */
export function generateClaudeContext(options: ClaudeContextOptions): string {
  const { projectRoot, config, tensions, corrections = [] } = options;

  // Load config if not provided
  let sigilConfig = config;
  if (!sigilConfig) {
    const configPath = join(projectRoot, '.sigilrc.yaml');
    if (existsSync(configPath)) {
      try {
        const content = readFileSync(configPath, 'utf-8');
        sigilConfig = parse(content) as SigilConfig;
      } catch {
        // Use defaults
      }
    }
  }

  // Load tensions from config if not provided
  const tensionValues = tensions || sigilConfig?.tensions?.current || {
    playfulness: 50,
    weight: 50,
    density: 50,
    speed: 50,
  };

  // Load corrections if not provided
  let allCorrections = corrections;
  if (allCorrections.length === 0) {
    const correctionsPath = join(projectRoot, '.sigil', 'corrections.yaml');
    allCorrections = loadCorrectionsFromFile(correctionsPath);
  }

  // Determine active material from zones
  const materialCounts: Record<string, number> = { glass: 0, clay: 0, machinery: 0 };
  for (const zone of sigilConfig?.zones || []) {
    materialCounts[zone.material]++;
  }
  const activeMaterial = Object.entries(materialCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] || 'clay';

  // Generate zone configuration section
  const zoneSection = sigilConfig?.zones?.length
    ? sigilConfig.zones
        .map(
          (z) =>
            `- \`${z.name}\` -> ${capitalize(z.material)} + ${z.sync}: ${z.paths.join(', ')}`
        )
        .join('\n')
    : '_No zones configured._';

  // Generate corrections section
  const correctionsSection =
    allCorrections.length > 0
      ? allCorrections.map((c) => `- **${c.issue}**: ${c.correction}`).join('\n')
      : '_No corrections recorded yet._';

  // Get tension effect descriptions
  const playfulnessEffect =
    tensionValues.playfulness > 60
      ? 'Rounded curves, vibrant colors'
      : tensionValues.playfulness < 40
      ? 'Sharp edges, muted colors'
      : 'Balanced curves and color';

  const weightEffect =
    tensionValues.weight > 60
      ? 'Prominent shadows, bold fonts'
      : tensionValues.weight < 40
      ? 'Light shadows, thin fonts'
      : 'Moderate shadows and fonts';

  const densityEffect =
    tensionValues.density > 60
      ? 'Compact layout, smaller text'
      : tensionValues.density < 40
      ? 'Spacious layout, larger text'
      : 'Balanced spacing';

  const speedEffect =
    tensionValues.speed > 60
      ? 'Quick transitions (< 150ms)'
      : tensionValues.speed < 40
      ? 'Deliberate transitions (> 250ms)'
      : 'Moderate transitions';

  // Material description
  const materialDescription = MATERIALS[activeMaterial as keyof typeof MATERIALS] || '';

  return `# Sigil Soul Engine Context

This project uses Sigil v0.4 Soul Engine for design context.

## Material Physics

Active Material: **${capitalize(activeMaterial)}** (${materialDescription})

Materials define physics, not just styles:
- **Glass**: Light, translucent. Blur, refraction. For exploratory zones.
- **Clay**: Warm, tactile. Soft shadows, spring motion. For critical zones.
- **Machinery**: Instant, precise. Zero transitions. For command palettes.

## Current Tensions

| Axis | Value | Effect |
|------|-------|--------|
| Playfulness | ${tensionValues.playfulness} | ${playfulnessEffect} |
| Weight | ${tensionValues.weight} | ${weightEffect} |
| Density | ${tensionValues.density} | ${densityEffect} |
| Speed | ${tensionValues.speed} | ${speedEffect} |

## Zone Configuration

${zoneSection}

## Sync Strategy Rules

| Strategy | When | UI Rule |
|----------|------|---------|
| Server-Tick | Money, health, inventory | MUST show pending state |
| LWW | Preferences, toggles | Optimistic OK |
| CRDT | Text, comments | Show presence |

**CRITICAL**: Never use optimistic UI for server-tick data.

## Local Corrections

${correctionsSection}

## Commands

- \`/craft\` - Get design guidance with material + tension context
- \`/garden\` - Show paper cut analysis
- \`/approve\` - Human sign-off on patterns

## CSS Variables

The following CSS variables are controlled by tensions:

\`\`\`css
:root {
  /* Playfulness */
  --sigil-border-radius: ${Math.round(4 + tensionValues.playfulness * 0.12)}px;
  --sigil-color-saturation: ${Math.round(80 + tensionValues.playfulness * 0.2)}%;

  /* Weight */
  --sigil-shadow-opacity: ${(0.05 + tensionValues.weight * 0.001).toFixed(3)};
  --sigil-font-weight: ${tensionValues.weight > 60 ? '600' : '400'};

  /* Density */
  --sigil-spacing-unit: ${Math.round(8 - tensionValues.density * 0.02)}px;
  --sigil-gap: ${Math.round(24 - tensionValues.density * 0.12)}px;

  /* Speed */
  --sigil-transition-duration: ${Math.round(300 - tensionValues.speed * 2.8)}ms;
}
\`\`\`

---

*Generated by Sigil Soul Engine v0.4*
*Last updated: ${new Date().toISOString()}*
`;
}

/**
 * Write CLAUDE.md to project root
 */
export function writeClaudeContext(options: ClaudeContextOptions): void {
  const content = generateClaudeContext(options);
  const outputPath = join(options.projectRoot, 'CLAUDE.md');
  writeFileSync(outputPath, content, 'utf-8');
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
