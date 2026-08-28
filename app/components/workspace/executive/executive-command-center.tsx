"use client";

import { useCallback, useEffect, useState } from "react";

import { useSmartPolling } from "@/app/hooks/use-smart-polling";
import { MotionConfig } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { LiveIndicator } from "@/app/components/workspace/live-indicator";
import { ExecutiveActivity } from "@/app/components/workspace/executive/executive-activity";
import { ExecutiveAlerts } from "@/app/components/workspace/executive/executive-alerts";
import { ExecutiveAudit } from "@/app/components/workspace/executive/executive-audit";
import { ExecutiveFiliales } from "@/app/components/workspace/executive/executive-filiales";
import { ExecutiveFinances } from "@/app/components/workspace/executive/executive-finances";
import { ExecutiveHero } from "@/app/components/workspace/executive/executive-hero";
import { ExecutiveKpiGrid } from "@/app/components/workspace/executive/executive-kpi-grid";
import { ExecutiveMissions } from "@/app/components/workspace/executive/executive-missions";
import { ExecutiveQuickActions } from "@/app/components/workspace/executive/executive-quick-actions";
import { ExecutiveTeams } from "@/app/components/workspace/executive/executive-teams";
import { Reveal } from "@/app/components/workspace/executive/reveal";
import { loadExecutiveOverview, type ExecutiveOverview } from "@/app/lib/executive-data";

const REFRESH_INTERVAL_MS = 60_000;

function formatUpdatedAt(timestamp: number): string {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(
    new Date(timestamp),
  );
}

export function ExecutiveCommandCenter() {
  const [data, setData] = useState<ExecutiveOverview | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const overview = await loadExecutiveOverview();
    setData(overview);
    setRefreshing(false);
  }, []);

useEffect(() => {
    let cancelled = false;
    loadExecutiveOverview().then((overview) => {
      if (!cancelled && overview) setData(overview);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useSmartPolling(refresh, REFRESH_INTERVAL_MS);

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-6">
        {data ? (
          <>
            <div
              aria-live="polite"
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <LiveIndicator live={data.source === "api"} />
                <p className="text-xs font-semibold text-slate-400">
                  Dernière mise à jour · <span className="font-mono tabular-nums text-slate-600">{formatUpdatedAt(data.updatedAt)}</span>
                </p>
              </div>
              <button
                aria-label="Actualiser les données"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-[#17294b] disabled:opacity-60"
                disabled={refreshing}
                onClick={() => void refresh()}
                type="button"
              >
                <Icon className={refreshing ? "animate-spin" : undefined} name="refresh" size={13} />
                Actualiser
              </button>
            </div>

            <ExecutiveHero health={data.health} />

            <Reveal delay={0.05}>
              <ExecutiveKpiGrid kpis={data.kpis} />
            </Reveal>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.75fr)]">
              <div className="min-w-0 space-y-6">
                <ExecutiveMissions counters={data.missionCounters} missions={data.missions} />
                <ExecutiveFinances finances={data.finances} />
              </div>
              <div className="space-y-6">
                <ExecutiveAlerts alerts={data.alerts} />
                <ExecutiveActivity items={data.activity} />
              </div>
            </div>

            <Reveal delay={0.1}>
              <ExecutiveFiliales filiales={data.filiales} />
            </Reveal>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <ExecutiveTeams teams={data.teams} />
              <ExecutiveQuickActions />
            </div>

            <Reveal delay={0.1}>
              <ExecutiveAudit audits={data.audits} />
            </Reveal>
          </>
        ) : (
          <div aria-busy="true" className="grid min-h-[60vh] place-items-center" role="status">
            <div className="flex flex-col items-center gap-4">
              <span className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#e3a641]" />
              <p className="text-sm font-semibold text-slate-400">Consolidation des données du groupe…</p>
            </div>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
