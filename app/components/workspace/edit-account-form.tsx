"use client";

import { useState } from "react";

import { AdminImageUploader } from "@/app/components/ui/admin-image-uploader";
import { Icon } from "@/app/components/ui/app-icon";
import { LoadingButton } from "@/app/components/ui/loading-button";
import { ApiError } from "@/app/lib/api-client";
import { removeUser, updateUser, type UpdateUserPayload } from "@/app/lib/api/users";
import type { Filiale, RoleCode, User } from "@/app/lib/contracts";

const roleOptions: { value: RoleCode; label: string }[] = [
  { value: "ROLE_OUVRIER", label: "Ouvrier" },
  { value: "ROLE_RESP_OUVRIERS", label: "Resp. ouvriers" },
  { value: "ROLE_SECRETAIRE", label: "Secrétaire" },
  { value: "ROLE_COMPTABLE", label: "Comptable" },
  { value: "ROLE_MGR_OPS", label: "Manager Opérations" },
  { value: "ROLE_MGR_PARTENAIRE", label: "Manager Partenariats" },
  { value: "ROLE_MGR_FILIALE", label: "Manager Filiale" },
  { value: "ROLE_CLIENT_STD", label: "Client standard" },
  { value: "ROLE_CLIENT_MEMBRE", label: "Client membre" },
  { value: "ROLE_FOURNISSEUR", label: "Fournisseur" },
  { value: "ROLE_DEV_DIGITAL", label: "Dev Digital" },
  { value: "ROLE_GERANT", label: "Gérant" },
];

type EditAccountFormProps = {
  account: User;
  filiales?: Filiale[];
  onClose: () => void;
  onUpdated: (updated: User) => void;
  onDeleted: (deletedId: string) => void;
};

export function EditAccountForm({ account, filiales = [], onClose, onUpdated, onDeleted }: EditAccountFormProps) {
  const [firstName, setFirstName] = useState(account.first_name ?? "");
  const [lastName, setLastName] = useState(account.last_name ?? "");
  const [phone, setPhone] = useState(account.phone ?? "");
  const [role, setRole] = useState<RoleCode>(account.role);
  const [filialeId, setFilialeId] = useState<string>(account.filiale?.id ?? account.filiale_id ?? "");
  const [isActive, setIsActive] = useState<boolean>(account.is_active ?? true);
  const [avatarUrl, setAvatarUrl] = useState<string>(account.avatar_url ?? "");
  const [localisation, setLocalisation] = useState<string>(account.localisation ?? "");
  const [adresse, setAdresse] = useState<string>(account.adresse ?? "");
  const [ville, setVille] = useState<string>(account.ville ?? "");
  const [latitude, setLatitude] = useState<string>(account.latitude != null ? String(account.latitude) : "");
  const [longitude, setLongitude] = useState<string>(account.longitude != null ? String(account.longitude) : "");

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload: UpdateUserPayload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || undefined,
        role,
        filiale_id: filialeId || null,
        is_active: isActive,
        avatar_url: avatarUrl.trim() || undefined,
        localisation: localisation.trim() || undefined,
        adresse: adresse.trim() || undefined,
        ville: ville.trim() || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      };

      const updated = await updateUser(account.id, payload);
      onUpdated(updated);
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.message);
      } else if (cause instanceof Error) {
        setError(cause.message);
      } else {
        setError("Impossible de mettre à jour le compte.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setError("");
    setDeleting(true);
    try {
      await removeUser(account.id);
      onDeleted(account.id);
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.message);
      } else if (cause instanceof Error) {
        setError(cause.message);
      } else {
        setError("Impossible de supprimer le compte.");
      }
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <div className="relative my-8 w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#0c1424] text-[#e3a641]">
              <Icon name="user" size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#17294b]">Modifier le compte</h2>
              <p className="text-xs text-slate-400">{account.email}</p>
            </div>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              <Icon name="warning" size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex justify-center pb-2">
            <AdminImageUploader
              label="Photo de profil / Avatar"
              value={avatarUrl}
              onChange={setAvatarUrl}
              bucket="avatars"
              pathPrefix={account.id}
              aspectRatio="avatar"
              hint="Format carré recommandé (JPG, PNG ou WEBP, max 5 Mo)"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Prénom
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#e3a641] focus:bg-white focus:outline-hidden"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ex: Koffi"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Nom
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#e3a641] focus:bg-white focus:outline-hidden"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ex: Mensah"
                required
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Téléphone
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#e3a641] focus:bg-white focus:outline-hidden"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+229 97 00 00 00"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Rôle système
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#e3a641] focus:bg-white focus:outline-hidden"
                value={role}
                onChange={(e) => setRole(e.target.value as RoleCode)}
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.value})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Filiale d'affectation
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#e3a641] focus:bg-white focus:outline-hidden"
                value={filialeId}
                onChange={(e) => setFilialeId(e.target.value)}
              >
                <option value="">Aucune filiale (Siège Holding)</option>
                {filiales.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nom} ({f.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Statut du compte
              </label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={
                  "flex w-full items-center justify-between rounded-xl border px-3.5 py-2 text-xs font-bold transition " +
                  (isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-100 text-slate-600")
                }
              >
                <span>{isActive ? "Compte Actif" : "Compte Inactif / Suspendu"}</span>
                <span className={"size-2.5 rounded-full " + (isActive ? "bg-emerald-500" : "bg-slate-400")} />
              </button>
            </div>
          </div>

          {/* Section Localisation (§5.2 API Guide) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#17294b] flex items-center gap-1.5">
              <Icon name="map" size={14} className="text-[#e3a641]" />
              Coordonnées géographiques & Localisation
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Localisation (description)
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 transition focus:border-[#e3a641] focus:outline-hidden"
                  value={localisation}
                  onChange={(e) => setLocalisation(e.target.value)}
                  placeholder="Ex: Cotonou, Haie Vive"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Ville
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 transition focus:border-[#e3a641] focus:outline-hidden"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  placeholder="Ex: Cotonou, Porto-Novo"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Adresse précise
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 transition focus:border-[#e3a641] focus:outline-hidden"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder="Ex: Rue 340, Immeuble Wu"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Latitude GPS
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 transition focus:border-[#e3a641] focus:outline-hidden font-mono"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Ex: 6.3654"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Longitude GPS
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 transition focus:border-[#e3a641] focus:outline-hidden font-mono"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Ex: 2.4183"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            {showConfirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-red-700">Confirmer ?</span>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
                >
                  {deleting ? "Suppression..." : "Oui, supprimer"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
              >
                <Icon name="trash" size={14} />
                Supprimer le compte
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Fermer
              </button>
              <LoadingButton
                className="rounded-xl bg-[#e3a641] px-5 py-2.5 text-xs font-bold text-[#0c1424] shadow-sm hover:bg-[#efb653] transition"
                loading={submitting}
                type="submit"
              >
                Enregistrer
              </LoadingButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
