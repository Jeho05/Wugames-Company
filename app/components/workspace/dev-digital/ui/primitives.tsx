"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/* ------------------------------------------------------------------ */
/* Primitives du Digital Observatory — consistentes avec le WUGAMS UI  */
/* ------------------------------------------------------------------ */

export function useCountUp(target: number, durationMs = 900): number {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(() => (reduce ? target : 0));
  const frame = useRef<number>(0);

  useEffect(() => {
    if (reduce) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, durationMs, reduce]);

  return value;
}

export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const count = useCountUp(value);
  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {Math.round(count).toLocaleString("fr-FR")}
    </span>
  );
}

export function BreathingDot({ color, size = 8, className = "" }: { color: string; size?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={"relative inline-flex " + className} style={{ width: size, height: size }}>
      {!reduce ? (
        <motion.span
          animate={{ scale: [1, 2.6], opacity: [0.5, 0] }}
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: color }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        />
      ) : null}
      <span className="relative rounded-full" style={{ backgroundColor: color, width: size, height: size }} />
    </span>
  );
}

export function Spark({ values, color, className = "" }: { values: number[]; color: string; className?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div aria-hidden="true" className={"flex items-end gap-[3px] " + className}>
      {values.map((value, index) => (
        <span
          className="w-[3px] rounded-full transition-all duration-500"
          key={index}
          style={{ backgroundColor: color, height: `${Math.max(18, (value / max) * 100)}%`, opacity: 0.35 + (index / values.length) * 0.65 }}
        />
      ))}
    </div>
  );
}

export function Avatar({
  initials,
  size = 34,
  className = "",
  ring = "rgba(148,163,207,0.3)",
}: {
  initials: string;
  size?: number;
  className?: string;
  ring?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={
        "inline-grid shrink-0 place-items-center rounded-full font-bold uppercase tracking-wide " +
        "bg-gradient-to-br from-[#1d2b52] to-[#0f172f] text-[#dbe4f5] " +
        className
      }
      style={{ width: size, height: size, fontSize: size * 0.36, boxShadow: `0 0 0 1px ${ring}` }}
    >
      {initials}
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  action,
  className = "",
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={"flex items-end justify-between gap-4 " + className}>
      <div>
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#7dd3fc]/90">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-[17px] font-bold tracking-[-0.03em] text-[#e9eefb]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className = "", glow }: { children: ReactNode; className?: string; glow?: string }) {
  return (
    <div
      className={
        "relative overflow-hidden rounded-3xl border border-[rgba(148,163,207,0.12)] bg-[#0f172f]/80 backdrop-blur-sm " +
        className
      }
    >
      {glow ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(80% 90% at 50% 0%, ${glow}, transparent 70%)` }} />
      ) : null}
      {children}
    </div>
  );
}

export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={"inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide " + className}>
      {children}
    </span>
  );
}

export function KBD({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-block rounded border border-white/[0.14] bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] font-bold leading-none text-[#8b96b3]">
      {children}
    </kbd>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={"animate-pulse rounded-xl bg-white/[0.06] " + className} />;
}

export function GridBackdrop({ className = "", opacity = 0.35 }: { className?: string; opacity?: number }) {
  return (
    <div aria-hidden="true" className={"pointer-events-none absolute inset-0 overflow-hidden " + className}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(120,140,190,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(120,140,190,0.10) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(90% 90% at 50% 40%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(90% 90% at 50% 40%, black 30%, transparent 100%)",
          opacity,
        }}
      />
    </div>
  );
}