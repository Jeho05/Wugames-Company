"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { workerServiceTypeMeta } from "@/app/lib/worker-services-data";
import type { WorkerService, WorkerServicePreuve } from "@/app/lib/worker-services-data";
import { WorkerServiceForm } from "@/app/components/workspace/worker/worker-service-form";

type WorkerServicesScreenProps = {
  services: WorkerService[];
  proofs: Record<string, WorkerServicePreuve>;
  onValidate: (serviceId: string, preuve: WorkerServicePreuve) => void;
  onToast: (message: string, tone?: "success" | "error" | "info") => void;
};

export function WorkerServicesScreen({ services, proofs, onValidate, onToast }: WorkerServicesScreenProps) {
  const [formFor, setFormFor] = useState<WorkerService | null>(null);
  const [preview, setPreview] = useState<WorkerService | null>(null);
  const reduce = useReducedMotion();

  const aServir = services.filter((s) => s.statut === "A_SERVIR").length;
  const valides = services.filter((s) => s.statut === "VALIDE").length;

  if (services.length === 0) {
    return (
      <div className="grid place-items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-[#0f7a5f]/10 text-[#0f7a5f]">
          <Icon name="camera" size={26} />
        </span>
        <p className="text-[14px] font-extrabold text-[#16233a]">Aucun service aujourd'hui</p>
        <p className="max-w-64 text-[12px] leading-5 text-slate-500">
          Vous recevrez la liste des maisons à servir dès demain. Reposez-vous bien !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section aria-label="Galerie des services du jour">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[14px] font-extrabold text-[#16233a]">Maisons à servir · Galerie du jour</h2>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {aServir} à servir · {valides} validée{valides > 1 ? "s" : ""}
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-500">
            {services.length} service{services.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2">
          {services.map((service, index) => {
            const meta = workerServiceTypeMeta[service.type];
            const valide = service.statut === "VALIDE";
            const enCours = service.statut === "EN_COURS";
            const preuve = proofs[service.id] ?? null;
            return (
              <motion.button
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={
                  "group relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-100 text-left shadow-lg shadow-slate-950/[0.06] transition focus-visible:outline-2 focus-visible:outline-offset-2 " +
                  (enCours ? "ring-2 ring-[#0f7a5f]" : "hover:-translate-y-0.5 hover:shadow-xl")
                }
                initial={reduce ? undefined : { opacity: 0, y: 14, scale: 0.98 }}
                key={service.id}
                onClick={() => setPreview(service)}
                transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                type="button"
              >
                <img
                  alt={`Maison de ${service.client}`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  src={service.image}
                />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/75 to-transparent" />

                {/* Coche verte de validation */}
                <AnimatePresence>
                  {valide ? (
                    <motion.span
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute right-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-[#0f7a5f] text-white shadow-lg shadow-emerald-900/40 ring-2 ring-white/70"
                      initial={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <Icon name="check" size={18} strokeWidth={2.4} />
                    </motion.span>
                  ) : enCours ? (
                    <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-extrabold text-[#0f7a5f] shadow">
                      <Icon name="clock" size={11} />
                      En cours
                    </span>
                  ) : null}
                </AnimatePresence>

                <span className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#0f7a5f]" style={{ background: "rgba(255,255,255,0.92)" }}>
                  {service.heure}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-3.5">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[8px] font-extrabold ${meta.tone}`} style={{ background: "rgba(255,255,255,0.9)" }}>
                    {meta.label}
                  </span>
                  <p className="mt-1.5 truncate text-[12px] font-extrabold text-white">{service.client}</p>
                  <p className="mt-0.5 line-clamp-1 text-[10px] font-medium text-slate-200">{service.adresse}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      <p className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-[10px] leading-4 text-slate-400">
        Touchez une maison pour ouvrir le formulaire : heures de passage, observations (audio, texte ou vidéo) et
        photos avant / après. La coche verte apparaît dès la validation du service.
      </p>

      <AnimatePresence>
        {formFor ? (
          <WorkerServiceForm
            initial={proofs[formFor.id] ?? { arrivedAt: null, departedAt: null, observations: "", audioUrl: null, videoUrl: null, photoAvant: null, photoApres: null }}
            onCancel={() => setFormFor(null)}
            onSave={(preuve) => {
              onValidate(formFor.id, preuve);
              onToast(`Service pour ${formFor.client} validé · coche verte activée`, "success");
              setFormFor(null);
            }}
            service={formFor}
          />
        ) : null}

        {preview ? (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              aria-hidden="true"
              className="pointer-events-auto absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreview(null)}
            />
            <motion.div
              aria-label="Détail du service"
              aria-modal="true"
              className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#0f1a2e]"
              initial={reduce ? undefined : { opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
              role="dialog"
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img alt={preview.client} className="h-full w-full object-cover" src={preview.image} />
                {preview.statut === "VALIDE" ? (
                  <span className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-[#0f7a5f] text-white shadow-xl ring-2 ring-white/70">
                    <Icon name="check" size={20} strokeWidth={2.4} />
                  </span>
                ) : null}
              </div>
              <div className="p-5">
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-extrabold ${workerServiceTypeMeta[preview.type].tone}`}>
                  {workerServiceTypeMeta[preview.type].label}
                </span>
                <h3 className="mt-2.5 text-[16px] font-extrabold text-[#16233a] dark:text-white">{preview.client}</h3>
                <p className="mt-1 text-[12px] font-medium text-slate-400">{preview.adresse}</p>
                <p className="mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-300">{preview.heure}</p>

                {preview.statut === "VALIDE" && proofs[preview.id] ? (
                  <div className="mt-4 space-y-2 rounded-2xl bg-emerald-50 p-3.5 dark:bg-emerald-500/[0.08]">
                    <p className="flex items-center gap-2 text-[11px] font-bold text-emerald-700">
                      <Icon name="check" size={13} />
                      Service validé
                    </p>
                    <p className="text-[10px] font-medium text-emerald-700/80">
                      {proofs[preview.id].arrivedAt} → {proofs[preview.id].departedAt}
                    </p>
                    <p className="line-clamp-2 text-[10px] leading-4 text-emerald-700/80">
                      {proofs[preview.id].observations}
                    </p>
                  </div>
                ) : null}

                <button
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f7a5f] px-4 py-3.5 text-[12px] font-extrabold text-white shadow-xl shadow-emerald-900/20 transition active:scale-[0.99] disabled:opacity-50"
                  disabled={preview.statut === "VALIDE"}
                  onClick={() => {
                    setPreview(null);
                    setFormFor(preview);
                  }}
                  type="button"
                >
                  <Icon name="clipboard" size={15} />
                  {preview.statut === "VALIDE" ? "Déjà validé — voir le formulaire" : "Remplir le formulaire de service"}
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}