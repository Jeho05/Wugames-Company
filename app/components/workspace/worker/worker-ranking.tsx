"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { WorkerRanking } from "@/app/lib/worker-data";

type WorkerRankingCardProps = {
  ranking: WorkerRanking;
};

const encouragement: Record<WorkerRanking["evolution"], string> = {
  up: "Vous avez gagné des positions. Continuez ainsi !",
  down: "Repartez sur de bonnes bases ce cycle. Objectif : remonter.",
  stable: "Vous restez solide. Le prochain cycle peut vous faire passer devant.",
};

export function WorkerRankingCard({ ranking }: WorkerRankingCardProps) {
  const top = ranking.rang === 1;

  return (
    <section aria-label="Mon classement" className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-lg shadow-slate-950/[0.05]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Mon rendement</p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{ranking.cycle}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
          <Icon name="arrow-up" size={10} />
          {ranking.evolution === "up" ? `+${ranking.positions}` : ranking.evolution === "down" ? "−" : "="}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-5">
        <div className="relative grid size-24 shrink-0 place-items-center">
          <svg aria-label={`Rendement 9S : ${ranking.rendement} %`} className="size-24 -rotate-90" role="img" viewBox="0 0 100 100">
            <circle cx="50" cy="50" fill="none" r="42" stroke="#e2e8f0" strokeWidth="9" />
            <motion.circle
              animate={{ strokeDashoffset: 2 * Math.PI * 42 - (ranking.rendement / 100) * 2 * Math.PI * 42 }}
              cx="50"
              cy="50"
              fill="none"
              r="42"
              stroke="#0f7a5f"
              strokeDasharray={2 * Math.PI * 42}
              strokeLinecap="round"
              strokeWidth="9"
              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <div className="absolute inset-0 grid place-content-center text-center">
            <p className="text-xl font-extrabold tabular-nums text-[#0e2e24]">{ranking.rendement} %</p>
            <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">9S</p>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-bold text-[#16233a]">
            {top ? "1ᵉʳ du classement de la filiale 🎉" : `Position ${ranking.rang} sur ${ranking.totalParticipants}`}
          </p>
          <p className="mt-1 text-[11px] leading-5 text-slate-500">{encouragement[ranking.evolution]}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-700">
            <Icon name="sparkles" size={11} />
            {ranking.meilleureNote}
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-[10px] text-slate-400">
        Objectif du prochain cycle : {Math.min(ranking.rendement + 4, 99)} % — le classement est consulté, jamais modifiable par vos soins.
      </p>
    </section>
  );
}
