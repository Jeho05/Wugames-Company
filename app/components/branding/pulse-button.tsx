"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Icon } from "@/app/components/ui/app-icon";

type PulseButtonProps = {
  children?: React.ReactNode;
  href: string;
  icon?: boolean;
};

export function PulseButton({ children, href, icon = true }: PulseButtonProps) {
  return (
    <Link className="relative inline-flex" href={href}>
      <motion.span
        className="absolute inset-0 rounded-xl border-2 border-[#e3a641]/30"
        animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-6 py-3.5 text-sm font-bold text-[#14223b] shadow-xl shadow-amber-600/15 transition hover:bg-[#efb653]">
        {children}
        {icon ? <Icon name="arrow-right" size={18} /> : null}
      </span>
    </Link>
  );
}
