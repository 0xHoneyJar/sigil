/**
 * useDeliberateEntrance - Critical Zone Motion Recipe
 *
 * @zone critical
 * @feel Weighty, confident, builds trust
 * @timing 800ms+ entrance, deliberate easing
 *
 * Use for:
 * - Checkout flows
 * - Transaction confirmations
 * - High-stakes form submissions
 * - Payment processing states
 *
 * The deliberate timing communicates "we're taking this seriously"
 * and reduces anxiety during critical operations.
 *
 * @example
 * ```tsx
 * const { style, isVisible } = useDeliberateEntrance();
 *
 * return (
 *   <animated.div style={style}>
 *     <CheckoutSummary />
 *   </animated.div>
 * );
 * ```
 */

import { useSpring, animated, config } from "@react-spring/web";
import { useState, useEffect } from "react";

interface DeliberateEntranceOptions {
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Custom duration override (ms) */
  duration?: number;
  /** Start animation immediately */
  immediate?: boolean;
  /** Callback when entrance completes */
  onRest?: () => void;
}

interface DeliberateEntranceResult {
  /** Spring style to apply to animated element */
  style: ReturnType<typeof useSpring>;
  /** Whether the element is visible */
  isVisible: boolean;
  /** Trigger the entrance animation */
  enter: () => void;
  /** Trigger the exit animation */
  exit: () => void;
}

/**
 * Critical zone entrance animation with deliberate, weighty feel.
 *
 * Spring config tuned for:
 * - 800ms+ total duration
 * - Heavy, confident easing
 * - Slight overshoot for weight
 */
export function useDeliberateEntrance(
  options: DeliberateEntranceOptions = {}
): DeliberateEntranceResult {
  const { delay = 0, duration, immediate = true, onRest } = options;

  const [isVisible, setIsVisible] = useState(immediate);

  // Deliberate spring: low tension, high friction = slow, weighty
  const springConfig = duration
    ? { duration }
    : {
        tension: 120,
        friction: 14,
        mass: 1.2,
      };

  const [style, api] = useSpring(() => ({
    opacity: immediate ? 1 : 0,
    transform: immediate ? "translateY(0px)" : "translateY(20px)",
    config: springConfig,
    delay,
    onRest,
  }));

  const enter = () => {
    setIsVisible(true);
    api.start({
      opacity: 1,
      transform: "translateY(0px)",
      delay,
    });
  };

  const exit = () => {
    api.start({
      opacity: 0,
      transform: "translateY(-10px)",
      config: { ...springConfig, tension: 200 }, // Slightly faster exit
      onRest: () => setIsVisible(false),
    });
  };

  useEffect(() => {
    if (immediate) {
      enter();
    }
  }, [immediate]);

  return {
    style,
    isVisible,
    enter,
    exit,
  };
}

/**
 * Deliberate stagger for multiple elements entering in sequence.
 * Each item enters with the deliberate timing, staggered by index.
 */
export function useDeliberateStagger(
  itemCount: number,
  options: { staggerDelay?: number } = {}
) {
  const { staggerDelay = 150 } = options;

  return Array.from({ length: itemCount }, (_, index) =>
    useDeliberateEntrance({
      delay: index * staggerDelay,
      immediate: true,
    })
  );
}

export { animated };
export default useDeliberateEntrance;
