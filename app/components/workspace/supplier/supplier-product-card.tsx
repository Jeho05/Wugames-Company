"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { Produit } from "@/app/lib/contracts";
import { formatPrix, formatQuantite, relativeTime, statutMeta } from "@/app/lib/supplier-data";

type SupplierProductCardProps = {
  produit: Produit;
  index?: number;
  onOpen: (productId: string) => void;
};

export function SupplierProductCard({ produit, index = 0, onOpen }: SupplierProductCardProps) {
  const meta = statutMeta[produit.statut];
  const ratio = Math.min(produit.quantite_actuelle / Math.max(produit.stock_minimum, 1), 1);

  return (
    <motion.article
      animate={{ y: 0, opacity: 1 }}
      className="group overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-950/[0.04] transition hover:border-[#2563eb]/40 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-[#2563eb]/50"
      initial={{ y: 12, opacity: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.35 }}
    >
      <button className="block w-full p-4 text-left" onClick={() => onOpen(produit.id)} type="button">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-extrabold tracking-tight text-[#17294b] dark:text-slate-100">{produit.nom}</h3>
            <p className="mt-0.5 font-mono text-[11px] font-semibold text-slate-400">{produit.reference}</p>
          </div>
          <span className={"shrink-0 rounded-full px-2.5 py-1 text-[9px] font-extrabold ring-1 " + meta.badge}>{meta.label}</span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
          <Icon name="building" size={12} />
          <span className="truncate">{produit.filiale?.nom ?? "—"}</span>
          <span className="ml-auto shrink-0">{formatPrix(produit.prix_unitaire)}</span>
        </div>

        <div className="mt-3.5 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">En stock</p>
            <p className="mt-0.5 text-[20px] font-extrabold tabular-nums leading-6 text-[#17294b] dark:text-slate-100">
              {formatQuantite(produit.quantite_actuelle)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Seuil</p>
            <p className="mt-0.5 text-[13px] font-bold text-slate-500 dark:text-slate-300">{formatQuantite(produit.stock_minimum)}</p>
          </div>
        </div>

        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <motion.div
            animate={{ width: `${ratio * 100}%` }}
            className={"h-full rounded-full " + meta.bar}
            initial={{ width: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] font-semibold text-slate-400">
          <span>Dernière activité : {relativeTime(produit.updated_at)}</span>
          <span className="inline-flex items-center gap-1 font-extrabold text-[#2563eb] transition group-hover:gap-1.5 dark:text-sky-400">
            Voir
            <Icon name="arrow-right" size={11} />
          </span>
        </div>
      </button>
    </motion.article>
  );
}
