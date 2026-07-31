/**
 * StaggeredText Component
 * Animates text character-by-character with staggered timing using GSAP
 */

"use client";

import { useEffect, useRef, type ElementType } from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/app/hooks/use-reduced-motion';

export interface StaggeredTextProps {
  text: string;
  as?: ElementType;
  stagger?: number; // Delay between characters in ms (default: 50)
  duration?: number; // Animation duration per character in ms (default: 800)
  className?: string;
  delay?: number; // Initial delay before animation starts (default: 0)
}

export function StaggeredText({
  text,
  as: Component = 'span',
  stagger = 50,
  duration = 800,
  className = '',
  delay = 0,
}: StaggeredTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion) return;

    const chars = containerRef.current.querySelectorAll('.staggered-char');
    if (chars.length === 0) return;

    // Set initial state
    gsap.set(chars, { y: 200, opacity: 0 });

    // Create staggered animation
    const tl = gsap.timeline({ delay: delay / 1000 });
    tl.to(chars, {
      y: 0,
      opacity: 1,
      duration: duration / 1000,
      stagger: stagger / 1000,
      ease: 'power4.out',
    });

    return () => {
      tl.kill();
    };
  }, [text, stagger, duration, delay, prefersReducedMotion]);

  // Split text into characters
  const characters = text.split('');

  return (
    <Component ref={containerRef} className={className}>
      {characters.map((char, index) => (
        <span
          key={index}
          className="staggered-char inline-block"
          style={{
            opacity: prefersReducedMotion ? 1 : 0,
            // Preserve spaces
            ...(char === ' ' ? { width: '0.3em' } : {}),
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </Component>
  );
}
