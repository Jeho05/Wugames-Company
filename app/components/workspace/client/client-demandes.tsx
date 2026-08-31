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

const typeShortLabel: Record<DemandeType, string> = {
  DEVIS: "Devis",
  SERVICE: "Service",
  RECLAMATION: "Réclam.",
};

// Palette épurée : un seul doré WUGAMS + ardoise, plus de multicolore
const statutAccent: Record<DemandeStatut, { dot: string; label: string }> = {
  ENVOYEE: { dot: "bg-slate-300", label: "text-slate-500" },
  ETUDIEE: { dot: "bg-slate-300", label: "text-slate-500" },
  DEVIS_PROPOSE: { dot: "bg-[#e3a641]", label: "text-[#b47e1e]" },
  ACCEPTEE: { dot: "bg-emerald-400", label: "text-emerald-600" },
  REFUSEE: { dot: "bg-slate-300", label: "text-slate-500" },
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
  const enCours = all.filter((d) => d.statut === "DEVIS_PROPOSE").length;
  const terminees = all.filter((d) => d.statut === "ACCEPTEE" || d.statut === "REFUSEE").length;

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function submit() {
    if (objet.trim().length < 8) {
      setErrorMsg("L'objet doit contenir au moins 8 caractères.");
      return;
    }
    if (envoi) return;
    setEnvoi(true);
    setErrorMsg(null);
    try {
      const demande = await createDemande({
        libelle: objet.trim(),
        service: detail.trim() || "Détails à préciser lors de l'échange avec votre chargé de projet.",
      });
      // Le type est conservé côté UI (le back ne le persiste pas encore)
      const view = demandeView(demande);
      view.type = type;
      setCreated((prev) => [view, ...prev]);
      setCompose(false);
      setObjet("");
      setDetail("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Échec de l'envoi. Vérifiez votre connexion.";
      setErrorMsg(msg);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <ClientSection
      icon="building"
      id={sectionId}
      subtitle="Demandes, Wugams Clean et Espace Wu — tous vos services au même endroit"
      title="Espaces Wugams"
    >
      {/* Sous-onglets — palette épurée */}
      <div className="scrollbar-none -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
        {subTabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              aria-current={active ? "true" : undefined}
              className={
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-bold transition " +
                (active
                  ? "border-[#17294b] bg-[#17294b] text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-[#17294b] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white")
              }
              key={t.id}
              onClick={() => setTab(t.id)}
              type="button"
            >
              <Icon name={t.icon} size={13} />
              {t.label}
            </button>
          );
        })}
        <span className="ml-auto hidden shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold text-slate-500 sm:inline-flex dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
          <Icon name="building" size={11} />
          Espace WUGAMS
        </span>
      </div>

      {/* Contenu Demandes */}
      {tab === "demandes" && (
        <div className="mt-3">
          {/* Stats résumé — monochrome épuré */}
          {all.length > 0 ? (
            <div className="mb-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-[#101c36]">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">En attente</p>
                <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#17294b] dark:text-white">{enAttente}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-[#101c36]">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Devis en cours</p>
                <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#17294b] dark:text-white">{enCours}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-[#101c36]">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Terminées</p>
                <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[#17294b] dark:text-white">{terminees}</p>
              </div>
            </div>
          ) : null}

          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Devis, services et réclamations — chaque demande suit son cycle
            </p>
            <button
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#17294b] px-4 py-2.5 text-[12px] font-bold text-white shadow-sm transition hover:bg-[#243a61] focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={() => setCompose(true)}
              type="button"
            >
              <Icon name="plus" size={14} />
              Nouvelle demande
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {all.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center dark:border-white/10 dark:bg-[#101c36]">
                <span className="mx-auto grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-400">
                  <Icon name="clipboard" size={20} />
                </span>
                <p className="mt-4 text-sm font-bold text-[#16233a] dark:text-slate-200">Aucune demande pour le moment</p>
                <p className="mt-1.5 max-w-72 text-xs leading-5 text-slate-400">
                  Décrivez votre besoin : devis, service ou réclamation. Réponse sous 24 h ouvrées.
                </p>
                <button
                  className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#17294b] px-4 py-2.5 text-[11px] font-bold text-white transition hover:bg-[#243a61]"
                  onClick={() => setCompose(true)}
                  type="button"
                >
                  <Icon name="plus" size={13} />
                  Créer ma première demande
                </button>
              </div>
            ) : (
              all.map((demande, index) => {
                const typeMeta = demandeTypeMeta[demande.type];
                const accent = statutAccent[demande.statut];
                return (
                  <motion.article
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-[#101c36] dark:hover:border-white/20"
                    initial={reduce ? undefined : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={demande.id}
                    transition={{ duration: 0.3, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-8 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
                          <Icon name={typeIcon[demande.type]} size={14} />
                        </span>
                        <div>
                          <StatusBadge tone={typeMeta.tone}>{typeMeta.label}</StatusBadge>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className={"size-1.5 rounded-full " + accent.dot} />
                            <span className={"text-[10px] font-semibold " + accent.label}>{demandeStatutMeta[demande.statut].label}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">{demande.date}</span>
                    </div>

                    <h3 className="mt-3.5 text-[13px] font-bold leading-5 tracking-[-0.02em] text-[#16233a] dark:text-slate-100">
                      {demande.objet}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{demande.detail}</p>

                    <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3 dark:border-white/5">
                      <button
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 transition hover:border-[#17294b]/30 hover:text-[#17294b] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:text-white"
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

          {all.length > 0 ? (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400">
                {all.length} demande{all.length > 1 ? "s" : ""} au total
              </span>
              {enAttente > 0 ? (
                <StatusBadge tone="info">{enAttente} en attente</StatusBadge>
              ) : null}
              {enCours > 0 ? (
                <StatusBadge tone="warning">Un devis vous attend</StatusBadge>
              ) : null}
            </div>
          ) : null}
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
              className="pointer-events-auto relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/20 bg-white p-4 shadow-2xl sm:max-w-lg sm:p-6 md:p-8 dark:border-white/10 dark:bg-[#0f1a2e]"
              initial={reduce ? undefined : { opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
              role="dialog"
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b47e1e]">Suivi de la demande</p>
                  <h3 className="mt-1.5 break-words pr-4 text-base font-bold leading-6 tracking-[-0.03em] text-[#16233a] sm:text-lg sm:leading-7 dark:text-white">
                    {selected.objet}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
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
                  className="grid size-8 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 sm:size-9"
                  onClick={() => setSelected(null)}
                  type="button"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>

              <p className="mt-3 break-words rounded-2xl bg-slate-50 p-3 text-[12px] leading-5 text-slate-600 sm:mt-4 sm:p-4 sm:leading-6 dark:bg-white/[0.04] dark:text-slate-300">
                {selected.detail}
              </p>

              <div className="mt-4 sm:mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Cycle de traitement</p>
                <div className="mt-3 sm:mt-4">
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
              className="pointer-events-auto relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/20 bg-white p-4 shadow-2xl sm:max-w-xl sm:p-6 md:p-8 dark:border-white/10 dark:bg-[#0f1a2e]"
              initial={reduce ? undefined : { opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
              role="dialog"
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b47e1e]">Espace client</p>
                  <h3 className="mt-1.5 break-words text-base font-bold tracking-[-0.03em] text-[#16233a] sm:text-lg dark:text-white">
                    Nouvelle demande
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
                    Un chargé de projet vous répond sous 24 h ouvrées — sans engagement.
                  </p>
                </div>
                <button
                  aria-label="Fermer"
                  className="grid size-8 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 sm:size-9"
                  onClick={() => setCompose(false)}
                  type="button"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 sm:mt-5 sm:space-y-4">
                <div>
                  <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">Type de demande</p>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                     {(["DEVIS", "SERVICE", "RECLAMATION"] as DemandeType[]).map((option) => {
                      const isActive = type === option;
                      return (
                        <button
                          className={
                            "group flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-[11px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 sm:gap-1.5 sm:px-3 sm:py-3.5 sm:text-[12px] " +
                            (isActive
                              ? "border-[#17294b] bg-[#17294b] text-white shadow-sm"
                              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400")
                          }
                          key={option}
                          onClick={() => setType(option)}
                          type="button"
                        >
                          <span className={"grid size-8 shrink-0 place-items-center rounded-xl transition sm:size-9 " + (isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400")}>
                            <Icon name={typeIcon[option]} size={15} />
                          </span>
                          <span className="hidden leading-tight sm:block">{demandeTypeMeta[option].label}</span>
                          <span className="block leading-tight sm:hidden">{typeShortLabel[option]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400" htmlFor="demande-objet">
                    Objet
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[12px] font-semibold text-[#16233a] outline-none transition placeholder:text-slate-300 focus:border-[#17294b] focus:ring-2 focus:ring-[#17294b]/20 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-[13px] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
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
                    className="min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[12px] font-semibold text-[#16233a] outline-none transition placeholder:text-slate-300 focus:border-[#17294b] focus:ring-2 focus:ring-[#17294b]/20 sm:min-h-28 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-[13px] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                    id="demande-detail"
                    onChange={(event) => setDetail(event.target.value)}
                    placeholder="Décrivez votre besoin, vos contraintes et vos attentes…"
                    value={detail}
                  />
                </div>
                {errorMsg ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700 dark:border-red-900/30 dark:bg-red-950/30 dark:text-red-300">
                    {errorMsg}
                  </div>
                ) : null}
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#17294b] px-4 py-3 text-[12px] font-bold text-white shadow-sm transition hover:bg-[#243a61] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-2xl sm:py-3.5 sm:text-[13px]"
                  disabled={objet.trim().length < 8 || envoi}
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
