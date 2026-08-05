"use client";

import { Icon } from "@/app/components/ui/app-icon";
import { Sparkline } from "@/app/components/workspace/executive/sparkline";
import type { AccountantKpi } from "@/app/lib/accountant-data";

type AccountantKpiGridProps = {
  kpis: AccountantKpi[];
};

const invertedGoodKeys = new Set(["impayees", "depenses"]);

function toneOf(kpi: AccountantKpi): { chip: string; arrow: "arrow-up" | "arrow-down" | "minus"; spark: string; text: string } {
  const trend = kpi.trend;
  const good = invertedGoodKeys.has(kpi.key) ? trend === "down" : trend === "up";
  if (trend === "flat") {
    return { chip: "bg-slate-400/10 text-slate-300", arrow: "minus", spark: "#94a3b8", text: "text-slate-300" };
  }
  if (good) {
    return { chip: "bg-emerald-400/10 text-emerald-300", arrow: trend === "up" ? "arrow-up" : "arrow-down", spark: "#34d399", text: "text-emerald-300" };
  }
  return { chip: "bg-rose-400/10 text-rose-300", arrow: trend === "up" ? "arrow-up" : "arrow-down", spark: "#fb7185", text: "text-rose-300" };
}

export function AccountantKpiGrid({ kpis }: AccountantKpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const tone = toneOf(kpi);
        return (
          <article
            className="group relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5 shadow-xl shadow-black/20 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.05]"
            key={kpi.key}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-[#e3a641]/[0.08] opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
            />
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.05] text-slate-300 transition-colors group-hover:border-[#e3a641]/40 group-hover:text-[#f2c56d]">
                <Icon name={kpi.icon} size={18} />
              </span>
              <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold " + tone.chip}>
                <Icon name={tone.arrow} size={11} />
                {kpi.change}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{kpi.label}</p>
              {kpi.estimated ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-slate-400">
                  Estimé
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-2xl font-extrabold tabular-nums tracking-tight text-white">{kpi.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{kpi.caption}</p>
            <div className="mt-3 flex justify-end opacity-70 transition-opacity duration-300 group-hover:opacity-100">
              <Sparkline color={tone.spark} data={kpi.spark} height={30} width={110} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
