"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Icon } from "@/app/components/ui/app-icon";
import { useAuth } from "@/app/lib/auth-context";
import { healthMeta, type ExecutiveHealth } from "@/app/lib/executive-data";

type ExecutiveHeroProps = {
  health: ExecutiveHealth;
};

const quickActions = [
  { href: "/espace/missions?creer=1", label: "Nouvelle mission", icon: "clipboard" as const },
  { href: "/espace/devis", label: "Nouvelle facture", icon: "file-text" as const },
  { href: "/espace/administration?creer=1", label: "Ajouter un utilisateur", icon: "users" as const },
];

function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}

export function ExecutiveHero({ health }: ExecutiveHeroProps) {
  const { user } = useAuth();
  const now = useNow();
  const meta = healthMeta[health];
  const firstName = user?.name.split(" ")[0] ?? "Gérant";

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
      aria-label="Vue d'ensemble exécutive"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#101a2d] shadow-2xl shadow-slate-950/25"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-28 size-80 rounded-full bg-[#e3a641]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 right-0 size-96 rounded-full bg-[#2563eb]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/4 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-[#e3a641]/60 to-transparent"
      />

      <div className="relative px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e3a641]">
              Executive Command Center
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-white sm:text-4xl">
              Bonjour, <span className="text-gradient-gold">{firstName}</span>.
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
              <span className="capitalize">{dateLabel}</span>
              <span className="hidden size-1 rounded-full bg-slate-600 sm:block" aria-hidden="true" />
              <span className="font-mono text-[15px] font-semibold tabular-nums text-white">{timeLabel}</span>
            </p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
              L&apos;état complet du groupe, consolidé en temps réel : finances, terrain, stocks et équipes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              aria-live="polite"
              className="glass-panel-dark flex items-center gap-3 rounded-2xl px-4 py-3"
            >
              <span
                aria-hidden="true"
                className={
                  "relative grid size-3 place-items-center rounded-full " + meta.dot
                }
              >
                <span
                  aria-hidden="true"
                  className={"absolute inline-flex size-3 animate-ping rounded-full opacity-60 " + meta.dot}
                />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">État global</p>
                <p className={"text-sm font-bold " + meta.text}>
                  {meta.emoji} {meta.label}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-[#e3a641] px-4.5 py-3 text-sm font-bold text-[#14223b] shadow-lg shadow-amber-600/20 transition hover:bg-[#efb653] hover:shadow-amber-500/30 active:scale-[0.98]"
              href={action.href}
              key={action.label}
            >
              <Icon name={action.icon} size={16} />
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
