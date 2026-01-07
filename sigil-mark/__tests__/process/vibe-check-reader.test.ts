/**
 * Sigil v2.6 — Vibe Check Reader Tests
 *
 * Tests for reading vibe checks, cooldown management, and response recording.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as path from 'path';
import * as fs from 'fs/promises';
import {
  readVibeChecks,
  getTriggerById,
  getEnabledTriggers,
  getTriggersForZone,
  getTriggersByType,
  createSessionState,
  isInCooldown,
  hasIntervalPassed,
  isSessionLimitReached,
  isDailyLimitReached,
  shouldTriggerSurvey,
  recordSurveyShown,
  recordSurveyResponse,
  formatTriggerSummary,
  formatVibeChecksSummary,
  DEFAULT_VIBE_CHECKS,
  DEFAULT_VIBE_CHECKS_PATH,
  type VibeChecks,
  type SurveyTrigger,
  type SessionState,
} from '../../process/vibe-check-reader';

// =============================================================================
// CONSTANTS
// =============================================================================

describe('Constants', () => {
  it('should export DEFAULT_VIBE_CHECKS_PATH', () => {
    expect(DEFAULT_VIBE_CHECKS_PATH).toBe('sigil-mark/surveys/vibe-checks.yaml');
  });

  it('should export DEFAULT_VIBE_CHECKS with correct structure', () => {
    expect(DEFAULT_VIBE_CHECKS).toEqual({
      version: '3.0.0',
      triggers: [],
      feedback: {
        destination: 'console',
        include_context: true,
        anonymize: true,
      },
      display: {
        position: 'bottom-right',
        delay_ms: 1000,
        auto_dismiss_ms: 0,
        show_dismiss: true,
        theme: 'system',
      },
      limits: {
        max_per_session: 2,
        max_per_day: 3,
        min_interval_minutes: 30,
      },
      behavioral_signals: [],
    });
  });
});

// =============================================================================
// READ OPERATIONS
// =============================================================================

describe('readVibeChecks', () => {
  it('should return default vibe checks for non-existent file', async () => {
    const result = await readVibeChecks('/non/existent/path.yaml');
    expect(result).toEqual(DEFAULT_VIBE_CHECKS);
  });

  it('should read and parse actual vibe-checks.yaml', async () => {
    const vibeChecksPath = path.join(process.cwd(), 'surveys/vibe-checks.yaml');
    const result = await readVibeChecks(vibeChecksPath);

    expect(result.version).toBe('3.0.0');
    expect(result.triggers.length).toBeGreaterThan(0);
  });

  it('should parse trigger definitions correctly', async () => {
    const vibeChecksPath = path.join(process.cwd(), 'surveys/vibe-checks.yaml');
    const result = await readVibeChecks(vibeChecksPath);

    const strategyTrigger = result.triggers.find((t) => t.id === 'strategy_change');
    expect(strategyTrigger).toBeDefined();
    expect(strategyTrigger?.question).toContain('confident');
    expect(strategyTrigger?.type).toBe('scale');
    expect(strategyTrigger?.cooldown_days).toBe(3);
  });

  it('should parse trigger options correctly', async () => {
    const vibeChecksPath = path.join(process.cwd(), 'surveys/vibe-checks.yaml');
    const result = await readVibeChecks(vibeChecksPath);

    const emojiTrigger = result.triggers.find((t) => t.type === 'emoji');
    expect(emojiTrigger).toBeDefined();
    expect(emojiTrigger?.options?.length).toBe(5);
    expect(emojiTrigger?.options?.[0].emoji).toBeDefined();
  });

  it('should parse feedback configuration', async () => {
    const vibeChecksPath = path.join(process.cwd(), 'surveys/vibe-checks.yaml');
    const result = await readVibeChecks(vibeChecksPath);

    expect(result.feedback.destination).toBe('console');
    expect(result.feedback.include_context).toBe(true);
    expect(result.feedback.anonymize).toBe(true);
  });

  it('should parse display configuration', async () => {
    const vibeChecksPath = path.join(process.cwd(), 'surveys/vibe-checks.yaml');
    const result = await readVibeChecks(vibeChecksPath);

    expect(result.display.position).toBe('bottom-right');
    expect(result.display.delay_ms).toBe(2000);
    expect(result.display.show_dismiss).toBe(true);
  });

  it('should parse limits configuration', async () => {
    const vibeChecksPath = path.join(process.cwd(), 'surveys/vibe-checks.yaml');
    const result = await readVibeChecks(vibeChecksPath);

    expect(result.limits.max_per_session).toBe(2);
    expect(result.limits.max_per_day).toBe(3);
    expect(result.limits.min_interval_minutes).toBe(30);
  });
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

describe('getTriggerById', () => {
  let vibeChecks: VibeChecks;

  beforeEach(async () => {
    const vibeChecksPath = path.join(process.cwd(), 'surveys/vibe-checks.yaml');
    vibeChecks = await readVibeChecks(vibeChecksPath);
  });

  it('should return trigger by ID', () => {
    const trigger = getTriggerById(vibeChecks, 'strategy_change');
    expect(trigger).toBeDefined();
    expect(trigger?.id).toBe('strategy_change');
  });

  it('should return undefined for unknown trigger', () => {
    const trigger = getTriggerById(vibeChecks, 'unknown');
    expect(trigger).toBeUndefined();
  });
});

describe('getEnabledTriggers', () => {
  it('should return only enabled triggers', async () => {
    const vibeChecksPath = path.join(process.cwd(), 'surveys/vibe-checks.yaml');
    const vibeChecks = await readVibeChecks(vibeChecksPath);

    const enabled = getEnabledTriggers(vibeChecks);
    expect(enabled.length).toBe(vibeChecks.triggers.length); // All should be enabled
    expect(enabled.every((t) => t.enabled)).toBe(true);
  });
});

describe('getTriggersForZone', () => {
  it('should return triggers for specific zone', async () => {
    const vibeChecksPath = path.join(process.cwd(), 'surveys/vibe-checks.yaml');
    const vibeChecks = await readVibeChecks(vibeChecksPath);

    const criticalTriggers = getTriggersForZone(vibeChecks, 'critical');
    expect(criticalTriggers.length).toBeGreaterThan(0);
    expect(
      criticalTriggers.every((t) => t.zones?.includes('critical') || !t.zones?.length)
    ).toBe(true);
  });
});

describe('getTriggersByType', () => {
  it('should return triggers by trigger type', async () => {
    const vibeChecksPath = path.join(process.cwd(), 'surveys/vibe-checks.yaml');
    const vibeChecks = await readVibeChecks(vibeChecksPath);

    const firstTimeTriggers = getTriggersByType(vibeChecks, 'first_time');
    expect(firstTimeTriggers.length).toBeGreaterThan(0);
    expect(firstTimeTriggers.every((t) => t.trigger === 'first_time')).toBe(true);
  });
});

// =============================================================================
// COOLDOWN MANAGEMENT
// =============================================================================

describe('createSessionState', () => {
  it('should create initial session state', () => {
    const state = createSessionState();

    expect(state.session_id).toContain('session_');
    expect(state.surveys_shown).toBe(0);
    expect(state.cooldowns).toEqual({});
    expect(state.daily_count).toBe(0);
    expect(state.daily_reset_time).toBeDefined();
  });
});

describe('isInCooldown', () => {
  let state: SessionState;
  let trigger: SurveyTrigger;

  beforeEach(() => {
    state = createSessionState();
    trigger = {
      id: 'test_trigger',
      trigger: 'action_completed',
      question: 'Test?',
      type: 'scale',
      cooldown_days: 7,
      enabled: true,
      priority: 0,
    };
  });

  it('should return false if never shown', () => {
    expect(isInCooldown(state, trigger)).toBe(false);
  });

  it('should return true if recently shown', () => {
    state.cooldowns['test_trigger'] = {
      trigger_id: 'test_trigger',
      last_shown: new Date().toISOString(),
      times_shown: 1,
    };

    expect(isInCooldown(state, trigger)).toBe(true);
  });

  it('should return false if cooldown expired', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10); // 10 days ago

    state.cooldowns['test_trigger'] = {
      trigger_id: 'test_trigger',
      last_shown: pastDate.toISOString(),
      times_shown: 1,
    };

    expect(isInCooldown(state, trigger)).toBe(false);
  });
});

describe('hasIntervalPassed', () => {
  let state: SessionState;
  const limits = { max_per_session: 2, max_per_day: 3, min_interval_minutes: 30 };

  beforeEach(() => {
    state = createSessionState();
  });

  it('should return true if no previous survey', () => {
    expect(hasIntervalPassed(state, limits)).toBe(true);
  });

  it('should return false if interval not passed', () => {
    state.last_survey_time = new Date().toISOString();
    expect(hasIntervalPassed(state, limits)).toBe(false);
  });

  it('should return true if interval passed', () => {
    const pastTime = new Date();
    pastTime.setMinutes(pastTime.getMinutes() - 35);
    state.last_survey_time = pastTime.toISOString();

    expect(hasIntervalPassed(state, limits)).toBe(true);
  });
});

describe('isSessionLimitReached', () => {
  it('should return false when under limit', () => {
    const state = createSessionState();
    const limits = { max_per_session: 2, max_per_day: 3, min_interval_minutes: 30 };

    state.surveys_shown = 1;
    expect(isSessionLimitReached(state, limits)).toBe(false);
  });

  it('should return true when at limit', () => {
    const state = createSessionState();
    const limits = { max_per_session: 2, max_per_day: 3, min_interval_minutes: 30 };

    state.surveys_shown = 2;
    expect(isSessionLimitReached(state, limits)).toBe(true);
  });
});

describe('isDailyLimitReached', () => {
  it('should return false when under limit', () => {
    const state = createSessionState();
    const limits = { max_per_session: 2, max_per_day: 3, min_interval_minutes: 30 };

    state.daily_count = 2;
    expect(isDailyLimitReached(state, limits)).toBe(false);
  });

  it('should return true when at limit', () => {
    const state = createSessionState();
    const limits = { max_per_session: 2, max_per_day: 3, min_interval_minutes: 30 };

    state.daily_count = 3;
    expect(isDailyLimitReached(state, limits)).toBe(true);
  });
});

describe('shouldTriggerSurvey', () => {
  let vibeChecks: VibeChecks;
  let state: SessionState;
  let trigger: SurveyTrigger;

  beforeEach(() => {
    vibeChecks = {
      ...DEFAULT_VIBE_CHECKS,
      limits: { max_per_session: 2, max_per_day: 3, min_interval_minutes: 30 },
    };
    state = createSessionState();
    trigger = {
      id: 'test_trigger',
      trigger: 'action_completed',
      question: 'Test?',
      type: 'scale',
      cooldown_days: 7,
      enabled: true,
      priority: 0,
    };
  });

  it('should return true when all conditions met', () => {
    expect(shouldTriggerSurvey(vibeChecks, trigger, state)).toBe(true);
  });

  it('should return false when disabled', () => {
    trigger.enabled = false;
    expect(shouldTriggerSurvey(vibeChecks, trigger, state)).toBe(false);
  });

  it('should return false when in cooldown', () => {
    state.cooldowns['test_trigger'] = {
      trigger_id: 'test_trigger',
      last_shown: new Date().toISOString(),
      times_shown: 1,
    };
    expect(shouldTriggerSurvey(vibeChecks, trigger, state)).toBe(false);
  });

  it('should return false when session limit reached', () => {
    state.surveys_shown = 2;
    expect(shouldTriggerSurvey(vibeChecks, trigger, state)).toBe(false);
  });
});

describe('recordSurveyShown', () => {
  it('should update session state', () => {
    const state = createSessionState();
    const trigger: SurveyTrigger = {
      id: 'test_trigger',
      trigger: 'action_completed',
      question: 'Test?',
      type: 'scale',
      cooldown_days: 7,
      enabled: true,
      priority: 0,
    };

    const updated = recordSurveyShown(state, trigger);

    expect(updated.surveys_shown).toBe(1);
    expect(updated.daily_count).toBe(1);
    expect(updated.last_survey_time).toBeDefined();
    expect(updated.cooldowns['test_trigger']).toBeDefined();
    expect(updated.cooldowns['test_trigger'].times_shown).toBe(1);
  });
});

// =============================================================================
// RESPONSE RECORDING
// =============================================================================

describe('recordSurveyResponse', () => {
  it('should record response with context', async () => {
    const vibeChecks = DEFAULT_VIBE_CHECKS;
    const trigger: SurveyTrigger = {
      id: 'test_trigger',
      trigger: 'action_completed',
      question: 'Test?',
      type: 'scale',
      cooldown_days: 7,
      enabled: true,
      priority: 0,
    };

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const response = await recordSurveyResponse(vibeChecks, trigger, 5, {
      zone: 'critical',
      persona: 'power_user',
    });

    expect(response.trigger_id).toBe('test_trigger');
    expect(response.response).toBe(5);
    expect(response.context?.zone).toBe('critical');
    expect(response.timestamp).toBeDefined();

    consoleSpy.mockRestore();
  });

  it('should exclude context when include_context is false', async () => {
    const vibeChecks = {
      ...DEFAULT_VIBE_CHECKS,
      feedback: { ...DEFAULT_VIBE_CHECKS.feedback, include_context: false },
    };
    const trigger: SurveyTrigger = {
      id: 'test_trigger',
      trigger: 'action_completed',
      question: 'Test?',
      type: 'scale',
      cooldown_days: 7,
      enabled: true,
      priority: 0,
    };

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const response = await recordSurveyResponse(vibeChecks, trigger, 5, {
      zone: 'critical',
    });

    expect(response.context).toBeUndefined();

    consoleSpy.mockRestore();
  });
});

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

describe('formatTriggerSummary', () => {
  it('should format trigger summary', () => {
    const trigger: SurveyTrigger = {
      id: 'test_trigger',
      trigger: 'action_completed',
      question: 'How was your experience?',
      type: 'scale',
      cooldown_days: 7,
      enabled: true,
      priority: 10,
    };

    const summary = formatTriggerSummary(trigger);

    expect(summary).toContain('test_trigger');
    expect(summary).toContain('How was your experience?');
    expect(summary).toContain('scale');
    expect(summary).toContain('7 days');
    expect(summary).toContain('10');
  });
});

describe('formatVibeChecksSummary', () => {
  it('should format vibe checks summary', async () => {
    const vibeChecksPath = path.join(process.cwd(), 'surveys/vibe-checks.yaml');
    const vibeChecks = await readVibeChecks(vibeChecksPath);

    const summary = formatVibeChecksSummary(vibeChecks);

    expect(summary).toContain('Sigil Vibe Checks v3.0.0');
    expect(summary).toContain('Triggers:');
    expect(summary).toContain('Limits:');
  });
});

// =============================================================================
// GRACEFUL DEGRADATION
// =============================================================================

describe('Graceful Degradation', () => {
  it('should never throw on file not found', async () => {
    const result = await readVibeChecks('/definitely/not/a/real/path.yaml');
    expect(result).toEqual(DEFAULT_VIBE_CHECKS);
  });

  it('should handle invalid YAML gracefully', async () => {
    const tempPath = path.join(process.cwd(), '__tests__/temp-invalid-vibe.yaml');
    await fs.writeFile(tempPath, 'invalid: yaml: content: [[[', 'utf-8');

    try {
      const result = await readVibeChecks(tempPath);
      expect(result).toEqual(DEFAULT_VIBE_CHECKS);
    } finally {
      await fs.unlink(tempPath);
    }
  });
});
