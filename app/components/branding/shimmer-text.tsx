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
          "linear-gradient(120deg, #17294b 0%, #17294b 40%, #e3a641 50%, #17294b 60%, #17294b 100%)",
      }}
      animate={prefersReducedMotion ? undefined : { backgroundPosition: ["200% center", "0% center", "200% center"] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {text}
    </motion.span>
  );
}
