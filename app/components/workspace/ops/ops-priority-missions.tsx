"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { OpsPanel } from "@/app/components/workspace/ops/ops-panel";
import type { OpsMissionRow } from "@/app/lib/ops-data";

type OpsPriorityMissionsProps = {
  missions: OpsMissionRow[];
};

const prioriteMeta: Record<OpsMissionRow["priorite"], { label: string; badge: string; dot: string }> = {
  urgente: { label: "Urgente", badge: "border-rose-500/30 bg-rose-500/10 text-rose-300", dot: "bg-rose-500" },
  haute: { label: "Haute", badge: "border-amber-400/25 bg-amber-400/10 text-amber-300", dot: "bg-amber-400" },
  moyenne: { label: "Moyenne", badge: "border-sky-400/25 bg-sky-400/10 text-sky-300", dot: "bg-sky-400" },
  normale: { label: "Normale", badge: "border-white/10 bg-white/5 text-slate-300", dot: "bg-slate-400" },
};

const toneBadge: Record<OpsMissionRow["tone"], string> = {
  danger: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  info: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  success: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  neutral: "border-white/10 bg-white/5 text-slate-300",
};

export function OpsPriorityMissions({ missions }: OpsPriorityMissionsProps) {
  return (
    <OpsPanel
      action={
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300">
          {missions.length} prioritaires
        </span>
      }
      icon="hardhat"
      subtitle="Triées par urgence · temps réel"
      title="Missions prioritaires"
    >
      <ul className="space-y-2">
        {missions.map((mission, index) => {
          const priorite = prioriteMeta[mission.priorite];
          return (
            <motion.li
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition hover:border-white/[0.12] hover:bg-white/[0.04] sm:flex-nowrap"
              initial={{ opacity: 0, y: 14 }}
              key={mission.id}
              transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="min-w-0 flex-1 basis-44">
                <p className="truncate text-[12px] font-bold text-white">{mission.titre}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="users" size={10} />
                    {mission.client}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="map" size={10} />
                    {mission.lieu}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="hardhat" size={10} />
                    {mission.chef}
                  </span>
                </p>
              </div>

              <span className="font-mono text-[11px] font-bold tabular-nums text-slate-300">{mission.heure}</span>

              <span className={"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold " + priorite.badge}>
                <span className={"size-1.5 rounded-full " + priorite.dot} />
                {priorite.label}
              </span>

              <div className="w-28 shrink-0">
                <div className="mb-1 flex items-center justify-between text-[9px] font-semibold text-slate-400">
                  <span>Progression</span>
                  <span className="tabular-nums text-slate-200">{mission.progression} %</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <motion.div
                    animate={{ width: `${mission.progression}%` }}
                    className={"h-full rounded-full " + (mission.tone === "danger" ? "bg-rose-500" : mission.tone === "info" ? "bg-sky-400" : "bg-emerald-400")}
                    initial={{ width: 0 }}
                    transition={{ delay: 0.2 + index * 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              <span className={"inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold " + toneBadge[mission.tone]}>
                {mission.statut}
              </span>

              <Link
                aria-label={`Voir la mission ${mission.titre}`}
                className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:border-[#e3a641]/40 hover:text-[#f2c56d]"
                href="/espace/missions"
              >
                <Icon name="arrow-up-right" size={14} />
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </OpsPanel>
  );
}
