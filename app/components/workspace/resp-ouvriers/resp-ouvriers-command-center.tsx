"use client";

import { useCallback, useEffect, useState } from "react";
import { MotionConfig } from "motion/react";

import { useSmartPolling } from "@/app/hooks/use-smart-polling";
import { Icon } from "@/app/components/ui/app-icon";
import { Reveal } from "@/app/components/workspace/executive/reveal";
import { CommandPalette } from "@/app/components/workspace/resp-ouvriers/command/command-palette";
import { MissionDetail } from "@/app/components/workspace/resp-ouvriers/missions/mission-detail";
import { Journey } from "@/app/components/workspace/resp-ouvriers/missions/journey";
import { MissionConstellation } from "@/app/components/workspace/resp-ouvriers/missions/mission-constellation";
import { LiveActivity } from "@/app/components/workspace/resp-ouvriers/activity/live-activity";
import { AttentionCenter } from "@/app/components/workspace/resp-ouvriers/attention/attention-center";
import { TeamPulse } from "@/app/components/workspace/resp-ouvriers/attendance/team-pulse";
import { GpsTracker } from "@/app/components/workspace/resp-ouvriers/gps/gps-tracker";
import { FieldPulse } from "@/app/components/workspace/resp-ouvriers/hero/field-pulse";
import { NotificationsPanel } from "@/app/components/workspace/resp-ouvriers/notifications/notifications-panel";
import { PerformancePanel } from "@/app/components/workspace/resp-ouvriers/performance/performance-panel";
import {
  loadRespOuvriersOverview,
  type FieldMission,
  type PhotoPoint,
  type RespOuvriersOverview,
} from "@/app/lib/resp-ouvriers-data";

const REFRESH_INTERVAL_MS = 60_000;
const NAV_SECTIONS: { id: string; label: string }[] = [
  { id: "focus", label: "Vision" },
  { id: "attention", label: "À traiter" },
  { id: "missions", label: "Missions" },
  { id: "parcours", label: "Parcours" },
  { id: "equipe", label: "Équipe" },
  { id: "performance", label: "Rendement" },
  { id: "notifications", label: "Alertes" },
];

function formatUpdatedAt(timestamp: number): string {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(
    new Date(timestamp),
  );
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function RespOuvriersCommandCenter() {
  const [data, setData] = useState<RespOuvriersOverview | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState<FieldMission | null>(null);
  const [journey, setJourney] = useState<FieldMission | null>(null);
  const [photo, setPhoto] = useState<PhotoPoint | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [allRead, setAllRead] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const overview = await loadRespOuvriersOverview();
    setData(overview);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadRespOuvriersOverview().then((overview) => {
      if (!cancelled) {
        setData(overview);
        setJourney(overview.missions[0] ?? null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useSmartPolling(refresh, REFRESH_INTERVAL_MS);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
      if (event.key === "Escape") {
        setPhoto(null);
        setDetail((current) => (current ? null : current));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openJourney = (mission: FieldMission) => {
    setDetail(null);
    setJourney(mission);
    scrollToSection("parcours");
  };

  const sourceLabel = data?.source === "api" ? "En direct" : "Démonstration";
  const sourceTone =
    data?.source === "api"
      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
      : "border-sky-400/25 bg-sky-400/10 text-sky-300";

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0b1020] p-5 shadow-2xl shadow-slate-950/40 sm:p-6 lg:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(3,209,148,0.08),transparent)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(50%_100%_at_50%_100%,rgba(56,189,248,0.05),transparent)]" />

        <div className="relative space-y-6">
          {/* Barre de commande */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className={"inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold " + sourceTone}>
                <span className={"size-1.5 rounded-full " + (data?.source === "api" ? "bg-emerald-400" : "bg-sky-400")} />
                {sourceLabel}
              </span>
              <span className="hidden font-mono text-[11px] font-bold tabular-nums text-[#5c6889] sm:inline">
                {data ? formatUpdatedAt(data.updatedAt) : "…"}
              </span>
              {data?.firstName ? (
                <span className="hidden truncate text-[11px] font-semibold text-[#8b96b3] md:inline">Resp. {data.firstName}</span>
              ) : null}
            </div>

            <button
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold text-slate-300 transition hover:border-white/25 hover:text-white md:inline-flex"
              onClick={() => setPaletteOpen(true)}
              type="button"
            >
              <Icon name="search" size={12} />
              Recherche rapide
              <kbd className="rounded border border-white/15 bg-white/10 px-1.5 font-mono text-[9px] leading-none">⌘K</kbd>
            </button>

            <button
              aria-label="Actualiser les données"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-300 transition hover:border-white/20 hover:text-white disabled:opacity-60"
              disabled={refreshing}
              onClick={() => void refresh()}
              type="button"
            >
              <Icon className={refreshing ? "animate-spin" : undefined} name="refresh" size={13} />
              Actualiser
            </button>
          </div>

          {/* Navigation de sections */}
          <nav aria-label="Sections" className="scrollbar-thin -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
            {NAV_SECTIONS.map((section) => (
              <button
                className="whitespace-nowrap rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-bold text-[#8b96b3] transition hover:border-white/[0.2] hover:text-white"
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                type="button"
              >
                {section.label}
              </button>
            ))}
          </nav>

          {data ? (
            <>
              <section id="focus">
                <FieldPulse
                  overview={data}
                  onOpenMission={(id) => {
                    const mission = data.missions.find((candidate) => candidate.id === id);
                    if (mission) openJourney(mission);
                    else scrollToSection("attention");
                  }}
                />
              </section>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
                <Reveal>
                  <div id="attention">
                    <AttentionCenter
                      items={data.attention}
                      onOpen={(item) => {
                        const mission = data.missions.find((candidate) => candidate.id === item.missionId);
                        if (mission) openJourney(mission);
                        else scrollToSection("attention");
                      }}
                    />
                  </div>
                </Reveal>
                <Reveal delay={0.06}>
                  <div id="live">
                    <LiveActivity events={data.activity} />
                  </div>
                </Reveal>
              </div>

              <Reveal>
                <div id="missions">
                  <MissionConstellation missions={data.missions} onOpen={setDetail} />
                </div>
              </Reveal>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <Reveal>
                  <div id="gps">
                    <GpsTracker workers={data.workers} />
                  </div>
                </Reveal>
                <Reveal delay={0.06}>
                  <div id="parcours">
                    {journey ? <Journey mission={journey} /> : <div className="h-64" />}
                  </div>
                </Reveal>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <Reveal>
                  <div id="performance">
                    <PerformancePanel rows={data.performance} />
                  </div>
                </Reveal>
                <Reveal delay={0.06}>
                  <div id="equipe">
                    <TeamPulse workers={data.workers} onOpenWorker={() => scrollToSection("gps")} />
                  </div>
                </Reveal>
              </div>

              <Reveal>
                <div id="notifications">
                  <NotificationsPanel
                    notifications={allRead ? data.notifications.map((notification) => ({ ...notification, lu: true })) : data.notifications}
                    onMarkAll={() => setAllRead(true)}
                    unread={allRead ? 0 : data.unread}
                  />
                </div>
              </Reveal>
            </>
          ) : (
            <div aria-busy="true" className="grid min-h-[60vh] place-items-center" role="status">
              <div className="flex flex-col items-center gap-4">
                <span className="size-10 animate-spin rounded-full border-4 border-white/10 border-t-[#03d894]" />
                <p className="text-sm font-semibold text-slate-400">Calibrage du suivi terrain…</p>
              </div>
            </div>
          )}
        </div>

        {data ? (
          <MissionDetail
            mission={detail}
            onClose={() => setDetail(null)}
            onNavigate={({ section, detail: missionId }) => {
              if (section === "missions" && missionId) {
                const mission = data.missions.find((candidate) => candidate.id === missionId);
                if (mission) openJourney(mission);
              } else {
                scrollToSection(section);
              }
            }}
            onPhoto={setPhoto}
          />
        ) : null}

        <PhotoLightbox photo={photo} onClose={() => setPhoto(null)} mission={journey} />

        {data && paletteOpen ? (
          <CommandPalette
            attention={data.attention}
            missions={data.missions}
            onClose={() => setPaletteOpen(false)}
            onNavigate={scrollToSection}
            onOpenMission={(mission) => {
              setDetail(mission);
              setPaletteOpen(false);
            }}
            open={paletteOpen}
            workers={data.workers}
          />
        ) : null}
      </div>
    </MotionConfig>
  );
}

function PhotoLightbox({ photo, mission, onClose }: { photo: PhotoPoint | null; mission: FieldMission | null; onClose: () => void }) {
  if (!photo) return null;
  return (
    <div className="fixed inset-0 z-[95] grid place-items-center bg-[#04080f]/85 p-6 backdrop-blur-sm" onClick={onClose} role="presentation">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/[0.12] bg-[#0c1530] shadow-2xl">
        <div className="relative aspect-[16/10] bg-gradient-to-br from-white/[0.08] to-transparent">
          <div className="absolute inset-0 grid place-items-center">
            <Icon className="text-[#5c6889]" name="camera" size={42} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-[13px] font-bold text-[#e8eefb]">{photo.label}</p>
            <p className="mt-0.5 text-[11px] text-[#8b96b3]">
              {mission?.numero ?? "Mission"} · {photo.size} · qualité {photo.statut}%
            </p>
          </div>
          <button
            className="grid size-9 shrink-0 place-items-center rounded-full border border-white/[0.1] text-[#8b96b3] transition hover:text-white"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}