"use client";

import { Icon } from "@/app/components/ui/app-icon";
import type { Produit } from "@/app/lib/contracts";
import { formatPrix, formatQuantite, relativeTime, statutMeta } from "@/app/lib/supplier-data";

type SupplierProductTableProps = {
  products: Produit[];
  onOpen: (productId: string) => void;
};

export function SupplierProductTable({ products, onOpen }: SupplierProductTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-950/[0.04] dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full text-left text-[12px]">
        <caption className="sr-only">Liste de vos produits</caption>
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
            <th className="px-5 py-3.5">Produit</th>
            <th className="px-3 py-3.5">Filiale</th>
            <th className="px-3 py-3.5 text-right">Prix unitaire</th>
            <th className="px-3 py-3.5 text-right">Quantité</th>
            <th className="px-3 py-3.5 text-right">Seuil</th>
            <th className="px-3 py-3.5">Statut</th>
            <th className="px-3 py-3.5">Dernière activité</th>
            <th className="px-5 py-3.5" />
          </tr>
        </thead>
        <tbody>
          {products.map((produit) => {
            const meta = statutMeta[produit.statut];
            return (
              <tr
                className="border-b border-slate-50 transition last:border-0 hover:bg-slate-50/60 dark:border-slate-800/60 dark:hover:bg-slate-800/30"
                key={produit.id}
              >
                <td className="max-w-56 px-5 py-3.5">
                  <p className="truncate font-extrabold text-[#17294b] dark:text-slate-100">{produit.nom}</p>
                  <p className="mt-0.5 font-mono text-[10px] font-semibold text-slate-400">{produit.reference}</p>
                </td>
                <td className="px-3 py-3.5 font-semibold text-slate-500 dark:text-slate-300">{produit.filiale?.nom ?? "—"}</td>
                <td className="px-3 py-3.5 text-right tabular-nums font-bold text-slate-600 dark:text-slate-300">{formatPrix(produit.prix_unitaire)}</td>
                <td className={"px-3 py-3.5 text-right tabular-nums font-extrabold " + (produit.quantite_actuelle === 0 ? "text-rose-600 dark:text-rose-400" : "text-[#17294b] dark:text-slate-100")}>
                  {formatQuantite(produit.quantite_actuelle)}
                </td>
                <td className="px-3 py-3.5 text-right tabular-nums font-semibold text-slate-400">{formatQuantite(produit.stock_minimum)}</td>
                <td className="px-3 py-3.5">
                  <span className={"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-extrabold ring-1 " + meta.badge}>
                    <span className={"size-1.5 rounded-full " + meta.dot} />
                    {meta.label}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-[11px] font-semibold text-slate-400">{relativeTime(produit.updated_at)}</td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#1e40af] px-3 text-[11px] font-extrabold text-white transition hover:bg-[#1e3a8a] active:scale-[0.98]"
                    onClick={() => onOpen(produit.id)}
                    type="button"
                  >
                    Voir
                    <Icon name="arrow-right" size={11} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
