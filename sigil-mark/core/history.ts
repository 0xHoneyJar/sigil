/**
 * Sigil History Module v1.2.4
 *
 * Stores and parses refinement history for learning patterns.
 * History is stored as markdown files in sigil-mark/history/.
 *
 * Philosophy: "Numbers gain meaning through experience"
 */

import * as fs from 'fs';
import * as path from 'path';

export interface RefinementEntry {
  timestamp: string;
  component: string;
  feedback: string;
  zone: 'decisive' | 'machinery' | 'glass';
  recipe: string;
  before: PhysicsConfig;
  after: PhysicsConfig;
  variantCreated: string | null;
  notes: string;
}

export interface PhysicsConfig {
  stiffness: number;
  damping: number;
  duration?: number;
  delay?: number;
}

export interface FeedbackPattern {
  feedback: string;
  avgStiffnessDelta: number;
  avgDampingDelta: number;
  count: number;
  exampleComponent: string;
}

const HISTORY_DIR = 'sigil-mark/history';
const DAYS_TO_PARSE = 30;

/**
 * Write a refinement entry to today's history file
 */
export function logRefinement(entry: Omit<RefinementEntry, 'timestamp'>): void {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const time = new Date().toTimeString().slice(0, 5); // HH:MM
  const filename = path.join(HISTORY_DIR, `${today}.md`);

  const markdown = formatEntry({ ...entry, timestamp: time });

  // Append to file or create new
  if (fs.existsSync(filename)) {
    fs.appendFileSync(filename, '\n---\n\n' + markdown);
  } else {
    const header = `# Refinement History - ${today}\n\n`;
    fs.writeFileSync(filename, header + markdown);
  }
}

/**
 * Parse recent history (last 30 days)
 */
export function parseHistory(): RefinementEntry[] {
  const entries: RefinementEntry[] = [];
  const today = new Date();

  for (let i = 0; i < DAYS_TO_PARSE; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const filename = path.join(HISTORY_DIR, `${dateStr}.md`);

    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename, 'utf-8');
      const parsed = parseHistoryFile(content, dateStr);
      entries.push(...parsed);
    }
  }

  return entries;
}

/**
 * Extract feedback patterns from history
 */
export function extractPatterns(entries: RefinementEntry[]): FeedbackPattern[] {
  const patternMap = new Map<string, {
    stiffnessDeltas: number[];
    dampingDeltas: number[];
    components: string[];
  }>();

  for (const entry of entries) {
    // Normalize feedback (lowercase, remove punctuation)
    const normalizedFeedback = normalizeFeedback(entry.feedback);

    if (!patternMap.has(normalizedFeedback)) {
      patternMap.set(normalizedFeedback, {
        stiffnessDeltas: [],
        dampingDeltas: [],
        components: [],
      });
    }

    const pattern = patternMap.get(normalizedFeedback)!;
    pattern.stiffnessDeltas.push(entry.after.stiffness - entry.before.stiffness);
    pattern.dampingDeltas.push(entry.after.damping - entry.before.damping);
    pattern.components.push(entry.component);
  }

  const patterns: FeedbackPattern[] = [];
  for (const [feedback, data] of patternMap.entries()) {
    patterns.push({
      feedback,
      avgStiffnessDelta: average(data.stiffnessDeltas),
      avgDampingDelta: average(data.dampingDeltas),
      count: data.stiffnessDeltas.length,
      exampleComponent: data.components[0],
    });
  }

  return patterns.sort((a, b) => b.count - a.count);
}

/**
 * Suggest physics adjustment based on feedback
 */
export function suggestAdjustment(
  feedback: string,
  currentPhysics: PhysicsConfig
): PhysicsConfig | null {
  const entries = parseHistory();
  const patterns = extractPatterns(entries);

  const normalizedFeedback = normalizeFeedback(feedback);

  // Find matching or similar patterns
  const match = patterns.find(p =>
    p.feedback.includes(normalizedFeedback) ||
    normalizedFeedback.includes(p.feedback)
  );

  if (!match || match.count < 2) {
    return null; // Not enough data
  }

  return {
    stiffness: Math.round(currentPhysics.stiffness + match.avgStiffnessDelta),
    damping: Math.round(currentPhysics.damping + match.avgDampingDelta),
  };
}

// === Internal Helpers ===

function formatEntry(entry: RefinementEntry): string {
  return `### ${entry.timestamp} - ${entry.component}

**Feedback:** "${entry.feedback}"
**Zone:** ${entry.zone}
**Recipe:** ${entry.recipe}

**Before:**
\`\`\`tsx
spring(${entry.before.stiffness}, ${entry.before.damping})
\`\`\`

**After:**
\`\`\`tsx
spring(${entry.after.stiffness}, ${entry.after.damping})
\`\`\`

**Variant Created:** ${entry.variantCreated || 'No'}
**Notes:** ${entry.notes || '-'}
`;
}

function parseHistoryFile(content: string, date: string): RefinementEntry[] {
  const entries: RefinementEntry[] = [];
  const sections = content.split(/^### /m).slice(1); // Skip header

  for (const section of sections) {
    const entry = parseSection(section, date);
    if (entry) {
      entries.push(entry);
    }
  }

  return entries;
}

function parseSection(section: string, date: string): RefinementEntry | null {
  try {
    const lines = section.split('\n');
    const header = lines[0]; // "HH:MM - ComponentName"
    const [time, component] = header.split(' - ').map(s => s.trim());

    const feedback = extractValue(section, 'Feedback');
    const zone = extractValue(section, 'Zone') as 'decisive' | 'machinery' | 'glass';
    const recipe = extractValue(section, 'Recipe');
    const variantCreated = extractValue(section, 'Variant Created');
    const notes = extractValue(section, 'Notes');

    const before = extractPhysics(section, 'Before');
    const after = extractPhysics(section, 'After');

    if (!before || !after) {
      return null;
    }

    return {
      timestamp: `${date} ${time}`,
      component,
      feedback: feedback.replace(/"/g, ''),
      zone,
      recipe,
      before,
      after,
      variantCreated: variantCreated === 'No' ? null : variantCreated,
      notes,
    };
  } catch {
    return null;
  }
}

function extractValue(content: string, key: string): string {
  const match = content.match(new RegExp(`\\*\\*${key}:\\*\\*\\s*(.+)`));
  return match ? match[1].trim() : '';
}

function extractPhysics(content: string, marker: string): PhysicsConfig | null {
  const regex = new RegExp(`\\*\\*${marker}:\\*\\*[\\s\\S]*?spring\\((\\d+),\\s*(\\d+)\\)`);
  const match = content.match(regex);

  if (!match) {
    return null;
  }

  return {
    stiffness: parseInt(match[1], 10),
    damping: parseInt(match[2], 10),
  };
}

function normalizeFeedback(feedback: string): string {
  return feedback
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim();
}

function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return Math.round(numbers.reduce((a, b) => a + b, 0) / numbers.length);
}

export default {
  logRefinement,
  parseHistory,
  extractPatterns,
  suggestAdjustment,
};
