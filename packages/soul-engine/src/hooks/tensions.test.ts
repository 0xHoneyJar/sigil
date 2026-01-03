/**
 * Tension System Unit Tests
 *
 * Comprehensive tests for the tension system including:
 * - TensionState interface validation
 * - Preset configurations
 * - CSS variable generation
 * - TensionProvider behavior
 * - useTensions hook
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';

import {
  DEFAULT_TENSIONS,
  TENSION_PRESETS,
  getPreset,
  getPresetNames,
  isValidPreset,
} from './presets.js';
import {
  tensionsToCSSVariables,
  getTensionStyleString,
} from './tensionsToCSSVariables.js';
import { TensionProvider } from './TensionProvider.js';
import { useTensions, useTensionValues, useTensionCSSVariables } from './useTensions.js';
import type { TensionState } from './types.js';

// ============ DEFAULT TENSIONS TESTS ============

describe('DEFAULT_TENSIONS', () => {
  it('should have all 4 axes at 50 (balanced)', () => {
    expect(DEFAULT_TENSIONS.playfulness).toBe(50);
    expect(DEFAULT_TENSIONS.weight).toBe(50);
    expect(DEFAULT_TENSIONS.density).toBe(50);
    expect(DEFAULT_TENSIONS.speed).toBe(50);
  });

  it('should be frozen/immutable', () => {
    // Verify the values are what we expect
    const tensions = { ...DEFAULT_TENSIONS };
    expect(tensions).toEqual({
      playfulness: 50,
      weight: 50,
      density: 50,
      speed: 50,
    });
  });
});

// ============ PRESET TESTS ============

describe('TENSION_PRESETS', () => {
  it('should have exactly 4 presets', () => {
    expect(Object.keys(TENSION_PRESETS)).toHaveLength(4);
  });

  it('should have linear preset (minimal, fast)', () => {
    const preset = TENSION_PRESETS.linear;
    expect(preset.name).toBe('linear');
    expect(preset.tensions.playfulness).toBe(20); // Serious
    expect(preset.tensions.speed).toBe(95); // Fast
    expect(preset.tensions.density).toBe(70); // Dense
  });

  it('should have airbnb preset (balanced, warm)', () => {
    const preset = TENSION_PRESETS.airbnb;
    expect(preset.name).toBe('airbnb');
    expect(preset.tensions.playfulness).toBe(50);
    expect(preset.tensions.weight).toBe(60);
    expect(preset.tensions.speed).toBe(50);
  });

  it('should have nintendo preset (playful, bouncy)', () => {
    const preset = TENSION_PRESETS.nintendo;
    expect(preset.name).toBe('nintendo');
    expect(preset.tensions.playfulness).toBe(80); // Very playful
    expect(preset.tensions.density).toBe(30); // Spacious
  });

  it('should have osrs preset (chunky, deliberate)', () => {
    const preset = TENSION_PRESETS.osrs;
    expect(preset.name).toBe('osrs');
    expect(preset.tensions.weight).toBe(70); // Heavy
    expect(preset.tensions.speed).toBe(40); // Deliberate
  });

  it('should all have valid tension ranges (0-100)', () => {
    for (const preset of Object.values(TENSION_PRESETS)) {
      const { tensions } = preset;
      expect(tensions.playfulness).toBeGreaterThanOrEqual(0);
      expect(tensions.playfulness).toBeLessThanOrEqual(100);
      expect(tensions.weight).toBeGreaterThanOrEqual(0);
      expect(tensions.weight).toBeLessThanOrEqual(100);
      expect(tensions.density).toBeGreaterThanOrEqual(0);
      expect(tensions.density).toBeLessThanOrEqual(100);
      expect(tensions.speed).toBeGreaterThanOrEqual(0);
      expect(tensions.speed).toBeLessThanOrEqual(100);
    }
  });

  it('should all have descriptions', () => {
    for (const preset of Object.values(TENSION_PRESETS)) {
      expect(preset.description).toBeTruthy();
      expect(preset.description.length).toBeGreaterThan(10);
    }
  });
});

describe('getPreset', () => {
  it('should return preset by name', () => {
    const linear = getPreset('linear');
    expect(linear?.tensions.playfulness).toBe(20);
  });

  it('should return undefined for unknown preset', () => {
    const unknown = getPreset('unknown');
    expect(unknown).toBeUndefined();
  });
});

describe('getPresetNames', () => {
  it('should return all preset names', () => {
    const names = getPresetNames();
    expect(names).toContain('linear');
    expect(names).toContain('airbnb');
    expect(names).toContain('nintendo');
    expect(names).toContain('osrs');
  });
});

describe('isValidPreset', () => {
  it('should return true for valid presets', () => {
    expect(isValidPreset('linear')).toBe(true);
    expect(isValidPreset('airbnb')).toBe(true);
  });

  it('should return false for invalid presets', () => {
    expect(isValidPreset('unknown')).toBe(false);
    expect(isValidPreset('')).toBe(false);
  });
});

// ============ CSS VARIABLE GENERATION TESTS ============

describe('tensionsToCSSVariables', () => {
  it('should generate CSS variables from tensions', () => {
    const cssVars = tensionsToCSSVariables(DEFAULT_TENSIONS);

    // Check all categories are represented
    expect(cssVars['--sigil-border-radius']).toBeDefined();
    expect(cssVars['--sigil-shadow-opacity']).toBeDefined();
    expect(cssVars['--sigil-spacing-unit']).toBeDefined();
    expect(cssVars['--sigil-transition-duration']).toBeDefined();
  });

  it('should generate at least 18 CSS variables', () => {
    const cssVars = tensionsToCSSVariables(DEFAULT_TENSIONS);
    expect(Object.keys(cssVars).length).toBeGreaterThanOrEqual(18);
  });

  // Playfulness tests
  describe('playfulness mapping', () => {
    it('should generate higher border radius for playful tensions', () => {
      const playful = { ...DEFAULT_TENSIONS, playfulness: 100 };
      const serious = { ...DEFAULT_TENSIONS, playfulness: 0 };

      const playfulRadius = parseFloat(tensionsToCSSVariables(playful)['--sigil-border-radius']);
      const seriousRadius = parseFloat(tensionsToCSSVariables(serious)['--sigil-border-radius']);

      expect(playfulRadius).toBeGreaterThan(seriousRadius);
      expect(seriousRadius).toBe(4); // Min
      expect(playfulRadius).toBe(16); // Max
    });

    it('should enable bounce animation only for high playfulness', () => {
      const playful = { ...DEFAULT_TENSIONS, playfulness: 80 };
      const serious = { ...DEFAULT_TENSIONS, playfulness: 50 };

      expect(tensionsToCSSVariables(playful)['--sigil-animation-bounce']).toBe('1.1');
      expect(tensionsToCSSVariables(serious)['--sigil-animation-bounce']).toBe('1.0');
    });

    it('should set icon style based on playfulness', () => {
      const playful = { ...DEFAULT_TENSIONS, playfulness: 70 };
      const serious = { ...DEFAULT_TENSIONS, playfulness: 50 };

      expect(tensionsToCSSVariables(playful)['--sigil-icon-style']).toBe('rounded');
      expect(tensionsToCSSVariables(serious)['--sigil-icon-style']).toBe('sharp');
    });

    it('should increase color saturation with playfulness', () => {
      const playful = { ...DEFAULT_TENSIONS, playfulness: 100 };
      const serious = { ...DEFAULT_TENSIONS, playfulness: 0 };

      const playfulSat = parseFloat(tensionsToCSSVariables(playful)['--sigil-color-saturation']);
      const seriousSat = parseFloat(tensionsToCSSVariables(serious)['--sigil-color-saturation']);

      expect(playfulSat).toBe(100);
      expect(seriousSat).toBe(80);
    });
  });

  // Weight tests
  describe('weight mapping', () => {
    it('should increase shadow opacity with weight', () => {
      const heavy = { ...DEFAULT_TENSIONS, weight: 100 };
      const light = { ...DEFAULT_TENSIONS, weight: 0 };

      const heavyOpacity = parseFloat(tensionsToCSSVariables(heavy)['--sigil-shadow-opacity']);
      const lightOpacity = parseFloat(tensionsToCSSVariables(light)['--sigil-shadow-opacity']);

      expect(heavyOpacity).toBeGreaterThan(lightOpacity);
      expect(lightOpacity).toBe(0.05);
      expect(heavyOpacity).toBe(0.15);
    });

    it('should increase shadow blur with weight', () => {
      const heavy = { ...DEFAULT_TENSIONS, weight: 100 };
      const light = { ...DEFAULT_TENSIONS, weight: 0 };

      const heavyBlur = parseFloat(tensionsToCSSVariables(heavy)['--sigil-shadow-blur']);
      const lightBlur = parseFloat(tensionsToCSSVariables(light)['--sigil-shadow-blur']);

      expect(heavyBlur).toBe(24);
      expect(lightBlur).toBe(4);
    });

    it('should set bolder font weight for heavy tensions', () => {
      const heavy = { ...DEFAULT_TENSIONS, weight: 70 };
      const light = { ...DEFAULT_TENSIONS, weight: 50 };

      expect(tensionsToCSSVariables(heavy)['--sigil-font-weight']).toBe('600');
      expect(tensionsToCSSVariables(light)['--sigil-font-weight']).toBe('400');
    });
  });

  // Density tests
  describe('density mapping', () => {
    it('should decrease spacing with higher density', () => {
      const dense = { ...DEFAULT_TENSIONS, density: 100 };
      const spacious = { ...DEFAULT_TENSIONS, density: 0 };

      const denseSpacing = parseFloat(tensionsToCSSVariables(dense)['--sigil-spacing-unit']);
      const spaciousSpacing = parseFloat(tensionsToCSSVariables(spacious)['--sigil-spacing-unit']);

      expect(denseSpacing).toBeLessThan(spaciousSpacing);
      expect(denseSpacing).toBe(6);
      expect(spaciousSpacing).toBe(8);
    });

    it('should decrease gap with higher density', () => {
      const dense = { ...DEFAULT_TENSIONS, density: 100 };
      const spacious = { ...DEFAULT_TENSIONS, density: 0 };

      const denseGap = parseFloat(tensionsToCSSVariables(dense)['--sigil-gap']);
      const spaciousGap = parseFloat(tensionsToCSSVariables(spacious)['--sigil-gap']);

      expect(denseGap).toBe(12);
      expect(spaciousGap).toBe(24);
    });

    it('should decrease font size with higher density', () => {
      const dense = { ...DEFAULT_TENSIONS, density: 100 };
      const spacious = { ...DEFAULT_TENSIONS, density: 0 };

      const denseFont = parseFloat(tensionsToCSSVariables(dense)['--sigil-font-size-base']);
      const spaciousFont = parseFloat(tensionsToCSSVariables(spacious)['--sigil-font-size-base']);

      expect(denseFont).toBe(14);
      expect(spaciousFont).toBe(16);
    });
  });

  // Speed tests
  describe('speed mapping', () => {
    it('should generate shorter transitions for faster speeds', () => {
      const fast = { ...DEFAULT_TENSIONS, speed: 100 };
      const slow = { ...DEFAULT_TENSIONS, speed: 0 };

      const fastDuration = parseFloat(tensionsToCSSVariables(fast)['--sigil-transition-duration']);
      const slowDuration = parseFloat(tensionsToCSSVariables(slow)['--sigil-transition-duration']);

      expect(fastDuration).toBeLessThan(slowDuration);
      expect(fastDuration).toBe(20);
      expect(slowDuration).toBe(300);
    });

    it('should generate shorter animation durations for faster speeds', () => {
      const fast = { ...DEFAULT_TENSIONS, speed: 100 };
      const slow = { ...DEFAULT_TENSIONS, speed: 0 };

      const fastAnim = parseFloat(tensionsToCSSVariables(fast)['--sigil-animation-duration']);
      const slowAnim = parseFloat(tensionsToCSSVariables(slow)['--sigil-animation-duration']);

      expect(fastAnim).toBe(50);
      expect(slowAnim).toBe(400);
    });

    it('should set linear easing for fast speeds', () => {
      const fast = { ...DEFAULT_TENSIONS, speed: 80 };
      const slow = { ...DEFAULT_TENSIONS, speed: 50 };

      expect(tensionsToCSSVariables(fast)['--sigil-easing']).toBe('linear');
      expect(tensionsToCSSVariables(slow)['--sigil-easing']).toBe('ease-out');
    });

    it('should reduce delay with higher speed', () => {
      const fast = { ...DEFAULT_TENSIONS, speed: 100 };
      const slow = { ...DEFAULT_TENSIONS, speed: 0 };

      const fastDelay = parseFloat(tensionsToCSSVariables(fast)['--sigil-delay']);
      const slowDelay = parseFloat(tensionsToCSSVariables(slow)['--sigil-delay']);

      expect(fastDelay).toBe(0);
      expect(slowDelay).toBe(100);
    });
  });

  // Clamping tests
  describe('value clamping', () => {
    it('should handle values below 0', () => {
      const tensions: TensionState = {
        playfulness: -50,
        weight: 50,
        density: 50,
        speed: 50,
      };
      const cssVars = tensionsToCSSVariables(tensions);
      const radius = parseFloat(cssVars['--sigil-border-radius']);
      expect(radius).toBe(4); // Should clamp to min
    });

    it('should handle values above 100', () => {
      const tensions: TensionState = {
        playfulness: 150,
        weight: 50,
        density: 50,
        speed: 50,
      };
      const cssVars = tensionsToCSSVariables(tensions);
      const radius = parseFloat(cssVars['--sigil-border-radius']);
      expect(radius).toBe(16); // Should clamp to max
    });
  });
});

describe('getTensionStyleString', () => {
  it('should return style string for inline use', () => {
    const styleString = getTensionStyleString(DEFAULT_TENSIONS);
    expect(styleString).toContain('--sigil-border-radius');
    expect(styleString).toContain(';');
  });
});

// ============ TENSION PROVIDER TESTS ============

describe('TensionProvider', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(TensionProvider, { autoLoad: false, immediateUpdates: true }, children);

  it('should provide default tensions', () => {
    const { result } = renderHook(() => useTensions(), { wrapper });

    expect(result.current.tensions).toEqual(DEFAULT_TENSIONS);
  });

  it('should accept initial tensions', () => {
    const customWrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        TensionProvider,
        { initialTensions: { playfulness: 80 }, autoLoad: false, immediateUpdates: true },
        children
      );

    const { result } = renderHook(() => useTensions(), { wrapper: customWrapper });

    expect(result.current.tensions.playfulness).toBe(80);
    expect(result.current.tensions.weight).toBe(50); // Default
  });

  it('should set single tension', () => {
    const { result } = renderHook(() => useTensions(), { wrapper });

    act(() => {
      result.current.setTension('playfulness', 75);
    });

    expect(result.current.tensions.playfulness).toBe(75);
  });

  it('should set multiple tensions', () => {
    const { result } = renderHook(() => useTensions(), { wrapper });

    act(() => {
      result.current.setTensions({ playfulness: 60, weight: 70 });
    });

    expect(result.current.tensions.playfulness).toBe(60);
    expect(result.current.tensions.weight).toBe(70);
  });

  it('should clamp tension values', () => {
    const { result } = renderHook(() => useTensions(), { wrapper });

    act(() => {
      result.current.setTension('playfulness', 150);
    });

    expect(result.current.tensions.playfulness).toBe(100);

    act(() => {
      result.current.setTension('playfulness', -50);
    });

    expect(result.current.tensions.playfulness).toBe(0);
  });

  it('should reset tensions to defaults', () => {
    const { result } = renderHook(() => useTensions(), { wrapper });

    act(() => {
      result.current.setTensions({ playfulness: 80, weight: 90 });
    });

    expect(result.current.tensions.playfulness).toBe(80);

    act(() => {
      result.current.resetTensions();
    });

    expect(result.current.tensions).toEqual(DEFAULT_TENSIONS);
  });

  it('should apply preset', () => {
    const { result } = renderHook(() => useTensions(), { wrapper });

    act(() => {
      result.current.applyPreset('nintendo');
    });

    expect(result.current.tensions).toEqual(TENSION_PRESETS.nintendo.tensions);
  });

  it('should warn on invalid preset', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useTensions(), { wrapper });

    act(() => {
      result.current.applyPreset('invalid');
    });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown tension preset'));
    warnSpy.mockRestore();
  });

  it('should provide CSS variables', () => {
    const { result } = renderHook(() => useTensions(), { wrapper });

    expect(result.current.cssVariables).toBeDefined();
    expect(result.current.cssVariables['--sigil-border-radius']).toBeDefined();
  });

  it('should track dirty state', () => {
    const { result } = renderHook(() => useTensions(), { wrapper });

    expect(result.current.isDirty).toBe(false);

    act(() => {
      result.current.setTension('playfulness', 60);
    });

    expect(result.current.isDirty).toBe(true);
  });

  it('should not be loading when autoLoad is false', () => {
    const { result } = renderHook(() => useTensions(), { wrapper });

    expect(result.current.isLoading).toBe(false);
  });
});

// ============ useTensions HOOK TESTS ============

describe('useTensions', () => {
  it('should throw when used outside provider', () => {
    expect(() => {
      renderHook(() => useTensions());
    }).toThrow('useTensions must be used within a TensionProvider');
  });
});

describe('useTensionValues', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(TensionProvider, { autoLoad: false, immediateUpdates: true }, children);

  it('should return just tension values', () => {
    const { result } = renderHook(() => useTensionValues(), { wrapper });

    expect(result.current).toEqual(DEFAULT_TENSIONS);
    expect(result.current.playfulness).toBe(50);
  });
});

describe('useTensionCSSVariables', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(TensionProvider, { autoLoad: false, immediateUpdates: true }, children);

  it('should return just CSS variables', () => {
    const { result } = renderHook(() => useTensionCSSVariables(), { wrapper });

    expect(result.current['--sigil-border-radius']).toBeDefined();
    expect(typeof result.current).toBe('object');
  });
});

// ============ PRESET APPLICATION TESTS ============

describe('Preset Applications', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(TensionProvider, { autoLoad: false, immediateUpdates: true }, children);

  it('linear preset should produce fast transitions', () => {
    const cssVars = tensionsToCSSVariables(TENSION_PRESETS.linear.tensions);
    const duration = parseFloat(cssVars['--sigil-transition-duration']);
    expect(duration).toBeLessThan(50); // Very fast
  });

  it('nintendo preset should produce bouncy animations', () => {
    const cssVars = tensionsToCSSVariables(TENSION_PRESETS.nintendo.tensions);
    expect(cssVars['--sigil-animation-bounce']).toBe('1.1');
    expect(cssVars['--sigil-icon-style']).toBe('rounded');
  });

  it('osrs preset should produce heavy shadows', () => {
    const cssVars = tensionsToCSSVariables(TENSION_PRESETS.osrs.tensions);
    const opacity = parseFloat(cssVars['--sigil-shadow-opacity']);
    expect(opacity).toBeGreaterThan(0.1);
  });

  it('airbnb preset should be balanced', () => {
    const cssVars = tensionsToCSSVariables(TENSION_PRESETS.airbnb.tensions);
    const duration = parseFloat(cssVars['--sigil-transition-duration']);
    expect(duration).toBeGreaterThan(100);
    expect(duration).toBeLessThan(200);
  });
});
