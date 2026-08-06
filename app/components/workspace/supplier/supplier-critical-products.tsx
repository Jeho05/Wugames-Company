"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { Produit } from "@/app/lib/contracts";
import { formatQuantite, relativeTime, statutMeta } from "@/app/lib/supplier-data";

type SupplierCriticalProductsProps = {
  products: Produit[];
  onOpenProduct: (productId: string) => void;
  onViewMovements: (productId: string) => void;
};

const CRITICAL_STATUTS = ["RUPTURE", "REAPPROVISIONNEMENT_REQUIS", "COMMANDE_EN_COURS"] as const;

export function SupplierCriticalProducts({ products, onOpenProduct, onViewMovements }: SupplierCriticalProductsProps) {
  const critical = products
    .filter((product) => (CRITICAL_STATUTS as readonly string[]).includes(product.statut))
    .sort((a, b) => statutMeta[b.statut].severity - statutMeta[a.statut].severity);

  return (
    <section aria-label="Produits nécessitant une attention" className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-lg shadow-slate-950/[0.04] dark:border-slate-800 dark:bg-slate-900 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-extrabold tracking-tight text-[#17294b] dark:text-slate-100">Produits nécessitant une attention</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">Sous seuil minimum, en commande ou en rupture</p>
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
          <Icon name="warning" size={18} />
        </span>
      </div>

      {critical.length === 0 ? (
        <div className="mt-5 grid place-items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-800/40">
          <span className="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Icon name="check" size={22} />
          </span>
          <p className="text-[13px] font-bold text-slate-600 dark:text-slate-300">Tous vos produits disposent actuellement d&apos;un niveau de stock satisfaisant.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {critical.map((product, index) => {
            const meta = statutMeta[product.statut];
            return (
              <motion.li
                animate={{ y: 0, opacity: 1 }}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/50 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700"
                initial={{ y: 10, opacity: 0 }}
                key={product.id}
                transition={{ delay: index * 0.06 }}
              >
                <div className="flex items-start gap-3 p-4">
                  <span className={"mt-0.5 size-2.5 shrink-0 rounded-full " + meta.dot} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button className="truncate text-[13px] font-extrabold text-[#17294b] hover:text-[#2563eb] dark:text-slate-100" onClick={() => onOpenProduct(product.id)} type="button">
                        {product.nom}
                      </button>
                      <span className={"rounded-full px-2 py-0.5 text-[9px] font-extrabold ring-1 " + meta.badge}>{meta.label}</span>
                    </div>
                    <p className="mt-1 truncate text-[11px] font-semibold text-slate-400">
                      {product.reference} · {product.filiale?.nom ?? "—"}
                    </p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span className={product.quantite_actuelle === 0 ? "font-extrabold text-rose-600 dark:text-rose-400" : ""}>
                        {formatQuantite(product.quantite_actuelle)} unité{product.quantite_actuelle > 1 ? "s" : ""} en stock
                      </span>
                      <span className="text-slate-400">seuil minimum : {formatQuantite(product.stock_minimum)}</span>
                      <span className="ml-auto text-[10px] text-slate-400">mis à jour {relativeTime(product.updated_at)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#1e40af] px-3 text-[11px] font-extrabold text-white transition hover:bg-[#1e3a8a] active:scale-[0.98]"
                        onClick={() => onOpenProduct(product.id)}
                        type="button"
                      >
                        <Icon name="eye" size={12} />
                        Voir le détail
                      </button>
                      <button
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        onClick={() => onViewMovements(product.id)}
                        type="button"
                      >
                        <Icon name="history" size={12} />
                        Voir les mouvements
                      </button>
                      <a
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        href={`mailto:contact@wugams.com?subject=${encodeURIComponent(`Réapprovisionnement — ${product.reference} ${product.nom}`)}`}
                        type="button"
                      >
                        <Icon name="message" size={12} />
                        Contacter WUGAMS
                      </a>
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
