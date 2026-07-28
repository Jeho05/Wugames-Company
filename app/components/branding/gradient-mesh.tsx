"use client";

import { motion } from "motion/react";

export function GradientMesh({ className = "" }: { className?: string }) {
  return (
    <div className={"pointer-events-none absolute inset-0 overflow-hidden " + className} aria-hidden="true">
      <motion.div
        className="absolute -left-[20%] -top-[10%] h-[600px] w-[600px] rounded-full bg-[#e3a641]/[0.07] blur-[120px]"
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[10%] top-[20%] h-[500px] w-[500px] rounded-full bg-[#426b95]/[0.06] blur-[100px]"
        animate={{
          x: [0, -20, 30, 0],
          y: [0, 20, -15, 0],
          scale: [1, 0.95, 1.05, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <motion.div
        className="absolute bottom-[10%] left-[30%] h-[400px] w-[400px] rounded-full bg-[#e3a641]/[0.05] blur-[80px]"
        animate={{
          x: [0, 25, -15, 0],
          y: [0, -20, 25, 0],
          scale: [1, 1.03, 0.97, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 7 }}
      />
    </div>
  );
}
