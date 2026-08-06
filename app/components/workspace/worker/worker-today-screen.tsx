"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { WorkerMission, WorkerRanking } from "@/app/lib/worker-data";
import { WorkerMissionCard } from "@/app/components/workspace/worker/worker-mission-card";
import { WorkerRankingCard } from "@/app/components/workspace/worker/worker-ranking";

export function pickActiveMission(missions: WorkerMission[]): WorkerMission | null {
  const priority: Record<string, number> = { EN_COURS: 0, POINTAGE_A_VERIFIER: 1, ACCEPTE: 2, NOTIFIE: 3, RAPPORT_SOUMIS: 4 };
  return (
    [...missions]
      .filter((mission) => mission.statut in priority)
      .sort((a, b) => (priority[a.statut] ?? 9) - (priority[b.statut] ?? 9))[0] ?? null
  );
}

export function pickNextMission(missions: WorkerMission[], activeId: string | null): WorkerMission | null {
  return missions.find((mission) => mission.id !== activeId && mission.statut !== "TERMINE") ?? null;
}

type TodayScreenProps = {
  missions: WorkerMission[];
  ranking: WorkerRanking | null;
  actionSlot: ReactNode;
  onOpenMissions: () => void;
};

export function WorkerTodayScreen({ missions, ranking, actionSlot, onOpenMissions }: TodayScreenProps) {
  const active = pickActiveMission(missions);
  const next = pickNextMission(missions, active?.id ?? null);
  const terminees = missions.filter((mission) => mission.statut === "TERMINE").length;
  const photos = missions.reduce((total, mission) => total + mission.photos, 0);

  return (
    <div className="space-y-5">
      <section aria-label="Mission du jour">
        {active ? (
          <div className="space-y-4">
            <WorkerMissionCard mission={active} variant="hero" />
            <div>{actionSlot}</div>
          </div>
        ) : (
          <div className="grid place-items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-[#0f7a5f]/10 text-[#0f7a5f]">
              <Icon name="hardhat" size={26} />
            </span>
            <div>
              <p className="text-[14px] font-extrabold text-[#16233a]">Aucune mission en cours</p>
              <p className="mt-1 max-w-64 text-[12px] leading-5 text-slate-500">
                Vous serez notifié dès qu&apos;une mission vous sera attribuée.
              </p>
            </div>
            <button
              className="rounded-2xl border border-[#0f7a5f]/30 bg-[#0f7a5f]/5 px-5 py-3 text-[12px] font-extrabold text-[#0f7a5f]"
              onClick={onOpenMissions}
              type="button"
            >
              Voir mes missions planifiées
            </button>
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <motion.div
          animate={{ y: 0, opacity: 1 }}
          className="rounded-3xl border border-slate-200/70 bg-white p-4 shadow-lg shadow-slate-950/[0.04]"
          initial={{ y: 12, opacity: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Missions terminées</p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#0f7a5f]">{terminees}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">sur {missions.length} planifiées</p>
        </motion.div>
        <motion.div
          animate={{ y: 0, opacity: 1 }}
          className="rounded-3xl border border-slate-200/70 bg-white p-4 shadow-lg shadow-slate-950/[0.04]"
          initial={{ y: 12, opacity: 0 }}
          transition={{ delay: 0.16 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Photos envoyées</p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#0f7a5f]">{photos}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">preuves de chantier</p>
        </motion.div>
      </div>

      {next ? (
        <section aria-label="Prochaine mission">
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-slate-400">À venir</h2>
            <button className="text-[11px] font-bold text-[#0f7a5f]" onClick={onOpenMissions} type="button">
              Tout voir
            </button>
          </div>
          <WorkerMissionCard mission={next} />
        </section>
      ) : null}

      {ranking ? <WorkerRankingCard ranking={ranking} /> : null}
    </div>
  );
}
