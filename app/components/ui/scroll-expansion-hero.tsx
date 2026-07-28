"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

type ScrollExpansionHeroProps = {
  backgroundSrc: string;
  mediaAlt: string;
  mediaSrc: string;
  eyebrow: React.ReactNode;
  titleFirstLine: string;
  titleSecondLine: string;
  description: React.ReactNode;
  actions: React.ReactNode;
  proof: React.ReactNode;
};

/** A scroll-led hero that opens a framed project image into an immersive reveal. */
export function ScrollExpansionHero({
  backgroundSrc,
  mediaAlt,
  mediaSrc,
  eyebrow,
  titleFirstLine,
  titleSecondLine,
  description,
  actions,
  proof,
}: ScrollExpansionHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isCompact, setIsCompact] = useState(false);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsCompact(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  const collapsedClip = isCompact ? "inset(25% 5% 19% round 24px)" : "inset(18% 29% 16% round 28px)";
  const mediaClip = useTransform(scrollYProgress, [0, 0.68, 1], [collapsedClip, "inset(3% 2% round 32px)", "inset(0% 0% round 0px)"]);
  const mediaScale = useTransform(scrollYProgress, [0, 0.68, 1], [0.98, 1.02, 1]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 0.36, 0.2]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.56, 0.8], [1, 0.92, 0]);
  const firstLineX = useTransform(scrollYProgress, [0, 0.8], ["0vw", "-28vw"]);
  const secondLineX = useTransform(scrollYProgress, [0, 0.8], ["0vw", "28vw"]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, -26]);
  const visualStyle = prefersReducedMotion ? { clipPath: collapsedClip, scale: 1 } : { clipPath: mediaClip, scale: mediaScale };

  return (
    <section className="relative h-[170vh] bg-[#101c32]" ref={sectionRef}>
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <motion.div aria-hidden="true" className="absolute inset-0" style={{ opacity: prefersReducedMotion ? 0.7 : backgroundOpacity }}>
          <Image alt="" className="object-cover scale-110 blur-[2px]" fill priority sizes="100vw" src={backgroundSrc} />
          <div className="absolute inset-0 bg-[#091321]/72" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(9,19,33,0.65)_80%)]" />
        </motion.div>

        <motion.div className="absolute inset-0 z-10 overflow-hidden" style={visualStyle}>
          <Image alt={mediaAlt} className="object-cover" fill priority sizes="100vw" src={mediaSrc} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#081323]/70 via-[#081323]/10 to-[#081323]/25" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/20" />
        </motion.div>

        <motion.div className="pointer-events-none absolute inset-x-0 top-[13%] z-20 mx-auto flex max-w-5xl flex-col items-center px-4 text-center text-white sm:top-[24%] sm:px-5" style={{ opacity: prefersReducedMotion ? 1 : titleOpacity, y: prefersReducedMotion ? 0 : contentY }}>
          <div className="pointer-events-auto">{eyebrow}</div>
          <h1 className="mt-4 max-w-5xl text-[clamp(2.15rem,6vw,5.75rem)] font-bold leading-[0.92] tracking-[-0.075em] text-white drop-shadow-[0_5px_24px_rgba(0,0,0,0.38)] sm:mt-5">
            <motion.span className="block" style={{ x: prefersReducedMotion ? 0 : firstLineX }}>{titleFirstLine}</motion.span>
            <motion.span className="mt-2 block" style={{ x: prefersReducedMotion ? 0 : secondLineX }}>{titleSecondLine}</motion.span>
          </h1>
          <div className="pointer-events-auto mt-4 max-w-xl text-[13px] leading-5 text-slate-100 sm:mt-6 sm:text-base sm:leading-7">{description}</div>
          <div className="pointer-events-auto mt-5 sm:mt-7">{actions}</div>
          <div className="pointer-events-auto mt-5 sm:mt-7">{proof}</div>
        </motion.div>

        <motion.div aria-hidden="true" className="absolute inset-x-0 bottom-4 z-20 hidden flex-col items-center gap-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 sm:bottom-7 sm:flex" style={{ opacity: prefersReducedMotion ? 0 : titleOpacity }}>
          Faites défiler pour découvrir WUGAMS
          <span className="h-8 w-px bg-gradient-to-b from-white/80 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
