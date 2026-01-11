// AGENT-ONLY: Do not import in browser code
// This module uses Node.js fs and will crash in browser environments.

/**
 * Amend Command Handler
 *
 * @sigil-tier gold
 * @sigil-zone machinery
 * @server-only
 *
 * Create amendment proposals to change constitution rules.
 *
 * Usage:
 * - /amend <rule> - Create amendment proposal for a specific rule
 *
 * @module process/amend-command
 */

import {
  proposeAmendment,
  readAmendments,
  formatAmendmentSummary,
  type AmendmentProposal,
  type ViolationContext,
  type NegotiationOptions,
} from './governance-logger';

// =============================================================================
// TYPES
// =============================================================================

/** Options for the amend command */
export interface AmendOptions {
  /** Base path for sigil-mark */
  basePath?: string;
  /** Proposer name */
  author?: string;
  /** Skip confirmation prompts */
  skipConfirm?: boolean;
}

/** Result of the amend command */
export interface AmendResult {
  /** Whether the amendment was created */
  success: boolean;
  /** Created amendment proposal */
  proposal?: AmendmentProposal;
  /** Proposal ID */
  proposalId?: string;
  /** File path to proposal */
  proposalPath?: string;
  /** Error message if failed */
  error?: string;
}

// =============================================================================
// AMEND COMMAND
// =============================================================================

/**
 * Create an amendment proposal
 *
 * @param rule - Constitution rule to amend (e.g., "constitution.financial.forbidden[0]")
 * @param proposedChange - What change to propose
 * @param justification - Why the change is needed
 * @param options - Command options
 * @returns Amendment result
 *
 * @example
 * ```typescript
 * import { amend } from 'sigil-mark/process';
 *
 * const result = amend(
 *   'constitution.financial.forbidden[0]',
 *   'Allow useOptimistic for demo accounts',
 *   'Demo accounts have no real funds at risk',
 *   { author: '@zksoju' }
 * );
 *
 * console.log(`Created proposal: ${result.proposalId}`);
 * ```
 */
export function amend(
  rule: string,
  proposedChange: string,
  justification: string,
  options: AmendOptions = {}
): AmendResult {
  const { basePath = process.cwd(), author = 'unknown' } = options;

  try {
    // Create a violation context from the rule
    const context: ViolationContext = {
      file: 'user-initiated',
      article: rule,
      violation: `Rule ${rule} needs amendment`,
      risk: 'medium',
    };

    // Create the proposal
    const proposal = proposeAmendment(context, proposedChange, justification, {
      basePath,
      author,
    });

    return {
      success: true,
      proposal,
      proposalId: proposal.id,
      proposalPath: `sigil-mark/governance/amendments/${proposal.id}.yaml`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * List all amendment proposals
 *
 * @param options - Command options
 * @returns Array of proposals
 */
export function listAmendments(options: AmendOptions = {}): AmendmentProposal[] {
  return readAmendments({ basePath: options.basePath });
}

/**
 * Get pending amendments (not yet approved/rejected)
 *
 * @param options - Command options
 * @returns Array of pending proposals
 */
export function getPendingAmendments(options: AmendOptions = {}): AmendmentProposal[] {
  const all = readAmendments({ basePath: options.basePath });
  return all.filter(a => a.status === 'proposed' || a.status === 'under_review');
}

// =============================================================================
// FORMATTERS
// =============================================================================

/**
 * Format amend result for display
 */
export function formatAmendResult(result: AmendResult): string {
  if (!result.success) {
    return `Amendment failed: ${result.error}`;
  }

  const lines = [
    '',
    '# Amendment Proposal Created',
    '',
    `**ID:** ${result.proposalId}`,
    `**File:** ${result.proposalPath}`,
    '',
    '## Next Steps',
    '',
    '1. Review the proposal in the amendments directory',
    '2. Share with stakeholders for discussion',
    '3. After review period, update status to approved/rejected',
    '4. If approved, update the constitution accordingly',
    '',
  ];

  return lines.join('\n');
}

/**
 * Format pending amendments as reminder
 */
export function formatPendingReminder(proposals: AmendmentProposal[]): string {
  if (proposals.length === 0) {
    return '';
  }

  const lines = [
    '',
    `**Note:** ${proposals.length} pending amendment${proposals.length > 1 ? 's' : ''} awaiting review:`,
  ];

  for (const p of proposals.slice(0, 3)) {
    lines.push(`- ${p.id}: ${p.article}`);
  }

  if (proposals.length > 3) {
    lines.push(`- ... and ${proposals.length - 3} more`);
  }

  return lines.join('\n');
}

// =============================================================================
// CLI
// =============================================================================

/**
 * Run amend command from CLI
 *
 * @example
 * ```bash
 * npx sigil amend constitution.financial.forbidden[0] \
 *   --change "Allow useOptimistic for demo accounts" \
 *   --reason "Demo accounts have no real funds at risk" \
 *   --author "@zksoju"
 * ```
 */
export async function runAmendCLI(args: string[]): Promise<void> {
  // Parse args
  const rule = args[0];
  const changeIndex = args.indexOf('--change');
  const reasonIndex = args.indexOf('--reason');
  const authorIndex = args.indexOf('--author');

  if (!rule) {
    console.log('Usage: sigil amend <rule> --change "<change>" --reason "<reason>" [--author "@name"]');
    console.log('');
    console.log('Example:');
    console.log('  sigil amend constitution.financial.forbidden[0] \\');
    console.log('    --change "Allow useOptimistic for demo accounts" \\');
    console.log('    --reason "Demo accounts have no real funds"');
    process.exit(1);
  }

  if (rule === '--list') {
    const proposals = listAmendments();
    console.log(formatAmendmentSummary(proposals));
    return;
  }

  if (changeIndex === -1 || reasonIndex === -1) {
    console.error('Error: --change and --reason are required');
    process.exit(1);
  }

  const change = args[changeIndex + 1];
  const reason = args[reasonIndex + 1];
  const author = authorIndex !== -1 ? args[authorIndex + 1] : 'unknown';

  console.log(`Creating amendment for: ${rule}`);
  console.log('');

  const result = amend(rule, change, reason, { author });
  console.log(formatAmendResult(result));

  if (!result.success) {
    process.exit(1);
  }
}
