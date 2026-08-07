"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";

import { Icon, type IconName } from "@/app/components/ui/app-icon";
import { useAuth } from "@/app/lib/auth-context";
import { Avatar, SectionHeader, SkeletonBlock } from "@/app/components/workspace/dev-digital/ui/primitives";
import { DigitalHero } from "@/app/components/workspace/dev-digital/observatory/digital-hero";
import { AuditConstellation } from "@/app/components/workspace/dev-digital/observatory/audit-constellation";
import { OperationalSurfaces } from "@/app/components/workspace/dev-digital/observatory/operational-surfaces";
import { ActionMix } from "@/app/components/workspace/dev-digital/observatory/action-mix";
import { ActivityHeatmap } from "@/app/components/workspace/dev-digital/observatory/activity-heatmap";
import { AuditList, AuditEmpty, TimeMachine } from "@/app/components/workspace/dev-digital/observatory/audit-stream";
import { AuditFilters } from "@/app/components/workspace/dev-digital/audit/audit-filters";
import { AuditDetail } from "@/app/components/workspace/dev-digital/audit/audit-detail";
import { ActorList } from "@/app/components/workspace/dev-digital/actors/actor-list";
import { ApiHealth } from "@/app/components/workspace/dev-digital/health/api-health";
import { SecurityPanel } from "@/app/components/workspace/dev-digital/security/security-panel";
import { NotificationsList } from "@/app/components/workspace/dev-digital/notifications/notifications-list";
import { CommandPalette } from "@/app/components/workspace/dev-digital/command/command-palette";
import {
  loadDevDigitalOverview,
  type AuditFilters as AuditFiltersType,
  type AuditLog,
  type DevDigitalOverview,
} from "@/app/lib/dev-digital-data";

const NAV: { id: string; label: string; icon: IconName }[] = [
  { id: "overview", label: "Observatoire", icon: "activity" },
  { id: "journal", label: "Journal", icon: "clipboard" },
  { id: "surfaces", label: "Surfaces", icon: "boxes" },
  { id: "securite", label: "Sécurité", icon: "shield" },
  { id: "notifications", label: "Alertes", icon: "bell" },
];

function formatChecked(timestamp: number): string {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(timestamp));
}

function goto(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function DevDigitalCommandCenter({ defaultValue }: { defaultValue?: DevDigitalOverview }) {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] ?? null;

  const [data, setData] = useState<DevDigitalOverview | null>(defaultValue ?? null);
  const [segment, setSegment] = useState("overview");
  const [filters, setFilters] = useState<AuditFiltersType>({ table: null, action: null, user: null, entity: null });
  const [density, setDensity] = useState<"comfort" | "compact">("comfort");
  const [timeIndex, setTimeIndex] = useState(0);
  const [activeLog, setActiveLog] = useState<AuditLog | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);

  const refresh = useCallback(() => {
    void loadDevDigitalOverview(firstName).then(setData);
  }, [firstName]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logs = useMemo(() => (data?.logs ?? []).slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [data?.logs]);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (filters.table && log.table_cible !== filters.table) return false;
      if (filters.action && log.action !== filters.action) return false;
      if (filters.user && log.user_id !== filters.user) return false;
      if (filters.entity && !String(log.entite_id).toLowerCase().includes(filters.entity.toLowerCase())) return false;
      return true;
    });
  }, [logs, filters]);

  const tableStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of logs) counts.set(log.table_cible, (counts.get(log.table_cible) ?? 0) + 1);
    const palette = ["#5cc8ff", "#a78bfa", "#e3a641", "#3ddc97", "#f58ea8", "#7dd3fc"];
    return [...counts.entries()].map(([table, count], index) => ({ table, count, hex: palette[index % palette.length] }));
  }, [logs]);

  const actionStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of logs) counts.set(log.action, (counts.get(log.action) ?? 0) + 1);
    return [...counts.entries()].map(([action, count]) => ({ action, count })).sort((a, b) => b.count - a.count);
  }, [logs]);

  const actorStats = useMemo(() => {
    const byUser = new Map<string, { name: string; email: string | null; count: number; id: string }>();
    for (const log of logs) {
      const id = log.user_id ?? "anonymous";
      const name = log.user ? `${log.user.first_name} ${log.user.last_name}`.trim() : "Acteur inconnu";
      const entry = byUser.get(id) ?? { id, name, email: log.user?.email ?? null, count: 0 };
      entry.count += 1;
      byUser.set(id, entry);
    }
    return [...byUser.values()]
      .map((entry) => ({ ...entry, initials: entry.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() }))
      .sort((a, b) => b.count - a.count);
  }, [logs]);

  const patchFilters = (patch: Partial<AuditFiltersType>) => {
    setFilters((previous) => ({ ...previous, ...patch }));
    setTimeIndex(0);
  };

  const resetFilters = () => {
    setFilters({ table: null, action: null, user: null, entity: null });
    setTimeIndex(0);
  };

  const navigateLog = (direction: -1 | 1) => {
    setActiveLog((current) => {
      if (!current) return current;
      const index = filtered.findIndex((log) => log.id === current.id);
      const nextIndex = (index + direction + filtered.length) % Math.max(filtered.length, 1);
      return filtered[nextIndex] ?? current;
    });
  };

  const filteredMax = filtered.length > 0 ? filtered.length : 0;
  const shownCount = Math.min(timeIndex, filteredMax);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0b1020] p-4 shadow-2xl shadow-slate-950/40 sm:p-6 lg:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(92,200,255,0.07),transparent)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(50%_100%_at_50%_100%,rgba(167,139,250,0.05),transparent)]" />

        <div className="relative grid gap-5 lg:grid-cols-[228px_minmax(0,1fr)]">
          {/* Barre latérale */}
          <aside className="hidden lg:block">
            <div className="sticky top-4 space-y-1">
              <div className="mb-4 flex items-center gap-2.5 px-1.5">
                <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#5cc8ff] to-[#a78bfa] text-[#0a0f1e] shadow-[0_0_20px_rgba(92,200,255,0.35)]">
                  <Icon name="activity" size={18} />
                </span>
                <div>
                  <p className="text-[12px] font-black tracking-[-0.02em] text-[#e9eefb]">
                    WUGAMS<span className="text-[#5cc8ff]">.</span>
                  </p>
                  <p className="font-mono text-[8px] font-bold uppercase tracking-[0.22em] text-[#5c6889]">Digital Observatory</p>
                </div>
              </div>
              {NAV.map((item) => {
                const isActive = segment === item.id;
                return (
                  <button
                    className={
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-bold transition " +
                      (isActive ? "bg-[#5cc8ff]/12 text-[#7dd3fc]" : "text-[#8b96b3] hover:bg-white/[0.04] hover:text-[#c3cbdf]")
                    }
                    key={item.id}
                    onClick={() => {
                      setSegment(item.id);
                      goto(item.id);
                    }}
                    type="button"
                  >
                    <Icon name={item.icon} size={15} />
                    {item.label}
                    {isActive ? <span className="ml-auto size-1.5 rounded-full bg-[#5cc8ff]" /> : null}
                  </button>
                );
              })}
              <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                <SectionHeader eyebrow="Source" title="Audit /health" />
                <p className="mt-2 font-mono text-[9px] font-bold text-[#5c6889]">
                  {data ? formatChecked(data.loadedAt) : "chargement…"}
                </p>
                <p className="mt-1 text-[10px] leading-4 text-[#4a5675]">
                  Trace <span className="text-[#5c6889]">based on loaded audit events</span> — aucune donnée inventée.
                </p>
              </div>
            </div>
          </aside>

          {/* Contenu */}
          <div className="min-w-0 space-y-5">
            {/* Topbar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="hidden font-mono text-[10px] font-bold tabular-nums text-[#5c6889] sm:block">
                  {data ? `Dernière vérification ${formatChecked(data.loadedAt)}` : "Chargement de l'observatoire…"}
                </p>
                <p className="truncate text-[11px] font-semibold text-[#8b96b3] sm:hidden">
                  {firstName ? `Observatoire de ${firstName}` : "Digital Observatory"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="hidden items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 font-mono text-[11px] font-bold text-[#8b96b3] transition hover:border-[#5cc8ff]/40 hover:text-[#c3cbdf] sm:flex"
                  onClick={() => setPaletteOpen(true)}
                  type="button"
                >
                  <Icon name="search" size={13} />
                  <span className="text-[#5c6889]">Rechercher…</span>
                  <span className="rounded border border-white/[0.14] bg-white/[0.06] px-1 py-0.5 text-[9px] text-[#5c6889]">⌘K</span>
                </button>
                <button
                  aria-live="polite"
                  className="relative grid size-9 place-items-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-[#8b96b3] transition hover:text-[#c3cbdf]"
                  onClick={() => {
                    setSegment("notifications");
                    goto("notifications");
                  }}
                  title="Alertes"
                  type="button"
                >
                  <Icon name="bell" size={15} />
                  {data && (data.unread ?? 0) > 0 && !notificationsRead ? (
                    <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#5cc8ff] font-mono text-[8px] font-black text-[#0a0f1e]">
                      {data.unread ?? 0}
                    </span>
                  ) : null}
                </button>
                <button
                  className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-2.5 py-1.5 transition hover:border-white/[0.2]"
                  onClick={() => { void refresh(); }}
                  title="Actualiser"
                  type="button"
                >
                  <Avatar initials={(user?.initials ?? "??")} ring="rgba(92,200,255,0.4)" size={26} />
                  <span className="hidden max-w-24 truncate text-[11px] font-bold text-[#c3cbdf] md:block">
                    {firstName ?? "Opérateur"}
                  </span>
                  <Icon className="text-[#5c6889]" name="refresh" size={13} />
                </button>
              </div>
            </div>

            {data ? (
              <>
                <section id="overview" className="scroll-mt-6 space-y-5">
                  <DigitalHero data={data} onOpenLog={setActiveLog} />

                  <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                    <AuditConstellation logs={logs} onSelectTable={(table) => { patchFilters({ table }); goto("journal"); }} />
                    <div className="space-y-5">
                      <ActionMix logs={logs} onSelectAction={(action) => { patchFilters({ action }); goto("journal"); }} />
                      <ActivityHeatmap logs={logs} />
                    </div>
                  </div>
                </section>

                <section id="surfaces" className="scroll-mt-6 space-y-5">
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                    <OperationalSurfaces logs={logs} onSelectTable={(table) => { patchFilters({ table }); goto("journal"); }} />
                    <ActivityHeatmap logs={logs} />
                  </div>
                  <div className="grid gap-5 lg:grid-cols-2">
                    <ApiHealth health={data.health} onRefresh={() => void refresh()} intervalMs={30000} />
                    <SecurityPanel firstName={firstName} />
                  </div>
                </section>

                <section id="journal" className="scroll-mt-6 space-y-5">
                  <div className="rounded-3xl border border-[rgba(148,163,207,0.12)] bg-[#0f172f]/80 p-4 sm:p-5">
                    <SectionHeader
                      eyebrow="AUDIT STREAM"
                      title="Journal des opérations"
                      action={
                        <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-black/20 p-0.5">
                          {(["comfort", "compact"] as const).map((mode) => (
                            <button
                              className={"rounded-md px-2 py-1 font-mono text-[9px] font-black tracking-wider transition " + (density === mode ? "bg-white/[0.08] text-[#c3cbdf]" : "text-[#5c6889] hover:text-[#c3cbdf]")}
                              key={mode}
                              onClick={() => setDensity(mode)}
                              type="button"
                            >
                              {mode.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      }
                    />
                    <div className="mt-4">
                      <AuditFilters
                        actions={actionStats}
                        actors={actorStats}
                        filters={filters}
                        hasActiveFilters={Boolean(filters.table || filters.action || filters.user || filters.entity)}
                        onChange={patchFilters}
                        onReset={resetFilters}
                        tables={tableStats}
                      />
                    </div>
                    <div className="mt-5">
                      <TimeMachine max={filteredMax} onChange={(value) => setTimeIndex(value)} value={timeIndex} valueLabel={shownCount} />
                    </div>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    <div className="rounded-3xl border border-[rgba(148,163,207,0.12)] bg-[#0f172f]/80 p-4 sm:p-5">
                      {filtered.length === 0 ? (
                        <AuditEmpty query={filters.table ?? filters.action ?? "filtres"} />
                      ) : (
                        <AuditList density={density} events={filtered} onSelect={setActiveLog} timeIndex={shownCount} />
                      )}
                    </div>
                    <ActorList activeUserId={filters.user ?? null} logs={logs} onSelect={(userId) => patchFilters({ user: userId })} />
                  </div>
                </section>

                <section id="securite" className="scroll-mt-6 space-y-5">
                  <SecurityPanel firstName={firstName} />
                </section>

                <section id="notifications" className="scroll-mt-6">
                  <NotificationsList
                    notifications={data.notifications}
                    onMarkAllRead={() => setNotificationsRead(true)}
                  />
                </section>
              </>
            ) : (
              <div className="space-y-5">
                <SkeletonBlock className="h-72" />
                <div className="grid gap-5 xl:grid-cols-2">
                  <SkeletonBlock className="h-56" />
                  <SkeletonBlock className="h-56" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nav mobile flottante */}
        <div className="mt-5 flex items-center justify-center gap-1 rounded-2xl border border-white/[0.08] bg-[#0c1320]/90 p-1.5 backdrop-blur lg:hidden">
          {NAV.slice(0, 4).map((item) => (
            <button
              className={"flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[9px] font-bold transition " + (segment === item.id ? "bg-[#5cc8ff]/12 text-[#7dd3fc]" : "text-[#5c6889]")}
              key={item.id}
              onClick={() => { setSegment(item.id); goto(item.id); }}
              type="button"
            >
              <Icon name={item.icon} size={15} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
      {activeLog ? (
        <AuditDetail
          key={activeLog.id}
          log={activeLog}
          onClose={() => setActiveLog(null)}
          onNavigate={navigateLog}
        />
      ) : null}
      </AnimatePresence>

      <CommandPalette
        logs={logs}
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onRequestOpen={() => setPaletteOpen(true)}
        onSelectAction={(action) => { patchFilters({ action }); setPaletteOpen(false); goto("journal"); }}
        onSelectActor={(userId) => { patchFilters({ user: userId }); setPaletteOpen(false); goto("journal"); }}
        onSelectLog={(log) => { setActiveLog(log); setPaletteOpen(false); }}
        onSelectTable={(table) => { patchFilters({ table }); setPaletteOpen(false); goto("journal"); }}
      />
    </MotionConfig>
  );
}