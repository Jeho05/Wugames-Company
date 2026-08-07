"use client";

import { motion } from "motion/react";

import { Avatar, BreathingDot, Panel } from "@/app/components/workspace/resp-ouvriers/ui/primitives";
import type { FieldWorker } from "@/app/lib/resp-ouvriers-data";

const ETAT_LABEL: Record<FieldWorker["etat"], string> = {
  sur_site: "SUR SITE",
  en_route: "EN ROUTE",
  disponible: "DISPONIBLE",
  offline: "OFFLINE",
};

const ETAT_TONE_HEX: Record<FieldWorker["etat"], string> = {
  sur_site: "#3ddc97",
  en_route: "#5cc8ff",
  disponible: "#8b96b3",
  offline: "#ff8ba0",
};

const ETAT_RING: Record<FieldWorker["etat"], string> = {
  sur_site: "#3ddc9740",
  en_route: "#5cc8ff40",
  disponible: "#8b96b340",
  offline: "#ff8ba040",
};

export function TeamPulse({ workers, onOpenWorker }: { workers: FieldWorker[]; onOpenWorker?: (worker: FieldWorker) => void }) {
  const ordered = [...workers].sort((a, b) => (a.etat === "sur_site" ? -1 : b.etat === "sur_site" ? 1 : 0));

  return (
    <Panel className="h-full">
      <div className="flex items-end justify-between gap-4 border-b border-[rgba(148,163,207,0.1)] px-6 pb-4 pt-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e3a641]/90">07 · Équipe</p>
          <h2 className="mt-1 text-[17px] font-bold tracking-[-0.03em] text-[#e8eefb]">Pouls du terrain</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#5c6889]">
          <BreathingDot color="#3ddc97" size={6} />
          {workers.filter((worker) => worker.etat === "sur_site").length} sur site
        </span>
      </div>

      <ul className="divide-y divide-white/[0.05] p-4">
        {ordered.map((worker, index) => {
          const color = ETAT_TONE_HEX[worker.etat];
          return (
            <motion.li
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 8 }}
              key={worker.id}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <button
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-white/[0.03]"
                onClick={() => onOpenWorker?.(worker)}
                type="button"
              >
                <Avatar initials={worker.initiales} ring={ETAT_RING[worker.etat]} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-[#e8eefb]">{worker.nom}</p>
                  <p className="truncate text-[11px] text-[#8b96b3]">{worker.specialite} · {worker.matricule}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold" style={{ color }}>
                    {ETAT_LABEL[worker.etat]}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#5c6889]">
                    {worker.etat === "sur_site" ? worker.checkin : worker.etat === "en_route" ? "Déplacement" : "—"}
                  </p>
                </div>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </Panel>
  );
}