/**
 * Sigil v2.0 — Proprioception Module
 *
 * Manages self-predictions (legal lies) vs world-truth (server-only).
 * Implements confidence decay, ghost rendering, and reconciliation strategies.
 *
 * @module core/proprioception
 */

import type {
  SelfPredictionState,
  WorldTruthState,
  ProprioceptiveConfig,
  PositionRenderMode,
  ReconcileStrategy,
} from '../types';

// =============================================================================
// PROPRIOCEPTION STATE
// =============================================================================

/**
 * Internal state for proprioception management.
 */
export interface ProprioceptionState {
  /** Self predictions (can lie for responsive feel) */
  selfPrediction: SelfPredictionState;
  /** World truth (server confirmed only) */
  worldTruth: WorldTruthState;
  /** When the prediction started (for decay) */
  predictionStartTime: number | null;
  /** Active decay timer */
  decayTimer: ReturnType<typeof setTimeout> | null;
}

/**
 * Proprioception manager for tracking predictions vs truth.
 */
export interface ProprioceptionManager {
  /** Get current state */
  getState: () => ProprioceptionState;
  /** Start a self-prediction */
  predict: (prediction: Partial<SelfPredictionState>) => void;
  /** Update world truth from server */
  setWorldTruth: (truth: Partial<WorldTruthState>) => void;
  /** Reconcile self-prediction with world truth */
  reconcile: () => void;
  /** Get current confidence (0-1) based on time elapsed */
  getConfidence: () => number;
  /** Clear predictions and reset */
  reset: () => void;
  /** Cleanup timers */
  dispose: () => void;
}

// =============================================================================
// FACTORY
// =============================================================================

/**
 * Create a proprioception manager.
 *
 * Manages the separation between self-predictions (instant UI feedback)
 * and world-truth (server-confirmed state).
 *
 * @example
 * ```ts
 * const manager = createProprioception({
 *   self: {
 *     rotation: { instant: true },
 *     animation: { optimistic: true },
 *     position: {
 *       enabled: true,
 *       render: 'ghost',
 *       reconcile: 'lerp',
 *       maxDrift: 600,
 *     },
 *   },
 *   world: {
 *     damage: 'server-only',
 *     balance: 'server-only',
 *   },
 * });
 *
 * // Start prediction
 * manager.predict({ rotation: 45, position: { predicted: { x: 100, y: 100 }, confidence: 1, render: 'ghost' } });
 *
 * // Later, when server responds
 * manager.setWorldTruth({ confirmed: true, position: { x: 98, y: 102 } });
 * manager.reconcile();
 * ```
 */
export function createProprioception(
  config: ProprioceptiveConfig,
  onStateChange?: (state: ProprioceptionState) => void
): ProprioceptionManager {
  // Internal state
  let state: ProprioceptionState = {
    selfPrediction: {
      position: null,
      rotation: null,
      animation: null,
    },
    worldTruth: {
      confirmed: false,
    },
    predictionStartTime: null,
    decayTimer: null,
  };

  // Emit state change
  const emitChange = () => {
    onStateChange?.(state);
  };

  // Calculate confidence decay based on maxDrift
  const calculateConfidence = (): number => {
    if (!state.predictionStartTime) return 1;
    if (!config.self.position?.maxDrift) return 1;

    const elapsed = Date.now() - state.predictionStartTime;
    const maxDrift = config.self.position.maxDrift;

    // Linear decay from 1 to 0 over maxDrift
    return Math.max(0, 1 - elapsed / maxDrift);
  };

  // Start confidence decay timer
  const startDecayTimer = () => {
    if (state.decayTimer) {
      clearTimeout(state.decayTimer);
    }

    if (!config.self.position?.maxDrift) return;

    const maxDrift = config.self.position.maxDrift;
    const updateInterval = 50; // Update every 50ms for smooth decay

    const tick = () => {
      const confidence = calculateConfidence();

      if (state.selfPrediction.position) {
        state = {
          ...state,
          selfPrediction: {
            ...state.selfPrediction,
            position: {
              ...state.selfPrediction.position,
              confidence,
            },
          },
        };
        emitChange();
      }

      // If confidence is 0, force reconciliation
      if (confidence <= 0) {
        reconcile();
        return;
      }

      // Continue decay
      state.decayTimer = setTimeout(tick, updateInterval);
    };

    state.decayTimer = setTimeout(tick, updateInterval);
  };

  // Stop decay timer
  const stopDecayTimer = () => {
    if (state.decayTimer) {
      clearTimeout(state.decayTimer);
      state.decayTimer = null;
    }
  };

  // ==========================================================================
  // PUBLIC METHODS
  // ==========================================================================

  /**
   * Start a self-prediction.
   */
  const predict = (prediction: Partial<SelfPredictionState>) => {
    const now = Date.now();

    state = {
      ...state,
      selfPrediction: {
        position:
          prediction.position !== undefined
            ? prediction.position
            : state.selfPrediction.position,
        rotation:
          prediction.rotation !== undefined
            ? prediction.rotation
            : state.selfPrediction.rotation,
        animation:
          prediction.animation !== undefined
            ? prediction.animation
            : state.selfPrediction.animation,
      },
      predictionStartTime: now,
    };

    // Start decay timer if position prediction is enabled
    if (config.self.position?.enabled && prediction.position) {
      startDecayTimer();
    }

    emitChange();
  };

  /**
   * Update world truth from server.
   */
  const setWorldTruth = (truth: Partial<WorldTruthState>) => {
    state = {
      ...state,
      worldTruth: {
        ...state.worldTruth,
        ...truth,
      },
    };
    emitChange();
  };

  /**
   * Reconcile self-prediction with world truth.
   */
  const reconcile = () => {
    stopDecayTimer();

    const strategy = config.self.position?.reconcile || 'snap';

    if (strategy === 'ignore') {
      // Don't reconcile - client is truth
      return;
    }

    if (strategy === 'snap') {
      // Instant correction to server position
      state = {
        ...state,
        selfPrediction: {
          position: null,
          rotation: null,
          animation: null,
        },
        predictionStartTime: null,
      };
      emitChange();
      return;
    }

    if (strategy === 'lerp') {
      // Smooth interpolation - handled by the rendering layer
      // We just mark that reconciliation should happen
      state = {
        ...state,
        selfPrediction: {
          ...state.selfPrediction,
          position: state.selfPrediction.position
            ? {
                ...state.selfPrediction.position,
                confidence: 0, // Signal to lerp
              }
            : null,
        },
        predictionStartTime: null,
      };
      emitChange();

      // After a short delay, clear the prediction entirely
      setTimeout(() => {
        state = {
          ...state,
          selfPrediction: {
            position: null,
            rotation: null,
            animation: null,
          },
        };
        emitChange();
      }, 200); // 200ms lerp duration
    }
  };

  /**
   * Get current confidence.
   */
  const getConfidence = (): number => {
    return calculateConfidence();
  };

  /**
   * Reset state.
   */
  const reset = () => {
    stopDecayTimer();
    state = {
      selfPrediction: {
        position: null,
        rotation: null,
        animation: null,
      },
      worldTruth: {
        confirmed: false,
      },
      predictionStartTime: null,
      decayTimer: null,
    };
    emitChange();
  };

  /**
   * Cleanup timers.
   */
  const dispose = () => {
    stopDecayTimer();
  };

  /**
   * Get current state.
   */
  const getState = (): ProprioceptionState => state;

  return {
    getState,
    predict,
    setWorldTruth,
    reconcile,
    getConfidence,
    reset,
    dispose,
  };
}

// =============================================================================
// RECONCILIATION HELPERS
// =============================================================================

/**
 * Lerp (linear interpolation) between two values.
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Lerp between two positions.
 */
export function lerpPosition<T extends { x: number; y: number }>(
  start: T,
  end: T,
  t: number
): T {
  return {
    ...start,
    x: lerp(start.x, end.x, t),
    y: lerp(start.y, end.y, t),
  };
}

/**
 * Create initial self-prediction state based on config.
 */
export function createInitialPrediction(
  config?: ProprioceptiveConfig
): SelfPredictionState {
  return {
    position: null,
    rotation: null,
    animation: null,
  };
}

/**
 * Create a position prediction.
 */
export function createPositionPrediction(
  predicted: unknown,
  render: PositionRenderMode = 'ghost'
): SelfPredictionState['position'] {
  return {
    predicted,
    confidence: 1,
    render,
  };
}

// =============================================================================
// DEFAULTS
// =============================================================================

/**
 * Default proprioception config for server-tick (no predictions).
 */
export const SERVER_TICK_CONFIG: ProprioceptiveConfig = {
  self: {},
  world: {
    damage: 'server-only',
    balance: 'server-only',
    otherEntities: 'server-only',
  },
};

/**
 * Default proprioception config for game-style movement.
 */
export const GAME_MOVEMENT_CONFIG: ProprioceptiveConfig = {
  self: {
    rotation: { instant: true },
    animation: { optimistic: true },
    position: {
      enabled: true,
      render: 'ghost',
      reconcile: 'lerp',
      maxDrift: 600,
    },
  },
  world: {
    damage: 'server-only',
    balance: 'server-only',
    otherEntities: 'server-only',
  },
};

/**
 * Default proprioception config for optimistic UI (Linear-style).
 */
export const OPTIMISTIC_UI_CONFIG: ProprioceptiveConfig = {
  self: {
    animation: { optimistic: true },
  },
  world: {},
};
