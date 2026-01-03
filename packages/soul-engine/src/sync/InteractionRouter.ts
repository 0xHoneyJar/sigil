/**
 * Interaction Router
 *
 * Routes sync strategies based on interaction intent, not data type.
 * Uses keyword classification with explicit declaration fallback.
 *
 * From SDD: "Unknown sync patterns require explicit declaration"
 * From PRD: "Server-tick data MUST show pending state"
 */

import type {
  SyncStrategy,
  SyncConfig,
  DeclarationRecord,
  SyncDeclaration,
  RouteContext,
  RouteResult,
  SyncDetectionResult,
  SyncWarning,
  UIFeedbackConfig,
} from './types.js';

/**
 * Strategy signal keywords - comprehensive list per SDD Section 5
 */
export const STRATEGY_SIGNALS: Record<SyncStrategy, string[]> = {
  server_tick: [
    // Financial
    'trade', 'transfer', 'buy', 'sell', 'purchase', 'payment', 'transaction',
    'money', 'currency', 'balance', 'wallet', 'deposit', 'withdraw', 'refund',
    'price', 'cost', 'fee', 'credit', 'debit', 'invoice', 'checkout',
    // Gaming - combat & resources
    'attack', 'defend', 'combat', 'damage', 'heal', 'health', 'hp', 'mp',
    'mana', 'stamina', 'energy', 'xp', 'experience', 'level', 'stats',
    // Gaming - items & inventory
    'inventory', 'item', 'equip', 'unequip', 'drop', 'pickup', 'loot',
    'craft', 'enchant', 'upgrade', 'consumable', 'potion',
    // Claims & ownership
    'claim', 'stake', 'unstake', 'mint', 'burn', 'lock', 'unlock',
    'vest', 'delegate', 'undelegate',
    // Competitive
    'competitive', 'ranked', 'match', 'score', 'leaderboard', 'tournament',
    'bet', 'wager', 'gamble',
  ],
  crdt: [
    // Text editing
    'edit', 'type', 'write', 'draft', 'compose', 'author',
    // Documents
    'document', 'doc', 'page', 'article', 'post', 'blog',
    // Content
    'text', 'content', 'body', 'description', 'bio', 'about',
    // Collaboration
    'comment', 'reply', 'thread', 'discussion', 'feedback',
    'message', 'chat', 'conversation',
    // Shared state
    'collaborative', 'shared', 'realtime', 'live', 'multiplayer',
    // Notes
    'note', 'memo', 'journal', 'diary', 'log',
  ],
  lww: [
    // Toggles & switches
    'toggle', 'switch', 'enable', 'disable', 'on', 'off',
    // Selection
    'select', 'choose', 'pick', 'option', 'choice',
    // State changes
    'move', 'drag', 'resize', 'reorder', 'sort',
    'position', 'location', 'coordinates',
    // Settings
    'preference', 'setting', 'config', 'configuration', 'customize',
    'theme', 'mode', 'layout', 'display',
    // Status
    'status', 'state', 'flag', 'mark', 'pin', 'star', 'favorite',
    'archive', 'trash', 'delete', 'restore',
    // Profile
    'avatar', 'profile', 'username', 'nickname', 'presence',
  ],
  none: [
    // UI state
    'modal', 'dialog', 'popup', 'overlay', 'tooltip',
    'dropdown', 'menu', 'submenu', 'context',
    // Interaction states
    'hover', 'focus', 'blur', 'active', 'pressed',
    'expand', 'collapse', 'open', 'close', 'show', 'hide',
    // Navigation
    'tab', 'panel', 'sidebar', 'drawer', 'sheet',
    'view', 'screen', 'route', 'navigate',
    // Temporary UI
    'animation', 'transition', 'loading', 'skeleton',
    'placeholder', 'preview', 'thumbnail',
  ],
};

/**
 * Default UI feedback configurations per strategy
 */
const DEFAULT_UI_FEEDBACK: Record<SyncStrategy, UIFeedbackConfig> = {
  server_tick: {
    optimistic: false, // NEVER optimistic for server_tick
    showPresence: false,
    pendingIndicator: 'prominent', // MUST show pending state
    confirmationStyle: 'material',
  },
  crdt: {
    optimistic: true,
    showPresence: true, // Show collaborator cursors
    pendingIndicator: 'subtle',
    confirmationStyle: 'none',
  },
  lww: {
    optimistic: true,
    showPresence: false,
    pendingIndicator: 'none',
    confirmationStyle: 'toast',
  },
  none: {
    optimistic: true,
    showPresence: false,
    pendingIndicator: 'none',
    confirmationStyle: 'none',
  },
};

/**
 * Strategy descriptions
 */
const STRATEGY_DESCRIPTIONS: Record<SyncStrategy, string> = {
  server_tick: 'High stakes - server is absolute truth, tick-aligned',
  crdt: 'Collaborative text - every keystroke merges without conflict',
  lww: 'Property state - last write wins per property',
  none: 'Local UI state only - no sync needed',
};

/**
 * Get sync warnings for a strategy
 */
export function getSyncWarnings(strategy: SyncStrategy): SyncWarning[] {
  const warnings: SyncWarning[] = [];

  switch (strategy) {
    case 'server_tick':
      warnings.push({
        strategy: 'server_tick',
        severity: 'critical',
        message: 'NEVER use optimistic UI for server-tick data',
        recommendation:
          'Always show pending indicator while waiting for server confirmation',
      });
      warnings.push({
        strategy: 'server_tick',
        severity: 'warning',
        message: 'User actions must be disabled while pending',
        recommendation:
          'Disable submit buttons and show processing state during server round-trip',
      });
      break;
    case 'crdt':
      warnings.push({
        strategy: 'crdt',
        severity: 'info',
        message: 'Consider adding presence cursors for collaborators',
        recommendation:
          'Show colored cursors and selections for each active collaborator',
      });
      warnings.push({
        strategy: 'crdt',
        severity: 'warning',
        message: 'CRDT operations can increase payload size',
        recommendation:
          'Consider periodic compaction for long-running documents',
      });
      break;
    case 'lww':
      warnings.push({
        strategy: 'lww',
        severity: 'info',
        message: 'Last write wins - potential for data loss in conflicts',
        recommendation:
          'Use timestamps for conflict resolution, consider showing conflict UI for important data',
      });
      break;
    case 'none':
      // No warnings for local-only state
      break;
  }

  return warnings;
}

/**
 * Classify interaction by keyword detection
 * Enhanced version with confidence scoring
 */
export function classifyByKeywords(text: string): SyncDetectionResult {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const matchedKeywords: Record<SyncStrategy, string[]> = {
    server_tick: [],
    crdt: [],
    lww: [],
    none: [],
  };

  // Count matches for each strategy
  for (const strategy of Object.keys(STRATEGY_SIGNALS) as SyncStrategy[]) {
    for (const signal of STRATEGY_SIGNALS[strategy]) {
      // Check for word boundary matches (more precise)
      if (words.some((w) => w === signal || w.includes(signal))) {
        matchedKeywords[strategy].push(signal);
      }
    }
  }

  // Priority order: server_tick > crdt > lww > none
  // Server-tick is highest priority because safety-critical
  const priorities: SyncStrategy[] = ['server_tick', 'crdt', 'lww', 'none'];

  for (const strategy of priorities) {
    if (matchedKeywords[strategy].length > 0) {
      const matchCount = matchedKeywords[strategy].length;
      const confidence =
        matchCount >= 3 ? 'high' : matchCount >= 2 ? 'medium' : 'low';

      return {
        strategy,
        rationale: STRATEGY_DESCRIPTIONS[strategy],
        warnings: getSyncWarnings(strategy).map((w) => w.message),
        confidence,
        matchedKeywords: matchedKeywords[strategy],
      };
    }
  }

  // Unknown pattern
  return {
    strategy: null,
    rationale: 'Unknown pattern - requires explicit declaration',
    warnings: ['Pattern not recognized. Use declareSyncStrategy() to specify.'],
    confidence: 'low',
    matchedKeywords: [],
  };
}

/**
 * Detect sync strategy for a feature description
 * Returns structured result with rationale and warnings
 */
export function detectSyncStrategy(featureDescription: string): SyncDetectionResult {
  return classifyByKeywords(featureDescription);
}

/**
 * Get full sync configuration for a strategy
 */
export function getSyncConfig(
  strategy: SyncStrategy,
  tickRateMs?: number
): SyncConfig {
  return {
    strategy,
    description: STRATEGY_DESCRIPTIONS[strategy],
    uiFeedback: DEFAULT_UI_FEEDBACK[strategy],
    tickRateMs: strategy === 'server_tick' ? (tickRateMs ?? 600) : undefined,
  };
}

/**
 * InteractionRouter class
 *
 * Main routing class that combines:
 * 1. Explicit declarations (highest priority)
 * 2. Keyword classification
 * 3. Declaration requirement for unknowns
 */
export class InteractionRouter {
  private declarations: Map<string, DeclarationRecord> = new Map();
  private onDeclarationSave?: (record: DeclarationRecord) => Promise<void>;

  constructor(options?: {
    initialDeclarations?: DeclarationRecord[];
    onDeclarationSave?: (record: DeclarationRecord) => Promise<void>;
  }) {
    // Load initial declarations
    if (options?.initialDeclarations) {
      for (const decl of options.initialDeclarations) {
        this.declarations.set(decl.dataPath, decl);
      }
    }
    this.onDeclarationSave = options?.onDeclarationSave;
  }

  /**
   * Load declarations from external source (e.g., SQLite)
   */
  loadDeclarations(declarations: DeclarationRecord[]): void {
    for (const decl of declarations) {
      this.declarations.set(decl.dataPath, decl);
    }
  }

  /**
   * Get all current declarations
   */
  getDeclarations(): DeclarationRecord[] {
    return Array.from(this.declarations.values());
  }

  /**
   * Check if a path matches a pattern (supports wildcards)
   */
  private matchPath(pattern: string, path: string): boolean {
    // Exact match
    if (pattern === path) return true;

    // Wildcard matching
    const regex = new RegExp(
      '^' +
        pattern
          .replace(/\./g, '\\.')
          .replace(/\*\*/g, '.*')
          .replace(/\*/g, '[^.]+') +
        '$'
    );
    return regex.test(path);
  }

  /**
   * Find declaration for a data path
   */
  findDeclaration(dataPath: string): DeclarationRecord | undefined {
    // First check exact match
    if (this.declarations.has(dataPath)) {
      return this.declarations.get(dataPath);
    }

    // Then check pattern matches
    for (const [pattern, decl] of this.declarations) {
      if (this.matchPath(pattern, dataPath)) {
        return decl;
      }
    }

    return undefined;
  }

  /**
   * Route a sync strategy for a given context
   * Returns SyncConfig if determined, or requiresDeclaration if unknown
   */
  route(context: RouteContext): RouteResult {
    // 1. Check explicit declarations (highest priority)
    const explicit = this.findDeclaration(context.dataPath);
    if (explicit) {
      return getSyncConfig(explicit.strategy);
    }

    // 2. Try keyword classification
    const detected = classifyByKeywords(context.description);
    if (detected.strategy) {
      return getSyncConfig(detected.strategy);
    }

    // 3. Unknown - require explicit declaration (PRD: "no guessing")
    // Provide suggestions based on common patterns
    const suggestions: SyncStrategy[] = [];

    // Heuristic suggestions based on path patterns
    if (context.dataPath.includes('balance') || context.dataPath.includes('transaction')) {
      suggestions.push('server_tick');
    }
    if (context.dataPath.includes('document') || context.dataPath.includes('text')) {
      suggestions.push('crdt');
    }
    if (context.dataPath.includes('setting') || context.dataPath.includes('preference')) {
      suggestions.push('lww');
    }
    if (context.dataPath.includes('ui') || context.dataPath.includes('modal')) {
      suggestions.push('none');
    }

    // If no suggestions, provide all options
    if (suggestions.length === 0) {
      suggestions.push('lww', 'server_tick', 'crdt');
    }

    return {
      requiresDeclaration: true,
      reason: `Unknown sync pattern for "${context.dataPath}". Cannot determine appropriate strategy from description: "${context.description}"`,
      suggestions,
    };
  }

  /**
   * Declare a sync strategy for a data path
   */
  async declare(
    declaration: SyncDeclaration,
    declaredBy: string
  ): Promise<DeclarationRecord> {
    const record: DeclarationRecord = {
      dataPath: declaration.dataPath,
      strategy: declaration.strategy,
      declaredBy,
      declaredAt: new Date().toISOString(),
      rationale: declaration.rationale,
    };

    this.declarations.set(record.dataPath, record);

    // Persist if callback provided
    if (this.onDeclarationSave) {
      await this.onDeclarationSave(record);
    }

    return record;
  }

  /**
   * Remove a declaration
   */
  removeDeclaration(dataPath: string): boolean {
    return this.declarations.delete(dataPath);
  }

  /**
   * Get sync warnings for a specific strategy
   */
  getWarnings(strategy: SyncStrategy): SyncWarning[] {
    return getSyncWarnings(strategy);
  }
}

/**
 * Helper function to declare sync strategy
 * Convenience wrapper for common use case
 */
export function declareSyncStrategy(
  router: InteractionRouter,
  dataPath: string,
  strategy: SyncStrategy,
  rationale: string,
  declaredBy: string = 'developer'
): Promise<DeclarationRecord> {
  return router.declare({ dataPath, strategy, rationale }, declaredBy);
}

// Singleton instance for convenience
let defaultRouter: InteractionRouter | null = null;

/**
 * Get or create the default router instance
 */
export function getDefaultRouter(): InteractionRouter {
  if (!defaultRouter) {
    defaultRouter = new InteractionRouter();
  }
  return defaultRouter;
}

/**
 * Initialize the default router with declarations
 */
export function initializeRouter(options: {
  declarations?: DeclarationRecord[];
  onDeclarationSave?: (record: DeclarationRecord) => Promise<void>;
}): InteractionRouter {
  defaultRouter = new InteractionRouter({
    initialDeclarations: options.declarations,
    onDeclarationSave: options.onDeclarationSave,
  });
  return defaultRouter;
}
