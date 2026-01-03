/**
 * Sigil Workbench Types
 */

export interface TensionState {
  playfulness: number; // 0-100: Serious <-> Playful
  weight: number; // 0-100: Light <-> Heavy
  density: number; // 0-100: Spacious <-> Dense
  speed: number; // 0-100: Deliberate <-> Instant
}

export type MaterialType = 'glass' | 'clay' | 'machinery';

export type SyncStrategy = 'crdt' | 'lww' | 'server_tick' | 'none';

export interface ZoneConfig {
  name: string;
  material: MaterialType;
  sync: SyncStrategy;
  paths: string[];
}

export interface SigilConfig {
  version: string;
  zones: ZoneConfig[];
  tensions: {
    current: TensionState;
    presets: TensionPreset[];
  };
  gardener: {
    paper_cut_threshold: number;
    three_to_one_rule: boolean;
    enforcement: 'advisory' | 'strict';
  };
  founder_mode: {
    pair_required: boolean;
    invariant_protection: string[];
  };
}

export interface TensionPreset {
  name: string;
  description: string;
  tensions: TensionState;
}

export interface Correction {
  id: string;
  issue: string;
  correction: string;
  applies_to?: string;
  flagged_at: string;
  applied_count?: number;
}

export interface PaperCut {
  id: string;
  category: string;
  description: string;
  file_path?: string;
  line_number?: number;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'fixed' | 'wontfix';
  created_at: string;
  fixed_at?: string;
}

export interface FounderAuditRecord {
  id: string;
  action: string;
  second_taste_owner: string;
  rationale?: string;
  timestamp: string;
}

export interface WorkbenchState {
  tensions: TensionState;
  isSandbox: boolean;
  isDirty: boolean;
  isLoading: boolean;
  activeZone: string | null;
  zones: ZoneConfig[];
}

// Default tensions - balanced middle ground
export const DEFAULT_TENSIONS: TensionState = {
  playfulness: 50,
  weight: 50,
  density: 50,
  speed: 50,
};

// Named presets
export const TENSION_PRESETS: Record<string, TensionPreset> = {
  linear: {
    name: 'linear',
    description: 'Minimal, fast, information-dense. Serious business tools.',
    tensions: {
      playfulness: 20,
      weight: 30,
      density: 70,
      speed: 95,
    },
  },
  airbnb: {
    name: 'airbnb',
    description: 'Balanced, warm, welcoming. Consumer-friendly products.',
    tensions: {
      playfulness: 50,
      weight: 60,
      density: 40,
      speed: 50,
    },
  },
  nintendo: {
    name: 'nintendo',
    description: 'Playful, bouncy, delightful. Games and entertainment.',
    tensions: {
      playfulness: 80,
      weight: 50,
      density: 30,
      speed: 60,
    },
  },
  osrs: {
    name: 'osrs',
    description: 'Chunky, deliberate, nostalgic. Retro and web3 vibes.',
    tensions: {
      playfulness: 30,
      weight: 70,
      density: 60,
      speed: 40,
    },
  },
};

// Default zones for new projects
export const DEFAULT_ZONES: ZoneConfig[] = [
  {
    name: 'critical',
    material: 'clay',
    sync: 'server_tick',
    paths: ['src/features/checkout/**', 'src/features/claim/**'],
  },
  {
    name: 'transactional',
    material: 'machinery',
    sync: 'lww',
    paths: ['src/features/dashboard/**'],
  },
  {
    name: 'exploratory',
    material: 'glass',
    sync: 'lww',
    paths: ['src/features/discovery/**'],
  },
];
