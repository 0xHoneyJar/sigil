// Sigil v2.0 — Shared Types

// =============================================================================
// TIME AUTHORITY
// =============================================================================

export type TimeAuthority = 'optimistic' | 'server-tick' | 'hybrid';

// =============================================================================
// PREDICTION
// =============================================================================

export type PredictionRender = 'ghost' | 'solid' | 'hidden';
export type PredictionReconcile = 'snap' | 'lerp' | 'ignore';

export interface PositionPrediction {
  enabled: boolean;
  render: PredictionRender;
  reconcile: PredictionReconcile;
  maxDrift: number;
}

export interface ProprioceptiveConfig {
  self: {
    rotation?: { instant: boolean };
    animation?: { optimistic: boolean };
    position?: PositionPrediction;
    inputState?: { feedback: 'immediate' | 'delayed' };
  };
  world: {
    damage: 'server-only';
    balance: 'server-only';
    otherEntities: 'server-only';
    inventory?: 'server-only';
  };
}

export interface SelfPredictionState {
  position: { predicted: unknown; confidence: number; render: PredictionRender } | null;
  rotation: number | null;
  animation: string | null;
}

export interface WorldTruthState {
  confirmed: boolean;
  position?: unknown;
}

// =============================================================================
// CRITICAL ACTION
// =============================================================================

export type CriticalStatus = 'idle' | 'confirming' | 'pending' | 'confirmed' | 'failed';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface CriticalActionState<TData = unknown> {
  status: CriticalStatus;
  timeAuthority: TimeAuthority;
  selfPrediction: SelfPredictionState;
  worldTruth: WorldTruthState;
  risk: RiskLevel;
  progress: number | null;
  error: Error | null;
  data: TData | null;
}

export interface CriticalActionOptions<TData, TVariables> {
  mutation: (variables: TVariables) => Promise<TData>;
  timeAuthority: TimeAuthority;
  proprioception?: ProprioceptiveConfig;
  optimistic?: (cache: Cache, variables: TVariables) => void;
  rollback?: (cache: Cache, variables: TVariables) => void;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

export interface CriticalAction<TData, TVariables> {
  state: CriticalActionState<TData>;
  commit: (variables: TVariables) => Promise<void>;
  cancel: () => void;
  retry: () => void;
}

// =============================================================================
// CACHE
// =============================================================================

export interface Cache {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  update<T>(key: string, updater: (value: T) => T): void;
  append<T>(key: string, item: T): void;
  remove<T>(key: string, predicate: (item: T) => boolean): void;
  revert(key: string): void;
}

// =============================================================================
// ZONES
// =============================================================================

export type ZoneType = 'critical' | 'admin' | 'marketing' | 'default';

export interface Zone {
  type: ZoneType;
  financial?: boolean;
  competitive?: boolean;
}

// =============================================================================
// LENS
// =============================================================================

export type LensClassification = 'cosmetic' | 'utility' | 'gameplay';

export interface LensPermissions {
  colors: boolean;
  typography: boolean;
  spacing: boolean;
  animations: boolean;
  icons: boolean;
  overlays: boolean;
  highlights: boolean;
  badges: boolean;
  tooltips: boolean;
  inputHints: boolean;
  dataAugmentation: boolean;
  automation: boolean;
}

export interface LensRestrictions {
  criticalZones: boolean;
  financialFlow: boolean;
  competitiveMode: boolean;
}

export interface IntegrityFlags {
  classification: LensClassification;
  permissions: Partial<LensPermissions>;
  restrictions: LensRestrictions;
}

export interface Lens {
  name: string;
  classification: LensClassification;
  CriticalButton: React.ComponentType<CriticalButtonProps>;
  GlassButton: React.ComponentType<GlassButtonProps>;
  MachineryItem: React.ComponentType<MachineryItemProps>;
}

// =============================================================================
// LENS COMPONENT PROPS
// =============================================================================

export interface CriticalButtonProps {
  state: CriticalActionState;
  onAction: () => void;
  children: React.ReactNode;
  labels?: {
    confirming?: string;
    pending?: string;
    confirmed?: string;
    failed?: string;
  };
}

export interface GlassButtonProps {
  onAction: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface MachineryItemProps {
  onAction: () => void;
  onDelete?: () => void;
  isActive?: boolean;
  children: React.ReactNode;
}

// =============================================================================
// ERGONOMIC PROFILER
// =============================================================================

export interface HitboxConfig {
  minTouchTarget: number;
  maxCenterDrift: number;
  minClickableArea: number;
}

export interface ContrastConfig {
  minRatio: number;
  criticalMinRatio: number;
  criticalElements: string[];
}

export interface FocusConfig {
  indicatorRequired: boolean;
  minIndicatorContrast: number;
}

export interface ErgonomicConfig {
  hitbox: HitboxConfig;
  contrast: ContrastConfig;
  focus: FocusConfig;
}

export interface HitboxIssue {
  element: string;
  measured: number;
  required: number;
  type: 'size' | 'drift' | 'area';
}

export interface ContrastIssue {
  element: string;
  measured: number;
  required: number;
  foreground: string;
  background: string;
}

export interface FocusIssue {
  element: string;
  issue: 'missing' | 'low-contrast';
}

export interface ErgonomicValidation {
  hitbox: { valid: boolean; issues: HitboxIssue[] };
  contrast: { valid: boolean; issues: ContrastIssue[] };
  focus: { valid: boolean; issues: FocusIssue[] };
}

export interface LensRegistration {
  lens: Lens;
  profile: ErgonomicValidation;
  status: 'approved' | 'rejected';
  classification: LensClassification;
}

// =============================================================================
// REACT IMPORTS (for component types)
// =============================================================================

import type { ReactNode, ComponentType } from 'react';

declare global {
  namespace React {
    type ReactNode = ReactNode;
    type ComponentType<P = {}> = ComponentType<P>;
  }
}
