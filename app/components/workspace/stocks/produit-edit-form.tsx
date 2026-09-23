"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/app/components/ui/app-icon";
import { LoadingButton } from "@/app/components/ui/loading-button";
import { ProductImageUploader } from "@/app/components/workspace/stocks/product-image-uploader";
import { ApiError } from "@/app/lib/api-client";
import { listFiliales } from "@/app/lib/api/filiales";
import { listFournisseurs } from "@/app/lib/api/fournisseurs";
import { updateProduit } from "@/app/lib/api/stocks";
import {
  CATEGORIES_PRODUITS,
  type Filiale,
  type FournisseurProfile,
  type Produit,
  type ProduitStatut,
  type UpdateProduitPayload,
} from "@/app/lib/contracts";

type ProduitEditFormProps = {
  produit: Produit;
  onClose: () => void;
  onUpdated: () => void;
};

const STATUTS_OPTIONS: { value: ProduitStatut; label: string }[] = [
  { value: "DISPONIBLE", label: "Disponible" },
  { value: "REAPPROVISIONNEMENT_REQUIS", label: "Réapprovisionnement requis" },
  { value: "COMMANDE_EN_COURS", label: "Commande en cours" },
  { value: "RUPTURE", label: "Rupture de stock" },
  { value: "ARCHIVE", label: "Archivé" },
];

export function ProduitEditForm({ produit, onClose, onUpdated }: ProduitEditFormProps) {
  const [nom, setNom] = useState(produit.nom || "");
  const [reference, setReference] = useState(produit.reference || "");
  const [categorie, setCategorie] = useState<string>(produit.categorie || CATEGORIES_PRODUITS[0]);
  const [prixUnitaire, setPrixUnitaire] = useState<string>(String(produit.prix_unitaire ?? 0));
  const [quantiteActuelle, setQuantiteActuelle] = useState<string>(String(produit.quantite_actuelle ?? 0));
  const [stockMinimum, setStockMinimum] = useState<string>(String(produit.stock_minimum ?? 5));
  const [description, setDescription] = useState(produit.description || "");
  const [filialeId, setFilialeId] = useState<string>(produit.filiale_id || "");
  const [fournisseurId, setFournisseurId] = useState<string>(produit.fournisseur_id || "");
  const [statut, setStatut] = useState<ProduitStatut>(produit.statut || "DISPONIBLE");
  const [imageUrl, setImageUrl] = useState<string | null>(produit.image_url || null);

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

    const payload: UpdateProduitPayload = {
      nom: nom.trim(),
      reference: reference.trim().toUpperCase(),
      categorie: categorie || null,
      prix_unitaire: Number(prixUnitaire) || 0,
      quantite_actuelle: Number(quantiteActuelle) || 0,
      stock_minimum: Number(stockMinimum) || 0,
      description: description.trim() || null,
      // Découplage total : null détache la filiale / le fournisseur
      filiale_id: filialeId && filialeId !== "aucun" ? filialeId : null,
      fournisseur_id: fournisseurId && fournisseurId !== "aucun" ? fournisseurId : null,
      image_url: imageUrl || null,
      statut,
    };

    try {
      await updateProduit(produit.id, payload);
      onUpdated();
      onClose();
    } catch (err: unknown) {
      setApiError(
        err instanceof ApiError ? err.message : "Échec de la mise à jour du produit. Réessayez."
      );
      setSubmitting(false);
    }
  };

  return (
    <div
      aria-labelledby="produit-edit-title"
      aria-modal="true"
      className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      role="dialog"
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#d19331]">
            Modification Produit · {produit.reference}
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-[-0.035em] text-[#17294b]" id="produit-edit-title">
            {produit.nom}
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
        {/* Photo du produit */}
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
              type="text"
              value={reference}
            />
            {errors.reference && (
              <span className="mt-1 block text-[11px] font-bold text-rose-500">{errors.reference}</span>
            )}
          </label>

          {/* Catégorie (15 catégories) */}
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

          {/* Statut du produit */}
          <label className="block">
            <span className="text-xs font-bold text-slate-700">Statut du stock</span>
            <select
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
              onChange={(e) => setStatut(e.target.value as ProduitStatut)}
              value={statut}
            >
              {STATUTS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
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
              <span className="text-xs font-bold text-slate-700">Quantité en stock</span>
              <input
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
                min="0"
                onChange={(e) => setQuantiteActuelle(e.target.value)}
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
            className="inline-flex items-center gap-2 rounded-xl bg-[#17294b] px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-[#20365f] disabled:cursor-not-allowed disabled:opacity-60"
            loading={submitting}
            loadingLabel="Mise à jour…"
            type="submit"
          >
            <Icon name="check" size={16} />
            Mettre à jour
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
