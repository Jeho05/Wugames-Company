import type { IconName } from "@/app/components/ui/app-icon";
import * as auditApi from "@/app/lib/api/audit-logs";
import * as clientsApi from "@/app/lib/api/clients";
import * as evaluationsApi from "@/app/lib/api/evaluations";
import * as missionsApi from "@/app/lib/api/missions";
import * as usersApi from "@/app/lib/api/users";
import type { Mission, MissionStatut } from "@/app/lib/contracts";

/* Types                                                               */

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
  source: "api";
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

/* Métadonnées de statuts                                              */

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

/* Utilitaires                                                         */

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

/* Chargement                                                          */

export async function loadOpsOverview(): Promise<OpsOverview | null> {
  const now = Date.now();
  const [missionsResult, usersResult, rankingResult, auditResult, clientsResult] = await Promise.allSettled([
    missionsApi.listMissions(),
    usersApi.listUsers(),
    evaluationsApi.evaluationRanking(),
    auditApi.listAuditLogs(),
    clientsApi.listClients(),
  ]);

  // Si l'API missions échoue, retourner null pour afficher le loader
  if (missionsResult.status === "rejected") {
    return null;
  }

  const missions = missionsResult.status === "fulfilled" ? missionsResult.value : [];
  const users = usersResult.status === "fulfilled" ? usersResult.value : [];
  const ranking = rankingResult.status === "fulfilled" ? rankingResult.value : null;
  const audits = auditResult.status === "fulfilled" ? auditResult.value : [];
  const clients = clientsResult.status === "fulfilled" ? clientsResult.value : [];

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
    mapMissions,
    priorityMissions,
    teams,
    timeline,
    calendar,
    alerts,
    performance: {
      missionsSeries,
      teamPerformance,
      avgDurationHours: Math.round(avgDurationHours * 10) / 10,
      delais,
      delaisRespect: Math.round(delaisRespect * 10) / 10,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Pages vitrine (site public)                                         */
/* ------------------------------------------------------------------ */

export type VitrinePage = {
  id: string;
  titre: string;
  route: string;
  statut: "PUBLIE" | "BROUILLON";
  section: "principale" | "support" | "contenu";
  visites: number;
  updated_at: string;
};

export const demoSecVitrinePages: VitrinePage[] = [];

export const vitrineSectionMeta: Record<VitrinePage["section"], { label: string; tile: string }> = {
  principale: { label: "Vitrine", tile: "bg-[#e3a641]/15 text-[#f2c56d]" },
  support: { label: "Support", tile: "bg-sky-400/10 text-sky-300" },
  contenu: { label: "Contenu", tile: "bg-emerald-400/10 text-emerald-300" },
};

/* ------------------------------------------------------------------ */
/* Conversations partenaires & communautés                             */
/* ------------------------------------------------------------------ */

export type ConversationRole = "fournisseur" | "filiale" | "partenariat" | "ouvriers" | "membres" | "secretaire";

export type ConversationMessage = { id: string; auteur: "moi" | "eux"; texte: string; heure: string; lu: boolean };

export type ConversationThread = {
  id: string;
  kind: "partenaire" | "communaut";
  role: ConversationRole;
  nom: string;
  detail: string;
  avatar: string;
  unread: number;
  derniereActivite: string;
  messages: ConversationMessage[];
};

export const conversationRoleMeta: Record<ConversationRole, { label: string; dot: string }> = {
  fournisseur: { label: "Fournisseur", dot: "bg-violet-400" },
  filiale: { label: "Filiale", dot: "bg-sky-400" },
  partenariat: { label: "Partenariat", dot: "bg-amber-400" },
  ouvriers: { label: "Communauté ouvriers", dot: "bg-emerald-400" },
  membres: { label: "Communauté membres", dot: "bg-rose-400" },
  secretaire: { label: "Secrétariat", dot: "bg-slate-400" },
};

export const demoSecConversations: ConversationThread[] = [];

