"use client";

import { useState } from "react";

import { Icon } from "@/app/components/ui/app-icon";
import { TwoFaForm } from "@/app/components/workspace/two-fa-form";
import type { SupplierProfileView } from "@/app/lib/supplier-data";

type SupplierProfileProps = {
  profile: SupplierProfileView;
  onLogout: () => void;
  onTwoFactorChanged: () => void;
};

export function SupplierProfile({ profile, onLogout, onTwoFactorChanged }: SupplierProfileProps) {
  const [twoFaOpen, setTwoFaOpen] = useState(false);
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase() || "F";

  const rows: { label: string; value: string }[] = [
    { label: "Email", value: profile.email || "—" },
    { label: "Téléphone", value: profile.phone || "—" },
    { label: "Adresse", value: profile.adresse || "—" },
    { label: "N° d'identification", value: profile.siret || "—" },
    { label: "Identifiant fournisseur", value: profile.fournisseurId || "—" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-950/[0.04] dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-[#0f1c33] px-6 py-7 text-white">
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-[16px] font-extrabold ring-1 ring-white/15">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[16px] font-extrabold">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="mt-0.5 truncate text-[12px] font-bold text-sky-300">{profile.raisonSociale ?? "Compte fournisseur"}</p>
            </div>
            <span className="ml-auto hidden shrink-0 rounded-full bg-sky-500/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-sky-300 ring-1 ring-sky-400/25 sm:inline-flex">
              Fournisseur
            </span>
          </div>
        </div>
        <dl className="divide-y divide-slate-100 px-6 dark:divide-slate-800">
          {rows.map((row) => (
            <div className="flex items-center justify-between gap-4 py-3" key={row.label}>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{row.label}</dt>
              <dd className="truncate text-[12px] font-extrabold text-[#17294b] dark:text-slate-100">{row.value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Double authentification</dt>
            <dd>
              {profile.twoFactor ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-extrabold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <Icon name="shield" size={11} />
                  Activée
                </span>
              ) : (
                <button
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-[#1e40af] px-3.5 text-[11px] font-extrabold text-white transition hover:bg-[#1e3a8a]"
                  onClick={() => setTwoFaOpen(true)}
                  type="button"
                >
                  <Icon name="shield" size={12} />
                  Activer
                </button>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-col items-stretch gap-2.5 rounded-3xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <Icon name="message" size={17} />
          </span>
          <div className="min-w-0">
            <p className="text-[12px] font-extrabold text-[#17294b] dark:text-slate-100">Une question sur votre compte ?</p>
            <p className="text-[11px] font-semibold text-slate-400">L&apos;administration WUGAMS vous répond sous 48 h.</p>
          </div>
        </div>
        <a
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-[12px] font-extrabold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          href="mailto:contact@wugams.com?subject=Question — compte fournisseur"
        >
          <Icon name="mail" size={13} />
          Contacter l&apos;administration
        </a>
      </div>

      <button
        className="flex w-full min-h-12 items-center justify-center gap-2 rounded-3xl border border-rose-200 bg-rose-50/60 text-[13px] font-extrabold text-rose-700 transition hover:bg-rose-50 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/15"
        onClick={onLogout}
        type="button"
      >
        <Icon name="logout" size={14} />
        Se déconnecter
      </button>

      {twoFaOpen ? (
        <TwoFaForm
          onClose={() => {
            setTwoFaOpen(false);
            onTwoFactorChanged();
          }}
        />
      ) : null}
    </div>
  );
}
