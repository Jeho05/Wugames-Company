"use client";

import { useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import type { Produit } from "@/app/lib/contracts";
import {
  businessMessage,
  formatDate,
  formatDateTime,
  formatPrix,
  formatQuantite,
  mouvementMeta,
  relativeTime,
  statutMeta,
} from "@/app/lib/supplier-data";
import { SupplierStockLevel } from "@/app/components/workspace/supplier/supplier-stock-level";

type SupplierProductDetailsProps = {
  produit: Produit;
  onClose: () => void;
};

const toneClasses = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
  warn: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
  danger: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300",
  info: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300",
} as const;

export function SupplierProductDetails({ produit, onClose }: SupplierProductDetailsProps) {
  const [copied, setCopied] = useState(false);
  const meta = statutMeta[produit.statut];
  const message = businessMessage(produit);
  const mouvements = [...(produit.mouvements ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(produit.reference);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = produit.reference;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const infoRows: { label: string; value: string }[] = [
    { label: "Filiale", value: produit.filiale?.nom ?? "—" },
    { label: "Prix unitaire", value: formatPrix(produit.prix_unitaire) },
    { label: "Quantité actuelle", value: formatQuantite(produit.quantite_actuelle) },
    { label: "Seuil minimum", value: formatQuantite(produit.stock_minimum) },
    { label: "Créé le", value: formatDate(produit.created_at) },
    { label: "Dernière mise à jour", value: formatDateTime(produit.updated_at) },
  ];

  return (
    <div className="fixed inset-0 z-40 print:static">
      <div className="hidden print:block">
        <h1 className="mb-1 text-2xl font-extrabold text-[#17294b]">{produit.nom}</h1>
        <p className="mb-4 text-sm text-slate-500">
          Référence {produit.reference} · {produit.filiale?.nom ?? "Filiale inconnue"} · {formatDate(produit.updated_at)}
        </p>
        <table className="mb-4 w-full border-collapse text-left text-sm">
          <tbody>
            {infoRows.map((row) => (
              <tr className="border-b border-slate-200" key={row.label}>
                <th className="py-1.5 pr-4 font-semibold text-slate-500">{row.label}</th>
                <td className="py-1.5 font-bold text-[#17294b]">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-slate-400">
          Récapitulatif généré le {new Date().toLocaleString("fr-FR")} — données lues seules depuis le portail fournisseur WUGAMS.
        </p>
      </div>

      <div className="absolute inset-0 bg-slate-950/45 print:hidden" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 top-16 overflow-hidden rounded-t-[2rem] border-t border-slate-200 bg-white shadow-2xl lg:top-0 lg:left-auto lg:right-0 lg:w-[540px] lg:rounded-none lg:rounded-l-[2rem] lg:border-t-0 lg:border-l dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-full flex-col">
          <header className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <button
                aria-label="Fermer les détails"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white"
                onClick={onClose}
                type="button"
              >
                <Icon name="close" size={15} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-extrabold text-[#17294b] dark:text-slate-100">{produit.nom}</p>
                <p className="truncate font-mono text-[10px] font-semibold text-slate-400">{produit.reference}</p>
              </div>
              <button
                aria-label="Copier la référence"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white"
                onClick={copyReference}
                type="button"
              >
                <Icon name={copied ? "check" : "copy"} size={15} />
              </button>
              <button
                aria-label="Imprimer le récapitulatif"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white"
                onClick={() => window.print()}
                type="button"
              >
                <Icon name="print" size={15} />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-[max(env(safe-area-inset-bottom),24px)] pt-4 print:hidden">
            <div className="flex items-center justify-between">
              <span className={"inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold ring-1 " + meta.badge}>
                <span className={"size-1.5 rounded-full " + meta.dot} />
                {meta.label}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">MAJ {relativeTime(produit.updated_at)}</span>
            </div>

            <SupplierStockLevel produit={produit} />

            <div className={"rounded-2xl border px-4 py-3 text-[12px] font-semibold leading-5 " + toneClasses[message.tone]}>
              {message.message}
            </div>

            <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200/70 dark:divide-slate-800 dark:border-slate-800">
              {infoRows.map((row) => (
                <div className="flex items-center justify-between gap-4 px-4 py-2.5" key={row.label}>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{row.label}</dt>
                  <dd className="truncate text-[12px] font-extrabold text-[#17294b] dark:text-slate-100">{row.value}</dd>
                </div>
              ))}
            </dl>

            <section>
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Mouvements de stock</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {mouvements.length}
                </span>
              </div>
              {mouvements.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-[11px] font-semibold text-slate-400 dark:border-slate-700">
                  Aucun mouvement enregistré pour ce produit.
                </p>
              ) : (
                <ol className="space-y-2">
                  {mouvements.slice(0, 20).map((mouvement) => {
                    const movementMeta = mouvementMeta[mouvement.type];
                    return (
                      <li
                        className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-900"
                        key={mouvement.id}
                      >
                        <span className={"grid size-9 shrink-0 place-items-center rounded-xl ring-1 " + movementMeta.chip}>
                          <Icon name={movementMeta.icon} size={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-extrabold text-[#17294b] dark:text-slate-100">
                            {movementMeta.sign} {formatQuantite(mouvement.quantite)} · {movementMeta.label}
                          </p>
                          <p className="truncate text-[11px] font-semibold text-slate-400">
                            {mouvement.motif ?? "Sans motif"}
                            {mouvement.reference_externe ? ` · ${mouvement.reference_externe}` : ""}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold text-slate-400">{relativeTime(mouvement.created_at)}</span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            <p className="text-center text-[10px] font-semibold leading-4 text-slate-400">
              Besoin d&apos;informations complémentaires ?{" "}
              <a className="font-extrabold text-[#1e40af] dark:text-sky-400" href="mailto:contact@wugams.com">
                Contactez l&apos;administration WUGAMS
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
