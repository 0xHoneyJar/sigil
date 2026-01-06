/**
 * Sigil v2.0 — Shared Types
 *
 * Core type definitions used across the Reality Engine.
 *
 * @module types
 */

// =============================================================================
// TIME AUTHORITY
// =============================================================================

/**
 * Who owns the clock.
 *
 * - `optimistic` — Client owns clock. Instant update. Silent rollback.
 * - `server-tick` — Server owns clock. Must show pending. Visible rollback.
 * - `hybrid` — Optimistic with sync indicator. Visible rollback.
 */
export type TimeAuthority = 'optimistic' | 'server-tick' | 'hybrid';

// =============================================================================
// ACTION STATUS
// =============================================================================

/**
 * Status of a critical action.
 *
 * Flow:
 * - idle → confirming (optional) → pending → confirmed | failed
 */
export type CriticalActionStatus =
  | 'idle'
  | 'confirming'
  | 'pending'
  | 'confirmed'
  | 'failed';

// =============================================================================
// RISK LEVELS
// =============================================================================

/**
 * Risk level of an action.
 *
 * Used for UI treatment (e.g., high risk shows warnings).
 */
export type Risk = 'low' | 'medium' | 'high';

// =============================================================================
// PROPRIOCEPTION
// =============================================================================

/**
 * Position prediction render mode.
 *
 * - `ghost` — Show transparent prediction
 * - `solid` — Show solid prediction
 * - `hidden` — Don't render prediction
 */
export type PositionRenderMode = 'ghost' | 'solid' | 'hidden';

/**
 * Position reconciliation strategy.
 *
 * - `snap` — Instantly correct to server position
 * - `lerp` — Smoothly interpolate to server position
 * - `ignore` — Don't reconcile (client is truth)
 */
export type ReconcileStrategy = 'snap' | 'lerp' | 'ignore';

/**
 * Self-prediction state (legal lies for responsive feel).
 */
export interface SelfPredictionState {
  /** Predicted position with confidence */
  position: {
    predicted: unknown;
    confidence: number;
    render: PositionRenderMode;
  } | null;
  /** Predicted rotation (instant) */
  rotation: number | null;
  /** Predicted animation state */
  animation: string | null;
}

/**
 * World truth state (server-only, no lies).
 */
export interface WorldTruthState {
  /** Whether server has confirmed the action */
  confirmed: boolean;
  /** Server-confirmed position */
  position?: unknown;
}

/**
 * Self-prediction configuration.
 */
export interface SelfPredictionConfig {
  /** Face target immediately (legal lie) */
  rotation?: { instant: boolean };
  /** Start animation immediately (legal lie) */
  animation?: { optimistic: boolean };
  /** Position prediction config */
  position?: {
    enabled: boolean;
    render: PositionRenderMode;
    reconcile: ReconcileStrategy;
    /** Max ms prediction can diverge before forced reconcile */
    maxDrift: number;
  };
}

/**
 * World truth configuration.
 */
export interface WorldTruthConfig {
  /** HP changes — server only */
  damage?: 'server-only';
  /** Money changes — server only */
  balance?: 'server-only';
  /** Other players — server only */
  otherEntities?: 'server-only';
}

/**
 * Proprioceptive configuration.
 *
 * Separates self-predictions (legal lies) from world-truth (server-only).
 *
 * @example Game-style movement
 * ```ts
 * proprioception: {
 *   self: {
 *     rotation: { instant: true },
 *     animation: { optimistic: true },
 *     position: { enabled: true, render: 'ghost', reconcile: 'lerp', maxDrift: 600 },
 *   },
 *   world: {
 *     damage: 'server-only',
 *     balance: 'server-only',
 *   },
 * }
 * ```
 */
export interface ProprioceptiveConfig {
  /** Self predictions (legal lies) */
  self: SelfPredictionConfig;
  /** World truth (server-only) */
  world: WorldTruthConfig;
}

// =============================================================================
// ZONE TYPES
// =============================================================================

/**
 * Zone type for layout context.
 */
export type ZoneType = 'critical' | 'admin' | 'marketing' | 'default';

/**
 * Lens classification.
 *
 * - `cosmetic` — Colors, fonts, animations (safe everywhere)
 * - `utility` — Overlays, highlights (warning in critical)
 * - `gameplay` — Input hints (blocked in critical/financial)
 */
export type LensClassification = 'cosmetic' | 'utility' | 'gameplay';
