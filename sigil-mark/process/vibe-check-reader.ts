/**
 * Sigil v2.6 — Vibe Check Reader
 *
 * Reads and manages micro-surveys for qualitative feedback.
 * Implements cooldown management and response recording.
 *
 * Philosophy: "Ask at the moment of emotion, not after it's gone."
 *
 * @module process/vibe-check-reader
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import YAML from 'yaml';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Trigger type for when the survey fires.
 */
export type TriggerType =
  | 'action_completed'
  | 'error_occurred'
  | 'first_time'
  | 'periodic'
  | 'exit_intent'
  | 'custom';

/**
 * Survey response type.
 */
export type SurveyType = 'scale' | 'choice' | 'text' | 'emoji';

/**
 * Feedback destination.
 */
export type FeedbackDestination = 'console' | 'file' | 'endpoint' | 'custom';

/**
 * Display position.
 */
export type DisplayPosition = 'bottom-right' | 'bottom-left' | 'center' | 'inline';

/**
 * Display theme.
 */
export type DisplayTheme = 'light' | 'dark' | 'system';

/**
 * A response option for a survey.
 */
export interface SurveyOption {
  value: string | number;
  label: string;
  emoji?: string;
}

/**
 * A survey trigger definition.
 */
export interface SurveyTrigger {
  /** Unique identifier */
  id: string;
  /** Human-readable name */
  name?: string;
  /** Trigger type */
  trigger: TriggerType;
  /** Specific event name */
  trigger_event?: string;
  /** The question to ask */
  question: string;
  /** Response type */
  type: SurveyType;
  /** Response options */
  options?: SurveyOption[];
  /** Days to wait before showing again */
  cooldown_days: number;
  /** Zones where this applies */
  zones?: string[];
  /** Whether this trigger is active */
  enabled: boolean;
  /** Priority (higher = shown first) */
  priority: number;
}

/**
 * Feedback configuration.
 */
export interface FeedbackConfig {
  destination: FeedbackDestination;
  endpoint_url?: string;
  file_path?: string;
  include_context: boolean;
  anonymize: boolean;
}

/**
 * Display configuration.
 */
export interface DisplayConfig {
  position: DisplayPosition;
  delay_ms: number;
  auto_dismiss_ms: number;
  show_dismiss: boolean;
  theme: DisplayTheme;
}

/**
 * Rate limits configuration.
 */
export interface LimitsConfig {
  max_per_session: number;
  max_per_day: number;
  min_interval_minutes: number;
}

/**
 * The Vibe Checks configuration.
 */
export interface VibeChecks {
  version: string;
  triggers: SurveyTrigger[];
  feedback: FeedbackConfig;
  display: DisplayConfig;
  limits: LimitsConfig;
}

/**
 * A recorded survey response.
 */
export interface SurveyResponse {
  trigger_id: string;
  question: string;
  response: string | number;
  timestamp: string;
  context?: {
    zone?: string;
    persona?: string;
    session_id?: string;
  };
}

/**
 * Cooldown state for a trigger.
 */
export interface CooldownState {
  trigger_id: string;
  last_shown: string;
  times_shown: number;
}

/**
 * Session state for rate limiting.
 */
export interface SessionState {
  session_id: string;
  surveys_shown: number;
  last_survey_time?: string;
  cooldowns: Record<string, CooldownState>;
  daily_count: number;
  daily_reset_time: string;
}

// =============================================================================
// DEFAULTS
// =============================================================================

const DEFAULT_FEEDBACK: FeedbackConfig = {
  destination: 'console',
  include_context: true,
  anonymize: true,
};

const DEFAULT_DISPLAY: DisplayConfig = {
  position: 'bottom-right',
  delay_ms: 1000,
  auto_dismiss_ms: 0,
  show_dismiss: true,
  theme: 'system',
};

const DEFAULT_LIMITS: LimitsConfig = {
  max_per_session: 2,
  max_per_day: 3,
  min_interval_minutes: 30,
};

/**
 * Default empty vibe checks.
 */
export const DEFAULT_VIBE_CHECKS: VibeChecks = {
  version: '2.6.0',
  triggers: [],
  feedback: DEFAULT_FEEDBACK,
  display: DEFAULT_DISPLAY,
  limits: DEFAULT_LIMITS,
};

/**
 * Default path to the vibe checks file.
 */
export const DEFAULT_VIBE_CHECKS_PATH = 'sigil-mark/surveys/vibe-checks.yaml';

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validates a trigger type.
 */
function isValidTriggerType(value: unknown): value is TriggerType {
  return [
    'action_completed',
    'error_occurred',
    'first_time',
    'periodic',
    'exit_intent',
    'custom',
  ].includes(value as string);
}

/**
 * Validates a survey type.
 */
function isValidSurveyType(value: unknown): value is SurveyType {
  return ['scale', 'choice', 'text', 'emoji'].includes(value as string);
}

/**
 * Validates a trigger object.
 */
function isValidTrigger(value: unknown): value is SurveyTrigger {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    obj.id.length > 0 &&
    isValidTriggerType(obj.trigger) &&
    typeof obj.question === 'string'
  );
}

/**
 * Normalizes a trigger object.
 */
function normalizeTrigger(obj: Record<string, unknown>): SurveyTrigger | null {
  if (!isValidTrigger(obj)) {
    return null;
  }

  return {
    id: obj.id as string,
    name: typeof obj.name === 'string' ? obj.name : undefined,
    trigger: obj.trigger as TriggerType,
    trigger_event: typeof obj.trigger_event === 'string' ? obj.trigger_event : undefined,
    question: obj.question as string,
    type: isValidSurveyType(obj.type) ? obj.type : 'scale',
    options: Array.isArray(obj.options)
      ? obj.options.filter(
          (o): o is SurveyOption =>
            typeof o === 'object' &&
            o !== null &&
            ('value' in o) &&
            ('label' in o)
        )
      : undefined,
    cooldown_days: typeof obj.cooldown_days === 'number' ? obj.cooldown_days : 7,
    zones: Array.isArray(obj.zones)
      ? obj.zones.filter((z): z is string => typeof z === 'string')
      : undefined,
    enabled: typeof obj.enabled === 'boolean' ? obj.enabled : true,
    priority: typeof obj.priority === 'number' ? obj.priority : 0,
  };
}

/**
 * Validates and normalizes vibe checks config.
 */
function validateVibeChecks(parsed: unknown): VibeChecks {
  if (typeof parsed !== 'object' || parsed === null) {
    console.warn('[Sigil VibeChecks] Invalid config format, using defaults');
    return DEFAULT_VIBE_CHECKS;
  }

  const obj = parsed as Record<string, unknown>;

  // Validate version
  const version = typeof obj.version === 'string' ? obj.version : '2.6.0';

  // Validate triggers
  const triggers: SurveyTrigger[] = [];
  if (Array.isArray(obj.triggers)) {
    for (const t of obj.triggers) {
      const trigger = normalizeTrigger(t as Record<string, unknown>);
      if (trigger) {
        triggers.push(trigger);
      } else {
        console.warn(`[Sigil VibeChecks] Skipping invalid trigger`);
      }
    }
  }

  // Validate feedback
  let feedback: FeedbackConfig = DEFAULT_FEEDBACK;
  if (typeof obj.feedback === 'object' && obj.feedback !== null) {
    const f = obj.feedback as Record<string, unknown>;
    feedback = {
      destination: ['console', 'file', 'endpoint', 'custom'].includes(
        f.destination as string
      )
        ? (f.destination as FeedbackDestination)
        : 'console',
      endpoint_url: typeof f.endpoint_url === 'string' ? f.endpoint_url : undefined,
      file_path: typeof f.file_path === 'string' ? f.file_path : undefined,
      include_context:
        typeof f.include_context === 'boolean' ? f.include_context : true,
      anonymize: typeof f.anonymize === 'boolean' ? f.anonymize : true,
    };
  }

  // Validate display
  let display: DisplayConfig = DEFAULT_DISPLAY;
  if (typeof obj.display === 'object' && obj.display !== null) {
    const d = obj.display as Record<string, unknown>;
    display = {
      position: ['bottom-right', 'bottom-left', 'center', 'inline'].includes(
        d.position as string
      )
        ? (d.position as DisplayPosition)
        : 'bottom-right',
      delay_ms: typeof d.delay_ms === 'number' ? d.delay_ms : 1000,
      auto_dismiss_ms: typeof d.auto_dismiss_ms === 'number' ? d.auto_dismiss_ms : 0,
      show_dismiss: typeof d.show_dismiss === 'boolean' ? d.show_dismiss : true,
      theme: ['light', 'dark', 'system'].includes(d.theme as string)
        ? (d.theme as DisplayTheme)
        : 'system',
    };
  }

  // Validate limits
  let limits: LimitsConfig = DEFAULT_LIMITS;
  if (typeof obj.limits === 'object' && obj.limits !== null) {
    const l = obj.limits as Record<string, unknown>;
    limits = {
      max_per_session: typeof l.max_per_session === 'number' ? l.max_per_session : 2,
      max_per_day: typeof l.max_per_day === 'number' ? l.max_per_day : 3,
      min_interval_minutes:
        typeof l.min_interval_minutes === 'number' ? l.min_interval_minutes : 30,
    };
  }

  return {
    version,
    triggers,
    feedback,
    display,
    limits,
  };
}

// =============================================================================
// READER FUNCTIONS
// =============================================================================

/**
 * Reads and parses vibe checks from a YAML file.
 *
 * @param filePath - Path to the vibe checks YAML file
 * @returns Parsed and validated VibeChecks
 */
export async function readVibeChecks(
  filePath: string = DEFAULT_VIBE_CHECKS_PATH
): Promise<VibeChecks> {
  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    const content = await fs.readFile(resolvedPath, 'utf-8');
    const parsed = YAML.parse(content);
    return validateVibeChecks(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[Sigil VibeChecks] File not found: ${filePath}, using defaults`);
    } else if (error instanceof YAML.YAMLParseError) {
      console.error(`[Sigil VibeChecks] YAML parse error: ${error.message}`);
    } else {
      console.error(`[Sigil VibeChecks] Error reading vibe checks: ${error}`);
    }
    return DEFAULT_VIBE_CHECKS;
  }
}

/**
 * Synchronously reads and parses vibe checks from a YAML file.
 *
 * @param filePath - Path to the vibe checks YAML file
 * @returns Parsed and validated VibeChecks
 */
export function readVibeChecksSync(
  filePath: string = DEFAULT_VIBE_CHECKS_PATH
): VibeChecks {
  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fsSync = require('fs');
    const content = fsSync.readFileSync(resolvedPath, 'utf-8');
    const parsed = YAML.parse(content);
    return validateVibeChecks(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`[Sigil VibeChecks] File not found: ${filePath}, using defaults`);
    } else {
      console.error(`[Sigil VibeChecks] Error reading vibe checks: ${error}`);
    }
    return DEFAULT_VIBE_CHECKS;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Gets a trigger by ID.
 *
 * @param vibeChecks - The vibe checks config
 * @param triggerId - The trigger ID to find
 * @returns The trigger, or undefined if not found
 */
export function getTriggerById(
  vibeChecks: VibeChecks,
  triggerId: string
): SurveyTrigger | undefined {
  return vibeChecks.triggers.find((t) => t.id === triggerId);
}

/**
 * Gets all enabled triggers.
 *
 * @param vibeChecks - The vibe checks config
 * @returns Array of enabled triggers
 */
export function getEnabledTriggers(vibeChecks: VibeChecks): SurveyTrigger[] {
  return vibeChecks.triggers.filter((t) => t.enabled);
}

/**
 * Gets triggers for a specific zone.
 *
 * @param vibeChecks - The vibe checks config
 * @param zone - The zone to filter by
 * @returns Array of triggers for the zone
 */
export function getTriggersForZone(
  vibeChecks: VibeChecks,
  zone: string
): SurveyTrigger[] {
  return vibeChecks.triggers.filter((t) => {
    if (!t.enabled) return false;
    // If no zones specified, applies to all
    if (!t.zones || t.zones.length === 0) return true;
    return t.zones.includes(zone);
  });
}

/**
 * Gets triggers by type.
 *
 * @param vibeChecks - The vibe checks config
 * @param triggerType - The trigger type to filter by
 * @returns Array of matching triggers
 */
export function getTriggersByType(
  vibeChecks: VibeChecks,
  triggerType: TriggerType
): SurveyTrigger[] {
  return vibeChecks.triggers.filter((t) => t.enabled && t.trigger === triggerType);
}

// =============================================================================
// COOLDOWN MANAGEMENT
// =============================================================================

/**
 * Creates an initial session state.
 *
 * @returns New session state
 */
export function createSessionState(): SessionState {
  const now = new Date();
  return {
    session_id: `session_${now.getTime()}`,
    surveys_shown: 0,
    cooldowns: {},
    daily_count: 0,
    daily_reset_time: getStartOfDay(now).toISOString(),
  };
}

/**
 * Gets the start of the current day.
 */
function getStartOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Checks if a trigger is in cooldown.
 *
 * @param state - Current session state
 * @param trigger - The trigger to check
 * @returns True if in cooldown
 */
export function isInCooldown(state: SessionState, trigger: SurveyTrigger): boolean {
  const cooldown = state.cooldowns[trigger.id];
  if (!cooldown) return false;

  const lastShown = new Date(cooldown.last_shown);
  const cooldownEnd = new Date(
    lastShown.getTime() + trigger.cooldown_days * 24 * 60 * 60 * 1000
  );
  return new Date() < cooldownEnd;
}

/**
 * Checks if the minimum interval has passed since last survey.
 *
 * @param state - Current session state
 * @param limits - Rate limits config
 * @returns True if interval has passed
 */
export function hasIntervalPassed(
  state: SessionState,
  limits: LimitsConfig
): boolean {
  if (!state.last_survey_time) return true;

  const lastSurvey = new Date(state.last_survey_time);
  const minInterval = limits.min_interval_minutes * 60 * 1000;
  return Date.now() - lastSurvey.getTime() >= minInterval;
}

/**
 * Checks if session limit has been reached.
 *
 * @param state - Current session state
 * @param limits - Rate limits config
 * @returns True if limit reached
 */
export function isSessionLimitReached(
  state: SessionState,
  limits: LimitsConfig
): boolean {
  return state.surveys_shown >= limits.max_per_session;
}

/**
 * Checks if daily limit has been reached.
 *
 * @param state - Current session state
 * @param limits - Rate limits config
 * @returns True if limit reached
 */
export function isDailyLimitReached(
  state: SessionState,
  limits: LimitsConfig
): boolean {
  // Check if we need to reset daily count
  const resetTime = new Date(state.daily_reset_time);
  const now = new Date();
  const todayStart = getStartOfDay(now);

  if (todayStart > resetTime) {
    // New day, reset count
    state.daily_count = 0;
    state.daily_reset_time = todayStart.toISOString();
  }

  return state.daily_count >= limits.max_per_day;
}

/**
 * Checks if a survey should be triggered.
 *
 * @param vibeChecks - The vibe checks config
 * @param trigger - The trigger to check
 * @param state - Current session state
 * @returns True if survey should be shown
 */
export function shouldTriggerSurvey(
  vibeChecks: VibeChecks,
  trigger: SurveyTrigger,
  state: SessionState
): boolean {
  // Check if trigger is enabled
  if (!trigger.enabled) return false;

  // Check cooldown
  if (isInCooldown(state, trigger)) return false;

  // Check session limit
  if (isSessionLimitReached(state, vibeChecks.limits)) return false;

  // Check daily limit
  if (isDailyLimitReached(state, vibeChecks.limits)) return false;

  // Check minimum interval
  if (!hasIntervalPassed(state, vibeChecks.limits)) return false;

  return true;
}

/**
 * Updates session state after showing a survey.
 *
 * @param state - Current session state
 * @param trigger - The trigger that was shown
 * @returns Updated session state
 */
export function recordSurveyShown(
  state: SessionState,
  trigger: SurveyTrigger
): SessionState {
  const now = new Date().toISOString();

  return {
    ...state,
    surveys_shown: state.surveys_shown + 1,
    last_survey_time: now,
    daily_count: state.daily_count + 1,
    cooldowns: {
      ...state.cooldowns,
      [trigger.id]: {
        trigger_id: trigger.id,
        last_shown: now,
        times_shown: (state.cooldowns[trigger.id]?.times_shown ?? 0) + 1,
      },
    },
  };
}

// =============================================================================
// RESPONSE RECORDING
// =============================================================================

/**
 * Records a survey response.
 *
 * @param vibeChecks - The vibe checks config
 * @param trigger - The trigger that was answered
 * @param response - The user's response
 * @param context - Optional context (zone, persona)
 * @returns The recorded response
 */
export async function recordSurveyResponse(
  vibeChecks: VibeChecks,
  trigger: SurveyTrigger,
  response: string | number,
  context?: { zone?: string; persona?: string; session_id?: string }
): Promise<SurveyResponse> {
  const surveyResponse: SurveyResponse = {
    trigger_id: trigger.id,
    question: trigger.question,
    response,
    timestamp: new Date().toISOString(),
    context: vibeChecks.feedback.include_context ? context : undefined,
  };

  // Handle different destinations
  switch (vibeChecks.feedback.destination) {
    case 'console':
      console.log('[Sigil VibeCheck Response]', surveyResponse);
      break;

    case 'file':
      if (vibeChecks.feedback.file_path) {
        await appendResponseToFile(vibeChecks.feedback.file_path, surveyResponse);
      }
      break;

    case 'endpoint':
      if (vibeChecks.feedback.endpoint_url) {
        await sendResponseToEndpoint(
          vibeChecks.feedback.endpoint_url,
          surveyResponse
        );
      }
      break;

    case 'custom':
      // Custom handling - just return the response
      break;
  }

  return surveyResponse;
}

/**
 * Appends a response to a file.
 */
async function appendResponseToFile(
  filePath: string,
  response: SurveyResponse
): Promise<void> {
  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    const line = JSON.stringify(response) + '\n';
    await fs.appendFile(resolvedPath, line, 'utf-8');
  } catch (error) {
    console.error(`[Sigil VibeChecks] Error writing to file: ${error}`);
  }
}

/**
 * Sends a response to an endpoint.
 */
async function sendResponseToEndpoint(
  url: string,
  response: SurveyResponse
): Promise<void> {
  try {
    // Note: In a real implementation, this would use fetch or similar
    console.log(`[Sigil VibeChecks] Would send to ${url}:`, response);
  } catch (error) {
    console.error(`[Sigil VibeChecks] Error sending to endpoint: ${error}`);
  }
}

// =============================================================================
// DISPLAY HELPERS
// =============================================================================

/**
 * Formats a trigger for display.
 *
 * @param trigger - The trigger to format
 * @returns Formatted string
 */
export function formatTriggerSummary(trigger: SurveyTrigger): string {
  return `${trigger.id}: ${trigger.question}
  Type: ${trigger.type}
  Cooldown: ${trigger.cooldown_days} days
  Priority: ${trigger.priority}
  Enabled: ${trigger.enabled}`;
}

/**
 * Formats vibe checks summary.
 *
 * @param vibeChecks - The vibe checks config
 * @returns Formatted string
 */
export function formatVibeChecksSummary(vibeChecks: VibeChecks): string {
  const enabled = vibeChecks.triggers.filter((t) => t.enabled).length;
  const triggerList = vibeChecks.triggers
    .slice(0, 5)
    .map((t) => `  - ${t.id}: ${t.question.slice(0, 40)}...`)
    .join('\n');

  return `Sigil Vibe Checks v${vibeChecks.version}
Triggers: ${vibeChecks.triggers.length} total, ${enabled} enabled
${triggerList}${vibeChecks.triggers.length > 5 ? '\n  ...' : ''}

Limits:
  Per session: ${vibeChecks.limits.max_per_session}
  Per day: ${vibeChecks.limits.max_per_day}
  Interval: ${vibeChecks.limits.min_interval_minutes} minutes`;
}
