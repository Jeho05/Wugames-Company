"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Icon } from "@/app/components/ui/app-icon";
import { Spinner } from "@/app/components/ui/loading-button";

type PulseButtonProps = {
  children?: React.ReactNode;
  href: string;
  icon?: boolean;
  className?: string;
};

export function PulseButton({ children, href, icon = true, className = "" }: PulseButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const [pending, setPending] = useState(false);
  // Ancres (#…) = scroll instantané, pas de loading. Navigations = feedback immédiat
  // car la page de destination peut mettre 1-3s à charger (bundle + session).
  const isAnchor = href.startsWith("#");

  return (
    <Link
      aria-busy={pending || undefined}
      className={"group relative inline-flex shrink-0 " + (pending ? "pointer-events-none " : "") + className}
      href={href}
      onClick={() => {
        if (!isAnchor) {
          setPending(true);
          // Sécurité : si la navigation échoue, on réarme le bouton.
          setTimeout(() => setPending(false), 8000);
        }
      }}
      prefetch
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-xl bg-[#e3a641] blur-[10px]"
        animate={prefersReducedMotion ? undefined : { scale: [1, 1.07, 1], opacity: [0.35, 0.06, 0.35] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#f6cb76] to-[#e3a641] px-4 py-2.5 text-sm font-bold text-[#14223b] shadow-[0_14px_30px_-12px_rgba(227,166,65,0.85),inset_0_1px_0_rgba(255,255,255,0.4)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:brightness-[1.04] group-active:translate-y-0 sm:px-6 sm:py-3.5">
        {pending ? <Spinner size={16} /> : null}
        {pending ? <span>Chargement…</span> : children}
        {icon && !pending ? (
          <Icon className="transition-transform duration-200 group-hover:translate-x-0.5" name="arrow-right" size={18} />
        ) : null}
      </span>
    </Link>
  );
}
