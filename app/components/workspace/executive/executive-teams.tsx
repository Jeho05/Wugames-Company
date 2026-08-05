"use client";

import { motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { ExecutiveTeam } from "@/app/lib/executive-data";

type ExecutiveTeamsProps = {
  teams: ExecutiveTeam[];
};

const avatarTiles = [
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
];

export function ExecutiveTeams({ teams }: ExecutiveTeamsProps) {
  const reduce = useReducedMotion();
  const maxScore = Math.max(...teams.map((team) => team.score));

  return (
    <ExecutivePanel
      icon="hardhat"
      subtitle="Classement du trimestre"
      title="Performance des équipes"
    >
      <ol className="space-y-3">
        {teams.map((team, index) => {
          const initials = team.nom
            .replace("Équipe ", "")
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <motion.li
              className="group flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition-all duration-200 hover:border-slate-200 hover:bg-white hover:shadow-md"
              initial={reduce ? false : { opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              key={team.id}
              transition={{ duration: 0.45, delay: 0.06 * index, ease: [0.22, 1, 0.36, 1] }}
            >
              <span
                className={
                  "grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-extrabold " +
                  (avatarTiles[index % avatarTiles.length] ?? avatarTiles[0])
                }
              >
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[13px] font-bold text-[#16233a]">
                    <span className="mr-1.5 text-[11px] font-extrabold text-slate-300">#{index + 1}</span>
                    {team.nom}
                  </p>
                  <span className="text-[13px] font-extrabold tracking-tight text-[#17294b]">{team.score}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2.5">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/70">
                    <motion.div
                      animate={{ width: `${(team.score / maxScore) * 100}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-[#17294b] to-[#3e638e]"
                      initial={reduce ? false : { width: 0 }}
                      transition={{ duration: 0.9, delay: 0.25 + 0.06 * index, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span
                    className={
                      "inline-flex items-center gap-0.5 text-[10px] font-bold " +
                      (team.progression >= 0 ? "text-emerald-600" : "text-red-600")
                    }
                  >
                    <Icon
                      className={team.progression < 0 ? "rotate-180" : undefined}
                      name="arrow-up-right"
                      size={10}
                    />
                    {Math.abs(team.progression).toLocaleString("fr-FR")} %
                  </span>
                </div>
              </div>
              <span className="hidden shrink-0 rounded-full border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold text-slate-500 sm:inline">
                {team.membres} pers.
              </span>
            </motion.li>
          );
        })}
      </ol>
    </ExecutivePanel>
  );
}
