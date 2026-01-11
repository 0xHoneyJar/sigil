/**
 * @sigil-recipe glass/HeroCard
 * @physics spring(200, 20), glow, float
 * @zone marketing, landing, showcase
 * @sync client_authoritative
 */

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface HeroCardProps {
  children: ReactNode;
  
  /** Optional image or visual at top */
  visual?: ReactNode;
  
  /** Enable float animation on hover */
  float?: boolean;
  
  /** Enable glow effect */
  glow?: boolean;
  
  /** Glow color (CSS color value) */
  glowColor?: string;
  
  className?: string;
}

// ============================================================================
// Physics Constants
// ============================================================================

const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 20,
};

const FLOAT_AMOUNT = -8; // pixels

// ============================================================================
// Component
// ============================================================================

/**
 * Glass HeroCard - Delightful, polished marketing component
 * 
 * Float on hover, soft glow, inviting presence.
 * For marketing pages where delight matters.
 */
export function HeroCard({
  children,
  visual,
  float = true,
  glow = true,
  glowColor = 'rgba(59, 130, 246, 0.5)',
  className = '',
}: HeroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_CONFIG}
      whileHover={float ? { y: FLOAT_AMOUNT } : undefined}
      className={`
        relative bg-white rounded-2xl overflow-hidden
        ${glow ? 'shadow-lg hover:shadow-xl' : 'shadow-md'}
        transition-shadow duration-300
        ${className}
      `}
      style={glow ? {
        boxShadow: `0 20px 40px -20px ${glowColor}`,
      } : undefined}
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-100/50 to-purple-100/50 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Visual area */}
      {visual && (
        <div className="relative">
          {visual}
        </div>
      )}
      
      {/* Content */}
      <div className="relative p-6">
        {children}
      </div>
    </motion.div>
  );
}

export default HeroCard;
