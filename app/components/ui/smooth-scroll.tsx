"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Respecte les préférences d'accessibilité et les appareils faibles : pas de smooth-scroll = plus rapide
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReduced) return;
    // Désactive Lenis sur mobile low-end et sur les pages où il n'apporte rien (boutique, blog, réalisations)
    const isLowEnd = typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 4) < 4;
    const heavyPages = pathname === "/" || pathname.startsWith("/vitrine") || pathname.startsWith("/cinematic-hero") || pathname.startsWith("/horizon");
    if (!heavyPages && window.innerWidth < 768) return;
    if (isLowEnd && window.innerWidth < 768 && !pathname.startsWith("/cinematic-hero")) return;

    let lenis: InstanceType<typeof import("lenis").default> | null = null;
    let rafId = 0;
    let cancelled = false;
    let cleanupGsap: (() => void) | undefined;

    const init = async () => {
      const { default: Lenis } = await import("lenis");
      if (cancelled) return;
      lenis = new Lenis({
        anchors: true,
        smoothWheel: heavyPages,
        lerp: 0.08,
        wheelMultiplier: 0.88,
        touchMultiplier: 0.9,
        gestureOrientation: "vertical",
      });

      const needsGsapIntegration = pathname.startsWith("/cinematic-hero");
      if (needsGsapIntegration) {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const update = () => ScrollTrigger.update();
        lenis.on("scroll", update);
        const raf = (time: number) => lenis?.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
        cleanupGsap = () => {
          gsap.ticker.remove(raf);
          lenis?.off("scroll", update);
        };
      } else {
        // FIX: boucle RAF récursive (avant un seul frame → Lenis inactif et pourtant chargé)
        const raf = (time: number) => {
          lenis?.raf(time);
          rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);
      }
    };

    void init().catch(() => undefined);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      cleanupGsap?.();
      lenis?.destroy();
    };
  }, [pathname]);

  return <>{children}</>;
}
