"use client";

import { useEffect, useState } from "react";
import { MotionConfig } from "motion/react";

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

export function ExecutiveCommandCenter() {
  const [data, setData] = useState<ExecutiveOverview | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadExecutiveOverview().then((overview) => {
      if (!cancelled) setData(overview);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-6">
        {data ? (
          <>
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
