/**
 * Three-to-One Rule Validator
 *
 * Enforces the principle: for every feature, fix 3 paper cuts.
 * This maintains product polish while shipping new functionality.
 */

import type { PaperCut } from './index.js';
import { PaperCutTracker } from './PaperCutTracker.js';

interface ThreeToOneConfig {
  ratio: number; // Default: 3 (3 fixes per feature)
  enforcement: 'advisory' | 'strict';
  dbPath: string;
}

interface ValidationResult {
  valid: boolean;
  fixesRequired: number;
  fixesCompleted: number;
  deficit: number;
  message: string;
  suggestedFixes: PaperCut[];
}

interface FeatureRecord {
  id: string;
  name: string;
  createdAt: string;
  fixesRequired: number;
  fixesCompleted: string[]; // Paper cut IDs
}

/**
 * Three-to-One Rule Validator
 *
 * Tracks feature additions and ensures paper cuts are fixed accordingly.
 */
export class ThreeToOneValidator {
  private config: ThreeToOneConfig;
  private paperCutTracker: PaperCutTracker;
  private features: FeatureRecord[] = [];
  private fixCount: number = 0;

  constructor(config: ThreeToOneConfig) {
    this.config = {
      ratio: 3,
      enforcement: 'advisory',
      ...config,
    };
    this.paperCutTracker = new PaperCutTracker({ dbPath: config.dbPath });
  }

  /**
   * Load state from database
   */
  async load(): Promise<void> {
    await this.paperCutTracker.load();
    // Features would be loaded from a features table
    // For now, we track in memory
  }

  /**
   * Register a new feature
   */
  registerFeature(name: string): FeatureRecord {
    const feature: FeatureRecord = {
      id: `feat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      createdAt: new Date().toISOString(),
      fixesRequired: this.config.ratio,
      fixesCompleted: [],
    };

    this.features.push(feature);
    return feature;
  }

  /**
   * Record a paper cut fix against a feature
   */
  recordFix(featureId: string, paperCutId: string): boolean {
    const feature = this.features.find((f) => f.id === featureId);
    if (!feature) return false;

    // Mark paper cut as fixed
    const fixed = this.paperCutTracker.fix(paperCutId);
    if (!fixed) return false;

    // Record fix against feature
    feature.fixesCompleted.push(paperCutId);
    this.fixCount++;

    return true;
  }

  /**
   * Validate if a feature can be shipped
   */
  validateFeature(featureId: string): ValidationResult {
    const feature = this.features.find((f) => f.id === featureId);

    if (!feature) {
      return {
        valid: false,
        fixesRequired: this.config.ratio,
        fixesCompleted: 0,
        deficit: this.config.ratio,
        message: 'Feature not found',
        suggestedFixes: [],
      };
    }

    const fixesCompleted = feature.fixesCompleted.length;
    const deficit = Math.max(0, feature.fixesRequired - fixesCompleted);
    const valid = deficit === 0;

    // Get suggested fixes if there's a deficit
    const suggestedFixes = valid
      ? []
      : this.paperCutTracker.getPriority(deficit);

    let message: string;
    if (valid) {
      message = `Feature "${feature.name}" has ${fixesCompleted} fixes. Ready to ship!`;
    } else if (this.config.enforcement === 'advisory') {
      message = `Advisory: Feature "${feature.name}" needs ${deficit} more fixes before shipping.`;
    } else {
      message = `Blocked: Feature "${feature.name}" requires ${deficit} more fixes before shipping.`;
    }

    return {
      valid: valid || this.config.enforcement === 'advisory',
      fixesRequired: feature.fixesRequired,
      fixesCompleted,
      deficit,
      message,
      suggestedFixes,
    };
  }

  /**
   * Get overall ratio compliance
   */
  getRatioCompliance(): {
    totalFeatures: number;
    totalFixesRequired: number;
    totalFixesCompleted: number;
    ratio: number;
    compliant: boolean;
  } {
    const totalFeatures = this.features.length;
    const totalFixesRequired = totalFeatures * this.config.ratio;
    const totalFixesCompleted = this.fixCount;
    const actualRatio =
      totalFeatures > 0 ? totalFixesCompleted / totalFeatures : 0;
    const compliant = actualRatio >= this.config.ratio;

    return {
      totalFeatures,
      totalFixesRequired,
      totalFixesCompleted,
      ratio: Math.round(actualRatio * 10) / 10,
      compliant,
    };
  }

  /**
   * Get features that need fixes
   */
  getIncompleteFeatures(): FeatureRecord[] {
    return this.features.filter(
      (f) => f.fixesCompleted.length < f.fixesRequired
    );
  }

  /**
   * Get features ready to ship
   */
  getReadyFeatures(): FeatureRecord[] {
    return this.features.filter(
      (f) => f.fixesCompleted.length >= f.fixesRequired
    );
  }

  /**
   * Get summary report
   */
  getSummary(): {
    compliance: ReturnType<typeof this.getRatioCompliance>;
    paperCuts: ReturnType<typeof this.paperCutTracker.getSummary>;
    incompleteFeatures: number;
    readyFeatures: number;
  } {
    return {
      compliance: this.getRatioCompliance(),
      paperCuts: this.paperCutTracker.getSummary(),
      incompleteFeatures: this.getIncompleteFeatures().length,
      readyFeatures: this.getReadyFeatures().length,
    };
  }

  /**
   * Get paper cut tracker instance
   */
  getPaperCutTracker(): PaperCutTracker {
    return this.paperCutTracker;
  }
}
