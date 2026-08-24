"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { formatFcfa } from "@/app/lib/store-data";
import { formatDateFr } from "@/app/lib/client-data";
import type { Facture } from "@/app/lib/contracts";
import { FactureBadge } from "@/app/components/workspace/client/client-status";
import { ClientSection } from "@/app/components/workspace/client/client-section";

type ClientFacturesProps = {
  factures: Facture[];
};

export function ClientFactures({ factures }: ClientFacturesProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const totalEnAttente = factures
    .filter((f) => f.statut === "EMISE")
    .reduce((sum, f) => sum + Number(f.montant_ttc), 0);

  function exportCsv(_numero: string) {
    const header = "Numéro;Montant TTC;Émise le;Échéance;Statut";
    const lines = factures.map((f) =>
      `${f.numero};${formatFcfa(Number(f.montant_ttc))};${formatDateFr(f.date_emission)};${formatDateFr(f.date_echeance)};${f.statut}`
    );
    const csv = "\uFEFF" + [header, ...lines].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "factures-" + new Date().toISOString().slice(0, 10) + ".csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ClientSection
      action={
        totalEnAttente > 0 ? (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700">
            {formatFcfa(totalEnAttente)} à régler
          </span>
        ) : (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
            Tout est réglé
          </span>
        )
      }
      icon="file-text"
      id="portail-factures"
      subtitle="Toutes vos factures et paiements, au même endroit"
      title="Mes factures"
    >
      {factures.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center dark:border-white/15 dark:bg-white/[0.03]">
          <Icon name="file-text" size={22} className="text-slate-300" />
          <p className="text-sm font-bold text-[#16233a] dark:text-slate-200">Aucune facture pour le moment</p>
          <p className="max-w-64 text-xs leading-5 text-slate-400">
            Vos factures apparaîtront ici après l&apos;émission d&apos;un devis signé.
          </p>
        </div>
      ) : (
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-950/[0.03] dark:border-white/10 dark:bg-[#101c36]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 dark:border-white/5 dark:bg-white/[0.03]">
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Numéro</th>
                <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Montant</th>
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Émise le</th>
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Échéance</th>
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Statut</th>
                <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {factures.map((facture, index) => {
                const isOpen = expanded === facture.id;
                const montantTtc = Number(facture.montant_ttc);
                const montantHt = Number(facture.montant_ht);
                return (
                  <FragmentRow
                    facture={facture}
                    index={index}
                    isOpen={isOpen}
                    key={facture.id}
                    montantHt={montantHt}
                    montantTtc={montantTtc}
                    onToggle={() => setExpanded(isOpen ? null : facture.id)}
                    onExportCsv={exportCsv}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="border-t border-slate-100 px-5 py-3.5 text-[11px] font-medium text-slate-400 dark:border-white/5">
          Téléchargement PDF disponible pour chaque facture. Les règlements sont confirmés sous 24 h.
        </p>
      </div>
      )}
    </ClientSection>
  );
}

function FragmentRow({
  facture,
  index,
  isOpen,
  montantTtc,
  montantHt,
  onToggle,
  onExportCsv,
}: {
  facture: Facture;
  index: number;
  isOpen: boolean;
  montantTtc: number;
  montantHt: number;
  onToggle: () => void;
  onExportCsv: (numero: string) => void;
}) {
  return (
    <>
      <motion.tr
        className={
          "border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/[0.03] " +
          (isOpen ? "bg-slate-50/70 dark:bg-white/[0.03]" : "")
        }
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: index * 0.04 }}
      >
        <td className="px-5 py-4">
          <span className="text-[13px] font-bold text-[#16233a] dark:text-slate-100">{facture.numero}</span>
        </td>
        <td className="px-5 py-4 text-right text-[13px] font-bold tabular-nums text-[#16233a] dark:text-slate-100">
          {formatFcfa(montantTtc)}
        </td>
        <td className="px-5 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          {formatDateFr(facture.date_emission)}
        </td>
        <td className="px-5 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          {formatDateFr(facture.date_echeance)}
        </td>
        <td className="px-5 py-4">
          <FactureBadge statut={facture.statut} />
        </td>
        <td className="px-5 py-4">
          <div className="flex items-center justify-end gap-1.5">
            <button
              aria-label={`Télécharger ${facture.numero}`}
              className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-[#17294b] focus-visible:outline-2 focus-visible:outline-offset-2"
              title="Télécharger le CSV"
              type="button"
              onClick={() => onExportCsv(facture.numero)}
            >
              <Icon name="download" size={15} />
            </button>
            <button
              aria-expanded={isOpen}
              className={
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 " +
                (isOpen
                  ? "border-[#17294b] bg-[#17294b] text-white"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-[#17294b]")
              }
              onClick={onToggle}
              type="button"
            >
              {isOpen ? "Masquer" : "Voir"}
              <Icon name="chevron-down" className={isOpen ? "rotate-180" : ""} size={13} />
            </button>
          </div>
        </td>
      </motion.tr>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.tr
            className="border-b border-slate-100 bg-[#fafbfd] last:border-0 dark:border-white/5 dark:bg-white/[0.02]"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <td className="px-5 pb-5 pt-1" colSpan={6}>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-white/10 dark:bg-[#101c36]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Montant HT</p>
                  <p className="mt-1.5 text-sm font-bold tabular-nums text-[#16233a] dark:text-slate-100">
                    {formatFcfa(montantHt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-white/10 dark:bg-[#101c36]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Montant TTC</p>
                  <p className="mt-1.5 text-sm font-bold tabular-nums text-[#16233a] dark:text-slate-100">
                    {formatFcfa(montantTtc)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-white/10 dark:bg-[#101c36]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Exercice comptable</p>
                  <p className="mt-1.5 text-sm font-bold text-[#16233a] dark:text-slate-100">{facture.exercice_comptable}</p>
                </div>
              </div>
            </td>
          </motion.tr>
        ) : null}
      </AnimatePresence>
    </>
  );
}
