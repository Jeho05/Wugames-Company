/**
 * EnhancedHeroSection Component
 * Orchestrates all hero section animations including 3D background, scroll choreography, and content animations
 */

"use client";

import { useRef, useState, useEffect, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useReducedMotion } from '@/app/hooks/use-reduced-motion';
import { clipAt } from '@/app/lib/animation-utils';
import { ANIMATION_CONFIG } from '@/app/lib/animation-config';
import { HorizonHeroSection } from '@/app/components/ui/horizon-hero-section';
import { GradientMesh } from '@/app/components/branding/gradient-mesh';
import { StaggeredText } from './staggered-text';
import { LottieAnimation } from './lottie-animation';
import { ScrollProgressIndicator } from './scroll-progress-indicator';

export interface EnhancedHeroSectionProps {
  title: string;
  subtitle: { line1: string; line2: string };
  eyebrow?: ReactNode;
  actions?: ReactNode;
  proof?: ReactNode;
  backgroundSrc: string;
  enable3D?: boolean; // Default: true
  enableLottie?: boolean; // Default: true
  lottieAnimationUrl?: string;
}

export function EnhancedHeroSection({
  title,
  subtitle,
  eyebrow,
  actions,
  proof,
  backgroundSrc,
  enable3D = true,
  enableLottie = true,
  lottieAnimationUrl,
}: EnhancedHeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [viewportType, setViewportType] = useState<'compact' | 'wide'>('wide');
  const prefersReducedMotion = useReducedMotion();

  // Scroll progress tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Detect viewport size
  useEffect(() => {
    const handleResize = () => {
      setViewportType(window.innerWidth < 768 ? 'compact' : 'wide');
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Mark as ready after mount
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate clip-path based on scroll progress
  const clipPathValue = useTransform(scrollYProgress, (progress) => {
    if (prefersReducedMotion) {
      return 'inset(0% 0% 0% 0% round 0px)';
    }

    const startFrame = ANIMATION_CONFIG.heroAnimation.clipPathFrames[viewportType];
    const midFrame = ANIMATION_CONFIG.heroAnimation.clipPathFrames.mid;
    const openFrame = ANIMATION_CONFIG.heroAnimation.clipPathFrames.open;
    const expansionPoint = ANIMATION_CONFIG.heroAnimation.scrollMilestones.heroExpansion;

    return clipAt(progress, startFrame, midFrame, openFrame, expansionPoint);
  });

  // Content fade out based on scroll
  const contentOpacity = useTransform(
    scrollYProgress,
    [0, ANIMATION_CONFIG.heroAnimation.scrollMilestones.contentFadeOut],
    [1, 0]
  );

  // If 3D is disabled, use gradient mesh background
  const Background = enable3D ? (
    <HorizonHeroSection
      title={title}
      subtitle={subtitle}
      sections={[]}
    />
  ) : (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundSrc})` }}
      />
      <GradientMesh />
    </>
  );

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Background Layer */}
      <div className="fixed inset-0 -z-10">
        {Background}
      </div>

      {/* Hero Content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-5 text-center sm:px-8">
        <motion.div
          style={{
            opacity: prefersReducedMotion ? 1 : contentOpacity,
          }}
          className="relative z-10 max-w-5xl"
        >
          {/* Eyebrow */}
          {eyebrow && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isReady ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {eyebrow}
            </motion.div>
          )}

          {/* Title with Lottie Icon */}
          <div className="mt-6 flex items-center justify-center gap-4">
            {enableLottie && lottieAnimationUrl && (
              <LottieAnimation
                src={lottieAnimationUrl}
                className="w-16 h-16 sm:w-20 sm:h-20"
                autoplay={true}
                loop={true}
              />
            )}

            <StaggeredText
              text={title}
              as="h1"
              className="text-[clamp(2.8rem,13vw,8rem)] font-black tracking-[0.08em] leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/30 drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)]"
              stagger={ANIMATION_CONFIG.heroAnimation.textAnimation.titleStagger}
              duration={ANIMATION_CONFIG.heroAnimation.textAnimation.titleDuration}
              delay={isReady ? 500 : 0}
            />
          </div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isReady ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: ANIMATION_CONFIG.heroAnimation.textAnimation.subtitleDuration / 1000,
              delay: ANIMATION_CONFIG.heroAnimation.textAnimation.subtitleDelay / 1000,
            }}
            className="mt-4 sm:mt-6 text-[clamp(0.85rem,2.5vw,1.3rem)] text-amber-200/60 font-light tracking-[0.06em] space-y-1 max-w-2xl"
          >
            <p>{subtitle.line1}</p>
            <p>{subtitle.line2}</p>
          </motion.div>

          {/* Actions */}
          {actions && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isReady ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1.5 }}
              className="mt-8"
            >
              {actions}
            </motion.div>
          )}

          {/* Proof */}
          {proof && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isReady ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 1.8 }}
              className="mt-10"
            >
              {proof}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Scroll Progress Indicator */}
      <ScrollProgressIndicator progress={scrollYProgress} />

      {/* Media Container with Clip-Path Animation */}
      <motion.div
        ref={mediaRef}
        data-hero-media
        className="fixed inset-0 -z-5 pointer-events-none"
        style={{
          clipPath: prefersReducedMotion ? 'inset(0% 0% 0% 0% round 0px)' : clipPathValue,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      </motion.div>
    </div>
  );
}
