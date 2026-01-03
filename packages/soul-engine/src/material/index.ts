/**
 * Material Core
 *
 * Materials define physics, not just styles.
 * Glass refracts. Clay has weight. Machinery clicks.
 */

export type MaterialType = 'glass' | 'clay' | 'machinery';

export interface AnimationConfig {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
}

export type CSSProperties = Record<string, string | number>;

export interface MaterialPhysics {
  name: MaterialType;
  description: string;

  // CSS generation
  getSurfaceCSS(): CSSProperties;
  getShadowCSS(): string;
  getLightingCSS(): string;

  // Animation configs
  getEntranceAnimation(): AnimationConfig;
  getHoverEffect(): CSSProperties;
  getActiveEffect(): CSSProperties;

  // Constraints
  forbidden: string[];
}

// Placeholder exports - full implementation in Sprint 9
export const MATERIALS: Record<MaterialType, string> = {
  glass: 'Light, translucent, refractive',
  clay: 'Warm, tactile, weighted',
  machinery: 'Instant, precise, zero-latency',
};

export function getMaterialDescription(material: MaterialType): string {
  return MATERIALS[material];
}
