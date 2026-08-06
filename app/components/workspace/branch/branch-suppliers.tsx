"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { ExecutivePanel } from "@/app/components/workspace/executive/executive-panel";
import type { BranchSupplier } from "@/app/lib/branch-data";

type BranchSuppliersProps = {
  suppliers: BranchSupplier[];
};

const statutMeta: Record<BranchSupplier["statut"], { label: string; badge: string; dot: string }> = {
  actif: { label: "Commandes actives", badge: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  regulier: { label: "Régulier", badge: "border-sky-200 bg-sky-50 text-sky-700", dot: "bg-sky-500" },
  inactif: { label: "Inactif", badge: "border-slate-200 bg-slate-100 text-slate-500", dot: "bg-slate-400" },
};

export function BranchSuppliers({ suppliers }: BranchSuppliersProps) {
  return (
    <ExecutivePanel
      action={
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
          {suppliers.length} fournisseur(s) lié(s)
        </span>
      }
      icon="truck"
      subtitle="Consultation — liés aux produits de votre filiale"
      title="Fournisseurs"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {suppliers.map((supplier, index) => {
          const meta = statutMeta[supplier.statut];
          return (
            <motion.article
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-slate-950/[0.05]"
              initial={{ opacity: 0, y: 14 }}
              key={supplier.id}
              transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#10304f] to-[#1b446b] text-[12px] font-extrabold text-[#7dd3fc] shadow-md shadow-[#10304f]/20">
                  {supplier.raisonSociale.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-[#16233a]">{supplier.raisonSociale}</p>
                  <p className="truncate text-[10px] text-slate-400">{supplier.contact}</p>
                </div>
                <span className={"inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[8px] font-bold " + meta.badge}>
                  <span className={"size-1.5 rounded-full " + meta.dot} />
                  {meta.label}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-slate-100 bg-white px-2 py-2">
                  <p className="text-[14px] font-extrabold tabular-nums text-[#0f2a52]">{supplier.produits}</p>
                  <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">Produits</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white px-2 py-2">
                  <p className="text-[14px] font-extrabold tabular-nums text-[#0f2a52]">{supplier.commandes}</p>
                  <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">Commandes</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white px-2 py-2">
                  <p className="truncate text-[10px] font-bold text-[#0f2a52]">{supplier.derniereActivite}</p>
                  <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">Activité</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="truncate text-[10px] text-slate-400">{supplier.adresse}</p>
                <div className="flex shrink-0 gap-1.5">
                  <a
                    aria-label={`Contacter ${supplier.raisonSociale}`}
                    className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
                    href={`/espace/fournisseurs?id=${supplier.id}`}
                    title="Voir le fournisseur"
                  >
                    <Icon name="building" size={13} />
                  </a>
                  <a
                    aria-label={`Voir les produits de ${supplier.raisonSociale}`}
                    className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
                    href={`/espace/stocks?fournisseur=${supplier.id}`}
                    title="Voir ses produits"
                  >
                    <Icon name="package" size={13} />
                  </a>
                  <a
                    aria-label={`Téléphoner à ${supplier.raisonSociale}`}
                    className="grid size-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#0e9f9b]/50 hover:text-[#0e9f9b]"
                    href={`tel:${supplier.telephone.replace(/\s/g, "")}`}
                    title="Contacter"
                  >
                    <Icon name="message" size={13} />
                  </a>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </ExecutivePanel>
  );
}
