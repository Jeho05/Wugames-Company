"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

type ClipFrame = { top: number; right: number; bottom: number; left: number; radius: number };

const START_FRAME: ClipFrame = { top: 18, right: 29, bottom: 16, left: 29, radius: 28 };
const MID_FRAME: ClipFrame = { top: 3, right: 2, bottom: 3, left: 2, radius: 32 };
const OPEN_FRAME: ClipFrame = { top: 0, right: 0, bottom: 0, left: 0, radius: 0 };

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/** Numeric clip-path interpolation: avoids Motion string parsing, reliable on all mobile browsers. */
function mixClip(from: ClipFrame, to: ClipFrame, t: number) {
  return `inset(${lerp(from.top, to.top, t)}% ${lerp(from.right, to.right, t)}% ${lerp(from.bottom, to.bottom, t)}% ${lerp(from.left, to.left, t)}% round ${lerp(from.radius, to.radius, t)}px)`;
}

function clipAt(progress: number) {
  if (progress <= 0.68) return mixClip(START_FRAME, MID_FRAME, Math.max(progress, 0) / 0.68);
  return mixClip(MID_FRAME, OPEN_FRAME, Math.min((progress - 0.68) / 0.32, 1));
}

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
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  // Single code path for every viewport: the scroll-linked animation is identical on desktop and mobile.
  const mediaClip = useTransform(scrollYProgress, clipAt);
  const mediaScale = useTransform(scrollYProgress, [0, 0.68, 1], [0.98, 1.02, 1]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 0.36, 0.2]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.56, 0.8], [1, 0.92, 0]);
  const firstLineX = useTransform(scrollYProgress, [0, 0.8], ["0vw", "-28vw"]);
  const secondLineX = useTransform(scrollYProgress, [0, 0.8], ["0vw", "28vw"]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, -26]);

  return (
    <section className="relative h-[170vh] bg-[#101c32]" ref={sectionRef}>
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <motion.div aria-hidden="true" className="absolute inset-0" style={{ opacity: backgroundOpacity }}>
          <Image alt="" className="object-cover scale-110 blur-[2px]" fill priority sizes="100vw" src={backgroundSrc} />
          <div className="absolute inset-0 bg-[#091321]/72" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(9,19,33,0.65)_80%)]" />
        </motion.div>

        <motion.div className="absolute inset-0 z-10 overflow-hidden" style={{ clipPath: mediaClip, scale: mediaScale }}>
          <Image alt={mediaAlt} className="object-cover" fill priority sizes="100vw" src={mediaSrc} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#081323]/70 via-[#081323]/10 to-[#081323]/25" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/20" />
        </motion.div>

        <motion.div className="pointer-events-none absolute inset-0 z-20 mx-auto flex max-w-5xl flex-col items-center justify-center px-4 pb-14 pt-[86px] text-center text-white sm:px-5" style={{ opacity: titleOpacity, y: contentY }}>
          <div className="pointer-events-auto">{eyebrow}</div>
          <h1 className="mt-4 max-w-5xl text-[clamp(2.15rem,6vw,5.75rem)] font-bold leading-[0.92] tracking-[-0.075em] text-white drop-shadow-[0_5px_24px_rgba(0,0,0,0.38)] sm:mt-5">
            <motion.span className="block" style={{ x: firstLineX }}>{titleFirstLine}</motion.span>
            <motion.span className="mt-2 block" style={{ x: secondLineX }}>{titleSecondLine}</motion.span>
          </h1>
          <div className="pointer-events-auto mt-4 max-w-xl text-[13px] leading-5 text-slate-100 sm:mt-6 sm:text-base sm:leading-7">{description}</div>
          <div className="pointer-events-auto mt-5 sm:mt-7">{actions}</div>
          <div className="pointer-events-auto mt-5 sm:mt-7">{proof}</div>
        </motion.div>

        <motion.div aria-hidden="true" className="absolute inset-x-0 bottom-4 z-20 flex flex-col items-center gap-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 sm:bottom-7" style={{ opacity: titleOpacity }}>
          Faites défiler pour découvrir WUGAMS
          <span className="h-8 w-px bg-gradient-to-b from-white/80 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
