/**
 * Sigil Kernel Types
 * TypeScript interfaces for the immutable kernel layer
 *
 * These types define the structure of:
 * - physics.yaml: Physics primitives (light, weight, motion, feedback, surface)
 * - sync.yaml: Sync strategies (CRDT, LWW, Server-Tick, Local-Only)
 * - fidelity-ceiling.yaml: Quality constraints and forbidden techniques
 */

// ═══════════════════════════════════════════════════════════════════════════════
// COMMON TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface KernelLockState {
  locked: boolean;
  locked_at: string | null;
  locked_by: string | null;
}

export interface KernelBase extends KernelLockState {
  version: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHYSICS KERNEL (physics.yaml)
// ═══════════════════════════════════════════════════════════════════════════════

export interface LightPrimitive {
  id: string;
  name: string;
  description: string;
  css_template?: string;
  css?: string;
  defaults?: Record<string, string | number>;
  references: string[];
}

export interface LightPrimitives {
  refract: LightPrimitive;
  diffuse: LightPrimitive;
  flat: LightPrimitive;
  reflect: LightPrimitive;
}

export interface WeightState {
  transform?: string;
  shadow_scale?: number;
}

export interface WeightPrimitive {
  id: string;
  name: string;
  description: string;
  hover: WeightState;
  active: WeightState;
  drag: WeightState;
  references: string[];
}

export interface WeightPrimitives {
  weightless: WeightPrimitive;
  light: WeightPrimitive;
  heavy: WeightPrimitive;
  none: WeightPrimitive;
}

export interface MotionConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export interface MotionPrimitive {
  id: string;
  name: string;
  description: string;
  duration_ms: number;
  easing: string;
  css?: string;
  config?: MotionConfig;
  tick_rate_ms?: number;
  react_spring?: string;
  references: string[];
}

export interface MotionPrimitives {
  instant: MotionPrimitive;
  linear: MotionPrimitive;
  ease: MotionPrimitive;
  spring: MotionPrimitive;
  step: MotionPrimitive;
  deliberate: MotionPrimitive;
}

export interface FeedbackPrimitive {
  id: string;
  name: string;
  description: string;
  css?: string;
  css_template?: string;
  defaults?: Record<string, string | number>;
  references?: string[];
}

export interface FeedbackPrimitives {
  none: FeedbackPrimitive;
  highlight: FeedbackPrimitive;
  lift: FeedbackPrimitive;
  depress: FeedbackPrimitive;
  glow: FeedbackPrimitive;
  ripple: FeedbackPrimitive;
  pulse: FeedbackPrimitive;
  xp_drop: FeedbackPrimitive;
}

export interface SurfacePrimitive {
  id: string;
  name: string;
  description: string;
  css?: string;
  css_template?: string;
  defaults?: Record<string, string | number>;
  references?: string[];
}

export interface SurfacePrimitives {
  transparent: SurfacePrimitive;
  translucent: SurfacePrimitive;
  solid: SurfacePrimitive;
  textured: SurfacePrimitive;
}

export interface PhysicsKernel extends KernelBase {
  light: LightPrimitives;
  weight: WeightPrimitives;
  motion: MotionPrimitives;
  feedback: FeedbackPrimitives;
  surface: SurfacePrimitives;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYNC KERNEL (sync.yaml)
// ═══════════════════════════════════════════════════════════════════════════════

export type SyncStrategyType = 'crdt' | 'lww' | 'server_tick' | 'local_only';
export type TrustModel = 'eventually_consistent' | 'local_first' | 'server_authoritative' | 'local';
export type PendingIndicator = 'subtle' | 'none' | 'prominent';
export type ConflictResolution = 'automatic' | 'timestamp';
export type ConfirmationStyle = 'xp_drop' | 'checkmark' | 'fade';

export interface SyncUIBehavior {
  optimistic: boolean;
  show_presence: boolean;
  show_cursors?: boolean;
  pending_indicator: PendingIndicator;
  conflict_resolution?: ConflictResolution;
  confirmation_required?: boolean;
  confirmation_style?: ConfirmationStyle;
}

export interface ComponentRequirements {
  button?: string[];
  display?: string[];
}

export interface SyncStrategy {
  id: string;
  name: string;
  full_name: string;
  description: string;
  use_cases: string[];
  ui_behavior: SyncUIBehavior;
  trust_model: TrustModel;
  tick_rate_ms?: number;
  required_states?: string[];
  hook_template: string;
  component_requirements?: ComponentRequirements;
  references: string[];
}

export interface SyncStrategies {
  crdt: SyncStrategy;
  lww: SyncStrategy;
  server_tick: SyncStrategy;
  local_only: SyncStrategy;
}

export interface SyncSignals {
  keywords: string[];
  patterns: string[];
}

export interface SyncDetection {
  server_tick_signals: SyncSignals;
  crdt_signals: SyncSignals;
  lww_signals: SyncSignals;
}

export interface SyncKernel extends KernelBase {
  strategies: SyncStrategies;
  detection: SyncDetection;
  explicit_mappings: Record<string, SyncStrategyType>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIDELITY CEILING KERNEL (fidelity-ceiling.yaml)
// ═══════════════════════════════════════════════════════════════════════════════

export interface GoldStandardReference {
  name: string;
  why: string;
}

export interface GoldStandardReferences {
  primary: GoldStandardReference[];
  anti_references: GoldStandardReference[];
}

export interface GoldStandard {
  description: string;
  location: string;
  era: string;
  references: GoldStandardReferences;
}

export interface GradientConstraint {
  max_stops: number;
  allowed_types: string[];
  forbidden: string[];
  reason: string;
}

export interface ShadowConstraint {
  max_layers: number;
  max_blur_px: number;
  forbidden: string[];
  reason: string;
}

export interface BorderConstraint {
  max_width_px: number;
  allowed_styles: string[];
  forbidden: string[];
  reason: string;
}

export interface BorderRadiusConstraint {
  max_px: number;
  forbidden: string[];
  reason: string;
}

export interface ColorConstraint {
  max_palette_size: number;
  saturation: {
    min: number;
    max: number;
  };
  forbidden: string[];
  reason: string;
}

export interface VisualConstraints {
  gradients: GradientConstraint;
  shadows: ShadowConstraint;
  borders: BorderConstraint;
  border_radius: BorderRadiusConstraint;
  colors: ColorConstraint;
}

export interface AnimationConstraint {
  max_duration_ms: number;
  max_properties_animated: number;
  forbidden_effects: string[];
  easing: {
    allowed: string[];
    forbidden: string[];
  };
  reason: string;
}

export interface TypographyConstraint {
  max_font_families: number;
  max_font_weights: number;
  forbidden: string[];
  reason: string;
}

export interface LayoutConstraint {
  max_nesting_depth: number;
  forbidden: string[];
  reason: string;
}

export interface IconConstraint {
  style: 'outline' | 'solid' | 'duotone';
  stroke_width: number;
  max_colors: number;
  forbidden: string[];
  reason: string;
}

export interface FidelityConstraints {
  visual: VisualConstraints;
  animation: AnimationConstraint;
  typography: TypographyConstraint;
  layout: LayoutConstraint;
  icons: IconConstraint;
}

export type ViolationSeverity = 'warn' | 'error';

export interface DetectionPattern {
  pattern: string;
  message: string;
  severity?: ViolationSeverity;
}

export interface FidelityDetection {
  warning_patterns: DetectionPattern[];
  reject_patterns: DetectionPattern[];
}

export interface RetroConstraints {
  polygon_count: {
    max: number;
    per: string;
  };
  texture_resolution: {
    max_width: number;
    max_height: number;
  };
  color_depth: string;
  animation_frames: {
    max: number;
    per: string;
  };
  tick_rate_ms: number;
}

export interface RetroMode {
  enabled: boolean;
  constraints: RetroConstraints;
  agent_instruction: string;
}

export interface ValidationRule {
  check: string;
  max?: number;
  max_ms?: number;
  action: 'warn' | 'reject' | 'flag_if_exceeds' | 'require_justification';
}

export interface FidelityValidation {
  on_generate: ValidationRule[];
  on_approve: ValidationRule[];
}

export interface ZoneException {
  zone: string;
  relaxed_constraints: string[];
  reason: string;
}

export interface FidelityExceptions {
  allowed_zones: ZoneException[];
  approval_required: string[];
}

export interface FidelityCeilingKernel extends KernelBase {
  agent_instruction: string;
  gold_standard: GoldStandard;
  constraints: FidelityConstraints;
  detection: FidelityDetection;
  forbidden_techniques: string[];
  forbidden_outputs: string[];
  retro_mode: RetroMode;
  validation: FidelityValidation;
  exceptions: FidelityExceptions;
}

// ═══════════════════════════════════════════════════════════════════════════════
// KERNEL LOCK TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface KernelLockResult {
  success: boolean;
  locked_at: string;
  locked_by: string;
  files: string[];
  error?: string;
}

export interface KernelLockStatus {
  is_locked: boolean;
  locked_at: string | null;
  locked_by: string | null;
  files: {
    physics: boolean;
    sync: boolean;
    fidelity_ceiling: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// VERSION TRACKING
// ═══════════════════════════════════════════════════════════════════════════════

export interface SigilVersionFile {
  sigil_version: string;
  kernel_locked: boolean;
  kernel_locked_at: string | null;
  kernel_locked_by: string | null;
  setup_completed_at: string;
  last_updated: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE GUARDS
// ═══════════════════════════════════════════════════════════════════════════════

export function isPhysicsKernel(obj: unknown): obj is PhysicsKernel {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'version' in obj &&
    'light' in obj &&
    'weight' in obj &&
    'motion' in obj &&
    'feedback' in obj &&
    'surface' in obj
  );
}

export function isSyncKernel(obj: unknown): obj is SyncKernel {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'version' in obj &&
    'strategies' in obj &&
    'detection' in obj
  );
}

export function isFidelityCeilingKernel(obj: unknown): obj is FidelityCeilingKernel {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'version' in obj &&
    'agent_instruction' in obj &&
    'constraints' in obj &&
    'forbidden_techniques' in obj
  );
}

export function isKernelLocked(kernel: KernelBase): boolean {
  return kernel.locked === true;
}
