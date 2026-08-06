"use client";

import { useState } from "react";
import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { MissionStatut } from "@/app/lib/contracts";
import type { BranchMapMission } from "@/app/lib/branch-data";

type BranchMapProps = {
  missions: BranchMapMission[];
};

const markerColor: Record<MissionStatut, string> = {
  PLANIFIE: "#94a3b8",
  NOTIFIE: "#38bdf8",
  ACCEPTE: "#14b8a6",
  EN_COURS: "#2563eb",
  RAPPORT_SOUMIS: "#8b5cf6",
  POINTAGE_A_VERIFIER: "#f97316",
  VALIDE: "#10b981",
  TERMINE: "#10b981",
};

function project(missions: BranchMapMission[]): { x: number; y: number }[] {
  const lats = missions.map((m) => m.lat);
  const lngs = missions.map((m) => m.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const span = Math.max(maxLat - minLat, maxLng - minLng, 0.01);
  return missions.map((m) => {
    const x = 8 + ((m.lng - minLng) / span) * 84 + (m.lng - minLng === 0 ? 0 : 0);
    const y = 10 + ((maxLat - m.lat) / span) * 80;
    return { x, y };
  });
}

export function BranchMap({ missions }: BranchMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = missions.find((mission) => mission.id === selectedId) ?? null;
  const points = project(missions);

  return (
    <ExecutivePanel
      action={
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
          {missions.length} chantier(s) localisé(s)
        </span>
      }
      icon="map"
      subtitle="Position des chantiers de la filiale"
      title="Vue terrain"
    >
      {missions.length === 0 ? (
        <div className="grid min-h-[280px] place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
          <span className="grid size-10 place-items-center rounded-2xl bg-sky-50 text-sky-600">
            <Icon name="map" size={18} />
          </span>
          <p className="mt-3 text-[12px] font-bold text-[#16233a]">Coordonnées indisponibles</p>
          <p className="mt-1 max-w-sm text-[11px] leading-5 text-slate-500">
            Les missions de votre filiale n&apos;ont pas encore de position géographique. La carte apparaîtra dès
            qu&apos;une adresse sera renseignée.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-[#e8f4fd] via-[#eefaf8] to-[#eef5ff]">
            <svg aria-label="Carte des chantiers" className="absolute inset-0 h-full w-full" role="img" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern height="6" id="branchGrid" patternUnits="userSpaceOnUse" width="6">
                  <path d="M 6 0 L 0 0 0 6" fill="none" stroke="rgba(15,42,82,0.06)" strokeWidth="0.25" />
                </pattern>
              </defs>
              <rect fill="url(#branchGrid)" height="100" width="100" />
              <path d="M 0 70 C 20 55, 35 80, 55 60 S 85 40, 100 45" fill="none" stroke="rgba(14,159,155,0.25)" strokeWidth="2.5" strokeDasharray="3 2" />
              <path d="M 0 35 C 25 45, 45 25, 70 35 S 90 20, 100 25" fill="none" stroke="rgba(56,189,248,0.22)" strokeWidth="2" strokeDasharray="2 2" />
              <circle cx="50" cy="50" fill="rgba(15,42,82,0.05)" r="34" />
              <circle cx="50" cy="50" fill="rgba(15,42,82,0.04)" r="22" />
            </svg>

            {points.map((point, index) => {
              const mission = missions[index];
              const color = markerColor[mission.statut];
              const isSelected = mission.id === selectedId;
              return (
                <button
                  aria-label={`Voir ${mission.titre}`}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  key={mission.id}
                  onClick={() => setSelectedId(isSelected ? null : mission.id)}
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  type="button"
                >
                  {mission.statut === "POINTAGE_A_VERIFIER" || mission.statut === "EN_COURS" ? (
                    <span
                      className="absolute -inset-2 animate-ping rounded-full opacity-25"
                      style={{ background: color }}
                      aria-hidden="true"
                    />
                  ) : null}
                  <motion.span
                    animate={{ scale: isSelected ? 1.3 : 1 }}
                    className="relative grid size-5 place-items-center rounded-full border-2 border-white shadow-md"
                    style={{ background: color }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="text-white" name="hardhat" size={9} />
                  </motion.span>
                </button>
              );
            })}

            <p className="absolute bottom-2.5 left-3 rounded-lg bg-white/80 px-2.5 py-1 text-[9px] font-bold text-slate-500 backdrop-blur">
              Vue schématique — positions normalisées
            </p>
          </div>

          <div className="flex min-h-[320px] flex-col">
            {selected ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-1 flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-lg shadow-slate-950/[0.04]"
                initial={{ opacity: 0, y: 10 }}
                key={selected.id}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#16233a]">{selected.titre}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Client : <span className="font-semibold text-slate-600">{selected.client}</span>
                    </p>
                  </div>
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg" style={{ background: `${markerColor[selected.statut]}1a` }}>
                    <span className="size-2.5 rounded-full" style={{ background: markerColor[selected.statut] }} />
                  </span>
                </div>
                <dl className="mt-3 space-y-2 text-[11px]">
                  <div className="flex justify-between gap-3">
                    <dt className="font-bold text-slate-400">Statut</dt>
                    <dd className="font-bold text-slate-700">{selected.statutLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="font-bold text-slate-400">Ouvrier</dt>
                    <dd className="font-semibold text-slate-600">{selected.ouvrier}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="font-bold text-slate-400">Horaires</dt>
                    <dd className="font-semibold text-slate-600">{selected.horaires}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="font-bold text-slate-400">Progression</dt>
                    <dd className="font-bold tabular-nums text-[#0e9f9b]">{selected.progression} %</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="font-bold text-slate-400">Dernier pointage</dt>
                    <dd className="font-semibold text-slate-600">{selected.dernierPointage ?? "Aucun pointage"}</dd>
                  </div>
                </dl>
                <div className="mt-auto pt-4">
                  <a
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#10304f] px-3 py-2.5 text-[11px] font-bold text-white shadow-md shadow-[#10304f]/20 transition hover:bg-[#1b446b]"
                    href={`/espace/missions?id=${selected.id}`}
                  >
                    <Icon name="arrow-up-right" size={13} />
                    Voir la fiche mission
                  </a>
                </div>
              </motion.div>
            ) : (
              <div className="grid flex-1 place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
                <div>
                  <span className="grid size-10 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm">
                    <Icon name="map" size={18} />
                  </span>
                  <p className="mt-3 text-[12px] font-bold text-[#16233a]">Sélectionnez un chantier</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Cliquez sur un marqueur pour afficher la fiche synthétique de la mission.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </ExecutivePanel>
  );
}
