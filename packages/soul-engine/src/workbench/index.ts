/**
 * Workbench Components
 *
 * Components and utilities for the Sigil Workbench Vite SPA.
 */

export const WORKBENCH_VERSION = '0.4.0';

// ============ Types ============

export interface WorkbenchConfig {
  port: number;
  previewComponent?: string;
  enableSandbox: boolean;
}

export const DEFAULT_WORKBENCH_CONFIG: WorkbenchConfig = {
  port: 3333,
  enableSandbox: false,
};

// ============ Soul Binder Types ============

export interface SoulBinderConfig {
  projectRoot: string;
  configPath?: string;
  dbPath?: string;
  correctionsPath?: string;
}

export interface SoulContext {
  material: 'glass' | 'clay' | 'machinery';
  zone: string;
  tensions: {
    playfulness: number;
    weight: number;
    density: number;
    speed: number;
  };
  role?: string;
  corrections: Correction[];
}

export interface Correction {
  id: string;
  flaggedAt: string;
  issue: string;
  correction: string;
  appliesTo: string;
}

export interface PaperCut {
  id: string;
  category: string;
  description: string;
  filePath?: string;
  lineNumber?: number;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'fixed' | 'wontfix';
  createdAt: string;
  fixedAt?: string;
}

// ============ Exports ============

export { SoulBinder } from './SoulBinder.js';
export { generateClaudeContext, writeClaudeContext } from './claudeGenerator.js';
export { PaperCutTracker } from './PaperCutTracker.js';
export { ThreeToOneValidator } from './ThreeToOneValidator.js';
export { FounderModeAuditor } from './FounderModeAuditor.js';
