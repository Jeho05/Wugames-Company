"use client";

import { AnimatePresence, motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { Avatar, BreathingDot, FieldChip, KBD } from "@/app/components/workspace/resp-ouvriers/ui/primitives";
import { LEVEL, STATUS, TONE_HEX } from "@/app/components/workspace/resp-ouvriers/theme";
import type { FieldMission, PhotoPoint, WorkplanItem } from "@/app/lib/resp-ouvriers-data";

function PhotoGrid({
  missionId,
  photos,
  onPhoto,
}: {
  missionId: string;
  photos: PhotoPoint[];
  onPhoto: (photo: PhotoPoint) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((photo) => (
        <button
          className="group flex flex-col items-stretch gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2 text-left transition hover:border-[#e3a641]/40"
          key={`${missionId}-${photo.label}`}
          onClick={() => onPhoto(photo)}
          type="button"
        >
          <span className="relative block aspect-[4/3] overflow-hidden rounded-lg border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-transparent">
            <span className="absolute inset-0 grid place-items-center">
              <Icon className="text-[#5c6889] transition group-hover:text-[#e3a641]" name="camera" size={16} />
            </span>
            <span
              className="absolute bottom-1.5 right-1.5 rounded px-1 py-0.5 font-mono text-[8px] font-bold tabular-nums"
              style={{ backgroundColor: photo.statut >= 97 ? "#3ddc97" : photo.statut >= 92 ? "#f5b84d" : "#ff8ba0", color: "#081020" }}
            >
              {photo.statut}% · {photo.size}
            </span>
          </span>
          <span className="text-[10px] font-semibold leading-4 text-[#8b96b3]">{photo.label}</span>
        </button>
      ))}
    </div>
  );
}

function Workplan({ items }: { items: WorkplanItem[] }) {
  return (
    <ul className="mt-4 space-y-0">
      {items.map((item, index) => {
        const level = LEVEL[item.level];
        return (
          <motion.li
            animate={{ opacity: 1, x: 0 }}
            className="relative flex gap-3 pb-3.5"
            initial={{ opacity: 0, x: 8 }}
            key={item.titre}
            transition={{ delay: index * 0.08, duration: 0.35 }}
          >
            {index < items.length - 1 ? (
              <span aria-hidden="true" className="absolute left-[11px] top-7 bottom-0 w-px bg-white/[0.1]" />
            ) : null}
            <span className="relative z-10 grid size-6 shrink-0 place-items-center rounded-full border border-white/[0.08]" style={{ backgroundColor: level.hex }}>
              <span className="size-2 rounded-full bg-[#081020]" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-bold text-[#e8eefb]">{item.titre}</p>
                <span className="font-mono text-[10px] font-bold tabular-nums text-[#5c6889]">{item.heure}</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-4 text-[#8b96b3]">{item.detail}</p>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}

export function MissionDetail({
  mission,
  onClose,
  onNavigate,
  onPhoto,
}: {
  mission: FieldMission | null;
  onClose: () => void;
  onNavigate: (destination: { section: string; detail?: string }) => void;
  onPhoto: (photo: PhotoPoint | null) => void;
}) {
  const meta = mission ? STATUS[mission.statut] : null;

  if (!mission || !meta) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[80] grid place-items-end bg-[#04080f]/80 p-0 backdrop-blur-sm sm:place-items-center sm:p-6"
        initial={{ opacity: 0 }}
        key="overlay"
        onClick={onClose}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="max-h-[92vh] w-full overflow-hidden rounded-t-3xl border border-white/[0.09] bg-[#0c1530] shadow-2xl shadow-black/60 sm:max-w-3xl sm:rounded-3xl"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          onClick={(event) => event.stopPropagation()}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div className="relative border-b border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-transparent px-6 pb-5 pt-6 sm:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-full border border-white/[0.1] bg-white/[0.05]">
                    <BreathingDot color={meta.hex} size={6} />
                  </span>
                  <span className="font-mono text-[11px] font-bold text-[#5c6889]">{mission.numero}</span>
                  <FieldChip className={meta.chip}>{meta.label.toUpperCase()}</FieldChip>
                </div>
                <h3 className="mt-3 text-xl font-bold tracking-[-0.03em] text-[#e8eefb] sm:text-2xl">{mission.titre}</h3>
                <p className="mt-1 text-[12px] text-[#8b96b3]">
                  {mission.client} · <span className="font-semibold text-[#c3cbdf]">{mission.siteChantier}</span>
                </p>
              </div>
              <button
                aria-label="Fermer"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-[#8b96b3] transition hover:border-white/[0.2] hover:text-white"
                onClick={onClose}
                type="button"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            {/* lieux */}
            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#5c6889]">
                  <Icon name="building" size={11} /> Entreprise
                </p>
                <p className="mt-1 text-[12px] font-semibold text-[#e8eefb]">{mission.siteDepart}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#5c6889]">
                  <Icon name="map" size={11} /> Chantier
                </p>
                <p className="mt-1 text-[12px] font-semibold text-[#e8eefb]">{mission.siteChantier}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#5c6889]">
                  <Icon name="clock" size={11} /> Fenêtre
                </p>
                <p className="mt-1 font-mono text-[12px] font-bold text-[#e8eefb]">{mission.heurePlanifiee}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-6 p-6 sm:p-8">
            <div className="grid gap-6 sm:grid-cols-[0.72fr_1fr]">
              <section>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#e3a641]/90">Plan du jour</p>
                <Workplan items={mission.workplan} />
              </section>

              <section>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#e3a641]/90">Équipe sur site</p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {mission.team.map((line) => (
                    <button
                      key={line.name}
                      onClick={() => onNavigate({ section: "live", detail: line.name })}
                      type="button"
                    >
                      <Avatar initials={line.workerInitiales} ring={TONE_HEX.green} size={46} title={line.name} />
                    </button>
                  ))}
                </div>

                <p className="mt-6 text-[11px] font-black uppercase tracking-[0.22em] text-[#e3a641]/90">Preuves photo ({mission.photosStatut.length})</p>
                <div className="mt-3">
                  <PhotoGrid missionId={mission.id} photos={mission.photosStatut} onPhoto={onPhoto} />
                </div>

                <p className="mt-6 text-[11px] font-black uppercase tracking-[0.22em] text-[#e3a641]/90">Matériel & véhicule</p>
                <div className="mt-3 space-y-1.5">
                  <p className="flex items-center gap-2 text-[12px] text-[#c3cbdf]">
                    <Icon className="text-[#e3a641]" name="truck" size={13} />
                    <span className="font-mono font-bold">{mission.vehicule.immatriculation}</span>
                    <span className="text-[#5c6889]">· {mission.vehicule.type}</span>
                  </p>
                  <p className="flex items-center gap-2 text-[12px] text-[#8b96b3]">
                    <Icon className="text-[#e3a641]" name="package" size={13} />
                    {mission.materiel.join(" · ")}
                  </p>
                </div>
              </section>
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="flex items-center gap-1.5 text-[11px] text-[#5c6889]">
                <KBD>Echap</KBD> Pour fermer
              </p>
              <div className="flex gap-2.5">
                <button className="rounded-xl border border-white/[0.1] px-4 py-2.5 text-[12px] font-bold text-[#c3cbdf] transition hover:border-white/[0.25] hover:text-white" type="button">
                  <span className="flex items-center gap-2">
                    <Icon name="phone" size={13} /> Appeler
                  </span>
                </button>
                <button
                  className="rounded-xl bg-[#e3a641] px-5 py-2.5 text-[12px] font-black text-[#081020] shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
                  onClick={() => onNavigate({ section: "missions", detail: mission.id })}
                  type="button"
                >
                  En plein écran →
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}