"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, authTrace } from "@/app/lib/api-client";
import { useAuth } from "@/app/lib/auth-context";
import { Icon } from "@/app/components/ui/app-icon";
import { LoadingButton } from "@/app/components/ui/loading-button";

const darkInput =
  "w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#e3a641] focus:bg-white/[0.08] focus:ring-4 focus:ring-[#e3a641]/15";

export function WorkerLoginForm() {
  const router = useRouter();
  // Même mécanisme centralisé que la connexion principale (useAuth().login
  // → hydrate → cookie vérifié → navigation). Seul le visuel diffère.
  const { login, pending2fa, verify2fa, retrySessionSync } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [syncRetryable, setSyncRetryable] = useState(false);

  function messageFrom(error: unknown): string {
    if (error instanceof ApiError) {
      if (error.statusCode === 401) return "Identifiants incorrects ou compte inactif. Contactez votre responsable.";
      if (error.statusCode === 429) return "Trop de tentatives, réessayez dans une minute.";
      if (error.statusCode === 0 || !error.statusCode) return "Impossible de contacter le serveur.";
      return error.message;
    }
    return "Une erreur est survenue. Veuillez réessayer.";
  }

  function isSyncFailure(err: unknown): boolean {
    return (
      err instanceof ApiError &&
      err.statusCode === 0 &&
      /navigation non confirmée|synchronisation de session/i.test(err.message)
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSyncRetryable(false);

    if (!email.trim()) {
      setError("Veuillez renseigner votre adresse e-mail.");
      return;
    }

    setSubmitting(true);
    try {
      const outcome = await login(email, password);
      if (outcome === "authenticated") {
        authTrace("navigation-ready", "worker-login-form → /espace");
        router.replace("/espace");
      }
    } catch (caught) {
      setError(messageFrom(caught));
      setSyncRetryable(isSyncFailure(caught));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRetrySync() {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await retrySessionSync();
      router.replace("/espace");
    } catch (caught) {
      setError(messageFrom(caught));
      setSyncRetryable(isSyncFailure(caught));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTwoFactorSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSyncRetryable(false);
    if (!twoFactorToken.trim()) {
      setError("Veuillez saisir le code à 6 chiffres.");
      return;
    }
    setSubmitting(true);
    try {
      await verify2fa(twoFactorToken);
      router.replace("/espace");
    } catch (caught) {
      setError(messageFrom(caught));
      setSyncRetryable(isSyncFailure(caught));
    } finally {
      setSubmitting(false);
    }
  }

  if (pending2fa) {
    return (
      <form className="mt-6 space-y-4" onSubmit={handleTwoFactorSubmit}>
        <div className="rounded-xl border border-amber-200/20 bg-amber-400/10 px-3.5 py-2.5">
          <p className="text-[11px] leading-5 text-amber-200">
            <span className="font-bold">Vérification en deux étapes.</span> Saisissez le code à 6
            chiffres de votre application d&apos;authentification.
          </p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-300" htmlFor="worker-2fa-token">
            Code 2FA
          </label>
          <input
            autoComplete="one-time-code"
            autoFocus
            className={darkInput + " tracking-[0.35em] placeholder:tracking-normal"}
            id="worker-2fa-token"
            inputMode="numeric"
            maxLength={6}
            onChange={(event) => setTwoFactorToken(event.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            required
            value={twoFactorToken}
          />
        </div>
        {error ? (
          <div className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3.5 py-2.5 text-xs font-semibold text-red-300">
            <Icon name="warning" size={16} />
            {error}
          </div>
        ) : null}
        <LoadingButton
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#f6cb76] to-[#e3a641] px-4 py-3.5 text-sm font-bold text-[#14223b] shadow-[0_14px_30px_-12px_rgba(227,166,65,0.8)] disabled:cursor-not-allowed disabled:opacity-60"
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

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1.5 block text-xs font-bold text-slate-300" htmlFor="worker-email">
          Adresse e-mail
        </label>
        <input
          autoComplete="email"
          className={darkInput}
          id="worker-email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="prenom.nom@wugams.com"
          type="email"
          value={email}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold text-slate-300" htmlFor="worker-password">
          Mot de passe
        </label>
        <div className="relative">
          <input
            autoComplete="current-password"
            className={darkInput + " pr-10"}
            id="worker-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Votre mot de passe"
            type={showPassword ? "text" : "password"}
            value={password}
          />
          <button
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            onClick={() => setShowPassword(!showPassword)}
            type="button"
          >
            <Icon name={showPassword ? "close" : "shield"} size={16} />
          </button>
        </div>
      </div>

      {error ? (
          <div className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3.5 py-2.5 text-xs font-semibold text-red-300">
            <Icon name="warning" size={16} />
            {error}
          </div>
        ) : null}
      {syncRetryable ? (
        <button
          className="w-full rounded-xl border border-[#e3a641]/40 bg-[#e3a641]/10 px-4 py-2.5 text-xs font-bold text-amber-200 transition hover:bg-[#e3a641]/20 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
          onClick={handleRetrySync}
          type="button"
        >
          Réessayer la connexion (sans ressaisir le mot de passe)
        </button>
      ) : null}

      <LoadingButton
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#f6cb76] to-[#e3a641] px-4 py-3.5 text-sm font-bold text-[#14223b] shadow-[0_14px_30px_-12px_rgba(227,166,65,0.8),inset_0_1px_0_rgba(255,255,255,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
        loading={submitting}
        loadingLabel="Connexion…"
        type="submit"
      >
        Accéder à mon espace
        <Icon name="arrow-right" size={17} />
      </LoadingButton>

      <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3">
        <p className="text-[11px] leading-5 text-slate-400">
          <span className="font-bold text-slate-300">Votre compte est créé par votre responsable WUGAMS.</span>{" "}
          Aucune inscription en libre accès. En cas d&apos;oubli du mot de passe, contactez votre responsable.
        </p>
      </div>
    </form>
  );
}