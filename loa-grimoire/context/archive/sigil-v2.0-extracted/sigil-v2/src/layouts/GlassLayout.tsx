// Sigil v2.0 — Layout: GlassLayout
// Structural physics for exploratory/marketing UI

import React, { createContext, useContext, useState, ReactNode } from 'react';

// =============================================================================
// CONTEXT
// =============================================================================

interface GlassContextValue {
  isHovered: boolean;
}

const GlassContext = createContext<GlassContextValue | null>(null);

export function useGlassContext() {
  const context = useContext(GlassContext);
  if (!context) {
    throw new Error('Glass components must be used within GlassLayout');
  }
  return context;
}

// =============================================================================
// GLASS LAYOUT
// =============================================================================

interface GlassLayoutProps {
  children: ReactNode;
  variant?: 'card' | 'hero' | 'feature';
}

/**
 * GlassLayout — Layout primitive for exploratory UI
 * 
 * Physics enforced:
 * - Hover animations (scale, lift)
 * - Backdrop blur
 * - Transition timing (200ms ease-out)
 * 
 * @example
 * ```tsx
 * <GlassLayout variant="card">
 *   <GlassLayout.Image src={product.image} />
 *   <GlassLayout.Content>
 *     <h3>{product.name}</h3>
 *     <p>{product.description}</p>
 *   </GlassLayout.Content>
 * </GlassLayout>
 * ```
 */
export function GlassLayout({ children, variant = 'card' }: GlassLayoutProps) {
  const [isHovered, setIsHovered] = useState(false);

  const variantStyles = {
    card: 'rounded-xl p-4',
    hero: 'rounded-2xl p-8',
    feature: 'rounded-lg p-6',
  };

  return (
    <GlassContext.Provider value={{ isHovered }}>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          ${variantStyles[variant]}
          backdrop-blur-lg bg-white/80 dark:bg-neutral-900/80
          shadow-lg
          transition-all duration-200 ease-out
          ${isHovered ? 'scale-[1.02] -translate-y-1 shadow-xl' : ''}
        `}
        // PHYSICS: Hover transform is CSS, not JS animation
      >
        {children}
      </div>
    </GlassContext.Provider>
  );
}

// =============================================================================
// IMAGE SLOT
// =============================================================================

interface GlassImageProps {
  src: string;
  alt?: string;
}

function GlassImage({ src, alt = '' }: GlassImageProps) {
  return (
    <div className="relative overflow-hidden rounded-lg mb-4">
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-cover transition-transform duration-200"
      />
    </div>
  );
}

// =============================================================================
// CONTENT SLOT
// =============================================================================

interface GlassContentProps {
  children: ReactNode;
}

function GlassContent({ children }: GlassContentProps) {
  return <div className="space-y-2">{children}</div>;
}

// =============================================================================
// TITLE SLOT
// =============================================================================

interface GlassTitleProps {
  children: ReactNode;
}

function GlassTitle({ children }: GlassTitleProps) {
  return (
    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
      {children}
    </h3>
  );
}

// =============================================================================
// DESCRIPTION SLOT
// =============================================================================

interface GlassDescriptionProps {
  children: ReactNode;
}

function GlassDescription({ children }: GlassDescriptionProps) {
  return (
    <p className="text-sm text-neutral-600 dark:text-neutral-400">{children}</p>
  );
}

// =============================================================================
// ACTIONS SLOT
// =============================================================================

interface GlassActionsProps {
  children: ReactNode;
}

function GlassActions({ children }: GlassActionsProps) {
  return <div className="flex items-center gap-3 mt-4">{children}</div>;
}

// =============================================================================
// ATTACH SUBCOMPONENTS
// =============================================================================

GlassLayout.Image = GlassImage;
GlassLayout.Content = GlassContent;
GlassLayout.Title = GlassTitle;
GlassLayout.Description = GlassDescription;
GlassLayout.Actions = GlassActions;

// =============================================================================
// EXPORTS
// =============================================================================

export {
  GlassImage,
  GlassContent,
  GlassTitle,
  GlassDescription,
  GlassActions,
};
