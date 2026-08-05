"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Icon } from "@/app/components/ui/app-icon";
import { useAuth } from "@/app/lib/auth-context";
import type { AccountantHealth } from "@/app/lib/accountant-data";

type AccountantHeroProps = {
  health: AccountantHealth;
  creances: string;
  tresorerie: string;
};

const healthMeta: Record<AccountantHealth, { label: string; dot: string; chip: string; glow: string }> = {
  excellente: {
    label: "Excellente",
    dot: "bg-emerald-400",
    chip: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    glow: "bg-emerald-400/15",
  },
  surveillance: {
    label: "Sous surveillance",
    dot: "bg-amber-400",
    chip: "border-amber-400/25 bg-amber-400/10 text-amber-300",
    glow: "bg-amber-400/15",
  },
  critique: {
    label: "Critique",
    dot: "bg-rose-500",
    chip: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    glow: "bg-rose-500/20",
  },
};

function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}

export function AccountantHero({ health, creances, tresorerie }: AccountantHeroProps) {
  const { user } = useAuth();
  const now = useNow();
  const firstName = user?.name.split(" ")[0] ?? "Comptable";
  const meta = healthMeta[health];

  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  const timeLabel = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);

  return (
    <section
      aria-label="Vue financière"
      className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0d1424] shadow-2xl shadow-black/40"
    >
      <div aria-hidden="true" className={`pointer-events-none absolute -right-32 -top-40 size-[420px] rounded-full blur-3xl ${meta.glow}`} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-44 -left-32 size-[380px] rounded-full bg-[#e3a641]/[0.07] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e3a641]/50 to-transparent"
      />

      <div className="relative px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e3a641]">
              WUGAMS Finances · Comptabilité
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
              Bonjour, {firstName}.
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
              <span className="capitalize">{dateLabel}</span>
              <span className="hidden size-1 rounded-full bg-slate-600 sm:block" aria-hidden="true" />
              <span className="font-mono text-[15px] font-semibold tabular-nums text-slate-200">{timeLabel}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 backdrop-blur">
              <span className="grid size-9 place-items-center rounded-xl bg-sky-400/10 text-sky-300">
                <Icon name="clock" size={17} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Créances</p>
                <p className="text-lg font-bold tabular-nums text-white">{creances}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 backdrop-blur">
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <Icon name="building" size={17} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Trésorerie</p>
                <p className="text-lg font-bold tabular-nums text-white">{tresorerie}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className={"inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold " + meta.chip}>
            <span className={"size-2 animate-pulse rounded-full " + meta.dot} />
            Situation financière : {meta.label}
          </span>

          <span aria-hidden="true" className="hidden h-5 w-px bg-white/10 sm:block" />

          {[
            { href: "/espace/factures?creer=1", label: "Nouvelle facture", icon: "plus" as const },
            { href: "/espace/factures", label: "Enregistrer un paiement", icon: "check" as const },
            { href: "/espace/statistiques", label: "Générer un rapport", icon: "file-text" as const },
          ].map((action) => (
            <Link
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-white/[0.06] px-4.5 py-3 text-sm font-bold text-white ring-1 ring-white/10 backdrop-blur transition hover:bg-white/[0.1] hover:ring-[#e3a641]/40 active:scale-[0.98]"
              href={action.href}
              key={action.label}
            >
              <span className="grid size-6 place-items-center rounded-lg bg-[#e3a641] text-[#14223b]">
                <Icon name={action.icon} size={14} />
              </span>
              {action.label}
              <Icon
                className="opacity-50 transition-transform duration-200 group-hover:translate-x-0.5"
                name="arrow-right"
                size={14}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
