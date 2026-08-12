"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { Icon } from "@/app/components/ui/app-icon";
import type { IconName } from "@/app/components/ui/app-icon";
import { ClientHero } from "@/app/components/workspace/client/client-hero";
import { ClientKpiGrid } from "@/app/components/workspace/client/client-kpi-grid";
import { ClientMissions } from "@/app/components/workspace/client/client-missions";
import { ClientFactures } from "@/app/components/workspace/client/client-factures";
import { ClientDevis } from "@/app/components/workspace/client/client-devis";
import { ClientCommandes } from "@/app/components/workspace/client/client-commandes";
import { ClientNotifications } from "@/app/components/workspace/client/client-notifications";
import { ClientProfil } from "@/app/components/workspace/client/client-profil";
import { ClientSearch } from "@/app/components/workspace/client/client-search";
import { ClientDemandes } from "@/app/components/workspace/client/client-demandes";
import { ClientProjets } from "@/app/components/workspace/client/client-projets";
import { ClientCleans } from "@/app/components/workspace/client/client-cleans";
import { ClientMode2Vie } from "@/app/components/workspace/client/client-mode2vie";
import {
  demoClientPortalData,
  globalStateFrom,
  loadClientPortalData,
} from "@/app/lib/client-data";
import type { ClientPortalData } from "@/app/lib/client-data";
import { demoCleansOverview } from "@/app/lib/cleans-data";
import type { CleansOverview } from "@/app/lib/cleans-data";
import type { WorkspaceUser } from "@/app/lib/workspace-demo";

type ClientPortalScreenProps = {
  user: WorkspaceUser;
};

const navItems: { id: string; label: string; icon: IconName }[] = [
  { id: "portail-apercu", label: "Vue d'ensemble", icon: "dashboard" },
  { id: "portail-demandes", label: "Mes demandes", icon: "clipboard" },
  { id: "portail-projets", label: "Mes projets", icon: "camera" },
  { id: "portail-cleans", label: "Mon Wugams Cleans", icon: "sparkles" },
  { id: "portail-mode2vie", label: "Mode2Vie [Lifestyle]™", icon: "newspaper" },
  { id: "portail-missions", label: "Missions", icon: "hardhat" },
  { id: "portail-factures", label: "Factures", icon: "file-text" },
  { id: "portail-devis", label: "Devis", icon: "sparkles" },
  { id: "portail-commandes", label: "Commandes", icon: "box" },
  { id: "portail-notifications", label: "Notifications", icon: "bell" },
  { id: "portail-profil", label: "Profil", icon: "user" },
];

export function ClientPortalScreen({ user }: ClientPortalScreenProps) {
  const [data, setData] = useState<ClientPortalData>(demoClientPortalData);
  const [cleans, setCleans] = useState<CleansOverview>(demoCleansOverview);
  const [live, setLive] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeId, setActiveId] = useState("portail-apercu");
  const reduce = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    loadClientPortalData().then((result) => {
      if (cancelled) return;
      setData(result);
      setLive(result.live);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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
    const facturesImpayees = data.factures.filter((f) => f.statut === "EMISE" || f.statut === "EN_RETARD");
    const montantImpaye = facturesImpayees.reduce((sum, f) => sum + Number(f.montant_ttc), 0);
    const dernierEvenement = data.notifications[0]?.time ?? "Aujourd'hui";
    return {
      missions: data.missions.length,
      commandes: data.commandes.length,
      devis: data.devis.length,
      factures: data.factures.length,
      facturesImpayees: facturesImpayees.length,
      facturesPayees: data.factures.filter((f) => f.statut === "PAYEE").length,
      montantImpaye,
      notificationsNonLues: data.notifications.filter((n) => !n.lu).length,
      derniereActivite: dernierEvenement,
    };
  }, [data]);

  const state = useMemo(
    () => globalStateFrom(data.missions, data.factures, data.devis),
    [data]
  );

  const missionsActives = data.missions.filter((m) => m.statut !== "TERMINE" && m.statut !== "VALIDE").length;

  return (
    <div className="space-y-10 lg:space-y-12">
      <div className="sticky top-[76px] z-20 -mx-4 bg-[#f5f7fb]/90 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
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

      <div id="portail-apercu" className="scroll-mt-44 space-y-10 lg:space-y-12">
        <ClientHero
          facturesEnAttente={kpi.facturesImpayees}
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
                {live ? "Données synchronisées avec vos dossiers WUGAMS" : "Aperçu de votre activité chez WUGAMS"}
              </p>
            </div>
            <span
              className={
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide " +
                (live
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400")
              }
            >
              <span className={"size-1.5 rounded-full " + (live ? "animate-pulse bg-emerald-500" : "bg-slate-400")} />
              {live ? "Temps réel" : "Aperçu démo"}
            </span>
          </div>
          <ClientKpiGrid {...kpi} />
        </div>
      </div>

      <ClientDemandes demandes={data.demandes} />
      <ClientProjets projets={data.projets} />
      <ClientCleans cleans={cleans} />
      <ClientMode2Vie />

      <ClientMissions missions={data.missions} />
      <ClientFactures factures={data.factures} />
      <ClientDevis devis={data.devis} />
      <ClientCommandes commandes={data.commandes} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <ClientNotifications key={live ? "live" : "demo"} notifications={data.notifications} />
        <div className="space-y-4">
          <button
            className="flex w-full items-center justify-between rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-5 text-left transition hover:border-[#17294b]/40 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-white/15 dark:bg-white/[0.03]"
            onClick={() => setSearchOpen(true)}
            type="button"
          >
            <span className="flex items-center gap-3.5">
              <span className="grid size-10 place-items-center rounded-2xl bg-[#17294b] text-[#f2c56d]">
                <Icon name="search" size={18} />
              </span>
              <span>
                <span className="block text-[13px] font-bold text-[#16233a] dark:text-slate-200">Recherche globale</span>
                <span className="mt-0.5 block text-[11px] text-slate-400">
                  Demandes, projets, Cleans, Mode2Vie — tout votre espace
                </span>
              </span>
            </span>
            <kbd className="hidden shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-400 sm:block">
              Ctrl + K
            </kbd>
          </button>
          <motion.div
            className="overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-[#17294b] to-[#243a61] p-6 text-white shadow-lg shadow-[#17294b]/15 dark:border-white/10"
            initial={reduce ? undefined : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f2c56d]">Votre confiance</p>
            <p className="mt-2.5 text-[15px] font-bold leading-7 tracking-[-0.02em]">
              Un interlocuteur dédié, une équipe engagée, des données chiffrées.
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Chaque mission, facture et devis de cet espace vous appartient — rien d&apos;autre.
            </p>
            <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold text-slate-300">
              <Icon name="shield" size={14} className="text-[#f2c56d]" />
              Espace sécurisé · ROLE_CLIENT_MEMBRE
            </div>
          </motion.div>
        </div>
      </div>

      <ClientProfil user={user} />

      <ClientSearch cleans={cleans} data={data} key={searchOpen ? "open" : "closed"} onClose={() => setSearchOpen(false)} onNavigate={navigateTo} open={searchOpen} />
    </div>
  );
}
