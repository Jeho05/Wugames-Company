"use client";

import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "motion/react";

import { AccountantPanel } from "@/app/components/workspace/accountant/accountant-panel";
import { formatFcfaCompact } from "@/app/lib/accountant-data";
import type { AccountantOverview } from "@/app/lib/accountant-data";

type AccountantBreakdownProps = {
  statuts: AccountantOverview["statutsBreakdown"];
  filiales: AccountantOverview["filialesBreakdown"];
  recettesDepenses: AccountantOverview["recettesDepenses"];
};

type TooltipEntry = {
  name?: string;
  value?: number | string;
  color?: string;
};

function DonutTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1424]/95 px-3.5 py-2.5 shadow-2xl shadow-black/50 backdrop-blur">
      <p className="flex items-center gap-1.5 text-[13px] font-bold text-white">
        <span className="size-2 rounded-full" style={{ background: payload[0].color }} />
        {payload[0].name}
      </p>
      <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{payload[0].value} facture(s)</p>
    </div>
  );
}

function BarTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1424]/95 px-3.5 py-2.5 shadow-2xl shadow-black/50 backdrop-blur">
      <p className="flex items-center gap-1.5 text-[13px] font-bold text-white">
        <span className="size-2 rounded-full" style={{ background: payload[0].color }} />
        {payload[0].name}
      </p>
      <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-slate-400">
        {typeof payload[0].value === "number" ? `${payload[0].value.toLocaleString("fr-FR")} M FCFA` : payload[0].value}
      </p>
    </div>
  );
}

export function AccountantBreakdown({ statuts, filiales, recettesDepenses }: AccountantBreakdownProps) {
  const totalStatuts = statuts.reduce((sum, part) => sum + part.value, 0);
  const maxFiliale = Math.max(...filiales.map((part) => part.value), 1);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <AccountantPanel
        action={
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300">
            {totalStatuts} factures
          </span>
        }
        icon="boxes"
        subtitle="Par statut comptable"
        title="Répartition des factures"
      >
        <div className="flex h-[240px] items-center">
          <div className="relative h-full w-1/2 min-w-0">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Tooltip content={<DonutTooltip />} />
                <Pie
                  animationDuration={1000}
                  cx="50%"
                  cy="50%"
                  data={statuts}
                  dataKey="value"
                  innerRadius="62%"
                  nameKey="name"
                  outerRadius="92%"
                  paddingAngle={3}
                  stroke="none"
                >
                  {statuts.map((part) => (
                    <Cell fill={part.color} key={part.name} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <p className="pointer-events-none absolute inset-0 grid place-content-center text-center">
              <span className="text-[22px] font-bold tabular-nums tracking-[-0.04em] text-white">{totalStatuts}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Factures</span>
            </p>
          </div>
          <ul className="w-1/2 space-y-2.5 pl-4">
            {statuts.map((part) => {
              const percent = totalStatuts > 0 ? Math.round((part.value / totalStatuts) * 100) : 0;
              return (
                <li className="flex items-center gap-2.5" key={part.name}>
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: part.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-slate-200">{part.name}</p>
                    <p className="text-[10px] font-semibold tabular-nums text-slate-500">
                      {part.value} · {percent}%
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </AccountantPanel>

      <AccountantPanel
        icon="chart"
        subtitle="Mois en cours · millions de FCFA"
        title="Recettes, dépenses & bénéfice"
      >
        <div className="h-[170px] w-full">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={recettesDepenses} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <XAxis
                axisLine={false}
                dataKey="label"
                fontSize={10}
                fontWeight={700}
                tick={{ fill: "#94a3b8" }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                fontSize={10}
                fontWeight={600}
                tick={{ fill: "#64748b" }}
                tickFormatter={(value: number) => `${value} M`}
                tickLine={false}
                width={44}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar animationDuration={900} dataKey="value" name="Montant" radius={[8, 8, 0, 0]}>
                {recettesDepenses.map((entry) => (
                  <Cell fill={entry.color} key={entry.label} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2.5">
          {filiales.map((filiale, index) => (
            <div key={filiale.name}>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-300">{filiale.name}</p>
                <p className="text-[10px] font-semibold tabular-nums text-slate-500">
                  {formatFcfaCompact(filiale.value * 1_000_000)}
                </p>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  animate={{ width: `${Math.max((filiale.value / maxFiliale) * 100, 4)}%` }}
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  style={{ background: filiale.color }}
                  transition={{ delay: 0.15 + index * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
      </AccountantPanel>
    </div>
  );
}
