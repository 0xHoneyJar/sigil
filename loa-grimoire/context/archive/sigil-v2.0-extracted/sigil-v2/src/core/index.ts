// Sigil v2.0 — Core
// Physics engines for state, time, and prediction

export { useCriticalAction } from './useCriticalAction';
export { useLocalCache, useGlobalCache } from './useLocalCache';

// Re-export types
export type {
  CriticalAction,
  CriticalActionOptions,
  CriticalActionState,
  TimeAuthority,
  ProprioceptiveConfig,
  SelfPredictionState,
  WorldTruthState,
  Cache,
} from '../types';
