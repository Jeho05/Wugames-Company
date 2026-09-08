"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { ClientHero } from "@/app/components/workspace/client/client-hero";
import { ClientKpiGrid } from "@/app/components/workspace/client/client-kpi-grid";
import { ClientMissions } from "@/app/components/workspace/client/client-missions";
import { ClientDevis } from "@/app/components/workspace/client/client-devis";
import { ClientCommandes } from "@/app/components/workspace/client/client-commandes";
import { ClientNotifications } from "@/app/components/workspace/client/client-notifications";
import {
  globalStateFrom,
  loadClientPortalData,
} from "@/app/lib/client-data";
import type { ClientPortalData } from "@/app/lib/client-data";
import { emptyCleansOverview, loadCleansOverview } from "@/app/lib/cleans-data";
import type { CleansOverview } from "@/app/lib/cleans-data";
import type { WorkspaceUser } from "@/app/lib/workspace-demo";

type ClientPortalScreenProps = {
  user: WorkspaceUser;
};

export function ClientPortalScreen({ user }: ClientPortalScreenProps) {
  const [data, setData] = useState<ClientPortalData | null>(null);
  const [cleans, setCleans] = useState<CleansOverview>(emptyCleansOverview);
  const [live, setLive] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    loadClientPortalData().then((result) => {
      if (cancelled) return;
      setData(result);
      setLive(result.live);
    });
    loadCleansOverview().then((result) => {
      if (cancelled) return;
      setCleans(result);
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

  const abonnementStatut = useMemo(() => {
    if (cleans.abonnement.statut === "ACTIF") return "ACTIF" as const;
    if (cleans.abonnement.statut === "SUSPENDU") return "EXPIRE" as const;
    return "AUCUN" as const;
  }, [cleans.abonnement.statut]);

  const abonnementDetail = useMemo(() => {
    if (cleans.abonnement.statut !== "ACTIF" || !cleans.abonnement.planNom) {
      return "Choisissez votre plan";
    }
    return `${cleans.abonnement.planNom} · ${cleans.abonnement.prixMensuel.toLocaleString("fr-FR")} FCFA/mois`;
  }, [cleans.abonnement]);

  const state = useMemo(
    () => data ? globalStateFrom(data.missions, data.factures, data.devis, abonnementStatut) : "critical" as const,
    [data, abonnementStatut]
  );

  const missionsActives = data ? data.missions.filter((m) => m.statut !== "TERMINE" && m.statut !== "VALIDE").length : 0;

  if (!data) {
    return (
      <div className="space-y-10 lg:space-y-12">
        <div className="animate-pulse space-y-4">
          <div className="h-40 rounded-3xl bg-slate-200/70" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 rounded-2xl bg-slate-200/70" />
            <div className="h-24 rounded-2xl bg-slate-200/70" />
          </div>
          <div className="h-96 rounded-2xl bg-slate-200/70" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 lg:space-y-12">
      <div id="portail-apercu" className="scroll-mt-32 lg:scroll-mt-44 space-y-10 lg:space-y-12">
        <ClientHero
          facturesEnAttente={kpi?.facturesImpayees ?? 0}
          missionsActives={missionsActives}
          notificationsNonLues={kpi?.notificationsNonLues ?? 0}
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
          </div>
          {kpi ? (
            <ClientKpiGrid
              {...kpi}
              abonnementDetail={abonnementDetail}
              abonnementValeur={cleans.abonnement.statut === "ACTIF" ? "Actif" : "Aucun"}
            />
          ) : null}
        </div>
      </div>

      <ClientMissions missions={data.missions} />
      <ClientDevis devis={data.devis} />
      <ClientCommandes commandes={data.commandes} />

      <ClientNotifications key={live ? "live" : "demo"} live={live} notifications={data.notifications} />
    </div>
  );
}
