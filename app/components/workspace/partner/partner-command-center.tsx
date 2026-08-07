"use client";

import { useCallback, useEffect, useState } from "react";

import { useSmartPolling } from "@/app/hooks/use-smart-polling";
import { MotionConfig } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { Reveal } from "@/app/components/workspace/executive/reveal";
import { PartnerActivity } from "@/app/components/workspace/partner/partner-activity";
import { PartnerAlerts } from "@/app/components/workspace/partner/partner-alerts";
import { PartnerCharts } from "@/app/components/workspace/partner/partner-charts";
import { PartnerCriticalProducts } from "@/app/components/workspace/partner/partner-critical-products";
import { PartnerDeliveries } from "@/app/components/workspace/partner/partner-deliveries";
import { PartnerHero } from "@/app/components/workspace/partner/partner-hero";
import { PartnerKpiGrid } from "@/app/components/workspace/partner/partner-kpi-grid";
import { PartnerMovements } from "@/app/components/workspace/partner/partner-movements";
import { PartnerPartners } from "@/app/components/workspace/partner/partner-partners";
import { PartnerQuickActions } from "@/app/components/workspace/partner/partner-quick-actions";
import { PartnerStockStatus } from "@/app/components/workspace/partner/partner-stock-status";
import { loadPartnerOverview, type PartnerOverview } from "@/app/lib/partner-data";

const REFRESH_INTERVAL_MS = 60_000;

function formatUpdatedAt(timestamp: number): string {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(
    new Date(timestamp),
  );
}

export function PartnerCommandCenter() {
  const [data, setData] = useState<PartnerOverview | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const overview = await loadPartnerOverview();
    setData(overview);
    setRefreshing(false);
  }, []);

useEffect(() => {
    let cancelled = false;
    loadPartnerOverview().then((overview) => {
      if (!cancelled) setData(overview);
    });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useSmartPolling(refresh, REFRESH_INTERVAL_MS);

  const produitsCount = data?.kpis.find((kpi) => kpi.key === "produits")?.value ?? "0";
  const rupturesCount = data?.buckets.find((bucket) => bucket.key === "rupture")?.count ?? 0;

  const sourceLabel = data?.source === "api" ? "En direct" : "Démonstration";
  const sourceTone =
    data?.source === "api"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-sky-200 bg-sky-50 text-sky-700";

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative rounded-3xl border border-slate-200/70 bg-gradient-to-b from-white via-[#fdfaf3] to-[#faf6ec] p-5 shadow-2xl shadow-slate-950/[0.06] sm:p-6 lg:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(227,166,65,0.08),transparent)]"
        />

        <div className="relative space-y-6">
          {data ? (
            <>
              <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-500">
                  Dernière mise à jour ·{" "}
                  <span className="font-mono tabular-nums text-[#17294b]">{formatUpdatedAt(data.updatedAt)}</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className={"inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold " + sourceTone}>
                    <span className={"size-1.5 rounded-full " + (data.source === "api" ? "bg-emerald-500" : "bg-sky-500")} />
                    {sourceLabel}
                    {data.source === "api" ? " · rafraîchi auto toutes les 60 s" : " · API indisponible"}
                  </span>
                  <button
                    aria-label="Actualiser les données"
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm backdrop-blur transition hover:border-[#e3a641]/60 hover:text-[#d19331] disabled:opacity-60"
                    disabled={refreshing}
                    onClick={() => void refresh()}
                    type="button"
                  >
                    <Icon className={refreshing ? "animate-spin" : undefined} name="refresh" size={13} />
                    Actualiser
                  </button>
                </div>
              </div>

              <PartnerHero produitsCount={Number(produitsCount) || 0} rupturesCount={rupturesCount} stockStatus={data.stockStatus} />

              <Reveal delay={0.05}>
                <PartnerKpiGrid kpis={data.kpis} />
              </Reveal>

              <Reveal delay={0.08}>
                <PartnerStockStatus buckets={data.buckets} />
              </Reveal>

              <Reveal delay={0.1}>
                <PartnerCriticalProducts products={data.criticalProducts} />
              </Reveal>

              <Reveal delay={0.05}>
                <PartnerPartners partners={data.partners} />
              </Reveal>

              <Reveal delay={0.1}>
                <PartnerCharts charts={data.charts} />
              </Reveal>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <PartnerMovements movements={data.movements} />
                <PartnerDeliveries deliveries={data.deliveries} />
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <PartnerAlerts alerts={data.alerts} />
                <PartnerActivity activity={data.activity} />
              </div>

              <Reveal delay={0.05}>
                <PartnerQuickActions />
              </Reveal>
            </>
          ) : (
            <div aria-busy="true" className="grid min-h-[60vh] place-items-center" role="status">
              <div className="flex flex-col items-center gap-4">
                <span className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#e3a641]" />
                <p className="text-sm font-semibold text-slate-500">Chargement du tableau logistique…</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MotionConfig>
  );
}
