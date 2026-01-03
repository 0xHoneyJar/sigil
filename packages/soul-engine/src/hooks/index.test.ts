import { describe, it, expect } from 'vitest';
import {
  tensionsToCSSVariables,
  DEFAULT_TENSIONS,
  TENSION_PRESETS,
} from './index.js';

describe('tensionsToCSSVariables', () => {
  it('should generate CSS variables from tensions', () => {
    const cssVars = tensionsToCSSVariables(DEFAULT_TENSIONS);

    expect(cssVars['--sigil-border-radius']).toBeDefined();
    expect(cssVars['--sigil-transition-duration']).toBeDefined();
    expect(cssVars['--sigil-font-weight']).toBeDefined();
  });

  it('should generate higher border radius for playful tensions', () => {
    const playful = { ...DEFAULT_TENSIONS, playfulness: 100 };
    const serious = { ...DEFAULT_TENSIONS, playfulness: 0 };

    const playfulVars = tensionsToCSSVariables(playful);
    const seriousVars = tensionsToCSSVariables(serious);

    const playfulRadius = parseFloat(playfulVars['--sigil-border-radius']);
    const seriousRadius = parseFloat(seriousVars['--sigil-border-radius']);

    expect(playfulRadius).toBeGreaterThan(seriousRadius);
  });

  it('should generate shorter transitions for faster speeds', () => {
    const fast = { ...DEFAULT_TENSIONS, speed: 100 };
    const slow = { ...DEFAULT_TENSIONS, speed: 0 };

    const fastVars = tensionsToCSSVariables(fast);
    const slowVars = tensionsToCSSVariables(slow);

    const fastDuration = parseFloat(fastVars['--sigil-transition-duration']);
    const slowDuration = parseFloat(slowVars['--sigil-transition-duration']);

    expect(fastDuration).toBeLessThan(slowDuration);
  });

  it('should have 4 presets', () => {
    expect(Object.keys(TENSION_PRESETS)).toHaveLength(4);
    expect(TENSION_PRESETS.linear).toBeDefined();
    expect(TENSION_PRESETS.airbnb).toBeDefined();
    expect(TENSION_PRESETS.nintendo).toBeDefined();
    expect(TENSION_PRESETS.osrs).toBeDefined();
  });
});
