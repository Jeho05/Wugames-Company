"use client";

import { motion, useReducedMotion } from "motion/react";

export function ShimmerText({ text, className = "" }: { text: string; className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.span
      className={
        "inline-block bg-[length:200%_100%] bg-clip-text text-transparent " +
        className
      }
      style={{
        backgroundImage:
          "linear-gradient(120deg, #17294b 0%, #17294b 30%, #e3a641 45%, #dfc28b 55%, #17294b 70%, #17294b 100%)",
      }}
      animate={prefersReducedMotion ? undefined : { backgroundPosition: ["200% center", "-100% center"] }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    >
      {text}
    </motion.span>
  );
}
