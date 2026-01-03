/**
 * @sigil/soul-engine
 *
 * Design context framework with Material physics, Tension controls,
 * and Sync routing for AI-assisted product development.
 *
 * @packageDocumentation
 */

// Re-export from submodules
export * from './material';
export * from './hooks';
export * from './sync';

// Core types
export type { SigilConfig, ZoneConfig, TensionPreset } from './lib/config';
export type { SigilDatabase } from './lib/db';

// Version
export const VERSION = '0.4.0';
