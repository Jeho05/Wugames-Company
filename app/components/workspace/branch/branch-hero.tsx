"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { useAuth } from "@/app/lib/auth-context";
import type { BranchHealth, BranchHealthLevel } from "@/app/lib/branch-data";

type BranchHeroProps = {
  filiale: { nom: string; code: string };
  health: BranchHealth;
  unreadCount: number;
  missionsCount: number;
  produitsCount: number;
};

const levelMeta: Record<BranchHealthLevel, { label: string; chip: string; ring: string; glow: string }> = {
  performante: { label: "Filiale performante", chip: "border-emerald-200 bg-emerald-50 text-emerald-700", ring: "#10b981", glow: "bg-emerald-300/20" },
  normale: { label: "Activité normale", chip: "border-sky-200 bg-sky-50 text-sky-700", ring: "#0ea5e9", glow: "bg-sky-300/20" },
  attention: { label: "Attention requise", chip: "border-amber-200 bg-amber-50 text-amber-700", ring: "#f59e0b", glow: "bg-amber-300/20" },
  critique: { label: "Situation critique", chip: "border-rose-200 bg-rose-50 text-rose-700", ring: "#f43f5e", glow: "bg-rose-300/20" },
};

function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}

export function BranchHero({ filiale, health, unreadCount, missionsCount, produitsCount }: BranchHeroProps) {
  const { user } = useAuth();
  const now = useNow();
  const firstName = user?.name.split(" ")[0] ?? "Manager";
  const meta = levelMeta[health.level];
  const radius = 46;
  const circumference = 2 * Math.PI * radius;

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
      aria-label="État de la filiale"
      className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-white/80 to-sky-50/60 shadow-xl shadow-slate-950/[0.05]"
    >
      <div aria-hidden="true" className={`pointer-events-none absolute -right-24 -top-28 size-80 rounded-full blur-3xl ${meta.glow}`} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-teal-300/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#38bdf8]/50 to-transparent"
      />

      <div className="relative px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-bold text-[#1b3a66] shadow-sm">
                <Icon name="building" size={13} className="text-[#0e9f9b]" />
                {filiale.nom}
                <span className="rounded-md bg-[#10304f] px-1.5 py-0.5 font-mono text-[9px] text-[#7dd3fc]">{filiale.code}</span>
              </span>
              <span className={"inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold " + meta.chip}>
                <span className="relative flex size-2">
                  <span className={"absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 " + (meta.ring === "#f43f5e" ? "bg-rose-400" : "bg-current")} />
                  <span className={"relative inline-flex size-2 rounded-full " + (meta.ring === "#f43f5e" ? "bg-rose-500" : "bg-current")} style={meta.ring === "#f43f5e" ? undefined : { background: meta.ring }} />
                </span>
                {meta.label}
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[#0f2a52] sm:text-4xl">
              Bonjour, {firstName}.
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="capitalize">{dateLabel}</span>
              <span className="hidden size-1 rounded-full bg-slate-300 sm:block" aria-hidden="true" />
              <span className="font-mono text-[15px] font-semibold tabular-nums text-[#0f2a52]">{timeLabel}</span>
              <span className="hidden size-1 rounded-full bg-slate-300 sm:block" aria-hidden="true" />
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#0e9f9b]">
                <Icon name="bell" size={14} />
                {unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue{unreadCount > 1 ? "s" : ""}
              </span>
            </p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">
              <span className="font-bold text-[#0f2a52]">{missionsCount} mission(s) active(s)</span> aujourd&apos;hui ·{" "}
              <span className="font-bold text-[#0f2a52]">{produitsCount} produit(s)</span> référencés · vous consultez
              uniquement les données de votre filiale.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative size-32 shrink-0">
              <svg aria-label={`Santé globale : ${health.score} %`} className="size-32 -rotate-90" role="img" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r={radius} stroke="#e2e8f0" strokeWidth="9" />
                <motion.circle
                  animate={{ strokeDashoffset: circumference - (health.score / 100) * circumference }}
                  cx="50"
                  cy="50"
                  fill="none"
                  r={radius}
                  stroke={meta.ring}
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                  strokeWidth="9"
                  initial={{ strokeDashoffset: circumference }}
                  transition={{ delay: 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
              <div className="absolute inset-0 grid place-content-center text-center">
                <p className="text-2xl font-extrabold tabular-nums tracking-tight text-[#0f2a52]">{health.score} %</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Santé</p>
              </div>
            </div>
            <ul className="space-y-1.5 text-[11px] font-semibold text-slate-500">
              {health.factors.map((factor) => (
                <li className="flex items-center gap-2" key={factor.label}>
                  <span className={"grid size-4 place-items-center rounded-full " + (factor.ok ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600")}>
                    <Icon name={factor.ok ? "check" : "warning"} size={9} />
                  </span>
                  {factor.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { href: "/espace/stocks?creer=1", label: "Ajouter un produit", icon: "package" as const },
            { href: "/espace/stocks", label: "Enregistrer un mouvement", icon: "arrow-up-right" as const },
            { href: "/espace/stocks", label: "Confirmer une réception", icon: "check" as const },
            { href: "/espace/missions", label: "Consulter les missions", icon: "hardhat" as const },
            { href: "/espace/evaluations?creer=1", label: "Ajouter une évaluation", icon: "chart" as const },
          ].map((action) => (
            <Link
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-[#10304f] px-4.5 py-3 text-sm font-bold text-white shadow-lg shadow-[#10304f]/25 transition hover:bg-[#1b446b] hover:shadow-[#10304f]/35 active:scale-[0.98]"
              href={action.href}
              key={action.label}
            >
              <span className="grid size-6 place-items-center rounded-lg bg-[#0e9f9b] text-white">
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
