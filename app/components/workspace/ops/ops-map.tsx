"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { OpsPanel } from "@/app/components/workspace/ops/ops-panel";
import type { MapMission } from "@/app/lib/ops-data";

type OpsMapProps = {
  missions: MapMission[];
};

const toneMeta: Record<MapMission["tone"], { dot: string; ring: string; pulse: string; label: string }> = {
  ok: { dot: "#34d399", ring: "ring-emerald-400/40", pulse: "bg-emerald-400/40", label: "Sous contrôle" },
  warning: { dot: "#fbbf24", ring: "ring-amber-400/40", pulse: "bg-amber-400/40", label: "À surveiller" },
  critical: { dot: "#fb7185", ring: "ring-rose-500/40", pulse: "bg-rose-500/40", label: "Urgent" },
};

export function OpsMap({ missions }: OpsMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = missions.find((mission) => mission.id === selectedId) ?? null;

  return (
    <OpsPanel
      action={
        <div className="flex items-center gap-3">
          {(Object.keys(toneMeta) as MapMission["tone"][]).map((tone) => (
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-400" key={tone}>
              <span className="size-2 rounded-full" style={{ background: toneMeta[tone].dot }} />
              {toneMeta[tone].label}
            </span>
          ))}
        </div>
      }
      icon="map"
      subtitle="Position des équipes et état des missions · temps réel"
      title="Carte des opérations"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.5fr)]">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a101f]">
          <svg aria-hidden="true" className="absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 100 60">
            <defs>
              <pattern height="5" id="ops-grid" patternUnits="userSpaceOnUse" width="5">
                <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
              </pattern>
              <radialGradient id="ops-radar" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(56,189,248,0.08)" />
                <stop offset="70%" stopColor="rgba(56,189,248,0.02)" />
                <stop offset="100%" stopColor="rgba(56,189,248,0)" />
              </radialGradient>
            </defs>
            <rect fill="url(#ops-grid)" height="60" width="100" />
            <circle cx="50" cy="30" fill="url(#ops-radar)" r="42" />
            <circle cx="50" cy="30" fill="none" r="42" stroke="rgba(255,255,255,0.08)" strokeDasharray="1 2" />
            <circle cx="50" cy="30" fill="none" r="28" stroke="rgba(255,255,255,0.06)" strokeDasharray="1 2" />
            <circle cx="50" cy="30" fill="none" r="14" stroke="rgba(255,255,255,0.05)" strokeDasharray="1 2" />
            <path d="M 8 30 H 92 M 50 8 V 52" stroke="rgba(255,255,255,0.07)" strokeDasharray="1 2" />
            <path d="M 2 4 L 8 4 L 8 10" fill="none" stroke="rgba(227,166,65,0.35)" strokeWidth="0.5" />
          </svg>

          <motion.div
            animate={{ x: ["0%", "100%"] }}
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-sky-400/[0.05] to-transparent"
            transition={{ duration: 7, ease: "linear", repeat: Infinity }}
          />

          {missions.map((mission) => {
            const meta = toneMeta[mission.tone];
            const isSelected = mission.id === selectedId;
            return (
              <button
                aria-label={`${mission.titre} — ${meta.label}`}
                aria-pressed={isSelected}
                className="absolute -translate-x-1/2 -translate-y-1/2 outline-none"
                key={mission.id}
                onClick={() => setSelectedId(isSelected ? null : mission.id)}
                style={{ left: `${mission.x}%`, top: `${mission.y}%` }}
                type="button"
              >
                <span className="relative grid size-6 place-items-center">
                  <motion.span
                    animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
                    aria-hidden="true"
                    className={"absolute size-6 rounded-full " + meta.pulse}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  />
                  <span
                    className={
                      "relative size-3 rounded-full border-2 border-[#0a101f] shadow-lg transition-transform duration-200 " +
                      (isSelected ? "scale-125 ring-4 " + meta.ring : "ring-2 " + meta.ring)
                    }
                    style={{ background: meta.dot }}
                  />
                </span>
              </button>
            );
          })}

          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-400 backdrop-blur">
            <span className="size-1.5 animate-pulse rounded-full bg-sky-400" />
            Balayage radar · {missions.length} missions actives
          </span>
        </div>

        <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
          {selected ? (
            <>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Détail de la mission</p>
              <h3 className="mt-2 text-[15px] font-bold leading-6 text-white">{selected.titre}</h3>
              <p className="mt-1 text-[11px] text-slate-400">{selected.client}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className={"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold " + (selected.tone === "critical" ? "border-rose-500/30 bg-rose-500/10 text-rose-300" : selected.tone === "warning" ? "border-amber-400/25 bg-amber-400/10 text-amber-300" : "border-emerald-400/25 bg-emerald-400/10 text-emerald-300")}>
                  <span className="size-1.5 rounded-full" style={{ background: toneMeta[selected.tone].dot }} />
                  {selected.statut}
                </span>
              </div>
              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                  <span>Progression</span>
                  <span className="tabular-nums text-white">{selected.progression} %</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                  <motion.div
                    animate={{ width: `${selected.progression}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-[#e3a641] to-[#f2c56d]"
                    initial={{ width: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
              <div className="mt-auto pt-4">
                <Link
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.07] px-3 py-2.5 text-[11px] font-bold text-white ring-1 ring-white/10 transition hover:bg-white/[0.12] hover:ring-[#e3a641]/40"
                  href="/espace/missions"
                >
                  <Icon name="arrow-up-right" size={13} />
                  Ouvrir la mission
                </Link>
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center text-center">
              <div>
                <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-slate-400">
                  <Icon name="map" size={20} />
                </span>
                <p className="mt-3 text-[12px] font-bold text-slate-300">Cliquez sur un point</p>
                <p className="mt-1 max-w-[200px] text-[10px] leading-4 text-slate-500">
                  pour afficher le détail de la mission et sa progression en temps réel.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </OpsPanel>
  );
}
