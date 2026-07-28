"use client";

import { motion, useReducedMotion } from "motion/react";

export function GradientMesh({ className = "" }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={"pointer-events-none absolute inset-0 overflow-hidden " + className} aria-hidden="true">
      <motion.div
        className="absolute -left-[20%] -top-[10%] h-[600px] w-[600px] rounded-full bg-[#e3a641]/[0.25] blur-[120px]"
        animate={prefersReducedMotion ? undefined : {
          x: [0, 40, -30, 0],
          y: [0, -40, 30, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[10%] top-[20%] h-[500px] w-[500px] rounded-full bg-[#426b95]/[0.2] blur-[100px]"
        animate={prefersReducedMotion ? undefined : {
          x: [0, -30, 40, 0],
          y: [0, 30, -20, 0],
          scale: [1, 0.92, 1.08, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <motion.div
        className="absolute bottom-[10%] left-[30%] h-[400px] w-[400px] rounded-full bg-[#e3a641]/[0.15] blur-[80px]"
        animate={prefersReducedMotion ? undefined : {
          x: [0, 30, -20, 0],
          y: [0, -25, 30, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 7 }}
      />
    </div>
  );
}
