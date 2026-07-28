"use client";

import { motion, useReducedMotion } from "motion/react";

export function ShaderBeams({ className = "" }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div className={"pointer-events-none absolute inset-0 overflow-hidden " + className} aria-hidden="true">
      {[
        { top: "15%", delay: 0, rotate: -3, width: "w-[180%]", color: "from-transparent via-[#e3a641]/20 to-transparent" },
        { top: "45%", delay: 4, rotate: 2, width: "w-[200%]", color: "from-transparent via-[#426b95]/15 to-transparent" },
        { top: "72%", delay: 8, rotate: -1, width: "w-[160%]", color: "from-transparent via-[#e3a641]/15 to-transparent" },
      ].map((beam, i) => (
        <motion.div
          key={i}
          className={
            "absolute left-[-50%] h-px bg-gradient-to-r " +
            beam.width + " " + beam.color
          }
          style={{ top: beam.top, rotate: `${beam.rotate}deg` }}
          animate={{
            x: ["-30%", "80%"],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 14 + i * 3,
            repeat: Infinity,
            delay: beam.delay,
            ease: "linear",
          }}
        />
      ))}
      {/* Floating orbs */}
      <motion.div
        className="absolute -left-[10%] top-[10%] size-[500px] rounded-full bg-[#e3a641]/8 blur-[150px]"
        animate={{ x: [0, 60, -30, 0], y: [0, -50, 30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[15%] bottom-[10%] size-[400px] rounded-full bg-[#7ba3cc]/8 blur-[120px]"
        animate={{ x: [0, -40, 50, 0], y: [0, 40, -30, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
      <motion.div
        className="absolute left-[40%] top-[60%] size-[300px] rounded-full bg-[#e3a641]/6 blur-[100px]"
        animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.9, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 10 }}
      />
    </div>
  );
}
