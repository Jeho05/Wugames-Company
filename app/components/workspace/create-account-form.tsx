"use client";

import { useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { ApiError } from "@/app/lib/api-client";
import { createUser } from "@/app/lib/api/users";
import type { RoleCode, User } from "@/app/lib/contracts";

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

type CreateAccountFormProps = {
  onClose: () => void;
  onCreated: (account: User) => void;
};

export function CreateAccountForm({ onClose, onCreated }: CreateAccountFormProps) {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<RoleCode>("ROLE_OUVRIER");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("L'email et le mot de passe sont obligatoires.");
      return;
    }
    setSubmitting(true);
    try {
      const account = await createUser({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        role,
        is_active: true,
      });
      onCreated(account);
    } catch (cause) {
      const apiError = cause as ApiError;
      const detail = apiError.details
        ? Object.values(apiError.details).flat().join(" · ")
        : "";
      setError(apiError.message + (detail ? " · " + detail : ""));
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#426b95] focus:outline-none focus:ring-2 focus:ring-[#426b95]/20";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b1530]/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold tracking-[-0.02em] text-[#17294b]">
            Créer un compte (API)
          </h2>
          <button
            aria-label="Fermer"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" size={17} />
          </button>
        </div>

        <form className="space-y-3.5 p-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold text-slate-500">Prénom</span>
              <input
                className={inputClass}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Awa"
                value={first_name}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold text-slate-500">Nom</span>
              <input
                className={inputClass}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Koné"
                value={last_name}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold text-slate-500">Email</span>
            <input
              className={inputClass}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="awa.kone@wugams.com"
              type="email"
              value={email}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold text-slate-500">Mot de passe</span>
              <input
                className={inputClass}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 6 caractères"
                type="password"
                value={password}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold text-slate-500">Téléphone</span>
              <input
                className={inputClass}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+225 07 00 00 00 00"
                value={phone}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold text-slate-500">Rôle</span>
            <select
              className={inputClass}
              onChange={(event) => setRole(event.target.value as RoleCode)}
              value={role}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {error ? (
            <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
              {error}
            </p>
          ) : null}

          <div className="flex gap-3 pt-1">
            <button
              className="flex-1 rounded-xl bg-[#e3a641] px-4 py-2.5 text-xs font-bold text-[#14223b] shadow-lg shadow-amber-600/15 transition hover:bg-[#efb653] disabled:opacity-60"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Création en cours…" : "Créer le compte"}
            </button>
            <button
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
              onClick={onClose}
              type="button"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
