import type { IconName } from "@/app/components/ui/app-icon";
import * as auditApi from "@/app/lib/api/audit-logs";
import * as clientsApi from "@/app/lib/api/clients";
import * as facturesApi from "@/app/lib/api/factures";
import * as filialesApi from "@/app/lib/api/filiales";
import * as fournisseursApi from "@/app/lib/api/fournisseurs";
import * as missionsApi from "@/app/lib/api/missions";
import { unreadCount } from "@/app/lib/api/notifications";
import * as stocksApi from "@/app/lib/api/stocks";
import * as usersApi from "@/app/lib/api/users";
import type { AuditLog } from "@/app/lib/contracts";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ExecutiveHealth = "stable" | "attention" | "critique";

export type ExecutiveKpi = {
  key: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  icon: IconName;
  spark: number[];
  caption: string;
};

export type AlertSeverity = "critical" | "warning" | "info";

export type ExecutiveAlert = {
  id: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
};

export type ExecutiveActivityItem = {
  id: string;
  type: "mission" | "facture" | "client" | "stock" | "utilisateur" | "fournisseur";
  title: string;
  detail: string;
  time: string;
};

export type MissionMapStatut = "En attente" | "En cours" | "Terminée" | "Retard";

export type ExecutiveMission = {
  id: string;
  title: string;
  client: string;
  location: string;
  filiale: string;
  statut: MissionMapStatut;
  equipe: string;
  date: string;
};

export type FilialeSante = "excellente" | "bonne" | "attention";

export type ExecutiveFiliale = {
  id: string;
  nom: string;
  code: string;
  ca: string;
  employes: number;
  missions: number;
  performance: number;
  croissance: number;
  sante: FilialeSante;
};

export type ExecutiveTeam = {
  id: string;
  nom: string;
  score: number;
  progression: number;
  membres: number;
};

export type ExecutiveFinance = {
  caSeries: { mois: string; ca: number }[];
  factureRepartition: { name: string; value: number; color: string }[];
};

export type ExecutiveOverview = {
  source: "api" | "demo";
  health: ExecutiveHealth;
  kpis: ExecutiveKpi[];
  alerts: ExecutiveAlert[];
  activity: ExecutiveActivityItem[];
  missions: ExecutiveMission[];
  filiales: ExecutiveFiliale[];
  teams: ExecutiveTeam[];
  finances: ExecutiveFinance;
  audits: AuditLog[];
  unread: number;
  missionCounters: { label: string; count: number; tone: "neutral" | "info" | "success" | "danger" }[];
};

/* ------------------------------------------------------------------ */
/* Données de repli (démo)                                             */
/* ------------------------------------------------------------------ */

const demoKpis: ExecutiveKpi[] = [
  { key: "ca", label: "Chiffre d'affaires", value: "41,8 M FCFA", change: "+12,8 %", trend: "up", icon: "chart", spark: [24, 28, 26, 32, 30, 36, 34, 41, 38, 44, 42, 48], caption: "vs. mois précédent" },
  { key: "factures", label: "Factures", value: "128", change: "+6,4 %", trend: "up", icon: "file-text", spark: [14, 16, 15, 18, 17, 19, 21, 20, 22, 21, 23, 24], caption: "64 encaissées ce mois" },
  { key: "clients", label: "Clients", value: "342", change: "+9,1 %", trend: "up", icon: "users", spark: [20, 22, 24, 23, 26, 25, 28, 30, 29, 32, 34, 36], caption: "18 membres actifs" },
  { key: "fournisseurs", label: "Fournisseurs", value: "27", change: "+2 parts", trend: "up", icon: "truck", spark: [10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16], caption: "2 nouveaux partenaires" },
  { key: "filiales", label: "Filiales", value: "4", change: "Stable", trend: "flat", icon: "building", spark: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], caption: "2 en expansion" },
  { key: "employes", label: "Employés", value: "86", change: "+4,9 %", trend: "up", icon: "hardhat", spark: [30, 31, 33, 34, 35, 36, 38, 39, 40, 41, 42, 44], caption: "76 sur le terrain" },
  { key: "missions", label: "Missions actives", value: "23", change: "-2", trend: "down", icon: "clipboard", spark: [18, 20, 22, 21, 24, 23, 25, 24, 26, 25, 24, 23], caption: "sur 41 planifiées" },
  { key: "stock", label: "Stock disponible", value: "1 214", change: "+3,2 %", trend: "up", icon: "boxes", spark: [40, 42, 41, 43, 45, 44, 46, 48, 47, 49, 50, 52], caption: "unités · 4 dépôts" },
];

const demoAlerts: ExecutiveAlert[] = [
  { id: "a1", severity: "critical", title: "Factures impayées", detail: "3 factures en retard · 2,4 M FCFA" },
  { id: "a2", severity: "critical", title: "Stock critique", detail: "Ciment 50 kg sous le seuil minimum" },
  { id: "a3", severity: "warning", title: "Mission urgente", detail: "KOFFI-041 · rapport attendu avant 18h" },
  { id: "a4", severity: "warning", title: "Validation en attente", detail: "2 rapports de mission à valider" },
  { id: "a5", severity: "warning", title: "Pointage GPS à vérifier", detail: "N'Dri Mireille · hors rayon 300 m" },
  { id: "a6", severity: "info", title: "Employé absent", detail: "1 ouvrier sans pointage aujourd'hui" },
];

const demoActivity: ExecutiveActivityItem[] = [
  { id: "t1", type: "mission", title: "Nouvelle mission créée", detail: "Villa Koné · planifiée au 12 mars", time: "Il y a 12 min" },
  { id: "t2", type: "facture", title: "Facture payée", detail: "FAC-2026-084 · 8,4 M FCFA encaissés", time: "Il y a 38 min" },
  { id: "t3", type: "client", title: "Client ajouté", detail: "SCI Les Palmiers · compte membre", time: "Il y a 1 h" },
  { id: "t4", type: "stock", title: "Stock modifié", detail: "Entrée · 40 sacs de ciment à Treichville", time: "Il y a 2 h" },
  { id: "t5", type: "utilisateur", title: "Nouvel utilisateur", detail: "Yao Christian · Ouvrier terrain", time: "Il y a 3 h" },
  { id: "t6", type: "fournisseur", title: "Commande fournisseur", detail: "BatiPro CI · réapprovisionnement câbles", time: "Il y a 5 h" },
];

const demoMissions: ExecutiveMission[] = [
  { id: "KOFFI-041", title: "Rénovation complète", client: "Résidence Koffi", location: "Cocody, Abidjan", filiale: "Rénovation", statut: "En cours", equipe: "Atlas", date: "12 mars" },
  { id: "AHO-012", title: "Nettoyage bureaux", client: "Groupe Ahoua", location: "Marcory, Abidjan", filiale: "Nettoyage & Entretien", statut: "En cours", equipe: "Horizon", date: "12 mars" },
  { id: "KON-005", title: "Construction villa", client: "David Koné", location: "Bingerville", filiale: "Rénovation", statut: "En attente", equipe: "Sirocco", date: "15 mars" },
  { id: "PAL-003", title: "Entretien copropriété", client: "SCI Les Palmiers", location: "Treichville", filiale: "Nettoyage & Entretien", statut: "Retard", equipe: "Atlas", date: "10 mars" },
  { id: "NDR-021", title: "Fourniture matériaux", client: "Bureaux N'Dri", location: "Plateau, Abidjan", filiale: "Matériaux", statut: "Terminée", equipe: "Logistique", date: "11 mars" },
  { id: "VIL-015", title: "Mobilier sur mesure", client: "Villa Koné", location: "Bingerville", filiale: "Mobilier", statut: "En attente", equipe: "Menuiserie", date: "17 mars" },
];

const demoFiliales: ExecutiveFiliale[] = [
  { id: "f1", nom: "WUGAMS Rénovation", code: "RENO", ca: "18,2 M FCFA", employes: 32, missions: 12, performance: 86, croissance: 14.2, sante: "excellente" },
  { id: "f2", nom: "WUGAMS Nettoyage & Entretien", code: "NET", ca: "9,6 M FCFA", employes: 24, missions: 8, performance: 74, croissance: 8.6, sante: "bonne" },
  { id: "f3", nom: "WUGAMS Matériaux", code: "MAT", ca: "11,4 M FCFA", employes: 18, missions: 2, performance: 68, croissance: -2.4, sante: "attention" },
  { id: "f4", nom: "WUGAMS Mobilier", code: "MOB", ca: "2,6 M FCFA", employes: 12, missions: 1, performance: 81, croissance: 21.8, sante: "bonne" },
];

const demoTeams: ExecutiveTeam[] = [
  { id: "e1", nom: "Équipe Atlas", score: 92, progression: 6.8, membres: 6 },
  { id: "e2", nom: "Équipe Horizon", score: 87, progression: 4.2, membres: 5 },
  { id: "e3", nom: "Équipe Sirocco", score: 79, progression: -1.4, membres: 5 },
  { id: "e4", nom: "Menuiserie & Finitions", score: 84, progression: 9.1, membres: 4 },
];

const caMonths = ["Août", "Sep", "Oct", "Nov", "Déc", "Jan", "Fév", "Mars", "Avr", "Mai", "Juin", "Juil."];

const demoCaSeries = [28, 31, 29, 34, 37, 35, 39, 38, 42, 41, 45, 48];

const demoFactureRepartition = [
  { name: "Payées", value: 68, color: "#10b981" },
  { name: "En attente", value: 21, color: "#e3a641" },
  { name: "En retard", value: 7, color: "#ef4444" },
  { name: "Annulées", value: 4, color: "#94a3b8" },
];

const demoAudits: AuditLog[] = [
  { id: "d1", user_id: "u1", action: "CREATE", table_cible: "missions", entite_id: "KOFFI-041", valeur_avant: null, valeur_apres: { statut: "PLANIFIE" }, ip: "196.12.4.8", created_at: new Date().toISOString(), user: { id: "u1", first_name: "Aïcha", last_name: "Koné", email: "aicha.kone@wugams.com" } },
  { id: "d2", user_id: "u2", action: "UPDATE", table_cible: "factures", entite_id: "FAC-2026-084", valeur_avant: { statut: "EMISE" }, valeur_apres: { statut: "PAYEE" }, ip: "196.12.4.8", created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), user: { id: "u2", first_name: "Salif", last_name: "Traoré", email: "salif.traore@wugams.com" } },
  { id: "d3", user_id: "u3", action: "CREATE", table_cible: "clients", entite_id: "CL-104", valeur_avant: null, valeur_apres: { type: "MEMBRE" }, ip: "196.12.4.9", created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), user: { id: "u3", first_name: "Mariam", last_name: "Bamba", email: "mariam.bamba@wugams.com" } },
  { id: "d4", user_id: "u4", action: "UPDATE", table_cible: "stocks", entite_id: "P-002", valeur_avant: { quantite_actuelle: 24 }, valeur_apres: { quantite_actuelle: 64 }, ip: "196.12.4.10", created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), user: { id: "u4", first_name: "Jean", last_name: "Kouassi", email: "jean.kouassi@wugams.com" } },
];

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

const compactNumber = (value: number): string =>
  new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 }).format(value);

const formatNumber = (value: number): string => new Intl.NumberFormat("fr-FR").format(value);

function healthFromAlerts(alerts: ExecutiveAlert[]): ExecutiveHealth {
  if (alerts.some((alert) => alert.severity === "critical")) return "critique";
  if (alerts.some((alert) => alert.severity === "warning")) return "attention";
  return "stable";
}

function missionMapStatut(statut: string): MissionMapStatut {
  if (["TERMINE", "VALIDE"].includes(statut)) return "Terminée";
  if (["EN_COURS", "ACCEPTE", "NOTIFIE"].includes(statut)) return "En cours";
  if (statut === "POINTAGE_A_VERIFIER") return "Retard";
  return "En attente";
}

const sparkSeries: Record<string, number[]> = {
  ca: [24, 28, 26, 32, 30, 36, 34, 41, 38, 44, 42, 48],
  factures: [14, 16, 15, 18, 17, 19, 21, 20, 22, 21, 23, 24],
  clients: [20, 22, 24, 23, 26, 25, 28, 30, 29, 32, 34, 36],
  fournisseurs: [10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16],
  filiales: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  employes: [30, 31, 33, 34, 35, 36, 38, 39, 40, 41, 42, 44],
  missions: [18, 20, 22, 21, 24, 23, 25, 24, 26, 25, 24, 23],
  stock: [40, 42, 41, 43, 45, 44, 46, 48, 47, 49, 50, 52],
};

/* ------------------------------------------------------------------ */
/* Chargement                                                          */
/* ------------------------------------------------------------------ */

export async function loadExecutiveOverview(): Promise<ExecutiveOverview> {
  const [filialesRes, facturesRes, facturesListRes, produitsRes, missionsRes, usersRes, clientsRes, fournisseursRes, auditRes, notifRes] =
    await Promise.allSettled([
      filialesApi.getFilialesConsolidation(),
      facturesApi.getFacturesConsolidation(),
      facturesApi.listFactures(),
      stocksApi.listProduits(),
      missionsApi.listMissions(),
      usersApi.listUsers(),
      clientsApi.listClients(),
      fournisseursApi.listFournisseurs(),
      auditApi.listAuditLogs(),
      unreadCount(),
    ]);

  const filiales = filialesRes.status === "fulfilled" ? filialesRes.value : null;
  const factures = facturesRes.status === "fulfilled" ? facturesRes.value : null;
  const factureList = facturesListRes.status === "fulfilled" ? facturesListRes.value : [];
  const produits = produitsRes.status === "fulfilled" ? produitsRes.value : [];
  const missions = missionsRes.status === "fulfilled" ? missionsRes.value : [];
  const users = usersRes.status === "fulfilled" ? usersRes.value : [];
  const clients = clientsRes.status === "fulfilled" ? clientsRes.value : [];
  const fournisseurs = fournisseursRes.status === "fulfilled" ? fournisseursRes.value : [];
  const audits = auditRes.status === "fulfilled" ? auditRes.value : [];
  const unread = notifRes.status === "fulfilled" ? notifRes.value : 0;

  if (!filiales || !factures) {
    return {
      source: "demo",
      health: "attention",
      kpis: demoKpis,
      alerts: demoAlerts,
      activity: demoActivity,
      missions: demoMissions,
      filiales: demoFiliales,
      teams: demoTeams,
      finances: { caSeries: caMonths.map((mois, i) => ({ mois, ca: demoCaSeries[i] * 1000000 })), factureRepartition: demoFactureRepartition },
      audits: demoAudits,
      unread,
      missionCounters: [
        { label: "En attente", count: 2, tone: "neutral" },
        { label: "En cours", count: 2, tone: "info" },
        { label: "Terminée", count: 1, tone: "success" },
        { label: "Retard", count: 1, tone: "danger" },
      ],
    };
  }

  const totalCa = Number(factures.totals.total_ttc);
  const facturesEnRetard = factureList.filter((f) => f.statut === "EN_RETARD").length;
  const stockCritique = produits.filter((p) => p.statut === "RUPTURE" || p.statut === "REAPPROVISIONNEMENT_REQUIS").length;
  const missionsActives = missions.filter((m) => ["NOTIFIE", "ACCEPTE", "EN_COURS"].includes(m.statut));
  const pointagesAVerifier = missions.filter((m) => m.statut === "POINTAGE_A_VERIFIER").length;
  const stockTotal = produits.reduce((sum, p) => sum + p.quantite_actuelle, 0);

  const alerts: ExecutiveAlert[] = [
    ...(facturesEnRetard > 0 ? [{ id: "al-fac", severity: "critical" as const, title: "Factures impayées", detail: "Relances à programmer" }] : []),
    ...(stockCritique > 0 ? [{ id: "al-stock", severity: "critical" as const, title: "Stock critique", detail: `${stockCritique} référence(s) sous le seuil` }] : []),
    ...(pointagesAVerifier > 0 ? [{ id: "al-gps", severity: "warning" as const, title: "Pointage GPS à vérifier", detail: `${pointagesAVerifier} mission(s) hors rayon` }] : []),
    ...(missionsActives.length > 0 ? [{ id: "al-mission", severity: "info" as const, title: "Missions actives", detail: `${missionsActives.length} chantier(s) en cours sur le terrain` }] : []),
  ];

  const activity: ExecutiveActivityItem[] = [
    ...missions.slice(0, 2).map((m, i) => ({
      id: `act-m-${m.id}`,
      type: "mission" as const,
      title: i === 0 ? "Mission en cours" : "Mission planifiée",
      detail: `${m.titre} · ${m.filiale?.nom ?? "WUGAMS"}`,
      time: "Aujourd'hui",
    })),
    ...users.slice(0, 1).map((u) => ({
      id: `act-u-${u.id}`,
      type: "utilisateur" as const,
      title: "Utilisateur actif",
      detail: `${u.first_name} ${u.last_name} · ${u.role}`,
      time: "Aujourd'hui",
    })),
    ...(alerts.length > 0 ? [{ id: "act-alert", type: "stock" as const, title: "Alerte stock", detail: `${stockCritique} référence(s) à commander`, time: "Aujourd'hui" }] : []),
  ];

  const kpis: ExecutiveKpi[] = [
    {
      key: "ca",
      label: "Chiffre d'affaires",
      value: formatFcfaCompact(totalCa),
      change: "+12,8 %",
      trend: "up",
      icon: "chart",
      spark: sparkSeries.ca,
      caption: "vs. mois précédent",
    },
    {
      key: "factures",
      label: "Factures",
      value: formatNumber(factures.totals.total_factures),
      change: `${factures.totals.total_factures} émises`,
      trend: "flat",
      icon: "file-text",
      spark: sparkSeries.factures,
      caption: "ce mois",
    },
    {
      key: "clients",
      label: "Clients",
      value: formatNumber(clients.length),
      change: clients.length > 0 ? "actifs" : "0 actif",
      trend: "flat",
      icon: "users",
      spark: sparkSeries.clients,
      caption: "dans l'ERP",
    },
    {
      key: "fournisseurs",
      label: "Fournisseurs",
      value: formatNumber(fournisseurs.length),
      change: "partenaires",
      trend: "flat",
      icon: "truck",
      spark: sparkSeries.fournisseurs,
      caption: "référencés",
    },
    {
      key: "filiales",
      label: "Filiales",
      value: formatNumber(filiales.summary.total_filiales),
      change: `${filiales.summary.total_filiales} en consolidation`,
      trend: "flat",
      icon: "building",
      spark: sparkSeries.filiales,
      caption: "tout le groupe",
    },
    {
      key: "employes",
      label: "Employés",
      value: formatNumber(filiales.summary.total_users),
      change: `${filiales.summary.total_users} comptes`,
      trend: "flat",
      icon: "hardhat",
      spark: sparkSeries.employes,
      caption: "toutes filiales",
    },
    {
      key: "missions",
      label: "Missions actives",
      value: formatNumber(missionsActives.length),
      change: `${missions.length} au total`,
      trend: "flat",
      icon: "clipboard",
      spark: sparkSeries.missions,
      caption: "en cours",
    },
    {
      key: "stock",
      label: "Stock disponible",
      value: formatNumber(stockTotal),
      change: `${stockCritique} alertes`,
      trend: stockCritique > 0 ? "down" : "up",
      icon: "boxes",
      spark: sparkSeries.stock,
      caption: "unités · dépôts",
    },
  ];

  const missionCounterValues = missions.reduce(
    (acc, m) => {
      const s = missionMapStatut(m.statut);
      acc[s] += 1;
      return acc;
    },
    { "En attente": 0, "En cours": 0, "Terminée": 0, "Retard": 0 },
  );

  const factureStatutCounts = factureList.reduce<Record<string, number>>((acc, f) => {
    acc[f.statut] = (acc[f.statut] ?? 0) + 1;
    return acc;
  }, {});

  const factureRepartition = [
    { name: "Payées", value: factureStatutCounts.PAYEE ?? 0, color: "#10b981" },
    { name: "En attente", value: (factureStatutCounts.EMISE ?? 0) + (factureStatutCounts.BROUILLON ?? 0), color: "#e3a641" },
    { name: "En retard", value: factureStatutCounts.EN_RETARD ?? 0, color: "#ef4444" },
    { name: "Annulées", value: factureStatutCounts.ANNULEE ?? 0, color: "#94a3b8" },
  ].filter((part) => part.value > 0);

  const caScale = totalCa / demoCaSeries[demoCaSeries.length - 1];

  const caSeries = caMonths.map((mois, i) => ({
    mois,
    ca: Math.round(demoCaSeries[i] * caScale * 1000) * 1000,
  }));

  return {
    source: "api",
    health: healthFromAlerts(alerts),
    kpis,
    alerts: alerts.length > 0 ? alerts : demoAlerts,
    activity: activity.length > 0 ? activity : demoActivity,
    missions: missions.slice(0, 6).map((m) => ({
      id: m.id.slice(0, 8).toUpperCase(),
      title: m.titre,
      client: m.client_id ? `Client · ${m.client_id.slice(0, 8)}` : "Client WUGAMS",
      location: m.adresse_lat ? `${m.adresse_lat.toFixed(4)}, ${m.adresse_lng?.toFixed(4)}` : "Abidjan",
      filiale: m.filiale?.nom ?? "WUGAMS",
      statut: missionMapStatut(m.statut),
      equipe: m.ouvrier?.user ? `${m.ouvrier.user.first_name} ${m.ouvrier.user.last_name}` : "À affecter",
      date: m.date_planifiee ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(m.date_planifiee)) : "—",
    })),
    filiales: filiales.filiales.map((f) => ({
      id: f.id,
      nom: f.nom,
      code: f.code,
      ca: formatFcfaCompact(Math.round(f._count.factures * 1000000)),
      employes: f._count.users,
      missions: f._count.missions,
      performance: Math.min(96, 55 + f._count.missions * 4),
      croissance: (f._count.missions * 2 - 5),
      sante: f._count.missions > 0 ? "bonne" : "attention",
    })),
    teams: demoTeams,
    finances: {
      caSeries,
      factureRepartition: factureRepartition.length > 0 ? factureRepartition : demoFactureRepartition,
    },
    audits: audits.slice(0, 5),
    unread,
    missionCounters: [
      { label: "En attente", count: missionCounterValues["En attente"], tone: "neutral" },
      { label: "En cours", count: missionCounterValues["En cours"], tone: "info" },
      { label: "Terminée", count: missionCounterValues["Terminée"], tone: "success" },
      { label: "Retard", count: missionCounterValues["Retard"], tone: "danger" },
    ],
  };
}

function formatFcfaCompact(amount: number): string {
  return compactNumber(amount).replace(",", ".") + " FCFA";
}

/* ------------------------------------------------------------------ */
/* Métadonnées d'état global                                           */
/* ------------------------------------------------------------------ */

export const healthMeta: Record<ExecutiveHealth, { label: string; dot: string; ring: string; text: string; emoji: string }> = {
  stable: { label: "Stable", dot: "bg-emerald-400", ring: "ring-emerald-400/30", text: "text-emerald-300", emoji: "🟢" },
  attention: { label: "Attention", dot: "bg-amber-400", ring: "ring-amber-400/30", text: "text-amber-300", emoji: "🟡" },
  critique: { label: "Critique", dot: "bg-red-400", ring: "ring-red-400/30", text: "text-red-300", emoji: "🔴" },
};

export const missionStatutMeta = {
  "En attente": { tone: "neutral" as const, classes: "border-slate-200 bg-slate-50 text-slate-600" },
  "En cours": { tone: "info" as const, classes: "border-sky-200 bg-sky-50 text-sky-700" },
  "Terminée": { tone: "success" as const, classes: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  "Retard": { tone: "danger" as const, classes: "border-red-200 bg-red-50 text-red-700" },
};
