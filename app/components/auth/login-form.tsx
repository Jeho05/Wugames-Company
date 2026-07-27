"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/app/components/ui/app-icon";

export function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState("Gérant / SuperAdmin");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
          defaultValue="gerant@wugams.ci"
          id="email"
          name="email"
          type="email"
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
          defaultValue="********"
          id="password"
          name="password"
          type="password"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold text-slate-700" htmlFor="role">
          Profil de démonstration
        </label>
        <div className="relative">
          <select
            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#7ea5ca] focus:bg-white focus:ring-4 focus:ring-[#dceaf6]"
            id="role"
            onChange={(event) => setRole(event.target.value)}
            value={role}
          >
            <option>Gérant / SuperAdmin</option>
            <option>Manager Opérations</option>
            <option>Comptable</option>
            <option>Responsable Ouvriers</option>
          </select>
          <Icon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" name="chevron-down" size={16} />
        </div>
      </div>
      <button
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#17294b] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-[#243a61]"
        type="submit"
      >
        Accéder à l&apos;espace
        <Icon name="arrow-right" size={17} />
      </button>
      <p className="text-center text-[11px] leading-5 text-slate-400">
        Mode démo : le contrôle d&apos;accès, les tokens JWT et la 2FA seront activés avec l&apos;API.
      </p>
    </form>
  );
}
