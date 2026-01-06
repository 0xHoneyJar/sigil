/**
 * @sigil-recipe glass/HeroCard
 * @physics spring(200, 20), float on hover
 * @zone marketing, landing, showcase
 * @sync client_authoritative
 *
 * Premium hero card for marketing pages.
 * Floats on hover, glows on interaction - maximum delight.
 *
 * Physics rationale:
 * - stiffness: 200 — Smooth, elegant motion
 * - damping: 20 — Gentle settle, slight overshoot
 * - Float effect: -8px translateY on hover
 * - Glow effect: Customizable color
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface HeroCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Glow color (CSS color value) */
  glowColor?: string;
  /** Card click handler */
  onClick?: () => void;
  /** Entrance animation delay (ms) */
  entranceDelay?: number;
  /** Additional class names */
  className?: string;
  /** Disable hover effects */
  disableHover?: boolean;
}

const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 20,
};

const FLOAT_SPRING = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25,
};

/**
 * Premium Hero Card with Float & Glow
 *
 * @example
 * ```tsx
 * import { HeroCard } from '@sigil/recipes/glass';
 *
 * <HeroCard
 *   glowColor="rgba(99, 102, 241, 0.4)"
 *   entranceDelay={200}
 *   onClick={() => navigate('/product')}
 * >
 *   <h2>Premium Feature</h2>
 *   <p>Something amazing awaits</p>
 * </HeroCard>
 * ```
 */
export function HeroCard({
  children,
  glowColor = 'rgba(0, 0, 0, 0.1)',
  onClick,
  entranceDelay = 0,
  className = '',
  disableHover = false,
}: HeroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        ...SPRING_CONFIG,
        delay: entranceDelay / 1000,
      }}
      whileHover={
        disableHover
          ? undefined
          : {
              y: -8,
              boxShadow: `0 20px 40px -10px ${glowColor}`,
            }
      }
      whileTap={onClick && !disableHover ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        relative rounded-2xl bg-white
        shadow-lg shadow-neutral-200/50
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={{
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* Glow layer */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={FLOAT_SPRING}
        style={{
          background: `radial-gradient(ellipse at center, ${glowColor} 0%, transparent 70%)`,
          filter: 'blur(20px)',
          transform: 'translateY(10px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

export default HeroCard;
