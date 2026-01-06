/**
 * @sigil-core SigilZone Context Provider
 *
 * Provides physics values to child components based on zone material.
 * Components automatically inherit the correct physics without import changes.
 *
 * Philosophy: "Move code, not imports"
 * - Wrap a section in <SigilZone material="decisive">
 * - All children automatically use decisive physics
 * - Moving code to a different zone = changing the parent wrapper
 */

import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { PHYSICS, DEFAULT_MATERIAL, type Material, type PhysicsToken } from './physics';

export interface SigilZoneContextValue {
  /** Current material type */
  material: Material;
  /** Physics token for current material */
  physics: PhysicsToken;
  /** Whether this zone is server-authoritative (prevents optimistic UI) */
  serverAuthoritative: boolean;
  /** Override material temporarily (for A/B testing) */
  setOverride: (material: Material | null) => void;
  /** Current override (if any) */
  override: Material | null;
}

const SigilZoneContext = createContext<SigilZoneContextValue | null>(null);

export interface SigilZoneProps {
  /** Material type determines physics */
  material: Material;
  /** Server-authoritative zones prevent optimistic UI updates */
  serverAuthoritative?: boolean;
  /** Children components inherit this zone's physics */
  children: React.ReactNode;
}

/**
 * Zone provider that gives children access to physics values.
 *
 * @example Basic usage
 * ```tsx
 * // In checkout page
 * <SigilZone material="decisive" serverAuthoritative>
 *   <CheckoutForm />
 *   <Button>Confirm Purchase</Button>  // Auto-uses decisive physics
 * </SigilZone>
 *
 * // In marketing page
 * <SigilZone material="glass">
 *   <HeroSection />
 *   <Button>Learn More</Button>  // Auto-uses glass physics
 * </SigilZone>
 * ```
 *
 * @example Moving code between zones (zero refactors)
 * ```tsx
 * // Before: Component in marketing zone
 * <SigilZone material="glass">
 *   <FeatureCard />
 * </SigilZone>
 *
 * // After: Same component in critical zone
 * <SigilZone material="decisive" serverAuthoritative>
 *   <FeatureCard />  // Automatically uses decisive physics now!
 * </SigilZone>
 * ```
 */
export function SigilZone({
  material,
  serverAuthoritative = false,
  children,
}: SigilZoneProps): JSX.Element {
  // Allow temporary override for A/B testing
  const [override, setOverride] = useState<Material | null>(null);

  const effectiveMaterial = override ?? material;
  const physics = PHYSICS[effectiveMaterial];

  const value = useMemo<SigilZoneContextValue>(
    () => ({
      material: effectiveMaterial,
      physics,
      serverAuthoritative,
      setOverride,
      override,
    }),
    [effectiveMaterial, physics, serverAuthoritative, override]
  );

  return (
    <SigilZoneContext.Provider value={value}>
      {children}
    </SigilZoneContext.Provider>
  );
}

/**
 * Hook to access current zone's physics.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { physics, material } = useSigilPhysics();
 *
 *   return (
 *     <motion.div
 *       whileTap={{ scale: physics.tap.scale }}
 *       transition={physics.spring}
 *     >
 *       Using {material} physics
 *     </motion.div>
 *   );
 * }
 * ```
 */
export function useSigilPhysics(): SigilZoneContextValue {
  const context = useContext(SigilZoneContext);

  if (!context) {
    // Return default physics if not wrapped in SigilZone
    // This allows components to work standalone (with defaults)
    return {
      material: DEFAULT_MATERIAL,
      physics: PHYSICS[DEFAULT_MATERIAL],
      serverAuthoritative: false,
      setOverride: () => {
        console.warn('[sigil] setOverride called outside SigilZone');
      },
      override: null,
    };
  }

  return context;
}

/**
 * Hook to check if current zone is server-authoritative.
 * Used by useServerTick to determine if optimistic UI is allowed.
 */
export function useServerAuthoritative(): boolean {
  const { serverAuthoritative } = useSigilPhysics();
  return serverAuthoritative;
}

/**
 * HOC to inject physics into class components.
 *
 * @example
 * ```tsx
 * class LegacyButton extends React.Component {
 *   render() {
 *     const { physics } = this.props;
 *     // use physics.spring, physics.tap
 *   }
 * }
 *
 * export default withSigilPhysics(LegacyButton);
 * ```
 */
export function withSigilPhysics<P extends { physics?: PhysicsToken }>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, 'physics'>> {
  return function WrappedComponent(props: Omit<P, 'physics'>) {
    const { physics } = useSigilPhysics();
    return <Component {...(props as P)} physics={physics} />;
  };
}

export default SigilZone;
