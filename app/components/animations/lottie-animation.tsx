/**
 * LottieAnimation Component
 * Lazy-loads and renders Lottie animations with intersection observer and accessibility support
 */

"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useReducedMotion } from '@/app/hooks/use-reduced-motion';
import type { PlayerEvent } from '@lottiefiles/react-lottie-player';

// Dynamically import Player to avoid SSR issues
const Player = dynamic(
  () => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player),
  { ssr: false }
);

export interface LottieAnimationProps {
  src: string; // URL or path to .lottie or .json file
  autoplay?: boolean; // Default: true
  loop?: boolean; // Default: true
  className?: string;
  fallbackSrc?: string; // Static image fallback
  onLoad?: () => void;
  onError?: () => void;
}

export function LottieAnimation({
  src,
  autoplay = true,
  loop = true,
  className = '',
  fallbackSrc,
  onLoad,
  onError,
}: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Check if mounted (client-side)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!containerRef.current || !isMounted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting);
        });
      },
      {
        threshold: 0.1, // 10% in viewport
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isMounted]);

  // Play/pause based on intersection and reduced motion
  // Note: We cannot control play/pause without ref, so we rely on autoplay prop

  const handleEvent = (event: PlayerEvent) => {
    if (event === 'load' && onLoad) {
      onLoad();
    } else if (event === 'error') {
      setHasError(true);
      if (onError) {
        onError();
      }
    }
  };

  // Show fallback image if error or reduced motion with fallback
  if (hasError || (prefersReducedMotion && fallbackSrc)) {
    return (
      <div ref={containerRef} className={className}>
        {fallbackSrc ? (
          <img
            src={fallbackSrc}
            alt=""
            className="w-full h-full object-contain"
          />
        ) : null}
      </div>
    );
  }

  // Don't render Player on server
  if (!isMounted) {
    return <div ref={containerRef} className={className} />;
  }

  return (
    <div ref={containerRef} className={className}>
      {isIntersecting && (
        <Player
          autoplay={autoplay && !prefersReducedMotion}
          loop={loop}
          src={src}
          style={{ width: '100%', height: '100%' }}
          onEvent={handleEvent}
        />
      )}
    </div>
  );
}
