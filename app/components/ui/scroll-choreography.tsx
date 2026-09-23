"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { useReducedMotion } from "@/app/hooks/use-reduced-motion";

interface ScrollChoreographyProps {
  className?: string;
  images: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
}

export function ScrollChoreography({
  className = "",
  images,
}: ScrollChoreographyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 34,
    mass: 0.9,
    restDelta: 0.001,
  });

  // Écart initial : assez large pour l'effet, mais reste dans l'écran
  // (cartes de 36vw : demi-largeur 18vw + décalage 22vw = 40vw < 50vw,
  // donc ~10vw de marge, pas de coupe même sur mobile).
  const xLeft = "-22vw";
  const xRight = "22vw";
  const yTop = "-14vh";
  const yBottom = "14vh";

  // Phase 1 (0 → 0.35) : flottement vertical d'entrée.
  // Phase 2 (0.35 → 0.65) : convergence vers le centre.
  const tlX = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [xLeft, xLeft, "0vw", "0vw"]);
  const tlY = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [yTop, yBottom, "0vh", "0vh"]);

  const brX = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [xRight, xRight, "0vw", "0vw"]);
  const brY = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [yBottom, yTop, "0vh", "0vh"]);

  const blX = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [xLeft, xLeft, "0vw", "0vw"]);
  const blY = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [yBottom, yBottom, "0vh", "0vh"]);

  const trX = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [xRight, xRight, "0vw", "0vw"]);
  const trY = useTransform(smoothProgress, [0, 0.35, 0.65, 1], [yTop, yTop, "0vh", "0vh"]);

  // Phase 3 (0.65 → 0.95) : la carte avant-plan s'étend en plein écran.
  // On vise 100% de la cellule de grille (= zone sticky) pour ne rien couper
  // (scrollbar, header fixe, barre d'URL mobile).
  const heroWidth = useTransform(smoothProgress, [0.65, 0.7, 0.95, 1], ["36vw", "36vw", "100%", "100%"]);
  const heroHeight = useTransform(smoothProgress, [0.65, 0.7, 0.95, 1], ["24vh", "24vh", "100%", "100%"]);
  const heroRadius = useTransform(smoothProgress, [0.65, 0.8, 0.95], [8, 8, 0]);

  const underImagesOpacity = useTransform(smoothProgress, [0.7, 0.82], [1, 0]);

  // IMPORTANT : centrage via la grille parente (`grid place-items-center`,
  // chaque carte dans la même cellule). Pas de `left-1/2` + `-translate-*` :
  // `motion` écrit `transform` (x/y) ce qui écrasait le translate Tailwind
  // et décalait les cartes (effet "coupé").
  const baseImageClasses =
    "col-start-1 row-start-1 w-[36vw] h-[24vh] overflow-hidden bg-[#1e293b] shadow-2xl rounded-lg";

  // Accessibilité + perf : si reduced-motion, affichage statique sans spring/scroll coûteux
  if (prefersReducedMotion) {
    return (
      <div className={"relative w-full overflow-hidden py-8 " + className}>
        <div className="mx-auto grid max-w-[900px] grid-cols-2 gap-3 px-4">
          {[images.topLeft, images.topRight, images.bottomLeft, images.bottomRight].map((src, i) => (
            <div key={i} className="aspect-[4/3] overflow-hidden rounded-xl bg-[#1e293b]">
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    // Hauteur de scroll restaurée : ~120vh de course sur mobile, ~200vh sur desktop.
    // Avec 105vh il ne restait que ~5vh de scroll → l'animation semblait figée.
    <div ref={containerRef} className={"relative h-[220vh] sm:h-[300vh] w-full " + className}>
      {/* Sticky plein écran (sous le header fixe). Pas de top-20 / calc(100vh-80px) :
          ça coupait l'expansion finale (100vh dans un conteneur de 100vh-80px). */}
      <div className="sticky top-0 h-screen w-full overflow-hidden supports-[height:100svh]:h-[100svh]">
        {/* Grille d'empilement : les 4 cartes partagent la même cellule centrée,
            le mouvement x/y de motion part donc du centre exact. */}
        <div className="absolute inset-0 grid place-items-center overflow-hidden">
          <motion.div
            style={{ x: tlX, y: tlY, opacity: underImagesOpacity }}
            className={baseImageClasses + " z-10 will-change-transform"}
          >
            <img src={images.topLeft} alt="" className="h-full w-full object-cover object-center" loading="eager" decoding="async" fetchPriority="high" />
          </motion.div>

          <motion.div
            style={{ x: brX, y: brY, opacity: underImagesOpacity }}
            className={baseImageClasses + " z-20 will-change-transform"}
          >
            <img src={images.bottomRight} alt="" className="h-full w-full object-cover object-center" loading="lazy" decoding="async" />
          </motion.div>

          <motion.div
            style={{ x: blX, y: blY, opacity: underImagesOpacity }}
            className={baseImageClasses + " z-30 will-change-transform"}
          >
            <img src={images.bottomLeft} alt="" className="h-full w-full object-cover object-center" loading="lazy" decoding="async" />
          </motion.div>

          <motion.div
            style={{
              x: trX,
              y: trY,
              width: heroWidth,
              height: heroHeight,
              borderRadius: heroRadius,
            }}
            className={baseImageClasses + " z-40 origin-center bg-black/5 will-change-transform"}
          >
            <img src={images.topRight} alt="" className="h-full w-full object-cover object-center" loading="eager" decoding="async" fetchPriority="high" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
