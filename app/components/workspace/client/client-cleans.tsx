"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ClientSection } from "@/app/components/workspace/client/client-section";
import { cleansPlans, cleansServiceStatutMeta, formatFcfa, groupServicesByDay } from "@/app/lib/cleans-data";
import type { CleansOverview, CleansService, CleansDayGroup } from "@/app/lib/cleans-data";

type ClientCleansProps = {
  cleans: CleansOverview;
  sectionId?: string;
  embedded?: boolean;
};

export function ClientCleans({ cleans, sectionId = "portail-cleans", embedded = false }: ClientCleansProps) {
  const [abonnement, setAbonnement] = useState(cleans.abonnement);
  const [services, setServices] = useState(cleans.services);
  const [choosing, setChoosing] = useState(false);
  const [proof, setProof] = useState<CleansService | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const actif = abonnement.statut === "ACTIF";
  const planActif = cleansPlans.find((plan) => plan.id === abonnement.planId) ?? null;
  const valides = services.filter((s) => s.statut === "VALIDE").length;
  const dayGroups = groupServicesByDay(services);

  function activer(planId: string) {
    const plan = cleansPlans.find((candidate) => candidate.id === planId);
    if (!plan) return;
    setAbonnement({
      statut: "ACTIF",
      planId: plan.id,
      planNom: plan.nom,
      nbToilettes: plan.nbToilettes,
      prixMensuel: plan.prixMensuel,
      dateDebut: "Vendredi 1er août 2026",
      prochainPaiement: "1er mois suivant activation",
      prochainPassage: "Demain · 08:00",
      localisation: abonnement.localisation,
    });
    setChoosing(false);
    setMessage(`Abonnement ${plan.nom} confirmé. Nos Cleaners vous rendent visite dès demain à 08:00.`);
  }

  function handleContactWugams() {
    setMessage("Veuillez contacter WUGAMS au +229 97 00 00 00 pour changer de plan.");
  }

  const cleansContent = (
    <>
      {/* Message bloquant si pas d'abonnement */}
      {!actif && !message ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-400/20 dark:bg-amber-400/10">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300">
            <Icon name="sparkles" size={22} />
          </span>
          <h3 className="mt-3 text-[15px] font-bold text-[#16233a] dark:text-slate-100">
            Activez un abonnement WUGAMS Clean
          </h3>
          <p className="mt-1.5 text-[12px] leading-5 text-slate-500 dark:text-slate-400">
            Veuillez activer un abonnement WUGAMS Clean pour accéder à votre espace de suivi.
          </p>
          <button
            className="mt-4 rounded-2xl bg-[#17294b] px-5 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#243a61]"
            onClick={() => setChoosing(true)}
            type="button"
          >
            Voir les plans
          </button>
        </div>
      ) : (
        <>
          {/* Carte abonnement */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-[#17294b] to-[#243a61] p-6 text-white shadow-lg shadow-[#17294b]/15 sm:p-7 dark:border-white/10">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f2c56d]">
                  {actif ? "Abonnement en cours" : "Aucun abonnement actif"}
                </p>
                <h3 className="mt-2.5 text-lg font-bold tracking-[-0.02em]">
                  {actif ? `${planActif?.nom ?? abonnement.planNom}` : "Choisissez votre plan"}
                </h3>
                <p className="mt-1.5 text-xs text-slate-300">
                  {abonnement.nbToilettes} toilettes · {formatFcfa(abonnement.prixMensuel)} / mois
                </p>
                {actif && abonnement.dateDebut ? (
                  <p className="mt-2.5 text-[11px] font-semibold text-slate-300">
                    <Icon name="calendar" size={13} className="mr-1 inline text-[#f2c56d]" />
                    Activé le {abonnement.dateDebut}
                  </p>
                ) : null}
                <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                  <Icon name="map" size={13} className="text-[#f2c56d]" />
                  {abonnement.localisation}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-300">Prochain passage</p>
                <p className="mt-1.5 text-sm font-bold">{abonnement.prochainPassage ?? "—"}</p>
                <p className="mt-1 text-[10px] text-slate-300">Prochain paiement : {abonnement.prochainPaiement ?? "—"}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-5 text-[11px] font-semibold text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check" size={13} className="text-emerald-400" />
                Preuve photo avant / après
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="calendar" size={13} className="text-emerald-400" />
                Calendrier des passages
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="bell" size={13} className="text-emerald-400" />
                Notifications actives
              </span>
            </div>
          </div>

          {/* Plans */}
          <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
            {cleansPlans.map((plan, index) => {
              const estPlanActif = actif && abonnement.planId === plan.id;
              return (
                <motion.div
                  className={
                    "relative flex flex-col rounded-3xl border bg-white p-5 shadow-sm transition sm:p-6 " +
                    (plan.premium
                      ? "border-[#f2c56d]/60 shadow-[#b47e1e]/10 dark:border-[#f2c56d]/30"
                      : "border-slate-200/80 dark:border-white/10") +
                    " dark:bg-[#101c36]"
                  }
                  initial={reduce ? undefined : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={plan.id}
                  transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  {plan.premium ? (
                    <span className="absolute -top-2.5 right-4 rounded-full bg-[#e3a641] px-3 py-1 text-[9px] font-extrabold uppercase tracking-wide text-white">
                      Recommandé
                    </span>
                  ) : null}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-[15px] font-bold tracking-[-0.02em] text-[#16233a] dark:text-slate-100">{plan.nom}</h4>
                      <p className="mt-1 text-[11px] text-slate-400">{plan.tagline}</p>
                    </div>
                    {estPlanActif ? (
                      <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                        Votre plan
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-5 text-2xl font-extrabold tabular-nums text-[#16233a] dark:text-white">
                    {plan.prixMensuel.toLocaleString("fr-FR")}
                    <span className="text-xs font-semibold text-slate-400"> FCFA / mois</span>
                  </p>
                  <ul className="mt-5 space-y-2">
                    {plan.avantages.map((avantage) => (
                      <li className="flex items-start gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400" key={avantage}>
                        <Icon name="check" size={13} className="mt-0.5 shrink-0 text-emerald-500" />
                        {avantage}
                      </li>
                    ))}
                  </ul>
                  {estPlanActif ? (
                    <button
                      className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[12px] font-bold text-amber-700"
                      onClick={handleContactWugams}
                      type="button"
                    >
                      Contacter WUGAMS pour changer
                    </button>
                  ) : (
                    <button
                      className="mt-6 rounded-2xl border border-[#17294b]/20 bg-[#17294b] px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#243a61] focus-visible:outline-2 focus-visible:outline-offset-2"
                      onClick={() => activer(plan.id)}
                      type="button"
                    >
                      {actif ? "Passer à ce plan" : "Activer ce plan"}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {message ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-semibold text-emerald-700">
              {message}
            </div>
          ) : null}

          {/* Calendrier des services rendus — organisés par jour */}
          {actif ? (
            <div className="mt-8">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h4 className="text-[13px] font-bold tracking-[-0.02em] text-[#16233a] dark:text-slate-100">
                    Calendrier des services rendus
                  </h4>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {valides} passage{valides > 1 ? "s" : ""} validé{valides > 1 ? "s" : ""} avec preuve photo
                  </p>
                </div>
              </div>
            <div className="mt-4 space-y-6">
                {dayGroups.map((group, gi) => (
                  <motion.div
                    className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#101c36]"
                    initial={reduce ? undefined : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={group.dateComplete}
                    transition={{ duration: 0.4, delay: gi * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3 dark:border-white/5 sm:gap-2">
                      <Icon name="calendar" size={14} className="shrink-0 text-[#17294b]" />
                      <p className="min-w-0 truncate text-[12px] font-bold text-[#16233a] dark:text-slate-100 sm:text-[13px]">
                        {group.jour} {group.dateComplete}
                      </p>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-white/[0.06]">
                        {group.services.length} toilette{group.services.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {group.services.map((service) => {
                        const meta = cleansServiceStatutMeta[service.statut];
                        const validé = service.statut === "VALIDE" || service.statut === "REALISE";
                        return (
                          <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 dark:border-white/5 dark:bg-white/[0.02]" key={service.id}>
                            <div className="flex items-start gap-3">
                              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#17294b] text-[11px] font-bold text-white">
                                {service.toiletteNumero}
                              </span>
                              <div className="min-w-0 flex-1 overflow-hidden">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <p className="text-[12px] font-bold text-[#16233a] dark:text-slate-100">
                                    Toilette #{service.toiletteNumero}
                                  </p>
                                  <span className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${meta.tone}`}>
                                    {meta.label}
                                  </span>
                                </div>
                                <p className="mt-0.5 truncate text-[10px] text-slate-400">{service.heure} · {service.cleaner}</p>
                              </div>
                            </div>
                            {service.photoAvant && service.photoApres ? (
                              <div className="flex items-center gap-2 sm:pl-11">
                                <button
                                  className="group/photo relative size-14 shrink-0 overflow-hidden rounded-xl sm:h-10 sm:w-12"
                                  onClick={() => setProof(service)}
                                  type="button"
                                >
                                  <img alt="Avant" className="h-full w-full object-cover" src={service.photoAvant} />
                                  <span className="absolute inset-0 grid place-items-center bg-slate-950/0 text-[7px] font-extrabold text-white opacity-0 transition group-hover/photo:bg-slate-950/40 group-hover/photo:opacity-100">
                                    AVANT
                                  </span>
                                </button>
                                <button
                                  className="group/photo relative size-14 shrink-0 overflow-hidden rounded-xl sm:h-10 sm:w-12"
                                  onClick={() => setProof(service)}
                                  type="button"
                                >
                                  <img alt="Après" className="h-full w-full object-cover" src={service.photoApres} />
                                  <span className="absolute inset-0 grid place-items-center bg-slate-950/0 text-[7px] font-extrabold text-white opacity-0 transition group-hover/photo:bg-slate-950/40 group-hover/photo:opacity-100">
                                    APRÈS
                                  </span>
                                </button>
                              </div>
                            ) : null}
                            {/* Notes du travailleur */}
                            {service.notesTravailleur ? (
                              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-400/20 dark:bg-amber-400/10">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                                  Note du travailleur
                                </p>
                                <p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-300">
                                  {service.notesTravailleur}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Sélecteur de plan */}
      <AnimatePresence>
        {choosing ? (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              aria-hidden="true"
              className="pointer-events-auto absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChoosing(false)}
            />
            <motion.div
              aria-label="Choisir un plan Wugams Cleans"
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
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b47e1e]">Wugams Cleans</p>
                  <h3 className="mt-1.5 text-lg font-bold tracking-[-0.03em] text-[#16233a] dark:text-white">
                    {actif ? "Votre abonnement est actif" : "Activer mon abonnement"}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {actif
                      ? "Pour changer de plan, contactez WUGAMS."
                      : "Confirmez votre choix : nos Cleaners commencent dès demain matin."}
                  </p>
                </div>
                <button
                  aria-label="Fermer"
                  className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2"
                  onClick={() => setChoosing(false)}
                  type="button"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {cleansPlans.map((plan) => {
                  const estPlanActif = abonnement.planId === plan.id;
                  return (
                    <button
                      className={
                        "flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 " +
                        (estPlanActif
                          ? "border-emerald-300 bg-emerald-50/60"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.03]")
                      }
                      key={plan.id}
                      onClick={() => estPlanActif ? handleContactWugams() : activer(plan.id)}
                      type="button"
                    >
                      <span>
                        <span className="block text-[13px] font-bold text-[#16233a] dark:text-slate-100">{plan.nom}</span>
                        <span className="mt-0.5 block text-[11px] text-slate-400">
                          {plan.nbToilettes} toilettes · {plan.prixMensuel.toLocaleString("fr-FR")} FCFA / mois
                        </span>
                      </span>
                      {estPlanActif ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                          <Icon name="check" size={12} /> Actif
                        </span>
                      ) : (
                        <Icon name="arrow-right" size={16} className="text-slate-300" />
                      )}
                    </button>
                  );
                })}
              </div>

              {actif ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] leading-5 text-amber-700">
                  Vous avez déjà un abonnement actif. Pour changer de plan, veuillez contacter WUGAMS.
                </div>
              ) : (
                <p className="mt-4 text-[11px] leading-5 text-slate-400">
                  Paiement par carte ou Mobile Money (MTN MoMo, Moov Money). Résiliable à tout moment.
                </p>
              )}
            </motion.div>
          </div>
        ) : null}

        {/* Preuve photo avant/après */}
        {proof ? (
          <div className="pointer-events-none fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-slate-950/90 p-4 backdrop-blur-sm">
            <button
              aria-label="Fermer la preuve"
              className="pointer-events-auto absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              onClick={() => setProof(null)}
              type="button"
            >
              <Icon name="close" size={18} />
            </button>
            <div className="grid w-full max-w-2xl grid-cols-2 gap-3">
              {proof.photoAvant ? (
                <figure className="overflow-hidden rounded-3xl shadow-2xl">
                  <img alt="Avant le service" className="max-h-[45vh] w-full object-cover" src={proof.photoAvant} />
                  <figcaption className="bg-white px-4 py-2.5 text-[11px] font-bold text-slate-500 dark:bg-[#0f1a2e] dark:text-slate-300">
                    Avant · Toilette #{proof.toiletteNumero}
                  </figcaption>
                </figure>
              ) : null}
              {proof.photoApres ? (
                <figure className="overflow-hidden rounded-3xl shadow-2xl">
                  <img alt="Après le service" className="max-h-[45vh] w-full object-cover" src={proof.photoApres} />
                  <figcaption className="bg-white px-4 py-2.5 text-[11px] font-bold text-emerald-600 dark:bg-[#0f1a2e]">
                    Après · validé
                  </figcaption>
                </figure>
              ) : null}
            </div>
            {proof.note ? (
              <p className="pointer-events-auto max-w-2xl rounded-2xl bg-white/10 px-4 py-3 text-center text-[12px] leading-5 text-slate-200">
                {proof.note}
              </p>
            ) : null}
            {proof.notesTravailleur ? (
              <div className="pointer-events-auto max-w-2xl rounded-2xl bg-amber-500/20 px-4 py-3 text-center text-[11px] leading-5 text-amber-200">
                <span className="font-bold">Note du travailleur :</span> {proof.notesTravailleur}
              </div>
            ) : null}
            <p className="pointer-events-auto text-[11px] font-semibold text-slate-400">
              {proof.cleaner} · {proof.date} · {proof.heure}
            </p>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );

  if (embedded) return cleansContent;

  return (
    <ClientSection
      action={
        actif ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            Abonnement actif
          </span>
        ) : (
          <button
            className="inline-flex items-center gap-1.5 rounded-2xl bg-[#17294b] px-4 py-2.5 text-[12px] font-bold text-white shadow-lg shadow-[#17294b]/15 transition hover:bg-[#243a61] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17294b]"
            onClick={() => setChoosing(true)}
            type="button"
          >
            <Icon name="plus" size={14} />
            Activer mon abonnement
          </button>
        )
      }
      icon="sparkles"
      id={sectionId}
      subtitle="Entretien de vos toilettes, preuve à l'appui à chaque passage"
      title="Mon Wugams Cleans"
    >
      {cleansContent}
    </ClientSection>
  );
}
