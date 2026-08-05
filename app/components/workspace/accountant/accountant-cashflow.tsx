"use client";

import { useMemo, useState } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "motion/react";

import { AccountantPanel } from "@/app/components/workspace/accountant/accountant-panel";
import { formatFcfaCompact } from "@/app/lib/accountant-data";
import type { AccountantOverview } from "@/app/lib/accountant-data";

type AccountantCashflowProps = {
  cashflow: AccountantOverview["cashflow"];
};

type Mode = "daily" | "monthly" | "forecast";

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
          {entry.name ? (
            <span className="mr-1.5 inline-block size-2 rounded-full align-middle" style={{ background: entry.color }} />
          ) : null}
          {typeof entry.value === "number" ? `${formatFcfaCompact(entry.value * 1_000_000)}` : entry.value}
        </p>
      ))}
    </div>
  );
}

const modeMeta: Record<Mode, { label: string; subtitle: string }> = {
  daily: { label: "Journalier", subtitle: "Flux quotidiens · 30 derniers jours" },
  monthly: { label: "Mensuel", subtitle: "Moyenne mensuelle · 12 derniers mois" },
  forecast: { label: "Prévision", subtitle: "Extrapolation à 7 jours" },
};

export function AccountantCashflow({ cashflow }: AccountantCashflowProps) {
  const [mode, setMode] = useState<Mode>("monthly");

  const data = useMemo(() => {
    if (mode === "daily") {
      return cashflow.daily.map((point) => ({ label: point.label, valeur: point.valeur, valeurV: null as number | null }));
    }
    if (mode === "monthly") {
      return cashflow.monthly.map((point) => ({ label: point.label, valeur: point.valeur, valeurV: null as number | null }));
    }
    return [...cashflow.daily.slice(-7), ...cashflow.forecast].map((point) =>
      point.foret
        ? { label: point.label, valeur: null as number | null, valeurV: point.valeur }
        : { label: point.label, valeur: point.valeur, valeurV: null as number | null },
    );
  }, [cashflow, mode]);

  const lastReal = data.filter((point) => point.valeur !== null).slice(-1)[0];

  return (
    <AccountantPanel
      action={
        <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.04] p-1">
          {(Object.keys(modeMeta) as Mode[]).map((key) => (
            <button
              aria-pressed={mode === key}
              className={
                "relative rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors " +
                (mode === key ? "text-white" : "text-slate-400 hover:text-slate-200")
              }
              key={key}
              onClick={() => setMode(key)}
              type="button"
            >
              {mode === key ? (
                <motion.span
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-lg bg-[#e3a641]"
                  initial={{ opacity: 0 }}
                  layoutId="cashflow-segment"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              ) : null}
              <span className="relative z-10">{modeMeta[key].label}</span>
            </button>
          ))}
        </div>
      }
      icon="chart"
      subtitle={modeMeta[mode].subtitle}
      title="Trésorerie & flux financiers"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] text-slate-400">
          {mode === "forecast"
            ? "Réel (7 derniers jours) + projection"
            : "Valeurs en millions de FCFA"}
        </p>
        {lastReal?.valeur !== null && lastReal ? (
          <p className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-300">
            Dernier flux réel
            <span className="rounded-lg border border-[#e3a641]/30 bg-[#e3a641]/10 px-2 py-0.5 font-extrabold tabular-nums text-[#f2c56d]">
              {formatFcfaCompact(lastReal.valeur * 1_000_000)}
            </span>
          </p>
        ) : null}
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="cashFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#e3a641" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#e3a641" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="label"
              fontSize={11}
              fontWeight={600}
              interval="preserveStartEnd"
              minTickGap={28}
              tick={{ fill: "#64748b" }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              fontSize={11}
              fontWeight={600}
              tick={{ fill: "#64748b" }}
              tickFormatter={(value: number) => `${value} M`}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.15)", strokeDasharray: "4 4" }} />
            <Area
              activeDot={{ r: 5, fill: "#0d1424", stroke: "#e3a641", strokeWidth: 2 }}
              animationDuration={900}
              connectNulls
              dataKey="valeur"
              fill="url(#cashFill)"
              name="Flux réel"
              stroke="#e3a641"
              strokeWidth={2.5}
              type="monotone"
            />
            <Line
              animationDuration={900}
              connectNulls
              dataKey="valeurV"
              dot={{ r: 3, fill: "#0d1424", stroke: "#38bdf8", strokeWidth: 2 }}
              name="Prévision"
              stroke="#38bdf8"
              strokeDasharray="6 4"
              strokeWidth={2}
              type="monotone"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </AccountantPanel>
  );
}
