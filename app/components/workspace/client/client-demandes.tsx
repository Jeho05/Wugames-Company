"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";
import { StatusBadge } from "@/app/components/ui/status-badge";
import { ClientSection } from "@/app/components/workspace/client/client-section";
import { ClientCleans } from "@/app/components/workspace/client/client-cleans";
import { ClientBoutique } from "@/app/components/workspace/client/client-boutique";
import { createDemande } from "@/app/lib/api/client-space";
import { demandeStatutMeta, demandeTypeMeta, demandeView } from "@/app/lib/client-data";
import type { ClientDemandeView, DemandeStatut, DemandeType } from "@/app/lib/client-data";
import type { CleansOverview } from "@/app/lib/cleans-data";

type TabId = "demandes" | "clean" | "boutique";

type ClientEspacesWugamsProps = {
  demandes: ClientDemandeView[];
  cleans: CleansOverview;
  sectionId?: string;
};

const subTabs: { id: TabId; label: string; icon: IconName }[] = [
  { id: "demandes", label: "Mes demandes", icon: "clipboard" },
  { id: "clean", label: "Wugams Clean", icon: "sparkles" },
  { id: "boutique", label: "Espace Wu", icon: "shopping-bag" },
];

const typeIcon: Record<DemandeType, "sparkles" | "clipboard" | "warning"> = {
  DEVIS: "sparkles",
  SERVICE: "clipboard",
  RECLAMATION: "warning",
};

const demandeSteps: { label: string; from: DemandeStatut[] }[] = [
  { label: "Demande envoyée", from: ["ENVOYEE", "ETUDIEE", "DEVIS_PROPOSE", "ACCEPTEE", "REFUSEE"] },
  { label: "Demande à l'étude", from: ["ETUDIEE", "DEVIS_PROPOSE", "ACCEPTEE", "REFUSEE"] },
  { label: "Devis proposé", from: ["DEVIS_PROPOSE", "ACCEPTEE", "REFUSEE"] },
  { label: "Décision", from: ["ACCEPTEE", "REFUSEE"] },
];

function DemandeTimeline({ statut }: { statut: DemandeStatut }) {
  const reduce = useReducedMotion();
  const activeIndex = demandeSteps.findIndex((step) => step.from.includes(statut));
  return (
    <ol className="relative mt-1 space-y-0" aria-label="Suivi de la demande">
      {demandeSteps.map((step, index) => {
        const reached = index <= activeIndex;
        const isLast = index === demandeSteps.length - 1;
        return (
          <li className="relative flex gap-3.5 pb-6 last:pb-0" key={step.label}>
            {!isLast ? (
              <span
                className={
                  "absolute left-[11px] top-6 h-full w-0.5 rounded-full " +
                  (index < activeIndex ? "bg-emerald-400/70" : "bg-slate-200 dark:bg-white/10")
                }
              />
            ) : null}
            <span
              className={
                "relative z-10 grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold " +
                (reached
                  ? index === activeIndex
                    ? "bg-[#17294b] text-[#f2c56d] ring-4 ring-[#17294b]/10"
                    : "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-500")
              }
            >
              {reached ? <Icon name={index === activeIndex ? "dots" : "check"} size={12} /> : index + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={"text-xs font-bold " + (reached ? "text-slate-800 dark:text-slate-200" : "text-slate-400")}>
                {step.label}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {index === activeIndex ? "En cours de traitement" : reached ? "Terminée" : "À venir"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function ClientEspacesWugams({ demandes, cleans, sectionId = "portail-espaces-wugams" }: ClientEspacesWugamsProps) {
  const [tab, setTab] = useState<TabId>("demandes");
  const [selected, setSelected] = useState<ClientDemandeView | null>(null);
  const [compose, setCompose] = useState(false);
  const [type, setType] = useState<DemandeType>("DEVIS");
  const [objet, setObjet] = useState("");
  const [detail, setDetail] = useState("");
  const [created, setCreated] = useState<ClientDemandeView[]>([]);
  const [envoi, setEnvoi] = useState(false);
  const reduce = useReducedMotion();

  const all = [...created, ...demandes];
  const enAttente = all.filter((d) => d.statut === "ENVOYEE" || d.statut === "ETUDIEE").length;

  async function submit() {
    if (!objet.trim() || envoi) return;
    setEnvoi(true);
    try {
      const demande = await createDemande({
        libelle: objet.trim(),
        service: detail.trim() || "Détails à préciser lors de l'échange avec votre chargé de projet.",
      });
      setCreated((prev) => [demandeView(demande), ...prev]);
    } catch {
      const nouvelle: ClientDemandeView = {
        id: "new-" + Date.now(),
        type,
        objet: objet.trim(),
        detail: detail.trim() || "Détails à préciser lors de l'échange avec votre chargé de projet.",
        date: "Aujourd'hui",
        statut: "ENVOYEE",
        piecesJointes: 0,
      };
      setCreated((prev) => [nouvelle, ...prev]);
    } finally {
      setEnvoi(false);
      setObjet("");
      setDetail("");
      setCompose(false);
    }
  }

  return (
    <ClientSection
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#17294b]/20 bg-[#17294b]/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#17294b]">
          <Icon name="building" size={12} />
          Espace WUGAMS
        </span>
      }
      icon="building"
      id={sectionId}
      subtitle="Demandes, Wugams Clean et Espace Wu — tous vos services au même endroit"
      title="Espaces Wugams"
    >
      {/* Sous-onglets */}
      <div className="scrollbar-none -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1">
        {subTabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              aria-current={active ? "true" : undefined}
              className={
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 " +
                (active
                  ? "border-[#17294b] bg-[#17294b] text-white shadow-lg shadow-[#17294b]/20"
                  : "border-slate-200/90 bg-white text-slate-500 hover:border-slate-300 hover:text-[#17294b] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white")
              }
              key={t.id}
              onClick={() => setTab(t.id)}
              type="button"
            >
              <Icon name={t.icon} size={13} className={active ? "text-[#f2c56d]" : undefined} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Contenu Demandes */}
      {tab === "demandes" && (
        <div className="mt-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Devis, services et réclamations — chaque demande suit son cycle jusqu&apos;à la décision
            </p>
            <button
              className="inline-flex items-center gap-1.5 rounded-2xl bg-[#17294b] px-4 py-2.5 text-[12px] font-bold text-white shadow-lg shadow-[#17294b]/15 transition hover:bg-[#243a61] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17294b]"
              onClick={() => setCompose(true)}
              type="button"
            >
              <Icon name="plus" size={14} />
              Nouvelle demande
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {all.length === 0 ? (
              <div className="grid place-items-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center dark:border-white/15 dark:bg-white/[0.03]">
                <Icon name="clipboard" size={22} className="text-slate-300" />
                <p className="text-sm font-bold text-[#16233a] dark:text-slate-200">Aucune demande pour le moment</p>
                <p className="max-w-64 text-xs leading-5 text-slate-400">
                  Décrivez votre besoin : devis, service ou réclamation. Réponse sous 24 h ouvrées.
                </p>
              </div>
            ) : (
              all.map((demande, index) => {
                const typeMeta = demandeTypeMeta[demande.type];
                const statutMeta = demandeStatutMeta[demande.statut];
                return (
                  <motion.article
                    className="group flex flex-col rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-950/[0.03] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-white/10 dark:bg-[#101c36]"
                    initial={reduce ? undefined : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={demande.id}
                    transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#17294b]/[0.06] text-[#17294b] dark:bg-white/[0.06] dark:text-slate-300">
                          <Icon name={typeIcon[demande.type]} size={16} />
                        </span>
                        <StatusBadge tone={typeMeta.tone}>{typeMeta.label}</StatusBadge>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">{demande.date}</span>
                    </div>

                    <h3 className="mt-4 text-[14px] font-bold leading-6 tracking-[-0.02em] text-[#16233a] dark:text-slate-100">
                      {demande.objet}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{demande.detail}</p>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3.5 dark:border-white/5">
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                        <Icon name="folder" size={12} />
                        {demande.piecesJointes} pièce{demande.piecesJointes > 1 ? "s" : ""} jointe{demande.piecesJointes > 1 ? "s" : ""}
                      </span>
                      <button
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-bold text-[#16233a] transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200"
                        onClick={() => setSelected(demande)}
                        type="button"
                      >
                        Suivre <Icon name="arrow-right" size={12} />
                      </button>
                    </div>
                  </motion.article>
                );
              })
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">
              {enAttente} demande{enAttente > 1 ? "s" : ""} en cours de traitement
            </span>
            {all.some((d) => d.statut === "DEVIS_PROPOSE") ? (
              <StatusBadge tone="warning">Un devis vous attend</StatusBadge>
            ) : null}
          </div>
        </div>
      )}

      {/* Contenu Wugams Clean */}
      {tab === "clean" && <ClientCleans cleans={cleans} sectionId="portail-cleans" embedded />}

      {/* Contenu Espace Wu */}
      {tab === "boutique" && <ClientBoutique sectionId="portail-boutique" embedded />}

      <AnimatePresence>
        {selected ? (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              aria-hidden="true"
              className="pointer-events-auto absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              aria-label="Détail de la demande"
              aria-modal="true"
              className="pointer-events-auto max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/20 bg-white p-6 shadow-2xl sm:p-8 dark:border-white/10 dark:bg-[#0f1a2e]"
              initial={reduce ? undefined : { opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
              role="dialog"
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b47e1e]">Suivi de la demande</p>
                  <h3 className="mt-1.5 pr-6 text-lg font-bold leading-7 tracking-[-0.03em] text-[#16233a] dark:text-white">
                    {selected.objet}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge tone={demandeTypeMeta[selected.type].tone}>
                      {demandeTypeMeta[selected.type].label}
                    </StatusBadge>
                    <StatusBadge tone={demandeStatutMeta[selected.statut].tone}>
                      {demandeStatutMeta[selected.statut].label}
                    </StatusBadge>
                  </div>
                </div>
                <button
                  aria-label="Fermer"
                  className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2"
                  onClick={() => setSelected(null)}
                  type="button"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>

              <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-[12px] leading-6 text-slate-600 dark:bg-white/[0.04] dark:text-slate-300">
                {selected.detail}
              </p>

              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Cycle de traitement</p>
                <div className="mt-4">
                  <DemandeTimeline statut={selected.statut} />
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}

        {compose ? (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              aria-hidden="true"
              className="pointer-events-auto absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCompose(false)}
            />
            <motion.div
              aria-label="Nouvelle demande"
              aria-modal="true"
              className="pointer-events-auto max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/20 bg-white p-6 shadow-2xl sm:p-8 dark:border-white/10 dark:bg-[#0f1a2e]"
              initial={reduce ? undefined : { opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
              role="dialog"
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b47e1e]">Espace client</p>
                  <h3 className="mt-1.5 text-lg font-bold tracking-[-0.03em] text-[#16233a] dark:text-white">
                    Nouvelle demande
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Un chargé de projet vous répond sous 24 h ouvrées — sans engagement.
                  </p>
                </div>
                <button
                  aria-label="Fermer"
                  className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2"
                  onClick={() => setCompose(false)}
                  type="button"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">Type de demande</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["DEVIS", "SERVICE", "RECLAMATION"] as DemandeType[]).map((option) => (
                      <button
                        className={
                          "rounded-2xl border px-3 py-2.5 text-[11px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 " +
                          (type === option
                            ? "border-[#17294b] bg-[#17294b] text-white shadow-lg shadow-[#17294b]/15"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400")
                        }
                        key={option}
                        onClick={() => setType(option)}
                        type="button"
                      >
                        {demandeTypeMeta[option].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400" htmlFor="demande-objet">
                    Objet
                  </label>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-semibold text-[#16233a] outline-none transition placeholder:text-slate-300 focus:border-[#17294b] focus:ring-2 focus:ring-[#17294b]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                    id="demande-objet"
                    onChange={(event) => setObjet(event.target.value)}
                    placeholder="Ex. : Rénovation d'une chambre"
                    value={objet}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400" htmlFor="demande-detail">
                    Détails
                  </label>
                  <textarea
                    className="min-h-28 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-semibold text-[#16233a] outline-none transition placeholder:text-slate-300 focus:border-[#17294b] focus:ring-2 focus:ring-[#17294b]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                    id="demande-detail"
                    onChange={(event) => setDetail(event.target.value)}
                    placeholder="Décrivez votre besoin, vos contraintes et vos attentes…"
                    value={detail}
                  />
                </div>
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#17294b] px-4 py-3.5 text-[13px] font-bold text-white shadow-lg shadow-[#17294b]/15 transition hover:bg-[#243a61] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!objet.trim() || envoi}
                  onClick={submit}
                  type="button"
                >
                  <Icon name="mail" size={15} />
                  {envoi ? "Envoi en cours…" : "Envoyer ma demande"}
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </ClientSection>
  );
}
