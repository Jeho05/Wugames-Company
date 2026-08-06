"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import type { MouvementType } from "@/app/lib/contracts";
import { formatDate, formatQuantite, mouvementMeta, relativeTime, type SupplierMovementView } from "@/app/lib/supplier-data";

type SupplierMovementTimelineProps = { movements: SupplierMovementView[]; defaultProductId?: string };

type PeriodeKey = "all" | "7j" | "30j" | "90j";

const periodes: { key: PeriodeKey; label: string; days: number }[] = [
  { key: "all", label: "Toute la période", days: Infinity },
  { key: "7j", label: "7 derniers jours", days: 7 },
  { key: "30j", label: "30 derniers jours", days: 30 },
  { key: "90j", label: "90 derniers jours", days: 90 },
];

const selectClass =
  "min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";

function cutoffsDays(periode: PeriodeKey): number {
  const days = periodes.find((item) => item.key === periode)?.days ?? Infinity;
  return days === Infinity ? 0 : Date.now() - days * 86_400_000;
}

export function SupplierMovementTimeline({ movements, defaultProductId = "TOUS" }: SupplierMovementTimelineProps) {
  const [produitId, setProduitId] = useState(defaultProductId);
  const [type, setType] = useState<MouvementType | "TOUS">("TOUS");
  const [periode, setPeriode] = useState<PeriodeKey>("all");

  const produits = useMemo(() => {
    const map = new Map<string, string>();
    for (const mouvement of movements) map.set(mouvement.produitId, mouvement.produitNom);
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "fr"));
  }, [movements]);

  const filtered = useMemo(() => {
    const cutoff = cutoffsDays(periode);
    return movements
      .filter((mouvement) => {
        if (produitId !== "TOUS" && mouvement.produitId !== produitId) return false;
        if (type !== "TOUS" && mouvement.type !== type) return false;
        return new Date(mouvement.created_at).getTime() >= cutoff;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [movements, periode, produitId, type]);

  const totals = useMemo(() => {
    let entrees = 0;
    let sorties = 0;
    for (const mouvement of filtered) {
      if (mouvement.type === "ENTREE") entrees += mouvement.quantite;
      else if (mouvement.type === "SORTIE_VENTE" || mouvement.type === "SORTIE_CHANTIER") sorties += mouvement.quantite;
    }
    return { entrees, sorties };
  }, [filtered]);

  const groups = useMemo(() => {
    const map = new Map<string, SupplierMovementView[]>();
    for (const mouvement of filtered) {
      const key = new Date(mouvement.created_at).toDateString();
      const group = map.get(key);
      if (group) group.push(mouvement);
      else map.set(key, [mouvement]);
    }
    return [...map.entries()];
  }, [filtered]);

  const dayLabel = (dateKey: string) => {
    const date = new Date(dateKey);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
    if (date.toDateString() === yesterday.toDateString()) return "Hier";
    return formatDate(date.toISOString());
  };

  const hasFilters = produitId !== "TOUS" || type !== "TOUS" || periode !== "all";
  const resetFilters = () => {
    setProduitId("TOUS");
    setType("TOUS");
    setPeriode("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2.5 rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="min-w-44 flex-1">
          <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Produit</p>
          <select aria-label="Filtrer par produit" className={selectClass} onChange={(e) => setProduitId(e.target.value)} value={produitId}>
            <option value="TOUS">Tous les produits</option>
            {produits.map(([id, nom]) => (
              <option key={id} value={id}>{nom}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-44">
          <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Type</p>
          <select aria-label="Filtrer par type" className={selectClass} onChange={(e) => setType(e.target.value as MouvementType | "TOUS")} value={type}>
            <option value="TOUS">Tous les types</option>
            {(Object.keys(mouvementMeta) as MouvementType[]).map((mouvementType) => (
              <option key={mouvementType} value={mouvementType}>{mouvementMeta[mouvementType].label}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-48">
          <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Période</p>
          <select aria-label="Filtrer par période" className={selectClass} onChange={(e) => setPeriode(e.target.value as PeriodeKey)} value={periode}>
            {periodes.map((item) => (
              <option key={item.key} value={item.key}>{item.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            +{formatQuantite(totals.entrees)} entrées
          </span>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-extrabold text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300">
            −{formatQuantite(totals.sorties)} sorties
          </span>
        </div>
        {hasFilters ? (
          <button className="text-[11px] font-extrabold text-[#1e40af] dark:text-sky-400" onClick={resetFilters} type="button">
            Réinitialiser les filtres
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <Icon name="history" size={22} />
          </span>
          <p className="text-[13px] font-bold text-slate-600 dark:text-slate-300">Aucun mouvement sur cette période.</p>
        </div>
      ) : (
        <ol className="space-y-5">
          {groups.map(([dateKey, items]) => (
            <li key={dateKey}>
              <div className="mb-2 flex items-center gap-2.5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{dayLabel(dateKey)}</p>
                <div className="h-px flex-1 bg-slate-200/80 dark:bg-slate-800" />
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((mouvement) => {
                  const meta = mouvementMeta[mouvement.type];
                  return (
                    <div
                      className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white px-3.5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                      key={mouvement.id}
                    >
                      <span className={"grid size-10 shrink-0 place-items-center rounded-xl ring-1 " + meta.chip}>
                        <Icon name={meta.icon} size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-extrabold text-[#17294b] dark:text-slate-100">
                          {mouvement.produitNom} <span className="font-mono text-[10px] font-semibold text-slate-400">({mouvement.produitReference})</span>
                        </p>
                        <p className="truncate text-[11px] font-semibold text-slate-400">
                          {meta.label} · {mouvement.motif ?? "Sans motif"}
                          {mouvement.reference_externe ? ` · ${mouvement.reference_externe}` : ""}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={"text-[13px] font-extrabold tabular-nums " + (mouvement.type === "ENTREE" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-200")}>
                          {meta.sign} {formatQuantite(mouvement.quantite)}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400">
                          {mouvement.filialeNom ?? "—"} · {relativeTime(mouvement.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
