"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { missionStatutMeta } from "@/app/lib/client-data";
import type { ClientMissionView } from "@/app/lib/client-data";
import type { MissionStatut } from "@/app/lib/contracts";
import { MissionBadge } from "@/app/components/workspace/client/client-status";
import { ClientSection } from "@/app/components/workspace/client/client-section";

const timelineSteps: { label: string; from: MissionStatut[] }[] = [
  { label: "Mission créée", from: ["PLANIFIE", "NOTIFIE", "ACCEPTE", "EN_COURS", "RAPPORT_SOUMIS", "VALIDE", "TERMINE", "POINTAGE_A_VERIFIER"] },
  { label: "Mission acceptée", from: ["ACCEPTE", "EN_COURS", "RAPPORT_SOUMIS", "VALIDE", "TERMINE", "POINTAGE_A_VERIFIER"] },
  { label: "Mission démarrée", from: ["EN_COURS", "RAPPORT_SOUMIS", "VALIDE", "TERMINE", "POINTAGE_A_VERIFIER"] },
  { label: "Rapport soumis", from: ["RAPPORT_SOUMIS", "VALIDE", "TERMINE"] },
  { label: "Mission validée", from: ["VALIDE", "TERMINE"] },
  { label: "Mission terminée", from: ["TERMINE"] },
];

const timelineDates: Record<string, string[]> = {
  dm1: ["28 juillet", "29 juillet", "30 juillet", "—", "—", "—"],
  dm2: ["24 juillet", "25 juillet", "26 juillet", "5 août", "—", "—"],
  dm3: ["20 juillet", "4 août", "—", "—", "—", "—"],
  dm4: ["2 août", "—", "—", "—", "—", "—"],
};

const progressTone: Record<MissionStatut, string> = {
  PLANIFIE: "bg-slate-300",
  NOTIFIE: "bg-sky-500",
  ACCEPTE: "bg-sky-500",
  EN_COURS: "bg-[#e3a641]",
  RAPPORT_SOUMIS: "bg-sky-500",
  VALIDE: "bg-emerald-500",
  TERMINE: "bg-emerald-500",
  POINTAGE_A_VERIFIER: "bg-rose-500",
};

function MissionTimeline({ mission }: { mission: ClientMissionView }) {
  const reduce = useReducedMotion();
  const demoDates = timelineDates[mission.id];
  const dates = demoDates ?? [mission.date !== "—" ? mission.date : "—", "—", "—", "—", "—", "—"];
  const activeIndex = timelineSteps.findIndex((step) => step.from.includes(mission.statut));

  return (
    <ol className="relative mt-2 space-y-0" aria-label="Suivi de la mission">
      {timelineSteps.map((step, index) => {
        const reached = index <= activeIndex;
        const isLast = index === timelineSteps.length - 1;
        return (
          <li className="relative flex gap-4 pb-7 last:pb-0" key={step.label}>
            {!isLast ? (
              <motion.span
                className={"absolute left-[11px] top-6 h-full w-0.5 rounded-full " + (index < activeIndex ? "bg-emerald-400/70" : "bg-slate-200")}
                initial={reduce ? undefined : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.12 }}
                style={{ originY: 0 }}
              />
            ) : null}
            <motion.span
              className={
                "relative z-10 grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold " +
                (reached
                  ? index === activeIndex
                    ? "bg-[#17294b] text-[#f2c56d] ring-4 ring-[#17294b]/10"
                    : "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-400")
              }
              initial={reduce ? undefined : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {reached ? <Icon name={index === activeIndex ? "dots" : "check"} size={index === activeIndex ? 12 : 13} /> : index + 1}
            </motion.span>
            <div className="min-w-0 pt-0.5">
              <p className={"text-xs font-bold " + (reached ? "text-slate-800 dark:text-slate-200" : "text-slate-400")}>{step.label}</p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                {index === activeIndex ? "En cours" : reached ? dates[index] : "À venir"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

type ClientMissionsProps = {
  missions: ClientMissionView[];
};

export function ClientMissions({ missions }: ClientMissionsProps) {
  const [selected, setSelected] = useState<ClientMissionView | null>(null);
  const reduce = useReducedMotion();
  const actives = missions.filter((m) => m.statut !== "TERMINE" && m.statut !== "VALIDE").length;

  return (
    <ClientSection
      action={
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          {actives} mission{actives > 1 ? "s" : ""} active{actives > 1 ? "s" : ""}
        </p>
      }
      icon="hardhat"
      id="portail-missions"
      subtitle="Vos chantiers et interventions, suivis en temps réel"
      title="Mes missions"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
        {missions.length === 0 ? (
          <div className="grid place-items-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center dark:border-white/15 dark:bg-white/[0.03] md:col-span-2 xl:col-span-2 2xl:col-span-4">
            <Icon name="hardhat" size={22} className="text-slate-300" />
            <p className="text-sm font-bold text-[#16233a] dark:text-slate-200">Aucune mission pour le moment</p>
            <p className="max-w-64 text-xs leading-5 text-slate-400">
              Vos interventions apparaîtront ici dès qu&apos;une mission vous sera attribuée.
            </p>
          </div>
        ) : (
        missions.map((mission, index) => {
          const meta = missionStatutMeta[mission.statut];
          return (
            <motion.article
              className="group flex flex-col rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-950/[0.08] dark:border-white/10 dark:bg-[#101c36] dark:shadow-none"
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              key={mission.id}
              transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#17294b]/[0.06] text-[#17294b] transition-colors group-hover:bg-[#17294b] group-hover:text-[#f2c56d] dark:bg-white/[0.06] dark:text-slate-300">
                    <Icon name="hardhat" size={16} />
                  </span>
                  <MissionBadge statut={mission.statut} />
                </div>
                <span className="text-[11px] font-semibold text-slate-400">{mission.date}</span>
              </div>

              <h3 className="mt-4 line-clamp-2 text-[15px] font-bold leading-6 tracking-[-0.02em] text-[#16233a] dark:text-slate-100">
                {mission.titre}
              </h3>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-slate-400">Progression</span>
                  <span className="text-[#16233a] dark:text-slate-300">{mission.progression}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <motion.div
                    className={"h-full rounded-full " + progressTone[mission.statut]}
                    initial={reduce ? undefined : { width: 0 }}
                    animate={{ width: `${mission.progression}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-[11px] font-medium text-slate-500 dark:border-white/5 dark:text-slate-400">
                <p className="flex items-center gap-2">
                  <Icon name="users" size={13} className="text-slate-400" />
                  {mission.equipe}
                </p>
                <p className="flex items-center gap-2">
                  <Icon name="clock" size={13} className="text-slate-400" />
                  {mission.dernierPointage ?? "Pas encore de pointage"}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/5">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {meta.label}
                </span>
                <button
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#17294b] px-3.5 py-2 text-[11px] font-bold text-white transition hover:bg-[#243a61] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17294b]"
                  onClick={() => setSelected(mission)}
                  type="button"
                >
                  Voir <Icon name="arrow-right" size={13} />
                </button>
              </div>
            </motion.article>
          );
        })
        )}
      </div>

      <AnimatePresence>
        {selected ? (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              aria-hidden="true"
              className="pointer-events-auto absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              aria-label="Détail de la mission"
              aria-modal="true"
              className="pointer-events-auto relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/20 bg-white p-6 shadow-2xl sm:p-8 dark:border-white/10 dark:bg-[#0f1a2e]"
              initial={reduce ? undefined : { opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
              role="dialog"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b47e1e]">Suivi de la mission</p>
                <h3 className="mt-1.5 pr-6 text-lg font-bold leading-7 tracking-[-0.03em] text-[#16233a] dark:text-white">
                  {selected.titre}
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <MissionBadge statut={selected.statut} />
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                    {selected.date}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                    {selected.equipe}
                  </span>
                </div>
              </div>
              <button
                aria-label="Fermer"
                className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() => setSelected(null)}
                type="button"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Progression</span>
                <span className="text-[#16233a] dark:text-slate-200">{selected.progression}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                <motion.div
                  className={"h-full rounded-full " + progressTone[selected.statut]}
                  initial={reduce ? undefined : { width: 0 }}
                  animate={{ width: `${selected.progression}%` }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Étapes de la mission</p>
              <div className="mt-4">
                <MissionTimeline mission={selected} />
              </div>
            </div>
          </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </ClientSection>
  );
}
