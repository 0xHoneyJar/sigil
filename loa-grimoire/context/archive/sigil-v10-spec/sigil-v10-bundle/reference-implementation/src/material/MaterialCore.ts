/**
 * Sigil Soul Engine v10 — Material Core
 * 
 * Material is physics, not styles.
 * Glass refracts. Clay has weight. Machinery clicks.
 */

export type MaterialType = 'glass' | 'clay' | 'machinery';

export interface MaterialPhysics {
  name: MaterialType;
  description: string;
  
  // Lighting
  getLightingCSS(): string;
  
  // Motion
  getEntranceAnimation(): AnimationConfig;
  getHoverEffect(): CSSProperties;
  getActiveEffect(): CSSProperties;
  
  // Surfaces
  getSurfaceCSS(): CSSProperties;
  getShadowCSS(): string;
  
  // Constraints
  forbidden: string[];
}

interface AnimationConfig {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
}

type CSSProperties = Record<string, string | number>;

// ═══════════════════════════════════════════════════════════════════════════
// GLASS MATERIAL (VisionOS / iOS Control Center)
// ═══════════════════════════════════════════════════════════════════════════

export class GlassMaterial implements MaterialPhysics {
  name: MaterialType = 'glass';
  description = 'Light, translucent, refractive';
  forbidden = ['solid backgrounds', 'hard shadows', 'heavy borders'];
  
  getLightingCSS(): string {
    return `
      --material-blur: 20px;
      --material-saturation: 180%;
      --material-opacity: 0.7;
      --material-border-opacity: 0.2;
    `;
  }
  
  getEntranceAnimation(): AnimationConfig {
    return {
      keyframes: [
        { opacity: 0, transform: 'scale(0.98)' },
        { opacity: 1, transform: 'scale(1)' },
      ],
      options: {
        duration: 200,
        easing: 'ease-out',
        fill: 'forwards',
      },
    };
  }
  
  getHoverEffect(): CSSProperties {
    return {
      boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.15)',
      transform: 'translateY(-1px)',
    };
  }
  
  getActiveEffect(): CSSProperties {
    return {
      transform: 'scale(0.98)',
      boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1)',
    };
  }
  
  getSurfaceCSS(): CSSProperties {
    return {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
    };
  }
  
  getShadowCSS(): string {
    return '0 0 0 1px rgba(0, 0, 0, 0.05), 0 8px 32px rgba(0, 0, 0, 0.1)';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLAY MATERIAL (Airbnb 2025 / OSRS / Nintendo)
// ═══════════════════════════════════════════════════════════════════════════

export class ClayMaterial implements MaterialPhysics {
  name: MaterialType = 'clay';
  description = 'Warm, tactile, weighted';
  forbidden = ['flat design', 'instant state changes', 'shadowless elements'];
  
  getLightingCSS(): string {
    return `
      --material-light-angle: 315deg;
      --material-ambient-warmth: 1.05;
      --material-shadow-softness: 0.8;
    `;
  }
  
  getEntranceAnimation(): AnimationConfig {
    return {
      keyframes: [
        { opacity: 0, transform: 'translateY(8px) scale(0.98)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' },
      ],
      options: {
        duration: 300,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring-like
        fill: 'forwards',
      },
    };
  }
  
  getHoverEffect(): CSSProperties {
    return {
      transform: 'translateY(-2px)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), 0 8px 16px rgba(0, 0, 0, 0.08), 0 12px 32px rgba(0, 0, 0, 0.06)',
      transition: 'all 150ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    };
  }
  
  getActiveEffect(): CSSProperties {
    return {
      transform: 'translateY(1px) scale(0.98)',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05)',
    };
  }
  
  getSurfaceCSS(): CSSProperties {
    return {
      background: 'linear-gradient(135deg, #FAFAF9 0%, #F5F5F4 100%)',
      borderRadius: '16px',
      border: 'none',
    };
  }
  
  getShadowCSS(): string {
    return '0 1px 2px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.06)';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MACHINERY MATERIAL (Linear / Teenage Engineering / Terminal)
// ═══════════════════════════════════════════════════════════════════════════

export class MachineryMaterial implements MaterialPhysics {
  name: MaterialType = 'machinery';
  description = 'Instant, precise, zero-latency';
  forbidden = ['fade-in animations', 'bounce effects', 'loading spinners', 'decorative elements'];
  
  getLightingCSS(): string {
    return `
      --material-contrast: 1.1;
      --material-accent: #5E6AD2;
    `;
  }
  
  getEntranceAnimation(): AnimationConfig {
    // INSTANT - no animation
    return {
      keyframes: [
        { opacity: 1 },
        { opacity: 1 },
      ],
      options: {
        duration: 0,
        fill: 'forwards',
      },
    };
  }
  
  getHoverEffect(): CSSProperties {
    return {
      background: 'rgba(255, 255, 255, 0.05)',
      // NO transform - instant state change
    };
  }
  
  getActiveEffect(): CSSProperties {
    return {
      background: 'rgba(255, 255, 255, 0.1)',
      // Immediate flip, no transition
    };
  }
  
  getSurfaceCSS(): CSSProperties {
    return {
      background: '#0A0A0A',
      color: '#FAFAFA',
      border: '1px solid #2A2A2A',
      borderRadius: '6px',
      transition: 'none', // CRITICAL: No transitions
    };
  }
  
  getShadowCSS(): string {
    return 'none'; // Machinery is flat
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MATERIAL FACTORY
// ═══════════════════════════════════════════════════════════════════════════

export function getMaterial(type: MaterialType): MaterialPhysics {
  switch (type) {
    case 'glass':
      return new GlassMaterial();
    case 'clay':
      return new ClayMaterial();
    case 'machinery':
      return new MachineryMaterial();
    default:
      return new ClayMaterial(); // Default
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MATERIAL DETECTION
// ═══════════════════════════════════════════════════════════════════════════

type ZoneType = 'critical' | 'transactional' | 'exploratory' | 'marketing';
type ComponentType = 'command_palette' | 'checkout_flow' | 'settings_panel' | 'data_table' | 'onboarding';

const zoneToMaterial: Record<ZoneType, MaterialType> = {
  critical: 'clay',
  transactional: 'machinery',
  exploratory: 'glass',
  marketing: 'clay',
};

const componentToMaterial: Record<ComponentType, MaterialType> = {
  command_palette: 'machinery',
  checkout_flow: 'clay',
  settings_panel: 'glass',
  data_table: 'machinery',
  onboarding: 'clay',
};

export function detectMaterial(context: {
  zone?: ZoneType;
  component?: ComponentType;
  override?: MaterialType;
}): MaterialType {
  // Explicit override takes precedence
  if (context.override) {
    return context.override;
  }
  
  // Component type next
  if (context.component && componentToMaterial[context.component]) {
    return componentToMaterial[context.component];
  }
  
  // Zone-based
  if (context.zone && zoneToMaterial[context.zone]) {
    return zoneToMaterial[context.zone];
  }
  
  // Default
  return 'clay';
}
