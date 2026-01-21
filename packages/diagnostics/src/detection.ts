/**
 * Effect Detection
 *
 * Detect effect type from keywords, types, and context.
 */

import type { EffectType } from './types'

/**
 * Keywords that indicate financial operations
 */
const FINANCIAL_KEYWORDS = [
  'claim',
  'deposit',
  'withdraw',
  'transfer',
  'swap',
  'send',
  'pay',
  'purchase',
  'mint',
  'burn',
  'stake',
  'unstake',
  'bridge',
  'approve',
  'redeem',
  'harvest',
  'collect',
  'vest',
  'unlock',
  'liquidate',
  'borrow',
  'lend',
  'repay',
  'airdrop',
  'delegate',
  'undelegate',
  'redelegate',
  'bond',
  'unbond',
  'checkout',
  'order',
  'subscribe',
  'upgrade',
  'downgrade',
  'refund',
]

/**
 * Keywords that indicate destructive operations
 */
const DESTRUCTIVE_KEYWORDS = [
  'delete',
  'remove',
  'destroy',
  'revoke',
  'terminate',
  'purge',
  'erase',
  'wipe',
  'clear',
  'reset',
  'ban',
  'block',
  'suspend',
  'deactivate',
  'cancel',
  'void',
  'invalidate',
  'expire',
  'kill',
  'close account',
  'delete account',
  'remove access',
  'revoke permissions',
]

/**
 * Keywords that indicate soft delete operations
 */
const SOFT_DELETE_KEYWORDS = [
  'archive',
  'hide',
  'trash',
  'dismiss',
  'snooze',
  'mute',
  'silence',
  'ignore',
  'skip',
  'defer',
  'postpone',
  'mark as read',
  'mark as spam',
  'move to folder',
  'soft-delete',
  'temporary hide',
  'pause',
]

/**
 * Keywords that indicate standard operations
 */
const STANDARD_KEYWORDS = [
  'save',
  'update',
  'edit',
  'create',
  'add',
  'like',
  'follow',
  'bookmark',
  'favorite',
  'star',
  'pin',
  'tag',
  'label',
  'comment',
  'share',
  'repost',
  'quote',
  'reply',
  'mention',
  'react',
  'submit',
  'post',
  'publish',
  'upload',
  'attach',
  'link',
  'change',
  'modify',
  'set',
  'configure',
  'customize',
  'personalize',
]

/**
 * Keywords that indicate local state operations
 */
const LOCAL_KEYWORDS = [
  'toggle',
  'switch',
  'expand',
  'collapse',
  'select',
  'focus',
  'show',
  'hide',
  'open',
  'close',
  'reveal',
  'conceal',
  'check',
  'uncheck',
  'enable',
  'disable',
  'activate',
  'sort',
  'filter',
  'search',
  'zoom',
  'pan',
  'scroll',
  'dark mode',
  'light mode',
  'theme',
  'appearance',
  'display',
]

/**
 * Keywords that indicate navigation
 */
const NAVIGATION_KEYWORDS = [
  'navigate',
  'go',
  'back',
  'forward',
  'link',
  'route',
  'visit',
  'open page',
  'view',
  'browse',
  'explore',
  'next',
  'previous',
  'first',
  'last',
  'jump to',
  'tab',
  'step',
  'page',
  'section',
  'anchor',
]

/**
 * Keywords that indicate query operations
 */
const QUERY_KEYWORDS = [
  'fetch',
  'load',
  'get',
  'list',
  'search',
  'find',
  'query',
  'lookup',
  'retrieve',
  'request',
  'poll',
  'refresh',
  'reload',
  'sync',
  'check status',
  'preview',
  'peek',
  'inspect',
  'examine',
]

/**
 * Type patterns that override keyword detection
 */
const FINANCIAL_TYPE_PATTERNS = [
  'Currency',
  'Money',
  'Amount',
  'Wei',
  'BigInt',
  'Token',
  'Balance',
  'Price',
  'Fee',
]

/**
 * Context phrases that modify detection
 */
const SOFT_DELETE_CONTEXT = ['with undo', 'reversible', 'recycle bin', 'can undo']

/**
 * Check if any keyword matches
 */
function matchesKeywords(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase()
  return keywords.some((k) => lowerText.includes(k.toLowerCase()))
}

/**
 * Check if types indicate financial operations
 */
function hasFinancialTypes(types: string[]): boolean {
  return types.some((t) =>
    FINANCIAL_TYPE_PATTERNS.some(
      (pattern) =>
        t.includes(pattern) || t.toLowerCase().includes(pattern.toLowerCase())
    )
  )
}

/**
 * Check for soft delete context
 */
function hasSoftDeleteContext(text: string): boolean {
  const lowerText = text.toLowerCase()
  return SOFT_DELETE_CONTEXT.some((c) => lowerText.includes(c))
}

/**
 * Detect effect type from keywords and types
 *
 * Priority:
 * 1. Types override keywords (Currency, Wei, etc. → Financial)
 * 2. Context can modify detection (with undo → Soft Delete)
 * 3. Keywords determine base effect
 */
export function detectEffect(
  keywords: string[],
  types: string[] = []
): EffectType {
  const combinedText = keywords.join(' ')

  // 1. Type overrides - if financial types present, always financial
  if (hasFinancialTypes(types)) {
    return 'financial'
  }

  // 2. Context check - "with undo" converts destructive to soft-delete
  if (hasSoftDeleteContext(combinedText)) {
    // Only if it was going to be destructive
    if (matchesKeywords(combinedText, DESTRUCTIVE_KEYWORDS)) {
      return 'soft-delete'
    }
  }

  // 3. Keyword detection in priority order
  if (matchesKeywords(combinedText, FINANCIAL_KEYWORDS)) {
    return 'financial'
  }

  if (matchesKeywords(combinedText, DESTRUCTIVE_KEYWORDS)) {
    return 'destructive'
  }

  if (matchesKeywords(combinedText, SOFT_DELETE_KEYWORDS)) {
    return 'soft-delete'
  }

  if (matchesKeywords(combinedText, LOCAL_KEYWORDS)) {
    return 'local'
  }

  if (matchesKeywords(combinedText, NAVIGATION_KEYWORDS)) {
    return 'navigation'
  }

  if (matchesKeywords(combinedText, QUERY_KEYWORDS)) {
    return 'query'
  }

  if (matchesKeywords(combinedText, STANDARD_KEYWORDS)) {
    return 'standard'
  }

  // Default to standard
  return 'standard'
}

/**
 * Get expected physics for an effect type
 */
export function getExpectedPhysics(effect: EffectType): {
  sync: 'optimistic' | 'pessimistic' | 'immediate'
  timing: number
  confirmation: boolean
} {
  switch (effect) {
    case 'financial':
      return { sync: 'pessimistic', timing: 800, confirmation: true }
    case 'destructive':
      return { sync: 'pessimistic', timing: 600, confirmation: true }
    case 'soft-delete':
      return { sync: 'optimistic', timing: 200, confirmation: false }
    case 'standard':
      return { sync: 'optimistic', timing: 200, confirmation: false }
    case 'navigation':
      return { sync: 'immediate', timing: 150, confirmation: false }
    case 'query':
      return { sync: 'optimistic', timing: 150, confirmation: false }
    case 'local':
      return { sync: 'immediate', timing: 100, confirmation: false }
    default:
      return { sync: 'optimistic', timing: 200, confirmation: false }
  }
}

/**
 * Export keyword lists for external use
 */
export const keywords = {
  financial: FINANCIAL_KEYWORDS,
  destructive: DESTRUCTIVE_KEYWORDS,
  softDelete: SOFT_DELETE_KEYWORDS,
  standard: STANDARD_KEYWORDS,
  local: LOCAL_KEYWORDS,
  navigation: NAVIGATION_KEYWORDS,
  query: QUERY_KEYWORDS,
}
