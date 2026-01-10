/**
 * eslint-plugin-sigil
 *
 * ESLint plugin for Sigil design system enforcement.
 * Part of Sigil v7.6 "The Living Canon" - compile-time enforcement.
 *
 * @version 7.6.0
 *
 * Rules:
 * - enforce-tokens: Disallow arbitrary Tailwind values (use design tokens)
 * - zone-compliance: Enforce zone-appropriate animation timing
 * - input-physics: Enforce keyboard navigation in admin zones
 * - gold-imports-only: Enforce tier-based import restrictions (v7.6)
 *
 * @example
 * // eslint.config.js (flat config)
 * import sigil from 'eslint-plugin-sigil';
 *
 * export default [
 *   sigil.configs.recommended,
 *   // or manually configure:
 *   {
 *     plugins: { sigil },
 *     rules: {
 *       'sigil/enforce-tokens': 'error',
 *       'sigil/zone-compliance': 'warn',
 *       'sigil/input-physics': 'warn',
 *       'sigil/gold-imports-only': 'error',
 *     },
 *   },
 * ];
 */

import { enforceTokens } from "./rules/enforce-tokens";
import { zoneCompliance } from "./rules/zone-compliance";
import { inputPhysics } from "./rules/input-physics";
import { goldImportsOnly } from "./rules/gold-imports-only";
import { recommended, strict, relaxed } from "./configs/recommended";

// Re-export utilities for external use
export { loadConfig, clearConfigCache } from "./config-loader";
export type { SigilConfig, ZoneConfig, PhysicsConfig } from "./config-loader";
export { resolveZone, isInZone, getAllZones } from "./zone-resolver";
export type { ResolvedZone } from "./zone-resolver";

// Re-export rule option types
export type { EnforceTokensOptions } from "./rules/enforce-tokens";
export type { ZoneComplianceOptions } from "./rules/zone-compliance";
export type { InputPhysicsOptions } from "./rules/input-physics";
export type { GoldImportsOnlyOptions } from "./rules/gold-imports-only";

/**
 * Plugin rules
 */
export const rules = {
  "enforce-tokens": enforceTokens,
  "zone-compliance": zoneCompliance,
  "input-physics": inputPhysics,
  "gold-imports-only": goldImportsOnly,
};

/**
 * Plugin configurations
 */
export const configs = {
  recommended,
  strict,
  relaxed,
};

/**
 * Plugin meta information
 */
export const meta = {
  name: "eslint-plugin-sigil",
  version: "7.6.0",
};

/**
 * Default export for ESLint flat config compatibility
 */
const plugin = {
  meta,
  rules,
  configs,
};

export default plugin;
