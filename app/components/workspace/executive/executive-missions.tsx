"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import { missionStatutMeta } from "@/app/lib/executive-data";
import type { ExecutiveMission } from "@/app/lib/executive-data";

type ExecutiveMissionsProps = {
  missions: ExecutiveMission[];
  counters: { label: string; count: number; tone: "neutral" | "info" | "success" | "danger" }[];
};

const counterTones = {
  neutral: "bg-slate-100 text-slate-600",
  info: "bg-sky-50 text-sky-700",
  success: "bg-emerald-50 text-emerald-700",
  danger: "bg-red-50 text-red-700",
} as const;

export function ExecutiveMissions({ missions, counters }: ExecutiveMissionsProps) {
  const reduce = useReducedMotion();

  return (
    <ExecutivePanel
      action={
        <Link
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3e638e] transition hover:text-[#17294b]"
          href="/espace/missions"
        >
          Toutes les missions <Icon name="arrow-right" size={14} />
        </Link>
      }
      icon="map"
      subtitle="Suivi des chantiers en temps réel"
      title="Carte des missions"
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {counters.map((counter) => (
          <span
            className={"inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold " + counterTones[counter.tone]}
            key={counter.label}
          >
            <span className="text-sm">{counter.count}</span>
            {counter.label}
          </span>
        ))}
      </div>

      <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {missions.map((mission, index) => {
          const meta = missionStatutMeta[mission.statut];
          return (
            <motion.li
              className="group rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-md"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              key={mission.id}
              transition={{ duration: 0.4, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-bold text-[#16233a]">{mission.title}</p>
                <span className={"shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold " + meta.classes}>
                  {mission.statut}
                </span>
              </div>
              <p className="mt-0.5 font-mono text-[10px] font-semibold text-slate-400">{mission.id}</p>
              <dl className="mt-3 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <Icon className="text-slate-400" name="users" size={12} />
                  <dt className="sr-only">Client</dt>
                  <dd className="truncate font-medium text-slate-600">{mission.client}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Icon className="text-slate-400" name="map" size={12} />
                  <dt className="sr-only">Lieu</dt>
                  <dd className="truncate text-slate-500">{mission.location}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Icon className="text-slate-400" name="building" size={12} />
                  <dt className="sr-only">Filiale</dt>
                  <dd className="truncate text-slate-500">{mission.filiale}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Icon className="text-slate-400" name="calendar" size={12} />
                  <dt className="sr-only">Date</dt>
                  <dd className="text-slate-500">{mission.date}</dd>
                </div>
              </dl>
            </motion.li>
          );
        })}
      </ul>
    </ExecutivePanel>
  );
}
