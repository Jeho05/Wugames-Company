"use client";

import { motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";
import { Sparkline } from "@/app/components/workspace/executive/sparkline";

type ClientStdKpi = {
  id: string;
  label: string;
  value: string;
  detail: string;
  icon: IconName;
  tone: "navy" | "gold" | "emerald" | "amber" | "sky";
  spark: number[];
};

const iconTone: Record<ClientStdKpi["tone"], string> = {
  navy: "bg-[#17294b]/[0.07] text-[#17294b]",
  gold: "bg-[#e3a641]/[0.12] text-[#b47e1e]",
  emerald: "bg-emerald-500/[0.12] text-emerald-600",
  amber: "bg-amber-500/[0.12] text-amber-600",
  sky: "bg-sky-500/[0.12] text-sky-600",
};

const sparkColor: Record<ClientStdKpi["tone"], string> = {
  navy: "#17294b",
  gold: "#e3a641",
  emerald: "#10b981",
  amber: "#f59e0b",
  sky: "#0ea5e9",
};

type ClientStdKpiGridProps = {
  missions: number;
  commandes: number;
  devis: number;
  notificationsNonLues: number;
  derniereActivite: string;
  progressionGlobale: number;
};

export function ClientStdKpiGrid({
  missions,
  commandes,
  devis,
  notificationsNonLues,
  derniereActivite,
  progressionGlobale,
}: ClientStdKpiGridProps) {
  const reduce = useReducedMotion();

  const kpis: ClientStdKpi[] = [
    { id: "missions", label: "Mes missions", value: String(missions), detail: missions > 0 ? "1 en cours d'exécution" : "Aucune mission en cours", icon: "hardhat", tone: "navy", spark: [10, 12, 14, 13, 16, 15, 18, 20] },
    { id: "commandes", label: "Mes commandes", value: String(commandes), detail: commandes > 0 ? "2 en préparation" : "Aucune commande active", icon: "shopping-bag", tone: "sky", spark: [6, 7, 9, 8, 10, 11, 12, 13] },
    { id: "devis", label: "Mes devis", value: String(devis), detail: devis > 0 ? "1 en attente de réponse" : "Aucun devis en attente", icon: "sparkles", tone: "gold", spark: [5, 6, 6, 7, 8, 8, 9, 10] },
    { id: "notifications", label: "Notifications", value: String(notificationsNonLues), detail: notificationsNonLues > 0 ? "À consulter" : "Tout est à jour", icon: "bell", tone: "amber", spark: [8, 7, 6, 6, 5, 4, 4, 3] },
    { id: "activite", label: "Dernière activité", value: derniereActivite, detail: "Mise à jour en continu", icon: "history", tone: "sky", spark: [2, 3, 4, 4, 5, 6, 7, 8] },
    { id: "progression", label: "Progression globale", value: `${progressionGlobale}%`, detail: missions > 0 ? "Sur l'ensemble de vos missions" : "Aucune mission démarrée", icon: "activity", tone: "emerald", spark: [20, 28, 32, 40, 44, 52, 58, progressionGlobale] },
  ];

  return (
    <ul className="grid grid-cols-2 gap-3.5 lg:grid-cols-3 xl:gap-4" aria-label="Indicateurs clés">
      {kpis.map((kpi, index) => (
        <li key={kpi.id}>
          <motion.article
            className="group relative h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-950/[0.03] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-950/[0.07] sm:p-5 dark:border-white/10 dark:bg-[#101c36] dark:shadow-none"
            initial={reduce ? undefined : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between gap-3">
              <span className={"grid size-10 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110 " + iconTone[kpi.tone]}>
                <Icon name={kpi.icon} size={18} />
              </span>
              {kpi.id === "progression" ? (
                <ProgressRing value={progressionGlobale} />
              ) : (
                <Sparkline color={sparkColor[kpi.tone]} data={kpi.spark} height={26} width={72} />
              )}
            </div>
            <p className="mt-4 truncate text-2xl font-bold tracking-[-0.04em] text-[#16233a] dark:text-white sm:text-[26px]">
              {kpi.value}
            </p>
            <p className="mt-1 truncate text-xs font-bold text-slate-600 dark:text-slate-300">{kpi.label}</p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400 dark:text-slate-500">{kpi.detail}</p>
          </motion.article>
        </li>
      ))}
    </ul>
  );
}

function ProgressRing({ value }: { value: number }) {
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg aria-hidden="true" className="overflow-visible" height={32} viewBox="0 0 36 36" width={32}>
      <circle cx="18" cy="18" fill="none" r={radius} stroke="currentColor" strokeWidth="3.5" className="text-slate-100 dark:text-white/10" />
      <motion.circle
        cx="18"
        cy="18"
        fill="none"
        r={radius}
        stroke="#10b981"
        strokeDasharray={circumference}
        strokeLinecap="round"
        strokeWidth="3.5"
        transform="rotate(-90 18 18)"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference * (1 - value / 100) }}
        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}
