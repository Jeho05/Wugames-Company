"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ClientSection } from "@/app/components/workspace/client/client-section";
import { MissionBadge } from "@/app/components/workspace/client/client-status";
import { missionStatutMeta } from "@/app/lib/client-data";
import type { ClientProjetView } from "@/app/lib/client-data";
import type { MissionStatut } from "@/app/lib/contracts";

const progressTone: Record<MissionStatut, string> = {
  PLANIFIE: "bg-slate-300",
  NOTIFIE: "bg-sky-500",
  ACCEPTE: "bg-sky-500",
  EN_COURS: "bg-[#e3a641]",
  RAPPORT_SOUMIS: "bg-sky-500",
  VALIDE: "bg-emerald-500",
  TERMINE: "bg-emerald-500",
  POINTAGE_A_VERIFIER: "bg-rose-500",
};

type ClientProjetsProps = {
  projets: ClientProjetView[];
};

export function ClientProjets({ projets }: ClientProjetsProps) {
  const [selected, setSelected] = useState<ClientProjetView | null>(null);
  const [photoOpen, setPhotoOpen] = useState<string | null>(null);
  const reduce = useReducedMotion();

  return (
    <ClientSection
      action={
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          {projets.length} projet{projets.length > 1 ? "s" : ""} sur votre compte
        </p>
      }
      icon="camera"
      id="portail-projets"
      subtitle="Chaque projet raconte son histoire : galerie de photos et rapport de chantier"
      title="Mes projets"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {projets.length === 0 ? (
          <div className="grid place-items-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center dark:border-white/15 dark:bg-white/[0.03] md:col-span-2">
            <Icon name="camera" size={22} className="text-slate-300" />
            <p className="text-sm font-bold text-[#16233a] dark:text-slate-200">Aucun projet pour le moment</p>
            <p className="max-w-64 text-xs leading-5 text-slate-400">
              Vos chantiers et leurs photos apparaîtront ici dès le lancement des travaux.
            </p>
          </div>
        ) : (
        projets.map((projet, index) => {
          const meta = missionStatutMeta[projet.statut];
          const couverture = projet.galerie[0]?.url;
          return (
            <motion.article
              className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-950/[0.08] dark:border-white/10 dark:bg-[#101c36]"
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              key={projet.id}
              transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-white/[0.04]">
                {couverture ? (
                  <img
                    alt={projet.galerie[0].legende}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    src={couverture}
                  />
                ) : (
                  <div className="grid h-full place-items-center text-slate-300">
                    <Icon name="camera" size={32} />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/60 to-transparent" />
                <div className="absolute left-4 top-4">
                  <MissionBadge statut={projet.statut} />
                </div>
                <p className="absolute bottom-3.5 left-4 right-4 text-[11px] font-semibold text-white">
                  {projet.galerie.length} photo{projet.galerie.length > 1 ? "s" : ""} · {projet.filiale}
                </p>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-[15px] font-bold leading-6 tracking-[-0.02em] text-[#16233a] dark:text-slate-100">
                  {projet.titre}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-slate-400">
                  <Icon name="calendar" size={12} />
                  Début : {projet.debut}
                  <span className="text-slate-200 dark:text-white/10">·</span>
                  <Icon name="users" size={12} />
                  {projet.equipe}
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-400">Avancement</span>
                    <span className="text-[#16233a] dark:text-slate-300">{projet.progression}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <motion.div
                      className={"h-full rounded-full " + progressTone[projet.statut]}
                      initial={reduce ? undefined : { width: 0 }}
                      animate={{ width: `${projet.progression}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/5">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{meta.label}</span>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#17294b] px-3.5 py-2 text-[11px] font-bold text-white transition hover:bg-[#243a61] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17294b]"
                    onClick={() => setSelected(projet)}
                    type="button"
                  >
                    Galerie & rapport <Icon name="arrow-right" size={13} />
                  </button>
                </div>
              </div>
            </motion.article>
          );
        })
        )}
      </div>

      <AnimatePresence>
        {selected ? (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              aria-hidden="true"
              className="pointer-events-auto absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelected(null); setPhotoOpen(null); }}
            />
            <motion.div
              aria-label="Projet"
              aria-modal="true"
              className="pointer-events-auto relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/20 bg-white p-6 shadow-2xl sm:p-8 dark:border-white/10 dark:bg-[#0f1a2e]"
              initial={reduce ? undefined : { opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
              role="dialog"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b47e1e]">Galerie du projet</p>
                  <h3 className="mt-1.5 pr-6 text-lg font-bold leading-7 tracking-[-0.03em] text-[#16233a] dark:text-white">
                    {selected.titre}
                  </h3>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <MissionBadge statut={selected.statut} />
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                      {selected.filiale}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                      {selected.equipe}
                    </span>
                  </div>
                </div>
                <button
                  aria-label="Fermer"
                  className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2"
                  onClick={() => { setSelected(null); setPhotoOpen(null); }}
                  type="button"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {selected.galerie.map((photo) => (
                  <button
                    className="group/photo relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-white/[0.04]"
                    key={photo.url}
                    onClick={() => setPhotoOpen(photo.url)}
                    type="button"
                  >
                    <img
                      alt={photo.legende}
                      className="h-full w-full object-cover transition duration-300 group-hover/photo:scale-105"
                      src={photo.url}
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent px-3 pb-2 pt-6 text-left text-[10px] font-bold text-white">
                      {photo.legende}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Rapport de chantier</p>
                {selected.rapport ? (
                  <p className="mt-2.5 rounded-2xl bg-slate-50 p-4 text-[12px] leading-6 text-slate-600 dark:bg-white/[0.04] dark:text-slate-300">
                    {selected.rapport}
                  </p>
                ) : (
                  <p className="mt-2.5 rounded-2xl border border-dashed border-slate-200 p-4 text-[12px] leading-5 text-slate-400 dark:border-white/10">
                    Le rapport sera publié ici par l&apos;équipe dès la fin des travaux.
                  </p>
                )}
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">Progression</span>
                  <span className="text-[#16233a] dark:text-slate-200">{selected.progression}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <motion.div
                    className={"h-full rounded-full " + progressTone[selected.statut]}
                    initial={reduce ? undefined : { width: 0 }}
                    animate={{ width: `${selected.progression}%` }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}

        {photoOpen && selected ? (
          <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
            <button
              aria-label="Fermer la photo"
              className="pointer-events-auto absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              onClick={() => setPhotoOpen(null)}
              type="button"
            >
              <Icon name="close" size={18} />
            </button>
            <motion.img
              alt="Photo du projet"
              className="pointer-events-auto max-h-[85vh] w-auto max-w-full rounded-3xl object-contain shadow-2xl"
              initial={reduce ? undefined : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              src={photoOpen}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        ) : null}
      </AnimatePresence>
    </ClientSection>
  );
}