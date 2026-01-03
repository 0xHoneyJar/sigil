/**
 * Sync / Interaction Router
 *
 * Sync by interaction intent, not data type.
 * Text -> CRDT. State -> LWW. Money -> Server-Tick.
 *
 * Sprint 11: Enhanced Interaction Router with sync hooks
 * - InteractionRouter class with comprehensive keyword classification
 * - Explicit declaration system with SQLite persistence
 * - React hooks: useServerTick, useLocalFirst, useCRDTText
 * - Claude Code hook scripts for sync validation
 */

// ============ TYPES ============
export type {
  SyncStrategy,
  UIFeedbackConfig,
  SyncConfig,
  DeclarationRecord,
  SyncDeclaration,
  RouteContext,
  RouteResult,
  SyncDetectionResult,
  SyncWarning,
  UseServerTickOptions,
  UseServerTickResult,
  UseLocalFirstOptions,
  UseLocalFirstResult,
  CRDTPresence,
  UseCRDTTextOptions,
  UseCRDTTextResult,
} from './types.js';

// ============ INTERACTION ROUTER ============
export {
  InteractionRouter,
  STRATEGY_SIGNALS,
  classifyByKeywords,
  detectSyncStrategy,
  getSyncConfig,
  getSyncWarnings,
  declareSyncStrategy,
  getDefaultRouter,
  initializeRouter,
} from './InteractionRouter.js';

// ============ SYNC HOOKS ============
export { useServerTick, isServerTickResult } from './useServerTick.js';
export { useLocalFirst, isLocalFirstResult } from './useLocalFirst.js';
export { useCRDTText, isCRDTTextResult } from './useCRDTText.js';

// ============ PERSISTENCE ============
export {
  loadDeclarations,
  saveDeclaration,
  deleteDeclaration,
  getDeclaration,
  getDeclarationsByStrategy,
  countDeclarationsByStrategy,
  createPersistedRouter,
  validateDeclarations,
} from './persistence.js';
