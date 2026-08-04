"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Icon } from "@/app/components/ui/app-icon";

type PulseButtonProps = {
  children?: React.ReactNode;
  href: string;
  icon?: boolean;
};

export function PulseButton({ children, href, icon = true }: PulseButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Link className="group relative inline-flex shrink-0" href={href}>
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-xl bg-[#e3a641] blur-[10px]"
        animate={prefersReducedMotion ? undefined : { scale: [1, 1.07, 1], opacity: [0.35, 0.06, 0.35] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#f6cb76] to-[#e3a641] px-6 py-3.5 text-sm font-bold text-[#14223b] shadow-[0_14px_30px_-12px_rgba(227,166,65,0.85),inset_0_1px_0_rgba(255,255,255,0.4)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:brightness-[1.04] group-active:translate-y-0">
        {children}
        {icon ? (
          <Icon className="transition-transform duration-200 group-hover:translate-x-0.5" name="arrow-right" size={18} />
        ) : null}
      </span>
    </Link>
  );
}
