"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Icon } from "@/app/components/ui/app-icon";
import { StatusBadge } from "@/app/components/ui/status-badge";
import { useAuth } from "@/app/lib/auth-context";
import { getFacturesConsolidation } from "@/app/lib/api/factures";
import { getFilialesConsolidation } from "@/app/lib/api/filiales";
import { listMissions } from "@/app/lib/api/missions";
import { unreadCount } from "@/app/lib/api/notifications";
import { listProduits } from "@/app/lib/api/stocks";
import {
  dashboardMetrics,
  dashboardProjects,
  schedule,
  stockAlerts,
  type StatusTone,
} from "@/app/lib/demo-data";
import type { Produit } from "@/app/lib/contracts";
import { formatFcfa } from "@/app/lib/store-data";

type DashboardMetric = (typeof dashboardMetrics)[number];
type ScheduleItem = (typeof schedule)[number];
type StockAlert = (typeof stockAlerts)[number] & { depot?: string };

type DashboardLiveData = {
  source: "api" | "demo";
  metrics: DashboardMetric[];
  schedule: ScheduleItem[];
  alerts: StockAlert[];
};

const produitAlertMapping: Record<string, { stock: string; tone: StatusTone }> = {
  REAPPROVISIONNEMENT_REQUIS: { stock: "À commander", tone: "warning" },
  COMMANDE_EN_COURS: { stock: "En commande", tone: "info" },
  RUPTURE: { stock: "Rupture", tone: "danger" },
};

function produitToAlert(produit: Produit): StockAlert | null {
  const mapping = produitAlertMapping[produit.statut];
  if (!mapping) return null;
  return {
    title: `${produit.nom} · ${produit.reference}`,
    stock: mapping.stock,
    tone: mapping.tone,
    depot: produit.filiale?.nom ?? "Dépôt principal",
  };
}

function missionToSchedule(mission: Awaited<ReturnType<typeof listMissions>>[number]): ScheduleItem {
  const date = mission.date_planifiee ? new Date(mission.date_planifiee) : null;
  const time = date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" }).format(date)
    : "Non planifiée";
  return {
    time,
    title: mission.titre,
    type: mission.filiale ? `Mission · ${mission.filiale.nom}` : "Mission WUGAMS",
  };
}

function loadDashboardLive(): Promise<DashboardLiveData> {
  return Promise.allSettled([
    getFilialesConsolidation(),
    getFacturesConsolidation(),
    unreadCount(),
    listProduits(),
    listMissions(),
  ]).then(([filialesResult, facturesResult, notificationsResult, produitsResult, missionsResult]) => {
    const filiales = filialesResult.status === "fulfilled" ? filialesResult.value : null;
    const factures = facturesResult.status === "fulfilled" ? facturesResult.value : null;
    const unread = notificationsResult.status === "fulfilled" ? notificationsResult.value : 0;
    const produits = produitsResult.status === "fulfilled" ? produitsResult.value : [];
    const missions = missionsResult.status === "fulfilled" ? missionsResult.value : [];

    if (!filiales || !factures) {
      return { source: "demo", metrics: dashboardMetrics, schedule, alerts: stockAlerts };
    }

    const alerts = produits.map(produitToAlert).filter((alert) => alert !== null) as StockAlert[];
    const liveSchedule = missions
      .filter((m) => ["EN_COURS", "ACCEPTE", "NOTIFIE"].includes(m.statut))
      .slice(0, 3)
      .map(missionToSchedule);

    return {
      source: "api",
      metrics: [
        {
          caption: "factures consolidées",
          change: `${factures.totals.total_factures} factures`,
          icon: "chart",
          label: "Chiffre d'affaires TTC",
          tone: "success",
          value: formatFcfa(factures.totals.total_ttc),
        },
        {
          caption: "tout le groupe",
          change: `${filiales.summary.total_commandes} commandes`,
          icon: "building",
          label: "Filiales",
          tone: "info",
          value: String(filiales.summary.total_filiales),
        },
        {
          caption: "missions sur le groupe",
          change: `${filiales.summary.total_missions} missions`,
          icon: "users",
          label: "Utilisateurs",
          tone: "success",
          value: String(filiales.summary.total_users),
        },
        {
          caption: "stocks + notifications",
          change: `${unread} non lues`,
          icon: "warning",
          label: "Points d'attention",
          tone: "danger",
          value: String(alerts.length + unread),
        },
      ],
      schedule: liveSchedule.length > 0 ? liveSchedule : schedule,
      alerts: alerts.slice(0, 4),
    };
  });
}

const chartBars = [34, 44, 38, 58, 49, 70, 64, 83, 72, 91, 82, 96];

const trendColor = {
  danger: "text-red-600",
  info: "text-sky-600",
  neutral: "text-slate-500",
  success: "text-emerald-600",
  warning: "text-amber-700",
};

const roleFraming: Record<string, { eyebrow: string; description: string }> = {
  ROLE_COMPTABLE: {
    eyebrow: "Vue financière",
    description: "Voici ce qui mérite votre attention sur les factures, paiements et encaissements aujourd'hui.",
  },
  ROLE_DEV_DIGITAL: {
    eyebrow: "Vue système",
    description: "État des modules, journaux et paramètres : voici ce qui mérite votre attention aujourd'hui.",
  },
  ROLE_MGR_FILIALE: {
    eyebrow: "Vue filiale",
    description: "Voici ce qui mérite votre attention sur votre filiale et ses équipes aujourd'hui.",
  },
  ROLE_MGR_OPS: {
    eyebrow: "Vue opérations",
    description: "Voici ce qui mérite votre attention sur les chantiers, missions et équipes aujourd'hui.",
  },
  ROLE_MGR_PARTENAIRE: {
    eyebrow: "Vue partenariats",
    description: "Voici ce qui mérite votre attention sur les fournisseurs et les stocks aujourd'hui.",
  },
  ROLE_OUVRIER: {
    eyebrow: "Vue terrain",
    description: "Voici vos missions du jour, votre pointage et votre performance récente.",
  },
  ROLE_RESP_OUVRIERS: {
    eyebrow: "Vue équipes",
    description: "Voici ce qui mérite votre attention sur les équipes, présences et évaluations aujourd'hui.",
  },
  ROLE_SECRETAIRE: {
    eyebrow: "Vue secrétariat",
    description: "Voici ce qui mérite votre attention sur les demandes, devis et rendez-vous aujourd'hui.",
  },
};

export function DashboardScreen() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("Ce mois");
  const [live, setLive] = useState<DashboardLiveData>({
    source: "demo",
    metrics: dashboardMetrics,
    schedule,
    alerts: stockAlerts,
  });

  useEffect(() => {
    let cancelled = false;
    loadDashboardLive().then((data) => {
      if (!cancelled) setLive(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const framing = user ? (roleFraming[user.role] ?? roleFraming.ROLE_MGR_OPS) : roleFraming.ROLE_MGR_OPS;
  const firstName = user ? user.name.split(" ")[0] : "Jéhovani";
  const isWorker = user?.role === "ROLE_OUVRIER";

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d19331]">
            {framing.eyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.045em] text-[#17294b] sm:text-[30px]">
            Bonjour, {firstName}.
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
            {framing.description}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {["Cette semaine", "Ce mois", "Cette année"].map((item) => (
              <button
                aria-pressed={period === item}
                className={
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition " +
                  (period === item
                    ? "bg-[#17294b] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900")
                }
                key={item}
                onClick={() => setPeriod(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          {!isWorker ? (
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-4 py-2.5 text-sm font-bold text-[#14223b] shadow-lg shadow-amber-600/15 transition hover:bg-[#efb653]"
              href="/espace/rapports"
            >
              <Icon name="chart" size={17} />
              Voir les rapports
            </Link>
          ) : (
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e3a641] px-4 py-2.5 text-sm font-bold text-[#14223b] shadow-lg shadow-amber-600/15 transition hover:bg-[#efb653]"
              href="/espace/ouvriers"
            >
              <Icon name="hardhat" size={17} />
              Ma performance S1-S9
            </Link>
          )}
        </div>
      </section>

      <div
        className={
          "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm " +
          (live.source === "api"
            ? "border-emerald-100 bg-emerald-50 text-emerald-900"
            : "border-sky-100 bg-[#edf6ff] text-sky-900")
        }
      >
        <span
          className={
            "mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg shadow-sm " +
            (live.source === "api" ? "bg-white text-emerald-600" : "bg-white text-sky-600")
          }
        >
          <Icon name={live.source === "api" ? "check" : "sparkles"} size={15} />
        </span>
        <p className="leading-5">
          {live.source === "api" ? (
            <>
              <span className="font-bold">Données en direct.</span> Les indicateurs, missions et alertes de stock proviennent de l&apos;API WUGAMS.
            </>
          ) : (
            <>
              <span className="font-bold">Base d&apos;interface prête.</span> Les chiffres et dossiers affichés sont fictifs pour le moment ; les vues sont structurées pour recevoir les données de l&apos;API.
            </>
          )}
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {live.metrics.map((metric) => (
          <article
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            key={metric.label}
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500">{metric.label}</span>
              <span className="grid size-9 place-items-center rounded-xl bg-slate-100 text-[#456282]">
                <Icon name={metric.icon} size={18} />
              </span>
            </div>
            <p className="mt-5 text-[23px] font-bold tracking-[-0.045em] text-[#182842] sm:text-[28px]">
              {metric.value}
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px]">
              <span className={"font-bold " + trendColor[metric.tone]}>{metric.change}</span>
              <span className="text-slate-400">{metric.caption}</span>
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.75fr)]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-base font-bold tracking-[-0.025em] text-[#1a2943]">
                Dynamique du groupe
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Chiffre d&apos;affaires consolidé · {period.toLowerCase()}
              </p>
            </div>
            <button
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
              type="button"
            >
              FCFA
            </button>
          </div>

          <div className="mt-7 grid h-[210px] grid-cols-12 items-end gap-2 sm:gap-3">
            {chartBars.map((height, index) => (
              <div className="group flex h-full flex-col justify-end" key={index}>
                <span className="mb-2 hidden text-center text-[9px] font-bold text-slate-500 group-hover:block">
                  {height / 2} M
                </span>
                <div
                  className={
                    "w-full rounded-t-md transition duration-200 group-hover:opacity-85 " +
                    (index === chartBars.length - 1 ? "bg-[#e2a442]" : "bg-[#d5dfeb]")
                  }
                  style={{ height: height + "%" }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-6 text-[10px] font-semibold text-slate-400 sm:grid-cols-12">
            {["Août", "Sep", "Oct", "Nov", "Déc", "Jan", "Fév", "Mars", "Avr", "Mai", "Juin", "Juil."].map(
              (month, index) => (
                <span
                  className={index > 5 ? "hidden text-center sm:block" : "text-center"}
                  key={month}
                >
                  {month}
                </span>
              )
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-[#17294b] p-5 text-white shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-bold tracking-[-0.025em]">Priorités terrain</p>
              <p className="mt-1 text-xs text-slate-400">Les prochaines actions à orchestrer</p>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-[#f2c56d]">
              <Icon name="calendar" size={18} />
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {live.schedule.map((item, index) => (
              <div className="flex gap-3" key={item.title}>
                <div className="flex flex-col items-center">
                  <span className="mt-1 size-2.5 rounded-full border-2 border-[#17294b] bg-[#e5aa49] ring-1 ring-[#e5aa49]" />
                  {index !== live.schedule.length - 1 ? <span className="mt-1 h-10 w-px bg-white/15" /> : null}
                </div>
                <div className="pb-2">
                  <p className="text-[11px] font-bold text-[#f2c56d]">{item.time}</p>
                  <p className="mt-0.5 text-sm font-semibold leading-5 text-white">{item.title}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{item.type}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#f2c56d] transition hover:text-white"
            href="/espace/missions"
          >
            Ouvrir le planning <Icon name="arrow-right" size={15} />
          </Link>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.75fr)]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <p className="text-base font-bold tracking-[-0.025em] text-[#1a2943]">
                Chantiers à suivre
              </p>
              <p className="mt-0.5 text-xs text-slate-500">Interventions en cours et prochaines échéances</p>
            </div>
            <Link
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3e638e] hover:text-[#17294b]"
              href="/espace/chantiers"
            >
              Tout voir <Icon name="arrow-right" size={15} />
            </Link>
          </div>
          {/* Mobile Card View */}
          <div className="divide-y divide-slate-100 md:hidden">
            {dashboardProjects.map((project) => (
              <div className="p-4 space-y-3" key={project.client}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{project.client}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{project.location}</p>
                  </div>
                  <StatusBadge tone={project.status.tone}>{project.status.label}</StatusBadge>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Équipe : <strong className="text-slate-700">{project.lead}</strong></span>
                  <span className="font-semibold text-slate-800">{project.value}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Avancement</span>
                    <span className="font-bold text-[#3e638e]">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#4a759f]"
                      style={{ width: project.progress + "%" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  <th className="px-5 py-3 sm:px-6">Dossier</th>
                  <th className="px-3 py-3">Équipe</th>
                  <th className="px-3 py-3">Avancement</th>
                  <th className="px-3 py-3">Montant</th>
                  <th className="px-5 py-3 text-right sm:px-6">Statut</th>
                </tr>
              </thead>
              <tbody>
                {dashboardProjects.map((project) => (
                  <tr className="border-b border-slate-100 last:border-0" key={project.client}>
                    <td className="px-5 py-4 sm:px-6">
                      <p className="text-sm font-bold text-slate-700">{project.client}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{project.location}</p>
                    </td>
                    <td className="px-3 py-4 text-xs font-medium text-slate-600">{project.lead}</td>
                    <td className="px-3 py-4">
                      <div className="flex min-w-[125px] items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#4a759f]"
                            style={{ width: project.progress + "%" }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-xs font-semibold text-slate-700">{project.value}</td>
                    <td className="px-5 py-4 text-right sm:px-6">
                      <StatusBadge tone={project.status.tone}>{project.status.label}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-bold tracking-[-0.025em] text-[#1a2943]">
                Stock à sécuriser
              </p>
              <p className="mt-1 text-xs text-slate-500">Seuils minimums par dépôt</p>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Icon name="warning" size={18} />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {live.alerts.length > 0 ? (
              live.alerts.map((alert) => (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3" key={alert.title}>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-700">{alert.title}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{alert.depot ?? "Dépôt Treichville"}</p>
                  </div>
                  <StatusBadge tone={alert.tone}>{alert.stock}</StatusBadge>
                </div>
              ))
            ) : (
              <div className="grid place-items-center rounded-xl border border-slate-100 bg-slate-50/60 p-5 text-center">
                <p className="text-xs font-bold text-slate-600">Stocks au niveau</p>
                <p className="mt-1 text-[11px] text-slate-400">Aucun seuil minimum atteint sur les dépôts.</p>
              </div>
            )}
          </div>
          <Link
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-[#3e638e] transition hover:border-[#9fb6cf] hover:bg-sky-50"
            href="/espace/stocks"
          >
            Gérer les stocks <Icon name="arrow-right" size={15} />
          </Link>
        </article>
      </section>
    </div>
  );
}
