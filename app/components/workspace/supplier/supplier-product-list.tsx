"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { Produit, ProduitStatut } from "@/app/lib/contracts";
import { statutLabel, statutMeta } from "@/app/lib/supplier-data";
import { SupplierProductCard } from "@/app/components/workspace/supplier/supplier-product-card";
import { SupplierProductTable } from "@/app/components/workspace/supplier/supplier-product-table";

export type SupplierListPreset = {
  statut?: "REAPPROVISIONNEMENT_REQUIS" | "RUPTURE" | "ARCHIVE" | "COMMANDE_EN_COURS";
  sousMin?: boolean;
};

type SupplierProductListProps = {
  products: Produit[];
  filiales: { id: string; nom: string }[];
  preset: SupplierListPreset | null;
  onOpenProduct: (productId: string) => void;
};

type SortKey = "nom" | "quantite" | "statut" | "updated";

const statutOptions: (ProduitStatut | "TOUS")[] = ["TOUS", "DISPONIBLE", "REAPPROVISIONNEMENT_REQUIS", "COMMANDE_EN_COURS", "RUPTURE", "ARCHIVE"];

export function SupplierProductList({ products, filiales, preset, onOpenProduct }: SupplierProductListProps) {
  const [query, setQuery] = useState("");
  const [statut, setStatut] = useState<ProduitStatut | "TOUS">(preset?.statut ?? "TOUS");
  const [filiale, setFiliale] = useState<string>("TOUTES");
  const [dispo, setDispo] = useState<"tous" | "disponibles" | "attention">("tous");
  const [sousMin, setSousMin] = useState(preset?.sousMin ?? false);
  const [sort, setSort] = useState<SortKey>("nom");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sheetOpen, setSheetOpen] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = products.filter((produit) => {
      if (statut !== "TOUS" && produit.statut !== statut) return false;
      if (filiale !== "TOUTES" && produit.filiale?.id !== filiale) return false;
      if (sousMin && produit.quantite_actuelle >= produit.stock_minimum) return false;
      if (dispo === "disponibles" && produit.statut !== "DISPONIBLE") return false;
      if (dispo === "attention" && !["REAPPROVISIONNEMENT_REQUIS", "COMMANDE_EN_COURS", "RUPTURE"].includes(produit.statut)) return false;
      if (q && !`${produit.nom} ${produit.reference}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const sorted = [...filtered];
    switch (sort) {
      case "nom":
        sorted.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
        break;
      case "quantite":
        sorted.sort((a, b) => b.quantite_actuelle - a.quantite_actuelle);
        break;
      case "statut":
        sorted.sort((a, b) => statutMeta[b.statut].severity - statutMeta[a.statut].severity);
        break;
      case "updated":
        sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
    }
    return sorted;
  }, [dispo, filiale, products, query, sort, sousMin, statut]);

  const activeFilters = (statut !== "TOUS" ? 1 : 0) + (filiale !== "TOUTES" ? 1 : 0) + (sousMin ? 1 : 0) + (dispo !== "tous" ? 1 : 0);

  const resetFilters = () => {
    setStatut("TOUS");
    setFiliale("TOUTES");
    setDispo("tous");
    setSousMin(false);
  };

  const renderFilterControls = (inSheet: boolean) => (
    <div className={inSheet ? "space-y-5" : "hidden items-start gap-2.5 md:flex"}>
      <div>
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Statut</p>
        <div className="flex flex-wrap gap-1.5">
          {statutOptions.map((option) => (
            <button
              aria-pressed={statut === option}
              className={
                "min-h-9 rounded-full px-3.5 text-[11px] font-bold transition " +
                (statut === option
                  ? option === "TOUS"
                    ? "bg-[#1e40af] text-white"
                    : "bg-[#1e40af] text-white"
                  : "border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300")
              }
              key={option}
              onClick={() => setStatut(option)}
              type="button"
            >
              {option === "TOUS" ? "Tous" : statutLabel(option)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Disponibilité</p>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { key: "tous", label: "Toutes" },
              { key: "disponibles", label: "Disponibles" },
              { key: "attention", label: "À surveiller" },
            ] as const
          ).map((option) => (
            <button
              aria-pressed={dispo === option.key}
              className={
                "min-h-9 rounded-full px-3.5 text-[11px] font-bold transition " +
                (dispo === option.key
                  ? "bg-[#1e40af] text-white"
                  : "border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300")
              }
              key={option.key}
              onClick={() => setDispo(option.key)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="md:w-44">
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Filiale</p>
        <select
          aria-label="Filtrer par filiale"
          className="min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          onChange={(event) => setFiliale(event.target.value)}
          value={filiale}
        >
          <option value="TOUTES">Toutes les filiales</option>
          {filiales.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nom}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Quantité</p>
        <button
          aria-pressed={sousMin}
          className={
            "inline-flex min-h-9 items-center gap-2 rounded-full px-3.5 text-[11px] font-bold transition " +
            (sousMin
              ? "bg-amber-500 text-white"
              : "border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300")
          }
          onClick={() => setSousMin((value) => !value)}
          type="button"
        >
          <Icon name="warning" size={12} />
          Sous le seuil minimum
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex min-h-11 flex-1 items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Icon className="shrink-0 text-slate-400" name="search" size={16} />
          <input
            aria-label="Rechercher par nom ou référence"
            className="w-full bg-transparent py-2.5 text-[13px] text-[#17294b] outline-none placeholder:text-slate-400 dark:text-slate-100"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un nom ou une référence…"
            type="search"
            value={query}
          />
        </div>
        <button
          aria-label="Ouvrir les filtres"
          className="relative grid size-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 md:hidden"
          onClick={() => setSheetOpen(true)}
          type="button"
        >
          <Icon name="settings" size={17} />
          {activeFilters > 0 ? (
            <span className="absolute -right-1 -top-1 grid size-4.5 place-items-center rounded-full bg-[#1e40af] text-[8px] font-extrabold text-white">
              {activeFilters}
            </span>
          ) : null}
        </button>
        <select
          aria-label="Trier les produits"
          className="min-h-11 rounded-2xl border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-600 shadow-sm outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          onChange={(event) => setSort(event.target.value as SortKey)}
          value={sort}
        >
          <option value="nom">Tri : nom</option>
          <option value="quantite">Tri : quantité</option>
          <option value="statut">Tri : statut</option>
          <option value="updated">Tri : dernière mise à jour</option>
        </select>
        <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex">
          {(["grid", "list"] as const).map((mode) => (
            <button
              aria-label={mode === "grid" ? "Affichage en grille" : "Affichage en liste"}
              aria-pressed={viewMode === mode}
              className={
                "grid size-11 place-items-center transition " +
                (viewMode === mode ? "bg-[#1e40af] text-white" : "text-slate-400 hover:text-slate-600")
              }
              key={mode}
              onClick={() => setViewMode(mode)}
              type="button"
            >
              <Icon name={mode === "grid" ? "grid" : "file-text"} size={16} />
            </button>
          ))}
        </div>
      </div>

      <div>{renderFilterControls(false)}</div>

      <div className="flex items-center justify-between">
        <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400">
          {visible.length} produit{visible.length > 1 ? "s" : ""}
          {activeFilters > 0 ? ` · ${activeFilters} filtre${activeFilters > 1 ? "s" : ""} actif${activeFilters > 1 ? "s" : ""}` : ""}
        </p>
        {activeFilters > 0 ? (
          <button className="text-[11px] font-extrabold text-[#1e40af] dark:text-sky-400" onClick={resetFilters} type="button">
            Réinitialiser les filtres
          </button>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <div className="grid place-items-center gap-2.5 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <span className="grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <Icon name="package" size={24} />
          </span>
          <p className="text-[13px] font-bold text-slate-600 dark:text-slate-300">
            {products.length === 0
              ? "Aucun produit ne vous est encore rattaché."
              : "Aucun de vos produits ne correspond à cette recherche."}
          </p>
          <p className="max-w-72 text-[11px] leading-5 text-slate-400">
            {products.length === 0
              ? "Contactez l'administration WUGAMS pour vérifier votre compte fournisseur."
              : "Modifiez les filtres ou la recherche pour afficher d'autres produits."}
          </p>
          {products.length === 0 ? (
            <a
              className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#1e40af] px-4 text-[12px] font-extrabold text-white transition hover:bg-[#1e3a8a]"
              href="mailto:contact@wugams.com?subject=Vérification de mon compte fournisseur"
            >
              <Icon name="message" size={13} />
              Contacter l&apos;administration
            </a>
          ) : (
            <button
              className="mt-1 text-[11px] font-extrabold text-[#1e40af] dark:text-sky-400"
              onClick={() => {
                resetFilters();
                setQuery("");
              }}
              type="button"
            >
              Réinitialiser la recherche
            </button>
          )}
        </div>
      ) : visible.length > 0 ? (
        viewMode === "list" ? (
          <>
            <div className="hidden sm:block">
              <SupplierProductTable onOpen={onOpenProduct} products={visible} />
            </div>
            <div className="grid gap-3 sm:hidden">
              {visible.map((produit, index) => (
                <SupplierProductCard index={index} key={produit.id} onOpen={onOpenProduct} produit={produit} />
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((produit, index) => (
              <SupplierProductCard index={index} key={produit.id} onOpen={onOpenProduct} produit={produit} />
            ))}
          </div>
        )
      ) : null}

      <AnimatePresence>
        {sheetOpen ? (
          <div aria-modal className="fixed inset-0 z-50" role="dialog">
            <motion.button
              animate={{ opacity: 1 }}
              aria-label="Fermer les filtres"
              className="absolute inset-0 h-full w-full bg-slate-950/45"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              type="button"
            />
            <motion.div
              animate={{ y: 0 }}
              className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-[2rem] border-t border-slate-200 bg-white p-6 pb-[max(env(safe-area-inset-bottom),24px)] dark:border-slate-800 dark:bg-slate-900"
              exit={{ y: "100%" }}
              initial={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-[16px] font-extrabold text-[#17294b] dark:text-slate-100">Filtres</h2>
                <button
                  aria-label="Fermer"
                  className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                  onClick={() => setSheetOpen(false)}
                  type="button"
                >
                  <Icon name="close" size={15} />
                </button>
              </div>
              {renderFilterControls(true)}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  className="min-h-12 rounded-2xl border border-slate-200 text-[13px] font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                  onClick={() => {
                    resetFilters();
                    setQuery("");
                  }}
                  type="button"
                >
                  Réinitialiser
                </button>
                <button
                  className="min-h-12 rounded-2xl bg-[#1e40af] text-[13px] font-extrabold text-white"
                  onClick={() => setSheetOpen(false)}
                  type="button"
                >
                  Voir {visible.length} produit{visible.length > 1 ? "s" : ""}
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
