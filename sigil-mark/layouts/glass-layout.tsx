/**
 * Sigil v2.0 — GlassLayout
 *
 * Layout primitive for exploratory/marketing UI. Provides zone context
 * AND structural physics (hover effects) in a single component.
 *
 * Layouts ARE Zones. Physics is DOM, not lint.
 *
 * @module layouts/GlassLayout
 */

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
  type ReactElement,
  type FC,
  type CSSProperties,
} from 'react';
import { ZoneContext, type ZoneContextValue } from './context';

// =============================================================================
// TYPES
// =============================================================================

/**
 * GlassLayout variant.
 */
export type GlassLayoutVariant = 'card' | 'hero' | 'feature';

/**
 * GlassLayout props.
 */
export interface GlassLayoutProps {
  /** Child content */
  children: ReactNode;
  /** Layout variant */
  variant?: GlassLayoutVariant;
  /** Optional className for styling */
  className?: string;
}

/**
 * GlassLayout.Image props.
 */
export interface GlassLayoutImageProps {
  /** Image source */
  src: string;
  /** Alt text */
  alt?: string;
  /** Optional className for styling */
  className?: string;
}

/**
 * GlassLayout.Content props.
 */
export interface GlassLayoutContentProps {
  /** Content children */
  children: ReactNode;
  /** Optional className for styling */
  className?: string;
}

/**
 * GlassLayout.Title props.
 */
export interface GlassLayoutTitleProps {
  /** Title text */
  children: ReactNode;
  /** Optional className for styling */
  className?: string;
}

/**
 * GlassLayout.Description props.
 */
export interface GlassLayoutDescriptionProps {
  /** Description text */
  children: ReactNode;
  /** Optional className for styling */
  className?: string;
}

/**
 * GlassLayout.Actions props.
 */
export interface GlassLayoutActionsProps {
  /** Action buttons */
  children: ReactNode;
  /** Optional className for styling */
  className?: string;
}

// =============================================================================
// INTERNAL CONTEXT
// =============================================================================

/**
 * Internal context for GlassLayout.
 * @internal
 */
interface GlassLayoutInternalContextValue {
  variant: GlassLayoutVariant;
  isHovered: boolean;
}

const GlassLayoutInternalContext =
  createContext<GlassLayoutInternalContextValue | null>(null);

function useGlassLayoutInternal(): GlassLayoutInternalContextValue {
  const context = useContext(GlassLayoutInternalContext);
  if (!context) {
    throw new Error(
      'GlassLayout subcomponents must be used within a GlassLayout'
    );
  }
  return context;
}

// =============================================================================
// HOVER PHYSICS
// =============================================================================

/**
 * Default hover physics styles.
 * @internal
 */
const HOVER_PHYSICS = {
  card: {
    scale: 1.02,
    translateY: -4,
    shadowIncrease: 1.5,
  },
  hero: {
    scale: 1.01,
    translateY: -2,
    shadowIncrease: 1.2,
  },
  feature: {
    scale: 1.015,
    translateY: -3,
    shadowIncrease: 1.3,
  },
} as const;

/**
 * Get hover transform styles.
 * @internal
 */
function getHoverStyles(
  variant: GlassLayoutVariant,
  isHovered: boolean
): CSSProperties {
  const physics = HOVER_PHYSICS[variant];

  return {
    transform: isHovered
      ? `scale(${physics.scale}) translateY(${physics.translateY}px)`
      : 'scale(1) translateY(0)',
    boxShadow: isHovered
      ? `0 ${10 * physics.shadowIncrease}px ${30 * physics.shadowIncrease}px rgba(0, 0, 0, 0.15)`
      : '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 200ms ease-out',
  };
}

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

/**
 * GlassLayout.Image — Image slot.
 *
 * @example
 * ```tsx
 * <GlassLayout.Image src={product.image} alt={product.name} />
 * ```
 */
const GlassLayoutImage: FC<GlassLayoutImageProps> = ({
  src,
  alt = '',
  className = '',
}) => {
  // Validate we're inside a GlassLayout
  useGlassLayoutInternal();

  return (
    <div
      className={`sigil-glass-image ${className}`.trim()}
      data-sigil-slot="image"
      style={{
        overflow: 'hidden',
        borderRadius: '8px 8px 0 0',
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          objectFit: 'cover',
        }}
      />
    </div>
  );
};

GlassLayoutImage.displayName = 'GlassLayout.Image';

/**
 * GlassLayout.Content — Body content slot.
 *
 * @example
 * ```tsx
 * <GlassLayout.Content>
 *   <GlassLayout.Title>Product Name</GlassLayout.Title>
 *   <GlassLayout.Description>Product description</GlassLayout.Description>
 * </GlassLayout.Content>
 * ```
 */
const GlassLayoutContent: FC<GlassLayoutContentProps> = ({
  children,
  className = '',
}) => {
  // Validate we're inside a GlassLayout
  useGlassLayoutInternal();

  return (
    <div
      className={`sigil-glass-content ${className}`.trim()}
      data-sigil-slot="content"
      style={{
        padding: '16px',
      }}
    >
      {children}
    </div>
  );
};

GlassLayoutContent.displayName = 'GlassLayout.Content';

/**
 * GlassLayout.Title — Title slot.
 *
 * @example
 * ```tsx
 * <GlassLayout.Title>Product Name</GlassLayout.Title>
 * ```
 */
const GlassLayoutTitle: FC<GlassLayoutTitleProps> = ({
  children,
  className = '',
}) => {
  // Validate we're inside a GlassLayout
  useGlassLayoutInternal();

  return (
    <h3
      className={`sigil-glass-title ${className}`.trim()}
      data-sigil-slot="title"
      style={{
        margin: '0 0 8px 0',
        fontSize: '1.25rem',
        fontWeight: 600,
      }}
    >
      {children}
    </h3>
  );
};

GlassLayoutTitle.displayName = 'GlassLayout.Title';

/**
 * GlassLayout.Description — Description slot.
 *
 * @example
 * ```tsx
 * <GlassLayout.Description>
 *   A detailed description of the product.
 * </GlassLayout.Description>
 * ```
 */
const GlassLayoutDescription: FC<GlassLayoutDescriptionProps> = ({
  children,
  className = '',
}) => {
  // Validate we're inside a GlassLayout
  useGlassLayoutInternal();

  return (
    <p
      className={`sigil-glass-description ${className}`.trim()}
      data-sigil-slot="description"
      style={{
        margin: '0 0 16px 0',
        color: 'rgba(0, 0, 0, 0.6)',
        fontSize: '0.875rem',
        lineHeight: 1.5,
      }}
    >
      {children}
    </p>
  );
};

GlassLayoutDescription.displayName = 'GlassLayout.Description';

/**
 * GlassLayout.Actions — Actions slot.
 *
 * @example
 * ```tsx
 * <GlassLayout.Actions>
 *   <Lens.GlassButton onAction={viewDetails}>View</Lens.GlassButton>
 *   <Lens.GlassButton onAction={addToCart}>Add to Cart</Lens.GlassButton>
 * </GlassLayout.Actions>
 * ```
 */
const GlassLayoutActions: FC<GlassLayoutActionsProps> = ({
  children,
  className = '',
}) => {
  // Validate we're inside a GlassLayout
  useGlassLayoutInternal();

  return (
    <div
      className={`sigil-glass-actions ${className}`.trim()}
      data-sigil-slot="actions"
      style={{
        display: 'flex',
        gap: '12px',
        padding: '0 16px 16px 16px',
      }}
    >
      {children}
    </div>
  );
};

GlassLayoutActions.displayName = 'GlassLayout.Actions';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * GlassLayout — Hover-driven card UI.
 *
 * Provides:
 * - Zone context: `{ type: 'marketing', timeAuthority: 'optimistic' }`
 * - Hover physics: scale, lift, shadow
 * - Backdrop blur effect
 *
 * In v2.0, Layouts ARE Zones. GlassLayout replaces the old
 * `<SigilZone material="glass">` pattern.
 *
 * @example Basic card
 * ```tsx
 * <GlassLayout variant="card">
 *   <GlassLayout.Image src={product.image} alt={product.name} />
 *   <GlassLayout.Content>
 *     <GlassLayout.Title>{product.name}</GlassLayout.Title>
 *     <GlassLayout.Description>{product.description}</GlassLayout.Description>
 *   </GlassLayout.Content>
 *   <GlassLayout.Actions>
 *     <Lens.GlassButton onAction={() => addToCart(product.id)}>
 *       Add to Cart
 *     </Lens.GlassButton>
 *   </GlassLayout.Actions>
 * </GlassLayout>
 * ```
 *
 * @example Hero variant
 * ```tsx
 * <GlassLayout variant="hero">
 *   <GlassLayout.Content>
 *     <GlassLayout.Title>Welcome to Our Store</GlassLayout.Title>
 *     <GlassLayout.Description>
 *       Discover amazing products at great prices.
 *     </GlassLayout.Description>
 *   </GlassLayout.Content>
 * </GlassLayout>
 * ```
 */
function GlassLayout({
  children,
  variant = 'card',
  className = '',
}: GlassLayoutProps): ReactElement {
  const [isHovered, setIsHovered] = useState(false);

  // Create zone context value
  const zoneContextValue: ZoneContextValue = useMemo(
    () => ({
      type: 'marketing',
      timeAuthority: 'optimistic', // Marketing zones use optimistic
    }),
    []
  );

  // Create internal context value
  const internalContextValue: GlassLayoutInternalContextValue = useMemo(
    () => ({
      variant,
      isHovered,
    }),
    [variant, isHovered]
  );

  // Get hover styles
  const hoverStyles = getHoverStyles(variant, isHovered);

  return (
    <ZoneContext.Provider value={zoneContextValue}>
      <GlassLayoutInternalContext.Provider value={internalContextValue}>
        <div
          className={`sigil-glass-layout ${className}`.trim()}
          data-sigil-zone="marketing"
          data-sigil-variant={variant}
          data-sigil-hovered={isHovered}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            ...hoverStyles,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)', // Safari support
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      </GlassLayoutInternalContext.Provider>
    </ZoneContext.Provider>
  );
}

// Attach subcomponents
GlassLayout.Image = GlassLayoutImage;
GlassLayout.Content = GlassLayoutContent;
GlassLayout.Title = GlassLayoutTitle;
GlassLayout.Description = GlassLayoutDescription;
GlassLayout.Actions = GlassLayoutActions;

GlassLayout.displayName = 'GlassLayout';

// =============================================================================
// EXPORTS
// =============================================================================

export { GlassLayout };
export type {
  GlassLayoutProps,
  GlassLayoutVariant,
  GlassLayoutImageProps,
  GlassLayoutContentProps,
  GlassLayoutTitleProps,
  GlassLayoutDescriptionProps,
  GlassLayoutActionsProps,
};
