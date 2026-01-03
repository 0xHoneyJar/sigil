/**
 * Founder Mode Auditor
 *
 * Logs and audits override actions in Founder Mode.
 * Requires pair confirmation for protected actions.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface FounderModeConfig {
  projectRoot: string;
  pairRequired: boolean;
  invariantProtection: string[];
}

interface AuditRecord {
  id: string;
  action: string;
  target: string;
  firstOwner: string;
  secondOwner?: string;
  rationale?: string;
  timestamp: string;
  approved: boolean;
}

interface OverrideRequest {
  action: string;
  target: string;
  rationale?: string;
}

// Protected invariants that can never be overridden
const PROTECTED_INVARIANTS = ['accessibility', 'security'];

/**
 * Founder Mode Auditor
 *
 * Manages override logging and pair confirmation for Founder Mode.
 */
export class FounderModeAuditor {
  private config: FounderModeConfig;
  private auditLog: AuditRecord[] = [];

  constructor(config: Partial<FounderModeConfig> & { projectRoot: string }) {
    this.config = {
      pairRequired: true,
      invariantProtection: PROTECTED_INVARIANTS,
      ...config,
    };
  }

  /**
   * Load audit log from file
   */
  load(): void {
    const auditPath = join(this.config.projectRoot, '.sigil', 'founder-audit.json');

    if (!existsSync(auditPath)) {
      return;
    }

    try {
      const content = readFileSync(auditPath, 'utf-8');
      this.auditLog = JSON.parse(content) as AuditRecord[];
    } catch {
      // Ignore load errors
    }
  }

  /**
   * Save audit log to file
   */
  private save(): void {
    const auditPath = join(this.config.projectRoot, '.sigil', 'founder-audit.json');

    try {
      writeFileSync(auditPath, JSON.stringify(this.auditLog, null, 2), 'utf-8');
    } catch {
      console.error('Failed to save audit log');
    }
  }

  /**
   * Check if an action requires pair confirmation
   */
  requiresPairConfirmation(request: OverrideRequest): boolean {
    // All actions require pair confirmation if pairRequired is true
    if (this.config.pairRequired) {
      return true;
    }

    // Check if action affects protected invariants
    return this.config.invariantProtection.some((inv) =>
      request.target.toLowerCase().includes(inv.toLowerCase())
    );
  }

  /**
   * Check if an action is blocked (affects protected invariants)
   */
  isBlocked(request: OverrideRequest): { blocked: boolean; reason?: string } {
    // Check protected invariants
    for (const invariant of PROTECTED_INVARIANTS) {
      if (request.target.toLowerCase().includes(invariant.toLowerCase())) {
        return {
          blocked: true,
          reason: `Cannot override protected invariant: ${invariant}. This protection exists to ensure user safety and accessibility.`,
        };
      }
    }

    return { blocked: false };
  }

  /**
   * Request an override action
   */
  requestOverride(
    request: OverrideRequest,
    firstOwner: string
  ): {
    success: boolean;
    recordId?: string;
    requiresSecondOwner: boolean;
    message: string;
  } {
    // Check if blocked
    const blockCheck = this.isBlocked(request);
    if (blockCheck.blocked) {
      return {
        success: false,
        requiresSecondOwner: false,
        message: blockCheck.reason!,
      };
    }

    // Create audit record
    const record: AuditRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action: request.action,
      target: request.target,
      firstOwner,
      rationale: request.rationale,
      timestamp: new Date().toISOString(),
      approved: false,
    };

    this.auditLog.push(record);
    this.save();

    // Check if pair confirmation is required
    const requiresPair = this.requiresPairConfirmation(request);

    if (requiresPair) {
      return {
        success: true,
        recordId: record.id,
        requiresSecondOwner: true,
        message: `Override requested by ${firstOwner}. Waiting for second Taste Owner confirmation.`,
      };
    }

    // Auto-approve if pair not required
    record.approved = true;
    this.save();

    return {
      success: true,
      recordId: record.id,
      requiresSecondOwner: false,
      message: `Override approved and logged.`,
    };
  }

  /**
   * Confirm an override request (second owner)
   */
  confirmOverride(
    recordId: string,
    secondOwner: string
  ): { success: boolean; message: string } {
    const record = this.auditLog.find((r) => r.id === recordId);

    if (!record) {
      return {
        success: false,
        message: 'Audit record not found',
      };
    }

    if (record.approved) {
      return {
        success: false,
        message: 'Override already approved',
      };
    }

    // Validate different owners
    if (record.firstOwner === secondOwner) {
      return {
        success: false,
        message: 'Founder Mode requires TWO different Taste Owners',
      };
    }

    // Approve
    record.secondOwner = secondOwner;
    record.approved = true;
    this.save();

    return {
      success: true,
      message: `Override approved by ${secondOwner}. Action logged for audit.`,
    };
  }

  /**
   * Get pending override requests
   */
  getPendingRequests(): AuditRecord[] {
    return this.auditLog.filter((r) => !r.approved);
  }

  /**
   * Get approved overrides
   */
  getApprovedOverrides(): AuditRecord[] {
    return this.auditLog.filter((r) => r.approved);
  }

  /**
   * Get recent audit log entries
   */
  getRecentEntries(limit: number = 10): AuditRecord[] {
    return [...this.auditLog]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);
  }

  /**
   * Get audit summary
   */
  getSummary(): {
    total: number;
    pending: number;
    approved: number;
    byAction: Record<string, number>;
    recentOverrides: AuditRecord[];
  } {
    const byAction: Record<string, number> = {};

    for (const record of this.auditLog) {
      byAction[record.action] = (byAction[record.action] || 0) + 1;
    }

    return {
      total: this.auditLog.length,
      pending: this.getPendingRequests().length,
      approved: this.getApprovedOverrides().length,
      byAction,
      recentOverrides: this.getRecentEntries(5),
    };
  }

  /**
   * Get all audit records
   */
  getAll(): AuditRecord[] {
    return [...this.auditLog];
  }
}
