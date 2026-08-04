"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { LoadingButton } from "@/app/components/ui/loading-button";
import { ApiError } from "@/app/lib/api-client";
import { enable2fa, setup2fa } from "@/app/lib/api/auth";

type TwoFaFormProps = {
  onClose: () => void;
};

export function TwoFaForm({ onClose }: TwoFaFormProps) {
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setup2fa()
      .then((setup) => {
        if (cancelled) return;
        setSecret(setup.secret);
        setQrCode(setup.qr_code);
      })
      .catch((cause) => {
        if (cancelled) return;
        const apiError = cause as ApiError;
        setError(apiError.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleEnable(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!token.trim()) {
      setError("Saisissez le code à 6 chiffres de votre application d'authentification.");
      return;
    }
    setSubmitting(true);
    try {
      await enable2fa(token);
      setDone(true);
    } catch (cause) {
      const apiError = cause as ApiError;
      setError(apiError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b1530]/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold tracking-[-0.02em] text-[#17294b]">
            Sécurité · Authentification à deux facteurs
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

        {done ? (
          <div className="space-y-4 p-5 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Icon name="check" size={26} />
            </span>
            <div>
              <p className="text-sm font-bold text-[#17294b]">2FA activée avec succès</p>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                À la prochaine connexion, un code à 6 chiffres sera demandé après le mot de passe.
              </p>
            </div>
            <button
              className="w-full rounded-xl bg-[#17294b] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#243656]"
              onClick={onClose}
              type="button"
            >
              Fermer
            </button>
          </div>
        ) : (
          <div className="space-y-4 p-5">
            <p className="text-xs leading-5 text-slate-500">
              Scannez le QR code avec Google Authenticator ou une application compatible (Authy,
              FreeOTP…), puis validez avec le code généré.
            </p>

            {error ? (
              <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                {error}
              </p>
            ) : null}

            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              {qrCode ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="QR code TOTP"
                  className="size-28 shrink-0 rounded-lg bg-white p-1.5 shadow-sm"
                  src={qrCode}
                />
              ) : (
                <span className="grid size-28 shrink-0 place-items-center rounded-lg bg-white text-slate-300 shadow-sm">
                  <Icon name="shield" size={30} />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Clé secrète
                </p>
                <p className="mt-1 break-all font-mono text-xs font-bold text-[#233856]">
                  {secret || "Chargement…"}
                </p>
              </div>
            </div>

            <form className="space-y-3.5" onSubmit={handleEnable}>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold text-slate-500">
                  Code à 6 chiffres
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-center text-lg font-bold tracking-[0.4em] text-slate-800 placeholder:text-sm placeholder:tracking-normal placeholder:text-slate-300 focus:border-[#426b95] focus:outline-none focus:ring-2 focus:ring-[#426b95]/20"
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="••••••"
                  value={token}
                />
              </label>
              <div className="flex gap-3">
                <LoadingButton
                  className="flex-1 rounded-xl bg-[#e3a641] px-4 py-2.5 text-xs font-bold text-[#14223b] shadow-lg shadow-amber-600/15 transition hover:bg-[#efb653] disabled:opacity-60"
                  loading={submitting}
                  loadingLabel="Validation…"
                  type="submit"
                >
                  Activer la 2FA
                </LoadingButton>
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
        )}
      </div>
    </div>
  );
}
