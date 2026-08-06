"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import type { WorkerMission } from "@/app/lib/worker-data";
import { relativeTime } from "@/app/lib/worker-data";
import { MissionMap, WorkerMissionCard, statutBadge } from "@/app/components/workspace/worker/worker-mission-card";
import { WorkerSheet } from "@/app/components/workspace/worker/worker-sheet";

type WorkerMissionsScreenProps = {
  missions: WorkerMission[];
};

const filters = [
  { key: "toutes", label: "Toutes" },
  { key: "a_faire", label: "À faire" },
  { key: "en_cours", label: "En cours" },
  { key: "terminees", label: "Terminées" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

const filterPredicate: Record<FilterKey, (mission: WorkerMission) => boolean> = {
  toutes: () => true,
  a_faire: (mission) => mission.statut === "PLANIFIE" || mission.statut === "NOTIFIE" || mission.statut === "ACCEPTE",
  en_cours: (mission) =>
    mission.statut === "EN_COURS" || mission.statut === "POINTAGE_A_VERIFIER" || mission.statut === "RAPPORT_SOUMIS",
  terminees: (mission) => mission.statut === "TERMINE" || mission.statut === "VALIDE",
};

export function WorkerMissionsScreen({ missions }: WorkerMissionsScreenProps) {
  const [filter, setFilter] = useState<FilterKey>("toutes");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<WorkerMission | null>(null);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return missions.filter((mission) => {
      if (!filterPredicate[filter](mission)) return false;
      if (!normalized) return true;
      return `${mission.titre} ${mission.client} ${mission.adresse}`.toLowerCase().includes(normalized);
    });
  }, [filter, missions, query]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5">
        <Icon className="shrink-0 text-slate-400" name="search" size={16} />
        <input
          aria-label="Rechercher une mission"
          className="w-full bg-transparent text-[13px] text-[#16233a] outline-none placeholder:text-slate-400"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un chantier, un client…"
          type="search"
          value={query}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
        {filters.map((item) => (
          <button
            aria-selected={filter === item.key}
            className={
              "shrink-0 rounded-full px-4 py-2 text-[11px] font-extrabold transition " +
              (filter === item.key ? "bg-[#0f7a5f] text-white shadow-md shadow-emerald-900/20" : "border border-slate-200 bg-white text-slate-500")
            }
            key={item.key}
            onClick={() => setFilter(item.key)}
            role="tab"
            style={{ minHeight: 40 }}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
          <Icon className="text-slate-300" name="hardhat" size={26} />
          <p className="text-[13px] font-bold text-slate-500">Aucune mission ne correspond</p>
          <p className="text-[11px] text-slate-400">Modifiez la recherche ou le filtre.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((mission) => (
            <button className="block w-full text-left" key={mission.id} onClick={() => setSelected(mission)} type="button">
              <WorkerMissionCard mission={mission} />
            </button>
          ))}
        </div>
      )}

      <WorkerSheet open={selected !== null} title="Détail de la mission" onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-[15px] font-extrabold text-[#16233a]">{selected.titre}</h3>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                  {selected.client} · {selected.filiale}
                </p>
              </div>
              {statutBadge(selected)}
            </div>

            {selected.description ? <p className="text-[12px] leading-6 text-slate-500">{selected.description}</p> : null}

            <MissionMap mission={selected} />

            <ul className="space-y-2 rounded-3xl bg-slate-50 p-4">
              {(
                [
                  { icon: "calendar", text: selected.datePlanifiee },
                  { icon: "camera", text: `${selected.photos} photo(s) jointe(s)` },
                  ...(selected.dernierPointage
                    ? [{ icon: "clock", text: `Dernier pointage : ${selected.dernierPointage}` }]
                    : []),
                ] as { icon: "calendar" | "camera" | "clock"; text: string }[]
              ).map((row) => (
                <li className="flex items-center gap-2.5 text-[12px] font-semibold text-slate-600" key={row.text}>
                  <Icon className="shrink-0 text-[#0f7a5f]" name={row.icon} size={13} />
                  {row.text}
                </li>
              ))}
            </ul>

            {selected.pointages.length > 0 ? (
              <div>
                <h4 className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Historique des pointages</h4>
                <ol className="mt-2.5 space-y-2.5">
                  {[...selected.pointages]
                    .sort((a, b) => new Date(a.horodatage).getTime() - new Date(b.horodatage).getTime())
                    .map((pointage) => (
                      <li className="flex items-center gap-3" key={pointage.id}>
                        <span
                          className={
                            "grid size-7 shrink-0 place-items-center rounded-full " +
                            (pointage.type === "ARRIVEE" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700")
                          }
                        >
                          <Icon name={pointage.type === "ARRIVEE" ? "arrow-down" : "arrow-up"} size={12} />
                        </span>
                        <div className="flex-1">
                          <p className="text-[11px] font-extrabold text-[#16233a]">
                            {pointage.type === "ARRIVEE" ? "Arrivée" : "Sortie"}
                            {pointage.hors_rayon ? (
                              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-bold text-amber-700">
                                Hors zone
                              </span>
                            ) : null}
                          </p>
                          <p className="text-[10px] text-slate-400">{relativeTime(pointage.horodatage)}</p>
                        </div>
                        {pointage.distance_calculee_m !== null ? (
                          <span className="text-[10px] font-bold tabular-nums text-slate-400">
                            {pointage.distance_calculee_m} m
                          </span>
                        ) : null}
                      </li>
                    ))}
                </ol>
              </div>
            ) : null}

            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-[10px] leading-5 text-slate-500">
              Vous consultez cette mission en lecture seule. Les actions (acceptation, pointages, photos, rapport) s&apos;effectuent
              depuis la mission du jour ou le bouton d&apos;action principal.
            </p>
          </div>
        ) : null}
      </WorkerSheet>
    </div>
  );
}
