"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { EvalRankingRow } from "@/app/lib/branch-data";

type BranchEvaluationsProps = {
  ranking: EvalRankingRow[];
  radar: { critere: string; moyenne: number }[];
};

const evolutionMeta: Record<EvalRankingRow["evolution"], { icon: "arrow-up" | "arrow-down" | "minus"; chip: string }> = {
  up: { icon: "arrow-up", chip: "bg-emerald-50 text-emerald-700" },
  down: { icon: "arrow-down", chip: "bg-rose-50 text-rose-700" },
  stable: { icon: "minus", chip: "bg-slate-100 text-slate-600" },
};

export function BranchEvaluations({ ranking, radar }: BranchEvaluationsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ExecutivePanel
        action={
          <Link
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
            href="/espace/evaluations?creer=1"
          >
            <Icon name="plus" size={12} />
            Nouvelle évaluation
          </Link>
        }
        icon="chart"
        subtitle="Cycle en cours · total sur 360 · rendement 9S"
        title="Classement de la filiale"
      >
        <ol className="space-y-2">
          {ranking.map((row, index) => {
            const meta = evolutionMeta[row.evolution];
            return (
              <motion.li
                animate={{ opacity: 1, x: 0 }}
                className={
                  "flex items-center gap-3 rounded-2xl border p-3.5 transition " +
                  (index === 0 ? "border-amber-200 bg-gradient-to-r from-amber-50/80 to-transparent" : "border-slate-100 bg-slate-50/60 hover:bg-white")
                }
                initial={{ opacity: 0, x: -14 }}
                key={row.id}
                transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <span
                  className={
                    "grid size-8 shrink-0 place-items-center rounded-xl text-[12px] font-extrabold " +
                    (index === 0
                      ? "bg-gradient-to-br from-[#e3a641] to-[#d19331] text-white shadow-md shadow-amber-500/30"
                      : index === 1
                        ? "bg-slate-200 text-slate-700"
                        : index === 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-slate-100 text-slate-500")
                  }
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-bold text-[#16233a]">{row.personne}</p>
                  <p className="text-[10px] text-slate-400">
                    {row.total}/360 · rendement 9S {row.rendement} %
                  </p>
                </div>
                <div className="w-24 shrink-0">
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/70">
                    <motion.div
                      animate={{ width: `${(row.rendement / 100) * 100}%` }}
                      className={"h-full rounded-full " + (row.rendement >= 70 ? "bg-[#0e9f9b]" : "bg-amber-500")}
                      initial={{ width: 0 }}
                      transition={{ delay: 0.2 + index * 0.06, duration: 0.6 }}
                    />
                  </div>
                </div>
                <span className={"inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold " + meta.chip}>
                  <Icon name={meta.icon} size={10} />
                  {row.evolution === "up" ? "+" : row.evolution === "down" ? "−" : "="}
                </span>
              </motion.li>
            );
          })}
        </ol>
      </ExecutivePanel>

      <ExecutivePanel
        action={
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
            Moyennes de la filiale
          </span>
        }
        icon="shield"
        subtitle="Notes S1 à S9 · chacune entre 0 et 40"
        title="Radar 9S"
      >
        <div className="h-[300px] w-full">
          <ResponsiveContainer height="100%" width="100%">
            <RadarChart data={radar} margin={{ top: 8, right: 8, bottom: 8, left: 8 }} outerRadius="72%">
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="critere"
                fontSize={9}
                fontWeight={700}
                tick={{ fill: "#64748b" }}
              />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload && payload.length > 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-xl shadow-slate-950/10 backdrop-blur">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                      <p className="mt-0.5 text-[13px] font-bold text-[#0f2a52]">
                        {typeof payload[0].value === "number" ? `${payload[0].value}/40` : payload[0].value}
                      </p>
                    </div>
                  ) : null
                }
              />
              <Radar
                animationDuration={900}
                dataKey="moyenne"
                fill="#0e9f9b"
                fillOpacity={0.25}
                name="Moyenne"
                stroke="#0e9f9b"
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-[10px] text-slate-400">
          Rendement 9S calculé automatiquement · rang attribué sur la filiale uniquement
        </p>
      </ExecutivePanel>
    </div>
  );
}
