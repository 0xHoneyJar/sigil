/**
 * @sigil-tier gold
 * Sigil v5.0 - Governance Logger
 *
 * Logs justifications for overrides and creates amendment proposals.
 * Part of the Negotiating Integrity skill.
 *
 * Law: "One good reason > 15% silent mutiny."
 *
 * @module process/governance-logger
 */

import { appendFileSync, writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Override justification entry.
 */
export interface JustificationEntry {
  /** Timestamp of override */
  timestamp: Date;
  /** File where override occurred */
  file: string;
  /** Constitution article violated */
  article: string;
  /** Description of violation */
  violation: string;
  /** User-provided justification */
  justification: string;
  /** Override comment added to code */
  override: string;
  /** Author of override */
  author: string;
}

/**
 * Amendment proposal.
 */
export interface AmendmentProposal {
  /** Unique amendment ID */
  id: string;
  /** Date of proposal */
  date: string;
  /** Who proposed it */
  proposer: string;
  /** Proposal status */
  status: 'proposed' | 'under_review' | 'approved' | 'rejected';
  /** Constitution article to amend */
  article: string;
  /** Current rule text */
  currentRule: string;
  /** Proposed change */
  proposedChange: string;
  /** Justification for change */
  justification: string;
  /** Evidence supporting change */
  evidence?: string[];
  /** Approvers (if any) */
  approvers?: string[];
}

/**
 * Options for negotiation.
 */
export interface NegotiationOptions {
  /** Base path for sigil-mark */
  basePath?: string;
  /** Override author name */
  author?: string;
}

/**
 * Violation context for negotiation.
 */
export interface ViolationContext {
  /** File path */
  file: string;
  /** Line number */
  line?: number;
  /** Constitution article */
  article: string;
  /** Violation description */
  violation: string;
  /** Risk level */
  risk: 'critical' | 'high' | 'medium' | 'low';
  /** Compliant alternative */
  compliantAlternative?: string;
}

// =============================================================================
// PATH HELPERS
// =============================================================================

/**
 * Get governance directory path.
 */
function getGovernancePath(basePath: string = process.cwd()): string {
  return join(basePath, 'sigil-mark/governance');
}

/**
 * Get justifications log path.
 */
function getJustificationsPath(basePath: string = process.cwd()): string {
  return join(getGovernancePath(basePath), 'justifications.log');
}

/**
 * Get amendments directory path.
 */
function getAmendmentsPath(basePath: string = process.cwd()): string {
  return join(getGovernancePath(basePath), 'amendments');
}

/**
 * Ensure governance directories exist.
 */
function ensureGovernanceDir(basePath: string = process.cwd()): void {
  const govPath = getGovernancePath(basePath);
  const amendPath = getAmendmentsPath(basePath);

  if (!existsSync(govPath)) {
    mkdirSync(govPath, { recursive: true });
  }
  if (!existsSync(amendPath)) {
    mkdirSync(amendPath, { recursive: true });
  }
}

// =============================================================================
// JUSTIFICATION LOGGING
// =============================================================================

/**
 * Format justification entry for log.
 */
function formatJustificationEntry(entry: JustificationEntry): string {
  const timestamp = entry.timestamp.toISOString();
  return `[${timestamp}] BYPASS
  File: ${entry.file}
  Article: ${entry.article}
  Violation: ${entry.violation}
  Justification: "${entry.justification}"
  Override: ${entry.override}
  Author: ${entry.author}
`;
}

/**
 * Log a justification for an override.
 *
 * @param entry - Justification entry to log
 * @param options - Logging options
 *
 * @example
 * ```ts
 * logJustification({
 *   timestamp: new Date(),
 *   file: 'src/features/swap/SwapPanel.tsx',
 *   article: 'constitution.financial.forbidden[0]',
 *   violation: 'Using useOptimistic with Money type',
 *   justification: 'Demo account, no real funds at risk',
 *   override: '@sigil-override: constitution.financial.forbidden[0]',
 *   author: '@zksoju',
 * });
 * ```
 */
export function logJustification(
  entry: JustificationEntry,
  options: NegotiationOptions = {}
): void {
  const { basePath = process.cwd() } = options;

  ensureGovernanceDir(basePath);

  const logPath = getJustificationsPath(basePath);
  const formatted = formatJustificationEntry(entry);

  appendFileSync(logPath, formatted + '\n', 'utf-8');
}

/**
 * Read all justifications from log.
 *
 * @param options - Options
 * @returns Array of justification entries
 */
export function readJustifications(options: NegotiationOptions = {}): JustificationEntry[] {
  const { basePath = process.cwd() } = options;
  const logPath = getJustificationsPath(basePath);

  if (!existsSync(logPath)) {
    return [];
  }

  const content = readFileSync(logPath, 'utf-8');
  const entries: JustificationEntry[] = [];

  // Parse log entries
  const blocks = content.split(/\n\n+/).filter(Boolean);

  for (const block of blocks) {
    const timestampMatch = block.match(/\[([\d\-T:\.Z]+)\] BYPASS/);
    const fileMatch = block.match(/File: (.+)/);
    const articleMatch = block.match(/Article: (.+)/);
    const violationMatch = block.match(/Violation: (.+)/);
    const justificationMatch = block.match(/Justification: "(.+)"/);
    const overrideMatch = block.match(/Override: (.+)/);
    const authorMatch = block.match(/Author: (.+)/);

    if (timestampMatch && fileMatch && articleMatch) {
      entries.push({
        timestamp: new Date(timestampMatch[1]),
        file: fileMatch[1],
        article: articleMatch[1],
        violation: violationMatch?.[1] ?? '',
        justification: justificationMatch?.[1] ?? '',
        override: overrideMatch?.[1] ?? '',
        author: authorMatch?.[1] ?? 'unknown',
      });
    }
  }

  return entries;
}

/**
 * Generate override comment for code.
 *
 * @param ruleId - Rule being overridden
 * @param justification - Reason for override
 * @param author - Override author
 * @returns Comment string to insert
 *
 * @example
 * ```ts
 * const comment = generateOverrideComment(
 *   'constitution.financial.forbidden[0]',
 *   'Demo account, no real funds',
 *   '@zksoju'
 * );
 * // @sigil-override: constitution.financial.forbidden[0]
 * // Reason: Demo account, no real funds
 * // Author: @zksoju
 * // Date: 2026-01-08
 * ```
 */
export function generateOverrideComment(
  ruleId: string,
  justification: string,
  author: string
): string {
  const date = new Date().toISOString().split('T')[0];
  return `// @sigil-override: ${ruleId}
// Reason: ${justification}
// Author: ${author}
// Date: ${date}`;
}

// =============================================================================
// AMENDMENT PROPOSALS
// =============================================================================

/**
 * Generate unique amendment ID.
 *
 * @param basePath - Base path for sigil-mark
 * @returns Amendment ID like AMEND-2026-001
 */
export function generateAmendmentId(basePath: string = process.cwd()): string {
  const year = new Date().getFullYear();
  const amendDir = getAmendmentsPath(basePath);

  // Count existing amendments for this year
  let sequence = 1;
  if (existsSync(amendDir)) {
    const files = require('fs').readdirSync(amendDir);
    const yearPrefix = `AMEND-${year}`;
    const existing = files.filter((f: string) => f.includes(yearPrefix));
    sequence = existing.length + 1;
  }

  return `AMEND-${year}-${sequence.toString().padStart(3, '0')}`;
}

/**
 * Create amendment proposal YAML.
 */
function formatAmendmentYaml(proposal: AmendmentProposal): string {
  return `# Amendment Proposal
# Auto-generated by Sigil Governance

id: ${proposal.id}
date: ${proposal.date}
proposer: ${proposal.proposer}
status: ${proposal.status}

article: ${proposal.article}

current_rule: |
  ${proposal.currentRule.split('\n').join('\n  ')}

proposed_change: |
  ${proposal.proposedChange.split('\n').join('\n  ')}

justification: |
  ${proposal.justification.split('\n').join('\n  ')}

${proposal.evidence ? `evidence:\n${proposal.evidence.map(e => `  - ${e}`).join('\n')}` : 'evidence: []'}

${proposal.approvers ? `approvers:\n${proposal.approvers.map(a => `  - ${a}`).join('\n')}` : 'approvers: []'}

# Approval Process:
# 1. Review by stakeholders
# 2. Discussion period (1 week minimum)
# 3. Voting (requires majority)
# 4. If approved, update constitution.yaml
# 5. Update status to 'approved' or 'rejected'
`;
}

/**
 * Create an amendment proposal.
 *
 * @param proposal - Amendment proposal data
 * @param options - Options
 * @returns Path to created amendment file
 *
 * @example
 * ```ts
 * const path = createAmendment({
 *   id: 'AMEND-2026-001',
 *   date: '2026-01-08',
 *   proposer: '@zksoju',
 *   status: 'proposed',
 *   article: 'constitution.financial.forbidden[0]',
 *   currentRule: 'forbid: useOptimistic with Money',
 *   proposedChange: 'Allow useOptimistic for demo accounts',
 *   justification: 'Demo accounts have no real funds at risk',
 * });
 * ```
 */
export function createAmendment(
  proposal: AmendmentProposal,
  options: NegotiationOptions = {}
): string {
  const { basePath = process.cwd() } = options;

  ensureGovernanceDir(basePath);

  const amendDir = getAmendmentsPath(basePath);
  const filename = `${proposal.id}.yaml`;
  const filePath = join(amendDir, filename);

  const content = formatAmendmentYaml(proposal);
  writeFileSync(filePath, content, 'utf-8');

  return filePath;
}

/**
 * Create amendment from violation context.
 *
 * @param context - Violation context
 * @param proposedChange - What to change
 * @param justification - Why to change
 * @param options - Options
 * @returns Created amendment proposal
 */
export function proposeAmendment(
  context: ViolationContext,
  proposedChange: string,
  justification: string,
  options: NegotiationOptions = {}
): AmendmentProposal {
  const { basePath = process.cwd(), author = 'unknown' } = options;

  const id = generateAmendmentId(basePath);
  const date = new Date().toISOString().split('T')[0];

  const proposal: AmendmentProposal = {
    id,
    date,
    proposer: author,
    status: 'proposed',
    article: context.article,
    currentRule: context.violation,
    proposedChange,
    justification,
    evidence: [`Triggered by: ${context.file}${context.line ? `:${context.line}` : ''}`],
  };

  createAmendment(proposal, { basePath });

  return proposal;
}

/**
 * Read all amendment proposals.
 *
 * @param options - Options
 * @returns Array of amendment proposals
 */
export function readAmendments(options: NegotiationOptions = {}): AmendmentProposal[] {
  const { basePath = process.cwd() } = options;
  const amendDir = getAmendmentsPath(basePath);

  if (!existsSync(amendDir)) {
    return [];
  }

  const files = require('fs').readdirSync(amendDir) as string[];
  const proposals: AmendmentProposal[] = [];

  for (const file of files) {
    if (!file.endsWith('.yaml')) continue;

    try {
      const content = readFileSync(join(amendDir, file), 'utf-8');
      const yaml = require('yaml');
      const parsed = yaml.parse(content);

      proposals.push({
        id: parsed.id,
        date: parsed.date,
        proposer: parsed.proposer,
        status: parsed.status,
        article: parsed.article,
        currentRule: parsed.current_rule,
        proposedChange: parsed.proposed_change,
        justification: parsed.justification,
        evidence: parsed.evidence,
        approvers: parsed.approvers,
      });
    } catch {
      // Skip malformed files
    }
  }

  return proposals;
}

// =============================================================================
// NEGOTIATION HELPERS
// =============================================================================

/**
 * Format negotiation options for user display.
 *
 * @param context - Violation context
 * @returns Formatted options string
 */
export function formatNegotiationOptions(context: ViolationContext): string {
  const lines = [
    '',
    'This request conflicts with the Constitution.',
    '',
    `VIOLATION: ${context.violation}`,
    `ARTICLE: ${context.article}`,
    `RISK: ${context.risk}`,
    '',
    'OPTIONS:',
    `1. COMPLY - ${context.compliantAlternative ?? 'Use compliant alternative'}`,
    '2. BYPASS - Override with justification (will be logged)',
    '3. AMEND - Propose constitution change',
    '',
    'Which do you prefer?',
  ];

  return lines.join('\n');
}

/**
 * Handle BYPASS option.
 *
 * @param context - Violation context
 * @param justification - User-provided justification
 * @param options - Options
 * @returns Override comment and log entry
 */
export function handleBypass(
  context: ViolationContext,
  justification: string,
  options: NegotiationOptions = {}
): { comment: string; logged: boolean } {
  const { author = 'unknown' } = options;

  // Generate override comment
  const comment = generateOverrideComment(context.article, justification, author);

  // Log justification
  logJustification(
    {
      timestamp: new Date(),
      file: context.file,
      article: context.article,
      violation: context.violation,
      justification,
      override: `@sigil-override: ${context.article}`,
      author,
    },
    options
  );

  return { comment, logged: true };
}

/**
 * Handle AMEND option.
 *
 * @param context - Violation context
 * @param proposedChange - What to change
 * @param justification - Why to change
 * @param options - Options
 * @returns Created amendment proposal
 */
export function handleAmend(
  context: ViolationContext,
  proposedChange: string,
  justification: string,
  options: NegotiationOptions = {}
): AmendmentProposal {
  return proposeAmendment(context, proposedChange, justification, options);
}

// =============================================================================
// FORMATTERS
// =============================================================================

/**
 * Format justification summary for terminal.
 */
export function formatJustificationSummary(entries: JustificationEntry[]): string {
  if (entries.length === 0) {
    return 'No overrides logged.';
  }

  const lines = [
    '',
    'JUSTIFICATION LOG',
    '=================',
    `Total overrides: ${entries.length}`,
    '',
  ];

  // Group by article
  const byArticle = new Map<string, JustificationEntry[]>();
  for (const entry of entries) {
    if (!byArticle.has(entry.article)) {
      byArticle.set(entry.article, []);
    }
    byArticle.get(entry.article)!.push(entry);
  }

  for (const [article, articleEntries] of byArticle) {
    lines.push(`\n${article} (${articleEntries.length} overrides)`);
    for (const entry of articleEntries.slice(0, 3)) {
      lines.push(`  - ${entry.file}: "${entry.justification}"`);
    }
    if (articleEntries.length > 3) {
      lines.push(`  ... and ${articleEntries.length - 3} more`);
    }
  }

  return lines.join('\n');
}

/**
 * Format amendment summary for terminal.
 */
export function formatAmendmentSummary(proposals: AmendmentProposal[]): string {
  if (proposals.length === 0) {
    return 'No amendment proposals.';
  }

  const lines = [
    '',
    'AMENDMENT PROPOSALS',
    '===================',
    `Total proposals: ${proposals.length}`,
    '',
  ];

  const byStatus = {
    proposed: proposals.filter((p) => p.status === 'proposed'),
    under_review: proposals.filter((p) => p.status === 'under_review'),
    approved: proposals.filter((p) => p.status === 'approved'),
    rejected: proposals.filter((p) => p.status === 'rejected'),
  };

  for (const [status, statusProposals] of Object.entries(byStatus)) {
    if (statusProposals.length === 0) continue;
    lines.push(`\n${status.toUpperCase()} (${statusProposals.length})`);
    for (const p of statusProposals) {
      lines.push(`  ${p.id}: ${p.article}`);
      lines.push(`    Proposed: ${p.proposedChange.slice(0, 50)}...`);
    }
  }

  return lines.join('\n');
}
