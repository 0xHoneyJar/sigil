/**
 * Sigil v2.0 — Lens Types
 *
 * Type definitions for the Lens Layer.
 * Lenses are interchangeable UIs that consume the same physics.
 *
 * @module lenses/types
 */

import type { ComponentType, ReactNode } from 'react';
import type { CriticalActionState } from '../core/types';
import type { LensClassification } from '../types';

// =============================================================================
// LENS INTERFACE
// =============================================================================

/**
 * Lens interface — Interchangeable UI renderers.
 *
 * All lenses implement this interface to provide consistent components
 * that render differently based on the lens's design philosophy.
 *
 * @example Creating a custom lens
 * ```ts
 * const CustomLens: Lens = {
 *   name: 'CustomLens',
 *   classification: 'cosmetic',
 *   CriticalButton: MyCustomCriticalButton,
 *   GlassButton: MyCustomGlassButton,
 *   MachineryItem: MyCustomMachineryItem,
 * };
 * ```
 */
export interface Lens {
  /** Lens name for identification */
  name: string;

  /**
   * Lens classification.
   *
   * - `cosmetic` — Colors, fonts, animations (safe everywhere)
   * - `utility` — Overlays, highlights (warning in critical)
   * - `gameplay` — Input hints (blocked in critical/financial)
   */
  classification: LensClassification;

  /** Critical button component (for CriticalZone) */
  CriticalButton: ComponentType<CriticalButtonProps>;

  /** Glass button component (for GlassLayout and general use) */
  GlassButton: ComponentType<GlassButtonProps>;

  /** Machinery item component (for MachineryLayout) */
  MachineryItem: ComponentType<MachineryItemProps>;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

/**
 * Props for lens CriticalButton components.
 *
 * @example
 * ```tsx
 * <Lens.CriticalButton
 *   state={payment.state}
 *   onAction={() => payment.commit()}
 *   labels={{ pending: 'Processing...' }}
 * >
 *   Pay $500
 * </Lens.CriticalButton>
 * ```
 */
export interface CriticalButtonProps {
  /** Critical action state from useCriticalAction */
  state: CriticalActionState;

  /** Action handler */
  onAction: () => void;

  /** Button content */
  children: ReactNode;

  /**
   * Custom labels for each state.
   * Falls back to children if not provided.
   */
  labels?: {
    /** Label shown during confirming state */
    confirming?: string;
    /** Label shown during pending state */
    pending?: string;
    /** Label shown during confirmed state */
    confirmed?: string;
    /** Label shown during failed state */
    failed?: string;
  };

  /** Whether the button is disabled */
  disabled?: boolean;

  /** Optional className for styling */
  className?: string;
}

/**
 * Props for lens GlassButton components.
 *
 * @example
 * ```tsx
 * <Lens.GlassButton onAction={cancel} variant="secondary">
 *   Cancel
 * </Lens.GlassButton>
 * ```
 */
export interface GlassButtonProps {
  /** Action handler */
  onAction: () => void;

  /** Button content */
  children: ReactNode;

  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost';

  /** Whether the button is disabled */
  disabled?: boolean;

  /** Optional className for styling */
  className?: string;
}

/**
 * Props for lens MachineryItem components.
 *
 * @example
 * ```tsx
 * <Lens.MachineryItem
 *   onAction={() => selectItem(id)}
 *   onDelete={() => deleteItem(id)}
 *   isActive={activeId === id}
 * >
 *   Item Content
 * </Lens.MachineryItem>
 * ```
 */
export interface MachineryItemProps {
  /** Action handler (activate item) */
  onAction: () => void;

  /** Delete handler (optional) */
  onDelete?: () => void;

  /** Whether the item is currently active/selected */
  isActive?: boolean;

  /** Item content */
  children: ReactNode;

  /** Optional className for styling */
  className?: string;
}

// =============================================================================
// LENS CONTEXT
// =============================================================================

/**
 * User lens preference value.
 */
export interface LensPreference {
  /** Selected lens */
  lens: Lens | null;

  /** Set lens preference */
  setLens: (lens: Lens | null) => void;
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

export type { LensClassification };
