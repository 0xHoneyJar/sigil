/**
 * usePlayfulBounce - Marketing Zone Motion Recipe
 *
 * @zone marketing
 * @feel Energetic, attention-grabbing, fun
 * @timing Variable, bouncy spring physics
 *
 * Use for:
 * - Landing page hero elements
 * - Feature showcases
 * - Promotional banners
 * - Call-to-action buttons
 * - Success celebrations
 *
 * The bouncy physics create excitement and draw attention,
 * perfect for marketing contexts where engagement matters.
 *
 * @example
 * ```tsx
 * const { style, bounce } = usePlayfulBounce();
 *
 * return (
 *   <animated.button style={style} onMouseEnter={bounce}>
 *     Get Started
 *   </animated.button>
 * );
 * ```
 */

import { useSpring, animated, config } from "@react-spring/web";
import { useState, useCallback } from "react";

interface PlayfulBounceOptions {
  /** Initial scale (default: 1) */
  initialScale?: number;
  /** Bounce scale (default: 1.1) */
  bounceScale?: number;
  /** Spring stiffness (higher = snappier bounce) */
  stiffness?: number;
  /** Spring damping (lower = more bounce) */
  damping?: number;
  /** Include rotation wobble */
  wobble?: boolean;
  /** Callback on bounce complete */
  onBounce?: () => void;
}

interface PlayfulBounceResult {
  /** Spring style to apply to animated element */
  style: ReturnType<typeof useSpring>;
  /** Trigger a bounce animation */
  bounce: () => void;
  /** Trigger entrance animation */
  enter: () => void;
  /** Whether currently animating */
  isAnimating: boolean;
}

/**
 * Marketing zone bounce animation with playful, energetic feel.
 *
 * Spring config tuned for:
 * - Bouncy overshoot
 * - Attention-grabbing movement
 * - Fun, energetic feel
 */
export function usePlayfulBounce(
  options: PlayfulBounceOptions = {}
): PlayfulBounceResult {
  const {
    initialScale = 1,
    bounceScale = 1.1,
    stiffness = 200,
    damping = 10,
    wobble = false,
    onBounce,
  } = options;

  const [isAnimating, setIsAnimating] = useState(false);

  // Playful spring: high stiffness, low damping = bouncy
  const springConfig = {
    tension: stiffness,
    friction: damping,
    mass: 1,
  };

  const [style, api] = useSpring(() => ({
    scale: initialScale,
    rotate: 0,
    opacity: 1,
    y: 0,
    config: springConfig,
  }));

  const bounce = useCallback(() => {
    setIsAnimating(true);

    api.start({
      to: async (next) => {
        // Bounce up
        await next({
          scale: bounceScale,
          rotate: wobble ? 3 : 0,
          y: -5,
        });
        // Settle back
        await next({
          scale: initialScale,
          rotate: 0,
          y: 0,
        });
      },
      onRest: () => {
        setIsAnimating(false);
        onBounce?.();
      },
    });
  }, [api, bounceScale, initialScale, wobble, onBounce]);

  const enter = useCallback(() => {
    api.start({
      from: {
        scale: 0,
        opacity: 0,
        y: 30,
      },
      to: {
        scale: initialScale,
        opacity: 1,
        y: 0,
      },
      config: {
        ...springConfig,
        tension: 180,
        friction: 12,
      },
    });
  }, [api, initialScale]);

  return {
    style: {
      ...style,
      transform: style.scale.to(
        (s) =>
          `scale(${s}) rotate(${style.rotate.get()}deg) translateY(${style.y.get()}px)`
      ),
    },
    bounce,
    enter,
    isAnimating,
  };
}

/**
 * Attention-grabbing pulse animation for CTAs.
 * Subtle continuous pulse that draws the eye.
 */
export function useAttentionPulse(options: { interval?: number } = {}) {
  const { interval = 3000 } = options;

  const [style, api] = useSpring(() => ({
    scale: 1,
    boxShadow: "0 0 0 0 rgba(255, 165, 0, 0)",
    config: { tension: 200, friction: 10 },
  }));

  const pulse = useCallback(() => {
    api.start({
      to: async (next) => {
        await next({
          scale: 1.02,
          boxShadow: "0 0 0 8px rgba(255, 165, 0, 0.3)",
        });
        await next({
          scale: 1,
          boxShadow: "0 0 0 0 rgba(255, 165, 0, 0)",
        });
      },
    });
  }, [api]);

  return { style, pulse };
}

/**
 * Stagger reveal for marketing content sections.
 * Elements enter with playful bounce, staggered timing.
 */
export function useStaggerReveal(
  itemCount: number,
  options: { staggerDelay?: number } = {}
) {
  const { staggerDelay = 100 } = options;

  return Array.from({ length: itemCount }, (_, index) => {
    const [style, api] = useSpring(() => ({
      opacity: 0,
      y: 40,
      scale: 0.9,
      config: { tension: 200, friction: 12 },
    }));

    const reveal = () => {
      api.start({
        opacity: 1,
        y: 0,
        scale: 1,
        delay: index * staggerDelay,
      });
    };

    return { style, reveal, index };
  });
}

export { animated };
export default usePlayfulBounce;
