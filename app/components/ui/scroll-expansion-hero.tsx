"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";

type ClipFrame = { top: number; right: number; bottom: number; left: number; radius: number };

// Same animation everywhere; only the opening crop is proportioned to the viewport.
// The media opens as a wide cinematic card in the lower half so the copy above
// never overlaps it before the full-screen expansion.
const COMPACT_START: ClipFrame = { top: 62, right: 5, bottom: 4, left: 5, radius: 20 };
const WIDE_START: ClipFrame = { top: 56, right: 20, bottom: 6, left: 20, radius: 24 };
const MID_FRAME: ClipFrame = { top: 3, right: 2, bottom: 3, left: 2, radius: 32 };
const OPEN_FRAME: ClipFrame = { top: 0, right: 0, bottom: 0, left: 0, radius: 0 };

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/** Numeric clip-path interpolation: avoids Motion string parsing, reliable on all mobile browsers. */
function mixClip(from: ClipFrame, to: ClipFrame, t: number) {
  return `inset(${lerp(from.top, to.top, t)}% ${lerp(from.right, to.right, t)}% ${lerp(from.bottom, to.bottom, t)}% ${lerp(from.left, to.left, t)}% round ${lerp(from.radius, to.radius, t)}px)`;
}

function clipAt(progress: number, start: ClipFrame) {
  if (progress <= 0.68) return mixClip(start, MID_FRAME, Math.max(progress, 0) / 0.68);
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
  const [isCompact, setIsCompact] = useState(false);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsCompact(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  const startFrame = isCompact ? COMPACT_START : WIDE_START;
  const mediaClip = useTransform(scrollYProgress, (progress) => clipAt(progress, startFrame));
  const mediaScale = useTransform(scrollYProgress, [0, 0.68, 1], [0.98, 1.02, 1]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 0.36, 0.2]);
  // Copy fades out before the expanding media reaches it, so text and image never collide
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25, 0.55], [1, 0.85, 0]);
  const contentVisibility = useTransform(titleOpacity, (v) => (v < 0.03 ? "hidden" : "visible"));
  const pointerEvents = useTransform(titleOpacity, (v) => (v < 0.05 ? "none" : "auto"));
  const contentY = useTransform(scrollYProgress, [0, 0.55], [0, -56]);

  return (
    <section className="relative sm:h-[175vh] h-[130vh] bg-[#101c32]" ref={sectionRef}>
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <motion.div aria-hidden="true" className="absolute inset-0" style={{ opacity: backgroundOpacity }}>
          <Image alt="" className="object-cover scale-110 blur-[2px]" fill priority sizes="100vw" src={backgroundSrc} />
          <div className="absolute inset-0 bg-[#091321]/72" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(9,19,33,0.65)_80%)]" />
        </motion.div>

        <motion.div className="absolute inset-0 z-10 overflow-hidden" style={{ clipPath: mediaClip, scale: mediaScale }}>
          <Image alt={mediaAlt} className="object-cover" fill priority sizes="100vw" src={mediaSrc} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#081323]/60 via-transparent to-[#081323]/20" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/20" />
        </motion.div>

        <motion.div
          className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-4xl flex-col items-center px-4 pt-[92px] text-center text-white sm:px-5 sm:pt-[102px]"
          style={{ opacity: titleOpacity, y: contentY, pointerEvents, visibility: contentVisibility }}
        >
          {eyebrow}
          <h1 className="mt-3.5 text-[clamp(1.9rem,4.7vw,4.4rem)] font-bold leading-[1.04] tracking-[-0.04em] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)] sm:mt-5 sm:leading-[1] sm:tracking-[-0.05em]">
            {titleFirstLine}
            <span className="block">{titleSecondLine}</span>
          </h1>
          <div className="mt-3 max-w-md text-[13px] leading-5 text-slate-200 sm:mt-4 sm:max-w-xl sm:text-base sm:leading-7">{description}</div>
          <div className="mt-5 sm:mt-6">{actions}</div>
          <div className="mt-4 sm:mt-5">{proof}</div>
        </motion.div>

        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-3 z-20 flex flex-col items-center gap-1.5 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)] sm:bottom-5"
          style={{ opacity: titleOpacity }}
        >
          Faites défiler pour découvrir WUGAMS
          <span className="h-7 w-px bg-gradient-to-b from-white/80 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
