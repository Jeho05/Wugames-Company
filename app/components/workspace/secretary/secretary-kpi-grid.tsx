"use client";

import { Icon } from "@/app/components/ui/app-icon";
import { Sparkline } from "@/app/components/workspace/executive/sparkline";
import type { SecretaryKpi } from "@/app/lib/secretary-data";

type SecretaryKpiGridProps = {
  kpis: SecretaryKpi[];
};

const trendMeta = {
  up: { text: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700", arrow: "arrow-up" as const },
  down: { text: "text-rose-600", badge: "bg-rose-50 text-rose-700", arrow: "arrow-down" as const },
  flat: { text: "text-slate-500", badge: "bg-slate-100 text-slate-600", arrow: "minus" as const },
};

export function SecretaryKpiGrid({ kpis }: SecretaryKpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, index) => {
        const trend = trendMeta[kpi.trend];
        return (
          <article
            className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-950/[0.04] backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-950/[0.07]"
            key={kpi.key}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-gradient-to-br from-[#e3a641]/10 to-transparent opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
            />
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-600 transition-colors group-hover:border-amber-100 group-hover:bg-amber-50 group-hover:text-[#d19331]">
                <Icon name={kpi.icon} size={18} />
              </span>
              <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold " + trend.badge}>
                <Icon name={trend.arrow} size={11} />
                {kpi.change}
              </span>
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{kpi.label}</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#17294b]">{kpi.value}</p>
            <p className="mt-1 text-[11px] text-slate-500">{kpi.caption}</p>
            <div className="mt-3 flex justify-end">
              <Sparkline color={kpi.trend === "down" ? "#e11d48" : "#e3a641"} data={kpi.spark} height={30} width={110} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
