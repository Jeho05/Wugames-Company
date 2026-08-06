"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { BranchMissionRow } from "@/app/lib/branch-data";
import { statutLabelOf } from "@/app/lib/branch-data";

type BranchMissionsProps = {
  missions: BranchMissionRow[];
};

const statutTone: Record<string, string> = {
  PLANIFIE: "border-slate-200 bg-slate-50 text-slate-600",
  NOTIFIE: "border-sky-200 bg-sky-50 text-sky-700",
  ACCEPTE: "border-teal-200 bg-teal-50 text-teal-700",
  EN_COURS: "border-blue-200 bg-blue-50 text-blue-700",
  RAPPORT_SOUMIS: "border-violet-200 bg-violet-50 text-violet-700",
  POINTAGE_A_VERIFIER: "border-orange-200 bg-orange-50 text-orange-700",
  VALIDE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  TERMINE: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function BranchMissions({ missions }: BranchMissionsProps) {
  return (
    <ExecutivePanel
      action={
        <Link
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
          href="/espace/missions"
        >
          <Icon name="arrow-up-right" size={12} />
          Toutes les missions
        </Link>
      }
      icon="hardhat"
      subtitle="Supervision en lecture — statut, pointages et photos"
      title="Missions de la filiale"
    >
      {missions.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
          <span className="grid size-10 place-items-center rounded-2xl bg-sky-50 text-sky-600">
            <Icon name="hardhat" size={18} />
          </span>
          <p className="mt-3 text-[12px] font-bold text-[#16233a]">Aucune mission active aujourd&apos;hui</p>
          <p className="mt-1 text-[11px] text-slate-500">Les prochaines missions apparaîtront ici dès leur planification.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                <th className="pb-2.5 pr-3">Mission</th>
                <th className="pb-2.5 pr-3">Client</th>
                <th className="pb-2.5 pr-3">Ouvrier</th>
                <th className="pb-2.5 pr-3">Planifiée</th>
                <th className="pb-2.5 pr-3">Progression</th>
                <th className="pb-2.5 pr-3">Pointage</th>
                <th className="pb-2.5 pr-3">Statut</th>
                <th className="pb-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {missions.map((mission, index) => {
                const tone = statutTone[mission.statut] ?? "border-slate-200 bg-slate-50 text-slate-600";
                return (
                  <tr className="group border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/70" key={mission.id}>
                    <td className="py-3.5 pr-3">
                      <p className="text-[12px] font-bold text-[#16233a]">{mission.titre}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400">
                        {mission.lieu}
                        {mission.retard ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                            <Icon name="warning" size={10} />
                            En retard
                          </span>
                        ) : null}
                        {mission.anomalieGps ? (
                          <span className="inline-flex items-center gap-1 font-bold text-orange-600">
                            <Icon name="map" size={10} />
                            Anomalie GPS
                          </span>
                        ) : null}
                      </p>
                    </td>
                    <td className="py-3.5 pr-3 text-[11px] font-semibold text-slate-600">{mission.client}</td>
                    <td className="py-3.5 pr-3 text-[11px] text-slate-500">{mission.ouvrier}</td>
                    <td className="py-3.5 pr-3 text-[11px] tabular-nums text-slate-500">{mission.date}</td>
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200/70">
                          <motion.div
                            animate={{ width: `${mission.progression}%` }}
                            className={"h-full rounded-full " + (mission.progression >= 70 ? "bg-emerald-500" : "bg-[#0e9f9b]")}
                            initial={{ width: 0 }}
                            transition={{ delay: 0.15 + index * 0.04, duration: 0.6 }}
                          />
                        </div>
                        <span className="text-[10px] font-bold tabular-nums text-slate-500">{mission.progression} %</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-3">
                      <p className="text-[10px] font-semibold text-slate-500">{mission.dernierPointage ?? "Aucun pointage"}</p>
                      <p className="text-[10px] text-slate-400">{mission.photos} photo{mission.photos > 1 ? "s" : ""}</p>
                    </td>
                    <td className="py-3.5 pr-3">
                      <span className={"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold " + tone}>
                        <span className="size-1.5 rounded-full bg-current" />
                        {statutLabelOf(mission.statut)}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          aria-label={`Voir la mission ${mission.titre}`}
                          className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
                          href={`/espace/missions?id=${mission.id}`}
                          title="Voir la mission"
                        >
                          <Icon name="arrow-up-right" size={13} />
                        </Link>
                        <Link
                          aria-label={`Voir les pointages de ${mission.titre}`}
                          className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
                          href={`/espace/missions?id=${mission.id}&onglet=pointages`}
                          title="Voir les pointages"
                        >
                          <Icon name="map" size={13} />
                        </Link>
                        <Link
                          aria-label={`Voir les photos de ${mission.titre}`}
                          className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
                          href={`/espace/missions?id=${mission.id}&onglet=photos`}
                          title="Voir les photos"
                        >
                          <Icon name="camera" size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ExecutivePanel>
  );
}
