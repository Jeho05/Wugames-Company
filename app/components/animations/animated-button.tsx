/**
 * AnimatedButton Component
 * Button with hover scale and color transition micro-interactions
 */

"use client";

import { motion } from 'motion/react';
import { useReducedMotion } from '@/app/hooks/use-reduced-motion';
import { ANIMATION_CONFIG } from '@/app/lib/animation-config';
import type { ReactNode } from 'react';

export interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export function AnimatedButton({
  children,
  onClick,
  href,
  className = '',
  variant = 'primary',
}: AnimatedButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      href={href}
      onClick={onClick}
      className={className}
      whileHover={
        prefersReducedMotion
          ? { opacity: 0.9 }
          : { scale: ANIMATION_CONFIG.microInteractions.buttonHover.scale }
      }
      whileTap={
        prefersReducedMotion
          ? { opacity: 0.8 }
          : { scale: 0.98 }
      }
      transition={{
        duration: ANIMATION_CONFIG.microInteractions.buttonHover.duration / 1000,
      }}
    >
      {children}
    </Component>
  );
}
