"use client";

import { useState } from "react";
import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { CriticalProduct } from "@/app/lib/partner-data";

type PartnerCriticalProductsProps = {
  products: CriticalProduct[];
};

const prioriteMeta: Record<CriticalProduct["priorite"], { label: string; badge: string; dot: string; bar: string }> = {
  urgente: { label: "Urgente", badge: "border-rose-200 bg-rose-50 text-rose-700", dot: "bg-rose-500", bar: "bg-rose-500" },
  haute: { label: "Haute", badge: "border-orange-200 bg-orange-50 text-orange-700", dot: "bg-orange-500", bar: "bg-orange-500" },
  moyenne: { label: "Moyenne", badge: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500", bar: "bg-amber-500" },
};

export function PartnerCriticalProducts({ products }: PartnerCriticalProductsProps) {
  const [ordered, setOrdered] = useState<Set<string>>(() => new Set());

  function order(product: CriticalProduct) {
    setOrdered((prev) => new Set(prev).add(product.id));
  }

  return (
    <ExecutivePanel
      action={
        <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700">
          {products.length} sous le seuil
        </span>
      }
      icon="warning"
      subtitle="À réapprovisionner en priorité"
      title="Produits critiques"
    >
      <ul className="space-y-2">
        {products.map((product, index) => {
          const meta = prioriteMeta[product.priorite];
          const ratio = Math.min(Math.round((product.quantite / Math.max(product.seuil, 1)) * 100), 100);
          const isOrdered = ordered.has(product.id);
          return (
            <motion.li
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition hover:border-slate-200 hover:bg-white sm:flex-nowrap"
              initial={{ opacity: 0, x: -14 }}
              key={product.id}
              transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
                <Icon name="package" size={16} />
              </span>
              <div className="min-w-0 flex-1 basis-40">
                <p className="truncate text-[12px] font-bold text-[#16233a]">{product.nom}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  Dernière livraison : <span className="font-semibold text-slate-500">{product.derniereLivraison}</span>
                  {product.fournisseur ? ` · ${product.fournisseur}` : ""}
                </p>
              </div>
              <div className="w-28 shrink-0">
                <div className="mb-1 flex items-center justify-between text-[9px] font-bold text-slate-500">
                  <span>{product.quantite} restant(s)</span>
                  <span>seuil {product.seuil}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/70">
                  <motion.div
                    animate={{ width: `${ratio}%` }}
                    className={"h-full rounded-full " + meta.bar}
                    initial={{ width: 0 }}
                    transition={{ delay: 0.2 + index * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
              <span className={"inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold " + meta.badge}>
                <span className={"size-1.5 rounded-full " + meta.dot} />
                {meta.label}
              </span>
              <button
                aria-label={`Commander ${product.nom}`}
                className={
                  "inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-bold transition active:scale-[0.97] " +
                  (isOrdered
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "bg-[#17294b] text-white shadow-md shadow-[#17294b]/20 hover:bg-[#243656]")
                }
                onClick={() => order(product)}
                type="button"
              >
                <Icon name={isOrdered ? "check" : "plus"} size={12} />
                {isOrdered ? "Commande lancée" : "Commander"}
              </button>
            </motion.li>
          );
        })}
      </ul>
    </ExecutivePanel>
  );
}
