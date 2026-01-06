/**
 * Sigil v2.0 — Layouts Module
 *
 * Layout primitives that provide both zone context AND structural physics.
 * Layouts ARE Zones. Physics is DOM, not lint.
 *
 * v2.0 introduces:
 * - CriticalZone — High-stakes UI (financial, destructive actions)
 * - MachineryLayout — Keyboard-driven admin UI (Sprint 4)
 * - GlassLayout — Hover-driven marketing UI (Sprint 4)
 *
 * @example v2.0 Usage
 * ```tsx
 * import { CriticalZone, useZoneContext } from 'sigil-mark/layouts';
 *
 * function PaymentForm() {
 *   return (
 *     <CriticalZone financial>
 *       <CriticalZone.Content>
 *         <h2>Confirm Payment</h2>
 *       </CriticalZone.Content>
 *       <CriticalZone.Actions>
 *         <Lens.CriticalButton state={state} onAction={commit}>
 *           Pay
 *         </Lens.CriticalButton>
 *       </CriticalZone.Actions>
 *     </CriticalZone>
 *   );
 * }
 * ```
 *
 * @module layouts
 */

// =============================================================================
// CONTEXT
// =============================================================================

export {
  // Context and hooks
  ZoneContext,
  useZoneContext,
  DEFAULT_ZONE_CONTEXT,
  // Utilities
  requiresStrictLens,
  allowsGameplayLens,
  // Types
  type ZoneContextValue,
  type ZoneType,
  type TimeAuthority,
} from './context';

// =============================================================================
// LAYOUT PRIMITIVES
// =============================================================================

// CriticalZone — Sprint 3
export {
  CriticalZone,
  type CriticalZoneProps,
  type CriticalZoneContentProps,
  type CriticalZoneActionsProps,
} from './critical-zone';

// MachineryLayout — Sprint 4
export {
  MachineryLayout,
  type MachineryLayoutProps,
  type MachineryLayoutListProps,
  type MachineryLayoutItemProps,
  type MachineryLayoutSearchProps,
  type MachineryLayoutEmptyProps,
} from './machinery-layout';

// GlassLayout — Sprint 4
export {
  GlassLayout,
  type GlassLayoutProps,
  type GlassLayoutVariant,
  type GlassLayoutImageProps,
  type GlassLayoutContentProps,
  type GlassLayoutTitleProps,
  type GlassLayoutDescriptionProps,
  type GlassLayoutActionsProps,
} from './glass-layout';
