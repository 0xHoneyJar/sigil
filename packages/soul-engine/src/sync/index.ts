/**
 * Sync / Interaction Router
 *
 * Sync by interaction intent, not data type.
 * Text -> CRDT. State -> LWW. Money -> Server-Tick.
 */

export type SyncStrategy = 'crdt' | 'lww' | 'server_tick' | 'none';

export interface UIFeedbackConfig {
  optimistic: boolean;
  showPresence: boolean;
  pendingIndicator: 'none' | 'subtle' | 'prominent';
  confirmationStyle: 'none' | 'toast' | 'inline' | 'material';
}

export interface SyncConfig {
  strategy: SyncStrategy;
  description: string;
  uiFeedback: UIFeedbackConfig;
  tickRateMs?: number;
}

export interface DeclarationRecord {
  dataPath: string;
  strategy: SyncStrategy;
  declaredBy: string;
  declaredAt: string;
  rationale: string;
}

// Strategy signal keywords
export const STRATEGY_SIGNALS: Record<SyncStrategy, string[]> = {
  server_tick: [
    'trade',
    'transfer',
    'buy',
    'sell',
    'attack',
    'claim',
    'money',
    'currency',
    'balance',
    'wallet',
    'health',
    'hp',
    'inventory',
    'item',
    'withdraw',
    'deposit',
    'payment',
    'transaction',
    'combat',
    'competitive',
  ],
  crdt: [
    'edit',
    'type',
    'write',
    'comment',
    'message',
    'document',
    'text',
    'draft',
    'note',
    'content',
    'description',
    'body',
    'collaborative',
    'shared',
  ],
  lww: [
    'move',
    'toggle',
    'select',
    'preference',
    'status',
    'position',
    'state',
    'setting',
    'config',
    'option',
    'choice',
    'switch',
  ],
  none: [
    'modal',
    'dropdown',
    'hover',
    'focus',
    'ui',
    'view',
    'tab',
    'panel',
    'sidebar',
  ],
};

/**
 * Classify interaction by keyword detection
 */
export function classifyByKeywords(text: string): SyncStrategy | null {
  const lower = text.toLowerCase();

  // Server-tick signals (highest priority - safety critical)
  if (STRATEGY_SIGNALS.server_tick.some((s) => lower.includes(s))) {
    return 'server_tick';
  }

  // CRDT signals (collaborative text)
  if (STRATEGY_SIGNALS.crdt.some((s) => lower.includes(s))) {
    return 'crdt';
  }

  // LWW signals (property state)
  if (STRATEGY_SIGNALS.lww.some((s) => lower.includes(s))) {
    return 'lww';
  }

  // Local-only signals
  if (STRATEGY_SIGNALS.none.some((s) => lower.includes(s))) {
    return 'none';
  }

  // Unknown - requires explicit declaration
  return null;
}

/**
 * Detect sync strategy for a feature description
 */
export function detectSyncStrategy(featureDescription: string): {
  strategy: SyncStrategy | null;
  rationale: string;
  warnings: string[];
} {
  const strategy = classifyByKeywords(featureDescription);
  const warnings: string[] = [];

  if (strategy === 'server_tick') {
    warnings.push(
      'Server-tick detected: NEVER use optimistic UI for this data'
    );
    warnings.push('Must show pending state while waiting for server confirmation');
  }

  if (strategy === 'crdt') {
    warnings.push('CRDT detected: Consider adding presence cursors for collaborators');
  }

  if (strategy === null) {
    return {
      strategy: null,
      rationale: 'Unknown pattern - requires explicit declaration',
      warnings: ['Pattern not recognized. Use declareSyncStrategy() to specify.'],
    };
  }

  const descriptions: Record<SyncStrategy, string> = {
    server_tick: 'High stakes - server is absolute truth, tick-aligned',
    crdt: 'Collaborative text - every keystroke merges without conflict',
    lww: 'Property state - last write wins per property',
    none: 'Local UI state only - no sync needed',
  };

  return {
    strategy,
    rationale: descriptions[strategy],
    warnings,
  };
}
