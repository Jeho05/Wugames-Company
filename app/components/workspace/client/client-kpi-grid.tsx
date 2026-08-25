"use client";

import { motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";
import { Sparkline } from "@/app/components/workspace/executive/sparkline";
import { formatFcfa } from "@/app/lib/store-data";

type ClientKpi = {
  id: string;
  label: string;
  value: string;
  detail: string;
  icon: IconName;
  tone: "navy" | "gold" | "emerald" | "amber" | "sky" | "rose";
  spark: number[];
};

const iconTone: Record<ClientKpi["tone"], string> = {
  navy: "bg-[#17294b]/[0.07] text-[#17294b]",
  gold: "bg-[#e3a641]/[0.12] text-[#b47e1e]",
  emerald: "bg-emerald-500/[0.12] text-emerald-600",
  amber: "bg-amber-500/[0.12] text-amber-600",
  sky: "bg-sky-500/[0.12] text-sky-600",
  rose: "bg-rose-500/[0.12] text-rose-600",
};

const sparkColor: Record<ClientKpi["tone"], string> = {
  navy: "#17294b",
  gold: "#e3a641",
  emerald: "#10b981",
  amber: "#f59e0b",
  sky: "#0ea5e9",
  rose: "#f43f5e",
};

type ClientKpiGridProps = {
  missions: number;
  commandes: number;
  devis: number;
  factures: number;
  facturesImpayees: number;
  facturesPayees: number;
  montantImpaye: number;
  notificationsNonLues: number;
  derniereActivite: string;
};

export function ClientKpiGrid({
  missions,
  commandes,
  devis,
  factures,
  facturesImpayees,
  facturesPayees,
  montantImpaye,
  notificationsNonLues,
  derniereActivite,
}: ClientKpiGridProps) {
  const reduce = useReducedMotion();

  const kpis: ClientKpi[] = [
    { id: "missions", label: "Travail Total", value: String(missions), detail: missions > 0 ? "En cours d'exécution" : "Aucun travail en cours", icon: "hardhat", tone: "navy", spark: [12, 14, 16, 15, 18, 17, 20, 22] },
    { id: "commandes", label: "Mes commandes", value: String(commandes), detail: commandes > 0 ? "En préparation" : "Aucune commande active", icon: "box", tone: "sky", spark: [8, 9, 9, 11, 12, 12, 13, 14] },
    { id: "devis", label: "Mes devis", value: String(devis), detail: devis > 0 ? "En attente de réponse" : "Aucun devis en attente", icon: "sparkles", tone: "gold", spark: [6, 7, 7, 8, 9, 9, 10, 10] },
    { id: "abonnement", label: "Abonnement Wugam Clean", value: "Actif", detail: "Plan B Premium · 50 000 FCFA/mois", icon: "sparkles", tone: "emerald", spark: [4, 5, 6, 6, 7, 8, 9, 10] },
    { id: "notifications", label: "Notifications", value: String(notificationsNonLues), detail: notificationsNonLues > 0 ? "À consulter" : "Tout est à jour", icon: "bell", tone: "amber", spark: [7, 6, 5, 5, 4, 3, 3, 2] },
    { id: "activite", label: "Dernière activité", value: derniereActivite, detail: "Mise à jour en continu", icon: "history", tone: "sky", spark: [2, 3, 4, 4, 5, 6, 7, 8] },
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
              <Sparkline color={sparkColor[kpi.tone]} data={kpi.spark} height={26} width={72} />
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
