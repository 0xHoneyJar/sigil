/**
 * Workbench Tests
 *
 * Tests for Soul Binder, Claude Generator, Paper Cut Tracker,
 * Three-to-One Validator, and Founder Mode Auditor.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateClaudeContext } from './claudeGenerator.js';
import { PaperCutTracker } from './PaperCutTracker.js';
import { ThreeToOneValidator } from './ThreeToOneValidator.js';
import { FounderModeAuditor } from './FounderModeAuditor.js';

// ============ Claude Generator Tests ============

describe('Claude Context Generator', () => {
  it('generates CLAUDE.md content with default values', () => {
    const content = generateClaudeContext({
      projectRoot: '/test/project',
    });

    expect(content).toContain('# Sigil Soul Engine Context');
    expect(content).toContain('Material Physics');
    expect(content).toContain('Current Tensions');
    expect(content).toContain('Sync Strategy Rules');
  });

  it('includes tension values in output', () => {
    const content = generateClaudeContext({
      projectRoot: '/test/project',
      tensions: {
        playfulness: 80,
        weight: 60,
        density: 40,
        speed: 70,
      },
    });

    expect(content).toContain('Playfulness | 80');
    expect(content).toContain('Weight | 60');
    expect(content).toContain('Density | 40');
    expect(content).toContain('Speed | 70');
  });

  it('includes zone configuration', () => {
    const content = generateClaudeContext({
      projectRoot: '/test/project',
      config: {
        version: '0.4',
        zones: [
          {
            name: 'critical',
            material: 'clay',
            sync: 'server_tick',
            paths: ['src/features/checkout/**'],
          },
        ],
        tensions: {
          current: { playfulness: 50, weight: 50, density: 50, speed: 50 },
          presets: [],
        },
        gardener: { paper_cut_threshold: 10, three_to_one_rule: true, enforcement: 'advisory' },
        founder_mode: { pair_required: true, invariant_protection: [] },
      },
    });

    expect(content).toContain('critical');
    expect(content).toContain('Clay');
    expect(content).toContain('server_tick');
  });

  it('includes corrections section', () => {
    const content = generateClaudeContext({
      projectRoot: '/test/project',
      corrections: [
        {
          id: 'corr-1',
          flaggedAt: '2026-01-01',
          issue: 'Used spinner in checkout',
          correction: 'Use skeleton loading instead',
          appliesTo: '*',
        },
      ],
    });

    expect(content).toContain('Used spinner in checkout');
    expect(content).toContain('Use skeleton loading instead');
  });

  it('includes CSS variables section', () => {
    const content = generateClaudeContext({
      projectRoot: '/test/project',
      tensions: {
        playfulness: 50,
        weight: 50,
        density: 50,
        speed: 50,
      },
    });

    expect(content).toContain('--sigil-border-radius');
    expect(content).toContain('--sigil-shadow-opacity');
    expect(content).toContain('--sigil-transition-duration');
  });
});

// ============ Paper Cut Tracker Tests ============

describe('PaperCutTracker', () => {
  let tracker: PaperCutTracker;

  beforeEach(() => {
    tracker = new PaperCutTracker({ dbPath: '/test/sigil.db' });
  });

  it('adds new paper cuts', () => {
    const cut = tracker.add({
      category: 'accessibility',
      description: 'Missing alt text on image',
      severity: 'medium',
    });

    expect(cut.id).toBeDefined();
    expect(cut.status).toBe('open');
    expect(cut.createdAt).toBeDefined();
    expect(tracker.getOpenCount()).toBe(1);
  });

  it('marks paper cuts as fixed', () => {
    const cut = tracker.add({
      category: 'ux',
      description: 'Button too small',
      severity: 'low',
    });

    const fixed = tracker.fix(cut.id);

    expect(fixed).toBe(true);
    expect(tracker.getOpenCount()).toBe(0);
    expect(tracker.getFixed().length).toBe(1);
  });

  it('filters by severity', () => {
    tracker.add({ category: 'a11y', description: 'Low issue', severity: 'low' });
    tracker.add({ category: 'a11y', description: 'High issue', severity: 'high' });
    tracker.add({ category: 'ux', description: 'Another high', severity: 'high' });

    const highCuts = tracker.getBySeverity('high');
    expect(highCuts.length).toBe(2);
  });

  it('returns priority paper cuts', () => {
    tracker.add({ category: 'a11y', description: 'Low issue', severity: 'low' });
    tracker.add({ category: 'a11y', description: 'High issue', severity: 'high' });
    tracker.add({ category: 'a11y', description: 'Medium issue', severity: 'medium' });

    const priority = tracker.getPriority(2);

    expect(priority.length).toBe(2);
    expect(priority[0].severity).toBe('high');
  });

  it('provides summary statistics', () => {
    tracker.add({ category: 'a11y', description: 'Issue 1', severity: 'high' });
    tracker.add({ category: 'ux', description: 'Issue 2', severity: 'medium' });
    const cut3 = tracker.add({ category: 'a11y', description: 'Issue 3', severity: 'low' });
    tracker.fix(cut3.id);

    const summary = tracker.getSummary();

    expect(summary.total).toBe(3);
    expect(summary.open).toBe(2);
    expect(summary.fixed).toBe(1);
    expect(summary.byCategory['a11y']).toBe(1);
    expect(summary.bySeverity.high).toBe(1);
  });

  it('checks threshold exceeded', () => {
    // Default threshold is 10
    for (let i = 0; i < 11; i++) {
      tracker.add({ category: 'test', description: `Issue ${i}`, severity: 'low' });
    }

    expect(tracker.isThresholdExceeded()).toBe(true);
  });
});

// ============ Three-to-One Validator Tests ============

describe('ThreeToOneValidator', () => {
  let validator: ThreeToOneValidator;

  beforeEach(() => {
    validator = new ThreeToOneValidator({
      ratio: 3,
      enforcement: 'advisory',
      dbPath: '/test/sigil.db',
    });
  });

  it('registers new features', () => {
    const feature = validator.registerFeature('Dark Mode');

    expect(feature.id).toBeDefined();
    expect(feature.name).toBe('Dark Mode');
    expect(feature.fixesRequired).toBe(3);
    expect(feature.fixesCompleted).toHaveLength(0);
  });

  it('validates incomplete features', () => {
    const feature = validator.registerFeature('New Feature');
    const result = validator.validateFeature(feature.id);

    expect(result.valid).toBe(true); // Advisory mode
    expect(result.deficit).toBe(3);
    expect(result.message).toContain('Advisory');
  });

  it('records fixes against features', () => {
    const feature = validator.registerFeature('Feature A');
    const tracker = validator.getPaperCutTracker();
    const cut = tracker.add({
      category: 'ux',
      description: 'Fix this',
      severity: 'low',
    });

    const recorded = validator.recordFix(feature.id, cut.id);
    const result = validator.validateFeature(feature.id);

    expect(recorded).toBe(true);
    expect(result.fixesCompleted).toBe(1);
    expect(result.deficit).toBe(2);
  });

  it('validates complete features', () => {
    const feature = validator.registerFeature('Complete Feature');
    const tracker = validator.getPaperCutTracker();

    // Add and fix 3 paper cuts
    for (let i = 0; i < 3; i++) {
      const cut = tracker.add({
        category: 'ux',
        description: `Fix ${i}`,
        severity: 'low',
      });
      validator.recordFix(feature.id, cut.id);
    }

    const result = validator.validateFeature(feature.id);

    expect(result.valid).toBe(true);
    expect(result.deficit).toBe(0);
    expect(result.message).toContain('Ready to ship');
  });

  it('calculates overall ratio compliance', () => {
    // Register 2 features
    const f1 = validator.registerFeature('Feature 1');
    const f2 = validator.registerFeature('Feature 2');

    // Fix 4 paper cuts (should be 6 for full compliance)
    const tracker = validator.getPaperCutTracker();
    for (let i = 0; i < 4; i++) {
      const cut = tracker.add({
        category: 'test',
        description: `Fix ${i}`,
        severity: 'low',
      });
      validator.recordFix(i < 2 ? f1.id : f2.id, cut.id);
    }

    const compliance = validator.getRatioCompliance();

    expect(compliance.totalFeatures).toBe(2);
    expect(compliance.totalFixesRequired).toBe(6);
    expect(compliance.totalFixesCompleted).toBe(4);
    expect(compliance.ratio).toBe(2);
    expect(compliance.compliant).toBe(false);
  });

  it('blocks in strict mode', () => {
    const strictValidator = new ThreeToOneValidator({
      ratio: 3,
      enforcement: 'strict',
      dbPath: '/test/sigil.db',
    });

    const feature = strictValidator.registerFeature('Strict Feature');
    const result = strictValidator.validateFeature(feature.id);

    expect(result.valid).toBe(false);
    expect(result.message).toContain('Blocked');
  });
});

// ============ Founder Mode Auditor Tests ============

describe('FounderModeAuditor', () => {
  let auditor: FounderModeAuditor;

  beforeEach(() => {
    auditor = new FounderModeAuditor({
      projectRoot: '/test/project',
      pairRequired: true,
      invariantProtection: ['accessibility', 'security'],
    });
  });

  it('blocks protected invariants', () => {
    const blockCheck = auditor.isBlocked({
      action: 'override',
      target: 'accessibility.contrast',
    });

    expect(blockCheck.blocked).toBe(true);
    expect(blockCheck.reason).toContain('accessibility');
  });

  it('requires pair confirmation', () => {
    const requiresPair = auditor.requiresPairConfirmation({
      action: 'override',
      target: 'color.primary',
    });

    expect(requiresPair).toBe(true);
  });

  it('requests override with pair requirement', () => {
    const result = auditor.requestOverride(
      {
        action: 'change',
        target: 'typography.scale',
        rationale: 'Need larger fonts for mobile',
      },
      'alice@example.com'
    );

    expect(result.success).toBe(true);
    expect(result.requiresSecondOwner).toBe(true);
    expect(result.recordId).toBeDefined();
    expect(result.message).toContain('Waiting for second');
  });

  it('confirms override with second owner', () => {
    const request = auditor.requestOverride(
      { action: 'change', target: 'motion.speed' },
      'alice@example.com'
    );

    const confirm = auditor.confirmOverride(
      request.recordId!,
      'bob@example.com'
    );

    expect(confirm.success).toBe(true);
    expect(auditor.getApprovedOverrides().length).toBe(1);
  });

  it('rejects same owner as second confirmation', () => {
    const request = auditor.requestOverride(
      { action: 'change', target: 'motion.speed' },
      'alice@example.com'
    );

    const confirm = auditor.confirmOverride(
      request.recordId!,
      'alice@example.com'
    );

    expect(confirm.success).toBe(false);
    expect(confirm.message).toContain('TWO different');
  });

  it('tracks pending requests', () => {
    auditor.requestOverride(
      { action: 'change', target: 'color.accent' },
      'user1@example.com'
    );
    auditor.requestOverride(
      { action: 'update', target: 'spacing.grid' },
      'user2@example.com'
    );

    expect(auditor.getPendingRequests().length).toBe(2);
  });

  it('provides audit summary', () => {
    const req1 = auditor.requestOverride(
      { action: 'change', target: 'target1' },
      'user1@example.com'
    );
    auditor.confirmOverride(req1.recordId!, 'user2@example.com');

    auditor.requestOverride(
      { action: 'update', target: 'target2' },
      'user3@example.com'
    );

    const summary = auditor.getSummary();

    expect(summary.total).toBe(2);
    expect(summary.approved).toBe(1);
    expect(summary.pending).toBe(1);
    expect(summary.byAction['change']).toBe(1);
    expect(summary.byAction['update']).toBe(1);
  });
});

// ============ Integration Tests ============

describe('Workbench Integration', () => {
  it('generates context with all components', () => {
    const tracker = new PaperCutTracker({ dbPath: '/test/sigil.db' });
    tracker.add({
      category: 'ux',
      description: 'Button alignment',
      severity: 'low',
    });

    const content = generateClaudeContext({
      projectRoot: '/test/project',
      tensions: {
        playfulness: 70,
        weight: 60,
        density: 40,
        speed: 80,
      },
      corrections: [
        {
          id: 'c1',
          flaggedAt: '2026-01-01',
          issue: 'Wrong animation',
          correction: 'Use spring physics',
          appliesTo: '*',
        },
      ],
    });

    // Should have all sections
    expect(content).toContain('Sigil Soul Engine Context');
    expect(content).toContain('Playfulness | 70');
    expect(content).toContain('Wrong animation');
    expect(content).toContain('--sigil-border-radius');
  });
});
