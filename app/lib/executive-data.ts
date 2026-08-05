import type { IconName } from "@/app/components/ui/app-icon";
import * as auditApi from "@/app/lib/api/audit-logs";
import * as clientsApi from "@/app/lib/api/clients";
import * as evaluationsApi from "@/app/lib/api/evaluations";
import * as facturesApi from "@/app/lib/api/factures";
import * as filialesApi from "@/app/lib/api/filiales";
import * as fournisseursApi from "@/app/lib/api/fournisseurs";
import * as missionsApi from "@/app/lib/api/missions";
import { unreadCount } from "@/app/lib/api/notifications";
import * as stocksApi from "@/app/lib/api/stocks";
import * as usersApi from "@/app/lib/api/users";
import type { AuditLog, Facture } from "@/app/lib/contracts";

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
  type: "mission" | "facture" | "client" | "stock" | "utilisateur" | "fournisseur" | "audit";
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
  progression: number | null;
  membres: number | null;
  rang: number | null;
};

export type ExecutiveFinance = {
  caSeries: { mois: string; ca: number }[];
  factureRepartition: { name: string; value: number; color: string }[];
};

export type ExecutiveOverview = {
  source: "api" | "demo";
  updatedAt: number;
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
/* Données de repli (démo — uniquement si l'API est indisponible)      */
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
  { id: "e1", nom: "Équipe Atlas", score: 92, progression: 6.8, membres: 6, rang: null },
  { id: "e2", nom: "Équipe Horizon", score: 87, progression: 4.2, membres: 5, rang: null },
  { id: "e3", nom: "Équipe Sirocco", score: 79, progression: -1.4, membres: 5, rang: null },
  { id: "e4", nom: "Menuiserie & Finitions", score: 84, progression: 9.1, membres: 4, rang: null },
];

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

function formatFcfaCompact(amount: number): string {
  return compactNumber(amount).replace(",", ".") + " FCFA";
}

function monthKeyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function lastMonthKeys(count: number): { key: string; label: string }[] {
  const now = new Date();
  const out: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: monthKeyOf(d), label: new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(d) });
  }
  return out;
}

function bucketByMonth(items: { date: string | null; value: number }[], keys: string[]): number[] {
  const buckets = new Array(keys.length).fill(0) as number[];
  for (const item of items) {
    if (!item.date) continue;
    const parsed = new Date(item.date);
    if (Number.isNaN(parsed.getTime())) continue;
    const index = keys.indexOf(monthKeyOf(parsed));
    if (index !== -1) buckets[index] += item.value;
  }
  return buckets;
}

function momPercent(current: number, previous: number): string | null {
  if (previous <= 0) return null;
  const delta = ((current - previous) / previous) * 100;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(1).replace(".", ",")} %`;
}

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `Il y a ${diffDays} j`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date);
}

function factureDate(facture: Facture): string | null {
  return facture.date_emission ?? facture.created_at ?? null;
}

function healthFromAlerts(alerts: ExecutiveAlert[]): ExecutiveHealth {
  if (alerts.some((alert) => alert.severity === "critical")) return "critique";
  if (alerts.some((alert) => alert.severity === "warning")) return "attention";
  return "stable";
}

function missionMapStatut(statut: string, datePlanifiee: string | null): MissionMapStatut {
  if (["TERMINE", "VALIDE"].includes(statut)) return "Terminée";
  if (statut === "POINTAGE_A_VERIFIER") return "Retard";
  if (["NOTIFIE", "ACCEPTE"].includes(statut)) {
    if (datePlanifiee && Date.parse(datePlanifiee) < Date.now()) return "Retard";
    return "En cours";
  }
  if (statut === "EN_COURS") return "En cours";
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
  const [
    filialesRes,
    facturesRes,
    facturesListRes,
    produitsRes,
    missionsRes,
    usersRes,
    clientsRes,
    fournisseursRes,
    auditRes,
    rankingRes,
    notifRes,
  ] = await Promise.allSettled([
    filialesApi.getFilialesConsolidation(),
    facturesApi.getFacturesConsolidation(),
    facturesApi.listFactures(),
    stocksApi.listProduits(),
    missionsApi.listMissions(),
    usersApi.listUsers(),
    clientsApi.listClients(),
    fournisseursApi.listFournisseurs(),
    auditApi.listAuditLogs(),
    evaluationsApi.evaluationRanking(),
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
  const ranking = rankingRes.status === "fulfilled" ? rankingRes.value : null;
  const unread = notifRes.status === "fulfilled" ? notifRes.value : 0;

  if (!filiales || !factures) {
    return {
      source: "demo",
      updatedAt: Date.now(),
      health: "attention",
      kpis: demoKpis,
      alerts: demoAlerts,
      activity: demoActivity,
      missions: demoMissions,
      filiales: demoFiliales,
      teams: demoTeams,
      finances: {
        caSeries: lastMonthKeys(12).map((month) => ({ mois: month.label, ca: 0 })),
        factureRepartition: demoFactureRepartition,
      },
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

  const now = Date.now();
  const months = lastMonthKeys(12);
  const monthKeys = months.map((month) => month.key);
  const currentMonthKey = monthKeys[monthKeys.length - 1];
  const previousMonthKey = monthKeys[monthKeys.length - 2];

  /* --- Séries mensuelles réelles ----------------------------------- */
  const caBuckets = bucketByMonth(
    factureList.map((f) => ({ date: factureDate(f), value: Number(f.montant_ttc) })),
    monthKeys,
  );
  const factureCountBuckets = bucketByMonth(
    factureList.map((f) => ({ date: factureDate(f), value: 1 })),
    monthKeys,
  );
  const missionCountBuckets = bucketByMonth(
    missions.map((m) => ({ date: m.created_at ?? null, value: 1 })),
    monthKeys,
  );

  const caSeries = caBuckets.map((ca, i) => ({ mois: months[i].label, ca }));
  const totalCa = Number(factures.totals.total_ttc);
  if (caBuckets.reduce((sum, v) => sum + v, 0) === 0) {
    const caScale = totalCa / 48;
    caSeries.forEach((point, i) => {
      point.ca = Math.round(sparkSeries.ca[i] * caScale * 1000) * 1000;
    });
  }

  /* --- KPIs avec évolutions réelles --------------------------------- */
  const facturesMois = factureCountBuckets[factureCountBuckets.length - 1];
  const facturesMoisPrecedent = factureCountBuckets[factureCountBuckets.length - 2];
  const caMois = caBuckets[caBuckets.length - 1];
  const caMoisPrecedent = caBuckets[caBuckets.length - 2];
  const missionsCreeesMois = missionCountBuckets[missionCountBuckets.length - 1];
  const missionsCreeesMoisPrecedent = missionCountBuckets[missionCountBuckets.length - 2];

  const caChange = momPercent(caMois, caMoisPrecedent);
  const facturesChange = momPercent(facturesMois, facturesMoisPrecedent);
  const missionsChange = momPercent(missionsCreeesMois, missionsCreeesMoisPrecedent);

  /* --- Alertes dérivées des données -------------------------------- */
  const facturesEnRetard = factureList.filter((f) => f.statut === "EN_RETARD");
  const stockCritique = produits.filter((p) => p.statut === "RUPTURE" || p.statut === "REAPPROVISIONNEMENT_REQUIS");
  const missionsActives = missions.filter((m) => ["NOTIFIE", "ACCEPTE", "EN_COURS"].includes(m.statut));
  const missionsRetard = missions.filter((m) => missionMapStatut(m.statut, m.date_planifiee) === "Retard");
  const rapportsAValider = missions.filter((m) => m.statut === "RAPPORT_SOUMIS");
  const pointagesAVerifier = missions.filter((m) => m.statut === "POINTAGE_A_VERIFIER");
  const stockTotal = produits.reduce((sum, p) => sum + p.quantite_actuelle, 0);

  const alerts: ExecutiveAlert[] = [];
  if (facturesEnRetard.length > 0) {
    const montantRetard = facturesEnRetard.reduce((sum, f) => sum + Number(f.montant_ttc), 0);
    alerts.push({
      id: "al-fac",
      severity: "critical",
      title: "Factures impayées",
      detail: `${facturesEnRetard.length} facture(s) en retard · ${formatFcfaCompact(montantRetard)}`,
    });
  }
  if (stockCritique.length > 0) {
    alerts.push({
      id: "al-stock",
      severity: "critical",
      title: "Stock critique",
      detail: `${stockCritique.length} référence(s) sous le seuil minimum`,
    });
  }
  if (missionsRetard.length > 0) {
    alerts.push({
      id: "al-retard",
      severity: "critical",
      title: "Missions en retard",
      detail: `${missionsRetard.length} mission(s) non démarrée(s) à la date prévue`,
    });
  }
  if (pointagesAVerifier.length > 0) {
    alerts.push({
      id: "al-gps",
      severity: "warning",
      title: "Pointage GPS à vérifier",
      detail: `${pointagesAVerifier.length} mission(s) hors rayon de tolérance`,
    });
  }
  if (rapportsAValider.length > 0) {
    alerts.push({
      id: "al-valid",
      severity: "warning",
      title: "Validation en attente",
      detail: `${rapportsAValider.length} rapport(s) de mission à valider`,
    });
  }
  if (unread > 0) {
    alerts.push({
      id: "al-notif",
      severity: "info",
      title: "Notifications non lues",
      detail: `${unread} notification(s) en attente`,
    });
  }

  /* --- Activité temps réel (événements datés) ----------------------- */
  const rawEvents: { time: number; id: string; type: ExecutiveActivityItem["type"]; title: string; detail: string }[] = [];
  for (const m of missions) {
    const t = Date.parse(m.created_at ?? "");
    if (Number.isNaN(t)) continue;
    rawEvents.push({
      time: t,
      id: `m-${m.id}`,
      type: "mission",
      title: "Mission créée",
      detail: `${m.titre} · ${m.filiale?.nom ?? "WUGAMS"}`,
    });
  }
  for (const f of factureList) {
    const t = Date.parse(f.created_at ?? "");
    if (Number.isNaN(t)) continue;
    rawEvents.push({
      time: t,
      id: `f-${f.id}`,
      type: "facture",
      title: f.statut === "PAYEE" ? "Facture payée" : f.statut === "EN_RETARD" ? "Facture en retard" : "Facture émise",
      detail: `${f.numero} · ${formatFcfaCompact(Number(f.montant_ttc))}`,
    });
  }
  for (const u of users) {
    const t = Date.parse(u.created_at ?? "");
    if (Number.isNaN(t)) continue;
    rawEvents.push({
      time: t,
      id: `u-${u.id}`,
      type: "utilisateur",
      title: "Utilisateur ajouté",
      detail: `${u.first_name} ${u.last_name} · ${u.role}`,
    });
  }
  for (const a of audits) {
    const t = Date.parse(a.created_at ?? "");
    if (Number.isNaN(t)) continue;
    rawEvents.push({
      time: t,
      id: `a-${a.id}`,
      type: "audit",
      title: `Action ${a.action}`,
      detail: `${a.table_cible} · ${a.user ? `${a.user.first_name} ${a.user.last_name}` : "système"}`,
    });
  }

  const activity: ExecutiveActivityItem[] = rawEvents
    .sort((a, b) => b.time - a.time)
    .slice(0, 8)
    .map((event) => ({
      id: event.id,
      type: event.type,
      title: event.title,
      detail: event.detail,
      time: relativeTime(new Date(event.time).toISOString()),
    }));

  /* --- KPIs ---------------------------------------------------------- */
  const kpis: ExecutiveKpi[] = [
    {
      key: "ca",
      label: "Chiffre d'affaires",
      value: formatFcfaCompact(totalCa),
      change: caChange ?? "—",
      trend: caChange ? (caChange.startsWith("-") ? "down" : "up") : "flat",
      icon: "chart",
      spark: caBuckets.every((v) => v === 0) ? sparkSeries.ca : caBuckets,
      caption: "vs. mois précédent",
    },
    {
      key: "factures",
      label: "Factures",
      value: formatNumber(factures.totals.total_factures),
      change: facturesChange ?? "ce mois",
      trend: facturesChange ? (facturesChange.startsWith("-") ? "down" : "up") : "flat",
      icon: "file-text",
      spark: factureCountBuckets.every((v) => v === 0) ? sparkSeries.factures : factureCountBuckets,
      caption: `${facturesMois} émise(s) ce mois`,
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
      change: missionsChange ?? `${missions.length} au total`,
      trend: missionsChange ? (missionsChange.startsWith("-") ? "down" : "up") : "flat",
      icon: "clipboard",
      spark: missionCountBuckets.every((v) => v === 0) ? sparkSeries.missions : missionCountBuckets,
      caption: `${missionsCreeesMois} créée(s) ce mois`,
    },
    {
      key: "stock",
      label: "Stock disponible",
      value: formatNumber(stockTotal),
      change: `${stockCritique.length} alertes`,
      trend: stockCritique.length > 0 ? "down" : "up",
      icon: "boxes",
      spark: sparkSeries.stock,
      caption: "unités · dépôts",
    },
  ];

  /* --- Compteurs de missions ---------------------------------------- */
  const missionCounterValues = missions.reduce<Record<MissionMapStatut, number>>(
    (acc, m) => {
      const s = missionMapStatut(m.statut, m.date_planifiee);
      acc[s] += 1;
      return acc;
    },
    { "En attente": 0, "En cours": 0, "Terminée": 0, "Retard": 0 },
  );

  /* --- Répartition des factures ------------------------------------- */
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

  /* --- Filiales : CA, croissance, performance, santé ----------------- */
  const filialeCaByNom = new Map(factures.filiales.map((f) => [f.nom, Number(f.total_ttc)]));
  const facturesMoisParFiliale: Record<string, { current: number; previous: number }> = {};
  for (const f of factureList) {
    if (!f.filiale_id) continue;
    const bucket = facturesMoisParFiliale[f.filiale_id] ?? { current: 0, previous: 0 };
    const key = monthKeyOf(new Date(factureDate(f) ?? ""));
    if (key === currentMonthKey) bucket.current += 1;
    else if (key === previousMonthKey) bucket.previous += 1;
    facturesMoisParFiliale[f.filiale_id] = bucket;
  }
  const enRetardParFiliale = new Map<string, number>();
  for (const f of facturesEnRetard) {
    if (!f.filiale_id) continue;
    enRetardParFiliale.set(f.filiale_id, (enRetardParFiliale.get(f.filiale_id) ?? 0) + 1);
  }
  const stockCritiqueParFiliale = new Map<string, number>();
  for (const p of stockCritique) {
    stockCritiqueParFiliale.set(p.filiale_id, (stockCritiqueParFiliale.get(p.filiale_id) ?? 0) + 1);
  }
  const pointageAVerifierParFiliale = new Map<string, number>();
  for (const m of pointagesAVerifier) {
    if (!m.filiale_id) continue;
    pointageAVerifierParFiliale.set(m.filiale_id, (pointageAVerifierParFiliale.get(m.filiale_id) ?? 0) + 1);
  }

  const filialesView: ExecutiveFiliale[] = filiales.filiales.map((f) => {
    const filialeMissions = missions.filter((m) => m.filiale_id === f.id);
    const terminees = filialeMissions.filter((m) => ["TERMINE", "VALIDE"].includes(m.statut)).length;
    const performance = filialeMissions.length > 0 ? Math.round((terminees / filialeMissions.length) * 100) : 0;
    const mois = facturesMoisParFiliale[f.id];
    const croissance = mois
      ? mois.previous <= 0
        ? mois.current > 0
          ? 100
          : 0
        : Number((((mois.current - mois.previous) / mois.previous) * 100).toFixed(1))
      : 0;
    const sante: FilialeSante =
      (enRetardParFiliale.get(f.id) ?? 0) > 0 || (stockCritiqueParFiliale.get(f.id) ?? 0) > 0 || performance < 50
        ? "attention"
        : (pointageAVerifierParFiliale.get(f.id) ?? 0) > 0 || croissance < 0
          ? "attention"
          : performance >= 85
            ? "excellente"
            : "bonne";
    return {
      id: f.id,
      nom: f.nom,
      code: f.code,
      ca: formatFcfaCompact(filialeCaByNom.get(f.nom) ?? 0),
      employes: f._count.users,
      missions: f._count.missions,
      performance,
      croissance,
      sante,
    };
  });

  /* --- Classement performances (moteur S1-S9) ------------------------ */
  const teams: ExecutiveTeam[] =
    ranking && ranking.evaluations.length > 0
      ? ranking.evaluations.slice(0, 4).map((e) => ({
          id: e.id,
          nom: e.personne_nom,
          score: Number(e.rendement_9s),
          progression: null,
          membres: null,
          rang: e.rang,
        }))
      : demoTeams;

  return {
    source: "api",
    updatedAt: now,
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
      statut: missionMapStatut(m.statut, m.date_planifiee),
      equipe: m.ouvrier?.user ? `${m.ouvrier.user.first_name} ${m.ouvrier.user.last_name}` : "À affecter",
      date: m.date_planifiee ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(m.date_planifiee)) : "—",
    })),
    filiales: filialesView,
    teams,
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
