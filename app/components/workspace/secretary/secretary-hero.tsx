"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Icon } from "@/app/components/ui/app-icon";
import { useAuth } from "@/app/lib/auth-context";

type SecretaryHeroProps = {
  tasksCount: number;
  demandesCount: number;
};

function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}

export function SecretaryHero({ tasksCount, demandesCount }: SecretaryHeroProps) {
  const { user } = useAuth();
  const now = useNow();
  const firstName = user?.name.split(" ")[0] ?? "Secrétaire";

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
      aria-label="Vue administrative"
      className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white via-white/80 to-amber-50/70 shadow-xl shadow-slate-950/[0.04] backdrop-blur"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-[#e3a641]/15 blur-3xl"
      />
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
              Centre administratif
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
              Vos dossiers, vos rendez-vous et vos fiches : tout est à portée de main pour
              retrouver ou créer n&apos;importe quelle information en quelques secondes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <span className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon name="clipboard" size={17} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Tâches aujourd&apos;hui</p>
                <p className="text-lg font-bold tabular-nums text-[#17294b]">{tasksCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <Icon name="bell" size={17} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Demandes en attente</p>
                <p className="text-lg font-bold tabular-nums text-[#17294b]">{demandesCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { href: "/espace/clients?creer=1", label: "Nouveau client", icon: "user-plus" as const },
            { href: "/espace/fournisseurs?creer=1", label: "Nouveau fournisseur", icon: "truck" as const },
            { href: "/espace/administration?creer=1", label: "Nouvel utilisateur", icon: "users" as const },
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
