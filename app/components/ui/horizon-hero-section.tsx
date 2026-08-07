"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export function HorizonHeroSection({ title, subtitle, sections = [] }: {
  title: string;
  subtitle: { line1: string; line2: string };
  sections?: Array<{ title: string; line1: string; line2: string }>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const [heroProgress, setHeroProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let disposeScene: (() => void) | undefined;

    import("@/app/lib/horizon-scene").then(({ createHorizonScene }) => {
      if (disposed) return;
      disposeScene = createHorizonScene(canvas, sections.length + 1, {
        onProgress: (progress) => setHeroProgress(progress),
        onReady: () => setIsReady(true),
      });
    });

    return () => {
      disposed = true;
      disposeScene?.();
    };
  }, [sections.length]);

  useEffect(() => {
    if (!isReady) return;

    gsap.set([titleRef.current, subtitleRef.current, scrollIndicatorRef.current], { visibility: "visible" });

    const tl = gsap.timeline();
    const titleChars = titleRef.current?.querySelectorAll(".title-char");
    if (titleChars?.length) {
      tl.from(titleChars, { y: 200, opacity: 0, duration: 1.5, stagger: 0.05, ease: "power4.out" });
    }

    const subtitleLines = subtitleRef.current?.querySelectorAll(".subtitle-line");
    if (subtitleLines?.length) {
      tl.from(subtitleLines, { y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out" }, "-=0.8");
    }

    tl.from(scrollIndicatorRef.current, { opacity: 0, y: 50, duration: 1, ease: "power2.out" }, "-=0.5");

    return () => {
      tl.kill();
    };
  }, [isReady]);

  const overlayOpacity = Math.max(0, 1 - heroProgress * 1.5);
  const indicatorOpacity = Math.max(0, 1 - heroProgress * 1.1);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none -z-10" />

      <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-black/10 via-transparent to-black/30 pointer-events-none" />

      <div className="relative h-screen flex flex-col items-center justify-center pointer-events-none text-center px-6 sm:px-8" style={{ opacity: overlayOpacity }}>
        <h1 ref={titleRef} className="text-[clamp(2.8rem,13vw,8rem)] font-black tracking-[0.08em] leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/30 drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)]" style={{ visibility: "hidden" }}>
          {title.split("").map((char, i) => (
            <span key={i} className="title-char inline-block">{char}</span>
          ))}
        </h1>
        <div ref={subtitleRef} className="mt-4 sm:mt-6 text-[clamp(0.85rem,2.5vw,1.3rem)] text-amber-200/60 font-light tracking-[0.06em] space-y-1 max-w-2xl" style={{ visibility: "hidden" }}>
          <p className="subtitle-line">{subtitle.line1}</p>
          <p className="subtitle-line">{subtitle.line2}</p>
        </div>
      </div>

      <div ref={scrollIndicatorRef} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        style={{ opacity: indicatorOpacity, visibility: indicatorOpacity > 0 ? "visible" : "hidden" }}
      >
        <div className="text-[10px] tracking-[0.3em] text-white/30 font-mono uppercase">DÉCOUVRIR</div>
        <div className="w-20 sm:w-28 h-px bg-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400/80 to-blue-500/80 transition-all duration-150"
            style={{ width: `${heroProgress * 100}%` }} />
        </div>
      </div>

      {sections.map((section, i) => (
        <section key={i} className="relative min-h-screen flex items-center justify-center px-6 sm:px-8">
          <div className="max-w-3xl w-full rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-8 sm:p-12 md:p-16 text-center shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300/80 mb-4">{section.title}</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              {section.line1}
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-white/70 font-light">
              {section.line2}
            </p>
          </div>
        </section>
      ))}
    </div>
  );
}