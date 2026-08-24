"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { formatFcfa } from "@/app/lib/store-data";
import type { ClientStdDevisView } from "@/app/lib/client-std-data";
import { DevisBadge } from "@/app/components/workspace/client/client-status";
import { ClientSection } from "@/app/components/workspace/client/client-section";

type ClientStdDevisProps = {
  devis: ClientStdDevisView[];
};

export function ClientStdDevis({ devis }: ClientStdDevisProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const enAttente = devis.filter((d) => d.statut === "EN_ATTENTE").length;

  function exportCsv() {
    const header = "Numéro;Objet;Montant;Date;Validité;Statut";
    const lines = devis.map((d) =>
      `${d.numero};${d.objet};${formatFcfa(d.montant)};${d.date};${d.validite};${d.statut}`
    );
    const csv = "\uFEFF" + [header, ...lines].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "devis-" + new Date().toISOString().slice(0, 10) + ".csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ClientSection
      action={
        enAttente > 0 ? (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700">
            {enAttente} devis en attente de réponse
          </span>
        ) : (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
            Aucun devis en attente
          </span>
        )
      }
      icon="sparkles"
      id="std-devis"
      subtitle="Vos demandes de devis, sans engagement"
      title="Mes devis"
    >
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {devis.map((quote, index) => {
          const isOpen = expanded === quote.id;
          return (
            <motion.article
              className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-950/[0.03] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/[0.08] dark:border-white/10 dark:bg-[#101c36] dark:shadow-none"
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              key={quote.id}
              transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{quote.numero}</p>
                    <h3 className="mt-1.5 line-clamp-2 text-[15px] font-bold leading-6 tracking-[-0.02em] text-[#16233a] dark:text-slate-100">
                      {quote.objet}
                    </h3>
                  </div>
                  <DevisBadge statut={quote.statut} />
                </div>

                <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4 dark:border-white/5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Montant</p>
                    <p className="mt-1 text-xl font-bold tabular-nums tracking-[-0.03em] text-[#16233a] dark:text-white">
                      {formatFcfa(quote.montant)}
                    </p>
                  </div>
                  <div className="text-right text-[11px] font-medium text-slate-400">
                    <p>{quote.date}</p>
                    <p className="mt-0.5">Validité : {quote.validite}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <button
                    aria-expanded={isOpen}
                    className={
                      "inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-[11px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 " +
                      (isOpen
                        ? "border-[#17294b] bg-[#17294b] text-white"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-[#17294b]")
                    }
                    onClick={() => setExpanded(isOpen ? null : quote.id)}
                    type="button"
                  >
                    {isOpen ? "Masquer" : "Voir"}
                    <Icon name="chevron-down" className={isOpen ? "rotate-180" : ""} size={13} />
                  </button>
                  <button
                    aria-label={`Télécharger ${quote.numero}`}
                    className="grid size-9.5 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-[#17294b] focus-visible:outline-2 focus-visible:outline-offset-2"
                    title="Télécharger le CSV"
                    type="button"
                    onClick={exportCsv}
                  >
                    <Icon name="download" size={15} />
                  </button>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    className="border-t border-slate-100 bg-[#fafbfd] px-5 py-4 dark:border-white/5 dark:bg-white/[0.02]"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <dl className="grid grid-cols-2 gap-3 text-[11px]">
                      <div className="rounded-xl border border-slate-200/70 bg-white p-3 dark:border-white/10 dark:bg-[#101c36]">
                        <dt className="font-bold uppercase tracking-wide text-slate-400">Émis le</dt>
                        <dd className="mt-1 font-semibold text-slate-700 dark:text-slate-300">{quote.date}</dd>
                      </div>
                      <div className="rounded-xl border border-slate-200/70 bg-white p-3 dark:border-white/10 dark:bg-[#101c36]">
                        <dt className="font-bold uppercase tracking-wide text-slate-400">Validité</dt>
                        <dd className="mt-1 font-semibold text-slate-700 dark:text-slate-300">{quote.validite}</dd>
                      </div>
                    </dl>
                    <p className="mt-3 text-[11px] leading-5 text-slate-400">
                      Ce devis est établi sans engagement. Pour le valider, contactez votre conseiller WUGAMS.
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </div>
    </ClientSection>
  );
}
