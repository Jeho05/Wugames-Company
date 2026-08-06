"use client";

import { motion } from "motion/react";

import type { Produit } from "@/app/lib/contracts";
import { formatQuantite } from "@/app/lib/supplier-data";

type SupplierStockLevelProps = {
  produit: Produit;
};

function levelColor(produit: Produit): string {
  if (produit.statut === "RUPTURE") return "bg-rose-500";
  if (produit.statut === "REAPPROVISIONNEMENT_REQUIS") return "bg-amber-500";
  if (produit.statut === "COMMANDE_EN_COURS") return "bg-sky-500";
  return "bg-emerald-500";
}

export function SupplierStockLevel({ produit }: SupplierStockLevelProps) {
  const max = Math.max(produit.quantite_actuelle, produit.stock_minimum, 1);
  const ratio = Math.min(produit.quantite_actuelle / max, 1);
  const seuilRatio = Math.min(produit.stock_minimum / max, 1);

  return (
    <div aria-label={`Niveau de stock de ${produit.nom} : ${produit.quantite_actuelle} unités pour un seuil de ${produit.stock_minimum}`} role="img">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Niveau de stock</p>
          <p className="mt-1 text-[26px] font-extrabold leading-8 tabular-nums tracking-tight text-[#17294b] dark:text-slate-100">
            {formatQuantite(produit.quantite_actuelle)}
            <span className="ml-1.5 text-[13px] font-bold text-slate-400">/ {formatQuantite(produit.stock_minimum)} min</span>
          </p>
        </div>
        <p className="text-[10px] font-semibold text-slate-400">unités</p>
      </div>

      <div className="relative mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <motion.div
          animate={{ width: `${ratio * 100}%` }}
          className={"h-full rounded-full " + levelColor(produit)}
          initial={{ width: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.span
          aria-hidden="true"
          animate={{ left: `${seuilRatio * 100}%` }}
          className="absolute top-1/2 h-5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-400"
          initial={{ left: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[9px] font-semibold text-slate-400">
        <span>0</span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2.5 w-0.5 bg-slate-400" />
          seuil minimum
        </span>
        <span>{formatQuantite(max)}</span>
      </div>
    </div>
  );
}
