"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/app/components/ui/app-icon";
import { LoadingButton } from "@/app/components/ui/loading-button";
import { ProductImageUploader } from "@/app/components/workspace/stocks/product-image-uploader";
import { ApiError } from "@/app/lib/api-client";
import { listFiliales } from "@/app/lib/api/filiales";
import { listFournisseurs } from "@/app/lib/api/fournisseurs";
import { createProduit } from "@/app/lib/api/stocks";
import {
  CATEGORIES_PRODUITS,
  type CreateProduitPayload,
  type Filiale,
  type FournisseurProfile,
} from "@/app/lib/contracts";
import type { ModuleRow } from "@/app/lib/demo-data";
import { produitRow } from "@/app/lib/module-data";

type ProduitCreateFormProps = {
  onClose: () => void;
  onSubmit: (row: ModuleRow) => void;
  onCreated: () => void;
};

export function ProduitCreateForm({ onClose, onSubmit, onCreated }: ProduitCreateFormProps) {
  const [nom, setNom] = useState("");
  const [reference, setReference] = useState("");
  const [categorie, setCategorie] = useState<string>(CATEGORIES_PRODUITS[0]);
  const [prixUnitaire, setPrixUnitaire] = useState<string>("0");
  const [quantiteActuelle, setQuantiteActuelle] = useState<string>("0");
  const [stockMinimum, setStockMinimum] = useState<string>("5");
  const [description, setDescription] = useState("");
  const [filialeId, setFilialeId] = useState<string>("");
  const [fournisseurId, setFournisseurId] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [filiales, setFiliales] = useState<Filiale[]>([]);
  const [fournisseurs, setFournisseurs] = useState<FournisseurProfile[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all([listFiliales().catch(() => []), listFournisseurs().catch(() => [])])
      .then(([fList, foList]) => {
        if (!cancelled) {
          setFiliales(fList);
          setFournisseurs(foList);
          setLoadingOptions(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingOptions(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!nom.trim()) errs.nom = "Le nom du produit est requis.";
    if (!reference.trim()) errs.reference = "La référence est requise.";
    if (!categorie) errs.categorie = "Veuillez sélectionner une catégorie.";
    const prix = Number(prixUnitaire);
    if (isNaN(prix) || prix < 0) errs.prix_unitaire = "Prix unitaire valide requis.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);

    const payload: CreateProduitPayload = {
      nom: nom.trim(),
      reference: reference.trim().toUpperCase(),
      categorie: categorie || null,
      prix_unitaire: Number(prixUnitaire) || 0,
      quantite_actuelle: Number(quantiteActuelle) || 0,
      stock_minimum: Number(stockMinimum) || 0,
      description: description.trim() || undefined,
      // Découplage total : null ou "" est accepté par l'API
      filiale_id: filialeId && filialeId !== "aucun" ? filialeId : null,
      fournisseur_id: fournisseurId && fournisseurId !== "aucun" ? fournisseurId : null,
      image_url: imageUrl || null,
    };

    try {
      const created = await createProduit(payload);
      onCreated();
      onSubmit(produitRow(created));
    } catch (err: unknown) {
      setApiError(
        err instanceof ApiError ? err.message : "Échec de l'enregistrement du produit. Réessayez."
      );
      setSubmitting(false);
    }
  };

  return (
    <div
      aria-labelledby="produit-create-title"
      aria-modal="true"
      className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      role="dialog"
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#d19331]">
            Catalogue & Stocks
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-[-0.035em] text-[#17294b]" id="produit-create-title">
            Nouveau produit
          </h2>
        </div>
        <button
          aria-label="Fermer"
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          onClick={onClose}
          type="button"
        >
          <Icon name="close" size={18} />
        </button>
      </div>

      <form className="mt-4 space-y-4" noValidate onSubmit={(e) => void handleSubmit(e)}>
        {/* Photo du produit (Double mode : Téléversement fichier ou URL) */}
        <ProductImageUploader
          label="Photo du produit"
          onChange={(url) => setImageUrl(url)}
          value={imageUrl}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Nom du produit */}
          <label className="block sm:col-span-2">
            <span className="text-xs font-bold text-slate-700">
              Nom du produit <span className="text-rose-500">*</span>
            </span>
            <input
              className={`mt-1.5 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                errors.nom
                  ? "border-rose-300 ring-4 ring-rose-100"
                  : "border-slate-200 focus:border-[#7ea5ca] focus:ring-4 focus:ring-[#dceaf6]"
              }`}
              onChange={(e) => {
                setNom(e.target.value);
                setErrors((prev) => ({ ...prev, nom: "" }));
              }}
              placeholder="Ex: Tournevis plats et cruciformes"
              type="text"
              value={nom}
            />
            {errors.nom && <span className="mt-1 block text-[11px] font-bold text-rose-500">{errors.nom}</span>}
          </label>

          {/* Référence */}
          <label className="block">
            <span className="text-xs font-bold text-slate-700">
              Référence / SKU <span className="text-rose-500">*</span>
            </span>
            <input
              className={`mt-1.5 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-xs font-medium uppercase text-slate-700 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                errors.reference
                  ? "border-rose-300 ring-4 ring-rose-100"
                  : "border-slate-200 focus:border-[#7ea5ca] focus:ring-4 focus:ring-[#dceaf6]"
              }`}
              onChange={(e) => {
                setReference(e.target.value);
                setErrors((prev) => ({ ...prev, reference: "" }));
              }}
              placeholder="OUT-TOU-001"
              type="text"
              value={reference}
            />
            {errors.reference && (
              <span className="mt-1 block text-[11px] font-bold text-rose-500">{errors.reference}</span>
            )}
          </label>

          {/* Catégorie (15 catégories officielles) */}
          <label className="block">
            <span className="text-xs font-bold text-slate-700">
              Catégorie <span className="text-rose-500">*</span>
            </span>
            <select
              className={`mt-1.5 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:bg-white ${
                errors.categorie
                  ? "border-rose-300 ring-4 ring-rose-100"
                  : "border-slate-200 focus:border-[#7ea5ca] focus:ring-4 focus:ring-[#dceaf6]"
              }`}
              onChange={(e) => {
                setCategorie(e.target.value);
                setErrors((prev) => ({ ...prev, categorie: "" }));
              }}
              value={categorie}
            >
              {CATEGORIES_PRODUITS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.categorie && (
              <span className="mt-1 block text-[11px] font-bold text-rose-500">{errors.categorie}</span>
            )}
          </label>

          {/* Prix unitaire */}
          <label className="block">
            <span className="text-xs font-bold text-slate-700">
              Prix unitaire (FCFA) <span className="text-rose-500">*</span>
            </span>
            <input
              className={`mt-1.5 w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                errors.prix_unitaire
                  ? "border-rose-300 ring-4 ring-rose-100"
                  : "border-slate-200 focus:border-[#7ea5ca] focus:ring-4 focus:ring-[#dceaf6]"
              }`}
              min="0"
              onChange={(e) => {
                setPrixUnitaire(e.target.value);
                setErrors((prev) => ({ ...prev, prix_unitaire: "" }));
              }}
              placeholder="7500"
              step="100"
              type="number"
              value={prixUnitaire}
            />
            {errors.prix_unitaire && (
              <span className="mt-1 block text-[11px] font-bold text-rose-500">{errors.prix_unitaire}</span>
            )}
          </label>

          {/* Stock actuel & Seuil min */}
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-xs font-bold text-slate-700">Stock initial</span>
              <input
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
                min="0"
                onChange={(e) => setQuantiteActuelle(e.target.value)}
                placeholder="50"
                step="1"
                type="number"
                value={quantiteActuelle}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-700">Seuil min.</span>
              <input
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
                min="0"
                onChange={(e) => setStockMinimum(e.target.value)}
                placeholder="10"
                step="1"
                type="number"
                value={stockMinimum}
              />
            </label>
          </div>

          {/* Filiale (Optionnelle - Découplage total) */}
          <label className="block">
            <span className="text-xs font-bold text-slate-700">
              Filiale / Entité <span className="text-[11px] font-normal text-slate-400">(optionnelle)</span>
            </span>
            <select
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
              disabled={loadingOptions}
              onChange={(e) => setFilialeId(e.target.value)}
              value={filialeId}
            >
              <option value="">Aucune filiale (Catalogue global holding)</option>
              {filiales.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nom} ({f.code})
                </option>
              ))}
            </select>
          </label>

          {/* Fournisseur (Optionnel - Découplage total) */}
          <label className="block">
            <span className="text-xs font-bold text-slate-700">
              Fournisseur <span className="text-[11px] font-normal text-slate-400">(optionnel)</span>
            </span>
            <select
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
              disabled={loadingOptions}
              onChange={(e) => setFournisseurId(e.target.value)}
              value={fournisseurId}
            >
              <option value="">Aucun fournisseur</option>
              {fournisseurs.map((fo) => (
                <option key={fo.id} value={fo.id}>
                  {fo.raison_sociale ?? fo.user?.email ?? fo.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </label>

          {/* Description */}
          <label className="block sm:col-span-2">
            <span className="text-xs font-bold text-slate-700">
              Description <span className="text-[11px] font-normal text-slate-400">(optionnelle)</span>
            </span>
            <textarea
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description technique ou caractéristiques du produit..."
              rows={2}
              value={description}
            />
          </label>
        </div>

        {apiError && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-medium text-rose-700">
            <Icon className="mt-0.5 shrink-0" name="warning" size={15} />
            <span>{apiError}</span>
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-2">
          <button
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300"
            disabled={submitting}
            onClick={onClose}
            type="button"
          >
            Annuler
          </button>
          <LoadingButton
            className="inline-flex items-center gap-2 rounded-xl bg-[#e3a641] px-4 py-2 text-xs font-bold text-[#14223b] shadow-lg shadow-amber-600/15 transition hover:bg-[#efb653] disabled:cursor-not-allowed disabled:opacity-60"
            loading={submitting}
            loadingLabel="Enregistrement…"
            type="submit"
          >
            <Icon name="plus" size={16} />
            Créer le produit
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
