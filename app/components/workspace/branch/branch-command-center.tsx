"use client";

import { useCallback, useEffect, useState } from "react";

import { useSmartPolling } from "@/app/hooks/use-smart-polling";
import { MotionConfig } from "motion/react";

import * as notificationsApi from "@/app/lib/api/notifications";
import * as usersApi from "@/app/lib/api/users";
import { useAuth } from "@/app/lib/auth-context";
import { Icon } from "@/app/components/ui/app-icon";
import { Reveal } from "@/app/components/workspace/executive/reveal";
import { BranchActivity } from "@/app/components/workspace/branch/branch-activity";
import { BranchAlerts } from "@/app/components/workspace/branch/branch-alerts";
import { BranchClients } from "@/app/components/workspace/branch/branch-clients";
import { BranchCommandPalette } from "@/app/components/workspace/branch/branch-command-palette";
import { BranchEvaluations } from "@/app/components/workspace/branch/branch-evaluations";
import { BranchHero } from "@/app/components/workspace/branch/branch-hero";
import { BranchInvoices } from "@/app/components/workspace/branch/branch-invoices";
import { BranchKpiGrid } from "@/app/components/workspace/branch/branch-kpi-grid";
import { BranchMap } from "@/app/components/workspace/branch/branch-map";
import { BranchMissions } from "@/app/components/workspace/branch/branch-missions";
import { BranchNotifications } from "@/app/components/workspace/branch/branch-notifications";
import { BranchStock } from "@/app/components/workspace/branch/branch-stock";
import { BranchSuppliers } from "@/app/components/workspace/branch/branch-suppliers";
import { BranchTeam } from "@/app/components/workspace/branch/branch-team";
import { loadBranchOverview, type BranchOverview } from "@/app/lib/branch-data";

const REFRESH_INTERVAL_MS = 60_000;

function formatUpdatedAt(timestamp: number): string {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(
    new Date(timestamp),
  );
}

export function BranchCommandCenter() {
  const { user } = useAuth();
  const [filialeId, setFilialeId] = useState<string | null>(null);
  const [data, setData] = useState<BranchOverview | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    usersApi
      .getUser(user.id)
      .then((fullUser) => {
        if (!cancelled) setFilialeId(fullUser.filiale_id);
      })
      .catch(() => {
        if (!cancelled) setFilialeId(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const overview = await loadBranchOverview(filialeId);
    setData(overview);
    setRefreshing(false);
  }, [filialeId]);

useEffect(() => {
    if (!filialeId && filialeId !== null) return;
    let cancelled = false;
    loadBranchOverview(filialeId).then((overview) => {
      if (!cancelled) setData(overview);
    });
    return () => {
      cancelled = true;
    };
  }, [filialeId, refresh]);

  useSmartPolling(() => void refresh(), REFRESH_INTERVAL_MS, { skip: !filialeId && filialeId !== null });

  function markRead(id: string) {
    void notificationsApi.markAsRead(id).catch(() => undefined);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        notifications: {
          list: prev.notifications.list.map((notification) => (notification.id === id ? { ...notification, lu: true } : notification)),
          unread: Math.max(prev.notifications.unread - 1, 0),
        },
      };
    });
  }

  const sourceLabel = data?.source === "api" ? "En direct" : "Démonstration";
  const sourceTone =
    data?.source === "api"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-sky-200 bg-sky-50 text-sky-700";

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative rounded-3xl border border-slate-200/70 bg-gradient-to-b from-white via-[#f6fafd] to-[#f1f7fb] p-5 shadow-2xl shadow-slate-950/[0.06] sm:p-6 lg:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(56,189,248,0.09),transparent)]"
        />

        <div className="relative space-y-6">
          {data ? (
            <>
              <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-500">
                  Dernière mise à jour ·{" "}
                  <span className="font-mono tabular-nums text-[#0f2a52]">{formatUpdatedAt(data.updatedAt)}</span>
                  <span className="ml-2 hidden text-slate-400 sm:inline">· données limitées à {data.filiale.nom}</span>
                </p>
                <div className="flex items-center gap-2">
                  <BranchCommandPalette data={data} />
                  <span className={"inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold " + sourceTone}>
                    <span className={"size-1.5 rounded-full " + (data.source === "api" ? "bg-emerald-500" : "bg-sky-500")} />
                    {sourceLabel}
                    {data.source === "api" ? " · rafraîchi auto toutes les 60 s" : " · API indisponible"}
                  </span>
                  <button
                    aria-label="Actualiser les données"
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm backdrop-blur transition hover:border-[#0e9f9b]/60 hover:text-[#0e9f9b] disabled:opacity-60"
                    disabled={refreshing}
                    onClick={() => void refresh()}
                    type="button"
                  >
                    <Icon className={refreshing ? "animate-spin" : undefined} name="refresh" size={13} />
                    Actualiser
                  </button>
                </div>
              </div>

              <BranchHero
                filiale={data.filiale}
                health={data.health}
                missionsCount={data.missions.filter((mission) => mission.statut === "EN_COURS" || mission.statut === "ACCEPTE" || mission.statut === "NOTIFIE").length || Number(data.kpis.find((kpi) => kpi.key === "missions_actives")?.value ?? 0)}
                produitsCount={data.stock.produitsCount}
                unreadCount={data.notifications.unread}
              />

              <Reveal delay={0.05}>
                <BranchKpiGrid kpis={data.kpis} />
              </Reveal>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <BranchAlerts alerts={data.alerts} />
                <BranchMissions missions={data.missions} />
              </div>

              <Reveal delay={0.08}>
                <BranchMap missions={data.mapMissions} />
              </Reveal>

              <Reveal delay={0.05}>
                <BranchStock stock={data.stock} />
              </Reveal>

              <Reveal delay={0.05}>
                <BranchEvaluations radar={data.evaluations.radar} ranking={data.evaluations.ranking} />
              </Reveal>

              <Reveal delay={0.05}>
                <BranchInvoices kpis={data.invoices.kpis} list={data.invoices.list} trend={data.invoices.trend} />
              </Reveal>

              <Reveal delay={0.05}>
                <BranchSuppliers suppliers={data.suppliers} />
              </Reveal>

              <Reveal delay={0.05}>
                <BranchClients clients={data.clients} />
              </Reveal>

              <Reveal delay={0.05}>
                <BranchTeam team={data.team} />
              </Reveal>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <BranchActivity activity={data.activity} />
                <BranchNotifications
                  notifications={data.notifications.list}
                  onMarkRead={markRead}
                  unread={data.notifications.unread}
                />
              </div>
            </>
          ) : (
            <div aria-busy="true" className="grid min-h-[60vh] place-items-center" role="status">
              <div className="flex flex-col items-center gap-4">
                <span className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0e9f9b]" />
                <p className="text-sm font-semibold text-slate-500">Chargement du centre de pilotage…</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MotionConfig>
  );
}
