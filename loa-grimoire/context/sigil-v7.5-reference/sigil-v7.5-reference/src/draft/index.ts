/**
 * Sigil Draft Registry
 * 
 * Components exported here are "Draft" status — experimental patterns
 * that are still being validated.
 * 
 * Draft can import: Gold, Silver, Draft (anything)
 * Draft CANNOT be imported by: Gold
 * 
 * Draft code CAN be merged to main (quarantine, not blockade)
 * But Gold code cannot depend on Draft code (contagion rules)
 * 
 * @draft — All exports here are marked as experimental
 */

// =============================================================================
// EXPERIMENTAL
// =============================================================================

/**
 * ExperimentalNav — New navigation pattern being tested
 * @draft
 */
export { ExperimentalNav } from '../components/ExperimentalNav';

/**
 * GlassCard — Glassmorphism card variant
 * @draft — Testing visual style
 */
export { GlassCard } from '../components/GlassCard';

/**
 * AnimatedCounter — Number animation component
 * @draft — Performance testing needed
 */
export { AnimatedCounter } from '../components/AnimatedCounter';

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type { ExperimentalNavProps } from '../components/ExperimentalNav';
export type { GlassCardProps } from '../components/GlassCard';
export type { AnimatedCounterProps } from '../components/AnimatedCounter';
