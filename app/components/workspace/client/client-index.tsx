"use client";

import { motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";
import { ClientSection } from "@/app/components/workspace/client/client-section";

type ClientIndexProps = {
  sectionId?: string;
  onNavigate?: (sectionId: string) => void;
};

const indexEntries: { id: string; label: string; subtitle: string; icon: IconName; section: string; color: string }[] = [
  {
    id: "mode2vie",
    label: "Mode2Vie [Lifestyle]",
    subtitle: "Foi, travail et famille — notre vie chrétienne au quotidien",
    icon: "newspaper",
    section: "portail-mode2vie",
    color: "bg-[#f2c56d]/10 text-[#b47e1e] border-[#f2c56d]/30",
  },
  {
    id: "espace-wu",
    label: "Espace Wu",
    subtitle: "Boutique WUGAMS — entretien, matériaux, mobilier et outillage",
    icon: "shopping-bag",
    section: "portail-boutique",
    color: "bg-[#0f7a5f]/10 text-[#0f7a5f] border-[#0f7a5f]/30",
  },
];

export function ClientIndex({ sectionId = "portail-index", onNavigate }: ClientIndexProps) {
  const reduce = useReducedMotion();

  return (
    <ClientSection
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#17294b]/20 bg-[#17294b]/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#17294b]">
          <Icon name="grid" size={12} />
          Index
        </span>
      }
      icon="grid"
      id={sectionId}
      subtitle="Accédez rapidement à nos services et rubriques"
      title="Index"
    >
      {/* Bande d'annonce Espace Wu */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#0f7a5f] to-[#10b981] p-6 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100">
              Nouveau
            </p>
            <h3 className="mt-1.5 text-lg font-bold tracking-[-0.02em]">
              Découvrez l&apos;Espace Wu
            </h3>
            <p className="mt-1 text-[12px] leading-5 text-emerald-100">
              Entretien, matériaux, mobilier et outillage — commandez directement depuis votre espace client.
            </p>
          </div>
          <button
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[12px] font-bold text-[#0f7a5f] shadow-lg transition hover:bg-emerald-50"
            onClick={() => onNavigate?.("portail-boutique")}
            type="button"
          >
            Entrer
            <Icon name="arrow-right" size={14} />
          </button>
        </div>
      </div>

      {/* Grille des rubriques */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {indexEntries.map((entry, index) => (
          <motion.button
            className={
              "flex items-start gap-4 rounded-3xl border bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:bg-[#101c36] " +
              entry.color
            }
            initial={reduce ? undefined : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            key={entry.id}
            onClick={() => onNavigate?.(entry.section)}
            transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            type="button"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/80 shadow-sm dark:bg-white/10">
              <Icon name={entry.icon} size={18} />
            </span>
            <div className="min-w-0">
              <h4 className="text-[14px] font-bold tracking-[-0.02em] text-[#16233a] dark:text-slate-100">
                {entry.label}
              </h4>
              <p className="mt-0.5 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                {entry.subtitle}
              </p>
            </div>
            <Icon name="arrow-right" size={16} className="mt-1 shrink-0 text-slate-300" />
          </motion.button>
        ))}
      </div>
    </ClientSection>
  );
}
