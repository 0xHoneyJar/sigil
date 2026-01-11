/**
 * Sigil Soul Layer Type Definitions
 * TypeScript types for soul layer YAML schemas
 */

// ═══════════════════════════════════════════════════════════════════════════════
// MATERIALS
// ═══════════════════════════════════════════════════════════════════════════════

export type MaterialType = 'glass' | 'clay' | 'machinery';
export type LightPrimitive = 'refract' | 'diffuse' | 'flat' | 'reflect';
export type WeightPrimitive = 'weightless' | 'light' | 'heavy' | 'none';
export type MotionPrimitive = 'ease' | 'spring' | 'instant' | 'step';
export type FeedbackPrimitive = 'glow' | 'lift' | 'depress' | 'highlight' | 'xp_drop' | 'screen_shake';
export type SurfacePrimitive = 'translucent' | 'solid';

export interface MaterialPrimitives {
  light: LightPrimitive;
  weight: WeightPrimitive;
  motion: MotionPrimitive;
  feedback: FeedbackPrimitive[];
  surface: SurfacePrimitive;
}

export interface MaterialConfig {
  blur?: number;
  opacity?: number;
  saturation?: number;
  spring_stiffness?: number;
  spring_damping?: number;
  shadow_warmth?: number;
  gradient_angle?: number;
  transition_duration?: number;
  contrast?: string;
}

export interface MaterialCSSVariables {
  '--sigil-material': string;
  '--sigil-transition'?: string;
  '--sigil-blur'?: string;
  '--sigil-opacity'?: string;
  '--sigil-saturation'?: string;
  '--sigil-spring'?: string;
  '--sigil-shadow-sm'?: string;
  '--sigil-shadow-md'?: string;
  '--sigil-shadow-lg'?: string;
  '--sigil-easing'?: string;
  '--sigil-bg'?: string;
  '--sigil-border'?: string;
  '--sigil-text'?: string;
}

export interface MaterialReference {
  product: string;
  why: string;
}

export interface MaterialPhysics {
  entrance: {
    from: Record<string, number | string>;
    to: Record<string, number | string>;
    duration: number;
    easing: string;
    spring?: { stiffness: number; damping: number };
  };
  hover: Record<string, string>;
  active: Record<string, string>;
  exit: {
    to: Record<string, number | string>;
    duration: number;
    easing: string;
  };
}

export interface Material {
  name: string;
  description: string;
  primitives: MaterialPrimitives;
  config: MaterialConfig;
  css_variables: MaterialCSSVariables;
  forbidden: string[];
  use_when: string[];
  avoid_when: string[];
  references: MaterialReference[];
}

export interface CustomMaterial {
  name: string;
  extends: MaterialType;
  overrides: Partial<MaterialPrimitives>;
  config: MaterialConfig;
}

export interface MaterialSelectionRules {
  by_zone: Record<string, MaterialType>;
  by_component: Record<string, MaterialType>;
  by_sync: Record<string, MaterialType>;
}

export interface MaterialsSchema {
  version: string;
  generated_at: string | null;
  materials: Record<MaterialType, Material>;
  custom_materials: Record<string, CustomMaterial>;
  selection_rules: MaterialSelectionRules;
  physics_lookup: Record<MaterialType, MaterialPhysics>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ZONES
// ═══════════════════════════════════════════════════════════════════════════════

export type ZoneName = 'critical' | 'transactional' | 'exploratory' | 'marketing' | 'celebration' | 'default';
export type SyncStrategy = 'server_tick' | 'crdt' | 'lww' | 'local_only';
export type MotionStyle = 'deliberate' | 'instant' | 'flowing' | 'expressive' | 'triumphant' | 'balanced';

export interface ZoneMotion {
  style: MotionStyle;
  entrance_ms: number;
  exit_ms?: number;
  hold_ms?: number;
  easing: string;
}

export interface ZonePatterns {
  required?: string[];
  preferred?: string[];
  forbidden?: string[];
  allowed_extras?: string[];
}

export interface ZoneAccessibility {
  focus_visible?: string;
  keyboard_nav?: string;
  aria_live?: string;
  reduced_motion?: string;
  scroll_restoration?: string;
  prefers_contrast?: string;
}

export interface ZoneFidelityOverride {
  animation?: {
    max_duration_ms?: number;
  };
  confetti_allowed?: boolean;
}

export interface ZoneTensions {
  playfulness: number;
  weight: number;
  density: number;
  speed: number;
}

export interface Zone {
  name: string;
  description: string;
  paths: string[];
  material: MaterialType;
  sync: SyncStrategy;
  tensions: ZoneTensions;
  motion: ZoneMotion;
  patterns: ZonePatterns;
  accessibility?: ZoneAccessibility;
  fidelity_override?: ZoneFidelityOverride;
  references?: string[];
}

export interface DefaultZone {
  name: string;
  description: string;
  material: MaterialType;
  sync: SyncStrategy;
  tensions: ZoneTensions;
  motion: ZoneMotion;
}

export interface ZoneResolution {
  priority: ZoneName[];
  algorithm: string;
  override_comment: string;
}

export interface ZonesSchema {
  version: string;
  generated_at: string | null;
  zones: Record<Exclude<ZoneName, 'default'>, Zone>;
  default: DefaultZone;
  resolution: ZoneResolution;
  custom_zones: Record<string, Zone>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TENSIONS
// ═══════════════════════════════════════════════════════════════════════════════

export type TensionAxis = 'playfulness' | 'weight' | 'density' | 'speed';

export interface TensionAffect {
  property: string;
  at_0: string;
  at_50: string;
  at_100: string;
  interpolation: 'linear' | 'step';
  steps?: number[];
}

export interface TensionDefinition {
  name: string;
  description: string;
  range: [number, number];
  default: number;
  affects: Record<string, TensionAffect>;
  presets: Record<string, number>;
  examples: {
    low: string;
    mid: string;
    high: string;
  };
}

export interface TensionPreset {
  name: string;
  description: string;
  tensions: Record<TensionAxis, number>;
  material_override?: MaterialType;
  motion_override?: MotionPrimitive;
  tick_rate_ms?: number;
}

export interface TensionCurrent {
  preset: string | null;
  values: Record<TensionAxis, number>;
  zone_overrides: Record<string, Partial<Record<TensionAxis, number>>>;
}

export interface TensionCSSGeneration {
  root_selector: string;
  template: string;
}

export interface TensionsSchema {
  version: string;
  generated_at: string | null;
  tensions: Record<TensionAxis, TensionDefinition>;
  presets: Record<string, TensionPreset>;
  current: TensionCurrent;
  css_generation: TensionCSSGeneration;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESSENCE
// ═══════════════════════════════════════════════════════════════════════════════

export type EnforcementLevel = 'block' | 'warn' | 'suggest';

export interface SoulStatement {
  statement: string | null;
  expanded: string | null;
}

export interface Invariant {
  id: string;
  statement: string;
  reason: string;
  enforcement: EnforcementLevel;
}

export interface FeelDescriptor {
  descriptor: string | null;
  reference: string | null;
  avoid: string | null;
}

export interface Feel {
  transactions: FeelDescriptor;
  success: FeelDescriptor;
  loading: FeelDescriptor;
  errors: FeelDescriptor;
}

export interface ReferenceProduct {
  name: string;
  aspects: string[];
}

export interface References {
  inspire: ReferenceProduct[];
  avoid: ReferenceProduct[];
}

export interface AntiPattern {
  id: string;
  pattern: string;
  why: string;
  instead: string;
}

export interface NearMiss {
  id: string;
  pattern: string;
  vote: number;
  reason: string;
  date: string;
  reconsider_after: string;
}

export interface HardRejection {
  id: string;
  pattern: string;
  vote: number;
  reason: string;
  date: string;
  permanent: boolean;
}

export interface Archaeology {
  near_misses: NearMiss[];
  hard_rejections: HardRejection[];
}

export interface Voice {
  personality: string | null;
  traits: string[];
  avoid: string[];
}

export interface ConstitutionCheck {
  enabled: boolean;
  questions: string[];
  on_violation: {
    invariant: EnforcementLevel;
    feel_mismatch: EnforcementLevel;
    reference_mismatch: EnforcementLevel;
  };
}

export interface EssenceSchema {
  version: string;
  generated_at: string | null;
  generated_by: string | null;
  soul: SoulStatement;
  invariants: Invariant[];
  feel: Feel;
  references: References;
  anti_patterns: AntiPattern[];
  archaeology: Archaeology;
  voice: Voice;
  constitution_check: ConstitutionCheck;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED SOUL STATE
// ═══════════════════════════════════════════════════════════════════════════════

export interface SoulState {
  materials: MaterialsSchema;
  zones: ZonesSchema;
  tensions: TensionsSchema;
  essence: EssenceSchema;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE GUARDS
// ═══════════════════════════════════════════════════════════════════════════════

export function isMaterialType(value: unknown): value is MaterialType {
  return typeof value === 'string' && ['glass', 'clay', 'machinery'].includes(value);
}

export function isZoneName(value: unknown): value is ZoneName {
  return typeof value === 'string' &&
    ['critical', 'transactional', 'exploratory', 'marketing', 'celebration', 'default'].includes(value);
}

export function isSyncStrategy(value: unknown): value is SyncStrategy {
  return typeof value === 'string' &&
    ['server_tick', 'crdt', 'lww', 'local_only'].includes(value);
}

export function isTensionAxis(value: unknown): value is TensionAxis {
  return typeof value === 'string' &&
    ['playfulness', 'weight', 'density', 'speed'].includes(value);
}

export function isMaterialsSchema(obj: unknown): obj is MaterialsSchema {
  return typeof obj === 'object' && obj !== null && 'materials' in obj && 'selection_rules' in obj;
}

export function isZonesSchema(obj: unknown): obj is ZonesSchema {
  return typeof obj === 'object' && obj !== null && 'zones' in obj && 'default' in obj && 'resolution' in obj;
}

export function isTensionsSchema(obj: unknown): obj is TensionsSchema {
  return typeof obj === 'object' && obj !== null && 'tensions' in obj && 'presets' in obj && 'current' in obj;
}

export function isEssenceSchema(obj: unknown): obj is EssenceSchema {
  return typeof obj === 'object' && obj !== null && 'soul' in obj && 'invariants' in obj;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get tension value at a specific point (0-100)
 */
export function interpolateTension(
  affect: TensionAffect,
  value: number
): string {
  if (affect.interpolation === 'step' && affect.steps) {
    const stepIndex = Math.floor((value / 100) * affect.steps.length);
    return String(affect.steps[Math.min(stepIndex, affect.steps.length - 1)]);
  }

  // Linear interpolation between at_0 and at_100
  // This is a simplified version - actual implementation would parse units
  const match0 = affect.at_0.match(/^([\d.]+)/);
  const match100 = affect.at_100.match(/^([\d.]+)/);

  if (match0 && match100) {
    const v0 = parseFloat(match0[1]);
    const v100 = parseFloat(match100[1]);
    const interpolated = v0 + (v100 - v0) * (value / 100);
    const unit = affect.at_0.replace(/^[\d.]+/, '');
    return `${interpolated.toFixed(2)}${unit}`;
  }

  // Fallback to midpoint
  return value < 50 ? affect.at_0 : affect.at_100;
}

/**
 * Get effective tension values for a zone
 */
export function getEffectiveTensions(
  current: TensionCurrent,
  zoneName: string
): Record<TensionAxis, number> {
  const base = { ...current.values };
  const overrides = current.zone_overrides[zoneName];

  if (overrides) {
    return { ...base, ...overrides };
  }

  return base;
}

/**
 * Match file path to zone
 */
export function matchZone(
  filePath: string,
  zones: ZonesSchema
): ZoneName {
  const priority = zones.resolution.priority;

  for (const zoneName of priority) {
    if (zoneName === 'default') continue;

    const zone = zones.zones[zoneName as Exclude<ZoneName, 'default'>];
    if (!zone) continue;

    for (const pattern of zone.paths) {
      if (matchGlobPattern(filePath, pattern)) {
        return zoneName;
      }
    }
  }

  return 'default';
}

/**
 * Simple glob pattern matching
 */
function matchGlobPattern(path: string, pattern: string): boolean {
  const regex = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*');

  return new RegExp(`^${regex}$`).test(path);
}
