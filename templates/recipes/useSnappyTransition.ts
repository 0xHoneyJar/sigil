/**
 * useSnappyTransition - Admin Zone Motion Recipe
 *
 * @zone admin
 * @feel Instant, efficient, no-nonsense
 * @timing <200ms, minimal animation
 *
 * Use for:
 * - Admin dashboards
 * - Settings panels
 * - Data tables
 * - Form interactions
 * - Utility screens
 *
 * The snappy timing respects power users who need efficiency.
 * Animation exists only to provide feedback, not to impress.
 *
 * @example
 * ```tsx
 * const { style, toggle } = useSnappyTransition();
 *
 * return (
 *   <animated.div style={style}>
 *     <SettingsPanel />
 *   </animated.div>
 * );
 * ```
 */

import { useSpring, animated, config } from "@react-spring/web";
import { useState, useCallback } from "react";

interface SnappyTransitionOptions {
  /** Duration in ms (default: 150) */
  duration?: number;
  /** Start visible */
  initialVisible?: boolean;
  /** Callback on transition complete */
  onComplete?: () => void;
}

interface SnappyTransitionResult {
  /** Spring style to apply to animated element */
  style: ReturnType<typeof useSpring>;
  /** Whether element is visible */
  isVisible: boolean;
  /** Show the element */
  show: () => void;
  /** Hide the element */
  hide: () => void;
  /** Toggle visibility */
  toggle: () => void;
}

/**
 * Admin zone transition with snappy, efficient feel.
 *
 * Spring config tuned for:
 * - <200ms total duration
 * - Minimal overshoot
 * - Instant feedback
 */
export function useSnappyTransition(
  options: SnappyTransitionOptions = {}
): SnappyTransitionResult {
  const { duration = 150, initialVisible = true, onComplete } = options;

  const [isVisible, setIsVisible] = useState(initialVisible);

  // Snappy config: high tension, high friction = fast, no bounce
  const springConfig = {
    tension: 400,
    friction: 30,
    clamp: true, // No overshoot
  };

  const [style, api] = useSpring(() => ({
    opacity: initialVisible ? 1 : 0,
    transform: initialVisible ? "scale(1)" : "scale(0.98)",
    config: springConfig,
  }));

  const show = useCallback(() => {
    setIsVisible(true);
    api.start({
      opacity: 1,
      transform: "scale(1)",
      onRest: onComplete,
    });
  }, [api, onComplete]);

  const hide = useCallback(() => {
    api.start({
      opacity: 0,
      transform: "scale(0.98)",
      onRest: () => {
        setIsVisible(false);
        onComplete?.();
      },
    });
  }, [api, onComplete]);

  const toggle = useCallback(() => {
    if (isVisible) {
      hide();
    } else {
      show();
    }
  }, [isVisible, show, hide]);

  return {
    style,
    isVisible,
    show,
    hide,
    toggle,
  };
}

/**
 * Instant feedback for button/input interactions.
 * Micro-animation that confirms action without delay.
 */
export function useInstantFeedback() {
  const [style, api] = useSpring(() => ({
    scale: 1,
    config: { tension: 500, friction: 30, clamp: true },
  }));

  const press = useCallback(() => {
    api.start({
      to: async (next) => {
        await next({ scale: 0.97 });
        await next({ scale: 1 });
      },
    });
  }, [api]);

  return { style, press };
}

/**
 * Quick fade for content switching.
 * Minimal animation for tab/panel changes.
 */
export function useQuickFade(options: { duration?: number } = {}) {
  const { duration = 100 } = options;

  const [style, api] = useSpring(() => ({
    opacity: 1,
    config: { duration },
  }));

  const fadeOut = useCallback(
    () =>
      new Promise<void>((resolve) => {
        api.start({
          opacity: 0,
          onRest: () => resolve(),
        });
      }),
    [api]
  );

  const fadeIn = useCallback(() => {
    api.start({ opacity: 1 });
  }, [api]);

  const crossFade = useCallback(
    async (callback: () => void) => {
      await fadeOut();
      callback();
      fadeIn();
    },
    [fadeOut, fadeIn]
  );

  return { style, fadeOut, fadeIn, crossFade };
}

/**
 * Snappy height transition for expandable sections.
 * Efficient collapse/expand without jarring cuts.
 */
export function useSnappyCollapse(options: { initialOpen?: boolean } = {}) {
  const { initialOpen = false } = options;

  const [isOpen, setIsOpen] = useState(initialOpen);

  const [style, api] = useSpring(() => ({
    height: initialOpen ? "auto" : 0,
    opacity: initialOpen ? 1 : 0,
    config: { tension: 400, friction: 30, clamp: true },
  }));

  const toggle = useCallback(() => {
    const newState = !isOpen;
    setIsOpen(newState);
    api.start({
      height: newState ? "auto" : 0,
      opacity: newState ? 1 : 0,
    });
  }, [isOpen, api]);

  const open = useCallback(() => {
    setIsOpen(true);
    api.start({ height: "auto", opacity: 1 });
  }, [api]);

  const close = useCallback(() => {
    setIsOpen(false);
    api.start({ height: 0, opacity: 0 });
  }, [api]);

  return { style, isOpen, toggle, open, close };
}

export { animated };
export default useSnappyTransition;
