"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ApiError } from "@/app/lib/api-client";
import { useAuth } from "@/app/lib/auth-context";
import { confirmPasswordReset, requestPasswordReset } from "@/app/lib/api/auth";
import { Icon } from "@/app/components/ui/app-icon";
import { LoadingButton } from "@/app/components/ui/loading-button";

type ResetView = "reset-request" | "reset-confirm";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/espace";
  const { login, pending2fa, verify2fa } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetView, setResetView] = useState<ResetView | null>(null);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notice, setNotice] = useState("");

  function messageFrom(error: unknown): string {
    if (error instanceof ApiError) {
      if (error.statusCode === 401) return "Identifiants incorrects ou compte inactif.";
      if (error.statusCode === 429) return "Trop de tentatives, réessayez dans une minute.";
      if (error.statusCode === 0 || !error.statusCode) return "Impossible de contacter le serveur.";
      return error.message;
    }
    return "Une erreur est survenue. Veuillez réessayer.";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Veuillez renseigner votre adresse e-mail.");
      return;
    }

    setSubmitting(true);
    try {
      const outcome = await login(email, password);
      if (outcome === "authenticated") {
        router.push(redirectTo);
      }
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTwoFactorSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!twoFactorToken.trim()) {
      setError("Veuillez saisir le code à 6 chiffres.");
      return;
    }
    setSubmitting(true);
    try {
      await verify2fa(twoFactorToken);
      router.push(redirectTo);
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError("Veuillez renseigner votre adresse e-mail.");
      return;
    }
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setNotice("Si un compte existe pour cet e-mail, un lien de réinitialisation a été envoyé.");
      setResetView("reset-confirm");
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!resetToken.trim()) {
      setError("Veuillez saisir le code reçu par e-mail.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setSubmitting(true);
    try {
      await confirmPasswordReset(resetToken, newPassword);
      setNotice("Mot de passe réinitialisé. Vous pouvez vous connecter avec votre nouveau mot de passe.");
      setResetToken("");
      setNewPassword("");
      setResetView(null);
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      setSubmitting(false);
    }
  }

  if (pending2fa) {
    return (
      <form className="mt-6 space-y-4" onSubmit={handleTwoFactorSubmit}>
        <div className="rounded-xl border border-sky-100 bg-[#edf6ff] px-3.5 py-2.5">
          <p className="text-[11px] leading-5 text-sky-800">
            <span className="font-bold">Vérification en deux étapes.</span> Saisissez le code à 6
            chiffres de votre application d&apos;authentification.
          </p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700" htmlFor="2fa-token">
            Code 2FA
          </label>
          <input
            autoComplete="one-time-code"
            autoFocus
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm tracking-[0.35em] text-slate-800 outline-none transition placeholder:tracking-normal placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
            id="2fa-token"
            inputMode="numeric"
            maxLength={6}
            onChange={(event) => setTwoFactorToken(event.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            required
            value={twoFactorToken}
          />
        </div>
        {error ? (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
            <Icon name="warning" size={16} />
            {error}
          </div>
        ) : null}
        <LoadingButton
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17294b] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-[#243a61] disabled:cursor-not-allowed disabled:opacity-60"
          loading={submitting}
          loadingLabel="Vérification…"
          type="submit"
        >
          Valider le code
          <Icon name="arrow-right" size={17} />
        </LoadingButton>
      </form>
    );
  }

  if (resetView) {
    return (
      <form className="mt-6 space-y-4" onSubmit={resetView === "reset-request" ? handleResetRequest : handleResetConfirm}>
        <div className="rounded-xl border border-sky-100 bg-[#edf6ff] px-3.5 py-2.5">
          <p className="text-[11px] leading-5 text-sky-800">
            <span className="font-bold">Réinitialisation du mot de passe.</span>{" "}
            {resetView === "reset-request"
              ? "Indiquez l'e-mail de votre compte : nous vous enverrons un lien de réinitialisation."
              : "Saisissez le code reçu par e-mail et votre nouveau mot de passe."}
          </p>
        </div>

        {resetView === "reset-request" ? (
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700" htmlFor="reset-email">
              Adresse e-mail
            </label>
            <input
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
              id="reset-email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vous@exemple.com"
              type="email"
              value={email}
            />
          </div>
        ) : (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700" htmlFor="reset-token">
                Code de réinitialisation
              </label>
              <input
                autoComplete="one-time-code"
                autoFocus
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
                id="reset-token"
                onChange={(event) => setResetToken(event.target.value)}
                placeholder="Code reçu par e-mail"
                value={resetToken}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700" htmlFor="reset-password">
                Nouveau mot de passe
              </label>
              <input
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
                id="reset-password"
                minLength={8}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="8 caractères minimum"
                type="password"
                value={newPassword}
              />
            </div>
          </>
        )}

        {error ? (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
            <Icon name="warning" size={16} />
            {error}
          </div>
        ) : null}
        {notice ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700">
            <Icon name="check" size={16} />
            {notice}
          </div>
        ) : null}

        <LoadingButton
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17294b] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-[#243a61] disabled:cursor-not-allowed disabled:opacity-60"
          loading={submitting}
          loadingLabel={resetView === "reset-request" ? "Envoi…" : "Réinitialisation…"}
          type="submit"
        >
          {resetView === "reset-request" ? "Recevoir le lien" : "Réinitialiser le mot de passe"}
          <Icon name="arrow-right" size={17} />
        </LoadingButton>

        <button
          className="w-full text-center text-[11px] font-bold text-[#426b95] transition hover:text-[#17294b]"
          onClick={() => {
            setResetView(null);
            setError("");
            setNotice("");
          }}
          type="button"
        >
          ← Retour à la connexion
        </button>
      </form>
    );
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1.5 block text-xs font-bold text-slate-700" htmlFor="email">
          Adresse e-mail
        </label>
        <input
          autoComplete="email"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
          id="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="vous@exemple.com"
          type="email"
          value={email}
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700" htmlFor="password">
            Mot de passe
          </label>
          <button
            className="text-[11px] font-bold text-[#426b95] hover:text-[#17294b]"
            onClick={() => {
              setError("");
              setNotice("");
              setResetView("reset-request");
            }}
            type="button"
          >
            Mot de passe oublié ?
          </button>
        </div>
        <div className="relative">
          <input
            autoComplete="current-password"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
            id="password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Votre mot de passe"
            type={showPassword ? "text" : "password"}
            value={password}
          />
          <button
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            onClick={() => setShowPassword(!showPassword)}
            type="button"
          >
            <Icon name={showPassword ? "close" : "shield"} size={16} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
          <Icon name="warning" size={16} />
          {error}
        </div>
      ) : null}

      <LoadingButton
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17294b] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-[#243a61] disabled:cursor-not-allowed disabled:opacity-60"
        loading={submitting}
        loadingLabel="Connexion…"
        type="submit"
      >
        Se connecter
        <Icon name="arrow-right" size={17} />
      </LoadingButton>
    </form>
  );
}
