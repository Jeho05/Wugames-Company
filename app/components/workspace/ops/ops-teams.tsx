"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { OpsPanel } from "@/app/components/workspace/ops/ops-panel";
import type { OpsTeam } from "@/app/lib/ops-data";

type OpsTeamsProps = {
  teams: OpsTeam[];
};

function initialsOf(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}

export function OpsTeams({ teams }: OpsTeamsProps) {
  return (
    <OpsPanel
      action={
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300">
          {teams.length} équipes
        </span>
      }
      icon="users"
      subtitle="État des équipes sur le terrain"
      title="Suivi des équipes"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {teams.map((team, index) => {
          const disponible = team.statut === "Disponible";
          return (
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition duration-200 hover:border-white/[0.12] hover:bg-white/[0.04]"
              initial={{ opacity: 0, y: 16 }}
              key={team.id}
              transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${team.couleur}66, transparent)` }} />
              <div className="flex items-center gap-3">
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-xl text-[12px] font-extrabold text-[#0b1020]"
                  style={{ background: team.couleur }}
                >
                  {initialsOf(team.nom)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-white">{team.nom}</p>
                  <p className="truncate text-[10px] text-slate-400">Chef : {team.chef}</p>
                </div>
                <span
                  className={
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[8px] font-bold " +
                    (disponible
                      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                      : team.statut === "En retard"
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                        : "border-sky-400/25 bg-sky-400/10 text-sky-300")
                  }
                >
                  <span className={"size-1.5 rounded-full " + (disponible ? "bg-emerald-400" : team.statut === "En retard" ? "bg-rose-500" : "bg-sky-400")} />
                  {team.statut}
                </span>
              </div>

              <div className="mt-3.5 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Icon name="hardhat" size={11} />
                  {team.membres} membres
                </span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Icon name="clock" size={11} />
                  {team.elapsed}
                </span>
              </div>

              <p className="mt-2 truncate text-[11px] font-bold text-slate-200">{team.missionActuelle}</p>

              <div className="mt-2.5">
                <div className="mb-1 flex items-center justify-between text-[9px] font-semibold text-slate-500">
                  <span>Progression mission</span>
                  <span className="tabular-nums text-slate-300">{team.progression} %</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <motion.div
                    animate={{ width: `${team.progression}%` }}
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    style={{ background: team.couleur }}
                    transition={{ delay: 0.2 + index * 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </OpsPanel>
  );
}
