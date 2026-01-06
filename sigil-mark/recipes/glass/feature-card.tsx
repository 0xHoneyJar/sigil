/**
 * @sigil-recipe glass/FeatureCard
 * @physics spring(200, 20), staggered entrance
 * @zone marketing, features, grid
 * @sync client_authoritative
 *
 * Feature card for grids and showcases.
 * Staggered entrance animation for visual flow.
 *
 * Physics rationale:
 * - stiffness: 200 — Smooth, elegant motion
 * - damping: 20 — Gentle settle
 * - Stagger: 100ms between cards
 * - Subtle hover lift
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface FeatureCardProps {
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Icon or image element */
  icon?: React.ReactNode;
  /** Card click handler */
  onClick?: () => void;
  /** Stagger index for entrance animation */
  index?: number;
  /** Base delay for staggered entrance (ms) */
  staggerDelay?: number;
  /** Additional class names */
  className?: string;
}

const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 20,
};

const STAGGER_INTERVAL_MS = 100;

/**
 * Feature Card with Staggered Entrance
 *
 * @example
 * ```tsx
 * import { FeatureCard } from '@sigil/recipes/glass';
 *
 * const features = [
 *   { title: 'Fast', description: 'Lightning quick' },
 *   { title: 'Secure', description: 'Bank-grade security' },
 *   { title: 'Simple', description: 'No learning curve' },
 * ];
 *
 * <div className="grid grid-cols-3 gap-6">
 *   {features.map((f, i) => (
 *     <FeatureCard
 *       key={f.title}
 *       title={f.title}
 *       description={f.description}
 *       index={i}
 *       icon={<IconComponent />}
 *     />
 *   ))}
 * </div>
 * ```
 */
export function FeatureCard({
  title,
  description,
  icon,
  onClick,
  index = 0,
  staggerDelay = 0,
  className = '',
}: FeatureCardProps) {
  const entranceDelay = (staggerDelay + index * STAGGER_INTERVAL_MS) / 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        ...SPRING_CONFIG,
        delay: entranceDelay,
      }}
      whileHover={{
        y: -4,
        transition: { ...SPRING_CONFIG, delay: 0 },
      }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        p-6 rounded-xl bg-white
        border border-neutral-100
        shadow-sm
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {icon && (
        <div className="mb-4 text-neutral-900">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-600 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

export default FeatureCard;
