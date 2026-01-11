// Sigil v2.0 — Profiler
// Ergonomic validation for lenses

export {
  profileLens,
  registerLensWithValidation,
  LensRejection,
  DEFAULT_ERGONOMIC_CONFIG,
  getRelativeLuminance,
  getContrastRatio,
  parseColor,
} from './ergonomic';

export type {
  ErgonomicConfig,
  ErgonomicValidation,
  HitboxIssue,
  ContrastIssue,
  FocusIssue,
} from '../types';
