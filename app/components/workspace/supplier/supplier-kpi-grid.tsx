"use client";

import { motion } from "motion/react";

import { Icon, type IconName } from "@/app/components/ui/app-icon";
import type { SupplierKpis } from "@/app/lib/supplier-data";
import { formatQuantite } from "@/app/lib/supplier-data";

export type SupplierKpiPreset =
  | { type: "statut"; statut: "REAPPROVISIONNEMENT_REQUIS" | "RUPTURE" | "ARCHIVE" | "COMMANDE_EN_COURS" }
  | { type: "tous" }
  | { type: "sous_min" }
  | { type: "mouvements" };

type SupplierKpiGridProps = {
  kpis: SupplierKpis;
  onNavigate: (preset: SupplierKpiPreset) => void;
};

type KpiTile = {
  key: string;
  value: number | string;
  label: string;
  description: string;
  icon: IconName;
  accent: string;
  preset: SupplierKpiPreset | null;
};

export function SupplierKpiGrid({ kpis, onNavigate }: SupplierKpiGridProps) {
  const tiles: KpiTile[] = [
    {
      key: "total",
      value: kpis.total,
      label: "Produits",
      description: "au total dans votre catalogue",
      icon: "package",
      accent: "bg-[#2563eb]/10 text-[#2563eb] dark:bg-[#2563eb]/20 dark:text-sky-400",
      preset: { type: "tous" },
    },
    {
      key: "disponibles",
      value: kpis.disponibles,
      label: "Disponibles",
      description: "niveau de stock satisfaisant",
      icon: "check",
      accent: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
      preset: null,
    },
    {
      key: "reappro",
      value: kpis.reappro,
      label: "Réapprovisionnement requis",
      description: "produits sous le seuil minimum",
      icon: "warning",
      accent: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
      preset: { type: "statut", statut: "REAPPROVISIONNEMENT_REQUIS" },
    },
    {
      key: "rupture",
      value: kpis.rupture,
      label: "En rupture",
      description: "stock épuisé",
      icon: "trash",
      accent: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
      preset: { type: "statut", statut: "RUPTURE" },
    },
    ...(kpis.commandes > 0
      ? ([
          {
            key: "commandes",
            value: kpis.commandes,
            label: "Commandes en cours",
            description: "réapprovisionnement en cours",
            icon: "truck",
            accent: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400",
            preset: { type: "statut", statut: "COMMANDE_EN_COURS" },
          },
        ] as KpiTile[])
      : []),
    ...(kpis.archives > 0
      ? ([
          {
            key: "archives",
            value: kpis.archives,
            label: "Archivés",
            description: "retirés du suivi courant",
            icon: "folder",
            accent: "bg-slate-500/10 text-slate-500 dark:bg-slate-500/20 dark:text-slate-400",
            preset: { type: "statut", statut: "ARCHIVE" },
          },
        ] as KpiTile[])
      : []),
    {
      key: "quantite",
      value: formatQuantite(kpis.quantiteTotale),
      label: "Quantité disponible",
      description: "unités au total en stock",
      icon: "boxes",
      accent: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
      preset: { type: "sous_min" },
    },
    {
      key: "mouvements",
      value: kpis.mouvements30j,
      label: "Mouvements récents",
      description: "sur les 30 derniers jours",
      icon: "history",
      accent: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
      preset: { type: "mouvements" },
    },
    {
      key: "filiales",
      value: kpis.filiales,
      label: "Filiales",
      description: "où vos produits sont utilisés",
      icon: "building",
      accent: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400",
      preset: { type: "tous" },
    },
  ];

  return (
    <section aria-label="Indicateurs clés">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">
        {tiles.map((tile, index) => {
          const content = (
            <div className="flex h-full items-start gap-3">
              <span className={"grid size-10 shrink-0 place-items-center rounded-xl " + tile.accent}>
                <Icon name={tile.icon} size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-[22px] font-extrabold leading-7 tabular-nums tracking-tight text-[#17294b] dark:text-slate-100">
                  {tile.value}
                </p>
                <p className="truncate text-[11px] font-bold text-[#17294b] dark:text-slate-200">{tile.label}</p>
                <p className="mt-0.5 text-[10px] leading-4 text-slate-400">{tile.description}</p>
              </div>
            </div>
          );
          return (
            <motion.div
              animate={{ y: 0, opacity: 1 }}
              className={
                "rounded-3xl border border-slate-200/70 bg-white p-4 shadow-lg shadow-slate-950/[0.04] transition " +
                (tile.preset ? "hover:border-[#2563eb]/40 dark:hover:border-[#2563eb]/50" : "")
              }
              initial={{ y: 14, opacity: 0 }}
              key={tile.key}
              transition={{ delay: index * 0.05, duration: 0.35 }}
            >
              {tile.preset ? (
                <button className="block w-full text-left" onClick={() => onNavigate(tile.preset!)} type="button">
                  {content}
                </button>
              ) : (
                content
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
