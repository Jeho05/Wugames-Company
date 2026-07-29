"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 50,
    mass: 1.2,
    restDelta: 0.001,
  });

  const xLeft = "-24vw";
  const xRight = "24vw";
  const yTop = "-15vh";
  const yBottom = "15vh";

  const tlX = useTransform(smoothProgress, [0, 0.25, 0.3, 0.6, 1], [xLeft, xLeft, xLeft, "0vw", "0vw"]);
  const tlY = useTransform(smoothProgress, [0, 0.25, 0.3, 0.6, 1], [yTop, yBottom, yBottom, "0vh", "0vh"]);

  const brX = useTransform(smoothProgress, [0, 0.25, 0.3, 0.6, 1], [xRight, xRight, xRight, "0vw", "0vw"]);
  const brY = useTransform(smoothProgress, [0, 0.25, 0.3, 0.6, 1], [yBottom, yTop, yTop, "0vh", "0vh"]);

  const blX = useTransform(smoothProgress, [0, 0.25, 0.3, 0.6, 1], [xLeft, xLeft, xLeft, "0vw", "0vw"]);
  const blY = useTransform(smoothProgress, [0, 0.25, 0.3, 0.6, 1], [yBottom, yBottom, yBottom, "0vh", "0vh"]);

  const trX = useTransform(smoothProgress, [0, 0.25, 0.3, 0.6, 1], [xRight, xRight, xRight, "0vw", "0vw"]);
  const trY = useTransform(smoothProgress, [0, 0.25, 0.3, 0.6, 1], [yTop, yTop, yTop, "0vh", "0vh"]);

  const heroWidth = useTransform(smoothProgress, [0.6, 0.65, 0.9, 1], ["36vw", "36vw", "100vw", "100vw"]);
  const heroHeight = useTransform(smoothProgress, [0.6, 0.65, 0.9, 1], ["26vh", "26vh", "100vh", "100vh"]);

  const underImagesOpacity = useTransform(smoothProgress, [0.7, 0.8], [1, 0]);

  const baseImageClasses =
    "absolute left-1/2 top-1/2 w-[36vw] h-[26vh] overflow-hidden -translate-x-1/2 -translate-y-1/2 bg-[#1e293b] shadow-2xl will-change-transform rounded-sm";

  return (
    <div ref={containerRef} className={"relative h-[105vh] w-full " + className}>
      <div className="sticky top-20 h-[calc(100vh-80px)] w-full overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            style={{ x: tlX, y: tlY, opacity: underImagesOpacity }}
            className={baseImageClasses + " z-10"}
          >
            <img src={images.topLeft} alt="" className="h-full w-full object-cover" />
          </motion.div>

          <motion.div
            style={{ x: brX, y: brY, opacity: underImagesOpacity }}
            className={baseImageClasses + " z-20"}
          >
            <img src={images.bottomRight} alt="" className="h-full w-full object-cover" />
          </motion.div>

          <motion.div
            style={{ x: blX, y: blY, opacity: underImagesOpacity }}
            className={baseImageClasses + " z-30"}
          >
            <img src={images.bottomLeft} alt="" className="h-full w-full object-cover" />
          </motion.div>

          <motion.div
            style={{
              x: trX,
              y: trY,
              width: heroWidth,
              height: heroHeight,
            }}
            className={baseImageClasses + " z-40 origin-center bg-black/5"}
          >
            <img src={images.topRight} alt="" className="h-full w-full object-cover" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
