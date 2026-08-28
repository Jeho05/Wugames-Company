"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";
import { ClientStdHero } from "@/app/components/workspace/client-std/client-std-hero";
import { ClientStdKpiGrid } from "@/app/components/workspace/client-std/client-std-kpi-grid";
import { ClientStdMissions } from "@/app/components/workspace/client-std/client-std-missions";
import { ClientStdCommandes } from "@/app/components/workspace/client-std/client-std-commandes";
import { ClientStdDevis } from "@/app/components/workspace/client-std/client-std-devis";
import { ClientStdNotifications } from "@/app/components/workspace/client-std/client-std-notifications";
import { ClientStdProfil } from "@/app/components/workspace/client-std/client-std-profil";
import { ClientMode2Vie } from "@/app/components/workspace/client/client-mode2vie";
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

const navItems: { id: string; label: string; icon: IconName }[] = [
  { id: "std-apercu", label: "Vue d'ensemble", icon: "dashboard" },
  { id: "std-mode2vie", label: "Mode2Vie [Lifestyle]", icon: "newspaper" },
  { id: "std-missions", label: "Missions", icon: "hardhat" },
  { id: "std-commandes", label: "Commandes", icon: "shopping-bag" },
  { id: "std-devis", label: "Devis", icon: "sparkles" },
  { id: "std-notifications", label: "Notifications", icon: "bell" },
  { id: "std-profil", label: "Profil", icon: "user" },
];

export function ClientStdScreen({ user }: ClientStdScreenProps) {
  const [data, setData] = useState<ClientStdData | null>(null);
  const [cleans, setCleans] = useState<CleansOverview | null>(null);
  const [activeId, setActiveId] = useState("std-apercu");
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

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
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
      <div className="sticky top-16 z-20 -mx-4 bg-[#f5f7fb]/90 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:top-[76px] lg:-mx-8 lg:px-8 dark:bg-[#0f1a2e]/90">
        <nav
          aria-label="Sections du portail"
          className="scrollbar-none -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1"
        >
          {navItems.map((item) => {
            const active = activeId === item.id;
            return (
              <button
                aria-current={active ? "true" : undefined}
                className={
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 " +
                  (active
                    ? "border-[#17294b] bg-[#17294b] text-white shadow-lg shadow-[#17294b]/20"
                    : "border-slate-200/90 bg-white text-slate-500 hover:border-slate-300 hover:text-[#17294b] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white")
                }
                key={item.id}
                onClick={() => navigateTo(item.id)}
                type="button"
              >
                <Icon name={item.icon} size={13} className={active ? "text-[#f2c56d]" : undefined} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

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

      <ClientMode2Vie sectionId="std-mode2vie" />

      <ClientStdMissions missions={data.missions} />
      <ClientStdCommandes commandes={data.commandes} />
      <ClientStdDevis devis={data.devis} />

      <ClientStdNotifications live={data.live} notifications={data.notifications} />

      <ClientStdProfil user={user} />
    </div>
  );
}
