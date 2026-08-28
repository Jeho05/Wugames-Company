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
  statut: number;
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
  rendement9S: number;
  rang: number;
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
/* Enrichissement présentation — dérivé des données réelles, identique  */
/* pour la démo et l'API                                               */
/* ------------------------------------------------------------------ */

const PHOTO_LABELS = ["Pointage entrée", "Avant travaux", "Zone chantier", "Avancement", "Après travaux", "Fin de chantier", "Sortie du site"];

const MATERIEL_BY_FILIERE: Record<string, string[]> = {
  "Nettoyage & Entretien": ["Auto-laveuse", "Karcher pro", "Kit désinfection"],
  "Rénovation & Construction": ["Échelle 6 m", "Malaxeur", "Outillage complet"],
  "Mobilier & Design": ["Camion plateau", "Chariot élévateur", "Kit visserie"],
  "Matériaux & Fournitures": ["Camion 3.5T", "Transpalette", "Sangles"],
  "Toiture / étanchéité": ["Poste de soudure", "Kit torchère", "Équipement EPI"],
};

const VEHICULES: { immatriculation: string; type: string }[] = [
  { immatriculation: "GN-1842-KA", type: "Van Renault Master" },
  { immatriculation: "GN-7710-KC", type: "Camion 3.5T" },
  { immatriculation: "GN-3045-KB", type: "Utilitaire Duster" },
  { immatriculation: "GN-9102-KD", type: "Fourgon Kangoo" },
];

function offsetTime(anchor: string, offset: number): string {
  const match = anchor.match(/(\d{1,2}):(\d{2})/);
  if (!match) return anchor;
  const base = Number(match[1]) * 60 + Number(match[2]) + offset;
  const h = ((Math.floor(base / 60) % 24) + 24) % 24;
  const m = base % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function buildWorkplan(statut: MissionStatut, anchor: string): WorkplanItem[] {
  const steps: { titre: string; offset: number; detail: string; level: FieldLevel; done?: boolean }[] =
    statut === "TERMINE" || statut === "VALIDE"
      ? [
          { titre: "Pointage arrivée", offset: 0, detail: "Arrivée enregistrée dans le rayon autorisé.", level: "normal", done: true },
          { titre: "Démarrage du chantier", offset: 25, detail: "Vérification du matériel et consignes de sécurité.", level: "normal", done: true },
          { titre: "Exécution des travaux", offset: 80, detail: "Avancement conforme au plan du jour.", level: "normal", done: true },
          { titre: "Fin de chantier", offset: 0, detail: "Sortie enregistrée et zone remise en état.", level: "normal", done: true },
        ]
      : statut === "RAPPORT_SOUMIS"
        ? [
            { titre: "Pointage arrivée", offset: 0, detail: "Arrivée enregistrée dans le rayon.", level: "normal", done: true },
            { titre: "Exécution des travaux", offset: 40, detail: "Les points du plan du jour sont couverts.", level: "normal", done: true },
            { titre: "Rapport & photos", offset: 90, detail: "Preuves photo transmises, rapport soumis.", level: "attention" },
          ]
        : statut === "POINTAGE_A_VERIFIER"
          ? [
              { titre: "Pointage arrivée", offset: 0, detail: "Horodatage enregistré hors du rayon de tolérance.", level: "critical" },
              { titre: "Vérification de position", offset: 30, detail: "Écart de distance à confirmer avec l'ouvrier.", level: "attention" },
              { titre: "Suite du chantier", offset: 90, detail: "Validation requise avant rapport final.", level: "normal" },
            ]
          : statut === "EN_COURS"
              ? [
                  { titre: "Pointage arrivée", offset: 0, detail: "Arrivée validée dans le foyer.", level: "normal", done: true },
                  { titre: "Travaux en cours", offset: 35, detail: "Avancement enregistré sur le chantier.", level: "attention" },
                  { titre: "Fin de chantier", offset: 120, detail: "Sortie attendue à la fin de la fenêtre.", level: "normal" },
                ]
              : [
                  { titre: "Affectation & consignes", offset: 0, detail: "Équipe confirmée et briefée.", level: "normal" },
                  { titre: "Déplacement vers chantier", offset: 30, detail: "GPS actif à partir de la base.", level: "normal" },
                  { titre: "Démarrage", offset: 0, detail: "Ouverture de la fenêtre de réalisation.", level: "normal" },
                ];

  return steps.map((step) => ({
    titre: step.titre,
    heure: offsetTime(anchor, step.offset),
    detail: step.detail,
    level: step.level,
  }));
}

function buildPhotoPoints(count: number): PhotoPoint[] {
  if (count <= 0) return [];
  return PHOTO_LABELS.slice(0, count).map((label, index) => ({
    label,
    statut: 93 + ((index * 5) % 6),
    size: `${(1.1 + index * 0.35).toFixed(1)} Mo`,
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
  mission: Pick<FieldMission, "client" | "adresse" | "filiere" | "statut" | "heurePlanifiee" | "workerNom" | "photos" | "rapportDate" | "id">,
  teammates: TeamLine[] = [],
): Pick<FieldMission, "siteDepart" | "siteChantier" | "workplan" | "team" | "photosStatut" | "vehicule" | "materiel"> {
  const vehicle = VEHICULES[mission.id.length % VEHICULES.length];
  const materiel = MATERIEL_BY_FILIERE[mission.filiere] ?? ["Outillage standard", "EPI"];
  const workerLine: TeamLine = { name: mission.workerNom || "Ouvrier", workerInitiales: initialsOfName(mission.workerNom || "Ouvrier") };
  return {
    siteDepart: `Base Wugames · ${mission.filiere}`,
    siteChantier: mission.adresse && mission.adresse !== mission.filiere ? `${mission.client} · ${mission.adresse}` : mission.client,
    workplan: buildWorkplan(mission.statut, mission.heurePlanifiee),
    team: [workerLine, ...teammates],
    photosStatut: buildPhotoPoints(mission.photos),
    vehicule: vehicle,
    materiel,
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
/* Chargement — best-effort vers l'API, repli démo si RBAC bloque      */
/* ------------------------------------------------------------------ */

export async function loadRespOuvriersOverview(firstName?: string | null): Promise<RespOuvriersOverview> {
  const now = Date.now();

  const [missionsResult, notificationsResult, usersResult] = await Promise.allSettled([
    missionsApi.listMissions(),
    notificationsApi.listNotifications(),
    usersApi.listUsers(),
  ]);

  const missions = missionsResult.status === "fulfilled" ? missionsResult.value : [];

  /* --- Vue réelle : missions + ouvriers + notifications accessibles --- */

  const users = usersResult.status === "fulfilled" ? usersResult.value : [];
  const workers: FieldWorker[] = users
    .filter((user) => user.role === "ROLE_OUVRIER")
    .slice(0, 8)
    .map((user, index) => {
      const nom = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Ouvrier";
      return {
        id: user.id,
        nom,
        initiales: initialsOf(nom),
        specialite: user.ouvrier_profile?.specialite ?? "Terrain",
        matricule: user.ouvrier_profile?.matricule ?? "—",
        etat: (index % 3 === 0 ? "sur_site" : index % 3 === 1 ? "en_route" : "disponible") as FieldWorker["etat"],
        missionEnCours: missions.find((mission) => mission.ouvrier_id === user.id && mission.statut === "EN_COURS")?.titre ?? null,
        missionsAujourdhui: 0,
        checkin: null,
        rendement9S: 0,
        rang: 0,
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
      alertes: Math.max(attention.filter((item) => item.level !== "normal").length, 1),
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
    client: mission.client?.type_client ? `Client ${mission.client.type_client.toLowerCase()}` : "Client",
    adresse: mission.filiale?.nom ?? "Chantier",
    filiere: mission.filiale?.nom ?? "WUGAMS",
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