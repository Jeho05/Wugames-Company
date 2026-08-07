"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { BreathingDot, FieldChip, Panel } from "@/app/components/workspace/resp-ouvriers/ui/primitives";
import { STATUS } from "@/app/components/workspace/resp-ouvriers/theme";
import type { FieldMission } from "@/app/lib/resp-ouvriers-data";

/* ------------------------------------------------------------------ */
/* Constellation : chaque mission est un node lumineux                 */
/* ------------------------------------------------------------------ */

const statusOrder: FieldMission["statut"][] = ["POINTAGE_A_VERIFIER", "EN_COURS", "RAPPORT_SOUMIS", "ACCEPTE", "NOTIFIE", "PLANIFIE", "TERMINE"];

export function MissionConstellation({
  missions,
  onOpen,
}: {
  missions: FieldMission[];
  onOpen: (mission: FieldMission) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const ordered = useMemo(() => {
    const rank: Record<string, number> = Object.fromEntries(statusOrder.map((statut, index) => [statut, index]));
    return [...missions].sort((a, b) => rank[a.statut] - rank[b.statut]);
  }, [missions]);

  const active = ordered.filter((mission) => mission.statut !== "TERMINE");

  return (
    <Panel className="relative overflow-hidden">
      {/* grille opérationnelle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(140,165,220,0.14) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "linear-gradient(to bottom, black, transparent 85%)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 85%)",
        }}
      />

      <div className="relative z-10 p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e3a641]/90">04 · Missions</p>
            <h2 className="mt-1 text-[17px] font-bold tracking-[-0.03em] text-[#e8eefb]">Constellation des missions</h2>
          </div>
          <div className="hidden items-center gap-3 text-[10px] font-semibold text-[#5c6889] sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#3ddc97]" /> En cours
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#f5b84d]" /> Rapport soumis
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#ff8ba0]" /> À vérifier
            </span>
          </div>
        </div>

        {/* Desktop : grille de nodes */}
        <div className="mt-6 hidden gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-3">
          {active.map((mission) => {
            const meta = STATUS[mission.statut];
            const isHovered = hovered === mission.id;
            return (
              <motion.button
                animate={{ opacity: hovered && !isHovered ? 0.55 : 1, scale: isHovered ? 1.02 : 1 }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-left transition-colors duration-200 hover:border-white/[0.18]"
                key={mission.id}
                onClick={() => onOpen(mission)}
                onMouseEnter={() => setHovered(mission.id)}
                onMouseLeave={() => setHovered(null)}
                transition={{ duration: 0.2 }}
                type="button"
              >
                <span aria-hidden="true" className="absolute -right-8 -top-8 size-24 rounded-full opacity-40 blur-2xl" style={{ backgroundColor: meta.hex }} />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex items-center">
                      <BreathingDot color={meta.hex} size={isHovered ? 8 : 6} />
                    </span>
                    <span className="font-mono text-[10px] font-bold text-[#5c6889]">{mission.numero}</span>
                  </div>
                  <FieldChip className={meta.chip}>{meta.label.toUpperCase()}</FieldChip>
                </div>
                <p className="relative mt-3 text-[14px] font-bold leading-5 text-[#e8eefb]">{mission.titre}</p>
                <p className="relative mt-1 text-[11px] text-[#8b96b3]">{mission.workerNom} · {mission.heurePlanifiee}</p>
                <div className="relative mt-3 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${mission.progression}%`, backgroundColor: meta.hex }} />
                  </div>
                  <span className="font-mono text-[10px] font-bold text-[#8b96b3]">{mission.progression}%</span>
                </div>
                <div className="relative mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-[#5c6889]">{mission.client}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#e3a641] transition group-hover:translate-x-0.5">
                    Voir <Icon name="arrow-right" size={11} />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Mobile : liste compacte */}
        <div className="mt-5 space-y-2.5 lg:hidden">
          {ordered.map((mission) => {
            const meta = STATUS[mission.statut];
            return (
              <button
                className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-3 text-left transition hover:border-white/[0.16]"
                key={mission.id}
                onClick={() => onOpen(mission)}
                type="button"
              >
                <span className="relative flex items-center">
                  <BreathingDot color={meta.hex} size={7} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-bold text-[#e8eefb]">{mission.titre}</span>
                  <span className="mt-0.5 block text-[10px] text-[#8b96b3]">{mission.workerNom} · {mission.heurePlanifiee}</span>
                </span>
                <FieldChip className={meta.chip}>{meta.label}</FieldChip>
                <Icon className="shrink-0 text-[#5c6889]" name="chevron-down" size={13} />
              </button>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}