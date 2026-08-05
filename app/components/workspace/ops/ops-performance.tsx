"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { OpsPanel } from "@/app/components/workspace/ops/ops-panel";
import type { OpsOverview } from "@/app/lib/ops-data";

type OpsPerformanceProps = {
  performance: OpsOverview["performance"];
};

type TooltipEntry = {
  name?: string;
  value?: number | string;
  color?: string;
};

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string | number }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1424]/95 px-3.5 py-2.5 shadow-2xl shadow-black/50 backdrop-blur">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      {payload.map((entry, index) => (
        <p className="mt-0.5 text-[13px] font-bold tabular-nums text-white" key={index}>
          {entry.name ? <span className="mr-1.5 inline-block size-2 rounded-full align-middle" style={{ background: entry.color }} /> : null}
          {typeof entry.value === "number" ? `${entry.value} %` : entry.value}
        </p>
      ))}
    </div>
  );
}

function DonutTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1424]/95 px-3.5 py-2.5 shadow-2xl shadow-black/50 backdrop-blur">
      <p className="flex items-center gap-1.5 text-[13px] font-bold text-white">
        <span className="size-2 rounded-full" style={{ background: payload[0].color }} />
        {payload[0].name}
      </p>
      <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-slate-400">{payload[0].value} mission(s)</p>
    </div>
  );
}

export function OpsPerformance({ performance }: OpsPerformanceProps) {
  const totalDelais = performance.delais.reduce((sum, part) => sum + part.value, 0);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <OpsPanel icon="chart" subtitle="12 derniers mois" title="Évolution des missions">
        <div className="h-[240px] w-full">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={performance.missionsSeries} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="opsMissionsFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="label"
                fontSize={10}
                fontWeight={600}
                interval="preserveStartEnd"
                minTickGap={24}
                tick={{ fill: "#64748b" }}
                tickLine={false}
              />
              <YAxis axisLine={false} fontSize={10} fontWeight={600} tick={{ fill: "#64748b" }} tickLine={false} width={30} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.15)", strokeDasharray: "4 4" }} />
              <Area
                activeDot={{ r: 4, fill: "#0d1424", stroke: "#38bdf8", strokeWidth: 2 }}
                animationDuration={900}
                dataKey="value"
                fill="url(#opsMissionsFill)"
                name="Missions"
                stroke="#38bdf8"
                strokeWidth={2.5}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </OpsPanel>

      <OpsPanel
        action={
          <span className="rounded-full border border-[#e3a641]/30 bg-[#e3a641]/10 px-2.5 py-1 text-[10px] font-bold text-[#f2c56d]">
            Moyenne : {performance.avgDurationHours.toLocaleString("fr-FR")} h
          </span>
        }
        icon="clock"
        subtitle="Temps moyen d'exécution par mission"
        title="Performance des équipes"
      >
        <div className="h-[200px] w-full">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={performance.teamPerformance} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <XAxis
                axisLine={false}
                dataKey="name"
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
                tickFormatter={(value: number) => `${value}%`}
                tickLine={false}
                width={36}
                domain={[0, 100]}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar animationDuration={900} dataKey="value" name="Taux de réussite" radius={[6, 6, 0, 0]}>
                {performance.teamPerformance.map((entry) => (
                  <Cell fill={entry.color} key={entry.name} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </OpsPanel>

      <OpsPanel icon="check" subtitle="Missions clôturées" title="Respect des délais">
        <div className="flex h-[190px] items-center">
          <div className="relative h-full w-1/2 min-w-0">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Tooltip content={<DonutTooltip />} />
                <Pie
                  animationDuration={1000}
                  cx="50%"
                  cy="50%"
                  data={performance.delais}
                  dataKey="value"
                  innerRadius="62%"
                  nameKey="name"
                  outerRadius="92%"
                  paddingAngle={3}
                  stroke="none"
                >
                  {performance.delais.map((part) => (
                    <Cell fill={part.color} key={part.name} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <p className="pointer-events-none absolute inset-0 grid place-content-center text-center">
              <span className="text-[20px] font-bold tabular-nums tracking-[-0.04em] text-white">
                {performance.delaisRespect.toLocaleString("fr-FR")} %
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Délais respectés</span>
            </p>
          </div>
          <ul className="w-1/2 space-y-2.5 pl-4">
            {performance.delais.map((part) => {
              const percent = totalDelais > 0 ? Math.round((part.value / totalDelais) * 100) : 0;
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
      </OpsPanel>

      <OpsPanel icon="sparkles" subtitle="Moyenne sur les 30 derniers jours" title="Productivité terrain">
        <div className="flex h-full min-h-[150px] flex-col justify-center">
          <div className="flex items-end gap-5">
            <p className="text-5xl font-extrabold tabular-nums tracking-[-0.04em] text-white">
              {performance.delaisRespect.toLocaleString("fr-FR")}
              <span className="text-2xl text-[#f2c56d]"> %</span>
            </p>
            <div className="pb-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                <Icon name="arrow-up" size={11} />
                +1,6 pt
              </span>
            </div>
          </div>
          <p className="mt-2 max-w-xs text-[11px] leading-5 text-slate-400">
            Taux de réussite global : missions validées sur missions clôturées, tous chantiers confondus.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Temps moyen", value: `${performance.avgDurationHours.toLocaleString("fr-FR")} h` },
              { label: "Équipes", value: "11" },
              { label: "Taux de réussite", value: `${performance.delaisRespect.toLocaleString("fr-FR")} %` },
            ].map((stat) => (
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3" key={stat.label}>
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{stat.label}</p>
                <p className="mt-1 text-[15px] font-extrabold tabular-nums text-white">{stat.value}</p>
              </div>
            ))}
          </div>
          <motion.div
            animate={{ scaleX: 1 }}
            className="mt-4 h-1 origin-left rounded-full bg-gradient-to-r from-[#e3a641] via-[#f2c56d] to-emerald-400"
            initial={{ scaleX: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </OpsPanel>
    </div>
  );
}
