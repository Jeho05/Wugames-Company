"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { LoadingButton } from "@/app/components/ui/loading-button";
import { useAuth } from "@/app/lib/auth-context";
import { ApiError } from "@/app/lib/api-client";
import { updateUser } from "@/app/lib/api/users";
import { updateClient } from "@/app/lib/api/clients";
import { getFidelite } from "@/app/lib/api/client-space";
import type { Fidelite } from "@/app/lib/contracts";
import { TwoFaForm } from "@/app/components/workspace/two-fa-form";

type AccountSheetProps = {
  open: boolean;
  onClose: () => void;
};

type ProfileOverrides = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  adresse?: string;
};

const clientRoles = new Set(["ROLE_CLIENT_STD", "ROLE_CLIENT_MEMBRE"]);

function overridesKey(userId: string): string {
  return `wugams-profile-overrides:${userId}`;
}

function readOverrides(userId: string): ProfileOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(overridesKey(userId));
    return raw ? (JSON.parse(raw) as ProfileOverrides) : {};
  } catch {
    return {};
  }
}

function writeOverrides(userId: string, overrides: ProfileOverrides): void {
  try {
    if (Object.keys(overrides).length === 0) window.localStorage.removeItem(overridesKey(userId));
    else window.localStorage.setItem(overridesKey(userId), JSON.stringify(overrides));
  } catch {
    /* stockage indisponible */
  }
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200";

/**
 * Panneau « Mon profil » — lit les infos déjà en cache (chargées au login),
 * sans nouvel appel. Seules les écritures vont au réseau (+ fidélité, lazy).
 * Le panneau est (re)monté à chaque ouverture : les champs partent des
 * valeurs cache + remplacements locaux en attente de synchro.
 */
export function AccountSheet({ open, onClose }: AccountSheetProps) {
  const { user, refreshUser } = useAuth();
  const [fidelite, setFidelite] = useState<Fidelite | null>(null);
  const [firstName, setFirstName] = useState(() => initialField(user?.id, "first_name", user?.firstName));
  const [lastName, setLastName] = useState(() => initialField(user?.id, "last_name", user?.lastName));
  const [phone, setPhone] = useState(() => initialField(user?.id, "phone", user?.phone));
  const [adresse, setAdresse] = useState(() => initialField(user?.id, "adresse", user?.adresse));
  const [pendingSync, setPendingSync] = useState(() =>
    user ? Object.keys(readOverrides(user.id)).length > 0 : false,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [twoFaOpen, setTwoFaOpen] = useState(false);

  // Fidélité : seule donnée absente du cache — chargement paresseux, best-effort.
  useEffect(() => {
    if (user && clientRoles.has(user.role)) {
      getFidelite()
        .then(setFidelite)
        .catch(() => {
          /* fidélité indisponible (ex. client STD) : on masque la carte */
        });
    }
  }, [user]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    if (open) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [open, onClose]);

  if (!open || !user) return null;
  const currentUser = user;

  const isClient = clientRoles.has(currentUser.role);
  const baseAdresse = currentUser.adresse ?? "";

  function messageFrom(caught: unknown): string {
    if (caught instanceof ApiError) {
      if (caught.statusCode === 403)
        return "Action non autorisée par le serveur — vos modifications sont gardées sur cet appareil.";
      if (caught.statusCode === 0 || !caught.statusCode)
        return "Serveur injoignable — vos modifications sont gardées sur cet appareil.";
      return caught.message;
    }
    return "Enregistrement impossible pour le moment — vos modifications sont gardées sur cet appareil.";
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    const nextOverrides: ProfileOverrides = {};
    let synced = true;

    const userPatch: { first_name?: string; last_name?: string; phone?: string; adresse?: string } = {};
    if (firstName.trim() !== (currentUser.firstName ?? "")) userPatch.first_name = firstName.trim();
    if (lastName.trim() !== (currentUser.lastName ?? "")) userPatch.last_name = lastName.trim();
    if (phone.trim() !== (currentUser.phone ?? "")) userPatch.phone = phone.trim();
    // Adresse : via /clients pour les clients (contrat spec), via /users sinon.
    const adresseDirty = adresse.trim() !== baseAdresse;
    if (adresseDirty && !isClient) userPatch.adresse = adresse.trim();

    if (Object.keys(userPatch).length > 0) {
      try {
        await updateUser(currentUser.id, userPatch);
      } catch (caught) {
        synced = false;
        if (userPatch.first_name !== undefined) nextOverrides.first_name = firstName.trim();
        if (userPatch.last_name !== undefined) nextOverrides.last_name = lastName.trim();
        if (userPatch.phone !== undefined) nextOverrides.phone = phone.trim();
        if (userPatch.adresse !== undefined) nextOverrides.adresse = adresse.trim();
        setError(messageFrom(caught));
      }
    }

    if (adresseDirty && isClient) {
      if (currentUser.clientProfileId) {
        try {
          await updateClient(currentUser.clientProfileId, { adresse: adresse.trim() });
        } catch (caught) {
          synced = false;
          nextOverrides.adresse = adresse.trim();
          setError((prev) => prev || messageFrom(caught));
        }
      } else {
        synced = false;
        nextOverrides.adresse = adresse.trim();
      }
    }

    if (synced) {
      writeOverrides(currentUser.id, {});
      setPendingSync(false);
      setNotice("Profil synchronisé avec le serveur.");
    } else {
      writeOverrides(currentUser.id, { ...readOverrides(currentUser.id), ...nextOverrides });
      setPendingSync(true);
      setNotice("Enregistré sur cet appareil — sera synchronisé dès que l'API répondra.");
    }
    await refreshUser();
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        aria-label="Fermer le profil"
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-label="Mon profil"
        className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-2xl dark:bg-[#0f1a2e]"
        role="dialog"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/5">
          <div>
            <p className="text-sm font-bold text-[#1a2943] dark:text-white">Mon profil</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className={"inline-block size-1.5 rounded-full " + (pendingSync ? "bg-amber-500" : "bg-emerald-500")} />
              {pendingSync ? "Modifications en attente de synchronisation" : "Synchronisé avec le serveur"}
            </p>
          </div>
          <button
            aria-label="Fermer"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-[#fafbfd] p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#17294b] to-[#3b5b8c] text-lg font-extrabold text-[#f2c56d]">
              {currentUser.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-[#16233a] dark:text-white">{currentUser.name}</p>
              <p className="truncate text-[11px] text-slate-400">{currentUser.email}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {currentUser.role} · {currentUser.filiale}
              </p>
            </div>
          </div>

          {error ? (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-800">
              <Icon name="warning" size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          ) : null}
          {notice ? (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700">
              <Icon name="check" size={16} className="mt-0.5 shrink-0" />
              {notice}
            </div>
          ) : null}

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Prénom</span>
                <input
                  className={inputClass + " mt-1.5"}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="Prénom"
                  value={firstName}
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Nom</span>
                <input
                  className={inputClass + " mt-1.5"}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Nom"
                  value={lastName}
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Téléphone</span>
              <input
                className={inputClass + " mt-1.5"}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+225 07 00 00 00 00"
                type="tel"
                value={phone}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Adresse</span>
              <input
                className={inputClass + " mt-1.5"}
                onChange={(event) => setAdresse(event.target.value)}
                placeholder="Rue, commune, ville…"
                value={adresse}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">E-mail (identifiant)</span>
              <input className={inputClass + " mt-1.5 opacity-60"} disabled value={currentUser.email} />
            </label>
            <LoadingButton
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17294b] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-[#243a61] disabled:cursor-not-allowed disabled:opacity-60"
              loading={saving}
              loadingLabel="Enregistrement…"
              onClick={handleSave}
              type="button"
            >
              Enregistrer mes informations
              <Icon name="check" size={16} />
            </LoadingButton>
          </div>

          {fidelite ? (
            <div className="flex items-center gap-4 rounded-2xl border border-[#e3a641]/25 bg-gradient-to-r from-[#e3a641]/[0.12] to-transparent px-4 py-3.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#17294b] text-[#f2c56d]">
                <Icon name="sparkles" size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#b47e1e]">Fidélité {fidelite.tier}</p>
                <p className="mt-0.5 text-sm font-extrabold tracking-tight text-[#16233a] dark:text-white">
                  {fidelite.points_actuels.toLocaleString("fr-FR")} pts
                </p>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-[#fafbfd] px-4 py-3.5 dark:border-white/5 dark:bg-white/[0.03]">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#17294b]/[0.06] text-[#17294b] dark:bg-white/[0.06] dark:text-slate-300">
                <Icon name="shield" size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Double authentification</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {currentUser.twoFactorEnabled ? "Activée — compte protégé" : "Recommandée pour vos accès"}
                </p>
              </div>
            </div>
            <button
              className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:border-slate-300 hover:text-[#17294b] dark:border-white/10 dark:text-slate-300"
              onClick={() => setTwoFaOpen(true)}
              type="button"
            >
              Gérer
            </button>
          </div>
        </div>
      </aside>
      {twoFaOpen ? (
        <TwoFaForm
          onClose={() => {
            setTwoFaOpen(false);
            void refreshUser();
          }}
        />
      ) : null}
    </div>
  );
}

function initialField(userId: string | undefined, key: keyof ProfileOverrides, cached: string | null | undefined): string {
  if (!userId) return cached ?? "";
  try {
    const raw = window.localStorage.getItem(overridesKey(userId));
    if (raw) {
      const overrides = JSON.parse(raw) as ProfileOverrides;
      if (overrides[key] !== undefined) return overrides[key] as string;
    }
  } catch {
    /* ignore */
  }
  return cached ?? "";
}
