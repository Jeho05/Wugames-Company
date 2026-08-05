"use client";

import { useCallback, useEffect, useState } from "react";
import { MotionConfig } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { Reveal } from "@/app/components/workspace/executive/reveal";
import { AccountantActivity } from "@/app/components/workspace/accountant/accountant-activity";
import { AccountantAlerts } from "@/app/components/workspace/accountant/accountant-alerts";
import { AccountantBreakdown } from "@/app/components/workspace/accountant/accountant-breakdown";
import { AccountantCashflow } from "@/app/components/workspace/accountant/accountant-cashflow";
import { AccountantHero } from "@/app/components/workspace/accountant/accountant-hero";
import { AccountantInvoicesTable } from "@/app/components/workspace/accountant/accountant-invoices-table";
import { AccountantKpiGrid } from "@/app/components/workspace/accountant/accountant-kpi-grid";
import { AccountantPayments } from "@/app/components/workspace/accountant/accountant-payments";
import { AccountantQuickActions } from "@/app/components/workspace/accountant/accountant-quick-actions";
import { AccountantReports } from "@/app/components/workspace/accountant/accountant-reports";
import { loadAccountantOverview, type AccountantOverview } from "@/app/lib/accountant-data";

const REFRESH_INTERVAL_MS = 60_000;

function formatUpdatedAt(timestamp: number): string {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(
    new Date(timestamp),
  );
}

export function AccountantCommandCenter() {
  const [data, setData] = useState<AccountantOverview | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const overview = await loadAccountantOverview();
    setData(overview);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadAccountantOverview().then((overview) => {
      if (!cancelled) setData(overview);
    });
    const timer = window.setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [refresh]);

  const sourceLabel = data?.source === "api" ? "En direct" : "Démonstration";
  const sourceTone =
    data?.source === "api"
      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
      : "border-sky-400/25 bg-sky-400/10 text-sky-300";

  const creancesKpi = data?.kpis.find((kpi) => kpi.key === "creances");
  const tresorerieKpi = data?.kpis.find((kpi) => kpi.key === "tresorerie");

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0b1020] p-5 shadow-2xl shadow-slate-950/40 sm:p-6 lg:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(227,166,65,0.07),transparent)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(50%_100%_at_50%_100%,rgba(56,189,248,0.04),transparent)]"
        />

        <div className="relative space-y-6">
          {data ? (
            <>
              <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-400">
                  Dernière mise à jour ·{" "}
                  <span className="font-mono tabular-nums text-slate-200">{formatUpdatedAt(data.updatedAt)}</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className={"inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold " + sourceTone}>
                    <span className={"size-1.5 rounded-full " + (data.source === "api" ? "bg-emerald-400" : "bg-sky-400")} />
                    {sourceLabel}
                    {data.source === "api" ? " · rafraîchi auto toutes les 60 s" : " · API indisponible"}
                  </span>
                  <button
                    aria-label="Actualiser les données"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-300 shadow-sm backdrop-blur transition hover:border-white/20 hover:text-white disabled:opacity-60"
                    disabled={refreshing}
                    onClick={() => void refresh()}
                    type="button"
                  >
                    <Icon className={refreshing ? "animate-spin" : undefined} name="refresh" size={13} />
                    Actualiser
                  </button>
                </div>
              </div>

              <AccountantHero
                creances={creancesKpi?.value ?? "—"}
                health={data.health}
                tresorerie={tresorerieKpi?.value ?? "—"}
              />

              <Reveal delay={0.05}>
                <AccountantKpiGrid kpis={data.kpis} />
              </Reveal>

              <Reveal delay={0.08}>
                <AccountantCashflow cashflow={data.cashflow} />
              </Reveal>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
                <AccountantInvoicesTable invoices={data.invoices} />
                <AccountantPayments payments={data.payments} />
              </div>

              <Reveal delay={0.1}>
                <AccountantBreakdown
                  filiales={data.filialesBreakdown}
                  recettesDepenses={data.recettesDepenses}
                  statuts={data.statutsBreakdown}
                />
              </Reveal>

              <div className="grid gap-6 xl:grid-cols-2">
                <AccountantAlerts alerts={data.alerts} />
                <AccountantReports reports={data.reports} />
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <AccountantQuickActions />
                <AccountantActivity items={data.activity} />
              </div>
            </>
          ) : (
            <div aria-busy="true" className="grid min-h-[60vh] place-items-center" role="status">
              <div className="flex flex-col items-center gap-4">
                <span className="size-10 animate-spin rounded-full border-4 border-white/10 border-t-[#e3a641]" />
                <p className="text-sm font-semibold text-slate-400">Consolidation de la situation financière…</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MotionConfig>
  );
}
