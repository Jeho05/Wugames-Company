"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "motion/react";

import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { PartnerOverview } from "@/app/lib/partner-data";

type PartnerChartsProps = {
  charts: PartnerOverview["charts"];
};

type TooltipEntry = {
  name?: string;
  value?: number | string;
  color?: string;
};

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string | number }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-xl shadow-slate-950/10 backdrop-blur">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      {payload.map((entry, index) => (
        <p className="mt-0.5 text-[13px] font-bold text-[#16233a]" key={index}>
          {entry.name ? <span className="mr-1.5 inline-block size-2 rounded-full align-middle" style={{ background: entry.color }} /> : null}
          {typeof entry.value === "number" ? `${entry.value.toLocaleString("fr-FR")} M FCFA` : entry.value}
        </p>
      ))}
    </div>
  );
}

function FluxTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string | number }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-xl shadow-slate-950/10 backdrop-blur">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      {payload.map((entry, index) => (
        <p className="mt-0.5 text-[13px] font-bold text-[#16233a]" key={index}>
          <span className="mr-1.5 inline-block size-2 rounded-full align-middle" style={{ background: entry.color }} />
          {entry.name} : {typeof entry.value === "number" ? entry.value.toLocaleString("fr-FR") : entry.value}
        </p>
      ))}
    </div>
  );
}

export function PartnerCharts({ charts }: PartnerChartsProps) {
  const maxTop = Math.max(...charts.topProduits.map((entry) => entry.value), 1);
  const totalFiliales = charts.valeurFiliales.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ExecutivePanel icon="chart" subtitle="Valeur du stock · 12 derniers mois" title="Évolution du stock">
        <div className="h-[240px] w-full">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={charts.stockEvolution} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="partnerStockFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#e3a641" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#e3a641" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="label"
                fontSize={10}
                fontWeight={600}
                interval="preserveStartEnd"
                minTickGap={24}
                tick={{ fill: "#94a3b8" }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                fontSize={10}
                fontWeight={600}
                tick={{ fill: "#94a3b8" }}
                tickFormatter={(value: number) => `${value} M`}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }} />
              <Area
                activeDot={{ r: 4, fill: "#17294b", stroke: "#e3a641", strokeWidth: 2 }}
                animationDuration={900}
                dataKey="valeur"
                fill="url(#partnerStockFill)"
                name="Valeur du stock"
                stroke="#d19331"
                strokeWidth={2.5}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ExecutivePanel>

      <ExecutivePanel icon="refresh" subtitle="6 derniers mois · nombre de mouvements" title="Entrées / Sorties">
        <div className="h-[240px] w-full">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={charts.flux} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="label"
                fontSize={10}
                fontWeight={600}
                tick={{ fill: "#94a3b8" }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                fontSize={10}
                fontWeight={600}
                tick={{ fill: "#94a3b8" }}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<FluxTooltip />} cursor={{ fill: "rgba(227,166,65,0.06)" }} />
              <Bar animationDuration={900} dataKey="entrees" fill="#10b981" name="Entrées" radius={[6, 6, 0, 0]} />
              <Bar animationDuration={900} dataKey="sorties" fill="#f43f5e" name="Sorties" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ExecutivePanel>

      <ExecutivePanel icon="package" subtitle="Par valeur stockée · millions de FCFA" title="Top produits">
        <div className="space-y-3">
          {charts.topProduits.map((entry, index) => (
            <div key={entry.name}>
              <div className="mb-1 flex items-center justify-between">
                <p className="flex items-center gap-2 text-[11px] font-bold text-[#16233a]">
                  <span className="grid size-5 place-items-center rounded-md bg-slate-100 text-[9px] font-extrabold text-slate-500">
                    {index + 1}
                  </span>
                  {entry.name}
                </p>
                <p className="text-[11px] font-bold tabular-nums text-slate-500">{entry.value.toLocaleString("fr-FR")} M FCFA</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  animate={{ width: `${(entry.value / maxTop) * 100}%` }}
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  style={{ background: entry.color }}
                  transition={{ delay: 0.15 + index * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
      </ExecutivePanel>

      <ExecutivePanel
        action={
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
            {totalFiliales.toLocaleString("fr-FR")} M FCFA
          </span>
        }
        icon="building"
        subtitle="Répartition par filiale"
        title="Valeur du stock par filiale"
      >
        <div className="flex h-[210px] items-center">
          <div className="relative h-full w-1/2 min-w-0">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Tooltip content={<FluxTooltip />} />
                <Pie
                  animationDuration={1000}
                  cx="50%"
                  cy="50%"
                  data={charts.valeurFiliales}
                  dataKey="value"
                  innerRadius="62%"
                  nameKey="name"
                  outerRadius="92%"
                  paddingAngle={3}
                  stroke="none"
                >
                  {charts.valeurFiliales.map((entry) => (
                    <Cell fill={entry.color} key={entry.name} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <p className="pointer-events-none absolute inset-0 grid place-content-center text-center">
              <span className="text-[22px] font-bold tabular-nums tracking-[-0.04em] text-[#16233a]">
                {totalFiliales.toLocaleString("fr-FR")}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">M FCFA</span>
            </p>
          </div>
          <ul className="w-1/2 space-y-2.5 pl-4">
            {charts.valeurFiliales.map((entry) => {
              const percent = totalFiliales > 0 ? Math.round((entry.value / totalFiliales) * 100) : 0;
              return (
                <li className="flex items-center gap-2.5" key={entry.name}>
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: entry.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-[#16233a]">{entry.name}</p>
                    <p className="text-[10px] font-semibold tabular-nums text-slate-400">{entry.value.toLocaleString("fr-FR")} M · {percent}%</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </ExecutivePanel>
    </div>
  );
}
