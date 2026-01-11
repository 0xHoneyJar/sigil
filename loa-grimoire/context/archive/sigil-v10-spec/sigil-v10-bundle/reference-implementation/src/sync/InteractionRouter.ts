/**
 * Sigil Soul Engine v10 — Interaction Router
 * 
 * Sync by interaction intent, not data type.
 * Text → CRDT. State → LWW. Money → Server-Tick.
 */

export type SyncStrategy = 'crdt' | 'lww' | 'server_tick' | 'none';

export interface SyncConfig {
  strategy: SyncStrategy;
  description: string;
  uiFeedback: UIFeedbackConfig;
  tickRateMs?: number;
}

export interface UIFeedbackConfig {
  optimistic: boolean;
  showPresence: boolean;
  pendingIndicator: 'none' | 'subtle' | 'prominent';
  confirmationStyle: 'none' | 'toast' | 'inline' | 'xp_drop';
}

// ═══════════════════════════════════════════════════════════════════════════
// SYNC STRATEGY CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

const CRDT_CONFIG: SyncConfig = {
  strategy: 'crdt',
  description: 'Collaborative text - every keystroke merges without conflict',
  uiFeedback: {
    optimistic: true,
    showPresence: true,
    pendingIndicator: 'subtle',
    confirmationStyle: 'none',
  },
};

const LWW_CONFIG: SyncConfig = {
  strategy: 'lww',
  description: 'Property state - last write wins per property',
  uiFeedback: {
    optimistic: true,
    showPresence: false,
    pendingIndicator: 'none',
    confirmationStyle: 'none',
  },
};

const SERVER_TICK_CONFIG: SyncConfig = {
  strategy: 'server_tick',
  description: 'High stakes - server is absolute truth, tick-aligned',
  tickRateMs: 600, // OSRS-style
  uiFeedback: {
    optimistic: false, // CRITICAL: Never optimistic for server_tick
    showPresence: false,
    pendingIndicator: 'prominent',
    confirmationStyle: 'xp_drop',
  },
};

const NO_SYNC_CONFIG: SyncConfig = {
  strategy: 'none',
  description: 'Local UI state only - no sync needed',
  uiFeedback: {
    optimistic: true,
    showPresence: false,
    pendingIndicator: 'none',
    confirmationStyle: 'none',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// INTERACTION ROUTER
// ═══════════════════════════════════════════════════════════════════════════

export class InteractionRouter {
  private explicitMappings: Map<string, SyncStrategy> = new Map();
  
  /**
   * Register explicit sync strategy for a data path
   */
  register(dataPath: string, strategy: SyncStrategy): void {
    this.explicitMappings.set(dataPath, strategy);
  }
  
  /**
   * Route an interaction to the appropriate sync strategy
   */
  route(context: {
    dataPath?: string;
    interactionType?: string;
    description?: string;
  }): SyncConfig {
    // 1. Check explicit mappings
    if (context.dataPath && this.explicitMappings.has(context.dataPath)) {
      return this.getConfigForStrategy(this.explicitMappings.get(context.dataPath)!);
    }
    
    // 2. Classify by keywords
    const strategy = this.classifyByKeywords(context.description || context.interactionType || '');
    
    return this.getConfigForStrategy(strategy);
  }
  
  /**
   * Classify interaction by keyword detection
   */
  private classifyByKeywords(text: string): SyncStrategy {
    const lower = text.toLowerCase();
    
    // Server-tick signals (highest priority - safety critical)
    const tickSignals = [
      'trade', 'transfer', 'buy', 'sell', 'attack', 'claim',
      'money', 'currency', 'balance', 'wallet', 'health', 'hp',
      'inventory', 'item', 'withdraw', 'deposit', 'payment',
      'transaction', 'combat', 'competitive'
    ];
    if (tickSignals.some(s => lower.includes(s))) {
      return 'server_tick';
    }
    
    // CRDT signals (collaborative text)
    const crdtSignals = [
      'edit', 'type', 'write', 'comment', 'message', 'document',
      'text', 'draft', 'note', 'content', 'description', 'body',
      'collaborative', 'shared'
    ];
    if (crdtSignals.some(s => lower.includes(s))) {
      return 'crdt';
    }
    
    // LWW signals (property state)
    const lwwSignals = [
      'move', 'toggle', 'select', 'preference', 'status', 'position',
      'state', 'setting', 'config', 'option', 'choice', 'switch'
    ];
    if (lwwSignals.some(s => lower.includes(s))) {
      return 'lww';
    }
    
    // Local-only signals
    const localSignals = [
      'modal', 'dropdown', 'hover', 'focus', 'ui', 'view',
      'tab', 'panel', 'sidebar'
    ];
    if (localSignals.some(s => lower.includes(s))) {
      return 'none';
    }
    
    // Default to LWW (most common, lowest overhead)
    return 'lww';
  }
  
  /**
   * Get full config for a strategy
   */
  private getConfigForStrategy(strategy: SyncStrategy): SyncConfig {
    switch (strategy) {
      case 'crdt':
        return CRDT_CONFIG;
      case 'lww':
        return LWW_CONFIG;
      case 'server_tick':
        return SERVER_TICK_CONFIG;
      case 'none':
        return NO_SYNC_CONFIG;
      default:
        return LWW_CONFIG;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

export const interactionRouter = new InteractionRouter();

// Pre-register common paths
interactionRouter.register('user.settings', 'lww');
interactionRouter.register('user.preferences', 'lww');
interactionRouter.register('document.content', 'crdt');
interactionRouter.register('player.balance', 'server_tick');
interactionRouter.register('player.inventory', 'server_tick');
interactionRouter.register('player.health', 'server_tick');
interactionRouter.register('trade.*', 'server_tick');
interactionRouter.register('comment.body', 'crdt');

// ═══════════════════════════════════════════════════════════════════════════
// DETECTION HELPER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pre-check for sync strategy selection
 * Use this before implementing any data feature
 */
export function detectSyncStrategy(featureDescription: string): {
  strategy: SyncStrategy;
  rationale: string;
  warnings: string[];
} {
  const config = interactionRouter.route({ description: featureDescription });
  
  const warnings: string[] = [];
  
  if (config.strategy === 'server_tick') {
    warnings.push('⚠️ Server-tick detected: NEVER use optimistic UI for this data');
    warnings.push('⚠️ Must show pending state while waiting for server confirmation');
  }
  
  if (config.strategy === 'crdt') {
    warnings.push('ℹ️ CRDT detected: Consider adding presence cursors for collaborators');
  }
  
  return {
    strategy: config.strategy,
    rationale: config.description,
    warnings,
  };
}
