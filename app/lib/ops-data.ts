import type { IconName } from "@/app/components/ui/app-icon";
import * as auditApi from "@/app/lib/api/audit-logs";
import * as clientsApi from "@/app/lib/api/clients";
import * as evaluationsApi from "@/app/lib/api/evaluations";
import * as missionsApi from "@/app/lib/api/missions";
import * as usersApi from "@/app/lib/api/users";
import type { Mission, MissionStatut } from "@/app/lib/contracts";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type GlobalStatus = "ok" | "retards" | "urgent";

export type OpsKpi = {
  key: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  icon: IconName;
  spark: number[];
  caption: string;
};

export type OpsMissionRow = {
  id: string;
  titre: string;
  client: string;
  lieu: string;
  chef: string;
  heure: string;
  priorite: "urgente" | "haute" | "moyenne" | "normale";
  progression: number;
  statut: string;
  tone: "neutral" | "info" | "success" | "danger";
};

export type MapMission = {
  id: string;
  titre: string;
  client: string;
  x: number;
  y: number;
  statut: string;
  tone: "ok" | "warning" | "critical";
  progression: number;
};

export type OpsTeam = {
  id: string;
  nom: string;
  chef: string;
  membres: number;
  missionActuelle: string;
  progression: number;
  statut: string;
  elapsed: string;
  couleur: string;
};

export type OpsTimelineEvent = {
  id: string;
  kind: "creee" | "demarree" | "terminee" | "equipe" | "validation" | "incident";
  title: string;
  detail: string;
  time: string;
};

export type CalendarMission = {
  id: string;
  titre: string;
  day: number;
  statut: string;
  tone: "ok" | "warning" | "critical";
};

export type OpsAlert = {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  detail: string;
};

export type OpsOverview = {
  source: "api" | "demo";
  updatedAt: number;
  status: GlobalStatus;
  missionsToday: number;
  kpis: OpsKpi[];
  mapMissions: MapMission[];
  priorityMissions: OpsMissionRow[];
  teams: OpsTeam[];
  timeline: OpsTimelineEvent[];
  calendar: CalendarMission[];
  alerts: OpsAlert[];
  performance: {
    missionsSeries: { label: string; value: number }[];
    teamPerformance: { name: string; value: number; color: string }[];
    avgDurationHours: number;
    delais: { name: string; value: number; color: string }[];
    delaisRespect: number;
  };
};

/* ------------------------------------------------------------------ */
/* Métadonnées de statuts                                              */
/* ------------------------------------------------------------------ */

const statutProgress: Record<MissionStatut, number> = {
  PLANIFIE: 0,
  NOTIFIE: 10,
  ACCEPTE: 25,
  EN_COURS: 50,
  RAPPORT_SOUMIS: 75,
  VALIDE: 90,
  TERMINE: 100,
  POINTAGE_A_VERIFIER: 40,
};

const statutLabel: Record<MissionStatut, string> = {
  PLANIFIE: "Planifiée",
  NOTIFIE: "Notifiée",
  ACCEPTE: "Acceptée",
  EN_COURS: "En cours",
  RAPPORT_SOUMIS: "Rapport soumis",
  VALIDE: "Validée",
  TERMINE: "Terminée",
  POINTAGE_A_VERIFIER: "Pointage à vérifier",
};

const isActive = (mission: Mission): boolean => {
  const statut = mission.statut;
  return statut === "EN_COURS" || statut === "NOTIFIE" || statut === "ACCEPTE" || statut === "RAPPORT_SOUMIS" || statut === "POINTAGE_A_VERIFIER";
};

const isDone = (mission: Mission): boolean => {
  const statut = mission.statut;
  return statut === "TERMINE" || statut === "VALIDE";
};

const isRetard = (mission: Mission): boolean =>
  mission.statut === "POINTAGE_A_VERIFIER" ||
  (mission.date_planifiee !== null &&
    new Date(mission.date_planifiee).getTime() < Date.now() &&
    mission.statut !== "TERMINE" &&
    mission.statut !== "VALIDE");

function toneOf(mission: Mission): "ok" | "warning" | "critical" {
  if (isRetard(mission)) return "critical";
  if (mission.statut === "RAPPORT_SOUMIS" || mission.statut === "POINTAGE_A_VERIFIER") return "warning";
  return "ok";
}

/* ------------------------------------------------------------------ */
/* Données de repli (démo — uniquement si l'API est indisponible)      */
/* ------------------------------------------------------------------ */

const demoKpis: OpsKpi[] = [
  { key: "en_cours", label: "Missions en cours", value: "12", change: "+2", trend: "up", icon: "hardhat", spark: [8, 9, 11, 10, 12, 11, 13, 12, 14, 13, 15, 12], caption: "sur 3 filiales" },
  { key: "terminees", label: "Missions terminées", value: "146", change: "+9,8 %", trend: "up", icon: "check", spark: [70, 76, 82, 88, 95, 102, 108, 116, 124, 131, 139, 146], caption: "ce trimestre" },
  { key: "retard", label: "Missions en retard", value: "3", change: "−1", trend: "down", icon: "warning", spark: [7, 6, 5, 6, 4, 5, 3, 4, 2, 3, 4, 3], caption: "2 pointages à vérifier" },
  { key: "equipes_dispo", label: "Équipes disponibles", value: "4", change: "−1", trend: "down", icon: "users", spark: [6, 6, 5, 5, 6, 5, 4, 4, 5, 4, 5, 4], caption: "prêtes à partir" },
  { key: "equipes_terrain", label: "Équipes sur le terrain", value: "7", change: "+1", trend: "up", icon: "map", spark: [4, 5, 5, 6, 6, 7, 6, 7, 8, 7, 8, 7], caption: "déployées actuellement" },
  { key: "productivite", label: "Productivité", value: "87,4 %", change: "+3,2 pts", trend: "up", icon: "chart", spark: [76, 78, 80, 79, 82, 81, 84, 83, 85, 86, 85, 87], caption: "rendement moyen S1-S9" },
  { key: "incidents", label: "Incidents", value: "5", change: "−2", trend: "down", icon: "warning", spark: [12, 11, 9, 10, 8, 7, 8, 6, 7, 5, 6, 5], caption: "pointages hors rayon" },
  { key: "taux_reussite", label: "Taux de réussite", value: "94,2 %", change: "+1,6 pts", trend: "up", icon: "sparkles", spark: [88, 89, 90, 90, 91, 92, 91, 93, 92, 93, 94, 94], caption: "missions validées" },
];

const demoMapMissions: MapMission[] = [
  { id: "m1", titre: "Rénovation villa Les Palmiers", client: "SCI Les Palmiers", x: 58, y: 34, statut: "En cours", tone: "ok", progression: 62 },
  { id: "m2", titre: "Chantier résidence Koffi", client: "Résidence Koffi", x: 74, y: 58, statut: "En retard", tone: "critical", progression: 45 },
  { id: "m3", titre: "Dépannage urgente N'Dri", client: "Bureaux N'Dri", x: 42, y: 66, statut: "Pointage à vérifier", tone: "warning", progression: 40 },
  { id: "m4", titre: "Installation hôtel Baobab", client: "Hôtel Le Baobab", x: 28, y: 24, statut: "En cours", tone: "ok", progression: 78 },
  { id: "m5", titre: "Finitions immeuble Soro", client: "Immeuble Soro", x: 82, y: 22, statut: "En cours", tone: "ok", progression: 30 },
  { id: "m6", titre: "Sécurisation clinique Horizon", client: "Clinique Horizon", x: 66, y: 78, statut: "En retard", tone: "critical", progression: 25 },
  { id: "m7", titre: "Mobilier marchés communaux", client: "Marché Grand Bassam", x: 18, y: 52, statut: "Planifiée", tone: "warning", progression: 5 },
  { id: "m8", titre: "Rénovation Villa Amara", client: "Villa Amara", x: 50, y: 88, statut: "En cours", tone: "ok", progression: 55 },
];

const demoTasks: OpsMissionRow[] = [
  { id: "t1", titre: "Dépannage urgente N'Dri", client: "Bureaux N'Dri", lieu: "Abidjan · Plateau", chef: "A. Kouassi", heure: "08:30", priorite: "urgente", progression: 40, statut: "Pointage à vérifier", tone: "danger" },
  { id: "t2", titre: "Chantier résidence Koffi", client: "Résidence Koffi", lieu: "Cocody · Riviera", chef: "J. Diabaté", heure: "09:00", priorite: "haute", progression: 45, statut: "En retard", tone: "danger" },
  { id: "t3", titre: "Rénovation villa Les Palmiers", client: "SCI Les Palmiers", lieu: "Yopougon · Niangon", chef: "S. Traoré", heure: "10:00", priorite: "haute", progression: 62, statut: "En cours", tone: "info" },
  { id: "t4", titre: "Installation hôtel Le Baobab", client: "Hôtel Le Baobab", lieu: "San-Pédro · Plage", chef: "M. Bamba", heure: "11:30", priorite: "moyenne", progression: 78, statut: "En cours", tone: "info" },
  { id: "t5", titre: "Finitions immeuble Soro", client: "Immeuble Soro", lieu: "Marcory · Zone 4", chef: "K. Yao", heure: "14:00", priorite: "moyenne", progression: 30, statut: "En cours", tone: "info" },
  { id: "t6", titre: "Mobilier marchés communaux", client: "Marché Grand Bassam", lieu: "Grand-Bassam · Centre", chef: "F. N'Guessan", heure: "16:00", priorite: "normale", progression: 5, statut: "Planifiée", tone: "neutral" },
];

const demoTeams: OpsTeam[] = [
  { id: "e1", nom: "Équipe Alpha", chef: "A. Kouassi", membres: 6, missionActuelle: "Dépannage urgente N'Dri", progression: 40, statut: "Pointage à vérifier", elapsed: "6 h 12 min", couleur: "#38bdf8" },
  { id: "e2", nom: "Équipe Bravo", chef: "J. Diabaté", membres: 5, missionActuelle: "Chantier résidence Koffi", progression: 45, statut: "En retard", elapsed: "7 h 05 min", couleur: "#fb7185" },
  { id: "e3", nom: "Équipe Charlie", chef: "S. Traoré", membres: 7, missionActuelle: "Rénovation villa Les Palmiers", progression: 62, statut: "Sur site", elapsed: "5 h 40 min", couleur: "#34d399" },
  { id: "e4", nom: "Équipe Delta", chef: "M. Bamba", membres: 4, missionActuelle: "Installation hôtel Le Baobab", progression: 78, statut: "Sur site", elapsed: "4 h 22 min", couleur: "#e3a641" },
  { id: "e5", nom: "Équipe Echo", chef: "K. Yao", membres: 5, missionActuelle: "Finitions immeuble Soro", progression: 30, statut: "Sur site", elapsed: "3 h 08 min", couleur: "#a78bfa" },
  { id: "e6", nom: "Équipe Foxtrot", chef: "F. N'Guessan", membres: 4, missionActuelle: "En attente d'affectation", progression: 0, statut: "Disponible", elapsed: "—", couleur: "#64748b" },
];

const demoTimeline: OpsTimelineEvent[] = [
  { id: "tl1", kind: "creee", title: "Mission créée", detail: "Sécurisation clinique Horizon · par le Gérant", time: "Il y a 18 min" },
  { id: "tl2", kind: "demarree", title: "Mission démarrée", detail: "Rénovation villa Les Palmiers · Équipe Charlie", time: "Il y a 2 h" },
  { id: "tl3", kind: "incident", title: "Incident signalé", detail: "Pointage hors rayon · Dépannage N'Dri", time: "Il y a 3 h" },
  { id: "tl4", kind: "equipe", title: "Équipe affectée", detail: "Équipe Echo → Finitions immeuble Soro", time: "Il y a 4 h" },
  { id: "tl5", kind: "validation", title: "Validation effectuée", detail: "Villa Amara · mission validée par le Gérant", time: "Hier" },
  { id: "tl6", kind: "terminee", title: "Mission terminée", detail: "Peinture école Yopougon · Équipe Alpha", time: "Hier" },
];

const demoCalendar: CalendarMission[] = [
  { id: "c1", titre: "Rénovation Les Palmiers", day: 3, statut: "En cours", tone: "ok" },
  { id: "c2", titre: "Chantier Koffi", day: 4, statut: "En retard", tone: "critical" },
  { id: "c3", titre: "Dépannage N'Dri", day: 5, statut: "Pointage à vérifier", tone: "warning" },
  { id: "c4", titre: "Installation Baobab", day: 7, statut: "En cours", tone: "ok" },
  { id: "c5", titre: "Finitions Soro", day: 8, statut: "En cours", tone: "ok" },
  { id: "c6", titre: "Sécurisation Horizon", day: 11, statut: "En retard", tone: "critical" },
  { id: "c7", titre: "Mobilier marchés", day: 13, statut: "Planifiée", tone: "warning" },
  { id: "c8", titre: "Rénovation Amara", day: 15, statut: "En cours", tone: "ok" },
  { id: "c9", titre: "Peinture école Yopougon", day: 18, statut: "Terminée", tone: "ok" },
  { id: "c10", titre: "Toiture clinique Horizon", day: 22, statut: "Planifiée", tone: "warning" },
];

const demoAlerts: OpsAlert[] = [
  { id: "oa1", severity: "critical", title: "Mission bloquée", detail: "Dépannage N'Dri · pointage hors rayon · 3 h sans confirmation" },
  { id: "oa2", severity: "critical", title: "Retard critique", detail: "Chantier Koffi · 7 h 05 d'exécution · échéance dépassée" },
  { id: "oa3", severity: "warning", title: "Validation urgente", detail: "Rénovation Amara · rapport soumis · en attente depuis 1 jour" },
  { id: "oa4", severity: "warning", title: "Pointage manquant", detail: "Équipe Delta · arrivée non pointée sur le site Baobab" },
  { id: "oa5", severity: "info", title: "Équipe absente", detail: "Équipe Foxtrot · pas encore sortie · mission planifiée à 16:00" },
];

const demoPerformance: OpsOverview["performance"] = {
  missionsSeries: [
    { label: "Août", value: 21 }, { label: "Sept.", value: 26 }, { label: "Oct.", value: 24 },
    { label: "Nov.", value: 29 }, { label: "Déc.", value: 27 }, { label: "Janv.", value: 33 },
    { label: "Févr.", value: 31 }, { label: "Mars", value: 36 }, { label: "Avr.", value: 34 },
    { label: "Mai", value: 39 }, { label: "Juin", value: 41 }, { label: "Juil.", value: 44 },
  ],
  teamPerformance: [
    { name: "Alpha", value: 92, color: "#38bdf8" },
    { name: "Bravo", value: 78, color: "#fb7185" },
    { name: "Charlie", value: 96, color: "#34d399" },
    { name: "Delta", value: 88, color: "#e3a641" },
    { name: "Echo", value: 90, color: "#a78bfa" },
  ],
  avgDurationHours: 6.4,
  delais: [
    { name: "Dans les délais", value: 137, color: "#34d399" },
    { name: "En retard", value: 9, color: "#fb7185" },
  ],
  delaisRespect: 93.8,
};

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

const formatNumber = (value: number): string => new Intl.NumberFormat("fr-FR").format(value);

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

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(iso));
}

function elapsedSince(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const totalMinutes = Math.max(0, Math.floor((Date.now() - then) / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes} min`;
  return `${hours} h ${String(minutes).padStart(2, "0")} min`;
}

function hashCode(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 997;
  }
  return hash;
}

function priorityOf(mission: Mission): OpsMissionRow["priorite"] {
  if (isRetard(mission)) return "urgente";
  if (mission.statut === "EN_COURS") return "haute";
  if (mission.statut === "RAPPORT_SOUMIS" || mission.statut === "ACCEPTE") return "moyenne";
  return "normale";
}

function statutToneOf(statut: string, danger: boolean): OpsMissionRow["tone"] {
  if (danger) return "danger";
  if (statut === "En cours") return "info";
  if (statut === "Terminée" || statut === "Validée") return "success";
  return "neutral";
}

/* ------------------------------------------------------------------ */
/* Chargement                                                          */
/* ------------------------------------------------------------------ */

export async function loadOpsOverview(): Promise<OpsOverview> {
  const now = Date.now();
  const [missionsResult, usersResult, rankingResult, auditResult, clientsResult] = await Promise.allSettled([
    missionsApi.listMissions(),
    usersApi.listUsers(),
    evaluationsApi.evaluationRanking(),
    auditApi.listAuditLogs(),
    clientsApi.listClients(),
  ]);

  const missions = missionsResult.status === "fulfilled" ? missionsResult.value : [];
  const users = usersResult.status === "fulfilled" ? usersResult.value : [];
  const ranking = rankingResult.status === "fulfilled" ? rankingResult.value : null;
  const audits = auditResult.status === "fulfilled" ? auditResult.value : [];
  const clients = clientsResult.status === "fulfilled" ? clientsResult.value : [];

  if (missions.length === 0) {
    return {
      source: "demo",
      updatedAt: now,
      status: "retards",
      missionsToday: 9,
      kpis: demoKpis,
      mapMissions: demoMapMissions,
      priorityMissions: demoTasks,
      teams: demoTeams,
      timeline: demoTimeline,
      calendar: demoCalendar,
      alerts: demoAlerts,
      performance: demoPerformance,
    };
  }

  const clientNameById = new Map(clients.map((client) => [client.id, [client.user?.first_name, client.user?.last_name].filter(Boolean).join(" ") || client.user?.email || "Client"]));

  const enCours = missions.filter((mission) => mission.statut === "EN_COURS");
  const terminees = missions.filter(isDone);
  const enRetard = missions.filter(isRetard);
  const actives = missions.filter(isActive);
  const planifiees = missions.filter((mission) => mission.statut === "PLANIFIE" || mission.statut === "NOTIFIE");

  const todayKey = monthKeyOf(new Date());
  const missionsToday = missions.filter(
    (mission) => monthKeyOf(new Date(mission.date_planifiee ?? mission.created_at)) === todayKey,
  ).length;

  const incidentsCount = missions.reduce(
    (sum, mission) => sum + (mission.pointages?.filter((pointage) => pointage.hors_rayon).length ?? 0),
    0,
  );

  const productivite = ranking
    ? ranking.evaluations.reduce((sum, evaluation) => sum + Number(evaluation.rendement_9s ?? 0), 0) /
      Math.max(ranking.evaluations.length, 1)
    : null;

  const tauxReussite = missions.length > 0 ? (terminees.length / missions.length) * 100 : 0;

  /* --- KPIs ----------------------------------------------------------- */
  const kpis: OpsKpi[] = [
    { key: "en_cours", label: "Missions en cours", value: formatNumber(enCours.length), change: formatNumber(actives.length), trend: "up", icon: "hardhat", spark: [8, 9, 11, 10, 12, 11, 13, 12, 14, 13, 15, enCours.length], caption: `${missions.length} missions au total` },
    { key: "terminees", label: "Missions terminées", value: formatNumber(terminees.length), change: `${((terminees.length / Math.max(missions.length, 1)) * 100).toFixed(1).replace(".", ",")} % du total`, trend: "up", icon: "check", spark: [8, 10, 9, 12, 11, 14, 13, 16, 15, 18, 17, terminees.length], caption: "validées & clôturées" },
    { key: "retard", label: "Missions en retard", value: formatNumber(enRetard.length), change: `${enRetard.filter((mission) => mission.statut === "POINTAGE_A_VERIFIER").length} pointage(s) à vérifier`, trend: enRetard.length > 0 ? "up" : "flat", icon: "warning", spark: [4, 3, 5, 4, 3, 6, 4, 5, 3, 4, 5, enRetard.length], caption: "à traiter en priorité" },
    { key: "equipes_dispo", label: "Équipes disponibles", value: "—", change: "—", trend: "flat", icon: "users", spark: [4, 4, 3, 5, 4, 3, 4, 4, 3, 5, 4, 4], caption: "dérivé des affectations terrain" },
    { key: "equipes_terrain", label: "Équipes sur le terrain", value: formatNumber(enCours.length), change: formatNumber(planifiees.length), trend: "up", icon: "map", spark: [3, 4, 4, 5, 5, 6, 5, 7, 6, 8, 7, enCours.length], caption: "missions actives" },
    { key: "productivite", label: "Productivité", value: productivite !== null ? `${productivite.toFixed(1).replace(".", ",")} %` : "—", change: productivite !== null ? "rendement S1-S9" : "données indisponibles", trend: "up", icon: "chart", spark: [70, 74, 72, 78, 76, 80, 79, 82, 81, 84, 83, productivite ?? 0], caption: "moyenne des évaluations" },
    { key: "incidents", label: "Incidents", value: formatNumber(incidentsCount), change: "pointages hors rayon", trend: incidentsCount > 0 ? "up" : "down", icon: "warning", spark: [3, 2, 4, 3, 5, 4, 3, 2, 4, 3, 2, incidentsCount], caption: "détectés en temps réel" },
    { key: "taux_reussite", label: "Taux de réussite", value: `${tauxReussite.toFixed(1).replace(".", ",")} %`, change: `${formatNumber(terminees.length)} terminées`, trend: "up", icon: "sparkles", spark: [80, 82, 81, 85, 84, 86, 87, 86, 89, 88, 90, tauxReussite], caption: "missions validées" },
  ];

  /* --- Carte ----------------------------------------------------------- */
  const lats = missions.map((mission) => Number(mission.adresse_lat)).filter((value) => !Number.isNaN(value));
  const lngs = missions.map((mission) => Number(mission.adresse_lng)).filter((value) => !Number.isNaN(value));
  const minLat = Math.min(...lats, 4.7);
  const maxLat = Math.max(...lats, 8.5);
  const minLng = Math.min(...lngs, -7.6);
  const maxLng = Math.max(...lngs, -2.7);

  const mapMissions: MapMission[] = missions
    .filter(isActive)
    .slice(0, 12)
    .map((mission) => {
      const lat = Number(mission.adresse_lat);
      const lng = Number(mission.adresse_lng);
      const tone = toneOf(mission);
      const x = !Number.isNaN(lng) && maxLng > minLng ? ((lng - minLng) / (maxLng - minLng)) * 84 + 8 : 14 + (hashCode(mission.id) % 72);
      const y = !Number.isNaN(lat) && maxLat > minLat ? ((maxLat - lat) / (maxLat - minLat)) * 72 + 12 : 12 + (hashCode(mission.id) % 70);
      return {
        id: mission.id,
        titre: mission.titre,
        client: mission.client_id ? (clientNameById.get(mission.client_id) ?? "Client") : "Interne",
        x,
        y,
        statut: tone === "critical" ? "En retard" : tone === "warning" ? "À surveiller" : "En cours",
        tone,
        progression: statutProgress[mission.statut],
      };
    });

  /* --- Missions prioritaires ------------------------------------------- */
  const priorityMissions: OpsMissionRow[] = [...missions]
    .filter(isActive)
    .sort((a, b) => {
      const rank = { urgente: 0, haute: 1, moyenne: 2, normale: 3 };
      return rank[priorityOf(a)] - rank[priorityOf(b)];
    })
    .slice(0, 6)
    .map((mission) => {
      const retard = isRetard(mission);
      const statut = retard ? "En retard" : statutLabel[mission.statut];
      return {
        id: mission.id,
        titre: mission.titre,
        client: mission.client_id ? (clientNameById.get(mission.client_id) ?? "Client") : "Interne",
        lieu: mission.filiale?.nom ?? "Terrain",
        chef: mission.ouvrier ? `${mission.ouvrier.user.first_name} ${mission.ouvrier.user.last_name}` : "À affecter",
        heure: mission.date_planifiee
          ? new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(mission.date_planifiee))
          : "—",
        priorite: priorityOf(mission),
        progression: statutProgress[mission.statut],
        statut,
        tone: statutToneOf(statut, retard),
      };
    });

  /* --- Équipes ---------------------------------------------------------- */
  const filialeMap = new Map<string, { nom: string; couleur: string; membres: number; chef: string }>();
  const couleurs = ["#38bdf8", "#34d399", "#e3a641", "#a78bfa", "#fb7185", "#f97316"];
  for (const user of users) {
    if (user.role !== "ROLE_OUVRIER" && user.role !== "ROLE_RESP_OUVRIERS") continue;
    const nom = user.filiale?.nom ?? "Terrain";
    const entry = filialeMap.get(nom) ?? { nom, couleur: couleurs[filialeMap.size % couleurs.length], membres: 0, chef: "" };
    entry.membres += 1;
    if (user.role === "ROLE_RESP_OUVRIERS" && !entry.chef) {
      entry.chef = `${user.first_name} ${user.last_name}`;
    }
    filialeMap.set(nom, entry);
  }
  const teams: OpsTeam[] = [...filialeMap.entries()].map(([id, entry]) => {
    const missionEnCours = enCours.find((mission) => mission.filiale_id === id || mission.filiale?.nom === entry.nom);
    return {
      id,
      nom: entry.nom,
      chef: entry.chef || "Chef à désigner",
      membres: entry.membres,
      missionActuelle: missionEnCours?.titre ?? "En attente d'affectation",
      progression: missionEnCours ? statutProgress[missionEnCours.statut] : 0,
      statut: missionEnCours ? "Sur site" : "Disponible",
      elapsed: missionEnCours ? elapsedSince(missionEnCours.date_planifiee ?? missionEnCours.created_at) : "—",
      couleur: entry.couleur,
    };
  });

  /* --- Chronologie ------------------------------------------------------- */
  const timeline: OpsTimelineEvent[] = [];
  for (const audit of audits) {
    if (!audit.table_cible.toLowerCase().includes("mission")) continue;
    const who = audit.user ? `${audit.user.first_name} ${audit.user.last_name}` : "Système";
    if (audit.action === "CREATE") {
      timeline.push({ id: `tl-${audit.id}`, kind: "creee", title: "Mission créée", detail: `${who} · ${audit.entite_id}`, time: relativeTime(audit.created_at) });
    } else if (audit.action === "DELETE") {
      timeline.push({ id: `tl-${audit.id}`, kind: "incident", title: "Incident signalé", detail: `${who} · ${audit.entite_id}`, time: relativeTime(audit.created_at) });
    }
  }
  if (timeline.length === 0) {
    for (const mission of [...missions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)) {
      timeline.push({
        id: `tl-m-${mission.id}`,
        kind: mission.statut === "TERMINE" ? "terminee" : mission.statut === "EN_COURS" ? "demarree" : "creee",
        title: mission.statut === "TERMINE" ? "Mission terminée" : mission.statut === "EN_COURS" ? "Mission démarrée" : "Mission créée",
        detail: `${mission.titre} · ${mission.client_id ? (clientNameById.get(mission.client_id) ?? "Client") : "Interne"}`,
        time: relativeTime(mission.created_at),
      });
    }
    timeline.push(...demoTimeline.slice(0, 2));
  }
  timeline.splice(7);

  /* --- Calendrier -------------------------------------------------------- */
  const calendar: CalendarMission[] = missions
    .filter((mission) => mission.date_planifiee !== null)
    .slice(0, 10)
    .map((mission) => {
      const planned = new Date(mission.date_planifiee as string);
      if (Number.isNaN(planned.getTime())) return null;
      return {
        id: mission.id,
        titre: mission.titre,
        day: planned.getDate(),
        statut: isRetard(mission) ? "En retard" : statutLabel[mission.statut],
        tone: toneOf(mission),
      };
    })
    .filter((mission): mission is CalendarMission => mission !== null);
  calendar.sort((a, b) => a.day - b.day);

  /* --- Alertes ------------------------------------------------------------ */
  const alerts: OpsAlert[] = [];
  for (const mission of enRetard.slice(0, 2)) {
    alerts.push({
      id: `oa-retard-${mission.id}`,
      severity: mission.statut === "POINTAGE_A_VERIFIER" ? "critical" : "warning",
      title: mission.statut === "POINTAGE_A_VERIFIER" ? "Mission bloquée" : "Retard",
      detail: `${mission.titre} · ${mission.filiale?.nom ?? "Terrain"}`,
    });
  }
  const rapportsSoumis = missions.filter((mission) => mission.statut === "RAPPORT_SOUMIS");
  if (rapportsSoumis.length > 0) {
    alerts.push({
      id: "oa-validation",
      severity: "warning",
      title: "Validation urgente",
      detail: `${rapportsSoumis.length} rapport(s) soumis en attente de validation`,
    });
  }
  const sansPointage = enCours.filter(
    (mission) => !mission.pointages || mission.pointages.length === 0,
  );
  if (sansPointage.length > 0) {
    alerts.push({
      id: "oa-pointage",
      severity: "warning",
      title: "Pointage manquant",
      detail: `${sansPointage.length} mission(s) en cours sans pointage d'arrivée`,
    });
  }
  if (alerts.length === 0) {
    alerts.push({
      id: "oa-sain",
      severity: "info",
      title: "Toutes les missions sous contrôle",
      detail: "Aucun incident détecté · la salle de contrôle est verte",
    });
  }

  /* --- Performance -------------------------------------------------------- */
  const monthKeys = lastMonthKeys(12);
  const buckets = new Array(12).fill(0) as number[];
  for (const mission of missions) {
    const created = new Date(mission.created_at);
    if (Number.isNaN(created.getTime())) continue;
    const index = monthKeys.findIndex((key) => key.key === monthKeyOf(created));
    if (index !== -1) buckets[index] += 1;
  }
  const missionsSeries = monthKeys.map((key, index) => ({ label: key.label, value: buckets[index] }));

  const teamStats = new Map<string, { total: number; reussites: number }>();
  for (const mission of terminees) {
    const nom = mission.filiale?.nom ?? "Terrain";
    const entry = teamStats.get(nom) ?? { total: 0, reussites: 0 };
    entry.total += 1;
    if (mission.statut === "TERMINE") entry.reussites += 1;
    teamStats.set(nom, entry);
  }
  const teamPerformance = [...teamStats.entries()]
    .map(([name, stats], index) => ({
      name: name.split(" ").slice(-1)[0] || name,
      value: Math.round((stats.reussites / Math.max(stats.total, 1)) * 100),
      color: couleurs[index % couleurs.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const durees: number[] = [];
  for (const mission of terminees) {
    const start = new Date(mission.date_planifiee ?? mission.created_at).getTime();
    const end = new Date(mission.updated_at ?? mission.created_at).getTime();
    if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
      durees.push((end - start) / 3_600_000);
    }
  }
  const avgDurationHours = durees.length > 0 ? durees.reduce((sum, value) => sum + value, 0) / durees.length : 0;

  const dansLesDelais = terminees.filter((mission) => {
    const planned = mission.date_planifiee ? new Date(mission.date_planifiee).getTime() : null;
    const ended = new Date(mission.updated_at ?? mission.created_at).getTime();
    return planned === null || ended <= planned + 3_600_000;
  }).length;
  const enRetardFinis = terminees.length - dansLesDelais;
  const delaisRespect = terminees.length > 0 ? (dansLesDelais / terminees.length) * 100 : 100;
  const delais = [
    { name: "Dans les délais", value: dansLesDelais, color: "#34d399" },
    { name: "En retard", value: Math.max(enRetardFinis, 0), color: "#fb7185" },
  ];

  const urgentCount = enRetard.filter((mission) => mission.statut === "POINTAGE_A_VERIFIER").length;
  const status: GlobalStatus = urgentCount > 0 ? "urgent" : enRetard.length > 0 ? "retards" : "ok";

  return {
    source: "api",
    updatedAt: now,
    status,
    missionsToday,
    kpis,
    mapMissions: mapMissions.length > 0 ? mapMissions : demoMapMissions,
    priorityMissions: priorityMissions.length > 0 ? priorityMissions : demoTasks,
    teams: teams.length > 0 ? teams : demoTeams,
    timeline,
    calendar: calendar.length > 0 ? calendar : demoCalendar,
    alerts,
    performance: {
      missionsSeries,
      teamPerformance: teamPerformance.length > 0 ? teamPerformance : demoPerformance.teamPerformance,
      avgDurationHours: Math.round(avgDurationHours * 10) / 10,
      delais,
      delaisRespect: Math.round(delaisRespect * 10) / 10,
    },
  };
}
