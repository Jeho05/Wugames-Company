"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/lib/auth-context";
import { Icon } from "@/app/components/ui/app-icon";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Veuillez renseigner votre adresse e-mail.");
      return;
    }

    login(email, password || "********");
    router.push("/espace");
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
        <input
          autoComplete="current-password"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
          id="password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Votre mot de passe"
          type="password"
          value={password}
        />
      </div>
      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
          <Icon name="warning" size={16} />
          {error}
        </div>
      ) : null}
      <div className="rounded-xl border border-sky-100 bg-[#edf6ff] px-3.5 py-2.5">
        <p className="text-[11px] leading-5 text-sky-800">
          <span className="font-bold">Mode démo.</span> Entrez n&apos;importe quel e-mail pour vous connecter. Votre rôle sera automatiquement détecté.
        </p>
      </div>
      <button
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17294b] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-[#243a61]"
        type="submit"
      >
        Se connecter
        <Icon name="arrow-right" size={17} />
      </button>
    </form>
  );
}
