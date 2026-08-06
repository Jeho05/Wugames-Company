"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { WorkerMission } from "@/app/lib/worker-data";
import { formatDistance, statutLabels } from "@/app/lib/worker-data";

type WorkerMissionCardProps = {
  mission: WorkerMission;
  variant?: "hero" | "compact";
};

const statutColor: Record<string, string> = {
  PLANIFIE: "bg-slate-100 text-slate-600 border-slate-200",
  NOTIFIE: "bg-sky-50 text-sky-700 border-sky-200",
  ACCEPTE: "bg-indigo-50 text-indigo-700 border-indigo-200",
  EN_COURS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  POINTAGE_A_VERIFIER: "bg-amber-50 text-amber-700 border-amber-200",
  RAPPORT_SOUMIS: "bg-violet-50 text-violet-700 border-violet-200",
  VALIDE: "bg-teal-50 text-teal-700 border-teal-200",
  TERMINE: "bg-slate-100 text-slate-500 border-slate-200",
};

export function statutBadge(mission: WorkerMission) {
  return (
    <span className={"rounded-full border px-2.5 py-1 text-[9px] font-extrabold " + (statutColor[mission.statut] ?? statutColor.PLANIFIE)}>
      {statutLabels[mission.statut] ?? mission.statut}
    </span>
  );
}

function stepperState(mission: WorkerMission): { label: string; done: boolean }[] {
  const active = ["ACCEPTE", "EN_COURS", "POINTAGE_A_VERIFIER", "RAPPORT_SOUMIS", "VALIDE", "TERMINE"].includes(mission.statut);
  const arrivee = mission.arrivagePointee || ["EN_COURS", "POINTAGE_A_VERIFIER", "RAPPORT_SOUMIS", "VALIDE", "TERMINE"].includes(mission.statut);
  const travail = mission.photos > 0 || ["RAPPORT_SOUMIS", "VALIDE", "TERMINE"].includes(mission.statut);
  const validation = ["VALIDE", "TERMINE"].includes(mission.statut);
  const terminee = mission.statut === "TERMINE";
  return [
    { label: "Accepter", done: active },
    { label: "Arrivée", done: arrivee },
    { label: "Travail", done: travail },
    { label: "Validation", done: validation },
    { label: "Terminée", done: terminee },
  ];
}

function checklist(mission: WorkerMission): { label: string; done: boolean }[] {
  const rapportFait = ["RAPPORT_SOUMIS", "VALIDE", "TERMINE"].includes(mission.statut);
  return [
    { label: "Pointage d'arrivée effectué", done: mission.arrivagePointee },
    { label: "Au moins une photo jointe", done: mission.photos > 0 },
    { label: "Rapport soumis", done: rapportFait },
    { label: "Pointage de sortie effectué", done: mission.sortiePointee },
  ];
}

export function MissionMap({ mission }: { mission: WorkerMission }) {
  if (mission.lat === null || mission.lng === null) {
    return (
      <div className="grid place-items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-center">
        <Icon className="text-slate-400" name="map" size={18} />
        <p className="text-[11px] font-bold text-slate-500">Localisation du chantier</p>
        <p className="text-[10px] text-slate-400">La zone sera définie lors du premier pointage.</p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="relative h-24 bg-gradient-to-br from-emerald-50 via-sky-50 to-slate-100">
        <svg className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 200 96">
          <path d="M0 68 Q 40 52 80 62 T 200 58" fill="none" stroke="#cbd5e1" strokeWidth="2" />
          <path d="M0 80 Q 60 70 120 78 T 200 74" fill="none" stroke="#e2e8f0" strokeWidth="2" />
          <rect fill="#ffffff" height="26" opacity="0.7" width="26" x="24" y="34" />
          <rect fill="#ffffff" height="18" opacity="0.7" width="30" x="140" y="22" />
          <rect fill="#ffffff" height="14" opacity="0.7" width="22" x="118" y="66" />
        </svg>
        <motion.span
          animate={{ y: [0, -3, 0] }}
          className="absolute left-1/2 top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#0f7a5f] text-white shadow-lg shadow-emerald-900/30 ring-4 ring-white"
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon name="map" size={16} />
        </motion.span>
      </div>
      <div className="flex items-center justify-between gap-3 bg-white px-3.5 py-2.5">
        <p className="truncate text-[11px] font-bold text-[#16233a]">{mission.adresse}</p>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
          Rayon {formatDistance(mission.rayonMetres)}
        </span>
      </div>
    </div>
  );
}

export function WorkerMissionCard({ mission, variant = "compact" }: WorkerMissionCardProps) {
  if (variant === "compact") {
    return (
      <article className="rounded-3xl border border-slate-200/70 bg-white p-4 shadow-lg shadow-slate-950/[0.05]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-extrabold text-[#16233a]">{mission.titre}</h3>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-400">
              {mission.client} · {mission.adresse}
            </p>
          </div>
          {statutBadge(mission)}
        </div>
        <div className="mt-3.5 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              animate={{ width: `${mission.progression}%` }}
              className="h-full rounded-full bg-[#0f7a5f]"
              initial={{ width: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span className="text-[10px] font-bold tabular-nums text-slate-400">{mission.progression} %</span>
        </div>
        <div className="mt-3 flex items-center gap-3 text-[10px] font-semibold text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Icon name="calendar" size={11} />
            {mission.datePlanifiee}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="camera" size={11} />
            {mission.photos} photo{mission.photos > 1 ? "s" : ""}
          </span>
          {mission.dernierPointage ? (
            <span className="ml-auto inline-flex items-center gap-1 text-[#0f7a5f]">
              <Icon name="clock" size={11} />
              {mission.dernierPointage}
            </span>
          ) : null}
        </div>
      </article>
    );
  }

  const steps = stepperState(mission);
  const items = checklist(mission);

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-xl shadow-slate-950/[0.06]">
      <div className="bg-gradient-to-br from-[#0f7a5f] via-[#0e6e57] to-[#0c5f4b] p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-emerald-200">Mission en cours</p>
            <h2 className="mt-1 truncate text-[18px] font-extrabold leading-7">{mission.titre}</h2>
            <p className="mt-1 text-[11px] font-semibold text-emerald-100/90">
              {mission.client} · {mission.filiale}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {statutBadge(mission)}
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold">
            <Icon name="calendar" size={10} />
            {mission.datePlanifiee}
          </span>
          {mission.contact ? (
            <a
              className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold"
              href={`tel:${mission.contact}`}
            >
              <Icon name="message" size={10} />
              {mission.contact}
            </a>
          ) : null}
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-100/80">
            <span>Avancement</span>
            <span className="tabular-nums">{mission.progression} %</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
            <motion.div
              animate={{ width: `${mission.progression}%` }}
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-200"
              initial={{ width: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
        <ol className="mt-5 grid grid-cols-5 gap-1">
          {steps.map((step, index) => (
            <li className="flex flex-col items-center gap-1.5 text-center" key={step.label}>
              <span
                className={
                  "grid size-6 place-items-center rounded-full text-[9px] font-extrabold " +
                  (step.done ? "bg-amber-300 text-[#0c4a3a]" : index === steps.findIndex((s) => !s.done) ? "bg-white/25 text-white" : "bg-white/10 text-white/50")
                }
              >
                {step.done ? <Icon name="check" size={11} /> : index + 1}
              </span>
              <span className={"text-[8px] font-bold leading-tight " + (step.done ? "text-amber-100" : "text-emerald-100/60")}>{step.label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-4 p-5">
        {mission.description ? <p className="text-[12px] leading-6 text-slate-500">{mission.description}</p> : null}

        <section aria-label="Localisation du chantier">
          <MissionMap mission={mission} />
          {mission.lat !== null && mission.lng !== null ? (
            <a
              className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-2.5 text-[11px] font-bold text-[#0f7a5f] transition active:scale-[0.98]"
              href={`https://www.google.com/maps/dir/?api=1&destination=${mission.lat},${mission.lng}`}
              rel="noreferrer"
              target="_blank"
            >
              <Icon name="arrow-up-right" size={13} />
              Ouvrir l&apos;itinéraire dans Maps
            </a>
          ) : null}
        </section>

        <section aria-label="Checklist de la mission">
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Checklist</h3>
          <ul className="mt-2.5 space-y-2">
            {items.map((item) => (
              <li className="flex items-center gap-2.5" key={item.label}>
                <span
                  className={
                    "grid size-5 shrink-0 place-items-center rounded-full " +
                    (item.done ? "bg-[#0f7a5f] text-white" : "border-2 border-slate-200 text-transparent")
                  }
                >
                  <Icon name="check" size={10} />
                </span>
                <span className={"text-[12px] " + (item.done ? "font-bold text-[#16233a]" : "text-slate-400")}>{item.label}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}
