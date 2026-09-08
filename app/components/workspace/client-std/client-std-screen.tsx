"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { ClientStdHero } from "@/app/components/workspace/client-std/client-std-hero";
import { ClientStdKpiGrid } from "@/app/components/workspace/client-std/client-std-kpi-grid";
import { ClientStdMissions } from "@/app/components/workspace/client-std/client-std-missions";
import { ClientStdCommandes } from "@/app/components/workspace/client-std/client-std-commandes";
import { ClientStdDevis } from "@/app/components/workspace/client-std/client-std-devis";
import { ClientStdNotifications } from "@/app/components/workspace/client-std/client-std-notifications";
import {
  clientStdProgress,
  clientStdStateFrom,
  loadClientStdData,
} from "@/app/lib/client-std-data";
import type { ClientStdData } from "@/app/lib/client-std-data";
import type { CleansOverview } from "@/app/lib/cleans-data";
import type { WorkspaceUser } from "@/app/lib/workspace-demo";

type ClientStdScreenProps = {
  user: WorkspaceUser;
};

export function ClientStdScreen({ user }: ClientStdScreenProps) {
  const [data, setData] = useState<ClientStdData | null>(null);
  const [cleans, setCleans] = useState<CleansOverview | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    loadClientStdData().then((result) => {
      if (cancelled || !result) return;
      setData(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const navigateTo = useCallback((sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [reduce]);

  const kpi = useMemo(() => {
    if (!data) return null;
    const dernierEvenement = data.notifications[0]?.time ?? "Aujourd'hui";
    return {
      missions: data.missions.length,
      commandes: data.commandes.length,
      devis: data.devis.length,
      notificationsNonLues: data.notifications.filter((n) => !n.lu).length,
      derniereActivite: dernierEvenement,
      progressionGlobale: clientStdProgress(data.missions),
    };
  }, [data]);

  const state = useMemo(
    () => data ? clientStdStateFrom(data.missions, data.devis) : "ok",
    [data]
  );

  const missionsActives = data ? data.missions.filter((m) => m.statut !== "TERMINE" && m.statut !== "VALIDE").length : 0;

  if (!data || !kpi) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex flex-col items-center gap-4">
          <span className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#e3a641]" />
          <p className="text-sm font-semibold text-slate-400">Chargement de votre espace client…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 lg:space-y-12">
      <div id="std-apercu" className="scroll-mt-32 lg:scroll-mt-44 space-y-10 lg:space-y-12">
        <ClientStdHero
          missionActive={missionsActives > 0}
          missionsActives={missionsActives}
          notificationsNonLues={kpi.notificationsNonLues}
          onNavigate={navigateTo}
          state={state}
          user={user}
        />

        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-[-0.03em] text-[#16233a] dark:text-slate-100">Vue d&apos;ensemble</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {data.live ? "Données synchronisées avec vos dossiers WUGAMS" : "Aperçu de vos prestations chez WUGAMS"}
              </p>
            </div>
          </div>
          <ClientStdKpiGrid {...kpi} />
        </div>
      </div>

      <ClientStdMissions missions={data.missions} />
      <ClientStdCommandes commandes={data.commandes} />
      <ClientStdDevis devis={data.devis} />

      <ClientStdNotifications live={data.live} notifications={data.notifications} />
    </div>
  );
}
