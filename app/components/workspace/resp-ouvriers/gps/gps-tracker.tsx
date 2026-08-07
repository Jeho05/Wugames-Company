"use client";

import { useState } from "react";
import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { Avatar, GridBackdrop, Panel } from "@/app/components/workspace/resp-ouvriers/ui/primitives";
import { LEVEL } from "@/app/components/workspace/resp-ouvriers/theme";
import type { FieldWorker } from "@/app/lib/resp-ouvriers-data";

/* Carte radar simulée : positions pseudo-aléatoires stables par ouvrier */
function positionFor(index: number): { x: number; y: number } {
  const angles: [number, number][] = [
    [38, 55],
    [72, 38],
    [62, 72],
    [30, 78],
    [86, 60],
    [52, 30],
  ];
  return { x: angles[index % angles.length][0], y: angles[index % angles.length][1] };
}

export function GpsTracker({ workers }: { workers: FieldWorker[] }) {
  const [selected, setSelected] = useState<string | null>(workers[0]?.id ?? null);
  const focus = workers.find((worker) => worker.id === selected) ?? null;

  return (
    <Panel className="relative h-full overflow-hidden">
      <GridBackdrop className="z-0" opacity={0.35} />

      <div className="relative z-10 flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e3a641]/90">05 · Géolocalisation</p>
            <h2 className="mt-1 text-[17px] font-bold tracking-[-0.03em] text-[#e8eefb]">Radar de chantier</h2>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-white/[0.1] px-2.5 py-1 text-[10px] font-bold text-[#8b96b3]">
            <Icon name="map" className="text-[#5cc8ff]" size={12} />
            Abidjan · 8 km²
          </span>
        </div>

        <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-2">
          {/* Radar */}
          <div className="relative mx-auto aspect-square w-full max-w-[340px]">
            <div aria-hidden="true" className="absolute inset-0 rounded-full border border-white/[0.08]" />
            <div aria-hidden="true" className="absolute inset-[18%] rounded-full border border-white/[0.08]" />
            <div aria-hidden="true" className="absolute inset-[38%] rounded-full border border-white/[0.08]" />
            <div aria-hidden="true" className="absolute left-1/2 top-0 h-full w-px bg-white/[0.06]" />
            <div aria-hidden="true" className="absolute top-1/2 left-0 w-full h-px bg-white/[0.06]" />

            {/* balayage */}
            <motion.div
              animate={{ rotate: 360 }}
              className="absolute left-1/2 top-1/2 h-1/2 w-1/2 origin-bottom-left"
              style={{ background: "conic-gradient(from 0deg, rgba(61,220,151,0.22), transparent 40deg)" }}
              transition={{ duration: 5, ease: "linear", repeat: Infinity }}
            />

            {workers.map((worker, index) => {
              const meta = LEVEL[index % 3 === 0 ? "normal" : index % 3 === 1 ? "attention" : "critical"];
              if (worker.etat === "offline") return null;
              const pos = positionFor(index);
              const isFocus = worker.id === selected;
              const out = worker.etat === "en_route";
              return (
                <button
                  className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                  key={worker.id}
                  onClick={() => setSelected(worker.id)}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  type="button"
                >
                  <span
                    className="block rounded-full border bg-[#0f172f] transition-transform duration-200 group-hover:scale-150"
                    style={{
                      width: isFocus ? 16 : 12,
                      height: isFocus ? 16 : 12,
                      borderColor: meta.hex,
                      boxShadow: `0 0 0 ${out ? 2 : 3}px ${meta.hex}22`,
                      borderRadius: "50%",
                      position: "relative",
                    }}
                  >
                    {out ? (
                      <motion.span
                        animate={{ scale: [1, 1.9], opacity: [0.8, 0] }}
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full"
                        style={{ border: `1px solid ${meta.hex}` }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                      />
                    ) : null}
                  </span>
                </button>
              );
            })}

            <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
              <span className="size-2 rounded-full bg-[#3ddc97] shadow-[0_0_12px_4px_rgba(61,220,151,0.4)]" />
            </span>
          </div>

          {/* Focus */}
          <div className="min-h-[180px]">
            {focus ? (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <Avatar initials={focus.initiales} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-[#e8eefb]">{focus.nom}</p>
                    <p className="text-[11px] text-[#8b96b3]">{focus.specialite} · {focus.matricule}</p>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                    {focus.etat === "sur_site" ? "SUR SITE" : focus.etat === "en_route" ? "EN ROUTE" : "DISPONIBLE"}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Meter label="Vitesse" value="24 km/h" />
                  <Meter label="Altitude" value="42 m" />
                  <Meter label="Précision" value="±6 m" />
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[#5c6889]">
                  <span>5.3485 N, -3.9881 W</span>
                  <span className="text-[#3ddc97]">MAJ 11 s</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-[#5c6889]">Sélectionnez un ouvrier sur le radar.</p>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function Meter({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0f172f]/60 px-3 py-2">
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#5c6889]">{label}</p>
      <p className="mt-0.5 font-mono text-[13px] font-bold tabular-nums text-[#e8eefb]">{value}</p>
    </div>
  );
}