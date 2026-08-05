"use client";

import { motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { Sparkline } from "@/app/components/workspace/executive/sparkline";
import type { ExecutiveKpi } from "@/app/lib/executive-data";

type ExecutiveKpiGridProps = {
  kpis: ExecutiveKpi[];
};

const trendStyles = {
  up: "text-emerald-600",
  down: "text-red-600",
  flat: "text-slate-500",
} as const;

const iconTiles: Record<string, string> = {
  ca: "bg-amber-50 text-amber-600",
  factures: "bg-sky-50 text-sky-600",
  clients: "bg-violet-50 text-violet-600",
  fournisseurs: "bg-emerald-50 text-emerald-600",
  filiales: "bg-slate-100 text-slate-600",
  employes: "bg-rose-50 text-rose-600",
  missions: "bg-indigo-50 text-indigo-600",
  stock: "bg-teal-50 text-teal-600",
};

export function ExecutiveKpiGrid({ kpis }: ExecutiveKpiGridProps) {
  const reduce = useReducedMotion();

  return (
    <section aria-label="Indicateurs clés" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, index) => {
        const tile = iconTiles[kpi.key] ?? "bg-slate-100 text-slate-600";
        const iconColor = kpi.trend === "up" ? "#10b981" : kpi.trend === "down" ? "#ef4444" : "#94a3b8";

        return (
          <motion.article
            className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-950/[0.07]"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={kpi.key}
            transition={{ duration: 0.5, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between">
              <span className={"grid size-11 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-105 " + tile}>
                <Icon name={kpi.icon} size={20} />
              </span>
              <Sparkline color={iconColor} data={kpi.spark} height={34} width={92} />
            </div>

            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{kpi.label}</p>
            <p className="mt-1.5 text-[26px] font-bold tracking-[-0.04em] text-[#16233a]">{kpi.value}</p>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold">
              <span className={"inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 " + (kpi.trend === "up" ? "bg-emerald-50 text-emerald-600" : kpi.trend === "down" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500")}>
                {kpi.trend === "up" ? (
                  <Icon name="arrow-up-right" size={12} />
                ) : kpi.trend === "down" ? (
                  <Icon className="rotate-90" name="arrow-up-right" size={12} />
                ) : (
                  <Icon name="minus" size={12} />
                )}
                {kpi.change}
              </span>
              <span className={trendStyles[kpi.trend]}>·</span>
              <span className="text-slate-400">{kpi.caption}</span>
            </div>
          </motion.article>
        );
      })}
    </section>
  );
}
