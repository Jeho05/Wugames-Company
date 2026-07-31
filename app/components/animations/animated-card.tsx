/**
 * AnimatedCard Component
 * Card with lift effect and shadow enhancement on hover
 */

"use client";

import { motion } from 'motion/react';
import { useReducedMotion } from '@/app/hooks/use-reduced-motion';
import { ANIMATION_CONFIG } from '@/app/lib/animation-config';
import type { ReactNode } from 'react';

export interface AnimatedCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function AnimatedCard({
  children,
  onClick,
  className = '',
}: AnimatedCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      onClick={onClick}
      className={className}
      whileHover={
        prefersReducedMotion
          ? { opacity: 0.95 }
          : { y: ANIMATION_CONFIG.microInteractions.cardHover.y }
      }
      transition={{
        duration: ANIMATION_CONFIG.microInteractions.cardHover.duration / 1000,
      }}
    >
      {children}
    </motion.div>
  );
}
