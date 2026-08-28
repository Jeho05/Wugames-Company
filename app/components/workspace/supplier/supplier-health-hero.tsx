"use client";

import { Icon, type IconName } from "@/app/components/ui/app-icon";
import type { SupplierKpis } from "@/app/lib/supplier-data";

export type SupplierHealthState = "ok" | "attention" | "rupture" | "indisponible";

type SupplierHealthHeroProps = {
  firstName: string;
  raisonSociale: string | null;
  health: SupplierHealthState;
  unread: number;
  kpis: SupplierKpis;
  source: "api" | "demo";
  updatedAt: number;
  onViewProducts: () => void;
  onViewCritical: () => void;
  onViewNotifications: () => void;
  onRefresh: () => void;
};

const healthMeta: Record<
  SupplierHealthState,
  { label: string; tone: string; icon: IconName; message: string }
> = {
  ok: {
    label: "Tous vos produits sont disponibles",
    tone: "bg-emerald-500",
    icon: "check",
    message: "Le niveau de stock de votre catalogue est satisfaisant.",
  },
  attention: {
    label: "Certains produits nécessitent une attention",
    tone: "bg-amber-500",
    icon: "warning",
    message: "Un réapprovisionnement est à prévoir sur plusieurs de vos produits.",
  },
  rupture: {
    label: "Un ou plusieurs produits sont en rupture",
    tone: "bg-rose-500",
    icon: "warning",
    message: "Une rupture de stock est en cours. Consultez les produits concernés.",
  },
  indisponible: {
    label: "Données temporairement indisponibles",
    tone: "bg-slate-400",
    icon: "clock",
    message: "Impossible de charger vos données pour le moment. Réessayez dans quelques instants.",
  },
};

function formatUpdated(timestamp: number): string {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(timestamp));
}

export function SupplierHealthHero({
  firstName,
  raisonSociale,
  health,
  unread,
  kpis,
  source,
  updatedAt,
  onViewProducts,
  onViewCritical,
  onViewNotifications,
  onRefresh,
}: SupplierHealthHeroProps) {
  const meta = healthMeta[health];

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f1c33] via-[#14264a] to-[#1e3a8a] p-6 text-white shadow-xl shadow-blue-950/20 lg:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-[#2563eb]/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-24 size-56 rounded-full bg-emerald-400/10 blur-3xl" />

      <svg aria-hidden="true" className="absolute bottom-6 right-4 hidden h-32 w-64 opacity-20 lg:block" viewBox="0 0 240 120">
        <path d="M10 90 H60 L80 60 H130 L150 90 H230" fill="none" stroke="white" strokeDasharray="6 6" strokeWidth="1.5">
          {source === "api" ? <animate attributeName="stroke-dashoffset" dur="4s" repeatCount="indefinite" values="0;-24" /> : null}
        </path>
        <circle cx="60" cy="90" fill="none" r="7" stroke="white" strokeWidth="1.5" />
        <circle cx="150" cy="90" fill="none" r="7" stroke="white" strokeWidth="1.5" />
      </svg>

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-sky-300">
            <Icon name="boxes" size={13} />
            Portail fournisseur WUGAMS
          </p>
          <h1 className="mt-2 text-[24px] font-extrabold tracking-tight lg:text-[28px]">
            Bonjour, {firstName.split(" ")[0] || "fournisseur"}
          </h1>
          {raisonSociale ? <p className="mt-1 text-[13px] font-semibold text-slate-300">{raisonSociale}</p> : null}
          <p className="mt-2 text-[11px] font-medium text-slate-400">
            {new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold text-slate-200 backdrop-blur">
            <Icon name="shield" size={12} />
            Accès limité à vos produits (BR-05)
          </span>
          <button
            className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-3.5 py-1.5 text-[11px] font-extrabold text-white transition hover:bg-rose-400"
            onClick={onViewNotifications}
            type="button"
          >
            <Icon name="bell" size={12} />
            {unread} notification{unread > 1 ? "s" : ""} non lue{unread > 1 ? "s" : ""}
          </button>
        </div>
      </div>

      <div className="relative mt-6 flex flex-wrap items-center gap-3">
        <span className={"inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-extrabold " + (health === "ok" ? "bg-emerald-400/15 text-emerald-200" : health === "attention" ? "bg-amber-400/15 text-amber-200" : health === "rupture" ? "bg-rose-400/15 text-rose-200" : "bg-slate-400/15 text-slate-200")}>
          <span className={"size-2 rounded-full " + meta.tone} />
          {meta.label}
        </span>
        <span className="text-[11px] font-semibold text-slate-400">
          {kpis.disponibles} disponible{kpis.disponibles > 1 ? "s" : ""} · {kpis.reappro} sous seuil · {kpis.rupture} en rupture
        </span>
      </div>
      <p className="relative mt-2 text-[12px] leading-5 text-slate-400">{meta.message}</p>

      <div className="relative mt-6 flex flex-wrap items-center gap-2.5">
        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-[12px] font-extrabold text-[#14264a] shadow-lg transition hover:bg-slate-100 active:scale-[0.98]"
          onClick={onViewProducts}
          type="button"
        >
          <Icon name="package" size={15} />
          Voir mes produits
        </button>
        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-[12px] font-extrabold text-white backdrop-blur transition hover:bg-white/15 active:scale-[0.98]"
          onClick={onViewCritical}
          type="button"
        >
          <Icon name="warning" size={15} />
          Produits critiques
        </button>
        <button
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-[12px] font-extrabold text-white backdrop-blur transition hover:bg-white/15 active:scale-[0.98]"
          onClick={onRefresh}
          type="button"
        >
          <Icon name="refresh" size={15} />
          Actualiser
        </button>
      </div>

      <div className="relative mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-semibold text-slate-400">
        <span>
          Dernière actualisation : {formatUpdated(updatedAt)}
        </span>
        <span className="size-1.5 rounded-full bg-emerald-400" />
      </div>
    </section>
  );
}
