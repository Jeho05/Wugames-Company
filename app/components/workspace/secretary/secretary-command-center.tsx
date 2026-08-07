"use client";

import { useCallback, useEffect, useState } from "react";

import { useSmartPolling } from "@/app/hooks/use-smart-polling";
import { MotionConfig } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { Reveal } from "@/app/components/workspace/executive/reveal";
import { SecretaryActivity } from "@/app/components/workspace/secretary/secretary-activity";
import { SecretaryAgenda } from "@/app/components/workspace/secretary/secretary-agenda";
import { SecretaryClientsTable } from "@/app/components/workspace/secretary/secretary-clients-table";
import { SecretaryHero } from "@/app/components/workspace/secretary/secretary-hero";
import { SecretaryKpiGrid } from "@/app/components/workspace/secretary/secretary-kpi-grid";
import { SecretaryNotifications } from "@/app/components/workspace/secretary/secretary-notifications";
import { SecretarySearch } from "@/app/components/workspace/secretary/secretary-search";
import { SecretaryShortcuts } from "@/app/components/workspace/secretary/secretary-shortcuts";
import { SecretarySuppliersTable } from "@/app/components/workspace/secretary/secretary-suppliers-table";
import { SecretaryTasks } from "@/app/components/workspace/secretary/secretary-tasks";
import { loadSecretaryOverview, type SecretaryOverview } from "@/app/lib/secretary-data";

const REFRESH_INTERVAL_MS = 60_000;

function formatUpdatedAt(timestamp: number): string {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(
    new Date(timestamp),
  );
}

export function SecretaryCommandCenter() {
  const [data, setData] = useState<SecretaryOverview | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const overview = await loadSecretaryOverview();
    setData(overview);
    setRefreshing(false);
  }, []);

useEffect(() => {
    let cancelled = false;
    loadSecretaryOverview().then((overview) => {
      if (!cancelled) setData(overview);
    });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useSmartPolling(refresh, REFRESH_INTERVAL_MS);

  const sourceLabel = data?.source === "api" ? "En direct" : "Démonstration";
  const sourceTone =
    data?.source === "api"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-sky-200 bg-sky-50 text-sky-700";

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-6">
        {data ? (
          <>
            <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold text-slate-400">
                Dernière mise à jour ·{" "}
                <span className="font-mono tabular-nums text-slate-600">{formatUpdatedAt(data.updatedAt)}</span>
              </p>
              <div className="flex items-center gap-2">
                <span className={"inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold " + sourceTone}>
                  <span className={"size-1.5 rounded-full " + (data.source === "api" ? "bg-emerald-500" : "bg-sky-500")} />
                  {sourceLabel}
                  {data.source === "api" ? " · rafraîchi auto toutes les 60 s" : " · API indisponible"}
                </span>
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
            </div>

            <SecretaryHero
              demandesCount={Number(data.kpis.find((kpi) => kpi.key === "demandes")?.value.replace(/\D/g, "") ?? 0)}
              tasksCount={data.tasks.length}
            />

            <Reveal delay={0.03}>
              <SecretarySearch index={data.searchIndex} />
            </Reveal>

            <Reveal delay={0.05}>
              <SecretaryKpiGrid kpis={data.kpis.slice(0, 4)} />
            </Reveal>

            <div className="grid gap-6 xl:grid-cols-2">
              <SecretaryTasks tasks={data.tasks} />
              <SecretaryNotifications items={data.notifications} />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <SecretaryAgenda events={data.agenda} />
              <SecretaryActivity items={data.activity} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <SecretaryShortcuts />
              <SecretaryClientsTable clients={data.clients} />
            </div>

            <Reveal delay={0.08}>
              <SecretarySuppliersTable fournisseurs={data.fournisseurs} />
            </Reveal>
          </>
        ) : (
          <div aria-busy="true" className="grid min-h-[60vh] place-items-center" role="status">
            <div className="flex flex-col items-center gap-4">
              <span className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#e3a641]" />
              <p className="text-sm font-semibold text-slate-400">Chargement de votre centre administratif…</p>
            </div>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
