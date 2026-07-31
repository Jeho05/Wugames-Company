/**
 * StaggeredSection Component
 * Wrapper component that triggers staggered entrance animations for child elements
 */

"use client";

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/app/hooks/use-reduced-motion';

export interface StaggeredSectionProps {
  children: ReactNode;
  stagger?: number; // Delay between elements in ms (default: 100)
  threshold?: number; // IntersectionObserver threshold (default: 0.1)
  once?: boolean; // Animate only once (default: true)
  className?: string;
  id?: string; // Optional ID for anchor links
}

export function StaggeredSection({
  children,
  stagger = 100,
  threshold = 0.1,
  once = true,
  className = '',
  id,
}: StaggeredSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion) return;
    if (once && hasAnimated) return;

    const container = containerRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            // Get direct children
            const children = Array.from(container.children);
            
            if (children.length === 0) return;

            // Set initial state
            gsap.set(children, { y: 50, opacity: 0 });

            // Create staggered animation
            const tl = gsap.timeline();
            tl.to(children, {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: stagger / 1000,
              ease: 'power3.out',
            });

            if (once) {
              setHasAnimated(true);
            }

            return () => {
              tl.kill();
            };
          }
        });
      },
      {
        threshold,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [stagger, threshold, once, hasAnimated, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      id={id}
      className={className}
      style={{
        // Show immediately for reduced motion
        ...(prefersReducedMotion ? { opacity: 1 } : {}),
      }}
    >
      {children}
    </div>
  );
}
