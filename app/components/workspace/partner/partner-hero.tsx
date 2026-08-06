"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Icon } from "@/app/components/ui/app-icon";
import { useAuth } from "@/app/lib/auth-context";
import type { StockStatus } from "@/app/lib/partner-data";

type PartnerHeroProps = {
  stockStatus: StockStatus;
  produitsCount: number;
  rupturesCount: number;
};

const statusMeta: Record<StockStatus, { label: string; emoji: string; chip: string; dot: string; glow: string }> = {
  sain: {
    label: "Stock sain",
    emoji: "🟢",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    glow: "bg-emerald-300/20",
  },
  faible: {
    label: "Stock faible",
    emoji: "🟡",
    chip: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    glow: "bg-amber-300/20",
  },
  critique: {
    label: "Rupture critique",
    emoji: "🔴",
    chip: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
    glow: "bg-rose-300/20",
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

export function PartnerHero({ stockStatus, produitsCount, rupturesCount }: PartnerHeroProps) {
  const { user } = useAuth();
  const now = useNow();
  const firstName = user?.name.split(" ")[0] ?? "Manager";
  const meta = statusMeta[stockStatus];

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
      aria-label="Vue logistique"
      className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white via-white/80 to-amber-50/70 shadow-xl shadow-slate-950/[0.04] backdrop-blur"
    >
      <div aria-hidden="true" className={`pointer-events-none absolute -right-24 -top-28 size-80 rounded-full blur-3xl ${meta.glow}`} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-sky-300/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e3a641]/40 to-transparent"
      />

      <div className="relative px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d19331]">
              Logistique & partenariats
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-[#17294b] sm:text-4xl">
              Bonjour, {firstName}.
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="capitalize">{dateLabel}</span>
              <span className="hidden size-1 rounded-full bg-slate-300 sm:block" aria-hidden="true" />
              <span className="font-mono text-[15px] font-semibold tabular-nums text-[#17294b]">{timeLabel}</span>
            </p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">
              Ressources, approvisionnements et livraisons : tout est visible pour décider au bon moment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <span className="grid size-9 place-items-center rounded-xl bg-sky-50 text-sky-600">
                <Icon name="package" size={17} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Produits référencés</p>
                <p className="text-lg font-bold tabular-nums text-[#17294b]">{produitsCount}</p>
              </div>
            </div>
            <div className={"inline-flex items-center gap-2.5 rounded-2xl border px-4 py-3 " + meta.chip}>
              <span className="text-lg" aria-hidden="true">
                {meta.emoji}
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">État global du stock</p>
                <p className="text-sm font-bold">
                  {meta.label}
                  {rupturesCount > 0 ? ` · ${rupturesCount} rupture(s)` : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { href: "/espace/fournisseurs?creer=1", label: "Ajouter un partenaire", icon: "building" as const },
            { href: "/espace/stocks?creer=1", label: "Ajouter un produit", icon: "package" as const },
            { href: "/espace/stocks", label: "Nouvelle entrée de stock", icon: "arrow-down" as const },
          ].map((action) => (
            <Link
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-[#17294b] px-4.5 py-3 text-sm font-bold text-white shadow-lg shadow-[#17294b]/20 transition hover:bg-[#243656] hover:shadow-[#17294b]/30 active:scale-[0.98]"
              href={action.href}
              key={action.label}
            >
              <span className="grid size-6 place-items-center rounded-lg bg-[#e3a641] text-[#14223b]">
                <Icon name={action.icon} size={14} />
              </span>
              {action.label}
              <Icon
                className="opacity-60 transition-transform duration-200 group-hover:translate-x-0.5"
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
