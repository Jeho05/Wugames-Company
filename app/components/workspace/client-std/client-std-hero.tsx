"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";
import { useToday } from "@/app/hooks/use-today";
import { clientStdStateMeta } from "@/app/lib/client-std-data";
import type { ClientStdGlobalState } from "@/app/lib/client-std-data";
import { getDailyInspiration, formatInspirationDate } from "@/app/lib/daily-inspiration";
import { formatFcfa } from "@/app/lib/cleans-data";
import type { WorkspaceUser } from "@/app/lib/workspace-demo";

type ClientStdHeroProps = {
  user: WorkspaceUser;
  missionActive: boolean;
  missionsActives: number;
  notificationsNonLues: number;
  state: ClientStdGlobalState;
  onNavigate: (sectionId: string) => void;
  abonnementMontant?: number;
};

const stateDot: Record<ClientStdGlobalState, string> = {
  ok: "bg-emerald-400",
  action: "bg-amber-400",
  critical: "bg-red-400",
};

const stateGlow: Record<ClientStdGlobalState, string> = {
  ok: "bg-emerald-400/20 ring-emerald-400/30",
  action: "bg-amber-400/20 ring-amber-400/30",
  critical: "bg-red-400/20 ring-red-400/30",
};

export function ClientStdHero({ user, missionActive, missionsActives, notificationsNonLues, state, onNavigate, abonnementMontant }: ClientStdHeroProps) {
  const today = useToday();
  const [now, setNow] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const firstName = user.name.split(" ")[0];
  const stateMeta = clientStdStateMeta[state];
  const inspiration = getDailyInspiration();

  useEffect(() => {
    const update = () =>
      setNow(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const stats = [
    {
      label: "Travail Total",
      value: missionActive ? String(missionsActives) : "—",
      icon: "hardhat" as IconName,
    },
    {
      label: "Notifications",
      value: String(notificationsNonLues),
      icon: "bell" as IconName,
    },
    {
      label: "Abonnement",
      value: abonnementMontant ? formatFcfa(abonnementMontant) : "Aucun",
      icon: "shield" as IconName,
    },
  ];

  return (
    <section aria-labelledby="std-hero-title">
      <motion.div
        className="relative overflow-hidden rounded-[28px] bg-[#101c36] text-white shadow-2xl shadow-[#101c36]/25"
        initial={reduce ? undefined : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pointer-events-none absolute -right-28 -top-40 size-[440px] rounded-full bg-[#e3a641]/[0.16] blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-44 -left-24 size-[380px] rounded-full bg-[#38bdf8]/[0.13] blur-[110px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1100px_420px_at_50%_-10%,rgba(255,255,255,0.09),transparent_60%)]" />

        <div className="relative z-10 px-6 pb-6 pt-8 sm:px-9 sm:pb-8 sm:pt-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f2c56d]">
                Portail client · WUGAMS
              </p>
              <h1
                className="mt-3 text-3xl font-bold leading-[1.05] tracking-[-0.05em] sm:text-[44px]"
                id="std-hero-title"
              >
                {today ? today.greeting : "Bonjour"}, {firstName}.
              </h1>

              {/* Citation du jour */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur">
                <div className="flex items-start gap-3">
                  <Icon name="sparkles" size={16} className="mt-0.5 shrink-0 text-[#f2c56d]" />
                  <div>
                    <p className="text-[13px] font-semibold italic leading-6 text-white/90">
                      &ldquo;{inspiration.citation}&rdquo;
                    </p>
                    <p className="mt-1.5 text-[10px] font-bold text-[#f2c56d]">
                      — {inspiration.reference}
                    </p>
                    <p className="mt-0.5 text-[9px] text-slate-400">
                      {formatInspirationDate()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 backdrop-blur sm:gap-2 sm:px-3.5 sm:text-xs">
                  <Icon name="calendar" size={13} className="text-[#f2c56d]" />
                  {today ? today.dateLabel : "Chargement…"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 backdrop-blur sm:gap-2 sm:px-3.5 sm:text-xs">
                  <Icon name="clock" size={13} className="text-[#f2c56d]" />
                  {now ?? "…"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1.5 backdrop-blur sm:gap-2.5 sm:px-3.5">
                  <span className={"relative flex size-2.5 " + stateGlow[state]}>
                    <span className={"absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 " + stateDot[state]} />
                    <span className={"relative inline-flex size-2.5 rounded-full ring-2 " + stateDot[state]} />
                  </span>
                  <span className="text-[11px] font-bold text-white sm:text-xs">{stateMeta.label}</span>
                </span>
              </div>
            </div>

            <div className="grid w-full grid-cols-3 gap-1.5 sm:gap-2.5 lg:w-[420px]">
              {stats.map((stat, index) => (
                <motion.div
                  className="rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-3 text-center backdrop-blur sm:px-3 sm:py-3.5"
                  initial={reduce ? undefined : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={stat.label}
                  transition={{ duration: 0.5, delay: 0.25 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="mx-auto grid size-7 place-items-center rounded-xl bg-[#e3a641]/15 text-[#f2c56d] sm:size-8">
                    <Icon name={stat.icon} size={14} />
                  </span>
                  <p className="mt-2 text-lg font-bold tracking-[-0.04em] sm:text-2xl">{stat.value}</p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[10px]">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
