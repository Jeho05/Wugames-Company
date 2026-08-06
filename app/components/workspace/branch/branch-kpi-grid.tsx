"use client";

import Link from "next/link";

import { Icon } from "@/app/components/ui/app-icon";
import { Sparkline } from "@/app/components/workspace/executive/sparkline";
import type { BranchKpi } from "@/app/lib/branch-data";

type BranchKpiGridProps = {
  kpis: BranchKpi[];
};

const badKeys = new Set(["missions_retard", "a_reappro", "ruptures", "factures_retard"]);

function toneOf(kpi: BranchKpi): { chip: string; arrow: "arrow-up" | "arrow-down" | "minus"; spark: string } {
  const trend = kpi.trend;
  const good = badKeys.has(kpi.key) ? trend === "down" : trend === "up";
  if (trend === "flat") {
    return { chip: "bg-slate-100 text-slate-600", arrow: "minus", spark: "#94a3b8" };
  }
  if (good) {
    return { chip: "bg-emerald-50 text-emerald-700", arrow: trend === "up" ? "arrow-up" : "arrow-down", spark: "#0e9f9b" };
  }
  return { chip: "bg-rose-50 text-rose-700", arrow: trend === "up" ? "arrow-up" : "arrow-down", spark: "#f43f5e" };
}

export function BranchKpiGrid({ kpis }: BranchKpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      {kpis.map((kpi) => {
        const tone = toneOf(kpi);
        return (
          <Link
            className="group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-5 shadow-lg shadow-slate-950/[0.04] backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-[#0e9f9b]/30 hover:shadow-xl hover:shadow-slate-950/[0.07]"
            href={kpi.href}
            key={kpi.key}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-gradient-to-br from-[#38bdf8]/15 to-transparent opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
            />
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-600 transition-colors group-hover:border-teal-100 group-hover:bg-teal-50 group-hover:text-[#0e9f9b]">
                <Icon name={kpi.icon} size={18} />
              </span>
              <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold " + tone.chip}>
                <Icon name={tone.arrow} size={11} />
                {kpi.change}
              </span>
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{kpi.label}</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums tracking-tight text-[#0f2a52]">{kpi.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{kpi.caption}</p>
            <div className="mt-3 flex items-end justify-between gap-2">
              <Icon
                className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#0e9f9b]"
                name="arrow-up-right"
                size={15}
              />
              <Sparkline color={tone.spark} data={kpi.spark} height={28} width={92} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
