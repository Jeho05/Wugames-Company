import type { IconName } from "@/app/components/ui/app-icon";
import * as missionsApi from "@/app/lib/api/missions";
import * as notificationsApi from "@/app/lib/api/notifications";
import * as usersApi from "@/app/lib/api/users";
import type { Mission, MissionStatut, Notification } from "@/app/lib/contracts";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type FieldStatus = "operational" | "attention" | "action-required";
export type FieldLevel = "normal" | "attention" | "critical";

export type FieldPointage = {
  id: string;
  type: "ARRIVEE" | "SORTIE";
  latitude: number;
  longitude: number;
  horodatage: string;
  distanceMetres: number | null;
  horsRayon: boolean;
  rayonMetres: number;
};

export type FieldMission = {
  id: string;
  numero: string;
  titre: string;
  description: string | null;
  client: string;
  adresse: string;
  filiere: string;
  statut: MissionStatut;
  statutLabel: string;
  progression: number;
  workerId: string | null;
  workerNom: string;
  heurePlanifiee: string;
  photos: number;
  rapportTexte: string | null;
  rapportAuteur: string | null;
  rapportDate: string | null;
  dernierPointage: string | null;
  elapsed: string | null;
  pointages: FieldPointage[];
  /* --- enrichissement présentation (modal détail) --- */
  siteDepart: string;
  siteChantier: string;
  workplan: WorkplanItem[];
  team: TeamLine[];
  photosStatut: PhotoPoint[];
  vehicule: { immatriculation: string; type: string };
  materiel: string[];
};

export type PhotoPoint = {
  label: string;
  /** Qualité photo : non mesurée par l'API → null (affiché "—", jamais inventé). */
  statut: number | null;
  size: string;
};

export type WorkplanItem = {
  titre: string;
  heure: string;
  detail: string;
  level: FieldLevel;
};

export type TeamLine = {
  name: string;
  workerInitiales: string;
};

export type FieldWorker = {
  id: string;
  nom: string;
  initiales: string;
  specialite: string;
  matricule: string;
  etat: "sur_site" | "en_route" | "disponible" | "offline";
  missionEnCours: string | null;
  missionsAujourdhui: number;
  checkin: string | null;
  /** Rendement 9S : null quand aucune évaluation API ne l'établit (jamais 0 par défaut). */
  rendement9S: number | null;
  /** Rang : null quand non établi (jamais 0). */
  rang: number | null;
};

export type FieldPerformance = {
  id: string;
  nom: string;
  initiales: string;
  cycle: string;
  s9: number[];
  noteTexte: number | null;
  total: number;
  rendement9S: number;
  rendementGlobal: number;
  rang: number;
  evolution: "up" | "down" | "stable";
};

export type AttentionItem = {
  id: string;
  level: FieldLevel;
  kind: "gps" | "rapport" | "retard" | "pointage";
  kindLabel: string;
  icon: IconName;
  missionTitle: string;
  accentNom: string | null;
  detail: string;
  horodatage: string;
  missionId: string | null;
};

export type ActivityEvent = {
  id: string;
  kind: "arrivee" | "demarrage" | "photo" | "rapport" | "alerte" | "validation";
  time: string;
  title: string;
  detail: string;
  worker: string;
  workerInitiales: string;
  mission: string;
  tone: FieldLevel | "ok";
};

export type RespOuvriersOverview = {
  source: "api";
  updatedAt: number;
  firstName: string | null;
  status: FieldStatus;
  orbital: {
    missions: number;
    ouvriers: number;
    rapports: number;
    alertes: number;
    enCours: number;
    terminees: number;
  };
  missions: FieldMission[];
  workers: FieldWorker[];
  attention: AttentionItem[];
  activity: ActivityEvent[];
  performance: FieldPerformance[];
  notifications: Notification[];
  unread: number;
  /** true si au moins une source API a échoué (données partielles, pas "0"). */
  partial: boolean;
  loadErrors: string[];
};

/* ------------------------------------------------------------------ */
/* Métadonnées de statuts                                              */
/* ------------------------------------------------------------------ */

export const FIELD_STATUS_LABEL: Record<FieldStatus, string> = {
  operational: "OPERATIONAL",
  attention: "ATTENTION",
  "action-required": "ACTION REQUIRED",
};

export const FIELD_STATUS_TONE: Record<FieldStatus, "green" | "amber" | "rose"> = {
  operational: "green",
  attention: "amber",
  "action-required": "rose",
};

export const statutLabel: Record<MissionStatut, string> = {
  PLANIFIE: "Planifiée",
  NOTIFIE: "Notifiée",
  ACCEPTE: "Acceptée",
  EN_COURS: "En cours",
  RAPPORT_SOUMIS: "Rapport soumis",
  VALIDE: "Validée",
  TERMINE: "Terminée",
  POINTAGE_A_VERIFIER: "Pointage à vérifier",
};

export const statutLevel: Record<MissionStatut, FieldLevel> = {
  PLANIFIE: "normal",
  NOTIFIE: "normal",
  ACCEPTE: "normal",
  EN_COURS: "normal",
  RAPPORT_SOUMIS: "attention",
  VALIDE: "normal",
  TERMINE: "normal",
  POINTAGE_A_VERIFIER: "critical",
};

const statutProgression: Record<MissionStatut, number> = {
  PLANIFIE: 6,
  NOTIFIE: 14,
  ACCEPTE: 28,
  EN_COURS: 58,
  RAPPORT_SOUMIS: 78,
  VALIDE: 94,
  TERMINE: 100,
  POINTAGE_A_VERIFIER: 62,
};

/* ------------------------------------------------------------------ */
/* Enrichissement présentation — dérivé UNIQUEMENT des données API.   */
/* Aucun véhicule, matériel, score photo, position ou heure n'est     */
/* inventé : l'indisponible est explicite ("Non renseigné" / null).   */
/* ------------------------------------------------------------------ */

function heureCourte(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function buildWorkplan(
  statut: MissionStatut,
  pointages: { type: "ARRIVEE" | "SORTIE"; horodatage: string; horsRayon: boolean }[],
  photosCount: number,
  rapportTexte: string | null,
): WorkplanItem[] {
  const arrivee = pointages.find((p) => p.type === "ARRIVEE");
  const sortie = [...pointages].reverse().find((p) => p.type === "SORTIE");
  const steps: WorkplanItem[] = [
    {
      titre: "Pointage arrivée",
      heure: heureCourte(arrivee?.horodatage),
      detail: arrivee
        ? arrivee.horsRayon
          ? "Arrivée enregistrée hors du rayon de tolérance — à vérifier."
          : "Arrivée enregistrée."
        : "Aucun pointage d'arrivée enregistré.",
      level: arrivee ? (arrivee.horsRayon ? "critical" : "normal") : "attention",
    },
    {
      titre: "Preuves photo",
      heure: "—",
      detail: photosCount > 0 ? `${photosCount} photo(s) jointe(s) à la mission.` : "Aucune photo jointe.",
      level: photosCount > 0 ? "normal" : "attention",
    },
    {
      titre: "Rapport",
      heure: "—",
      detail: rapportTexte ? "Rapport rédigé par l'ouvrier." : "Aucun rapport soumis.",
      level: rapportTexte ? "normal" : statut === "RAPPORT_SOUMIS" || statut === "VALIDE" || statut === "TERMINE" ? "attention" : "normal",
    },
  ];
  if (sortie) {
    steps.push({
      titre: "Pointage sortie",
      heure: heureCourte(sortie.horodatage),
      detail: sortie.horsRayon ? "Sortie enregistrée hors rayon — à vérifier." : "Sortie enregistrée.",
      level: sortie.horsRayon ? "critical" : "normal",
    });
  }
  return steps;
}

function buildPhotoPoints(count: number): PhotoPoint[] {
  if (count <= 0) return [];
  // L'API ne fournit ni score qualité ni taille : on expose le réel (le
  // nombre de photos) sans inventer de pourcentage ni de poids.
  return Array.from({ length: count }, (_, index) => ({
    label: `Photo ${index + 1}`,
    statut: null,
    size: "—",
  }));
}

function initialsOfName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildMissionExtras(
  mission: Pick<FieldMission, "client" | "adresse" | "filiere" | "statut" | "heurePlanifiee" | "workerNom" | "photos" | "rapportDate" | "rapportTexte" | "id"> & {
    pointages: { type: "ARRIVEE" | "SORTIE"; horodatage: string; horsRayon: boolean }[];
  },
  teammates: TeamLine[] = [],
): Pick<FieldMission, "siteDepart" | "siteChantier" | "workplan" | "team" | "photosStatut" | "vehicule" | "materiel"> {
  const workerLine: TeamLine = { name: mission.workerNom || "Non renseigné", workerInitiales: initialsOfName(mission.workerNom || "··") };
  return {
    // Aucune donnée véhicule/matériel/site de départ n'est exposée par l'API :
    // on l'affiche comme indisponible au lieu d'attribuer un véhicule fictif.
    siteDepart: "Non renseigné",
    siteChantier: mission.adresse && mission.adresse !== mission.filiere ? `${mission.client} · ${mission.adresse}` : mission.client,
    workplan: buildWorkplan(mission.statut, mission.pointages, mission.photos, mission.rapportTexte),
    team: [workerLine, ...teammates],
    photosStatut: buildPhotoPoints(mission.photos),
    vehicule: { immatriculation: "Non renseigné", type: "Véhicule non suivi par l'API" },
    materiel: ["Matériel non suivi par l'API"],
  };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatMission(mission: Mission): string {
  const planned = mission.date_planifiee;
  if (!planned) return "Non planifiée";
  const date = new Date(planned);
  if (Number.isNaN(date.getTime())) return "Non planifiée";
  return new Intl.DateTimeFormat("fr-FR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const minutes = Math.floor((Date.now() - then) / 60_000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hier";
  return `Il y a ${days} jours`;
}

/* ------------------------------------------------------------------ */
/* Chargement — API uniquement, périmètre filiale strict               */
/* ------------------------------------------------------------------ */

export async function loadRespOuvriersOverview(firstName?: string | null, filialeId?: string | null): Promise<RespOuvriersOverview> {
  const now = Date.now();

  const [missionsResult, notificationsResult, usersResult] = await Promise.allSettled([
    missionsApi.listMissions(),
    notificationsApi.listNotifications(),
    usersApi.listUsers(),
  ]);

  const loadErrors: string[] = [];
  if (missionsResult.status === "rejected") loadErrors.push("missions");
  if (notificationsResult.status === "rejected") loadErrors.push("notifications");
  if (usersResult.status === "rejected") loadErrors.push("users");

  const allMissions = missionsResult.status === "fulfilled" ? missionsResult.value : [];

  /* --- Vue réelle : missions + ouvriers + notifications accessibles --- */
  /* Périmètre : un responsable de filiale ne récupère que sa filiale. */

  const users = usersResult.status === "fulfilled" ? usersResult.value : [];
  const scopedUsers = filialeId ? users.filter((user) => user.filiale_id === filialeId) : users;
  const missions = filialeId ? allMissions.filter((mission) => mission.filiale_id === filialeId) : allMissions;
  const todayKey = new Date().toISOString().slice(0, 10);
  const workers: FieldWorker[] = scopedUsers
    .filter((user) => user.role === "ROLE_OUVRIER")
    .slice(0, 8)
    .map((user) => {
      const nom = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Non renseigné";
      const userMissions = missions.filter((mission) => mission.ouvrier_id === user.id);
      const enCours = userMissions.find((mission) => mission.statut === "EN_COURS")?.titre ?? null;
      const notifiee = userMissions.some((mission) => mission.statut === "NOTIFIE" || mission.statut === "ACCEPTE");
      const lastPointage = userMissions
        .flatMap((mission) => mission.pointages ?? [])
        .sort((a, b) => new Date(b.horodatage).getTime() - new Date(a.horodatage).getTime())[0];
      return {
        id: user.id,
        nom,
        initiales: initialsOf(nom === "Non renseigné" ? "··" : nom),
        specialite: user.ouvrier_profile?.specialite ?? "Non renseigné",
        matricule: user.ouvrier_profile?.matricule ?? "Non renseigné",
        // État dérivé des missions réelles, jamais cyclique (index % 3 supprimé).
        etat: (!user.is_active ? "offline" : enCours ? "sur_site" : notifiee ? "en_route" : "disponible") as FieldWorker["etat"],
        missionEnCours: enCours,
        missionsAujourdhui: userMissions.filter((mission) => (mission.date_planifiee ?? "").slice(0, 10) === todayKey).length,
        checkin: lastPointage ? heureCourte(lastPointage.horodatage) : null,
        rendement9S: null,
        rang: null,
      };
    });

  const attention: AttentionItem[] = [];

  for (const mission of missions) {
    const horsRayon = (mission.pointages ?? []).find((pointage) => pointage.hors_rayon);
    if (horsRayon) {
      attention.push({
        id: `att-gps-${mission.id}`,
        level: "critical",
        kind: "gps",
        kindLabel: "GPS CHECK",
        icon: "map",
        missionTitle: mission.titre,
        accentNom: mission.ouvrier ? `${mission.ouvrier.user.first_name} ${mission.ouvrier.user.last_name}` : null,
        detail: "Pointage hors du rayon autorisé — vérification requise",
        horodatage: relativeTime(horsRayon.horodatage),
        missionId: mission.id,
      });
    }
    if (mission.statut === "RAPPORT_SOUMIS") {
      attention.push({
        id: `att-rapport-${mission.id}`,
        level: "attention",
        kind: "rapport",
        kindLabel: "VALIDATION",
        icon: "clipboard",
        missionTitle: mission.titre,
        accentNom: mission.ouvrier ? `${mission.ouvrier.user.first_name} ${mission.ouvrier.user.last_name}` : null,
        detail: "Rapport soumis · en attente de validation",
        horodatage: relativeTime(mission.updated_at ?? mission.created_at),
        missionId: mission.id,
      });
    }
  }

  const status: FieldStatus = attention.some((item) => item.level === "critical")
    ? "action-required"
    : attention.some((item) => item.level === "attention")
      ? "attention"
      : "operational";

  const notifications = notificationsResult.status === "fulfilled" ? notificationsResult.value : [];

  return {
    source: "api",
    updatedAt: now,
    firstName: firstName ?? null,
    status,
    orbital: {
      missions: missions.length,
      ouvriers: workers.length,
      rapports: missions.filter((mission) => mission.statut === "RAPPORT_SOUMIS").length,
      alertes: attention.filter((item) => item.level !== "normal").length,
      enCours: missions.filter((mission) => mission.statut === "EN_COURS").length,
      terminees: missions.filter((mission) => mission.statut === "TERMINE").length,
    },
    missions: missions.map(toFieldMission),
    workers,
    attention,
    activity: [],
    performance: [],
    notifications: notifications.slice(0, 12),
    unread: notifications.filter((notification) => !notification.lu).length,
    partial: loadErrors.length > 0,
    loadErrors,
  };
}

function toFieldMission(mission: Mission): FieldMission {
  const pointages = (mission.pointages ?? []).map((pointage, index) => ({
    id: pointage.id ?? `pt-${mission.id}-${index}`,
    type: pointage.type,
    latitude: Number(pointage.latitude),
    longitude: Number(pointage.longitude),
    horodatage: pointage.horodatage,
    distanceMetres: pointage.distance_calculee_m,
    horsRayon: pointage.hors_rayon,
    rayonMetres: mission.rayon_tolerance_metres,
  }));
  const last = [...pointages].sort((a, b) => new Date(b.horodatage).getTime() - new Date(a.horodatage).getTime())[0];
  const base = {
    id: mission.id,
    numero: `MISSION ${mission.id.slice(0, 3).toUpperCase()}`,
    titre: mission.titre,
    description: mission.description,
    client: mission.client?.type_client ? `Client ${mission.client.type_client.toLowerCase()}` : "Non renseigné",
    adresse: mission.filiale?.nom ?? "Non renseigné",
    filiere: mission.filiale?.nom ?? "Non renseigné",
    statut: mission.statut,
    statutLabel: statutLabel[mission.statut],
    progression: statutProgression[mission.statut],
    workerId: mission.ouvrier_id,
    workerNom: mission.ouvrier ? `${mission.ouvrier.user.first_name} ${mission.ouvrier.user.last_name}` : "À affecter",
    heurePlanifiee: formatMission(mission),
    photos: (mission.photos ?? []).length,
    rapportTexte: mission.rapport_texte,
    rapportAuteur: mission.ouvrier ? `${mission.ouvrier.user.first_name} ${mission.ouvrier.user.last_name}` : null,
    rapportDate: mission.updated_at,
    dernierPointage: last
      ? `${new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(last.horodatage))} · ${last.type === "ARRIVEE" ? "arrivée" : "sortie"}${last.horsRayon ? " · hors rayon" : ""}`
      : null,
    elapsed: null,
    pointages,
  };
  return { ...base, ...buildMissionExtras(base) };
}