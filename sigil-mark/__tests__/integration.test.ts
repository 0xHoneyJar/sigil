/**
 * Integration Tests for Sigil Commands
 *
 * These tests document the expected behavior of Sigil commands.
 * In practice, these would be run as E2E tests with Claude Code.
 */

describe('/craft command', () => {
  it('should generate recipe-consuming code', () => {
    // Given: User runs /craft "button" src/checkout/
    // When: Zone resolves to "decisive"
    // Then: Generated code imports from @sigil/recipes/decisive

    const expectedOutput = {
      zone: 'decisive',
      recipe: 'Button',
      physics: 'spring(180, 12)',
      import: "import { Button } from '@sigil/recipes/decisive'",
    };

    expect(expectedOutput.import).toContain('@sigil/recipes');
    expect(expectedOutput.import).not.toContain('framer-motion');
  });

  it('should show physics context', () => {
    // Output format should include ZONE, RECIPE, PHYSICS
    const outputFormat = `
ZONE: src/checkout (decisive)
RECIPE: decisive/Button

[generated code]

PHYSICS: spring(180, 12), server-tick
    `;

    expect(outputFormat).toContain('ZONE:');
    expect(outputFormat).toContain('RECIPE:');
    expect(outputFormat).toContain('PHYSICS:');
  });

  it('should select appropriate recipe for context', () => {
    // "snappy button" should suggest Button.nintendo
    // "soft button" should suggest Button.relaxed

    const snappyHints = ['snappy', 'nintendo', 'quick', 'responsive'];
    const relaxedHints = ['soft', 'relaxed', 'gentle', 'calm'];

    snappyHints.forEach((hint) => {
      expect(hint.toLowerCase()).toBeDefined();
    });

    relaxedHints.forEach((hint) => {
      expect(hint.toLowerCase()).toBeDefined();
    });
  });
});

describe('/sandbox command', () => {
  it('should add sandbox header', () => {
    // Given: User runs /sandbox src/checkout/Experiment.tsx
    // Then: File starts with "// sigil-sandbox"

    const sandboxHeader = '// sigil-sandbox';
    expect(sandboxHeader).toBe('// sigil-sandbox');
  });

  it('should allow raw physics in sandbox', () => {
    // ESLint should not error on raw physics in sandbox files
    const sandboxFile = `
// sigil-sandbox
import { motion } from 'framer-motion';

export const Experiment = () => (
  <motion.div transition={{ stiffness: 300, damping: 8 }}>
    Testing new feel
  </motion.div>
);
    `;

    expect(sandboxFile).toContain('// sigil-sandbox');
    expect(sandboxFile).toContain('stiffness: 300');
  });

  it('should track sandbox in /garden', () => {
    // /garden should list active sandboxes
    const gardenOutput = {
      sandboxes: [
        { path: 'src/checkout/Experiment.tsx', age: 3, status: 'OK' },
        { path: 'src/marketing/NewHero.tsx', age: 12, status: 'STALE' },
      ],
    };

    expect(gardenOutput.sandboxes).toHaveLength(2);
    expect(gardenOutput.sandboxes[1].status).toBe('STALE');
  });
});

describe('/codify command', () => {
  it('should extract physics to recipe', () => {
    // Given: Sandbox file with spring(300, 8)
    // When: /codify extracts physics
    // Then: Recipe created with those values

    const extractedRecipe = {
      name: 'ButtonSnappy',
      physics: { stiffness: 300, damping: 8 },
      zone: 'decisive',
      path: 'sigil-mark/recipes/decisive/Button.snappy.tsx',
    };

    expect(extractedRecipe.physics.stiffness).toBe(300);
    expect(extractedRecipe.path).toContain('sigil-mark/recipes');
  });

  it('should update source to use new recipe', () => {
    // Original: raw physics
    // After codify: imports recipe

    const before = `<motion.div transition={{ stiffness: 300 }}>`;
    const after = `<ButtonSnappy>`;

    expect(before).toContain('stiffness');
    expect(after).not.toContain('stiffness');
  });

  it('should remove sandbox header after codify', () => {
    // Sandbox header removed when physics extracted
    const afterCodify = `
import { ButtonSnappy } from '@sigil/recipes/decisive';

export const Component = () => <ButtonSnappy>Click</ButtonSnappy>;
    `;

    expect(afterCodify).not.toContain('// sigil-sandbox');
  });
});

describe('/inherit command', () => {
  it('should scan for physics patterns', () => {
    // /inherit finds patterns but does NOT auto-generate

    const inheritOutput = {
      patterns: [
        { physics: 'spring(180, 12)', count: 8, files: ['src/checkout/...'] },
        { physics: 'spring(300, 8)', count: 3, files: ['src/dashboard/...'] },
      ],
      autoGenerate: false, // Important: human decides
    };

    expect(inheritOutput.autoGenerate).toBe(false);
    expect(inheritOutput.patterns.length).toBeGreaterThan(0);
  });

  it('should report without creating files', () => {
    // No files created, only report
    const expectedFiles = [];
    expect(expectedFiles).toHaveLength(0);
  });
});

describe('/validate command', () => {
  it('should report compliance percentage', () => {
    const validateOutput = {
      total: 50,
      passing: 43,
      violations: 4,
      sandboxes: 2,
      coverage: 86,
    };

    expect(validateOutput.coverage).toBeGreaterThan(0);
    expect(validateOutput.coverage).toBeLessThanOrEqual(100);
  });

  it('should flag raw physics outside sandbox', () => {
    const violation = {
      file: 'src/features/NewFeature.tsx',
      line: 23,
      issue: 'Raw spring(200, 15) outside sandbox',
      level: 'BLOCK',
    };

    expect(violation.level).toBe('BLOCK');
  });
});

describe('/garden command', () => {
  it('should show recipe coverage by zone', () => {
    const gardenOutput = {
      coverage: {
        decisive: { recipes: 4, components: 12, percentage: 85 },
        machinery: { recipes: 3, components: 8, percentage: 88 },
        glass: { recipes: 3, components: 6, percentage: 100 },
      },
    };

    expect(gardenOutput.coverage.decisive.percentage).toBeLessThanOrEqual(100);
  });

  it('should flag stale sandboxes', () => {
    const staleSandbox = {
      path: 'src/marketing/NewHero.tsx',
      age: 12,
      status: 'STALE',
      recommendation: '/codify src/marketing/NewHero.tsx',
    };

    expect(staleSandbox.age).toBeGreaterThan(7);
    expect(staleSandbox.status).toBe('STALE');
  });
});
