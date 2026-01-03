/**
 * Tension Presets
 *
 * Named presets for common design paradigms.
 */

import type { TensionState, TensionPreset, TensionPresetName } from './types.js';

/**
 * Default tension values - balanced middle ground.
 */
export const DEFAULT_TENSIONS: TensionState = {
  playfulness: 50,
  weight: 50,
  density: 50,
  speed: 50,
};

/**
 * Named tension presets.
 *
 * - linear: Minimal, fast, information-dense (Linear app style)
 * - airbnb: Balanced, warm, welcoming (Airbnb style)
 * - nintendo: Playful, bouncy, delightful (Nintendo style)
 * - osrs: Chunky, deliberate, nostalgic (Old School RuneScape style)
 */
export const TENSION_PRESETS: Record<TensionPresetName, TensionPreset> = {
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

/**
 * Get preset by name.
 */
export function getPreset(name: TensionPresetName | string): TensionPreset | undefined {
  return TENSION_PRESETS[name as TensionPresetName];
}

/**
 * Get all preset names.
 */
export function getPresetNames(): TensionPresetName[] {
  return Object.keys(TENSION_PRESETS) as TensionPresetName[];
}

/**
 * Check if a name is a valid preset name.
 */
export function isValidPreset(name: string): name is TensionPresetName {
  return name in TENSION_PRESETS;
}
