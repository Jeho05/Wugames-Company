/**
 * ScrollProgressIndicator Component
 * Visual feedback showing scroll progress through hero section
 */

"use client";

import { motion, useTransform, type MotionValue } from 'motion/react';
import { useReducedMotion } from '@/app/hooks/use-reduced-motion';

export interface ScrollProgressIndicatorProps {
  progress: MotionValue<number>; // 0-1 scroll progress
  className?: string;
}

export function ScrollProgressIndicator({
  progress,
  className = '',
}: ScrollProgressIndicatorProps) {
  const prefersReducedMotion = useReducedMotion();

  // Transform progress to percentage width
  const widthPercentage = useTransform(progress, (value) => `${value * 100}%`);

  // Calculate opacity - fade out when progress > 1
  const opacity = useTransform(progress, [0.8, 1], [1, 0]);

  // Don't render for reduced motion users
  if (prefersReducedMotion) {
    return null;
  }

  return (
    <motion.div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 ${className}`}
      style={{ opacity }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="text-[10px] tracking-[0.3em] text-white/30 font-mono uppercase">
        DÉCOUVRIR
      </div>
      <div className="w-20 sm:w-28 h-px bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#e3a641] to-[#426b95]"
          style={{ width: widthPercentage }}
        />
      </div>
    </motion.div>
  );
}
