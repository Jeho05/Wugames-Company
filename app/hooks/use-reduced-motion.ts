/**
 * Hook to detect user's reduced motion preference
 * Returns true if prefers-reduced-motion is enabled
 */

"use client";

import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    const initial = window.setTimeout(() => setPrefersReducedMotion(mediaQuery.matches), 0);

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      window.clearTimeout(initial);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}
