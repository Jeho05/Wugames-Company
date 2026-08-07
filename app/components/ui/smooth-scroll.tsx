"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      anchors: true,
      smoothWheel: true,
      lerp: 0.07,
      wheelMultiplier: 0.9,
      touchMultiplier: 0.9,
    });

    const needsGsapIntegration = pathname.startsWith("/cinematic-hero");

    let rafId = 0;
    let cancelled = false;
    let cleanupGsap: (() => void) | undefined;

    if (needsGsapIntegration) {
      Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
        .then(([{ gsap }, { ScrollTrigger }]) => {
          if (cancelled) return;
          gsap.registerPlugin(ScrollTrigger);
          const update = () => ScrollTrigger.update();
          lenis.on("scroll", update);
          const raf = (time: number) => lenis.raf(time * 1000);
          gsap.ticker.add(raf);
          gsap.ticker.lagSmoothing(0);
          cleanupGsap = () => {
            gsap.ticker.remove(raf);
            lenis.off("scroll", update);
          };
        })
        .catch(() => undefined);
    } else {
      const raf = (time: number) => lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      cleanupGsap?.();
      lenis.destroy();
    };
  }, [pathname]);

  return <>{children}</>;
}
