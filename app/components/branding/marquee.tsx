"use client";

import { motion } from "motion/react";

export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <div className={"overflow-hidden " + className}>
      <motion.div
        className="flex w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items].map((item, i) => (
          <span className="mx-8 shrink-0 text-xs font-bold tracking-wide text-slate-400" key={i}>
            ✦ {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
