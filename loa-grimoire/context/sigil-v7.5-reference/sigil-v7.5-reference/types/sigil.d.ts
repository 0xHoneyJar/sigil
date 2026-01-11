/**
 * Sigil Type Definitions
 * 
 * Types for the Sigil design context framework.
 */

// =============================================================================
// PHYSICS
// =============================================================================

export type PhysicsName = 'server-tick' | 'deliberate' | 'snappy' | 'smooth';

export interface Physics {
  duration: number;
  easing: string;
  description?: string;
}

export type PhysicsMap = Record<PhysicsName, Physics>;

// =============================================================================
// ZONES
// =============================================================================

export type ZoneName = 'critical' | 'important' | 'casual';

export interface Zone {
  description: string;
  physics: PhysicsName[];
  requires_gold: boolean;
  examples?: string[];
}

export type ZoneMap = Record<ZoneName, Zone>;

// =============================================================================
// VOCABULARY
// =============================================================================

export interface VocabularyEntry {
  zone: ZoneName;
  physics: PhysicsName;
  component_hint?: string;
}

export type VocabularyMap = Record<string, VocabularyEntry>;

// =============================================================================
// CONSTRAINTS
// =============================================================================

export type ConstraintTier = 'structural' | 'physics' | 'taste';

export interface Constraint {
  rule: string;
  description: string;
  tolerance?: number;
  palette?: string;
  scale?: number[];
}

export type ConstraintMap = Record<ConstraintTier, Constraint[]>;

// =============================================================================
// GOVERNANCE
// =============================================================================

export interface NominationConfig {
  min_uses: number;
  min_judge_score: number;
  max_mutinies: number;
  auto_promote: boolean;
}

export interface DemotionConfig {
  trigger: string;
  auto_demote: boolean;
}

export interface Governance {
  nomination: NominationConfig;
  demotion: DemotionConfig;
  seniors: string[];
}

// =============================================================================
// TASTE PROFILE
// =============================================================================

export interface TasteProfile {
  version: string;
  physics: PhysicsMap;
  zones: ZoneMap;
  vocabulary: VocabularyMap;
  constraints: ConstraintMap;
  governance: Governance;
}

// =============================================================================
// COMPONENT STATUS
// =============================================================================

export type ComponentStatus = 'gold' | 'silver' | 'draft';

export interface ComponentMeta {
  status: ComponentStatus;
  zone: ZoneName;
  physics: PhysicsName;
  uses?: number;
  mutinies?: number;
  judgeScore?: number;
  lastModified?: string;
}

// =============================================================================
// REGISTRIES
// =============================================================================

export interface RegistryEntry {
  name: string;
  path: string;
  meta?: ComponentMeta;
}

export interface Registry {
  gold: RegistryEntry[];
  silver: RegistryEntry[];
  draft: RegistryEntry[];
}

// =============================================================================
// NOMINATIONS
// =============================================================================

export interface Nomination {
  component: string;
  currentStatus: ComponentStatus;
  proposedStatus: ComponentStatus;
  evidence: {
    uses: number;
    judgeScore: number;
    consistency: number;
    mutinies: number;
  };
  proposedAt: string;
  proposedBy: 'agent' | 'human';
}

// =============================================================================
// MUTINY
// =============================================================================

export interface Mutiny {
  component: string;
  pattern: string;
  override: string;
  user: string;
  file: string;
  timestamp: string;
  weight: number;
}

// =============================================================================
// VALIDATION
// =============================================================================

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationResult {
  rule: string;
  tier: ConstraintTier;
  severity: ValidationSeverity;
  message: string;
  file: string;
  line?: number;
  column?: number;
  fix?: {
    range: [number, number];
    replacement: string;
  };
}

// =============================================================================
// AGENT CONTEXT
// =============================================================================

export type AgentMode = 'craft' | 'forge' | 'draft';

export interface AgentContext {
  mode: AgentMode;
  tasteProfile: TasteProfile;
  registry: Registry;
  currentFile?: string;
  currentZone?: ZoneName;
}

// =============================================================================
// STREAMING
// =============================================================================

export interface StreamToken {
  content: string;
  validated: boolean;
  violations?: ValidationResult[];
}

export interface StreamRollback {
  marker: string;
  position: number;
  reason: string;
  correctedContent: string;
}

// =============================================================================
// JUDGE
// =============================================================================

export interface JudgeScore {
  overall: number;
  physics: number;
  vocabulary: number;
  zoneAppropriateness: number;
  suggestions?: string[];
}

export interface JudgeResult {
  component: string;
  score: JudgeScore;
  timestamp: string;
  shouldNominate: boolean;
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * CSS properties for Sigil physics
 */
export interface SigilCSSProperties extends React.CSSProperties {
  '--sigil-duration'?: string;
  '--sigil-easing'?: string;
}

/**
 * Helper to get physics CSS variables
 */
export function getPhysicsStyle(physics: Physics): SigilCSSProperties {
  return {
    '--sigil-duration': `${physics.duration}ms`,
    '--sigil-easing': physics.easing,
  };
}

/**
 * Helper to match vocabulary to zone
 */
export function getZoneForVocabulary(
  word: string,
  vocabulary: VocabularyMap
): ZoneName | undefined {
  const entry = vocabulary[word.toLowerCase()];
  return entry?.zone;
}

/**
 * Helper to get physics for vocabulary
 */
export function getPhysicsForVocabulary(
  word: string,
  vocabulary: VocabularyMap,
  physicsMap: PhysicsMap
): Physics | undefined {
  const entry = vocabulary[word.toLowerCase()];
  if (!entry) return undefined;
  return physicsMap[entry.physics];
}
