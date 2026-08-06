"use client";

import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { ProduitStatut } from "@/app/lib/contracts";
import type { SupplierKpis } from "@/app/lib/supplier-data";
import { statutMeta } from "@/app/lib/supplier-data";

type SupplierProductStatusChartProps = {
  kpis: SupplierKpis;
};

export function SupplierProductStatusChart({ kpis }: SupplierProductStatusChartProps) {
  const total = Math.max(kpis.total, 1);
  const allSegments: { statut: ProduitStatut; count: number }[] = [
    { statut: "DISPONIBLE", count: kpis.disponibles },
    { statut: "REAPPROVISIONNEMENT_REQUIS", count: kpis.reappro },
    { statut: "COMMANDE_EN_COURS", count: kpis.commandes },
    { statut: "RUPTURE", count: kpis.rupture },
    { statut: "ARCHIVE", count: kpis.archives },
  ];
  const segments = allSegments.filter((segment) => segment.count > 0 || segment.statut === "DISPONIBLE");

  if (total <= 1 && kpis.total === 0) {
    return null;
  }

  return (
    <section
      aria-label="État du catalogue"
      className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-lg shadow-slate-950/[0.04] dark:border-slate-800 dark:bg-slate-900 lg:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-extrabold tracking-tight text-[#17294b] dark:text-slate-100">État de votre catalogue</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">Répartition de vos produits par statut de stock</p>
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-[#2563eb]/10 text-[#2563eb] dark:bg-[#2563eb]/20 dark:text-sky-400">
          <Icon name="chart" size={18} />
        </span>
      </div>

      <div
        aria-label={`${kpis.total} produits au total`}
        className="mt-5 flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
        role="img"
      >
        {segments.map((segment) => (
          <motion.div
            animate={{ width: `${(segment.count / total) * 100}%` }}
            aria-label={`${statutMeta[segment.statut].label} : ${segment.count} produit(s)`}
            className={"h-full first:rounded-l-full last:rounded-r-full " + statutMeta[segment.statut].bar}
            initial={{ width: 0 }}
            key={segment.statut}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
        {segments.map((segment) => {
          const meta = statutMeta[segment.statut];
          const percent = Math.round((segment.count / total) * 100);
          return (
            <li className="flex items-center gap-2.5" key={segment.statut}>
              <span className={"size-2.5 shrink-0 rounded-full " + meta.dot} />
              <div className="min-w-0">
                <p className="text-[16px] font-extrabold tabular-nums leading-5 text-[#17294b] dark:text-slate-100">{segment.count}</p>
                <p className="truncate text-[10px] font-semibold text-slate-500 dark:text-slate-400">{meta.label}</p>
              </div>
              <span className="ml-auto text-[10px] font-bold tabular-nums text-slate-400">{percent} %</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
