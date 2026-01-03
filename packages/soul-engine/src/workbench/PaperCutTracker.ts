/**
 * Paper Cut Tracker
 *
 * Tracks minor issues (paper cuts) that accumulate over time.
 * Implements the Three-to-One rule: for every feature, fix 3 paper cuts.
 */

import { existsSync } from 'fs';
import type { PaperCut } from './index.js';

interface PaperCutTrackerConfig {
  dbPath: string;
  threshold?: number;
}

/**
 * Paper Cut Tracker
 *
 * Manages tracking and prioritization of minor UX issues.
 */
export class PaperCutTracker {
  private config: PaperCutTrackerConfig;
  private paperCuts: PaperCut[] = [];

  constructor(config: PaperCutTrackerConfig) {
    this.config = {
      threshold: 10,
      ...config,
    };
  }

  /**
   * Load paper cuts from database
   */
  async load(): Promise<void> {
    const { dbPath } = this.config;

    if (!existsSync(dbPath)) {
      return;
    }

    try {
      // Dynamic import for Node.js compatibility
      const { loadPaperCutsFromDB } = await import('../lib/db.js');
      const cuts = await loadPaperCutsFromDB(dbPath);

      this.paperCuts = cuts.map((cut) => ({
        id: cut.id,
        category: cut.category,
        description: cut.description,
        filePath: cut.file_path,
        lineNumber: cut.line_number,
        severity: cut.severity as 'low' | 'medium' | 'high',
        status: cut.status as 'open' | 'fixed' | 'wontfix',
        createdAt: cut.created_at,
        fixedAt: cut.fixed_at,
      }));
    } catch {
      // Ignore load errors
    }
  }

  /**
   * Add a new paper cut
   */
  add(paperCut: Omit<PaperCut, 'id' | 'createdAt' | 'status'>): PaperCut {
    const newCut: PaperCut = {
      ...paperCut,
      id: `pc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    this.paperCuts.push(newCut);
    return newCut;
  }

  /**
   * Mark a paper cut as fixed
   */
  fix(id: string): boolean {
    const cut = this.paperCuts.find((c) => c.id === id);
    if (!cut) return false;

    cut.status = 'fixed';
    cut.fixedAt = new Date().toISOString();
    return true;
  }

  /**
   * Mark a paper cut as won't fix
   */
  wontFix(id: string): boolean {
    const cut = this.paperCuts.find((c) => c.id === id);
    if (!cut) return false;

    cut.status = 'wontfix';
    return true;
  }

  /**
   * Get open paper cuts
   */
  getOpen(): PaperCut[] {
    return this.paperCuts.filter((c) => c.status === 'open');
  }

  /**
   * Get fixed paper cuts
   */
  getFixed(): PaperCut[] {
    return this.paperCuts.filter((c) => c.status === 'fixed');
  }

  /**
   * Get paper cuts by severity
   */
  getBySeverity(severity: 'low' | 'medium' | 'high'): PaperCut[] {
    return this.paperCuts.filter(
      (c) => c.severity === severity && c.status === 'open'
    );
  }

  /**
   * Get paper cuts by category
   */
  getByCategory(category: string): PaperCut[] {
    return this.paperCuts.filter(
      (c) => c.category === category && c.status === 'open'
    );
  }

  /**
   * Get count of open paper cuts
   */
  getOpenCount(): number {
    return this.getOpen().length;
  }

  /**
   * Check if threshold is exceeded
   */
  isThresholdExceeded(): boolean {
    return this.getOpenCount() > (this.config.threshold || 10);
  }

  /**
   * Get priority paper cuts (high severity or old)
   */
  getPriority(limit: number = 5): PaperCut[] {
    const open = this.getOpen();

    // Sort by severity (high first) then by age (oldest first)
    const sorted = open.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      const aSeverity = severityOrder[a.severity];
      const bSeverity = severityOrder[b.severity];

      if (aSeverity !== bSeverity) {
        return aSeverity - bSeverity;
      }

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return sorted.slice(0, limit);
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    total: number;
    open: number;
    fixed: number;
    wontfix: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
  } {
    const open = this.getOpen();

    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0 };

    for (const cut of open) {
      byCategory[cut.category] = (byCategory[cut.category] || 0) + 1;
      bySeverity[cut.severity]++;
    }

    return {
      total: this.paperCuts.length,
      open: open.length,
      fixed: this.paperCuts.filter((c) => c.status === 'fixed').length,
      wontfix: this.paperCuts.filter((c) => c.status === 'wontfix').length,
      byCategory,
      bySeverity,
    };
  }

  /**
   * Export all paper cuts
   */
  getAll(): PaperCut[] {
    return [...this.paperCuts];
  }
}

/**
 * Load paper cuts from database (helper function)
 */
async function loadPaperCutsFromDB(
  dbPath: string
): Promise<
  Array<{
    id: string;
    category: string;
    description: string;
    file_path?: string;
    line_number?: number;
    severity: string;
    status: string;
    created_at: string;
    fixed_at?: string;
  }>
> {
  // This would be implemented in the db.ts file
  // For now, return empty array
  return [];
}
