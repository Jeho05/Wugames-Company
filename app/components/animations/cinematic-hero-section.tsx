/**
 * CinematicHeroSection
 * Scroll-driven multi-scene cinematic hero: Ken Burns imagery with crossfade,
 * letterbox reveal, film grain, dust particles and chaptered copy.
 */

"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";
import { useReducedMotion } from "@/app/hooks/use-reduced-motion";
import { ANIMATION_CONFIG } from "@/app/lib/animation-config";

export interface CinematicScene {
  image: string;
  imageAlt: string;
  chapter: string;
  kicker: string;
  heading: string;
  text?: string;
  content?: ReactNode;
  variant?: "display" | "statement";
}

export interface CinematicHeroSectionProps {
  scenes: CinematicScene[];
}

const GRAIN_DATA_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const GRAIN_CSS = `
.cinematic-grain{position:absolute;inset:0;z-index:40;pointer-events:none;opacity:.05;mix-blend-mode:overlay;background-image:${GRAIN_DATA_URI};background-size:240px 240px;animation:grain-shift .8s steps(6) infinite}
@keyframes grain-shift{0%{background-position:0 0}100%{background-position:240px -240px}}
.cinematic-particle{position:absolute;z-index:30;border-radius:9999px;background:#f4c15f;pointer-events:none;opacity:0;animation:particle-rise linear infinite}
@keyframes particle-rise{0%{transform:translateY(0) scale(1);opacity:0}12%{opacity:.65}75%{opacity:.35}100%{transform:translateY(-46vh) scale(.35);opacity:0}}
.cinematic-cue-dot{animation:cue-slide 2s ease-in-out infinite}
@keyframes cue-slide{0%,100%{transform:translateX(0);opacity:.25}50%{transform:translateX(64px);opacity:1}}
@media (prefers-reduced-motion: reduce){.cinematic-grain{animation:none}.cinematic-particle{animation:none}.cinematic-cue-dot{animation:none}}
`;

// Perf: réduit de 12 à 6 particules (-50% DOM + animations) — suffisant visuellement, beaucoup plus léger en compositor
const PARTICLES = [
  { left: "12%", top: "22%", size: 3, duration: "16s", delay: "0s" },
  { left: "28%", top: "68%", size: 2, duration: "20s", delay: "3s" },
  { left: "48%", top: "18%", size: 3, duration: "15s", delay: "6s" },
  { left: "64%", top: "72%", size: 2, duration: "18s", delay: "1s" },
  { left: "82%", top: "32%", size: 3, duration: "17s", delay: "4s" },
  { left: "6%", top: "88%", size: 2, duration: "19s", delay: "8s" },
];

const DISPLAY_CLASS =
  "mt-6 text-[clamp(3.2rem,15vw,10rem)] font-black leading-none tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-amber-200/70 drop-shadow-[0_12px_48px_rgba(0,0,0,0.85)]";

const STATEMENT_CLASS =
  "mt-5 text-[clamp(2rem,6.5vw,4.6rem)] font-bold leading-[1.05] tracking-[-0.05em] text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.8)]";

interface CinematicSceneLayerProps {
  scene: CinematicScene;
  index: number;
  sceneCount: number;
  scrollYProgress: MotionValue<number>;
  prefersReducedMotion: boolean;
}

function CinematicSceneLayer({
  scene,
  index,
  sceneCount,
  scrollYProgress,
  prefersReducedMotion,
}: CinematicSceneLayerProps) {
  const { sceneFadeEdge, contentParallax } = ANIMATION_CONFIG.cinematic.hero;

  const start = index / sceneCount;
  const end = (index + 1) / sceneCount;
  const edge = sceneFadeEdge / sceneCount;

  const local = useTransform(scrollYProgress, [start, end], [0, 1]);
  const imageScale = useTransform(local, [0, 1], index % 2 === 0 ? [1.04, 1.2] : [1.16, 1.02]);
  const imageX = useTransform(local, [0, 1], index % 2 === 0 ? ["0%", "-2%"] : ["0%", "2%"]);
  const imageY = useTransform(local, [0, 1], index % 2 === 0 ? ["0%", "1.5%"] : ["0%", "-1.5%"]);

  const opacity = useTransform(scrollYProgress, (value) => {
    const inStart = index === 0 ? 0 : start - edge;
    const inEnd = index === 0 ? 0 : start + edge;
    const outStart = end - edge;
    const outEnd = index === sceneCount - 1 ? 1 : end + edge;

    const rampIn =
      inEnd === inStart
        ? 1
        : Math.min(1, Math.max(0, (value - inStart) / (inEnd - inStart)));
    const rampOut = Math.min(1, Math.max(0, (outEnd - value) / (outEnd - outStart)));
    return Math.min(rampIn, rampOut);
  });

  const contentY = useTransform(local, [0, 1], [contentParallax, -contentParallax]);

  return (
    <div className="absolute inset-0">
      <motion.div className="absolute inset-0" style={{ opacity }}>
        <motion.div
          className="absolute inset-0"
          style={
            prefersReducedMotion
              ? { scale: 1.06 }
              : { scale: imageScale, x: imageX, y: imageY }
          }
        >
          <Image
            alt={scene.imageAlt}
            className="object-cover"
            fill
            priority={index === 0}
            sizes="100vw"
            quality={75}
            // @ts-ignore Next 16: fetchPriority pour la première image critique
            fetchPriority={index === 0 ? "high" : "low"}
            loading={index === 0 ? "eager" : "lazy"}
            src={scene.image}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#070d19]/90 via-[#070d19]/30 to-[#070d19]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_55%,rgba(227,166,65,0.10),transparent_70%)]" />
      </motion.div>

      <motion.div
        className="absolute inset-0 z-20 flex items-center justify-center px-6 sm:px-10"
        style={{ opacity }}
      >
        <motion.div
          className="w-full max-w-5xl text-center"
          style={prefersReducedMotion ? undefined : { y: contentY }}
        >
          <div className="pointer-events-none">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/45">
              Scène 0{index + 1} — {scene.chapter}
            </p>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.28em] text-amber-300/90">
              {scene.kicker}
            </p>
            <h2 className={scene.variant === "display" ? DISPLAY_CLASS : STATEMENT_CLASS}>
              {scene.heading}
            </h2>
            {scene.text ? (
              <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-7 text-white/70 sm:text-lg">
                {scene.text}
              </p>
            ) : null}
            {scene.content ? (
              <div className="pointer-events-auto mt-10">{scene.content}</div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function CinematicHeroSection({ scenes }: CinematicHeroSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [activeScene, setActiveScene] = useState(0);
  const sceneCount = scenes.length;

  const {
    wrapperHeightVh,
    letterboxTopVh,
    letterboxBottomVh,
    letterboxRetract,
  } = ANIMATION_CONFIG.cinematic.hero;

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setActiveScene(Math.min(Math.floor(value * sceneCount), sceneCount - 1));
  });

  const topBarHeight = useTransform(
    scrollYProgress,
    [0, letterboxRetract],
    [`${letterboxTopVh}vh`, "0vh"]
  );
  const bottomBarHeight = useTransform(
    scrollYProgress,
    [0, letterboxRetract],
    [`${letterboxBottomVh}vh`, "0vh"]
  );
  const cueOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  const railFill = useTransform(scrollYProgress, (value) => `${Math.round(value * 100)}%`);

  return (
    <>
      <style>{GRAIN_CSS}</style>
      <div ref={wrapperRef} className="relative" style={{ height: `${wrapperHeightVh}vh` }}>
        <div className="sticky top-0 h-screen overflow-hidden bg-[#070d19]">
          {scenes.map((scene, index) => (
            <CinematicSceneLayer
              index={index}
              key={index}
              prefersReducedMotion={prefersReducedMotion}
              scene={scene}
              sceneCount={sceneCount}
              scrollYProgress={scrollYProgress}
            />
          ))}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-30"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 52%, rgba(2,6,12,0.55) 100%)",
            }}
          />

          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-0 z-30 bg-black"
            style={prefersReducedMotion ? { height: 0 } : { height: topBarHeight }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-x-0 bottom-0 z-30 bg-black"
            style={prefersReducedMotion ? { height: 0 } : { height: bottomBarHeight }}
          />

          <div className="absolute bottom-6 left-6 z-30 hidden items-center gap-3 sm:bottom-8 sm:left-8 sm:flex">
            <span className="font-mono text-xs font-bold text-amber-300">
              0{activeScene + 1}
            </span>
            <span className="h-px w-8 bg-white/20" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">
              {scenes[activeScene].chapter}
            </span>
          </div>

          <div className="absolute right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-4 sm:right-8 lg:flex">
            <span
              className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40"
              style={{ writingMode: "vertical-rl" }}
            >
              Défiler
            </span>
            <div className="relative h-28 w-px overflow-hidden bg-white/15">
              <motion.div
                className="absolute inset-x-0 top-0 bg-gradient-to-b from-amber-300 to-sky-400"
                style={{ height: railFill }}
              />
            </div>
            {scenes.map((_, index) => (
              <span
                className={
                  "size-1.5 rounded-full transition " +
                  (index === activeScene ? "bg-amber-300" : "bg-white/25")
                }
                key={index}
              />
            ))}
          </div>

          <motion.div
            className="absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2"
            style={{ opacity: cueOpacity }}
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/45">
              Découvrir
            </span>
            <div className="relative h-px w-24 overflow-hidden bg-white/15">
              <span className="cinematic-cue-dot absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-amber-300 to-sky-400" />
            </div>
          </motion.div>

          <div className="cinematic-grain" aria-hidden />

          {PARTICLES.map((particle, index) => (
            <span
              aria-hidden
              className="cinematic-particle"
              key={index}
              style={{
                animationDelay: particle.delay,
                animationDuration: particle.duration,
                boxShadow: "0 0 10px rgba(244,193,95,0.7)",
                height: particle.size,
                left: particle.left,
                top: particle.top,
                width: particle.size,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
