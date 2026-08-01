"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";

export function RegisterForm() {
  const [accepted, setAccepted] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(true);
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700" htmlFor="first-name">
            Prénom
          </label>
          <input
            autoComplete="given-name"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
            id="first-name"
            name="firstName"
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="Votre prénom"
            required
            type="text"
            value={firstName}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700" htmlFor="last-name">
            Nom
          </label>
          <input
            autoComplete="family-name"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
            id="last-name"
            name="lastName"
            onChange={(event) => setLastName(event.target.value)}
            placeholder="Votre nom"
            required
            type="text"
            value={lastName}
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold text-slate-700" htmlFor="register-email">
          Adresse e-mail
        </label>
        <input
          autoComplete="email"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
          id="register-email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="vous@exemple.com"
          required
          type="email"
          value={email}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold text-slate-700" htmlFor="phone">
          Téléphone
        </label>
        <input
          autoComplete="tel"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
          id="phone"
          name="phone"
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+225 00 00 00 00 00"
          required
          type="tel"
          value={phone}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold text-slate-700" htmlFor="register-password">
          Créer un mot de passe
        </label>
        <div className="relative">
          <input
            autoComplete="new-password"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
            id="register-password"
            minLength={8}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="8 caractères minimum"
            required
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

      {notice ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
          <p className="text-[11px] leading-5 text-amber-800">
            <span className="font-bold">Inscription en libre accès temporairement suspendue.</span>{" "}
            Les comptes sont créés par l&apos;administration WUGAMS. Contactez-nous à l&apos;adresse
            admin@wugams.com pour ouvrir votre espace client ou fournisseur.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-sky-100 bg-[#edf6ff] px-3.5 py-2.5">
          <p className="text-[11px] leading-5 text-sky-800">
            <span className="font-bold">Espace client.</span> Votre compte sera automatiquement
            configuré pour accéder à nos services.
          </p>
        </div>
      )}

      <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-[11px] leading-5 text-slate-500">
        <input
          checked={accepted}
          className="mt-1 size-3.5 rounded border-slate-300 text-[#17294b] focus:ring-[#8db0d0]"
          onChange={(event) => setAccepted(event.target.checked)}
          required
          type="checkbox"
        />
        <span>
          J&apos;accepte les conditions d&apos;utilisation et la politique de confidentialité de WUGAMS.
        </span>
      </label>
      <button
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17294b] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-[#243a61] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!accepted}
        type="submit"
      >
        Créer mon espace
        <Icon name="arrow-right" size={17} />
      </button>
    </form>
  );
}
