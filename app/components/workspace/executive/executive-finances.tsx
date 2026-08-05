"use client";

import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { ExecutiveFinance } from "@/app/lib/executive-data";

type ExecutiveFinancesProps = {
  finances: ExecutiveFinance;
};

function formatFcfaCompact(value: number): string {
  return new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 }).format(value) + " FCFA";
}

type TooltipEntry = {
  name?: string;
  value?: number | string;
  color?: string;
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-xl shadow-slate-950/10 backdrop-blur">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      {payload.map((entry, index) => (
        <p className="mt-0.5 text-[13px] font-bold text-[#16233a]" key={index}>
          {entry.name ? <span className="mr-1.5 inline-block size-2 rounded-full align-middle" style={{ background: entry.color }} /> : null}
          {typeof entry.value === "number" ? formatFcfaCompact(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-xl shadow-slate-950/10 backdrop-blur">
      <p className="flex items-center gap-1.5 text-[13px] font-bold text-[#16233a]">
        <span className="size-2 rounded-full" style={{ background: payload[0].color }} />
        {payload[0].name}
      </p>
      <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{payload[0].value} facture(s)</p>
    </div>
  );
}

export function ExecutiveFinances({ finances }: ExecutiveFinancesProps) {
  const totalFactures = finances.factureRepartition.reduce((sum, part) => sum + part.value, 0);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,0.9fr)]">
      <ExecutivePanel
        icon="chart"
        subtitle="Chiffre d'affaires consolidé · 12 derniers mois"
        title="Évolution du chiffre d'affaires"
      >
        <div className="h-[290px] w-full">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={finances.caSeries} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="caFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#e3a641" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#e3a641" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="mois"
                fontSize={11}
                fontWeight={600}
                tick={{ fill: "#94a3b8" }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                fontSize={11}
                fontWeight={600}
                tick={{ fill: "#94a3b8" }}
                tickFormatter={(value: number) => formatFcfaCompact(value)}
                tickLine={false}
                width={62}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }} />
              <Area
                activeDot={{ r: 5, fill: "#17294b", stroke: "#e3a641", strokeWidth: 2 }}
                animationDuration={1100}
                dataKey="ca"
                fill="url(#caFill)"
                name="CA"
                stroke="#d19331"
                strokeWidth={2.5}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ExecutivePanel>

      <ExecutivePanel
        icon="file-text"
        subtitle={`${totalFactures} facture(s) au total`}
        title="Répartition des factures"
      >
        <div className="flex h-[290px] items-center">
          <div className="relative h-full w-1/2 min-w-0">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Tooltip content={<DonutTooltip />} />
                <Pie
                  animationDuration={1000}
                  cx="50%"
                  cy="50%"
                  data={finances.factureRepartition}
                  dataKey="value"
                  innerRadius="62%"
                  nameKey="name"
                  outerRadius="92%"
                  paddingAngle={3}
                  stroke="none"
                >
                  {finances.factureRepartition.map((entry) => (
                    <Cell fill={entry.color} key={entry.name} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <p className="pointer-events-none absolute inset-0 grid place-content-center text-center">
              <span className="text-[22px] font-bold tracking-[-0.04em] text-[#16233a]">{totalFactures}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Factures</span>
            </p>
          </div>
          <ul className="w-1/2 space-y-2.5 pl-4">
            {finances.factureRepartition.map((part) => {
              const percent = totalFactures > 0 ? Math.round((part.value / totalFactures) * 100) : 0;
              return (
                <li className="flex items-center gap-2.5" key={part.name}>
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: part.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-[#16233a]">{part.name}</p>
                    <p className="text-[10px] font-semibold text-slate-400">{part.value} · {percent}%</p>
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
