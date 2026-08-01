"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { StatusBadge } from "@/app/components/ui/status-badge";
import { mapSites, pointagesHistory } from "@/app/lib/demo-data";
import type { MapSite, StatusTone } from "@/app/lib/demo-data";

const toneColor: Record<StatusTone, string> = {
  danger: "#e05252",
  info: "#4a90d9",
  neutral: "#7a8aa3",
  success: "#3fa77e",
  warning: "#d9a441",
};

const filiales = ["Toutes", "Construction", "Rénovation", "Entretien", "Matériaux"];

export default function CarteTerrainPage() {
  const [selected, setSelected] = useState<MapSite | null>(null);
  const [filiale, setFiliale] = useState("Toutes");
  const [toast, setToast] = useState("");

  const visibleSites = useMemo(
    () => (filiale === "Toutes" ? mapSites : mapSites.filter((site) => site.filiale === filiale)),
    [filiale]
  );

  const activeSites = mapSites.filter((site) => site.statut !== "Notifiée").length;
  const effectif = mapSites.reduce((total, site) => total + site.effectif, 0);

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div className="flex items-start gap-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e5edf7] text-[#385d86]">
            <Icon name="map" size={22} />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">
              Géolocalisation · BR-12
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-[-0.045em] text-[#17294b] sm:text-[30px]">
              Carte terrain
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
              Toutes les missions en cours, géolocalisées en temps réel : équipe déployée, statut du
              pointage et dernière activité.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filiales.map((f) => (
            <button
              aria-pressed={filiale === f}
              className={
                "rounded-lg px-3 py-1.5 text-xs font-bold transition " +
                (filiale === f
                  ? "bg-[#17294b] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700")
              }
              key={f}
              onClick={() => setFiliale(f)}
              type="button"
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {toast ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span className="flex items-center gap-2">
            <Icon name="check" size={17} />
            {toast}
          </span>
          <button
            aria-label="Fermer le message"
            className="rounded-md p-1 text-emerald-700 hover:bg-emerald-100"
            onClick={() => setToast("")}
            type="button"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {[
          { label: "Chantiers suivis", value: String(activeSites) },
          { label: "Équipes déployées", value: "06" },
          { label: "Ouvriers sur le terrain", value: String(effectif) },
          { label: "Pointages du jour", value: String(pointagesHistory.length) },
        ].map((stat, index) => (
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={stat.label}>
            <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-[27px] font-bold tracking-[-0.045em] text-[#182842]">{stat.value}</p>
              <span className={"size-2.5 rounded-full " + (index === 1 ? "bg-[#e3a641]" : "bg-[#7ba3cc]")} />
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <p className="text-sm font-bold text-[#1a2943]">Chantiers actifs</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {visibleSites.length} site{visibleSites.length > 1 ? "s" : ""} affiché{visibleSites.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-500">
              {(["success", "info", "warning", "neutral"] as StatusTone[]).map((tone) => (
                <span className="inline-flex items-center gap-1.5" key={tone}>
                  <span className="size-2 rounded-full" style={{ backgroundColor: toneColor[tone] }} />
                  {tone === "success" ? "Pointé" : tone === "info" ? "En cours" : tone === "warning" ? "Action requise" : "Planifié"}
                </span>
              ))}
            </div>
          </div>

          <div className="relative bg-[#eef3f8]">
            <svg
              aria-label="Carte stylisée des chantiers"
              className="h-[340px] w-full sm:h-[440px]"
              role="img"
              viewBox="0 0 800 520"
            >
              <rect fill="#eef3f8" height="520" width="800" />
              <path d="M0 320 C 120 300, 200 350, 320 330 C 440 310, 520 350, 640 340 C 720 333, 770 340, 800 335 L 800 520 L 0 520 Z" fill="#d8e4ee" opacity="0.9" />
              <path d="M0 380 C 160 360, 280 400, 420 385 C 560 370, 680 395, 800 380 L 800 520 L 0 520 Z" fill="#c9d9e6" />
              <path d="M0 430 C 200 415, 340 450, 520 440 C 640 433, 720 445, 800 438" fill="none" stroke="#b7cbd9" strokeWidth="18" opacity="0.6" />
              <g stroke="#ffffff" strokeLinecap="round" strokeWidth="10" opacity="0.9">
                <path d="M-20 150 H 260 C 300 150, 320 130, 360 130 H 820" />
                <path d="M180 -20 V 90 C 180 120, 210 140, 250 140 V 540" />
                <path d="M470 -20 V 60 C 470 90, 500 110, 540 110 V 540" />
                <path d="M700 -20 V 70 C 700 100, 680 120, 640 120 V 540" />
                <path d="M-20 250 C 120 240, 200 260, 320 250 C 440 240, 600 265, 820 250" />
                <path d="M-20 420 H 200 C 240 420, 260 440, 260 470 H 820" />
                <path d="M300 250 C 320 200, 340 180, 380 160" />
                <path d="M590 130 C 620 170, 640 200, 630 250" />
              </g>
              <g fill="#d9e4ee" stroke="#c3d3e0" strokeWidth="1">
                <ellipse cx="180" cy="150" rx="70" ry="44" />
                <ellipse cx="660" cy="60" rx="55" ry="36" />
                <ellipse cx="470" cy="520" rx="80" ry="40" />
              </g>
              {visibleSites.map((site) => {
                const color = toneColor[site.tone];
                const active = selected?.id === site.id;
                return (
                  <g
                    className="cursor-pointer"
                    key={site.id}
                    onClick={() => setSelected(site)}
                    onMouseEnter={() => setSelected(site)}
                    role="button"
                    tabIndex={0}
                  >
                    <circle cx={site.x + 110} cy={site.y + 80} fill={color} opacity={active ? 0.25 : 0.14} r={active ? 26 : 18} />
                    <circle cx={site.x + 110} cy={site.y + 80} fill={color} r={active ? 10 : 8} stroke="#ffffff" strokeWidth={2.5} />
                  </g>
                );
              })}
            </svg>
            <div className="pointer-events-none absolute right-3 top-3 hidden rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1.5 text-[10px] font-bold text-slate-500 backdrop-blur sm:block">
              Abidjan &amp; périphérie
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4 sm:px-6">
            {visibleSites.slice(0, 8).map((site) => (
              <button
                className={
                  "rounded-xl border p-3 text-left transition " +
                  (selected?.id === site.id
                    ? "border-[#e3a641] bg-amber-50/70 ring-2 ring-amber-200/60"
                    : "border-slate-150 border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white")
                }
                key={site.id}
                onClick={() => setSelected(site)}
                type="button"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold tracking-wide text-slate-400">{site.id}</span>
                  <span className="size-2 rounded-full" style={{ backgroundColor: toneColor[site.tone] }} />
                </div>
                <p className="mt-1.5 truncate text-xs font-bold text-[#233856]">{site.client}</p>
                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                  {site.equipe} · {site.effectif} ouvrier{site.effectif > 1 ? "s" : ""}
                </p>
              </button>
            ))}
          </div>
        </article>

        <aside className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold tracking-[-0.025em] text-[#1a2943]">Site sélectionné</p>
                <p className="mt-1 text-xs text-slate-500">Détail du chantier</p>
              </div>
              <span className="grid size-9 place-items-center rounded-xl bg-[#edf3f9] text-[#426b95]">
                <Icon name="folder" size={17} />
              </span>
            </div>
            {selected ? (
              <div className="mt-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold tracking-[-0.03em] text-[#17294b]">{selected.client}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{selected.id} · {selected.adresse}</p>
                  </div>
                  <StatusBadge tone={selected.tone}>{selected.statut}</StatusBadge>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Équipe</p>
                    <p className="mt-1 text-sm font-bold text-[#233856]">{selected.equipe}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Effectif</p>
                    <p className="mt-1 text-sm font-bold text-[#233856]">{selected.effectif} ouvriers</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Filiale</p>
                    <p className="mt-1 text-sm font-bold text-[#233856]">{selected.filiale}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dernier pointage</p>
                    <p className="mt-1 text-sm font-bold text-[#233856]">
                      {pointagesHistory.find((p) => p.mission === selected.id)?.horodatage ?? "—"}
                    </p>
                  </div>
                </div>
                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-4 py-2.5 text-sm font-bold text-[#14223b] shadow-lg shadow-amber-600/15 transition hover:bg-[#efb653]"
                  onClick={() => setToast("Notification d'arrivée envoyée à l'équipe " + selected.equipe + ".")}
                  type="button"
                >
                  <Icon name="bell" size={16} />
                  Alerter l&apos;équipe
                </button>
              </div>
            ) : (
              <div className="mt-5 grid min-h-36 place-items-center rounded-xl border border-dashed border-slate-200 p-4 text-center">
                <div>
                  <span className="mx-auto grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-400">
                    <Icon name="map" size={18} />
                  </span>
                  <p className="mt-3 text-sm font-bold text-slate-700">Aucun site sélectionné</p>
                  <p className="mt-1 text-xs text-slate-500">Sélectionnez un point sur la carte.</p>
                </div>
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold tracking-[-0.025em] text-[#1a2943]">Derniers pointages</p>
                <p className="mt-1 text-xs text-slate-500">Horodatés et géolocalisés</p>
              </div>
              <span className="grid size-9 place-items-center rounded-xl bg-[#edf3f9] text-[#426b95]">
                <Icon name="clock" size={17} />
              </span>
            </div>
            <div className="mt-4 divide-y divide-slate-100">
              {pointagesHistory.slice(0, 4).map((pointage, index) => (
                <div className="flex items-center justify-between gap-3 py-3" key={index}>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#233856]">{pointage.ouvrier}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {pointage.type} · {pointage.mission} · {pointage.horodatage}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                      {pointage.lat}°N · {pointage.lng}°W
                    </p>
                  </div>
                  <StatusBadge tone={pointage.statut === "Vérifié" ? "success" : "warning"}>
                    {pointage.statut}
                  </StatusBadge>
                </div>
              ))}
            </div>
            <button
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#426b95] hover:text-[#17294b]"
              onClick={() => setToast("Historique complet des pointages disponible après branchement API.")}
              type="button"
            >
              <Icon name="download" size={15} />
              Exporter l&apos;historique
            </button>
          </article>
        </aside>
      </section>
    </div>
  );
}
