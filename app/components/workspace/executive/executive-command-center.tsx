"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
import { useSmartPolling } from "@/app/hooks/use-smart-polling";
import { loadExecutiveOverview, type ExecutiveOverview } from "@/app/lib/executive-data";

const REFRESH_INTERVAL_MS = 60_000;

type PeriodOption = "today" | "7d" | "month" | "year";

function formatUpdatedAt(timestamp: number): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

export function ExecutiveCommandCenter() {
  const [data, setData] = useState<ExecutiveOverview | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilialeId, setSelectedFilialeId] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodOption>("month");

  // Listen for filiale changes emitted by the Topbar dropdown
  useEffect(() => {
    const handleFilialeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ filialeId: string | null }>;
      const newFilialeId = customEvent.detail?.filialeId ?? null;
      setSelectedFilialeId(newFilialeId);
    };

    window.addEventListener("wugams:filiale-change", handleFilialeChange);
    return () => {
      window.removeEventListener("wugams:filiale-change", handleFilialeChange);
    };
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const overview = await loadExecutiveOverview(selectedFilialeId);
    setData(overview);
    setRefreshing(false);
  }, [selectedFilialeId]);

  // Load data whenever selectedFilialeId changes (fetch dans l'effet, usage canonique).
  /* eslint-disable react-hooks/set-state-in-effect -- fetch initial, état loading */
  useEffect(() => {
    let cancelled = false;
    setRefreshing(true);
    loadExecutiveOverview(selectedFilialeId).then((overview) => {
      if (!cancelled && overview) {
        setData(overview);
        setRefreshing(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedFilialeId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useSmartPolling(refresh, REFRESH_INTERVAL_MS);

  const handleResetFiliale = () => {
    setSelectedFilialeId(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("wugams:filiale-change", { detail: { filialeId: null } }),
      );
    }
  };

  const activeFiliale = data?.filiales.find((f) => f.id === selectedFilialeId);

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-6">
        {/* Flowdash Breadcrumb & Command Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <Link href="/espace" className="transition hover:text-slate-600">
                Accueil
              </Link>
              <Icon name="arrow-right" size={10} />
              <span className="text-slate-600 font-bold">Direction Générale</span>
              <Icon name="arrow-right" size={10} />
              <span className="text-[#d19331] font-bold">Tableau de Bord</span>
            </nav>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#0c1424] sm:text-3xl">
              Tableau de Bord Exécutif
            </h1>
          </div>

          {/* Flowdash Period Selector & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Period Segmented Control */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {[
                { id: "today" as const, label: "Aujourd'hui" },
                { id: "7d" as const, label: "7 jours" },
                { id: "month" as const, label: "Ce mois" },
                { id: "year" as const, label: "2026" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  type="button"
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    period === p.id
                      ? "bg-[#0c1424] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Quick Action Buttons */}
            <button
              aria-label="Actualiser les données"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-[#0c1424] disabled:opacity-60"
              disabled={refreshing}
              onClick={() => void refresh()}
              type="button"
            >
              <Icon className={refreshing ? "animate-spin" : undefined} name="refresh" size={13} />
              Actualiser
            </button>

            <Link
              href="/espace/missions?creer=1"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0c1424] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#1b2b4a]"
            >
              <Icon name="plus" size={13} />
              Mission
            </Link>

            <Link
              href="/espace/devis"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#e3a641] to-[#d19331] px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition hover:opacity-95"
            >
              <Icon name="file-text" size={13} />
              Devis / Facture
            </Link>
          </div>
        </div>

        {/* Active Subsidiary Filter Alert Banner */}
        {selectedFilialeId && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-900 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-lg bg-amber-100 text-amber-800">
                <Icon name="building" size={15} />
              </span>
              <span>
                Vue filtrée sur la filiale <strong>{activeFiliale?.nom || selectedFilialeId}</strong>.
                Seules les métriques et opérations de cette entité sont affichées (BR-11).
              </span>
            </div>
            <button
              onClick={handleResetFiliale}
              type="button"
              className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-amber-900 shadow-sm border border-amber-200 transition hover:bg-amber-100"
            >
              <Icon name="close" size={11} />
              Tout le groupe
            </button>
          </div>
        )}

        {data ? (
          <>
            {/* Live Indicator bar */}
            <div
              aria-live="polite"
              className="flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <LiveIndicator live={data.source === "api"} />
                <p className="font-semibold text-slate-400">
                  Dernière consolidation ·{" "}
                  <span className="font-mono tabular-nums text-slate-700">
                    {formatUpdatedAt(data.updatedAt)}
                  </span>
                </p>
              </div>
              <p className="text-[11px] font-semibold text-slate-400">
                Période active : <strong className="text-slate-700">{period === "today" ? "Aujourd'hui" : period === "7d" ? "7 derniers jours" : period === "month" ? "Mois en cours" : "Année 2026"}</strong>
              </p>
            </div>

            {/* Executive Hero Banner */}
            <ExecutiveHero health={data.health} />

            {/* Flowdash KPI Grid with Sparklines */}
            <Reveal delay={0.05}>
              <ExecutiveKpiGrid kpis={data.kpis} />
            </Reveal>

            {/* Operational and Financial Columns */}
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

            {/* Filiales Consolidation */}
            <Reveal delay={0.1}>
              <ExecutiveFiliales filiales={data.filiales} />
            </Reveal>

            {/* Teams Performance & Flowdash Quick Actions */}
            {data.teams && data.teams.length > 0 ? (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <ExecutiveTeams teams={data.teams} />
                <ExecutiveQuickActions />
              </div>
            ) : (
              <div>
                <ExecutiveQuickActions />
              </div>
            )}

            {/* Realtime Audit Traceability */}
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
