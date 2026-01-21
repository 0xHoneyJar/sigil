/**
 * Warden Types
 *
 * Type definitions for the Warden ground truth enforcement system.
 */

import type { Zone, WardenInput, WardenResult, CheckResult } from '../types.js';

/** Sync strategy from physics table */
export type SyncStrategy = 'pessimistic' | 'optimistic' | 'immediate';

/** Confirmation requirement */
export type ConfirmationType = 'required' | 'toast_undo' | 'none';

/** Effect type from physics/lexicon */
export type EffectType =
  | 'financial'
  | 'destructive'
  | 'soft_delete'
  | 'standard'
  | 'navigation'
  | 'query'
  | 'local'
  | 'high_freq';

/** Physics rule for an effect type */
export interface PhysicsRule {
  /** Effect type */
  effect: EffectType;
  /** Sync strategy */
  sync: SyncStrategy;
  /** Timing in milliseconds */
  timing: number;
  /** Confirmation requirement */
  confirmation: ConfirmationType;
  /** Rationale for this physics */
  rationale: string;
}

/** Physics table mapping effect to rules */
export type PhysicsTable = Map<EffectType, PhysicsRule>;

/** Vocabulary entry linking keywords to effects */
export interface VocabularyEntry {
  /** Keywords that trigger this effect */
  keywords: string[];
  /** Associated effect type */
  effect: EffectType;
  /** Category (primary, extended, web3, etc.) */
  category: string;
}

/** Full vocabulary mapping */
export interface Vocabulary {
  /** Effect keywords grouped by effect type */
  effects: Map<EffectType, VocabularyEntry>;
  /** Type overrides that force specific effects */
  typeOverrides: Map<string, EffectType>;
  /** Domain context defaults */
  domainDefaults: Map<string, EffectType>;
}

/** Grounding statement parsed from agent output */
export interface GroundingStatement {
  /** Component or action being described */
  component: string;
  /** Zone cited by agent (if any) */
  citedZone: Zone | null;
  /** Keywords detected in the statement */
  detectedKeywords: string[];
  /** Effect inferred from keywords */
  inferredEffect: EffectType | null;
  /** Physics rules claimed to be applied */
  claimedPhysics: {
    sync?: SyncStrategy;
    timing?: number;
    confirmation?: ConfirmationType;
  };
  /** Raw statement text */
  raw: string;
}

/** Validation check names */
export type CheckName = 'relevance' | 'hierarchy' | 'rules';

/** Extended check result with details */
export interface ExtendedCheckResult extends CheckResult {
  /** Check name */
  name: CheckName;
  /** Expected value (if applicable) */
  expected?: string;
  /** Actual value (if applicable) */
  actual?: string;
}

/** Warden validation context */
export interface ValidationContext {
  /** Parsed grounding statement */
  statement: GroundingStatement;
  /** Physics table */
  physics: PhysicsTable;
  /** Vocabulary */
  vocabulary: Vocabulary;
  /** Required zone based on keywords */
  requiredZone: Zone;
}

// Re-export types from main types file
export type { Zone, WardenInput, WardenResult, CheckResult };
