"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/app/lib/api-client";
import { useAuth } from "@/app/lib/auth-context";
import { Icon } from "@/app/components/ui/app-icon";

const demoAccounts = [
  { label: "Gérant", email: "admin@wugams.com", password: "admin1234" },
  { label: "Client", email: "client.https@test.wugams", password: "Test1234!" },
  { label: "Ouvrier", email: "ouvrier.https@test.wugams", password: "Test1234!" },
];

export function LoginForm() {
  const router = useRouter();
  const { login, pending2fa, verify2fa } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        router.push("/espace");
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
      router.push("/espace");
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      setSubmitting(false);
    }
  }

  function handleDemoSelect(account: { email: string; password: string }) {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
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
        <button
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17294b] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-[#243a61] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Vérification…" : "Valider le code"}
          {!submitting ? <Icon name="arrow-right" size={17} /> : null}
        </button>
      </form>
    );
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      {/* Comptes de test back-end */}
      <div>
        <span className="text-[11px] font-semibold text-slate-400">Comptes de test :</span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {demoAccounts.map((acc) => (
            <button
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:border-[#7ea5ca] hover:bg-sky-50 hover:text-[#17294b]"
              key={acc.email}
              onClick={() => handleDemoSelect(acc)}
              type="button"
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>

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
          <button className="text-[11px] font-bold text-[#426b95] hover:text-[#17294b]" type="button">
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

      <button
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17294b] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-[#243a61] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={submitting}
        type="submit"
      >
        {submitting ? "Connexion…" : "Se connecter"}
        {!submitting ? <Icon name="arrow-right" size={17} /> : null}
      </button>
    </form>
  );
}
