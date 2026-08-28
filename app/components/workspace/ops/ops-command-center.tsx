"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useSmartPolling } from "@/app/hooks/use-smart-polling";
import { AnimatePresence, motion, MotionConfig } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import { LiveIndicator } from "@/app/components/workspace/live-indicator";
import { Reveal } from "@/app/components/workspace/executive/reveal";
import { OpsAlerts } from "@/app/components/workspace/ops/ops-alerts";
import { OpsCalendar } from "@/app/components/workspace/ops/ops-calendar";
import { OpsConversations } from "@/app/components/workspace/ops/ops-conversations";
import { OpsHero } from "@/app/components/workspace/ops/ops-hero";
import { OpsKpiGrid } from "@/app/components/workspace/ops/ops-kpi-grid";
import { OpsMap } from "@/app/components/workspace/ops/ops-map";
import { OpsPerformance } from "@/app/components/workspace/ops/ops-performance";
import { OpsPriorityMissions } from "@/app/components/workspace/ops/ops-priority-missions";
import { OpsQuickActions } from "@/app/components/workspace/ops/ops-quick-actions";
import { OpsShowcasePages } from "@/app/components/workspace/ops/ops-showcase-pages";
import { OpsTeams } from "@/app/components/workspace/ops/ops-teams";
import { OpsTimeline } from "@/app/components/workspace/ops/ops-timeline";
import { loadOpsOverview, type OpsOverview } from "@/app/lib/ops-data";

const REFRESH_INTERVAL_MS = 60_000;

type Toast = { id: number; message: string; tone: "success" | "error" | "info" };

type OpsSection = "controle" | "vitrine" | "conversations";

const sectionTabs: { key: OpsSection; label: string; icon: "dashboard" | "newspaper" | "message" }[] = [
  { key: "controle", label: "Salle de contrôle", icon: "dashboard" },
  { key: "vitrine", label: "Pages vitrine", icon: "newspaper" },
  { key: "conversations", label: "Conversations", icon: "message" },
];

function formatUpdatedAt(timestamp: number): string {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(
    new Date(timestamp),
  );
}

export function OpsCommandCenter() {
  const [data, setData] = useState<OpsOverview | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [section, setSection] = useState<OpsSection>("controle");
  const [toast, setToast] = useState<Toast | null>(null);
  const toastQueue = useRef<Toast[]>([]);

  const showToast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    setToast((current) => {
      if (current) {
        toastQueue.current.push({ id: Date.now() + toastQueue.current.length, message, tone });
        return current;
      }
      return { id: Date.now(), message, tone };
    });
  }, []);

  const showNextToast = useCallback(() => {
    const next = toastQueue.current.shift();
    if (next) setToast(next);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const overview = await loadOpsOverview();
    setData(overview);
    setRefreshing(false);
  }, []);

useEffect(() => {
    let cancelled = false;
    loadOpsOverview().then((overview) => {
      if (!cancelled) setData(overview);
    });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useSmartPolling(refresh, REFRESH_INTERVAL_MS);

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
                <div className="flex items-center gap-2">
                  <LiveIndicator live={data.source === "api"} />
                  <p className="text-xs font-semibold text-slate-400">
                    Dernière mise à jour ·{" "}
                    <span className="font-mono tabular-nums text-slate-200">{formatUpdatedAt(data.updatedAt)}</span>
                  </p>
                </div>
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

              <Reveal delay={0.01}>
                <nav aria-label="Sections" className="flex gap-2 overflow-x-auto pb-1">
                  {sectionTabs.map((tab) => (
                    <button
                      aria-current={section === tab.key ? "page" : undefined}
                      className={
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-extrabold transition " +
                        (section === tab.key
                          ? "border-[#e3a641]/50 bg-[#e3a641]/15 text-[#f2c56d]"
                          : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white")
                      }
                      key={tab.key}
                      onClick={() => setSection(tab.key)}
                      type="button"
                    >
                      <Icon name={tab.icon} size={13} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </Reveal>

              <AnimatePresence mode="wait">
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  initial={{ opacity: 0, y: 8 }}
                  key={section}
                  transition={{ duration: 0.18 }}
                >
                  {section === "controle" ? (
                    <div className="space-y-6">
                      <OpsHero missionsToday={data.missionsToday} status={data.status} />

                      <Reveal delay={0.05}>
                        <OpsKpiGrid kpis={data.kpis} />
                      </Reveal>

                      <Reveal delay={0.08}>
                        <OpsMap missions={data.mapMissions} />
                      </Reveal>

                      <Reveal delay={0.1}>
                        <OpsPriorityMissions missions={data.priorityMissions} />
                      </Reveal>

                      <Reveal delay={0.05}>
                        <OpsTeams teams={data.teams} />
                      </Reveal>

                      <Reveal delay={0.1}>
                        <OpsPerformance performance={data.performance} />
                      </Reveal>

                      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                        <OpsTimeline events={data.timeline} />
                        <OpsCalendar missions={data.calendar} />
                      </div>

                      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                        <OpsAlerts alerts={data.alerts} />
                        <OpsQuickActions />
                      </div>
                    </div>
                  ) : null}

                  {section === "vitrine" ? <OpsShowcasePages onToast={showToast} /> : null}
                  {section === "conversations" ? <OpsConversations onToast={showToast} /> : null}
                </motion.div>
              </AnimatePresence>
            </>
          ) : (
            <div aria-busy="true" className="grid min-h-[60vh] place-items-center" role="status">
              <div className="flex flex-col items-center gap-4">
                <span className="size-10 animate-spin rounded-full border-4 border-white/10 border-t-[#e3a641]" />
                <p className="text-sm font-semibold text-slate-400">Calibrage de la salle de contrôle…</p>
              </div>
            </div>
          )}

          <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
            <AnimatePresence>
              {toast ? (
                <motion.div
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  className={
                    "flex max-w-[min(92vw,420px)] items-center gap-2 rounded-2xl px-4 py-3 text-[12px] font-bold text-white shadow-2xl " +
                    (toast.tone === "success" ? "bg-[#0f7a5f]" : toast.tone === "error" ? "bg-rose-600" : "bg-slate-700")
                  }
                  exit={{ y: 12, opacity: 0, scale: 0.96 }}
                  initial={{ y: 12, opacity: 0, scale: 0.96 }}
                  key={toast.id}
                  onAnimationComplete={() => {
                    window.setTimeout(() => {
                      setToast(null);
                      showNextToast();
                    }, 2600);
                  }}
                  role="status"
                >
                  <Icon
                    className="shrink-0"
                    name={toast.tone === "success" ? "check" : toast.tone === "error" ? "warning" : "info"}
                    size={14}
                  />
                  <span className="leading-5">{toast.message}</span>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
